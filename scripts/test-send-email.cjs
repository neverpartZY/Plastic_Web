/**
 * 测试发送每日情报邮件到 zhouyi@replas.org.cn
 */
require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { sendIndustryEmail } = require('../src/lib/mail')
const { renderDailyDigestEmail } = require('../src/lib/emails/render-digest')

async function main() {
  console.log('=== 发送测试邮件到 zhouyi@replas.org.cn ===\n')

  const prisma = new PrismaClient()

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

  console.log(`找到 ${items.length} 条情报`)

  if (items.length === 0) {
    const fallback = await prisma.intelligence.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        id: true, title: true, titleZh: true,
        summary: true, summaryZh: true,
        sourceUrl: true, source: true, publishedAt: true,
      },
    })
    for (const f of fallback) items.push(f)
  }

  const emailItems = items.map(item => ({
    id:          item.id,
    title:       item.titleZh || item.title || '',
    summary:     ((item.summaryZh || item.summary) || '').slice(0, 200),
    sourceUrl:   item.sourceUrl || `https://sustainplastics.com/intelligence/${item.id}`,
    source:      item.source || null,
    publishedAt: item.publishedAt.toISOString(),
  }))

  const to = 'zhouyi@replas.org.cn'
  const unsubscribeUrl = `https://sustainplastics.com/unsubscribe?email=${encodeURIComponent(to)}`

  const html = renderDailyDigestEmail({
    email:    to,
    lang:     'zh',
    frequency: 'daily',
    interests: ['物理回收', '政策法规'],
    items:    emailItems,
    unsubscribeUrl,
  })

  const subject = '【每日情报】塑料循环经济最新动态'
  console.log(`Subject: ${subject}`)
  console.log(`To: ${to}`)
  console.log(`Items: ${emailItems.length} 条\n`)

  try {
    const result = await sendIndustryEmail({ to, subject, html, lang: 'zh' })
    console.log(`✅ 发送成功! Message ID: ${result.id}`)
  } catch (err) {
    console.error('❌ 发送失败:', err)
  }

  await prisma.$disconnect()
}

main().catch(console.error)