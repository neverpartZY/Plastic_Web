'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/utils'
import { newsSchema, type NewsInput } from '@/lib/validations'
import type { Tag, TagsByCategory } from '@/types'

interface Props {
  tagsByCategory: TagsByCategory
  defaultValues?: Partial<NewsInput> & { id?: string }
  mode: 'create' | 'edit'
}

export default function NewsForm({ tagsByCategory, defaultValues, mode }: Props) {
  const router = useRouter()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    defaultValues?.tagIds ?? []
  )
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      ...defaultValues,
      tagIds: defaultValues?.tagIds ?? [],
    },
  })

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function onSubmit(data: NewsInput) {
    setError('')
    const payload = { ...data, tagIds: selectedTagIds }

    const url = mode === 'edit' ? `/api/news/${defaultValues?.id}` : '/api/news'
    const method = mode === 'edit' ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setError('保存失败，请检查表单内容')
      return
    }

    router.push('/admin/news')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-1.5">
            <Label>文章标题 *</Label>
            <Input {...register('title')} placeholder="请输入文章标题" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>摘要 *</Label>
            <Textarea
              {...register('summary')}
              placeholder="请输入文章摘要（150-200字）"
              rows={3}
            />
            {errors.summary && <p className="text-xs text-destructive">{errors.summary.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>正文 * （支持HTML格式）</Label>
            <Textarea
              {...register('content')}
              placeholder="请输入文章正文内容..."
              rows={16}
              className="font-mono text-sm"
            />
            {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label>来源</Label>
                <Input {...register('source')} placeholder="来源名称" />
              </div>
              <div className="space-y-1.5">
                <Label>来源链接</Label>
                <Input {...register('sourceUrl')} placeholder="https://..." />
                {errors.sourceUrl && <p className="text-xs text-destructive">{errors.sourceUrl.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>作者</Label>
                <Input {...register('author')} placeholder="作者/编辑" />
              </div>
              <div className="space-y-1.5">
                <Label>发布时间</Label>
                <Input type="datetime-local" {...register('publishedAt')} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register('isPublished')}
                  defaultChecked={defaultValues?.isPublished !== false}
                  className="h-4 w-4 rounded border-primary text-primary"
                />
                <Label htmlFor="isPublished" className="cursor-pointer">立即发布</Label>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label>选择标签 *</Label>
                <span className="text-xs text-muted-foreground">{selectedTagIds.length} 个已选</span>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {CATEGORY_ORDER.map((cat) => {
                  const tags = tagsByCategory[cat as keyof TagsByCategory]
                  if (!tags?.length) return null
                  return (
                    <div key={cat}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {CATEGORY_LABELS[cat]}
                      </p>
                      <div className="space-y-1">
                        {tags.map((tag: Tag) => (
                          <div key={tag.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={selectedTagIds.includes(tag.id)}
                              onCheckedChange={() => toggleTag(tag.id)}
                            />
                            <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer text-sm">
                              {tag.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              {selectedTagIds.length === 0 && (
                <p className="text-xs text-destructive mt-2">请至少选择1个标签</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || selectedTagIds.length === 0}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {mode === 'edit' ? '保存修改' : '发布文章'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/news')}
        >
          取消
        </Button>
      </div>
    </form>
  )
}
