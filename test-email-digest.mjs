/**
 * 测试发送每日情报邮件到 zhouyi@replas.org.cn
 */
import 'dotenv/config'
import { prisma } from './src/lib/prisma.js'
import { sendIndustryEmail } from './src/lib/mail.js'
import { renderDailyDigestEmail } from './src/lib/emails/render-digest.js'

async function main() {
  console.log('=== 发送测试邮件到 zhouyi@replas.org.cn ===\n')

  // 取最新5条情报作为测试内容
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const items = await prisma.intelligence.findMany({
    where: {
      publishedAt: { gte: since },
      importance: { gte: 3 },
      summary: { not: '' },
    },
    orderBy: [{ importance: 'desc' }, { publishedAt: 'desc' }],
    take: 5,
  })

  if (items.length === 0) {
    console.log('没有找到符合条件的情报，使用最新5条')
    const fallback = await prisma.intelligence.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, titleZh: true, summary: true, summaryZh: true, sourceUrl: true, source: true, publishedAt: true, importance: true },
    })
    items.push(...fallback)
  }

  const emailItems = items.map(item => ({
    id: item.id,
    title: item.titleZh ?? item.title ?? '',
    summary: (item.summaryZh ?? item.summary ?? '').slice(0, 200),
    sourceUrl: item.sourceUrl ?? `https://sustainplastics.com/intelligence/${item.id}`,
    source: item.source,
    publishedAt: item.publishedAt.toISOString(),
  }))

  const email = 'zhouyi@replas.org.cn'
  const unsubscribeUrl = `https://sustainplastics.com/unsubscribe?email=${encodeURIComponent(email)}`

  const html = renderDailyDigestEmail({
    email,
    lang: 'zh',
    frequency: 'daily',
    interests: ['物理回收', '政策法规'],
    items: emailItems,
    unsubscribeUrl,
  })

  console.log(`邮件内容预览（前500字符）:\n${html.substring(0, 500)}\n`)

  try {
    const result = await sendIndustryEmail({
      to: email,
      subject: '【每日情报】塑料循环经济最新动态',
      html,
      lang: 'zh',
    })
    console.log(`✅ 发送成功! Message ID: ${result.id}`)
  } catch (err) {
    console.error('❌ 发送失败:', err)
  }

  await prisma.$disconnect()
}

main().catch(console.error)