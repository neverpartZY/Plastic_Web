'use client'

import Link from 'next/link'
import { PenTool, Box, RotateCcw, Leaf, FlaskConical, Package, RefreshCw, Repeat2, ArrowRight } from 'lucide-react'
import type { FeaturesDictionary } from '@/i18n/types'

// ── Visual config (locale-independent) ───────────────────────────────────────

const FEATURE_STYLE = [
  {
    key: 'molds' as const,
    href: '/news?dimension=molds',
    icon: PenTool,
    iconBg: 'bg-blue-100', iconColor: 'text-blue-700',
    ringColor: 'ring-blue-200', accentText: 'text-blue-700', accentBg: 'bg-blue-50',
    gradFrom: 'from-blue-500', gradTo: 'to-sky-400',
    glowColor: 'rgba(29,78,216,0.15)',
  },
  {
    key: 'molding' as const,
    href: '/news?dimension=molding',
    icon: Box,
    iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600',
    ringColor: 'ring-cyan-200', accentText: 'text-cyan-600', accentBg: 'bg-cyan-50',
    gradFrom: 'from-cyan-500', gradTo: 'to-teal-400',
    glowColor: 'rgba(6,182,212,0.15)',
  },
  {
    key: 'recycled' as const,
    href: '/news?dimension=recycled',
    icon: RotateCcw,
    iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
    ringColor: 'ring-purple-200', accentText: 'text-purple-600', accentBg: 'bg-purple-50',
    gradFrom: 'from-purple-500', gradTo: 'to-violet-400',
    glowColor: 'rgba(124,58,237,0.15)',
  },
  {
    key: 'bio' as const,
    href: '/news?dimension=bio',
    icon: Leaf,
    iconBg: 'bg-green-100', iconColor: 'text-green-600',
    ringColor: 'ring-green-200', accentText: 'text-green-600', accentBg: 'bg-green-50',
    gradFrom: 'from-green-500', gradTo: 'to-emerald-400',
    glowColor: 'rgba(5,150,105,0.15)',
  },
  {
    key: 'additives' as const,
    href: '/news?dimension=additives',
    icon: FlaskConical,
    iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
    ringColor: 'ring-amber-200', accentText: 'text-amber-600', accentBg: 'bg-amber-50',
    gradFrom: 'from-amber-500', gradTo: 'to-yellow-400',
    glowColor: 'rgba(217,119,6,0.15)',
  },
  {
    key: 'auxiliaries' as const,
    href: '/news?dimension=auxiliaries',
    icon: Package,
    iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
    ringColor: 'ring-orange-200', accentText: 'text-orange-600', accentBg: 'bg-orange-50',
    gradFrom: 'from-orange-500', gradTo: 'to-amber-400',
    glowColor: 'rgba(234,88,12,0.15)',
  },
  {
    key: 'recycling' as const,
    href: '/news?dimension=recycling',
    icon: RefreshCw,
    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    ringColor: 'ring-emerald-200', accentText: 'text-emerald-600', accentBg: 'bg-emerald-50',
    gradFrom: 'from-emerald-500', gradTo: 'to-teal-400',
    glowColor: 'rgba(5,150,105,0.15)',
  },
  {
    key: 'reuse' as const,
    href: '/news?dimension=reuse',
    icon: Repeat2,
    iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600',
    ringColor: 'ring-indigo-200', accentText: 'text-indigo-600', accentBg: 'bg-indigo-50',
    gradFrom: 'from-indigo-500', gradTo: 'to-blue-400',
    glowColor: 'rgba(67,56,202,0.15)',
  },
]

