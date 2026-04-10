'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { CATEGORY_LABELS } from '@/lib/utils'
import type { Tag } from '@/types'

const CATEGORIES = ['material', 'process', 'technology', 'region', 'topic'] as const

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Tag | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', category: 'material', color: '#3B82F6', sortOrder: 0 })
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/tags')
    const data = await res.json()
    setTags(data.tags)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', slug: '', category: 'material', color: '#3B82F6', sortOrder: 0 })
    setOpen(true)
  }

  function openEdit(tag: Tag) {
    setEditing(tag)
    setForm({ name: tag.name, slug: tag.slug, category: tag.category, color: tag.color, sortOrder: tag.sortOrder })
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch(`/api/tags/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    await load()
    setOpen(false)
    setSaving(false)
  }

  async function deleteTag(id: string) {
    if (!confirm('确认删除此标签？删除后将从所有文章中移除。')) return
    await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    setTags((prev) => prev.filter((t) => t.id !== id))
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = tags.filter((t) => t.category === cat)
    return acc
  }, {} as Record<string, Tag[]>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">标签管理</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          新建标签
        </Button>
      </div>

      <div className="space-y-6">
        {CATEGORIES.map((cat) => (
          <div key={cat}>
            <h2 className="font-semibold mb-2 text-muted-foreground text-sm uppercase tracking-wider">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2 font-medium">名称</th>
                    <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Slug</th>
                    <th className="text-left px-4 py-2 font-medium hidden md:table-cell">颜色</th>
                    <th className="text-right px-4 py-2 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {byCategory[cat]?.map((tag) => (
                    <tr key={tag.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      </td>
                      <td className="px-4 py-2 hidden sm:table-cell text-muted-foreground font-mono text-xs">
                        {tag.slug}
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full border"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-xs text-muted-foreground font-mono">{tag.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tag)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => deleteTag(tag.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!byCategory[cat]?.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-sm text-muted-foreground">
                        暂无标签
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑标签' : '新建标签'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>标签名称</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm((f) => ({ ...f, name, slug: editing ? f.slug : autoSlug(name) }))
                }}
                placeholder="例如：PET"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug（URL标识）</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="例如：pet"
              />
            </div>
            <div className="space-y-1.5">
              <Label>分类</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>颜色</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="h-9 w-16 cursor-pointer rounded border"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  placeholder="#3B82F6"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>排序</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={save} disabled={!form.name || !form.slug || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
