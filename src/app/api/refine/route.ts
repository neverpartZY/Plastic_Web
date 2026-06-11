/**
 * POST /api/refine
 * AI 情报精炼接口 — "炼油厂"模式
 *
 * 接收 Crawl4AI 原始文本 → GLM-4 深度加工 → 仅存 AI 报告，不存原文
 *
 * Authorization: Bearer GP_Secret_2026_!#
 *
 * 请求体:
 *   title        string            原始标题
 *   date         string?           发布日期 ISO8601
 *   source       string            信息源名称
 *   url          string            原始 URL（去重 key）
 *   full_content string (≥100)    Crawl4AI 抓取的正文（处理后不入库）
 *
 * 响应:
 *   201 { success, id, report }  新建
 *   200 { success, id, report, updated: true }  URL 已存在，执行更新
 *   401 { error }
 *   422 { error, detail? }
 *   500 { error }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash }                from 'crypto'
import { z }                         from 'zod'
import { prisma }                    from '@/lib/prisma'
import { callLLM }                   from '@/lib/intelligence/llm'
import { translateIntelligence }    from '@/lib/intelligence/translator'

export const maxDuration = 60

// ── 认证 ──────────────────────────────────────────────────────────────────────

const REFINE_SECRET = process.env.REFINE_SECRET ?? 'GP_Secret_2026_!#'

function authorized(req: NextRequest) {
  return req.headers.get('authorization') === `Bearer ${REFINE_SECRET}`
}

// ── 请求体 Schema ─────────────────────────────────────────────────────────────

const BodySchema = z.object({
  title:        z.string().min(1).max(500),
  date:         z.string().optional(),
  source:       z.string().min(1).max(200),
  url:          z.string().url(),
  full_content: z.string().min(100).max(200_000),
})

// ── 工具 ──────────────────────────────────────────────────────────────────────

function makeHash(url: string) {
  return createHash('sha256').update(url.trim().toLowerCase()).digest('hex').slice(0, 32)
}

function detectLang(text: string): 'zh' | 'en' {
  return (text.match(/[一-鿿]/g) ?? []).length > 15 ? 'zh' : 'en'
}

function parseDate(raw?: string): Date {
  if (!raw) return new Date()
  const d = new Date(raw)
  return isNaN(d.getTime()) ? new Date() : d
}

// ── 新旧维度映射（保持前端 7-pillar 筛选器兼容）─────────────────────────────

const DIM_MAP: Record<string, string> = {
  '物理回收':   'recycling',
  '化学回收':   'recycling',
  '生物基材料': 'bio',
  '再生塑料':   'recycled',
  '减碳':       'reuse',
  '政策法规':   'recycling',
  '可循环设计': 'reuse',
  '行业标准':   'recycling',
}

// ── AI 精炼结果类型 ───────────────────────────────────────────────────────────

interface RefinedReport {
  titleZh:        string
  titleEn:        string
  refinedSummary: string    // 约500字深度总结 → 存入 contentZh
  keyInsights:    string[]  // 3-5条 ≤30字结论 → 存入 tldrZh
  dimensions:     string[]  // 新分类标签（1-2个）
  region:         string
  score:          number    // 1-5 → importance
  tags:           string[]  // 英文关键词
}

// ── 系统提示词（核心）────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `你是一位专注于塑料循环经济的资深工业分析师。

【前置过滤】
在处理之前，彻底剔除输入文本中的以下内容：
- 网站导航菜单、侧边栏链接、面包屑导航
- 版权声明、隐私政策、条款文字
- 广告位文案、推广内容
- 社交媒体分享按钮、评论区引导
- 订阅弹窗、Cookie 提示等任何非正文噪音

【加工要求】
对净化后的正文执行以下深度加工，仅输出纯 JSON（不含 Markdown 代码块）：

{
  "titleZh": "一眼即能看出新闻价值的中文标题（不超过30字）",
  "titleEn": "Equally informative English title (max 15 words)",
"refinedSummary": "深度总结，要求500-800字，必须涵盖：①事件背景与起因；②核心技术路径或政策细节；③对塑料产业链（原料/加工/回收/品牌商）的具体影响与机会。语气客观、专业、有深度，避免泛泛而谈。PCR/rPET/PPWR/EPR/GRS等缩写保留原文",
  "keyInsights": [
    "核心结论1，动词开头，≤30字",
    "核心结论2，动词开头，≤30字",
    "核心结论3，动词开头，≤30字"
  ],
  "dimensions": ["物理回收"],
  "region": "GLOBAL",
  "score": 3,
  "tags": ["rPET", "PPWR"]
}

【字段规则】
dimensions（从以下选 1-2 个）：
  物理回收 | 化学回收 | 生物基材料 | 减碳 | 政策法规 | 可循环设计 | 行业标准

region（选 1 个）：CN | EU | US | UK | GLOBAL

score 1-5 评分标准：
  5 = 突发重磅：重大法规颁布/修订、亿级以上并购、颠覆性技术突破
  4 = 重要：行业政策调整、知名企业战略动作、大规模产能扩张
  3 = 常规：行业动态、市场数据、技术进展
  2 = 一般：企业小动态、会议预告
  1 = 低价值：宣传稿、无实质信息

keyInsights：3-5条，每条以动词开头，≤30字，聚焦具体数据或结论

tags：最多3个英文关键词，使用行业术语（如 rPET、CBAM、chemical recycling）`

// ── 单次 AI 调用，获取全部精炼输出 ────────────────────────────────────────────

async function refine(title: string, content: string, retries = 3): Promise<RefinedReport> {
  // 截断至 10000 字符，防止超出 token 限制
  const truncated = content.slice(0, 10_000)
  const prompt    = `原始标题：${title}\n\n正文内容：\n${truncated}`

  const validDims   = ['物理回收', '化学回收', '生物基材料', '减碳', '政策法规', '可循环设计', '行业标准']
  const validRegions = ['CN', 'EU', 'US', 'UK', 'GLOBAL']

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const raw   = await callLLM(SYSTEM_PROMPT, prompt, 2000)
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('LLM 未返回 JSON')
      const p = JSON.parse(match[0])

      const dimensions = Array.isArray(p.dimensions)
        ? p.dimensions.filter((d: unknown) => validDims.includes(String(d))).slice(0, 2)
        : ['物理回收']

      const keyInsights = Array.isArray(p.keyInsights)
        ? p.keyInsights.slice(0, 5).map(String)
        : [String(p.refinedSummary ?? '').slice(0, 30)]

      return {
        titleZh:        String(p.titleZh        ?? title).slice(0, 200),
        titleEn:        String(p.titleEn        ?? title).slice(0, 200),
        refinedSummary: String(p.refinedSummary ?? '').slice(0, 2000),
        keyInsights,
        dimensions,
        region:  validRegions.includes(p.region) ? String(p.region) : 'GLOBAL',
        score:   Math.min(5, Math.max(1, Number(p.score) || 3)),
        tags:    Array.isArray(p.tags) ? p.tags.slice(0, 3).map(String) : [],
      }
    } catch {
      if (attempt < retries) await new Promise(r => setTimeout(r, 800 * attempt))
    }
  }

  // 全部重试失败 → 降级
  return {
    titleZh: title, titleEn: title,
    refinedSummary: content.slice(0, 500),
    keyInsights:    [],
    dimensions:     ['物理回收'],
    region:         'GLOBAL',
    score:          3,
    tags:           [],
  }
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. 认证
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. 解析 & 校验
  let rawBody: unknown
  try { rawBody = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const validated = BodySchema.safeParse(rawBody)
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Validation failed', detail: validated.error.flatten() },
      { status: 422 },
    )
  }

  const { title, date, source, url, full_content } = validated.data
  const lang = detectLang(title + ' ' + full_content.slice(0, 500))

  // 3. AI 精炼（单次调用，获取全部输出）
  let report: RefinedReport
  try {
    report = await refine(title, full_content)
  } catch (e: unknown) {
    return NextResponse.json(
      { error: 'AI refine failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }

  // 3.5 为所有文章生成英文摘要翻译（LLM 输出中文，需转英文）
  let summaryEn: string | null = null
  let tldrEn: string | null = null
  try {
    const translation = await translateIntelligence(
      report.titleZh,
      report.refinedSummary.slice(0, 500),
      'zh',
    )
    summaryEn = translation.summaryEn ?? null
  } catch (e) {
    console.warn('[refine] translateIntelligence failed, continuing without summaryEn:', String(e))
  }

  // 4. 字段映射
  const hash        = makeHash(url)
  const publishedAt = parseDate(date)

  // pillars：新分类 → 旧7-pillar（前端筛选兼容），逗号分隔去重
  const oldPillars = Array.from(new Set(report.dimensions.map(d => DIM_MAP[d] ?? 'recycling'))).join(',')

  // tags：英文关键词 + 新分类标签（供未来搜索）
  const allTags = Array.from(new Set([...report.tags, ...report.dimensions]))

  // keyInsights → tldrZh（• 开头的要点列表）
  const tldrZh = report.keyInsights.map(s => `• ${s}`).join('\n')

  // 翻译 tldrZh 要点为英文（所有文章都需要双语要点）
  if (tldrZh && !tldrEn) {
    try {
      const tldrRaw = await callLLM(
        'Translate the following Chinese bullet points to English. Preserve the bullet format (each starting with "•"). Keep each point concise (≤30 words). Only output the translated bullets.',
        tldrZh,
        400,
      )
      tldrEn = tldrRaw || null
    } catch (e) {
      console.warn('[refine] tldrEn translation failed:', String(e))
    }
  }

  const dbData = {
    title,
    titleZh:         report.titleZh,
    titleEn:         report.titleEn,
    summary:         report.refinedSummary.slice(0, 400),  // 摘要字段取前400字
    content:         '',                                    // 不存原文
    contentZh:       report.refinedSummary.slice(0, 1200),  // 中文深度总结
    contentEn:       summaryEn,                               // 英文深度总结（翻译自中文）
    tldrZh:          tldrZh || null,
    tldrEn:          tldrEn,
    summaryEn:       summaryEn,
    category:        report.dimensions[0] ?? '政策法规',
    dimension:       oldPillars.split(',')[0],
    pillars:         oldPillars,
    region:          report.region,
    countryCode:     report.region,
    importance:      report.score,
    isHot:           report.score >= 4,
    tags:            allTags,
    source,
    sourceUrl:       url,
    lang,
    translateStatus: 'translated',
    publishedAt,
  }

  // 5. Upsert（相同 URL → 更新最新精炼报告；新 URL → 创建）
  try {
    const existing = await prisma.intelligence.findUnique({
      where:  { urlHash: hash },
      select: { id: true },
    })

    if (existing) {
      // 更新精炼报告（保留 id/urlHash/createdAt）
      await prisma.intelligence.update({
        where: { urlHash: hash },
        data:  { ...dbData, updatedAt: new Date() },
      })
      return NextResponse.json({
        success:    true,
        id:         existing.id,
        updated:    true,
        report: {
          titleZh:        report.titleZh,
          titleEn:        report.titleEn,
          refinedSummary: report.refinedSummary,
          keyInsights:    report.keyInsights,
          dimensions:     report.dimensions,
          score:          report.score,
          tags:           report.tags,
          originalUrl:    url,
        },
      })
    }

    // 新建
    const created = await prisma.intelligence.create({
      data: { ...dbData, urlHash: hash, version: 1 },
    })

    // 版本记录
    await prisma.intelligenceVersion.create({
      data: {
        intelligenceId: created.id,
        version:        1,
        title:          created.title,
        summary:        created.summary,
        content:        '',
        dimension:      created.dimension,
        region:         created.region,
        importance:     created.importance,
        tags:           created.tags,
      },
    })

    return NextResponse.json({
      success: true,
      id:      created.id,
      report: {
        titleZh:        report.titleZh,
        titleEn:        report.titleEn,
        refinedSummary: report.refinedSummary,
        keyInsights:    report.keyInsights,
        dimensions:     report.dimensions,
        score:          report.score,
        tags:           report.tags,
        originalUrl:    url,
      },
    }, { status: 201 })

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: 'Database write failed', detail: message }, { status: 500 })
  }
}
