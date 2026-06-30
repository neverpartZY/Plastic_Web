export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trading/prices
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const category = sp.get('category') || undefined
    const material = sp.get('material') || undefined

    const where: any = {}
    if (category) where.category = category.toUpperCase()
    if (material) where.material = { contains: material }

    const prices = await prisma.tradingPrice.findMany({
      where,
      orderBy: [{ category: 'asc' }, { material: 'asc' }],
    })

    return NextResponse.json({ success: true, prices, total: prices.length })
  } catch (err: any) {
    console.error('[trading/prices] error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
