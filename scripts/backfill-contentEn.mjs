/**
 * 为缺少 contentEn / summaryEn / tldrEn 的英文文章补全英文内容
 * 使用 LLM 将 contentZh 翻译为英文
 */
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function callLLM(systemPrompt, userContent, maxTokens = 800) {
  const providers = []
  if (process.env.GLM_API_KEY) {
    providers.push({ name: 'GLM', url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash', key: process.env.GLM_API_KEY })
  }
  if (process.env.SILICONFLOW_API_KEY) {
    providers.push({ name: 'SiliconFlow', url: 'https://api.siliconflow.cn/v1/chat/completions', model: 'THUDM/GLM-4-9B-0414', key: process.env.SILICONFLOW_API_KEY })
  }

  for (const p of providers) {
    try {
      const res = await fetch(p.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p.key}` },
        body: JSON.stringify({ model: p.model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }], max_tokens: maxTokens, temperature: 0.2 }),
      })
      if (!res.ok) throw new Error(`${p.name} ${res.status}`)
      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content ?? ''
      console.log(`  [LLM] ${p.name} responded (${text.length} chars)`)
      return text.trim()
    } catch (e) {
      console.warn(`  [LLM] ${p.name} failed: ${String(e).slice(0, 100)}`)
    }
  }
  throw new Error('All providers failed')
}

async function backfill() {
  const articles = await prisma.intelligence.findMany({
    where: { lang: 'en', contentZh: { not: null }, contentEn: null },
    select: { id: true, title: true, contentZh: true, tldrZh: true },
  })

  console.log(`Found ${articles.length} English articles missing contentEn\n`)

  let done = 0
  for (const a of articles) {
    console.log(`[${++done}/${articles.length}] ${a.title.slice(0, 60)}...`)

    try {
      // Translate contentZh to English
      const contentEn = await callLLM(
        'Translate the following Chinese text into natural, fluent English. Maintain the analytical tone and industry terminology. Do not add or remove information.',
        a.contentZh.slice(0, 2000),
        1000,
      )

      // Generate summaryEn (shorter version)
      const summaryEn = contentEn.slice(0, 400)

      // Translate tldrZh
      let tldrEn = null
      if (a.tldrZh) {
        const tldrRaw = await callLLM(
          'Translate the following Chinese bullet points to English. Preserve the bullet format (each starting with "•"). Keep each point concise (≤30 words). Only output the translated bullets.',
          a.tldrZh,
          400,
        )
        tldrEn = tldrRaw || null
      }

      await prisma.intelligence.update({
        where: { id: a.id },
        data: { contentEn, summaryEn, tldrEn },
      })

      console.log(`  ✓ contentEn=${contentEn.length}c summaryEn=${summaryEn.length}c tldrEn=${tldrEn ? 'yes' : 'no'}`)
    } catch (e) {
      console.error(`  ✗ Failed: ${String(e).slice(0, 200)}`)
    }

    // Rate limit delay
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\nDone!')
}

backfill().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
