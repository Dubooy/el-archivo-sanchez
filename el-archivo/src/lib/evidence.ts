import type { EvidenceLevel, PromiseState, ReviewState, SourceTier, VoteTally } from "./types";

/* ============================================================
   NIVELES DE EVIDENCIA, ESTADOS Y JERARQUÍA DE FUENTES
   ------------------------------------------------------------
   Ningún estado aparece nunca sin su explicación. Es la regla que
   sostiene la credibilidad de toda la plataforma.
   ============================================================ */

export const EVIDENCE: Record<
  EvidenceLevel,
  { label: string; color: string; short: string; meaning: string; notMeaning: string }
> = {
  RESPALDADO: {
    label: "Respaldado",
    color: "var(--ok)",
    short: "RES",
    meaning:
      "Existen fuentes verificables e independientes, al menos una de primer nivel documental, que sostienen lo que describe la ficha.",
    notMeaning: "No significa «verdad absoluta»: significa que hay material con el que comprobarlo.",
  },
  PARCIALMENTE_RESPALDADO: {
    label: "Parcialmente respaldado",
    color: "var(--mixed)",
    short: "PAR",
    meaning:
      "Parte de lo que describe la ficha está documentado y parte no. La ficha detalla qué parte es cada una.",
    notMeaning: "No significa que el resto sea falso: significa que el resto no está acreditado.",
  },
  EVIDENCIA_INSUFICIENTE: {
    label: "Evidencia insuficiente",
    color: "var(--warn)",
    short: "INS",
    meaning:
      "No se ha localizado material suficiente para sostener ni descartar lo que plantea la ficha.",
    notMeaning: "No es una acusación ni una absolución. Describe el archivo, no la realidad.",
  },
  CONTRADICCION_DOCUMENTADA: {
    label: "Contradicción documentada",
    color: "var(--red)",
    short: "CON",
    meaning:
      "Consta una declaración en una fecha y un hecho documentado posterior que no encaja con ella. Ambos se citan con su fuente.",
    notMeaning:
      "No significa que quien habló mintiera. Mentir exige saber que lo dicho era falso, y eso es otra cosa que hay que demostrar aparte.",
  },
  NO_VERIFICABLE: {
    label: "No verificable",
    color: "var(--neutral)",
    short: "N/V",
    meaning:
      "Por su naturaleza no admite comprobación: juicio de valor, intención declarada o enunciado sin referente medible.",
    notMeaning: "No es un reproche: hay declaraciones perfectamente legítimas que no son de este tipo.",
  },
  EN_INVESTIGACION: {
    label: "En investigación",
    color: "var(--open)",
    short: "INV",
    meaning: "Expediente abierto e incompleto. Falta material por incorporar y el estado puede cambiar.",
    notMeaning: "No adelanta ninguna conclusión.",
  },
};

export const PROMISE: Record<
  PromiseState,
  { label: string; color: string; icon: string; rule: string }
> = {
  CUMPLIDA: {
    label: "Cumplida",
    color: "var(--ok)",
    icon: "●",
    rule: "Consta documentación que acredita la ejecución de lo comprometido, en los términos y el plazo anunciados.",
  },
  EN_PROCESO: {
    label: "En proceso",
    color: "var(--warn)",
    icon: "◐",
    rule: "Hay constancia de pasos dados y el plazo anunciado no ha vencido. No se prejuzga el resultado final.",
  },
  NO_CUMPLIDA: {
    label: "No cumplida",
    color: "var(--red)",
    icon: "○",
    rule:
      "El plazo anunciado ha vencido Y existe documentación de que el objetivo no se alcanzó. Que haya pasado el tiempo, por sí solo, nunca basta para clasificar aquí.",
  },
  NO_EVALUABLE: {
    label: "No evaluable",
    color: "var(--neutral)",
    icon: "◌",
    rule:
      "El compromiso no se formuló en términos medibles, no se anunció plazo, o no existe fuente pública que permita comprobar el resultado.",
  },
};

export const REVIEW: Record<ReviewState, { label: string; color: string; meaning: string }> = {
  PENDIENTE: {
    label: "Pendiente de revisión",
    color: "var(--warn)",
    meaning: "Aportado por un usuario. No es visible en el archivo público hasta que un moderador lo acepta.",
  },
  VERIFICADO: {
    label: "Verificado / incorporado",
    color: "var(--ok)",
    meaning: "Un moderador ha comprobado el enlace y la procedencia. Forma parte del archivo.",
  },
  RECHAZADO: {
    label: "Rechazado",
    color: "var(--red)",
    meaning: "No cumple los requisitos del archivo. El motivo queda anotado y es visible para quien lo aportó.",
  },
  NECESITA_INFO: {
    label: "Necesita más información",
    color: "var(--open)",
    meaning: "Devuelto a quien lo aportó con una petición concreta: falta fuente, fecha o contexto.",
  },
};

