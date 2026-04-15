import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/i18n/config'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import HeroSearch from '@/components/home/HeroSearch'
import Features from '@/components/home/Features'
import SixModulesGrid from '@/components/home/SixModulesGrid'
import DataEcosystem from '@/components/home/DataEcosystem'
import MatrixHub from '@/components/home/MatrixHub'

interface Props {
  params: { lng: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lng } = params
  if (lng === 'en') {
    return {
      title: 'SustainPlastics Hub — Six Pillar Industry Intelligence',
      description:
        'Intelligence platform for the sustainable plastics industry chain — covering Green Machinery, Sustainable Materials, Eco Additives, Green Auxiliaries, Circular Recycling, and Carbon & Policy.',
    }
  }
  return {
    title: '可持续塑料产业链平台 — 六大支柱情报智库',
    description:
      '专注塑料产业链可持续发展情报服务，覆盖绿色机械、可持续材料、环保助剂、绿色辅料、循环再生与碳中和政策六大核心支柱。',
  }
}

export default async function LngHomePage({ params }: Props) {
  const { lng } = params

  if (!isValidLocale(lng)) notFound()

  const dict = await getDictionary(lng as Locale)

  return (
    <>
      <HeroSearch dict={dict.hero} />
      <Features dict={dict.features} />
      <SixModulesGrid dict={dict.sixModules} />
      <DataEcosystem dict={dict.dataEcosystem} />
      <MatrixHub />
    </>
  )
}
