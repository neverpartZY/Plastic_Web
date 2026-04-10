import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ExploreClient from './ExploreClient'

export const metadata: Metadata = {
  title: '产业地图',
  description: 'X-Y轴标签体系，精准浏览行业坐标，发现塑料回收产业链全景企业资源',
}

// ── Mock fallback data (shown when DB has no companies yet) ───────────────────
const MOCK_COMPANIES = [
  {
    id: 'c1', name: '蓝星再生科技', slug: 'lanxing-recycling', logo: null,
    description: '专注PP/PE机械回收，年处理能力5万吨，服务华东包装材料客户群',
    entityType: 'equipment', appDomain: 'packaging',
    capacity: 50000, recycleRate: 91.5, province: '浙江', city: '宁波',
    isVerified: true, isPremium: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2', name: '绿循新材料集团', slug: 'lv-xun-materials', logo: null,
    description: '聚焦汽车工程塑料闭环回收，独创化学溶解提纯工艺，回收率行业领先',
    entityType: 'process', appDomain: 'automotive',
    capacity: 120000, recycleRate: 94.2, province: '广东', city: '深圳',
    isVerified: true, isPremium: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'c3', name: '晶聚高分子技术', slug: 'jingjv-polymer', logo: null,
    description: '电子消费品级PCR塑料专属改性助剂研发，助力下游品牌实现再生料替代',
    entityType: 'additive', appDomain: 'electronics',
    capacity: 8000, recycleRate: 88.0, province: '江苏', city: '苏州',
    isVerified: false, isPremium: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'c4', name: '海岸守护装备', slug: 'coast-guard-equip', logo: null,
    description: '海洋塑料分选破碎一体化成套装备研发商，产品出口东南亚与欧洲',
    entityType: 'equipment', appDomain: 'agriculture',
    capacity: 30000, recycleRate: 85.5, province: '山东', city: '青岛',
    isVerified: true, isPremium: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'c5', name: '康健医塑循环', slug: 'kangkian-medical', logo: null,
    description: '医疗废弃塑料合规处置及再生利用，持有国家医疗废物处置许可证',
    entityType: 'process', appDomain: 'medical',
    capacity: 15000, recycleRate: 96.8, province: '北京', city: '北京',
    isVerified: true, isPremium: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'c6', name: '优策精密模具', slug: 'youce-mold', logo: null,
    description: '再生料注塑模具精密设计，降低加工容差补偿成本，合作品牌客户300+',
    entityType: 'mold', appDomain: 'packaging',
    capacity: null, recycleRate: null, province: '浙江', city: '台州',
    isVerified: false, isPremium: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'c7', name: '循建新型建材', slug: 'xunjian-construction', logo: null,
    description: '将回收PP/PE转化为建筑模板与管材，与头部建筑集团深度合作',
    entityType: 'material', appDomain: 'construction',
    capacity: 75000, recycleRate: 89.3, province: '湖北', city: '武汉',
    isVerified: true, isPremium: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'c8', name: '太空聚合工艺', slug: 'taikong-process', logo: null,
    description: '创新酶解解聚技术路线，打通PET化学回收瓶颈，已完成B轮融资',
    entityType: 'process', appDomain: 'packaging',
    capacity: 20000, recycleRate: 97.1, province: '上海', city: '上海',
    isVerified: true, isPremium: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
]

export type CompanyItem = {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  entityType: string
  appDomain: string
  capacity: number | null
  recycleRate: number | null
  province: string | null
  city: string | null
  isVerified: boolean
  isPremium: boolean
  createdAt: string
  updatedAt: string
}

export default async function ExplorePage() {
  let companies: CompanyItem[] = []

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (prisma as any).company.findMany({
      orderBy: [{ isPremium: 'desc' }, { isVerified: 'desc' }, { createdAt: 'desc' }],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    companies = raw.map((c: any) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))
  } catch {
    // DB not yet seeded — use mock data
  }

  if (companies.length === 0) companies = MOCK_COMPANIES

  return <ExploreClient companies={companies} />
}
