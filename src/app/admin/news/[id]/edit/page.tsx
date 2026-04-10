import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NewsForm from '@/components/admin/NewsForm'
import { mapPrismaTag, groupTagsByCategory } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '编辑文章' }

export default async function AdminNewsEditPage({ params }: { params: { id: string } }) {
  const [news, tagsRaw] = await Promise.all([
    prisma.news.findUnique({
      where: { id: params.id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.tag.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    }),
  ])

  if (!news) notFound()

  const tagsByCategory = groupTagsByCategory(tagsRaw.map(mapPrismaTag))

  const defaultValues = {
    id: news.id,
    title: news.title,
    summary: news.summary,
    content: news.content,
    coverImage: news.coverImage ?? undefined,
    source: news.source ?? undefined,
    sourceUrl: news.sourceUrl ?? undefined,
    author: news.author ?? undefined,
    isPublished: news.isPublished,
    publishedAt: news.publishedAt.toISOString().slice(0, 16),
    tagIds: news.tags.map((t) => t.tagId),
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">编辑文章</h1>
      <NewsForm tagsByCategory={tagsByCategory} defaultValues={defaultValues} mode="edit" />
    </div>
  )
}
