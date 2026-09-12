import { prisma } from "./prisma";
import { MODULES } from "./config";
import type {
  ActivityEvent,
  ArchiveMeta,
  Comment,
  Contradiction,
  Correction,
  CounterSubmission,
  Dossier,
  JudicialCase,
  PoliticalPromise,
  Source,
  Statement,
  Subject,
  Submission,
  TimelineEvent,
  User,
  VideoRecord,
  ViralQuote,
  VoteTally,
} from "./types";
import {
  mapActivity,
  mapComment,
  mapContradiction,
  mapCorrection,
  mapCounter,
  mapDossier,
  mapJudicial,
  mapPromise,
  mapSource,
  mapStatement,
  mapSubject,
  mapSubmission,
  mapTimeline,
  mapUser,
  mapVideo,
  mapViral,
  tierToApp,
} from "./mappers";

/* ============================================================
   CAPA DE ACCESO A DATOS
   ------------------------------------------------------------
   Ninguna pantalla consulta la base de datos. Todas pasan por aquí.
   Las firmas son las mismas que cuando los datos vivían en archivos
   JSON: mismos nombres, mismos parámetros, mismos tipos de salida.
   Lo único que ha cambiado es que ahora devuelven promesas, así que
   las pantallas las esperan con `await`.

   Dos reglas que se aplican AQUÍ y no en las pantallas:

   · PREMODERACIÓN. Lo que no está VERIFICADO no sale al público.
     Está en las consultas, y además en una restricción CHECK de la
     base de datos: para que se publique algo sin revisar tendrían
     que fallar las dos cosas a la vez.

   · SEPARACIÓN DE CAPAS. Las funciones del archivo y las de la
     comunidad no se cruzan, y los votos no entran jamás en un
     cálculo de evidencia.
   ============================================================ */

/* ------------------------------------------------------------------
   FRAGMENTOS DE CONSULTA REUTILIZABLES
   Cada `include` dice exactamente lo que el traductor necesita.
   ------------------------------------------------------------------ */

const PUBLICO = { reviewState: "VERIFICADO" } as const;
/** Las fuentes de un registro, en su orden de presentación. */
const FUENTES = { select: { sourceId: true }, orderBy: { position: "asc" } } as const;
const AUTOR = { select: { handle: true } } as const;

const CON_STATEMENT = {
  sources: FUENTES,
  contributedBy: AUTOR,
} as const;

const CON_DOSSIER = {
  sources: FUENTES,
  statementRefs: { select: { statementId: true }, orderBy: { position: "asc" } },
  timelineRefs: { select: { timelineId: true }, orderBy: { position: "asc" } },
  changes: { orderBy: { at: "asc" } },
} as const;

const CON_CONTRADICTION = {
  sources: FUENTES,
  steps: { include: { sources: FUENTES }, orderBy: { position: "asc" } },
} as const;

/* ------------------------------------------------------------------
   ESTADO DEL ARCHIVO
   ------------------------------------------------------------------ */

/** Build, última actualización y si la instalación va en modo demo.
    Antes era una constante importada; ahora vive en la tabla
    archive_meta y se lee con `await getMeta()`. */
export async function getMeta(): Promise<ArchiveMeta> {
  const row = await prisma.archiveMeta.findUnique({ where: { id: 1 } });
  if (!row) {
    // La tabla se rellena con la semilla. Si falta, no se rompe la web:
    // se devuelve un estado neutro y conservador.
    return {
      build: "sin-definir",
      lastUpdated: new Date().toISOString().slice(0, 10),
      demoMode: true,
      disclaimer:
        "No se ha podido leer el estado del archivo. Trata todo lo que veas como no verificado.",
    };
  }
  return {
    build: row.build,
    lastUpdated: row.lastUpdated.toISOString().slice(0, 10),
    demoMode: row.demoMode,
    disclaimer: row.disclaimer,
  };
}

/* ------------------------------------------------------------------
   SUJETOS
   ------------------------------------------------------------------ */

export async function getSubjects(): Promise<Subject[]> {
  const rows = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapSubject);
}

export async function getActiveSubjects(): Promise<Subject[]> {
  const rows = await prisma.subject.findMany({
    where: { status: "activo" },
    orderBy: { name: "asc" },
  });
  return rows.map(mapSubject);
}

