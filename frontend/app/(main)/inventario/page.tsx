'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function InventarioPage() {
  const [stock, setStock] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [form, setForm] = useState({ varianteId: '', cantidad: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = async () => {
    try {
      const [stockRes, prodRes] = await Promise.all([
        api.get('/api/inventario/stock'),
        api.get('/api/productos'),
      ])
      setStock(stockRes.data.stock)
      setProductos(prodRes.data.productos)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleIngreso = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await api.post('/api/inventario/ingreso', {
        varianteId: parseInt(form.varianteId),
        cantidad: parseInt(form.cantidad),
        descripcion: form.descripcion,
      })
      setSuccess(`✓ ${data.message} — Stock bodega: ${data.stockActualBodega} uds`)
      setForm({ varianteId: '', cantidad: '', descripcion: '' })
      setShowForm(false)
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar ingreso')
    } finally {
      setSaving(false)
    }
  }

  const stockFiltrado = stock.filter(s =>
    s.Variante?.Producto?.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    s.Variante?.sku?.toLowerCase().includes(filtro.toLowerCase())
  )

  const todasVariantes = productos.flatMap(p => p.Variante?.map((v: any) => ({ ...v, productoNombre: p.nombre })) || [])

  return (
    <div className="px-10 py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Inventario</h1>
          <p className="text-zinc-500 text-sm mt-1">{stock.length} registros de stock</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-500 hover:bg-teal-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          {showForm ? 'Cancelar' : '+ Registrar ingreso'}
        </button>
      </div>

      {success && (
        <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl px-4 py-3 text-sm mb-4">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-medium mb-5">Registrar ingreso de mercadería</h2>
          <form onSubmit={handleIngreso} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Variante</label>
                <select
                  value={form.varianteId}
                  onChange={e => setForm({...form, varianteId: e.target.value})}
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  required
                >
                  <option value="">Seleccionar variante...</option>
                  {todasVariantes.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.productoNombre} — Talla {v.talla} {v.color ? `· ${v.color}` : ''} ({v.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={form.cantidad}
                  onChange={e => setForm({...form, cantidad: e.target.value})}
                  placeholder="Ej: 24"
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Descripción</label>
              <input
                value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                placeholder="Ej: Ingreso camión proveedor - Guía 4521"
                className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-teal-500 hover:bg-teal-400 text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40"
              >
                {saving ? 'Registrando...' : 'Registrar ingreso'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <input
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          placeholder="Buscar por producto o SKU..."
          className="w-full bg-zinc-900 border border-zinc-800/60 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Producto</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">SKU</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Talla</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Ubicación</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center text-zinc-600 py-10 text-sm">Cargando...</td></tr>
            ) : stockFiltrado.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-zinc-600 py-10 text-sm">Sin registros de stock</td></tr>
            ) : (
              stockFiltrado.map((s) => (
                <tr key={s.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-5 py-3.5 text-white text-sm">{s.Variante?.Producto?.nombre}</td>
                  <td className="px-5 py-3.5 text-zinc-400 text-xs font-mono">{s.Variante?.sku}</td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm">{s.Variante?.talla}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                      s.ubicacion === 'BODEGA'
                        ? 'bg-violet-500/15 text-violet-400'
                        : 'bg-teal-500/15 text-teal-400'
                    }`}>
                      {s.ubicacion}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-mono text-sm font-semibold ${
                      s.cantidad === 0 ? 'text-red-400' :
                      s.cantidad <= 5 ? 'text-amber-400' : 'text-white'
                    }`}>
                      {s.cantidad} uds
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
