import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StockFlow — Fashion\'s Park',
  description: 'Sistema de gestión de inventario en tiempo real',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
