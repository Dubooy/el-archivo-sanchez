import type { SubmissionKind, Topic } from "./types";

const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const MESES_LARGO = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "SIN FECHA";
  const [y, m, d] = iso.split("-");
  const i = Number(m) - 1;
  return MESES[i] ? `${d} ${MESES[i]} ${y}` : "SIN FECHA";
}

export function fmtDateLong(iso: string | null | undefined): string {
  if (!iso) return "sin fecha";
  const [y, m, d] = iso.split("-");
  const i = Number(m) - 1;
  return MESES_LARGO[i] ? `${Number(d)} de ${MESES_LARGO[i]} de ${y}` : "sin fecha";
}

export function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export const fmtTs = (s: number | null) => (s === null || s === undefined ? "--:--" : fmtDuration(s));
export const fmtNumber = (n: number) => new Intl.NumberFormat("es-ES").format(n);
export const fmtCompact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(".", ",")} M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1).replace(".", ",")} K`
  : String(n);

/** "exp-014" → "014" */
export const fileNo = (id: string) => id.split("-").pop() ?? id;

export const TOPIC_LABEL: Record<Topic, string> = {
  economia: "Economía",
  vivienda: "Vivienda",
  cataluna: "Cataluña",
  exterior: "Política exterior",
  justicia: "Justicia",
  elecciones: "Elecciones",
  sanidad: "Sanidad",
  educacion: "Educación",
  empleo: "Empleo",
  energia: "Energía",
  inmigracion: "Inmigración",
  institucional: "Institucional",
  otros: "Otros",
};

export const SUBMISSION_KIND: Record<SubmissionKind, { label: string; icon: string; hint: string }> = {
  video: { label: "Vídeo", icon: "▶", hint: "Solo el enlace. No alojamos material de terceros." },
  noticia: { label: "Noticia", icon: "▤", hint: "Enlace a la publicación original, no a una captura." },
  documento: { label: "Documento", icon: "▣", hint: "Preferible el PDF oficial y su página de origen." },
  declaracion: { label: "Declaración", icon: "❝", hint: "Cita literal + material donde se pronuncia." },
  fuente: { label: "Fuente", icon: "⧉", hint: "Material de apoyo para un expediente ya abierto." },
  contradiccion: { label: "Contradicción", icon: "⇄", hint: "Qué se dijo, cuándo, y qué ocurrió después." },
  dato: { label: "Dato", icon: "▦", hint: "Serie oficial con periodo y unidad." },
  otro: { label: "Otro", icon: "◆", hint: "Cualquier material que no encaje arriba." },
};

export const STANCE_LABEL: Record<string, { label: string; icon: string; color: string }> = {
  A_FAVOR: { label: "A favor de la conclusión", icon: "+", color: "var(--ok)" },
  EN_CONTRA: { label: "En contra de la conclusión", icon: "−", color: "var(--red)" },
  FALTA_CONTEXTO: { label: "Falta contexto", icon: "?", color: "var(--warn)" },
  APORTO_FUENTE: { label: "Aporto una fuente", icon: "⧉", color: "var(--open)" },
  DETECTO_ERROR: { label: "Detecto un error", icon: "!", color: "var(--mixed)" },
};

export const VIRAL_RESULT: Record<
  string,
  { label: string; color: string; icon: string; meaning: string }
> = {
  DOCUMENTADA: {
    label: "Sí, está documentada",
    color: "var(--ok)",
    icon: "●",
    meaning: "Se ha localizado el material original y la frase consta tal cual.",
  },
  PARCIAL: {
    label: "Parcialmente",
    color: "var(--warn)",
    icon: "●",
    meaning: "Existe algo parecido, pero la versión que circula cambia palabras que cambian el sentido.",
  },
  SIN_EVIDENCIA: {
    label: "No se ha encontrado evidencia",
    color: "var(--red)",
    icon: "●",
    meaning:
      "No aparece fuente primaria. Esto no demuestra que no se dijera: demuestra que no consta.",
  },
  CONTEXTO_ENGANOSO: {
    label: "Contexto engañoso",
    color: "var(--neutral)",
    icon: "○",
    meaning: "La cita es literal pero circula recortada de un contexto que cambia lo que significa.",
  },
};

export const TIMELINE_KIND: Record<string, { label: string; color: string }> = {
  DECLARACION: { label: "Declaración", color: "var(--red)" },
  DECISION: { label: "Decisión", color: "var(--open)" },
  HECHO: { label: "Hecho documentado", color: "var(--ink-2)" },
  MEDIDA: { label: "Medida", color: "var(--mixed)" },
  RESOLUCION: { label: "Resolución", color: "var(--ok)" },
  PUBLICACION: { label: "Publicación oficial", color: "var(--warn)" },
};

export const ACTIVITY_KIND: Record<string, string> = {
  APORTACION: "aportó material",
  FUENTE_ACEPTADA: "aportó una fuente aceptada",
  ERROR_DETECTADO: "detectó un posible error",
  EVIDENCIA_INCORPORADA: "incorporó nueva evidencia",
  EXPEDIENTE_ACTUALIZADO: "actualizó un expediente",
  DEBATE: "participó en un debate",
  CORRECCION_ACEPTADA: "vio aceptada una corrección",
};

export const PROCEDURAL_LABEL: Record<string, string> = {
  DENUNCIA: "Denuncia presentada",
  INVESTIGADO: "Investigado",
  ACUSADO: "Acusado",
  PROCESADO: "Procesado",
  JUICIO_ORAL: "Juicio oral",
  CONDENADO_NO_FIRME: "Condenado (sentencia no firme)",
  CONDENADO_FIRME: "Condenado (sentencia firme)",
  ABSUELTO: "Absuelto",
  ARCHIVADO: "Archivado",
  RECURRIDO: "Recurrido",
};
