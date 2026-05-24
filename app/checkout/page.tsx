'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
}

const PRODUCT_IMAGES: Record<string, string> = {
  'iPhone 15 Pro': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
  'Samsung Galaxy S24': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
  'Sony WH-1000XM5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80',
  'MacBook Air M3': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reservationId = searchParams.get('reservationId')
  const productId = searchParams.get('productId')

  const [product, setProduct] = useState<Product | null>(null)
  const [timeLeft, setTimeLeft] = useState(600)
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'released' | 'expired'>('pending')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (productId) {
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          const found = data.find((p: Product) => p.id === productId)
          setProduct(found || null)
        })
    }
  }, [productId])

  const handleRelease = useCallback(async () => {
    if (!reservationId) return
    await fetch(`/api/reservations/${reservationId}/release`, { method: 'POST' })
    setStatus('released')
    router.push('/')
  }, [reservationId, router])

  useEffect(() => {
    if (status !== 'pending') return
    if (timeLeft <= 0) { handleRelease(); setStatus('expired'); return }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, status, handleRelease])

  const handleConfirm = async () => {
    if (!reservationId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reservations/${reservationId}/confirm`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Failed to confirm'); return }
      setStatus('confirmed')
    } catch {
      alert('Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = (timeLeft / 600) * 100
  const isUrgent = timeLeft < 60

  if (status === 'confirmed') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/50 animate-bounce">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-3">Order Confirmed!</h1>
          <p className="text-gray-400 text-lg mb-8">Your purchase was successful 🎉</p>
          {product && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 max-w-sm mx-auto">
              <p className="text-white font-bold">{product.name}</p>
              <p className="text-green-400 font-black text-xl">₹{product.price.toLocaleString()}</p>
            </div>
          )}
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-2xl hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-purple-400 text-xs font-bold tracking-[0.3em] uppercase mb-2">Secure Checkout</p>
          <h1 className="text-4xl font-black text-white">Complete Order</h1>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Product Image */}
          {product && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={PRODUCT_IMAGES[product.name] || ''}
                alt={product.name}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-xl font-black text-white">{product.name}</h2>
                <p className="text-green-400 font-black text-2xl">₹{product.price.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Timer */}
            <div className="text-center">
              <p className="text-gray-400 text-xs tracking-widest uppercase mb-3">Time Remaining</p>
              <div className={`text-6xl font-black font-mono tracking-tight mb-3 ${isUrgent ? 'text-red-400 animate-pulse' : 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'}`}>
                {formatTime(timeLeft)}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {isUrgent && (
                <p className="text-red-400 text-xs font-bold tracking-widest uppercase mt-2 animate-pulse">
                  ⚡ Expiring Soon!
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black text-lg rounded-2xl hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ PROCESSING...' : '✅ CONFIRM PURCHASE'}
              </button>
              <button
                onClick={handleRelease}
                disabled={loading}
                className="w-full py-3 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-95"
              >
                ❌ Cancel & Release
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          🔒 Reservation held for 10 minutes only
        </p>
      </div>
    </main>
  )
}