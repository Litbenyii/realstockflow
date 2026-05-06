import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const getProductos = async (req: any, res: Response) => {
  try {
    const { tiendaId } = req.usuario
    const productos = await prisma.producto.findMany({
      where: { tiendaId },
      include: { Variante: true },
      orderBy: { creadoEn: 'desc' }
    })
    res.json({ productos })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener productos' })
  }
}

export const getProducto = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { tiendaId } = req.usuario
    const producto = await prisma.producto.findFirst({
      where: { id: parseInt(id), tiendaId },
      include: { Variante: true }
    })
    if (!producto) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }
    res.json({ producto })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener producto' })
  }
}

export const createProducto = async (req: any, res: Response) => {
  try {
    const { nombre, codigo, categoria, descripcion, variantes } = req.body
    const { tiendaId } = req.usuario

    const existe = await prisma.producto.findUnique({ where: { codigo } })
    if (existe) {
      res.status(400).json({ error: 'Ya existe un producto con ese código' })
      return
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        codigo,
        categoria,
        descripcion,
        tiendaId,
        Variante: {
          create: variantes?.map((v: any) => ({
            talla: v.talla,
            color: v.color,
            sku: v.sku
          })) || []
        }
      },
      include: { Variante: true }
    })

    res.status(201).json({ message: 'Producto creado exitosamente', producto })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear producto' })
  }
}

export const updateProducto = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, activo } = req.body
    const { tiendaId } = req.usuario

    const existe = await prisma.producto.findFirst({
      where: { id: parseInt(id), tiendaId }
    })
    if (!existe) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    const producto = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { nombre, descripcion, activo },
      include: { Variante: true }
    })

    res.json({ message: 'Producto actualizado', producto })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
}

export const deleteProducto = async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { tiendaId } = req.usuario

    const existe = await prisma.producto.findFirst({
      where: { id: parseInt(id), tiendaId }
    })
    if (!existe) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    })

    res.json({ message: 'Producto desactivado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
}
