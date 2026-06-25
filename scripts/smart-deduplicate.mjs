/**
 * 智能主题去重 - 使用 LLM 自动判断
 * 1. 对每篇文章生成主题指纹
 * 2. 聚类相似文章
 * 3. 每组保留最权威的，删除其他
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const GLM_API_KEY = process.env.GLM_API_KEY
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY

async function callLLM(systemPrompt, userContent, maxTokens = 512) {
  const providers = []

  if (GLM_API_KEY) {
    providers.push({
      name: 'GLM',
      url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: 'glm-4-flash',
      apiKey: GLM_API_KEY,
    })
  }

  if (SILICONFLOW_API_KEY) {
    providers.push({
      name: 'SiliconFlow',
      url: 'https://api.siliconflow.cn/v1/chat/completions',
      model: 'Qwen/Qwen3.5-4B',
      apiKey: SILICONFLOW_API_KEY,
    })
  }

  if (providers.length === 0) throw new Error('No LLM API key configured')

  for (const provider of providers) {
    try {
      const res = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          max_tokens: maxTokens,
          temperature: 0.2,
          ...(provider.name === 'SiliconFlow' ? { enable_thinking: false } : {}),
        }),
      })

      if (!res.ok) throw new Error(`${provider.name} API error ${res.status}`)

      const data = await res.json()
      return data?.choices?.[0]?.message?.content?.trim() ?? ''
    } catch (err) {
      console.warn(`[LLM] ${provider.name} failed:`, err.message)
    }
  }

  throw new Error('All LLM providers failed')
}

// 主题指纹系统提示词
const FINGERPRINT_SYSTEM = `你是一个新闻主题分析专家。对于输入的新闻，给出一个简短的主题指纹（50字以内），用于判断两条新闻是否属于同一主题。

主题指纹格式：[主题类型]-[核心事件]-[关键数据]
例如：
- "政策-PPWR 8月12日生效-强制实施"
- "市场-rPET价格回调-6800元/吨"
- "企业-万凯新材-化学再生中试线"

只输出主题指纹，不要其他内容。`

// 权威来源权重（越高越优先保留）
const SOURCE_WEIGHTS = {
  '中国合成树脂协会塑料循环利用分会': 10,
  'Plastics Recyclers Europe': 9,
  'Packaging Europe': 8,
  'tavily_news': 7,
  'tavily': 6,
  'serper': 5,
  'ddg': 4,
  '雨果网': 3,
  'cifnews': 3,
  '废塑料新观察': 3,
  '163.com': 2,
  '网易': 2,
  '知乎': 2,
  'AMZ123': 2,
  '亚马逊卖家': 2,
  'seller': 1,
}

function getSourceWeight(source) {
  if (!source) return 0
  for (const [key, weight] of Object.entries(SOURCE_WEIGHTS)) {
    if (source.includes(key)) return weight
  }
  return 1 // 默认权重
}

/**
 * 获取文章的主题指纹
 */
async function getFingerprint(title, summary) {
  const text = `标题：${title}\n摘要：${summary?.substring(0, 300) || ''}`
  try {
    return await callLLM(FINGERPRINT_SYSTEM, text, 100)
  } catch (err) {
    console.warn('Fingerprint failed:', err.message)
    return `${title.substring(0, 20)}-${Date.now()}`
  }
}

/**
 * 计算两个主题指纹的相似度
 */
function fingerprintSimilarity(fp1, fp2) {
  if (!fp1 || !fp2) return 0

  const words1 = new Set(fp1.split(/[-\s]/).filter(w => w.length > 1))
  const words2 = new Set(fp2.split(/[-\s]/).filter(w => w.length > 1))

  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])

  return union.size === 0 ? 0 : intersection.size / union.size
}

/**
 * 命令行参数：
 *   --ppwr-only  仅运行 PPWR 专项去重（跳过全量 fingerprint 生成，使用已存储的 fingerprint）
 */
const args = process.argv.slice(2)
const PPWR_ONLY = args.includes('--ppwr-only')

/**
 * 主去重流程
 */
