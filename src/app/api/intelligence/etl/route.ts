/**
 * ETL 转换服务
 * 清洗层：使用 cheerio 提取正文，剔除导航栏和脚本
 * AI 增强层：调用统一 LLM 层，返回严格 JSON 格式
 * 去重写入：urlHash 唯一索引，已存在则更新 updatedAt 并记录版本
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { z } from 'zod'
import { load } from 'cheerio'
import { prisma } from '@/lib/prisma'
import { callLLM } from '@/lib/intelligence/llm'
import { isNegative, inferDimensions, type Dimension } from '@/lib/intelligence/keywords'

// ── 类型定义 ──────────────────────────────────────────────────────────────────

interface ETLError {
  stage: 'html_clean' | 'filter' | 'classify' | 'dedup' | 'write'
  message: string
  detail?: string
}

interface ETLResult {
  success: boolean
  intelligenceId?: string
  isUpdate?: boolean
  error?: ETLError
}

interface AIGenerated {
  dimension: Dimension | 'recycling'
  region: 'CN' | 'EU' | 'US' | 'UK' | 'GLOBAL'
  importance: number
  summary: string
  translatedTitle: string
  tags: string[]
}

// ── 请求体验证 ────────────────────────────────────────────────────────────────

const ETLRequestSchema = z.object({
  url:       z.string().url(),
  html:      z.string().min(100),
  source:    z.string().min(1),
  sourceUrl: z.string().url().optional(),
  lang:      z.enum(['zh', 'en']).default('en'),
  title:     z.string().optional(),
})

// ── HTML 清洗层 ────────────────────────────────────────────────────────────────

function cleanHtml(html: string): string {
  const $ = load(html)

  $(
    'script, style, nav, header, footer, aside, .sidebar, .advertisement, .ad,' +
    '.promo, [role="navigation"], .nav, .menu, .footer, .header, .cookie-banner,' +
    '.newsletter, .subscription, .related-articles, .outbrain, .taboola, #comments',
  ).remove()

  $('[hidden], [aria-hidden="true"], .hidden, .visually-hidden, .display-none').remove()

  const articleSelectors = [
    'article', '[role="main"]', 'main', '.article-body', '.article-content',
    '.post-content', '.entry-content', '.story-body', '.news-body', '#content', '.content',
  ]

  let bestSection = ''
  let maxLen = 0

  for (const sel of articleSelectors) {
    const el = $(sel)
    if (el.length) {
      const text = el.text().trim()
      if (text.length > maxLen) {
        maxLen = text.length
        bestSection = sel
      }
    }
  }

  const $body = bestSection ? $(bestSection) : $('body')

  const blocks: string[] = []
  $body.find('h1, h2, h3, h4, h5, p, li, blockquote').each((_, el) => {
    const text = $(el).text().trim()
    const minLen = el.tagName === 'li' || el.tagName === 'blockquote' ? 30 : 50
    if (text.length > minLen) {
      blocks.push(text)
    }
  })

  return blocks.join('\n\n')
}

// ── 标题提取 ──────────────────────────────────────────────────────────────────

function extractTitle($: ReturnType<typeof load>): string {
  return (
    $('h1').first().text().trim() ||
    $('article h1').first().text().trim() ||
    $('title').first().text().trim().split(/[|\-–—]/).slice(0, 2).join(' ').trim() ||
    'Untitled'
  )
}

// ── URL Hash ──────────────────────────────────────────────────────────────────

function generateUrlHash(url: string): string {
  return createHash('sha256').update(url.trim().toLowerCase()).digest('hex').slice(0, 32)
}

// ── AI 增强层（带 Retry）───────────────────────────────────────────────────────

const ENHANCE_SYSTEM = `You are a senior analyst for the plastics circular economy industry.
Analyze the article and return ONLY valid JSON with no extra text:
{"dimension":"recycling","region":"GLOBAL","importance":3,"summary":"...","translatedTitle":"...","tags":[]}

dimension (choose 1 most relevant): molds|molding|materials|additives|auxiliaries|recycling|reuse
- molds: mold tooling, injection/blow molds, die design
- molding: injection/extrusion/blow molding, processing equipment
- materials: PCR, rPET, rPP, rPE, bio-based polymers, recycled compounds
- additives: plasticizers, stabilizers, flame retardants, antioxidants
- auxiliaries: masterbatches, functional films, packaging auxiliaries
- recycling: mechanical/chemical recycling, waste plastic, bottle flake prices
- reuse: reusable packaging, refill systems, deposit schemes, PPWR

region (choose 1): CN|EU|US|UK|GLOBAL
importance 1-5 (5=breaking/critical news about regulations, major deals, tech breakthroughs)
summary: 80-150 Chinese characters summarizing the key point
translatedTitle: if input is English, translate to Chinese; if already Chinese, translate to English
tags: up to 3 short English keywords (e.g. ["rPET","CBAM","chemical recycling"])`

async function enhanceWithAI(
  title: string,
  content: string,
  lang: 'zh' | 'en',
  maxRetries = 3,
): Promise<AIGenerated> {
  const userPrompt = `Title: ${title}\n\nContent:\n${content.slice(0, 2500)}`

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const raw = await callLLM(ENHANCE_SYSTEM, userPrompt, 300)
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No JSON in LLM response: ' + raw.slice(0, 80))

      const parsed = JSON.parse(match[0])
      const validDimensions: Dimension[] = [
        'molds', 'molding', 'materials', 'additives', 'auxiliaries', 'recycling', 'reuse',
      ]
      const inferred = inferDimensions(content)

      return {
        dimension: validDimensions.includes(parsed.dimension as Dimension)
          ? (parsed.dimension as Dimension)
          : (inferred[0] ?? 'recycling'),
        region: ['CN', 'EU', 'US', 'UK', 'GLOBAL'].includes(parsed.region)
          ? parsed.region
          : 'GLOBAL',
        importance: Math.min(5, Math.max(1, Number(parsed.importance) || 3)),
        summary: String(parsed.summary ?? '').slice(0, 300),
        translatedTitle: String(parsed.translatedTitle ?? title).slice(0, 200),
        tags: Array.isArray(parsed.tags)
          ? parsed.tags.slice(0, 3).map((t: unknown) => String(t))
          : [],
      }
    } catch (e: unknown) {
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
      }
    }
  }

  const inferred = inferDimensions(content)
  return {
    dimension: inferred[0] ?? 'recycling',
    region: 'GLOBAL',
    importance: 3,
    summary: content.slice(0, 200),
    translatedTitle: title,
    tags: [],
  }
}

// ── 写入数据库 ────────────────────────────────────────────────────────────────

async function writeIntelligence(
  urlHash: string,
  data: {
    title: string
    summary: string
    content: string
    dimension: string
    region: string
    importance: number
    tags: string[]
    source: string
    sourceUrl: string
    lang: 'zh' | 'en'
    translatedTitle?: string
    pillars?: string
  },
): Promise<ETLResult> {
  const existing = await prisma.intelligence.findUnique({
    where: { urlHash },
    select: { id: true, version: true, updatedAt: true },
  })

  if (existing) {
    await prisma.intelligence.update({
      where: { id: existing.id },
      data: { updatedAt: new Date() },
    })
    return { success: true, intelligenceId: existing.id, isUpdate: true }
  }

  const created = await prisma.intelligence.create({
    data: {
      urlHash,
      title: data.title,
      summary: data.summary,
      content: data.content,
      category: data.dimension,
      dimension: data.dimension,
      region: data.region,
      importance: data.importance,
      tags: data.tags,
      source: data.source,
      sourceUrl: data.sourceUrl,
      lang: data.lang,
      translatedTitle: data.translatedTitle,
      pillars: data.pillars,
      version: 1,
      translateStatus: 'pending',
    },
  })

  await prisma.intelligenceVersion.create({
    data: {
      intelligenceId: created.id,
      version: 1,
      title: created.title,
      summary: created.summary,
      content: created.content,
      dimension: created.dimension,
      region: created.region,
      importance: created.importance,
      tags: created.tags,
    },
  })

  return { success: true, intelligenceId: created.id, isUpdate: false }
}

// ── POST: 接收原始 HTML，执行完整 ETL ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ETLRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            stage: 'validation',
            message: 'Invalid request',
            detail: parsed.error.message,
          },
        },
        { status: 422 },
      )
    }

    const { url, html, source, sourceUrl, lang, title: providedTitle } = parsed.data

    // 1. HTML 清洗
    let cleanedContent: string
    try {
      cleanedContent = cleanHtml(html)
      if (cleanedContent.length < 100) {
        throw new Error('Cleaned content too short')
      }
    } catch (e: unknown) {
      return NextResponse.json(
        { success: false, error: { stage: 'html_clean', message: String(e) } },
        { status: 422 },
      )
    }

    // 2. 垃圾过滤
    if (isNegative(cleanedContent)) {
      return NextResponse.json(
        { success: false, error: { stage: 'filter', message: 'Negative content detected' } },
        { status: 422 },
      )
    }

    // 3. 提取标题
    const $ = load(html)
    const title = providedTitle || extractTitle($)

    // 4. AI 增强（带 Retry）
    let enhanced: AIGenerated
    try {
      enhanced = await enhanceWithAI(title, cleanedContent, lang)
    } catch (e: unknown) {
      return NextResponse.json(
        { success: false, error: { stage: 'classify', message: String(e) } },
        { status: 422 },
      )
    }

    // 5. 去重 + 写入
    const urlHash = generateUrlHash(url)
    const result = await writeIntelligence(urlHash, {
      title,
      summary: enhanced.summary,
      content: cleanedContent,
      dimension: enhanced.dimension,
      region: enhanced.region,
      importance: enhanced.importance,
      tags: enhanced.tags,
      source,
      sourceUrl: sourceUrl ?? url,
      lang,
      translatedTitle: enhanced.translatedTitle,
      pillars: enhanced.dimension,
    })

    return NextResponse.json(result, { status: result.success ? 201 : 500 })

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      { success: false, error: { stage: 'write', message } },
      { status: 500 },
    )
  }
}

// ── PUT: 重新 ETL 已有情报 ────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const { intelligenceId } = await req.json()

    if (!intelligenceId) {
      return NextResponse.json({ error: 'intelligenceId required' }, { status: 400 })
    }

    const intel = await prisma.intelligence.findUnique({
      where: { id: intelligenceId },
      select: { id: true, title: true, content: true, lang: true },
    })

    if (!intel) {
      return NextResponse.json({ error: 'Intelligence not found' }, { status: 404 })
    }

    const enhanced = await enhanceWithAI(
      intel.title,
      intel.content || intel.title,
      intel.lang as 'zh' | 'en',
    )

    const updated = await prisma.intelligence.update({
      where: { id: intelligenceId },
      data: {
        dimension: enhanced.dimension,
        region: enhanced.region,
        importance: enhanced.importance,
        tags: enhanced.tags,
        translatedTitle: enhanced.translatedTitle,
        summary: enhanced.summary,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, intelligence: updated })

  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
