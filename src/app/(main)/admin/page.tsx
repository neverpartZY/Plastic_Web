import { prisma } from '@/lib/prisma'
import { Newspaper, Tag, Users, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '后台管理' }

export default async function AdminDashboardPage() {
  const [newsCount, userCount, tagCount, totalViews] = await Promise.all([
    prisma.news.count({ where: { isPublished: true } }),
    prisma.user.count(),
    prisma.tag.count(),
    prisma.news.aggregate({ _sum: { viewCount: true } }),
  ])

  const stats = [
    { label: '已发布文章', value: newsCount, icon: Newspaper, href: '/admin/news', color: 'text-blue-600' },
    { label: '注册用户', value: userCount, icon: Users, href: '/admin/users', color: 'text-green-600' },
    { label: '标签总数', value: tagCount, icon: Tag, href: '/admin/tags', color: 'text-purple-600' },
    { label: '总阅读量', value: (totalViews._sum.viewCount ?? 0).toLocaleString(), icon: Eye, href: '/admin/news', color: 'text-amber-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">后台概览</h1>
        <Button asChild>
          <Link href="/admin/news/new">发布新文章</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="text-2xl font-bold">{value}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/news', label: '管理文章', desc: '增删改查所有新闻文章' },
          { href: '/admin/tags', label: '管理标签', desc: '维护标签分类体系' },
          { href: '/admin/users', label: '管理用户', desc: '查看用户列表及状态' },
        ].map(({ href, label, desc }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-1">{label}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
