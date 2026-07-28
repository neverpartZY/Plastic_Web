/**
 * GET /api/intelligence
 * 查询情报列表，支持维度过滤、优先级置顶、语言切换
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const pillar = searchParams.get('pillar')          // 单个维度过滤
  const country = searchParams.get('country')        // CN | EU | US | ...
  const category = searchParams.get('category')
  const hotOnly = searchParams.get('hot') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '12'))
  const withCompanies = searchParams.get('companies') === 'true'

  const where: Prisma.IntelligenceWhereInput = {}

  if (pillar) {
    // pillars 字段是逗号分隔字符串，用 contains 做模糊匹配
    where.pillars = { contains: pillar }
  }
  if (country) {
    where.countryCode = country
  }
  if (category) {
    where.category = category
  }
  if (hotOnly) {
    where.isHot = true
  }

  const [items, total] = await Promise.all([
    prisma.intelligence.findMany({
      where,
      orderBy: [
        { isHot: 'desc' },        // 热点置顶
        { importance: 'desc' },   // 重要性降序
        { publishedAt: 'desc' },  // 再按时间排
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        titleZh: true,
        titleEn: true,
        summary: true,
        summaryZh: true,
        summaryEn: true,
        category: true,
        pillars: true,
        countryCode: true,
        importance: true,
        isHot: true,
        isPremium: true,
        source: true,
        publishedAt: true,
        // 关联企业（仅当 withCompanies=true 时有效）
        companyLinks: withCompanies
          ? {
              take: 3,
              orderBy: { relevanceScore: 'desc' },
              select: {
                relevanceScore: true,
                company: {
                  select: { id: true, name: true, slug: true, entityType: true },
                },
              },
            }
          : false,
      },
    }),
    prisma.intelligence.count({ where }),
  ])

  const mapped = items.map((item) => ({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    companies: withCompanies
      ? (item.companyLinks as any[])?.map((l) => ({
          ...l.company,
          relevanceScore: l.relevanceScore,
        })) ?? []
      : undefined,
    companyLinks: undefined,
  }))

  return NextResponse.json({ items: mapped, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await (await import('next-auth')).getServerSession(
    (await import('@/lib/auth')).authOptions
  )
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { intelligenceSchema } = await import('@/lib/validations')
  const parsed = intelligenceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const tagArray = Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map((s: string) => s.trim()).filter(Boolean) : [])

  const item = await prisma.intelligence.create({
    data: {
      title: data.title,
      titleZh: data.titleZh || null,
      titleEn: data.titleEn || null,
      summary: data.summary || '',
      summaryZh: data.summaryZh || null,
      summaryEn: data.summaryEn || null,
      content: data.content || '',
      contentZh: data.contentZh || null,
      contentEn: data.contentEn || null,
      tldrZh: data.tldrZh || null,
      tldrEn: data.tldrEn || null,
      category: data.category || 'tech',
      pillars: data.pillars || null,
      countryCode: data.countryCode || null,
      importance: data.importance ?? 3,
      isHot: data.isHot ?? false,
      isPremium: data.isPremium ?? false,
      refineStatus: data.refineStatus || 'completed',
      source: data.source || null,
      sourceUrl: data.sourceUrl || null,
      dimension: data.dimension || null,
      region: data.region || null,
      tags: tagArray,
      urlHash: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    },
  })

  return NextResponse.json({ ok: true, id: item.id })
}
