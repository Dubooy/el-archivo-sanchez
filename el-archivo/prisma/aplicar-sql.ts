/* ============================================================
   APLICA prisma/sql/*.sql SOBRE LA BASE DE DATOS
   ------------------------------------------------------------
   Se ejecuta con:  npm run db:sql
   Hay reglas que Prisma no sabe declarar en el esquema —las
   restricciones CHECK y la búsqueda en español— y que sin embargo
   son parte de la estructura. Viven en SQL y se aplican aquí.

   Lánzalo DESPUÉS de cada `npm run db:migrate`: es idempotente, así
   que repetirlo no rompe nada.
   ============================================================ */

import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const DIR = join(process.cwd(), "prisma", "sql");

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Falta DIRECT_URL (o DATABASE_URL) en el archivo .env");
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  const files = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    process.stdout.write(`→ ${file} … `);
    await client.query(readFileSync(join(DIR, file), "utf8"));
    console.log("hecho");
  }

  await client.end();
  console.log(`\n✔ ${files.length} archivo(s) SQL aplicados.`);
}

main().catch((e) => {
  console.error("✖ No se pudo aplicar el SQL:", e.message);
  process.exit(1);
});
