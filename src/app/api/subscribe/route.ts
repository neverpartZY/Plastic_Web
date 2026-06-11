/**
 * POST /api/subscribe — 订阅接口
 * 极简化线索收集：邮箱（唯一ID）+ 公司信息 + 手机（选填）
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// ── 类型定义 ──────────────────────────────────────────────────────────────────

type Channel   = 'email' | 'webhook'
type Frequency = 'realtime' | 'daily' | 'weekly'

// ── 验证 Schema ────────────────────────────────────────────────────────────

const SubscribeSchema = z.object({
  email:       z.string().email('请输入有效的公司邮箱'),
  phone:       z.string().max(30).optional(),
  userId:      z.string().optional(),
  channel:     z.enum(['email', 'webhook']).default('email'),
  interests:   z.array(z.string()).min(1).max(20, '请至少选择一个维度'),
  frequency:   z.enum(['realtime', 'daily', 'weekly']).default('daily'),
  webhookUrl:  z.string().url().optional().refine(
    (val) => !val || val.startsWith('https://'),
    { message: 'webhookUrl 必须使用 HTTPS' },
  ),
  // Lead 字段
  companyName: z.string().max(200).optional(),
  jobTitle:    z.string().max(100).optional(),
  sourcePage:  z.string().max(200).optional(),
  lang:        z.enum(['zh', 'en']).optional(),
}).refine(
  (data) => data.email || data.phone || data.userId,
  { message: '请提供邮箱、手机号或用户ID' },
)

const DIMENSION_VALUES = [
  'molds', 'molding', 'recycled', 'bio', 'additives',
  'auxiliaries', 'recycling', 'reuse',
] as const

// ── POST: 创建或更新订阅 ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SubscribeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: '校验失败',
          details: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 422 },
      )
    }

    const {
      email, phone, userId, channel, interests, frequency, webhookUrl,
      companyName, jobTitle, sourcePage, lang,
    } = parsed.data

    // 过滤无效 interests
    const validInterests = interests.filter(
      (i) => typeof i === 'string' && i.length > 0 && i.length <= 50,
    )
    if (validInterests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'interests 不能为空' },
        { status: 422 },
      )
    }

    // ── Lead: 邮箱存在则更新，否则创建 ───────────────────────────────────
    if (email) {
      const existing = await prisma.lead.findUnique({ where: { email } })
      if (existing) {
        await prisma.lead.update({
          where: { email },
          data: {
            phone:        phone ?? existing.phone,
            companyName:  companyName ?? existing.companyName,
            jobTitle:     jobTitle ?? existing.jobTitle,
            sourcePage:   sourcePage ?? existing.sourcePage,
            interestedPillars: validInterests,
            channel:      channel ?? 'email',
            frequency:    frequency ?? 'daily',
            isActive:     true,
            lang:         lang ?? existing.lang,
          },
        })
      } else {
        await prisma.lead.create({
          data: {
            email:           email,
            phone:           phone ?? null,
            companyName:     companyName ?? null,
            jobTitle:        jobTitle ?? null,
            interestedPillars: validInterests,
            sourcePage:     sourcePage ?? null,
            channel:        channel ?? 'email',
            frequency:      frequency ?? 'daily',
            isActive:       true,
            lang:           lang ?? 'zh',
          },
        })
      }
    }

    // ── 订阅记录（兼容旧逻辑）────────────────────────────────────────────
    const existingConditions: Prisma.SubscriptionWhereInput = { channel: channel ?? 'email' }
    if (email)  existingConditions.email = email
    if (phone)  existingConditions.phone = phone
    if (userId) existingConditions.userId = userId

    const existing = await prisma.subscription.findFirst({ where: existingConditions })

    if (existing) {
      const updated = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          interests:  validInterests,
          frequency: frequency ?? 'daily',
          webhookUrl: webhookUrl ?? null,
          isActive:   true,
          lang:       lang ?? 'zh',
          updatedAt:  new Date(),
        },
      })
      return NextResponse.json({
        success: true,
        subscription: sanitized(updated),
        updated: true,
      })
    }

    const subscription = await prisma.subscription.create({
      data: {
        email:      email ?? null,
        phone:      phone ?? null,
        userId:     userId ?? null,
        channel:    channel ?? 'email',
        interests:  validInterests,
        frequency: frequency ?? 'daily',
        webhookUrl: webhookUrl ?? null,
        isActive:   true,
        lang:       lang ?? 'zh',
      },
    })

    return NextResponse.json(
      { success: true, subscription: sanitized(subscription), created: true },
      { status: 201 },
    )

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[/api/subscribe POST]', message)
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 })
  }
}

// ── GET: 查询订阅 ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const userId  = searchParams.get('userId')
    const email   = searchParams.get('email')
    const channel = searchParams.get('channel')

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId 或 email 查询参数必填' },
        { status: 400 },
      )
    }

    const where = { isActive: true } as Prisma.SubscriptionWhereInput
    if (userId) where.userId = userId
    if (email)  where.email = email
    if (channel) where.channel = channel

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pushLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            intelligenceId: true,
            status: true,
            createdAt: true,
            error: true,
          },
        },
      },
    })

    return NextResponse.json({
      subscriptions: subscriptions.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        lastSentAt: s.lastSentAt?.toISOString() ?? null,
        pushLogs: s.pushLogs.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
        })),
      })),
    })

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[/api/subscribe GET]', message)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// ── DELETE: 取消订阅 ────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id 必填' }, { status: 400 })

    await prisma.subscription.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// ── 工具函数 ────────────────────────────────────────────────────────────────

function sanitized(sub: {
  id: string
  email: string | null
  phone: string | null
  userId: string | null
  channel: string
  interests: string[]
  frequency: string
  webhookUrl: string | null
  lastSentAt: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id:        sub.id,
    email:     sub.email,
    phone:     sub.phone,
    userId:    sub.userId,
    channel:   sub.channel,
    interests: sub.interests,
    frequency: sub.frequency,
    isActive:  sub.isActive,
    lastSentAt: sub.lastSentAt?.toISOString() ?? null,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
    hasWebhook: !!sub.webhookUrl,
  }
}
