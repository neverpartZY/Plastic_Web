import Link from 'next/link'
import { Leaf, RefreshCw } from 'lucide-react'
import type { FooterDictionary } from '@/i18n/types'

const ZH: FooterDictionary = {
  brand: 'GreenPlastic AI',
  brandDesc: '国嘉基业旗下专注塑料产业链可持续发展的智能情报平台，覆盖模具、成型、再生塑料、生物基材料、助剂、辅料、回收再生、重复使用八大行业维度，服务全球塑料产业链参与者。',
  mission: '驱动塑料产业链可持续发展新范式',
  quickNav: '快速导航',
  hotTags: '热门话题',
  links: {
    molds: '模具技术动态',
    molding: '成型工艺创新',
    recycled: '再生塑料市场',
    bio: '生物基材料前沿',
    additives: '绿色助剂',
    auxiliaries: '辅料升级',
    recycling: '回收再生技术',
    reuse: '重复使用模式',
  },
  copyright: '© 2026 国嘉基业信息咨询有限公司. All rights reserved.',
  tagline: '绿色产业链 · 可持续未来',
}

export default function Footer({ dict }: { dict?: FooterDictionary }) {
  const t = dict ?? ZH
  return (
    <footer className="bg-slate-900 mt-16">
      <div className="container py-12">

        {/* ── Eight dimension accent strip ── */}
        <div className="flex items-center gap-1 mb-10 opacity-40">
          {['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-orange-500', 'bg-emerald-500', 'bg-indigo-500'].map((c, i) => (
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
            <div className="flex items-center gap-2 mt-2">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:daily@greenplastic.ai" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                daily@greenplastic.ai
              </a>
            </div>

            {/* Eight dimension pills */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              {[
                { label: '模具', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
                { label: '成型', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
                { label: '再生塑料', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
                { label: '生物基材料', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
                { label: '助剂', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
                { label: '辅料', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
                { label: '回收再生', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
                { label: '重复使用', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
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
              <li><Link href="/news?dimension=molds"       className="hover:text-emerald-400 transition-colors">{t.links.molds}</Link></li>
              <li><Link href="/news?dimension=molding"     className="hover:text-emerald-400 transition-colors">{t.links.molding}</Link></li>
              <li><Link href="/news?dimension=recycled"    className="hover:text-emerald-400 transition-colors">{t.links.recycled}</Link></li>
              <li><Link href="/news?dimension=bio"         className="hover:text-emerald-400 transition-colors">{t.links.bio}</Link></li>
              <li><Link href="/news?dimension=additives"   className="hover:text-emerald-400 transition-colors">{t.links.additives}</Link></li>
              <li><Link href="/news?dimension=auxiliaries" className="hover:text-emerald-400 transition-colors">{t.links.auxiliaries}</Link></li>
              <li><Link href="/news?dimension=recycling"   className="hover:text-emerald-400 transition-colors">{t.links.recycling}</Link></li>
              <li><Link href="/news?dimension=reuse"       className="hover:text-emerald-400 transition-colors">{t.links.reuse}</Link></li>
              <li className="pt-2 border-t border-slate-800">
                <Link href="/about" className="hover:text-emerald-400 transition-colors text-emerald-500 font-medium">关于我们 →</Link>
              </li>
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
