import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDossier,
  getSourcesByIds,
  getStatement,
  getStatements,
  getSubject,
  getVideo,
} from "@/lib/data";
import { fileNo, fmtDate, fmtDateLong, fmtTs, TOPIC_LABEL } from "@/lib/format";
import { sortByTier } from "@/lib/evidence";
import { Field, Label, LayerTag } from "@/components/primitives";
import { ReviewBadge } from "@/components/badges";
import { SourceCard } from "@/components/cards";
import { CopyButton } from "@/components/CopyButton";

type Params = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await getStatements()).map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const s = await getStatement(id);
  if (!s) return { title: "Declaración no encontrada" };
  return { title: `Declaración ${fileNo(s.id)}`, description: s.context.slice(0, 155) };
}

export default async function StatementPage({ params }: Params) {
  const { id } = await params;
  const s = await getStatement(id);
  if (!s) notFound();

  const subject = await getSubject(s.subject);
  const video = s.video ? await getVideo(s.video) : null;
  const sources = sortByTier(await getSourcesByIds(s.sources));
  const dossier = s.dossier ? await getDossier(s.dossier) : null;

  return (
    <>
      <header className="border-b bg-[var(--paper)]">
        <div className="wrap py-8 sm:py-12">
          <nav aria-label="Miga de pan" className="mb-8">
            <Link
              href="/declaraciones"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              ← Declaraciones
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-4">
            <span className="num text-[clamp(1.8rem,5vw,3.2rem)] text-[var(--line-2)]">
              {fileNo(s.id)}
            </span>
            <LayerTag layer="ARCHIVO" />
          </div>

          <blockquote className="mt-6 max-w-4xl border-l-4 border-[var(--red)] pl-6">
            <p className="font-serif text-[clamp(1.2rem,3vw,2rem)] leading-[1.4] text-[var(--ink)]">
              {s.text}
            </p>
            <footer className="mt-4 text-[13px] text-[var(--ink-3)]">
              — {subject?.name ?? "Sujeto"}, {fmtDateLong(s.date)}. {s.place}.
            </footer>
          </blockquote>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CopyButton text={`«${s.text}» — ${subject?.name ?? ""}, ${fmtDateLong(s.date)}, ${s.place}.`} label="Copiar con su cita" />
            {video ? (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn"
              >
                Ver material original {s.videoTimestamp !== null ? `· ${fmtTs(s.videoTimestamp)}` : ""} ↗
              </a>
            ) : null}
            <ReviewBadge state={s.reviewState} />
          </div>
        </div>
      </header>

      <div className="wrap grid gap-12 py-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16 sm:py-16">
        <div className="space-y-12">
          <section aria-labelledby="contexto">
            <div className="mb-4 flex items-end gap-4 border-b pb-3">
              <span className="num text-[22px] text-[var(--red)]">01</span>
              <h2 id="contexto" className="headline text-[clamp(1rem,2.2vw,1.35rem)] uppercase">
                Contexto
              </h2>
            </div>
            <p className="doc max-w-read">{s.context}</p>
            <p className="mt-4 border-l-2 border-[var(--line-2)] pl-4 text-[12px] leading-[1.7] text-[var(--ink-3)]">
              Este campo existe porque una cita literal sacada de su situación puede significar lo
              contrario de lo que significó. Si alguna vez falta contexto en una ficha, es un error
              del archivo, no un detalle menor.
            </p>
          </section>

          <section aria-labelledby="fuentes-decl">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-3">
              <div className="flex items-end gap-4">
                <span className="num text-[22px] text-[var(--red)]">02</span>
                <h2 id="fuentes-decl" className="headline text-[clamp(1rem,2.2vw,1.35rem)] uppercase">
                  Fuentes
                </h2>
              </div>
              <Label>Ordenadas por nivel documental</Label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {sources.map((src) => (
                <SourceCard key={src.id} s={src} />
              ))}
            </div>
          </section>

          {dossier ? (
            <section aria-labelledby="exp-decl">
              <div className="mb-4 flex items-end gap-4 border-b pb-3">
                <span className="num text-[22px] text-[var(--red)]">03</span>
                <h2 id="exp-decl" className="headline text-[clamp(1rem,2.2vw,1.35rem)] uppercase">
                  Expediente que la contiene
                </h2>
              </div>
              <Link href={`/expedientes/${dossier.id}`} className="card card-hover block p-5">
                <Label tone="red">Expediente {String(dossier.number).padStart(3, "0")}</Label>
                <p className="headline mt-2 text-[15px]">{dossier.title}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Abrir expediente →
                </p>
              </Link>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <Label tone="ink">Ficha</Label>
            <dl className="mt-3 stack-line border-t">
              <Field k="Identificador" v={s.id} />
              <Field k="Sujeto" v={subject?.name ?? "—"} />
              <Field k="Fecha" v={fmtDate(s.date)} />
              <Field k="Lugar" v={s.place} mono={false} />
              <Field k="Estado" v={<ReviewBadge state={s.reviewState} />} mono={false} />
              <Field k="Incorporada" v={fmtDate(s.addedAt)} />
              {s.contributedBy ? <Field k="Aportada por" v={s.contributedBy} /> : null}
            </dl>
          </div>

          <div className="card p-5">
            <Label tone="ink">Temas</Label>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.topics.map((t) => (
                <Link key={t} href={`/declaraciones`} className="chip">
                  {TOPIC_LABEL[t]}
                </Link>
              ))}
            </div>
          </div>

          {video ? (
            <div className="card p-5">
              <Label tone="ink">Material audiovisual</Label>
              <p className="mt-3 text-[13px] font-medium">{video.title}</p>
              <p className="mt-1 text-[12px] text-[var(--ink-3)]">
                {video.platform} · {fmtDate(video.date)}
              </p>
              <p className="mt-3 text-[11px] leading-[1.65] text-[var(--ink-3)]">
                Solo se guarda el enlace. Esta plataforma no aloja material audiovisual de terceros:
                enlaza al original para que se pueda comprobar en su sitio.
              </p>
            </div>
          ) : null}

        </aside>
      </div>
    </>
  );
}
