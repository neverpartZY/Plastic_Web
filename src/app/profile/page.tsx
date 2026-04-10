'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, User, Bookmark, Settings, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import NewsCard from '@/components/news/NewsCard'
import type { DashboardWithTags, NewsListItem } from '@/types'

interface BookmarkItem {
  id: string
  createdAt: string
  news: NewsListItem
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [dashboards, setDashboards] = useState<DashboardWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    setName(session.user.name ?? '')
    async function load() {
      const [bRes, dRes] = await Promise.all([
        fetch('/api/bookmarks'),
        fetch('/api/dashboards'),
      ])
      setBookmarks(await bRes.json())
      setDashboards(await dRes.json())
      setLoading(false)
    }
    load()
  }, [session])

  async function saveName() {
    setSavingName(true)
    await fetch(`/api/users/${session!.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setSavingName(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="container py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-2xl bg-primary text-white">
            {session.user.name?.slice(0, 2) ?? 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{session.user.name}</h1>
          <p className="text-muted-foreground text-sm">{session.user.email}</p>
          {session.user.role === 'admin' && (
            <Badge className="mt-1">管理员</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="bookmarks">
        <TabsList>
          <TabsTrigger value="bookmarks" className="gap-2">
            <Bookmark className="h-4 w-4" />
            我的收藏 ({bookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            我的看板 ({dashboards.length})
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Settings className="h-4 w-4" />
            账号设置
          </TabsTrigger>
        </TabsList>

        {/* Bookmarks */}
        <TabsContent value="bookmarks" className="mt-6">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="mb-3">还没有收藏任何文章</p>
              <Button asChild variant="outline">
                <Link href="/news">去浏览新闻</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookmarks.map((b) => (
                <NewsCard key={b.id} news={b.news} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Dashboards */}
        <TabsContent value="dashboards" className="mt-6">
          {dashboards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LayoutDashboard className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="mb-3">还没有创建看板</p>
              <Button asChild>
                <Link href="/dashboard">创建看板</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboards.map((db) => (
                <Card key={db.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{db.name}</h3>
                      {db.isDefault && (
                        <Badge variant="secondary" className="text-xs">默认</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {db.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      创建于 {formatDate(db.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">管理看板</Link>
            </Button>
          </div>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="mt-6">
          <Card className="max-w-md">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label>姓名</Label>
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入姓名"
                  />
                  <Button onClick={saveName} disabled={savingName} size="sm">
                    {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>邮箱</Label>
                <Input value={session.user.email ?? ''} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>账户类型</Label>
                <Input value={session.user.role === 'admin' ? '管理员' : '普通用户'} disabled />
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                <p>会员功能即将开放，敬请期待。</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
