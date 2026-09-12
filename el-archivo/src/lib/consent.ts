/* ============================================================
   CONSENTIMIENTO DE COOKIES  ·  RGPD + LSSI (art. 22.2)
   ------------------------------------------------------------
   Reglas que este módulo hace cumplir, y que no son opcionales:

   1. Nada que no sea estrictamente necesario se carga antes del
      consentimiento. Ni analítica, ni publicidad, ni incrustados.
   2. Rechazar tiene que costar exactamente lo mismo que aceptar:
      un clic, en un botón del mismo tamaño y con el mismo peso
      visual. Nada de «Aceptar» grande y verde frente a un enlace
      gris minúsculo.
   3. El silencio no es consentimiento: seguir navegando, hacer
      scroll o cerrar el aviso NO equivale a aceptar.
   4. Retirar el consentimiento tiene que ser tan fácil como darlo:
      de ahí el botón permanente del pie.
   5. Se guarda prueba del consentimiento: qué se aceptó, cuándo y
      con qué versión del texto. Si cambias las finalidades, sube
      CONSENT_VERSION y se vuelve a preguntar.

   El estado vive en localStorage (para la aplicación) y en una
   cookie propia (para que el servidor pueda leerlo si algún día
   renderiza distinto según el consentimiento). Ninguna de las dos
   guarda datos personales: solo un objeto con cuatro booleanos.
   ============================================================ */

export const CONSENT_KEY = "el-archivo:consent";
export const CONSENT_COOKIE = "ea_consent";
/** Súbelo cuando cambien las finalidades o los proveedores. */
export const CONSENT_VERSION = 1;
/** 6 meses: la AEPD considera razonable volver a preguntar pasado un tiempo. */
export const CONSENT_MAX_AGE_DAYS = 180;

export type ConsentCategory = "necesarias" | "preferencias" | "analitica" | "publicidad";

export type Consent = {
  necesarias: true;
  preferencias: boolean;
  analitica: boolean;
  publicidad: boolean;
  /** Fecha ISO en que se registró la decisión. */
  at: string;
  version: number;
};

export const CATEGORIES: {
  key: ConsentCategory;
  name: string;
  required?: boolean;
  what: string;
  examples: string;
}[] = [
  {
    key: "necesarias",
    name: "Técnicas o necesarias",
    required: true,
    what:
      "Permiten que la web funcione: seguridad, balanceo de carga, tu decisión sobre cookies y el estado de la sesión. Sin ellas la web no puede prestarse.",
    examples: "ea_consent (propia, 6 meses) · cookie de sesión (propia, de sesión)",
  },
  {
    key: "preferencias",
    name: "Preferencias",
    required: false,
    what:
      "Recuerdan cómo quieres ver la web: tema claro u oscuro, filtros que dejaste puestos, tu apodo en la comunidad.",
    examples: "el-archivo:theme (propia, permanente hasta que la borres)",
  },
  {
    key: "analitica",
    name: "Analítica y medición",
    required: false,
    what:
      "Nos dicen qué secciones se leen y desde dónde, en conjunto y sin identificarte, para saber qué merece la pena mantener.",
    examples: "Proveedor de analítica configurado en el sitio (terceros)",
  },
  {
    key: "publicidad",
    name: "Publicidad",
    required: false,
    what:
      "Permiten mostrar anuncios y medir su rendimiento. Si las rechazas seguirás viendo el sitio igual: el espacio publicitario queda vacío o muestra publicidad no personalizada.",
    examples: "Red publicitaria contratada (terceros)",
  },
];

export const DENY_ALL: Consent = {
  necesarias: true,
  preferencias: false,
  analitica: false,
  publicidad: false,
  at: "",
  version: CONSENT_VERSION,
};

export const ACCEPT_ALL: Omit<Consent, "at"> = {
  necesarias: true,
  preferencias: true,
  analitica: true,
  publicidad: true,
  version: CONSENT_VERSION,
};

export const CONSENT_EVENT = "el-archivo:consent-change";

function fresh(c: Consent): boolean {
  if (c.version !== CONSENT_VERSION) return false;
  if (!c.at) return false;
  const age = (Date.now() - new Date(c.at).getTime()) / 86_400_000;
  return age <= CONSENT_MAX_AGE_DAYS;
}

/** Devuelve la decisión guardada, o null si no hay ninguna válida
    (nunca decidió, caducó, o cambiaron las finalidades). */
export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    return fresh(c) ? { ...c, necesarias: true } : null;
  } catch {
    return null;
  }
}

export function writeConsent(partial: Omit<Consent, "at">): Consent {
  const c: Consent = { ...partial, necesarias: true, at: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
    // Cookie propia, sin datos personales, para que el servidor pueda leerla.
    const max = CONSENT_MAX_AGE_DAYS * 86_400;
    const value = encodeURIComponent(
      `${c.preferencias ? 1 : 0}${c.analitica ? 1 : 0}${c.publicidad ? 1 : 0}:${c.version}`,
    );
    document.cookie = `${CONSENT_COOKIE}=${value};path=/;max-age=${max};SameSite=Lax${
      location.protocol === "https:" ? ";Secure" : ""
    }`;
  } catch {
    /* Si el navegador bloquea el almacenamiento, la decisión vale para
       esta sesión: se preguntará de nuevo en la siguiente visita. */
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: c }));
  return c;
}

export function hasConsent(cat: ConsentCategory): boolean {
  if (cat === "necesarias") return true;
  const c = readConsent();
  return c ? Boolean(c[cat]) : false;
}

/** Se suscribe a los cambios de consentimiento. Devuelve la función
    para darse de baja (úsala en el `return` de un useEffect). */
export function onConsentChange(fn: (c: Consent | null) => void): () => void {
  const h = () => fn(readConsent());
  window.addEventListener(CONSENT_EVENT, h);
  // Otra pestaña del mismo sitio también puede cambiarlo.
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(CONSENT_EVENT, h);
    window.removeEventListener("storage", h);
  };
}

/** Borra la decisión y vuelve a mostrar el aviso. */
export function resetConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
    document.cookie = `${CONSENT_COOKIE}=;path=/;max-age=0;SameSite=Lax`;
  } catch {
    /* nada que hacer */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

/* ------------------------------------------------------------------
   ACTIVACIÓN DE SCRIPTS DE TERCEROS
   Patrón: los scripts que necesitan consentimiento NO se escriben como
   <script src>, sino así:

     <script type="text/plain" data-consent="analitica"
             src="https://ejemplo.com/analitica.js"></script>

   Con type="text/plain" el navegador NO los ejecuta ni los descarga.
   Esta función los convierte en scripts reales solo cuando toca.
   ------------------------------------------------------------------ */
export function activateScripts(c: Consent | null) {
  if (typeof document === "undefined") return;
  const pending = document.querySelectorAll<HTMLScriptElement>(
    'script[type="text/plain"][data-consent]',
  );
  pending.forEach((old) => {
    const cat = old.dataset.consent as ConsentCategory | undefined;
    if (!cat || !c || !c[cat]) return;
    const s = document.createElement("script");
    for (const { name, value } of Array.from(old.attributes)) {
      if (name === "type" || name === "data-consent") continue;
      s.setAttribute(name, value);
    }
    s.type = "text/javascript";
    if (!old.src) s.textContent = old.textContent;
    old.replaceWith(s);
  });
}
