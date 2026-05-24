import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()
    if (!productId || !quantity) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const lockKey = `lock:${productId}`
    const lock = await redis.set(lockKey, '1', { nx: true, ex: 10 })
    if (!lock) return NextResponse.json({ error: 'Try again' }, { status: 409 })
    try {
      const stock = await prisma.stock.findFirst({ where: { productId } })
      if (!stock) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const available = stock.total - stock.reserved
      if (available < quantity) return NextResponse.json({ error: 'No stock' }, { status: 400 })
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      const [reservation] = await prisma.$transaction([
        prisma.reservation.create({ data: { productId, quantity, status: 'pending', expiresAt } }),
        prisma.stock.update({ where: { id: stock.id }, data: { reserved: { increment: quantity } } }),
      ])
      return NextResponse.json(reservation, { status: 201 })
    } finally {
      await redis.del(lockKey)
    }
  } catch (error) {
    console.error('RESERVATION ERROR:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}