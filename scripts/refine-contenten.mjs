/**
 * 为英文文章生成 contentEn 深度报告
 * 基于 summaryEn + content 字段生成 500-800 字的英文分析
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

const SYSTEM_PROMPT = `You are a senior industrial analyst specializing in the global plastics circular economy.

Generate a deep analytical summary in English (500-800 words) based on the provided article content. Your summary must cover:
1. Event background and causes
2. Core technical paths or policy details
3. Specific impacts and opportunities for the plastics industry chain (raw materials / processing / recycling / brands)

Tone: objective, professional, in-depth. Avoid vague generalizations.
Keep industry abbreviations like rPET, PPWR, PCR, EPR, CBAM, GRS in English.
Only output the English summary text, nothing else.`

async function refineContent(title, summaryEn, content) {
  const text = `Title: ${title}\n\nSummary:\n${summaryEn || ''}\n\n${content ? `Original Content:\n${String(content).slice(0, 3000)}` : ''}`

  try {
    return await callLLM(SYSTEM_PROMPT, text, 1500)
  } catch (err) {
    console.error('LLM failed:', err.message)
    return null
  }
}

async function main() {
  console.log('=== 为英文文章生成 contentEn ===\n')

  const items = await prisma.intelligence.findMany({
    where: { lang: 'en' },
    select: {
      id: true,
      title: true,
      titleEn: true,
      summaryEn: true,
      content: true,
      contentEn: true,
    },
  })

  // 过滤出还没有 contentEn 的
  const toProcess = items.filter(i => !i.contentEn || i.contentEn.length < 50)

  console.log(`英文文章总数: ${items.length}`)
  console.log(`其中待处理: ${toProcess.length}\n`)

  if (toProcess.length === 0) {
    console.log('无需处理')
    return
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < toProcess.length; i++) {
    const item = toProcess[i]
    const title = item.titleEn || item.title || ''
    console.log(`[${i + 1}/${toProcess.length}] ${title.substring(0, 50)}`)

    const refined = await refineContent(title, item.summaryEn, item.content)

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
}

main()
  .finally(() => prisma.$disconnect())
  .catch(console.error)
