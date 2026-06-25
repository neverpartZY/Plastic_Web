/**
 * 情报摘要(summar)近似去重
 * 针对列表页展示的 summary 字段去重，超过60%相似即认为重复
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0

  const words1 = new Set(text1.replace(/[^\w一-龥]/g, ' ').split(/\s+/).filter(w => w.length > 1))
  const words2 = new Set(text2.replace(/[^\w一-龥]/g, ' ').split(/\s+/).filter(w => w.length > 1))

  if (words1.size === 0 || words2.size === 0) return 0

  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

async function findDuplicates() {
  const items = await prisma.intelligence.findMany({
    where: { summary: { startsWith: '欧盟' } },
    select: { id: true, title: true, titleZh: true, summary: true, source: true, publishedAt: true, urlHash: true },
    orderBy: { publishedAt: 'desc' }
  })

  const duplicateGroups = new Map()
  const processed = new Set()

  console.log(`检查 ${items.length} 篇欧盟相关摘要的相似度...\n`)

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (processed.has(item.id)) continue

    const group = [item.id]

    for (let j = i + 1; j < items.length; j++) {
      const other = items[j]
      if (processed.has(other.id)) continue

      const similarity = calculateSimilarity(item.summary || '', other.summary || '')

      if (similarity > 0.6) {
        group.push(other.id)
        processed.add(other.id)
        const title1 = (item.titleZh || item.title).substring(0, 40)
        const title2 = (other.titleZh || other.title).substring(0, 40)
        console.log(`  60%相似: "${title1}" ↔ "${title2}"`)
        console.log(`    来源: ${item.source} ↔ ${other.source}`)
      }
    }

    if (group.length > 1) {
      duplicateGroups.set(group[0], group.slice(1))
    }

    processed.add(item.id)
  }

  return duplicateGroups
}

async function main() {
  console.log('=== 情报摘要近似去重 ===\n')

  const duplicateGroups = await findDuplicates()

  console.log(`\n\n=== 发现 ${duplicateGroups.size} 组重复摘要 ===`)

  if (duplicateGroups.size === 0) {
    console.log('没有发现摘要重复')
    return
  }

  let totalDeleted = 0

  for (const [keepId, duplicateIds] of duplicateGroups) {
    console.log(`\n保留: ${keepId}`)
    console.log(`删除: ${duplicateIds.join(', ')}`)

    const result = await prisma.intelligence.deleteMany({
      where: { id: { in: duplicateIds } }
    })

    totalDeleted += result.count
  }

  console.log(`\n=== 去重完成 ===`)
  console.log(`删除了 ${totalDeleted} 篇文章`)
}

main()
  .finally(() => prisma.$disconnect())
  .catch(console.error)
