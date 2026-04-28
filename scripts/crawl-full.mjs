/**
 * 全量爬取脚本 — 覆盖所有 13 个信息源
 * RSS 优先，无 RSS 则 HTML 抓取
 * 仅处理 30 天内的文章，已存在的自动跳过
 * Usage: node scripts/crawl-full.mjs
 */

import https from 'https'
import http from 'http'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

const ONE_MONTH_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
const GLM_KEY  = process.env.GLM_API_KEY
const SF_KEY   = process.env.SILICONFLOW_API_KEY
let rrIndex    = 0

// ── HTTP 工具 ──────────────────────────────────────────────────────────────────

const UA_POOL = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
]

function randomUA() { return UA_POOL[Math.floor(Math.random() * UA_POOL.length)] }
function sleep(ms)  { return new Promise(r => setTimeout(r, ms)) }

function fetchUrl(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const mod    = parsed.protocol === 'https:' ? https : http
    const options = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   'GET',
      headers:  {
        'User-Agent':      randomUA(),
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        ...extraHeaders,
      },
      timeout: 15000,
    }
    const req = mod.request(options, res => {
      // follow single redirect
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        return fetchUrl(res.headers.location, extraHeaders).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      res.setEncoding('utf8')
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => resolve(body))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)) })
    req.end()
  })
}

async function fetchWithRetry(url, headers = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try { return await fetchUrl(url, headers) }
    catch (e) {
      if (i === retries - 1) throw e
      await sleep(2000 * (i + 1))
    }
  }
}

// ── LLM 调用 ──────────────────────────────────────────────────────────────────

const PROVIDERS = [
  GLM_KEY && { name: 'GLM',          url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash',        key: GLM_KEY },
  SF_KEY  && { name: 'SiliconFlow',  url: 'https://api.siliconflow.cn/v1/chat/completions',        model: 'Qwen/Qwen3.5-4B',   key: SF_KEY  },
].filter(Boolean)

function callProvider(p, sys, user, maxTokens) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: p.model,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      max_tokens: maxTokens,
      temperature: 0.2,
      // Qwen3 默认思考模式会大幅增加延迟，关闭
      ...(p.name === 'SiliconFlow' ? { enable_thinking: false } : {}),
    })
    const u = new URL(p.url)
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + p.key, 'Content-Length': Buffer.byteLength(body, 'utf8') },
      timeout: 30000,
    }, res => {
      let d = ''; res.setEncoding('utf8')
      res.on('data', c => d += c)
      res.on('end', () => {
        try {
          const j = JSON.parse(d)
          if (!res.statusCode || res.statusCode >= 400) return reject(new Error(`${p.name} ${res.statusCode}: ${d.slice(0,100)}`))
          resolve(j.choices?.[0]?.message?.content?.trim() ?? '')
        } catch(e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error(`${p.name} timeout`)) })
    req.write(body, 'utf8'); req.end()
  })
}

async function callLLM(sys, user, maxTokens = 512) {
  if (PROVIDERS.length === 0) throw new Error('No LLM API key configured')
  const start = rrIndex++ % PROVIDERS.length
  const order = [...PROVIDERS.slice(start), ...PROVIDERS.slice(0, start)]
  let lastErr
  for (const p of order) {
    try { return await callProvider(p, sys, user, maxTokens) }
    catch(e) { console.warn(`  ⚠ ${p.name} failed: ${e.message}`); lastErr = e }
  }
  throw lastErr
}

