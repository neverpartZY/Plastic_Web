'use client'

import { cn } from '@/lib/utils'
import { CATEGORY_ORDER } from '@/lib/utils'
import TagFilterGroup from './TagFilterGroup'
import type { TagsByCategory } from '@/types'

interface Props {
  tagsByCategory: TagsByCategory
  selectedTags: string[]
  onToggle: (slug: string) => void
  onClear: () => void
  /** When true, renders as a compact vertical list (mobile sheet) */
  vertical?: boolean
}

export default function TagFilter({ tagsByCategory, selectedTags, onToggle, onClear, vertical = true }: Props) {
  const totalSelected = selectedTags.length
  const hasCategories = CATEGORY_ORDER.some(
    cat => tagsByCategory[cat as keyof TagsByCategory]?.length > 0,
  )

  if (!hasCategories) return null

  return (
    <div className={cn('w-full', vertical ? 'space-y-5' : 'space-y-4')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-slate-700">筛选维度</span>
        {totalSelected > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] font-medium text-emerald-600 hover:text-emerald-500 transition-colors flex items-center gap-1"
          >
            清除全部
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 text-[10px] inline-flex items-center justify-center font-bold">
              {totalSelected}
            </span>
          </button>
        )}
      </div>

      {/* Category groups */}
      {CATEGORY_ORDER.map((cat) => {
        const tags = tagsByCategory[cat as keyof TagsByCategory]
        if (!tags?.length) return null
        return (
          <TagFilterGroup
            key={cat}
            category={cat}
            tags={tags}
            selectedTags={selectedTags}
            onToggle={onToggle}
          />
        )
      })}
    </div>
  )
}
