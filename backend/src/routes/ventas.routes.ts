import { Router } from 'express'
import { registrarVenta, getVentas } from '../controllers/ventas.controller'
import { verificarToken } from '../middlewares/auth.middleware'
import { verificarRol } from '../middlewares/roles.middleware'

const router = Router()

router.post('/', verificarToken, verificarRol('JEFATURA', 'CAJERO'), registrarVenta)
router.get('/', verificarToken, getVentas)

export default router
