import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Rutas
app.get('/ping', (req, res) => {
  res.json({ message: 'StockFlow API funcionando ✅', status: 'ok' })
})

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})

export default app
