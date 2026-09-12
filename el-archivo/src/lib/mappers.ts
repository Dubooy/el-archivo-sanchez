import type {
  Comment,
  Contradiction,
  Correction,
  CounterSubmission,
  Dossier,
  JudicialCase,
  PoliticalPromise,
  Source,
  SourceTier,
  Statement,
  Subject,
  Submission,
  TimelineEvent,
  User,
  VideoRecord,
  ViralQuote,
  ActivityEvent,
} from "./types";

/* ============================================================
   TRADUCTORES: FILA DE POSTGRES → TIPO DE LA APLICACIÓN
   ------------------------------------------------------------
   Las pantallas siguen hablando el idioma de src/lib/types.ts, que
   no ha cambiado ni una coma. Aquí se traduce lo que devuelve la
   base de datos a ese idioma. Tres diferencias que resolver:

   1. FECHAS. Postgres devuelve `Date`; la aplicación trabaja con
      cadenas «2026-03-14», que es lo que ordenan los componentes
      con localeCompare y lo que recorta `date.slice(0, 4)`.

   2. ENUMS. En Postgres un enum no puede llevar guiones, así que
      «resolucion-judicial» se guarda como RESOLUCION_JUDICIAL. La
      traducción va y viene solo aquí.

   3. RELACIONES. Donde el JSON tenía `sources: ["src-001"]`, la base
      de datos tiene filas en source_links. Cada consulta las incluye
      y estas funciones las vuelven a aplanar a una lista de ids.

   Los tipos de entrada están escritos a mano a propósito: describen
   exactamente qué `include` necesita cada consulta. Si una consulta
   olvida uno, TypeScript lo canta en la compilación.
   ============================================================ */

/** Date → "2026-03-14". Se usa UTC para que no baile un día según
    la zona horaria del servidor que renderice. */
export const iso = (d: Date): string => d.toISOString().slice(0, 10);
export const isoOrNull = (d: Date | null): string | null => (d ? iso(d) : null);
/** Para campos con fecha y hora (comentarios, aportaciones). */
export const isoDateTime = (d: Date): string => d.toISOString().slice(0, 10);

/** RESOLUCION_JUDICIAL → "resolucion-judicial" */
export const tierToApp = (t: string): SourceTier =>
  t.toLowerCase().replace(/_/g, "-") as SourceTier;
/** "resolucion-judicial" → RESOLUCION_JUDICIAL */
export const tierToDb = (t: string): string => t.toUpperCase().replace(/-/g, "_");

/** MODERADOR → "moderador" */
export const roleToApp = (r: string): User["role"] => {
  const v = r.toLowerCase();
  return (v === "admin" ? "editor" : v) as User["role"];
};

/** El apodo del autor, o un marcador si la cuenta ya no existe
    (RGPD: al borrarse una cuenta, la aportación aceptada permanece
    en el archivo pero pierde el vínculo con la persona). */
const handle = (u: { handle: string } | null | undefined): string => u?.handle ?? "@cuenta-eliminada";
const handleOrNull = (u: { handle: string } | null | undefined): string | null => u?.handle ?? null;

/** Aplana las filas de source_links a la lista de ids que espera la
    aplicación, respetando el orden de presentación. */
const sourceIds = (links: { sourceId: string }[] | undefined): string[] =>
  (links ?? []).map((l) => l.sourceId);

/* ------------------------------------------------------------------
   TIPOS DE ENTRADA — lo que cada consulta tiene que traer
   ------------------------------------------------------------------ */

type LinkRow = { sourceId: string };

export type SubjectRow = {
  id: string;
  slug: string;
  name: string;
  role: string;
  party: string;
  from: Date;
  to: Date | null;
  status: string;
  note: string;
  isDemo: boolean;
};

export type SourceRow = {
  id: string;
  title: string;
  url: string;
  author: string;
  publishedAt: Date | null;
  tier: string;
  summary: string;
  isDemo: boolean;
  addedAt: Date;
  contributedBy: { handle: string } | null;
  links?: { dossierId: string | null }[];
};

export type StatementRow = {
  id: string;
  subjectId: string;
  text: string;
  date: Date;
  place: string;
  context: string;
  topics: string[];
  videoId: string | null;
  videoTimestamp: number | null;
  reviewState: string;
  dossierId: string | null;
  isDemo: boolean;
  addedAt: Date;
  contributedBy: { handle: string } | null;
  sources: LinkRow[];
};

