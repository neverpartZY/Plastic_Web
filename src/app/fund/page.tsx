import type { Metadata } from 'next'
import FundClient from './FundClient'

export const metadata: Metadata = {
  title: '产业基金',
  description: '产业投资与赋能，加速优质项目从技术验证到市场规模的跨越',
}

export default function FundPage() {
  return <FundClient />
}
