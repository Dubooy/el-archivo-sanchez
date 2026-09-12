/* ============================================================
   MODELOS DE DATOS — EL ARCHIVO
   ------------------------------------------------------------
   Tres capas que la aplicación nunca mezcla:

     ARCHIVO       lo que está documentado          → `layer: "ARCHIVO"`
     VERIFICACIÓN  lo que las fuentes permiten decir → `evidence` + `conclusion`
     COMUNIDAD     lo que opinan los usuarios        → `layer: "COMUNIDAD"`

   Y una regla que atraviesa todo: `isDemo: true` significa contenido
   de demostración. La interfaz lo marca siempre.
   ============================================================ */

export type Layer = "ARCHIVO" | "VERIFICACION" | "COMUNIDAD";

/** Estado de evidencia. Nunca «verdadero / falso» a secas. */
export type EvidenceLevel =
  | "RESPALDADO"
  | "PARCIALMENTE_RESPALDADO"
  | "EVIDENCIA_INSUFICIENTE"
  | "CONTRADICCION_DOCUMENTADA"
  | "NO_VERIFICABLE"
  | "EN_INVESTIGACION";

export type PromiseState = "CUMPLIDA" | "EN_PROCESO" | "NO_CUMPLIDA" | "NO_EVALUABLE";

export type Topic =
  | "economia"
  | "vivienda"
  | "cataluna"
  | "exterior"
  | "justicia"
  | "elecciones"
  | "sanidad"
  | "educacion"
  | "empleo"
  | "energia"
  | "inmigracion"
  | "institucional"
  | "otros";

export type SourceTier =
  | "documento-oficial"
  | "resolucion-judicial"
  | "organismo-publico"
  | "dato-oficial"
  | "declaracion-original"
  | "medio"
  | "fuente-secundaria"
  | "red-social";

export type SubmissionKind =
  | "video"
  | "noticia"
  | "documento"
  | "declaracion"
  | "fuente"
  | "contradiccion"
  | "dato"
  | "otro";

export type ReviewState =
  | "PENDIENTE"
  | "VERIFICADO"
  | "RECHAZADO"
  | "NECESITA_INFO";

/* ------------------------------------------------------------------ */

/** Un cargo público documentado. La plataforma admite varios. */
export interface Subject {
  id: string;
  slug: string;
  name: string;
  role: string;
  party: string;
  /** Periodo documentado. `to: null` = en el cargo. */
  from: string;
  to: string | null;
  /** `activo` = tiene material; `pendiente` = hueco reservado, aún sin documentar. */
  status: "activo" | "pendiente";
  note: string;
  isDemo: boolean;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  author: string;
  publishedAt: string | null;
  tier: SourceTier;
  /** Resumen de qué aporta esta fuente exactamente. */
  summary: string;
  relatedDossiers: string[];
  isDemo: boolean;
  addedAt: string;
  /** Si la aportó un usuario y fue aceptada. */
  contributedBy: string | null;
}

/** Una declaración pública, archivada literalmente. */
export interface Statement {
  id: string;
  subject: string;
  /** Texto literal. Si no se puede citar literal, no se archiva. */
  text: string;
  date: string;
  /** Dónde se dijo: sede, medio, acto. */
  place: string;
  context: string;
  topics: Topic[];
  sources: string[];
  video: string | null;
  /** Segundo exacto dentro del vídeo, si consta. */
  videoTimestamp: number | null;
  reviewState: ReviewState;
  dossier: string | null;
  isDemo: boolean;
  contributedBy: string | null;
  addedAt: string;
}

export interface VideoRecord {
  id: string;
  subject: string;
  title: string;
  date: string;
  duration: number;
  platform: "YouTube" | "X" | "TikTok" | "Instagram" | "Medio" | "Institucional" | "Otra";
  /** Solo se guarda la URL: no se aloja material de terceros. */
  url: string;
  embeddable: boolean;
  transcriptAvailable: boolean;
  reviewState: ReviewState;
  contributedBy: string | null;
  isDemo: boolean;
}