export type VideoRow = {
  id: string;
  subjectId: string;
  title: string;
  date: Date;
  duration: number;
  platform: string;
  url: string;
  embeddable: boolean;
  transcriptAvailable: boolean;
  reviewState: string;
  isDemo: boolean;
  contributedBy: { handle: string } | null;
};

export type PromiseRow = {
  id: string;
  subjectId: string;
  text: string;
  date: Date;
  context: string;
  objective: string;
  deadline: Date | null;
  state: string;
  stateRationale: string;
  topics: string[];
  lastReviewed: Date;
  isDemo: boolean;
  sources: LinkRow[];
};

export type TimelineRow = {
  id: string;
  subjectId: string;
  date: Date;
  kind: string;
  title: string;
  detail: string;
  topics: string[];
  relatedStatementId: string | null;
  isDemo: boolean;
  sources: LinkRow[];
};

export type ContradictionRow = {
  id: string;
  subjectId: string;
  title: string;
  topics: string[];
  evidence: string;
  conclusion: string;
  limitations: string[];
  dossierId: string | null;
  lastUpdated: Date;
  isDemo: boolean;
  sources: LinkRow[];
  steps: {
    at: Date;
    side: string;
    label: string;
    detail: string;
    statementId: string | null;
    timelineId: string | null;
    sources: LinkRow[];
  }[];
};

export type DossierRow = {
  id: string;
  number: number;
  slug: string;
  subjectId: string;
  title: string;
  topics: string[];
  whatWasSaid: string;
  whenAndContext: string;
  whatSourcesSay: string;
  counterEvidence: string[];
  conclusion: string;
  evidence: string;
  limitations: string[];
  openedAt: Date;
  lastUpdated: Date;
  isDemo: boolean;
  statementRefs: { statementId: string }[];
  timelineRefs: { timelineId: string }[];
  sources: LinkRow[];
  changes: { at: Date; from: string; to: string; reason: string }[];
};

export type ViralRow = {
  id: string;
  subjectId: string;
  circulating: string;
  result: string;
  whatIsDocumented: string;
  explanation: string;
  videoId: string | null;
  videoTimestamp: number | null;
  date: Date | null;
  shares: number;
  isDemo: boolean;
  sources: LinkRow[];
};

export type JudicialRow = {
  id: string;
  caseName: string;
  investigatedParties: string[];
  court: string;
  facts: string;
  relationToSubject: string;
  relationEvidence: string[];
  status: string;
  proven: string[];
  pending: string[];
  allegationsOnly: string[];
  lastUpdated: Date;
  isDemo: boolean;
  sources: LinkRow[];
};

export type UserRow = {
  id: string;
  handle: string;
  role: string;
  bio: string;
  reputation: number;
  isDemo: boolean;
  createdAt: Date;
};

export type UserStats = User["stats"];

export type SubmissionRow = {
  id: string;
  kind: string;
  subjectId: string;
  title: string;
  url: string;
  description: string;
  approxDate: string;
  context: string;
  whyRelevant: string;
  userConclusion: string;
  reviewState: string;
  moderatorNote: string;
  escalated: boolean;
  becameRecordId: string | null;
  at: Date;
  isDemo: boolean;
  by: { handle: string } | null;
};

export type CommentRow = {
  id: string;
  dossierId: string;
  stance: string;
  text: string;
  sourceUrl: string | null;
  upvotes: number;
  reviewState: string;
  at: Date;
  isDemo: boolean;
  by: { handle: string } | null;
};

export type CounterRow = {
  id: string;
  dossierId: string;
  kind: string;
  text: string;
  url: string | null;
  reviewState: string;
  incorporated: boolean;
  at: Date;
  isDemo: boolean;
  by: { handle: string } | null;
};

export type CorrectionRow = {
  id: string;
  targetId: string;
  targetLabel: string;
  whatIsWrong: string;
  why: string;
  sourceUrl: string;
  reviewState: string;
  resolution: string;
  at: Date;
  isDemo: boolean;
  by: { handle: string } | null;
};

export type ActivityRow = {
  id: string;
  kind: string;
  layer: string;
  text: string;
  href: string;
  at: Date;
  actor: { handle: string } | null;
};

/* ------------------------------------------------------------------
   TRADUCTORES
   ------------------------------------------------------------------ */

