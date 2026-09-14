/* ============================================================
   CONFIGURACIÓN DE LA PLATAFORMA
   ------------------------------------------------------------
   El único archivo que hay que tocar para cambiar el alcance del
   proyecto: qué sujetos se documentan, qué módulos están activos
   y qué política de moderación se aplica.
   ============================================================ */

export const SITE = {
  name: "EL ARCHIVO SÁNCHEZ",
  tagline: "Pedro Sánchez bajo lupa",
  motto: "Documentar. Contrastar. Debatir.",
  url: "https://elarchivosanchez.vercel.app",
  intro:
    "Un archivo independiente y colaborativo para recopilar declaraciones, promesas, contradicciones y fuentes relacionadas con la actividad política de Pedro Sánchez. Cada registro enlaza a su origen. Cada conclusión se puede discutir y corregir, y la plataforma te enseña siempre en qué se apoya.",
  independence:
    "PROYECTO INDEPENDIENTE. No afiliado al PSOE, al PP, a ningún otro partido, institución pública o medio de comunicación.",
  editorial:
    "Esta plataforma recopila y organiza información procedente de fuentes públicas. Las conclusiones son editoriales, están fechadas y pueden revisarse o corregirse cuando aparece nueva evidencia. La votación de la comunidad mide percepción, no verifica hechos.",
  judicialNotice:
    "La existencia de una investigación, denuncia, querella, acusación o procedimiento judicial NO implica culpabilidad. Toda persona es inocente mientras no exista sentencia condenatoria firme.",
} as const;

/* ------------------------------------------------------------------
   MÓDULOS
   Encender un módulo enciende su sección, su entrada de menú, su
   presencia en el buscador y sus estadísticas. Apagarlo lo retira de
   toda la aplicación sin dejar enlaces rotos.
   ------------------------------------------------------------------ */
export const MODULES = {
  statements: true,
  promises: true,
  contradictions: true,
  dossiers: true,
  timeline: true,
  viralQuotes: true,
  community: true,
  sources: true,

  /**
   * MÓDULO JUDICIAL — DESACTIVADO A PROPÓSITO.
   *
   * El código de la sección existe y funciona: modelo de datos con
   * terminología procesal estricta, campo obligatorio de relación
   * acreditada con el sujeto y aviso de presunción de inocencia por
   * ficha. Está apagado porque publicar sobre causas abiertas que
   * afectan a personas vivas es la parte con más riesgo del proyecto
   * y merece criterio (y, idealmente, asesoría) antes de encenderse.
   *
   * Para activarlo: pon `true` aquí. No hay que tocar nada más.
   */
  judicial: false,
} as const;

/* ------------------------------------------------------------------
   MODERACIÓN
   ------------------------------------------------------------------ */
export const MODERATION = {
  /** true = nada aportado por usuarios se ve en público hasta aprobarse. */
  preModeration: true,
  /** Tipos que además exigen al menos una fuente para poder enviarse. */
  requiresSource: ["declaracion", "contradiccion", "documento", "dato"] as const,
  /** Palabras que disparan revisión reforzada por implicar responsabilidad penal. */
  escalate: [
    "corrupto",
    "corrupción",
    "delito",
    "robó",
    "robar",
    "criminal",
    "ladrón",
    "culpable",
    "condenado",
    "malversación",
    "cohecho",
    "prevaricación",
  ],
};

/* ------------------------------------------------------------------
   TITULAR DEL SITIO
   Lo que exige el artículo 10 de la LSSI-CE y lo que usan el aviso
   legal, la política de privacidad y la de cookies. Rellénalo antes
   de publicar: son los ÚNICOS datos que hay que tocar para que los
   tres textos legales queden completos.
   ------------------------------------------------------------------ */
export const OWNER = {
  /** Persona física o jurídica responsable del sitio. */
  legalName: "[NOMBRE Y APELLIDOS O RAZÓN SOCIAL]",
  /** Nombre comercial con el que se conoce el sitio. */
  tradeName: "El Archivo Sánchez",
  nif: "[NIF / CIF]",
  address: "[DIRECCIÓN COMPLETA, CÓDIGO POSTAL, LOCALIDAD, PROVINCIA]",
  email: "[CORREO DE CONTACTO]",
  /** Opcional: solo si eres sociedad mercantil. */
  registry: "[REGISTRO MERCANTIL, TOMO, FOLIO, HOJA — solo si procede]",
  /** Opcional: delegado de protección de datos, si estás obligado. */
  dpo: "",
  /** Proveedor de alojamiento: hay que identificarlo. */
  host: "[NOMBRE DEL PROVEEDOR DE HOSTING]",
  hostAddress: "[DIRECCIÓN DEL PROVEEDOR]",
  hostPrivacy: "[URL DE LA POLÍTICA DE PRIVACIDAD DEL PROVEEDOR]",
  /** Fecha de la última revisión de los textos legales. */
  legalUpdated: "2026-09-10",
} as const;

/* ------------------------------------------------------------------
   PUBLICIDAD
   Los huecos existen siempre y reservan su altura (para que la página
   no dé saltos), pero NO cargan nada hasta que el visitante acepta la
   categoría «publicidad». Con `enabled: false` no se contacta con
   ninguna red: solo se ve el espacio reservado.
   ------------------------------------------------------------------ */
export const ADS = {
  enabled: true,
  /** Tu identificador de editor, del tipo "ca-pub-0000000000000000". */
  client: "ca-pub-7695737287402431",
  /** Identificadores de bloque que te da la red publicitaria. */
  slots: { leaderboard: "", rectangle: "", rail: "" },
} as const;

export const PALETTE_NOTE =
  "Los colores viven en src/app/globals.css, en el bloque :root. Cambia --red y cambia toda la web.";
