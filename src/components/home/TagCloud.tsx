import Link from 'next/link'
import type { Tag } from '@/types'

interface Props {
  tags: Tag[]
}

const SIZE_CLASSES = [
  'text-xs px-2.5 py-1',
  'text-sm px-3 py-1',
  'text-sm px-3 py-1.5',
  'text-base px-3.5 py-1.5',
  'text-base px-4 py-2',
]

export default function TagCloud({ tags }: Props) {
  return (
    <section className="py-8">
      <div className="container">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-5 bg-primary rounded-full" />
          热门标签
        </h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => {
            const sizeClass = SIZE_CLASSES[i % SIZE_CLASSES.length]
            return (
              <Link
                key={tag.id}
                href={`/news?tags=${tag.slug}`}
                className={`${sizeClass} rounded-full font-medium transition-all hover:shadow-md hover:scale-105`}
                style={{
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                  border: `1px solid ${tag.color}40`,
                }}
                data-track="tag-click"
                data-tag={tag.slug}
              >
                {tag.name}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
