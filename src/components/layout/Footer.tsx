import Link from 'next/link'
import { Recycle, Leaf } from 'lucide-react'
import type { FooterDictionary } from '@/i18n/types'

const ZH: FooterDictionary = {
  brand: '循环塑料产业平台',
  brandDesc: '专注塑料循环利用行业多维度信息服务，覆盖装备、助剂、模具、成型工艺、材料等实体维度，以及汽车塑料、消费电子、包装材料等应用领域。',
  mission: '致力于推动中国塑料循环经济发展',
  quickNav: '快速导航',
  hotTags: '热门标签',
  links: { price: '价格行情', policy: '政策法规', recycling: '回收技术', corporate: '企业动态', circular: '循环经济' },
  copyright: '© 2025 中国塑料循环利用产业服务平台. All rights reserved.',
  tagline: '绿色循环 · 可持续未来',
}

export default function Footer({ dict }: { dict?: FooterDictionary }) {
  const t = dict ?? ZH
  return (
    <footer className="bg-slate-900 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-[11px] leading-none select-none">循</span>
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
          </div>

          {/* Quick nav */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-white">{t.quickNav}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/news?tags=price"                className="hover:text-emerald-400 transition-colors">{t.links.price}</Link></li>
              <li><Link href="/news?tags=policy"               className="hover:text-emerald-400 transition-colors">{t.links.policy}</Link></li>
              <li><Link href="/news?tags=mechanical-recycling"  className="hover:text-emerald-400 transition-colors">{t.links.recycling}</Link></li>
              <li><Link href="/news?tags=financing"            className="hover:text-emerald-400 transition-colors">{t.links.corporate}</Link></li>
              <li><Link href="/news?tags=circular-economy"    className="hover:text-emerald-400 transition-colors">{t.links.circular}</Link></li>
            </ul>
          </div>

          {/* Hot tags */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-white">{t.hotTags}</h4>
            <div className="flex flex-wrap gap-2">
              {['PET', 'HDPE', 'PP', '化学回收', '欧盟', '碳关税', '政策'].map((tag) => (
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
            <Recycle className="h-3 w-3 text-emerald-600" />
            <span>{t.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
