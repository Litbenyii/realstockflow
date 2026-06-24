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

  const s = {
    input: {
      width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
      color: 'var(--text)', borderRadius: '10px', padding: '11px 14px',
      fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
      transition: 'border-color 0.15s',
    } as React.CSSProperties,
    label: {
      fontSize: '12px', color: 'var(--text-secondary)',
      display: 'block', marginBottom: '6px', fontWeight: '500',
    } as React.CSSProperties,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '-0.5px', color: 'var(--text)', margin: 0 }}>
            Stock<span style={{ color: 'var(--teal)' }}>Flow</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>Gestión de inventario</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={s.label}>RUT</label>
              <input type="text" value={rut} onChange={handleRut} placeholder="12.345.678-9" maxLength={12} style={s.input} required />
            </div>
            <div>
              <label style={s.label}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={s.input} required />
            </div>
            {error && (
              <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--red)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', background: 'var(--teal)', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
              marginTop: '4px', transition: 'opacity 0.15s',
            }}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px' }}>
          Fashion's Park · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
