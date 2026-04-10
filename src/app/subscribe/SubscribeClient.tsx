'use client'

import { useState, useMemo, useActionState } from 'react'
import { Flame, Clock, Lock, Globe, TrendingUp, Cpu, Building2, FileText, CheckCircle2, AlertCircle, Send, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { subscribe, type SubscribeState } from './actions'
import type { IntelItem } from './page'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  policy:     { label: '政策法规', icon: FileText,   color: '#60a5fa', bg: 'rgba(59,130,246,0.12)'  },
  market:     { label: '市场行情', icon: TrendingUp,  color: '#34d399', bg: 'rgba(16,185,129,0.12)'  },
  tech:       { label: '技术前沿', icon: Cpu,         color: '#a78bfa', bg: 'rgba(139,92,246,0.12)'  },
  enterprise: { label: '企业动态', icon: Building2,   color: '#fbbf24', bg: 'rgba(245,158,11,0.12)'  },
  global:     { label: '国际动向', icon: Globe,       color: '#f87171', bg: 'rgba(244,63,94,0.12)'   },
}

const ALL_TABS = ['全部', ...Object.keys(CATEGORIES)]

// ── Subscribe form ────────────────────────────────────────────────────────────

const CHANNELS = [
  { value: 'email',    label: '邮件',   accent: '#60a5fa' },
  { value: 'wechat',   label: '微信',   accent: '#34d399' },
  { value: 'feishu',   label: '飞书',   accent: '#a78bfa' },
  { value: 'whatsapp', label: 'WhatsApp', accent: '#fbbf24' },
]

