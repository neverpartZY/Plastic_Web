/**
 * /api/intelligence/[id]
 * GET — 获取单条情报详情
 * PATCH — 编辑情报（admin only）
 * DELETE — 删除情报（admin only）
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { intelligenceSchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = await prisma.intelligence.findUnique({
    where: { id: params.id },
    include: {
      companyLinks: {
        take: 5,
        orderBy: { relevanceScore: 'desc' },
        select: {
          relevanceScore: true,
          company: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  })

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    companies: item.companyLinks.map((l: any) => ({
      ...l.company,
      relevanceScore: l.relevanceScore,
    })),
    companyLinks: undefined,
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = intelligenceSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const tagsArray = Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map((s: string) => s.trim()).filter(Boolean) : undefined)

  const updated = await prisma.intelligence.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.titleZh !== undefined && { titleZh: data.titleZh }),
      ...(data.titleEn !== undefined && { titleEn: data.titleEn }),
      ...(data.summary !== undefined && { summary: data.summary }),
      ...(data.summaryZh !== undefined && { summaryZh: data.summaryZh }),
      ...(data.summaryEn !== undefined && { summaryEn: data.summaryEn }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.contentZh !== undefined && { contentZh: data.contentZh }),
      ...(data.contentEn !== undefined && { contentEn: data.contentEn }),
      ...(data.tldrZh !== undefined && { tldrZh: data.tldrZh }),
      ...(data.tldrEn !== undefined && { tldrEn: data.tldrEn }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.pillars !== undefined && { pillars: data.pillars }),
      ...(data.countryCode !== undefined && { countryCode: data.countryCode }),
      ...(data.importance !== undefined && { importance: data.importance }),
      ...(data.isHot !== undefined && { isHot: data.isHot }),
      ...(data.isPremium !== undefined && { isPremium: data.isPremium }),
      ...(data.refineStatus !== undefined && { refineStatus: data.refineStatus }),
      ...(data.source !== undefined && { source: data.source }),
      ...(data.sourceUrl !== undefined && { sourceUrl: data.sourceUrl }),
      ...(data.dimension !== undefined && { dimension: data.dimension }),
      ...(data.region !== undefined && { region: data.region }),
      ...(data.tags !== undefined && { tags: tagsArray }),
      version: { increment: 1 },
    },
  })

  return NextResponse.json({ ok: true, id: updated.id })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.intelligence.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
