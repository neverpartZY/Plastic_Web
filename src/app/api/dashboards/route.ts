import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { dashboardSchema } from '@/lib/validations'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dashboards = await prisma.dashboard.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      tags: { include: { tag: true } },
    },
  })

  return NextResponse.json(
    dashboards.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      tags: d.tags.map((t) => t.tag),
    }))
  )
}

export async function POST(req: NextRequest) {
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
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  const dashboard = await prisma.dashboard.create({
    data: {
      userId: session.user.id,
      name,
      isDefault,
      tags: {
        create: tagIds.map((id) => ({ tag: { connect: { id } } })),
      },
    },
    include: { tags: { include: { tag: true } } },
  })

  return NextResponse.json(
    {
      ...dashboard,
      createdAt: dashboard.createdAt.toISOString(),
      updatedAt: dashboard.updatedAt.toISOString(),
      tags: dashboard.tags.map((t) => t.tag),
    },
    { status: 201 }
  )
}
