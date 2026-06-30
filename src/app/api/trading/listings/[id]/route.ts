export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trading/listings/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.tradingListing.findUnique({
      where: { id: parseInt(params.id) },
      include: { user: { select: { name: true, role: true, location: true, phone: true, company: true } } },
    })
    if (!listing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
    return NextResponse.json({ success: true, listing })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PATCH /api/trading/listings/:id
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const existing = await prisma.tradingListing.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })

    const body = await req.json()
    if (body._userId && existing.userId !== body._userId) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 })
    }

    const data: any = {}
    if (body.status !== undefined) data.status = body.status
    if (body.quantity !== undefined) data.quantity = body.quantity
    if (body.price !== undefined) { data.price = body.price; data.priceNegotiable = body.price === 0 ? 1 : 0 }
    if (body.location !== undefined) data.location = body.location
    if (body.specs !== undefined) data.specs = body.specs
    if (body.notes !== undefined) data.notes = body.notes
    if (body.material !== undefined) data.material = body.material
    if (body.form !== undefined) data.form = body.form

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 })
    }

    const listing = await prisma.tradingListing.update({ where: { id }, data })
    return NextResponse.json({ success: true, listing })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
