import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export const registro = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol, tiendaId } = req.body

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      res.status(400).json({ error: 'El email ya está registrado' })
      return
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHash,
        rol,
        tiendaId
      }
    })

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
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
    const { email, password } = req.body

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    if (!usuario.activo) {
      res.status(401).json({ error: 'Usuario inactivo' })
      return
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password)

    if (!passwordValida) {
      res.status(401).json({ error: 'Credenciales incorrectas' })
      return
    }

    // Generar token
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        tiendaId: usuario.tiendaId
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    )

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
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
