import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { newsSchema } from '@/lib/validations'
import type { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tagsParam = searchParams.get('tags')
  const sort = searchParams.get('sort') ?? 'latest'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '12'))
  const q = searchParams.get('q') ?? ''
  const mode = searchParams.get('mode') ?? 'and'

  const tagSlugs = tagsParam ? tagsParam.split(',').filter(Boolean) : []

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
    if (mode === 'or') {
      where.tags = {
        some: {
          tag: { slug: { in: tagSlugs } },
        },
      }
    } else {
      where.AND = tagSlugs.map((slug) => ({
        tags: {
          some: {
            tag: { slug },
          },
        },
      }))
    }
  }

  const orderBy =
    sort === 'popular'
      ? { viewCount: 'desc' as const }
      : { publishedAt: 'desc' as const }

  const [items, total] = await Promise.all([
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
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                color: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    }),
    prisma.news.count({ where }),
  ])

  const mapped = items.map((item) => ({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    tags: item.tags.map((t) => t.tag),
  }))

  return NextResponse.json({
    items: mapped,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
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

  const news = await prisma.news.create({
    data: {
      ...fields,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
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

  return NextResponse.json(news, { status: 201 })
}
