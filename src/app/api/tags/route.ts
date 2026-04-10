import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { tagSchema } from '@/lib/validations'

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })

  const grouped: Record<string, typeof tags> = {}
  for (const tag of tags) {
    if (!grouped[tag.category]) grouped[tag.category] = []
    grouped[tag.category].push(tag)
  }

  return NextResponse.json({ tags, grouped })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = tagSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const tag = await prisma.tag.create({ data: parsed.data })
  return NextResponse.json(tag, { status: 201 })
}
