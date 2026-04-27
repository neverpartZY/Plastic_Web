// POST /api/crawler/trigger
// 由 Vercel Cron / 外部调度器调用，根据优先级决定本次采集哪些源
// Cron 设置 (vercel.json):
//   P0: "0 * * * *"        每小时
//   P1: "0 0,8,16 * * *"   每8小时
//   P2: "0 2 * * *"        每天凌晨2点
//   P3: "0 3 * * 1"        每周一

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { classifyIntelligence } from '@/lib/intelligence/classifier'
import { translateIntelligence } from '@/lib/intelligence/translator'

// 内部调度鉴权 — 生产环境替换为实际 secret
const CRON_SECRET = process.env.CRON_SECRET ?? 'dev-secret'

// 各优先级对应的最小间隔（分钟）
const PRIORITY_INTERVAL: Record<string, number> = {
  p0: 60,
  p1: 480,
  p2: 1440,
  p3: 10080,
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { priority = 'p0' } = await req.json().catch(() => ({}))
  const intervalMinutes = PRIORITY_INTERVAL[priority] ?? 60

  const cutoff = new Date(Date.now() - intervalMinutes * 60 * 1000)

  // 取出到期需要采集的源
  const sources = await prisma.crawlSource.findMany({
    where: {
      priority,
      status: 'active',
      OR: [
        { lastCrawledAt: null },
        { lastCrawledAt: { lt: cutoff } },
      ],
    },
    take: 10, // 单次批量上限，防止超时
  })

  const results = await Promise.allSettled(
    sources.map((source) => processCrawlSource(source.id, source.url, source.lang as 'zh' | 'en'))
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({
    priority,
    sourcesProcessed: sources.length,
    succeeded,
    failed,
  })
}

async function processCrawlSource(
  sourceId: string,
  url: string,
  lang: 'zh' | 'en'
) {
  try {
    // ── 1. 抓取内容 ───────────────────────────────────────────────────────────
    // 实际项目中替换为 Cheerio/Playwright 抓取逻辑
    // 此处为结构示意，返回标准化的 RawItem[]
    const rawItems = await fetchFromSource(url, lang)

    for (const item of rawItems) {
      // ── 2. 去重检查 ─────────────────────────────────────────────────────────
      const exists = await prisma.intelligence.findFirst({
        where: { sourceUrl: item.url },
        select: { id: true },
      })
      if (exists) continue

      // ── 3. AI 分类 ──────────────────────────────────────────────────────────
      const classification = await classifyIntelligence(item.title, item.summary, lang)

      // ── 4. 双向翻译 ─────────────────────────────────────────────────────────
      const translation = await translateIntelligence(item.title, item.summary, lang)

      // ── 5. 写入数据库 ────────────────────────────────────────────────────────
      const intel = await prisma.intelligence.create({
        data: {
          title: item.title,
          summary: item.summary,
          content: item.content ?? '',
          category: classification.category,
          pillars: classification.pillars.join(','),
          countryCode: classification.countryCode,
          importance: classification.importance,
          isHot: classification.isHot,
          source: item.sourceName,
          sourceUrl: item.url,
          crawlSourceId: sourceId,
          titleZh: translation.titleZh ?? null,
          titleEn: translation.titleEn ?? null,
          summaryZh: translation.summaryZh ?? null,
          summaryEn: translation.summaryEn ?? null,
          translateStatus: 'translated',
          publishedAt: item.publishedAt ?? new Date(),
        },
      })

      // ── 6. 关联企业推荐 ──────────────────────────────────────────────────────
      await linkRelevantCompanies(intel.id, classification.pillars)
    }

    await prisma.crawlSource.update({
      where: { id: sourceId },
      data: { lastCrawledAt: new Date(), crawlCount: { increment: 1 } },
    })
  } catch (err) {
    await prisma.crawlSource.update({
      where: { id: sourceId },
      data: { errorCount: { increment: 1 } },
    })
    throw err
  }
}

// pillar → Company.entityType 映射
const PILLAR_TO_ENTITY: Record<string, string[]> = {
  molds: ['mold'],
  molding: ['process'],
  materials: ['material'],
  additives: ['additive'],
  auxiliaries: ['auxiliary'],
  recycling: ['material', 'equipment'],
  reuse: ['material', 'packaging'],
}

async function linkRelevantCompanies(intelligenceId: string, pillars: string[]) {
  const entityTypes = pillars.flatMap((p) => PILLAR_TO_ENTITY[p] ?? [])
  if (entityTypes.length === 0) return

  const companies = await prisma.company.findMany({
    where: {
      entityType: { in: entityTypes },
      isVerified: true,
    },
    take: 5,
    orderBy: { isPremium: 'desc' },
    select: { id: true },
  })

  if (companies.length === 0) return

  await prisma.intelligenceCompany.createMany({
    data: companies.map((c) => ({
      intelligenceId,
      companyId: c.id,
      relevanceScore: 0.7,
    })),
    skipDuplicates: true,
  })
}

// ── 占位抓取函数 ─────────────────────────────────────────────────────────────
// 实际替换为 Cheerio/Playwright 实现，每个 CrawlSource 可配置 selector 规则
interface RawItem {
  title: string
  summary: string
  content?: string
  url: string
  sourceName: string
  publishedAt?: Date
}

async function fetchFromSource(url: string, _lang: 'zh' | 'en'): Promise<RawItem[]> {
  // TODO: 实现真实的 HTTP 抓取 + HTML 解析
  // 示例结构，生产中替换为 Cheerio/Playwright 逻辑
  console.log(`[Crawler] Fetching: ${url}`)
  return []
}
