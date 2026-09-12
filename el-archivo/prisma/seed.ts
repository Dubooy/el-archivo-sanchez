/* ============================================================
   SEMILLA — importa los 18 JSON de src/data a PostgreSQL
   ------------------------------------------------------------
   Se ejecuta con:   npm run db:seed
   Es idempotente: puedes lanzarla las veces que quieras. Empieza
   borrando SOLO lo marcado con isDemo, así que nunca toca material
   real que hayas añadido después.

   Dos decisiones que conviene conocer:

   1. Los registros de demostración conservan su identificador
      legible como clave primaria (exp-007, stm-111). Los registros
      nuevos que cree la aplicación recibirán un cuid. Así se puede
      rastrear de un vistazo qué viene de la demo.

   2. Los votos del JSON son RECUENTOS (450 votos en un expediente).
      Un voto real necesita una cuenta real, y aquí solo hay 12
      usuarios de demostración, así que el recuento se reparte entre
      ellos respetando las proporciones: un voto por persona y
      expediente, como en producción. Los números bajan y son ciertos,
      que es justo lo que el proyecto dice preferir.
   ============================================================ */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATA = join(process.cwd(), "src", "data");
const read = <T>(file: string): T => JSON.parse(readFileSync(join(DATA, `${file}.json`), "utf8")) as T;

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/* ---------------------- conversiones ---------------------------- */

/** "resolucion-judicial" → "RESOLUCION_JUDICIAL" */
const tier = (t: string) => t.toUpperCase().replace(/-/g, "_") as never;
/** "moderador" → "MODERADOR" */
const role = (r: string) => r.toUpperCase() as never;
const date = (d: string | null | undefined) => (d ? new Date(d) : null);
const day = (d: string) => new Date(d);

/** Prefijo del identificador → qué tipo de registro es. */
const TYPE_BY_PREFIX: Record<string, string> = {
  exp: "dossier",
  stm: "statement",
  prm: "promise",
  con: "contradiction",
  tml: "timelineEvent",
  vq: "viralQuote",
  src: "source",
  vid: "video",
  jud: "judicialCase",
};
const typeOf = (id: string) => TYPE_BY_PREFIX[id.split("-")[0]] ?? "desconocido";

/* ------------------------- tipos del JSON ----------------------- */
type Json = Record<string, any>;

