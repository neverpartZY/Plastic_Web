/**
 * 情报精炼 Pipeline
 *
 * 将原始内容加工为结构化情报的完整流水线：
 *   generateReport → translateContent ∥ translateTldr → assemble
 *
 * 每步独立可重试、可观测，token 用量自动追踪。
 */

import { callLLM, clearTokenUsage, getTokenUsage, getUsageSummary, type TokenUsage } from './llm'
import { translateIntelligence }                from './translator'

// ── 类型定义 ──────────────────────────────────────────────────────────────────

/** 精炼报告 — LLM 一步生成的结构化输出 */
export interface RefinedReport {
  titleZh: string
  titleEn: string
  refinedSummary: string   // 500-800字深度总结 → contentZh
  keyInsights: string[]     // 3-5条 ≤30字结论 → tldrZh
  dimensions: string[]      // 1-2个中文维度标签
  region: string            // CN | EU | US | UK | GLOBAL
  score: number             // 1-5 → importance
  tags: string[]            // 英文关键词
}

/** 单个步骤结果 */
interface StepResult<T> {
  data: T
  stepName: string
}

/** 完整 Pipeline 输出 */
export interface PipelineResult {
  report: RefinedReport
  summaryEn: string | null
  tldrZh: string
  tldrEn: string | null
  tokenUsage: TokenUsage[]
  usageSummary: ReturnType<typeof getUsageSummary>
}

/** Pipeline 上下文 */
export interface PipelineContext {
  title: string
  content: string
  lang: 'zh' | 'en'
}

// ── 维度映射 ──────────────────────────────────────────────────────────────────

const DIM_MAP: Record<string, string> = {
  '模具制造':    'molds',
  '成型工艺':    'molding',
  '再生塑料市场': 'recycled',
  '生物基材料':  'bio',
  '绿色助剂':    'additives',
  '辅料升级':    'auxiliaries',
  '回收再生技术': 'recycling',
  '重复使用模式': 'reuse',
  // 向后兼容旧标签
  '物理回收':    'recycling',
  '化学回收':    'recycling',
  '再生塑料':    'recycled',
  '减碳':        'reuse',
  '政策法规':    'recycling',
  '可循环设计':  'reuse',
  '行业标准':    'recycling',
  '模具':        'molds',
  '成型':        'molding',
  '助剂':        'additives',
  '辅料':        'auxiliaries',
  '回收再生':    'recycling',
  '重复使用':    'reuse',
}

export function mapDimensions(dimensions: string[]): string[] {
  return Array.from(new Set(dimensions.map(d => DIM_MAP[d] ?? 'recycling')))
}

// ── 系统提示词 ────────────────────────────────────────────────────────────────