const ZH: FeaturesDictionary = {
  badge: '八大产业维度 · 全链覆盖',
  title: '全链布局，可持续驱动',
  subtitle: '从模具制造到重复使用，',
  subtitleBold: '八大核心维度',
  subtitleEnd: '全面覆盖塑料产业链可持续发展关键节点',
  learnMore: '了解更多',
  ctaQuestion: '想深入了解某个维度的情报服务？欢迎与我们直接沟通',
  ctaSubscribe: '订阅每日情报',
  ctaDatabase: '探索数据中台',
  cards: {
    molds:       { label: '模具',       tagline: '精密制造 · 设计前沿', desc: '聚焦注塑模具、热流道系统、高效冷却技术及模具钢材表面处理，追踪模具设计与精密制造最新进展。', bullet1: '热流道与高效冷却模具技术', bullet2: '模具钢材与表面处理新工艺', bullet3: '精密模具设计与仿真优化' },
    molding:     { label: '成型',       tagline: '工艺升级 · 智能制造', desc: '覆盖注塑、挤出、吹膜、造粒等全系列塑料成型工艺，追踪能效升级与智能化改造前沿动态。', bullet1: '注塑/挤出/吹膜设备能效新标准', bullet2: '智能化改造与工业互联网融合', bullet3: '国内外主流装备厂商技术动态' },
    recycled:    { label: '再生塑料',   tagline: '品质标准 · 市场供需', desc: '聚焦 PCR 再生料品质标准、认证体系与全球市场供需，追踪 rPET、rPP、rPE 等关键品类价格行情。', bullet1: 'PCR 再生料品质标准与认证体系', bullet2: 'rPET/rPP/rPE 价格行情与供需动态', bullet3: '食品级再生塑料法规与准入进展' },
    bio:         { label: '生物基材料', tagline: '绿色原料 · 材料创新', desc: '聚焦 PLA、PHA、PBS 等生物基聚合物及可降解材料，追踪材料科学最新突破与产业化进程。', bullet1: 'PLA/PHA/PBS 生物基塑料研发进展', bullet2: '可降解材料法规与市场化进程', bullet3: '生物基单体与聚合技术前沿' },
    additives:   { label: '助剂',       tagline: '配方创新 · 绿色化学', desc: '深度覆盖抗氧化剂、热稳定剂、生物基增塑剂等绿色助剂体系，助力配方绿色化转型。', bullet1: '无重金属稳定剂替代方案', bullet2: '生物基增塑剂与无卤阻燃技术', bullet3: 'REACH/RoHS 合规助剂趋势' },
    auxiliaries: { label: '辅料',       tagline: '辅料升级 · 工艺优化', desc: '关注功能薄膜、绿色包装辅料、模具钢材及精密成型辅助材料，赋能生产全流程降碳减排。', bullet1: '可回收功能薄膜与绿色包装材料', bullet2: '模具钢材与特种合金最新进展', bullet3: '高效冷却与表面处理辅料技术' },
    recycling:   { label: '回收再生',   tagline: '闭环经济 · 技术突破', desc: '系统追踪机械回收、化学回收、酶解技术、智能分选四大路径，推动再生产业链规模化与高值化。', bullet1: '化学回收（解聚/热裂解）最新产能', bullet2: 'AI 智能分选技术与设备进展', bullet3: '再生料食品级应用与高值化路径' },
    reuse:       { label: '重复使用',   tagline: '循环设计 · 模式创新', desc: '关注可循环包装设计、减量化策略、重复使用商业模式及全球塑料公约相关法规动态。', bullet1: '可循环包装设计与减量化策略', bullet2: '重复使用商业模式与案例分析', bullet3: '全球塑料公约与EPR制度深度解读' },
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Features({ dict }: { dict?: FeaturesDictionary }) {
  const t = dict ?? ZH
  return (
    <section className="relative bg-white py-24 md:py-32 overflow-hidden">

      {/* Industrial fine grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.022) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Soft glow — top left (blue/machinery) */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.05) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />

      {/* Soft glow — bottom right (emerald/recycling) */}
      <div
        className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Section header ── */}
        <div className="text-center mb-16 md:mb-20">
          {/* Eight-color dimension bar */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-orange-500', 'bg-emerald-500', 'bg-indigo-500'].map((c, i) => (
              <div key={i} className={`h-1 w-6 rounded-full ${c} opacity-70`} />
            ))}
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-sm font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            {t.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-5 tracking-tight leading-[1.12]">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
            <span className="text-slate-800 font-bold">{t.subtitleBold}</span>
            {t.subtitleEnd}
          </p>
        </div>

        {/* ── Feature card grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
          {FEATURE_STYLE.map((f) => {
            const Icon = f.icon
            const card = t.cards[f.key]
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group relative flex flex-col gap-5 rounded-3xl bg-white border border-slate-100 p-7 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Gradient top stripe on hover */}
                <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-b-full bg-gradient-to-r ${f.gradFrom} ${f.gradTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Icon — circular colorful bubble */}
                <div
                  className={`w-13 h-13 w-[52px] h-[52px] rounded-2xl flex items-center justify-center ring-4 flex-shrink-0 ${f.iconBg} ${f.ringColor} transition-transform duration-300 group-hover:scale-105`}
                  style={{ boxShadow: `0 6px 18px ${f.glowColor}` }}
                >
                  <Icon className={`h-6 w-6 ${f.iconColor}`} />
                </div>

                {/* Copy */}
                <div className="flex flex-col gap-3 flex-1">
                  <div>
                    <div className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2 ${f.accentBg} ${f.accentText}`}>
                      {card.tagline}
                    </div>
                    <h3 className="text-[18px] font-bold text-slate-900 leading-snug group-hover:text-slate-800">
                      {card.label}
                    </h3>
                  </div>
                  <p className="text-[13.5px] text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>

                  {/* Bullet list */}
                  <ul className="space-y-2 mt-1">
                    {[card.bullet1, card.bullet2, card.bullet3].map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.iconBg.replace('-100', '-400')}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA row */}
                <div className={`flex items-center gap-1 text-[13px] font-semibold ${f.accentText} mt-auto pt-2 border-t border-slate-50 group-hover:border-slate-100 transition-colors`}>
                  {t.learnMore}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-16 md:mt-20 text-center">
          <p className="text-[14px] text-slate-500 mb-5">
            {t.ctaQuestion}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-cyan-700 hover:bg-cyan-600 text-white text-[14px] font-semibold shadow-[0_4px_20px_rgba(8,145,178,0.30)] hover:shadow-[0_6px_28px_rgba(8,145,178,0.40)] transition-all duration-200"
            >
              {t.ctaSubscribe}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/database"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-[14px] font-semibold transition-all duration-200"
            >
              {t.ctaDatabase}
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
