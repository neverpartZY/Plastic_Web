'use client'

import { useState, useMemo } from 'react'
import {
  Sparkles, BadgeCheck, Mail,
  SlidersHorizontal, X, CheckCircle2, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────────────────────
   Core data interface
   ───────────────────────────────────────────────────────────────────────────── */
export interface IndustryResource {
  id: string
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  /** X轴 — 实体维度 */
  entityTags: string[]
  /** Y轴 — 应用领域 */
  appTags: string[]
  dataSource: 'ai_crawled' | 'expert_verified'
  supportedChannels: ('email' | 'wechat' | 'feishu' | 'whatsapp')[]
  imageUrl?: string
  publishDate: string
}

/* ─────────────────────────────────────────────────────────────────────────────
   Mock data
   ───────────────────────────────────────────────────────────────────────────── */
const MOCK_DATA: IndustryResource[] = [
  {
    id: 'res-001',
    title: {
      zh: '汽车内饰再生塑料材料规范路径',
      en: 'Automotive Interior Recycled Plastic Standards',
    },
    description: {
      zh: '系统梳理汽车内饰件再生材料选材标准、性能指标与 OEM 认证流程，覆盖 PP/ABS/PA 等主要材料牌号，附主流车企绿色采购门槛清单。',
      en: 'Systematic review of recycled material standards, performance benchmarks, and OEM certification flows for automotive interior parts.',
    },
    entityTags: ['材料', '成型工艺'],
    appTags: ['汽车塑料'],
    dataSource: 'expert_verified',
    supportedChannels: ['email', 'wechat', 'feishu'],
    publishDate: '2026-03-28',
  },
  {
    id: 'res-002',
    title: {
      zh: '消费电子外壳闭环循环体系构建',
      en: 'Consumer Electronics Housing Closed-Loop System',
    },
    description: {
      zh: '从产品设计拆解性、回收工艺适配到再生料再上机的全链路闭环方案，结合主流品牌 ESG 目标，输出可落地的行动路径与供应商地图。',
      en: 'End-to-end closed-loop solutions covering design-for-disassembly, recovery process adaptation, and reprocessing, aligned with ESG targets.',
    },
    entityTags: ['装备', '助剂'],
    appTags: ['消费电子'],
    dataSource: 'ai_crawled',
    supportedChannels: ['email', 'whatsapp', 'feishu'],
    publishDate: '2026-04-01',
  },
  {
    id: 'res-003',
    title: {
      zh: '食品接触级再生 PE 认证实操指南',
      en: 'Food-Contact Recycled PE Certification Playbook',
    },
    description: {
      zh: '深度解析 EU 2022/1616 与 FDA 21 CFR 要求，提供再生 PE 食品包装的 EFSA / FDA 申请材料清单、典型案例与国内备案路径对照表。',
      en: 'In-depth analysis of EU 2022/1616 and FDA 21 CFR, with EFSA/FDA application checklists and domestic filing cross-references.',
    },
    entityTags: ['材料', '助剂'],
    appTags: ['包装材料'],
    dataSource: 'expert_verified',
    supportedChannels: ['email', 'wechat'],
    publishDate: '2026-03-15',
  },
  {
    id: 'res-004',
    title: {
      zh: '注塑装备智能化改造全景方案',
      en: 'Intelligent Injection Molding Retrofit Overview',
    },
    description: {
      zh: '汇总国内外主流注塑机品牌智能化升级路径，分析 IoT 传感器接入、MES 系统对接与能耗优化，提供 ROI 测算模型与改造案例库。',
      en: 'Comprehensive retrofit roadmaps for major injection molding brands, covering IoT sensors, MES integration, and ROI calculation models.',
    },
    entityTags: ['装备', '模具', '成型工艺'],
    appTags: ['汽车塑料', '消费电子'],
    dataSource: 'ai_crawled',
    supportedChannels: ['email', 'wechat', 'feishu', 'whatsapp'],
    publishDate: '2026-04-05',
  },
]

/* ─────────────────────────────────────────────────────────────────────────────
   Filter tag sets
   ───────────────────────────────────────────────────────────────────────────── */
const ENTITY_TAGS = ['装备', '助剂', '模具', '成型工艺', '材料']
const APP_TAGS    = ['汽车塑料', '消费电子', '包装材料', '农业用塑料']

/* ─────────────────────────────────────────────────────────────────────────────
   Card visual config
   ───────────────────────────────────────────────────────────────────────────── */
interface GradConfig {
  gradient: string
  shape: string
  watermark: string
}

const CARD_VISUALS: Record<string, GradConfig> = {
  装备:     { gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #3b82f6 100%)',  shape: 'rgba(255,255,255,0.06)', watermark: '装' },
  助剂:     { gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #a78bfa 100%)',  shape: 'rgba(255,255,255,0.07)', watermark: '剂' },
  模具:     { gradient: 'linear-gradient(135deg, #134e4a 0%, #0f766e 55%, #2dd4bf 100%)',  shape: 'rgba(255,255,255,0.06)', watermark: '模' },
  成型工艺: { gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 55%, #fbbf24 100%)', shape: 'rgba(255,255,255,0.07)', watermark: '艺' },
  材料:     { gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 55%, #10b981 100%)',  shape: 'rgba(255,255,255,0.06)', watermark: '材' },
}
const DEFAULT_VISUAL: GradConfig = {
  gradient: 'linear-gradient(135deg, #1e293b, #334155)',
  shape: 'rgba(255,255,255,0.05)',
  watermark: '资',
}

/* ─────────────────────────────────────────────────────────────────────────────
   Brand SVG Icons  — 纯内联 SVG，零外部依赖
   ───────────────────────────────────────────────────────────────────────────── */

/** 企业微信 — 双气泡叠加造型 */
function IconWechat({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      {/* Main bubble */}
      <path
        d="M11 3C6.58 3 3 6.36 3 10.5c0 2.22 1.03 4.22 2.67 5.6L5 19l3.42-1.7c.83.24 1.71.37 2.62.37.2 0 .4-.01.59-.02-.06-.4-.09-.8-.09-1.21C11.54 12.14 15.5 9 20.31 9c.11 0 .22 0 .33.01C19.5 5.58 15.6 3 11 3z"
        fill="currentColor"
      />
      {/* Secondary bubble (slightly transparent) */}
      <path
        d="M20.3 10.5c-4.15 0-7.51 2.86-7.51 6.38 0 3.52 3.36 6.37 7.51 6.37.85 0 1.66-.13 2.41-.36L25.5 24l-.8-2.54A6.22 6.22 0 0027.81 16.88c0-3.52-3.36-6.38-7.51-6.38z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  )
}

/** 飞书 — 展翅纸飞机 / 对话框变体 */
function IconFeishu({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      {/* Wing left */}
      <path
        d="M4 18.5L13.5 8l3 6.5-5 2.5L4 18.5z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* Body / wing right */}
      <path
        d="M24 9.5L13.5 8l3 6.5 5-2 2-3z"
        fill="currentColor"
        opacity="0.80"
      />
      {/* Tail */}
      <path
        d="M13.5 8l3 6.5-2.5 5.5 4-4.5-4.5-7.5z"
        fill="currentColor"
      />
    </svg>
  )
}

/** WhatsApp — 话筒气泡 */
function IconWhatsApp({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      {/* Outer bubble */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 3C8.48 3 4 7.48 4 13c0 1.85.51 3.58 1.39 5.07L4 24l6.13-1.37A10 10 0 0014 23c5.52 0 10-4.48 10-10S19.52 3 14 3z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 4.5C9.31 4.5 5.5 8.31 5.5 13a8.44 8.44 0 001.23 4.39l.22.36-1.04 3.62 3.74-.99.34.2A8.5 8.5 0 1014 4.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Phone handset */}
      <path
        d="M10.5 10.5c.1.5.5 1.9 1.5 3s2.6 1.6 3.1 1.8l1-1c.2-.2.6-.2.8 0l1.6 1.6c.2.2.2.6 0 .8l-.9.9c-.4.4-1 .5-1.5.3-1-.4-3.2-1.5-4.7-3-1.5-1.5-2.4-3.7-2.7-4.7-.2-.5-.1-1.1.3-1.5l.9-.9c.2-.2.6-.2.8 0l1.6 1.6c.2.2.2.5.1.7l-1 1.4z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Channel config  — 绑定品牌色 + 自定义 Icon
   ───────────────────────────────────────────────────────────────────────────── */
const CHANNEL_CONFIG = {
  email: {
    label: '邮件订阅',
    sublabel: '工作邮箱直达',
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.35)',
    gradFrom: '#1d4ed8',
    gradTo: '#3b82f6',
    Icon: ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
      <Mail className={className} style={style} />
    ),
  },
  wechat: {
    label: '企业微信',
    sublabel: '团队群组推送',
    color: '#07c160',
    glowColor: 'rgba(7,193,96,0.35)',
    gradFrom: '#059652',
    gradTo: '#07c160',
    Icon: IconWechat,
  },
  feishu: {
    label: '飞书推送',
    sublabel: 'Bot 机器人',
    color: '#3370ff',
    glowColor: 'rgba(51,112,255,0.35)',
    gradFrom: '#1456f0',
    gradTo: '#3370ff',
    Icon: IconFeishu,
  },
  whatsapp: {
    label: 'WhatsApp',
    sublabel: '国际渠道',
    color: '#25d366',
    glowColor: 'rgba(37,211,102,0.35)',
    gradFrom: '#128c47',
    gradTo: '#25d366',
    Icon: IconWhatsApp,
  },
} as const

type Channel = keyof typeof CHANNEL_CONFIG

/* ═══════════════════════════════════════════════════════════════════════════════
   FilterBar
   ═════════════════════════════════════════════════════════════════════════════ */
interface FilterBarProps {
  selectedEntity: string[]
  selectedApp: string[]
  onToggleEntity: (t: string) => void
  onToggleApp: (t: string) => void
  onClearAll: () => void
  totalCount: number
  filteredCount: number
}

function FilterBar({
  selectedEntity, selectedApp,
  onToggleEntity, onToggleApp,
  onClearAll, totalCount, filteredCount,
}: FilterBarProps) {
  const hasFilter = selectedEntity.length + selectedApp.length > 0

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass border border-white/60 p-5 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[13px] font-semibold text-slate-800">矩阵筛选</span>
          <span className="text-[12px] text-slate-400">
            {hasFilter ? (
              <><span className="font-semibold text-slate-700">{filteredCount}</span> / {totalCount} 条资源</>
            ) : (
              `共 ${totalCount} 条资源`
            )}
          </span>
        </div>
        {hasFilter && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-3 h-3" />
            清除筛选
          </button>
        )}
      </div>

      {/* X轴 row */}
      <div className="mb-3.5">
        <p className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 tracking-widest uppercase mb-2">
          <span className="w-4 h-px bg-blue-400 rounded-full" aria-hidden="true" />
          X轴 · 实体维度
        </p>
        <div className="overflow-x-auto no-scrollbar sm:overflow-x-visible">
          <div className="flex gap-1.5 min-w-max sm:min-w-0 sm:flex-wrap pb-0.5 sm:pb-0">
            {ENTITY_TAGS.map((tag) => {
              const active = selectedEntity.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleEntity(tag)}
                  aria-pressed={active}
                  className={cn(
                    'flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 border whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                    active
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-200/60 scale-[1.03]'
                      : 'bg-white/70 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm',
                  )}
                >
                  {active && <span className="w-1 h-1 rounded-full bg-white/70 flex-shrink-0" aria-hidden="true" />}
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Y轴 row */}
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 tracking-widest uppercase mb-2">
          <span className="w-4 h-px bg-amber-400 rounded-full" aria-hidden="true" />
          Y轴 · 应用领域
        </p>
        <div className="overflow-x-auto no-scrollbar sm:overflow-x-visible">
          <div className="flex gap-1.5 min-w-max sm:min-w-0 sm:flex-wrap pb-0.5 sm:pb-0">
            {APP_TAGS.map((tag) => {
              const active = selectedApp.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleApp(tag)}
                  aria-pressed={active}
                  className={cn(
                    'flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 border whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                    active
                      ? 'bg-amber-500 border-amber-400 text-white shadow-md shadow-amber-200/60 scale-[1.03]'
                      : 'bg-white/70 backdrop-blur-sm border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 hover:shadow-sm',
                  )}
                >
                  {active && <span className="w-1 h-1 rounded-full bg-white/70 flex-shrink-0" aria-hidden="true" />}
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ResourceCard
   ═════════════════════════════════════════════════════════════════════════════ */
function ResourceCard({ resource }: { resource: IndustryResource }) {
  const vis = CARD_VISUALS[resource.entityTags[0]] ?? DEFAULT_VISUAL
  const isAI = resource.dataSource === 'ai_crawled'

  return (
    <article className="group bg-white/85 backdrop-blur-md rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1.5 ring-1 ring-white/70 transition-all duration-200 flex flex-col cursor-pointer">

      {/* ── Cover image area ── */}
      <div
        className="relative h-48 overflow-hidden flex-shrink-0"
        style={{ background: vis.gradient }}
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                `repeating-linear-gradient(0deg, ${vis.shape} 0, ${vis.shape} 1px, transparent 1px, transparent 32px)`,
                `repeating-linear-gradient(90deg, ${vis.shape} 0, ${vis.shape} 1px, transparent 1px, transparent 32px)`,
              ].join(','),
            }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full"
            style={{ background: `radial-gradient(circle, ${vis.shape} 0%, transparent 70%)` }}
            aria-hidden="true"
          />
        </div>

        {/* Watermark */}
        <span
          className="absolute -bottom-5 right-0 text-[108px] font-black leading-none select-none pointer-events-none"
          style={{ color: 'rgba(255,255,255,0.08)', letterSpacing: '-4px' }}
          aria-hidden="true"
        >
          {vis.watermark}
        </span>

        {/* Bottom vignette */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.28), transparent)' }}
          aria-hidden="true"
        />

        {/* ── Data source badge ── */}
        <div className="absolute top-3 right-3 z-10">
          {isAI ? (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold text-white border tracking-wide"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.22) 0%, rgba(245,158,11,0.14) 100%)',
                borderColor: 'rgba(251,191,36,0.40)',
                boxShadow: '0 0 12px rgba(251,191,36,0.20), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-300" aria-hidden="true" />
              AI 采集
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.22) 0%, rgba(5,150,105,0.14) 100%)',
                border: '1px solid rgba(52,211,153,0.40)',
                color: '#6ee7b7',
                boxShadow: '0 0 12px rgba(16,185,129,0.18), inset 0 1px 0 rgba(255,255,255,0.10)',
              }}
            >
              <BadgeCheck className="w-2.5 h-2.5 text-emerald-300" aria-hidden="true" />
              专家认证
            </span>
          )}
        </div>

        {/* ── Channel dots ── */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1">
          {resource.supportedChannels.map((ch) => {
            const cfg = CHANNEL_CONFIG[ch]
            return (
              <span
                key={ch}
                title={cfg.label}
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center backdrop-blur-sm"
                style={{ backgroundColor: `${cfg.color}28`, border: `1px solid ${cfg.color}50` }}
              >
                <cfg.Icon className="w-3 h-3" style={{ color: cfg.color }} />
              </span>
            )
          })}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-white/0 to-white/20">
        <h3 className="text-[15px] font-semibold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-blue-900 transition-colors duration-200">
          {resource.title.zh}
        </h3>
        <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-3 flex-1">
          {resource.description.zh}
        </p>
        <div className="mt-4 pt-3.5 border-t border-slate-100/80 flex flex-wrap items-center gap-1.5">
          {resource.entityTags.map((t) => (
            <span key={`e-${t}`} className="inline-flex items-center px-2 py-[3px] rounded-md text-[10px] font-bold bg-blue-50/80 text-blue-700 border border-blue-200/70 backdrop-blur-sm">
              {t}
            </span>
          ))}
          {resource.appTags.map((t) => (
            <span key={`a-${t}`} className="inline-flex items-center px-2 py-[3px] rounded-md text-[10px] font-bold bg-amber-50/80 text-amber-700 border border-amber-200/70 backdrop-blur-sm">
              {t}
            </span>
          ))}
          <span className="ml-auto text-[11px] text-slate-400 tabular-nums flex-shrink-0">
            {resource.publishDate}
          </span>
        </div>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SubscribeCard  —  场景化订阅转化入口 · 多分发方式闭环
   ─────────────────────────────────────────────────────────────────────────────
   布局：sm:col-span-2 lg:col-span-2，嵌入资源卡片网格中间
   交互：① 展示 4 个精美品牌 icon
         ② 点击某 icon → 对应渠道高亮 + 输入区滑入
         ③ 标题随筛选器动态变化
   ═════════════════════════════════════════════════════════════════════════════ */
interface SubscribeCardProps {
  selectedEntity: string[]
  selectedApp: string[]
}

function SubscribeCard({ selectedEntity, selectedApp }: SubscribeCardProps) {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [email, setEmail]   = useState('')
  const [submitted, setSubmitted] = useState(false)

  /* Context-aware headline: uses the first selected app tag, then entity, then default */
  const topicLabel = selectedApp[0] ?? selectedEntity[0] ?? null
  const topicText  = topicLabel ?? '全维度产业'

  const activeCfg = activeChannel ? CHANNEL_CONFIG[activeChannel] : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setEmail(''); setActiveChannel(null) }, 3400)
  }

  function handleChannelClick(ch: Channel) {
    /* Toggle: clicking the same channel again collapses it */
    setActiveChannel((prev) => (prev === ch ? null : ch))
    setEmail('')
  }

  return (
    <article
      className="sm:col-span-2 lg:col-span-2 relative rounded-2xl overflow-hidden flex flex-col bg-white border border-slate-200 shadow-sm"
      style={{ minHeight: '280px' }}
    >
      {/* ── Subtle grid texture ── */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(0deg, rgba(15,23,42,0.9) 0, rgba(15,23,42,0.9) 1px, transparent 1px, transparent 22px)',
            'repeating-linear-gradient(90deg, rgba(15,23,42,0.9) 0, rgba(15,23,42,0.9) 1px, transparent 1px, transparent 22px)',
          ].join(','),
        }}
        aria-hidden="true"
      />

      {/* ── Ambient orb — emerald, dynamic ── */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${activeCfg ? activeCfg.glowColor.replace('0.35', '0.12') : 'rgba(16,185,129,0.10)'} 0%, transparent 65%)`,
          transition: 'background 0.5s ease',
          filter: 'blur(20px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col flex-1 p-6">

        {/* ══ SUCCESS STATE ══ */}
        {submitted && activeCfg ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${activeCfg.color}18`, border: `1px solid ${activeCfg.color}40` }}
            >
              <CheckCircle2 className="w-7 h-7" style={{ color: activeCfg.color }} />
            </div>
            <p className="text-[17px] font-bold text-slate-900 mb-1">订阅成功！</p>
            <p className="text-[12px] text-slate-500 leading-relaxed max-w-[220px]">
              「{topicText}」专属情报将推送至您的 {activeCfg.label}
            </p>
          </div>
        ) : (
          <>
            {/* ── Label pill ── */}
            <div className="inline-flex items-center gap-1.5 self-start mb-3">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: activeCfg?.color ?? '#059669' }}
                aria-hidden="true"
              />
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: activeCfg?.color ?? '#059669' }}
              >
                情报订阅
              </span>
              <span className="text-[10px] text-slate-400 font-medium">· Freemium</span>
            </div>

            {/* ── Dynamic headline ── */}
            <h3 className="text-[18px] font-bold text-slate-900 leading-snug mb-1">
              订阅&nbsp;
              <span
                className="inline-block px-2 py-0.5 rounded-lg text-[16px] transition-all duration-300"
                style={
                  topicLabel
                    ? {
                        background: `${activeCfg?.color ?? '#059669'}14`,
                        border: `1px solid ${activeCfg?.color ?? '#059669'}35`,
                        color: activeCfg?.color ?? '#059669',
                      }
                    : {
                        background: 'rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        color: '#94a3b8',
                      }
                }
              >
                {topicText}
              </span>
              &nbsp;专属情报
            </h3>
            <p className="text-[12px] text-slate-400 mb-5">每日精准推送 · 多渠道覆盖 · 随时退订</p>

            {/* ══ CHANNEL ICON ROW ══ */}
            <div className="grid grid-cols-4 gap-2.5 mb-4">
              {(Object.entries(CHANNEL_CONFIG) as [Channel, (typeof CHANNEL_CONFIG)[Channel]][]).map(
                ([key, cfg]) => {
                  const isActive = activeChannel === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleChannelClick(key)}
                      aria-pressed={isActive}
                      className="group/ch flex flex-col items-center gap-2 py-3.5 px-1 rounded-2xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 select-none"
                      style={
                        isActive
                          ? {
                              background: `linear-gradient(145deg, ${cfg.color}18 0%, ${cfg.color}0e 100%)`,
                              borderColor: `${cfg.color}55`,
                              boxShadow: `0 0 20px ${cfg.glowColor}, 0 0 6px ${cfg.glowColor}, inset 0 1px 0 rgba(255,255,255,0.10)`,
                              transform: 'translateY(-2px)',
                            }
                          : {
                              background: 'rgba(0,0,0,0.025)',
                              borderColor: 'rgba(0,0,0,0.08)',
                            }
                      }
                    >
                      {/* Icon container with gradient bg */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                        style={
                          isActive
                            ? {
                                background: `linear-gradient(145deg, ${cfg.gradFrom} 0%, ${cfg.gradTo} 100%)`,
                                boxShadow: `0 4px 14px ${cfg.glowColor}, 0 1px 4px rgba(0,0,0,0.25)`,
                              }
                            : {
                                background: 'rgba(0,0,0,0.04)',
                                boxShadow: 'none',
                              }
                        }
                      >
                        <cfg.Icon
                          className="w-5 h-5 transition-all duration-200"
                          style={{
                            color: isActive ? '#fff' : 'rgba(100,116,139,0.6)',
                            filter: isActive ? `drop-shadow(0 0 4px ${cfg.color}80)` : 'none',
                          }}
                        />
                      </div>

                      {/* Label */}
                      <div className="text-center">
                        <p
                          className="text-[10.5px] font-semibold leading-tight transition-colors duration-200"
                          style={{ color: isActive ? cfg.color : '#475569' }}
                        >
                          {cfg.label}
                        </p>
                        <p
                          className="text-[9px] leading-tight mt-0.5 transition-colors duration-200"
                          style={{ color: isActive ? cfg.color : 'rgba(100,116,139,0.55)' }}
                        >
                          {cfg.sublabel}
                        </p>
                      </div>

                      {/* Active indicator dot */}
                      {isActive && (
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )
                },
              )}
            </div>

            {/* ══ INPUT AREA — slides in when a channel is selected ══ */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: activeChannel ? '120px' : '0px', opacity: activeChannel ? 1 : 0 }}
            >
              {activeCfg && (
                <div
                  className="rounded-xl border p-3 mb-0"
                  style={{
                    background: `${activeCfg.color}0a`,
                    borderColor: `${activeCfg.color}25`,
                  }}
                >
                  {activeChannel === 'email' ? (
                    /* Email: inline form */
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="输入工作邮箱地址"
                        required
                        className="flex-1 min-w-0 px-3.5 py-2 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 transition-all"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold whitespace-nowrap flex-shrink-0 text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${activeCfg.gradFrom} 0%, ${activeCfg.gradTo} 100%)`,
                          boxShadow: `0 4px 14px ${activeCfg.glowColor}`,
                        }}
                      >
                        立即订阅
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </form>
                  ) : (
                    /* Non-email: waitlist prompt */
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border"
                        style={{ background: `${activeCfg.color}12`, borderColor: `${activeCfg.color}30` }}
                      >
                        <activeCfg.Icon
                          className="w-4 h-4"
                          style={{ color: activeCfg.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11.5px] text-slate-600 leading-relaxed mb-1.5">
                          {activeCfg.label} 渠道灰度开放中，加入等待列表即可第一时间配置。
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveChannel('email')}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-75"
                          style={{ color: activeCfg.color }}
                        >
                          先用邮件订阅
                          <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Hint when no channel selected ── */}
            {!activeChannel && (
              <p className="text-[11px] text-slate-400 text-center mt-auto pt-2">
                选择分发渠道，开启订阅
              </p>
            )}
          </>
        )}
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MatrixHub — default export
   ═════════════════════════════════════════════════════════════════════════════ */
export default function MatrixHub() {
  const [selectedEntity, setSelectedEntity] = useState<string[]>([])
  const [selectedApp, setSelectedApp]       = useState<string[]>([])

  const toggleEntity = (t: string) =>
    setSelectedEntity((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))
  const toggleApp = (t: string) =>
    setSelectedApp((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))
  const clearAll = () => { setSelectedEntity([]); setSelectedApp([]) }

  const filtered = useMemo(
    () =>
      MOCK_DATA.filter((r) => {
        const em = selectedEntity.length === 0 || selectedEntity.some((t) => r.entityTags.includes(t))
        const am = selectedApp.length === 0    || selectedApp.some((t) => r.appTags.includes(t))
        return em && am
      }),
    [selectedEntity, selectedApp],
  )

  /* Split filtered: SubscribeCard sits after the 2nd resource card */
  const firstHalf  = filtered.slice(0, 2)
  const secondHalf = filtered.slice(2)

  return (
    <section className="relative py-20 overflow-hidden" aria-labelledby="matrixhub-heading">
      {/* ── Decorative background ── */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.45]"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl -z-10" aria-hidden="true" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl -z-10" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Section header ── */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-semibold tracking-wide mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            产业知识矩阵
          </div>
          <h2
            id="matrixhub-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2"
          >
            多维度资源中枢
          </h2>
          <p className="text-[15px] text-slate-500 max-w-xl leading-relaxed">
            跨越实体维度与应用领域的知识交叉点——沿 X / Y 轴组合筛选，精准触达您关注的产业环节
          </p>
        </div>

        {/* ── Filter bar ── */}
        <FilterBar
          selectedEntity={selectedEntity}
          selectedApp={selectedApp}
          onToggleEntity={toggleEntity}
          onToggleApp={toggleApp}
          onClearAll={clearAll}
          totalCount={MOCK_DATA.length}
          filteredCount={filtered.length}
        />

        {/* ── Card grid (with inline SubscribeCard) ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* First 2 resource cards */}
            {firstHalf.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}

            {/* ── Subscribe card: spans 2 cols, sits after 2nd resource card ── */}
            <SubscribeCard selectedEntity={selectedEntity} selectedApp={selectedApp} />

            {/* Remaining resource cards */}
            {secondHalf.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <SlidersHorizontal className="w-5 h-5 text-slate-400" aria-hidden="true" />
            </div>
            <p className="text-[14px] font-medium text-slate-700 mb-1">暂无匹配资源</p>
            <p className="text-[12px] text-slate-400 mb-4">当前筛选条件下没有相关内容，试试放宽筛选</p>
            <button
              type="button"
              onClick={clearAll}
              className="text-[12px] font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              清除全部筛选
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
