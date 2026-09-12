import {
  getContradictions,
  getDossiers,
  getPromises,
  getSources,
  getStatements,
  getTimeline,
  getVideos,
  getViralQuotes,
  getPublishedComments,
} from "./data";
import { EVIDENCE, PROMISE } from "./evidence";
import { TOPIC_LABEL } from "./format";
import { normalize } from "./text";

/* ============================================================
   BUSCADOR GLOBAL
   ------------------------------------------------------------
   Ocho tipos de resultado, agrupados. Los comentarios de la
   comunidad se buscan aparte y se etiquetan como tales: nunca
   aparecen mezclados con registros del archivo.
   ============================================================ */

export type Kind =
  | "declaracion"
  | "expediente"
  | "contradiccion"
  | "promesa"
  | "cronologia"
  | "video"
  | "fuente"
  | "viral"
  | "comentario";

export const KIND_LABEL: Record<Kind, string> = {
  declaracion: "Declaraciones",
  expediente: "Expedientes",
  contradiccion: "Contradicciones",
  promesa: "Promesas",
  cronologia: "Cronología",
  video: "Vídeos",
  fuente: "Fuentes",
  viral: "Frases virales",
  comentario: "Comentarios",
};

export const KIND_ORDER: Kind[] = [
  "expediente",
  "declaracion",
  "contradiccion",
  "promesa",
  "cronologia",
  "viral",
  "video",
  "fuente",
  "comentario",
];

/** La capa a la que pertenece cada tipo. Define cómo se pinta el resultado. */
export const KIND_LAYER: Record<Kind, "ARCHIVO" | "COMUNIDAD"> = {
  declaracion: "ARCHIVO",
  expediente: "ARCHIVO",
  contradiccion: "ARCHIVO",
  promesa: "ARCHIVO",
  cronologia: "ARCHIVO",
  video: "ARCHIVO",
  fuente: "ARCHIVO",
  viral: "ARCHIVO",
  comentario: "COMUNIDAD",
};

export interface Result {
  kind: Kind;
  id: string;
  href: string;
  title: string;
  meta: string;
  snippet: string;
}

// `normalize` vive en text.ts para que los filtros del navegador
// puedan usarla sin arrastrar la capa de datos al cliente.
export { normalize } from "./text";

function hit(bag: (string | undefined | null)[], q: string): boolean {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return false;
  const hay = normalize(bag.filter(Boolean).join("   "));
  return terms.every((t) => hay.includes(t));
}

function snip(text: string, q: string, len = 150): string {
  const nt = normalize(text);
  const nq = normalize(q.split(/\s+/)[0] ?? "");
  const i = nq ? nt.indexOf(nq) : -1;
  if (i < 0) return text.slice(0, len) + (text.length > len ? "…" : "");
  const s = Math.max(0, i - 40);
  return (s > 0 ? "…" : "") + text.slice(s, s + len) + (text.length > s + len ? "…" : "");
}

/* Por ahora el buscador trae los registros y filtra en memoria: son
   los mismos resultados que antes, con las mismas reglas. Con el
   archivo ya en Postgres, el siguiente paso natural es sustituir
   `hit()` por las columnas `search` (tsvector) que crea
   prisma/sql/01-restricciones.sql. Se deja para cuando haya volumen
   suficiente para que se note: cambiar el motor de búsqueda y la capa
   de datos a la vez es pedir dos problemas en el mismo sitio. */
export async function searchAll(query: string): Promise<Result[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const out: Result[] = [];
  const topics = (t: string[]) => t.map((x) => TOPIC_LABEL[x as keyof typeof TOPIC_LABEL] ?? x);

  const [dossiers, statements, contradictions, promises, timeline, viral, videos, sources, comments] =
    await Promise.all([
      getDossiers(),
      getStatements(),
      getContradictions(),
      getPromises(),
      getTimeline(),
      getViralQuotes(),
      getVideos(),
      getSources(),
      getPublishedComments(),
    ]);

  for (const d of dossiers) {
    if (hit([d.title, d.whatWasSaid, d.conclusion, d.whatSourcesSay, ...topics(d.topics)], q))
      out.push({
        kind: "expediente", id: d.id, href: `/expedientes/${d.id}`, title: d.title,
        meta: `Expediente ${String(d.number).padStart(3, "0")} · ${EVIDENCE[d.evidence].label}`,
        snippet: snip(d.conclusion, q),
      });
  }
  for (const s of statements) {
    if (hit([s.text, s.context, s.place, ...topics(s.topics)], q))
      out.push({
        kind: "declaracion", id: s.id, href: `/declaraciones/${s.id}`, title: s.text,
        meta: `${s.place} · ${s.date}`, snippet: snip(s.context, q),
      });
  }
  for (const c of contradictions) {
    if (hit([c.title, c.conclusion, ...topics(c.topics)], q))
      out.push({
        kind: "contradiccion", id: c.id, href: `/contradicciones#${c.id}`, title: c.title,
        meta: EVIDENCE[c.evidence].label, snippet: snip(c.conclusion, q),
      });
  }
  for (const p of promises) {
    if (hit([p.text, p.objective, p.context, ...topics(p.topics)], q))
      out.push({
        kind: "promesa", id: p.id, href: `/promesas#${p.id}`, title: p.text,
        meta: `${PROMISE[p.state].label} · ${p.date}`, snippet: snip(p.objective, q),
      });
  }
  for (const t of timeline) {
    if (hit([t.title, t.detail, ...topics(t.topics)], q))
      out.push({
        kind: "cronologia", id: t.id, href: `/cronologia#${t.id}`, title: t.title,
        meta: `${t.kind.toLowerCase()} · ${t.date}`, snippet: snip(t.detail, q),
      });
  }
  for (const v of viral) {
    if (hit([v.circulating, v.explanation, v.whatIsDocumented], q))
      out.push({
        kind: "viral", id: v.id, href: `/realmente-lo-dijo#${v.id}`, title: v.circulating,
        meta: v.result.replace(/_/g, " ").toLowerCase(), snippet: snip(v.explanation, q),
      });
  }
  for (const v of videos) {
    if (hit([v.title, v.platform], q))
      out.push({
        kind: "video", id: v.id, href: v.url, title: v.title,
        meta: `${v.platform} · ${v.date}`, snippet: "Enlace al material original. No se aloja aquí.",
      });
  }
  for (const s of sources) {
    if (hit([s.title, s.author, s.summary, s.tier], q))
      out.push({
        kind: "fuente", id: s.id, href: `/fuentes#${s.id}`, title: s.title,
        meta: `${s.author} · ${s.tier.replace(/-/g, " ")}`, snippet: snip(s.summary, q),
      });
  }
  // Los comentarios se buscan aparte y se etiquetan como comunidad:
  // nunca aparecen mezclados con registros del archivo.
  const porExpediente = new Map(dossiers.map((d) => [d.id, d]));
  for (const c of comments) {
    const d = porExpediente.get(c.dossier);
    if (!d) continue;
    if (hit([c.text], q))
      out.push({
        kind: "comentario", id: c.id, href: `/expedientes/${d.id}#debate`,
        title: c.text, meta: `${c.by} · en ${d.title.slice(0, 40)}…`,
        snippet: "Opinión de un usuario. No forma parte del archivo verificado.",
      });
  }
  return out;
}

export function group(results: Result[]): Record<Kind, Result[]> {
  const g = Object.fromEntries(KIND_ORDER.map((k) => [k, [] as Result[]])) as Record<Kind, Result[]>;
  for (const r of results) g[r.kind].push(r);
  return g;
}
