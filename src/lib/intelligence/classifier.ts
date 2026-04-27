/**
 * AI分类引擎 — 将原始内容映射到7大战略维度 + 自动打分
 * 依赖: @anthropic-ai/sdk (需要 npm install @anthropic-ai/sdk)
 */

import Anthropic from '@anthropic-ai/sdk'

export type Pillar =
  | 'molds'
  | 'molding'
  | 'materials'
  | 'additives'
  | 'auxiliaries'
  | 'recycling'
  | 'reuse'

export type IntelligenceCategory = 'policy' | 'market' | 'tech' | 'enterprise' | 'global'

export interface ClassifyResult {
  pillars: Pillar[]
  category: IntelligenceCategory
  importance: number        // 1-5
  countryCode: string       // CN | EU | US | UK | GLOBAL
  tags: string[]            // 额外关键词标签
  isHot: boolean
}

// 7大维度关键词映射表 — 用于快速预筛（减少不必要的 API 调用）
const PILLAR_KEYWORDS: Record<Pillar, string[]> = {
  molds: ['模具', '注塑模', '吹塑模', 'mold', 'tooling', 'die', '模腔', '热流道'],
  molding: ['注塑', '吹塑', '挤出', '成型', 'injection molding', 'extrusion', 'blow molding', '节能注塑机', '二次加工'],
  materials: ['再生料', 'PCR', 'rPET', 'rPP', 'rPE', '生物基', 'bio-based', '改性料', 'post-consumer resin', '聚烯烃'],
  additives: ['助剂', '增塑剂', '稳定剂', '阻燃剂', 'plasticizer', 'stabilizer', 'flame retardant', '生物基助剂', '抗氧剂'],
  auxiliaries: ['辅料', '色母', '包装辅料', '功能膜', 'masterbatch', 'packaging auxiliary', '填充料'],
  recycling: ['回收', '再生', '废塑料', '化学回收', 'recycling', 'chemical recycling', 'mechanical recycling', 'PCR', '瓶片', 'rPET'],
  reuse: ['重复使用', '循环使用', '押金制', '重填', 'reuse', 'refill', 'deposit system', '循环包装', 'PPWR'],
}

const COUNTRY_PATTERNS: Record<string, RegExp> = {
  CN: /中国|国内|发改委|生态环境部|工信部|北京|上海|广东|再生塑料分会/,
  EU: /欧盟|欧洲|PPWR|PRE|Plastics Recyclers Europe|European|Brussels/i,
  US: /美国|APR|EPA|Association of Plastic Recyclers|United States/i,
  UK: /英国|CIWM|letsrecycle|United Kingdom/i,
}

function quickPillarMatch(text: string): Pillar[] {
  const matched: Pillar[] = []
  for (const [pillar, keywords] of Object.entries(PILLAR_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(pillar as Pillar)
    }
  }
  return matched
}

function detectCountry(text: string): string {
  for (const [code, pattern] of Object.entries(COUNTRY_PATTERNS)) {
    if (pattern.test(text)) return code
  }
  return 'GLOBAL'
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CLASSIFY_SYSTEM_PROMPT = `You are a senior analyst for the plastics circular economy industry.
Classify the given article into the system's 7 strategic pillars and return structured JSON.

PILLARS (choose 1-3 most relevant):
- molds: injection/blow/compression molds, tooling, die design
- molding: injection molding, extrusion, blow molding, thermoforming, processing equipment
- materials: PCR (post-consumer resin), rPET, rPP, rPE, bio-based polymers, specialty compounds
- additives: plasticizers, stabilizers, flame retardants, bio-based additives, antioxidants
- auxiliaries: masterbatches, functional films, packaging auxiliaries, fillers
- recycling: mechanical recycling, chemical recycling, enzymatic recycling, waste plastic collection, rPET bottle flake prices
- reuse: reusable packaging, refill systems, deposit schemes, PPWR compliance

CATEGORY (choose 1):
- policy: government policy, regulation, law, standard (PPWR, EPR, dual-carbon, plastics ban)
- market: prices, quotes, supply/demand, trade data, company announcements
- tech: R&D, new technology, patents, process innovation
- enterprise: company news, M&A, capacity expansion, ESG reports
- global: international standards, cross-border cooperation, global trends

TERMINOLOGY RULES:
- Always use "PCR" not "post-consumer recycled plastic"
- Always use "PPWR" for EU Packaging and Packaging Waste Regulation
- Always use "Circularity" not "circular economy rate"
- Always use "rPET/rPP/rPE" for recycled resins

Respond ONLY with valid JSON matching this schema:
{
  "pillars": ["recycling", "materials"],
  "category": "market",
  "importance": 4,
  "countryCode": "CN",
  "tags": ["rPET", "bottle flake", "price rally"],
  "isHot": true
}

importance scale: 1=routine, 2=noteworthy, 3=significant, 4=important, 5=critical/breaking`

export async function classifyIntelligence(
  title: string,
  summary: string,
  sourceLang: 'zh' | 'en' = 'zh'
): Promise<ClassifyResult> {
  const text = `${title}\n\n${summary}`

  // 快速本地匹配作为 fallback
  const localPillars = quickPillarMatch(text)
  const localCountry = detectCountry(text)

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', // Haiku 足够快且廉价，适合批量分类
      max_tokens: 256,
      system: CLASSIFY_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Classify this ${sourceLang === 'zh' ? 'Chinese' : 'English'} article:\n\nTitle: ${title}\n\nSummary: ${summary}`,
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const result = JSON.parse(jsonMatch[0]) as ClassifyResult
    return result
  } catch {
    // Claude API 失败时，使用本地关键词匹配作为降级
    return {
      pillars: localPillars.length > 0 ? localPillars : ['recycling'],
      category: 'market',
      importance: 3,
      countryCode: localCountry,
      tags: [],
      isHot: false,
    }
  }
}
