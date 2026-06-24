import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const registrarTraslado = async (req: any, res: Response) => {
  try {
    const { varianteId, cantidad, descripcion } = req.body
    const { tiendaId, id: usuarioId } = req.usuario

    if (!varianteId || !cantidad || cantidad <= 0) {
      res.status(400).json({ error: 'Variante y cantidad son requeridos' })
      return
    }

    const stockBodega = await prisma.stock.findUnique({
      where: { varianteId_tiendaId_ubicacion: { varianteId, tiendaId, ubicacion: 'BODEGA' } }
    })

    if (!stockBodega || stockBodega.cantidad < cantidad) {
      res.status(400).json({ error: 'Stock insuficiente en bodega', stockDisponible: stockBodega?.cantidad || 0 })
      return
    }

    await prisma.stock.update({
      where: { id: stockBodega.id },
      data: { cantidad: stockBodega.cantidad - cantidad, actualizadoEn: new Date() }
    })

    const stockTienda = await prisma.stock.findUnique({
      where: { varianteId_tiendaId_ubicacion: { varianteId, tiendaId, ubicacion: 'TIENDA' } }
    })

    if (stockTienda) {
      await prisma.stock.update({
        where: { id: stockTienda.id },
        data: { cantidad: stockTienda.cantidad + cantidad, actualizadoEn: new Date() }
      })
    } else {
      await prisma.stock.create({
        data: { varianteId, tiendaId, ubicacion: 'TIENDA', cantidad, actualizadoEn: new Date() }
      })
    }

    await prisma.movimientoStock.create({
      data: { tipo: 'TRASLADO', cantidad, descripcion, varianteId, tiendaId, usuarioId, origenUbicacion: 'BODEGA', destinoUbicacion: 'TIENDA' }
    })

    res.status(201).json({
      message: 'Traslado registrado exitosamente',
      cantidad,
      stockBodega: stockBodega.cantidad - cantidad,
      stockTienda: (stockTienda?.cantidad || 0) + cantidad
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al registrar traslado' })
  }
}

export const registrarDevolucion = async (req: any, res: Response) => {
  try {
    const { items, descripcion } = req.body
    const { tiendaId, id: usuarioId } = req.usuario

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Debe ingresar al menos un producto' })
      return
    }

    const resultados = []

    for (const item of items) {
      const { varianteId, cantidad } = item
      if (!varianteId || !cantidad || cantidad <= 0) continue

      const stockTienda = await prisma.stock.findUnique({
        where: { varianteId_tiendaId_ubicacion: { varianteId, tiendaId, ubicacion: 'TIENDA' } }
      })

      if (stockTienda) {
        await prisma.stock.update({
          where: { id: stockTienda.id },
          data: { cantidad: stockTienda.cantidad + cantidad, actualizadoEn: new Date() }
        })
      } else {
        await prisma.stock.create({
          data: { varianteId, tiendaId, ubicacion: 'TIENDA', cantidad, actualizadoEn: new Date() }
        })
      }

      await prisma.movimientoStock.create({
        data: { tipo: 'DEVOLUCION', cantidad, descripcion, varianteId, tiendaId, usuarioId, destinoUbicacion: 'TIENDA' }
      })

      const variante = await prisma.variante.findUnique({
        where: { id: varianteId },
        include: { Producto: true }
      })

      resultados.push({
        producto: variante?.Producto.nombre,
        talla: variante?.talla,
        cantidad,
        stockTienda: (stockTienda?.cantidad || 0) + cantidad
      })
    }

    res.status(201).json({
      message: `Devolución registrada — ${resultados.length} productos`,
      resultados
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al registrar devolución' })
  }
}

export const getMovimientos = async (req: any, res: Response) => {
  try {
    const { tiendaId } = req.usuario
    const { tipo } = req.query

    const where: any = { tiendaId }
    if (tipo) where.tipo = tipo

    const movimientos = await prisma.movimientoStock.findMany({
      where,
      include: {
        Variante: { include: { Producto: true } },
        Usuario: { select: { id: true, nombre: true, rol: true } }
      },
      orderBy: { creadoEn: 'desc' }
    })

    res.json({ movimientos })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener movimientos' })
  }
}
