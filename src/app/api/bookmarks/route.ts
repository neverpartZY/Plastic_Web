import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      news: {
        select: {
          id: true, title: true, summary: true, coverImage: true,
          source: true, viewCount: true, publishedAt: true,
          tags: { include: { tag: true } },
        },
      },
    },
  })

  return NextResponse.json(
    bookmarks.map((b) => ({
      id: b.id,
      createdAt: b.createdAt.toISOString(),
      news: {
        ...b.news,
        publishedAt: b.news.publishedAt.toISOString(),
        tags: b.news.tags.map((t) => t.tag),
      },
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { newsId } = await req.json()
  if (!newsId) return NextResponse.json({ error: 'newsId required' }, { status: 400 })

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_newsId: { userId: session.user.id, newsId } },
    update: {},
    create: { userId: session.user.id, newsId },
  })

  return NextResponse.json(bookmark, { status: 201 })
}
