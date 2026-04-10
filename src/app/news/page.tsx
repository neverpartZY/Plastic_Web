import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import NewsListClient from '@/components/news/NewsListClient'
import type { Metadata } from 'next'
import type { TagsByCategory } from '@/types'
import { mapPrismaTag, groupTagsByCategory } from '@/lib/utils'
import type { Prisma } from '@prisma/client'

export const metadata: Metadata = {
  title: '新闻列表',
  description: '浏览塑料回收产业最新资讯，支持按物料、地区、主题多维筛选。',
}

interface SearchParams {
  tags?: string
  sort?: string
  page?: string
  q?: string
}

async function getNewsPageData(searchParams: SearchParams) {
  const tagSlugs = searchParams.tags?.split(',').filter(Boolean) ?? []
  const sort = searchParams.sort ?? 'latest'
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const q = searchParams.q ?? ''

  const where: Prisma.NewsWhereInput = {
    isPublished: true,
  }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { summary: { contains: q } },
    ]
  }

  if (tagSlugs.length > 0) {
    where.AND = tagSlugs.map((slug) => ({
      tags: { some: { tag: { slug } } },
    }))
  }

  const orderBy =
    sort === 'popular'
      ? { viewCount: 'desc' as const }
      : { publishedAt: 'desc' as const }

  const limit = 12

  const [newsRaw, total, tagsRaw] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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
    }),
    prisma.news.count({ where }),
    prisma.tag.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    }),
  ])

  const news = newsRaw.map((item) => ({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    tags: item.tags.map((t) => mapPrismaTag(t.tag)),
  }))

  const tagsByCategory = groupTagsByCategory(tagsRaw.map(mapPrismaTag))

  return {
    initialData: { items: news, total, page, limit, totalPages: Math.ceil(total / limit) },
    tagsByCategory,
    initialTags: tagSlugs,
    initialSort: sort,
    initialQ: q,
  }
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { initialData, tagsByCategory, initialTags, initialSort, initialQ } =
    await getNewsPageData(searchParams)

  return (
    <div>
      <div className="border-b bg-muted/30 py-4">
        <div className="container">
          <h1 className="text-xl font-bold">新闻列表</h1>
          <p className="text-sm text-muted-foreground mt-1">
            追踪塑料回收产业最新动态
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="container py-8 text-center text-muted-foreground">加载中...</div>}>
        <NewsListClient
          tagsByCategory={tagsByCategory}
          initialData={initialData}
          initialTags={initialTags}
          initialSort={initialSort}
          initialQ={initialQ}
        />
      </Suspense>
    </div>
  )
}