export const mapSubject = (r: SubjectRow): Subject => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  role: r.role,
  party: r.party,
  from: iso(r.from),
  to: isoOrNull(r.to),
  status: r.status as Subject["status"],
  note: r.note,
  isDemo: r.isDemo,
});

export const mapSource = (r: SourceRow): Source => ({
  id: r.id,
  title: r.title,
  url: r.url,
  author: r.author,
  publishedAt: isoOrNull(r.publishedAt),
  tier: tierToApp(r.tier),
  summary: r.summary,
  relatedDossiers: (r.links ?? [])
    .map((l) => l.dossierId)
    .filter((d): d is string => Boolean(d)),
  isDemo: r.isDemo,
  addedAt: iso(r.addedAt),
  contributedBy: handleOrNull(r.contributedBy),
});

export const mapStatement = (r: StatementRow): Statement => ({
  id: r.id,
  subject: r.subjectId,
  text: r.text,
  date: iso(r.date),
  place: r.place,
  context: r.context,
  topics: r.topics as Statement["topics"],
  sources: sourceIds(r.sources),
  video: r.videoId,
  videoTimestamp: r.videoTimestamp,
  reviewState: r.reviewState as Statement["reviewState"],
  dossier: r.dossierId,
  isDemo: r.isDemo,
  contributedBy: handleOrNull(r.contributedBy),
  addedAt: iso(r.addedAt),
});

export const mapVideo = (r: VideoRow): VideoRecord => ({
  id: r.id,
  subject: r.subjectId,
  title: r.title,
  date: iso(r.date),
  duration: r.duration,
  platform: r.platform as VideoRecord["platform"],
  url: r.url,
  embeddable: r.embeddable,
  transcriptAvailable: r.transcriptAvailable,
  reviewState: r.reviewState as VideoRecord["reviewState"],
  contributedBy: handleOrNull(r.contributedBy),
  isDemo: r.isDemo,
});

export const mapPromise = (r: PromiseRow): PoliticalPromise => ({
  id: r.id,
  subject: r.subjectId,
  text: r.text,
  date: iso(r.date),
  context: r.context,
  objective: r.objective,
  deadline: isoOrNull(r.deadline),
  state: r.state as PoliticalPromise["state"],
  stateRationale: r.stateRationale,
  topics: r.topics as PoliticalPromise["topics"],
  sources: sourceIds(r.sources),
  lastReviewed: iso(r.lastReviewed),
  isDemo: r.isDemo,
});

export const mapTimeline = (r: TimelineRow): TimelineEvent => ({
  id: r.id,
  subject: r.subjectId,
  date: iso(r.date),
  kind: r.kind as TimelineEvent["kind"],
  title: r.title,
  detail: r.detail,
  topics: r.topics as TimelineEvent["topics"],
  sources: sourceIds(r.sources),
  relatedStatement: r.relatedStatementId,
  isDemo: r.isDemo,
});

export const mapContradiction = (r: ContradictionRow): Contradiction => ({
  id: r.id,
  subject: r.subjectId,
  title: r.title,
  topics: r.topics as Contradiction["topics"],
  steps: r.steps.map((s) => ({
    at: iso(s.at),
    side: s.side as "DIJO" | "OCURRIO",
    label: s.label,
    detail: s.detail,
    // El JSON guardaba una sola referencia: es una declaración o un
    // hecho de la cronología, y en la base de datos son dos columnas.
    ref: s.statementId ?? s.timelineId,
    sources: sourceIds(s.sources),
  })),
  evidence: r.evidence as Contradiction["evidence"],
  conclusion: r.conclusion,
  limitations: r.limitations,
  sources: sourceIds(r.sources),
  dossier: r.dossierId,
  lastUpdated: iso(r.lastUpdated),
  isDemo: r.isDemo,
});

export const mapDossier = (r: DossierRow): Dossier => ({
  id: r.id,
  number: r.number,
  slug: r.slug,
  subject: r.subjectId,
  title: r.title,
  topics: r.topics as Dossier["topics"],
  whatWasSaid: r.whatWasSaid,
  statementRefs: r.statementRefs.map((x) => x.statementId),
  whenAndContext: r.whenAndContext,
  timelineRefs: r.timelineRefs.map((x) => x.timelineId),
  whatSourcesSay: r.whatSourcesSay,
  sources: sourceIds(r.sources),
  counterEvidence: r.counterEvidence,
  conclusion: r.conclusion,
  evidence: r.evidence as Dossier["evidence"],
  limitations: r.limitations,
  changes: r.changes.map((c) => ({
    at: iso(c.at),
    from: c.from as Dossier["evidence"],
    to: c.to as Dossier["evidence"],
    reason: c.reason,
  })),
  openedAt: iso(r.openedAt),
  lastUpdated: iso(r.lastUpdated),
  isDemo: r.isDemo,
});

