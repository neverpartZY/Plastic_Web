/**
 * 修复情报数据：
 * 1. 时间问题：修复错误的 publishedAt
 * 2. 双语问题：补全缺失的 summaryZh/summaryEn
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 脏数据特征：使用了法规生效日或未来日期
const DIRTY_DATES = [
  '2030-01-01T00:00:00.000Z',  // PPWR 2030年目标
  '2028-01-01T00:00:00.000Z',  // PPWR 2028年节点
  '2026-08-12T00:00:00.000Z',  // PPWR 生效日（被误用为发布日期）
];

async function fixDates() {
  console.log('=== 修复时间问题 ===');

  // 找出所有使用脏时间的文章
  const dirtyItems = await prisma.intelligence.findMany({
    where: {
      publishedAt: { in: DIRTY_DATES.map(d => new Date(d)) }
    },
    select: { id: true, title: true, publishedAt: true, createdAt: true }
  });

  console.log(`发现 ${dirtyItems.length} 篇使用错误时间的文章`);

  // 将错误时间改为 createdAt（爬取时间）或者当前时间
  for (const item of dirtyItems) {
    const correctDate = item.createdAt > new Date('2024-01-01') ? item.createdAt : new Date();

    await prisma.intelligence.update({
      where: { id: item.id },
      data: { publishedAt: correctDate }
    });
    console.log(`  修复: ${item.title.substring(0, 40)}...`);
    console.log(`    ${item.publishedAt} -> ${correctDate.toISOString()}`);
  }

  console.log(`完成修复 ${dirtyItems.length} 篇时间错误\n`);
}

async function fixSummaryTranslations() {
  console.log('=== 修复双语翻译问题 ===');

  // 修复 lang='zh' 且 summaryZh 为 null 的情况
  // 规则：summaryZh 应该等于 summary（因为原始语言就是中文）
  const needSummaryZh = await prisma.intelligence.findMany({
    where: {
      lang: 'zh',
      summaryZh: null
    },
    select: { id: true, title: true, summary: true }
  });

  console.log(`\n[1] 需要设置 summaryZh 的中文文章: ${needSummaryZh.length} 篇`);

  // 批量更新 summaryZh = summary
  for (const item of needSummaryZh) {
    await prisma.intelligence.update({
      where: { id: item.id },
      data: { summaryZh: item.summary }
    });
  }
  console.log(`  已修复 ${needSummaryZh.length} 篇`);

  // 统计需要翻译 summaryEn 的文章（切换英文时显示的关键字段）
  const needSummaryEn = await prisma.intelligence.findMany({
    where: {
      OR: [
        { lang: 'zh', summaryEn: null },
        { summaryEn: null }
      ]
    },
    select: { id: true, title: true, summary: true, lang: true }
  });

  console.log(`\n[2] 需要翻译 summaryEn 的文章: ${needSummaryEn.length} 篇`);
  console.log('  (翻译需要调用 LLM API，建议在 refine 路由中处理）');

  return needSummaryEn.map(i => i.id);
}

async function main() {
  console.log('开始修复情报数据问题...\n');

  await fixDates();
  const needTranslation = await fixSummaryTranslations();

  console.log('\n=== 修复完成 ===');
  console.log(`需要翻译的文章 ID（可在 refine 路由中处理）:`);
  console.log(needTranslation.slice(0, 10), '...');

  // 再次统计确认修复结果
  const stats = {
    total: await prisma.intelligence.count(),
    futureDates: await prisma.intelligence.count({
      where: { publishedAt: { gt: new Date() } }
    }),
    nullSummaryZh: await prisma.intelligence.count({ where: { summaryZh: null } }),
    nullSummaryEn: await prisma.intelligence.count({ where: { summaryEn: null } }),
  };

  console.log('\n=== 修复后统计 ===');
  console.log(`总文章数: ${stats.total}`);
  console.log(`未来日期文章: ${stats.futureDates}`);
  console.log(`summaryZh 为 null: ${stats.nullSummaryZh}`);
  console.log(`summaryEn 为 null: ${stats.nullSummaryEn}`);
}

main()
  .finally(() => prisma.$disconnect())
  .catch(console.error);
