'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Plus, Star, Pencil, Trash2, LayoutDashboard, ChevronRight, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import NewsCard from '@/components/news/NewsCard'
import NewsCardSkeleton from '@/components/news/NewsCardSkeleton'
import DashboardTagSelector from '@/components/dashboard/DashboardTagSelector'
import type { DashboardWithTags, NewsListItem, TagsByCategory } from '@/types'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [dashboards, setDashboards] = useState<DashboardWithTags[]>([])
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null)
  const [news, setNews] = useState<NewsListItem[]>([])
  const [tagsByCategory, setTagsByCategory] = useState<TagsByCategory>({
    entity: [], application: [], material: [], process: [], technology: [], region: [], topic: [],
  })
  const [loadingDashboards, setLoadingDashboards] = useState(true)
  const [loadingNews, setLoadingNews] = useState(false)

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<DashboardWithTags | null>(null)
  const [formName, setFormName] = useState('')
  const [formTagIds, setFormTagIds] = useState<string[]>([])
  const [formDefault, setFormDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    async function load() {
      const [dbRes, tagRes] = await Promise.all([
        fetch('/api/dashboards'),
        fetch('/api/tags'),
      ])
      const dbs: DashboardWithTags[] = await dbRes.json()
      const { grouped } = await tagRes.json()

      setDashboards(dbs)
      setTagsByCategory(grouped)

      if (dbs.length) {
        const def = dbs.find((d) => d.isDefault) ?? dbs[0]
        setActiveDashboardId(def.id)
      }
      setLoadingDashboards(false)
    }
    if (session) load()
  }, [session])

  const fetchDashboardNews = useCallback(async (dashboard: DashboardWithTags) => {
    if (!dashboard.tags.length) { setNews([]); return }
    setLoadingNews(true)
    const slugs = dashboard.tags.map((t) => t.slug).join(',')
    const res = await fetch(`/api/news?tags=${slugs}&mode=or&limit=9`)
    const data = await res.json()
    setNews(data.items ?? [])
    setLoadingNews(false)
  }, [])

  useEffect(() => {
    const db = dashboards.find((d) => d.id === activeDashboardId)
    if (db) fetchDashboardNews(db)
  }, [activeDashboardId, dashboards, fetchDashboardNews])

  async function createDashboard() {
    setSaving(true)
    const res = await fetch('/api/dashboards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName, tagIds: formTagIds, isDefault: formDefault }),
    })
    const db: DashboardWithTags = await res.json()
    setDashboards((prev) => {
      const updated = formDefault ? prev.map((d) => ({ ...d, isDefault: false })) : prev
      return [...updated, db]
    })
    setActiveDashboardId(db.id)
    setCreateOpen(false)
    resetForm()
    setSaving(false)
  }

  async function updateDashboard() {
    if (!editingDashboard) return
    setSaving(true)
    const res = await fetch(`/api/dashboards/${editingDashboard.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName, tagIds: formTagIds, isDefault: formDefault }),
    })
    const db: DashboardWithTags = await res.json()
    setDashboards((prev) => {
      let updated = formDefault ? prev.map((d) => ({ ...d, isDefault: false })) : prev
      return updated.map((d) => (d.id === db.id ? db : d))
    })
    setEditOpen(false)
    resetForm()
    setSaving(false)
  }

  async function deleteDashboard(id: string) {
    if (!confirm('确认删除此看板？')) return
    await fetch(`/api/dashboards/${id}`, { method: 'DELETE' })
    const remaining = dashboards.filter((d) => d.id !== id)
    setDashboards(remaining)
    if (activeDashboardId === id) {
      setActiveDashboardId(remaining[0]?.id ?? null)
    }
  }

  async function setDefault(id: string) {
    const res = await fetch(`/api/dashboards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: dashboards.find((d) => d.id === id)!.name,
        tagIds: dashboards.find((d) => d.id === id)!.tags.map((t) => t.id),
        isDefault: true,
      }),
    })
    const db = await res.json()
    setDashboards((prev) =>
      prev.map((d) => d.id === db.id ? { ...d, isDefault: true } : { ...d, isDefault: false })
    )
  }

  function openCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(db: DashboardWithTags) {
    setEditingDashboard(db)
    setFormName(db.name)
    setFormTagIds(db.tags.map((t) => t.id))
    setFormDefault(db.isDefault)
    setEditOpen(true)
  }

  function resetForm() {
    setFormName('')
    setFormTagIds([])
    setFormDefault(false)
    setEditingDashboard(null)
  }

  const activeDashboard = dashboards.find((d) => d.id === activeDashboardId)

  if (status === 'loading' || loadingDashboards) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            我的看板
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            创建自定义看板，按标签组合追踪感兴趣的资讯
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          新建看板
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Dashboard list */}
        <div className="lg:col-span-1">
          {dashboards.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
              <p className="mb-3">还没有看板</p>
              <Button size="sm" onClick={openCreate}>创建第一个看板</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {dashboards.map((db) => (
                <div
                  key={db.id}
                  className={`rounded-xl border p-3 cursor-pointer transition-colors ${
                    activeDashboardId === db.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:border-primary/50'
                  }`}
                  onClick={() => setActiveDashboardId(db.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {db.isDefault && (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-current" />
                      )}
                      <span className="text-sm font-medium truncate">{db.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {db.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          activeDashboardId === db.id
                            ? 'bg-white/20 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {db.tags.length > 3 && (
                      <span className={`text-xs ${activeDashboardId === db.id ? 'opacity-70' : 'text-muted-foreground'}`}>
                        +{db.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {activeDashboardId === db.id && (
                    <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="text-white/70 hover:text-white p-1 rounded"
                        onClick={() => openEdit(db)}
                        title="编辑"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {!db.isDefault && (
                        <button
                          className="text-white/70 hover:text-white p-1 rounded"
                          onClick={() => setDefault(db.id)}
                          title="设为默认"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        className="text-white/70 hover:text-white p-1 rounded"
                        onClick={() => deleteDashboard(db.id)}
                        title="删除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* News grid */}
        <div className="lg:col-span-3">
          {activeDashboard ? (
            <>
              <div className="mb-4">
                <h2 className="font-semibold text-lg">{activeDashboard.name}</h2>
                <p className="text-sm text-muted-foreground">
                  关注标签：{activeDashboard.tags.map((t) => t.name).join(' · ')}
                </p>
              </div>
              {loadingNews ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
                </div>
              ) : news.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                  <p className="mb-2">暂无相关新闻</p>
                  <p className="text-sm">当前看板所选标签暂无匹配内容</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {news.map((item) => <NewsCard key={item.id} news={item} />)}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
              <p>选择或创建一个看板开始追踪资讯</p>
            </div>
          )}
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新建看板</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>看板名称</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例如：欧盟政策追踪"
              />
            </div>
            <div className="space-y-1.5">
              <Label>选择关注标签（OR逻辑，宽泛覆盖）</Label>
              <DashboardTagSelector
                tagsByCategory={tagsByCategory}
                selectedTagIds={formTagIds}
                onChange={setFormTagIds}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="create-default"
                checked={formDefault}
                onCheckedChange={(v) => setFormDefault(!!v)}
              />
              <Label htmlFor="create-default" className="cursor-pointer">设为默认看板</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button
              onClick={createDashboard}
              disabled={!formName || formTagIds.length === 0 || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑看板</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>看板名称</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="看板名称"
              />
            </div>
            <div className="space-y-1.5">
              <Label>关注标签</Label>
              <DashboardTagSelector
                tagsByCategory={tagsByCategory}
                selectedTagIds={formTagIds}
                onChange={setFormTagIds}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-default"
                checked={formDefault}
                onCheckedChange={(v) => setFormDefault(!!v)}
              />
              <Label htmlFor="edit-default" className="cursor-pointer">设为默认看板</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button
              onClick={updateDashboard}
              disabled={!formName || formTagIds.length === 0 || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
