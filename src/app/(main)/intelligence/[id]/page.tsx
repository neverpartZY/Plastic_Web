import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import IntelligenceDetailContent from './IntelligenceDetailContent'

interface Props {
  params: { id: string }
}

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await prisma.intelligence.findUnique({
    where: { id: params.id },
    select: { title: true, titleZh: true, titleEn: true, summary: true, summaryZh: true, summaryEn: true },
  })
  if (!item) return { title: '情报不存在 — SustainPlastics Hub' }

  const title       = item.titleZh   ?? item.title
  const titleEn     = item.titleEn   ?? item.title
  const description = item.summaryZh ?? item.summary
  const descriptionEn = item.summaryEn ?? item.summary

  return {
    title: `${title} — SustainPlastics Hub`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    alternates: {
      languages: {
        'zh-CN': `https://sustainplastics.com/intelligence/${params.id}`,
        'en':    `https://sustainplastics.com/intelligence/${params.id}`,
      },
    },
    other: {
      'og:title:en': titleEn,
      'og:description:en': descriptionEn,
    },
  }
}

export default async function IntelligenceDetailPage({ params }: Props) {
  const item = await prisma.intelligence.findUnique({
    where: { id: params.id },
    include: {
      companyLinks: {
        include: {
          company: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  })

  if (!item) notFound()

  // Find related items that share at least one pillar
  const pillars = (item.pillars ?? '').split(',').filter(Boolean)
  const related = pillars.length > 0
    ? await prisma.intelligence.findMany({
        where: {
          id: { not: params.id },
          OR: pillars.map((p) => ({ pillars: { contains: p } })),
        },
        orderBy: [{ isHot: 'desc' }, { importance: 'desc' }, { publishedAt: 'desc' }],
        take: 3,
        select: {
          id: true,
          title: true,
          titleZh: true,
          titleEn: true,
          summary: true,
          summaryZh: true,
          pillars: true,
          category: true,
          source: true,
          publishedAt: true,
          importance: true,
          isHot: true,
        },
      })
    : []

  // Serialize Dates for client boundary
  const serializedItem = {
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    createdAt:   item.createdAt.toISOString(),
    updatedAt:   item.updatedAt.toISOString(),
    companyLinks: item.companyLinks.map((cl) => ({ company: cl.company })),
  }

  const serializedRelated = related.map((r) => ({
    ...r,
    publishedAt: r.publishedAt.toISOString(),
  }))

  return (
    <IntelligenceDetailContent
      item={serializedItem}
      related={serializedRelated}
    />
  )
}
