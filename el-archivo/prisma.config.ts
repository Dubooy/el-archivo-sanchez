import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/* ============================================================
   CONFIGURACIÓN DE PRISMA (v7)
   ------------------------------------------------------------
   Desde Prisma 7, las cadenas de conexión NO van en schema.prisma:
   viven aquí para las migraciones, y en el adaptador del cliente
   (src/lib/prisma.ts) para la aplicación.

   Se usa DIRECT_URL a propósito: las migraciones necesitan una
   conexión directa a Postgres, sin el pooler de Neon. Con el pooler
   fallarían a mitad, porque cada sentencia podría ir a una sesión
   distinta.
   ============================================================ */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // `npx prisma db seed` ejecutará esto.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
