'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

const TABS = ['Stock', 'Registrar ingreso', 'Traslados', 'Historial']
const itemVacio = () => ({ varianteId: '', cantidad: '', numeroCaja: '1' })

export default function InventarioPage() {
  const [tab, setTab] = useState('Stock')
  const [stock, setStock] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [guiaDespacho, setGuiaDespacho] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [totalCajas, setTotalCajas] = useState('1')
  const [items, setItems] = useState([itemVacio()])
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

  const handleIngreso = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const { data } = await api.post('/api/inventario/ingreso', {
        guiaDespacho, proveedor, totalCajas: parseInt(totalCajas),
        items: items.map(i => ({ varianteId: parseInt(i.varianteId), cantidad: parseInt(i.cantidad), numeroCaja: parseInt(i.numeroCaja) }))
      })
      setSuccess(`✓ ${data.message}`)
      setGuiaDespacho(''); setProveedor(''); setTotalCajas('1'); setItems([itemVacio()])
      fetchData()
    } catch (err: any) { setError(err.response?.data?.error || 'Error al registrar ingreso') }
    finally { setSaving(false) }
  }

  const handleTraslado = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const { data } = await api.post('/api/movimientos/traslado', {
        varianteId: parseInt(formTraslado.varianteId),
        cantidad: parseInt(formTraslado.cantidad),
        descripcion: formTraslado.descripcion,
      })
      setSuccess(`✓ ${data.message} — Bodega: ${data.stockBodega} uds · Tienda: ${data.stockTienda} uds`)
      setFormTraslado({ varianteId: '', cantidad: '', descripcion: '' })
      fetchData()
    } catch (err: any) { setError(err.response?.data?.error || 'Error al registrar traslado') }
    finally { setSaving(false) }
  }

  const stockFiltrado = stock.filter(s =>
    s.Variante?.Producto?.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    s.Variante?.sku?.toLowerCase().includes(filtro.toLowerCase())
  )

  const s = {
    input: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' } as React.CSSProperties,
    label: { fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', display: 'block', marginBottom: '6px' },
    select: { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' } as React.CSSProperties,
    card: { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderLeft: '4px solid var(--teal)', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 12px var(--teal-bg)' } as React.CSSProperties,
    cardSmall: { background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' } as React.CSSProperties,
  }

  return (
    <div style={{ padding: '48px', maxWidth: '1100px' }}>

      {/* Header con acento teal */}
      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--teal-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '28px', background: 'var(--teal)', borderRadius: '4px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>Inventario</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '20px' }}>Control de stock y movimientos internos</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', width: 'fit-content', marginBottom: '28px' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
            style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: tab === t ? '600' : '400', color: tab === t ? 'var(--teal)' : 'var(--text-secondary)', background: tab === t ? 'var(--teal-bg)' : 'transparent', border: tab === t ? '1px solid var(--teal-border)' : '1px solid transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {t}
          </button>
        ))}
      </div>

      {success && <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', color: 'var(--teal)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', marginBottom: '20px' }}>{success}</div>}
      {error && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

      {/* STOCK */}
      {tab === 'Stock' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total stock', value: stock.reduce((a, s) => a + s.cantidad, 0), color: 'var(--text)', accent: 'var(--border)', shadow: 'rgba(0,0,0,0.06)' },
              { label: 'En bodega', value: stock.filter(s => s.ubicacion === 'BODEGA').reduce((a, s) => a + s.cantidad, 0), color: 'var(--violet)', accent: 'var(--violet)', shadow: 'var(--violet-bg)' },
              { label: 'En tienda', value: stock.filter(s => s.ubicacion === 'TIENDA').reduce((a, s) => a + s.cantidad, 0), color: 'var(--teal)', accent: 'var(--teal)', shadow: 'var(--teal-bg)' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderLeft: `4px solid ${stat.accent}`, borderRadius: '14px', padding: '22px', boxShadow: `0 2px 8px ${stat.shadow}` }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>{stat.label}</p>
                <p style={{ fontSize: '30px', fontWeight: '700', color: stat.color, margin: 0, letterSpacing: '-1px' }}>
                  {stat.value}<span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '5px' }}>uds</span>
                </p>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar por producto o SKU..." style={s.input} />
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--teal-border)', background: 'var(--teal-bg)' }}>
                  {['Producto', 'SKU', 'Talla', 'Ubicación', 'Stock'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '11px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '14px 20px', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Cargando...</td></tr>
                ) : stockFiltrado.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Sin registros de stock</td></tr>
                ) : stockFiltrado.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{s.Variante?.Producto?.nombre}</td>
                    <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.Variante?.sku}</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{s.Variante?.talla}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px', background: s.ubicacion === 'BODEGA' ? 'var(--violet-bg)' : 'var(--teal-bg)', color: s.ubicacion === 'BODEGA' ? 'var(--violet)' : 'var(--teal)', border: `1px solid ${s.ubicacion === 'BODEGA' ? 'var(--violet-border)' : 'var(--teal-border)'}` }}>
                        {s.ubicacion}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: s.cantidad === 0 ? 'var(--red)' : s.cantidad <= 5 ? 'var(--amber)' : 'var(--text)', background: s.cantidad === 0 ? 'var(--red-bg)' : s.cantidad <= 5 ? 'var(--amber-bg)' : 'transparent', padding: s.cantidad <= 5 ? '3px 10px' : '0', borderRadius: '6px', border: s.cantidad <= 5 ? `1px solid ${s.cantidad === 0 ? 'var(--red-border)' : 'var(--amber-border)'}` : 'none' }}>
                        {s.cantidad} uds
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTRAR INGRESO */}
      {tab === 'Registrar ingreso' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px', alignItems: 'start' }}>
          <div style={s.card}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: '0 0 4px' }}>Registrar ingreso de mercadería</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>Complete los datos del camión y las prendas recibidas</p>
            <form onSubmit={handleIngreso} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <p style={{ ...s.label, marginBottom: '12px' }}>Datos del camión</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '10px' }}>
                  <div><label style={s.label}>N° Guía</label><input value={guiaDespacho} onChange={e => setGuiaDespacho(e.target.value)} placeholder="Ej: 4521" style={s.input} /></div>
                  <div><label style={s.label}>Proveedor</label><input value={proveedor} onChange={e => setProveedor(e.target.value)} placeholder="Ej: FP Central" style={s.input} /></div>
                  <div><label style={s.label}>Total cajas</label><input type="number" min="1" value={totalCajas} onChange={e => setTotalCajas(e.target.value)} style={s.input} /></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={s.label}>Prendas recibidas</span>
                  <button type="button" onClick={addItem} style={{ fontSize: '11px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>+ Agregar prenda</button>
                </div>
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        {todasVariantes.map((v: any) => (
                          <option key={v.id} value={v.id}>{v.productoNombre} — T{v.talla} {v.color ? `· ${v.color}` : ''}</option>
                        ))}
                      </select>
                      <input type="number" min="1" value={item.cantidad} onChange={e => updateItem(i, 'cantidad', e.target.value)} placeholder="Cant." style={s.input} required />
                      <input type="number" min="1" value={item.numeroCaja} onChange={e => updateItem(i, 'numeroCaja', e.target.value)} style={s.input} />
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: 0 }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={saving} style={{ width: '100%', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1, boxShadow: '0 4px 12px var(--teal-shadow)' }}>
                {saving ? 'Registrando...' : 'Registrar ingreso en bodega'}
              </button>
            </form>
          </div>
          <div style={s.cardSmall}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 20px' }}>Resumen</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Prendas</span><span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>{items.filter(i => i.varianteId).length}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cajas</span><span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>{totalCajas}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total unidades</span>
                <span style={{ fontSize: '28px', color: 'var(--teal)', fontWeight: '700', fontFamily: 'monospace' }}>{items.reduce((a, i) => a + (parseInt(i.cantidad) || 0), 0)}</span>
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
              <div><label style={s.label}>Variante</label>
                <select value={formTraslado.varianteId} onChange={e => setFormTraslado({ ...formTraslado, varianteId: e.target.value })} style={s.select} required>
                  <option value="">Seleccionar variante...</option>
                  {todasVariantes.map((v: any) => (<option key={v.id} value={v.id}>{v.productoNombre} — T{v.talla} {v.color ? `· ${v.color}` : ''} ({v.sku})</option>))}
                </select>
              </div>
              <div><label style={s.label}>Cantidad</label><input type="number" min="1" value={formTraslado.cantidad} onChange={e => setFormTraslado({ ...formTraslado, cantidad: e.target.value })} placeholder="Ej: 10" style={s.input} required /></div>
              <div><label style={s.label}>Descripción</label><input value={formTraslado.descripcion} onChange={e => setFormTraslado({ ...formTraslado, descripcion: e.target.value })} placeholder="Opcional" style={s.input} /></div>
              <button type="submit" disabled={saving} style={{ width: '100%', background: 'var(--violet)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1, boxShadow: '0 4px 12px var(--violet-bg)' }}>
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
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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
              ) : movimientos.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '13px' }}>Sin movimientos</td></tr>
              ) : movimientos.map((m) => (
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
      )}
    </div>
  )
}
