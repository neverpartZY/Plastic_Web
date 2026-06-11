// 每日情报邮件HTML渲染器（纯函数，服务器端可用）

// ── 类型定义 ──────────────────────────────────────────────────────────────────

export interface DigestItem {
  id: string
  title: string
  summary: string
  sourceUrl: string
  source: string | null
  publishedAt: string
  importance?: number
  pillar?: string
}

export interface DailyDigestEmailProps {
  recipientName?: string
  email: string
  lang?: 'zh' | 'en'
  frequency: string
  interests: string[]
  items: DigestItem[]
  unsubscribeUrl: string
}

// ── 颜色常量 ─────────────────────────────────────────────────────────────────

const EMERALD       = '#059669'
const EMERALD_LIGHT = '#ecfdf5'
const EMERALD_BORDER= '#a7f3d0'
const SLATE_700     = '#334155'
const SLATE_400     = '#94a3b8'

const PILLAR_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  molds:      { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  molding:    { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e' },
  recycled:   { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' },
  bio:        { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e' },
  additives:  { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
  auxiliaries:{ bg: '#fff7ed', border: '#f97316', text: '#c2410c' },
  recycling:  { bg: '#ecfdf5', border: '#10b981', text: '#047857' },
  reuse:      { bg: '#eef2ff', border: '#6366f1', text: '#4338ca' },
}

function getPillarStyle(pillar?: string) {
  if (!pillar) return { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' }
  return PILLAR_COLORS[pillar] ?? { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getImportanceDots(importance: number = 3): string {
  return [1,2,3,4,5].map(n =>
    `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${n <= importance ? EMERALD : '#e2e8f0'};margin-right:3px"></span>`
  ).join('')
}

// ── 纯字符串渲染函数 ─────────────────────────────────────────────────────────

export function renderDailyDigestEmail(props: DailyDigestEmailProps): string {
  const {
    recipientName: _name,
    email: _email,
    lang = 'zh',
    frequency: _frequency,
    interests,
    items,
    unsubscribeUrl,
  } = props

  const isZh = lang === 'zh'
  const title = isZh ? '塑料循环日报' : 'Plastic Circular Daily'
  const subtitle = isZh
    ? '以下是您订阅维度的最新动态'
    : 'Latest updates from your subscribed dimensions'
  const viewArticle = isZh ? '阅读原文' : 'Read full article'
  const unsubscribe = isZh ? '退订此邮件' : 'Unsubscribe'
  const poweredBy = isZh ? '由塑料循环日报引擎驱动' : 'Powered by Plastic Circular Daily'
  const footerCopyright = isZh
    ? '© 2026 北京国嘉基业信息咨询有限公司 保留所有权利'
    : '© 2026 Beijing GuoJiaJiYe Information Consulting Co., Ltd. All rights reserved.'

  const tagsHtml = interests.map(tag => {
    const s = getPillarStyle(tag)
    return `<span style="background:${s.bg};color:${s.text};border:1px solid ${s.border};border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700">${escapeHtml(tag)}</span>`
  }).join(' ')

  const itemsHtml = items.map((item, index) => {
    const pillar = item.pillar ?? interests[0]
    const s = getPillarStyle(pillar)
    const pillarLabel = pillar
    const date = new Date(item.publishedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })

    return `
    <section style="padding:20px 36px;border-left:4px solid ${s.border};background:${pillar === item.pillar ? s.bg : '#fafafa'};margin:12px 0">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        <span style="color:${EMERALD};font-size:11px;font-weight:800">#${index + 1}</span>
        <span style="background:${s.bg};color:${s.text};border:1px solid ${s.border};border-radius:12px;padding:2px 8px;font-size:10px;font-weight:700">${escapeHtml(pillarLabel)}</span>
        ${item.source ? `<span style="color:${SLATE_400};font-size:11px">${escapeHtml(item.source)}</span>` : ''}
        <span style="color:${SLATE_400};font-size:11px;margin-left:auto">${date}</span>
      </div>
      <a href="${escapeHtml(item.sourceUrl)}" style="color:#0f172a;font-size:17px;font-weight:800;text-decoration:none;line-height:1.4;display:block;margin-bottom:10px;letter-spacing:-0.2px">${escapeHtml(item.title)}</a>
      <p style="color:${SLATE_700};font-size:13.5px;line-height:1.7;margin:0 0 14px">${escapeHtml(item.summary)}</p>
      ${item.importance ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">${getImportanceDots(item.importance)}</div>` : ''}
      <a href="${escapeHtml(item.sourceUrl)}" style="display:inline-block;background:${EMERALD};color:#fff;border-radius:8px;padding:8px 18px;font-size:12px;font-weight:700;text-decoration:none;box-shadow:0 2px 8px rgba(5,150,105,0.25)">${viewArticle} →</a>
    </section>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
</head>
<body style="background:#f1f5f9;font-family:'Inter','PingFang SC','Microsoft YaHei',sans-serif;margin:0;padding:40px 0">
<div style="background:#fff;border-radius:20px;border:1px solid #e2e8f0;max-width:600px;margin:0 auto;overflow:hidden;box-shadow:0 25px 70px -20px rgba(0,0,0,0.1)">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:32px 36px;display:flex;align-items:center;gap:14px">
    <img src="https://greenplastic.ai/logo-email.svg" alt="GuoJiaJiYe" width="48" height="48" style="width:48px;height:48px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15)">
    <div>
      <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.3px;display:block;line-height:1.2">国嘉基业</span>
      <span style="color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:.05em;margin-top:2px;display:block">SustainPlastics Intelligence</span>
    </div>
  </div>
  <!-- Title section -->
  <div style="padding:28px 36px 20px">
    <h1 style="color:#0f172a;font-size:26px;font-weight:900;margin:0 0 6px;line-height:1.25;letter-spacing:-0.4px">${title}</h1>
    <p style="color:${SLATE_400};font-size:13px;margin:0 0 18px">${subtitle}</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">${tagsHtml}</div>
  </div>
  <!-- Divider -->
  <div style="height:1px;background:linear-gradient(90deg,#e2e8f0,#f1f5f9,#e2e8f0);margin:0 36px"></div>
  <!-- Items -->
  <div style="padding:8px 0">${itemsHtml}</div>
  <!-- Footer -->
  <div style="padding:24px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
    <p style="color:${EMERALD};font-size:14px;font-weight:800;margin:0 0 4px">🌿 国嘉基业</p>
    <p style="color:${SLATE_400};font-size:11px;margin:0 0 12px">${poweredBy}</p>
    <a href="${unsubscribeUrl}" style="color:${SLATE_400};font-size:11px;display:block;margin-bottom:8px;text-decoration:underline">${unsubscribe}</a>
    <p style="color:${SLATE_400};font-size:10px;margin:0">${footerCopyright}</p>
  </div>
</div>
</body>
</html>`
}
