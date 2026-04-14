'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Waves, Recycle, Globe } from 'lucide-react'

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/news?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <section className="relative -mt-16 min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">

      {/* ── Layered gradient wash — ocean-to-land ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-cyan-50/60 to-emerald-50/30 pointer-events-none" />

      {/* ── Top-center radial cyan glow ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[720px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(8,145,178,0.13) 0%, rgba(20,184,166,0.06) 40%, transparent 65%)',
        }}
      />

      {/* ── Subtle dot grid ── */}
      <div
        className="absolute inset-0 opacity-[0.020] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.9) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* ── Decorative floating icons ── */}
      <Waves className="absolute top-[22%] left-[8%] h-8 w-8 text-cyan-200 -rotate-12 opacity-60 pointer-events-none hidden lg:block" />
      <Recycle className="absolute top-[30%] right-[9%] h-9 w-9 text-emerald-200 rotate-12 opacity-50 pointer-events-none hidden lg:block" />
      <Globe className="absolute bottom-[28%] left-[6%] h-7 w-7 text-teal-200 opacity-40 pointer-events-none hidden lg:block" />

      {/* ── Content ── */}
      <div className="relative z-10 container px-4 pt-16 text-center max-w-4xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-sm font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          6位1体产业服务体系
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black text-slate-900 mb-6 leading-[1.08] tracking-tight">
          构建中国塑料循环利用
          <br />
          <span className="bg-gradient-to-r from-cyan-700 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
            行业数字基石
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          6位1体服务闭环，引领行业从
          <span className="text-slate-700 font-semibold">经验决策</span>
          {' '}向{' '}
          <span className="text-cyan-700 font-bold">数据决策</span>
          {' '}跨越
        </p>

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-10 group">
          {/* Focus glow ring */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-cyan-400/25 to-teal-400/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center rounded-3xl border border-slate-200 bg-white shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] focus-within:border-cyan-400 focus-within:shadow-[0_0_0_3px_rgba(8,145,178,0.10),0_2px_16px_-4px_rgba(0,0,0,0.07)] transition-all duration-300">
            <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索资讯、企业、技术动态..."
              className="w-full bg-transparent pl-11 pr-28 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none text-[14px]"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-5 py-2 rounded-2xl bg-cyan-700 hover:bg-cyan-600 text-white text-[13px] font-semibold transition-colors duration-200 shadow-[0_2px_8px_rgba(8,145,178,0.35)]"
            >
              搜索
            </button>
          </div>
        </form>

        {/* ── CTA buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Primary — ocean cyan */}
          <button
            onClick={() => router.push('/database')}
            className="relative overflow-hidden group/btn flex items-center gap-2 px-8 py-3.5 rounded-3xl bg-cyan-700 hover:bg-cyan-600 text-white text-[14px] font-semibold transition-colors duration-200 shadow-[0_4px_20px_rgba(8,145,178,0.30)] hover:shadow-[0_8px_28px_rgba(8,145,178,0.40)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full skew-x-[-20deg] group-hover/btn:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />
            探索平台
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>

          {/* Secondary */}
          <button
            onClick={() => router.push('/news')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-3xl border border-cyan-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 text-[14px] font-semibold transition-all duration-200"
          >
            了解体系
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-xl mx-auto">
          {[
            { num: '6+',      label: '核心服务模块' },
            { num: '2,400+',  label: '重点跟踪企业' },
            { num: '日更新',  label: '产业情报推送' },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4 py-3.5 rounded-3xl bg-white border border-cyan-100 shadow-sm">
              <span className="text-xl font-black text-cyan-700">{num}</span>
              <span className="text-[12px] text-slate-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom fade into section below ── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
