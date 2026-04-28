/**
 * POST /api/subscribe — 订阅接口
 * 允许用户通过 POST 提交标签选择（维度/兴趣标签）
 *
 * GET /api/subscribe — 查询用户的所有订阅
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// ── 类型定义 ──────────────────────────────────────────────────────────────────

type Channel   = 'email' | 'wechat' | 'feishu' | 'webhook'
type Frequency = 'realtime' | 'daily' | 'weekly'

interface SubscribeRequest {
  email?:      string
  phone?:      string
  userId?:     string
  channel?:    Channel
  interests:   string[]   // 订阅的维度/标签数组，如 ["molds", "recycling"]
  frequency?:  Frequency
  webhookUrl?: string
}

// ── 验证 Schema ────────────────────────────────────────────────────────────────

const SubscribeSchema = z.object({
  email:      z.string().email().optional(),
  phone:      z.string().optional(),
  userId:     z.string().optional(),
  channel:    z.enum(['email', 'wechat', 'feishu', 'webhook']).default('email'),
  interests:  z.array(z.string()).min(1).max(20),
  frequency:  z.enum(['realtime', 'daily', 'weekly']).default('daily'),
  webhookUrl: z.string().url().optional().refine(
    (val) => !val || val.startsWith('https://'),
    { message: 'webhookUrl must use HTTPS' },
  ),
}).refine(
  (data) => data.email || data.phone || data.userId,
  { message: 'Must provide at least one of: email, phone, userId' },
)

const DIMENSION_VALUES = [
  'molds', 'molding', 'materials', 'additives',
  'auxiliaries', 'recycling', 'reuse',
] as const

// ── POST: 创建或更新订阅 ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SubscribeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 422 },
      )
    }

    const { email, phone, userId, channel, interests, frequency, webhookUrl } = parsed.data

    // 校验 interests 包含有效的维度或标签
    const validInterests = interests.filter(
      (i) => typeof i === 'string' && i.length > 0 && i.length <= 50,
    )
    if (validInterests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'interests cannot be empty' },
        { status: 422 },
      )
    }

    // 查找已存在的同渠道订阅（去重）
    const existingConditions: Parameters<typeof prisma.subscription.findMany>[0]['where'] = {
      channel,
    }

    if (email)  Object.assign(existingConditions, { email })
    if (phone)  Object.assign(existingConditions, { phone })
    if (userId) Object.assign(existingConditions, { userId })

    const existing = await prisma.subscription.findFirst({ where: existingConditions })

    if (existing) {
      // 更新已有订阅
      const updated = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          interests:  validInterests,
          frequency:  frequency ?? 'daily',
          webhookUrl: webhookUrl ?? null,
          isActive:   true,
          updatedAt:  new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        subscription: sanitized(updated),
        updated: true,
      })
    }

    // 创建新订阅
    const subscription = await prisma.subscription.create({
      data: {
        email:      email ?? null,
        phone:      phone ?? null,
        userId:     userId ?? null,
        channel:    channel ?? 'email',
        interests:  validInterests,
        frequency:  frequency ?? 'daily',
        webhookUrl: webhookUrl ?? null,
        isActive:   true,
      },
    })

    return NextResponse.json(
      { success: true, subscription: sanitized(subscription), created: true },
      { status: 201 },
    )

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[/api/subscribe POST]', message)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET: 查询订阅列表 ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const userId  = searchParams.get('userId')
    const email   = searchParams.get('email')
    const channel = searchParams.get('channel')

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email query parameter is required' },
        { status: 400 },
      )
    }

    const where: Parameters<typeof prisma.subscription.findMany>[0]['where'] = { isActive: true }
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE: 取消订阅 ──────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    await prisma.subscription.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })

  } catch (e: unknown) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── 工具函数 ──────────────────────────────────────────────────────────────────

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
    // 不暴露 webhookUrl 的完整内容
    hasWebhook: !!sub.webhookUrl,
  }
}
