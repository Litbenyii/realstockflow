'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { exportarStock, exportarMovimientos } from '@/lib/exportar'
import {
  IconPackage, IconTruck, IconArrowsExchange, IconHistory,
  IconCircleCheck, IconAlertCircle, IconX, IconChevronRight, IconChevronLeft,
} from '@tabler/icons-react'

const TABS = [
  { id: 'Stock', label: 'Stock', Icon: IconPackage },
  { id: 'Registrar ingreso', label: 'Ingreso', Icon: IconTruck },
  { id: 'Traslados', label: 'Traslados', Icon: IconArrowsExchange },
  { id: 'Historial', label: 'Historial', Icon: IconHistory },
]

const itemVacio = () => ({ varianteId: '', cantidad: '', numeroCaja: '1' })

const CATEGORIAS_LABEL: any = {
  NINO: 'Niño', NINA: 'Niña', DENIM_HOMBRE: 'Denim Hombre',
  DENIM_MUJER: 'Denim Mujer', LENCERIA: 'Lencería', ROPA_INTERIOR: 'Ropa Interior',
  JUVENIL_HOMBRE: 'Juvenil Hombre', JUVENIL_MUJER: 'Juvenil Mujer',
  SENORA: 'Señora', MUJER: 'Mujer', HOMBRE_CASUAL: 'Hombre Casual', HOME: 'Home',
}

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [message])
  const isSuccess = type === 'success'
  const color = isSuccess ? 'var(--teal)' : 'var(--red)'
  const border = isSuccess ? 'var(--teal-border)' : 'var(--red-border)'
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: 'var(--bg-card)', border: `1.5px solid ${border}`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', maxWidth: '360px', minWidth: '280px' }}>
      {isSuccess ? <IconCircleCheck size={20} style={{ color, flexShrink: 0, marginTop: '1px' }} /> : <IconAlertCircle size={20} style={{ color, flexShrink: 0, marginTop: '1px' }} />}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 2px' }}>{isSuccess ? 'Operación exitosa' : 'Error'}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{message}</p>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, flexShrink: 0 }}>
        <IconX size={16} />
      </button>
    </div>
  )
}

