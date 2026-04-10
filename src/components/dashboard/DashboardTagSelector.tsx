'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/utils'
import type { Tag, TagsByCategory } from '@/types'

interface Props {
  tagsByCategory: TagsByCategory
  selectedTagIds: string[]
  onChange: (ids: string[]) => void
}

export default function DashboardTagSelector({ tagsByCategory, selectedTagIds, onChange }: Props) {
  function toggle(id: string) {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter((t) => t !== id))
    } else {
      onChange([...selectedTagIds, id])
    }
  }

  return (
    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
      {CATEGORY_ORDER.map((cat) => {
        const tags = tagsByCategory[cat as keyof TagsByCategory]
        if (!tags?.length) return null
        return (
          <div key={cat}>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {CATEGORY_LABELS[cat]}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {tags.map((tag: Tag) => (
                <div key={tag.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`dtag-${tag.id}`}
                    checked={selectedTagIds.includes(tag.id)}
                    onCheckedChange={() => toggle(tag.id)}
                  />
                  <Label htmlFor={`dtag-${tag.id}`} className="cursor-pointer text-sm flex items-center gap-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
