export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { sendIndustryEmail } from '@/lib/mail'
import { renderDailyDigestEmail } from '@/lib/emails/render-digest'
import { prisma } from '@/lib/prisma'

function truncate(text: string, max: number): string {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max - 1) + '…'
}

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get('to') || 'zhouyi@replas.org.cn'

  try {
    // ── 从数据库拉取最近 3 天的真实情报 ────────────────────────────
    const now = new Date()
    const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3))

    const candidates = await prisma.intelligence.findMany({
      where: {
        publishedAt: { gte: since },
        summary: { not: '' },
      },
      orderBy: [{ importance: 'desc' }, { publishedAt: 'desc' }],
      take: 50,
    })

    if (candidates.length === 0) {
      return NextResponse.json({ success: false, error: 'no_candidates' }, { status: 404 })
    }

    // ── 填充所有维度以展示多样性 ──────────────────────────────────
    const allDimensions = ['recycling', 'recycled', 'molds', 'molding', 'bio', 'additives', 'auxiliaries', 'reuse']
    const interests = allDimensions

    // 按 interests 过滤
    const matchItem = (item: any) => {
      const dims: string[] = []
      if (item.pillars) dims.push(...item.pillars.split(',').map((p: string) => p.trim()).filter(Boolean))
      if (item.dimension && !dims.includes(item.dimension)) dims.push(item.dimension)
      return interests.some(i => dims.includes(i))
    }

    const matched = candidates.filter(matchItem)

    const formatItem = (item: any, lang: 'zh' | 'en') => ({
      id: item.id,
      title: lang === 'zh' && item.titleZh ? item.titleZh : (item.titleEn || item.title),
      summary: truncate(lang === 'zh' && item.summary ? item.summary : (item.summaryEn || item.summary || ''), 200),
      sourceUrl: item.sourceUrl || `https://greenplastic.ai/intelligence/${item.id}`,
      source: item.source,
      publishedAt: item.publishedAt.toISOString(),
      importance: item.importance as number,
      pillar: (item.dimension as string) || undefined,
    })

    const itemsZh = matched.map(i => formatItem(i, 'zh'))
    const itemsEn = matched.map(i => formatItem(i, 'en'))

    // 跨维度推荐：从全量中取高分非重复项
    const matchedIds = new Set(matched.map(i => i.id))
    const crossRaw = candidates
      .filter(i => !matchedIds.has(i.id) && i.importance >= 4)
      .slice(0, 3)
    const crossZh = crossRaw.map(i => formatItem(i, 'zh'))
    const crossEn = crossRaw.map(i => formatItem(i, 'en'))

    const baseUrl = 'https://greenplastic.ai/unsubscribe?email=' + encodeURIComponent(to)

    // ── 中文版 ──────────────────────────────────────────────────
    const htmlZh = renderDailyDigestEmail({
      email: to,
      lang: 'zh',
      frequency: 'daily',
      interests,
      items: itemsZh,
      crossDimensionItems: crossZh.length > 0 ? crossZh : undefined,
      unsubscribeUrl: baseUrl,
    })

    // ── 英文版 ──────────────────────────────────────────────────
    const htmlEn = renderDailyDigestEmail({
      email: to,
      lang: 'en',
      frequency: 'daily',
      interests,
      items: itemsEn,
      crossDimensionItems: crossEn.length > 0 ? crossEn : undefined,
      unsubscribeUrl: baseUrl,
    })

    // ── 发送 ────────────────────────────────────────────────────
    const [rZh, rEn] = await Promise.all([
      sendIndustryEmail({
        to,
        subject: `【塑料循环日报】${matched.length} 条最新情报 · 全维度`,
        html: htmlZh,
        lang: 'zh',
      }),
      sendIndustryEmail({
        to,
        subject: `[Plastic Circular Daily] ${matched.length} Latest Updates · All Dimensions`,
        html: htmlEn,
        lang: 'en',
      }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalCandidates: candidates.length,
        matched: matched.length,
        crossDimension: crossZh.length,
      },
      sent: [
        { lang: 'zh', id: rZh.id, count: itemsZh.length },
        { lang: 'en', id: rEn.id, count: itemsEn.length },
      ],
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