export async function getSubject(slugOrId: string): Promise<Subject | null> {
  const row = await prisma.subject.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
  });
  return row ? mapSubject(row) : null;
}

export async function primarySubject(): Promise<Subject | null> {
  const row =
    (await prisma.subject.findFirst({ where: { status: "activo" }, orderBy: { name: "asc" } })) ??
    (await prisma.subject.findFirst({ orderBy: { name: "asc" } }));
  return row ? mapSubject(row) : null;
}

/* ------------------------------------------------------------------
   ARCHIVO
   ------------------------------------------------------------------ */

export async function getStatements(): Promise<Statement[]> {
  const rows = await prisma.statement.findMany({
    where: { ...PUBLICO, deletedAt: null },
    include: CON_STATEMENT,
    orderBy: { date: "desc" },
  });
  return rows.map(mapStatement);
}

/** Ficha individual: no filtra por estado, porque la usa también la
    cola de moderación para ver lo que aún no es público. */
export async function getStatement(id: string): Promise<Statement | null> {
  const row = await prisma.statement.findFirst({
    where: { OR: [{ id }, { publicId: id }] },
    include: CON_STATEMENT,
  });
  return row ? mapStatement(row) : null;
}

/** Varias declaraciones por id, DEVUELTAS EN EL ORDEN PEDIDO.
    Importa: los bloques del expediente enumeran sus declaraciones en
    un orden concreto, y la base de datos no tiene por qué respetarlo. */
export async function getStatementsByIds(ids: string[]): Promise<Statement[]> {
  if (!ids.length) return [];
  const rows = await prisma.statement.findMany({
    where: { id: { in: ids } },
    include: CON_STATEMENT,
  });
  const porId = new Map(rows.map((r) => [r.id, mapStatement(r)]));
  return ids.map((i) => porId.get(i)).filter((s): s is Statement => Boolean(s));
}

export async function getPromises(): Promise<PoliticalPromise[]> {
  const rows = await prisma.politicalPromise.findMany({
    where: { deletedAt: null },
    include: { sources: FUENTES },
    orderBy: { date: "desc" },
  });
  return rows.map(mapPromise);
}

export async function getPromise(id: string): Promise<PoliticalPromise | null> {
  const row = await prisma.politicalPromise.findFirst({
    where: { OR: [{ id }, { publicId: id }] },
    include: { sources: FUENTES },
  });
  return row ? mapPromise(row) : null;
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  const rows = await prisma.timelineEvent.findMany({
    include: { sources: FUENTES },
    orderBy: { date: "desc" },
  });
  return rows.map(mapTimeline);
}

/** Los hechos de un expediente, en orden cronológico ascendente:
    la columna «qué ocurrió después» se lee de arriba abajo. */
export async function getTimelineByIds(ids: string[]): Promise<TimelineEvent[]> {
  if (!ids.length) return [];
  const rows = await prisma.timelineEvent.findMany({
    where: { id: { in: ids } },
    include: { sources: FUENTES },
    orderBy: { date: "asc" },
  });
  return rows.map(mapTimeline);
}

export async function getContradictions(): Promise<Contradiction[]> {
  const rows = await prisma.contradiction.findMany({
    where: { deletedAt: null },
    include: CON_CONTRADICTION,
    orderBy: { lastUpdated: "desc" },
  });
  return rows.map(mapContradiction);
}

export async function getContradiction(id: string): Promise<Contradiction | null> {
  const row = await prisma.contradiction.findFirst({
    where: { OR: [{ id }, { publicId: id }] },
    include: CON_CONTRADICTION,
  });
  return row ? mapContradiction(row) : null;
}

export async function getDossiers(): Promise<Dossier[]> {
  const rows = await prisma.dossier.findMany({
    where: { deletedAt: null },
    include: CON_DOSSIER,
    orderBy: { lastUpdated: "desc" },
  });
  return rows.map(mapDossier);
}

export async function getDossier(idOrSlug: string): Promise<Dossier | null> {
  const row = await prisma.dossier.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }, { publicId: idOrSlug }] },
    include: CON_DOSSIER,
  });
  return row ? mapDossier(row) : null;
}

