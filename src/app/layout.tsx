import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: {
    default: '中国塑料循环利用产业服务平台',
    template: '%s | 中国塑料循环利用产业服务平台',
  },
  description:
    '专注塑料循环利用行业多维度信息服务，覆盖装备、助剂、模具、成型工艺、材料等实体维度，以及汽车塑料、消费电子、包装材料等应用领域。',
  keywords: [
    '塑料装备', '塑料助剂', '模具', '成型工艺', '再生材料',
    '汽车塑料', '消费电子塑料', '包装材料', '循环利用', '化学回收',
  ],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '中国塑料循环利用产业服务平台',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="antialiased scroll-smooth">
      <body className="font-sans bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
