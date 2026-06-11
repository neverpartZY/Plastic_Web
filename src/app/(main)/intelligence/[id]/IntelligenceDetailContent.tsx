'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Globe,
  Calendar,
  Flame,
  Lock,
  ExternalLink,
  Languages,
  Share2,
  Check,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type Pillar = 'molds' | 'molding' | 'recycled' | 'bio' | 'additives' | 'auxiliaries' | 'recycling' | 'reuse'

export interface IntelligenceDetail {
  id: string
  title: string
  titleZh: string | null
  titleEn: string | null
  summary: string
  summaryZh: string | null
  summaryEn: string | null
  tldrZh: string | null
  tldrEn: string | null
  content: string
  contentZh: string | null
  contentEn: string | null
  lang: string | null
  category: string
  pillars: string | null
  countryCode: string | null
  importance: number
  isHot: boolean
  isPremium: boolean
  source: string | null
  sourceUrl: string | null
  publishedAt: string
  companyLinks: Array<{ company: { id: string; name: string; slug: string } }>
}

export interface RelatedItem {
  id: string
  title: string
  titleZh: string | null
  titleEn: string | null
  summary: string
  summaryZh: string | null
  pillars: string | null
  category: string
  source: string | null
  publishedAt: string
  importance: number
  isHot: boolean
}

