/**
 * scripts/refine-all-contentzh.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * 为数据库中所有 Intelligence 重新生成 contentZh（500-800字深度总结）
 *
 * 方案：直接在脚本中复用 /api/refine 的 refine() 逻辑 + callLLM
 *       对每篇的 summary 字段执行深度 AI 总结，替换 contentZh
 *
 * 特点：
 *   - 分批小量处理（每批5篇，每篇间暂停2秒）
 *   - 出错重试（最多3次）
 *   - 逐步推进，不丢节奏
 *   - 只更新 contentZh 和 tldrZh，不碰其他字段
 *
 * 用法: node scripts/refine-all-contentzh.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const GLM_API_KEY         = process.env.GLM_API_KEY
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY

// ── LLM 调用层（内联，与 translate-missing-summary-en.mjs 一致）───────────────

async function callLLM(systemPrompt, userContent, maxTokens = 512) {
  const providers = []
  if (GLM_API_KEY) {
    providers.push({
      name: 'GLM',
      url:  'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: 'glm-4-flash',
      apiKey: GLM_API_KEY,
    })
  }
  if (SILICONFLOW_API_KEY) {
    providers.push({
      name: 'SiliconFlow',
      url:  'https://api.siliconflow.cn/v1/chat/completions',
      model: 'Qwen/Qwen3.5-4B',
      apiKey: SILICONFLOW_API_KEY,
    })
  }
  if (providers.length === 0) throw new Error('No LLM API key configured (GLM_API_KEY or SILICONFLOW_API_KEY)')

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
            { role: 'user',   content: userContent },
          ],
          max_tokens:       maxTokens,
          temperature:      0.2,
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

// ── 常量 ─────────────────────────────────────────────────────────────────────

const BATCH_SIZE    = 5
const PAUSE_MS      = 2_000   // 每篇之间 2 秒
const MAX_RETRIES   = 3
const RETRY_DELAY   = 1_500  // 重试前等 1.5s × attempt

// ── System Prompt（与 /api/refine 完全一致）──────────────────────────────────

const SYSTEM_PROMPT = `你是一位专注于塑料循环经济的资深工业分析师。

【前置过滤】
在处理之前，彻底剔除输入文本中的以下内容：
- 网站导航菜单、侧边栏链接、面包屑导航
- 版权声明、隐私政策、条款文字
- 广告位文案、推广内容
- 社交媒体分享按钮、评论区引导
- 订阅弹窗、Cookie 提示等任何非正文噪音

【加工要求】
对净化后的正文执行以下深度加工，仅输出纯 JSON（不含 Markdown 代码块）：

{
  "titleZh": "一眼即能看出新闻价值的中文标题（不超过30字）",
  "titleEn": "Equally informative English title (max 15 words)",
  "refinedSummary": "深度总结，要求500-800字，必须涵盖：①事件背景与起因；②核心技术路径或政策细节；③对塑料产业链（原料/加工/回收/品牌商）的具体影响与机会。语气客观、专业、有深度，避免泛泛而谈。PCR/rPET/PPWR/EPR/GRS等缩写保留原文",
  "keyInsights": [
    "核心结论1，动词开头，≤30字",
    "核心结论2，动词开头，≤30字",
    "核心结论3，动词开头，≤30字"
  ],
  "dimensions": ["物理回收"],
  "region": "GLOBAL",
  "score": 3,
  "tags": ["rPET", "PPWR"]
}

【字段规则】
dimensions（从以下选 1-2 个）：
  物理回收 | 化学回收 | 生物基材料 | 减碳 | 政策法规 | 可循环设计 | 行业标准

region（选 1 个）：CN | EU | US | UK | GLOBAL

score 1-5 评分标准：
  5 = 突发重磅：重大法规颁布/修订、亿级以上并购、颠覆性技术突破
  4 = 重要：行业政策调整、知名企业战略动作、大规模产能扩张
  3 = 常规：行业动态、市场数据、技术进展
  2 = 一般：企业小动态、会议预告
  1 = 低价值：宣传稿、无实质信息

keyInsights：3-5条，每条以动词开头，≤30字，聚焦具体数据或结论

tags：最多3个英文关键词，使用行业术语（如 rPET、CBAM、chemical recycling）`

// ── 工具函数 ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const VALID_DIMS    = ['物理回收', '化学回收', '生物基材料', '减碳', '政策法规', '可循环设计', '行业标准']
const VALID_REGIONS = ['CN', 'EU', 'US', 'UK', 'GLOBAL']

// ── AI 精炼（直接从 /api/refine 的 refine() 移植）────────────────────────────

async function refine(title, content, retries = MAX_RETRIES) {
  const truncated = content.slice(0, 10_000)
  const prompt    = `原始标题：${title}\n\n正文内容：\n${truncated}`

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const raw   = await callLLM(SYSTEM_PROMPT, prompt, 2000)
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('LLM did not return JSON')
      const p = JSON.parse(match[0])

      const dimensions = Array.isArray(p.dimensions)
        ? p.dimensions.filter(d => VALID_DIMS.includes(String(d))).slice(0, 2)
        : ['物理回收']

      const keyInsights = Array.isArray(p.keyInsights)
        ? p.keyInsights.slice(0, 5).map(String)
        : [String(p.refinedSummary ?? '').slice(0, 30)]

      return {
        titleZh:        String(p.titleZh        ?? title).slice(0, 200),
        titleEn:        String(p.titleEn        ?? title).slice(0, 200),
        refinedSummary: String(p.refinedSummary ?? '').slice(0, 2000),
        keyInsights,
        dimensions,
        region:  VALID_REGIONS.includes(p.region) ? String(p.region) : 'GLOBAL',
        score:   Math.min(5, Math.max(1, Number(p.score) || 3)),
        tags:    Array.isArray(p.tags) ? p.tags.slice(0, 3).map(String) : [],
      }
    } catch (err) {
      if (attempt < retries) {
        console.warn(`  ⚠️  LLM attempt ${attempt} failed, retrying in ${RETRY_DELAY * attempt}ms...`)
        await sleep(RETRY_DELAY * attempt)
      }
    }
  }

  // All retries failed → fallback
  return {
    titleZh: title, titleEn: title,
    refinedSummary: content.slice(0, 500),
    keyInsights:    [],
    dimensions:     ['物理回收'],
    region:         'GLOBAL',
    score:          3,
    tags:           [],
  }
}

// ── 核心处理函数 ───────────────────────────────────────────────────────────────

async function processItem(item) {
  // 用 summary 作为输入（已净化），加上 title 构成上下文
  const input = item.summary && item.summary.length > 50
    ? item.summary
    : item.title

  const report = await refine(item.title, input)

  const tldrZh = report.keyInsights.map(s => `• ${s}`).join('\n')

  const updateData = {
    contentZh:       report.refinedSummary.slice(0, 1200),  // 500-800字
    tldrZh:          tldrZh || null,
    // 不覆盖其他字段
  }

  await prisma.intelligence.update({
    where: { id: item.id },
    data:  updateData,
  })

  return {
    id:         item.id,
    title:      item.title.slice(0, 40),
    ok:         true,
    score:      report.score,
    dims:       report.dimensions,
    contentLen: report.refinedSummary.length,
  }
}

// ── 主流程 ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  refine-all-contentzh  —  批量重写 contentZh        ║')
  console.log('╚══════════════════════════════════════════════════════╝')

  // 取所有有 summary 的文章（排除 contentZh 已是高质量的可能跳过）
  const items = await prisma.intelligence.findMany({
    where: {
      summary: { not: '' },
    },
    select: {
      id:       true,
      title:    true,
      summary:  true,
      contentZh: true,
      lang:     true,
    },
    orderBy: { publishedAt: 'desc' },
  })

  console.log(`📦 待处理文章: ${items.length} 篇\n`)
  console.log(`⚙️  分批策略: 每批 ${BATCH_SIZE} 篇，每篇间隔 ${PAUSE_MS / 1000}s\n`)

  let success = 0, failed = 0, skipped = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const batchIndex = Math.floor(i / BATCH_SIZE)
    const posInBatch = i % BATCH_SIZE

    // 每批第一篇打印批次头
    if (posInBatch === 0) {
      console.log(`─── 批次 ${batchIndex + 1} ─────────────────────────────`)
    }

    process.stdout.write(`  [${i + 1}/${items.length}] ${item.title.slice(0, 35).padEnd(36)} `)

    try {
      // 检查 contentZh 是否已是高质量中文（>200字，有中文）
      const hasChineseContent = item.contentZh && (item.contentZh.match(/[一-鿿]/g) ?? []).length > 20
      const longEnough        = item.contentZh && item.contentZh.length > 300

      if (hasChineseContent && longEnough) {
        // contentZh 已有实质内容，跳过（避免重复处理）
        console.log('⏭️  已有效 contentZh，跳过')
        skipped++
      } else {
        const result = await processItem(item)
        console.log(`✅ score=${result.score} dims=${result.dims.join(',')} contentLen=${result.contentLen}`)
        success++
      }
    } catch (err) {
      console.log(`❌ ${err.message}`)
      failed++
    }

    // 篇间暂停（最后一个 batch 的最后一项不等待）
    const isLastInBatch = posInBatch === BATCH_SIZE - 1
    const isLastItem    = i === items.length - 1

    if (!isLastItem) {
      if (isLastInBatch) {
        // 批次结束时多停一下（DB 连接喘口气）
        console.log(`\n  ⏸  批次完成，休息 ${PAUSE_MS * 2 / 1000}s...\n`)
        await sleep(PAUSE_MS * 2)
      } else {
        await sleep(PAUSE_MS)
      }
    }
  }

  // ── 最终统计 ──────────────────────────────────────────────────────────────
  console.log(`\n╔══════════════════════════════════════════════════════╗`)
  console.log(`║  执行结果                                         ║`)
  console.log(`╠══════════════════════════════════════════════════════╣`)
  console.log(`║  成功: ${String(success).padStart(4)}  │  跳过: ${String(skipped).padStart(4)}  │  失败: ${String(failed).padStart(4)}  ║`)
  console.log(`╚══════════════════════════════════════════════════════╝`)
  console.log()

  // 验证：抽样查几条
  const samples = await prisma.intelligence.findMany({
    where: { contentZh: { not: '' } },
    select: { id: true, title: true, contentZh: true },
    take: 3,
    orderBy: { updatedAt: 'desc' },
  })

  console.log('📋 最新 contentZh 抽样：')
  for (const s of samples) {
    const chars = (s.contentZh.match(/[一-鿿]/g) ?? []).length
    console.log(`  • ${s.title.slice(0, 40)}`)
    console.log(`    contentZh: ${s.contentZh.length}字 / ${chars}中文字符\n`)
  }

  await prisma.$disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('Fatal:', err)
  prisma.$disconnect()
  process.exit(1)
})
