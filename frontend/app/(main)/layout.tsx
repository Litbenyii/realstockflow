'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/productos', label: 'Productos' },
  { href: '/inventario', label: 'Inventario' },
  { href: '/ventas', label: 'Ventas' },
]

const moduleColor: any = {
  '/dashboard': 'var(--fp-red)',
  '/productos': 'var(--blue)',
  '/inventario': 'var(--teal)',
  '/ventas': 'var(--amber)',
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [usuario, setUsuario] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const u = localStorage.getItem('usuario')
    if (!token || !u) { router.push('/login'); return }
    setUsuario(JSON.parse(u))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    router.push('/login')
  }

  const activeColor = moduleColor[pathname] || 'var(--fp-red)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <aside style={{
        width: '220px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100%',
        top: 0,
        left: 0,
      }}>
        {/* Logo con rojo FP */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '24px', background: 'var(--fp-red)', borderRadius: '3px' }} />
            <div style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text)' }}>
              Stock<span style={{ color: 'var(--fp-red)' }}>Flow</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', marginLeft: '14px' }}>
            Fashion's Park
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const color = moduleColor[item.href]
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? color : 'var(--text-secondary)',
                background: isActive ? `${color}10` : 'transparent',
                textDecoration: 'none',
                marginBottom: '2px',
                transition: 'all 0.15s',
                borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
              }}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Indicador módulo activo */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: `${activeColor}08` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeColor }} />
            <span style={{ fontSize: '11px', color: activeColor, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {navItems.find(n => n.href === pathname)?.label || 'StockFlow'}
            </span>
          </div>
        </div>

        {/* Usuario */}
        {usuario && (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--fp-red)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '11px', fontWeight: '700',
                color: '#fff', flexShrink: 0,
              }}>
                {usuario.nombre?.charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {usuario.nombre}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{usuario.rol}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'color 0.15s' }}>
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      <main style={{ marginLeft: '220px', flex: 1, minHeight: '100vh', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
