'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Newspaper, Users, Calendar, Cpu, TrendingUp, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Node definitions ──────────────────────────────────────────────────────────

const TOP_NODES = [
  { id: 'think-tank',  label: '智库',    icon: BookOpen,  color: '#3b82f6', iconBg: 'bg-blue-50',    iconText: 'text-blue-600',    border: 'border-blue-200',    href: '/think-tank',  tag: '运营服务' },
  { id: 'media',       label: '行业媒体', icon: Newspaper, color: '#10b981', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', border: 'border-emerald-200', href: '/news',        tag: '运营服务' },
] as const

const MID_NODES = [
  { id: 'events',      label: '会展平台', icon: Calendar,   color: '#f59e0b', iconBg: 'bg-amber-50',   iconText: 'text-amber-600',  border: 'border-amber-200',  href: '/events',      tag: '运营服务' },
  { id: 'association', label: '行业协会', icon: Users,      color: '#8b5cf6', iconBg: 'bg-violet-50',  iconText: 'text-violet-600', border: 'border-violet-200', href: '/association', tag: '运营服务' },
  { id: 'technology',  label: '技术开发', icon: Cpu,        color: '#06b6d4', iconBg: 'bg-cyan-50',    iconText: 'text-cyan-600',   border: 'border-cyan-200',   href: '/technology',  tag: '攻坚支撑' },
  { id: 'fund',        label: '投资基金', icon: TrendingUp, color: '#f43f5e', iconBg: 'bg-rose-50',    iconText: 'text-rose-600',   border: 'border-rose-200',   href: '/fund',        tag: '攻坚支撑' },
] as const

type AnyNode = (typeof TOP_NODES)[number] | (typeof MID_NODES)[number]
const ALL_NODES: AnyNode[] = [...TOP_NODES, ...MID_NODES]

// ── Types ─────────────────────────────────────────────────────────────────────

interface Pos { x: number; y: number; w: number; h: number }

// ── Flowing particles along an SVG path ───────────────────────────────────────

function FlowDots({ pathId, color }: { pathId: string; color: string }) {
  const dur = 2.0
  return (
    <>
      {[0, 1, 2].map(j => {
        const begin = `${j * (dur / 3)}s`
        return (
          <circle key={j} r="2.5">
            <animate
              attributeName="fill"
              values={`${color}00;${color}bb;${color}bb;${color}00`}
              keyTimes="0;0.08;0.82;1"
              dur={`${dur}s`}
              repeatCount="indefinite"
              begin={begin}
            />
            <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={begin} calcMode="linear">
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
        )
      })}
    </>
  )
}

// ── Single connection ─────────────────────────────────────────────────────────

function Connection({
  nodeId, from, to, color, idx,
}: {
  nodeId: string; from: Pos; to: Pos; color: string; idx: number
}) {
  const x1 = from.x
  const y1 = from.y + from.h / 2
  const dbLeft  = to.x - to.w / 2 + 32
  const dbRight = to.x + to.w / 2 - 32
  const x2 = Math.max(dbLeft, Math.min(dbRight, x1))
  const y2 = to.y - to.h / 2
  const midY = (y1 + y2) / 2
  const d    = `M ${x1},${y1} C ${x1},${midY} ${x2},${midY} ${x2},${y2}`
  const pid  = `eco-path-${nodeId}`
  const fid  = `eco-glow-${nodeId}`
  const breathDur  = 2.6 + idx * 0.22
  const dashDur    = 0.9 + idx * 0.06
  const pulseDur   = 3.8 + idx * 0.38
  const pulseBegin = `${idx * 0.55}s`

  return (
    <g>
      <defs>
        <filter id={fid} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path id={pid} d={d} fill="none" stroke="none" />

      {/* Ambient base line */}
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeOpacity="0.15">
        <animate
          attributeName="stroke-opacity"
          values="0.08;0.28;0.08"
          dur={`${breathDur}s`}
          repeatCount="indefinite"
        />
      </path>

      {/* Dashed flow ↓ */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeDasharray="4 14"
        strokeLinecap="round"
        opacity="0.55"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-18"
          dur={`${dashDur}s`}
          repeatCount="indefinite"
        />
      </path>

      {/* Particle dots ↓ */}
      <FlowDots pathId={pid} color={color} />

      {/* Upward empowerment pulse ↑ */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="3"
        filter={`url(#${fid})`}
      >
        <animate
          attributeName="stroke-opacity"
          values="0;0;0.5;0.4;0"
          keyTimes="0;0.2;0.5;0.8;1"
          dur={`${pulseDur}s`}
          repeatCount="indefinite"
          begin={pulseBegin}
        />
        <animate
          attributeName="stroke-width"
          values="1;1;3.5;2.5;1"
          keyTimes="0;0.2;0.5;0.8;1"
          dur={`${pulseDur}s`}
          repeatCount="indefinite"
          begin={pulseBegin}
        />
      </path>
    </g>
  )
}

// ── Node card (light theme) ────────────────────────────────────────────────────

function NodeCard({
  node, dataId, compact = false,
}: {
  node: AnyNode; dataId: string; compact?: boolean
}) {
  const router = useRouter()
  const Icon   = node.icon
  return (
    <div
      data-node-id={dataId}
      onClick={() => router.push(node.href)}
      className={cn(
        'relative flex flex-col items-center gap-1.5 rounded-xl border bg-white cursor-pointer select-none',
        'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card',
        node.border,
        compact ? 'p-3' : 'p-4',
      )}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px -6px ${node.color}30`
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
      }}
    >
      <div className={cn('flex items-center justify-center rounded-lg', node.iconBg, compact ? 'h-8 w-8' : 'h-10 w-10')}>
        <Icon className={cn(node.iconText, compact ? 'h-4 w-4' : 'h-5 w-5')} />
      </div>
      <span className={cn('font-semibold text-slate-800', compact ? 'text-xs' : 'text-sm')}>{node.label}</span>
      <span className="text-[10px] text-slate-400">{node.tag}</span>
    </div>
  )
}

// ── Layer divider ─────────────────────────────────────────────────────────────

function LayerLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200" />
      <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase px-1">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200" />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DataEcosystem() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef   = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Record<string, Pos>>({})
  const [svgSize,   setSvgSize]   = useState({ w: 0, h: 0 })
  const [visible,   setVisible]   = useState(false)

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const cr  = container.getBoundingClientRect()
    const map: Record<string, Pos> = {}
    container.querySelectorAll('[data-node-id]').forEach(el => {
      const r  = el.getBoundingClientRect()
      const id = el.getAttribute('data-node-id')!
      map[id] = {
        x: r.left - cr.left + r.width  / 2,
        y: r.top  - cr.top  + r.height / 2,
        w: r.width,
        h: r.height,
      }
    })
    setPositions(map)
    setSvgSize({ w: cr.width, h: cr.height })
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(measure)
    const ro  = new ResizeObserver(() => requestAnimationFrame(measure))
    if (containerRef.current) ro.observe(containerRef.current)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [measure])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect() } },
      { threshold: 0.06 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const dbPos = positions['database']

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-white overflow-hidden"
    >
      <div className="container">

        {/* ── Section header ── */}
        <div className={cn(
          'text-center mb-16 transition-all duration-700',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        )}>
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            数据引擎 · 实时运行中
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            产业服务体系 · 数据闭环引擎
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            六大模块持续向底层数据库汇入数据流 ·{' '}
            <span className="text-emerald-600 font-medium">数据库实时赋能各模块运作</span>
          </p>
        </div>

        {/* ════════════ Desktop diagram ════════════ */}
        <div className={cn(
          'hidden md:block transition-all duration-1000 delay-300',
          visible ? 'opacity-100' : 'opacity-0',
        )}>
          <div ref={containerRef} className="relative">

            {/* SVG overlay */}
            {svgSize.w > 0 && svgSize.h > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none z-10"
                width={svgSize.w}
                height={svgSize.h}
                style={{ overflow: 'visible' }}
              >
                {ALL_NODES.map((node, i) => {
                  const from = positions[node.id]
                  if (!from || !dbPos) return null
                  return (
                    <Connection
                      key={node.id}
                      nodeId={node.id}
                      from={from}
                      to={dbPos}
                      color={node.color}
                      idx={i}
                    />
                  )
                })}
              </svg>
            )}

            {/* ── Top layer ── */}
            <LayerLabel label="顶层 · 战略与传播" />
            <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto mb-16">
              {TOP_NODES.map(n => (
                <NodeCard key={n.id} node={n} dataId={n.id} />
              ))}
            </div>

            {/* ── Middle layer ── */}
            <LayerLabel label="中层 · 连接与赋能" />
            <div className="grid grid-cols-4 gap-4 mb-16">
              {MID_NODES.map(n => (
                <NodeCard key={n.id} node={n} dataId={n.id} compact />
              ))}
            </div>

            {/* ── Database ── */}
            <LayerLabel label="基石层 · 数据沉淀与反哺" />
            <div
              data-node-id="database"
              className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50"
            >
              {/* Animated scan beam */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div
                  className="absolute top-0 bottom-0 w-40 bg-gradient-to-r from-transparent via-emerald-300/15 to-transparent"
                  style={{ animation: 'eco-scan 5s ease-in-out infinite' }}
                />
              </div>
              {/* Subtle grid */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none rounded-2xl overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center gap-5 px-8 py-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white border border-emerald-200 shadow-sm flex-shrink-0">
                  <Database className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-lg font-bold text-slate-900">底层数据库</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold tracking-wide">
                      数据基石层
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    中国塑料循环利用行业底层知识图谱 · 汇聚六大模块实时数据流 · 反向赋能产业运作与决策
                  </p>
                </div>
                {/* Live indicator */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold">运行中</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">6 路数据流 · 持续沉淀</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════ Mobile simplified ════════════ */}
        <div className={cn(
          'md:hidden transition-all duration-700 delay-200',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        )}>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ALL_NODES.map(node => {
              const Icon = node.icon
              return (
                <div
                  key={node.id}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border bg-white cursor-pointer',
                    node.border,
                  )}
                  onClick={() => {}}
                >
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0', node.iconBg)}>
                    <Icon className={cn('h-4 w-4', node.iconText)} />
                  </div>
                  <div>
                    <p className={cn('text-xs font-semibold text-slate-800')}>{node.label}</p>
                    <p className="text-[10px] text-slate-400">{node.tag}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-4 mb-4">
            {ALL_NODES.map((node, i) => (
              <div
                key={node.id}
                className="flex flex-col items-center gap-0.5"
                style={{ animation: 'eco-drop 1.8s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
              >
                <div
                  className="w-px h-7 rounded-full"
                  style={{ background: `linear-gradient(to bottom, ${node.color}99, ${node.color}11)` }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: node.color, opacity: 0.7 }}
                />
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-slate-400 mb-5 tracking-wider">数据持续沉淀</p>

          <div className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-emerald-200 flex-shrink-0">
              <Database className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-slate-900">底层数据库</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
              <p className="text-xs text-slate-500">行业底层知识图谱 · 数据基石层</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
