import type { Metadata } from 'next'
import Link from 'next/link'
import { Leaf, Mail, Globe, BarChart3, BookOpen, Map, LayoutGrid } from 'lucide-react'

export const metadata: Metadata = {
  title: '关于我们',
  description: 'GreenPlastic AI 是国嘉基业信息咨询有限公司旗下专注于塑料产业链可持续发展的智能情报平台。',
}

const PRODUCTS = [
  {
    icon: LayoutGrid,
    label: '情报中心',
    desc: 'AI 实时监测，全球塑料科技 24h 滚动更新',
    href: '/intelligence',
    color: 'bg-emerald-500',
  },
  {
    icon: BookOpen,
    label: '智库研究',
    desc: '战略洞察与深度研究报告',
    href: '/think-tank',
    color: 'bg-blue-500',
  },
  {
    icon: Map,
    label: '产业地图',
    desc: '企业坐标系，精准定位产业链节点',
    href: '/explore',
    color: 'bg-purple-500',
  },
  {
    icon: BarChart3,
    label: '数据看板',
    desc: '精选推送，直达邮件与企业微信',
    href: '/dashboard',
    color: 'bg-amber-500',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 to-white py-20 sm:py-28">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" aria-hidden="true" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[12px] font-semibold mb-6">
            <Leaf className="h-3 w-3" />
            About Us
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            关于 GreenPlastic AI
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
            GreenPlastic AI 是<strong>国嘉基业信息咨询有限公司</strong>旗下专注于塑料产业链可持续发展的智能情报平台，
            以八大行业维度为核心框架，覆盖模具、成型、再生塑料、生物基材料、助剂、辅料、回收再生、重复使用全产业链节点。
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <blockquote className="relative">
            <div className="absolute -top-6 -left-4 text-6xl text-emerald-200 select-none" aria-hidden="true">&ldquo;</div>
            <p className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed italic relative z-10 pl-6">
              塑料循环经济的信息壁垒极高，我们希望通过 AI 让每家企业都能以最低成本获取全球最精准的产业情报。
            </p>
          </blockquote>
          <div className="mt-8 flex items-center gap-3 pl-6">
            <div className="h-px w-12 bg-emerald-400" />
            <span className="text-sm text-slate-500 font-medium">我们的使命：驱动塑料产业链可持续发展新范式</span>
          </div>
        </div>
      </section>

      {/* ── Product Matrix ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">产品矩阵</h2>
          <p className="text-slate-500 mb-10">
            平台致力于通过 AI 技术降低产业信息不对称，加速塑料循环经济转型。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PRODUCTS.map(({ icon: Icon, label, desc, href, color }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {label}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eight Dimensions ── */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">覆盖八大行业维度</h2>
          <p className="text-slate-500 mb-8">
            AI 实时监测全球塑料可持续产业动态，覆盖 21 个精选数据源
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '模具', icon: '🔧', desc: '注塑模具设计、热流道系统' },
              { label: '成型', icon: '📦', desc: '注塑、挤出、吹膜工艺' },
              { label: '再生塑料', icon: '♻️', desc: 'PCR 品质标准与价格行情' },
              { label: '生物基材料', icon: '🌱', desc: 'PLA、PHA、PBS 研发进展' },
              { label: '助剂', icon: '🧪', desc: '绿色助剂、无卤阻燃剂' },
              { label: '辅料', icon: '📐', desc: '功能薄膜、绿色包装辅料' },
              { label: '回收再生', icon: '🔄', desc: '机械/化学/酶解回收技术' },
              { label: '重复使用', icon: '🔁', desc: '可循环设计与减量化策略' },
            ].map(({ label, icon, desc }) => (
              <div
                key={label}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-200 hover:shadow-sm transition-all"
              >
                <span className="text-xl mb-2 block">{icon}</span>
                <h3 className="font-semibold text-sm text-slate-900 mb-1">{label}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">联系我们</h2>
          <p className="text-slate-500 mb-8">
            如果您对平台有任何建议或合作意向，欢迎随时联系我们。
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <a
              href="mailto:daily@greenplastic.ai"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors shadow-sm"
            >
              <Mail className="h-4 w-4" />
              daily@greenplastic.ai
            </a>
            <a
              href="https://greenplastic.ai"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:border-emerald-300 hover:text-emerald-600 transition-colors"
            >
              <Globe className="h-4 w-4" />
              greenplastic.ai
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer note ── */}
      <div className="border-t border-slate-100 bg-slate-50 py-8 text-center">
        <p className="text-xs text-slate-400">
          © 2026 国嘉基业信息咨询有限公司. All rights reserved. &nbsp;|&nbsp; GreenPlastic AI 是国嘉基业信息咨询有限公司旗下产品。
        </p>
      </div>
    </main>
  )
}
