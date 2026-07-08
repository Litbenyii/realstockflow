#!/bin/sh
echo "→ Ejecutando migraciones..."
npx prisma migrate deploy
echo "→ Cargando datos iniciales..."
node dist/seed.js
echo "→ Iniciando servidor..."
node dist/index.js