const REPORT_SYSTEM_PROMPT = `你是一位专注于塑料循环经济的资深工业分析师。

【加工要求】
对原文执行以下深度加工，仅输出纯 JSON（不含 Markdown 代码块）：

{
  "titleZh": "一眼即能看出新闻价值的中文标题（不超过30字）",
  "titleEn": "Equally informative English title (max 15 words)",
  "refinedSummary": "深度总结，要求500-800字，必须涵盖：①事件背景与起因；②核心技术路径或政策细节；③对塑料产业链（原料/加工/回收/品牌商）的具体影响与机会。语气客观、专业、有深度，避免泛泛而谈。PCR/rPET/PPWR/EPR/GRS等缩写保留原文",
  "keyInsights": [
    "核心结论1，动词开头，≤30字",
    "核心结论2，动词开头，≤30字",
    "核心结论3，动词开头，≤30字"
  ],
  "dimensions": ["回收再生技术"],
  "region": "GLOBAL",
  "score": 3,
  "tags": ["rPET", "PPWR"]
}

【字段规则】
dimensions（从以下选 1-2 个，应与文章内容最匹配的维度）：
  模具制造 | 成型工艺 | 再生塑料市场 | 生物基材料 | 绿色助剂 | 辅料升级 | 回收再生技术 | 重复使用模式

维度说明：
  模具制造 = 模具设计/热流道/精密加工/模具钢材
  成型工艺 = 注塑/挤出/吹膜/造粒工艺与设备
  再生塑料市场 = PCR再生料/rPET/rPP/rPE品质标准与市场价格
  生物基材料 = PLA/PHA/PBS等生物基聚合物与可降解材料
  绿色助剂 = 稳定剂/增塑剂/阻燃剂/抗氧化剂等助剂
  辅料升级 = 功能薄膜/绿色包装/表面处理等辅料
  回收再生技术 = 机械回收/化学回收/酶解/智能分选
  重复使用模式 = 可循环设计/减量策略/重复使用商业模式

region（选 1 个）：CN | EU | US | UK | GLOBAL

score 1-5 评分标准：
  5 = 突发重磅：重大法规颁布/修订、亿级以上并购、颠覆性技术突破
  4 = 重要：行业政策调整、知名企业战略动作、大规模产能扩张
  3 = 常规：行业动态、市场数据、技术进展
  2 = 一般：企业小动态、会议预告
  1 = 低价值：宣传稿、无实质信息

keyInsights：3-5条，每条以动词开头，≤30字，聚焦具体数据或结论

tags：最多3个英文关键词，使用行业术语（如 rPET、CBAM、chemical recycling）`

// ── Step 1: 生成精炼报告 ─────────────────────────────────────────────────────

const VALID_DIMS   = ['模具制造', '成型工艺', '再生塑料市场', '生物基材料', '绿色助剂', '辅料升级', '回收再生技术', '重复使用模式']
const VALID_REGIONS = ['CN', 'EU', 'US', 'UK', 'GLOBAL']

async function generateReport(
  title: string,
  content: string,
  retries = 3,
): Promise<RefinedReport> {
  const truncated = content.slice(0, 10_000)
  const prompt    = `原始标题：${title}\n\n正文内容：\n${truncated}`

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const raw   = await callLLM(REPORT_SYSTEM_PROMPT, prompt, 2000, undefined, 'generateReport')
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('LLM 未返回 JSON')

      const p = JSON.parse(match[0])

      const dimensions = Array.isArray(p.dimensions)
        ? p.dimensions.filter((d: unknown) => VALID_DIMS.includes(String(d))).slice(0, 2)
        : ['回收再生技术']

      const keyInsights = Array.isArray(p.keyInsights)
        ? p.keyInsights.slice(0, 5).map(String)
        : [String(p.refinedSummary ?? '').slice(0, 30)]

      return {
        titleZh:        String(p.titleZh        ?? title).slice(0, 200),
        titleEn:        String(p.titleEn        ?? title).slice(0, 200),
        refinedSummary: String(p.refinedSummary ?? '').slice(0, 2000),
        keyInsights,
        dimensions,
        region:  VALID_REGIONS.includes(p.region) ? String(p.region) : 'GLOBAL',
        score:   Math.min(5, Math.max(1, Number(p.score) || 3)),
        tags:    Array.isArray(p.tags) ? p.tags.slice(0, 3).map(String) : [],
      }
    } catch (err) {
      console.warn(`[pipeline] generateReport attempt ${attempt}/${retries} failed:`, String(err).slice(0, 100))
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 800 * attempt))
      }
    }
  }

  // 全部重试失败 → 降级输出
  console.error('[pipeline] generateReport all retries exhausted, using degraded output')
  return {
    titleZh: title,
    titleEn: title,
    refinedSummary: content.slice(0, 500),
    keyInsights: [],
    dimensions: ['回收再生技术'],
    region: 'GLOBAL',
    score: 3,
    tags: [],
  }
}

// ── Step 2a: 翻译摘要（中→英）─────────────────────────────────────────────────

