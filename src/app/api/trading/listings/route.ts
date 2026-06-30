export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trading/listings
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type') || undefined
    const material = sp.get('material') || undefined
    const location = sp.get('location') || undefined
    const status = sp.get('status') || undefined
    const userId = sp.get('userId') ? Number(sp.get('userId')) : undefined
    const wasteOrRecycled = sp.get('wasteOrRecycled') || undefined
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(200, parseInt(sp.get('limit') || '50', 10)))

    const where: any = {}
    if (type) where.type = type
    if (material) where.material = { contains: material }
    if (location) where.location = { contains: location }
    if (status) where.status = status
    if (userId) where.userId = userId
    if (wasteOrRecycled) where.wasteOrRecycled = wasteOrRecycled

    const [total, listings] = await Promise.all([
      prisma.tradingListing.count({ where }),
      prisma.tradingListing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return NextResponse.json({ success: true, listings, total, page, limit })
  } catch (err: any) {
    console.error('[trading/listings] query error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/trading/listings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, type, wasteOrRecycled, material, form, quantity, price, location, specs, notes } = body

    if (!userId || !type || !wasteOrRecycled || !material) {
      return NextResponse.json({ success: false, error: 'userId, type, wasteOrRecycled, and material are required' }, { status: 400 })
    }
    if (!['supply', 'demand'].includes(type)) {
      return NextResponse.json({ success: false, error: 'type must be supply or demand' }, { status: 400 })
    }
    if (!['废塑料', '再生料'].includes(wasteOrRecycled)) {
      return NextResponse.json({ success: false, error: 'wasteOrRecycled must be 废塑料 or 再生料' }, { status: 400 })
    }

    const user = await prisma.tradingUser.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const finalPrice = price ?? 0
    const priceNegotiable = (price === null || price === undefined || price === 0) ? 1 : 0

    const listing = await prisma.tradingListing.create({
      data: {
        userId, type, wasteOrRecycled, material,
        form: form || '', quantity: quantity ?? 0, price: finalPrice,
        priceNegotiable, location: location || '', specs: specs || '', notes: notes || '',
      },
    })

    // Auto-match
    const oppositeType = type === 'supply' ? 'demand' : 'supply'
    const candidates = await prisma.tradingListing.findMany({
      where: { type: oppositeType, status: 'active', id: { not: listing.id } },
    })

    let matches: any[] = []
    if (candidates.length > 0) {
      // Simple scoring: material match (50), form match (15), location (15), quantity (10), price (10)
      for (const c of candidates) {
        let score = 0
        const dimScores: any = {}
        // Material
        if (c.material === material) { score += 50; dimScores.category = 50 }
        else if (c.material?.includes(material) || material?.includes(c.material)) { score += 25; dimScores.category = 25 }
        else { dimScores.category = 0 }
        // Form match
        if (c.form === form) { score += 15; dimScores.form = 15 }
        else { dimScores.form = 0 }
        // Location (simple: same province)
        const loc1 = (location || '').slice(0, 2), loc2 = (c.location || '').slice(0, 2)
        dimScores.location = loc1 === loc2 ? 15 : 5
        score += dimScores.location
        // Price proximity
        if (finalPrice > 0 && c.price > 0) {
          const diff = Math.abs(finalPrice - c.price) / Math.max(finalPrice, c.price)
          dimScores.price = diff < 0.1 ? 10 : diff < 0.2 ? 7 : diff < 0.3 ? 4 : 1
        } else { dimScores.price = 5 }
        score += dimScores.price
        // Quantity proximity
        const q1 = quantity ?? 0, q2 = c.quantity ?? 0
        if (q1 > 0 && q2 > 0) {
          const qDiff = Math.abs(q1 - q2) / Math.max(q1, q2)
          dimScores.quantity = qDiff < 0.2 ? 10 : qDiff < 0.5 ? 7 : qDiff < 0.8 ? 4 : 1
        } else { dimScores.quantity = 5 }
        score += dimScores.quantity

        if (score >= 40) {
          const match = await prisma.tradingMatch.create({
            data: {
              supplyId: type === 'supply' ? listing.id : c.id,
              demandId: type === 'demand' ? listing.id : c.id,
              score, dimensionScores: dimScores,
            },
          })
          matches.push({ id: match.id, supplyId: match.supplyId, demandId: match.demandId, score, dimensionScores: dimScores, status: 'pending' })
        }
      }
      // Sort and limit
      matches.sort((a, b) => b.score - a.score)
      matches = matches.slice(0, 10)
    }

    return NextResponse.json({ success: true, listing, matches }, { status: 201 })
  } catch (err: any) {
    console.error('[trading/listings] create error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
