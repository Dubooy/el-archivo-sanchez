import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireUser, type SessionUser } from "@/lib/session";
import { HONEYPOT_FIELD, MIN_FILL_MS, checkHuman, countLinks, isSafeUrl, sanitizeText } from "@/lib/antispam";

/* ============================================================
   LA PUERTA
   ------------------------------------------------------------
   Toda mutación pasa por aquí, y en este orden:

     1. SESIÓN      ¿quién eres? Sin sesión no se escribe nada.
     2. RITMO       ¿cuántas veces en el último minuto?
     3. HUMANIDAD   campo trampa y tiempo de relleno.
     4. FORMA       longitudes, enlaces, exceso de URLs.
     5. LIMPIEZA    se quitan etiquetas y caracteres de control.

   Los pasos 3, 4 y 5 ya existían en el formulario. Aquí se repiten
   en el servidor, y esta es la copia que cuenta: la del navegador es
   comodidad para quien escribe, no seguridad. Cualquiera puede
   mandar una petición con `curl` saltándose el formulario entero.

   `import "server-only"` es un seguro: si alguien importa este
   archivo desde un componente de cliente, la compilación falla en
   lugar de filtrar la lógica —y las claves— al navegador.
   ============================================================ */

export type Fallo = { ok: false; error: string; campo?: string };
export type Exito<T = undefined> = { ok: true; mensaje: string; dato?: T };
export type Resultado<T = undefined> = Exito<T> | Fallo;

export const fallo = (error: string, campo?: string): Fallo => ({ ok: false, error, campo });
export const exito = <T>(mensaje: string, dato?: T): Exito<T> => ({ ok: true, mensaje, dato });

/* ------------------------------------------------------------------
   HUELLA DE ORIGEN
   Nunca se guarda la IP: se guarda un hash con sal. Sirve igual para
   frenar abuso y no construye un registro de quién ha leído qué
   (minimización, art. 5.1.c del RGPD).
   ------------------------------------------------------------------ */
export async function ipHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconocida";
  const sal = process.env.IP_SALT ?? "sal-por-defecto-cambiala-en-produccion";
  return createHash("sha256").update(`${ip}:${sal}`).digest("hex").slice(0, 40);
}

/* ------------------------------------------------------------------
   LÍMITE DE RITMO
   Ventana deslizante sobre la tabla rate_limits. Las filas caducan
   solas: `purgar_datos_tecnicos()` las borra, y de todas formas la
   consulta solo mira la última ventana.
   ------------------------------------------------------------------ */
export async function limitarRitmo(ruta: string, maximo: number, ventanaSeg = 60): Promise<boolean> {
  const huella = await ipHash();
  const desde = new Date(Date.now() - ventanaSeg * 1000);

  const usados = await prisma.rateLimit.count({
    where: { ipHash: huella, route: ruta, at: { gte: desde } },
  });
  if (usados >= maximo) return false;

  await prisma.rateLimit.create({
    data: {
      ipHash: huella,
      route: ruta,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  return true;
}

/* ------------------------------------------------------------------
   COMPROBACIÓN COMPLETA
   ------------------------------------------------------------------ */

export type Contexto = { user: SessionUser; ip: string };

export async function comprobar(
  formData: FormData,
  opciones: { ruta: string; maximo?: number },
): Promise<{ ok: true; ctx: Contexto } | Fallo> {
  // 1. Sesión. requireUser lanza; se traduce a un fallo con mensaje.
  let user: SessionUser;
  try {
    user = await requireUser();
  } catch (e) {
    return fallo(e instanceof Error ? e.message : "Necesitas iniciar sesión.");
  }

  // 2. Ritmo.
  const dentro = await limitarRitmo(opciones.ruta, opciones.maximo ?? 5);
  if (!dentro) {
    return fallo("Has enviado demasiadas cosas seguidas. Espera un minuto y vuelve a intentarlo.");
  }

  // 3. Humanidad: campo trampa y tiempo de relleno.
  const trampa = String(formData.get(HONEYPOT_FIELD) ?? "");
  const inicio = Number(formData.get("startedAt") ?? 0);
  const humano = checkHuman(trampa, Number.isFinite(inicio) && inicio > 0 ? inicio : 0);
  if (!humano.ok) {
    // Si el envío llega sin marca de tiempo, se trata como demasiado
    // rápido: es exactamente lo que hace un bot que arma el POST a mano.
    return fallo(humano.reason);
  }

  return { ok: true, ctx: { user, ip: await ipHash() } };
}

/* ------------------------------------------------------------------
   VALIDACIÓN DE CAMPOS
   Devuelve el texto ya limpio, o un fallo con el campo señalado para
   que el formulario pueda marcarlo.
   ------------------------------------------------------------------ */

export function texto(
  formData: FormData,
  campo: string,
  { min, max, etiqueta }: { min: number; max: number; etiqueta: string },
): string | Fallo {
  const bruto = String(formData.get(campo) ?? "");
  const limpio = sanitizeText(bruto, max);
  if (limpio.length < min) {
    return fallo(`${etiqueta}: escribe al menos ${min} caracteres.`, campo);
  }
  if (countLinks(limpio) > 3) {
    return fallo(`${etiqueta}: demasiados enlaces en el texto.`, campo);
  }
  return limpio;
}

export function enlace(
  formData: FormData,
  campo: string,
  { obligatorio, etiqueta }: { obligatorio: boolean; etiqueta: string },
): string | null | Fallo {
  const valor = String(formData.get(campo) ?? "").trim();
  if (!valor) {
    return obligatorio ? fallo(`${etiqueta}: hace falta un enlace.`, campo) : null;
  }
  if (!isSafeUrl(valor)) {
    return fallo(`${etiqueta}: el enlace tiene que empezar por http:// o https://`, campo);
  }
  return valor;
}

export function opcion<T extends string>(
  formData: FormData,
  campo: string,
  validas: readonly T[],
  etiqueta: string,
): T | Fallo {
  const valor = String(formData.get(campo) ?? "");
  return (validas as readonly string[]).includes(valor)
    ? (valor as T)
    : fallo(`${etiqueta}: opción no válida.`, campo);
}

/** Estrecha el tipo: `if (esFallo(x)) return x;` */
export const esFallo = (v: unknown): v is Fallo =>
  typeof v === "object" && v !== null && (v as Fallo).ok === false;

export { HONEYPOT_FIELD, MIN_FILL_MS };
