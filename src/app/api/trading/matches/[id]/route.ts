export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trading/matches/:userId
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id)
    const listingIds = await prisma.tradingListing.findMany({
      where: { userId },
      select: { id: true },
    })
    const ids = listingIds.map(l => l.id)

    if (ids.length === 0) return NextResponse.json({ success: true, matches: [], total: 0 })

    const matches = await prisma.tradingMatch.findMany({
      where: { OR: [{ supplyId: { in: ids } }, { demandId: { in: ids } }] },
      orderBy: { score: 'desc' },
      include: {
        supply: { select: { material: true, form: true, quantity: true, price: true, location: true } },
        demand: { select: { material: true, form: true, quantity: true, price: true, location: true } },
      },
    })

    // Enrich with user info
    const matchIds = matches.map(m => m.id)
    const enriched = await Promise.all(matches.map(async m => {
      const [supplyListing, demandListing] = await Promise.all([
        prisma.tradingListing.findUnique({ where: { id: m.supplyId }, include: { user: true } }),
        prisma.tradingListing.findUnique({ where: { id: m.demandId }, include: { user: true } }),
      ])
      return {
        id: m.id, score: m.score, status: m.status, dimensionScores: m.dimensionScores as any,
        supply_material: supplyListing?.material, supply_form: supplyListing?.form,
        supply_quantity: supplyListing?.quantity, supply_price: supplyListing?.price,
        supply_location: supplyListing?.location,
        supply_user_name: supplyListing?.user?.name,
        supply_user_role: supplyListing?.user?.role,
        demand_material: demandListing?.material, demand_form: demandListing?.form,
        demand_quantity: demandListing?.quantity, demand_price: demandListing?.price,
        demand_location: demandListing?.location,
        demand_user_name: demandListing?.user?.name,
        demand_user_role: demandListing?.user?.role,
      }
    }))

    return NextResponse.json({ success: true, matches: enriched, total: enriched.length })
  } catch (err: any) {
    console.error('[trading/matches] error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PATCH /api/trading/matches/:id
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const existing = await prisma.tradingMatch.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })

    const { status } = await req.json()
    if (!status || !['pending', 'contacted', 'deal'].includes(status)) {
      return NextResponse.json({ success: false, error: 'status must be pending, contacted, or deal' }, { status: 400 })
    }

    const match = await prisma.tradingMatch.update({ where: { id }, data: { status } })
    return NextResponse.json({ success: true, match })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
