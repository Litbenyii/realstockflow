import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import productosRoutes from './routes/productos.routes'
import inventarioRoutes from './routes/inventario.routes'
import movimientosRoutes from './routes/movimientos.routes'
import ventasRoutes from './routes/ventas.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/ping', (req, res) => {
  res.json({ message: 'StockFlow API funcionando ✅', status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/inventario', inventarioRoutes)
app.use('/api/movimientos', movimientosRoutes)
app.use('/api/ventas', ventasRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})

export default app
