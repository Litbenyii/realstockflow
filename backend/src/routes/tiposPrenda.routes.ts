import { Router } from 'express'
import { getTiposPrenda, createTipoPrenda, deleteTipoPrenda } from '../controllers/tiposPrenda.controller'
import { verificarToken } from '../middlewares/auth.middleware'
import { verificarRol } from '../middlewares/roles.middleware'

const router = Router()

router.get('/', verificarToken, getTiposPrenda)
router.post('/', verificarToken, verificarRol('JEFATURA'), createTipoPrenda)
router.delete('/:id', verificarToken, verificarRol('JEFATURA'), deleteTipoPrenda)

export default router
