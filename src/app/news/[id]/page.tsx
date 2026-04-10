import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Eye, Clock, ExternalLink, ArrowLeft } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, mapPrismaTag } from '@/lib/utils'
import BookmarkButton from '@/components/detail/BookmarkButton'
import ShareButtons from '@/components/detail/ShareButtons'
import NewsCard from '@/components/news/NewsCard'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

const CATEGORY_COLORS: Record<string, string> = {
  material: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  process: 'bg-green-100 text-green-800 hover:bg-green-200',
  technology: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  region: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  topic: 'bg-red-100 text-red-800 hover:bg-red-200',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await prisma.news.findUnique({
    where: { id: params.id },
    select: { title: true, summary: true },
  })
  if (!news) return { title: '文章不存在' }
  return { title: news.title, description: news.summary }
}

export default async function NewsDetailPage({ params }: Props) {
  const [session, newsRaw] = await Promise.all([
    getServerSession(authOptions),
    prisma.news.findUnique({
      where: { id: params.id },
      include: { tags: { include: { tag: true } } },
    }),
  ])

  if (!newsRaw || (!newsRaw.isPublished && session?.user?.role !== 'admin')) {
    notFound()
  }

  // Increment view count
  prisma.news.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  const news = {
    ...newsRaw,
    publishedAt: newsRaw.publishedAt.toISOString(),
    tags: newsRaw.tags.map((t) => mapPrismaTag(t.tag)),
  }

  // Check if bookmarked
  let isBookmarked = false
  if (session?.user?.id) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_newsId: { userId: session.user.id, newsId: params.id } },
    })
    isBookmarked = !!bookmark
  }

  // Get related news
  const tagIds = newsRaw.tags.map((t) => t.tagId)
  const relatedRaw = await prisma.news.findMany({
    where: {
      id: { not: params.id },
      isPublished: true,
      tags: { some: { tagId: { in: tagIds } } },
    },
    orderBy: { viewCount: 'desc' },
    take: 4,
    select: {
      id: true,
      title: true,
      summary: true,
      coverImage: true,
      source: true,
      viewCount: true,
      publishedAt: true,
      tags: { include: { tag: true } },
    },
  })

  const related = relatedRaw.map((item) => ({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    tags: item.tags.map((t) => mapPrismaTag(t.tag)),
  }))

  return (
    <div className="container py-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        返回新闻列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article */}
        <article className="lg:col-span-2">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
            {news.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(news.publishedAt)}
            </span>
            {news.source && (
              <span className="flex items-center gap-1">
                来源：
                {news.sourceUrl ? (
                  <a
                    href={news.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {news.source}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  news.source
                )}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {newsRaw.viewCount.toLocaleString()} 次阅读
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {news.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/news?tags=${tag.slug}`}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${CATEGORY_COLORS[tag.category] ?? 'bg-gray-100 text-gray-700'}`}
              >
                {tag.name}
              </Link>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-muted/50 border-l-4 border-primary rounded-r-lg p-4 mb-6 text-sm leading-relaxed text-muted-foreground">
            {news.summary}
          </div>

          {/* Content */}
          <div
            className="article-content prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Actions */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t">
            <BookmarkButton newsId={params.id} initialBookmarked={isBookmarked} />
            <ShareButtons />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="inline-block w-1 h-5 bg-primary rounded-full" />
            相关推荐
          </h3>
          {related.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无相关推荐</p>
          ) : (
            related.map((item) => (
              <NewsCard key={item.id} news={item} compact />
            ))
          )}
        </aside>
      </div>
    </div>
  )
}
