'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import IntelligenceCard from '@/components/intelligence/IntelligenceCard'
import SubscriptionModal from '@/components/intelligence/SubscriptionModal'
import type { Dimension } from '@/lib/intelligence/keywords'
import type { IntelligencePageDictionary } from '@/i18n/types'

export { DIMENSION_VALUES } from '@/lib/intelligence/keywords'
export type { Dimension }

interface IntelligenceItem {
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
  companies?: Array<{ id: string; name: string; slug: string; entityType: string }>
}

interface Props {
  items: IntelligenceItem[]
  hotCount: number
  highlightsCount: number
  lang?: 'zh' | 'en'
  tab: 'highlights' | 'all'
  page: number
  totalPages: number
  tabHighlightsHref: string
  tabAllHref: string
  prevPageHref: string | null
  nextPageHref: string | null
  dict: IntelligencePageDictionary
}

export default function IntelligencePageClient({
  items,
  highlightsCount,
  lang = 'zh',
  tab,
  page,
  totalPages,
  tabHighlightsHref,
  tabAllHref,
  prevPageHref,
  nextPageHref,
  dict,
}: Props) {
  const [modalOpen, setModalOpen]         = useState(false)
  const [initialDimension, setInitialDim] = useState<Dimension | undefined>(undefined)

  function openSubscribe(dimension?: Dimension) {
    setInitialDim(dimension)
    setModalOpen(true)
  }

  return (
    <>
      <div className="container py-6">
        {/* ── Tab bar ── */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-100 pb-0">
          <a
            href={tabHighlightsHref}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
              tab === 'highlights'
                ? 'text-emerald-700 bg-white border border-b-white border-gray-200 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {dict.tabHighlights}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
              tab === 'highlights' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {highlightsCount.toLocaleString()}
            </span>
          </a>
          <a
            href={tabAllHref}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
              tab === 'all'
                ? 'text-emerald-700 bg-white border border-b-white border-gray-200 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {dict.tabAll}
          </a>
        </div>

        {/* ── Cards ── */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">{dict.empty}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <IntelligenceCard
                key={item.id}
                item={item}
                lang={lang}
                onDimensionSubscribe={(dim) => openSubscribe(dim)}
              />
            ))}
          </div>
        )}

        {/* ── Pagination (全量 tab only) ── */}
        {tab === 'all' && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            {prevPageHref ? (
              <a
                href={prevPageHref}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 bg-white hover:border-emerald-300 hover:text-emerald-600 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {dict.prevPage}
              </a>
            ) : (
              <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-300 border border-gray-100 bg-white cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
                {dict.prevPage}
              </span>
            )}

            <span className="text-sm text-gray-500 px-2">
              {dict.pageInfo.replace('{page}', String(page)).replace('{total}', String(totalPages))}
            </span>

            {nextPageHref ? (
              <a
                href={nextPageHref}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 bg-white hover:border-emerald-300 hover:text-emerald-600 transition-colors"
              >
                {dict.nextPage}
                <ChevronRight className="h-4 w-4" />
              </a>
            ) : (
              <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-300 border border-gray-100 bg-white cursor-not-allowed">
                {dict.nextPage}
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        )}
      </div>

      <SubscriptionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialDimension={initialDimension}
      />
    </>
  )
}
