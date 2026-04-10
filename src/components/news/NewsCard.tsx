import Link from 'next/link'
import Image from 'next/image'
import { Eye, Clock, Sparkles, PenLine } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { NewsListItem } from '@/types'

interface Props {
  news: NewsListItem
  compact?: boolean
}

// Per-category color palette: semi-transparent bg + colored text
const TAG_PALETTE: Record<string, { bg: string; text: string }> = {
  entity:      { bg: 'rgba(59,130,246,0.10)',  text: '#2563eb' },
  application: { bg: 'rgba(245,158,11,0.10)',  text: '#b45309' },
  material:    { bg: 'rgba(16,185,129,0.10)',  text: '#047857' },
  process:     { bg: 'rgba(139,92,246,0.10)',  text: '#6d28d9' },
  technology:  { bg: 'rgba(6,182,212,0.10)',   text: '#0e7490' },
  region:      { bg: 'rgba(249,115,22,0.10)',  text: '#c2410c' },
  topic:       { bg: 'rgba(244,63,94,0.10)',   text: '#be123c' },
}

export default function NewsCard({ news, compact = false }: Props) {
  const tagPalette = (cat: string) => TAG_PALETTE[cat] ?? { bg: 'rgba(107,114,128,0.10)', text: '#374151' }

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <Link href={`/news/${news.id}`} className="block" aria-label={news.title}>

        {/* ── Cover image ── */}
        {!compact && news.coverImage && (
          <div className="relative h-44 overflow-hidden bg-slate-100">
            <Image
              src={news.coverImage}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Data-source badge — top-right corner */}
            {news.dataSource === 'ai' && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/35 text-white backdrop-blur-md border border-white/15 select-none">
                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                AI
              </div>
            )}
            {news.dataSource === 'manual' && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/30 text-white/90 backdrop-blur-md border border-white/10 select-none opacity-0 group-hover:opacity-100 transition-opacity">
                <PenLine className="h-2.5 w-2.5" aria-hidden="true" />
                人工
              </div>
            )}

            {/* Gradient overlay — improves text readability if tags overlap image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        )}

        {/* ── Card body ── */}
        <div className={compact ? 'p-4' : 'p-5'}>

          {/* Tags row: X/Y axis first, then others */}
          {news.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {news.tags.slice(0, compact ? 2 : 4).map((tag) => {
                const { bg, text } = tagPalette(tag.category)
                return (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-semibold leading-none"
                    style={{ backgroundColor: bg, color: text }}
                  >
                    {tag.name}
                  </span>
                )
              })}
            </div>
          )}

          {/* Title */}
          <h3
            className={`font-semibold leading-snug text-slate-900 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2 ${compact ? 'text-[14px] mb-1' : 'text-[15px] mb-2.5'}`}
          >
            {news.title}
          </h3>

          {/* Summary — full card only */}
          {!compact && (
            <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mb-4">
              {news.summary}
            </p>
          )}

          {/* ── Meta footer ── */}
          <div className={`flex items-center justify-between text-[12px] text-slate-400 ${compact ? '' : 'pt-3 border-t border-slate-50'}`}>
            <div className="flex items-center gap-1.5 min-w-0">
              {news.source ? (
                <span className="font-medium text-slate-500 truncate max-w-[100px]">{news.source}</span>
              ) : (
                <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              )}
              {news.source && <span className="text-slate-300" aria-hidden="true">·</span>}
              <time dateTime={news.publishedAt} className="flex-shrink-0">
                {formatDate(news.publishedAt)}
              </time>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>{news.viewCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
