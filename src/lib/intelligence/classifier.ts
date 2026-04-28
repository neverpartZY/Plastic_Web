/**
 * AI分类引擎 — 将原始内容映射到7大战略维度 + 自动打分
 * 通过统一 LLM 层调用（GLM / SiliconFlow 自动负载均衡）
 */

import { callLLM } from './llm'

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
  importance: number
  countryCode: string
  tags: string[]
  isHot: boolean
}

const VALID_PILLARS    = new Set(['molds', 'molding', 'materials', 'additives', 'auxiliaries', 'recycling', 'reuse'])
const VALID_CATEGORIES = new Set(['policy', 'market', 'tech', 'enterprise', 'global'])

const PILLAR_KEYWORDS: Record<Pillar, string[]> = {
  molds:       ['模具', '注塑模', 'mold', 'tooling', 'die'],
  molding:     ['注塑', '成型', '挤出', 'injection molding', 'extrusion', 'blow molding'],
  materials:   ['再生料', 'PCR', 'rPET', 'rPP', 'rPE', 'bio-based', 'post-consumer resin'],
  additives:   ['助剂', '增塑剂', 'plasticizer', 'stabilizer', 'flame retardant', 'antioxidant'],
  auxiliaries: ['辅料', '色母', 'masterbatch', 'packaging auxiliary'],
  recycling:   ['回收', '再生', 'recycling', 'chemical recycling', 'mechanical recycling', 'bottle flake', 'rPET'],
  reuse:       ['重复使用', '循环使用', 'reuse', 'refill', 'deposit', 'PPWR'],
}

const COUNTRY_PATTERNS: Record<string, RegExp> = {
  CN: /中国|国内|发改委|生态环境部|China|Beijing|Shanghai/i,
  EU: /欧盟|欧洲|PPWR|European|Brussels|EU\b/i,
  US: /美国|APR|EPA|United States|\bUS\b|\bUSA\b/i,
  UK: /英国|UK\b|United Kingdom|parliament/i,
}

function localFallback(text: string): ClassifyResult {
  const pillars: Pillar[] = []
  for (const [pillar, kws] of Object.entries(PILLAR_KEYWORDS)) {
    if (kws.some(kw => text.toLowerCase().includes(kw.toLowerCase()))) {
      pillars.push(pillar as Pillar)
    }
  }
  let countryCode = 'GLOBAL'
  for (const [code, re] of Object.entries(COUNTRY_PATTERNS)) {
    if (re.test(text)) { countryCode = code; break }
  }
  return {
    pillars: pillars.length > 0 ? pillars.slice(0, 3) : ['recycling'],
    category: 'global',
    importance: 3,
    countryCode,
    tags: [],
    isHot: false,
  }
}

const CLASSIFY_SYSTEM = `You are a senior analyst for the plastics circular economy industry.
Classify the article and return ONLY valid JSON with no extra text:
{"pillars":["recycling"],"category":"global","importance":3,"countryCode":"GLOBAL","isHot":false,"tags":[]}

pillars (1-3 most relevant): molds|molding|materials|additives|auxiliaries|recycling|reuse
- molds: injection/blow molds, tooling, die design
- molding: injection/extrusion/blow molding, processing equipment
- materials: PCR, rPET, rPP, rPE, bio-based polymers, recycled compounds
- additives: plasticizers, stabilizers, flame retardants, antioxidants
- auxiliaries: masterbatches, functional films, packaging auxiliaries
- recycling: mechanical/chemical recycling, waste plastic, bottle flake prices
- reuse: reusable packaging, refill systems, deposit schemes, PPWR

category: policy|market|tech|enterprise|global
importance 1-5 (5=breaking/critical)
countryCode: CN|EU|US|UK|GLOBAL
isHot: true only if importance>=4
tags: up to 3 short English keyword strings`

export async function classifyIntelligence(
  title: string,
  summary: string,
  sourceLang: 'zh' | 'en' = 'zh'
): Promise<ClassifyResult> {
  const text = `${title}\n\n${summary}`

  try {
    const raw = await callLLM(
      CLASSIFY_SYSTEM,
      `Classify this ${sourceLang === 'zh' ? 'Chinese' : 'English'} article:\n\nTitle: ${title}\n\nSummary: ${summary}`,
      150,
    )

    const m = raw.match(/\{[\s\S]*\}/)
    if (!m) throw new Error('No JSON in LLM response')

    const result = JSON.parse(m[0])

    const pillars = (result.pillars ?? [])
      .filter((p: string) => VALID_PILLARS.has(p))
      .slice(0, 3) as Pillar[]

    return {
      pillars: pillars.length > 0 ? pillars : localFallback(text).pillars,
      category: VALID_CATEGORIES.has(result.category) ? result.category : 'global',
      importance: Math.min(5, Math.max(1, Number(result.importance) || 3)),
      countryCode: result.countryCode ?? 'GLOBAL',
      tags: Array.isArray(result.tags) ? result.tags.slice(0, 3) : [],
      isHot: Boolean(result.isHot),
    }
  } catch {
    return localFallback(text)
  }
}
