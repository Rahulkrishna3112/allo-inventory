import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reservation = await prisma.reservation.findUnique({ where: { id } })
    if (!reservation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (reservation.status !== 'pending') return NextResponse.json({ error: 'Not pending' }, { status: 400 })
    if (new Date() > reservation.expiresAt) return NextResponse.json({ error: 'Expired' }, { status: 400 })
    const updated = await prisma.reservation.update({ where: { id }, data: { status: 'confirmed' } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('CONFIRM ERROR:', error)
    return NextResponse.json({ error: 'Failed', details: String(error) }, { status: 500 })
  }
}