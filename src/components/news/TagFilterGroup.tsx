'use client'

import { CATEGORY_LABELS, CATEGORY_ACCENTS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

interface Props {
  category: string
  tags: Tag[]
  selectedTags: string[]
  onToggle: (slug: string) => void
}

export default function TagFilterGroup({ category, tags, selectedTags, onToggle }: Props) {
  if (!tags.length) return null
  const accent = CATEGORY_ACCENTS[category] ?? { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }

  return (
    <div>
      {/* Category label */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase', accent.bg, accent.text)}>
          {CATEGORY_LABELS[category] ?? category}
        </span>
        {selectedTags.filter(s => tags.some(t => t.slug === s)).length > 0 && (
          <span className={cn('text-[10px] font-semibold', accent.text)}>
            已选 {selectedTags.filter(s => tags.some(t => t.slug === s)).length}
          </span>
        )}
      </div>

      {/* Pill row — wraps on small screens */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const active = selectedTags.includes(tag.slug)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.slug)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150',
                'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                active
                  ? 'border-transparent text-white shadow-sm'
                  : cn('bg-white hover:bg-slate-50', accent.border, 'text-slate-600 hover:text-slate-800'),
              )}
              style={active ? { backgroundColor: tag.color, boxShadow: `0 2px 8px ${tag.color}50` } : undefined}
              aria-pressed={active}
            >
              {/* Color dot — visible only when inactive */}
              {!active && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                  aria-hidden="true"
                />
              )}
              {tag.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
