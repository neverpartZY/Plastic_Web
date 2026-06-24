/**
 * POST /api/refine/process
 * 异步精炼处理端点 — 从队列中取出一个 pending 项并执行 Pipeline
 *
 * 适合 Vercel Cron 或外部 Worker 定期调用。
 * 每次调用处理一个待处理项（可传 ?batch=N 一次处理多个）。
 *
 * 认证：
 *   - Vercel Cron: 自动附带 x-vercel-cron-secret header
 *   - 手动触发: Authorization: Bearer <CRON_SECRET>
 *
 * 查询参数：
 *   ?batch=N   一次处理 N 个（默认 1，最大 5）
 *
 * 响应:
 *   200 { processed: number, results: [...], summary }
 *   401 { error }
 *   404 { message: "No pending items" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/prisma'
import { runRefinePipeline, pipelineToDbData } from '@/lib/intelligence/pipeline'

export const maxDuration = 300 // 异步处理允许更长时间

// ── 认证 ──────────────────────────────────────────────────────────────────────

function authorized(req: NextRequest): boolean {
  // 开发环境宽松认证
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  // Vercel Cron 自动注入 x-vercel-cron-secret
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return true // 未配置则跳过认证
  }
  // 检查 x-vercel-cron-secret（Vercel 自动注入）
  const vercelCron = req.headers.get('x-vercel-cron-secret')
  if (vercelCron === cronSecret) {
    return true
  }
  // 手动调试：Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${cronSecret}`) {
    return true
  }
  return false
}

// ── 处理单个待处理项 ──────────────────────────────────────────────────────────

async function processOne() {
  // 查找最早的 pending 项
  const item = await prisma.intelligence.findFirst({
    where:  { refineStatus: 'pending' },
    orderBy: { createdAt: 'asc' },
  })

  if (!item) return null

  // 标记为 processing
  await prisma.intelligence.update({
    where: { id: item.id },
    data:  { refineStatus: 'processing', refineError: null },
  })

  const startedAt = Date.now()

  try {
    // 运行 Pipeline
    const lang = (item.lang === 'zh' || item.lang === 'en') ? item.lang : 'zh'
    // content 字段存了原文（异步模式下），summary 存了预览
    const rawContent = item.content || item.summary || item.title
    const pipeline = await runRefinePipeline({
      title:   item.title,
      content: rawContent,
      lang,
    })

    // 映射并更新
    const dbData = pipelineToDbData(pipeline, {
      title:       item.title,
      source:      item.source ?? 'Unknown',
      url:         item.sourceUrl ?? '',
      lang,
      publishedAt: item.publishedAt,
    })

    await prisma.intelligence.update({
      where: { id: item.id },
      data:  {
        ...dbData,
        tokenUsage:   pipeline.tokenUsage.length > 0 ? (pipeline.tokenUsage as unknown as object) : undefined,
        refineStatus: 'completed',
        refineError:  null,
        updatedAt:    new Date(),
      },
    })

    // 版本记录
    await prisma.intelligenceVersion.create({
      data: {
        intelligenceId: item.id,
        version:        (item.version ?? 0) + 1,
        title:          dbData.title,
        summary:        dbData.summary,
        content:        '',
        dimension:      dbData.dimension,
        region:         dbData.region,
        importance:     dbData.importance,
        tags:           dbData.tags,
      },
    })

    const elapsed = Date.now() - startedAt
    console.log(`[refine/process] ${item.id} completed in ${elapsed}ms`)

    return {
      id:            item.id,
      title:         item.title,
      status:        'completed',
      elapsedMs:     elapsed,
      tokens:        pipeline.usageSummary,
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[refine/process] ${item.id} failed:`, message)

    await prisma.intelligence.update({
      where: { id: item.id },
      data:  { refineStatus: 'failed', refineError: message.slice(0, 1000) },
    })

    return {
      id:     item.id,
      title:  item.title,
      status: 'failed',
      error:  message,
    }
  }
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 批次大小
  const batchParam = req.nextUrl.searchParams.get('batch')
  const batchSize  = Math.min(5, Math.max(1, parseInt(batchParam || '1', 10) || 1))

  const results: Awaited<ReturnType<typeof processOne>>[] = []

  for (let i = 0; i < batchSize; i++) {
    const result = await processOne()
    if (!result) break
    results.push(result)
  }

  if (results.length === 0) {
    return NextResponse.json({ message: 'No pending items to process' }, { status: 404 })
  }

  const succeeded = results.filter(r => r?.status === 'completed').length
  const failed    = results.filter(r => r?.status === 'failed').length
  const totalTokens = results
    .filter(r => r?.status === 'completed')
    .reduce((sum: number, r) => {
      const t = (r as { tokens: Record<string, { totalTokens: number }> }).tokens
      return sum + Object.values(t ?? {}).reduce((s, v) => s + (v.totalTokens || 0), 0)
    }, 0)

  return NextResponse.json({
    processed: results.length,
    succeeded,
    failed,
    totalTokens,
    results: results.map(r => ({
      id:         r?.id,
      title:      r?.title,
      status:     r?.status,
      elapsedMs:  r?.status === 'completed' ? (r as { elapsedMs: number }).elapsedMs : undefined,
      error:      r?.status === 'failed'    ? (r as { error: string }).error        : undefined,
    })),
  })
}

// GET — Vercel Cron 触发（也支持手动 GET 调试）
// 有 pending 项 → 处理并返回结果；无 pending 项 → 返回队列统计
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const batchParam = req.nextUrl.searchParams.get('batch')
  const batchSize  = Math.min(5, Math.max(1, parseInt(batchParam || '1', 10) || 1))

  // 先检查是否有待处理项
  const pendingCount = await prisma.intelligence.count({ where: { refineStatus: 'pending' } })

  if (pendingCount === 0) {
    // 返回队列统计
    const processing = await prisma.intelligence.count({ where: { refineStatus: 'processing' } })
    const failed     = await prisma.intelligence.count({ where: { refineStatus: 'failed' } })
    const completed  = await prisma.intelligence.count({ where: { refineStatus: 'completed' } })

    return NextResponse.json({
      queue: {
        pending:    0,
        processing,
        failed,
        completed,
      },
    })
  }

  // 有 pending 项 → 处理
  const results: Awaited<ReturnType<typeof processOne>>[] = []

  for (let i = 0; i < batchSize; i++) {
    const result = await processOne()
    if (!result) break
    results.push(result)
  }

  const succeeded    = results.filter(r => r?.status === 'completed').length
  const failed       = results.filter(r => r?.status === 'failed').length
  const totalTokens  = results
    .filter(r => r?.status === 'completed')
    .reduce((sum: number, r) => {
      const t = (r as { tokens: Record<string, { totalTokens: number }> }).tokens
      return sum + Object.values(t ?? {}).reduce((s, v) => s + (v.totalTokens || 0), 0)
    }, 0)

  return NextResponse.json({
    processed: results.length,
    succeeded,
    failed,
    totalTokens,
    remaining: pendingCount - results.length,
    results: results.map(r => ({
      id:         r?.id,
      title:      r?.title,
      status:     r?.status,
      elapsedMs:  r?.status === 'completed' ? (r as { elapsedMs: number }).elapsedMs : undefined,
      error:      r?.status === 'failed'    ? (r as { error: string }).error        : undefined,
    })),
  })
}