/** Promesa política con plazo y estado razonado. */
export interface PoliticalPromise {
  id: string;
  subject: string;
  text: string;
  date: string;
  context: string;
  /** Qué se comprometió exactamente, en términos medibles. */
  objective: string;
  /** Plazo anunciado por quien la formuló. null = no anunció plazo. */
  deadline: string | null;
  state: PromiseState;
  /**
   * Por qué ese estado. Obligatorio: el paso del tiempo por sí solo
   * nunca determina un incumplimiento.
   */
  stateRationale: string;
  topics: Topic[];
  sources: string[];
  lastReviewed: string;
  isDemo: boolean;
}

/** Un hecho posterior a una declaración. La columna derecha de DIJO → OCURRIÓ. */
export interface TimelineEvent {
  id: string;
  subject: string;
  date: string;
  kind: "DECLARACION" | "DECISION" | "HECHO" | "MEDIDA" | "RESOLUCION" | "PUBLICACION";
  title: string;
  detail: string;
  topics: Topic[];
  sources: string[];
  relatedStatement: string | null;
  isDemo: boolean;
}

/** El emparejamiento «lo que dijo» ↔ «lo que ocurrió». */
export interface Contradiction {
  id: string;
  subject: string;
  title: string;
  topics: Topic[];
  /** Pasos alternos: declaración, hecho, declaración, hecho… */
  steps: {
    at: string;
    side: "DIJO" | "OCURRIO";
    label: string;
    detail: string;
    ref: string | null;
    sources: string[];
  }[];
  evidence: EvidenceLevel;
  /** Redacción cuidadosa. Nunca «mintió». */
  conclusion: string;
  limitations: string[];
  sources: string[];
  dossier: string | null;
  lastUpdated: string;
  isDemo: boolean;
}

/** Registro de un cambio de estado de un expediente (§39). */
export interface DossierChange {
  at: string;
  from: EvidenceLevel;
  to: EvidenceLevel;
  reason: string;
}

/** El expediente: la unidad central de la plataforma. */
export interface Dossier {
  id: string;
  number: number;
  slug: string;
  subject: string;
  title: string;
  topics: Topic[];
  /** 01 — qué se dijo */
  whatWasSaid: string;
  statementRefs: string[];
  /** 02 — cuándo se dijo */
  whenAndContext: string;
  /** 03 — qué ocurrió después */
  timelineRefs: string[];
  /** 04 — qué dicen las fuentes */
  whatSourcesSay: string;
  sources: string[];
  /** 05 — contraevidencia */
  counterEvidence: string[];
  /** 06 — conclusión */
  conclusion: string;
  evidence: EvidenceLevel;
  limitations: string[];
  changes: DossierChange[];
  openedAt: string;
  lastUpdated: string;
  isDemo: boolean;
}

/** «¿Realmente lo dijo?» — frases virales contrastadas. */
export interface ViralQuote {
  id: string;
  subject: string;
  /** Como circula por internet. */
  circulating: string;
  result: "DOCUMENTADA" | "PARCIAL" | "SIN_EVIDENCIA" | "CONTEXTO_ENGANOSO";
  /** Qué consta exactamente, si consta algo. */
  whatIsDocumented: string;
  explanation: string;
  video: string | null;
  videoTimestamp: number | null;
  date: string | null;
  sources: string[];
  shares: number;
  isDemo: boolean;
}

/* ---------------------- CAPA COMUNIDAD ---------------------------- */

export interface User {
  id: string;
  handle: string;
  joinedAt: string;
  role: "usuario" | "moderador" | "editor";
  bio: string;
  stats: {
    submissions: number;
    acceptedSources: number;
    debates: number;
    acceptedCorrections: number;
  };
  /** Reputación documental: sube por aportar, no por opinar. */
  reputation: number;
  isDemo: boolean;
}

