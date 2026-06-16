'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function VentasPage() {
  const [ventas, setVentas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ varianteId: '', cantidad: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = async () => {
    try {
      const [ventasRes, prodRes] = await Promise.all([
        api.get('/api/ventas'),
        api.get('/api/productos'),
      ])
      setVentas(ventasRes.data.ventas)
      setProductos(prodRes.data.productos)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await api.post('/api/ventas', {
        varianteId: parseInt(form.varianteId),
        cantidad: parseInt(form.cantidad),
        descripcion: form.descripcion,
      })
      setSuccess(`✓ ${data.message} — Stock restante: ${data.stockRestanteTienda} uds`)
      setForm({ varianteId: '', cantidad: '', descripcion: '' })
      setShowForm(false)
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar venta')
    } finally {
      setSaving(false)
    }
  }

  const todasVariantes = productos.flatMap(p =>
    p.Variante?.map((v: any) => ({ ...v, productoNombre: p.nombre })) || []
  )

  const totalVentas = ventas.reduce((acc, v) => acc + v.cantidad, 0)

  return (
    <div className="px-10 py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Ventas</h1>
          <p className="text-zinc-500 text-sm mt-1">{ventas.length} ventas · {totalVentas} unidades vendidas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          {showForm ? 'Cancelar' : '+ Registrar venta'}
        </button>
      </div>

      {success && (
        <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl px-4 py-3 text-sm mb-4">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-medium mb-5">Registrar venta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Variante</label>
                <select
                  value={form.varianteId}
                  onChange={e => setForm({...form, varianteId: e.target.value})}
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
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
                  placeholder="Ej: 1"
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Descripción</label>
              <input
                value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                placeholder="Opcional"
                className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white text-sm transition-colors px-4">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40"
              >
                {saving ? 'Registrando...' : 'Confirmar venta'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Producto</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Talla</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">SKU</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Cantidad</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Cajero</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-zinc-600 py-10 text-sm">Cargando...</td></tr>
            ) : ventas.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-zinc-600 py-10 text-sm">Sin ventas registradas</td></tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-5 py-3.5 text-white text-sm">{v.Variante?.Producto?.nombre}</td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm">{v.Variante?.talla}</td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs font-mono">{v.Variante?.sku}</td>
                  <td className="px-5 py-3.5 text-amber-400 text-sm font-mono font-semibold">{v.cantidad} uds</td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm">{v.Usuario?.nombre}</td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs">
                    {new Date(v.creadoEn).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
