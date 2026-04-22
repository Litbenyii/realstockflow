import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  usuario?: {
    id: number
    email: string
    rol: string
    tiendaId: number
  }
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthRequest['usuario']
    req.usuario = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
