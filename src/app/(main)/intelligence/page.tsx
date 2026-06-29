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
  searchParams: { pillar?: string; country?: string; hot?: string; tab?: string; page?: string; q?: string }
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
  q: string,
) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const where: Record<string, unknown> = {}
  if (pillar)  where.pillars     = { contains: pillar }
  if (country) where.countryCode = country
  if (hotOnly) where.isHot       = true
  if (q)       where.OR          = [{ title: { contains: q } }, { titleZh: { contains: q } }, { summary: { contains: q } }]

  // highlights：昨天 UTC 零点至今，不设重要性门槛
  if (tab === 'highlights') {
    const now = new Date()
    where.publishedAt = { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)) }
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
  const q       = searchParams.q ?? ''

  const headersList = headers()
  const lang = (headersList.get('x-lng') as 'zh' | 'en') ?? 'zh'
  const locale: Locale = isValidLocale(lang) ? lang : 'zh'
  const dict = await getDictionary(locale)
  const i18n = dict.pages.intelligence

  const { items, totalCount, totalPages } = await getIntelligence(pillar, country, hotOnly, tab, page, q)
  const hotCount = items.filter(i => i.isHot).length

  // 始终查询 highlights 真实数量（昨天 UTC 零点至今 + importance≥3 + 相同筛选条件）
  const now = new Date()
  const highlightsWhere: Record<string, unknown> = {
    publishedAt: { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)) },
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
    q:       q || undefined,
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
              <p className="text-sm text-gray-500 mt-1">
                {q ? `搜索"${q}" · ${totalCount} 条结果` : i18n.headerSubtitle}
              </p>

              {/* ── Inline search bar ── */}
              <form action="/intelligence" method="GET" className="mt-4 flex items-center gap-2 max-w-lg">
                <input type="hidden" name="tab" value="all" />
                <div className="relative flex-1">
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder="搜索资讯标题、摘要关键词..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  {q && (
                    <a href={href({ ...f, q: undefined, tab: 'all' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </a>
                  )}
                </div>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
                  搜索
                </button>
              </form>
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
