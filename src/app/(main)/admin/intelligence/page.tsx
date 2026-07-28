import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Pencil, Trash2, Flame, Star, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'
import AdminIntelligenceActions from './AdminIntelligenceActions'

export const metadata: Metadata = { title: '情报管理 — 后台' }

const PAGE_SIZE = 20

const CATEGORY_LABELS: Record<string, string> = {
  policy: '政策', market: '市场', tech: '技术',
  enterprise: '企业', global: '全球',
}

const STATUS_LABELS: Record<string, string> = {
  pending: '待处理', processing: '处理中', completed: '已完成', failed: '失败',
}

export default async function AdminIntelligencePage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; status?: string; hot?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const category = searchParams.category || ''
  const status = searchParams.status || ''
  const hotOnly = searchParams.hot === 'true'

  const where: any = {}
  if (category) where.category = category
  if (status) where.refineStatus = status
  if (hotOnly) where.isHot = true

  const [items, total] = await Promise.all([
    prisma.intelligence.findMany({
      where,
      orderBy: [{ isHot: 'desc' }, { importance: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, title: true, titleZh: true, category: true,
        pillars: true, countryCode: true, importance: true,
        isHot: true, isPremium: true, refineStatus: true,
        source: true, publishedAt: true,
      },
    }),
    prisma.intelligence.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">情报管理</h1>
        <p className="text-sm text-muted-foreground">共 {total} 条情报</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterLink active={!category && !status && !hotOnly} href="/admin/intelligence">
          全部
        </FilterLink>
        <FilterLink active={category === 'policy'} href="?category=policy">
          政策
        </FilterLink>
        <FilterLink active={category === 'market'} href="?category=market">
          市场
        </FilterLink>
        <FilterLink active={category === 'tech'} href="?category=tech">
          技术
        </FilterLink>
        <FilterLink active={category === 'enterprise'} href="?category=enterprise">
          企业
        </FilterLink>
        <FilterLink active={category === 'global'} href="?category=global">
          全球
        </FilterLink>
        <span className="mx-1 text-muted-foreground">|</span>
        <FilterLink active={hotOnly} href="?hot=true">
          <Flame className="h-3.5 w-3.5 mr-1" />
          热门
        </FilterLink>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium w-[40%]">标题</th>
              <th className="text-left px-4 py-3 font-medium">分类</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">维度</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">状态</th>
              <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">发布时间</th>
              <th className="text-right px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium line-clamp-2 text-sm">
                      {item.titleZh || item.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {item.isHot && (
                        <Flame className="h-3 w-3 text-orange-500" />
                      )}
                      {item.isPremium && (
                        <Star className="h-3 w-3 text-amber-500" />
                      )}
                      <ImportanceStars n={item.importance} />
                      {item.countryCode && (
                        <span className="text-[10px] text-muted-foreground ml-1">
                          {item.countryCode}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(item.pillars?.split(',').filter(Boolean) ?? []).slice(0, 2).map((p) => (
                      <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <Badge
                    variant={item.refineStatus === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {STATUS_LABELS[item.refineStatus] ?? item.refineStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                  {item.publishedAt.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminIntelligenceActions id={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?${buildQs(searchParams, 'page', String(page - 1))}`}>
                上一页
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground px-3">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?${buildQs(searchParams, 'page', String(page + 1))}`}>
                下一页
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

function FilterLink({
  active, href, children,
}: {
  active: boolean; href: string; children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card hover:bg-muted border-border'
      }`}
    >
      {children}
    </Link>
  )
}

function ImportanceStars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-[10px] ${i < n ? 'text-amber-500' : 'text-muted-foreground/30'}`}
        >
          ★
        </span>
      ))}
    </span>
  )
}

function buildQs(
  current: Record<string, string>,
  key: string,
  value: string
) {
  const params = new URLSearchParams(current)
  params.set(key, value)
  return params.toString()
}
