/**
 * 核心爬取引擎
 * RSS 优先（Cheerio XML 解析），无 RSS 则 HTML 抓取
 * 内置 UA 轮换、限速、重试
 */

import { load as cheerioLoad } from 'cheerio'
import type { SiteConfig } from './sources'

export interface RawItem {
  title: string
  summary: string
  content?: string
  url: string
  sourceName: string
  publishedAt?: Date
}

// ── UA 池 ──────────────────────────────────────────────────────────────────────

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
]

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

// ── fetch with retry ───────────────────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  baseDelayMs = 1500,
): Promise<Response> {
  const headers = {
    'User-Agent': randomUA(),
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    ...options.headers,
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 15_000)
      const res = await fetch(url, { ...options, headers, signal: controller.signal })
      clearTimeout(timer)
      if (res.ok) return res
      if (res.status === 429 || res.status >= 500) {
        await sleep(baseDelayMs * (attempt + 1))
        continue
      }
      throw new Error(`HTTP ${res.status} for ${url}`)
    } catch (err: unknown) {
      if (attempt === retries - 1) throw err
      await sleep(baseDelayMs * (attempt + 1))
    }
  }
  throw new Error(`fetchWithRetry exhausted for ${url}`)
}

// ── RSS parser ─────────────────────────────────────────────────────────────────

function parseDate(raw?: string | null): Date | undefined {
  if (!raw) return undefined
  const d = new Date(raw)
  return isNaN(d.getTime()) ? undefined : d
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function parseRss(rssUrl: string, config: SiteConfig): Promise<RawItem[]> {
  const res = await fetchWithRetry(rssUrl, {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
  })
  const xml = await res.text()
  const $ = cheerioLoad(xml, { xmlMode: true })

  const items: RawItem[] = []
  $('item, entry').each((_, el) => {
    const $el = $(el)

    const title =
      $el.find('title').first().text().trim() ||
      $el.find('title').first().attr('_cdata') ||
      ''
    if (!title) return

    // link: RSS <link>, Atom <link href>, or <guid>
    let link =
      $el.find('link').first().text().trim() ||
      $el.find('link').first().attr('href') ||
      $el.find('guid').first().text().trim() ||
      ''
    if (!link) return

    // resolve relative links
    if (link.startsWith('/')) link = config.baseUrl + link

    // summary: <description> or <summary> or <content:encoded>
    const rawDesc =
      $el.find('description').first().text() ||
      $el.find('summary').first().text() ||
      $el.find('content\\:encoded').first().text() ||
      ''
    const summary = stripHtml(rawDesc).slice(0, 400)

    const pubDate = parseDate(
      $el.find('pubDate').first().text() ||
      $el.find('published').first().text() ||
      $el.find('updated').first().text() ||
      undefined,
    )

    items.push({
      title,
      summary: summary || title,
      url: link,
      sourceName: config.displayName,
      publishedAt: pubDate,
    })

    if (items.length >= config.maxArticles) return false
  })

  return items.slice(0, config.maxArticles)
}

// ── HTML list scraper ─────────────────────────────────────────────────────────

async function scrapeArticleList(config: SiteConfig): Promise<string[]> {
  const res = await fetchWithRetry(config.listUrl)
  const html = await res.text()
  const $ = cheerioLoad(html)

  const links: string[] = []
  $(config.linkSelector).each((_, el) => {
    let href = $(el).attr('href') ?? ''
    if (!href) return

    if (href.startsWith('/')) href = config.baseUrl + href

    if (config.linkFilter(href) && !links.includes(href)) {
      links.push(href)
    }

    if (links.length >= config.maxArticles * 3) return false
  })

  return links.slice(0, config.maxArticles * 3)
}

// ── Article body scraper ───────────────────────────────────────────────────────

async function fetchArticleContent(
  articleUrl: string,
  bodySelector: string,
): Promise<{ title: string; content: string; publishedAt?: Date }> {
  const res = await fetchWithRetry(articleUrl)
  const html = await res.text()
  const $ = cheerioLoad(html)

  // Title from <title> or <h1>
  const title =
    $('h1').first().text().trim() ||
    $('title').first().text().trim() ||
    ''

  // Attempt to extract date from common meta/time tags
  const rawDate =
    $('meta[property="article:published_time"]').attr('content') ||
    $('time[datetime]').first().attr('datetime') ||
    $('meta[name="date"]').attr('content')
  const publishedAt = parseDate(rawDate)

  // Extract body text
  const paragraphs: string[] = []
  $(bodySelector).each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 30) paragraphs.push(text)
  })

  return {
    title,
    content: paragraphs.join('\n\n'),
    publishedAt,
  }
}

// ── Main entry: crawl one site ────────────────────────────────────────────────

export async function crawlSite(config: SiteConfig): Promise<RawItem[]> {
  // RSS path
  if (config.rssUrl) {
    try {
      const items = await parseRss(config.rssUrl, config)
      if (items.length > 0) {
        // Enrich: fetch full body for each item
        const enriched: RawItem[] = []
        for (const item of items) {
          await sleep(800)
          try {
            const { content, publishedAt } = await fetchArticleContent(
              item.url,
              config.bodySelector,
            )
            enriched.push({ ...item, content: content || undefined, publishedAt: item.publishedAt ?? publishedAt })
          } catch {
            enriched.push(item)
          }
        }
        return enriched
      }
    } catch (err) {
      console.warn(`[Crawler] RSS failed for ${config.name}, falling back to HTML: ${err}`)
    }
  }

  // HTML scrape fallback
  const links = await scrapeArticleList(config)
  const items: RawItem[] = []

  for (const url of links.slice(0, config.maxArticles)) {
    await sleep(1000)
    try {
      const { title, content, publishedAt } = await fetchArticleContent(url, config.bodySelector)
      if (!title) continue
      const summary = content.split('\n\n')[0]?.slice(0, 400) || title
      items.push({
        title,
        summary,
        content: content || undefined,
        url,
        sourceName: config.displayName,
        publishedAt,
      })
    } catch (err) {
      console.warn(`[Crawler] Failed to scrape ${url}: ${err}`)
    }
  }

  return items
}
