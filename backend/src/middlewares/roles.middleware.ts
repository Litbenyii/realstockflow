import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'

export const verificarRol = (...rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      res.status(401).json({ error: 'No autenticado' })
      return
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({ error: 'No tienes permisos para realizar esta acción' })
      return
    }

    next()
  }
}
