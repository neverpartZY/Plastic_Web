import { Suspense } from 'react'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import IntelligencePageClient from '@/components/intelligence/IntelligencePageClient'
import ScrollRestorer from '@/components/ScrollRestorer'
import { KEYWORD_MATRIX } from '@/lib/intelligence/keywords'
import { isValidLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import type { Metadata } from 'next'
import type { Locale } from '@/i18n/config'
import type { IntelligencePageDictionary } from '@/i18n/types'

export const metadata: Metadata = {
  title: '情报中心 — SustainPlastics Hub',
}

const PAGE_SIZE = 20

interface Props {
  searchParams: { pillar?: string; country?: string; hot?: string; tab?: string; page?: string }
}

function href(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) q.set(k, v)
  }
  const s = q.toString()
  return '/intelligence' + (s ? '?' + s : '')
}

async function getIntelligence(
  pillar: string,
  country: string,
  hotOnly: boolean,
  tab: 'highlights' | 'all',
  page: number,
) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const where: Record<string, unknown> = {}
  if (pillar)  where.pillars     = { contains: pillar }
  if (country) where.countryCode = country
  if (hotOnly) where.isHot       = true

  // highlights：昨天 UTC 零点至今 + importance≥3（日历日，与 cron 一致，无空窗）
  if (tab === 'highlights') {
    const now = new Date()
    where.publishedAt = { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)) }
    where.importance  = { gte: 3 }
  }

  const [totalCount, items] = await Promise.all([
    prisma.intelligence.count({ where }),
    tab === 'all'
      ? prisma.intelligence.findMany({
          where,
          orderBy: [{ publishedAt: 'desc' }, { importance: 'desc' }],
          skip:    (page - 1) * PAGE_SIZE,
          take:    PAGE_SIZE,
        })
      : prisma.intelligence.findMany({
          where,
          orderBy: [{ publishedAt: 'desc' }, { isHot: 'desc' }, { importance: 'desc' }],
          take: 24,
        }),
  ])

  return {
    items:      items.map(i => ({ ...i, publishedAt: i.publishedAt.toISOString(), companies: [] as never[] })),
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  }
}

export default async function IntelligencePage({ searchParams }: Props) {
  const pillar  = searchParams.pillar  ?? ''
  const country = searchParams.country ?? ''
  const hotOnly = searchParams.hot === 'true'
  const tab     = searchParams.tab === 'all' ? 'all' : 'highlights'
  const page    = Math.max(1, parseInt(searchParams.page ?? '1'))

  const headersList = headers()
  const lang = (headersList.get('x-lng') as 'zh' | 'en') ?? 'zh'
  const locale: Locale = isValidLocale(lang) ? lang : 'zh'
  const dict = await getDictionary(locale)
  const i18n = dict.pages.intelligence

  const { items, totalCount, totalPages } = await getIntelligence(pillar, country, hotOnly, tab, page)
  const hotCount = items.filter(i => i.isHot).length

  // 始终查询 highlights 真实数量（昨天 UTC 零点至今 + importance≥3 + 相同筛选条件）
  const now = new Date()
  const highlightsWhere: Record<string, unknown> = {
    publishedAt: { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)) },
    importance:  { gte: 3 },
  }
  if (pillar)  highlightsWhere.pillars     = { contains: pillar }
  if (country) highlightsWhere.countryCode = country
  if (hotOnly) highlightsWhere.isHot       = true
  const highlightsCount = await prisma.intelligence.count({ where: highlightsWhere })

  // Build localized pillar & country filter arrays
  const PILLARS = [
    { value: '', label: i18n.allDimensions },
    ...KEYWORD_MATRIX.map(d => ({ value: d.dimension, label: lang === 'en' ? d.labelEn : d.labelZh })),
  ]
  const COUNTRIES = [
    { value: '', label: i18n.allRegions },
    { value: 'CN',     label: i18n.countries.CN },
    { value: 'EU',     label: i18n.countries.EU },
    { value: 'US',     label: i18n.countries.US },
    { value: 'UK',     label: i18n.countries.UK },
    { value: 'GLOBAL', label: i18n.countries.GLOBAL },
  ]

  // Shared filter params (without tab/page) — used to build all hrefs
  const f = {
    pillar:  pillar  || undefined,
    country: country || undefined,
    hot:     hotOnly ? 'true' : undefined,
  }
  const t = tab === 'all' ? 'all' : undefined

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Suspense fallback={null}><ScrollRestorer /></Suspense>

      {/* ── Header ── */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-1 h-5 bg-emerald-500 rounded-full" />
                <span className="text-xs text-gray-400 uppercase tracking-widest">Intelligence Center</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{i18n.headerTitle}</h1>
              <p className="text-sm text-gray-500 mt-1">{i18n.headerSubtitle}</p>
            </div>
            {hotCount > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <span className="text-rose-500 text-sm">🔥</span>
                <span className="text-sm font-medium text-rose-600">{i18n.hotCount.replace('{n}', String(hotCount))}</span>
              </div>
            )}
          </div>

          {/* ── Filter bar ── */}
          <div className="mt-6 flex flex-wrap gap-3">
            {/* Pillar chips */}
            <div className="flex flex-wrap gap-1.5">
              {PILLARS.map((p) => (
                <a
                  key={p.value}
                  href={href({ ...f, pillar: p.value || undefined, tab: t })}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    pillar === p.value
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {p.label}
                </a>
              ))}
            </div>

            <div className="w-px bg-gray-200 self-stretch" />

            {/* Country chips */}
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map((c) => (
                <a
                  key={c.value}
                  href={href({ ...f, country: c.value || undefined, tab: t })}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    country === c.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {c.label}
                </a>
              ))}
            </div>

            {/* Hot toggle */}
            <a
              href={href({ ...f, hot: hotOnly ? undefined : 'true', tab: t })}
              className={`ml-auto px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                hotOnly
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300 hover:text-rose-500'
              }`}
            >
              {i18n.hotOnly}
            </a>
          </div>
        </div>
      </div>

      {/* ── Content (client handles tabs + cards + pagination) ── */}
      <IntelligencePageClient
        items={items as Parameters<typeof IntelligencePageClient>[0]['items']}
        hotCount={hotCount}
        highlightsCount={highlightsCount}
        lang={lang}
        tab={tab}
        page={page}
        totalPages={totalPages}
        tabHighlightsHref={href(f)}
        tabAllHref={href({ ...f, tab: 'all' })}
        prevPageHref={tab === 'all' && page > 1        ? href({ ...f, tab: 'all', page: String(page - 1) }) : null}
        nextPageHref={tab === 'all' && page < totalPages ? href({ ...f, tab: 'all', page: String(page + 1) }) : null}
        dict={i18n}
      />
    </div>
  )
}