export async function getViralQuotes(): Promise<ViralQuote[]> {
  const rows = await prisma.viralQuote.findMany({
    include: { sources: FUENTES },
    orderBy: { shares: "desc" },
  });
  return rows.map(mapViral);
}

export async function getViralQuote(id: string): Promise<ViralQuote | null> {
  const row = await prisma.viralQuote.findFirst({
    where: { OR: [{ id }, { publicId: id }] },
    include: { sources: FUENTES },
  });
  return row ? mapViral(row) : null;
}

export async function getSources(): Promise<Source[]> {
  const rows = await prisma.source.findMany({
    where: { deletedAt: null },
    include: { contributedBy: AUTOR, links: { select: { dossierId: true } } },
    // Por nivel documental primero (el enum está ordenado de más a
    // menos sólido) y, dentro de cada nivel, lo más reciente.
    orderBy: [{ tier: "asc" }, { publishedAt: "desc" }],
  });
  return rows.map(mapSource);
}

export async function getSource(id: string): Promise<Source | null> {
  const row = await prisma.source.findFirst({
    where: { OR: [{ id }, { publicId: id }] },
    include: { contributedBy: AUTOR, links: { select: { dossierId: true } } },
  });
  return row ? mapSource(row) : null;
}

export async function getSourcesByIds(ids: string[]): Promise<Source[]> {
  if (!ids.length) return [];
  const rows = await prisma.source.findMany({
    where: { id: { in: ids } },
    include: { contributedBy: AUTOR, links: { select: { dossierId: true } } },
  });
  const porId = new Map(rows.map((r) => [r.id, mapSource(r)]));
  return ids.map((i) => porId.get(i)).filter((s): s is Source => Boolean(s));
}

export async function getVideos(): Promise<VideoRecord[]> {
  const rows = await prisma.video.findMany({
    where: PUBLICO,
    include: { contributedBy: AUTOR },
    orderBy: { date: "desc" },
  });
  return rows.map(mapVideo);
}

export async function getVideo(id: string): Promise<VideoRecord | null> {
  const row = await prisma.video.findFirst({
    where: { OR: [{ id }, { publicId: id }] },
    include: { contributedBy: AUTOR },
  });
  return row ? mapVideo(row) : null;
}

/** Módulo judicial: si está apagado en config.ts, no se consulta
    siquiera. Apagarlo lo retira de toda la aplicación. */
export async function getJudicialCases(): Promise<JudicialCase[]> {
  if (!MODULES.judicial) return [];
  const rows = await prisma.judicialCase.findMany({
    include: { sources: FUENTES },
    orderBy: { lastUpdated: "desc" },
  });
  return rows.map(mapJudicial);
}

/* ------------------------------------------------------------------
   COMUNIDAD
   ------------------------------------------------------------------ */

/** Cuenta, para una lista de usuarios, lo que de verdad han aportado.
    Cuatro consultas agrupadas en lugar de recorrer filas en memoria. */
async function statsPorUsuario(userIds: string[]) {
  const [aportaciones, fuentes, debates, correcciones] = await Promise.all([
    prisma.submission.groupBy({
      by: ["byId"],
      where: { byId: { in: userIds } },
      _count: { _all: true },
    }),
    prisma.source.groupBy({
      by: ["contributedById"],
      where: { contributedById: { in: userIds } },
      _count: { _all: true },
    }),
    prisma.comment.groupBy({
      by: ["byId"],
      where: { byId: { in: userIds }, ...PUBLICO },
      _count: { _all: true },
    }),
    prisma.correction.groupBy({
      by: ["byId"],
      where: { byId: { in: userIds }, ...PUBLICO },
      _count: { _all: true },
    }),
  ]);

  const mapa = new Map<string, User["stats"]>(
    userIds.map((id) => [id, { submissions: 0, acceptedSources: 0, debates: 0, acceptedCorrections: 0 }]),
  );
  const suma = (
    filas: { byId?: string | null; contributedById?: string | null; _count: { _all: number } }[],
    campo: keyof User["stats"],
  ) => {
    for (const f of filas) {
      const id = f.byId ?? f.contributedById;
      if (!id) continue;
      const s = mapa.get(id);
      if (s) s[campo] = f._count._all;
    }
  };
  suma(aportaciones, "submissions");
  suma(fuentes, "acceptedSources");
  suma(debates, "debates");
  suma(correcciones, "acceptedCorrections");
  return mapa;
}

