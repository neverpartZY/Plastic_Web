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
      title: 'China Circular Plastics Industry Platform',
      description:
        'One-stop digital services for the plastic recycling industry — covering industry media, research, association, events, technology and fund.',
    }
  }
  return {
    title: '中国塑料循环利用产业服务平台',
    description:
      '专注塑料循环利用行业多维度信息服务，覆盖装备、助剂、模具、成型工艺、材料等实体维度。',
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
