/*
  Warnings:

  - The values [HOMBRE,JUVENIL,DENIM,ACCESORIOS,OTRO] on the enum `Categoria` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Categoria_new" AS ENUM ('NINO', 'NINA', 'DENIM_HOMBRE', 'DENIM_MUJER', 'LENCERIA', 'ROPA_INTERIOR', 'JUVENIL_HOMBRE', 'JUVENIL_MUJER', 'SENORA', 'MUJER', 'HOMBRE_CASUAL', 'HOME');
ALTER TABLE "Producto" ALTER COLUMN "categoria" TYPE "Categoria_new" USING ("categoria"::text::"Categoria_new");
ALTER TYPE "Categoria" RENAME TO "Categoria_old";
ALTER TYPE "Categoria_new" RENAME TO "Categoria";
DROP TYPE "Categoria_old";
COMMIT;
