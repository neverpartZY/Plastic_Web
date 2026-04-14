import type { Metadata } from 'next'
import EventsClient from './EventsClient'

export const metadata: Metadata = {
  title: '会展活动',
  description: '行业峰会与展览信息，链接供需两端，促进产业资源高效流动',
}

export default function EventsPage() {
  return <EventsClient />
}
