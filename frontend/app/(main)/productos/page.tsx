'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

const CATEGORIAS = [
  { value: 'NINO', label: 'Niño', abrev: 'NI' },
  { value: 'NINA', label: 'Niña', abrev: 'NA' },
  { value: 'DENIM_HOMBRE', label: 'Denim Hombre', abrev: 'DH' },
  { value: 'DENIM_MUJER', label: 'Denim Mujer', abrev: 'DM' },
  { value: 'LENCERIA', label: 'Lencería', abrev: 'LE' },
  { value: 'ROPA_INTERIOR', label: 'Ropa Interior', abrev: 'RI' },
  { value: 'JUVENIL_HOMBRE', label: 'Juvenil Hombre', abrev: 'JH' },
  { value: 'JUVENIL_MUJER', label: 'Juvenil Mujer', abrev: 'JM' },
  { value: 'SENORA', label: 'Señora', abrev: 'SE' },
  { value: 'MUJER', label: 'Mujer', abrev: 'MU' },
  { value: 'HOMBRE_CASUAL', label: 'Hombre Casual', abrev: 'HC' },
  { value: 'HOME', label: 'Home', abrev: 'HO' },
]

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44', '6', '8', '10', '12', '14']

const generarPrefijo = (nombre: string) => {
  const palabras = nombre.trim().toUpperCase().split(/\s+/).filter(p => p.length > 1)
  if (palabras.length === 0) return ''
  if (palabras.length === 1) return palabras[0].slice(0, 3)
  return palabras.slice(0, 3).map(p => p[0]).join('').padEnd(3, palabras[0][1] || 'X')
}

