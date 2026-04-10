import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { dashboardSchema } from '@/lib/validations'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dashboard = await prisma.dashboard.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { tags: { include: { tag: true } } },
  })

  if (!dashboard) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...dashboard,
    createdAt: dashboard.createdAt.toISOString(),
    updatedAt: dashboard.updatedAt.toISOString(),
    tags: dashboard.tags.map((t) => t.tag),
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = dashboardSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, tagIds, isDefault } = parsed.data

  if (isDefault) {
    await prisma.dashboard.updateMany({
      where: { userId: session.user.id, isDefault: true, id: { not: params.id } },
      data: { isDefault: false },
    })
  }

  await prisma.dashboardTag.deleteMany({ where: { dashboardId: params.id } })

  const dashboard = await prisma.dashboard.update({
    where: { id: params.id },
    data: {
      name,
      isDefault,
      tags: {
        create: tagIds.map((id) => ({ tag: { connect: { id } } })),
      },
    },
    include: { tags: { include: { tag: true } } },
  })

  return NextResponse.json({
    ...dashboard,
    createdAt: dashboard.createdAt.toISOString(),
    updatedAt: dashboard.updatedAt.toISOString(),
    tags: dashboard.tags.map((t) => t.tag),
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.dashboard.deleteMany({
    where: { id: params.id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}
