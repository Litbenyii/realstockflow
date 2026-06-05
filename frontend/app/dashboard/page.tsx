'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function DashboardPage() {
  const [stock, setStock] = useState<any[]>([])
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockRes, movRes] = await Promise.all([
          api.get('/api/inventario/stock'),
          api.get('/api/movimientos'),
        ])
        setStock(stockRes.data.stock)
        setMovimientos(movRes.data.movimientos)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stockBodega = stock.filter(s => s.ubicacion === 'BODEGA').reduce((acc, s) => acc + s.cantidad, 0)
  const stockTienda = stock.filter(s => s.ubicacion === 'TIENDA').reduce((acc, s) => acc + s.cantidad, 0)
  const criticos = stock.filter(s => s.cantidad <= 5)

  const tipoColor: any = {
    INGRESO: 'text-teal-400',
    TRASLADO: 'text-violet-400',
    VENTA: 'text-amber-400',
    DEVOLUCION: 'text-red-400',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-10 py-10 max-w-6xl">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Resumen operativo · {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Stock total', value: stockBodega + stockTienda, unit: 'uds' },
          { label: 'En bodega', value: stockBodega, unit: 'uds' },
          { label: 'En tienda', value: stockTienda, unit: 'uds' },
          { label: 'Stock crítico', value: criticos.length, unit: 'items', alert: criticos.length > 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">{stat.label}</p>
            <p className={`text-3xl font-semibold ${stat.alert ? 'text-red-400' : 'text-white'}`}>
              {stat.value}
              <span className="text-sm text-zinc-600 font-normal ml-1.5">{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Grid inferior */}
      <div className="grid grid-cols-2 gap-6">

        {/* Movimientos */}
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
          <h2 className="text-white text-sm font-medium mb-5">Movimientos recientes</h2>
          <div className="space-y-1">
            {movimientos.slice(0, 7).map((mov) => (
              <div key={mov.id} className="flex items-center justify-between py-2.5 border-b border-zinc-800/40 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-20 ${tipoColor[mov.tipo] || 'text-zinc-400'}`}>
                    {mov.tipo}
                  </span>
                  <span className="text-zinc-400 text-xs">
                    {mov.Variante?.Producto?.nombre} · T{mov.Variante?.talla}
                  </span>
                </div>
                <span className="text-zinc-500 text-xs font-mono">{mov.cantidad} uds</span>
              </div>
            ))}
            {movimientos.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-6">Sin movimientos</p>
            )}
          </div>
        </div>

        {/* Stock crítico */}
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
          <h2 className="text-white text-sm font-medium mb-5">Stock crítico</h2>
          <div className="space-y-1">
            {criticos.slice(0, 7).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-zinc-800/40 last:border-0">
                <div>
                  <p className="text-zinc-300 text-xs">{s.Variante?.Producto?.nombre}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">Talla {s.Variante?.talla} · {s.ubicacion}</p>
                </div>
                <span className={`text-xs font-mono font-semibold ${s.cantidad === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                  {s.cantidad} uds
                </span>
              </div>
            ))}
            {criticos.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-6">Sin alertas críticas ✓</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
