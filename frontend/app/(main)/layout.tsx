'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  IconLayoutDashboard,
  IconHanger,
  IconPackage,
  IconShoppingCart,
  IconLogout,
  IconMenu2,
  IconX,
} from '@tabler/icons-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard, color: 'var(--fp-red)' },
  { href: '/productos', label: 'Productos', icon: IconHanger, color: 'var(--blue)' },
  { href: '/inventario', label: 'Inventario', icon: IconPackage, color: 'var(--teal)' },
  { href: '/ventas', label: 'Ventas', icon: IconShoppingCart, color: 'var(--amber)' },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [usuario, setUsuario] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const u = localStorage.getItem('usuario')
    if (!token || !u) { router.push('/login'); return }
    setUsuario(JSON.parse(u))
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    router.push('/login')
  }

  const activeColor = navItems.find(n => n.href === pathname)?.color || 'var(--fp-red)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100%',
        top: 0,
        left: isMobile ? (sidebarOpen ? 0 : '-220px') : 0,
        zIndex: 100,
        transition: 'left 0.2s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '22px', background: 'var(--fp-red)', borderRadius: '3px' }} />
              <div style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text)' }}>
                Stock<span style={{ color: 'var(--fp-red)' }}>Flow</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '14px' }}>Fashion's Park</div>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
              <IconX size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                fontSize: '14px', fontWeight: isActive ? '600' : '400',
                color: isActive ? item.color : 'var(--text-secondary)',
                background: isActive ? `${item.color}12` : 'transparent',
                textDecoration: 'none', marginBottom: '4px',
                borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
              }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Módulo activo */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: `${activeColor}08` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeColor }} />
            <span style={{ fontSize: '11px', color: activeColor, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {navItems.find(n => n.href === pathname)?.label || 'StockFlow'}
            </span>
          </div>
        </div>

        {/* Usuario */}
        {usuario && (
          <div style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--fp-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                {usuario.nombre?.charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario.nombre}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{usuario.rol}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              <IconLogout size={14} strokeWidth={1.8} />
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      {/* Overlay móvil */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
      )}

      {/* Header móvil */}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '56px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 98 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 0 }}>
            <IconMenu2 size={22} />
          </button>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>
            Stock<span style={{ color: 'var(--fp-red)' }}>Flow</span>
          </div>
          <div style={{ width: '22px' }} />
        </div>
      )}

      {/* Main */}
      <main style={{
        marginLeft: isMobile ? 0 : '220px',
        marginTop: isMobile ? '56px' : 0,
        flex: 1,
        minHeight: '100vh',
        background: 'var(--bg)',
        width: isMobile ? '100%' : 'calc(100% - 220px)',
        overflowX: 'hidden',
      }}>
        {children}
      </main>
    </div>
  )
}
