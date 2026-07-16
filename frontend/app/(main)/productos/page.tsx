'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { IconCircleCheck, IconAlertCircle, IconX } from '@tabler/icons-react'

const CATEGORIAS = [
  { value: 'NINO', label: 'Niño', abrev: 'NI' }, { value: 'NINA', label: 'Niña', abrev: 'NA' },
  { value: 'DENIM_HOMBRE', label: 'Denim Hombre', abrev: 'DH' }, { value: 'DENIM_MUJER', label: 'Denim Mujer', abrev: 'DM' },
  { value: 'LENCERIA', label: 'Lencería', abrev: 'LE' }, { value: 'ROPA_INTERIOR', label: 'Ropa Interior', abrev: 'RI' },
  { value: 'JUVENIL_HOMBRE', label: 'Juvenil Hombre', abrev: 'JH' }, { value: 'JUVENIL_MUJER', label: 'Juvenil Mujer', abrev: 'JM' },
  { value: 'SENORA', label: 'Señora', abrev: 'SE' }, { value: 'MUJER', label: 'Mujer', abrev: 'MU' },
  { value: 'HOMBRE_CASUAL', label: 'Hombre Casual', abrev: 'HC' }, { value: 'HOME', label: 'Home', abrev: 'HO' },
]
const TALLAS_ROPA = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const TALLAS_DENIM = ['28', '30', '32', 'S/34', 'M/36', 'L/38', 'XL/40', 'XXL/42']
const TALLAS_NINO = ['2', '4', '6', '8', '10', '12', '14', '16']
const COLORES_COMUNES = [
  { nombre: 'Negro', hex: '#1a1a1a' }, { nombre: 'Blanco', hex: '#f5f5f0', border: true },
  { nombre: 'Gris', hex: '#9ca3af' }, { nombre: 'Azul', hex: '#2563eb' },
  { nombre: 'Rojo', hex: '#dc2626' }, { nombre: 'Verde', hex: '#16a34a' },
  { nombre: 'Amarillo', hex: '#eab308' }, { nombre: 'Morado', hex: '#7c3aed' },
  { nombre: 'Naranjo', hex: '#ea580c' }, { nombre: 'Rosado', hex: '#ec4899' },
  { nombre: 'Café', hex: '#92400e' }, { nombre: 'Beige', hex: '#d4b896', border: true },
]
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
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 6000); return () => clearTimeout(t) }, [message])
  const isSuccess = type === 'success'
  const color = isSuccess ? 'var(--teal)' : 'var(--red)'
  const border = isSuccess ? 'var(--teal-border)' : 'var(--red-border)'
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: 'var(--bg-card)', border: `1.5px solid ${border}`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', maxWidth: 'calc(100vw - 48px)', width: '340px' }}>
      {isSuccess ? <IconCircleCheck size={20} style={{ color, flexShrink: 0, marginTop: '1px' }} /> : <IconAlertCircle size={20} style={{ color, flexShrink: 0, marginTop: '1px' }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 2px' }}>{isSuccess ? 'Producto creado' : 'Error'}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{message}</p>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}><IconX size={16} /></button>
    </div>
  )
}
export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [tiposPrenda, setTiposPrenda] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [modoNuevoTipo, setModoNuevoTipo] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [correlativo, setCorrelativo] = useState(1)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ tipoPrenda: '', codigo: '', categoria: '', descripcion: '' })
  const [tallasSel, setTallasSel] = useState<string[]>([])
  const [colorSel, setColorSel] = useState('')
  const [colorCustom, setColorCustom] = useState('')
  const [skuMap, setSkuMap] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      const [prodRes, tiposRes] = await Promise.all([api.get('/api/productos'), api.get('/api/tipos-prenda')])
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

  const getTallas = () => {
    if (['DENIM_HOMBRE', 'DENIM_MUJER'].includes(form.categoria)) return TALLAS_DENIM
    if (['NINO', 'NINA'].includes(form.categoria)) return TALLAS_NINO
    return TALLAS_ROPA
  }
  const toggleTalla = (t: string) => setTallasSel(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  const colorFinal = colorCustom || colorSel
  const variantes = tallasSel.map(talla => ({ talla, color: colorFinal, sku: skuMap[talla] || '' }))

  const handleCrearTipo = async () => {
    if (!form.tipoPrenda.trim()) return
    try {
      await api.post('/api/tipos-prenda', { nombre: form.tipoPrenda.trim() })
      await fetchData(); setModoNuevoTipo(false)
    } catch (err: any) { setToast({ message: err.response?.data?.error || 'Error al crear tipo', type: 'error' }) }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (variantes.length === 0) { setToast({ message: 'Selecciona al menos una talla', type: 'error' }); return }
    if (variantes.some(v => !v.sku)) { setToast({ message: 'Completa el código de barras de cada talla', type: 'error' }); return }
    setSaving(true)
    try {
      await api.post('/api/productos', { nombre: form.tipoPrenda, codigo: form.codigo, categoria: form.categoria, descripcion: form.descripcion, variantes })
      setToast({ message: `${form.tipoPrenda} creado con ${variantes.length} variante(s)`, type: 'success' })
      setShowForm(false); setModoNuevoTipo(false)
      setForm({ tipoPrenda: '', codigo: '', categoria: '', descripcion: '' })
      setTallasSel([]); setColorSel(''); setColorCustom(''); setSkuMap({})
      fetchData()
    } catch (err: any) { setToast({ message: err.response?.data?.error || 'Error al crear producto', type: 'error' }) }
    finally { setSaving(false) }
  }
  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase()))
  const getCatLabel = (val: string) => CATEGORIAS.find(c => c.value === val)?.label || val

  const s = {
    input: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const },
    label: { fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', display: 'block', marginBottom: '6px' },
    select: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' as const },
  }

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 48px)', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '28px', background: 'var(--blue)', borderRadius: '4px', flexShrink: 0 }} />
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>Productos</h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '20px' }}>{productos.length} productos registrados</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setModoNuevoTipo(false) }} style={{ background: showForm ? 'var(--bg-input)' : 'var(--blue)', color: showForm ? 'var(--text-secondary)' : '#fff', border: '1.5px solid var(--blue-border)', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
          {showForm ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--blue-border)', borderLeft: '4px solid var(--blue)', borderRadius: '14px', padding: 'clamp(20px, 3vw, 28px)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 24px' }}>Nuevo producto</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ ...s.label, marginBottom: 0 }}>Tipo de prenda</label>
                  <button type="button" onClick={() => { setModoNuevoTipo(!modoNuevoTipo); setForm(prev => ({ ...prev, tipoPrenda: '' })) }} style={{ fontSize: '11px', color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
                    {modoNuevoTipo ? '← Seleccionar' : '+ Nuevo tipo'}
                  </button>
                </div>
                {modoNuevoTipo ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={form.tipoPrenda} onChange={e => setForm({ ...form, tipoPrenda: e.target.value })} placeholder="Ej: Pantalón Buzo" style={s.input} autoFocus />
                    <button type="button" onClick={handleCrearTipo} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Guardar</button>
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
                <select value={form.categoria} onChange={e => { setForm({ ...form, categoria: e.target.value }); setTallasSel([]) }} style={s.select} required>
                  <option value="">Seleccionar...</option>
                  {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={s.label}>Descripción <span style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
              <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Modelo slim fit" style={s.input} />
            </div>
            {form.categoria && (
              <div>
                <label style={s.label}>Tallas disponibles</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {getTallas().map(t => {
                    const sel = tallasSel.includes(t)
                    return <button key={t} type="button" onClick={() => toggleTalla(t)} style={{ minWidth: '44px', height: '40px', padding: '0 12px', borderRadius: '8px', fontSize: '13px', fontWeight: sel ? '700' : '400', border: `1.5px solid ${sel ? 'var(--blue)' : 'var(--border)'}`, background: sel ? 'var(--blue-bg)' : 'var(--bg-input)', color: sel ? 'var(--blue)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>{t}</button>
                  })}
                </div>
              </div>
            )}
            {tallasSel.length > 0 && (
              <div>
                <label style={s.label}>Color</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
                  {COLORES_COMUNES.map(c => (
                    <button key={c.nombre} type="button" onClick={() => { setColorSel(c.nombre); setColorCustom('') }} title={c.nombre} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c.hex, border: `2px solid ${colorSel === c.nombre && !colorCustom ? 'var(--blue)' : c.border ? 'var(--border)' : 'transparent'}`, cursor: 'pointer', outline: colorSel === c.nombre && !colorCustom ? '2px solid var(--blue)' : 'none', outlineOffset: '2px' }} />
                  ))}
                  <input value={colorCustom} onChange={e => { setColorCustom(e.target.value); setColorSel('') }} placeholder="Otro..." style={{ ...s.input, width: '120px', padding: '6px 10px', fontSize: '12px' }} />
                </div>
                {colorFinal && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Color: <strong>{colorFinal}</strong></p>}
              </div>
            )}
            {tallasSel.length > 0 && colorFinal && (
              <div>
                <label style={s.label}>Código de barras por talla</label>
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tallasSel.map(talla => (
                    <div key={talla} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--blue)', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: '6px', padding: '4px 8px', textAlign: 'center' }}>{talla}</span>
                      <input value={skuMap[talla] || ''} onChange={e => setSkuMap(prev => ({ ...prev, [talla]: e.target.value }))} placeholder={`Código talla ${talla}`} style={{ ...s.input, fontFamily: 'monospace' }} required />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {variantes.length > 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{variantes.length} variante(s) · {colorFinal}</span>}
              <button type="submit" disabled={saving || variantes.length === 0} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: saving || variantes.length === 0 ? 0.4 : 1 }}>
                {saving ? 'Guardando...' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o código..." style={s.input} />
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', overflow: 'hidden', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
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
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--blue)', background: 'var(--blue-bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--blue-border)', whiteSpace: 'nowrap' }}>{getCatLabel(p.categoria)}</span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.Variante?.length || 0} variantes</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', background: p.activo ? 'var(--teal-bg)' : 'var(--bg-input)', color: p.activo ? 'var(--teal)' : 'var(--text-muted)', border: `1px solid ${p.activo ? 'var(--teal-border)' : 'var(--border)'}` }}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
