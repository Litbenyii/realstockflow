import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres123@localhost:5433/stockflow_dev'
    }
  }
})

export default prisma