// ── 解析工具 ───────────────────────────────────────────────────────────────────

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseDate(raw) {
  if (!raw) return null
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

function isWithinMonth(date) {
  if (!date) return true  // unknown date → include
  return date >= ONE_MONTH_AGO
}

// ── RSS 解析 ───────────────────────────────────────────────────────────────────

async function parseRss(rssUrl, baseUrl, maxArticles) {
  const xml = await fetchWithRetry(rssUrl, { Accept: 'application/rss+xml,application/xml,text/xml,*/*' })
  const $ = cheerio.load(xml, { xmlMode: true })
  const items = []

  $('item, entry').each((_, el) => {
    if (items.length >= maxArticles * 2) return false
    const $el = $(el)

    const title = stripHtml($el.find('title').first().text()).replace(/^<!\[CDATA\[|\]\]>$/g,'').trim()
    if (!title) return

    let link = $el.find('link').first().text().trim()
              || $el.find('link').first().attr('href')
              || $el.find('guid').first().text().trim()
              || ''
    if (!link) return
    if (link.startsWith('/')) link = baseUrl + link

    const rawDesc = $el.find('description').first().text()
                  || $el.find('summary').first().text()
                  || $el.find('content\\:encoded').first().text()
                  || ''
    const summary = stripHtml(rawDesc).slice(0, 400) || title

    const pubDate = parseDate(
      $el.find('pubDate').first().text()
      || $el.find('published').first().text()
      || $el.find('updated').first().text()
    )

    if (!isWithinMonth(pubDate)) return

    items.push({ title, summary, link, pubDate })
  })

  return items
}

// ── HTML 正文抓取 ──────────────────────────────────────────────────────────────

async function scrapeArticle(url, bodySelector) {
  const html = await fetchWithRetry(url)
  const $ = cheerio.load(html)

  const title = $('h1').first().text().trim() || $('title').first().text().split('|')[0].split('-')[0].trim()

  const rawDate = $('meta[property="article:published_time"]').attr('content')
               || $('time[datetime]').first().attr('datetime')
               || $('meta[name="date"]').attr('content')
  const publishedAt = parseDate(rawDate)

  const paragraphs = []
  $(bodySelector).each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 30) paragraphs.push(text)
  })

  return { title, content: paragraphs.join('\n\n'), publishedAt }
}

// ── HTML 列表抓取 ──────────────────────────────────────────────────────────────

async function scrapeList(listUrl, baseUrl, linkSelector, linkFilter, maxArticles) {
  const html = await fetchWithRetry(listUrl)
  const $ = cheerio.load(html)
  const links = []

  $(linkSelector).each((_, el) => {
    if (links.length >= maxArticles * 3) return false
    let href = $(el).attr('href') || ''
    if (!href) return
    if (href.startsWith('/')) href = baseUrl + href
    if (linkFilter(href) && !links.includes(href)) links.push(href)
  })

  return links.slice(0, maxArticles * 2)
}

// ── AI 处理 ───────────────────────────────────────────────────────────────────

const CLASSIFY_SYS = `You are a senior analyst for the plastics circular economy industry.
Classify the article and return ONLY valid JSON:
{"pillars":["recycling"],"category":"global","importance":3,"countryCode":"GLOBAL","isHot":false,"tags":[]}
pillars (1-3): molds|molding|materials|additives|auxiliaries|recycling|reuse
category: policy|market|tech|enterprise|global
importance 1-5, countryCode: CN|EU|US|UK|GLOBAL, isHot: true if importance>=4`

const EN_TO_ZH_SYS = `你是塑料循环经济行业专业翻译，将英文翻译为精准中文，面向中国B2B读者。
PCR/rPET/PPWR/EPR/GRS保留原文；chemical recycling→化学回收；bottle flake→瓶片。
只返回有效JSON：{"titleZh":"...","summaryZh":"..."}`

