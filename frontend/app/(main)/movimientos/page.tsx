'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tipoForm, setTipoForm] = useState<'traslado' | 'devolucion'>('traslado')
  const [filtro, setFiltro] = useState('')
  const [form, setForm] = useState({ varianteId: '', cantidad: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = async () => {
    try {
      const [movRes, prodRes] = await Promise.all([
        api.get('/api/movimientos'),
        api.get('/api/productos'),
      ])
      setMovimientos(movRes.data.movimientos)
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
      const { data } = await api.post(`/api/movimientos/${tipoForm}`, {
        varianteId: parseInt(form.varianteId),
        cantidad: parseInt(form.cantidad),
        descripcion: form.descripcion,
      })
      setSuccess(`✓ ${data.message}`)
      setForm({ varianteId: '', cantidad: '', descripcion: '' })
      setShowForm(false)
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar movimiento')
    } finally {
      setSaving(false)
    }
  }

  const todasVariantes = productos.flatMap(p =>
    p.Variante?.map((v: any) => ({ ...v, productoNombre: p.nombre })) || []
  )

  const movFiltrados = movimientos.filter(m =>
    m.Variante?.Producto?.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    m.tipo?.toLowerCase().includes(filtro.toLowerCase())
  )

  const tipoColor: any = {
    INGRESO: 'bg-teal-500/15 text-teal-400',
    TRASLADO: 'bg-violet-500/15 text-violet-400',
    VENTA: 'bg-amber-500/15 text-amber-400',
    DEVOLUCION: 'bg-red-500/15 text-red-400',
    AJUSTE: 'bg-zinc-700 text-zinc-400',
  }

  return (
    <div className="px-10 py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Movimientos</h1>
          <p className="text-zinc-500 text-sm mt-1">{movimientos.length} movimientos registrados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setTipoForm('traslado'); setShowForm(!showForm) }}
            className="bg-violet-500 hover:bg-violet-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            + Traslado
          </button>
          <button
            onClick={() => { setTipoForm('devolucion'); setShowForm(!showForm) }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            + Devolución
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl px-4 py-3 text-sm mb-4">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-medium mb-5">
            {tipoForm === 'traslado' ? 'Registrar traslado bodega → tienda' : 'Registrar devolución de cliente'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Ej: 10"
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
                placeholder="Opcional"
                className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white text-sm transition-colors px-4">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-teal-500 hover:bg-teal-400 text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40"
              >
                {saving ? 'Registrando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <input
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          placeholder="Filtrar por producto o tipo..."
          className="w-full bg-zinc-900 border border-zinc-800/60 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Tipo</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Producto</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Talla</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Cantidad</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Responsable</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-zinc-600 py-10 text-sm">Cargando...</td></tr>
            ) : movFiltrados.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-zinc-600 py-10 text-sm">Sin movimientos</td></tr>
            ) : (
              movFiltrados.map((m) => (
                <tr key={m.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${tipoColor[m.tipo]}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white text-sm">{m.Variante?.Producto?.nombre}</td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm">{m.Variante?.talla}</td>
                  <td className="px-5 py-3.5 text-zinc-300 text-sm font-mono">{m.cantidad} uds</td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm">{m.Usuario?.nombre}</td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs">
                    {new Date(m.creadoEn).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
