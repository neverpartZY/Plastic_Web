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
      {/* ── Dark hero header ── */}
      <div
        className="relative overflow-hidden py-14 md:py-20"
        style={{ background: 'linear-gradient(135deg, #020a14 0%, #061220 50%, #030e1a 100%)' }}
      >
        {/* Ambient orbs */}
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)', filter: 'blur(50px)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 container max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>发现资源</span>
            <span>/</span>
            <span className="text-emerald-400 font-medium">行业媒体</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            实时聚合 · 多维检索
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            行业媒体资讯
          </h1>
          <p className="text-slate-400 text-base max-w-xl leading-relaxed">
            聚合全球塑料回收产业动态，覆盖价格行情、政策法规、企业动态与技术突破
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: '已收录资讯', value: `${initialData.total.toLocaleString()}+` },
              { label: '信息来源', value: '50+' },
              { label: '每日更新', value: '实时' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-[12px] text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--background, #f8fafc))' }} />
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
