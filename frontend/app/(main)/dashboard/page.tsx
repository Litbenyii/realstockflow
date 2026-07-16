'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function DashboardPage() {
  const [stock, setStock] = useState<any[]>([])
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockRes, movRes] = await Promise.all([
          api.get('/api/inventario/stock'),
          api.get('/api/movimientos'),
        ])
        setStock(stockRes.data.stock)
        setMovimientos(movRes.data.movimientos)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const stockBodega = stock.filter(s => s.ubicacion === 'BODEGA').reduce((a, s) => a + s.cantidad, 0)
  const stockTienda = stock.filter(s => s.ubicacion === 'TIENDA').reduce((a, s) => a + s.cantidad, 0)
  const criticos = stock.filter(s => s.cantidad <= 5)

  const tipoMeta: any = {
    INGRESO:    { color: 'var(--teal)',   label: 'Ingreso'    },
    TRASLADO:   { color: 'var(--violet)', label: 'Traslado'   },
    VENTA:      { color: 'var(--amber)',  label: 'Venta'      },
    DEVOLUCION: { color: 'var(--red)',    label: 'Devolución' },
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--fp-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 48px)', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--fp-red-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '28px', background: 'var(--fp-red)', borderRadius: '4px', flexShrink: 0 }} />
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>Dashboard</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '20px' }}>
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Stock total', value: stockBodega + stockTienda, color: 'var(--text)', accent: 'var(--fp-red)' },
          { label: 'En bodega', value: stockBodega, color: 'var(--violet)', accent: 'var(--violet)' },
          { label: 'En tienda', value: stockTienda, color: 'var(--teal)', accent: 'var(--teal)' },
          { label: 'Stock crítico', value: criticos.length, color: criticos.length > 0 ? 'var(--red)' : 'var(--text)', accent: criticos.length > 0 ? 'var(--red)' : 'var(--border)' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderLeft: `4px solid ${stat.accent}`, borderRadius: '14px', padding: '20px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>{stat.label}</p>
            <p style={{ fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: '700', color: stat.color, margin: 0, letterSpacing: '-1px' }}>
              {stat.value}<span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '4px' }}>uds</span>
            </p>
          </div>
        ))}
      </div>

      {/* Grid inferior */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

        {/* Movimientos */}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '4px', height: '14px', background: 'var(--fp-red)', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }} />
            Movimientos recientes
          </p>
          {movimientos.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Sin movimientos</p>
          ) : movimientos.slice(0, 6).map((m) => {
            const meta = tipoMeta[m.tipo] || { color: 'var(--text-secondary)', label: m.tipo }
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: meta.color, background: `${meta.color}12`, padding: '3px 8px', borderRadius: '5px', border: `1px solid ${meta.color}25`, flexShrink: 0 }}>{meta.label}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.Variante?.Producto?.nombre} · T{m.Variante?.talla}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>{m.cantidad} uds</span>
              </div>
            )
          })}
        </div>

        {/* Críticos */}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderLeft: '4px solid var(--red)', borderRadius: '14px', padding: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '4px', height: '14px', background: 'var(--red)', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }} />
            Stock crítico
          </p>
          {criticos.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Sin alertas ✓</p>
          ) : criticos.slice(0, 6).map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)', gap: '8px' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.Variante?.Producto?.nombre}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>T{s.Variante?.talla} · {s.ubicacion}</p>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: s.cantidad === 0 ? 'var(--red)' : 'var(--amber)', background: s.cantidad === 0 ? 'var(--red-bg)' : 'var(--amber-bg)', padding: '3px 10px', borderRadius: '6px', border: `1px solid ${s.cantidad === 0 ? 'var(--red-border)' : 'var(--amber-border)'}`, flexShrink: 0 }}>
                {s.cantidad} uds
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
