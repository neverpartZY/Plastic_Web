'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings2, Layers, FlaskConical, Box, RefreshCw, BarChart3, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SixModulesDictionary } from '@/i18n/types'

/* ─────────────────────────────────────────────────────────────────────────────
   Visual config — locale-independent
   ───────────────────────────────────────────────────────────────────────────── */

const MODULE_STYLE = [
  {
    key: 'machinery' as const,    href: '/news?pillar=machinery',
    icon: Settings2,
    tagKey: 'tagPrimary' as const,
    iconGrad: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
    accentColor: '#1d4ed8', accentBg: '#eff6ff',
    tagColor: '#1d4ed8', tagBg: '#eff6ff',
    borderHover: '#3b82f6',
  },
  {
    key: 'materials' as const,    href: '/news?pillar=materials',
    icon: Layers,
    tagKey: 'tagPrimary' as const,
    iconGrad: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
    accentColor: '#0d9488', accentBg: '#f0fdfa',
    tagColor: '#0d9488', tagBg: '#f0fdfa',
    borderHover: '#14b8a6',
  },
  {
    key: 'additives' as const,    href: '/news?pillar=additives',
    icon: FlaskConical,
    tagKey: 'tagPrimary' as const,
    iconGrad: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
    accentColor: '#7c3aed', accentBg: '#f5f3ff',
    tagColor: '#7c3aed', tagBg: '#f5f3ff',
    borderHover: '#8b5cf6',
  },
  {
    key: 'auxiliaries' as const,  href: '/news?pillar=auxiliaries',
    icon: Box,
    tagKey: 'tagPrimary' as const,
    iconGrad: 'linear-gradient(135deg, #d97706 0%, #f97316 100%)',
    accentColor: '#d97706', accentBg: '#fffbeb',
    tagColor: '#d97706', tagBg: '#fffbeb',
    borderHover: '#f59e0b',
  },
  {
    key: 'recycling' as const,    href: '/news?pillar=recycling',
    icon: RefreshCw,
    tagKey: 'tagPrimary' as const,
    iconGrad: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)',
    accentColor: '#059669', accentBg: '#ecfdf5',
    tagColor: '#059669', tagBg: '#ecfdf5',
    borderHover: '#10b981',
  },
  {
    key: 'carbonPolicy' as const, href: '/news?pillar=carbonPolicy',
    icon: BarChart3,
    tagKey: 'tagSecondary' as const,
    iconGrad: 'linear-gradient(135deg, #4338ca 0%, #0e7490 100%)',
    accentColor: '#4338ca', accentBg: '#eef2ff',
    tagColor: '#4338ca', tagBg: '#eef2ff',
    borderHover: '#6366f1',
  },
]

const ZH: SixModulesDictionary = {
  badge: '六大支柱 · 数据闭环',
  title: '每个支柱，都在向知识中枢汇流',
  subtitle: '六大产业支柱持续汇聚行业数据，知识中枢沉淀后反向赋能，',
  subtitleEnd: '形成自我强化的产业数字生态',
  tagPrimary: '核心支柱',
  tagSecondary: '政策支柱',
  connected: '数据已接入产业知识中枢',
  bottomHint1: '六大支柱的情报数据汇聚至',
  bottomDatabase: '产业知识中枢',
  bottomHint2: '，形成可持续塑料产业知识图谱',
  modules: {
    machinery:    { label: '绿色机械',   desc: '注塑、挤出、造粒等装备能效升级与智能化改造，追踪绿色制造最新标准' },
    materials:    { label: '可持续材料', desc: '生物基、PCR 再生料、可降解聚合物研究前沿，覆盖材料认证与标准动态' },
    additives:    { label: '环保助剂',   desc: '无重金属稳定剂、生物基增塑剂、无卤阻燃剂等绿色化学助剂体系' },
    auxiliaries:  { label: '绿色辅料',   desc: '模具工艺、功能薄膜与绿色包装辅料，赋能生产全流程降碳减排' },
    recycling:    { label: '循环再生',   desc: '机械/化学/酶解回收四大路径，推动再生产业链规模化与高值化' },
    carbonPolicy: { label: '碳中和/政策',desc: '欧盟 CBAM、EPR 法规、中国双碳目标及全球塑料公约深度解读' },
  },
}

export default function SixModulesGrid({ dict }: { dict?: SixModulesDictionary }) {
  const t = dict ?? ZH
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.06 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 bg-slate-50 overflow-hidden"
    >
      {/* Fine grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.018) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      {/* Top accent glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(8,145,178,0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Section header ── */}
        <div className={cn(
          'text-center mb-14 transition-all duration-700',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        )}>
          {/* Six-pillar color bar */}
          <div className="flex items-center justify-center gap-1 mb-5">
            {['bg-blue-500', 'bg-teal-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500'].map((c, i) => (
              <div key={i} className={`h-0.5 w-10 rounded-full ${c} opacity-60`} />
            ))}
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            {t.badge}
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-[2.25rem] font-bold text-slate-900 mb-4 tracking-tight leading-tight">
            {t.title}
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            {t.subtitle}
            <br className="hidden sm:block" />
            {t.subtitleEnd}
          </p>
        </div>

        {/* ── Bento card grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {MODULE_STYLE.map((mod, i) => {
            const Icon = mod.icon
            const content = t.modules[mod.key]
            const tag = t[mod.tagKey]
            return (
              <div
                key={mod.href}
                className={cn(
                  'transition-all duration-500 ease-out',
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
                )}
                style={{ transitionDelay: visible ? `${i * 80 + 100}ms` : '0ms' }}
              >
                <div
                  onClick={() => router.push(mod.href)}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${mod.borderHover}60` }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '' }}
                >
                  {/* Top accent line */}
                  <div
                    className="h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-out"
                    style={{ background: mod.iconGrad }}
                    aria-hidden="true"
                  />

                  {/* Arrow indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 delay-75 translate-x-1 group-hover:translate-x-0">
                    <ArrowUpRight className="h-4 w-4" style={{ color: mod.accentColor }} />
                  </div>

                  <div className="p-6 md:p-7">

                    {/* Icon + Tag row */}
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                        style={{ background: mod.iconGrad, boxShadow: `0 6px 20px ${mod.accentColor}28` }}
                      >
                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full mt-0.5"
                        style={{ background: mod.tagBg, color: mod.tagColor }}
                      >
                        {tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[17px] font-bold text-slate-900 mb-2.5 leading-snug group-hover:text-emerald-700 transition-colors duration-200">
                      {content.label}
                    </h3>

                    {/* Description */}
                    <p className="text-[13.5px] text-slate-500 leading-relaxed mb-5">
                      {content.desc}
                    </p>

                    {/* Hover reveal */}
                    <div className="flex items-center gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75 pt-4 border-t border-slate-100">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                        style={{ background: mod.accentColor }}
                        aria-hidden="true"
                      />
                      <span className="text-[11.5px] font-semibold" style={{ color: mod.accentColor }}>
                        {t.connected}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom hint */}
        <div className={cn(
          'text-center mt-12 transition-all duration-700 delay-700',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}>
          <p className="text-xs text-slate-400">
            {t.bottomHint1}{' '}
            <button
              onClick={() => router.push('/database')}
              className="text-emerald-600 hover:text-emerald-500 font-semibold underline underline-offset-2 transition-colors"
            >
              {t.bottomDatabase}
            </button>
            {t.bottomHint2}
          </p>
        </div>
      </div>
    </section>
  )
}
