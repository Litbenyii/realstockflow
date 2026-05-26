import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export const registro = async (req: Request, res: Response) => {
  try {
    const { nombre, rut, email, password, rol, tiendaId } = req.body

    if (!nombre || !rut || !email || !password || !rol || !tiendaId) {
      res.status(400).json({ error: 'Todos los campos son requeridos' })
      return
    }

    const rutExistente = await prisma.usuario.findUnique({ where: { rut } })
    if (rutExistente) {
      res.status(400).json({ error: 'El RUT ya está registrado' })
      return
    }

    const emailExistente = await prisma.usuario.findUnique({ where: { email } })
    if (emailExistente) {
      res.status(400).json({ error: 'El email ya está registrado' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const usuario = await prisma.usuario.create({
      data: { nombre, rut, email, password: passwordHash, rol, tiendaId }
    })

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rut: usuario.rut,
        email: usuario.email,
        rol: usuario.rol
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear usuario' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { rut, password } = req.body

    if (!rut || !password) {
      res.status(400).json({ error: 'RUT y contraseña son requeridos' })
      return
    }

    const usuario = await prisma.usuario.findUnique({ where: { rut } })

    if (!usuario) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    if (!usuario.activo) {
      res.status(401).json({ error: 'Usuario inactivo' })
      return
    }

    const passwordValida = await bcrypt.compare(password, usuario.password)
    if (!passwordValida) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    const token = jwt.sign(
      { id: usuario.id, rut: usuario.rut, email: usuario.email, rol: usuario.rol, tiendaId: usuario.tiendaId },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    )

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rut: usuario.rut,
        email: usuario.email,
        rol: usuario.rol,
        tiendaId: usuario.tiendaId
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
}

export const perfil = async (req: any, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        nombre: true,
        rut: true,
        email: true,
        rol: true,
        tiendaId: true,
        creadoEn: true
      }
    })
    res.json({ usuario })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
}
