import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import IntelligenceCard from '@/components/intelligence/IntelligenceCard'

interface Props {
  items: React.ComponentProps<typeof IntelligenceCard>['item'][]
}

export default function IntelligenceFeed({ items }: Props) {
  if (items.length === 0) return null

  return (
    <section className="py-8 bg-gray-50/60">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="inline-block w-1 h-5 bg-emerald-500 rounded-full" />
            每日情报
            <span className="text-xs font-normal text-gray-400 ml-1">AI采集 · 实时分析</span>
          </h2>
          <Link
            href="/intelligence"
            className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
          >
            查看全部
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <IntelligenceCard key={item.id} item={item} lang="zh" />
          ))}
        </div>
      </div>
    </section>
  )
}
