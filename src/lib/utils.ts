import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'yyyy年MM月dd日', { locale: zhCN })
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// ── Tag category metadata ────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  entity:      'X轴 · 实体维度',
  application: 'Y轴 · 应用领域',
  material:    '物料类型',
  process:     '回收环节',
  technology:  '技术路线',
  region:      '地区',
  topic:       '主题',
}

/** Short labels for filter chips */
export const CATEGORY_SHORT_LABELS: Record<string, string> = {
  entity:      'X轴实体',
  application: 'Y轴应用',
  material:    '物料',
  process:     '环节',
  technology:  '技术',
  region:      '地区',
  topic:       '主题',
}

/** Render order in filter UI — X/Y axis first as primary dimensions */
export const CATEGORY_ORDER = [
  'entity',
  'application',
  'material',
  'process',
  'technology',
  'region',
  'topic',
] as const

/** Accent colors for each category (used in filter headers) */
export const CATEGORY_ACCENTS: Record<string, { bg: string; text: string; border: string }> = {
  entity:      { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  application: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  material:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  process:     { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  technology:  { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200'   },
  region:      { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  topic:       { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200'   },
}

// ── Prisma mappers ───────────────────────────────────────────────────────────

export function mapPrismaTag(tag: {
  id: string
  name: string
  slug: string
  category: string
  color: string
  sortOrder: number
  createdAt: Date
}): import('@/types').Tag {
  return {
    ...tag,
    category: tag.category as import('@/types').Tag['category'],
    createdAt: tag.createdAt.toISOString(),
  }
}

export function groupTagsByCategory(
  tags: ReturnType<typeof mapPrismaTag>[],
): import('@/types').TagsByCategory {
  const result: import('@/types').TagsByCategory = {
    entity: [], application: [], material: [], process: [],
    technology: [], region: [], topic: [],
  }
  for (const tag of tags) {
    const cat = tag.category as keyof import('@/types').TagsByCategory
    if (result[cat]) result[cat].push(tag)
  }
  return result
}
