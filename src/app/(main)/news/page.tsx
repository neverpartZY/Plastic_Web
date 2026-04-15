import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import NewsListClient from '@/components/news/NewsListClient'
import type { Metadata } from 'next'
import type { TagsByCategory } from '@/types'
import { mapPrismaTag, groupTagsByCategory } from '@/lib/utils'
import type { Prisma } from '@prisma/client'

export const metadata: Metadata = {
  title: '产业资讯 — 六大支柱情报中心',
  description: '按绿色机械、可持续材料、环保助剂、绿色辅料、循环再生、碳中和/政策六大支柱筛选，覆盖全球各地区产业情报。',
}

interface SearchParams {
  tags?: string
  sort?: string
  page?: string
  q?: string
  pillar?: string
  region?: string
}

async function getNewsPageData(searchParams: SearchParams) {
  const tagSlugs = searchParams.tags?.split(',').filter(Boolean) ?? []
  const sort = searchParams.sort ?? 'latest'
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const q = searchParams.q ?? ''
  const pillar = searchParams.pillar ?? ''
  const region = searchParams.region ?? ''

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
    initialPillar: pillar,
    initialRegion: region,
  }
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { initialData, tagsByCategory, initialTags, initialSort, initialQ, initialPillar, initialRegion } =
    await getNewsPageData(searchParams)

  return (
    <div>
      {/* ── Light hero header ── */}
      <div className="relative overflow-hidden pt-24 pb-16 bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/20">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.020] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.9) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 container max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>情报中心</span>
            <span>/</span>
            <span className="text-emerald-600 font-medium">产业资讯</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            六大支柱 · 全球地区 · 实时聚合
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
            产业情报中心
          </h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed">
            按绿色机械、可持续材料、环保助剂等六大支柱分类，多地区视野覆盖全球可持续塑料产业动态
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { label: '已收录资讯', value: `${initialData.total.toLocaleString()}+` },
              { label: '信息来源', value: '50+' },
              { label: '每日更新', value: '实时' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <div className="text-2xl font-black text-emerald-600">{value}</div>
                <div className="text-[12px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      <Suspense fallback={<div className="container py-8 text-center text-muted-foreground">加载中...</div>}>
        <NewsListClient
          tagsByCategory={tagsByCategory}
          initialData={initialData}
          initialTags={initialTags}
          initialSort={initialSort}
          initialQ={initialQ}
          initialPillar={initialPillar}
          initialRegion={initialRegion}
        />
      </Suspense>
    </div>
  )
}
