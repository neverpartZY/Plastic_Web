import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import SubscribeClient from './SubscribeClient'

export const metadata: Metadata = {
  title: '每日情报',
  description: '精选塑料回收产业情报推送，政策、市场、技术、企业动态一站掌握',
}

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_INTEL = [
  {
    id: 'i1',
    title: '国家发改委拟出台再生塑料强制使用比例新规，2026年包装领域占比不低于30%',
    summary: '据悉，《再生资源产品强制采购目录》修订草案正在征求意见，核心条款要求国内快消品包装企业在2026年前将再生塑料含量提升至30%以上，违规企业将面临碳配额扣减。',
    category: 'policy',
    source: '中国循环经济协会',
    sourceUrl: null,
    isHot: true,
    isPremium: false,
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i2',
    title: 'PCR-PET现货价本周上涨3.2%，华东分拣中心开工率回升至78%',
    summary: '受欧盟EPR法规正式落地与国内"以旧换新"补贴政策双重提振，清洗级PET瓶片现货价突破7200元/吨，创近8个月新高。多家分拣中心反映订单饱和。',
    category: 'market',
    source: '卓创资讯',
    sourceUrl: null,
    isHot: true,
    isPremium: false,
    publishedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i3',
    title: '太空聚合工艺PET酶解解聚项目完成B轮融资，融资额达1.8亿元',
    summary: '上海太空聚合宣布完成B轮1.8亿元融资，本轮由绿色转型基金领投。公司酶解PET技术已实现单线年处理2万吨，单体成本较化学法降低23%，预计2025年底实现盈亏平衡。',
    category: 'enterprise',
    source: '36氪',
    sourceUrl: null,
    isHot: false,
    isPremium: false,
    publishedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i4',
    title: '麻省理工开发出新型催化剂，常温下可将混合塑料转化为单体，转化效率达94%',
    summary: '发表于《Nature Catalysis》的研究显示，MIT团队开发的铑基双功能催化剂可在65°C水溶液中同时断裂PE与PP的C-C键，产物纯度超过98%，为混合废塑料化学回收提供全新路径。',
    category: 'tech',
    source: 'Nature Catalysis',
    sourceUrl: null,
    isHot: true,
    isPremium: true,
    publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i5',
    title: '欧盟PPWR法规关键条款正式生效，出口欧盟包装企业须提交PCR含量证明文件',
    summary: '《包装与包装废弃物法规》（PPWR）中塑料包装再生含量强制条款于本月15日正式生效，要求所有进入欧盟市场的塑料接触食品包装须提供经认证的PCR含量溯源报告，否则面临禁止入境处罚。',
    category: 'global',
    source: 'European Commission',
    sourceUrl: null,
    isHot: false,
    isPremium: true,
    publishedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i6',
    title: '广东省出台废塑料资源化利用三年行动方案，目标2027年再生率提升至65%',
    summary: '广东省发改委联合生态环境厅发布《广东省废塑料资源化利用三年行动方案（2024-2027）》，计划在珠三角建设5个万吨级分拣中心，并对接入省级数字溯源平台的企业给予税收优惠。',
    category: 'policy',
    source: '广东省发改委',
    sourceUrl: null,
    isHot: false,
    isPremium: false,
    publishedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i7',
    title: 'HDPE再生粒料供应趋紧，华南报价较上月上涨5.8%',
    summary: '受多家大型分拣企业设备检修叠加原料收购价格走高影响，华南地区HDPE再生粒料供给减少约12%，现货报价攀升至8800-9200元/吨区间。业内预计紧张态势将持续至下季度。',
    category: 'market',
    source: '隆众资讯',
    sourceUrl: null,
    isHot: false,
    isPremium: false,
    publishedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i8',
    title: '蓝星再生科技与宁波某头部快消品企业签署5年闭环回收框架协议',
    summary: '双方协议涵盖年均5000吨废旧包装材料定向回收，蓝星承诺48小时完成分拣并出具质检报告，企业方则以不低于市价8%的溢价优先采购，探索"品牌-回收商"长效绑定模式。',
    category: 'enterprise',
    source: '本平台',
    sourceUrl: null,
    isHot: false,
    isPremium: false,
    publishedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export type IntelItem = {
  id: string
  title: string
  summary: string
  category: string
  source: string | null
  sourceUrl: string | null
  isHot: boolean
  isPremium: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export default async function SubscribePage() {
  let items: IntelItem[] = []

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (prisma as any).intelligence.findMany({
      orderBy: [{ isHot: 'desc' }, { publishedAt: 'desc' }],
      take: 20,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items = raw.map((item: any) => ({
      ...item,
      publishedAt: item.publishedAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))
  } catch {
    // DB not yet seeded — use mock data
  }

  if (items.length === 0) items = MOCK_INTEL

  return <SubscribeClient items={items} />
}
