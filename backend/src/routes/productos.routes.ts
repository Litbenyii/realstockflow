import { Router } from 'express'
import {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controllers/productos.controller'
import { verificarToken } from '../middlewares/auth.middleware'
import { verificarRol } from '../middlewares/roles.middleware'

const router = Router()

router.get('/', verificarToken, getProductos)
router.get('/:id', verificarToken, getProducto)
router.post('/', verificarToken, verificarRol('JEFATURA'), createProducto)
router.put('/:id', verificarToken, verificarRol('JEFATURA'), updateProducto)
router.delete('/:id', verificarToken, verificarRol('JEFATURA'), deleteProducto)

export default router