async function translateSummary(
  titleZh: string,
  summaryZh: string,
  retries = 2,
): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await translateIntelligence(titleZh, summaryZh.slice(0, 500), 'zh')
      return result.summaryEn ?? null
    } catch (err) {
      console.warn(`[pipeline] translateSummary attempt ${attempt}/${retries} failed:`, String(err).slice(0, 100))
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * attempt))
      }
    }
  }
  console.error('[pipeline] translateSummary all retries exhausted')
  return null
}

// ── Step 2b: 翻译要点（中→英）─────────────────────────────────────────────────

async function translateTldr(
  tldrZh: string,
  retries = 2,
): Promise<string | null> {
  if (!tldrZh) return null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const raw = await callLLM(
        'Translate the following Chinese bullet points to English. Preserve the bullet format (each starting with "•"). Keep each point concise (≤30 words). Only output the translated bullets.',
        tldrZh,
        400,
        undefined,
        'translateTldr',
      )
      return raw || null
    } catch (err) {
      console.warn(`[pipeline] translateTldr attempt ${attempt}/${retries} failed:`, String(err).slice(0, 100))
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * attempt))
      }
    }
  }
  console.error('[pipeline] translateTldr all retries exhausted')
  return null
}

// ── Pipeline 入口 ─────────────────────────────────────────────────────────────

/**
 * 运行完整精炼 Pipeline：
 *   generateReport → (translateSummary ∥ translateTldr) → assemble
 *
 * 每步独立重试，失败不阻塞后续步骤。
 * Token 用量自动追踪，通过 getTokenUsage() 获取。
 */
export async function runRefinePipeline(ctx: PipelineContext): Promise<PipelineResult> {
  const { title, content, lang: _lang } = ctx

  // 清空上一轮用量记录
  clearTokenUsage()

  // ── Step 1: 生成精炼报告 ──────────────────────────────────────────────────
  console.log('[pipeline] Step 1: generateReport')
  const report = await generateReport(title, content)

  // ── Step 2: 翻译（并行）────────────────────────────────────────────────────
  console.log('[pipeline] Step 2: translate (parallel)')
  const tldrZh = report.keyInsights.map(s => `• ${s}`).join('\n')

  const [summaryEn, tldrEn] = await Promise.all([
    translateSummary(report.titleZh, report.refinedSummary),
    translateTldr(tldrZh),
  ])

  // ── 收集用量 ──────────────────────────────────────────────────────────────
  const tokenUsage    = getTokenUsage()
  const usageSummary  = getUsageSummary()

  if (tokenUsage.length > 0) {
    const total = usageSummary
    console.log('[pipeline] Token usage:', JSON.stringify(total))
  }

  return {
    report,
    summaryEn,
    tldrZh,
    tldrEn,
    tokenUsage,
    usageSummary,
  }
}

/**
 * 将 Pipeline 输出映射为数据库写入字段
 */
export function pipelineToDbData(
  pipeline: PipelineResult,
  overrides: {
    title: string
    source: string
    url: string
    lang: 'zh' | 'en'
    publishedAt: Date
  },
) {
  const { report, summaryEn, tldrZh, tldrEn } = pipeline
  const { title, source, url, lang, publishedAt } = overrides

  const pillarKeys = mapDimensions(report.dimensions).join(',')
  const allTags    = Array.from(new Set([...report.tags, ...report.dimensions]))

  return {
    title,
    titleZh:         report.titleZh,
    titleEn:         report.titleEn,
    summary:         report.refinedSummary.slice(0, 400),
    content:         '',                      // 不存原文
    contentZh:       report.refinedSummary.slice(0, 1200),
    contentEn:       summaryEn,
    tldrZh:          tldrZh || null,
    tldrEn:          tldrEn,
    summaryEn,
    category:        report.dimensions[0] ?? '回收再生技术',
    dimension:       pillarKeys.split(',')[0],
    pillars:         pillarKeys,
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
}
