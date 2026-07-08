import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Verificar si ya hay datos
  const tiendaExiste = await prisma.tienda.findFirst()
  if (tiendaExiste) {
    console.log('✓ Base de datos ya inicializada')
    return
  }

  // Crear tienda
  const tienda = await prisma.tienda.create({
    data: {
      nombre: 'StockFlow',
      direccion: 'Dirección Principal',
      ciudad: 'Concepción',
      activa: true,
    }
  })

  // Crear usuarios
  const hashAdmin = await bcrypt.hash('admin123', 10)
  const hashBodega = await bcrypt.hash('bodega123', 10)
  const hashCaja = await bcrypt.hash('caja123', 10)

  await prisma.usuario.createMany({
    data: [
      { nombre: 'Administrador', rut: '12345678-9', email: 'admin@stockflow.cl', password: hashAdmin, rol: 'JEFATURA', tiendaId: tienda.id },
      { nombre: 'Carlos Mendoza', rut: '98765432-1', email: 'carlos@stockflow.cl', password: hashBodega, rol: 'BODEGUERO', tiendaId: tienda.id },
      { nombre: 'María González', rut: '11223344-5', email: 'maria@stockflow.cl', password: hashCaja, rol: 'CAJERO', tiendaId: tienda.id },
    ]
  })

  // Crear tipos de prenda
  const tipos = ['Jeans Slim', 'Jeans Wide Leg', 'Polera Básica', 'Polera Estampada', 'Blusa Lino', 'Vestido Casual', 'Short Denim', 'Pantalón Cargo', 'Polerón', 'Leggins']
  await prisma.tipoPrenda.createMany({ data: tipos.map(nombre => ({ nombre })) })

  // Crear productos
  const productos = [
    { nombre: 'Jeans Slim', codigo: 'JNS-DH-001', categoria: 'DENIM_HOMBRE', descripcion: 'Jeans slim fit hombre', variantes: [
      { talla: '30', color: 'Azul', sku: '7801234560001' },
      { talla: '32', color: 'Azul', sku: '7801234560002' },
      { talla: '34', color: 'Azul', sku: '7801234560003' },
    ]},
    { nombre: 'Jeans Wide Leg', codigo: 'JNS-DM-001', categoria: 'DENIM_MUJER', descripcion: 'Jeans wide leg mujer', variantes: [
      { talla: '28', color: 'Azul', sku: '7801234560010' },
      { talla: '30', color: 'Azul', sku: '7801234560011' },
    ]},
    { nombre: 'Polera Básica', codigo: 'POL-HC-001', categoria: 'HOMBRE_CASUAL', descripcion: 'Polera de algodón básica', variantes: [
      { talla: 'S', color: 'Blanco', sku: '7801234560020' },
      { talla: 'M', color: 'Blanco', sku: '7801234560021' },
      { talla: 'L', color: 'Blanco', sku: '7801234560022' },
    ]},
    { nombre: 'Polera Estampada', codigo: 'POL-JH-001', categoria: 'JUVENIL_HOMBRE', descripcion: 'Polera estampada juvenil', variantes: [
      { talla: 'S', color: 'Negro', sku: '7801234560030' },
      { talla: 'M', color: 'Negro', sku: '7801234560031' },
    ]},
    { nombre: 'Blusa Lino', codigo: 'BLU-MU-001', categoria: 'MUJER', descripcion: 'Blusa de lino mujer', variantes: [
      { talla: 'S', color: 'Blanco', sku: '7801234560040' },
      { talla: 'M', color: 'Blanco', sku: '7801234560041' },
      { talla: 'L', color: 'Blanco', sku: '7801234560042' },
    ]},
    { nombre: 'Vestido Casual', codigo: 'VES-SE-001', categoria: 'SENORA', descripcion: 'Vestido casual señora', variantes: [
      { talla: 'M', color: 'Rosado', sku: '7801234560050' },
      { talla: 'L', color: 'Rosado', sku: '7801234560051' },
    ]},
    { nombre: 'Polerón', codigo: 'POL-NI-001', categoria: 'NINO', descripcion: 'Polerón niño', variantes: [
      { talla: '6', color: 'Azul', sku: '7801234560070' },
      { talla: '8', color: 'Azul', sku: '7801234560071' },
    ]},
    { nombre: 'Leggins', codigo: 'LEG-NA-001', categoria: 'NINA', descripcion: 'Leggins niña', variantes: [
      { talla: '6', color: 'Negro', sku: '7801234560080' },
      { talla: '8', color: 'Negro', sku: '7801234560081' },
    ]},
  ]

  for (const prod of productos) {
    const producto = await prisma.producto.create({
      data: {
        nombre: prod.nombre,
        codigo: prod.codigo,
        categoria: prod.categoria as any,
        descripcion: prod.descripcion,
        tiendaId: tienda.id,
        Variante: { create: prod.variantes }
      },
      include: { Variante: true }
    })

    // Agregar stock en bodega
    for (const variante of producto.Variante) {
      await prisma.stock.create({
        data: {
          varianteId: variante.id,
          tiendaId: tienda.id,
          ubicacion: 'BODEGA',
          cantidad: 20,
          actualizadoEn: new Date(),
        }
      })
      // Stock en tienda
      await prisma.stock.create({
        data: {
          varianteId: variante.id,
          tiendaId: tienda.id,
          ubicacion: 'TIENDA',
          cantidad: 8,
          actualizadoEn: new Date(),
        }
      })
    }
  }

  console.log('✅ Base de datos inicializada con datos de demo')
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
