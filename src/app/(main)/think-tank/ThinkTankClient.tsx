'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, Lock, ArrowRight, ChevronRight,
  TrendingUp, FileText, Users, Download,
  MessageSquare, Star, BarChart2, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ResearchLeadModal from '@/components/research/ResearchLeadModal'

/* ─────────────────────────────────────────────────────────────────────────────
   Mock data — Research Reports
   ───────────────────────────────────────────────────────────────────────────── */
interface Report {
  id: string
  title: string
  summary: string
  category: string
  tags: string[]
  date: string
  pages: number
  tier: 'premium' | 'free'
  coverGradient: string
  coverWatermark: string
  accentColor: string
  glowColor: string
}

const MOCK_REPORTS: Report[] = [
  {
    id: 'rpt-001',
    title: '2026年中国汽车塑料轻量化与循环利用蓝皮书',
    summary:
      '系统梳理国内外汽车塑料轻量化技术路线与再生材料替代路径，覆盖 PP/ABS/PA/PC 等主力材料牌号，附主流 OEM 绿色采购门槛清单与 2026–2030 市场规模预测模型。',
    category: '行业白皮书',
    tags: ['汽车塑料', '轻量化', '市场预测'],
    date: '2026-04-01',
    pages: 128,
    tier: 'premium',
    coverGradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #3b82f6 100%)',
    coverWatermark: '汽',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.30)',
  },
  {
    id: 'rpt-002',
    title: '消费电子塑料闭环回收体系建设指南（2026版）',
    summary:
      '从产品设计拆解性到回收工艺适配、再生料再上机的全链路闭环方案，结合苹果、三星等品牌 ESG 目标，输出可落地的供应商地图与行动路径。',
    category: '技术指南',
    tags: ['消费电子', '闭环体系', 'ESG'],
    date: '2026-03-18',
    pages: 96,
    tier: 'premium',
    coverGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 55%, #10b981 100%)',
    coverWatermark: '电',
    accentColor: '#10b981',
    glowColor: 'rgba(16,185,129,0.30)',
  },
  {
    id: 'rpt-003',
    title: '食品接触级再生塑料合规认证实操手册',
    summary:
      '深度解析 EU 2022/1616 与 FDA 21 CFR 要求，提供 EFSA/FDA 申请材料清单、典型案例与国内备案路径对照表，涵盖再生 PE/PP/PET 三种主要材料。',
    category: '合规手册',
    tags: ['食品包装', '合规认证', 'EU法规'],
    date: '2026-03-05',
    pages: 72,
    tier: 'premium',
    coverGradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #a78bfa 100%)',
    coverWatermark: '规',
    accentColor: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.30)',
  },
  {
    id: 'rpt-004',
    title: '注塑装备智能化改造 ROI 全景分析报告',
    summary:
      '汇总主流注塑机品牌智能化升级路径，分析 IoT 传感器接入、MES 系统对接与能耗优化方案，提供 3 套 ROI 测算模型与 12 个标杆改造案例。',
    category: '市场报告',
    tags: ['注塑装备', 'IoT改造', 'ROI分析'],
    date: '2026-02-22',
    pages: 84,
    tier: 'free',
    coverGradient: 'linear-gradient(135deg, #78350f 0%, #b45309 55%, #fbbf24 100%)',
    coverWatermark: '装',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.30)',
  },
  {
    id: 'rpt-005',
    title: '2025–2026化学回收技术路线全景图与产业化进度',
    summary:
      '覆盖热解、醇解、水解等主流化学回收路线的技术成熟度评级，追踪全球 80+ 项目进展，分析资本投入趋势与当前主要商业化瓶颈。',
    category: '技术指南',
    tags: ['化学回收', '热解技术', '产业化'],
    date: '2026-02-10',
    pages: 110,
    tier: 'premium',
    coverGradient: 'linear-gradient(135deg, #134e4a 0%, #0f766e 55%, #2dd4bf 100%)',
    coverWatermark: '化',
    accentColor: '#14b8a6',
    glowColor: 'rgba(20,184,166,0.30)',
  },
  {
    id: 'rpt-006',
    title: '中国塑料再生助剂市场规模、竞争格局与投资机会',
    summary:
      '深度拆解相容剂、抗氧剂、光稳定剂等核心助剂品类，分析国内外主要供应商市占率与产品差异化策略，附 2026–2028 市场规模预测。',
    category: '市场报告',
    tags: ['再生助剂', '市场规模', '竞争格局'],
    date: '2026-01-28',
    pages: 68,
    tier: 'premium',
    coverGradient: 'linear-gradient(135deg, #881337 0%, #be123c 55%, #fb7185 100%)',
    coverWatermark: '剂',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244,63,94,0.30)',
  },
]

