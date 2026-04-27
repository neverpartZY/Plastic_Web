/**
 * 双向翻译引擎 — 中文↔英文，锁定行业专业术语
 * zh→en: 政策/价格报道 → 推送 /en 频道
 * en→zh: APR/PRE 标准  → 推送 /zh 频道
 */

import Anthropic from '@anthropic-ai/sdk'

export interface TranslationResult {
  titleZh: string
  titleEn: string
  summaryZh: string
  summaryEn: string
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// 锁定术语表 — 翻译时严格遵守，不得意译
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

const ZH_TO_EN_PROMPT = `You are a professional translator for the plastics circular economy industry.
Translate Chinese industry content to precise, professional English for international B2B readers.
${TERMINOLOGY_LOCK}
Style: concise, factual, industry-standard. Avoid marketing language.
Return ONLY valid JSON: {"titleEn": "...", "summaryEn": "..."}`

const EN_TO_ZH_PROMPT = `你是塑料循环经济行业的专业翻译。
将英文行业内容翻译为精准、专业的中文，面向中国B2B读者。
${TERMINOLOGY_LOCK}
风格：简洁、客观、符合行业规范。避免营销语言。
只返回有效JSON：{"titleZh": "...", "summaryZh": "..."}`

export async function translateIntelligence(
  title: string,
  summary: string,
  sourceLang: 'zh' | 'en'
): Promise<Partial<TranslationResult>> {
  const isZhToEn = sourceLang === 'zh'
  const prompt = isZhToEn ? ZH_TO_EN_PROMPT : EN_TO_ZH_PROMPT
  const targetField = isZhToEn ? 'titleEn/summaryEn' : 'titleZh/summaryZh'

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: prompt,
    messages: [
      {
        role: 'user',
        content: `Title: ${title}\n\nSummary: ${summary}`,
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Translation failed for ${targetField}`)

  const result = JSON.parse(jsonMatch[0])

  if (isZhToEn) {
    return {
      titleZh: title,
      summaryZh: summary,
      titleEn: result.titleEn,
      summaryEn: result.summaryEn,
    }
  } else {
    return {
      titleEn: title,
      summaryEn: summary,
      titleZh: result.titleZh,
      summaryZh: result.summaryZh,
    }
  }
}
