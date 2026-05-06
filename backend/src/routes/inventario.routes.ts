import { Router } from 'express'
import {
  registrarIngreso,
  getStock,
  getStockVariante
} from '../controllers/inventario.controller'
import { verificarToken } from '../middlewares/auth.middleware'
import { verificarRol } from '../middlewares/roles.middleware'

const router = Router()

router.post('/ingreso', verificarToken, verificarRol('JEFATURA', 'BODEGUERO'), registrarIngreso)
router.get('/stock', verificarToken, getStock)
router.get('/stock/:varianteId', verificarToken, getStockVariante)

export default router
