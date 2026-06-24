import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const registrarVenta = async (req: any, res: Response) => {
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
          error: `Stock insuficiente en tienda`,
          stockDisponible: stockTienda?.cantidad || 0
        })
        return
      }

      await prisma.stock.update({
        where: { id: stockTienda.id },
        data: {
          cantidad: stockTienda.cantidad - cantidad,
          actualizadoEn: new Date()
        }
      })

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

      const variante = await prisma.variante.findUnique({
        where: { id: varianteId },
        include: { Producto: true }
      })

      resultados.push({
        producto: variante?.Producto.nombre,
        talla: variante?.talla,
        cantidad,
        stockRestante: stockTienda.cantidad - cantidad
      })
    }

    res.status(201).json({
      message: `Venta registrada — ${resultados.length} productos`,
      resultados
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
        Variante: { include: { Producto: true } },
        Usuario: { select: { id: true, nombre: true, rol: true } }
      },
      orderBy: { creadoEn: 'desc' }
    })

    res.json({ ventas, total: ventas.length })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener ventas' })
  }
}