interface Props {
  item: IntelligenceDetail
  related: RelatedItem[]
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
  reuse:       { labelZh: '重复使用', labelEn: 'Reuse',       color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const CATEGORY_CONFIG: Record<string, { labelZh: string; labelEn: string }> = {
  policy:     { labelZh: '政策法规', labelEn: 'Policy' },
  market:     { labelZh: '市场行情', labelEn: 'Market' },
  tech:       { labelZh: '技术创新', labelEn: 'Tech' },
  enterprise: { labelZh: '企业动态', labelEn: 'Enterprise' },
  global:     { labelZh: '国际视野', labelEn: 'Global' },
}

const COUNTRY_CONFIG: Record<string, { flag: string; labelZh: string; labelEn: string }> = {
  CN:     { flag: '🇨🇳', labelZh: '中国',  labelEn: 'China' },
  EU:     { flag: '🇪🇺', labelZh: '欧盟',  labelEn: 'EU' },
  US:     { flag: '🇺🇸', labelZh: '美国',  labelEn: 'US' },
  UK:     { flag: '🇬🇧', labelZh: '英国',  labelEn: 'UK' },
  GLOBAL: { flag: '🌐',  labelZh: '全球',  labelEn: 'Global' },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ImportanceStars({ level }: { level: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`重要性 ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={cn('text-sm', i < level ? 'text-amber-400' : 'text-gray-200')}>★</span>
      ))}
    </span>
  )
}

function ShareButton({ lang }: { lang: 'zh' | 'en' }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors',
        copied
          ? 'border-emerald-300 text-emerald-600 bg-emerald-50'
          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '分享' : 'Share')}
    </button>
  )
}

function RelatedCard({ item, lang }: { item: RelatedItem; lang: 'zh' | 'en' }) {
  const title   = lang === 'zh' ? (item.titleZh ?? item.title) : (item.titleEn ?? item.title)
  const summary = lang === 'zh' ? (item.summaryZh ?? item.summary) : item.summary
  const pillars = (item.pillars ?? '').split(',').filter(Boolean) as Pillar[]
  const date    = new Date(item.publishedAt).toLocaleDateString(
    lang === 'zh' ? 'zh-CN' : 'en-US',
    { month: 'short', day: 'numeric' },
  )
  const firstPillar = pillars[0]
  const pillarCfg   = firstPillar ? PILLAR_CONFIG[firstPillar] : undefined

  return (
    <Link
      href={`/intelligence/${item.id}`}
      className="group block p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all bg-white"
    >
      <div className="flex items-center gap-2 mb-2">
        {item.isHot && (
          <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5">
            <Flame className="h-2.5 w-2.5" />{lang === 'zh' ? '热点' : 'Hot'}
          </span>
        )}
        {pillarCfg && (
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium', pillarCfg.color)}>
            {lang === 'zh' ? pillarCfg.labelZh : pillarCfg.labelEn}
          </span>
        )}
      </div>
      <h4 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors mb-2">
        {title}
      </h4>
      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">{summary}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-300">{date}</span>
        {item.source && <span className="text-[10px] text-gray-300 truncate max-w-[8rem]">{item.source}</span>}
      </div>
    </Link>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IntelligenceDetailContent({ item, related }: Props) {
  // 有中文内容就默认显示中文（lang 字段反映的是原始文章语言，非 AI 精炼后语言）
  const hasZh    = !!(item.titleZh || item.contentZh || item.summaryZh || item.tldrZh)
  const hasEn    = !!(item.titleEn || item.contentEn || item.summaryEn || item.tldrEn)
  const canToggle = hasZh && hasEn
  const defaultLang: 'zh' | 'en' = hasZh ? 'zh' : (item.lang as 'zh' | 'en') ?? 'zh'
  const [lang, setLang] = useState<'zh' | 'en'>(defaultLang)

  const title   = lang === 'zh' ? (item.titleZh ?? item.title) : (item.titleEn ?? item.title)
  const pillars  = (item.pillars ?? '').split(',').filter(Boolean) as Pillar[]
  const category = CATEGORY_CONFIG[item.category] ?? { labelZh: item.category, labelEn: item.category }
  const country  = COUNTRY_CONFIG[item.countryCode ?? 'GLOBAL'] ?? COUNTRY_CONFIG.GLOBAL

  const publishedDate = new Date(item.publishedAt).toLocaleDateString(
    lang === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )

  // TLDR bullet points — primary content, with fallback to summary
  const tldrRaw    = lang === 'zh' ? (item.tldrZh ?? item.summaryZh ?? item.summary)
                                   : (item.tldrEn ?? item.summaryEn ?? item.summary)
  const tldrPoints = tldrRaw
    ? tldrRaw.split('\n').map(l => l.trim()).filter(l => l.startsWith('•')).map(l => l.slice(1).trim()).filter(Boolean)
    : []
  const tldrFallback = tldrPoints.length === 0 ? tldrRaw : null

  // AI summary prose — only show when a dedicated field exists (not same as TLDR fallback)
  const summaryText = lang === 'zh'
    ? (item.summaryZh ?? item.contentZh ?? item.summary)
    : (item.summaryEn ?? item.contentEn ?? item.summary)

  return (
    <div className="min-h-screen bg-white">

      {/* ── Sticky top bar ── */}
      <div className="bg-white/95 backdrop-blur border-b border-gray-100 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-sm text-gray-400 min-w-0">
            <Link href="/intelligence" className="hover:text-emerald-600 transition-colors flex items-center gap-1 shrink-0">
              <ArrowLeft className="h-3.5 w-3.5" />
              {lang === 'zh' ? '情报中心' : 'Intelligence'}
            </Link>
            <span>/</span>
            <span className="truncate text-gray-600 text-xs">{title}</span>
          </nav>

          <button
            onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
            disabled={!canToggle}
            title={canToggle ? (lang === 'zh' ? 'Switch to English' : '切换中文') : '暂无双语版本'}
            className={cn(
              'shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors',
              canToggle
                ? 'border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600'
                : 'border-gray-100 text-gray-300 cursor-not-allowed'
            )}
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </div>

      {/* ── Article ── */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-14">

        {/* Pillar + category badges */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {item.isHot && (
            <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <Flame className="h-3 w-3" />
              {lang === 'zh' ? '热点' : 'Hot'}
            </span>
          )}
          {pillars.map(p => {
            const cfg = PILLAR_CONFIG[p]
            if (!cfg) return null
            return (
              <span key={p} className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', cfg.color)}>
                {lang === 'zh' ? cfg.labelZh : cfg.labelEn}
              </span>
            )
          })}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
            {lang === 'zh' ? category.labelZh : category.labelEn}
          </span>
          <ImportanceStars level={item.importance} />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-8">
          {item.isPremium && <Lock className="inline h-6 w-6 text-amber-500 mr-2 -mt-1" />}
          {title}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 pb-8 mb-8 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 shrink-0" />
            {publishedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <span>{country.flag}</span>
            <span>{lang === 'zh' ? country.labelZh : country.labelEn}</span>
          </span>
          {item.source && (
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 shrink-0" />
              {item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
                >
                  {item.source}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span>{item.source}</span>
              )}
            </span>
          )}
          {item.isPremium && (
            <span className="flex items-center gap-1 text-amber-500">
              <Lock className="h-3.5 w-3.5" />
              Premium
            </span>
          )}
        </div>

        {/* ── TLDR bullet points — 先看要点 ── */}
        {(tldrPoints.length > 0 || tldrFallback) && (
          <div className="mb-10 rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                {lang === 'zh' ? '核心要点' : 'Key Points'}
              </span>
              <span className="text-[10px] text-emerald-400 ml-auto">AI · GLM</span>
            </div>

            {tldrPoints.length > 0 ? (
              <ul className="space-y-3">
                {tldrPoints.map((point, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 mt-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 text-[15px] leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 text-[15px] leading-relaxed">{tldrFallback}</p>
            )}
          </div>
        )}

        {/* ── AI Summary prose — 详细摘要，仅在有专属字段时展示 ── */}
        {summaryText && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block w-1 h-4 bg-emerald-400 rounded-full" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {lang === 'zh' ? 'AI 摘要' : 'AI Summary'}
              </span>
            </div>
            <p className="text-gray-700 text-[17px] leading-loose">
              {summaryText}
            </p>
          </div>
        )}

        {/* Related companies */}
        {item.companyLinks.length > 0 && (
          <div className="mb-10 pt-6 border-t border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
              {lang === 'zh' ? '相关企业' : 'Related Companies'}
            </p>
            <div className="flex flex-wrap gap-2">
              {item.companyLinks.map(({ company }) => (
                <Link
                  key={company.id}
                  href={`/explore?company=${company.slug}`}
                  className="text-sm text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline"
                >
                  {company.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between gap-4">
          <Link
            href="/intelligence"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === 'zh' ? '返回情报中心' : 'Back to Intelligence'}
          </Link>
          <ShareButton lang={lang} />
        </div>

        {/* Related intelligence */}
        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-block w-1 h-5 bg-emerald-500 rounded-full" />
              <h2 className="text-lg font-bold text-gray-900">
                {lang === 'zh' ? '相关情报' : 'Related Intelligence'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(r => (
                <RelatedCard key={r.id} item={r} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
