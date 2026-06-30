import { headers } from 'next/headers'
import { isValidLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import TradingPageClient from '@/components/trading/TradingPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '交易中心 — SustainPlastics Hub',
  description: '再生塑料供需撮合平台，覆盖PET/HDPE/PP/LDPE/ABS/PC/PVC/PA6等品类',
}

export default async function TradingPage() {
  const lng = (headers().get('x-lng') ?? 'zh') as 'zh' | 'en'
  const locale = isValidLocale(lng) ? lng : 'zh'
  const dict = await getDictionary(locale)

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-1 h-5 bg-emerald-500 rounded-full" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">Trading Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">交易中心</h1>
          <p className="text-sm text-gray-500 mt-1">再生塑料供需撮合 · 实时行情参考</p>
        </div>
      </div>

      {/* Client: tabs + data */}
      <TradingPageClient lang={locale} dict={dict} />
    </div>
  )
}
