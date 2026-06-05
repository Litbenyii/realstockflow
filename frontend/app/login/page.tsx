'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/auth/login', { rut, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      {/* Fondo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/30 via-transparent to-transparent" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Stock<span className="text-teal-400">Flow</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2 tracking-wide">Gestión de inventario</p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/60 p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">

            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-medium tracking-wider uppercase">RUT</label>
              <input
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="12345678-9"
                className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-medium tracking-wider uppercase">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-800/60 border border-zinc-700/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-black font-semibold py-3 rounded-xl text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-8">
          Fashion's Park · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
