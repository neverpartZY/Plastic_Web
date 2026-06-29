import { headers } from 'next/headers'
import { Suspense } from 'react'
import { isValidLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Locale } from '@/i18n/config'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const lng = (headers().get('x-lng') ?? 'zh') as Locale
  if (!isValidLocale(lng)) { /* fall through with default */ }
  const locale: Locale = isValidLocale(lng) ? lng : 'zh'
  const dict = await getDictionary(locale)

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-16" />}>
        <Navbar dict={dict.nav} lng={locale} />
      </Suspense>
      <main className="flex-1 pt-16">{children}</main>
      <Footer dict={dict.footer} />
    </div>
  )
}
