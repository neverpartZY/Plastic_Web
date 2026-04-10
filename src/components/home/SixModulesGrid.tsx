'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Newspaper, Users, Calendar, Cpu, TrendingUp, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────────────────────
   Module definitions  — each carries its own gradient, glow, and accent colour
   ───────────────────────────────────────────────────────────────────────────── */
const MODULES = [
  {
    href: '/think-tank',
    label: '智库',
    tag: '运营服务',
    icon: BookOpen,
    desc: '行业研究与战略洞察，为政策研判与商业决策提供量化依据',
    iconGrad: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    glowColor: 'rgba(99,102,241,0.30)',
    borderActive: 'rgba(99,102,241,0.38)',
    cardShadowHover: '0 0 48px rgba(99,102,241,0.18), 0 24px 48px rgba(0,0,0,0.45)',
    accentColor: '#a5b4fc',
    tagBg: 'rgba(99,102,241,0.12)',
    tagColor: '#a5b4fc',
  },
  {
    href: '/news',
    label: '行业媒体',
    tag: '运营服务',
    icon: Newspaper,
    desc: '资讯聚合与传播，覆盖价格行情、政策法规、企业动态全维度',
    iconGrad: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    glowColor: 'rgba(16,185,129,0.30)',
    borderActive: 'rgba(16,185,129,0.38)',
    cardShadowHover: '0 0 48px rgba(16,185,129,0.18), 0 24px 48px rgba(0,0,0,0.45)',
    accentColor: '#6ee7b7',
    tagBg: 'rgba(16,185,129,0.12)',
    tagColor: '#6ee7b7',
  },
  {
    href: '/association',
    label: '行业协会',
    tag: '运营服务',
    icon: Users,
    desc: '组织连接与协作，构建产业上下游企业互信生态网络',
    iconGrad: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    glowColor: 'rgba(139,92,246,0.30)',
    borderActive: 'rgba(139,92,246,0.38)',
    cardShadowHover: '0 0 48px rgba(139,92,246,0.18), 0 24px 48px rgba(0,0,0,0.45)',
    accentColor: '#c4b5fd',
    tagBg: 'rgba(139,92,246,0.12)',
    tagColor: '#c4b5fd',
  },
  {
    href: '/events',
    label: '会展平台',
    tag: '运营服务',
    icon: Calendar,
    desc: '展会与活动中心，链接供需两端，促进产业资源高效流动',
    iconGrad: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    glowColor: 'rgba(245,158,11,0.30)',
    borderActive: 'rgba(245,158,11,0.38)',
    cardShadowHover: '0 0 48px rgba(245,158,11,0.18), 0 24px 48px rgba(0,0,0,0.45)',
    accentColor: '#fcd34d',
    tagBg: 'rgba(245,158,11,0.12)',
    tagColor: '#fcd34d',
  },
  {
    href: '/technology',
    label: '技术开发',
    tag: '攻坚支撑',
    icon: Cpu,
    desc: '关键空白技术突破，推动机械、化学、酶解回收等前沿研究落地',
    iconGrad: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    glowColor: 'rgba(6,182,212,0.30)',
    borderActive: 'rgba(6,182,212,0.38)',
    cardShadowHover: '0 0 48px rgba(6,182,212,0.18), 0 24px 48px rgba(0,0,0,0.45)',
    accentColor: '#67e8f9',
    tagBg: 'rgba(6,182,212,0.12)',
    tagColor: '#67e8f9',
  },
  {
    href: '/fund',
    label: '投资基金',
    tag: '攻坚支撑',
    icon: TrendingUp,
    desc: '产业投资与赋能，加速优质项目从技术验证到市场规模跨越',
    iconGrad: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    glowColor: 'rgba(244,63,94,0.30)',
    borderActive: 'rgba(244,63,94,0.38)',
    cardShadowHover: '0 0 48px rgba(244,63,94,0.18), 0 24px 48px rgba(0,0,0,0.45)',
    accentColor: '#fda4af',
    tagBg: 'rgba(244,63,94,0.12)',
    tagColor: '#fda4af',
  },
] as const

