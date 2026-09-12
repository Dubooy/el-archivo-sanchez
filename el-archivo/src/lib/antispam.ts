/* ============================================================
   PROTECCIÓN DE FORMULARIOS SIN RASTREAR AL USUARIO
   ------------------------------------------------------------
   Tres capas, de la más barata a la más cara. En este orden, porque
   las dos primeras filtran la inmensa mayoría del spam automatizado
   sin pedir permiso a nadie ni cargar scripts de terceros:

   1. HONEYPOT — un campo invisible para las personas. Los bots
      rellenan todo lo que encuentran; si ese campo llega con algo,
      es un bot. Coste: cero. Privacidad: intacta.

   2. TRAMPA DE TIEMPO — un bot rellena y envía en menos de un
      segundo; una persona tarda más. Si el envío llega demasiado
      pronto, se descarta.

   3. CAPTCHA (hCaptcha o reCAPTCHA) — solo si las dos anteriores no
      bastan, porque añade un tercero, cookies y una barrera de
      accesibilidad. Se prefiere hCaptcha por privacidad.

   IMPORTANTE: esto es la mitad cliente. La verificación de verdad
   SIEMPRE se repite en el servidor —el cliente se puede saltar— y
   está en SEGURIDAD.md con el código del endpoint.
   ============================================================ */

/** Nombre del campo trampa. Que suene apetecible para un bot. */
export const HONEYPOT_FIELD = "website";

/** Tiempo mínimo, en milisegundos, que una persona tarda en rellenar. */
export const MIN_FILL_MS = 2500;

export type HumanCheck = { ok: true } | { ok: false; reason: string };

export function checkHuman(honeypot: string, startedAt: number): HumanCheck {
  if (honeypot.trim() !== "") {
    // No se le dice al bot por qué ha fallado.
    return { ok: false, reason: "No hemos podido procesar el envío. Inténtalo de nuevo." };
  }
  if (Date.now() - startedAt < MIN_FILL_MS) {
    return {
      ok: false,
      reason: "El formulario se ha enviado demasiado rápido. Revísalo y vuelve a enviarlo.",
    };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------
   VALIDACIÓN
   Validar en el cliente es comodidad para quien escribe; validar en
   el servidor es seguridad. Estas funciones sirven para las dos.
   ------------------------------------------------------------------ */

/** Solo http(s), sin espacios y con dominio. Evita javascript: y data:. */
export function isSafeUrl(value: string): boolean {
  if (!value) return false;
  try {
    const u = new URL(value.trim());
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Correo con forma razonable. La comprobación real es enviar un mensaje. */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Longitud dentro de límites: corta el texto basura y los desbordes. */
export function inRange(value: string, min: number, max: number): boolean {
  const n = value.trim().length;
  return n >= min && n <= max;
}

/** Enlaces incrustados en un texto: más de dos suele ser spam. */
export function countLinks(text: string): number {
  return (text.match(/https?:\/\//gi) || []).length;
}

/** Limpia texto libre antes de guardarlo o mostrarlo: quita etiquetas,
    caracteres de control y espacios en exceso. NO sustituye al escapado
    de la plantilla, que es lo que evita el XSS de verdad. */
export function sanitizeText(input: string, max = 4000): string {
  return input
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s{3,}/g, "  ")
    .trim()
    .slice(0, max);
}

/* ------------------------------------------------------------------
   CAPTCHA (opcional)
   Ponlo a true y rellena la clave pública SOLO si el honeypot y la
   trampa de tiempo se te quedan cortos. El secreto NUNCA va aquí:
   vive en una variable de entorno del servidor.
   ------------------------------------------------------------------ */
export const CAPTCHA = {
  enabled: false,
  /** "hcaptcha" (recomendado por privacidad) o "recaptcha". */
  provider: "hcaptcha" as "hcaptcha" | "recaptcha",
  /** Clave pública; se puede publicar. */
  siteKey: "",
} as const;
