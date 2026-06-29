import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/i18n/config'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

interface Props {
  children: React.ReactNode
  params: { lng: string }
}

export default async function LngLayout({ children, params }: Props) {
  const { lng } = params

  if (!isValidLocale(lng)) notFound()

  const dict = await getDictionary(lng as Locale)

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-16" />}>
        <Navbar dict={dict.nav} lng={lng} />
      </Suspense>
      <main className="flex-1 pt-16">{children}</main>
      <Footer dict={dict.footer} />
    </div>
  )
}
