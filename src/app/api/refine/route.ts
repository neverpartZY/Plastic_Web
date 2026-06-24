/**
 * POST /api/refine
 * AI 情报精炼接口 — Pipeline 模式
 *
 * 接收原始网页内容，通过精炼 Pipeline 加工为结构化情报。
 * 支持同步（默认）和异步（?mode=async）两种模式。
 *
 * Authorization: Bearer GP_Secret_2026_!#
 *
 * 同步模式 (默认, backward-compatible):
 *   POST /api/refine
 *   → 201/200 返回完整精炼报告
 *
 * 异步模式:
 *   POST /api/refine?mode=async
 *   → 202 快速返回，后台通过 /api/refine/process 处理
 *
 * 请求体:
 *   title        string            原始标题
 *   date         string?           发布日期 ISO8601
 *   source       string            信息源名称
 *   url          string            原始 URL（去重 key）
 *   full_content string (≥100)    抓取的正文（处理后不入库）
 *
 * 响应:
 *   201 { success, id, report }              新建（同步）
 *   200 { success, id, report, updated }     更新（同步）
 *   202 { success, id, status: "pending" }   已接收入队（异步）
 *   401 { error }
 *   422 { error, detail? }
 *   500 { error }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash }                from 'crypto'
import { z }                         from 'zod'
import { prisma }                    from '@/lib/prisma'
import { runRefinePipeline, pipelineToDbData, type PipelineResult } from '@/lib/intelligence/pipeline'

export const maxDuration = 60

// ── 认证 ──────────────────────────────────────────────────────────────────────

const REFINE_SECRET = process.env.REFINE_SECRET ?? 'GP_Secret_2026_!#'

function authorized(req: NextRequest) {
  return req.headers.get('authorization') === `Bearer ${REFINE_SECRET}`
}

// ── 请求体 Schema ─────────────────────────────────────────────────────────────

const BodySchema = z.object({
  title:        z.string().min(1).max(500),
  date:         z.string().optional(),
  source:       z.string().min(1).max(200),
  url:          z.string().url(),
  full_content: z.string().min(100).max(200_000),
})

// ── 工具 ──────────────────────────────────────────────────────────────────────

function makeHash(url: string) {
  return createHash('sha256').update(url.trim().toLowerCase()).digest('hex').slice(0, 32)
}

function detectLang(text: string): 'zh' | 'en' {
  return (text.match(/[一-鿿]/g) ?? []).length > 15 ? 'zh' : 'en'
}

function parseDate(raw?: string): Date {
  if (!raw) return new Date()
  const d = new Date(raw)
  return isNaN(d.getTime()) ? new Date() : d
}

// ── 执行 Pipeline 并写入数据库 ────────────────────────────────────────────────

async function executeAndSave(
  title: string,
  content: string,
  source: string,
  url: string,
  lang: 'zh' | 'en',
  publishedAt: Date,
  existingId: string | null,
): Promise<{ id: string; report: PipelineResult['report']; updated: boolean; pipeline: PipelineResult }> {
  // 1. 运行 Pipeline
  const pipeline = await runRefinePipeline({ title, content, lang })

  // 2. 映射为数据库字段
  const dbData = pipelineToDbData(pipeline, { title, source, url, lang, publishedAt })

  // 3. 附加 token 用量到 dbData
  const dbDataWithTokens = {
    ...dbData,
    tokenUsage:   pipeline.tokenUsage.length > 0 ? (pipeline.tokenUsage as unknown as object) : undefined,
    refineStatus: 'completed',
    refineError:  null,
  }

  const hash = makeHash(url)

  // 4. Upsert
  if (existingId) {
    await prisma.intelligence.update({
      where: { urlHash: hash },
      data:  { ...dbDataWithTokens, updatedAt: new Date() },
    })
    return {
      id: existingId,
      report: pipeline.report,
      updated: true,
      pipeline,
    }
  }

  const created = await prisma.intelligence.create({
    data: { ...dbDataWithTokens, urlHash: hash, version: 1 },
  })

  // 版本记录
  await prisma.intelligenceVersion.create({
    data: {
      intelligenceId: created.id,
      version:        1,
      title:          created.title,
      summary:        created.summary,
      content:        '',
      dimension:      created.dimension,
      region:         created.region,
      importance:     created.importance,
      tags:           created.tags,
    },
  })

  return {
    id: created.id,
    report: pipeline.report,
    updated: false,
    pipeline,
  }
}

// ── 构建 JSON 响应 ────────────────────────────────────────────────────────────

function buildResponse(result: {
  id: string
  report: PipelineResult['report']
  updated: boolean
  pipeline: PipelineResult
}) {
  const { id, report, updated, pipeline } = result

  const body: Record<string, unknown> = {
    success: true,
    id,
    report: {
      titleZh:        report.titleZh,
      titleEn:        report.titleEn,
      refinedSummary: report.refinedSummary,
      keyInsights:    report.keyInsights,
      dimensions:     report.dimensions,
      score:          report.score,
      tags:           report.tags,
      originalUrl:    null as unknown, // will be overridden
    },
  }

  // 附加 token 用量信息
  if (pipeline.tokenUsage.length > 0) {
    body.usage = pipeline.usageSummary
  }

  if (updated) {
    body.updated = true
  }

  return body
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. 认证
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. 解析 & 校验
  let rawBody: unknown
  try { rawBody = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const validated = BodySchema.safeParse(rawBody)
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Validation failed', detail: validated.error.flatten() },
      { status: 422 },
    )
  }

  const { title, date, source, url, full_content } = validated.data
  const lang        = detectLang(title + ' ' + full_content.slice(0, 500))
  const publishedAt = parseDate(date)
  const hash        = makeHash(url)
  const isAsync     = req.nextUrl.searchParams.get('mode') === 'async'

  // ── 异步模式：快速入库，返回 202 ────────────────────────────────────────────
  if (isAsync) {
    try {
      const existing = await prisma.intelligence.findUnique({
        where:  { urlHash: hash },
        select: { id: true },
      })

      if (existing) {
        // 已有记录 → 标记为 pending 等待重新处理
        await prisma.intelligence.update({
          where: { urlHash: hash },
          data:  {
            title,
            summary:      full_content.slice(0, 400),
            content:      full_content.slice(0, 10_000),  // 暂存原文供异步处理
            source,
            sourceUrl:   url,
            lang,
            publishedAt,
            refineStatus: 'pending',
            refineError:  null,
            updatedAt:    new Date(),
          },
        })
        return NextResponse.json({
          success: true,
          id:      existing.id,
          status:  'pending',
          message: 'Re-queued for async processing',
        }, { status: 202 })
      }

      // 新记录 → 创建占位，等待处理
      const created = await prisma.intelligence.create({
        data: {
          title,
          summary:      full_content.slice(0, 400),     // 摘要预览
          content:      full_content.slice(0, 10_000),   // 暂存原文供异步 Pipeline 处理
          source,
          sourceUrl:    url,
          lang,
          publishedAt,
          urlHash:      hash,
          version:      1,
          category:     'global',
          importance:   3,
          refineStatus: 'pending',
          translateStatus: 'pending',
        },
      })

      return NextResponse.json({
        success: true,
        id:      created.id,
        status:  'pending',
        message: 'Queued for async processing',
      }, { status: 202 })

    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      return NextResponse.json({ error: 'Database write failed', detail: message }, { status: 500 })
    }
  }

  // ── 同步模式：运行 Pipeline → 存储 → 返回结果 ──────────────────────────────
  try {
    // 查重
    const existing = await prisma.intelligence.findUnique({
      where:  { urlHash: hash },
      select: { id: true },
    })

    const result = await executeAndSave(
      title,
      full_content,
      source,
      url,
      lang,
      publishedAt,
      existing?.id ?? null,
    )

    const body = buildResponse(result)
    // 注入 originalUrl 供调用方对照
    ;(body.report as Record<string, unknown>).originalUrl = url

    return NextResponse.json(body, { status: result.updated ? 200 : 201 })

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)

    // 尝试标记失败（如果已有记录）
    try {
      const existing = await prisma.intelligence.findUnique({ where: { urlHash: hash }, select: { id: true } })
      if (existing) {
        await prisma.intelligence.update({
          where: { id: existing.id },
          data:  { refineStatus: 'failed', refineError: message },
        })
      }
    } catch { /* 标记失败不阻塞响应 */ }

    return NextResponse.json(
      { error: 'Pipeline execution failed', detail: message },
      { status: 500 },
    )
  }
}
