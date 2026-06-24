import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const registrarIngreso = async (req: any, res: Response) => {
  try {
    const { guiaDespacho, proveedor, totalCajas, items } = req.body
    const { tiendaId, id: usuarioId } = req.usuario

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Debe ingresar al menos un producto' })
      return
    }

    const resultados = []

    for (const item of items) {
      const { varianteId, cantidad, numeroCaja } = item

      if (!varianteId || !cantidad || cantidad <= 0) continue

      const variante = await prisma.variante.findFirst({
        where: { id: varianteId, Producto: { tiendaId } },
        include: { Producto: true }
      })

      if (!variante) continue

      const stockExistente = await prisma.stock.findUnique({
        where: { varianteId_tiendaId_ubicacion: { varianteId, tiendaId, ubicacion: 'BODEGA' } }
      })

      if (stockExistente) {
        await prisma.stock.update({
          where: { id: stockExistente.id },
          data: { cantidad: stockExistente.cantidad + cantidad, actualizadoEn: new Date() }
        })
      } else {
        await prisma.stock.create({
          data: { varianteId, tiendaId, ubicacion: 'BODEGA', cantidad, actualizadoEn: new Date() }
        })
      }

      await prisma.movimientoStock.create({
        data: {
          tipo: 'INGRESO',
          cantidad,
          descripcion: `Guía: ${guiaDespacho || 'S/N'} | Proveedor: ${proveedor || 'S/N'} | Cajas: ${totalCajas || 1} | Caja N°: ${numeroCaja || 1}`,
          varianteId,
          tiendaId,
          usuarioId,
          destinoUbicacion: 'BODEGA'
        }
      })

      resultados.push({
        producto: variante.Producto.nombre,
        talla: variante.talla,
        cantidad,
        numeroCaja
      })
    }

    res.status(201).json({
      message: `Ingreso registrado — ${resultados.length} variantes procesadas`,
      guiaDespacho,
      proveedor,
      totalCajas,
      resultados
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
      include: { Variante: { include: { Producto: true } } },
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
      where: { varianteId: parseInt(varianteId as string), tiendaId },
      include: { Variante: { include: { Producto: true } } }
    })

    res.json({ stock })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener stock' })
  }
}
