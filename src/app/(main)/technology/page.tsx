import type { Metadata } from 'next'
import TechnologyClient from './TechnologyClient'

export const metadata: Metadata = {
  title: '技术攻关',
  description: '关键空白技术突破，推动机械、化学、酶解回收等前沿研究落地转化',
}

export default function TechnologyPage() {
  return <TechnologyClient />
}