export async function getUsers(): Promise<User[]> {
  const rows = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: [{ reputation: "desc" }, { handle: "asc" }],
  });
  const stats = await statsPorUsuario(rows.map((r) => r.id));
  return rows.map((r) =>
    mapUser(r, stats.get(r.id) ?? { submissions: 0, acceptedSources: 0, debates: 0, acceptedCorrections: 0 }),
  );
}

export async function getUser(handle: string): Promise<User | null> {
  const conArroba = handle.startsWith("@") ? handle : `@${handle}`;
  const row = await prisma.user.findFirst({
    where: { OR: [{ handle }, { handle: conArroba }], deletedAt: null },
  });
  if (!row) return null;
  const stats = await statsPorUsuario([row.id]);
  return mapUser(
    row,
    stats.get(row.id) ?? { submissions: 0, acceptedSources: 0, debates: 0, acceptedCorrections: 0 },
  );
}

export async function getSubmissions(): Promise<Submission[]> {
  const rows = await prisma.submission.findMany({
    include: { by: AUTOR },
    orderBy: { at: "desc" },
  });
  return rows.map(mapSubmission);
}

/** Cola de moderación: lo que espera decisión humana. */
export async function getQueue(): Promise<Submission[]> {
  const rows = await prisma.submission.findMany({
    where: { reviewState: { in: ["PENDIENTE", "NECESITA_INFO"] } },
    include: { by: AUTOR },
    // Lo escalado primero: si algo atribuye responsabilidad penal,
    // no puede quedarse esperando al final de la cola.
    orderBy: [{ escalated: "desc" }, { at: "desc" }],
  });
  return rows.map(mapSubmission);
}

/** Lo ya decidido, para poder revisar lo que se hizo. Se limita
    porque el historial crece sin fin y la página solo enseña lo
    reciente; para auditar todo está `moderation_log`. */
export async function getDecided(limit = 20): Promise<Submission[]> {
  const rows = await prisma.submission.findMany({
    where: { reviewState: { in: ["VERIFICADO", "RECHAZADO"] } },
    include: { by: AUTOR },
    orderBy: { at: "desc" },
    take: limit,
  });
  return rows.map(mapSubmission);
}

export async function getCommentsFor(dossierId: string): Promise<Comment[]> {
  const rows = await prisma.comment.findMany({
    where: { dossierId, ...PUBLICO, deletedAt: null },
    include: { by: AUTOR },
    orderBy: [{ upvotes: "desc" }, { at: "desc" }],
  });
  return rows.map(mapComment);
}

/** Cuántos comentarios publicados tiene cada expediente, en UNA sola
    consulta agrupada. Las listas de expedientes lo necesitan para
    pintar el contador de cada tarjeta; pedirlo tarjeta a tarjeta
    serían veinticuatro consultas por página. */
export async function getCommentCounts(): Promise<Record<string, number>> {
  const filas = await prisma.comment.groupBy({
    by: ["dossierId"],
    where: { ...PUBLICO, deletedAt: null },
    _count: { _all: true },
  });
  return filas.reduce<Record<string, number>>((m, f) => {
    m[f.dossierId] = f._count._all;
    return m;
  }, {});
}

/** Todos los comentarios publicados, de una vez. Lo usa el buscador:
    pedirlos expediente por expediente serían 24 consultas para pintar
    una sola página (el clásico problema N+1). */
export async function getPublishedComments(): Promise<Comment[]> {
  const rows = await prisma.comment.findMany({
    where: { ...PUBLICO, deletedAt: null },
    include: { by: AUTOR },
    orderBy: { at: "desc" },
  });
  return rows.map(mapComment);
}

export async function getPendingCommentsFor(dossierId: string): Promise<Comment[]> {
  const rows = await prisma.comment.findMany({
    where: { dossierId, reviewState: "PENDIENTE", deletedAt: null },
    include: { by: AUTOR },
    orderBy: { at: "desc" },
  });
  return rows.map(mapComment);
}

export async function getCounterFor(dossierId: string): Promise<CounterSubmission[]> {
  const rows = await prisma.counterEvidence.findMany({
    where: { dossierId, ...PUBLICO },
    include: { by: AUTOR },
    orderBy: { at: "desc" },
  });
  return rows.map(mapCounter);
}

