import Link from 'next/link'
import { Recycle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-primary font-bold mb-3">
              <Recycle className="h-5 w-5" />
              <span>塑料回收产业信息中心</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              专注塑料回收产业信息聚合，涵盖价格行情、政策法规、回收技术、企业动态及循环经济前沿动态。
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">快速导航</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/news?tags=price" className="hover:text-foreground transition-colors">价格行情</Link></li>
              <li><Link href="/news?tags=policy" className="hover:text-foreground transition-colors">政策法规</Link></li>
              <li><Link href="/news?tags=mechanical-recycling" className="hover:text-foreground transition-colors">回收技术</Link></li>
              <li><Link href="/news?tags=financing" className="hover:text-foreground transition-colors">企业动态</Link></li>
              <li><Link href="/news?tags=circular-economy" className="hover:text-foreground transition-colors">循环经济</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">热门标签</h4>
            <div className="flex flex-wrap gap-2">
              {['PET', 'HDPE', 'PP', '化学回收', '欧盟', '碳关税', '政策'].map((tag) => (
                <Link
                  key={tag}
                  href={`/news?q=${encodeURIComponent(tag)}`}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
          <p>© 2025 塑料回收产业信息中心. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
