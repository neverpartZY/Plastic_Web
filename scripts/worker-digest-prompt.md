# Worker 端日报邮件发送 — 实现提示词

## 背景

Plastic_Web 项目目前由两部分组成：
- **Vercel 网站**（本仓库）：负责前端展示 + 每日摘要 Cron 邮件
- **ECS Worker**（47.108.178.124:3300）：负责 AI 精炼流水线（/refine, /batch-refine, /update-refined）

**问题**：Neon PostgreSQL 免费额度每月只有 100 CU-hrs，但每月中旬就耗尽。主要消耗来源：
1. Worker 精炼流水线（每天 5:00-6:45 北京时间）— 不可避免
2. Vercel 每日摘要 Cron（每天 7:57 北京时间）— 每次 ~4+ 次 DB 查询，订阅者越多越重
3. 网站正常流量

**目标**：把每日摘要邮件的构建和发送迁移到 Worker 端，在精炼流水线完成后直接执行。Worker 本来就在操作数据库，复用同一个连接，不增加额外 DB 连接开销，而且不消耗 Vercel 的 Function 执行时间。

## 架构变化

```
之前：Worker 精炼 → Vercel Cron → 查 DB → 发邮件 → 写 PushLog
之后：Worker 精炼 → 同一个 Worker 进程 → 查 DB → 发邮件 → 写 PushLog
                                           ↑
                              Vercel Cron 可禁用
```

## 数据库结构（Prisma/PostgreSQL）

Worker 已有 DATABASE_URL 连接 Neon。涉及的表：

### Intelligence（情报）— 核心数据
```
id, title, summary, content
titleZh, titleEn, summaryZh, summaryEn, contentZh, contentEn
tldrZh, tldrEn
category, pillars (逗号分隔多维度), dimension (主维度)
countryCode, region
importance (1-5), isHot, isPremium
source, sourceUrl
refineStatus (completed=精炼完成)
publishedAt, createdAt, updatedAt
```

### Lead（订阅者，来自情报墙入口）
```
id, email, companyName, interestedPillars (String[]),
frequency (daily|weekly), lang (zh|en), isActive
```

### Subscription（订阅者，来自注册用户）
```
id, email, interests (String[]),
frequency (daily|weekly), lang (zh|en), isActive
```

### PushLog（推送日志）
```
id, subscriptionId?, leadId?, intelligenceId,
status (sent|failed), response (邮件ID), error, createdAt
```

## 实现要求

在 Worker 现有精炼流水线完成后，新增一个步骤：

### 1. 查询候选情报（1 次 DB 查询，所有订阅者共享）

```sql
SELECT * FROM "Intelligence"
WHERE "publishedAt" >= (CURRENT_DATE - INTERVAL '1 day' AT TIME ZONE 'UTC')
  AND "importance" >= 1
  AND "summary" != ''
  AND "refineStatus" = 'completed'
ORDER BY "importance" DESC, "publishedAt" DESC
LIMIT 50
```

### 2. 查询订阅者（2 次并行 DB 查询）

```sql
SELECT id, email, "companyName", "interestedPillars", frequency, lang
FROM "Lead" WHERE "isActive" = true;

SELECT id, email, interests, frequency, lang
FROM "Subscription" WHERE "isActive" = true AND email IS NOT NULL;
```

### 3. 合并去重

按 email 去重，Lead 优先（有 companyName）。合并后的订阅者列表。

### 4. 为每个订阅者构建摘要（纯内存计算，不查 DB）

对于每个订阅者：
- 从候选池中筛选匹配 interests / interestedPillars 的情报
- 匹配逻辑：情报的 pillars（逗号分隔）+ dimension 字段，与订阅者的 interests 数组做交集
- 语言选择：lang='zh' 时优先取 titleZh/summaryZh，否则取 titleEn/summaryEn，fallback 到原始 title/summary
- 跨维度推荐：从剩余候选中取 importance >= 4 的，最多 3 条
- 如果匹配数为 0，跳过该订阅者

### 5. 渲染邮件 HTML

使用纯字符串模板渲染，**不依赖 React**。邮件格式如下（直接用 JavaScript 模板字符串实现）：

```javascript
// 颜色常量
const EMERALD = '#059669';
const SLATE_700 = '#334155';
const SLATE_400 = '#94a3b8';

// 维度颜色映射
const PILLAR_COLORS = {
  molds:      { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  molding:    { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e' },
  recycled:   { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' },
  recycling:  { bg: '#ecfdf5', border: '#10b981', text: '#047857' },
  reuse:      { bg: '#eef2ff', border: '#6366f1', text: '#4338ca' },
  additives:  { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
  auxiliaries:{ bg: '#fff7ed', border: '#f97316', text: '#c2410c' },
  materials:  { bg: '#fdf2f8', border: '#ec4899', text: '#be185d' },
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getPillarStyle(pillar) {
  return PILLAR_COLORS[pillar] || { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' };
}

function getImportanceDots(importance = 3) {
  return [1,2,3,4,5].map(n =>
    `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${n <= importance ? EMERALD : '#e2e8f0'};margin-right:3px"></span>`
  ).join('');
}

