'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { exportarVentas } from '@/lib/exportar'
import { IconShoppingCart, IconArrowBackUp, IconHistory, IconCircleCheck, IconAlertCircle, IconX } from '@tabler/icons-react'

const TABS = [
  { id: 'Registrar venta', label: 'Venta', Icon: IconShoppingCart },
  { id: 'Devoluciones', label: 'Devolución', Icon: IconArrowBackUp },
  { id: 'Historial', label: 'Historial', Icon: IconHistory },
]
const itemVacio = () => ({ varianteId: '', cantidad: '1' })

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 6000); return () => clearTimeout(t) }, [message])
  const isSuccess = type === 'success'
  const color = isSuccess ? 'var(--teal)' : 'var(--red)'
  const border = isSuccess ? 'var(--teal-border)' : 'var(--red-border)'
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: 'var(--bg-card)', border: `1.5px solid ${border}`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', maxWidth: 'calc(100vw - 48px)', width: '340px' }}>
      {isSuccess ? <IconCircleCheck size={20} style={{ color, flexShrink: 0, marginTop: '1px' }} /> : <IconAlertCircle size={20} style={{ color, flexShrink: 0, marginTop: '1px' }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 2px' }}>{isSuccess ? 'Operación exitosa' : 'Error'}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{message}</p>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}><IconX size={16} /></button>
    </div>
  )
}