function SubscribeForm() {
  const [channel, setChannel] = useState('email')
  const initialState: SubscribeState = { status: 'idle' }
  const [state, action, pending] = useActionState(subscribe, initialState)

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 md:p-8"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.06) 100%)',
        border: '1px solid rgba(16,185,129,0.20)',
        boxShadow: '0 0 60px rgba(16,185,129,0.06)',
      }}
    >
      {/* Ambient orb */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)', filter: 'blur(40px)' }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.20)', boxShadow: '0 4px 12px rgba(16,185,129,0.20)' }}>
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-white">订阅每日情报</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">每天精选 5-8 条，直达您的首选渠道</p>
          </div>
        </div>

        {state.status === 'success' ? (
          <div className="flex items-center gap-3 py-4 px-5 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <p className="text-[13px] text-emerald-300">{state.message}</p>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="channel" value={channel} />

            {/* Channel selector */}
            <div>
              <label className="block text-[12px] text-slate-400 mb-2 font-medium">接收渠道</label>
              <div className="flex gap-2 flex-wrap">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => setChannel(ch.value)}
                    className="text-[12px] px-3 py-1.5 rounded-lg font-semibold transition-all duration-150"
                    style={channel === ch.value
                      ? { background: `rgba(${ch.accent.slice(1).match(/.{2}/g)!.map(h => parseInt(h, 16)).join(',')},0.20)`, color: ch.accent, border: `1px solid ${ch.accent}40` }
                      : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name (optional) */}
            <div>
              <label htmlFor="sub-name" className="block text-[12px] text-slate-400 mb-1.5 font-medium">
                称呼 <span className="text-slate-600">（选填）</span>
              </label>
              <input
                id="sub-name"
                name="name"
                type="text"
                placeholder="您的姓名或昵称"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white/90 placeholder-slate-600 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(16,185,129,0.40)' }}
                onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)' }}
              />
            </div>

            {/* Contact */}
            <div>
              <label htmlFor="sub-contact" className="block text-[12px] text-slate-400 mb-1.5 font-medium">
                联系方式 <span className="text-rose-400">*</span>
              </label>
              <input
                id="sub-contact"
                name="contact"
                type="text"
                required
                placeholder={channel === 'email' ? '您的邮箱地址' : '您的手机号'}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white/90 placeholder-slate-600 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(16,185,129,0.40)' }}
                onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)' }}
              />
            </div>

            {/* Error */}
            {state.status === 'error' && (
              <div className="flex items-center gap-2 text-[12px] text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 16px rgba(16,185,129,0.30)' }}
            >
              <Send className="h-4 w-4" />
              {pending ? '提交中...' : '立即订阅'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Intel Card ────────────────────────────────────────────────────────────────

function IntelCard({ item }: { item: IntelItem }) {
  const cat = CATEGORIES[item.category]
  const CatIcon = cat?.icon ?? FileText
  const relTime = formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true, locale: zhCN })

  return (
    <div
      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = `1px solid ${cat?.color ?? '#fff'}40`
        e.currentTarget.style.boxShadow = `0 0 24px ${cat?.color ?? '#fff'}12, 0 8px 32px rgba(0,0,0,0.40)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.25)'
      }}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {cat && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{ background: cat.bg, color: cat.color }}>
                <CatIcon className="h-3 w-3" />
                {cat.label}
              </span>
            )}
            {item.isHot && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(244,63,94,0.15)', color: '#f87171', border: '1px solid rgba(244,63,94,0.25)' }}>
                <Flame className="h-2.5 w-2.5" /> 热门
              </span>
            )}
            {item.isPremium && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.22)' }}>
                <Lock className="h-2.5 w-2.5" /> 会员
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 flex-shrink-0">
            <Clock className="h-3 w-3" />
            {relTime}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-semibold text-white/90 leading-snug mb-2 line-clamp-2 group-hover:text-white transition-colors">
          {item.title}
        </h3>

        {/* Summary — blurred if premium */}
        <div className={cn('relative', item.isPremium && 'overflow-hidden')}>
          <p className={cn(
            'text-[12.5px] text-slate-400 leading-relaxed line-clamp-3',
            item.isPremium && 'blur-[3px] select-none',
          )}>
            {item.summary}
          </p>
          {item.isPremium && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(7,17,31,0.85)', border: '1px solid rgba(245,158,11,0.30)' }}>
                <Lock className="h-3 w-3" /> 升级会员查看全文
              </span>
            </div>
          )}
        </div>

        {/* Source */}
        {item.source && (
          <div className="mt-3 text-[11px] text-slate-600 flex items-center gap-1">
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
    <div style={{ background: 'linear-gradient(180deg, #020a14 0%, #07111f 60%, #f8fafc 100%)' }}>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-10 pb-16">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>发现资源</span><span>/</span>
            <span className="text-amber-400 font-medium">每日情报</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-amber-500/25 bg-amber-500/8 text-amber-400 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            精选推送 · 每日更新
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">每日情报</h1>
          <p className="text-slate-400 text-base max-w-xl leading-relaxed">
            精选政策、市场、技术、企业与国际动向，每日 5-8 条，直达您的首选渠道
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: '今日推送', value: `${items.length}` },
              { label: '热门情报', value: `${hotCount}` },
              { label: '更新频率', value: '每日' },
              { label: '覆盖领域', value: `${Object.keys(CATEGORIES).length}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-[12px] text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: intel wall ── */}
          <div className="lg:col-span-2">
            {/* Category tabs */}
            <div className="sticky top-16 z-20 py-3 mb-6"
              style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-1 flex-wrap">
                {ALL_TABS.map((tab) => {
                  const cat = CATEGORIES[tab]
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'text-[12px] px-3 py-1.5 rounded-lg font-semibold transition-all duration-150',
                        activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300',
                      )}
                      style={activeTab === tab
                        ? { background: cat ? cat.bg : 'rgba(255,255,255,0.12)', color: cat?.color ?? '#fff', border: `1px solid ${cat?.color ?? '#fff'}30` }
                        : { background: 'transparent', border: '1px solid transparent' }}
                    >
                      {tab === '全部' ? `全部 (${items.length})` : (cat?.label ?? tab)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Intel cards */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>该分类暂无情报</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((item) => <IntelCard key={item.id} item={item} />)}
              </div>
            )}
          </div>

          {/* ── Right: subscribe panel ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <SubscribeForm />

              {/* Category breakdown */}
              <div className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h4 className="text-[13px] font-semibold text-slate-400 mb-4">情报分布</h4>
                <div className="space-y-2.5">
                  {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const count = items.filter((i) => i.category === key).length
                    const pct = items.length > 0 ? (count / items.length) * 100 : 0
                    const CatIcon = cat.icon
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className="w-full flex items-center gap-3 group"
                      >
                        <CatIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cat.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-[12px] mb-1">
                            <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{cat.label}</span>
                            <span className="text-slate-600">{count}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: cat.color, opacity: 0.7 }} />
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