function renderDigestEmail({ recipientName, lang, interests, items, crossDimensionItems, unsubscribeUrl }) {
  const isZh = lang === 'zh';
  const title = isZh ? '塑料循环日报' : 'Plastic Circular Daily';
  const viewArticle = isZh ? '阅读原文' : 'Read full article';
  const unsubscribe = isZh ? '退订此邮件' : 'Unsubscribe';

  // 维度标签
  const tagsHtml = interests.map(tag => {
    const s = getPillarStyle(tag);
    return `<span style="background:${s.bg};color:${s.text};border:1px solid ${s.border};border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700">${escapeHtml(tag)}</span>`;
  }).join(' ');

  // 情报条目列表
  const itemsHtml = items.map((item, index) => {
    const pillar = item.pillar || interests[0];
    const s = getPillarStyle(pillar);
    const date = new Date(item.publishedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

    return `
    <section style="padding:20px 36px;border-left:4px solid ${s.border};background:${pillar === item.pillar ? s.bg : '#fafafa'};margin:12px 0">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        <span style="color:${EMERALD};font-size:11px;font-weight:800">#${index + 1}</span>
        <span style="background:${s.bg};color:${s.text};border:1px solid ${s.border};border-radius:12px;padding:2px 8px;font-size:10px;font-weight:700">${escapeHtml(pillar)}</span>
        ${item.source ? `<span style="color:${SLATE_400};font-size:11px">${escapeHtml(item.source)}</span>` : ''}
        <span style="color:${SLATE_400};font-size:11px;margin-left:auto">${date}</span>
      </div>
      <a href="${escapeHtml(item.sourceUrl)}" style="color:#0f172a;font-size:17px;font-weight:800;text-decoration:none;line-height:1.4;display:block;margin-bottom:10px">${escapeHtml(item.title)}</a>
      <p style="color:${SLATE_700};font-size:13.5px;line-height:1.7;margin:0 0 14px">${escapeHtml(item.summary)}</p>
      ${item.importance ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">${getImportanceDots(item.importance)}</div>` : ''}
      <a href="${escapeHtml(item.sourceUrl)}" style="display:inline-block;background:${EMERALD};color:#fff;border-radius:8px;padding:8px 18px;font-size:12px;font-weight:700;text-decoration:none;box-shadow:0 2px 8px rgba(5,150,105,0.25)">${viewArticle} →</a>
    </section>`;
  }).join('');

  // 跨维度亮点
  let crossSectionHtml = '';
  if (crossDimensionItems && crossDimensionItems.length > 0) {
    const crossItemsHtml = crossDimensionItems.map(item => {
      const s = getPillarStyle(item.pillar);
      const date = new Date(item.publishedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      return `
    <section style="padding:16px 36px;border-left:4px solid ${s.border};background:#fafafa;margin:8px 0">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="background:${s.bg};color:${s.text};border:1px solid ${s.border};border-radius:12px;padding:2px 8px;font-size:10px;font-weight:700">${escapeHtml(item.pillar || '')}</span>
        <span style="color:${SLATE_400};font-size:11px;margin-left:auto">${date}</span>
      </div>
      <a href="${escapeHtml(item.sourceUrl)}" style="color:#0f172a;font-size:15px;font-weight:700;text-decoration:none">${escapeHtml(item.title)}</a>
      <p style="color:${SLATE_700};font-size:12.5px;line-height:1.6;margin:6px 0">${escapeHtml(item.summary)}</p>
      <a href="${escapeHtml(item.sourceUrl)}" style="display:inline-block;background:#6366f1;color:#fff;border-radius:6px;padding:6px 14px;font-size:11px;font-weight:700;text-decoration:none">${viewArticle} →</a>
    </section>`;
    }).join('');

    crossSectionHtml = `
  <div style="padding:8px 36px 20px">
    <div style="height:1px;background:linear-gradient(90deg,#e2e8f0,#c7d2fe,#e2e8f0);margin:20px 0 16px"></div>
    <h2 style="color:#4338ca;font-size:17px;font-weight:800;margin:0 0 4px">${isZh ? '🌐 跨维度亮点' : '🌐 Cross-Dimension Highlights'}</h2>
    <p style="color:${SLATE_400};font-size:12px;margin:0 0 8px">${isZh ? '以下高分资讯来自其他维度，也许您也会感兴趣' : 'High-impact updates from other dimensions you may find interesting'}</p>
    ${crossItemsHtml}
  </div>`;
  }

  // 完整 HTML
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
</head>
<body style="background:#f1f5f9;font-family:'Inter','PingFang SC','Microsoft YaHei',sans-serif;margin:0;padding:40px 0">
<div style="background:#fff;border-radius:20px;border:1px solid #e2e8f0;max-width:600px;margin:0 auto;overflow:hidden;box-shadow:0 25px 70px -20px rgba(0,0,0,0.1)">
  <div style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:32px 36px;display:flex;align-items:center;gap:14px">
    <img src="https://greenplastic.ai/logo-email.svg" alt="GuoJiaJiYe" width="48" height="48" style="width:48px;height:48px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15)">
    <div>
      <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.3px;display:block;line-height:1.2">国嘉基业</span>
      <span style="color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:.05em;margin-top:2px;display:block">SustainPlastics Intelligence</span>
    </div>
  </div>
  <div style="padding:28px 36px 20px">
    <h1 style="color:#0f172a;font-size:26px;font-weight:900;margin:0 0 6px;line-height:1.25">${title}</h1>
    <p style="color:${SLATE_400};font-size:13px;margin:0 0 18px">${isZh ? '以下是您订阅维度的最新动态' : 'Latest updates from your subscribed dimensions'}</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px">${tagsHtml}</div>
  </div>
  <div style="height:1px;background:linear-gradient(90deg,#e2e8f0,#f1f5f9,#e2e8f0);margin:0 36px"></div>
  <div style="padding:8px 0">${itemsHtml}</div>
  ${crossSectionHtml}
  <div style="padding:24px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
    <p style="color:${EMERALD};font-size:14px;font-weight:800;margin:0 0 4px">🌿 国嘉基业</p>
    <p style="color:${SLATE_400};font-size:11px;margin:0 0 12px">${isZh ? '由塑料循环日报引擎驱动' : 'Powered by Plastic Circular Daily'}</p>
    <a href="${unsubscribeUrl}" style="color:${SLATE_400};font-size:11px;display:block;margin-bottom:8px;text-decoration:underline">${unsubscribe}</a>
    <p style="color:${SLATE_400};font-size:10px;margin:0">${isZh ? '© 2026 北京国嘉基业信息咨询有限公司 保留所有权利' : '© 2026 Beijing GuoJiaJiYe Information Consulting Co., Ltd. All rights reserved.'}</p>
  </div>
</div>
</body>
</html>`;
}
```

### 6. 发送邮件（Resend API）

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'daily@greenplastic.ai';

async function sendEmail(to, subject, html, lang = 'zh') {
  const fromName = lang === 'zh' ? '塑料循环日报' : 'Plastic Circular Daily';
  const from = `${fromName} <${FROM_EMAIL}>`;
  const result = await resend.emails.send({ from, to, subject, html });
  if (result.error) throw new Error(`Resend error: ${result.error.message}`);
  return { id: result.data?.id || 'unknown' };
}
```

### 7. 批量写入 PushLog（1 次 DB 操作）

```javascript
// 所有订阅者发送完成后，一次性写入
const pushLogEntries = [];
for (const result of allResults) {
  if (result.status === 'sent') {
    for (const item of result.items) {
      pushLogEntries.push({
        leadId: null,
        intelligenceId: item.id,
        status: 'sent',
        response: result.msgId,
      });
    }
  }
}
if (pushLogEntries.length > 0) {
  await prisma.pushLog.createMany({ data: pushLogEntries });
}
```

### 8. 邮件主题

```javascript
const subject = lang === 'zh'
  ? `【塑料循环日报】${interests.join(' · ')} 最新动态`
  : `[Plastic Circular Daily] ${interests.join(' · ')} Updates`;
```

### 9. 退订链接

```
https://greenplastic.ai/unsubscribe?email=${encodeURIComponent(email)}
```

## 执行时机

在 **每日精炼流水线完成后**（约 6:45 北京时间）自动触发，无需外部 Cron。

或者添加一个新的 Worker 端点 `/send-daily-digest`，由 Worker 自己的定时任务在 6:50 北京时间调用。

## 需要的环境变量（Worker 端）

确保 Worker 环境中有以下变量：
- `DATABASE_URL` — Neon 连接串（已有）
- `RESEND_API_KEY` — Resend API 密钥
- `FROM_EMAIL` — 发件人邮箱地址（可选，默认 daily@greenplastic.ai）

## 完成后的操作

Worker 端实现并验证通过后：
1. 禁用 Vercel 端的 `vercel.json` 中的 cron 配置
2. 或保留 Vercel Cron 作为备用（设置 CRON_SECRET 防误触发）

## 验证方法

1. Worker 端添加一个手动触发端点（如 POST /send-daily-digest）
2. 先发给自己测试：`curl -X POST http://47.108.178.124:3300/send-daily-digest`
3. 检查收件箱，确认邮件格式和内容正确
4. 检查 PushLog 表是否有记录写入

---

## 关键优势

| | Vercel Cron（当前） | Worker（迁移后） |
|---|---|---|
| DB 往返 | 每次 4+ 次 | 复用 Worker 现有连接 |
| 消耗 Neon 额度 | 是 | 是（但 Worker 本来就在用 DB） |
| 消耗 Vercel Function | 是 | 否 |
| 执行时机 | 独立 Cron | 精炼完成后立即 |
| 代码耦合 | Vercel 项目内 | Worker 项目内 |
