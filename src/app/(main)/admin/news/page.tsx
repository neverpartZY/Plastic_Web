import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import AdminNewsActions from './AdminNewsActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '新闻管理' }

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const limit = 20

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        isPublished: true,
        viewCount: true,
        publishedAt: true,
        source: true,
        tags: { include: { tag: { select: { id: true, name: true, color: true } } } },
      },
    }),
    prisma.news.count(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">新闻管理</h1>
        <Button asChild>
          <Link href="/admin/news/new" className="gap-2">
            <Plus className="h-4 w-4" />
            发布文章
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">标题</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">标签</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">状态</th>
              <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">阅读</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">发布时间</th>
              <th className="text-right px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/news/${item.id}`} className="hover:text-primary line-clamp-1 block max-w-xs">
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((t) => (
                      <span
                        key={t.tag.id}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                        style={{ backgroundColor: t.tag.color + '20', color: t.tag.color }}
                      >
                        {t.tag.name}
                      </span>
                    ))}
                    {item.tags.length > 3 && <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.isPublished ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden lg:table-cell text-muted-foreground">
                  {item.viewCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                  {formatDate(item.publishedAt.toISOString())}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminNewsActions id={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground">共 {total} 篇</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/news?page=${page - 1}`}>上一页</Link>
                </Button>
              )}
              {page * limit < total && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/news?page=${page + 1}`}>下一页</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
