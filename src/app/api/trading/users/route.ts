export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/trading/users (register or login)
export async function POST(req: NextRequest) {
  try {
    const { action, ...body } = await req.json()

    if (action === 'register') {
      const { name, role, phone, location, company } = body
      if (!name || !role || !phone) {
        return NextResponse.json({ success: false, error: 'name, role, and phone are required' }, { status: 400 })
      }
      const validRoles = ['打包站', '再生工厂', '制品·改性·色母', '贸易商']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ success: false, error: `role must be one of: ${validRoles.join(', ')}` }, { status: 400 })
      }

      const existing = await prisma.tradingUser.findUnique({ where: { phone } })
      if (existing) {
        return NextResponse.json({ success: false, error: 'Phone already registered' }, { status: 409 })
      }

      const user = await prisma.tradingUser.create({
        data: { name, role, phone, location: location || '', company: company || '' },
      })
      return NextResponse.json({ success: true, user }, { status: 201 })
    }

    if (action === 'login') {
      const { phone } = body
      if (!phone) return NextResponse.json({ success: false, error: 'phone is required' }, { status: 400 })

      const user = await prisma.tradingUser.findUnique({ where: { phone } })
      if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true, user })
    }

    return NextResponse.json({ success: false, error: 'action must be register or login' }, { status: 400 })
  } catch (err: any) {
    console.error('[trading/users] error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
