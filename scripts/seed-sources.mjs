/**
 * Upsert all SITE_CONFIGS entries into the CrawlSource table.
 * Run once before the first cron tick, or after adding new sources.
 * Usage: node scripts/seed-sources.mjs
 */
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

// Mirror of src/lib/intelligence/sources.ts (plain objects, no TS)
const SITE_CONFIGS = [
  // P0
  { name: 'plasticstoday',      displayName: 'PlasticsToday',                    baseUrl: 'https://www.plasticstoday.com',          lang: 'en', priority: 'p0', contentType: 'news' },
  { name: 'packaging-dive',     displayName: 'Packaging Dive',                   baseUrl: 'https://www.packagingdive.com',           lang: 'en', priority: 'p0', contentType: 'news' },
  { name: 'resource-recycling', displayName: 'Resource Recycling',               baseUrl: 'https://www.resource-recycling.com',      lang: 'en', priority: 'p0', contentType: 'news' },
  // P1
  { name: 'sustainable-plastics', displayName: 'Sustainable Plastics',           baseUrl: 'https://www.sustainableplastics.com',     lang: 'en', priority: 'p1', contentType: 'news' },
  { name: 'apr',                displayName: 'APR',                              baseUrl: 'https://www.plasticsrecycling.org',        lang: 'en', priority: 'p1', contentType: 'standard' },
  { name: 'pre',                displayName: 'Plastics Recyclers Europe',        baseUrl: 'https://www.plasticsrecyclers.eu',         lang: 'en', priority: 'p1', contentType: 'news' },
  { name: 'packaging-europe',   displayName: 'Packaging Europe',                 baseUrl: 'https://www.packagingeurope.com',          lang: 'en', priority: 'p1', contentType: 'news' },
  { name: 'circular-online',    displayName: 'Circular Online',                  baseUrl: 'https://www.circularonline.co.uk',         lang: 'en', priority: 'p1', contentType: 'news' },
  // P2
  { name: 'recycling-today',    displayName: 'Recycling Today',                  baseUrl: 'https://www.recyclingtoday.com',          lang: 'en', priority: 'p2', contentType: 'news' },
  { name: 'waste-dive',         displayName: 'Waste Dive',                       baseUrl: 'https://www.wastedive.com',               lang: 'en', priority: 'p2', contentType: 'news' },
  { name: 'industrysourcing',   displayName: '荣格工业传媒',                      baseUrl: 'https://www.industrysourcing.cn',          lang: 'zh', priority: 'p2', contentType: 'news' },
  // P3
  { name: 'ellen-macarthur',    displayName: 'Ellen MacArthur Foundation',       baseUrl: 'https://www.ellenmacarthurfoundation.org', lang: 'en', priority: 'p3', contentType: 'standard' },
  { name: 'circular-economy-eu', displayName: 'European Circular Economy Platform', baseUrl: 'https://circulareconomy.europa.eu',   lang: 'en', priority: 'p3', contentType: 'policy' },
]

async function main() {
  console.log(`Seeding ${SITE_CONFIGS.length} sources...\n`)
  let created = 0, updated = 0

  for (const cfg of SITE_CONFIGS) {
    const existing = await prisma.crawlSource.findFirst({ where: { name: cfg.name } })

    if (existing) {
      await prisma.crawlSource.update({
        where: { id: existing.id },
        data: {
          url:         cfg.baseUrl,
          lang:        cfg.lang,
          priority:    cfg.priority,
          contentType: cfg.contentType,
          status:      'active',
        },
      })
      console.log(`  ↻ updated  ${cfg.name}`)
      updated++
    } else {
      await prisma.crawlSource.create({
        data: {
          name:        cfg.name,
          url:         cfg.baseUrl,
          lang:        cfg.lang,
          priority:    cfg.priority,
          contentType: cfg.contentType,
          status:      'active',
        },
      })
      console.log(`  + created  ${cfg.name}`)
      created++
    }
  }

  console.log(`\nDone — created: ${created}, updated: ${updated}`)
  await prisma.$disconnect()
}

main().catch(async e => {
  console.error('Fatal:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
