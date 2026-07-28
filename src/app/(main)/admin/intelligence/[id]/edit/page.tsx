import { prisma } from '@/lib/prisma'
import IntelligenceForm from '@/components/admin/IntelligenceForm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '编辑情报 — 后台' }

export default async function EditIntelligencePage({
  params,
}: {
  params: { id: string }
}) {
  const item = await prisma.intelligence.findUnique({ where: { id: params.id } })

  if (!item) notFound()

  const defaultValues = {
    id: item.id,
    title: item.title,
    titleZh: item.titleZh ?? '',
    titleEn: item.titleEn ?? '',
    summary: item.summary,
    summaryZh: item.summaryZh ?? '',
    summaryEn: item.summaryEn ?? '',
    content: item.content,
    contentZh: item.contentZh ?? '',
    contentEn: item.contentEn ?? '',
    tldrZh: item.tldrZh ?? '',
    tldrEn: item.tldrEn ?? '',
    category: item.category,
    pillars: item.pillars ?? '',
    countryCode: item.countryCode ?? 'ALL',
    importance: item.importance,
    isHot: item.isHot,
    isPremium: item.isPremium,
    refineStatus: item.refineStatus,
    source: item.source ?? '',
    sourceUrl: item.sourceUrl ?? '',
    dimension: item.dimension ?? '',
    region: item.region ?? '',
    tags: item.tags.join(', '),
  }

  return <IntelligenceForm defaultValues={defaultValues} />
}
