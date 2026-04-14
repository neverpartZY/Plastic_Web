'use client'

import Link from 'next/link'
import {
  Newspaper, BookOpen, Users, Calendar, Cpu, TrendingUp, ArrowRight,
} from 'lucide-react'

// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    href: '/news',
    icon: Newspaper,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-700',
    ringColor: 'ring-cyan-200',
    accentText: 'text-cyan-700',
    accentBg: 'bg-cyan-50',
    label: '行业媒体',
    tagline: '实时资讯 · 多维检索',
    desc: '汇聚国内外主流塑料回收媒体资讯，多维标签体系精准过滤，让您每天 5 分钟掌握全行业动态。',
    bullets: ['实时抓取，日均更新 200+ 条', '覆盖机械/化学回收、ESG、法规等赛道', '智能标签 + 全文搜索'],
  },
  {
    href: '/think-tank',
    icon: BookOpen,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    ringColor: 'ring-violet-200',
    accentText: 'text-violet-600',
    accentBg: 'bg-violet-50',
    label: '智库研究',
    tagline: '战略洞察 · 深度报告',
    desc: '联合高校院所与行业专家，定期输出覆盖技术路线、市场格局与政策解析的深度研究报告。',
    bullets: ['月均发布 4+ 份行业报告', '覆盖白皮书、技术指南、合规手册', '会员专享优先下载权'],
  },
  {
    href: '/association',
    icon: Users,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    ringColor: 'ring-teal-200',
    accentText: 'text-teal-600',
    accentBg: 'bg-teal-50',
    label: '行业协会',
    tagline: '产业联盟 · 互信生态',
    desc: '汇聚塑料回收产业链 200+ 核心企业，通过标准制定、技术交流、政策倡导，构建产业互信网络。',
    bullets: ['理事/普通/观察三级会员体系', '参与年度峰会与标准制定', '独家资源对接与品牌曝光'],
  },
  {
    href: '/events',
    icon: Calendar,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    ringColor: 'ring-amber-200',
    accentText: 'text-amber-600',
    accentBg: 'bg-amber-50',
    label: '会展活动',
    tagline: '峰会 · 展览 · 工坊',
    desc: '覆盖行业峰会、专业展览与实操工坊，链接供需两端，一站式完成商务拓展与知识获取。',
    bullets: ['年均 12+ 场大型活动', '覆盖北京、上海、广州等 12 座城市', '线上直播同步，会后资料共享'],
  },
  {
    href: '/technology',
    icon: Cpu,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    ringColor: 'ring-emerald-200',
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-50',
    label: '技术攻关',
    tagline: '关键突破 · 产业转化',
    desc: '聚焦机械回收、化学回收、酶解技术、智能分选四大领域，加速前沿成果从实验室走向产业线。',
    bullets: ['联合 12 所高校与研究院', '在研项目全程进度可视化', '招募攻关伙伴，联合申报支持'],
  },
  {
    href: '/fund',
    icon: TrendingUp,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
    ringColor: 'ring-rose-200',
    accentText: 'text-rose-500',
    accentBg: 'bg-rose-50',
    label: '产业基金',
    tagline: '投资赋能 · 产业加速',
    desc: '聚焦塑料循环产业链关键节点，为具备技术壁垒与规模化潜力的优质项目提供全周期投资赋能。',
    bullets: ['管理规模 5 亿+，平均 IRR 31%', '覆盖天使到 B 轮全阶段', '7 个工作日内完成初步评估'],
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function Features() {
  return (
    <section className="relative bg-white py-24 md:py-32 overflow-hidden">

      {/* Subtle background dot grid */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(15,23,42,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Soft teal glow — top left */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Soft emerald glow — bottom right */}
      <div
        className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Section header ── */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-sm font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            6位1体产业服务体系
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-5 tracking-tight leading-[1.12]">
            一站覆盖，全链赋能
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            从资讯获取到技术攻关，从产业融合到资本加速，
            <span className="text-slate-700 font-semibold">6 个核心模块</span>
            形成闭环，驱动中国塑料循环产业数字化升级
          </p>
        </div>

        {/* ── Feature card grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group relative flex flex-col gap-6 rounded-3xl bg-white border border-slate-100 p-8 shadow-xl shadow-slate-100 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300"
              >
                {/* Icon — circular colorful bubble */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ring-4 flex-shrink-0 ${f.iconBg} ${f.ringColor}`}>
                  <Icon className={`h-6 w-6 ${f.iconColor}`} />
                </div>

                {/* Copy */}
                <div className="flex flex-col gap-3 flex-1">
                  <div>
                    <div className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2 ${f.accentBg} ${f.accentText}`}>
                      {f.tagline}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">
                      {f.label}
                    </h3>
                  </div>
                  <p className="text-[13.5px] text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>

                  {/* Bullet list */}
                  <ul className="space-y-2 mt-1">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.iconBg.replace('bg-', 'bg-').replace('-100', '-400')}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA row */}
                <div className={`flex items-center gap-1 text-[13px] font-semibold ${f.accentText} mt-auto pt-2`}>
                  了解更多
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>

                {/* Hover top accent line */}
                <div
                  className={`absolute top-0 left-6 right-6 h-0.5 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${f.iconBg.replace('-100', '-400')}`}
                />
              </Link>
            )
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-16 md:mt-20 text-center">
          <p className="text-[14px] text-slate-500 mb-5">
            还不确定哪个模块最适合您？欢迎与我们直接沟通需求
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-cyan-700 hover:bg-cyan-600 text-white text-[14px] font-semibold shadow-[0_4px_20px_rgba(8,145,178,0.30)] hover:shadow-[0_6px_28px_rgba(8,145,178,0.40)] transition-all duration-200"
            >
              订阅每日情报
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/database"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-[14px] font-semibold transition-all duration-200"
            >
              探索数据基石
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