async function main() {
  console.log("→ Leyendo src/data…");
  const subjects = read<Json[]>("subjects");
  const users = read<Json[]>("users");
  const videos = read<Json[]>("videos");
  const dossiers = read<Json[]>("dossiers");
  const statements = read<Json[]>("statements");
  const timeline = read<Json[]>("timeline");
  const contradictions = read<Json[]>("contradictions");
  const promises = read<Json[]>("promises");
  const viral = read<Json[]>("viralQuotes");
  const judicial = read<Json[]>("judicial");
  const sources = read<Json[]>("sources");
  const submissions = read<Json[]>("submissions");
  const comments = read<Json[]>("comments");
  const counter = read<Json[]>("counterEvidence");
  const votes = read<Json[]>("votes");
  const corrections = read<Json[]>("corrections");
  const activity = read<Json[]>("activity");
  const meta = read<Json>("meta");

  /* ---------- 0. limpieza: solo lo que es demo ---------- */
  console.log("→ Borrando datos de demostración anteriores…");
  await prisma.$transaction([
    prisma.activityEvent.deleteMany({}),
    prisma.vote.deleteMany({}),
    prisma.commentUpvote.deleteMany({}),
    prisma.comment.deleteMany({ where: { isDemo: true } }),
    prisma.counterEvidence.deleteMany({ where: { isDemo: true } }),
    prisma.correction.deleteMany({ where: { isDemo: true } }),
    prisma.submission.deleteMany({ where: { isDemo: true } }),
    prisma.sourceLink.deleteMany({}),
    prisma.source.deleteMany({ where: { isDemo: true } }),
    prisma.dossierChange.deleteMany({}),
    prisma.dossierStatement.deleteMany({}),
    prisma.dossierTimeline.deleteMany({}),
    prisma.contradictionStep.deleteMany({}),
    prisma.contradiction.deleteMany({ where: { isDemo: true } }),
    prisma.viralQuote.deleteMany({ where: { isDemo: true } }),
    prisma.judicialCase.deleteMany({ where: { isDemo: true } }),
    prisma.politicalPromise.deleteMany({ where: { isDemo: true } }),
    prisma.timelineEvent.deleteMany({ where: { isDemo: true } }),
    prisma.statement.deleteMany({ where: { isDemo: true } }),
    prisma.video.deleteMany({ where: { isDemo: true } }),
    prisma.dossier.deleteMany({ where: { isDemo: true } }),
    prisma.subject.deleteMany({ where: { isDemo: true } }),
    prisma.user.deleteMany({ where: { isDemo: true } }),
  ]);

  /* ---------- 1. estado del archivo ---------- */
  await prisma.archiveMeta.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      build: meta.build,
      lastUpdated: day(meta.lastUpdated),
      demoMode: meta.demoMode,
      disclaimer: meta.disclaimer,
    },
    update: {
      build: meta.build,
      lastUpdated: day(meta.lastUpdated),
      demoMode: meta.demoMode,
      disclaimer: meta.disclaimer,
    },
  });

  /* ---------- 2. sujetos y usuarios ---------- */
  await prisma.subject.createMany({
    data: subjects.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      role: s.role,
      party: s.party,
      from: day(s.from),
      to: date(s.to),
      status: s.status,
      note: s.note,
      isDemo: s.isDemo,
    })),
  });

  await prisma.user.createMany({
    data: [
      ...users.map((u) => ({
        id: u.id,
        handle: u.handle,
        role: role(u.role),
        bio: u.bio,
        reputation: u.reputation,
        isDemo: u.isDemo,
        createdAt: day(u.joinedAt),
        // Sin correo: los usuarios demo no tienen cuenta real y no
        // pueden iniciar sesión. Los reales llegarán por Auth.js.
      })),
      {
        // El feed de actividad atribuye a «@editorial» lo que hace el
        // equipo, no un lector. Necesita existir como usuario para que
        // esas entradas tengan autor en lugar de quedar huérfanas.
        id: "usr-editorial",
        handle: "@editorial",
        role: role("editor"),
        bio: "Equipo editorial del archivo.",
        reputation: 0,
        isDemo: true,
        createdAt: day("2026-01-01"),
      },
    ],
  });
  /** handle (@usuario_demo_01) → id (usr-001) */
  const userId = new Map<string, string>([
    ...users.map((u) => [u.handle as string, u.id as string] as [string, string]),
    ["@editorial", "usr-editorial"],
  ]);
  const byHandle = (h: string | null | undefined) => (h ? userId.get(h) ?? null : null);

  /* ---------- 3. vídeos ---------- */
  await prisma.video.createMany({
    data: videos.map((v) => ({
      id: v.id,
      publicId: v.id,
      subjectId: v.subject,
      title: v.title,
      date: day(v.date),
      duration: v.duration,
      platform: v.platform,
      url: v.url,
      embeddable: v.embeddable,
      transcriptAvailable: v.transcriptAvailable,
      reviewState: v.reviewState,
      publishedAt: v.reviewState === "VERIFICADO" ? day(v.date) : null,
      contributedById: byHandle(v.contributedBy),
      isDemo: v.isDemo,
    })),
  });

  /* ---------- 4. expedientes (antes que las declaraciones) ---------- */
  await prisma.dossier.createMany({
    data: dossiers.map((d) => ({
      id: d.id,
      publicId: d.id,
      number: d.number,
      slug: d.slug,
      subjectId: d.subject,
      title: d.title,
      topics: d.topics,
      whatWasSaid: d.whatWasSaid,
      whenAndContext: d.whenAndContext,
      whatSourcesSay: d.whatSourcesSay,
      counterEvidence: d.counterEvidence,
      conclusion: d.conclusion,
      evidence: d.evidence,
      limitations: d.limitations,
      openedAt: day(d.openedAt),
      lastUpdated: day(d.lastUpdated),
      isDemo: d.isDemo,
    })),
  });

  /* ---------- 5. declaraciones ---------- */
  await prisma.statement.createMany({
    data: statements.map((s) => ({
      id: s.id,
      publicId: s.id,
      subjectId: s.subject,
      text: s.text,
      date: day(s.date),
      place: s.place,
      context: s.context,
      topics: s.topics,
      videoId: s.video,
      videoTimestamp: s.videoTimestamp,
      dossierId: s.dossier,
      reviewState: s.reviewState,
      // La premoderación es estructura: publishedAt solo se rellena
      // si el registro está verificado.
      publishedAt: s.reviewState === "VERIFICADO" ? day(s.addedAt) : null,
      contributedById: byHandle(s.contributedBy),
      addedAt: day(s.addedAt),
      isDemo: s.isDemo,
    })),
  });

  /* ---------- 6. cronología ---------- */
  await prisma.timelineEvent.createMany({
    data: timeline.map((t) => ({
      id: t.id,
      publicId: t.id,
      subjectId: t.subject,
      date: day(t.date),
      kind: t.kind,
      title: t.title,
      detail: t.detail,
      topics: t.topics,
      relatedStatementId: t.relatedStatement,
      isDemo: t.isDemo,
    })),
  });

  /* ---------- 7. bloques 01 y 03 de cada expediente ---------- */
  await prisma.dossierStatement.createMany({
    data: dossiers.flatMap((d) =>
      (d.statementRefs as string[]).map((sid, i) => ({
        dossierId: d.id,
        statementId: sid,
        position: i,
      })),
    ),
    skipDuplicates: true,
  });
  await prisma.dossierTimeline.createMany({
    data: dossiers.flatMap((d) =>
      (d.timelineRefs as string[]).map((tid, i) => ({
        dossierId: d.id,
        timelineId: tid,
        position: i,
      })),
    ),
    skipDuplicates: true,
  });

  /* ---------- 8. historial de cambios de evidencia ---------- */
  await prisma.dossierChange.createMany({
    data: dossiers.flatMap((d) =>
      (d.changes as Json[]).map((c) => ({
        dossierId: d.id,
        from: c.from,
        to: c.to,
        reason: c.reason,
        at: day(c.at),
      })),
    ),
  });

  /* ---------- 9. contradicciones y sus pasos ---------- */
  await prisma.contradiction.createMany({
    data: contradictions.map((c) => ({
      id: c.id,
      publicId: c.id,
      subjectId: c.subject,
      title: c.title,
      topics: c.topics,
      evidence: c.evidence,
      conclusion: c.conclusion,
      limitations: c.limitations,
      dossierId: c.dossier,
      lastUpdated: day(c.lastUpdated),
      isDemo: c.isDemo,
    })),
  });

  /** id del paso → fuentes que lo respaldan (se usa más abajo). */
  const stepSources: { stepId: string; sourceIds: string[] }[] = [];
  await prisma.contradictionStep.createMany({
    data: contradictions.flatMap((c) =>
      (c.steps as Json[]).map((s, i) => {
        const id = `${c.id}-p${String(i + 1).padStart(2, "0")}`;
        stepSources.push({ stepId: id, sourceIds: s.sources ?? [] });
        const ref: string | null = s.ref ?? null;
        return {
          id,
          contradictionId: c.id,
          position: i,
          at: day(s.at),
          side: s.side,
          label: s.label,
          detail: s.detail,
          statementId: ref && ref.startsWith("stm-") ? ref : null,
          timelineId: ref && ref.startsWith("tml-") ? ref : null,
        };
      }),
    ),
  });

  /* ---------- 10. promesas ---------- */
  await prisma.politicalPromise.createMany({
    data: promises.map((p) => ({
      id: p.id,
      publicId: p.id,
      subjectId: p.subject,
      text: p.text,
      date: day(p.date),
      context: p.context,
      objective: p.objective,
      deadline: date(p.deadline),
      state: p.state,
      stateRationale: p.stateRationale,
      topics: p.topics,
      lastReviewed: day(p.lastReviewed),
      isDemo: p.isDemo,
    })),
  });

  /* ---------- 11. frases virales y módulo judicial ---------- */
  await prisma.viralQuote.createMany({
    data: viral.map((v) => ({
      id: v.id,
      publicId: v.id,
      subjectId: v.subject,
      circulating: v.circulating,
      result: v.result,
      whatIsDocumented: v.whatIsDocumented,
      explanation: v.explanation,
      videoId: v.video,
      videoTimestamp: v.videoTimestamp,
      date: date(v.date),
      shares: v.shares,
      isDemo: v.isDemo,
    })),
  });

  await prisma.judicialCase.createMany({
    data: judicial.map((j) => ({
      id: j.id,
      publicId: j.id,
      caseName: j.caseName,
      investigatedParties: j.investigatedParties,
      court: j.court,
      facts: j.facts,
      relationToSubject: j.relationToSubject,
      relationEvidence: j.relationEvidence,
      status: j.status,
      proven: j.proven,
      pending: j.pending,
      allegationsOnly: j.allegationsOnly,
      lastUpdated: day(j.lastUpdated),
      isDemo: j.isDemo,
    })),
  });

  /* ---------- 12. fuentes ---------- */
  await prisma.source.createMany({
    data: sources.map((s) => ({
      id: s.id,
      publicId: s.id,
      title: s.title,
      url: s.url,
      author: s.author,
      publishedAt: date(s.publishedAt),
      tier: tier(s.tier),
      summary: s.summary,
      contributedById: byHandle(s.contributedBy),
      addedAt: day(s.addedAt),
      isDemo: s.isDemo,
    })),
  });

  /* ---------- 13. enlaces fuente → registro ----------
     Cada fila enlaza UNA fuente con UN registro. La restricción
     CHECK de la migración garantiza que no haya dos destinos. */
  const links: Json[] = [];
  /** Todas las filas se crean con las OCHO columnas de destino, siete
      de ellas en null. `createMany` construye una sola sentencia con
      las columnas de la primera fila: si las filas tuvieran claves
      distintas, las demás se insertarían mal. */
  const link = (sourceId: string, field: string, targetId: string, position: number) =>
    links.push({
      sourceId,
      statementId: null,
      promiseId: null,
      dossierId: null,
      contradictionId: null,
      timelineId: null,
      viralQuoteId: null,
      judicialCaseId: null,
      stepId: null,
      [field]: targetId,
      position,
    });

  statements.forEach((s) => (s.sources as string[]).forEach((src, i) => link(src, "statementId", s.id, i)));
  promises.forEach((p) => (p.sources as string[]).forEach((src, i) => link(src, "promiseId", p.id, i)));
  timeline.forEach((t) => (t.sources as string[]).forEach((src, i) => link(src, "timelineId", t.id, i)));
  viral.forEach((v) => (v.sources as string[]).forEach((src, i) => link(src, "viralQuoteId", v.id, i)));
  judicial.forEach((j) => (j.sources as string[]).forEach((src, i) => link(src, "judicialCaseId", j.id, i)));
  contradictions.forEach((c) => (c.sources as string[]).forEach((src, i) => link(src, "contradictionId", c.id, i)));
  dossiers.forEach((d) => (d.sources as string[]).forEach((src, i) => link(src, "dossierId", d.id, i)));
  stepSources.forEach(({ stepId, sourceIds }) =>
    sourceIds.forEach((src, i) => link(src, "stepId", stepId, i)),
  );

  // Una fuente puede citarse dos veces en el mismo sitio en los datos
  // demo; la clave única lo impediría, así que se deduplica antes.
  const seen = new Set<string>();
  const uniqueLinks = links.filter((l) => {
    const key = JSON.stringify(l);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const knownSources = new Set(sources.map((s) => s.id as string));
  const validLinks = uniqueLinks.filter((l) => knownSources.has(l.sourceId));
  if (validLinks.length !== uniqueLinks.length) {
    console.warn(`   ⚠ ${uniqueLinks.length - validLinks.length} enlaces apuntaban a fuentes inexistentes`);
  }

  await prisma.sourceLink.createMany({ data: validLinks as never, skipDuplicates: true });

  /* ---------- 14. capa comunidad ---------- */
  await prisma.submission.createMany({
    data: submissions.map((s) => ({
      id: s.id,
      kind: s.kind,
      subjectId: s.subject,
      title: s.title,
      url: s.url,
      description: s.description,
      approxDate: s.approxDate,
      context: s.context,
      whyRelevant: s.whyRelevant,
      userConclusion: s.userConclusion,
      byId: byHandle(s.by),
      reviewState: s.reviewState,
      moderatorNote: s.moderatorNote ?? "",
      becameRecordType: s.becameRecord ? typeOf(s.becameRecord) : null,
      becameRecordId: s.becameRecord ?? null,
      at: day(s.at),
      isDemo: s.isDemo,
    })),
  });

  await prisma.comment.createMany({
    data: comments.map((c) => ({
      id: c.id,
      dossierId: c.dossier,
      byId: byHandle(c.by),
      stance: c.stance,
      text: c.text,
      sourceUrl: c.sourceUrl,
      upvotes: c.upvotes,
      reviewState: c.reviewState,
      publishedAt: c.reviewState === "VERIFICADO" ? day(c.at) : null,
      at: day(c.at),
      isDemo: c.isDemo,
    })),
  });

  await prisma.counterEvidence.createMany({
    data: counter.map((c) => ({
      id: c.id,
      dossierId: c.dossier,
      byId: byHandle(c.by),
      kind: c.kind,
      text: c.text,
      url: c.url,
      reviewState: c.reviewState,
      incorporated: c.incorporated,
      at: day(c.at),
      isDemo: c.isDemo,
    })),
  });

  await prisma.correction.createMany({
    data: corrections.map((c) => ({
      id: c.id,
      targetType: typeOf(c.target),
      targetId: c.target,
      targetLabel: c.targetLabel,
      byId: byHandle(c.by),
      whatIsWrong: c.whatIsWrong,
      why: c.why,
      sourceUrl: c.sourceUrl,
      reviewState: c.reviewState,
      resolution: c.resolution ?? "",
      resolvedAt: c.reviewState === "PENDIENTE" ? null : day(c.at),
      at: day(c.at),
      isDemo: c.isDemo,
    })),
  });

  /* ---------- 15. votos: del recuento a votos reales ----------
     Un voto por persona y expediente, repartiendo los 12 usuarios
     demo según las proporciones del recuento original. */
  const OPTIONS = ["FUNDAMENTADA", "NO_DE_ACUERDO", "FALTA_EVIDENCIA", "FALTA_CONTEXTO"] as const;
  const voteRows: Json[] = [];
  for (const tally of votes) {
    const total = OPTIONS.reduce((n, o) => n + (tally[o] ?? 0), 0);
    if (!total) continue;

    // Reparto por restos mayores: las partes enteras primero y los
    // votos sobrantes a las opciones con mayor resto. Así la suma es
    // exactamente el número de usuarios, sin favorecer a la primera
    // opción como haría un redondeo a secas.
    const exact = OPTIONS.map((o) => ((tally[o] ?? 0) / total) * users.length);
    const share = exact.map(Math.floor);
    let left = users.length - share.reduce((a, b) => a + b, 0);
    const order = exact
      .map((v, i) => ({ i, rest: v - Math.floor(v) }))
      .sort((a, b) => b.rest - a.rest);
    for (const { i } of order) {
      if (left-- <= 0) break;
      share[i] += 1;
    }

    let u = 0;
    OPTIONS.forEach((option, i) => {
      for (let n = 0; n < share[i] && u < users.length; n++, u++) {
        voteRows.push({ dossierId: tally.dossier, userId: users[u].id, option });
      }
    });
  }
  await prisma.vote.createMany({ data: voteRows as never, skipDuplicates: true });

  /* ---------- 16. feed de actividad ---------- */
  await prisma.activityEvent.createMany({
    data: activity.map((a) => ({
      id: a.id,
      kind: a.kind,
      layer: a.layer,
      text: a.text,
      href: a.href,
      actorId: byHandle(a.actor),
      at: day(a.at),
    })),
  });

  /* ---------- recuento final ---------- */
  const counts = {
    sujetos: await prisma.subject.count(),
    usuarios: await prisma.user.count(),
    declaraciones: await prisma.statement.count(),
    expedientes: await prisma.dossier.count(),
    contradicciones: await prisma.contradiction.count(),
    pasos: await prisma.contradictionStep.count(),
    promesas: await prisma.politicalPromise.count(),
    cronologia: await prisma.timelineEvent.count(),
    fuentes: await prisma.source.count(),
    enlacesDeFuente: await prisma.sourceLink.count(),
    videos: await prisma.video.count(),
    frasesVirales: await prisma.viralQuote.count(),
    aportaciones: await prisma.submission.count(),
    comentarios: await prisma.comment.count(),
    contraevidencia: await prisma.counterEvidence.count(),
    correcciones: await prisma.correction.count(),
    votos: await prisma.vote.count(),
    actividad: await prisma.activityEvent.count(),
  };
  console.log("\n✔ Semilla completada:");
  console.table(counts);
  console.log(
    "\nTodo lo insertado lleva isDemo = true. Para vaciarlo:\n" +
      "  npx prisma studio  →  filtra por isDemo y borra,\n" +
      "o vuelve a lanzar la semilla, que borra lo demo antes de empezar.\n",
  );
}

main()
  .catch((e) => {
    console.error("✖ La semilla ha fallado:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
