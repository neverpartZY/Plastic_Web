import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const news = await prisma.news.findUnique({
    where: { id: params.id },
    include: { tags: { select: { tagId: true } } },
  })

  if (!news) return NextResponse.json([])

  const tagIds = news.tags.map((t) => t.tagId)

  const related = await prisma.news.findMany({
    where: {
      id: { not: params.id },
      isPublished: true,
      tags: {
        some: { tagId: { in: tagIds } },
      },
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

  const mapped = related.map((item) => ({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    tags: item.tags.map((t) => t.tag),
  }))

  return NextResponse.json(mapped)
}
