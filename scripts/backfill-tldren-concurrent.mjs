/**
 * tldrEn 并发回填 — 翻译 tldrZh 为英文要点
 * GLM-4-Flash + SiliconFlow THUDM/GLM-4-9B-0414 赛马，6 并发
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CONCURRENCY = 6
const BATCH_PAUSE_MS = 2000
const REPORT_EVERY = 30

const GLM_API_KEY = process.env.GLM_API_KEY
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY

let startTime = Date.now()

async function callGLM(system, user, maxTokens) {
  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GLM_API_KEY}` },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: maxTokens, temperature: 0.2,
    }),
  })
  if (!res.ok) throw new Error(`GLM ${res.status}`)
  return (await res.json())?.choices?.[0]?.message?.content?.trim() ?? ''
}

async function callSiliconFlow(system, user, maxTokens) {
  const res = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SILICONFLOW_API_KEY}` },
    body: JSON.stringify({
      model: 'THUDM/GLM-4-9B-0414',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: maxTokens, temperature: 0.2,
    }),
  })
  if (!res.ok) throw new Error(`SF ${res.status}`)
  return (await res.json())?.choices?.[0]?.message?.content?.trim() ?? ''
}

async function race(system, user, maxTokens) {
  const tasks = []
  if (GLM_API_KEY) tasks.push(callGLM(system, user, maxTokens))
  if (SILICONFLOW_API_KEY) tasks.push(callSiliconFlow(system, user, maxTokens))
  return Promise.any(tasks)
}

const SYS_TLDR = `You are a professional translator specializing in plastics circular economy.
Translate the following Chinese bullet points to English. Preserve the bullet point format (each line starting with "•").
Keep each point concise (under 30 words), actionable, and professional.
Preserve abbreviations: rPET, PPWR, PCR, EPR, CBAM, GRS, BDO, POE, ABS, etc.
Only output the translated bullet points, nothing else.`

async function processItem(item) {
  try {
    const result = await race(SYS_TLDR, item.tldrZh, 400)
    if (result) {
      await prisma.intelligence.update({
        where: { id: item.id },
        data: { tldrEn: result },
      })
      return true
    }
  } catch (e) { /* skip */ }
  return false
}

async function main() {
  const items = await prisma.intelligence.findMany({
    where: { tldrEn: null, tldrZh: { not: null } },
    select: { id: true, tldrZh: true },
  })

  console.log(`${items.length} 篇 tldrEn 待翻译 | ${CONCURRENCY}x 并发\n`)
  startTime = Date.now()

  let idx = 0, ok = 0

  async function worker(wid) {
    while (idx < items.length) {
      const i = idx++
      const item = items[i]
      const preview = item.tldrZh.replace(/\n/g, ' ').slice(0, 40)
      process.stdout.write(`[${i + 1}/${items.length}] #${wid} ${preview}... `)
      const t0 = Date.now()
      const success = await processItem(item)
      console.log(`${success ? 'OK' : 'FAIL'} ${Date.now() - t0}ms`)
      if (success) ok++

      if ((i + 1) % REPORT_EVERY === 0) {
        const rate = ((i + 1) / ((Date.now() - startTime) / 60000)).toFixed(1)
        console.log(`── ${i + 1}/${items.length} | OK:${ok} | ${rate}/min ──`)
        await new Promise(r => setTimeout(r, BATCH_PAUSE_MS))
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)))

  const remaining = await prisma.intelligence.count({ where: { tldrEn: null } })
  const min = ((Date.now() - startTime) / 60000).toFixed(1)
  console.log(`\n=== ${min} 分钟 ===`)
  console.log(`tldrEn: +${ok} → 剩余 ${remaining}`)
}

main().finally(() => prisma.$disconnect()).catch(console.error)
