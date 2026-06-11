'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Globe, Flame, Lock, ChevronRight, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type Pillar =
  | 'molds'
  | 'molding'
  | 'recycled'
  | 'bio'
  | 'additives'
  | 'auxiliaries'
  | 'recycling'
  | 'reuse'

export interface IntelligenceItem {
  id: string
  titleZh: string | null
  titleEn: string | null
  summaryZh: string | null
  summaryEn: string | null
  title: string
  summary: string
  pillars: string | null
  category: string
  countryCode: string | null
  importance: number
  isHot: boolean
  isPremium: boolean
  source: string | null
  publishedAt: string
  companies?: Array<{
    id: string
    name: string
    slug: string
    entityType: string
  }>
}

interface Props {
  item: IntelligenceItem
  lang?: 'zh' | 'en'
  className?: string
  onDimensionSubscribe?: (dimension: Pillar) => void
}

// ── Config ────────────────────────────────────────────────────────────────────

const PILLAR_CONFIG: Record<Pillar, { labelZh: string; labelEn: string; color: string }> = {
  molds:       { labelZh: '模具',     labelEn: 'Molds',       color: 'bg-slate-100 text-slate-700 border-slate-200' },
  molding:     { labelZh: '成型',     labelEn: 'Molding',     color: 'bg-blue-50 text-blue-700 border-blue-200' },
  recycled:    { labelZh: '再生塑料', labelEn: 'Recycled',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  bio:         { labelZh: '生物基',   labelEn: 'Bio-based',   color: 'bg-teal-50 text-teal-700 border-teal-200' },
  additives:   { labelZh: '助剂',     labelEn: 'Additives',   color: 'bg-purple-50 text-purple-700 border-purple-200' },
  auxiliaries: { labelZh: '辅料',     labelEn: 'Auxiliaries', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  recycling:   { labelZh: '回收再生', labelEn: 'Recycling',   color: 'bg-green-50 text-green-700 border-green-200' },
  reuse:       { labelZh: '重复使用', labelEn: 'Reuse',      color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const COUNTRY_CONFIG: Record<string, { flag: string; labelZh: string; labelEn: string }> = {
  CN:     { flag: '🇨🇳', labelZh: '中国',  labelEn: 'China' },
  EU:     { flag: '🇪🇺', labelZh: '欧盟',  labelEn: 'EU' },
  US:     { flag: '🇺🇸', labelZh: '美国',  labelEn: 'US' },
  UK:     { flag: '🇬🇧', labelZh: '英国',  labelEn: 'UK' },
  GLOBAL: { flag: '🌐',  labelZh: '全球',  labelEn: 'Global' },
}

const CATEGORY_CONFIG: Record<string, { labelZh: string; labelEn: string }> = {
  policy:     { labelZh: '政策法规', labelEn: 'Policy' },
  market:     { labelZh: '市场行情', labelEn: 'Market' },
  tech:       { labelZh: '技术创新', labelEn: 'Tech' },
  enterprise: { labelZh: '企业动态', labelEn: 'Enterprise' },
  global:     { labelZh: '国际视野', labelEn: 'Global' },
}

function categoryLabel(category: string, lang: 'zh' | 'en'): string {
  const direct = CATEGORY_CONFIG[category]
  if (direct) return lang === 'zh' ? direct.labelZh : direct.labelEn
  const byZh = Object.values(CATEGORY_CONFIG).find(c => c.labelZh === category)
  if (byZh) return lang === 'zh' ? byZh.labelZh : byZh.labelEn
  return category
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ImportanceStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Importance ${level} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'text-[10px]',
            i < level ? 'text-amber-400' : 'text-gray-200'
          )}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function PillarBadge({ pillar, lang, onClick }: { pillar: Pillar; lang: 'zh' | 'en'; onClick?: () => void }) {
  const config = PILLAR_CONFIG[pillar]
  if (!config) return null
  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border',
        config.color,
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity'
      )}
      title={onClick ? `订阅${config.labelZh}情报` : undefined}
    >
      {lang === 'zh' ? config.labelZh : config.labelEn}
    </span>
  )
}

