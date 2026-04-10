import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { newsSchema } from '@/lib/validations'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const news = await prisma.news.findUnique({
    where: { id: params.id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  if (!news) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Increment view count (fire and forget)
  prisma.news.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  const result = {
    ...news,
    publishedAt: news.publishedAt.toISOString(),
    createdAt: news.createdAt.toISOString(),
    updatedAt: news.updatedAt.toISOString(),
    tags: news.tags.map((t) => t.tag),
  }

  return NextResponse.json(result)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = newsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { tagIds, publishedAt, ...fields } = parsed.data

  await prisma.newsTag.deleteMany({ where: { newsId: params.id } })

  const news = await prisma.news.update({
    where: { id: params.id },
    data: {
      ...fields,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      tags: {
        create: tagIds.map((id) => ({
          tag: { connect: { id } },
        })),
      },
    },
    include: {
      tags: { include: { tag: true } },
    },
  })

  return NextResponse.json(news)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.news.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