async function processArticle(title, summary, content, lang) {
  const classifyUser = `Classify this ${lang === 'zh' ? 'Chinese' : 'English'} article:\nTitle: ${title}\nSummary: ${summary}`
  const rawClassify  = await callLLM(CLASSIFY_SYS, classifyUser, 150)
  const m = rawClassify.match(/\{[\s\S]*\}/)
  let cls = { pillars: ['recycling'], category: 'global', importance: 3, countryCode: 'GLOBAL', isHot: false, tags: [] }
  if (m) {
    try {
      const parsed = JSON.parse(m[0])
      const VALID_P = new Set(['molds','molding','materials','additives','auxiliaries','recycling','reuse'])
      const VALID_C = new Set(['policy','market','tech','enterprise','global'])
      cls = {
        pillars:     (parsed.pillars || []).filter(p => VALID_P.has(p)).slice(0,3) || ['recycling'],
        category:    VALID_C.has(parsed.category) ? parsed.category : 'global',
        importance:  Math.min(5, Math.max(1, Number(parsed.importance) || 3)),
        countryCode: parsed.countryCode || 'GLOBAL',
        isHot:       Boolean(parsed.isHot),
        tags:        Array.isArray(parsed.tags) ? parsed.tags.slice(0,3) : [],
      }
      if (cls.pillars.length === 0) cls.pillars = ['recycling']
    } catch {}
  }
  await sleep(400)

  // 翻译
  let titleZh = null, summaryZh = null, titleEn = null, summaryEn = null
  if (lang === 'en') {
    const rawTr = await callLLM(EN_TO_ZH_SYS, `Title: ${title}\n\nSummary: ${summary}`, 300)
    const mTr = rawTr.match(/\{[\s\S]*\}/)
    if (mTr) {
      try { const r = JSON.parse(mTr[0]); titleZh = r.titleZh; summaryZh = r.summaryZh } catch {}
    }
    titleEn = title; summaryEn = summary
  } else {
    titleZh = title; summaryZh = summary
  }
  await sleep(400)

  // TLDR
  const bodyForTldr = (content || summary).slice(0, 1500)
  let tldrZh = null, tldrEn = null
  try {
    const [zh, en] = await Promise.all([
      callLLM(
        `你是塑料循环经济行业编辑。严格输出3条要点，每条以「• 」开头，20-40字，不要前言序号。PCR/rPET/PPWR/EPR保留原文。`,
        lang === 'zh' ? `标题：${titleZh||title}\n\n${bodyForTldr}` : `Title: ${title}\n\n${bodyForTldr}`,
        300
      ),
      callLLM(
        `You are an editor for the plastics circular economy industry. Output exactly 3 bullet points, each starting with "• ", 15-30 words each. No title or preamble. Keep PCR/rPET/PPWR/EPR as-is.`,
        `Title: ${titleEn||title}\n\n${bodyForTldr}`,
        250
      ),
    ])
    tldrZh = zh.trim(); tldrEn = en.trim()
  } catch(e) { console.warn('  ⚠ TLDR failed:', e.message) }
  await sleep(400)

  // 正文翻译（英文原文 → 中文）
  let contentZh = null
  if (lang === 'en' && content && content.length > 100) {
    try {
      contentZh = await callLLM(
        `你是塑料循环经济行业专业翻译，将英文正文译为中文，面向中国B2B读者。保持段落结构，段间空行；PCR/rPET/PPWR/EPR/GRS保留；chemical recycling→化学回收；bottle flake→瓶片；直接输出译文。`,
        `标题：${titleZh||title}\n\n原文：\n${content.slice(0, 2000)}`,
        1200
      )
    } catch(e) { console.warn('  ⚠ content translate failed:', e.message) }
    await sleep(400)
  }

  return { cls, titleZh, titleEn, summaryZh, summaryEn, tldrZh, tldrEn, contentZh }
}

// ── 写入数据库 ─────────────────────────────────────────────────────────────────

async function saveItem({ title, summary, content, url, sourceName, sourceId, lang, publishedAt, ai }) {
  const { cls, titleZh, titleEn, summaryZh, summaryEn, tldrZh, tldrEn, contentZh } = ai

  await prisma.intelligence.create({
    data: {
      title, summary, content: content || '',
      titleZh, titleEn, summaryZh, summaryEn,
      tldrZh, tldrEn, contentZh,
      category:        cls.category,
      pillars:         cls.pillars.join(','),
      countryCode:     cls.countryCode,
      importance:      cls.importance,
      isHot:           cls.isHot,
      source:          sourceName,
      sourceUrl:       url,
      crawlSourceId:   sourceId,
      translateStatus: 'translated',
      publishedAt:     publishedAt || new Date(),
    },
  })
}

// ── 站点配置 ───────────────────────────────────────────────────────────────────

