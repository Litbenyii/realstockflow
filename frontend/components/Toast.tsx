'use client'

import { useEffect } from 'react'
import { IconCircleCheck, IconAlertCircle, IconX } from '@tabler/icons-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  autoClose?: number
}

export default function Toast({ message, type, onClose, autoClose = 5000 }: ToastProps) {
  useEffect(() => {
    if (autoClose) {
      const t = setTimeout(onClose, autoClose)
      return () => clearTimeout(t)
    }
  }, [message])

  const isSuccess = type === 'success'
  const color = isSuccess ? 'var(--teal)' : 'var(--red)'
  const bg = isSuccess ? 'var(--teal-bg)' : 'var(--red-bg)'
  const border = isSuccess ? 'var(--teal-border)' : 'var(--red-border)'

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      background: 'var(--bg-card)', border: `1.5px solid ${border}`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '12px', padding: '14px 16px',
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      maxWidth: '360px', minWidth: '280px',
      animation: 'slideIn 0.2s ease',
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      {isSuccess
        ? <IconCircleCheck size={20} style={{ color, flexShrink: 0, marginTop: '1px' }} />
        : <IconAlertCircle size={20} style={{ color, flexShrink: 0, marginTop: '1px' }} />
      }
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', margin: '0 0 2px' }}>
          {isSuccess ? 'Operación exitosa' : 'Error'}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{message}</p>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, flexShrink: 0 }}>
        <IconX size={16} />
      </button>
    </div>
  )
}
