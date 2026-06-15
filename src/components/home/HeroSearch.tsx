'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, PenTool, Box, RotateCcw, Leaf, FlaskConical, Package, RefreshCw, Repeat2 } from 'lucide-react'
import type { HeroDictionary } from '@/i18n/types'

const ZH: HeroDictionary = {
  badge: '八大维度 · 全链可持续智库',
  headline1: '驱动塑料产业链',
  headline2: '可持续发展新范式',
  subtitle: '从模具制造到重复使用，覆盖',
  subtitleBold1: '八大核心维度',
  subtitleBold2: '全球视野',
  subtitleConnector: '，以',
  subtitleEnd: '重塑行业情报格局',
  searchPlaceholder: '搜索维度动态、企业、技术趋势...',
  searchBtn: '搜索',
  ctaPrimary: '情报中心',
  ctaSecondary: '了解八大维度',
  stat1Num: '8',
  stat1Label: '大产业维度',
  stat2Num: '15,000+',
  stat2Label: '覆盖企业',
  stat3Num: '全球',
  stat3Label: '多地区情报视野',
}

// Dimension visual config
const DIMENSIONS = [
  { label: '模具',       icon: PenTool,      color: '#1d4ed8', bg: 'rgba(29,78,216,0.08)',  border: 'rgba(29,78,216,0.18)',  query: 'molds' },
  { label: '成型',       icon: Box,          color: '#0d9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.18)', query: 'molding' },
  { label: '再生塑料',   icon: RotateCcw,    color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)', query: 'recycled' },
  { label: '生物基材料', icon: Leaf,         color: '#059669', bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.18)',  query: 'bio' },
  { label: '助剂',       icon: FlaskConical, color: '#d97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.18)',  query: 'additives' },
  { label: '辅料',       icon: Package,      color: '#ea580c', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.18)',  query: 'auxiliaries' },
  { label: '回收再生',   icon: RefreshCw,    color: '#059669', bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.18)',  query: 'recycling' },
  { label: '重复使用',   icon: Repeat2,      color: '#4338ca', bg: 'rgba(67,56,202,0.08)',  border: 'rgba(67,56,202,0.18)',  query: 'reuse' },
]

interface Props {
  dict?: HeroDictionary
}

export default function HeroSearch({ dict }: Props) {
  const t = dict ?? ZH
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/news?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <section className="relative -mt-16 min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">

      {/* ── Multi-layer gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-cyan-50/40 pointer-events-none" />

      {/* ── Top radial glow ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(8,145,178,0.11) 0%, rgba(16,185,129,0.05) 45%, transparent 68%)',
        }}
      />

      {/* ── Industrial fine grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Dot accent at intersections ── */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.9) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          backgroundPosition: '32px 32px',
        }}
      />

      {/* ── Floating dimension icons (desktop) ── */}
      <div className="absolute top-[22%] left-[6%] pointer-events-none hidden xl:block" style={{ opacity: 0.25 }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.12)' }}>
          <PenTool className="h-5 w-5" style={{ color: '#1d4ed8' }} />
        </div>
      </div>
      <div className="absolute top-[35%] right-[7%] pointer-events-none hidden xl:block" style={{ opacity: 0.22 }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.12)' }}>
          <RefreshCw className="h-5 w-5" style={{ color: '#059669' }} />
        </div>
      </div>
      <div className="absolute bottom-[30%] left-[5%] pointer-events-none hidden xl:block" style={{ opacity: 0.20 }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(67,56,202,0.08)', border: '1px solid rgba(67,56,202,0.12)' }}>
          <Repeat2 className="h-5 w-5" style={{ color: '#4338ca' }} />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 container px-4 pt-20 text-center max-w-4xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-cyan-200 bg-cyan-50/80 text-cyan-700 text-sm font-semibold tracking-wide backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          {t.badge}
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black text-slate-900 mb-6 leading-[1.08] tracking-tight">
          {t.headline1}
          <br />
          <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            {t.headline2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
          <span className="text-slate-800 font-bold">{t.subtitleBold1}</span>
          {t.subtitleConnector}
          <span className="text-cyan-700 font-bold">{t.subtitleBold2}</span>
          {' '}{t.subtitleEnd}
        </p>

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-10 group">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-emerald-400/20 via-cyan-400/15 to-blue-400/15 blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center rounded-3xl border border-slate-200 bg-white shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] focus-within:border-cyan-400 focus-within:shadow-[0_0_0_3px_rgba(8,145,178,0.10),0_2px_16px_-4px_rgba(0,0,0,0.07)] transition-all duration-300">
            <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent pl-11 pr-28 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none text-[14px]"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-5 py-2 rounded-2xl bg-cyan-700 hover:bg-cyan-600 text-white text-[13px] font-semibold transition-colors duration-200 shadow-[0_2px_8px_rgba(8,145,178,0.35)]"
            >
              {t.searchBtn}
            </button>
          </div>
        </form>

        {/* ── CTA buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.push('/news')}
            className="relative overflow-hidden group/btn flex items-center gap-2 px-8 py-3.5 rounded-3xl bg-cyan-700 hover:bg-cyan-600 text-white text-[14px] font-semibold transition-colors duration-200 shadow-[0_4px_20px_rgba(8,145,178,0.30)] hover:shadow-[0_8px_28px_rgba(8,145,178,0.40)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full skew-x-[-20deg] group-hover/btn:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />
            {t.ctaPrimary}
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>
          <button
            onClick={() => router.push('/database')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-3xl border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 text-[14px] font-semibold transition-all duration-200"
          >
            {t.ctaSecondary}
          </button>
        </div>

        {/* ── Eight dimension quick-access ── */}
        <div className="mt-14 mb-6">
          <p className="text-[11px] text-slate-400 font-semibold tracking-[0.12em] uppercase mb-4">八大产业维度 · 快速导览</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DIMENSIONS.map(({ label, icon: Icon, color, bg, border, query: dimQuery }) => (
              <button
                key={dimQuery}
                onClick={() => router.push(`/news?dimension=${dimQuery}`)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[12.5px] font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-sm"
                style={{ background: bg, borderColor: border, color }}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[
            { num: t.stat1Num, label: t.stat1Label },
            { num: t.stat2Num, label: t.stat2Label },
            { num: t.stat3Num, label: t.stat3Label },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4 py-3.5 rounded-3xl bg-white border border-slate-100 shadow-sm">
              <span className="text-xl font-black text-cyan-700">{num}</span>
              <span className="text-[11.5px] text-slate-500 font-medium text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
