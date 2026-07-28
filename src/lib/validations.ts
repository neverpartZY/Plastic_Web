import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(20, '姓名不超过20个字符'),
  identifier: z.string().min(1, '请输入邮箱或手机号'),
  password: z.string().min(8, '密码至少8个字符'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  identifier: z.string().min(1, '请输入邮箱或手机号'),
  password: z.string().min(1, '请输入密码'),
})

export const newsSchema = z.object({
  title: z.string().min(5, '标题至少5个字符').max(200, '标题不超过200字符'),
  summary: z.string().min(10, '摘要至少10个字符').max(500, '摘要不超过500字符'),
  content: z.string().min(50, '正文至少50个字符'),
  coverImage: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  author: z.string().optional(),
  isPublished: z.boolean().default(true),
  publishedAt: z.string().optional(),
  tagIds: z.array(z.string()).min(1, '至少选择1个标签').max(10, '最多选择10个标签'),
})

export const tagSchema = z.object({
  name: z.string().min(1, '标签名不能为空').max(20, '标签名不超过20字符'),
  slug: z.string().min(1, 'Slug不能为空').max(50, 'Slug不超过50字符'),
  category: z.enum(['material', 'process', 'technology', 'region', 'topic']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '请输入有效的颜色值'),
  sortOrder: z.number().int().min(0).default(0),
})

export const dashboardSchema = z.object({
  name: z.string().min(1, '看板名称不能为空').max(50, '看板名称不超过50字符'),
  tagIds: z.array(z.string()).min(1, '至少选择1个标签').max(20, '最多选择20个标签'),
  isDefault: z.boolean().default(false),
})

export const intelligenceSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  titleZh: z.string().optional().default(''),
  titleEn: z.string().optional().default(''),
  summary: z.string().default(''),
  summaryZh: z.string().optional().default(''),
  summaryEn: z.string().optional().default(''),
  content: z.string().default(''),
  contentZh: z.string().optional().default(''),
  contentEn: z.string().optional().default(''),
  tldrZh: z.string().optional().default(''),
  tldrEn: z.string().optional().default(''),
  category: z.string().default('tech'),
  pillars: z.string().optional().default(''),
  countryCode: z.string().optional().default('ALL'),
  importance: z.number().int().min(1).max(5).default(3),
  isHot: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  refineStatus: z.string().default('completed'),
  source: z.string().optional().default(''),
  sourceUrl: z.string().optional().default(''),
  dimension: z.string().optional().default(''),
  region: z.string().optional().default(''),
  tags: z.string().optional().default(''),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type NewsInput = z.infer<typeof newsSchema>
export type TagInput = z.infer<typeof tagSchema>
export type DashboardInput = z.infer<typeof dashboardSchema>
export type IntelligenceInput = z.infer<typeof intelligenceSchema>
