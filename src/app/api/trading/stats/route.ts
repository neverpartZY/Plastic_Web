export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trading/stats
export async function GET() {
  try {
    const [totalSupplies, totalDemands, totalMatches, activeUsers, pendingMatches, dealMatches] = await Promise.all([
      prisma.tradingListing.count({ where: { type: 'supply', status: { not: 'closed' } } }),
      prisma.tradingListing.count({ where: { type: 'demand', status: { not: 'closed' } } }),
      prisma.tradingMatch.count(),
      prisma.tradingUser.count(),
      prisma.tradingMatch.count({ where: { status: 'pending' } }),
      prisma.tradingMatch.count({ where: { status: 'deal' } }),
    ])

    return NextResponse.json({
      success: true,
      stats: { totalSupplies, totalDemands, totalMatches, activeUsers, pendingMatches, dealMatches },
    })
  } catch (err: any) {
    console.error('[trading/stats] error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
