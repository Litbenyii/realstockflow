import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const getTiposPrenda = async (req: Request, res: Response) => {
  try {
    const tipos = await prisma.tipoPrenda.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    })
    res.json({ tipos })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener tipos de prenda' })
  }
}

export const createTipoPrenda = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body
    if (!nombre) {
      res.status(400).json({ error: 'El nombre es requerido' })
      return
    }
    const existe = await prisma.tipoPrenda.findUnique({ where: { nombre } })
    if (existe) {
      res.status(400).json({ error: 'Ya existe ese tipo de prenda' })
      return
    }
    const tipo = await prisma.tipoPrenda.create({ data: { nombre } })
    res.status(201).json({ message: 'Tipo de prenda creado', tipo })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear tipo de prenda' })
  }
}

export const deleteTipoPrenda = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string)
    await prisma.tipoPrenda.update({
      where: { id },
      data: { activo: false }
    })
    res.json({ message: 'Tipo de prenda desactivado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar tipo de prenda' })
  }
}
