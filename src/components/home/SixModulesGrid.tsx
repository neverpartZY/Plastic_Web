'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Newspaper, Users, Calendar, Cpu, TrendingUp, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────────────────────
   Module definitions — icon gradients stay vibrant on white backgrounds
   ───────────────────────────────────────────────────────────────────────────── */
const MODULES = [
  {
    href: '/think-tank',
    label: '智库',
    tag: '运营服务',
    icon: BookOpen,
    desc: '行业研究与战略洞察，为政策研判与商业决策提供量化依据',
    iconGrad: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    accentColor: '#4f46e5',
    accentBg: '#eef2ff',
    tagColor: '#4f46e5',
    tagBg: '#eef2ff',
    borderHover: '#6366f1',
  },
  {
    href: '/news',
    label: '行业媒体',
    tag: '运营服务',
    icon: Newspaper,
    desc: '资讯聚合与传播，覆盖价格行情、政策法规、企业动态全维度',
    iconGrad: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    accentColor: '#059669',
    accentBg: '#ecfdf5',
    tagColor: '#059669',
    tagBg: '#ecfdf5',
    borderHover: '#10b981',
  },
  {
    href: '/association',
    label: '行业协会',
    tag: '运营服务',
    icon: Users,
    desc: '组织连接与协作，构建产业上下游企业互信生态网络',
    iconGrad: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    accentColor: '#7c3aed',
    accentBg: '#f5f3ff',
    tagColor: '#7c3aed',
    tagBg: '#f5f3ff',
    borderHover: '#8b5cf6',
  },
  {
    href: '/events',
    label: '会展平台',
    tag: '运营服务',
    icon: Calendar,
    desc: '展会与活动中心，链接供需两端，促进产业资源高效流动',
    iconGrad: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    accentColor: '#d97706',
    accentBg: '#fffbeb',
    tagColor: '#d97706',
    tagBg: '#fffbeb',
    borderHover: '#f59e0b',
  },
  {
    href: '/technology',
    label: '技术开发',
    tag: '攻坚支撑',
    icon: Cpu,
    desc: '关键空白技术突破，推动机械、化学、酶解回收等前沿研究落地',
    iconGrad: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    accentColor: '#0891b2',
    accentBg: '#ecfeff',
    tagColor: '#0891b2',
    tagBg: '#ecfeff',
    borderHover: '#06b6d4',
  },
  {
    href: '/fund',
    label: '投资基金',
    tag: '攻坚支撑',
    icon: TrendingUp,
    desc: '产业投资与赋能，加速优质项目从技术验证到市场规模跨越',
    iconGrad: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    accentColor: '#e11d48',
    accentBg: '#fff1f2',
    tagColor: '#e11d48',
    tagBg: '#fff1f2',
    borderHover: '#f43f5e',
  },
] as const

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
      className="relative py-20 md:py-28 bg-slate-50 overflow-hidden"
    >
      {/* ── Subtle background pattern ── */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.9) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
        aria-hidden="true"
      />

      {/* ── Light emerald top accent ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.07) 0%, transparent 70%)' }}
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            六大模块 · 数据闭环
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-[2.25rem] font-bold text-slate-900 mb-4 tracking-tight leading-tight">
            每个模块，都在向数据库输送养分
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
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
                <div
                  onClick={() => router.push(mod.href)}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = `${mod.borderHover}60`
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = ''
                  }}
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

                    {/* ── Icon + Tag row ── */}
                    <div className="flex items-start justify-between mb-5">
                      {/* Icon */}
                      <div
                        className="w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 w-[52px] h-[52px]"
                        style={{
                          background: mod.iconGrad,
                          boxShadow: `0 6px 20px ${mod.accentColor}28`,
                        }}
                      >
                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>

                      {/* Tag badge */}
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full mt-0.5"
                        style={{ background: mod.tagBg, color: mod.tagColor }}
                      >
                        {mod.tag}
                      </span>
                    </div>

                    {/* ── Title ── */}
                    <h3 className="text-[17px] font-bold text-slate-900 mb-2.5 leading-snug group-hover:text-emerald-700 transition-colors duration-200">
                      {mod.label}
                    </h3>

                    {/* ── Description ── */}
                    <p className="text-[13.5px] text-slate-500 leading-relaxed mb-5">
                      {mod.desc}
                    </p>

                    {/* ── Hover reveal ── */}
                    <div className="flex items-center gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75 pt-4 border-t border-slate-100">
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
          <p className="text-xs text-slate-400">
            六个模块的数据汇聚至{' '}
            <button
              onClick={() => router.push('/database')}
              className="text-emerald-600 hover:text-emerald-500 font-semibold underline underline-offset-2 transition-colors"
            >
              底层数据库
            </button>
            ，形成行业级知识图谱
          </p>
        </div>
      </div>
    </section>
  )
}