const SITES = [
  // ── P0 RSS ────────────────────────────────────────────────────────
  {
    name: 'packaging-dive', displayName: 'Packaging Dive', baseUrl: 'https://www.packagingdive.com', lang: 'en',
    rssUrl: 'https://www.packagingdive.com/feeds/news/',
    bodySelector: 'article p, .article__body p, .article-body p', maxArticles: 8,
  },
  {
    name: 'resource-recycling', displayName: 'Resource Recycling', baseUrl: 'https://www.resource-recycling.com', lang: 'en',
    rssUrl: 'https://resource-recycling.com/recycling/feed/',
    bodySelector: '.entry-content p, .post-content p, article p', maxArticles: 8,
  },
  // ── P1 RSS ────────────────────────────────────────────────────────
  {
    name: 'circular-online', displayName: 'Circular Online', baseUrl: 'https://www.circularonline.co.uk', lang: 'en',
    rssUrl: 'https://www.circularonline.co.uk/feed/',
    bodySelector: 'article p, .entry-content p, .post-content p', maxArticles: 6,
  },
  // ── P2 RSS ────────────────────────────────────────────────────────
  {
    name: 'recycling-today', displayName: 'Recycling Today', baseUrl: 'https://www.recyclingtoday.com', lang: 'en',
    rssUrl: 'https://www.recyclingtoday.com/rss/',
    bodySelector: 'article p, .article-body p, .story-body p, .content-body p', maxArticles: 6,
  },
  {
    name: 'waste-dive', displayName: 'Waste Dive', baseUrl: 'https://www.wastedive.com', lang: 'en',
    rssUrl: 'https://www.wastedive.com/feeds/news/',
    bodySelector: 'article p, .article__body p, .article-body p', maxArticles: 6,
  },
  // ── P0 HTML ───────────────────────────────────────────────────────
  {
    name: 'plasticstoday', displayName: 'PlasticsToday', baseUrl: 'https://www.plasticstoday.com', lang: 'en',
    listUrl: 'https://www.plasticstoday.com/',
    linkSelector: 'a[href]',
    linkFilter: h => h.startsWith('https://www.plasticstoday.com/') && h.length > 35
      && !/\/(topics|search|type|about|advertise|subscribe|login|register|contact|privacy|cookie|terms|tag)\b/.test(h),
    bodySelector: 'article p, .article-body p, .field--name-body p, main p', maxArticles: 5,
  },
  // ── P1 HTML ───────────────────────────────────────────────────────
  {
    name: 'packaging-europe', displayName: 'Packaging Europe', baseUrl: 'https://www.packagingeurope.com', lang: 'en',
    listUrl: 'https://www.packagingeurope.com/',
    linkSelector: 'a[href]',
    linkFilter: h => h.includes('packagingeurope.com') && /\/(news|article|feature|exclusive|interview)\//.test(h),
    bodySelector: 'article p, .article-content p, .entry-content p, .post-content p', maxArticles: 5,
  },
  {
    name: 'sustainable-plastics', displayName: 'Sustainable Plastics', baseUrl: 'https://www.sustainableplastics.com', lang: 'en',
    listUrl: 'https://www.sustainableplastics.com/',
    linkSelector: 'a[href]',
    linkFilter: h => h.includes('sustainableplastics.com') && /\/(news|article|feature|report)\//.test(h),
    bodySelector: 'article p, .article-body p, .story-body p, .field-items p', maxArticles: 5,
  },
  {
    name: 'pre', displayName: 'Plastics Recyclers Europe', baseUrl: 'https://www.plasticsrecyclers.eu', lang: 'en',
    listUrl: 'https://www.plasticsrecyclers.eu/news/',
    linkSelector: 'a[href]',
    linkFilter: h => (h.includes('plasticsrecyclers.eu') || h.startsWith('/')) && /\/news\//.test(h) && h.length > 15,
    bodySelector: '.entry-content p, .content p, article p', maxArticles: 4,
  },
  {
    name: 'apr', displayName: 'APR', baseUrl: 'https://www.plasticsrecycling.org', lang: 'en',
    listUrl: 'https://www.plasticsrecycling.org/news-media/news',
    linkSelector: 'a[href]',
    linkFilter: h => (h.includes('plasticsrecycling.org') || h.startsWith('/')) && /\/(news|media|resources|blog)\//.test(h),
    bodySelector: '.field-body p, .views-field-body p, article p, .content p', maxArticles: 4,
  },
  // ── P3 HTML ───────────────────────────────────────────────────────
  {
    name: 'ellen-macarthur', displayName: 'Ellen MacArthur Foundation', baseUrl: 'https://www.ellenmacarthurfoundation.org', lang: 'en',
    listUrl: 'https://www.ellenmacarthurfoundation.org/news',
    linkSelector: 'a[href]',
    linkFilter: h => (h.includes('ellenmacarthurfoundation.org') || h.startsWith('/')) && /\/(news|articles?|insights?|reports?)\//.test(h) && h.length > 10,
    bodySelector: '.prose p, article p, .content p, .rich-text p', maxArticles: 3,
  },
  {
    name: 'circular-economy-eu', displayName: 'European Circular Economy Platform', baseUrl: 'https://circulareconomy.europa.eu', lang: 'en',
    listUrl: 'https://circulareconomy.europa.eu/platform/en/news-and-events/news',
    linkSelector: 'a[href]',
    linkFilter: h => (h.includes('circulareconomy.europa.eu') || h.startsWith('/')) && /\/(news|events?)\//.test(h) && h.length > 10,
    bodySelector: '.field-body p, article p, .content p, .text-long p', maxArticles: 3,
  },
]

// ── 主流程 ─────────────────────────────────────────────────────────────────────

