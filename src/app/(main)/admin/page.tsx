import { prisma } from '@/lib/prisma'
import { Globe, Tag, Users, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '后台管理' }

export default async function AdminDashboardPage() {
  const [intelCount, userCount, tagCount, hotCount] = await Promise.all([
    prisma.intelligence.count(),
    prisma.user.count(),
    prisma.tag.count(),
    prisma.intelligence.count({ where: { isHot: true } }),
  ])

  const stats = [
    { label: '情报总数', value: intelCount, icon: Globe, href: '/admin/intelligence', color: 'text-blue-600' },
    { label: '注册用户', value: userCount, icon: Users, href: '/admin/users', color: 'text-green-600' },
    { label: '标签总数', value: tagCount, icon: Tag, href: '/admin/tags', color: 'text-purple-600' },
    { label: '热门情报', value: hotCount, icon: Flame, href: '/admin/intelligence?hot=true', color: 'text-orange-500' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">后台概览</h1>
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
          { href: '/admin/intelligence', label: '管理情报', desc: '查看、编辑和审核情报内容' },
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
