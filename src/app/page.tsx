import { prisma } from '@/lib/prisma'
import HeroSearch from '@/components/home/HeroSearch'
import Features from '@/components/home/Features'
import SixModulesGrid from '@/components/home/SixModulesGrid'
import DataEcosystem from '@/components/home/DataEcosystem'
import MatrixHub from '@/components/home/MatrixHub'
import NewsFeed from '@/components/home/NewsFeed'
import TagCloud from '@/components/home/TagCloud'
import { mapPrismaTag } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '塑料回收产业信息中心 - 实时追踪回收产业动态',
}

export const revalidate = 60

async function getHomeData() {
  const [newsRaw, tagsRaw] = await Promise.all([
    prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 9,
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
    prisma.tag.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    }),
  ])

  const news = newsRaw.map((item) => ({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    tags: item.tags.map((t) => mapPrismaTag(t.tag)),
  }))

  return { news, tags: tagsRaw.map(mapPrismaTag) }
}

export default async function HomePage() {
  const { news, tags } = await getHomeData()

  return (
    <>
      <HeroSearch />
      <Features />
      <SixModulesGrid />
      <DataEcosystem />
      <MatrixHub />
      <TagCloud tags={tags} />
      <div className="border-t" />
      <NewsFeed news={news} />
    </>
  )
}