async function crawlSite(site, sourceId) {
  let rawItems = []

  if (site.rssUrl) {
    try {
      console.log(`  RSS: ${site.rssUrl}`)
      const rssItems = await parseRss(site.rssUrl, site.baseUrl, site.maxArticles)
      // 抓取每篇正文
      for (const item of rssItems) {
        await sleep(1000)
        try {
          const { content, publishedAt } = await scrapeArticle(item.link, site.bodySelector)
          rawItems.push({ title: item.title, summary: item.summary, content, url: item.link, publishedAt: item.pubDate || publishedAt })
        } catch {
          rawItems.push({ title: item.title, summary: item.summary, content: '', url: item.link, publishedAt: item.pubDate })
        }
      }
    } catch(e) {
      console.log(`  RSS failed (${e.message}), trying HTML...`)
    }
  }

  if (rawItems.length === 0 && site.listUrl) {
    console.log(`  HTML: ${site.listUrl}`)
    try {
      const links = await scrapeList(site.listUrl, site.baseUrl, site.linkSelector, site.linkFilter, site.maxArticles)
      console.log(`  Found ${links.length} links`)
      for (const url of links.slice(0, site.maxArticles)) {
        await sleep(1200)
        try {
          const { title, content, publishedAt } = await scrapeArticle(url, site.bodySelector)
          if (!title) continue
          const summary = content.split('\n\n')[0]?.slice(0, 400) || title
          rawItems.push({ title, summary, content, url, publishedAt })
        } catch(e) {
          console.warn(`  ⚠ scrape failed: ${url}: ${e.message}`)
        }
      }
    } catch(e) {
      console.warn(`  ⚠ list scrape failed: ${e.message}`)
    }
  }

  let newCount = 0, skipCount = 0
  for (const item of rawItems) {
    // 去重
    const exists = await prisma.intelligence.findFirst({ where: { sourceUrl: item.url }, select: { id: true } })
    if (exists) { skipCount++; continue }

    console.log(`  + "${item.title.slice(0,55)}"`)
    try {
      const ai = await processArticle(item.title, item.summary, item.content, site.lang)
      await saveItem({ ...item, sourceName: site.displayName, sourceId, lang: site.lang, ai })
      newCount++
      console.log(`    ✅ saved (${ai.cls.pillars.join(',')} | ${ai.cls.countryCode} | imp:${ai.cls.importance})`)
    } catch(e) {
      console.warn(`    ❌ AI/save failed: ${e.message}`)
    }
    await sleep(1000)
  }

  return { newCount, skipCount }
}

async function main() {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`爬取时间范围: ${ONE_MONTH_AGO.toLocaleDateString('zh-CN')} ~ 今天`)
  console.log(`LLM 提供商: ${PROVIDERS.map(p=>p.name).join(' + ')}`)
  console.log(`${'═'.repeat(60)}\n`)

  // 查询数据库中的 source id
  const dbSources = await prisma.crawlSource.findMany({ select: { id: true, name: true } })
  const sourceMap  = Object.fromEntries(dbSources.map(s => [s.name, s.id]))

  let totalNew = 0, totalSkip = 0, totalFail = 0

  for (const site of SITES) {
    console.log(`\n🌐 ${site.displayName} [${site.lang.toUpperCase()}]`)
    const sourceId = sourceMap[site.name]
    if (!sourceId) { console.log('  ⚠ 未找到 DB source，跳过'); totalFail++; continue }

    try {
      const { newCount, skipCount } = await crawlSite(site, sourceId)
      totalNew  += newCount
      totalSkip += skipCount
      console.log(`  → 新增 ${newCount}，跳过(已存在) ${skipCount}`)
      // 更新 lastCrawledAt
      await prisma.crawlSource.update({ where: { id: sourceId }, data: { lastCrawledAt: new Date(), crawlCount: { increment: 1 } } })
    } catch(e) {
      console.warn(`  ❌ 站点失败: ${e.message}`)
      totalFail++
      await prisma.crawlSource.update({ where: { id: sourceId }, data: { errorCount: { increment: 1 } } }).catch(()=>{})
    }

    await sleep(2000)
  }

  // 统计
  const total = await prisma.intelligence.count()
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`✅ 新增: ${totalNew}  ⏭ 跳过: ${totalSkip}  ❌ 失败站点: ${totalFail}`)
  console.log(`📊 数据库总计: ${total} 条`)
  console.log(`${'═'.repeat(60)}\n`)

  await prisma.$disconnect()
}

main().catch(async e => {
  console.error('Fatal:', e)
  await prisma.$disconnect()
  process.exit(1)
})