export const mapViral = (r: ViralRow): ViralQuote => ({
  id: r.id,
  subject: r.subjectId,
  circulating: r.circulating,
  result: r.result as ViralQuote["result"],
  whatIsDocumented: r.whatIsDocumented,
  explanation: r.explanation,
  video: r.videoId,
  videoTimestamp: r.videoTimestamp,
  date: isoOrNull(r.date),
  sources: sourceIds(r.sources),
  shares: r.shares,
  isDemo: r.isDemo,
});

export const mapJudicial = (r: JudicialRow): JudicialCase => ({
  id: r.id,
  caseName: r.caseName,
  investigatedParties: r.investigatedParties,
  court: r.court,
  facts: r.facts,
  relationToSubject: r.relationToSubject,
  relationEvidence: r.relationEvidence,
  status: r.status as JudicialCase["status"],
  proven: r.proven,
  pending: r.pending,
  allegationsOnly: r.allegationsOnly,
  documents: [],
  sources: sourceIds(r.sources),
  lastUpdated: iso(r.lastUpdated),
  isDemo: r.isDemo,
});

/** Las estadísticas del perfil se CALCULAN contando filas reales, no
    se guardan: así no pueden desincronizarse de lo que hay. */
export const mapUser = (r: UserRow, stats: UserStats): User => ({
  id: r.id,
  handle: r.handle,
  joinedAt: iso(r.createdAt),
  role: roleToApp(r.role),
  bio: r.bio,
  stats,
  reputation: r.reputation,
  isDemo: r.isDemo,
});

export const mapSubmission = (r: SubmissionRow): Submission => ({
  id: r.id,
  kind: r.kind as Submission["kind"],
  subject: r.subjectId,
  title: r.title,
  url: r.url,
  description: r.description,
  approxDate: r.approxDate,
  context: r.context,
  whyRelevant: r.whyRelevant,
  userConclusion: r.userConclusion,
  by: handle(r.by),
  at: isoDateTime(r.at),
  reviewState: r.reviewState as Submission["reviewState"],
  moderatorNote: r.moderatorNote,
  escalated: r.escalated,
  becameRecord: r.becameRecordId,
  isDemo: r.isDemo,
});

export const mapComment = (r: CommentRow): Comment => ({
  id: r.id,
  dossier: r.dossierId,
  by: handle(r.by),
  at: isoDateTime(r.at),
  stance: r.stance as Comment["stance"],
  text: r.text,
  sourceUrl: r.sourceUrl,
  upvotes: r.upvotes,
  reviewState: r.reviewState as Comment["reviewState"],
  isDemo: r.isDemo,
});

export const mapCounter = (r: CounterRow): CounterSubmission => ({
  id: r.id,
  dossier: r.dossierId,
  by: handle(r.by),
  at: isoDateTime(r.at),
  kind: r.kind as CounterSubmission["kind"],
  text: r.text,
  url: r.url,
  reviewState: r.reviewState as CounterSubmission["reviewState"],
  incorporated: r.incorporated,
  isDemo: r.isDemo,
});

export const mapCorrection = (r: CorrectionRow): Correction => ({
  id: r.id,
  target: r.targetId,
  targetLabel: r.targetLabel,
  by: handle(r.by),
  at: isoDateTime(r.at),
  whatIsWrong: r.whatIsWrong,
  why: r.why,
  sourceUrl: r.sourceUrl,
  reviewState: r.reviewState as Correction["reviewState"],
  resolution: r.resolution,
  isDemo: r.isDemo,
});

export const mapActivity = (r: ActivityRow): ActivityEvent => ({
  id: r.id,
  at: isoDateTime(r.at),
  actor: handle(r.actor),
  kind: r.kind as ActivityEvent["kind"],
  text: r.text,
  href: r.href,
  layer: r.layer as ActivityEvent["layer"],
});