/* ═══════════════════════════════════════════════════════════════════════════════
   SixModulesGrid
   ═════════════════════════════════════════════════════════════════════════════ */
export default function SixModulesGrid() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
      },
      { threshold: 0.06 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #020a14 0%, #040d1a 50%, #07111f 100%)' }}
    >
      {/* ── Ambient glow orbs ── */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }}
        aria-hidden="true"
      />

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 opacity-[0.028] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Section header ── */}
        <div
          className={cn(
            'text-center mb-14 transition-all duration-700',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          )}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-semibold tracking-wide backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            六大模块 · 数据闭环
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-[2.25rem] font-bold text-white mb-4 tracking-tight leading-tight">
            每个模块，都在向数据库输送养分
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            六大业务持续汇聚行业数据，底层数据库沉淀后反向赋能，
            <br className="hidden sm:block" />
            形成自我强化的数字生态
          </p>
        </div>

        {/* ── Bento card grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon
            return (
              <div
                key={mod.href}
                className={cn(
                  'transition-all duration-500 ease-out',
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
                )}
                style={{ transitionDelay: visible ? `${i * 80 + 100}ms` : '0ms' }}
              >
                {/* ── Glass card ── */}
                <div
                  onClick={() => router.push(mod.href)}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(255,255,255,0.07)'
                    el.style.border = `1px solid ${mod.borderActive}`
                    el.style.boxShadow = mod.cardShadowHover
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(255,255,255,0.04)'
                    el.style.border = '1px solid rgba(255,255,255,0.08)'
                    el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
                  }}
                >
                  {/* Inner glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${mod.glowColor} 0%, transparent 65%)` }}
                    aria-hidden="true"
                  />

                  {/* Arrow indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 delay-75 translate-x-1 group-hover:translate-x-0">
                    <ArrowUpRight className="h-4 w-4" style={{ color: mod.accentColor }} />
                  </div>

                  <div className="relative z-10 p-6 md:p-7">

                    {/* ── Icon + Tag row ── */}
                    <div className="flex items-start justify-between mb-5">
                      {/* Icon container */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: mod.iconGrad,
                          boxShadow: `0 8px 24px ${mod.glowColor}, 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.20)`,
                        }}
                      >
                        <Icon className="h-7 w-7 text-white drop-shadow-sm" aria-hidden="true" />
                      </div>

                      {/* Tag badge */}
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-transparent mt-0.5"
                        style={{
                          background: mod.tagBg,
                          color: mod.tagColor,
                          border: `1px solid ${mod.tagColor}30`,
                        }}
                      >
                        {mod.tag}
                      </span>
                    </div>

                    {/* ── Title ── */}
                    <h3
                      className="text-[18px] font-bold mb-2.5 leading-snug transition-colors duration-200"
                      style={{ color: '#f1f5f9' }}
                    >
                      {mod.label}
                    </h3>

                    {/* ── Description ── */}
                    <p className="text-[13.5px] text-slate-400 leading-relaxed mb-5">
                      {mod.desc}
                    </p>

                    {/* ── Hover reveal — data live indicator ── */}
                    <div
                      className="flex items-center gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75 pt-4 border-t"
                      style={{ borderColor: `${mod.accentColor}20` }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                        style={{ background: mod.accentColor }}
                        aria-hidden="true"
                      />
                      <span className="text-[11.5px] font-semibold" style={{ color: mod.accentColor }}>
                        数据已接入底层数据库
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Bottom hint ── */}
        <div
          className={cn(
            'text-center mt-12 transition-all duration-700 delay-700',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          )}
        >
          <p className="text-xs text-slate-600">
            六个模块的数据汇聚至{' '}
            <button
              onClick={() => router.push('/database')}
              className="text-emerald-500 hover:text-emerald-400 font-medium underline underline-offset-2 transition-colors"
            >
              底层数据库
            </button>
            ，形成行业级知识图谱
          </p>
        </div>
      </div>

      {/* ── Fade into next section ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--background, #f8fafc))' }}
        aria-hidden="true"
      />
    </section>
  )
}
