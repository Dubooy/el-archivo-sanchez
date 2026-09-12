import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCommentsFor,
  getCorrectionsFor,
  getCounterFor,
  getDossier,
  getMyVote,
  getSourcesByIds,
  getStatementsByIds,
  getTimelineByIds,
  getVotes,
} from "@/lib/data";
import { currentUser } from "@/lib/session";
import { EVIDENCE, sortByTier } from "@/lib/evidence";
import { fmtDate, TIMELINE_KIND, TOPIC_LABEL } from "@/lib/format";
import { Block, Field, Label, LayerTag, Notice } from "@/components/primitives";
import { EvidenceBadge } from "@/components/badges";
import { CorrectionCard, SourceCard } from "@/components/cards";
import { Debate } from "@/components/Debate";

type Params = { params: Promise<{ id: string }> };

/* Esta página lee la sesión (para saber si has votado), así que se
   renderiza en cada petición. El expediente en sí es cacheable y lo
   sería de sobra; lo que no se puede cachear es tu voto. Si algún día
   pesa, la salida es sacar la parte personal a su propio endpoint y
   devolver la página a ISR, no cachear datos de sesión. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const d = await getDossier(id);
  if (!d) return { title: "Expediente no encontrado" };
  return { title: d.title, description: d.conclusion.slice(0, 155) };
}

export default async function DossierPage({ params }: Params) {
  const { id } = await params;
  const d = await getDossier(id);
  if (!d) notFound();

  const statements = await getStatementsByIds(d.statementRefs);
  const events = await getTimelineByIds(d.timelineRefs);
  const sources = sortByTier(await getSourcesByIds(d.sources));
  const comments = await getCommentsFor(d.id);
  const counters = await getCounterFor(d.id);
  const votes = await getVotes(d.id);
  const corrections = await getCorrectionsFor(d.id);
  // Quién mira y qué votó. Lo resuelve el servidor: el componente
  // de cliente nunca decide por su cuenta si hay sesión.
  const yo = await currentUser();
  const miVoto = yo ? await getMyVote(d.id, yo.id) : null;
  const m = EVIDENCE[d.evidence];

  return (
    <>
      <header className="border-b bg-[var(--paper)]">
        <div className="wrap py-8 sm:py-12">
          <nav aria-label="Miga de pan" className="mb-8">
            <Link
              href="/expedientes"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              ← Expedientes
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-4">
            <span className="num text-[clamp(2.2rem,7vw,4.5rem)] text-[var(--red)]">
              {String(d.number).padStart(3, "0")}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <LayerTag layer="VERIFICACION" />
            </div>
          </div>

          <h1 className="display mt-4 max-w-4xl text-[clamp(1.7rem,5vw,3.4rem)]">{d.title}</h1>

          <div className="mt-8 flex flex-wrap items-start gap-x-10 gap-y-6">
            <div>
              <Label>Nivel de evidencia</Label>
              <div className="mt-2">
                <EvidenceBadge level={d.evidence} size="lg" />
              </div>
            </div>
            <div>
              <Label>Fuentes</Label>
              <div className="num mt-1 text-3xl">{sources.length}</div>
            </div>
            <div>
              <Label>Debate</Label>
              <div className="num mt-1 text-3xl">{comments.length}</div>
            </div>
            <div>
              <Label>Abierto</Label>
              <div className="mt-2 font-mono text-[13px]">{fmtDate(d.openedAt)}</div>
            </div>
            <div>
              <Label>Última actualización</Label>
              <div className="mt-2 font-mono text-[13px]">{fmtDate(d.lastUpdated)}</div>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-[12px] leading-[1.7] text-[var(--ink-3)]">
            <strong className="text-[var(--ink-2)]">{m.label}:</strong> {m.meaning} {m.notMeaning}
          </p>
        </div>
      </header>

      {/* Historial de cambios (§39): lo primero, porque da credibilidad */}
      {d.changes.length > 0 ? (
        <section className="border-b bg-[color-mix(in_srgb,var(--open)_6%,transparent)]" aria-labelledby="cambios">
          <div className="wrap py-6">
            <h2 id="cambios" className="headline text-[13px] uppercase">
              ↻ Este expediente ha cambiado
            </h2>
            <ul className="mt-4 space-y-3">
              {d.changes.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-3">
                  <Label>{fmtDate(c.at)}</Label>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.1em] line-through opacity-60"
                    style={{ color: EVIDENCE[c.from].color }}
                  >
                    {EVIDENCE[c.from].label}
                  </span>
                  <span aria-hidden className="text-[var(--ink-3)]">→</span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.1em]"
                    style={{ color: EVIDENCE[c.to].color }}
                  >
                    {EVIDENCE[c.to].label}
                  </span>
                  <span className="w-full text-[12px] leading-[1.6] text-[var(--ink-2)] sm:w-auto sm:flex-1">
                    {c.reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="wrap grid gap-12 py-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16 sm:py-16">
        <div className="space-y-10">
          <Block n="01" title="Qué se dijo" sub="La declaración de partida">
            <p className="doc max-w-read">{d.whatWasSaid}</p>
            {statements.length ? (
              <ul className="mt-5 space-y-3">
                {statements.map((s) => (
                  <li key={s.id}>
                    <Link href={`/declaraciones/${s.id}`} className="card card-hover block p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Label tone="red">{fmtDate(s.date)}</Label>
                        <Label>{s.place}</Label>
                      </div>
                      <p className="mt-2 font-serif text-[14px] leading-[1.55] text-[var(--ink)]">
                        {s.text}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </Block>

          <Block n="02" title="Cuándo se dijo" sub="Fecha y contexto">
            <p className="doc max-w-read">{d.whenAndContext}</p>
          </Block>

          <Block n="03" title="Qué ocurrió después" sub="Cronología documentada">
            {events.length ? (
              <ol className="relative border-l-2 border-[var(--line)] pl-6">
                {events.map((e) => {
                  const k = TIMELINE_KIND[e.kind];
                  return (
                    <li key={e.id} className="relative pb-6 last:pb-0">
                      <span
                        className="absolute -left-[31px] top-1 h-[11px] w-[11px] rounded-full border-2 bg-[var(--paper)]"
                        style={{ borderColor: k.color }}
                        aria-hidden
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <Label tone="red">{fmtDate(e.date)}</Label>
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.1em]"
                          style={{ color: k.color }}
                        >
                          {k.label}
                        </span>
                      </div>
                      <p className="mt-2 font-serif text-[14px] leading-[1.55]">{e.title}</p>
                      <p className="mt-1 text-[12px] leading-[1.6] text-[var(--ink-3)]">{e.detail}</p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-[13px] text-[var(--ink-3)]">Sin hechos posteriores registrados.</p>
            )}
          </Block>

          <Block n="04" title="Qué dicen las fuentes" sub={`${sources.length} · ordenadas por nivel`}>
            <p className="doc max-w-read">{d.whatSourcesSay}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {sources.map((s) => (
                <SourceCard key={s.id} s={s} />
              ))}
            </div>
          </Block>

          <Block n="05" title="Contraevidencia" sub="Lo que apunta en contra">
            <ul className="space-y-3">
              {d.counterEvidence.map((c, i) => (
                <li key={i} className="flex gap-4 border-l-2 border-[var(--red)] py-1 pl-4">
                  <span className="mt-[3px] font-mono text-[11px] text-[var(--red)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[13px] leading-[1.7] text-[var(--ink-2)]">{c}</p>
                </li>
              ))}
            </ul>
            {counters.length ? (
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                + {counters.length} aportadas por la comunidad, más abajo
              </p>
            ) : null}
          </Block>

          <Block n="06" title="Conclusión" sub="Hasta dónde llegan las fuentes">
            <div className="card p-5 sm:p-6" style={{ borderColor: m.color }}>
              <p className="doc max-w-read">{d.conclusion}</p>
              <div className="mt-6 border-t pt-5">
                <EvidenceBadge level={d.evidence} explain />
              </div>
            </div>

            <div className="mt-5">
              <Label tone="warn">Limitaciones declaradas</Label>
              <ul className="mt-3 space-y-2 border-l-2 border-[var(--warn)] pl-4">
                {d.limitations.map((l, i) => (
                  <li key={i} className="text-[12px] leading-[1.65] text-[var(--ink-3)]">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </Block>

          {/* ------------------------- CAPA COMUNIDAD ------------------- */}
          <div className="border-t-4 border-[var(--ink)] pt-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h2 className="display text-[clamp(1.3rem,3vw,2rem)]">Comunidad</h2>
              <LayerTag layer="COMUNIDAD" />
            </div>
            <p className="mb-8 max-w-read text-[13px] leading-[1.7] text-[var(--ink-3)]">
              A partir de aquí ya no es archivo. Es lo que opinan y aportan los lectores. La
              comunidad no modifica por sí sola los hechos de arriba: una aportación llega al
              expediente cuando pasa por moderación y se anota en el historial de cambios.
            </p>

            <Debate
              dossierId={d.id}
              dossierTitle={d.title}
              comments={comments}
              counters={counters}
              votes={votes}
              sesion={yo ? { handle: yo.handle } : null}
              miVoto={miVoto}
            />

            {corrections.length ? (
              <section className="mt-10" aria-labelledby="correcciones">
                <h3 id="correcciones" className="headline mb-4 text-[14px] uppercase">
                  Correcciones propuestas
                </h3>
                <div className="space-y-3">
                  {corrections.map((c) => (
                    <CorrectionCard key={c.id} c={c} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        {/* --------------------------- LATERAL -------------------------- */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <Label tone="red">Transparencia</Label>
            <dl className="mt-3 stack-line border-t">
              <Field k="Identificador" v={d.id} />
              <Field k="Abierto" v={fmtDate(d.openedAt)} />
              <Field k="Última actualización" v={fmtDate(d.lastUpdated)} />
              <Field k="Fuentes usadas" v={String(sources.length)} />
              <Field k="Limitaciones declaradas" v={String(d.limitations.length)} />
              <Field k="Cambios de estado" v={String(d.changes.length)} />
            </dl>
          </div>

          <div className="card p-5">
            <Label tone="ink">Temas</Label>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {d.topics.map((t) => (
                <span key={t} className="chip pointer-events-none">
                  {TOPIC_LABEL[t]}
                </span>
              ))}
            </div>
          </div>

          <Notice kind="legal" title="Lo que este expediente no dice">
            <p>
              No atribuye responsabilidad penal a nadie, no afirma que nadie mintiera y no da por
              probado nada que las fuentes citadas no sostengan.
            </p>
            <p>
              Si crees que la conclusión va más lejos de lo que la evidencia permite, esa es
              exactamente la crítica que la plataforma quiere recibir: está el botón de corrección
              justo arriba.
            </p>
          </Notice>

        </aside>
      </div>
    </>
  );
}
