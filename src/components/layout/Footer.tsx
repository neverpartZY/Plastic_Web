import Link from 'next/link'
import { Leaf, RefreshCw } from 'lucide-react'
import type { FooterDictionary } from '@/i18n/types'

const ZH: FooterDictionary = {
  brand: '可持续塑料产业链平台',
  brandDesc: '专注塑料产业链可持续发展情报服务，覆盖绿色机械、可持续材料、环保助剂、绿色辅料、循环再生与碳中和政策六大核心支柱，服务全球塑料产业链参与者。',
  mission: '驱动塑料产业链可持续发展新范式',
  quickNav: '快速导航',
  hotTags: '热门话题',
  links: {
    machinery: '绿色机械动态',
    materials: '可持续材料',
    recycling: '循环再生技术',
    carbonPolicy: '碳中和/政策',
    additives: '环保助剂',
  },
  copyright: '© 2025 可持续塑料产业链平台. All rights reserved.',
  tagline: '绿色产业链 · 可持续未来',
}

export default function Footer({ dict }: { dict?: FooterDictionary }) {
  const t = dict ?? ZH
  return (
    <footer className="bg-slate-900 mt-16">
      <div className="container py-12">

        {/* ── Six pillar accent strip ── */}
        <div className="flex items-center gap-1 mb-10 opacity-40">
          {['bg-blue-500', 'bg-teal-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500'].map((c, i) => (
            <div key={i} className={`h-0.5 flex-1 rounded-full ${c}`} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-[11px] leading-none select-none">绿</span>
              </div>
              <span className="font-bold text-white text-[15px]">{t.brand}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {t.brandDesc}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Leaf className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-400 font-medium">{t.mission}</span>
            </div>

            {/* Six pillar pills */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              {[
                { label: '绿色机械', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
                { label: '可持续材料', color: 'bg-teal-500/15 text-teal-400 border-teal-500/20' },
                { label: '环保助剂', color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
                { label: '绿色辅料', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
                { label: '循环再生', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
                { label: '碳中和/政策', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
              ].map(({ label, color }) => (
                <span key={label} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${color}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Quick nav */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-white">{t.quickNav}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/news?pillar=machinery"    className="hover:text-emerald-400 transition-colors">{t.links.machinery}</Link></li>
              <li><Link href="/news?pillar=materials"    className="hover:text-emerald-400 transition-colors">{t.links.materials}</Link></li>
              <li><Link href="/news?pillar=recycling"    className="hover:text-emerald-400 transition-colors">{t.links.recycling}</Link></li>
              <li><Link href="/news?pillar=carbonPolicy" className="hover:text-emerald-400 transition-colors">{t.links.carbonPolicy}</Link></li>
              <li><Link href="/news?pillar=additives"    className="hover:text-emerald-400 transition-colors">{t.links.additives}</Link></li>
            </ul>
          </div>

          {/* Hot tags */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-white">{t.hotTags}</h4>
            <div className="flex flex-wrap gap-2">
              {['CBAM', 'PCR', 'PLA', '化学回收', '欧盟', '碳关税', 'ESG', '智能分选', '双碳'].map((tag) => (
                <Link
                  key={tag}
                  href={`/news?q=${encodeURIComponent(tag)}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-600/40 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>{t.copyright}</p>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 text-emerald-600" />
            <span>{t.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
