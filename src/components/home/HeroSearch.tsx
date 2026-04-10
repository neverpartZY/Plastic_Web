'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/news?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <section className="relative -mt-16 min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">

      {/* ── Deep gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#071a12] to-slate-950 pointer-events-none" />

      {/* ── Ambient glow orbs ── */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-teal-400/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-600/4 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Subtle dot-grid background ── */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 container px-4 pt-16 text-center max-w-4xl mx-auto">

        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          6位1体产业服务体系
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Main title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.12] tracking-tight">
          构建中国塑料循环利用
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            行业数字基石
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          6位1体服务闭环，引领行业从
          <span className="text-slate-200 font-medium">经验决策</span>
          {' '}向{' '}
          <span className="text-emerald-400 font-semibold">数据决策</span>
          {' '}跨越
        </p>

        {/* ── Search bar with glow focus ── */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-10 group">
          {/* Outer glow ring on focus */}
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500/40 to-teal-500/40 blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm focus-within:border-emerald-500/40 transition-colors duration-300">
            <Search className="absolute left-4 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索资讯、企业、技术动态..."
              className="w-full bg-transparent pl-11 pr-28 py-3.5 text-white placeholder:text-slate-500 focus:outline-none text-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors duration-200 shadow-lg shadow-emerald-500/30"
            >
              搜索
            </button>
          </div>
        </form>

        {/* ── CTA buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Primary — shimmer on hover */}
          <button
            onClick={() => router.push('/database')}
            className="relative overflow-hidden group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            {/* Shimmer sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full skew-x-[-20deg] group-hover:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />
            探索平台
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>

          {/* Secondary — shimmer on hover */}
          <button
            onClick={() => router.push('/news')}
            className="relative overflow-hidden group flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/20 hover:border-white/40 text-white/80 hover:text-white text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full skew-x-[-20deg] group-hover:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />
            了解体系
          </button>
        </div>
      </div>

      {/* ── Bottom fade into page background ── */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
