import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import IntelligenceCard from '@/components/intelligence/IntelligenceCard'
import ScrollRestorer from '@/components/ScrollRestorer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '每日情报 — SustainPlastics Hub',
}

export const revalidate = 60

const PILLARS = [
  { value: '', labelZh: '全部维度', labelEn: 'All Pillars' },
  { value: 'molds', labelZh: '模具', labelEn: 'Molds' },
  { value: 'molding', labelZh: '成型', labelEn: 'Molding' },
  { value: 'materials', labelZh: '材料', labelEn: 'Materials' },
  { value: 'additives', labelZh: '助剂', labelEn: 'Additives' },
  { value: 'auxiliaries', labelZh: '辅料', labelEn: 'Auxiliaries' },
  { value: 'recycling', labelZh: '回收再生', labelEn: 'Recycling' },
  { value: 'reuse', labelZh: '重复使用', labelEn: 'Reuse' },
]

const COUNTRIES = [
  { value: '', labelZh: '全部地区' },
  { value: 'CN', labelZh: '🇨🇳 中国' },
  { value: 'EU', labelZh: '🇪🇺 欧盟' },
  { value: 'US', labelZh: '🇺🇸 美国' },
  { value: 'UK', labelZh: '🇬🇧 英国' },
  { value: 'GLOBAL', labelZh: '🌐 全球' },
]

interface Props {
  searchParams: { pillar?: string; country?: string; hot?: string }
}

async function getIntelligence(pillar?: string, country?: string, hotOnly?: boolean) {
  const where: any = {}
  if (pillar) where.pillars = { contains: pillar }
  if (country) where.countryCode = country
  if (hotOnly) where.isHot = true

  const items = await prisma.intelligence.findMany({
    where,
    orderBy: [
      { isHot: 'desc' },
      { importance: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 24,
  })

  return items.map((item) => ({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    companies: [],
  }))
}

export default async function IntelligencePage({ searchParams }: Props) {
  const pillar = searchParams.pillar ?? ''
  const country = searchParams.country ?? ''
  const hotOnly = searchParams.hot === 'true'

  const items = await getIntelligence(pillar || undefined, country || undefined, hotOnly)
  const hotCount = items.filter((i) => i.isHot).length

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
                <span className="text-xs text-gray-400 uppercase tracking-widest">Daily Intelligence</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">每日情报</h1>
              <p className="text-sm text-gray-500 mt-1">
                覆盖7大战略维度 · 实时采集全球21个核心信息源
              </p>
            </div>
            {hotCount > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <span className="text-rose-500 text-sm">🔥</span>
                <span className="text-sm font-medium text-rose-600">{hotCount} 条热点</span>
              </div>
            )}
          </div>

          {/* ── Filter bar ── */}
          <div className="mt-6 flex flex-wrap gap-3">
            {/* Pillar filter */}
            <div className="flex flex-wrap gap-1.5">
              {PILLARS.map((p) => (
                <a
                  key={p.value}
                  href={`/intelligence?pillar=${p.value}&country=${country}${hotOnly ? '&hot=true' : ''}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    pillar === p.value
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {p.labelZh}
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* Country filter */}
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map((c) => (
                <a
                  key={c.value}
                  href={`/intelligence?pillar=${pillar}&country=${c.value}${hotOnly ? '&hot=true' : ''}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    country === c.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {c.labelZh}
                </a>
              ))}
            </div>

            {/* Hot toggle */}
            <a
              href={`/intelligence?pillar=${pillar}&country=${country}${hotOnly ? '' : '&hot=true'}`}
              className={`ml-auto px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                hotOnly
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300 hover:text-rose-500'
              }`}
            >
              🔥 仅看热点
            </a>
          </div>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div className="container py-8">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            暂无符合条件的情报
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">共 {items.length} 条情报</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <IntelligenceCard key={item.id} item={item} lang="zh" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
