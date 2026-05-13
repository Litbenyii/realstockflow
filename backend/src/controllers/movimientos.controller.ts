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

    // Verificar stock en bodega
    const stockBodega = await prisma.stock.findUnique({
      where: {
        varianteId_tiendaId_ubicacion: {
          varianteId,
          tiendaId,
          ubicacion: 'BODEGA'
        }
      }
    })

    if (!stockBodega || stockBodega.cantidad < cantidad) {
      res.status(400).json({ 
        error: 'Stock insuficiente en bodega',
        stockDisponible: stockBodega?.cantidad || 0
      })
      return
    }

    // Descontar de bodega
    await prisma.stock.update({
      where: { id: stockBodega.id },
      data: {
        cantidad: stockBodega.cantidad - cantidad,
        actualizadoEn: new Date()
      }
    })

    // Sumar en tienda
    const stockTienda = await prisma.stock.findUnique({
      where: {
        varianteId_tiendaId_ubicacion: {
          varianteId,
          tiendaId,
          ubicacion: 'TIENDA'
        }
      }
    })

    if (stockTienda) {
      await prisma.stock.update({
        where: { id: stockTienda.id },
        data: {
          cantidad: stockTienda.cantidad + cantidad,
          actualizadoEn: new Date()
        }
      })
    } else {
      await prisma.stock.create({
        data: {
          varianteId,
          tiendaId,
          ubicacion: 'TIENDA',
          cantidad,
          actualizadoEn: new Date()
        }
      })
    }

    // Registrar movimiento
    await prisma.movimientoStock.create({
      data: {
        tipo: 'TRASLADO',
        cantidad,
        descripcion,
        varianteId,
        tiendaId,
        usuarioId,
        origenUbicacion: 'BODEGA',
        destinoUbicacion: 'TIENDA'
      }
    })

    res.status(201).json({
      message: 'Traslado registrado exitosamente',
      cantidad,
      desde: 'BODEGA',
      hacia: 'TIENDA',
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
    const { varianteId, cantidad, descripcion } = req.body
    const { tiendaId, id: usuarioId } = req.usuario

    if (!varianteId || !cantidad || cantidad <= 0) {
      res.status(400).json({ error: 'Variante y cantidad son requeridos' })
      return
    }

    // Sumar en tienda (devolución del cliente)
    const stockTienda = await prisma.stock.findUnique({
      where: {
        varianteId_tiendaId_ubicacion: {
          varianteId,
          tiendaId,
          ubicacion: 'TIENDA'
        }
      }
    })

    if (stockTienda) {
      await prisma.stock.update({
        where: { id: stockTienda.id },
        data: {
          cantidad: stockTienda.cantidad + cantidad,
          actualizadoEn: new Date()
        }
      })
    } else {
      await prisma.stock.create({
        data: {
          varianteId,
          tiendaId,
          ubicacion: 'TIENDA',
          cantidad,
          actualizadoEn: new Date()
        }
      })
    }

    // Registrar movimiento
    await prisma.movimientoStock.create({
      data: {
        tipo: 'DEVOLUCION',
        cantidad,
        descripcion,
        varianteId,
        tiendaId,
        usuarioId,
        destinoUbicacion: 'TIENDA'
      }
    })

    res.status(201).json({
      message: 'Devolución registrada exitosamente',
      cantidad,
      stockTienda: (stockTienda?.cantidad || 0) + cantidad
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
        Variante: {
          include: { Producto: true }
        },
        Usuario: {
          select: { id: true, nombre: true, rol: true }
        }
      },
      orderBy: { creadoEn: 'desc' }
    })

    res.json({ movimientos })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener movimientos' })
  }
}
