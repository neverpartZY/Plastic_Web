/**
 * 并发回填脚本 — 双 AI 赛马，6 并发
 * summaryEn + contentEn 一网打尽
 * GLM-4-Flash + SiliconFlow THUDM/GLM-4-9B-0414 同时跑
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CONCURRENCY = 6
const BATCH_PAUSE_MS = 2000
const REPORT_EVERY = 30

const GLM_API_KEY = process.env.GLM_API_KEY
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY

let startTime = Date.now()

// ── API 调用 ──────────────────────────────────────────────────────────────

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

// 双 API 赛马
async function race(system, user, maxTokens) {
  const tasks = []
  if (GLM_API_KEY) tasks.push(callGLM(system, user, maxTokens))
  if (SILICONFLOW_API_KEY) tasks.push(callSiliconFlow(system, user, maxTokens))
  return Promise.any(tasks)
}

// ── 处理单篇文章 ──────────────────────────────────────────────────────────

const SYS_SUMMARY = 'You are a professional translator. Translate the Chinese text to English. Only output English, no explanations.'

const SYS_CONTENT_ZH = 'You are a professional translator specializing in plastics circular economy. Translate the Chinese text to professional English (500-800 words). Preserve abbreviations: rPET, PPWR, PCR, EPR, CBAM, GRS. Only output English.'

const SYS_CONTENT_EN = 'You are a senior industrial analyst. Generate a deep analytical summary in English (500-800 words): 1) Event background/causes 2) Technical/policy details 3) Impacts on plastics industry chain. Objective, professional. Only output English.'

async function processItem(item) {
  const title = item.titleEn || item.titleZh || item.title || ''
  const updates = {}

  // summaryEn（中文摘要 → 英文）
  if (!item.summaryEn && item.summary) {
    try {
      const r = await race(SYS_SUMMARY, item.summary, 300)
      if (r) updates.summaryEn = r.slice(0, 500)
    } catch (e) { /* skip */ }
  }

  // contentEn
  if (!item.contentEn || item.contentEn === '') {
    try {
      if (item.lang === 'zh') {
        const src = (item.contentZh || item.summaryZh || item.summary || '').slice(0, 2000)
        if (src) {
          const r = await race(SYS_CONTENT_ZH, `Title: ${title}\n\n${src}`, 1500)
          if (r && r.length > 100) updates.contentEn = r.slice(0, 1500)
        }
      } else {
        const src = `Title: ${title}\n\nSummary: ${item.summaryEn || item.summary || ''}\n\n${(item.content || '').slice(0, 3000)}`
        const r = await race(SYS_CONTENT_EN, src, 1500)
        if (r && r.length > 100) updates.contentEn = r.slice(0, 1500)
      }
    } catch (e) { /* skip */ }
  }

  if (Object.keys(updates).length > 0) {
    try {
      await prisma.intelligence.update({ where: { id: item.id }, data: updates })
    } catch (e) { console.warn(`  DB err: ${e.message}`) }
  }

  return updates
}

// ── 并发调度 ──────────────────────────────────────────────────────────────

async function runPool(items) {
  let idx = 0
  let summaryOk = 0, contentOk = 0, done = 0

  async function worker(wid) {
    while (idx < items.length) {
      const i = idx++
      const item = items[i]
      const label = (item.titleEn || item.titleZh || item.title || '').slice(0, 35)
      process.stdout.write(`[${i + 1}/${items.length}] #${wid} ${label}... `)
      const t0 = Date.now()
      const result = await processItem(item)
      const ms = Date.now() - t0
      const tags = []
      if (result.summaryEn) { tags.push('SE'); summaryOk++ }
      if (result.contentEn) { tags.push('CE'); contentOk++ }
      console.log(`${tags.join('+') || 'skip'} ${ms}ms`)
      done++

      if (done % REPORT_EVERY === 0) {
        const rate = (done / ((Date.now() - startTime) / 60000)).toFixed(1)
        console.log(`── ${done}/${items.length} | SE:${summaryOk} CE:${contentOk} | ${rate}/min ──`)
        await new Promise(r => setTimeout(r, BATCH_PAUSE_MS))
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)))
  return { summaryOk, contentOk }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const items = await prisma.intelligence.findMany({
    where: { OR: [{ summaryEn: null }, { contentEn: null }, { contentEn: '' }] },
    select: { id:true, title:true, titleZh:true, titleEn:true, summary:true, summaryZh:true, summaryEn:true, content:true, contentZh:true, contentEn:true, lang:true },
    orderBy: { publishedAt: 'desc' },
  })

  console.log(`${items.length} 篇待处理 | ${CONCURRENCY}x 并发 | GLM-4-Flash vs GLM-4-9B 赛马\n`)
  startTime = Date.now()

  const { summaryOk, contentOk } = await runPool(items)

  const [nullSE, nullCE] = await Promise.all([
    prisma.intelligence.count({ where: { summaryEn: null } }),
    prisma.intelligence.count({ where: { OR: [{ contentEn: null }, { contentEn: '' }] } }),
  ])

  const min = ((Date.now() - startTime) / 60000).toFixed(1)
  console.log(`\n=== ${min} 分钟 ===`)
  console.log(`summaryEn: +${summaryOk} → 剩余 ${nullSE}`)
  console.log(`contentEn: +${contentOk} → 剩余 ${nullCE}`)
}

main().finally(() => prisma.$disconnect()).catch(console.error)
