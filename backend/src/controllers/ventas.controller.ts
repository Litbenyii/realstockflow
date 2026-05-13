import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const registrarVenta = async (req: any, res: Response) => {
  try {
    const { varianteId, cantidad, descripcion } = req.body
    const { tiendaId, id: usuarioId } = req.usuario

    if (!varianteId || !cantidad || cantidad <= 0) {
      res.status(400).json({ error: 'Variante y cantidad son requeridos' })
      return
    }

    // Verificar stock en tienda
    const stockTienda = await prisma.stock.findUnique({
      where: {
        varianteId_tiendaId_ubicacion: {
          varianteId,
          tiendaId,
          ubicacion: 'TIENDA'
        }
      }
    })

    if (!stockTienda || stockTienda.cantidad < cantidad) {
      res.status(400).json({
        error: 'Stock insuficiente en tienda',
        stockDisponible: stockTienda?.cantidad || 0
      })
      return
    }

    // Descontar stock de tienda
    await prisma.stock.update({
      where: { id: stockTienda.id },
      data: {
        cantidad: stockTienda.cantidad - cantidad,
        actualizadoEn: new Date()
      }
    })

    // Registrar movimiento tipo VENTA
    await prisma.movimientoStock.create({
      data: {
        tipo: 'VENTA',
        cantidad,
        descripcion,
        varianteId,
        tiendaId,
        usuarioId,
        origenUbicacion: 'TIENDA'
      }
    })

    // Obtener info del producto
    const variante = await prisma.variante.findUnique({
      where: { id: varianteId },
      include: { Producto: true }
    })

    res.status(201).json({
      message: 'Venta registrada exitosamente',
      producto: variante?.Producto.nombre,
      variante: `Talla ${variante?.talla} - ${variante?.color}`,
      cantidadVendida: cantidad,
      stockRestanteTienda: stockTienda.cantidad - cantidad
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al registrar venta' })
  }
}

export const getVentas = async (req: any, res: Response) => {
  try {
    const { tiendaId } = req.usuario

    const ventas = await prisma.movimientoStock.findMany({
      where: { tiendaId, tipo: 'VENTA' },
      include: {
        Variante: {
          include: { Producto: true }
        },
        Usuario: {
          select: { id: true, nombre: true, rol: true }
        }
      },
      orderBy: { creadoEn: 'desc' }
    })

    res.json({ ventas, total: ventas.length })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener ventas' })
  }
}
