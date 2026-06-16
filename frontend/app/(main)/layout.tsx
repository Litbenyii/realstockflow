'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/productos', label: 'Productos' },
  { href: '/inventario', label: 'Inventario' },
  { href: '/movimientos', label: 'Movimientos' },
  { href: '/ventas', label: 'Ventas' },
]

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

  return (
    <div className="min-h-screen bg-black flex">
      <aside className="w-60 bg-zinc-950 border-r border-zinc-800/60 flex flex-col fixed h-full">
        <div className="px-6 py-7">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Stock<span className="text-teal-400">Flow</span>
          </h1>
          <p className="text-zinc-600 text-xs mt-0.5">Fashion's Park</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                pathname === item.href
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {usuario && (
          <div className="px-4 py-5 border-t border-zinc-800/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                {usuario.nombre?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{usuario.nombre}</p>
                <p className="text-zinc-500 text-xs">{usuario.rol}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-zinc-600 hover:text-red-400 text-xs transition-colors">
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      <main className="ml-60 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}
