import { Router } from 'express'
import {
  registrarTraslado,
  registrarDevolucion,
  getMovimientos
} from '../controllers/movimientos.controller'
import { verificarToken } from '../middlewares/auth.middleware'
import { verificarRol } from '../middlewares/roles.middleware'

const router = Router()

router.post('/traslado', verificarToken, verificarRol('JEFATURA', 'BODEGUERO'), registrarTraslado)
router.post('/devolucion', verificarToken, verificarRol('JEFATURA', 'CAJERO'), registrarDevolucion)
router.get('/', verificarToken, getMovimientos)

export default router
