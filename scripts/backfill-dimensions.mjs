/**
 * backfill-dimensions.mjs
 *
 * 将现有情报的 pillars / dimension 字段从旧 6-pillar 体系迁移到 8-dimension 体系。
 *
 * 用法：
 *   node scripts/backfill-dimensions.mjs
 *
 * 依赖 DATABASE_URL 环境变量（指向目标数据库）。
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── 旧 pillar → 新 dimension 映射 ──────────────────────────────────────────

const OLD_TO_NEW = {
  // 直接匹配（新旧键名一致）
  recycling:   'recycling',
  reuse:       'reuse',
  recycled:    'recycled',
  bio:         'bio',
  additives:   'additives',
  auxiliaries: 'auxiliaries',
  molds:       'molds',
  molding:     'molding',

  // 旧 6-pillar 键 → 新 8-dimension 键
  machinery:    'molding',     // 绿色机械 → 成型
  materials:    'recycled',    // 可持续材料 → 再生塑料
  carbonPolicy: 'recycling',   // 碳中和/政策 → 回收再生
}

// ── category 中文标签 → 新 dimension 补充映射（当 pillars 信息不足时使用）──

const CATEGORY_TO_DIM = {
  '物理回收':   'recycling',
  '化学回收':   'recycling',
  '生物基材料': 'bio',
  '政策法规':   'recycling',   // 政策类通常涉及回收再生法规
  '政策':       'recycling',
  'market':     'recycled',    // 市场类通常涉及再生塑料供需
  'tech':       'recycling',   // 技术类通常涉及回收技术
  'global':     'recycling',
  'enterprise': 'recycling',
  'policy':     'recycling',
}

const ALL_DIMENSIONS = ['molds', 'molding', 'recycled', 'bio', 'additives', 'auxiliaries', 'recycling', 'reuse']

/** 映射单个旧 pillar 值 */
function mapPillar(old) {
  const trimmed = (old ?? '').trim().toLowerCase()
  if (!trimmed) return null
  return OLD_TO_NEW[trimmed] ?? OLD_TO_NEW[trimmed] ?? null
}

/** 从 category 推断一个维度作为兜底 */
function inferFromCategory(category) {
  if (!category) return 'recycling'
  return CATEGORY_TO_DIM[category] ?? 'recycling'
}

async function main() {
  console.log('[backfill] Fetching all intelligence records...')

  const items = await prisma.intelligence.findMany({
    select: {
      id: true,
      pillars: true,
      dimension: true,
      category: true,
      title: true,
    },
  })

  console.log(`[backfill] Found ${items.length} records`)

  let updated = 0
  let skipped = 0

  for (const item of items) {
    const oldPillars = (item.pillars ?? '').split(',').map(s => s.trim()).filter(Boolean)
    const oldDim = item.dimension ?? ''

    // 1. 映射所有旧 pillar 值
    const newDims = []
    for (const p of oldPillars) {
      const mapped = mapPillar(p)
      if (mapped && !newDims.includes(mapped)) {
        newDims.push(mapped)
      }
    }

    // 2. 如果映射后为空，从 category 推断
    if (newDims.length === 0) {
      newDims.push(inferFromCategory(item.category))
    }

    // 3. 确保至少有一个维度
    if (newDims.length === 0) {
      newDims.push('recycling')
    }

    // 4. 限制最多 2 个
    const finalDims = newDims.slice(0, 2)
    const newPillars = finalDims.join(',')
    const newDim = finalDims[0]

    // 5. 检查是否需要更新
    const pillarsChanged = item.pillars !== newPillars
    const dimChanged = item.dimension !== newDim

    if (!pillarsChanged && !dimChanged) {
      skipped++
      continue
    }

    // 6. 更新数据库
    const updateData = {}
    if (pillarsChanged) updateData.pillars = newPillars
    if (dimChanged) updateData.dimension = newDim

    await prisma.intelligence.update({
      where: { id: item.id },
      data: updateData,
    })

    updated++
    if (updated % 50 === 0 || updated === 1) {
      console.log(`[backfill]   ${updated}/${items.length} — "${item.title.slice(0, 50)}..." — ${item.pillars} → ${newPillars}`)
    }
  }

  console.log(`\n[backfill] Done. Updated: ${updated}, Skipped (already correct): ${skipped}, Total: ${items.length}`)

  // ── 输出统计 ──
  const stats = {}
  for (const dim of ALL_DIMENSIONS) {
    const count = await prisma.intelligence.count({
      where: {
        OR: [
          { pillars: { contains: dim } },
          { dimension: dim },
        ],
      },
    })
    stats[dim] = count
  }
  console.log('\n[backfill] Dimension coverage after migration:')
  for (const [dim, count] of Object.entries(stats)) {
    const bar = '█'.repeat(Math.round(count / items.length * 40))
    console.log(`  ${dim.padEnd(12)} ${String(count).padStart(4)} ${bar}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