const CATEGORIES = ['全部', '行业白皮书', '技术指南', '市场报告', '合规手册']

/* ─────────────────────────────────────────────────────────────────────────────
   Micro chart ①  —  Area Sparkline  (SVG, no external lib)
   Data: 中国再生塑料回收率趋势 2021→2026
   ───────────────────────────────────────────────────────────────────────────── */
const SPARKLINE_YEARS = ['21', '22', '23', '24', '25', '26E']
// Y coords pre-calculated (viewBox 0 0 240 72, value range 15–42)
const SPARKLINE_PTS = '0,59 48,52 96,42 144,35 192,25 240,10'
const SPARKLINE_AREA = `M${SPARKLINE_PTS} L240,72 L0,72 Z`
const SPARKLINE_LINE = `M${SPARKLINE_PTS}`

function ChartSparkline() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-end justify-between mb-1">
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">再生塑料回收率</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-black text-slate-900 leading-none">32.4%</span>
            <span className="flex items-center gap-0.5 text-[12px] font-semibold text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              +4.1%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">同比增长 · 2026预测 38%</p>
        </div>
      </div>

      {/* SVG area chart */}
      <div className="flex-1 min-h-0 mt-4">
        <svg viewBox="0 0 240 72" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sg-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sg-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <path d={SPARKLINE_AREA} fill="url(#sg-area)" />
          {/* Line */}
          <polyline
            points={SPARKLINE_PTS}
            fill="none"
            stroke="url(#sg-line)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* End dot */}
          <circle cx="240" cy="10" r="3.5" fill="#34d399" />
          <circle cx="240" cy="10" r="6" fill="#34d399" fillOpacity="0.25" />
        </svg>
      </div>

      {/* Year labels */}
      <div className="flex justify-between mt-1">
        {SPARKLINE_YEARS.map((y) => (
          <span key={y} className="text-[9.5px] text-slate-600 tabular-nums">{y}</span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Micro chart ②  —  Horizontal Bars  (div-based)
   Data: 细分领域回收量占比
   ───────────────────────────────────────────────────────────────────────────── */
const BAR_DATA = [
  { label: '汽车塑料',  value: 35, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { label: '消费电子',  value: 28, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { label: '包装材料',  value: 22, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  { label: '农业用塑',  value: 15, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
]

function ChartBars() {
  return (
    <div className="flex flex-col h-full">
      <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-3">细分领域回收占比</p>
      <div className="space-y-3 flex-1">
        {BAR_DATA.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-slate-700 font-medium">{item.label}</span>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: item.color }}>
                {item.value}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden bg-slate-100"
              style={{}}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${item.value}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10.5px] text-slate-600 mt-3">数据来源：2025年行业调研报告</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Micro chart ③  —  Ring Progress  (SVG)
   Data: 政策合规率 87%
   ───────────────────────────────────────────────────────────────────────────── */
// r=34, circumference=213.6, 87% → dashoffset=27.8
function ChartRing() {
  return (
    <div className="flex flex-col h-full">
      <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-3">政策合规覆盖率</p>
      <div className="flex items-center gap-5 flex-1">
        {/* Ring */}
        <div className="relative flex-shrink-0 w-[88px] h-[88px]">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Track */}
            <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="9" />
            {/* Progress */}
            <circle
              cx="50" cy="50" r="34"
              fill="none"
              stroke="url(#ring-grad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="213.6"
              strokeDashoffset="27.8"
            />
            <defs>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[22px] font-black text-slate-900 leading-none">87%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          <div>
            <p className="text-[13px] font-bold text-slate-900">超行业均值</p>
            <p className="text-[12px] text-emerald-600 font-semibold">+14 个百分点</p>
          </div>
          <div className="space-y-1.5">
            {[
              { label: '已合规企业', color: '#059669', pct: '87%' },
              { label: '整改中', color: '#d97706', pct: '9%' },
              { label: '未启动', color: '#94a3b8', pct: '4%' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-[11px] text-slate-600">{s.label}</span>
                <span className="text-[11px] font-semibold ml-auto" style={{ color: s.color }}>{s.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10.5px] text-slate-600 mt-3">覆盖全国 2,400+ 重点企业</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Dashboard Card wrapper
   ───────────────────────────────────────────────────────────────────────────── */
function DashboardCard({
  icon: Icon, iconColor, iconGrad, title, children,
}: {
  icon: React.ElementType
  iconColor: string
  iconGrad: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="relative rounded-3xl p-6 flex flex-col overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-100"
      style={{ minHeight: '240px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: iconGrad, boxShadow: `0 4px 12px ${iconColor}30` }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-[13px] font-semibold text-slate-700">{title}</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          实时更新
        </span>
      </div>

      {/* Decorative corner orb */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${iconColor}08 0%, transparent 65%)` }}
      />

      <div className="flex-1">{children}</div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Report Card
   ───────────────────────────────────────────────────────────────────────────── */
function ReportCard({ report, onCTAClick }: { report: Report; onCTAClick?: (title: string) => void }) {
  const isPremium = report.tier === 'premium'

  function handleCTA(e: React.MouseEvent) {
    e.stopPropagation()
    if (isPremium && onCTAClick) {
      onCTAClick(report.title)
    }
  }

  return (
    <article
      className="group relative rounded-3xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1.5 bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200"
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = `${report.accentColor}50`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = ''
      }}
    >
      {/* ── Cover area ── */}
      <div
        className="relative h-44 flex-shrink-0 overflow-hidden"
        style={{ background: report.coverGradient }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: [
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.8) 0, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 28px)',
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.8) 0, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 28px)',
            ].join(','),
          }}
        />
        {/* Bottom vignette */}
        <div
          className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }}
        />
        {/* Decorative orb */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500"
          style={{ background: `radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)` }}
        />
        {/* Giant watermark */}
        <span
          className="absolute -bottom-6 right-2 text-[96px] font-black leading-none select-none pointer-events-none"
          style={{ color: 'rgba(255,255,255,0.07)', letterSpacing: '-3px' }}
        >
          {report.coverWatermark}
        </span>

        {/* ── Tier badge ── */}
        <div className="absolute top-3 left-3">
          {isPremium ? (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white backdrop-blur-sm border"
              style={{
                background: 'rgba(0,0,0,0.35)',
                borderColor: 'rgba(255,255,255,0.20)',
              }}
            >
              <Lock className="w-2.5 h-2.5" />
              高级报告
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm border"
              style={{
                background: 'rgba(16,185,129,0.25)',
                borderColor: 'rgba(52,211,153,0.40)',
                color: '#6ee7b7',
              }}
            >
              <Download className="w-2.5 h-2.5" />
              免费获取
            </span>
          )}
        </div>

        {/* ── Category badge ── */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/25 text-white/90 border border-white/20 backdrop-blur-sm">
            {report.category}
          </span>
        </div>

        {/* ── Page count ── */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <FileText className="w-3 h-3 text-white/50" />
          <span className="text-[11px] text-white/60">{report.pages} 页</span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-[14.5px] font-bold text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {report.title}
        </h3>
        <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-3 flex-1">
          {report.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {report.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-[3px] rounded-md text-[10px] font-semibold border"
              style={{
                background: `${report.accentColor}15`,
                borderColor: `${report.accentColor}30`,
                color: report.accentColor,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-3">
          <span className="text-[11px] text-slate-400 tabular-nums flex-shrink-0">
            {report.date}
          </span>
          <button
            onClick={handleCTA}
            className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-95 flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${report.accentColor}cc, ${report.accentColor})`,
              boxShadow: `0 4px 14px ${report.glowColor}`,
            }}
          >
            {isPremium ? (
              <>
                <Lock className="w-3 h-3" />
                获取完整报告
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                立即下载
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ThinkTankClient  —  Main page component
   ═════════════════════════════════════════════════════════════════════════════ */
export default function ThinkTankClient() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [leadReportTitle, setLeadReportTitle] = useState('')

  function openLeadModal(title: string) {
    setLeadReportTitle(title)
    setLeadModalOpen(true)
  }

  const filteredReports =
    activeCategory === '全部'
      ? MOCK_REPORTS
      : MOCK_REPORTS.filter((r) => r.category === activeCategory)

  return (
    <>
    <div className="min-h-screen">

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-24 pb-24 overflow-hidden bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/20">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.08) 0%, rgba(16,185,129,0.04) 50%, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.9) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-8" aria-label="breadcrumb">
              <Link href="/" className="hover:text-slate-600 transition-colors">首页</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-400">行业服务</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-700 font-medium">智库研究</span>
            </nav>

            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-[12px] font-semibold tracking-wide">
                <BookOpen className="w-3.5 h-3.5" />
                智库研究 · Think Tank
              </div>

              {/* H1 */}
              <h1 className="text-4xl sm:text-5xl md:text-[3.25rem] font-black text-slate-900 mb-5 leading-[1.10] tracking-tight">
                战略洞察，
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                  数据赋能决策
                </span>
              </h1>

              <p className="text-[16px] md:text-[17px] text-slate-500 leading-relaxed mb-10 max-w-2xl">
                深度研究报告库 · 行业数据看板 · 专家咨询服务
                <br />
                为企业政策研判与商业决策提供有据可查的量化支撑
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { value: '48+', label: '深度研报', icon: FileText, color: '#7c3aed', bg: '#f5f3ff' },
                  { value: '12位', label: '首席分析师', icon: Users, color: '#059669', bg: '#ecfdf5' },
                  { value: '6大', label: '覆盖领域', icon: BarChart2, color: '#2563eb', bg: '#eff6ff' },
                  { value: '200+', label: '数据模型', icon: Star, color: '#d97706', bg: '#fffbeb' },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="rounded-3xl p-5 flex flex-col gap-2 bg-white border border-slate-100 shadow-xl shadow-slate-100"
                    >
                      <Icon className="w-4 h-4 mb-1" style={{ color: stat.color }} />
                      <span className="text-[22px] font-black text-slate-900 leading-none">{stat.value}</span>
                      <span className="text-[11px] text-slate-500">{stat.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2 — DATA DASHBOARD
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative py-16 md:py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Section header */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold tracking-widest uppercase">
                  <BarChart2 className="w-3 h-3" />
                  核心数据看板
                </div>
                <h2 className="text-[22px] md:text-[26px] font-bold text-slate-900 leading-tight">
                  行业数据实时追踪
                </h2>
              </div>
              <Link
                href="/database"
                className="hidden sm:flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                进入完整数据库
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3-column dashboard grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <DashboardCard
                icon={TrendingUp}
                iconColor="#10b981"
                iconGrad="linear-gradient(135deg, #065f46, #10b981)"
                title="回收率增长趋势"
              >
                <ChartSparkline />
              </DashboardCard>

              <DashboardCard
                icon={BarChart2}
                iconColor="#3b82f6"
                iconGrad="linear-gradient(135deg, #1e3a8a, #3b82f6)"
                title="领域市场占比"
              >
                <ChartBars />
              </DashboardCard>

              <DashboardCard
                icon={ShieldCheck}
                iconColor="#8b5cf6"
                iconGrad="linear-gradient(135deg, #4c1d95, #8b5cf6)"
                title="政策合规情况"
              >
                <ChartRing />
              </DashboardCard>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 3 — RESEARCH REPORTS LIBRARY
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-widest uppercase">
                  <FileText className="w-3 h-3" />
                  深度报告库
                </div>
                <h2 className="text-[22px] md:text-[26px] font-bold text-slate-900 leading-tight">
                  产业研究报告
                </h2>
                <p className="text-[13px] text-slate-400 mt-1">
                  共 {MOCK_REPORTS.length} 份报告 · 持续更新中
                </p>
              </div>

              {/* Category filter */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 flex-wrap sm:flex-nowrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none',
                      activeCategory === cat
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Report grid */}
            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReports.map((report) => (
                  <ReportCard key={report.id} report={report} onCTAClick={openLeadModal} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <FileText className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-[14px] text-slate-500">该分类暂无报告</p>
              </div>
            )}

            {/* Load more hint */}
            <div className="text-center mt-10">
              <button
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700 shadow-sm"
              >
                查看更多报告
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 4 — CUSTOM RESEARCH CTA
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative rounded-3xl overflow-hidden p-8 md:p-12 bg-white border border-slate-200 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.10)]"
            >
              {/* Background orbs */}
              <div
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)' }}
              />
              <div
                className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)' }}
              />
              {/* Grid texture */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: [
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.8) 0, rgba(0,0,0,0.8) 1px, transparent 1px, transparent 24px)',
                    'repeating-linear-gradient(90deg, rgba(0,0,0,0.8) 0, rgba(0,0,0,0.8) 1px, transparent 1px, transparent 24px)',
                  ].join(','),
                }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Left: copy */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-bold tracking-wide">
                    <Star className="w-3 h-3" />
                    定制研究服务
                  </div>
                  <h2 className="text-[24px] md:text-[30px] font-black text-slate-900 mb-3 leading-tight">
                    需要针对您企业的
                    <br />
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      专属产业研报？
                    </span>
                  </h2>
                  <p className="text-[14px] text-slate-500 leading-relaxed mb-5 max-w-md">
                    我们的首席分析师团队可围绕您的战略议题，定制交付专属深度报告，提供从数据采集、模型构建到战略建议的全程服务。
                  </p>
                  <ul className="space-y-2">
                    {[
                      '一对一首席分析师对接，7×24h 响应',
                      '自有数据库 + 一手调研，数据闭源保密',
                      '可交付 PPT / PDF / 数据看板多种格式',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-[13px] text-slate-600">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 bg-violet-100 border border-violet-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: CTA panel */}
                <div
                  className="w-full md:w-auto flex-shrink-0 rounded-2xl p-6 flex flex-col items-center gap-4 bg-slate-50 border border-slate-200"
                  style={{ minWidth: '220px' }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      boxShadow: '0 8px 24px rgba(124,58,237,0.25)',
                    }}
                  >
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-bold text-slate-900 mb-0.5">联系首席分析师</p>
                    <p className="text-[11.5px] text-slate-500">平均响应时间 &lt; 4小时</p>
                  </div>
                  <button
                    onClick={() => openLeadModal('定制研究服务 — 联系首席分析师')}
                    className="relative overflow-hidden group w-full py-3 rounded-xl text-[14px] font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
                    }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent -translate-x-full skew-x-[-20deg] group-hover:translate-x-[300%] transition-transform duration-700 pointer-events-none" />
                    立即预约咨询
                  </button>
                  <p className="text-[10.5px] text-slate-600 text-center">
                    首次咨询免费 · 无需注册
                  </p>
                </div>
              </div>
            </div>
          </div>
      </section>

    </div>

    <ResearchLeadModal
      isOpen={leadModalOpen}
      onClose={() => setLeadModalOpen(false)}
      reportTitle={leadReportTitle}
    />
    </>
  )
}
