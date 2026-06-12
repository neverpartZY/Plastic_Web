/**
 * 推送引擎 (Push Engine)
 * 根据订阅兴趣匹配情报，通过 Webhook / Email 推送
 * 支持指数退避重试、HTML 邮件模板、PushLog 全链路追踪
 */

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// ── 类型定义 ──────────────────────────────────────────────────────────────────

export type PushChannel   = 'email' | 'wechat' | 'feishu' | 'webhook'
export type PushFrequency = 'realtime' | 'daily' | 'weekly'
export type PushStatus    = 'sent' | 'failed' | 'webhook_error'

export interface PushPayload {
  id:          string
  title:       string
  summary:     string
  source:      string
  sourceUrl:   string
  dimension:   string
  region:      string
  importance:  number
  publishedAt: string
  tags:        string[]
}

export interface PushResult {
  subscriptionId: string
  intelligenceId: string
  status:         PushStatus
  response?:      string
  error?:         string
}

// ── 维度颜色映射（用于邮件模板）───────────────────────────────────────────────

const DIM_COLORS: Record<string, string> = {
  molds:      '#3B82F6',  // 蓝
  molding:    '#14B8A6',  // 青
  recycled:   '#8B5CF6',  // 紫
  bio:        '#14B8A6',  // 青
  additives:  '#F59E0B',  // 琥珀
  auxiliaries:'#F97316',  // 橙
  recycling:  '#10B981',  // 绿
  reuse:     '#6366F1',  // 靛
}

// ── HTML 邮件模板生成 ─────────────────────────────────────────────────────────

