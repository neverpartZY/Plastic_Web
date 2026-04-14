import type { Metadata } from 'next'
import ThinkTankClient from './ThinkTankClient'

export const metadata: Metadata = {
  title: '智库研究',
  description: '战略洞察与深度研究报告，为行业政策研判与商业决策提供量化依据',
}

export default function ThinkTankPage() {
  return <ThinkTankClient />
}
