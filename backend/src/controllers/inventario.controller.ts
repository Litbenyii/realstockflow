import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const registrarIngreso = async (req: any, res: Response) => {
  try {
    const { varianteId, cantidad, descripcion } = req.body
    const { tiendaId, id: usuarioId } = req.usuario

    if (!varianteId || !cantidad || cantidad <= 0) {
      res.status(400).json({ error: 'Variante y cantidad son requeridos' })
      return
    }

    const variante = await prisma.variante.findFirst({
      where: {
        id: varianteId,
        Producto: { tiendaId }
      },
      include: { Producto: true }
    })

    if (!variante) {
      res.status(404).json({ error: 'Variante no encontrada' })
      return
    }

    const stockExistente = await prisma.stock.findUnique({
      where: {
        varianteId_tiendaId_ubicacion: {
          varianteId,
          tiendaId,
          ubicacion: 'BODEGA'
        }
      }
    })

    if (stockExistente) {
      await prisma.stock.update({
        where: { id: stockExistente.id },
        data: {
          cantidad: stockExistente.cantidad + cantidad,
          actualizadoEn: new Date()
        }
      })
    } else {
      await prisma.stock.create({
        data: {
          varianteId,
          tiendaId,
          ubicacion: 'BODEGA',
          cantidad,
          actualizadoEn: new Date()
        }
      })
    }

    await prisma.movimientoStock.create({
      data: {
        tipo: 'INGRESO',
        cantidad,
        descripcion,
        varianteId,
        tiendaId,
        usuarioId,
        destinoUbicacion: 'BODEGA'
      }
    })

    const stockActualizado = await prisma.stock.findUnique({
      where: {
        varianteId_tiendaId_ubicacion: {
          varianteId,
          tiendaId,
          ubicacion: 'BODEGA'
        }
      }
    })

    res.status(201).json({
      message: 'Ingreso registrado exitosamente',
      producto: variante.Producto.nombre,
      variante: `Talla ${variante.talla} - ${variante.color}`,
      cantidadIngresada: cantidad,
      stockActualBodega: stockActualizado?.cantidad
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al registrar ingreso' })
  }
}

export const getStock = async (req: any, res: Response) => {
  try {
    const { tiendaId } = req.usuario
    const { ubicacion } = req.query

    const where: any = { tiendaId }
    if (ubicacion) where.ubicacion = ubicacion

    const stock = await prisma.stock.findMany({
      where,
      include: {
        Variante: {
          include: { Producto: true }
        }
      },
      orderBy: { actualizadoEn: 'desc' }
    })

    res.json({ stock })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener stock' })
  }
}

export const getStockVariante = async (req: any, res: Response) => {
  try {
    const { varianteId } = req.params
    const { tiendaId } = req.usuario

    const stock = await prisma.stock.findMany({
      where: { varianteId: parseInt(varianteId), tiendaId },
      include: {
        Variante: {
          include: { Producto: true }
        }
      }
    })

    res.json({ stock })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener stock' })
  }
}