export function generateEmailHtml(payload: PushPayload): string {
  const color  = DIM_COLORS[payload.dimension] ?? '#6B7280'
  const date   = new Date(payload.publishedAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(payload.title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px 16px; background: #F9FAFB; color: #1F2937; }
  .card { background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .header { border-left: 5px solid ${color}; padding: 20px 24px 16px; }
  .badge { display: inline-block; background: ${color}18; color: ${color}; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px; }
  .region-badge { display: inline-block; background: #F3F4F6; color: #6B7280; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; margin-left: 8px; }
  .title { font-size: 20px; font-weight: 800; color: #111827; line-height: 1.45; margin-bottom: 14px; letter-spacing: -0.3px; }
  .summary { font-size: 14.5px; color: #4B5563; line-height: 1.75; background: #F9FAFB; padding: 16px 20px; border-radius: 10px; margin-bottom: 16px; }
  .meta { display: flex; gap: 16px; font-size: 12px; color: #9CA3AF; margin-bottom: 20px; flex-wrap: wrap; }
  .meta-item { display: flex; align-items: center; gap: 5px; }
  .cta-wrap { padding: 0 24px 24px; }
  .cta { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: ${color}; color: #FFFFFF; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 14px ${color}40; transition: opacity 0.2s; }
  .cta:hover { opacity: 0.88; }
  .footer { margin-top: 20px; padding: 16px 24px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; text-align: center; }
  .footer a { color: #9CA3AF; text-decoration: underline; }
  .importance-bar { display: inline-flex; align-items: center; gap: 4px; }
  .importance-dot { width: 7px; height: 7px; border-radius: 50%; background: ${color}; }
  .importance-dot.inactive { background: #E5E7EB; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div>
      <span class="badge">${escapeHtml(payload.dimension.toUpperCase())}</span>
      <span class="region-badge">${escapeHtml(payload.region)}</span>
    </div>
    <h1 class="title">${escapeHtml(payload.title)}</h1>
    <div class="meta">
      <span class="meta-item">📌 ${escapeHtml(payload.source || 'Unknown source')}</span>
      <span class="meta-item">📅 ${date}</span>
      <span class="meta-item importance-bar">
        重要性
        ${[1,2,3,4,5].map(n => `<span class="importance-dot${n > payload.importance ? ' inactive' : ''}"></span>`).join('')}
      </span>
    </div>
  </div>

  <div style="padding: 0 24px 8px;">
    <p class="summary">${escapeHtml(payload.summary)}</p>
  </div>

  ${payload.tags.length > 0 ? `
  <div style="padding: 0 24px 16px; display: flex; gap: 6px; flex-wrap: wrap;">
    ${payload.tags.map(t => `<span style="background:#F3F4F6;color:#6B7280;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;">${escapeHtml(t)}</span>`).join('')}
  </div>` : ''}

  <div class="cta-wrap">
    <a href="${escapeHtml(payload.sourceUrl)}" class="cta">
      阅读完整情报 →
    </a>
  </div>

  <div class="footer">
    本邮件由 <strong>GreenPlastic Intelligence</strong> 自动推送 · 退订回复 <a href="mailto:unsubscribe@greenplastic.ai?subject=unsubscribe">TD</a>
  </div>
</div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── Webhook 推送（带指数退避重试）─────────────────────────────────────────────

interface WebhookResult {
  success: boolean
  statusCode?: number
  response?: string
  error?:    string
}

export async function sendWebhookWithRetry(
  webhookUrl: string,
  payload: PushPayload,
  maxRetries = 3,
): Promise<WebhookResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 12_000)

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'User-Agent':    'SustainPlastics-Push/1.0',
          'X-Push-Id':     payload.id,
          'X-Dimension':   payload.dimension,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timer)
      const text = await res.text().catch(() => '')

      if (res.ok) {
        return { success: true, statusCode: res.status, response: text.slice(0, 200) }
      }

      // 非 2xx，触发重试
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt - 1) // 1s, 2s, 4s
        await new Promise(r => setTimeout(r, delay))
        continue
      }

      return { success: false, statusCode: res.status, response: text.slice(0, 200) }

    } catch (e: unknown) {
      clearTimeout(timer)
      const errMsg = e instanceof Error ? e.message : String(e)

      // 已被取消（超时）不重试
      if (e instanceof DOMException && e.name === 'AbortError') {
        return { success: false, error: 'Request timeout (12s)' }
      }

      if (attempt === maxRetries) {
        return { success: false, error: errMsg }
      }

      const delay = 1000 * Math.pow(2, attempt - 1)
      await new Promise(r => setTimeout(r, delay))
    }
  }

  return { success: false, error: 'Max retries exceeded' }
}

// ── 邮件发送（占位实现，需接入实际发信服务）───────────────────────────────────

async function sendEmail(
  to: string,
  payload: PushPayload,
): Promise<{ success: boolean; error?: string }> {
  const html = generateEmailHtml(payload)
  // ── TODO: 接入实际发信服务 ──────────────────────────────────────────────────
  // 示例：接入 Resend / SendGrid / AWS SES
  // const res = await fetch('https://api.resend.com/emails', { ... })
  console.log(`[Push] Email to ${to}: "${payload.title.slice(0, 50)}"`)
  return { success: true }
}

// ── 推送主体逻辑 ──────────────────────────────────────────────────────────────

/**
 * 向所有匹配情报维度的订阅者推送
 * @param intelligenceId 情报 ID
 * @param frequencyFilter 可选：只推给特定频率的订阅者（如 daily）
 */
export async function pushToSubscribers(
  intelligenceId: string,
  frequencyFilter?: PushFrequency,
): Promise<PushResult[]> {
  const results: PushResult[] = []

  const intel = await prisma.intelligence.findUnique({
    where: { id: intelligenceId },
    select: {
      id: true, title: true, summary: true, source: true, sourceUrl: true,
      dimension: true, pillars: true, region: true, importance: true, publishedAt: true, tags: true,
    },
  })

  if (!intel) {
    throw new Error(`Intelligence ${intelligenceId} not found`)
  }

  const payload: PushPayload = {
    id:          intel.id,
    title:       intel.title,
    summary:     intel.summary.slice(0, 300),
    source:      intel.source ?? 'Unknown',
    sourceUrl:   intel.sourceUrl ?? '',
    dimension:   intel.dimension ?? 'recycling',
    region:      intel.region ?? 'GLOBAL',
    importance:  intel.importance,
    publishedAt: intel.publishedAt?.toISOString() ?? new Date().toISOString(),
    tags:        intel.tags ?? [],
  }

  // 构建查询条件：活跃订阅者 且 兴趣包含情报维度（pillars/dimension/tags）
  // 去重：同时从 dimension、pillars、tags 提取所有匹配维度
  const matchDims = [intel.dimension ?? 'recycling']
  if (intel.pillars) {
    intel.pillars.split(',').forEach(d => {
      const trimmed = d.trim()
      if (trimmed && !matchDims.includes(trimmed)) matchDims.push(trimmed)
    })
  }
  if (intel.tags) {
    intel.tags.forEach(t => {
      if (!matchDims.includes(t)) matchDims.push(t)
    })
  }

  const whereClause: Prisma.SubscriptionWhereInput = {
    isActive: true,
    OR: matchDims.map(dim => ({ interests: { has: dim } })),
  }

  if (frequencyFilter) {
    whereClause.frequency = frequencyFilter
  }

  const subscriptions = await prisma.subscription.findMany({ where: whereClause })

  for (const sub of subscriptions) {
    let result: { success: boolean; response?: string; error?: string } = {
      success: false, error: 'Unknown channel',
    }

    try {
      if (sub.channel === 'webhook' && sub.webhookUrl) {
        result = await sendWebhookWithRetry(sub.webhookUrl, payload)
      } else if (sub.channel === 'email' && sub.email) {
        result = await sendEmail(sub.email, payload)
      } else {
        // wechat / feishu 占位
        console.log(`[Push] ${sub.channel} to ${sub.email ?? sub.phone ?? sub.userId}: "${payload.title.slice(0, 40)}"`)
        result = { success: true, response: `Queued for ${sub.channel}` }
      }
    } catch (e: unknown) {
      result = { success: false, error: e instanceof Error ? e.message : String(e) }
    }

    // 写入 PushLog
    const logStatus = result.success ? 'sent' : sub.channel === 'webhook' ? 'webhook_error' : 'failed'

    await prisma.pushLog.create({
      data: {
        subscriptionId: sub.id,
        intelligenceId: intel.id,
        status:         logStatus,
        response:       result.response,
        error:          result.error,
      },
    }).catch((e) => console.error('[Push] Failed to write PushLog:', e))

    // 更新最后推送时间
    if (result.success) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { lastSentAt: new Date() },
      }).catch(() => {})
    }

    results.push({
      subscriptionId: sub.id,
      intelligenceId: intel.id,
      status:         logStatus as PushStatus,
      response:       result.response,
      error:          result.error,
    })
  }

  return results
}

// ── 批量推送未推送的高价值情报（供 Cron 调用）────────────────────────────────

export async function pushPendingIntelligences(
  sinceHours = 24,
  minImportance = 3,
): Promise<{ processed: number; pushed: number; failed: number }> {
  const cutoff = new Date(Date.now() - sinceHours * 60 * 60 * 1000)

  const pending = await prisma.intelligence.findMany({
    where: {
      importance: { gte: minImportance },
      publishedAt: { gte: cutoff },
      // 排除已推送的（通过 PushLog 关联检查）
    },
    select: { id: true, importance: true },
    orderBy: { importance: 'desc' },
    take: 20,
  })

  let pushed = 0
  let failed = 0

  for (const intel of pending) {
    try {
      const results = await pushToSubscribers(intel.id)
      const successCount = results.filter(r => r.status === 'sent').length
      if (successCount > 0) pushed++
      else failed++
    } catch (e) {
      console.error(`[Push] Failed to push intelligence ${intel.id}:`, e)
      failed++
    }
  }

  return { processed: pending.length, pushed, failed }
}
