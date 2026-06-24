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
    INGRESO:    { color: 'var(--teal)',    label: 'Ingreso'     },
    TRASLADO:   { color: 'var(--violet)',  label: 'Traslado'    },
    VENTA:      { color: 'var(--amber)',   label: 'Venta'       },
    DEVOLUCION: { color: 'var(--red)',     label: 'Devolución'  },
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--fp-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '48px', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '2px solid var(--fp-red-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '28px', background: 'var(--fp-red)', borderRadius: '4px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.5px', margin: 0 }}>Dashboard</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '20px' }}>
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Stock total', value: stockBodega + stockTienda, color: 'var(--text)', accent: 'var(--fp-red)', shadow: 'var(--fp-red-shadow)' },
          { label: 'En bodega', value: stockBodega, color: 'var(--violet)', accent: 'var(--violet)', shadow: 'var(--violet-bg)' },
          { label: 'En tienda', value: stockTienda, color: 'var(--teal)', accent: 'var(--teal)', shadow: 'var(--teal-shadow)' },
          { label: 'Stock crítico', value: criticos.length, color: criticos.length > 0 ? 'var(--red)' : 'var(--text)', accent: criticos.length > 0 ? 'var(--red)' : 'var(--border)', shadow: criticos.length > 0 ? 'var(--red-bg)' : 'rgba(0,0,0,0.04)' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderLeft: `4px solid ${stat.accent}`,
            borderRadius: '14px',
            padding: '22px',
            boxShadow: `0 2px 12px ${stat.shadow}`,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>{stat.label}</p>
            <p style={{ fontSize: '30px', fontWeight: '700', color: stat.color, margin: 0, letterSpacing: '-1px' }}>
              {stat.value}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '5px' }}>uds</span>
            </p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Movimientos */}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '4px', height: '14px', background: 'var(--fp-red)', borderRadius: '2px', display: 'inline-block' }} />
            Movimientos recientes
          </p>
          {movimientos.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Sin movimientos</p>
          ) : movimientos.slice(0, 6).map((m) => {
            const meta = tipoMeta[m.tipo] || { color: 'var(--text-secondary)', label: m.tipo }
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', color: meta.color,
                    background: `${meta.color}12`, padding: '3px 8px',
                    borderRadius: '5px', border: `1px solid ${meta.color}25`,
                    minWidth: '68px', textAlign: 'center',
                  }}>{meta.label}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {m.Variante?.Producto?.nombre} · T{m.Variante?.talla}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{m.cantidad} uds</span>
              </div>
            )
          })}
        </div>

        {/* Críticos */}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderLeft: '4px solid var(--red)', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px var(--red-bg)' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '4px', height: '14px', background: 'var(--red)', borderRadius: '2px', display: 'inline-block' }} />
            Stock crítico
          </p>
          {criticos.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Sin alertas ✓</p>
          ) : criticos.slice(0, 6).map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{s.Variante?.Producto?.nombre}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>T{s.Variante?.talla} · {s.ubicacion}</p>
              </div>
              <span style={{
                fontSize: '13px', fontWeight: '700', fontFamily: 'monospace',
                color: s.cantidad === 0 ? 'var(--red)' : 'var(--amber)',
                background: s.cantidad === 0 ? 'var(--red-bg)' : 'var(--amber-bg)',
                padding: '3px 10px', borderRadius: '6px',
                border: `1px solid ${s.cantidad === 0 ? 'var(--red-border)' : 'var(--amber-border)'}`,
              }}>
                {s.cantidad} uds
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
