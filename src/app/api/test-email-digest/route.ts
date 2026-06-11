export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { sendIndustryEmail } from '@/lib/mail'
import { renderDailyDigestEmail } from '@/lib/emails/render-digest'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get('to') || 'zhouyi@replas.org.cn'
  try {
    // Hardcoded sample items for testing the digest email template
    const items = [
      {
        id: 'sample-1',
        title: '国嘉基业情报平台正式上线：八大行业维度助力可持续发展',
        summary: '国嘉基业信息咨询有限公司正式推出智能情报平台，覆盖模具、成型、再生塑料、生物基材料、助剂、辅料、回收再生、重复使用八大行业维度，为企业提供精准、及时的塑料可持续产业情报服务。',
        source: '国嘉基业',
        sourceUrl: 'https://guojajiye.com/intelligence',
        publishedAt: new Date().toISOString(),
        importance: 5,
        pillar: 'recycling',
      },
      {
        id: 'sample-2',
        title: '欧盟PPWR生效倒计时：再生塑料企业迎合规大考',
        summary: '欧盟《包装和包装废弃物法规》（PPWR）关键条款正式生效，PET饮料瓶须含30%消费后再生料，违规企业面临年营业额4%罚款。',
        source: 'Plastics Recyclers Europe',
        sourceUrl: 'https://plasticsrecyclers.eu/ppwr',
        publishedAt: new Date().toISOString(),
        importance: 5,
        pillar: 'recycling',
      },
      {
        id: 'sample-3',
        title: '生物基塑料产能五年内将增长三倍',
        summary: '据全球生物基材料协会最新报告，2026-2030年间PLA、PHA等生物基塑料产能预计增长300%，主要驱动来自欧盟碳边境调节机制和品牌商可持续发展承诺。',
        source: 'Sustainable Plastics',
        sourceUrl: 'https://sustainableplastics.com/bio产能',
        publishedAt: new Date().toISOString(),
        importance: 4,
        pillar: 'bio',
      },
      {
        id: 'sample-4',
        title: '再生塑料PCR认证标准统一化进程加速',
        summary: '国际标准化组织（ISO）启动再生塑料含量认证标准制定工作，预计2027年发布首个国际统一PCR认证体系，解决目前各地区认证互认难题。',
        source: 'Chemical Watch',
        sourceUrl: 'https://chemicalwatch.com/pcr',
        publishedAt: new Date().toISOString(),
        importance: 4,
        pillar: 'recycled',
      },
    ]

    const html = renderDailyDigestEmail({
      email: 'zhouyi@replas.org.cn',
      lang: 'zh',
      frequency: 'daily',
      interests: ['recycling', 'recycled', 'bio', 'reuse'],
      items,
      unsubscribeUrl: 'https://greenplastic.ai/unsubscribe?email=zhouyi@replas.org.cn'
    })

    const result = await sendIndustryEmail({
      to,
      subject: '【塑料循环日报】recycling · recycled · bio · reuse 最新动态',
      html,
      lang: 'zh'
    })

    return NextResponse.json({ success: true, id: result.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