/* ------------------------------------------------------------------
   JERARQUÍA DOCUMENTAL (§25)
   Un tuit no equivale a una sentencia. El orden está aquí, en un solo
   sitio, y toda la aplicación ordena las fuentes por él.
   ------------------------------------------------------------------ */
export const TIER: Record<
  SourceTier,
  { label: string; rank: number; note: string }
> = {
  "documento-oficial": { label: "Documento oficial", rank: 1, note: "Emisor identificable, trazable y con responsabilidad sobre lo publicado." },
  "resolucion-judicial": { label: "Resolución judicial", rank: 2, note: "Se cita lo que la resolución dice, nunca lo que se interpreta de ella." },
  "organismo-publico": { label: "Organismo público", rank: 3, note: "Publicación institucional con método declarado." },
  "dato-oficial": { label: "Dato oficial", rank: 4, note: "Serie estadística oficial. Se cita con periodo y unidad." },
  "declaracion-original": { label: "Declaración original", rank: 5, note: "El material en el que se pronuncia la declaración." },
  medio: { label: "Medio de comunicación", rank: 6, note: "Se distingue si aporta material propio o reproduce a terceros." },
  "fuente-secundaria": { label: "Fuente secundaria", rank: 7, note: "Comentario o análisis. No sustituye al original." },
  "red-social": { label: "Red social", rank: 8, note: "Editable y borrable. Nunca equivale a un documento oficial." },
};

export function sortByTier<T extends { tier: SourceTier }>(items: T[]): T[] {
  return [...items].sort((a, b) => TIER[a.tier].rank - TIER[b.tier].rank);
}

/* ------------------------------------------------------------------
   PERCEPCIÓN DE LA COMUNIDAD
   Mide opinión. No verifica nada. Se muestra siempre con ese aviso.
   ------------------------------------------------------------------ */
export const VOTE_OPTIONS = [
  { key: "FUNDAMENTADA", label: "La conclusión está bien fundamentada", icon: "+", color: "var(--ok)" },
  { key: "NO_DE_ACUERDO", label: "No estoy de acuerdo", icon: "−", color: "var(--red)" },
  { key: "FALTA_EVIDENCIA", label: "Falta evidencia", icon: "?", color: "var(--warn)" },
  { key: "FALTA_CONTEXTO", label: "Necesita más contexto", icon: "⧉", color: "var(--open)" },
] as const;

export function voteTotals(v: VoteTally | undefined) {
  const t = v ? v.FUNDAMENTADA + v.NO_DE_ACUERDO + v.FALTA_EVIDENCIA + v.FALTA_CONTEXTO : 0;
  const pct = (n: number) => (t ? Math.round((n / t) * 100) : 0);
  return {
    total: t,
    pct,
    wellFounded: v ? pct(v.FUNDAMENTADA) : 0,
  };
}

export const VOTE_DISCLAIMER =
  "La votación refleja la opinión de los usuarios y no constituye una verificación de los hechos. Un expediente puede ser muy votado y tener evidencia insuficiente.";

/* ------------------------------------------------------------------
   REPUTACIÓN DOCUMENTAL
   Sube por aportar material comprobable. Nunca por opinar de una forma
   determinada: no hay ninguna señal política en el cálculo.
   ------------------------------------------------------------------ */
export const REPUTATION_RULES = {
  up: [
    ["Fuente aportada y aceptada", "+3"],
    ["Contraevidencia incorporada a un expediente", "+5"],
    ["Corrección aceptada", "+5"],
    ["Aportación convertida en registro del archivo", "+4"],
    ["Contexto aportado que cambia una ficha", "+2"],
  ],
  down: [
    ["Contenido sin fuente presentado como hecho", "−4"],
    ["Material falso o manipulado", "−10"],
    ["Ataques personales", "−6"],
    ["Spam o repetición", "−3"],
  ],
} as const;

export function reputationTier(n: number): { label: string; color: string } {
  if (n >= 70) return { label: "Aportación alta", color: "var(--ok)" };
  if (n >= 40) return { label: "Aportación media", color: "var(--warn)" };
  if (n >= 15) return { label: "Aportación inicial", color: "var(--neutral)" };
  return { label: "Sin historial", color: "var(--neutral)" };
}
