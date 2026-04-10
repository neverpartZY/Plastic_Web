import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import NewsCard from '@/components/news/NewsCard'
import type { NewsListItem } from '@/types'

interface Props {
  news: NewsListItem[]
}

export default function NewsFeed({ news }: Props) {
  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="inline-block w-1 h-5 bg-primary rounded-full" />
            最新资讯
          </h2>
          <Link
            href="/news"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            查看全部
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
