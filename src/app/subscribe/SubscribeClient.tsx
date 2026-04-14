'use client'

import { useState, useMemo } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import {
  Flame, Clock, Lock, Globe, TrendingUp, Cpu,
  Building2, FileText, CheckCircle2, AlertCircle, Send, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { subscribe, type SubscribeState } from './actions'
import type { IntelItem } from './page'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// ── Category config — light palette ──────────────────────────────────────────

const CATEGORIES: Record<string, {
  label: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
}> = {
  policy:     { label: '政策法规', icon: FileText,   color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  market:     { label: '市场行情', icon: TrendingUp,  color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  tech:       { label: '技术前沿', icon: Cpu,         color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  enterprise: { label: '企业动态', icon: Building2,   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  global:     { label: '国际动向', icon: Globe,       color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' },
}

const ALL_TABS = ['全部', ...Object.keys(CATEGORIES)]

// ── Channel options ───────────────────────────────────────────────────────────

const CHANNELS = [
  { value: 'email',    label: '邮件',     color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { value: 'wechat',   label: '微信',     color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  { value: 'feishu',   label: '飞书',     color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { value: 'whatsapp', label: 'WhatsApp', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
]

// ── Submit button ─────────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all duration-200 disabled:opacity-60 bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_16px_rgba(5,150,105,0.30)] hover:shadow-[0_6px_24px_rgba(5,150,105,0.40)]"
    >
      <Send className="h-4 w-4" />
      {pending ? '提交中...' : '立即订阅'}
    </button>
  )
}

// ── Subscribe form — white card ───────────────────────────────────────────────

function SubscribeForm() {
  const [channel, setChannel] = useState('email')
  const initialState: SubscribeState = { status: 'idle' }
  const [state, formAction] = useFormState(subscribe, initialState)

  return (
    <div className="rounded-3xl bg-white border border-emerald-100 shadow-xl shadow-slate-100 overflow-hidden">
      {/* Color top bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

      <div className="p-6 md:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">订阅每日情报</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">每天精选 5–8 条，直达您的首选渠道</p>
          </div>
        </div>

        {state.status === 'success' ? (
          <div className="flex items-center gap-3 py-4 px-5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-[13px] text-emerald-700 font-medium">{state.message}</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="channel" value={channel} />

            {/* Channel selector */}
            <div>
              <label className="block text-[12px] text-slate-600 mb-2 font-semibold">接收渠道</label>
              <div className="flex gap-2 flex-wrap">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => setChannel(ch.value)}
                    className="text-[12px] px-3 py-1.5 rounded-xl font-semibold transition-all duration-150 border"
                    style={channel === ch.value
                      ? { background: ch.bg, color: ch.color, borderColor: ch.border }
                      : { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="sub-name" className="block text-[12px] text-slate-600 mb-1.5 font-semibold">
                称呼 <span className="text-slate-400 font-normal">（选填）</span>
              </label>
              <input
                id="sub-name"
                name="name"
                type="text"
                placeholder="您的姓名或昵称"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-900 placeholder-slate-400 outline-none border border-slate-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>

            {/* Contact */}
            <div>
              <label htmlFor="sub-contact" className="block text-[12px] text-slate-600 mb-1.5 font-semibold">
                联系方式 <span className="text-rose-500">*</span>
              </label>
              <input
                id="sub-contact"
                name="contact"
                type="text"
                required
                placeholder={channel === 'email' ? '您的邮箱地址' : '您的手机号'}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-900 placeholder-slate-400 outline-none border border-slate-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>

            {/* Error */}
            {state.status === 'error' && (
              <div className="flex items-center gap-2 text-[12px] text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2.5 rounded-xl">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {state.message}
              </div>
            )}

            <SubmitButton />
          </form>
        )}
      </div>
    </div>
  )
}

// ── Intel Card — white theme ──────────────────────────────────────────────────

function IntelCard({ item }: { item: IntelItem }) {
  const cat = CATEGORIES[item.category]
  const CatIcon = cat?.icon ?? FileText
  const relTime = formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true, locale: zhCN })

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-5 md:p-6">

        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {cat && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>
                <CatIcon className="h-3 w-3" />
                {cat.label}
              </span>
            )}
            {item.isHot && (
              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-lime-500 text-white">
                <Flame className="h-2.5 w-2.5" /> 热门
              </span>
            )}
            {item.isPremium && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                <Lock className="h-2.5 w-2.5" /> 会员
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0">
            <Clock className="h-3 w-3" />
            {relTime}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-semibold text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {item.title}
        </h3>

        {/* Summary — blurred if premium */}
        <div className={cn('relative', item.isPremium && 'overflow-hidden')}>
          <p className={cn(
            'text-[12.5px] text-slate-500 leading-relaxed line-clamp-3',
            item.isPremium && 'blur-[3px] select-none',
          )}>
            {item.summary}
          </p>
          {item.isPremium && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                <Lock className="h-3 w-3" /> 升级会员查看全文
              </span>
            </div>
          )}
        </div>

        {/* Source */}
        {item.source && (
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <span>来源：</span>
            <span className="text-slate-500">{item.source}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SubscribeClient({ items }: { items: IntelItem[] }) {
  const [activeTab, setActiveTab] = useState('全部')

  const filtered = useMemo(() => {
    if (activeTab === '全部') return items
    return items.filter((i) => i.category === activeTab)
  }, [items, activeTab])

  const hotCount = items.filter((i) => i.isHot).length

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-24 pb-16 bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/20">
        <div className="absolute top-0 left-1/3 w-[600px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute inset-0 opacity-[0.018] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.9) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>发现资源</span><span>/</span>
            <span className="text-amber-600 font-medium">每日情报</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            精选推送 · 每日更新
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">每日情报</h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed">
            精选政策、市场、技术、企业与国际动向，每日 5–8 条，直达您的首选渠道
          </p>

          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { label: '今日推送', value: `${items.length}` },
              { label: '热门情报', value: `${hotCount}` },
              { label: '更新频率', value: '每日' },
              { label: '覆盖领域', value: `${Object.keys(CATEGORIES).length}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <div className="text-2xl font-black text-amber-600">{value}</div>
                <div className="text-[12px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: intel wall ── */}
          <div className="lg:col-span-2">

            {/* Category tabs — white sticky bar */}
            <div className="sticky top-16 z-20 py-3 mb-6 bg-white/95 backdrop-blur-sm border-b border-slate-100">
              <div className="flex gap-1.5 flex-wrap">
                {ALL_TABS.map((tab) => {
                  const cat = CATEGORIES[tab]
                  const isActive = activeTab === tab
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'text-[12px] px-3 py-1.5 rounded-xl font-semibold transition-all duration-150 border',
                        isActive
                          ? 'border-transparent'
                          : 'text-slate-500 hover:text-slate-700 border-transparent hover:border-slate-200 hover:bg-slate-50',
                      )}
                      style={isActive && cat
                        ? { background: cat.bg, color: cat.color, borderColor: cat.border }
                        : isActive
                          ? { background: '#f1f5f9', color: '#0f172a', borderColor: '#e2e8f0' }
                          : undefined}
                    >
                      {tab === '全部' ? `全部 (${items.length})` : (cat?.label ?? tab)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Intel cards grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Zap className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                <p>该分类暂无情报</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filtered.map((item) => <IntelCard key={item.id} item={item} />)}
              </div>
            )}
          </div>

          {/* ── Right: subscribe panel ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <SubscribeForm />

              {/* Category breakdown — white card */}
              <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100">
                <h4 className="text-[13px] font-bold text-slate-700 mb-4">情报分布</h4>
                <div className="space-y-3">
                  {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const count = items.filter((i) => i.category === key).length
                    const pct = items.length > 0 ? (count / items.length) * 100 : 0
                    const CatIcon = cat.icon
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className="w-full flex items-center gap-3 group text-left hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-xl transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: cat.bg }}>
                          <CatIcon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-[12px] mb-1">
                            <span className="text-slate-600 group-hover:text-slate-900 font-medium transition-colors">{cat.label}</span>
                            <span className="text-slate-400 font-semibold">{count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: cat.color }} />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
