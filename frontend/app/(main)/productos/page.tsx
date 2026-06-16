'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

const CATEGORIAS = [
  { value: 'NINO', label: 'Niño' },
  { value: 'NINA', label: 'Niña' },
  { value: 'DENIM_HOMBRE', label: 'Denim Hombre' },
  { value: 'DENIM_MUJER', label: 'Denim Mujer' },
  { value: 'LENCERIA', label: 'Lencería' },
  { value: 'ROPA_INTERIOR', label: 'Ropa Interior' },
  { value: 'JUVENIL_HOMBRE', label: 'Juvenil Hombre' },
  { value: 'JUVENIL_MUJER', label: 'Juvenil Mujer' },
  { value: 'SENORA', label: 'Señora' },
  { value: 'MUJER', label: 'Mujer' },
  { value: 'HOMBRE_CASUAL', label: 'Hombre Casual' },
  { value: 'HOME', label: 'Home' },
]

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44', '6', '8', '10', '12', '14']

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState({
    nombre: '', codigo: '', categoria: '', descripcion: '',
  })
  const [variantes, setVariantes] = useState([
    { talla: '', color: '', sku: '' }
  ])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchProductos = async () => {
    try {
      const { data } = await api.get('/api/productos')
      setProductos(data.productos)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProductos() }, [])

  const addVariante = () => setVariantes([...variantes, { talla: '', color: '', sku: '' }])
  const removeVariante = (i: number) => setVariantes(variantes.filter((_, idx) => idx !== i))
  const updateVariante = (i: number, field: string, value: string) => {
    const updated = [...variantes]
    updated[i] = { ...updated[i], [field]: value }
    setVariantes(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/api/productos', { ...form, variantes })
      setShowForm(false)
      setForm({ nombre: '', codigo: '', categoria: '', descripcion: '' })
      setVariantes([{ talla: '', color: '', sku: '' }])
      fetchProductos()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear producto')
    } finally {
      setSaving(false)
    }
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getCatLabel = (val: string) => CATEGORIAS.find(c => c.value === val)?.label || val

  return (
    <div className="px-10 py-10 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Productos</h1>
          <p className="text-zinc-500 text-sm mt-1">{productos.length} productos registrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-500 hover:bg-teal-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          {showForm ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-medium mb-5">Nuevo producto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder="Ej: Jeans Slim"
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  required
                />
              </div>
              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Código</label>
                <input
                  value={form.codigo}
                  onChange={e => setForm({...form, codigo: e.target.value})}
                  placeholder="Ej: JNS-DH-001"
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={e => setForm({...form, categoria: e.target.value})}
                  className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
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
            </div>

            {/* Variantes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-zinc-500 text-xs uppercase tracking-wider">Variantes</label>
                <button type="button" onClick={addVariante} className="text-teal-400 text-xs hover:text-teal-300 transition-colors">+ Agregar variante</button>
              </div>
              <div className="space-y-2">
                {variantes.map((v, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 items-center">
                    <select
                      value={v.talla}
                      onChange={e => updateVariante(i, 'talla', e.target.value)}
                      className="bg-zinc-800/60 border border-zinc-700/50 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                      required
                    >
                      <option value="">Talla...</option>
                      {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      value={v.color}
                      onChange={e => updateVariante(i, 'color', e.target.value)}
                      placeholder="Color"
                      className="bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                    />
                    <input
                      value={v.sku}
                      onChange={e => updateVariante(i, 'sku', e.target.value)}
                      placeholder="SKU único"
                      className="bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                      required
                    />
                    {variantes.length > 1 && (
                      <button type="button" onClick={() => removeVariante(i)} className="text-zinc-600 hover:text-red-400 text-xs transition-colors">Eliminar</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-teal-500 hover:bg-teal-400 text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40"
              >
                {saving ? 'Guardando...' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="w-full bg-zinc-900 border border-zinc-800/60 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50"
        />
      </div>

      {/* Tabla */}
      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Producto</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Código</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Categoría</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Variantes</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3.5">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center text-zinc-600 py-10 text-sm">Cargando...</td></tr>
            ) : productosFiltrados.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-zinc-600 py-10 text-sm">Sin productos registrados</td></tr>
            ) : (
              productosFiltrados.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white text-sm font-medium">{p.nombre}</p>
                    {p.descripcion && <p className="text-zinc-500 text-xs mt-0.5">{p.descripcion}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400 text-xs font-mono">{p.codigo}</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-lg">{getCatLabel(p.categoria)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm">{p.Variante?.length || 0} variantes</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${p.activo ? 'bg-teal-500/15 text-teal-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
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
