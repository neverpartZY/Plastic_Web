import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

function isEmail(str: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

function isPhone(str: string) {
  return /^1[3-9]\d{9}$/.test(str)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, identifier, password } = parsed.data

  if (!isEmail(identifier) && !isPhone(identifier)) {
    return NextResponse.json(
      { error: { formErrors: ['请输入有效的邮箱地址或手机号'] } },
      { status: 400 }
    )
  }

  const emailField = isEmail(identifier) ? identifier : undefined
  const phoneField = isPhone(identifier) ? identifier : undefined

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        ...(emailField ? [{ email: emailField }] : []),
        ...(phoneField ? [{ phone: phoneField }] : []),
      ],
    },
  })

  if (existing) {
    return NextResponse.json(
      { error: { formErrors: ['该邮箱或手机号已被注册'] } },
      { status: 409 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email: emailField,
      phone: phoneField,
      passwordHash,
    },
    select: { id: true, name: true, email: true, phone: true },
  })

  return NextResponse.json(user, { status: 201 })
}