/** Recuento de votos de un expediente.
    MIDE PERCEPCIÓN, NO VERDAD: este número no entra en ningún
    cálculo de evidencia, y la interfaz lo dice cada vez que lo
    enseña. Devuelve undefined si nadie ha votado todavía. */
export async function getVotes(dossierId: string): Promise<VoteTally | undefined> {
  const filas = await prisma.vote.groupBy({
    by: ["option"],
    where: { dossierId },
    _count: { _all: true },
  });
  if (!filas.length) return undefined;

  const tally: VoteTally = {
    dossier: dossierId,
    FUNDAMENTADA: 0,
    NO_DE_ACUERDO: 0,
    FALTA_EVIDENCIA: 0,
    FALTA_CONTEXTO: 0,
  };
  for (const f of filas) tally[f.option as keyof Omit<VoteTally, "dossier">] = f._count._all;
  return tally;
}

/** Qué votó una persona concreta en un expediente, o null.
    Se consulta aparte del recuento a propósito: el recuento es
    público y cacheable, esto es personal y no debe serlo. */
export async function getMyVote(dossierId: string, userId: string): Promise<string | null> {
  const fila = await prisma.vote.findUnique({
    where: { dossierId_userId: { dossierId, userId } },
    select: { option: true },
  });
  return fila?.option ?? null;
}

export async function getCorrections(): Promise<Correction[]> {
  const rows = await prisma.correction.findMany({
    include: { by: AUTOR },
    orderBy: { at: "desc" },
  });
  return rows.map(mapCorrection);
}

export async function getCorrectionsFor(target: string): Promise<Correction[]> {
  const rows = await prisma.correction.findMany({
    where: { targetId: target },
    include: { by: AUTOR },
    orderBy: { at: "desc" },
  });
  return rows.map(mapCorrection);
}

export async function getActivity(limit = 12): Promise<ActivityEvent[]> {
  const rows = await prisma.activityEvent.findMany({
    include: { actor: AUTOR },
    orderBy: { at: "desc" },
    take: limit,
  });
  return rows.map(mapActivity);
}

/* ------------------------------------------------------------------
   DERIVADOS
   ------------------------------------------------------------------ */

/** Los más debatidos. Popularidad y evidencia se muestran por
    separado: esto ordena por conversación, y el nivel de evidencia
    viaja al lado sin mezclarse nunca en la misma cifra. */
export async function getMostDebated(
  limit = 5,
): Promise<{ dossier: Dossier; comments: number; votes: number }[]> {
  const [dossiers, comentarios, votos] = await Promise.all([
    getDossiers(),
    prisma.comment.groupBy({ by: ["dossierId"], where: PUBLICO, _count: { _all: true } }),
    prisma.vote.groupBy({ by: ["dossierId"], _count: { _all: true } }),
  ]);

  const nComentarios = new Map(comentarios.map((c) => [c.dossierId, c._count._all]));
  const nVotos = new Map(votos.map((v) => [v.dossierId, v._count._all]));

  return dossiers
    .map((d) => ({
      dossier: d,
      comments: nComentarios.get(d.id) ?? 0,
      votes: nVotos.get(d.id) ?? 0,
    }))
    .sort((a, b) => b.comments * 30 + b.votes - (a.comments * 30 + a.votes))
    .slice(0, limit);
}

/** Expedientes que han cambiado de nivel de evidencia, el más
    reciente de cada uno. Un archivo que corrige en silencio no es un
    archivo: esto es lo que hace visible la corrección. */
export async function getRecentChanges(
  limit = 6,
): Promise<{ dossier: Dossier; change: Dossier["changes"][number] }[]> {
  const cambios = await prisma.dossierChange.findMany({
    distinct: ["dossierId"],
    orderBy: { at: "desc" },
    take: limit,
    include: { dossier: { include: CON_DOSSIER } },
  });

  return cambios.map((c) => ({
    dossier: mapDossier(c.dossier),
    change: {
      at: c.at.toISOString().slice(0, 10),
      from: c.from as Dossier["evidence"],
      to: c.to as Dossier["evidence"],
      reason: c.reason,
    },
  }));
}

