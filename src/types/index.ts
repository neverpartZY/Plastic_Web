// ── Tag ───────────────────────────────────────────────────────────────────────

/**
 * Tag categories:
 *  - entity      : X轴实体维度（装备 / 助剂 / 模具 / 成型工艺 / 材料）
 *  - application : Y轴应用领域（汽车塑料 / 消费电子 / 包装材料 …）
 *  - material    : 物料类型
 *  - process     : 回收环节
 *  - technology  : 技术路线
 *  - region      : 地区
 *  - topic       : 主题
 */
export type TagCategory =
  | 'entity'
  | 'application'
  | 'material'
  | 'process'
  | 'technology'
  | 'region'
  | 'topic'

export interface Tag {
  id: string
  name: string
  slug: string
  category: TagCategory
  color: string
  sortOrder: number
  createdAt: string
}

// ── Content status & source ───────────────────────────────────────────────────

/** Editorial status of a content item */
export type ContentStatus = 'draft' | 'published' | 'archived'

/** How the content was collected */
export type DataSource = 'ai' | 'manual' | 'scraper'

// ── News ──────────────────────────────────────────────────────────────────────

export interface NewsListItem {
  id: string
  title: string
  summary: string
  coverImage: string | null
  source: string | null
  /** Collection method — populated after `prisma generate` with updated schema */
  dataSource?: DataSource | null
  /** Editorial status — populated after `prisma generate` with updated schema */
  status?: ContentStatus
  viewCount: number
  publishedAt: string
  tags: Tag[]
}

export interface NewsDetail extends NewsListItem {
  content: string
  sourceUrl: string | null
  author: string | null
  isPublished: boolean
  updatedAt: string
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardWithTags {
  id: string
  name: string
  isDefault: boolean
  sortOrder: number
  createdAt: string
  tags: Tag[]
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string | null
  phone: string | null
  name: string
  avatarUrl: string | null
  role: string
  isPremium: boolean
  createdAt: string
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Tag grouping ──────────────────────────────────────────────────────────────

export interface TagsByCategory {
  entity:      Tag[]
  application: Tag[]
  material:    Tag[]
  process:     Tag[]
  technology:  Tag[]
  region:      Tag[]
  topic:       Tag[]
}
