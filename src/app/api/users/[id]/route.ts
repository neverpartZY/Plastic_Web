import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.id !== params.id && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, email: true, phone: true,
      avatarUrl: true, role: true, isPremium: true, createdAt: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...user, createdAt: user.createdAt.toISOString() })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = session.user.role === 'admin'
  const isSelf = session.user.id === params.id
  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const allowed: Record<string, unknown> = {}

  if (typeof body.name === 'string') allowed.name = body.name
  if (isAdmin && typeof body.isActive === 'boolean') allowed.isActive = body.isActive
  if (isAdmin && typeof body.role === 'string') allowed.role = body.role

  const user = await prisma.user.update({
    where: { id: params.id },
    data: allowed,
    select: { id: true, name: true, email: true, isActive: true, role: true },
  })

  return NextResponse.json(user)
}