function CompanyRecommendations({
  companies,
  lang,
}: {
  companies: NonNullable<IntelligenceItem['companies']>
  lang: 'zh' | 'en'
}) {
  if (companies.length === 0) return null
  const label = lang === 'zh' ? '相关企业' : 'Related Companies'
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {companies.map((c) => (
          <Link
            key={c.id}
            href={`/explore?company=${c.slug}`}
            className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IntelligenceCard({ item, lang: siteLang = 'zh', className, onDimensionSubscribe }: Props) {
  const [cardLang, setCardLang] = useState<'zh' | 'en'>(siteLang)
  useEffect(() => { setCardLang(siteLang) }, [siteLang])

  const pillars = (item.pillars ?? '').split(',').filter(Boolean) as Pillar[]
  const country = COUNTRY_CONFIG[item.countryCode ?? 'GLOBAL'] ?? COUNTRY_CONFIG.GLOBAL
  const catLabel = categoryLabel(item.category, cardLang)

  const title = cardLang === 'zh' ? (item.titleZh ?? item.title) : (item.titleEn ?? item.title)
  const summary = cardLang === 'zh' ? (item.summaryZh ?? item.summary) : (item.summaryEn ?? item.summary)
  const hasTranslation = cardLang === 'zh' ? !!item.titleEn : !!item.titleZh
  const date = new Date(item.publishedAt).toLocaleDateString(
    cardLang === 'zh' ? 'zh-CN' : 'en-US',
    { month: 'short', day: 'numeric' }
  )

  return (
    <article
      className={cn(
        'group relative bg-white rounded-xl border border-gray-100 shadow-sm',
        'hover:shadow-md hover:border-gray-200 transition-all duration-200',
        'flex flex-col gap-0',
        className
      )}
    >
      {item.isHot && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="flex items-center gap-0.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
            <Flame className="h-2.5 w-2.5" />
            {cardLang === 'zh' ? '热点' : 'Hot'}
          </span>
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* ── Row 1: Pillar badges + lang toggle ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {pillars.map((p) => (
              <PillarBadge
                key={p}
                pillar={p}
                lang={cardLang}
                onClick={onDimensionSubscribe ? () => onDimensionSubscribe(p) : undefined}
              />
            ))}
            {pillars.length === 0 && (
              <PillarBadge pillar="recycling" lang={cardLang} />
            )}
          </div>

          <button
            onClick={() => setCardLang((l) => (l === 'zh' ? 'en' : 'zh'))}
            className={cn(
              'flex-shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded',
              'border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300',
              'transition-colors',
              !hasTranslation && 'opacity-40 cursor-not-allowed'
            )}
            disabled={!hasTranslation}
            title={cardLang === 'zh' ? 'Switch to English' : '切换中文'}
          >
            <Languages className="h-2.5 w-2.5" />
            {cardLang === 'zh' ? 'EN' : '中'}
          </button>
        </div>

        {/* ── Row 2: Title ── */}
        <Link href={`/intelligence/${item.id}`} className="block group/title">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover/title:text-emerald-700 transition-colors">
            {item.isPremium && (
              <Lock className="inline h-3 w-3 text-amber-500 mr-0.5 -mt-0.5" />
            )}
            {title}
          </h3>
        </Link>

        {/* ── Row 3: Summary ── */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{summary}</p>

        {/* ── Row 4: Meta row ── */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span>{country.flag}</span>
              <span>{cardLang === 'zh' ? country.labelZh : country.labelEn}</span>
            </span>
            <span className="text-[10px] text-gray-400">
              {catLabel}
            </span>
            <span className="text-[10px] text-gray-300">{date}</span>
          </div>
          <ImportanceStars level={item.importance} />
        </div>

        {item.source && (
          <div className="flex items-center gap-1 text-[10px] text-gray-300">
            <Globe className="h-2.5 w-2.5" />
            <span className="truncate">{item.source}</span>
          </div>
        )}

        {item.companies && item.companies.length > 0 && (
          <CompanyRecommendations companies={item.companies} lang={cardLang} />
        )}
      </div>

      <Link
        href={`/intelligence/${item.id}`}
        className={cn(
          'flex items-center justify-between px-4 py-2',
          'border-t border-gray-50 rounded-b-xl',
          'text-[11px] text-gray-400 hover:text-emerald-600',
          'hover:bg-gray-50 transition-colors group/cta'
        )}
      >
        <span>{cardLang === 'zh' ? '阅读全文' : 'Read full report'}</span>
        <ChevronRight className="h-3 w-3 group-hover/cta:translate-x-0.5 transition-transform" />
      </Link>
    </article>
  )
}