export interface Submission {
  id: string;
  kind: SubmissionKind;
  subject: string;
  title: string;
  url: string;
  description: string;
  approxDate: string;
  context: string;
  whyRelevant: string;
  /** Conclusión del usuario. SIEMPRE etiquetada como opinión. */
  userConclusion: string;
  by: string;
  at: string;
  reviewState: ReviewState;
  moderatorNote: string;
  /** Marcada para revisión reforzada: el texto atribuye
      responsabilidad penal. Lo decide el servidor, no el formulario. */
  escalated: boolean;
  /** Si se aceptó, a qué registro del archivo dio lugar. */
  becameRecord: string | null;
  isDemo: boolean;
}

export type CommentStance =
  | "A_FAVOR"
  | "EN_CONTRA"
  | "FALTA_CONTEXTO"
  | "APORTO_FUENTE"
  | "DETECTO_ERROR";

export interface Comment {
  id: string;
  dossier: string;
  by: string;
  at: string;
  stance: CommentStance;
  text: string;
  /** Si el comentario aporta una fuente, su URL. */
  sourceUrl: string | null;
  upvotes: number;
  reviewState: ReviewState;
  isDemo: boolean;
}

/** Contraevidencia aportada por la comunidad a un expediente. */
export interface CounterSubmission {
  id: string;
  dossier: string;
  by: string;
  at: string;
  kind: "video" | "declaracion" | "documento" | "noticia" | "dato" | "explicacion";
  text: string;
  url: string | null;
  reviewState: ReviewState;
  /** Si el editor la incorporó al expediente. */
  incorporated: boolean;
  isDemo: boolean;
}

export type VoteOption = "FUNDAMENTADA" | "NO_DE_ACUERDO" | "FALTA_EVIDENCIA" | "FALTA_CONTEXTO";

export interface VoteTally {
  dossier: string;
  FUNDAMENTADA: number;
  NO_DE_ACUERDO: number;
  FALTA_EVIDENCIA: number;
  FALTA_CONTEXTO: number;
}

export interface Correction {
  id: string;
  target: string;
  targetLabel: string;
  by: string;
  at: string;
  whatIsWrong: string;
  why: string;
  sourceUrl: string;
  reviewState: ReviewState;
  resolution: string;
  isDemo: boolean;
}

export interface ActivityEvent {
  id: string;
  at: string;
  actor: string;
  kind:
    | "APORTACION"
    | "FUENTE_ACEPTADA"
    | "ERROR_DETECTADO"
    | "EVIDENCIA_INCORPORADA"
    | "EXPEDIENTE_ACTUALIZADO"
    | "DEBATE"
    | "CORRECCION_ACEPTADA";
  text: string;
  href: string;
  layer: Layer;
}

/* ------------------ MÓDULO JUDICIAL (desactivado) ------------------ */

export type ProceduralStatus =
  | "DENUNCIA"
  | "INVESTIGADO"
  | "ACUSADO"
  | "PROCESADO"
  | "JUICIO_ORAL"
  | "CONDENADO_NO_FIRME"
  | "CONDENADO_FIRME"
  | "ABSUELTO"
  | "ARCHIVADO"
  | "RECURRIDO";

export interface JudicialCase {
  id: string;
  caseName: string;
  /** Quién está investigado. NUNCA se asume que sea el sujeto del archivo. */
  investigatedParties: string[];
  court: string;
  facts: string;
  /** Relación acreditada con el sujeto. Obligatorio y explícito. */
  relationToSubject: string;
  relationEvidence: string[];
  status: ProceduralStatus;
  proven: string[];
  pending: string[];
  allegationsOnly: string[];
  documents: string[];
  sources: string[];
  lastUpdated: string;
  isDemo: boolean;
}

export interface ArchiveMeta {
  build: string;
  lastUpdated: string;
  demoMode: boolean;
  disclaimer: string;
}
