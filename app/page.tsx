'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stock {
  id: string
  total: number
  reserved: number
  warehouse: { name: string }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stocks: Stock[]
}

const PRODUCT_IMAGES: Record<string, string> = {
  'iPhone 15 Pro': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
  'Samsung Galaxy S24': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
  'Sony WH-1000XM5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80',
  'MacBook Air M3': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
}

const PRODUCT_GRADIENTS: Record<string, string> = {
  'iPhone 15 Pro': 'from-slate-900 via-purple-900 to-slate-900',
  'Samsung Galaxy S24': 'from-blue-900 via-cyan-800 to-blue-900',
  'Sony WH-1000XM5': 'from-orange-900 via-red-800 to-orange-900',
  'MacBook Air M3': 'from-gray-900 via-emerald-900 to-gray-900',
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  const getTotalAvailable = (stocks: Stock[]) =>
    stocks.reduce((acc, s) => acc + (s.total - s.reserved), 0)

  const handleReserve = async (productId: string) => {
    setReserving(productId)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Failed to reserve'); return }
      router.push(`/checkout?reservationId=${data.id}&productId=${productId}`)
    } catch {
      alert('Something went wrong!')
    } finally {
      setReserving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-light tracking-widest">LOADING</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-cyan-900/40"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120,40,200,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,200,255,0.1) 0%, transparent 50%)'}}></div>
        <div className="relative z-10">
          <p className="text-purple-400 text-sm font-bold tracking-[0.3em] uppercase mb-3">Premium Store</p>
          <h1 className="text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent">
            ALLO INVENTORY
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">Reserve exclusive products before they sell out</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {products.map((product) => {
            const available = getTotalAvailable(product.stocks)
            const gradient = PRODUCT_GRADIENTS[product.name] || 'from-gray-900 via-gray-800 to-gray-900'
            const image = PRODUCT_IMAGES[product.name]
            return (
              <div key={product.id} className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${gradient} border border-white/10 group hover:border-white/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20`}>
                {/* Product Image */}
                <div className="relative h-56 overflow-hidden">
                  {image && (
                    <img src={image} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  {/* Stock Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${available > 0 ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                    {available > 0 ? `${available} LEFT` : 'SOLD OUT'}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h2 className="text-2xl font-black text-white mb-1">{product.name}</h2>
                  <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                      ₹{product.price.toLocaleString()}
                    </p>
                    <button
                      disabled={available === 0 || reserving === product.id}
                      onClick={() => handleReserve(product.id)}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 ${
                        available === 0
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : reserving === product.id
                          ? 'bg-purple-700 text-white animate-pulse'
                          : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-purple-500/40 active:scale-95'
                      }`}
                    >
                      {reserving === product.id ? 'RESERVING...' : available === 0 ? 'SOLD OUT' : 'RESERVE NOW'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}