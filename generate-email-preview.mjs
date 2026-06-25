/**
 * 生成测试邮件 HTML 并保存到文件供预览
 */
const { writeFileSync } = require('fs')

async function main() {
  console.log('=== 生成测试邮件 HTML ===\n')

  // 动态导入 prisma（Next.js 运行时）
  const { prisma } = await import('@prisma/client')
  const client = new PrismaClient()

  const { renderDailyDigestEmail } = await import('./src/lib/emails/render-digest.js')

  const items = await client.intelligence.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      titleZh: true,
      summary: true,
      summaryZh: true,
      sourceUrl: true,
      source: true,
      publishedAt: true,
      importance: true,
    },
  })

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

  const outputPath = './test-email-preview.html'
  writeFileSync(outputPath, html, 'utf-8')
  console.log(`✅ HTML 已保存到 ${outputPath}`)
  console.log(`   文件大小: ${html.length} 字符`)

  await client.$disconnect()
}

main().catch(console.error)