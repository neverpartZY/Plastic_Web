/**
 * /api/cron/send-daily-digest
 *
 * Cron Job: 每日情报自动化分发
 *
 * 筛选算法：捞取过去 24 小时内的情报，
 * 按订阅者 interests 标签精准匹配，多语言自动处理。
 * 新增：跨维度高分推荐（打破信息茧房）。
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendIndustryEmail } from '@/lib/mail'
import { renderDailyDigestEmail } from '@/lib/emails/render-digest'

// ── 常量 ─────────────────────────────────────────────────────────────────

/** 最低重要性评分（1-5星），设为 1 不排除任何内容 */
const MIN_IMPORTANCE = 1
/** 摘要最大长度（日志截取用） */
const MAX_SUMMARY_LEN = 200
/** 跨维度推荐最低分 */
const CROSS_DIMENSION_MIN_SCORE = 4
/** 跨维度推荐最大条数 */
const MAX_CROSS_DIMENSION_ITEMS = 3

// ── 工具函数 ─────────────────────────────────────────────────────────────

function truncate(text: string, max: number): string {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max - 1) + '…'
}

async function sendOneDigest(params: {
  to: string
  email: string
  lang: 'zh' | 'en'
  frequency: string
  interests: string[]
  name?: string
}) {
  const { to, email, lang, frequency, interests, name } = params

  // ── 1. 捞取情报 ───────────────────────────────────────────────────────
  // 用昨天 UTC 零点做起点，避免滚动窗口因 cron 秒级延迟导致空窗
  const now = new Date()
  const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1))

  const candidates = await prisma.intelligence.findMany({
    where: {
      publishedAt: { gte: since },
      importance:  { gte: MIN_IMPORTANCE },
      // 只取有摘要的
      summary:     { not: '' },
    },
    orderBy: [{ importance: 'desc' }, { publishedAt: 'desc' }],
    take: 50,
  })

  if (candidates.length === 0) {
    return { email, status: 'skipped', reason: 'no_candidates' }
  }

  // ── 2. 按 interests 过滤并选择语言 ───────────────────────────────────
  const filtered = candidates
    .filter(item => {
      // 同时匹配 pillars（逗号分隔多维度）和 dimension（主维度）
      const itemDims: string[] = []
      if (item.pillars) {
        itemDims.push(...item.pillars.split(',').map(p => p.trim()).filter(Boolean))
      }
      if (item.dimension && !itemDims.includes(item.dimension)) {
        itemDims.push(item.dimension)
      }
      return interests.some(interest => itemDims.includes(interest))
    })
    .map(item => {
      // 选择对应语言字段
      const title   = lang === 'zh' && item.titleZh   ? item.titleZh   : item.title
      const summary = lang === 'zh' && item.summaryZh ? item.summaryZh : item.summary
      return {
        id:          item.id,
        title:       title ?? item.title,
        summary:     truncate(summary ?? item.summary ?? '', MAX_SUMMARY_LEN),
        sourceUrl:   item.sourceUrl ?? `https://greenplastic.ai/intelligence/${item.id}`,
        source:      item.source,
        publishedAt: item.publishedAt.toISOString(),
        importance:  item.importance,
        pillar:      item.dimension ?? undefined,
      }
    })

  if (filtered.length === 0) {
    return { email, status: 'skipped', reason: 'no_matching_interests' }
  }

  // ── 2b. 跨维度推荐：高分但非本维度的内容 ─────────────────────────
  const filteredIds = new Set(filtered.map(f => f.id))
  const crossDimensionItems = candidates
    .filter(item => {
      if (filteredIds.has(item.id)) return false
      if (item.importance < CROSS_DIMENSION_MIN_SCORE) return false
      return true
    })
    .slice(0, MAX_CROSS_DIMENSION_ITEMS)
    .map(item => {
      const title   = lang === 'zh' && item.titleZh   ? item.titleZh   : item.title
      const summary = lang === 'zh' && item.summaryZh ? item.summaryZh : item.summary
      return {
        id:          item.id,
        title:       title ?? item.title,
        summary:     truncate(summary ?? item.summary ?? '', MAX_SUMMARY_LEN),
        sourceUrl:   item.sourceUrl ?? `https://greenplastic.ai/intelligence/${item.id}`,
        source:      item.source,
        publishedAt: item.publishedAt.toISOString(),
        importance:  item.importance,
        pillar:      item.dimension ?? undefined,
      }
    })

  // ── 3. 渲染邮件 HTML ────────────────────────────────────────────────────
  const unsubscribeUrl = `https://greenplastic.ai/unsubscribe?email=${encodeURIComponent(email)}`

  const html = await renderDailyDigestEmail({
    recipientName: name,
    email,
    lang,
    frequency,
    interests,
    items: filtered,
    crossDimensionItems: crossDimensionItems.length > 0 ? crossDimensionItems : undefined,
    unsubscribeUrl,
  })

  // ── 4. 发送 ────────────────────────────────────────────────────────────
  const subject = lang === 'zh'
    ? `【塑料循环日报】${interests.join(' · ')} 最新动态`
    : `[Plastic Circular Daily] ${interests.join(' · ')} Updates`

  try {
    const { id: msgId } = await sendIndustryEmail({ to, subject, html, lang })

    // ── 5. 记录 PushLog ────────────────────────────────────────────────────
    const allItems = [...filtered, ...crossDimensionItems]
    await prisma.pushLog.createMany({
      data: allItems.map(item => ({
        leadId:         null, // 订阅者可能是 Lead 也可能是 User
        intelligenceId: item.id,
        status:         'sent',
        response:       msgId,
      })),
    })

    return { email, status: 'sent', count: filtered.length, crossCount: crossDimensionItems.length, msgId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[send-daily-digest] email failed for ${email}: ${msg}`)

    await prisma.pushLog.createMany({
      data: filtered.map(item => ({
        leadId:         null,
        intelligenceId: item.id,
        status:         'failed',
        error:          msg,
      })),
    })

    return { email, status: 'error', error: msg }
  }
}

// ── GET: 手动触发（开发调试用）───────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Vercel Cron 走内置认证（x-vercel-cron-secret），手动调试需要 CRON_SECRET
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // 用昨天 UTC 零点做起点，避免滚动窗口因 cron 秒级延迟导致空窗
  const now = new Date()
  const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1))

    // ── 收集所有活跃订阅者（Lead + User/Subscription 合并）────────────────
    const [leads, subscriptions] = await Promise.all([
      // Lead 订阅者
      prisma.lead.findMany({
        where: { isActive: true },
        select: {
          id:             true,
          email:          true,
          phone:          true,
          companyName:    true,
          jobTitle:       true,
          interestedPillars: true,
          frequency:      true,
          lang:           true,
        },
      }),
      // Subscription 订阅者（通过 email 关联）
      prisma.subscription.findMany({
        where: { isActive: true, email: { not: null } },
        select: {
          id:       true,
          email:    true,
          phone:    true,
          interests: true,
          frequency: true,
          lang:      true,
        },
      }),
    ])

    // ── 按 email 去重，合并 Lead 和 Subscription 的数据 ──────────────────
    const subscriberMap = new Map<string, {
      email: string
      name?: string
      interests: string[]
      frequency: string
      lang: 'zh' | 'en'
    }>()

    for (const lead of leads) {
      subscriberMap.set(lead.email, {
        email:    lead.email,
        name:     lead.companyName ?? undefined,
        interests: lead.interestedPillars,
        frequency: lead.frequency,
        lang:      (lead.lang as 'zh' | 'en') ?? 'zh',
      })
    }

    for (const sub of subscriptions) {
      if (!sub.email) continue
      if (!subscriberMap.has(sub.email)) {
        subscriberMap.set(sub.email, {
          email:    sub.email,
          interests: sub.interests,
          frequency: sub.frequency,
          lang:      (sub.lang as 'zh' | 'en') ?? 'zh',
        })
      }
    }

    const subscribers = Array.from(subscriberMap.values())

    // ── 逐个发送 ───────────────────────────────────────────────────────────
    const results = await Promise.allSettled(
      subscribers.map(sub =>
        sendOneDigest({
          to:        sub.email,
          email:     sub.email,
          lang:      sub.lang,
          frequency: sub.frequency,
          interests: sub.interests,
          name:      sub.name,
        })
      )
    )

    const summary = {
      total:      subscribers.length,
      sent:       results.filter(r => r.status === 'fulfilled' && r.value.status === 'sent').length,
      skipped:    results.filter(r => r.status === 'fulfilled' && r.value.status === 'skipped').length,
      errors:     results
        .filter(r => r.status === 'fulfilled' && r.value.status === 'error')
        .map(r => (r as PromiseFulfilledResult<{email: string; status: string; error: string}>).value),
      failed:     results.filter(r => r.status === 'rejected').length,
    }

    return NextResponse.json({
      success:  true,
      since:    since.toISOString(),
      minImportance: MIN_IMPORTANCE,
      ...summary,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[/api/cron/send-daily-digest]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