async function main() {
  console.log('=== 智能主题去重 ===\n')

  if (PPWR_ONLY) {
    // === PPWR Only 模式：直接查询已存在的 PPWR 文章，跳过 fingerprint 生成 ===
    console.log('[模式] PPWR 专项去重（不重新生成 fingerprint）\n')

    const ppwrItemsRaw = await prisma.intelligence.findMany({
      where: {
        OR: [
          { titleZh: { contains: 'PPWR' } },
          { titleZh: { contains: '包装法' } },
          { titleZh: { contains: '包装指令' } },
        ],
        summary: { not: '' },
      },
      select: {
        id: true,
        title: true,
        titleZh: true,
        summary: true,
        contentZh: true,
        source: true,
        sourceUrl: true,
        publishedAt: true,
        urlHash: true,
      },
      orderBy: { publishedAt: 'desc' },
    })

    console.log(`获取到 ${ppwrItemsRaw.length} 篇 PPWR 相关文章\n`)

    // 构建与主流程相同的数据结构（fingerprint 从简，使用 title 前20字符作为 fallback）
    const fingerprints = ppwrItemsRaw.map(item => ({
      ...item,
      fingerprint: `${(item.titleZh || item.title || '').substring(0, 20)}-${Date.now()}`,
      contentLength: (item.contentZh || item.summary || '').length,
    }))

    // 角度关键词定义（使用更精准的关键词避免误匹配）
    const ANGLE_BUCKETS = {
      '角度1-实施日期': ['8月12日', '2026年8月', '实施日期', '生效日期'],
      '角度2-合规要求': ['合规', '指南', '指导文件', '合规战略'],
      '角度3-回收责任': ['30%PCR', 'PCR要求', '回收责任', '回收目标', '回收率'],
      '角度4-可回收性标准': ['可回收性', '回收设施', 'C级', 'B级', 'D级'],
      '角度5-亚马逊卖家': ['亚马逊', 'EPR', '生产者责任延伸'],
      '角度6-其他政策': [],
    }

    const angleBuckets = {}
    for (const [bucketName, keywords] of Object.entries(ANGLE_BUCKETS)) {
      angleBuckets[bucketName] = []
    }

    for (const item of fingerprints) {
      const text = `${item.titleZh || ''} ${item.fingerprint || ''}`
      let assigned = false
      for (const [bucketName, keywords] of Object.entries(ANGLE_BUCKETS)) {
        if (bucketName === '角度6-其他政策') continue
        if (keywords.some(kw => text.includes(kw))) {
          angleBuckets[bucketName].push(item)
          assigned = true
          break
        }
      }
      if (!assigned) {
        angleBuckets['角度6-其他政策'].push(item)
      }
    }

    let totalDeleted = 0
    const bucketsUsed = Object.entries(angleBuckets).filter(([, items]) => items.length > 0)

    console.log('=== PPWR 专项去重 ===')
    console.log(`发现 ${fingerprints.length} 篇 PPWR 相关文章，分布在 ${bucketsUsed.length} 个角度桶\n`)

    for (const [bucketName, items] of bucketsUsed) {
      items.sort((a, b) => {
        const wA = getSourceWeight(a.source)
        const wB = getSourceWeight(b.source)
        if (wA !== wB) return wB - wA
        return b.contentLength - a.contentLength
      })

      const keep = items[0]
      const duplicates = items.slice(1)

      console.log(`\n  [${bucketName}] 共 ${items.length} 篇，保留 1 篇`)
      console.log(`    保留: ${keep.titleZh || keep.title} (来源:${keep.source}, 权重:${getSourceWeight(keep.source)})`)
      for (const dup of duplicates) {
        console.log(`    删除: ${dup.titleZh || dup.title} (来源:${dup.source})`)
      }

      if (duplicates.length > 0) {
        const result = await prisma.intelligence.deleteMany({
          where: { id: { in: duplicates.map(d => d.id) } }
        })
        totalDeleted += result.count
      }
    }

    console.log(`\n=== 去重完成 ===`)
    console.log(`PPWR 专项删除了 ${totalDeleted} 篇`)

    const stats = { total: await prisma.intelligence.count() }
    console.log(`剩余总文章数: ${stats.total}`)
    return
  }

  // 1. 获取所有需要处理的文章
  const items = await prisma.intelligence.findMany({
    where: {
      summary: { not: '' },
    },
    select: {
      id: true,
      title: true,
      titleZh: true,
      summary: true,
      contentZh: true,
      source: true,
      sourceUrl: true,
      publishedAt: true,
      urlHash: true,
    },
    orderBy: { publishedAt: 'desc' },
  })

  console.log(`获取到 ${items.length} 篇文章\n`)

  // 2. 为每篇文章生成主题指纹
  console.log('生成主题指纹...')
  const fingerprints = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const fp = await getFingerprint(
      item.titleZh || item.title,
      item.summary
    )
    fingerprints.push({
      ...item,
      fingerprint: fp,
      contentLength: (item.contentZh || item.summary || '').length,
    })
    console.log(`  [${i + 1}/${items.length}] ${fp.substring(0, 40)}`)
  }

  // 3. 聚类相似文章
  console.log('\n聚类相似文章...')
  const groups = []
  const processed = new Set()

  for (let i = 0; i < fingerprints.length; i++) {
    const item = fingerprints[i]
    if (processed.has(item.id)) continue

    const group = [item]

    for (let j = i + 1; j < fingerprints.length; j++) {
      const other = fingerprints[j]
      if (processed.has(other.id)) continue

      const similarity = fingerprintSimilarity(item.fingerprint, other.fingerprint)

      if (similarity > 0.25) {
        group.push(other)
        processed.add(other.id)
      }
    }

    if (group.length > 1) {
      groups.push(group)
    }

    processed.add(item.id)
  }

  console.log(`发现 ${groups.length} 组重复主题\n`)

  if (groups.length === 0) {
    console.log('没有发现重复主题')
    return
  }

  // 4. 每组保留最权威的，删除其他
  let totalDeleted = 0

  for (const group of groups) {
    // 按权威权重、内容完整度排序
    group.sort((a, b) => {
      const weightA = getSourceWeight(a.source)
      const weightB = getSourceWeight(b.source)
      if (weightA !== weightB) return weightB - weightA // 权重高的优先
      return b.contentLength - a.contentLength // 内容长的优先
    })

    const keep = group[0]
    const duplicates = group.slice(1)

    console.log(`\n主题: ${keep.fingerprint.substring(0, 40)}`)
    console.log(`  保留: ${keep.titleZh || keep.title} (来源:${keep.source}, 权重:${getSourceWeight(keep.source)}, 字数:${keep.contentLength})`)

    for (const dup of duplicates) {
      console.log(`  删除: ${dup.titleZh || dup.title} (来源:${dup.source})`)
    }

    const result = await prisma.intelligence.deleteMany({
      where: { id: { in: duplicates.map(d => d.id) } }
    })

    totalDeleted += result.count
  }

  // === PPWR 专项去重：按角度分桶，每桶仅保留 1 篇 ===
  console.log('\n=== PPWR 专项去重 ===')
  const ppwrItems = fingerprints.filter(item =>
    (item.titleZh && (item.titleZh.includes('PPWR') || item.titleZh.includes('包装法') || item.titleZh.includes('包装指令'))) ||
    (item.fingerprint && (item.fingerprint.includes('PPWR') || item.fingerprint.includes('包装')))
  )

  if (ppwrItems.length > 0) {
    console.log(`发现 ${ppwrItems.length} 篇 PPWR 相关文章`)

    // 角度关键词定义（使用更精准的关键词避免误匹配）
    const ANGLE_BUCKETS = {
      '角度1-实施日期': ['8月12日', '2026年8月', '实施日期', '生效日期'],
      '角度2-合规要求': ['合规', '指南', '指导文件', '合规战略'],
      '角度3-回收责任': ['30%PCR', 'PCR要求', '回收责任', '回收目标', '回收率'],
      '角度4-可回收性标准': ['可回收性', '回收设施', 'C级', 'B级', 'D级'],
      '角度5-亚马逊卖家': ['亚马逊', 'EPR', '生产者责任延伸'],
      '角度6-其他政策': [], // 无匹配关键词的兜底桶
    }

    // 将文章分配到角度桶
    const angleBuckets = {}
    for (const [bucketName, keywords] of Object.entries(ANGLE_BUCKETS)) {
      angleBuckets[bucketName] = []
    }

    for (const item of ppwrItems) {
      const text = `${item.titleZh || ''} ${item.fingerprint || ''}`
      let assigned = false
      for (const [bucketName, keywords] of Object.entries(ANGLE_BUCKETS)) {
        if (bucketName === '角度6-其他政策') continue // 兜底桶不自动匹配
        if (keywords.some(kw => text.includes(kw))) {
          angleBuckets[bucketName].push(item)
          assigned = true
          break
        }
      }
      if (!assigned) {
        angleBuckets['角度6-其他政策'].push(item)
      }
    }

    let ppwrDeleted = 0
    const bucketsUsed = Object.entries(angleBuckets).filter(([, items]) => items.length > 0)

    for (const [bucketName, items] of bucketsUsed) {
      // 同一桶内按 source 权重 + 内容长度排序
      items.sort((a, b) => {
        const wA = getSourceWeight(a.source)
        const wB = getSourceWeight(b.source)
        if (wA !== wB) return wB - wA
        return b.contentLength - a.contentLength
      })

      const keep = items[0]
      const duplicates = items.slice(1)

      console.log(`\n  [${bucketName}] 共 ${items.length} 篇，保留 1 篇`)
      console.log(`    保留: ${keep.titleZh || keep.title} (来源:${keep.source}, 权重:${getSourceWeight(keep.source)})`)
      for (const dup of duplicates) {
        console.log(`    删除: ${dup.titleZh || dup.title} (来源:${dup.source})`)
      }

      if (duplicates.length > 0) {
        const result = await prisma.intelligence.deleteMany({
          where: { id: { in: duplicates.map(d => d.id) } }
        })
        ppwrDeleted += result.count
      }
    }

    console.log(`\nPPWR 专项处理：删除了 ${ppwrDeleted} 篇，保留 ${ppwrItems.length - ppwrDeleted} 篇`)
    totalDeleted += ppwrDeleted
  }

  console.log(`\n=== 去重完成 ===`)
  console.log(`删除了 ${totalDeleted} 篇文章`)

  const stats = {
    total: await prisma.intelligence.count(),
  }
  console.log(`剩余总文章数: ${stats.total}`)
}

main()
  .finally(() => prisma.$disconnect())
  .catch(console.error)
