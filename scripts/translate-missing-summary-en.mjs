/**
 * 翻译缺失的 summaryEn 字段
 * 直接调用 GLM API 翻译中文 summary 为英文
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

const TRANSLATE_SYSTEM = `You are a professional translator. Translate the following Chinese text to English.
Only output the English translation, nothing else. Keep it concise and professional.`

async function translateSummary(text) {
  try {
    return await callLLM(TRANSLATE_SYSTEM, text, 300)
  } catch (err) {
    console.error('翻译失败:', err)
    return ''
  }
}

async function main() {
  console.log('开始翻译缺失的 summaryEn...\n')

  // 找出所有需要翻译 summaryEn 的文章
  const items = await prisma.intelligence.findMany({
    where: {
      summaryEn: null,
      summary: { not: '' }
    },
    select: { id: true, title: true, summary: true }
  })

  console.log(`需要翻译的文章: ${items.length} 篇\n`)

  let success = 0
  let failed = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    console.log(`[${i + 1}/${items.length}] ${item.title.substring(0, 40)}...`)

    const translated = await translateSummary(item.summary)

    if (translated) {
      await prisma.intelligence.update({
        where: { id: item.id },
        data: { summaryEn: translated }
      })
      success++
      console.log(`  ✓ ${translated.substring(0, 50)}...`)
    } else {
      failed++
      console.log(`  ✗ 失败`)
    }

    // 避免 API 限流
    if ((i + 1) % 10 === 0) {
      console.log(`\n--- 已处理 ${i + 1} 篇，休息 3 秒 ---\n`)
      await new Promise(r => setTimeout(r, 3000))
    }
  }

  console.log('\n=== 翻译完成 ===')
  console.log(`成功: ${success}`)
  console.log(`失败: ${failed}`)

  // 最终统计
  const stats = {
    total: await prisma.intelligence.count(),
    nullSummaryEn: await prisma.intelligence.count({ where: { summaryEn: null } }),
  }
  console.log('\n=== 最终统计 ===')
  console.log(`总文章数: ${stats.total}`)
  console.log(`summaryEn 为 null: ${stats.nullSummaryEn}`)
}

main()
  .finally(() => prisma.$disconnect())
  .catch(console.error)