export default function InventarioPage() {
  const [tab, setTab] = useState('Stock')
  const [stock, setStock] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // Filtros stock
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroUbicacion, setFiltroUbicacion] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  // Filtros historial
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  // Wizard ingreso
  const [paso, setPaso] = useState(1)
  const [guiaDespacho, setGuiaDespacho] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [totalCajas, setTotalCajas] = useState('1')
  const [items, setItems] = useState([itemVacio()])

  // Traslado
  const [formTraslado, setFormTraslado] = useState({ varianteId: '', cantidad: '', descripcion: '' })

  const fetchData = async () => {
    try {
      const [stockRes, prodRes, movRes] = await Promise.all([
        api.get('/api/inventario/stock'),
        api.get('/api/productos'),
        api.get('/api/movimientos'),
      ])
      setStock(stockRes.data.stock)
      setProductos(prodRes.data.productos)
      setMovimientos(movRes.data.movimientos.filter((m: any) => m.tipo !== 'VENTA' && m.tipo !== 'DEVOLUCION'))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const todasVariantes = productos.flatMap(p =>
    p.Variante?.map((v: any) => ({ ...v, productoNombre: p.nombre })) || []
  )

  const addItem = () => setItems([...items, itemVacio()])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: string, value: string) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: value }
    setItems(updated)
  }

  const resetIngreso = () => {
    setPaso(1)
    setGuiaDespacho('')
    setProveedor('')
    setTotalCajas('1')
    setItems([itemVacio()])
  }

  const handleIngreso = async () => {
    setSaving(true)
    try {
      const { data } = await api.post('/api/inventario/ingreso', {
        guiaDespacho, proveedor, totalCajas: parseInt(totalCajas),
        items: items.map(i => ({ varianteId: parseInt(i.varianteId), cantidad: parseInt(i.cantidad), numeroCaja: parseInt(i.numeroCaja) }))
      })
      setToast({ message: data.message, type: 'success' })
      resetIngreso()
      fetchData()
    } catch (err: any) {
      setToast({ message: err.response?.data?.error || 'Error al registrar ingreso', type: 'error' })
    } finally { setSaving(false) }
  }

  const handleTraslado = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/api/movimientos/traslado', {
        varianteId: parseInt(formTraslado.varianteId),
        cantidad: parseInt(formTraslado.cantidad),
        descripcion: formTraslado.descripcion,
      })
      setToast({ message: `${data.message} — Bodega: ${data.stockBodega} uds · Tienda: ${data.stockTienda} uds`, type: 'success' })
      setFormTraslado({ varianteId: '', cantidad: '', descripcion: '' })
      fetchData()
    } catch (err: any) {
      setToast({ message: err.response?.data?.error || 'Error al registrar traslado', type: 'error' })
    } finally { setSaving(false) }
  }

  const stockFiltrado = stock.filter(s => {
    const textoOk = !filtroTexto || s.Variante?.Producto?.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) || s.Variante?.sku?.toLowerCase().includes(filtroTexto.toLowerCase())
    const ubicacionOk = !filtroUbicacion || s.ubicacion === filtroUbicacion
    const categoriaOk = !filtroCategoria || s.Variante?.Producto?.categoria === filtroCategoria
    return textoOk && ubicacionOk && categoriaOk
  })

  const movFiltrados = movimientos.filter(m => {
    const tipoOk = !filtroTipo || m.tipo === filtroTipo
    const desdeOk = !filtroFechaDesde || new Date(m.creadoEn) >= new Date(filtroFechaDesde)
    const hastaOk = !filtroFechaHasta || new Date(m.creadoEn) <= new Date(filtroFechaHasta + 'T23:59:59')
    return tipoOk && desdeOk && hastaOk
  })

  const categorias = [...new Set(stock.map(s => s.Variante?.Producto?.categoria).filter(Boolean))]

  const s = {
    input: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' } as React.CSSProperties,
    label: { fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', display: 'block', marginBottom: '6px' },
    select: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' } as React.CSSProperties,
    card: { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderLeft: '4px solid var(--teal)', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 12px var(--teal-bg)' } as React.CSSProperties,
    cardSmall: { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '24px' } as React.CSSProperties,
    filterBtn: (active: boolean) => ({ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: active ? '600' : '400', color: active ? 'var(--teal)' : 'var(--text-secondary)', background: active ? 'var(--teal-bg)' : 'var(--bg-input)', border: `1px solid ${active ? 'var(--teal-border)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties),
    exportBtn: { background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
  }

  // Wizard steps indicator
  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
      {[1, 2, 3].map((n, i) => {
        const done = paso > n
        const active = paso === n
        const labels = ['Datos del camión', 'Prendas recibidas', 'Confirmar']
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', background: done ? 'var(--teal)' : active ? 'var(--teal-bg)' : 'var(--bg-input)', color: done ? '#fff' : active ? 'var(--teal)' : 'var(--text-muted)', border: `2px solid ${done || active ? 'var(--teal)' : 'var(--border)'}`, flexShrink: 0 }}>
                {done ? <IconCircleCheck size={14} /> : n}
              </div>
              <span style={{ fontSize: '12px', fontWeight: active ? '600' : '400', color: active ? 'var(--text)' : done ? 'var(--teal)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{labels[i]}</span>
            </div>
            {n < 3 && <div style={{ width: '32px', height: '1px', background: paso > n ? 'var(--teal)' : 'var(--border)' }} />}
          </div>
        )
      })}
    </div>
  )

  return (
    <div style={{ padding: '48px', maxWidth: '1100px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--teal-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '28px', background: 'var(--teal)', borderRadius: '4px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>Inventario</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '20px' }}>Control de stock y movimientos internos</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', width: 'fit-content', marginBottom: '28px', background: 'var(--bg-input)' }}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = tab === id
          return (
            <button key={id} onClick={() => { setTab(id); if (id !== 'Registrar ingreso') resetIngreso() }}
              style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: isActive ? '600' : '400', color: isActive ? 'var(--teal)' : 'var(--text-secondary)', background: isActive ? 'var(--teal-bg)' : 'transparent', borderRight: '1px solid var(--border)', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', minWidth: '80px' }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </button>
          )
        })}
      </div>

      {/* STOCK */}
      {tab === 'Stock' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total stock', value: stock.reduce((a, s) => a + s.cantidad, 0), color: 'var(--text)', accent: 'var(--teal)' },
              { label: 'En bodega', value: stock.filter(s => s.ubicacion === 'BODEGA').reduce((a, s) => a + s.cantidad, 0), color: 'var(--violet)', accent: 'var(--violet)' },
              { label: 'En tienda', value: stock.filter(s => s.ubicacion === 'TIENDA').reduce((a, s) => a + s.cantidad, 0), color: 'var(--teal)', accent: 'var(--teal)' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderLeft: `4px solid ${stat.accent}`, borderRadius: '14px', padding: '22px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>{stat.label}</p>
                <p style={{ fontSize: '30px', fontWeight: '700', color: stat.color, margin: 0, letterSpacing: '-1px' }}>
                  {stat.value}<span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '5px' }}>uds</span>
                </p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Buscar producto o SKU..." style={{ ...s.input, width: '220px' }} />
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>UBICACIÓN</span>
              {['', 'BODEGA', 'TIENDA'].map(u => (
                <button key={u} onClick={() => setFiltroUbicacion(u)} style={s.filterBtn(filtroUbicacion === u)}>{u || 'Todas'}</button>
              ))}
            </div>
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{ ...s.select, width: '150px', padding: '6px 12px', fontSize: '12px' }}>
              <option value="">Categoría</option>
              {categorias.map(c => <option key={c} value={c}>{CATEGORIAS_LABEL[c] || c}</option>)}
            </select>
            {(filtroTexto || filtroUbicacion || filtroCategoria) && (
              <button onClick={() => { setFiltroTexto(''); setFiltroUbicacion(''); setFiltroCategoria('') }} style={{ fontSize: '12px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>✕ Limpiar</button>
            )}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{stockFiltrado.length} de {stock.length} registros</span>
            <button onClick={() => exportarStock(stockFiltrado)} style={s.exportBtn}>↓ Excel</button>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--teal-border)', background: 'var(--teal-bg)' }}>
                  {['Producto', 'SKU', 'Talla', 'Categoría', 'Ubicación', 'Stock'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '11px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '14px 20px', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Cargando...</td></tr>
                ) : stockFiltrado.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Sin registros</td></tr>
                ) : stockFiltrado.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{st.Variante?.Producto?.nombre}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{st.Variante?.sku}</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{st.Variante?.talla}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '3px 8px', borderRadius: '5px', border: '1px solid var(--border)' }}>
                        {CATEGORIAS_LABEL[st.Variante?.Producto?.categoria] || st.Variante?.Producto?.categoria}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px', background: st.ubicacion === 'BODEGA' ? 'var(--violet-bg)' : 'var(--teal-bg)', color: st.ubicacion === 'BODEGA' ? 'var(--violet)' : 'var(--teal)', border: `1px solid ${st.ubicacion === 'BODEGA' ? 'var(--violet-border)' : 'var(--teal-border)'}` }}>
                        {st.ubicacion}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: st.cantidad === 0 ? 'var(--red)' : st.cantidad <= 5 ? 'var(--amber)' : 'var(--text)', background: st.cantidad <= 5 ? (st.cantidad === 0 ? 'var(--red-bg)' : 'var(--amber-bg)') : 'transparent', padding: st.cantidad <= 5 ? '3px 10px' : '0', borderRadius: '6px', border: st.cantidad <= 5 ? `1px solid ${st.cantidad === 0 ? 'var(--red-border)' : 'var(--amber-border)'}` : 'none' }}>
                        {st.cantidad} uds
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTRAR INGRESO — WIZARD */}
      {tab === 'Registrar ingreso' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>
          <div style={s.card}>
            <StepIndicator />

            {/* PASO 1 */}
            {paso === 1 && (
              <div>
                <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px' }}>¿De qué camión viene la mercadería?</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>Estos datos quedarán registrados junto a cada prenda ingresada</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={s.label}>N° Guía de despacho</label>
                    <input value={guiaDespacho} onChange={e => setGuiaDespacho(e.target.value)} placeholder="Ej: 4521" style={s.input} autoFocus />
                  </div>
                  <div>
                    <label style={s.label}>Proveedor</label>
                    <input value={proveedor} onChange={e => setProveedor(e.target.value)} placeholder="Ej: Fashion's Park Central" style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>Total de cajas recibidas</label>
                    <input type="number" min="1" value={totalCajas} onChange={e => setTotalCajas(e.target.value)} style={s.input} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button onClick={() => setPaso(2)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Siguiente — Prendas <IconChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2 */}
            {paso === 2 && (
              <div>
                <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px' }}>¿Qué prendas llegaron?</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>Agrega cada prenda con su cantidad y el número de caja donde venía</p>
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 24px', gap: '8px' }}>
                    <span style={{ ...s.label, margin: 0 }}>Variante</span>
                    <span style={{ ...s.label, margin: 0 }}>Cantidad</span>
                    <span style={{ ...s.label, margin: 0 }}>N° Caja</span>
                    <span />
                  </div>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 24px', gap: '8px', alignItems: 'center' }}>
                      <select value={item.varianteId} onChange={e => updateItem(i, 'varianteId', e.target.value)} style={s.select} required>
                        <option value="">Seleccionar...</option>
                        {todasVariantes.map((v: any) => (<option key={v.id} value={v.id}>{v.productoNombre} — T{v.talla} {v.color ? `· ${v.color}` : ''}</option>))}
                      </select>
                      <input type="number" min="1" value={item.cantidad} onChange={e => updateItem(i, 'cantidad', e.target.value)} placeholder="Cant." style={s.input} />
                      <input type="number" min="1" value={item.numeroCaja} onChange={e => updateItem(i, 'numeroCaja', e.target.value)} style={s.input} />
                      {items.length > 1 && <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: 0 }}>✕</button>}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItem} style={{ fontSize: '12px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', padding: 0 }}>
                  + Agregar otra prenda
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button onClick={() => setPaso(1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <IconChevronLeft size={16} /> Atrás
                  </button>
                  <button onClick={() => setPaso(3)} disabled={items.some(i => !i.varianteId || !i.cantidad)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', opacity: items.some(i => !i.varianteId || !i.cantidad) ? 0.4 : 1 }}>
                    Siguiente — Confirmar <IconChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {paso === 3 && (
              <div>
                <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px' }}>Confirmar ingreso</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>Revisa los datos antes de registrar</p>

                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Datos del camión</p>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Guía</span><p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '2px 0 0' }}>{guiaDespacho || '—'}</p></div>
                    <div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Proveedor</span><p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '2px 0 0' }}>{proveedor || '—'}</p></div>
                    <div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cajas</span><p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '2px 0 0' }}>{totalCajas}</p></div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Prendas ({items.length})</p>
                  {items.map((item, i) => {
                    const variante = todasVariantes.find((v: any) => v.id === parseInt(item.varianteId))
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text)' }}>{variante ? `${variante.productoNombre} — T${variante.talla}` : '—'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{item.cantidad} uds · Caja {item.numeroCaja}</span>
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setPaso(2)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <IconChevronLeft size={16} /> Atrás
                  </button>
                  <button onClick={handleIngreso} disabled={saving} style={{ background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Registrando...' : 'Registrar ingreso en bodega'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Panel lateral */}
          <div style={s.cardSmall}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 16px' }}>Resumen</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Paso actual</span>
                <span style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: '600' }}>{paso} de 3</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Prendas</span>
                <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '600' }}>{items.filter(i => i.varianteId).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cajas</span>
                <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '600' }}>{totalCajas}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total unidades</span>
                <span style={{ fontSize: '28px', color: 'var(--teal)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {items.reduce((a, i) => a + (parseInt(i.cantidad) || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRASLADOS */}
      {tab === 'Traslados' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px', alignItems: 'start' }}>
          <div style={{ ...s.card, borderLeft: '4px solid var(--violet)', boxShadow: '0 2px 12px var(--violet-bg)' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px' }}>Trasladar de bodega a tienda</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>El stock se descuenta de bodega y se suma en tienda automáticamente</p>
            <form onSubmit={handleTraslado} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={s.label}>Variante</label>
                <select value={formTraslado.varianteId} onChange={e => setFormTraslado({ ...formTraslado, varianteId: e.target.value })} style={s.select} required>
                  <option value="">Seleccionar variante...</option>
                  {todasVariantes.map((v: any) => (<option key={v.id} value={v.id}>{v.productoNombre} — T{v.talla} {v.color ? `· ${v.color}` : ''} ({v.sku})</option>))}
                </select>
              </div>
              <div>
                <label style={s.label}>Cantidad</label>
                <input type="number" min="1" value={formTraslado.cantidad} onChange={e => setFormTraslado({ ...formTraslado, cantidad: e.target.value })} placeholder="Ej: 10" style={s.input} required />
              </div>
              <div>
                <label style={s.label}>Descripción</label>
                <input value={formTraslado.descripcion} onChange={e => setFormTraslado({ ...formTraslado, descripcion: e.target.value })} placeholder="Opcional" style={s.input} />
              </div>
              <button type="submit" disabled={saving} style={{ width: '100%', background: 'var(--violet)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Registrando...' : 'Confirmar traslado'}
              </button>
            </form>
          </div>
          <div style={s.cardSmall}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 20px' }}>Cómo funciona</p>
            {[
              { paso: '01', texto: 'Selecciona la variante a trasladar' },
              { paso: '02', texto: 'Ingresa la cantidad de unidades' },
              { paso: '03', texto: 'El stock se actualiza automáticamente en ambas ubicaciones' },
            ].map(p => (
              <div key={p.paso} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--violet)', minWidth: '24px' }}>{p.paso}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{p.texto}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORIAL */}
      {tab === 'Historial' && (
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TIPO</span>
              {['', 'INGRESO', 'TRASLADO'].map(t => (
                <button key={t} onClick={() => setFiltroTipo(t)} style={s.filterBtn(filtroTipo === t)}>{t || 'Todos'}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DESDE</span>
              <input type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)} style={{ ...s.input, width: '140px', padding: '6px 10px', fontSize: '12px' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>HASTA</span>
              <input type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)} style={{ ...s.input, width: '140px', padding: '6px 10px', fontSize: '12px' }} />
            </div>
            {(filtroTipo || filtroFechaDesde || filtroFechaHasta) && (
              <button onClick={() => { setFiltroTipo(''); setFiltroFechaDesde(''); setFiltroFechaHasta('') }} style={{ fontSize: '12px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>✕ Limpiar</button>
            )}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{movFiltrados.length} de {movimientos.length} registros</span>
            <button onClick={() => exportarMovimientos(movFiltrados)} style={s.exportBtn}>↓ Excel</button>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--teal-border)', background: 'var(--teal-bg)' }}>
                  {['Tipo', 'Producto', 'Talla', 'Cantidad', 'Detalle', 'Fecha'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '11px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '14px 20px', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Cargando...</td></tr>
                ) : movFiltrados.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Sin movimientos</td></tr>
                ) : movFiltrados.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px', background: m.tipo === 'INGRESO' ? 'var(--teal-bg)' : 'var(--violet-bg)', color: m.tipo === 'INGRESO' ? 'var(--teal)' : 'var(--violet)', border: `1px solid ${m.tipo === 'INGRESO' ? 'var(--teal-border)' : 'var(--violet-border)'}` }}>
                        {m.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{m.Variante?.Producto?.nombre}</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{m.Variante?.talla}</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text)', fontFamily: 'monospace', fontWeight: '600' }}>{m.cantidad} uds</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.descripcion}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(m.creadoEn).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
