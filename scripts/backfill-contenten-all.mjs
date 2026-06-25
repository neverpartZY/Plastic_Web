/**
 * 为所有缺失 contentEn 的情报生成英文深度内容
 * 中文源：翻译 contentZh → contentEn
 * 英文源：基于 summaryEn + content 生成深度分析 → contentEn
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

const TRANSLATE_SYSTEM = `You are a professional translator specializing in the plastics circular economy industry.
Translate the following Chinese text to professional English. Preserve industry abbreviations (rPET, PPWR, PCR, EPR, CBAM, GRS).
Output only the English translation, nothing else. Target 500-800 words.`

const DEEP_ANALYSIS_SYSTEM = `You are a senior industrial analyst specializing in the global plastics circular economy.

Generate a deep analytical summary in English (500-800 words) based on the provided article content. Your summary must cover:
1. Event background and causes
2. Core technical paths or policy details
3. Specific impacts and opportunities for the plastics industry chain

Tone: objective, professional, in-depth. Avoid vague generalizations.
Keep industry abbreviations like rPET, PPWR, PCR, EPR, CBAM, GRS in English.
Only output the English summary text, nothing else.`

async function generateContentEn(item) {
  const title = item.titleEn || item.titleZh || item.title || ''

  if (item.lang === 'zh') {
    // 中文源：翻译 contentZh 为英文
    const sourceText = (item.contentZh || item.summaryZh || item.summary || '').slice(0, 2000)
    if (!sourceText) return null
    const input = `Title: ${title}\n\nChinese text:\n${sourceText}`
    try {
      return await callLLM(TRANSLATE_SYSTEM, input, 1500)
    } catch (err) {
      console.error('Translation failed:', err.message)
      return null
    }
  } else {
    // 英文源：基于 summaryEn + content 生成深度分析
    const summaryEn = item.summaryEn || item.summary || ''
    const content = (item.content || '').slice(0, 3000)
    const input = `Title: ${title}\n\nSummary:\n${summaryEn}\n\n${content ? `Original Content:\n${content}` : ''}`
    try {
      return await callLLM(DEEP_ANALYSIS_SYSTEM, input, 1500)
    } catch (err) {
      console.error('Analysis failed:', err.message)
      return null
    }
  }
}

async function main() {
  console.log('=== 为所有文章生成 contentEn ===\n')

  const items = await prisma.intelligence.findMany({
    where: {
      OR: [
        { contentEn: null },
        { contentEn: '' },
      ],
    },
    select: {
      id: true,
      title: true,
      titleZh: true,
      titleEn: true,
      summary: true,
      summaryZh: true,
      summaryEn: true,
      content: true,
      contentZh: true,
      lang: true,
    },
  })

  console.log(`待处理: ${items.length} 篇`)
  const zhItems = items.filter(i => i.lang === 'zh')
  const enItems = items.filter(i => i.lang === 'en')
  console.log(`  中文源: ${zhItems.length}`)
  console.log(`  英文源: ${enItems.length}\n`)

  if (items.length === 0) {
    console.log('无需处理')
    return
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const title = item.titleEn || item.titleZh || item.title || ''
    console.log(`[${i + 1}/${items.length}] ${title.substring(0, 50)} (${item.lang})`)

    const refined = await generateContentEn(item)

    if (refined && refined.length > 100) {
      await prisma.intelligence.update({
        where: { id: item.id },
        data: { contentEn: refined.slice(0, 1500) },
      })
      success++
      console.log(`  ✓ ${refined.length} chars`)
    } else {
      failed++
      console.log(`  ✗ failed`)
    }

    if ((i + 1) % 5 === 0) {
      console.log(`\n--- 休息 4 秒 ---\n`)
      await new Promise(r => setTimeout(r, 4000))
    } else {
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log(`\n=== 完成 ===`)
  console.log(`成功: ${success}`)
  console.log(`失败: ${failed}`)

  const stats = {
    total: await prisma.intelligence.count(),
    nullContentEn: await prisma.intelligence.count({ where: { OR: [{ contentEn: null }, { contentEn: '' }] } }),
  }
  console.log('\n=== 最终统计 ===')
  console.log(`总文章数: ${stats.total}`)
  console.log(`contentEn 缺失: ${stats.nullContentEn}`)
}

main()
  .finally(() => prisma.$disconnect())
  .catch(console.error)
