'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { intelligenceSchema, type IntelligenceInput } from '@/lib/validations'

interface Props {
  defaultValues?: Partial<IntelligenceInput> & { id?: string }
}

const CATEGORIES = [
  { value: 'policy', label: '政策' },
  { value: 'market', label: '市场' },
  { value: 'tech', label: '技术' },
  { value: 'enterprise', label: '企业' },
  { value: 'global', label: '全球' },
]

const PILLAR_OPTIONS = [
  { value: 'molds', label: '模具' },
  { value: 'molding', label: '成型' },
  { value: 'recycled', label: '再生塑料' },
  { value: 'bio', label: '生物基材料' },
  { value: 'additives', label: '助剂' },
  { value: 'auxiliaries', label: '辅料' },
  { value: 'recycling', label: '回收再生' },
  { value: 'reuse', label: '重复使用' },
]

const COUNTRY_CODES = [
  { value: 'ALL', label: '不限' },
  { value: 'CN', label: '中国' },
  { value: 'EU', label: '欧盟' },
  { value: 'US', label: '美国' },
  { value: 'UK', label: '英国' },
  { value: 'GLOBAL', label: '全球' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
]

export default function IntelligenceForm({ defaultValues }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const isEdit = !!defaultValues?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IntelligenceInput>({
    resolver: zodResolver(intelligenceSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      category: 'tech',
      pillars: '',
      countryCode: 'ALL',
      importance: 3,
      isHot: false,
      isPremium: false,
      refineStatus: 'completed',
      source: '',
      sourceUrl: '',
      titleZh: '',
      titleEn: '',
      summaryZh: '',
      summaryEn: '',
      contentZh: '',
      contentEn: '',
      tldrZh: '',
      tldrEn: '',
      dimension: '',
      region: '',
      tags: '',
      ...defaultValues,
    },
  })

  const watchCategory = watch('category')
  const watchPillars = watch('pillars')
  const watchCountry = watch('countryCode')
  const watchIsHot = watch('isHot')
  const watchIsPremium = watch('isPremium')
  const watchRefineStatus = watch('refineStatus')

  async function onSubmit(data: IntelligenceInput) {
    setSaving(true)
    const url = isEdit ? `/api/intelligence/${defaultValues!.id}` : '/api/intelligence'
    const method = isEdit ? 'PATCH' : 'POST'

    const payload = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags.join(',') : (String(data.tags || '')),
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/intelligence')
      router.refresh()
    } else {
      const json = await res.json()
      alert('保存失败: ' + JSON.stringify(json.error))
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isEdit ? '编辑情报' : '新建情报'}</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            保存
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Title (original) */}
              <div className="space-y-1.5">
                <Label htmlFor="title">原标题</Label>
                <Input id="title" {...register('title')} placeholder="原始语言标题" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              {/* Title Zh / En */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="titleZh">中文标题</Label>
                  <Input id="titleZh" {...register('titleZh')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="titleEn">英文标题</Label>
                  <Input id="titleEn" {...register('titleEn')} />
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <Label htmlFor="summary">原摘要</Label>
                <Textarea id="summary" rows={3} {...register('summary')} />
                {errors.summary && <p className="text-xs text-destructive">{errors.summary.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="summaryZh">中文摘要</Label>
                  <Textarea id="summaryZh" rows={3} {...register('summaryZh')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="summaryEn">英文摘要</Label>
                  <Textarea id="summaryEn" rows={3} {...register('summaryEn')} />
                </div>
              </div>

              {/* TLDR */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tldrZh">TLDR 中文</Label>
                  <Textarea id="tldrZh" rows={4} {...register('tldrZh')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tldrEn">TLDR 英文</Label>
                  <Textarea id="tldrEn" rows={4} {...register('tldrEn')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader><CardTitle className="text-base">正文</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="content">原正文</Label>
                <Textarea id="content" rows={6} {...register('content')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contentZh">中文正文</Label>
                  <Textarea id="contentZh" rows={6} {...register('contentZh')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contentEn">英文正文</Label>
                  <Textarea id="contentEn" rows={6} {...register('contentEn')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: meta */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">分类与维度</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>分类</Label>
                <Select
                  value={watchCategory}
                  onValueChange={(v) => setValue('category', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pillars">维度（逗号分隔）</Label>
                <Input id="pillars" {...register('pillars')} placeholder="recycling,reuse,molds" />
              </div>

              <div className="space-y-1.5">
                <Label>国家/地区</Label>
                <Select
                  value={watchCountry}
                  onValueChange={(v) => setValue('countryCode', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dimension">主维度</Label>
                <Input id="dimension" {...register('dimension')} placeholder="recycling" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="region">地区</Label>
                <Input id="region" {...register('region')} placeholder="EU" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">标签（逗号分隔）</Label>
                <Input id="tags" {...register('tags')} placeholder="tag1, tag2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">属性设置</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>重要性</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setValue('importance', n)}
                      className={`text-lg transition-colors ${
                        watch('importance') >= n ? 'text-amber-500' : 'text-muted-foreground/30'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isHot"
                    checked={watchIsHot}
                    onCheckedChange={(v) => setValue('isHot', !!v)}
                  />
                  <Label htmlFor="isHot" className="cursor-pointer">热门</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isPremium"
                    checked={watchIsPremium}
                    onCheckedChange={(v) => setValue('isPremium', !!v)}
                  />
                  <Label htmlFor="isPremium" className="cursor-pointer">高级</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>精炼状态</Label>
                <Select
                  value={watchRefineStatus}
                  onValueChange={(v) => setValue('refineStatus', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">来源</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="source">来源名称</Label>
                <Input id="source" {...register('source')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sourceUrl">来源 URL</Label>
                <Input id="sourceUrl" {...register('sourceUrl')} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
