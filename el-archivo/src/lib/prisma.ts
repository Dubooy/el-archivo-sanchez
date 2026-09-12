import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/* ============================================================
   CLIENTE DE BASE DE DATOS
   ------------------------------------------------------------
   En Prisma 7 el cliente se conecta a través de un «adaptador»:
   aquí, el de PostgreSQL sobre node-postgres. Funciona igual en tu
   ordenador que en Neon, Supabase o cualquier Postgres.

   El singleton de abajo existe por un motivo concreto: en desarrollo
   Next.js recarga los módulos en caliente, y sin él cada recarga
   abriría una conexión nueva hasta agotar el límite del servidor.
   En producción se crea una sola vez.

   Qué URL usar:
     DATABASE_URL → la del *pooler* de Neon (termina en -pooler).
                    Es la que usa la aplicación.
     DIRECT_URL   → la conexión directa, sin pooler. Solo la usan
                    las migraciones (ver prisma.config.ts).
   ============================================================ */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Falta DATABASE_URL. Copia .env.example a .env, pega la cadena de conexión de Neon y " +
      "ejecuta `npm run db:setup` para crear las tablas y cargar los datos.",
  );
}

function build() {
  const adapter = new PrismaPg({
    connectionString,
    // Neon exige TLS. Si algún día usas un Postgres local sin TLS,
    // añade ?sslmode=disable a la URL en lugar de tocar esto.
    max: 10,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? build();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
