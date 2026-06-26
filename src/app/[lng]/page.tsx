import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/i18n/config'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import HeroSearch from '@/components/home/HeroSearch'
import Features from '@/components/home/Features'
import EightModulesGrid from '@/components/home/SixModulesGrid'
import DataEcosystem from '@/components/home/DataEcosystem'


interface Props {
  params: { lng: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lng } = params
  if (lng === 'en') {
    return {
      title: 'GreenPlastic AI — 8-Dimension Industry Intelligence',
      description:
        'Intelligence platform for the sustainable plastics industry chain — covering Molds, Molding, Recycled Plastics, Bio-based Materials, Additives, Auxiliaries, Recycling, and Reuse across eight industry dimensions.',
    }
  }
  return {
    title: 'GreenPlastic AI — 八大维度产业情报智库',
    description:
      '国嘉基业旗下可持续塑料产业智能情报平台，覆盖模具、成型、再生塑料、生物基材料、助剂、辅料、回收再生、重复使用八大行业维度。',
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
      <EightModulesGrid dict={dict.eightModules} />
      <DataEcosystem dict={dict.dataEcosystem} />

    </>
  )
}
