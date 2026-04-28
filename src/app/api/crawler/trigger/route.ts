// GET /api/crawler/trigger?priority=p0&secret=...
// POST /api/crawler/trigger  { priority, secret }
// Vercel Cron calls GET with Authorization: Bearer CRON_SECRET

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { classifyIntelligence } from '@/lib/intelligence/classifier'
import { translateIntelligence, generateTldr, translateContent } from '@/lib/intelligence/translator'
import { crawlSite } from '@/lib/intelligence/crawler'
import { getSiteConfig } from '@/lib/intelligence/sources'

export const maxDuration = 60

const CRON_SECRET = process.env.CRON_SECRET ?? 'dev-secret'

const PRIORITY_INTERVAL: Record<string, number> = {
  p0: 60,
  p1: 480,
  p2: 1440,
  p3: 10080,
}

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${CRON_SECRET}`) return true
  const url = new URL(req.url)
  return url.searchParams.get('secret') === CRON_SECRET
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const priority = new URL(req.url).searchParams.get('priority') ?? 'p0'
  return runCrawl(priority)
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { priority = 'p0' } = await req.json().catch(() => ({}))
  return runCrawl(priority)
}

async function runCrawl(priority: string) {
  const intervalMinutes = PRIORITY_INTERVAL[priority] ?? 60
  const cutoff = new Date(Date.now() - intervalMinutes * 60 * 1000)

  const sources = await prisma.crawlSource.findMany({
    where: {
      priority,
      status: 'active',
      OR: [{ lastCrawledAt: null }, { lastCrawledAt: { lt: cutoff } }],
    },
    take: 10,
  })

  const results = await Promise.allSettled(
    sources.map((source) =>
      processCrawlSource(source.id, source.name, source.lang as 'zh' | 'en')
    )
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed    = results.filter((r) => r.status === 'rejected').length

  if (succeeded > 0) revalidatePath('/intelligence')

  return NextResponse.json({ priority, sourcesProcessed: sources.length, succeeded, failed })
}

async function processCrawlSource(sourceId: string, sourceName: string, lang: 'zh' | 'en') {
  const config = getSiteConfig(sourceName)
  if (!config) throw new Error(`No config found for source: ${sourceName}`)

  try {
    const rawItems = await crawlSite(config)

    for (const item of rawItems) {
      const exists = await prisma.intelligence.findFirst({
        where: { sourceUrl: item.url },
        select: { id: true },
      })
      if (exists) continue

      const [classification, translation] = await Promise.all([
        classifyIntelligence(item.title, item.summary, lang),
        translateIntelligence(item.title, item.summary, lang),
      ])

      const bodyForTldr = item.content ?? item.summary
      const [tldr, contentZh] = await Promise.all([
        generateTldr(item.title, bodyForTldr, lang).catch(() => ({ tldrZh: null, tldrEn: null })),
        lang === 'en' && item.content
          ? translateContent(translation.titleZh ?? item.title, item.content).catch(() => null)
          : Promise.resolve(null),
      ])

      const intel = await prisma.intelligence.create({
        data: {
          title:           item.title,
          summary:         item.summary,
          content:         item.content ?? '',
          category:        classification.category,
          pillars:         classification.pillars.join(','),
          countryCode:     classification.countryCode,
          importance:      classification.importance,
          isHot:           classification.isHot,
          source:          item.sourceName,
          sourceUrl:       item.url,
          crawlSourceId:   sourceId,
          titleZh:         translation.titleZh ?? null,
          titleEn:         translation.titleEn ?? null,
          summaryZh:       translation.summaryZh ?? null,
          summaryEn:       translation.summaryEn ?? null,
          tldrZh:          tldr.tldrZh,
          tldrEn:          tldr.tldrEn,
          contentZh:       contentZh ?? null,
          translateStatus: 'translated',
          publishedAt:     item.publishedAt ?? new Date(),
        },
      })

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

const PILLAR_TO_ENTITY: Record<string, string[]> = {
  molds:       ['mold'],
  molding:     ['process'],
  materials:   ['material'],
  additives:   ['additive'],
  auxiliaries: ['auxiliary'],
  recycling:   ['material', 'equipment'],
  reuse:       ['material', 'packaging'],
}

async function linkRelevantCompanies(intelligenceId: string, pillars: string[]) {
  const entityTypes = pillars.flatMap((p) => PILLAR_TO_ENTITY[p] ?? [])
  if (entityTypes.length === 0) return

  const companies = await prisma.company.findMany({
    where: { entityType: { in: entityTypes }, isVerified: true },
    take: 5,
    orderBy: { isPremium: 'desc' },
    select: { id: true },
  })

  if (companies.length === 0) return

  await prisma.intelligenceCompany.createMany({
    data: companies.map((c) => ({
      intelligenceId,
      companyId:       c.id,
      relevanceScore:  0.7,
    })),
    skipDuplicates: true,
  })
}
