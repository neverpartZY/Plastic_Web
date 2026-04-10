'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Newspaper, Users, Calendar, Cpu, TrendingUp, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Node definitions ──────────────────────────────────────────────────────────

const TOP_NODES = [
  { id: 'think-tank',  label: '智库',    icon: BookOpen,  color: '#60a5fa', iconBg: 'bg-blue-500/15',   iconText: 'text-blue-300',   border: 'border-blue-500/30',   href: '/think-tank',  tag: '运营服务' },
  { id: 'media',       label: '行业媒体', icon: Newspaper, color: '#34d399', iconBg: 'bg-emerald-500/15', iconText: 'text-emerald-300', border: 'border-emerald-500/30', href: '/news',        tag: '运营服务' },
] as const

const MID_NODES = [
  { id: 'events',      label: '会展平台', icon: Calendar,   color: '#fbbf24', iconBg: 'bg-amber-500/15',  iconText: 'text-amber-300',  border: 'border-amber-500/30',  href: '/events',      tag: '运营服务' },
  { id: 'association', label: '行业协会', icon: Users,      color: '#a78bfa', iconBg: 'bg-violet-500/15', iconText: 'text-violet-300', border: 'border-violet-500/30', href: '/association', tag: '运营服务' },
  { id: 'technology',  label: '技术开发', icon: Cpu,        color: '#22d3ee', iconBg: 'bg-cyan-500/15',   iconText: 'text-cyan-300',   border: 'border-cyan-500/30',   href: '/technology',  tag: '攻坚支撑' },
  { id: 'fund',        label: '投资基金', icon: TrendingUp, color: '#fb7185', iconBg: 'bg-rose-500/15',   iconText: 'text-rose-300',   border: 'border-rose-500/30',   href: '/fund',        tag: '攻坚支撑' },
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
          <circle key={j} r="2.8">
            <animate
              attributeName="fill"
              values={`${color}00;${color}cc;${color}cc;${color}00`}
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

// ── Single connection (module ↔ database) ─────────────────────────────────────

function Connection({
  nodeId, from, to, color, idx,
}: {
  nodeId: string; from: Pos; to: Pos; color: string; idx: number
}) {
  // Source: bottom-center of module card
  const x1 = from.x
  const y1 = from.y + from.h / 2

  // Target: top of database, horizontally aligned with the module
  const dbLeft  = to.x - to.w / 2 + 32
  const dbRight = to.x + to.w / 2 - 32
  const x2 = Math.max(dbLeft, Math.min(dbRight, x1))
  const y2 = to.y - to.h / 2

  const midY = (y1 + y2) / 2
  const d    = `M ${x1},${y1} C ${x1},${midY} ${x2},${midY} ${x2},${y2}`
  const pid  = `eco-path-${nodeId}`
  const fid  = `eco-glow-${nodeId}`

  // Stagger timings per node
  const breathDur  = 2.6 + idx * 0.22
  const dashDur    = 0.9 + idx * 0.06
  const pulseDur   = 3.8 + idx * 0.38
  const pulseBegin = `${idx * 0.55}s`

  return (
    <g>
      {/* Glow filter */}
      <defs>
        <filter id={fid} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hidden path for animateMotion reference */}
      <path id={pid} d={d} fill="none" stroke="none" />

      {/* ① Ambient base line — always on, breathing */}
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeOpacity="0.12">
        <animate
          attributeName="stroke-opacity"
          values="0.06;0.25;0.06"
          dur={`${breathDur}s`}
          repeatCount="indefinite"
        />
      </path>

      {/* ② Dashed flow ↓ (data sinking into database) */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeDasharray="4 14"
        strokeLinecap="round"
        opacity="0.5"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-18"
          dur={`${dashDur}s`}
          repeatCount="indefinite"
        />
      </path>

      {/* ③ Particle dots ↓ */}
      <FlowDots pathId={pid} color={color} />

      {/* ④ Upward empowerment pulse ↑ (database empowering) */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        filter={`url(#${fid})`}
      >
        <animate
          attributeName="stroke-opacity"
          values="0;0;0.6;0.5;0"
          keyTimes="0;0.2;0.5;0.8;1"
          dur={`${pulseDur}s`}
          repeatCount="indefinite"
          begin={pulseBegin}
        />
        <animate
          attributeName="stroke-width"
          values="1;1;4;3;1"
          keyTimes="0;0.2;0.5;0.8;1"
          dur={`${pulseDur}s`}
          repeatCount="indefinite"
          begin={pulseBegin}
        />
      </path>
    </g>
  )
}

// ── Node card (dark theme) ─────────────────────────────────────────────────────

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
        'relative flex flex-col items-center gap-1.5 rounded-xl border cursor-pointer select-none',
        'bg-slate-800/50 backdrop-blur-sm transition-all duration-300',
        'hover:-translate-y-1.5 hover:bg-slate-700/60',
        node.border,
        compact ? 'p-3' : 'p-4',
      )}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px -8px ${node.color}45`
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      <div className={cn('flex items-center justify-center rounded-lg', node.iconBg, compact ? 'h-8 w-8' : 'h-10 w-10')}>
        <Icon className={cn(node.iconText, compact ? 'h-4 w-4' : 'h-5 w-5')} />
      </div>
      <span className={cn('font-semibold', node.iconText, compact ? 'text-xs' : 'text-sm')}>{node.label}</span>
      <span className="text-[10px] text-slate-500">{node.tag}</span>
    </div>
  )
}

// ── Layer divider ─────────────────────────────────────────────────────────────

function LayerLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-700/60" />
      <span className="text-[11px] font-semibold text-slate-500 tracking-widest uppercase px-1">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-700/60" />
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

  // Measure DOM positions of all data-node-id elements
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

  // Entrance animation trigger
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
      className="py-20 md:py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050d18 0%, #080f1e 50%, #050d18 100%)' }}
    >
      <div className="container">

        {/* ── Section header ── */}
        <div className={cn(
          'text-center mb-16 transition-all duration-700',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        )}>
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            {/* Ping indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            数据引擎 · 实时运行中
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
            产业服务体系 · 数据闭环引擎
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            六大模块持续向底层数据库汇入数据流 ·{' '}
            <span className="text-emerald-400 font-medium">数据库实时赋能各模块运作</span>
          </p>
        </div>

        {/* ════════════════════════ Desktop diagram ════════════════════════ */}
        <div className={cn(
          'hidden md:block transition-all duration-1000 delay-300',
          visible ? 'opacity-100' : 'opacity-0',
        )}>
          <div ref={containerRef} className="relative">

            {/* SVG overlay — rendered on top of HTML cards */}
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

            {/* ── Top layer: 智库 + 行业媒体 ── */}
            <LayerLabel label="顶层 · 战略与传播" />
            <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto mb-16">
              {TOP_NODES.map(n => (
                <NodeCard key={n.id} node={n} dataId={n.id} />
              ))}
            </div>

            {/* ── Middle layer: 会展 协会 技术 基金 ── */}
            <LayerLabel label="中层 · 连接与赋能" />
            <div className="grid grid-cols-4 gap-4 mb-16">
              {MID_NODES.map(n => (
                <NodeCard key={n.id} node={n} dataId={n.id} compact />
              ))}
            </div>

            {/* ── Bottom: 底层数据库 ── */}
            <LayerLabel label="基石层 · 数据沉淀与反哺" />
            <div
              data-node-id="database"
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(6,30,18,0.9) 0%, rgba(8,20,36,0.95) 50%, rgba(6,30,20,0.9) 100%)',
                border: '1.5px solid rgba(16,185,129,0.35)',
                boxShadow: '0 0 80px rgba(16,185,129,0.12), inset 0 1px 0 rgba(16,185,129,0.12)',
              }}
            >
              {/* Animated scan beam */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div
                  className="absolute top-0 bottom-0 w-40 bg-gradient-to-r from-transparent via-emerald-400/6 to-transparent"
                  style={{ animation: 'eco-scan 5s ease-in-out infinite' }}
                />
              </div>
              {/* Subtle grid */}
              <div
                className="absolute inset-0 opacity-[0.045] pointer-events-none rounded-2xl overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center gap-5 px-8 py-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0">
                  <Database className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-lg font-bold text-white">底层数据库</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold tracking-wide">
                      数据基石层
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
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
                    <span className="text-xs text-emerald-400 font-semibold">运行中</span>
                  </div>
                  <span className="text-[10px] text-slate-600 whitespace-nowrap">6 路数据流 · 持续沉淀</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════ Mobile simplified ════════════════════════ */}
        <div className={cn(
          'md:hidden transition-all duration-700 delay-200',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        )}>
          {/* 6 module cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ALL_NODES.map(node => {
              const Icon = node.icon
              return (
                <div
                  key={node.id}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer',
                    'bg-slate-800/50 backdrop-blur-sm',
                    node.border,
                  )}
                  onClick={() => {}}
                >
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0', node.iconBg)}>
                    <Icon className={cn('h-4 w-4', node.iconText)} />
                  </div>
                  <div>
                    <p className={cn('text-xs font-semibold', node.iconText)}>{node.label}</p>
                    <p className="text-[10px] text-slate-600">{node.tag}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Animated flow arrows */}
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
          <p className="text-center text-[11px] text-slate-600 mb-5 tracking-wider">数据持续沉淀</p>

          {/* Database bar */}
          <div
            className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(6,30,18,0.95) 0%, rgba(8,20,36,0.98) 50%, rgba(6,30,20,0.95) 100%)',
              border: '1.5px solid rgba(16,185,129,0.35)',
              boxShadow: '0 0 40px rgba(16,185,129,0.10)',
            }}
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0">
              <Database className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-white">底层数据库</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
              <p className="text-xs text-slate-400">行业底层知识图谱 · 数据基石层</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
