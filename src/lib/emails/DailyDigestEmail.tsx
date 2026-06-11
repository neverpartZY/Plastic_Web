'use client'

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
} from '@react-email/components'

// ── 类型定义 ──────────────────────────────────────────────────────────────────

interface DigestItem {
  id: string
  title: string
  summary: string
  sourceUrl: string
  source: string | null
  publishedAt: string
  importance?: number       // 1-5, 重要性评分
  pillar?: string           // 维度: molds | molding | materials | additives | auxiliaries | recycling | reuse
}

interface DailyDigestEmailProps {
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
const SLATE_100     = '#f1f5f9'

// 维度颜色映射
const PILLAR_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  molds:      { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  molding:    { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e' },
  materials:  { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' },
  additives:  { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
  auxiliaries:{ bg: '#fff7ed', border: '#f97316', text: '#c2410c' },
  recycling:  { bg: '#ecfdf5', border: '#10b981', text: '#047857' },
  reuse:      { bg: '#eef2ff', border: '#6366f1', text: '#4338ca' },
}

function getPillarStyle(pillar?: string) {
  if (!pillar) return { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' }
  return PILLAR_COLORS[pillar] ?? { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' }
}

function getImportanceDots(importance: number = 3) {
  return [1,2,3,4,5].map(n =>
    `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${n <= importance ? '#059669' : '#e2e8f0'};margin-right:3px"></span>`
  ).join('')
}

// ── 纯字符串渲染函数（服务器端使用）────────────────────────────────────────

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
  const title = isZh ? '每日情报简报' : 'Daily Intelligence Digest'
  const subtitle = isZh
    ? '以下是您订阅维度的最新动态'
    : 'Latest updates from your subscribed dimensions'
  const viewArticle = isZh ? '阅读原文' : 'Read full article'
  const unsubscribe = isZh ? '退订此邮件' : 'Unsubscribe'
  const poweredBy = isZh ? '由绿塑科技情报引擎驱动' : 'Powered by GreenPlastic Intelligence'
  const footerCopyright = isZh
    ? '© 2026 绿塑科技（SustainPlastics）保留所有权利'
    : '© 2026 GreenPlastic. All rights reserved.'

  const tagsHtml = interests.map(tag => {
    const s = getPillarStyle(tag)
    return `<span style="background:${s.bg};color:${s.text};border:1px solid ${s.border};border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700">${tag}</span>`
  }).join(' ')

  const itemsHtml = items.map((item, index) => {
    const pillar = item.pillar ?? interests[0]
    const s = getPillarStyle(pillar)
    const pillarLabel = isZh ? pillar : pillar
    const date = new Date(item.publishedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })

    return `
    <section style="padding:20px 36px;border-left:4px solid ${s.border};background:${pillar === item.pillar ? s.bg : '#fafafa'};margin:12px 0">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        <span style="color:${EMERALD};font-size:11px;font-weight:800">#${index + 1}</span>
        <span style="background:${s.bg};color:${s.text};border:1px solid ${s.border};border-radius:12px;padding:2px 8px;font-size:10px;font-weight:700">${pillarLabel}</span>
        ${item.source ? `<span style="color:${SLATE_400};font-size:11px">${item.source}</span>` : ''}
        <span style="color:${SLATE_400};font-size:11px;margin-left:auto">${date}</span>
      </div>
      <a href="${item.sourceUrl}" style="color:#0f172a;font-size:17px;font-weight:800;text-decoration:none;line-height:1.4;display:block;margin-bottom:10px;letter-spacing:-0.2px">${item.title}</a>
      <p style="color:${SLATE_700};font-size:13.5px;line-height:1.7;margin:0 0 14px">${item.summary}</p>
      ${item.importance ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">${getImportanceDots(item.importance)}</div>` : ''}
      <a href="${item.sourceUrl}" style="display:inline-block;background:${EMERALD};color:#fff;border-radius:8px;padding:8px 18px;font-size:12px;font-weight:700;text-decoration:none;box-shadow:0 2px 8px rgba(5,150,105,0.25)">${viewArticle} →</a>
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
    <img src="https://greenplastic.ai/logo.png" alt="GreenPlastic" width="48" height="48" style="width:48px;height:48px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15)">
    <div>
      <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.3px;display:block;line-height:1.2">绿塑科技</span>
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
    <p style="color:${EMERALD};font-size:14px;font-weight:800;margin:0 0 4px">🌿 绿塑科技</p>
    <p style="color:${SLATE_400};font-size:11px;margin:0 0 12px">${poweredBy}</p>
    <a href="${unsubscribeUrl}" style="color:${SLATE_400};font-size:11px;display:block;margin-bottom:8px;text-decoration:underline">${unsubscribe}</a>
    <p style="color:${SLATE_400};font-size:10px;margin:0">${footerCopyright}</p>
  </div>
</div>
</body>
</html>`
}

// ── React Email 组件 ───────────────────────────────────────────────────────

export function DailyDigestEmail({
  recipientName: _name,
  email: _email,
  lang = 'zh',
  frequency: _frequency,
  interests,
  items,
  unsubscribeUrl,
}: DailyDigestEmailProps) {
  const isZh = lang === 'zh'
  const title = isZh ? '每日情报简报' : 'Daily Intelligence Digest'
  const subtitle = isZh
    ? '以下是您订阅维度的最新动态'
    : 'Latest updates from your subscribed dimensions'
  const viewArticle = isZh ? '阅读原文' : 'Read full article'
  const unsubscribe = isZh ? '退订此邮件' : 'Unsubscribe'
  const poweredBy = isZh ? '由绿塑科技情报引擎驱动' : 'Powered by GreenPlastic Intelligence'
  const footerCopyright = isZh
    ? '© 2026 绿塑科技（SustainPlastics）保留所有权利'
    : '© 2026 GreenPlastic. All rights reserved.'

  return (
    <Html lang={lang}>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerSection}>
            <Img src="https://greenplastic.ai/logo.png" alt="GreenPlastic" width="48" height="48" style={logoStyle} />
            <Section style={headerTextSection}>
              <Text style={brandName}>绿塑科技</Text>
              <Text style={brandSub}>SustainPlastics Intelligence</Text>
            </Section>
          </Section>

          {/* Title */}
          <Section style={titleSection}>
            <Text style={mainTitle}>{title}</Text>
            <Text style={mainSubtitle}>{subtitle}</Text>
            <Section style={tagRow}>
              {interests.map(tag => {
                const s = getPillarStyle(tag)
                return <span key={tag} style={{ ...tagStyle, backgroundColor: s.bg, color: s.text, borderColor: s.border }}>{tag}</span>
              })}
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Items */}
          {items.map((item, index) => {
            const pillar = item.pillar ?? interests[0]
            const s = getPillarStyle(pillar)
            return (
              <Section key={item.id} style={{ ...itemSection, borderLeft: `4px solid ${s.border}`, backgroundColor: pillar === item.pillar ? s.bg : '#fafafa' }}>
                <Section style={itemHeader}>
                  <Text style={itemNumber}>#{index + 1}</Text>
                  <span style={{ ...pillarBadge, backgroundColor: s.bg, color: s.text, borderColor: s.border }}>{pillar}</span>
                  {item.source && <Text style={itemSource}>{item.source}</Text>}
                  <Text style={{ ...itemDate, marginLeft: 'auto' }}>{new Date(item.publishedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</Text>
                </Section>
                <Link href={item.sourceUrl} style={itemTitle}>{item.title}</Link>
                <Text style={itemSummary}>{item.summary}</Text>
                {item.importance && (
                  <Section style={importanceRow}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: n <= item.importance! ? EMERALD : '#e2e8f0', marginRight: 3, display: 'inline-block' }} />
                    ))}
                  </Section>
                )}
                <Link href={item.sourceUrl} style={readMoreBtn}>{viewArticle} →</Link>
              </Section>
            )
          })}

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerBrand}>🌿 绿塑科技</Text>
            <Text style={footerPowered}>{poweredBy}</Text>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>{unsubscribe}</Link>
            <Text style={footerAddress}>{footerCopyright}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ── 样式 ───────────────────────────────────────────────────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif',
  margin: 0,
  padding: '40px 0',
}

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  maxWidth: '600px',
  margin: '0 auto',
  overflow: 'hidden',
  boxShadow: '0 25px 70px -20px rgba(0,0,0,0.1)',
}

const headerSection: React.CSSProperties = {
  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  padding: '32px 36px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
}

const logoStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}

const headerTextSection: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

const brandName: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: 800,
  margin: 0,
  lineHeight: 1.2,
  letterSpacing: '-0.3px',
}

const brandSub: React.CSSProperties = {
  color: 'rgba(255,255,255,0.75)',
  fontSize: '11px',
  margin: '2px 0 0',
  letterSpacing: '0.05em',
}

const titleSection: React.CSSProperties = {
  padding: '28px 36px 20px',
}

const mainTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '26px',
  fontWeight: 900,
  margin: '0 0 6px',
  lineHeight: 1.25,
  letterSpacing: '-0.4px',
}

const mainSubtitle: React.CSSProperties = {
  color: SLATE_400,
  fontSize: '13px',
  margin: '0 0 18px',
}

const tagRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  alignItems: 'center',
}

const tagStyle: React.CSSProperties = {
  borderRadius: '20px',
  padding: '4px 12px',
  fontSize: '11px',
  fontWeight: 700,
  border: '1px solid',
}

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '0 36px',
}

const itemSection: React.CSSProperties = {
  padding: '20px 36px',
  margin: '12px 0',
}

const itemHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '10px',
  flexWrap: 'wrap' as const,
}

const itemNumber: React.CSSProperties = {
  color: EMERALD,
  fontSize: '11px',
  fontWeight: 800,
  margin: 0,
}

const pillarBadge: React.CSSProperties = {
  borderRadius: '12px',
  padding: '2px 8px',
  fontSize: '10px',
  fontWeight: 700,
  border: '1px solid',
}

const itemSource: React.CSSProperties = {
  color: SLATE_400,
  fontSize: '11px',
  margin: 0,
}

const itemDate: React.CSSProperties = {
  color: SLATE_400,
  fontSize: '11px',
  margin: 0,
}

const itemTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '17px',
  fontWeight: 800,
  textDecoration: 'none',
  lineHeight: 1.4,
  display: 'block',
  marginBottom: '10px',
  letterSpacing: '-0.2px',
}

const itemSummary: React.CSSProperties = {
  color: SLATE_700,
  fontSize: '13.5px',
  lineHeight: 1.7,
  margin: '0 0 14px',
}

const importanceRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '3px',
  marginBottom: '12px',
}

const readMoreBtn: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: EMERALD,
  color: '#ffffff',
  borderRadius: '8px',
  padding: '8px 18px',
  fontSize: '12px',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
}

const footerSection: React.CSSProperties = {
  padding: '24px 36px',
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
  textAlign: 'center' as const,
}

const footerBrand: React.CSSProperties = {
  color: EMERALD,
  fontSize: '14px',
  fontWeight: 800,
  margin: '0 0 4px',
}

const footerPowered: React.CSSProperties = {
  color: SLATE_400,
  fontSize: '11px',
  margin: '0 0 12px',
}

const unsubscribeLink: React.CSSProperties = {
  color: SLATE_400,
  fontSize: '11px',
  textDecoration: 'underline',
  display: 'block',
  marginBottom: '8px',
}

const footerAddress: React.CSSProperties = {
  color: SLATE_400,
  fontSize: '10px',
  margin: 0,
}
