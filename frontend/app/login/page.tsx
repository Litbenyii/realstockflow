'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

const formatearRut = (valor: string) => {
  const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase()
  if (limpio.length <= 1) return limpio
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${cuerpoFormateado}-${dv}`
}

export default function LoginPage() {
  const router = useRouter()
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRut = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRut(formatearRut(e.target.value))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const rutSinPuntos = rut.replace(/\./g, '')
      const { data } = await api.post('/api/auth/login', { rut: rutSinPuntos, password })
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
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text)', margin: 0 }}>
            Stock<span style={{ color: 'var(--teal)' }}>Flow</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>Gestión de inventario</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>RUT</label>
              <input
                type="text"
                value={rut}
                onChange={handleRut}
                placeholder="12.345.678-9"
                maxLength={12}
                style={{
                  width: '100%', background: 'var(--bg-input)',
                  border: '1.5px solid var(--border)', color: 'var(--text)',
                  borderRadius: '10px', padding: '13px 16px',
                  fontSize: '15px', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', background: 'var(--bg-input)',
                  border: '1.5px solid var(--border)', color: 'var(--text)',
                  borderRadius: '10px', padding: '13px 16px',
                  fontSize: '15px', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            {error && (
              <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red)', borderRadius: '8px', padding: '11px 14px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: 'var(--teal)', color: '#fff',
                border: 'none', borderRadius: '10px', padding: '14px',
                fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
                marginTop: '4px',
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '24px' }}>
          Fashion's Park · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
