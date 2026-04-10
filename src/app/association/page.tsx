import type { Metadata } from 'next'
import AssociationClient from './AssociationClient'

export const metadata: Metadata = {
  title: '行业协会',
  description: '塑料回收产业联盟，连接产业链上下游企业，共建互信生态网络',
}

export default function AssociationPage() {
  return <AssociationClient />
}
