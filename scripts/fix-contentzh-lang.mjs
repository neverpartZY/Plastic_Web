/**
 * 修复 contentZh 语言错误
 * 当 lang='en' 时，contentZh 应为中文，但可能存了英文原文
 * 遍历所有 lang='en' 的文章，检测 contentZh 是否为纯英文，若是则翻译
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

// 检测文本是否主要为英文（中文少于 15 个字符）
function isEnglishText(text) {
  if (!text) return false
  const chineseChars = (text.match(/[一-鿿]/g) || []).length
  return chineseChars < 15 && text.length > 50
}

const TRANSLATE_SYSTEM = `You are a professional translator. Translate the following English text to Chinese.
Only output the Chinese translation, nothing else. Keep it concise and professional.
Preserve any industry abbreviations like rPET, PPWR, PCR, EPR, CBAM, GRS in English.`

async function translateToChinese(text) {
  try {
    return await callLLM(TRANSLATE_SYSTEM, text, 1000)
  } catch (err) {
    console.error('翻译失败:', err)
    return null
  }
}

async function main() {
  console.log('=== 修复 contentZh 语言错误 ===\n')

  // 查找所有 lang='en' 且有 contentZh 的文章
  const items = await prisma.intelligence.findMany({
    where: {
      lang: 'en',
      contentZh: { not: '' },
    },
    select: {
      id: true,
      title: true,
      titleZh: true,
      contentZh: true,
      lang: true,
    },
  })

  console.log(`找到 ${items.length} 篇 lang=en 的文章\n`)

  // 过滤出 contentZh 为英文的文章
  const englishContent = items.filter(item => isEnglishText(item.contentZh))
  console.log(`其中 ${englishContent.length} 篇的 contentZh 为纯英文，需翻译\n`)

  if (englishContent.length === 0) {
    console.log('无需修复')
    return
  }

  let fixed = 0
  let failed = 0

  for (let i = 0; i < englishContent.length; i++) {
    const item = englishContent[i]
    console.log(`[${i + 1}/${englishContent.length}] ${item.titleZh || item.title}`.substring(0, 60))

    const translated = await translateToChinese(item.contentZh)

    if (translated) {
      await prisma.intelligence.update({
        where: { id: item.id },
        data: { contentZh: translated },
      })
      fixed++
      console.log(`  ✓ 已翻译`)
    } else {
      failed++
      console.log(`  ✗ 翻译失败`)
    }

    // 避免 API 限流
    if ((i + 1) % 10 === 0) {
      console.log(`\n--- 已处理 ${i + 1} 篇，休息 3 秒 ---\n`)
      await new Promise(r => setTimeout(r, 3000))
    }
  }

  console.log(`\n=== 修复完成 ===`)
  console.log(`成功: ${fixed}`)
  console.log(`失败: ${failed}`)
}

main()
  .finally(() => prisma.$disconnect())
  .catch(console.error)