const generarCodigo = (tipoPrenda: string, categoria: string, correlativo: number) => {
  const prefijo = generarPrefijo(tipoPrenda)
  const cat = CATEGORIAS.find(c => c.value === categoria)?.abrev || 'XX'
  const num = String(correlativo).padStart(3, '0')
  if (!prefijo || !categoria) return ''
  return `${prefijo}-${cat}-${num}`
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [tiposPrenda, setTiposPrenda] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [modoNuevoTipo, setModoNuevoTipo] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [correlativo, setCorrelativo] = useState(1)
  const [form, setForm] = useState({ tipoPrenda: '', codigo: '', categoria: '', descripcion: '' })
  const [variantes, setVariantes] = useState([{ talla: '', color: '', sku: '' }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      const [prodRes, tiposRes] = await Promise.all([
        api.get('/api/productos'),
        api.get('/api/tipos-prenda'),
      ])
      setProductos(prodRes.data.productos)
      setTiposPrenda(tiposRes.data.tipos)
      setCorrelativo(prodRes.data.productos.length + 1)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    const codigo = generarCodigo(form.tipoPrenda, form.categoria, correlativo)
    setForm(prev => ({ ...prev, codigo }))
  }, [form.tipoPrenda, form.categoria, correlativo])

  const addVariante = () => setVariantes([...variantes, { talla: '', color: '', sku: '' }])
  const removeVariante = (i: number) => setVariantes(variantes.filter((_, idx) => idx !== i))
  const updateVariante = (i: number, field: string, value: string) => {
    const updated = [...variantes]
    updated[i] = { ...updated[i], [field]: value }
    setVariantes(updated)
  }

  const handleCrearTipo = async () => {
    if (!form.tipoPrenda.trim()) return
    try {
      await api.post('/api/tipos-prenda', { nombre: form.tipoPrenda.trim() })
      await fetchData()
      setModoNuevoTipo(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear tipo')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/api/productos', {
        nombre: form.tipoPrenda,
        codigo: form.codigo,
        categoria: form.categoria,
        descripcion: form.descripcion,
        variantes
      })
      setShowForm(false)
      setModoNuevoTipo(false)
      setForm({ tipoPrenda: '', codigo: '', categoria: '', descripcion: '' })
      setVariantes([{ talla: '', color: '', sku: '' }])
      fetchData()
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

  const s = {
    input: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' } as React.CSSProperties,
    label: { fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', display: 'block', marginBottom: '6px' },
    select: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' } as React.CSSProperties,
  }

  return (
    <div style={{ padding: '48px', maxWidth: '1100px' }}>

      {/* Header con acento azul */}
      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '28px', background: 'var(--blue)', borderRadius: '4px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>Productos</h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '20px' }}>{productos.length} productos registrados</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setModoNuevoTipo(false) }}
          style={{ background: showForm ? 'var(--bg-input)' : 'var(--blue)', color: showForm ? 'var(--text-secondary)' : '#fff', border: '1.5px solid var(--blue-border)', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: showForm ? 'none' : '0 4px 12px var(--blue-shadow)' }}>
          {showForm ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--blue-border)', borderLeft: '4px solid var(--blue)', borderRadius: '14px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 12px var(--blue-bg)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 24px' }}>Nuevo producto</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ ...s.label, marginBottom: 0 }}>Tipo de prenda</label>
                  <button type="button" onClick={() => { setModoNuevoTipo(!modoNuevoTipo); setForm(prev => ({ ...prev, tipoPrenda: '' })) }}
                    style={{ fontSize: '11px', color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
                    {modoNuevoTipo ? '← Seleccionar' : '+ Nuevo tipo'}
                  </button>
                </div>
                {modoNuevoTipo ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={form.tipoPrenda} onChange={e => setForm({ ...form, tipoPrenda: e.target.value })} placeholder="Ej: Pantalón Buzo" style={s.input} autoFocus />
                    <button type="button" onClick={handleCrearTipo} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      Guardar
                    </button>
                  </div>
                ) : (
                  <select value={form.tipoPrenda} onChange={e => setForm({ ...form, tipoPrenda: e.target.value })} style={s.select} required>
                    <option value="">Seleccionar tipo...</option>
                    {tiposPrenda.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label style={s.label}>Categoría</label>
                <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={s.select} required>
                  <option value="">Seleccionar...</option>
                  {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={s.label}>Descripción <span style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
              <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Modelo slim fit, tela premium" style={s.input} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ ...s.label, marginBottom: 0 }}>Variantes</label>
                <button type="button" onClick={addVariante} style={{ fontSize: '11px', color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>+ Agregar variante</button>
              </div>
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 24px', gap: '8px' }}>
                  <span style={{ ...s.label, margin: 0 }}>Talla</span>
                  <span style={{ ...s.label, margin: 0 }}>Color</span>
                  <span style={{ ...s.label, margin: 0 }}>Código de barras / SKU</span>
                  <span />
                </div>
                {variantes.map((v, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 24px', gap: '8px', alignItems: 'center' }}>
                    <select value={v.talla} onChange={e => updateVariante(i, 'talla', e.target.value)} style={s.select} required>
                      <option value="">Talla...</option>
                      {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input value={v.color} onChange={e => updateVariante(i, 'color', e.target.value)} placeholder="Ej: Azul" style={s.input} />
                    <input value={v.sku} onChange={e => updateVariante(i, 'sku', e.target.value)} placeholder="Escanear o escribir" style={{ ...s.input, fontFamily: 'monospace' }} required />
                    {variantes.length > 1 && (
                      <button type="button" onClick={() => removeVariante(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: 0 }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: '13px', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={saving} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1, boxShadow: '0 4px 12px var(--blue-shadow)' }}>
                {saving ? 'Guardando...' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div style={{ marginBottom: '16px' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o código..." style={s.input} />
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--blue-border)', background: 'var(--blue-bg)' }}>
              {['Producto', 'Categoría', 'Variantes', 'Estado'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: '11px', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '14px 20px', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Cargando...</td></tr>
            ) : productosFiltrados.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Sin productos registrados</td></tr>
            ) : productosFiltrados.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>{p.nombre}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: 'monospace' }}>{p.codigo}</p>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--blue)', background: 'var(--blue-bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--blue-border)' }}>
                    {getCatLabel(p.categoria)}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.Variante?.length || 0} variantes</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', background: p.activo ? 'var(--teal-bg)' : 'var(--bg-input)', color: p.activo ? 'var(--teal)' : 'var(--text-muted)', border: `1px solid ${p.activo ? 'var(--teal-border)' : 'var(--border)'}` }}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
