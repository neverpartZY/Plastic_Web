/**
 * 双向翻译引擎 — 中文↔英文，锁定行业专业术语
 * 通过统一 LLM 层调用（GLM / SiliconFlow 自动负载均衡）
 */

import { callLLM } from './llm'

export interface TranslationResult {
  titleZh: string
  titleEn: string
  summaryZh: string
  summaryEn: string
}

const TERMINOLOGY_LOCK = `
MANDATORY TERMINOLOGY (never translate these, use exact form):
- PCR → always "PCR" (Post-Consumer Resin) in English, "PCR再生料" in Chinese
- PPWR → "PPWR" (EU Packaging and Packaging Waste Regulation)
- EPR → "EPR" (Extended Producer Responsibility) / "生产者责任延伸"
- rPET → "rPET" / "再生PET"
- rPP → "rPP" / "再生PP"
- rPE → "rPE" / "再生PE"
- Circularity → "Circularity" / "循环率"
- CBAM → "CBAM" (Carbon Border Adjustment Mechanism)
- GRS → "GRS" (Global Recycled Standard)
- Chemical recycling → "化学回收" (NOT "化学循环")
- Mechanical recycling → "机械回收" (NOT "物理回收")
- Post-consumer → "消费后" (NOT "消费者使用后")
- Post-industrial → "工业后"
- Bottle flake → "瓶片" (for rPET feed material)
`

const ZH_TO_EN_SYSTEM = `You are a professional translator for the plastics circular economy industry.
Translate Chinese industry content to precise, professional English for international B2B readers.
${TERMINOLOGY_LOCK}
Style: concise, factual, industry-standard. Avoid marketing language.
Return ONLY valid JSON with no extra text: {"titleEn": "...", "summaryEn": "..."}`

const EN_TO_ZH_SYSTEM = `你是塑料循环经济行业的专业翻译。
将英文行业内容翻译为精准、专业的中文，面向中国B2B读者。
${TERMINOLOGY_LOCK}
风格：简洁、客观、符合行业规范。避免营销语言。
只返回有效JSON，不要有多余文字：{"titleZh": "...", "summaryZh": "..."}`

export async function generateTldr(
  title: string,
  body: string,
  sourceLang: 'zh' | 'en'
): Promise<{ tldrZh: string; tldrEn: string }> {
  const inputZh = sourceLang === 'zh'
    ? `标题：${title}\n\n${body.slice(0, 1200)}`
    : `Title: ${title}\n\nContent: ${body.slice(0, 1200)}`

  const [tldrZh, tldrEn] = await Promise.all([
    callLLM(
      `你是塑料循环经济行业编辑，为中国B2B读者提炼文章核心。
严格输出 3 条要点，每条以「• 」开头，每条 20-40 字。
不要输出标题、前言或序号。PCR/rPET/PPWR/EPR 保留原文。`,
      inputZh,
      300,
    ),
    callLLM(
      `You are an editor for the plastics circular economy industry.
Output exactly 3 bullet points, each starting with "• ", each 15-30 words.
No title, preamble, or numbering. Keep PCR/rPET/PPWR/EPR as-is.`,
      inputZh,
      250,
    ),
  ])

  return { tldrZh: tldrZh.trim(), tldrEn: tldrEn.trim() }
}

export async function translateContent(
  titleZh: string,
  contentEn: string,
): Promise<string> {
  return callLLM(
    `你是塑料循环经济行业专业翻译，将英文正文译为中文，面向中国B2B读者。
规则：保持段落结构，段间空行；PCR/rPET/PPWR/EPR/GRS 保留原文；chemical recycling→化学回收；bottle flake→瓶片；直接输出译文。`,
    `标题：${titleZh}\n\n原文：\n${contentEn.slice(0, 2000)}`,
    1200,
  )
}

export async function translateIntelligence(
  title: string,
  summary: string,
  sourceLang: 'zh' | 'en'
): Promise<Partial<TranslationResult>> {
  const isZhToEn = sourceLang === 'zh'
  const systemPrompt = isZhToEn ? ZH_TO_EN_SYSTEM : EN_TO_ZH_SYSTEM
  const userContent  = `Title: ${title}\n\nSummary: ${summary}`

  const raw = await callLLM(systemPrompt, userContent, 512)

  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`LLM translation returned no JSON. Raw: ${raw.slice(0, 200)}`)

  const result = JSON.parse(jsonMatch[0])

  if (isZhToEn) {
    return {
      titleZh:   title,
      summaryZh: summary,
      titleEn:   result.titleEn   ?? title,
      summaryEn: result.summaryEn ?? summary,
    }
  } else {
    return {
      titleEn:   title,
      summaryEn: summary,
      titleZh:   result.titleZh   ?? title,
      summaryZh: result.summaryZh ?? summary,
    }
  }
}