export interface Stats {
  statements: number;
  promises: number;
  contradictions: number;
  dossiers: number;
  sources: number;
  submissions: number;
  videos: number;
  timeline: number;
  users: number;
  comments: number;
  corrections: number;
  pending: number;
  acceptedSubmissions: number;
  promiseCounts: Record<string, number>;
  evidenceCounts: Record<string, number>;
  topicCounts: { key: string; count: number }[];
  tierCounts: { key: string; count: number }[];
  byYear: { year: string; count: number }[];
  viralCounts: Record<string, number>;
}

/** Todas las cifras del panel, contadas por Postgres.
    Antes se calculaban recorriendo arrays en memoria; ahora son
    recuentos y agrupaciones, que es lo que sabe hacer rápido una
    base de datos aunque el archivo crezca a cien mil registros. */
export async function getStats(): Promise<Stats> {
  const [
    statements,
    promises,
    contradictions,
    dossiers,
    sources,
    submissions,
    videos,
    timeline,
    users,
    comments,
    corrections,
    pending,
    acceptedSubmissions,
    promiseCounts,
    evidenceCounts,
    tierCounts,
    viralCounts,
    topicRows,
    yearRows,
  ] = await Promise.all([
    prisma.statement.count({ where: { ...PUBLICO, deletedAt: null } }),
    prisma.politicalPromise.count({ where: { deletedAt: null } }),
    prisma.contradiction.count({ where: { deletedAt: null } }),
    prisma.dossier.count({ where: { deletedAt: null } }),
    prisma.source.count({ where: { deletedAt: null } }),
    prisma.submission.count(),
    prisma.video.count({ where: PUBLICO }),
    prisma.timelineEvent.count(),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.comment.count({ where: { ...PUBLICO, deletedAt: null } }),
    prisma.correction.count(),
    prisma.submission.count({ where: { reviewState: { in: ["PENDIENTE", "NECESITA_INFO"] } } }),
    prisma.submission.count({ where: PUBLICO }),
    prisma.politicalPromise.groupBy({ by: ["state"], _count: { _all: true } }),
    prisma.dossier.groupBy({ by: ["evidence"], _count: { _all: true } }),
    prisma.source.groupBy({ by: ["tier"], _count: { _all: true } }),
    prisma.viralQuote.groupBy({ by: ["result"], _count: { _all: true } }),
    // `topics` es una columna de array: no se puede agrupar con la API
    // normal, así que se despliega en SQL. unnest convierte cada tema
    // del array en una fila.
    prisma.$queryRaw<{ key: string; count: bigint }[]>`
      SELECT unnest(topics)::text AS key, count(*) AS count
      FROM statements
      WHERE "reviewState" = 'VERIFICADO' AND "deletedAt" IS NULL
      GROUP BY 1 ORDER BY count DESC
    `,
    prisma.$queryRaw<{ year: string; count: bigint }[]>`
      SELECT to_char(date, 'YYYY') AS year, count(*) AS count
      FROM statements
      WHERE "reviewState" = 'VERIFICADO' AND "deletedAt" IS NULL
      GROUP BY 1 ORDER BY 1 ASC
    `,
  ]);

  const aRecord = (filas: { _count: { _all: number } }[], clave: string) =>
    filas.reduce<Record<string, number>>((m, f) => {
      m[String((f as Record<string, unknown>)[clave])] = f._count._all;
      return m;
    }, {});

  return {
    statements,
    promises,
    contradictions,
    dossiers,
    sources,
    submissions,
    videos,
    timeline,
    users,
    comments,
    corrections,
    pending,
    acceptedSubmissions,
    promiseCounts: aRecord(promiseCounts, "state"),
    evidenceCounts: aRecord(evidenceCounts, "evidence"),
    // El nivel documental vuelve a su forma con guiones, que es la que
    // conocen las etiquetas de la interfaz.
    tierCounts: tierCounts.map((t) => ({ key: tierToApp(t.tier), count: t._count._all })),
    viralCounts: aRecord(viralCounts, "result"),
    topicCounts: topicRows.map((r) => ({ key: r.key, count: Number(r.count) })),
    byYear: yearRows.map((r) => ({ year: r.year, count: Number(r.count) })),
  };
}
