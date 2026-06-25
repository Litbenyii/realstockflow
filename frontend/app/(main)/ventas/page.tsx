'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { exportarVentas } from '@/lib/exportar'

const TABS = ['Registrar venta', 'Devoluciones', 'Historial']
const itemVacio = () => ({ varianteId: '', cantidad: '1' })

export default function VentasPage() {
  const [tab, setTab] = useState('Registrar venta')
  const [ventas, setVentas] = useState<any[]>([])
  const [devoluciones, setDevoluciones] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [itemsVenta, setItemsVenta] = useState([itemVacio()])
  const [itemsDevolucion, setItemsDevolucion] = useState([itemVacio()])
  const [descripcionVenta, setDescripcionVenta] = useState('')
  const [motivoDevolucion, setMotivoDevolucion] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroProducto, setFiltroProducto] = useState('')

  const fetchData = async () => {
    try {
      const [ventasRes, prodRes, movRes] = await Promise.all([
        api.get('/api/ventas'),
        api.get('/api/productos'),
        api.get('/api/movimientos'),
      ])
      setVentas(ventasRes.data.ventas)
      setDevoluciones(movRes.data.movimientos.filter((m: any) => m.tipo === 'DEVOLUCION'))
      setProductos(prodRes.data.productos)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const todasVariantes = productos.flatMap(p =>
    p.Variante?.map((v: any) => ({ ...v, productoNombre: p.nombre })) || []
  )

  const addItemVenta = () => setItemsVenta([...itemsVenta, itemVacio()])
  const removeItemVenta = (i: number) => setItemsVenta(itemsVenta.filter((_, idx) => idx !== i))
  const updateItemVenta = (i: number, field: string, value: string) => {
    const updated = [...itemsVenta]
    updated[i] = { ...updated[i], [field]: value }
    setItemsVenta(updated)
  }

  const addItemDev = () => setItemsDevolucion([...itemsDevolucion, itemVacio()])
  const removeItemDev = (i: number) => setItemsDevolucion(itemsDevolucion.filter((_, idx) => idx !== i))
  const updateItemDev = (i: number, field: string, value: string) => {
    const updated = [...itemsDevolucion]
    updated[i] = { ...updated[i], [field]: value }
    setItemsDevolucion(updated)
  }

  const handleVenta = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const { data } = await api.post('/api/ventas', {
        descripcion: descripcionVenta,
        items: itemsVenta.map(i => ({ varianteId: parseInt(i.varianteId), cantidad: parseInt(i.cantidad) }))
      })
      setSuccess(`✓ ${data.message}`)
      setItemsVenta([itemVacio()]); setDescripcionVenta('')
      fetchData()
    } catch (err: any) { setError(err.response?.data?.error || 'Error al registrar venta') }
    finally { setSaving(false) }
  }

  const handleDevolucion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const { data } = await api.post('/api/movimientos/devolucion', {
        descripcion: motivoDevolucion,
        items: itemsDevolucion.map(i => ({ varianteId: parseInt(i.varianteId), cantidad: parseInt(i.cantidad) }))
      })
      setSuccess(`✓ ${data.message}`)
      setItemsDevolucion([itemVacio()]); setMotivoDevolucion('')
      fetchData()
    } catch (err: any) { setError(err.response?.data?.error || 'Error al registrar devolución') }
    finally { setSaving(false) }
  }

  const ventasFiltradas = ventas.filter(v => {
    const desdeOk = !filtroFechaDesde || new Date(v.creadoEn) >= new Date(filtroFechaDesde)
    const hastaOk = !filtroFechaHasta || new Date(v.creadoEn) <= new Date(filtroFechaHasta + 'T23:59:59')
    const productoOk = !filtroProducto || v.Variante?.Producto?.nombre?.toLowerCase().includes(filtroProducto.toLowerCase())
    return desdeOk && hastaOk && productoOk
  })

  const totalUnidadesVenta = itemsVenta.reduce((a, i) => a + (parseInt(i.cantidad) || 0), 0)
  const totalUnidadesDev = itemsDevolucion.reduce((a, i) => a + (parseInt(i.cantidad) || 0), 0)

  const s = {
    card: { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderLeft: '4px solid var(--amber)', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 12px var(--amber-bg)' } as React.CSSProperties,
    cardSmall: { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } as React.CSSProperties,
    input: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' } as React.CSSProperties,
    label: { fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', display: 'block', marginBottom: '6px' },
    select: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' } as React.CSSProperties,
    exportBtn: { background: 'var(--amber)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px var(--amber-shadow)' } as React.CSSProperties,
  }

  const ItemsGrid = ({ items, update, remove, add, color }: any) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={s.label}>Productos</span>
        <button type="button" onClick={add} style={{ fontSize: '12px', color, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
          + Agregar producto
        </button>
      </div>
      <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 24px', gap: '8px' }}>
          <span style={{ ...s.label, margin: 0 }}>Variante</span>
          <span style={{ ...s.label, margin: 0 }}>Cant.</span>
          <span />
        </div>
        {items.map((item: any, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 24px', gap: '8px', alignItems: 'center' }}>
            <select value={item.varianteId} onChange={e => update(i, 'varianteId', e.target.value)} style={s.select} required>
              <option value="">Seleccionar...</option>
              {todasVariantes.map((v: any) => (
                <option key={v.id} value={v.id}>{v.productoNombre} — T{v.talla} {v.color ? `· ${v.color}` : ''}</option>
              ))}
            </select>
            <input type="number" min="1" value={item.cantidad} onChange={e => update(i, 'cantidad', e.target.value)} style={s.input} required />
            {items.length > 1 && (
              <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: 0 }}>✕</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ padding: '48px', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--amber-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '28px', background: 'var(--amber)', borderRadius: '4px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>Ventas</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '20px' }}>
          {ventas.length} ventas · {ventas.reduce((a, v) => a + v.cantidad, 0)} unidades vendidas
        </p>
      </div>

      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', width: 'fit-content', marginBottom: '28px' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
            style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: tab === t ? '600' : '400', color: tab === t ? 'var(--amber)' : 'var(--text-secondary)', background: tab === t ? 'var(--amber-bg)' : 'transparent', border: tab === t ? '1px solid var(--amber-border)' : '1px solid transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t}
          </button>
        ))}
      </div>

      {success && <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', color: 'var(--teal)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', marginBottom: '20px' }}>{success}</div>}
      {error && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

      {tab === 'Registrar venta' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px', alignItems: 'start' }}>
          <div style={s.card}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px' }}>Registrar venta</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>El stock se descuenta de tienda automáticamente</p>
            <form onSubmit={handleVenta} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ItemsGrid items={itemsVenta} update={updateItemVenta} remove={removeItemVenta} add={addItemVenta} color="var(--amber)" />
              <div>
                <label style={s.label}>Observación</label>
                <input value={descripcionVenta} onChange={e => setDescripcionVenta(e.target.value)} placeholder="Opcional" style={s.input} />
              </div>
              <button type="submit" disabled={saving} style={{ width: '100%', background: 'var(--amber)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1, boxShadow: '0 4px 12px var(--amber-shadow)' }}>
                {saving ? 'Registrando...' : 'Confirmar venta'}
              </button>
            </form>
          </div>
          <div style={s.cardSmall}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 20px' }}>Resumen</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Productos</span>
                <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>{itemsVenta.filter(i => i.varianteId).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total unidades</span>
                <span style={{ fontSize: '28px', color: 'var(--amber)', fontWeight: '700', fontFamily: 'monospace' }}>{totalUnidadesVenta}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Devoluciones' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px', alignItems: 'start' }}>
          <div style={{ ...s.card, borderLeft: '4px solid var(--red)', boxShadow: '0 2px 12px var(--red-bg)' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px' }}>Registrar devolución</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>Los productos vuelven al stock de tienda</p>
            <form onSubmit={handleDevolucion} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ItemsGrid items={itemsDevolucion} update={updateItemDev} remove={removeItemDev} add={addItemDev} color="var(--red)" />
              <div>
                <label style={s.label}>Motivo</label>
                <input value={motivoDevolucion} onChange={e => setMotivoDevolucion(e.target.value)} placeholder="Ej: Talla incorrecta, producto defectuoso..." style={s.input} />
              </div>
              <button type="submit" disabled={saving} style={{ width: '100%', background: 'transparent', color: 'var(--red)', border: '1.5px solid var(--red-border)', borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Registrando...' : 'Confirmar devolución'}
              </button>
            </form>
          </div>
          <div style={s.cardSmall}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 20px' }}>Resumen</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Productos</span>
                <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>{itemsDevolucion.filter(i => i.varianteId).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total unidades</span>
                <span style={{ fontSize: '28px', color: 'var(--red)', fontWeight: '700', fontFamily: 'monospace' }}>{totalUnidadesDev}</span>
              </div>
            </div>
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Devoluciones registradas: {devoluciones.length}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'Historial' && (
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={filtroProducto} onChange={e => setFiltroProducto(e.target.value)} placeholder="Buscar producto..." style={{ ...s.input, width: '200px' }} />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DESDE</span>
              <input type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)} style={{ ...s.input, width: '140px', padding: '6px 10px', fontSize: '12px' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>HASTA</span>
              <input type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)} style={{ ...s.input, width: '140px', padding: '6px 10px', fontSize: '12px' }} />
            </div>
            {(filtroProducto || filtroFechaDesde || filtroFechaHasta) && (
              <button onClick={() => { setFiltroProducto(''); setFiltroFechaDesde(''); setFiltroFechaHasta('') }}
                style={{ fontSize: '12px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                ✕ Limpiar
              </button>
            )}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {ventasFiltradas.length} de {ventas.length} ventas
            </span>
            <button onClick={() => exportarVentas(ventasFiltradas)} style={s.exportBtn}>
              ↓ Excel
            </button>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--amber-border)', background: 'var(--amber-bg)' }}>
                  {['Producto', 'Talla', 'SKU', 'Cantidad', 'Cajero', 'Fecha'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '11px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '14px 20px', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Cargando...</td></tr>
                ) : ventasFiltradas.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Sin ventas</td></tr>
                ) : ventasFiltradas.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{v.Variante?.Producto?.nombre}</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{v.Variante?.talla}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v.Variante?.sku}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: 'var(--amber)', background: 'var(--amber-bg)', padding: '3px 10px', borderRadius: '6px', border: '1px solid var(--amber-border)' }}>{v.cantidad} uds</span>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{v.Usuario?.nombre}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(v.creadoEn).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