export default function VentasPage() {
  const [tab, setTab] = useState('Registrar venta')
  const [ventas, setVentas] = useState<any[]>([])
  const [devoluciones, setDevoluciones] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [itemsVenta, setItemsVenta] = useState([itemVacio()])
  const [itemsDevolucion, setItemsDevolucion] = useState([itemVacio()])
  const [descripcionVenta, setDescripcionVenta] = useState('')
  const [motivoDevolucion, setMotivoDevolucion] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroProducto, setFiltroProducto] = useState('')

  const fetchData = async () => {
    try {
      const [ventasRes, prodRes, movRes, stockRes] = await Promise.all([api.get('/api/ventas'), api.get('/api/productos'), api.get('/api/movimientos'), api.get('/api/inventario/stock')])
      setVentas(ventasRes.data.ventas)
      setDevoluciones(movRes.data.movimientos.filter((m: any) => m.tipo === 'DEVOLUCION'))
      setProductos(prodRes.data.productos); setStock(stockRes.data.stock)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])
  const todasVariantes = productos.flatMap(p => p.Variante?.map((v: any) => ({ ...v, productoNombre: p.nombre })) || [])
  const getStockTienda = (varianteId: string) => {
    if (!varianteId) return null
    const st = stock.find(s => s.varianteId === parseInt(varianteId) && s.ubicacion === 'TIENDA')
    return st?.cantidad ?? 0
  }
  const addItemVenta = () => setItemsVenta([...itemsVenta, itemVacio()])
  const removeItemVenta = (i: number) => setItemsVenta(itemsVenta.filter((_, idx) => idx !== i))
  const updateItemVenta = (i: number, field: string, value: string) => { const u = [...itemsVenta]; u[i] = { ...u[i], [field]: value }; setItemsVenta(u) }
  const addItemDev = () => setItemsDevolucion([...itemsDevolucion, itemVacio()])
  const removeItemDev = (i: number) => setItemsDevolucion(itemsDevolucion.filter((_, idx) => idx !== i))
  const updateItemDev = (i: number, field: string, value: string) => { const u = [...itemsDevolucion]; u[i] = { ...u[i], [field]: value }; setItemsDevolucion(u) }

  const handleVenta = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await api.post('/api/ventas', { descripcion: descripcionVenta, items: itemsVenta.map(i => ({ varianteId: parseInt(i.varianteId), cantidad: parseInt(i.cantidad) })) })
      setToast({ message: data.message, type: 'success' }); setItemsVenta([itemVacio()]); setDescripcionVenta(''); fetchData()
    } catch (err: any) { setToast({ message: err.response?.data?.error || 'Error al registrar venta', type: 'error' }) } finally { setSaving(false) }
  }
  const handleDevolucion = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await api.post('/api/movimientos/devolucion', { descripcion: motivoDevolucion, items: itemsDevolucion.map(i => ({ varianteId: parseInt(i.varianteId), cantidad: parseInt(i.cantidad) })) })
      setToast({ message: data.message, type: 'success' }); setItemsDevolucion([itemVacio()]); setMotivoDevolucion(''); fetchData()
    } catch (err: any) { setToast({ message: err.response?.data?.error || 'Error al registrar devolución', type: 'error' }) } finally { setSaving(false) }
  }
  const ventasFiltradas = ventas.filter(v => {
    const d = !filtroFechaDesde || new Date(v.creadoEn) >= new Date(filtroFechaDesde)
    const h = !filtroFechaHasta || new Date(v.creadoEn) <= new Date(filtroFechaHasta + 'T23:59:59')
    const p = !filtroProducto || v.Variante?.Producto?.nombre?.toLowerCase().includes(filtroProducto.toLowerCase())
    return d && h && p
  })
  const totalUnidadesVenta = itemsVenta.reduce((a, i) => a + (parseInt(i.cantidad) || 0), 0)
  const totalUnidadesDev = itemsDevolucion.reduce((a, i) => a + (parseInt(i.cantidad) || 0), 0)

  const s = {
    card: { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderLeft: '4px solid var(--amber)', borderRadius: '14px', padding: 'clamp(20px, 3vw, 28px)' },
    cardSmall: { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '24px' },
    input: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const },
    label: { fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', display: 'block', marginBottom: '6px' },
    select: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' as const },
    exportBtn: { background: 'var(--amber)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const },
  }

  const StockBadge = ({ varianteId }: { varianteId: string }) => {
    const qty = getStockTienda(varianteId)
    if (qty === null) return null
    const color = qty === 0 ? 'var(--red)' : qty <= 5 ? 'var(--amber)' : 'var(--teal)'
    const bg = qty === 0 ? 'var(--red-bg)' : qty <= 5 ? 'var(--amber-bg)' : 'var(--teal-bg)'
    const border = qty === 0 ? 'var(--red-border)' : qty <= 5 ? 'var(--amber-border)' : 'var(--teal-border)'
    return <span style={{ fontSize: '11px', fontWeight: '600', color, background: bg, border: `1px solid ${border}`, borderRadius: '6px', padding: '3px 8px', whiteSpace: 'nowrap' }}>{qty === 0 ? 'Sin stock' : `${qty} en tienda`}</span>
  }

  const ItemsGrid = ({ items, update, remove, add, color, showStock }: any) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={s.label}>Productos</span>
        <button type="button" onClick={add} style={{ fontSize: '12px', color, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>+ Agregar producto</button>
      </div>
      <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', overflowX: 'auto' }}>
        {items.map((item: any, i: number) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: i < items.length - 1 ? '10px' : '0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 80px 24px', gap: '8px', alignItems: 'center', minWidth: '280px' }}>
              <select value={item.varianteId} onChange={e => update(i, 'varianteId', e.target.value)} style={s.select} required>
                <option value="">Seleccionar variante...</option>
                {todasVariantes.map((v: any) => <option key={v.id} value={v.id}>{v.productoNombre} — T{v.talla} {v.color ? `· ${v.color}` : ''}</option>)}
              </select>
              <input type="number" min="1" value={item.cantidad} onChange={e => update(i, 'cantidad', e.target.value)} placeholder="Cant." style={s.input} required />
              {items.length > 1 && <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: 0 }}>✕</button>}
            </div>
            {showStock && item.varianteId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Disponible:</span>
                <StockBadge varianteId={item.varianteId} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 48px)', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--amber-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '28px', background: 'var(--amber)', borderRadius: '4px', flexShrink: 0 }} />
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>Ventas</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '20px' }}>{ventas.length} ventas · {ventas.reduce((a, v) => a + v.cantidad, 0)} unidades vendidas</p>
      </div>

      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', width: 'fit-content', maxWidth: '100%', marginBottom: '28px', background: 'var(--bg-input)', overflowX: 'auto' }}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = tab === id
          return <button key={id} onClick={() => setTab(id)} style={{ padding: '10px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: isActive ? '600' : '400', color: isActive ? 'var(--amber)' : 'var(--text-secondary)', background: isActive ? 'var(--amber-bg)' : 'transparent', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', minWidth: '85px', flexShrink: 0 }}><Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />{label}</button>
        })}
      </div>

      {tab === 'Registrar venta' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 260px)', gap: '16px', alignItems: 'start' }}>
          <div style={s.card}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px' }}>Registrar venta</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>El stock se descuenta de tienda automáticamente</p>
            <form onSubmit={handleVenta} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ItemsGrid items={itemsVenta} update={updateItemVenta} remove={removeItemVenta} add={addItemVenta} color="var(--amber)" showStock={true} />
              <div><label style={s.label}>Observación</label><input value={descripcionVenta} onChange={e => setDescripcionVenta(e.target.value)} placeholder="Opcional" style={s.input} /></div>
              <button type="submit" disabled={saving} style={{ width: '100%', background: 'var(--amber)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>{saving ? 'Registrando...' : 'Confirmar venta'}</button>
            </form>
          </div>
          <div style={s.cardSmall}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 20px' }}>Resumen</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Productos</span><span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>{itemsVenta.filter(i => i.varianteId).length}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total uds</span><span style={{ fontSize: '28px', color: 'var(--amber)', fontWeight: '700', fontFamily: 'monospace' }}>{totalUnidadesVenta}</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Devoluciones' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 260px)', gap: '16px', alignItems: 'start' }}>
          <div style={{ ...s.card, borderLeft: '4px solid var(--red)' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px' }}>Registrar devolución</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>Los productos vuelven al stock de tienda</p>
            <form onSubmit={handleDevolucion} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ItemsGrid items={itemsDevolucion} update={updateItemDev} remove={removeItemDev} add={addItemDev} color="var(--red)" showStock={false} />
              <div><label style={s.label}>Motivo</label><input value={motivoDevolucion} onChange={e => setMotivoDevolucion(e.target.value)} placeholder="Ej: Talla incorrecta..." style={s.input} /></div>
              <button type="submit" disabled={saving} style={{ width: '100%', background: 'transparent', color: 'var(--red)', border: '1.5px solid var(--red-border)', borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>{saving ? 'Registrando...' : 'Confirmar devolución'}</button>
            </form>
          </div>
          <div style={s.cardSmall}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 20px' }}>Resumen</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Productos</span><span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>{itemsDevolucion.filter(i => i.varianteId).length}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total uds</span><span style={{ fontSize: '28px', color: 'var(--red)', fontWeight: '700', fontFamily: 'monospace' }}>{totalUnidadesDev}</span></div>
            </div>
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}><p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Devoluciones: {devoluciones.length}</p></div>
          </div>
        </div>
      )}

      {tab === 'Historial' && (
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={filtroProducto} onChange={e => setFiltroProducto(e.target.value)} placeholder="Buscar producto..." style={{ ...s.input, width: '180px', flex: '1 1 160px' }} />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)} style={{ ...s.input, width: '140px', padding: '6px 10px', fontSize: '12px' }} />
              <input type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)} style={{ ...s.input, width: '140px', padding: '6px 10px', fontSize: '12px' }} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{ventasFiltradas.length} de {ventas.length}</span>
            <button onClick={() => exportarVentas(ventasFiltradas)} style={s.exportBtn}>↓ Excel</button>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--amber-border)', background: 'var(--amber-bg)' }}>
                {['Producto', 'Talla', 'SKU', 'Cantidad', 'Cajero', 'Fecha'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: '11px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '14px 20px', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Cargando...</td></tr>
                : ventasFiltradas.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Sin ventas</td></tr>
                : ventasFiltradas.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text)', fontWeight: '500', whiteSpace: 'nowrap' }}>{v.Variante?.Producto?.nombre}</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{v.Variante?.talla}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v.Variante?.sku}</td>
                    <td style={{ padding: '12px 20px' }}><span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: 'var(--amber)', background: 'var(--amber-bg)', padding: '3px 10px', borderRadius: '6px', border: '1px solid var(--amber-border)', whiteSpace: 'nowrap' }}>{v.cantidad} uds</span></td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{v.Usuario?.nombre}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(v.creadoEn).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
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
