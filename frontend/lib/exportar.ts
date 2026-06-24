import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const exportarStock = (stock: any[]) => {
  const datos = stock.map(s => ({
    'Producto': s.Variante?.Producto?.nombre || '',
    'Código': s.Variante?.Producto?.codigo || '',
    'Categoría': s.Variante?.Producto?.categoria || '',
    'Talla': s.Variante?.talla || '',
    'Color': s.Variante?.color || '',
    'SKU': s.Variante?.sku || '',
    'Ubicación': s.ubicacion || '',
    'Stock': s.cantidad,
  }))

  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 18 },
    { wch: 8 }, { wch: 12 }, { wch: 18 },
    { wch: 10 }, { wch: 8 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Stock')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `StockFlow_Stock_${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.xlsx`)
}

export const exportarMovimientos = (movimientos: any[]) => {
  const datos = movimientos.map(m => ({
    'Tipo': m.tipo || '',
    'Producto': m.Variante?.Producto?.nombre || '',
    'Talla': m.Variante?.talla || '',
    'SKU': m.Variante?.sku || '',
    'Cantidad': m.cantidad,
    'Origen': m.origenUbicacion || '-',
    'Destino': m.destinoUbicacion || '-',
    'Detalle': m.descripcion || '',
    'Responsable': m.Usuario?.nombre || '',
    'Fecha': new Date(m.creadoEn).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  }))

  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()

  ws['!cols'] = [
    { wch: 12 }, { wch: 25 }, { wch: 8 }, { wch: 18 },
    { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 30 },
    { wch: 20 }, { wch: 18 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Movimientos')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `StockFlow_Movimientos_${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.xlsx`)
}

export const exportarVentas = (ventas: any[]) => {
  const datos = ventas.map(v => ({
    'Producto': v.Variante?.Producto?.nombre || '',
    'Categoría': v.Variante?.Producto?.categoria || '',
    'Talla': v.Variante?.talla || '',
    'SKU': v.Variante?.sku || '',
    'Cantidad': v.cantidad,
    'Cajero': v.Usuario?.nombre || '',
    'Observación': v.descripcion || '',
    'Fecha': new Date(v.creadoEn).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  }))

  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()

  ws['!cols'] = [
    { wch: 25 }, { wch: 18 }, { wch: 8 }, { wch: 18 },
    { wch: 8 }, { wch: 20 }, { wch: 25 }, { wch: 18 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Ventas')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `StockFlow_Ventas_${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.xlsx`)
}
