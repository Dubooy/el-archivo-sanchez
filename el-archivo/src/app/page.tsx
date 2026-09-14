import Link from "next/link";
import {
  getActivity,
  getCommentCounts,
  getDossiers,
  getMostDebated,
  getRecentChanges,
  getStats,
  getSubjects,
} from "@/lib/data";
import { SITE, MODULES } from "@/lib/config";
import { EVIDENCE } from "@/lib/evidence";
import { fmtDate, fmtNumber } from "@/lib/format";
import { Label, LayerTag, SectionHead, StatTile } from "@/components/primitives";
import { Icon, type IconName } from "@/components/Icons";
import { AdSlot } from "@/components/AdSlot";
import { DossierCard } from "@/components/cards";
import { EvidenceBadge } from "@/components/badges";
import { ActivityFeed } from "@/components/Timeline";
import { DebateVsEvidence, PromiseChart, TopicChart } from "@/components/charts";

const ENTRADAS: { href: string; icon: IconName; label: string; desc: string; on: boolean }[] = [
  { href: "/declaraciones", icon: "declaraciones", label: "Declaraciones", desc: "Qué dijo, cuándo y dónde. Cita literal y enlace al original.", on: MODULES.statements },
  { href: "/contradicciones", icon: "contradicciones", label: "Contradicciones", desc: "Lo que dijo frente a lo que ocurrió después, con la línea temporal entre medias.", on: MODULES.contradictions },
  { href: "/expedientes", icon: "expedientes", label: "Expedientes", desc: "El asunto completo en seis bloques, de la declaración a la conclusión.", on: MODULES.dossiers },
  { href: "/cronologia", icon: "cronologia", label: "Cronología", desc: "Todo lo archivado en orden, filtrable por año, tema y tipo.", on: MODULES.timeline },
  { href: "/comunidad", icon: "comunidad", label: "Comunidad", desc: "Debate clasificado, contraevidencia y correcciones de los lectores.", on: MODULES.community },
  { href: "/fuentes", icon: "fuentes", label: "Fuentes", desc: "De dónde sale cada cosa, ordenado por nivel documental.", on: MODULES.sources },
];

export default async function Home() {
  // Todo lo de la portada se pide a la vez: son consultas
  // independientes y encadenarlas sumaría sus tiempos.
  const [stats, todos, debated, changes, activity, subjects, commentCounts] =
    await Promise.all([
      getStats(),
      getDossiers(),
      getMostDebated(5),
      getRecentChanges(3),
      getActivity(8),
      getSubjects(),
      getCommentCounts(),
    ]);
  const dossiers = todos.slice(0, 3);
  const active = subjects.filter((s) => s.status === "activo");

  return (
    <>
      {/* ============================== HERO ============================== */}
      <section className="w-full max-w-full overflow-x-clip border-b-[1.5px] border-[var(--edge)] bg-[var(--paper)]">
        <div className="wrap w-full max-w-full px-4 py-10 sm:px-8 sm:py-14 lg:py-16">
          <div className="grid w-full max-w-full min-w-0 gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-12">
            <div className="w-full max-w-full min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 border-[1.5px] border-[var(--red)] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--red)]">
                  Proyecto independiente
                </span>
              </div>

              <h1 className="display mt-6 w-full max-w-full animate-fade-up break-words text-[clamp(2rem,8vw,10rem)] leading-[0.95] [overflow-wrap:anywhere]">
                El Archivo
                <br />
                <span className="block w-full max-w-full break-words mt-[0.06em] pt-[0.04em] text-[1.05em] leading-[1] text-[var(--red)] [overflow-wrap:anywhere]">Sánchez</span>
              </h1>

              <p className="mt-7 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[clamp(1rem,2.4vw,1.5rem)] font-black uppercase tracking-tightest">
                <span>Documentar.</span>
                <span>Contrastar.</span>
                <span className="text-[var(--red)]">Debatir.</span>
              </p>

              <p className="doc mt-6 max-w-read">{SITE.intro}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/expedientes" className="btn-red">
                  Entrar en el archivo <span aria-hidden>→</span>
                </Link>
                <Link href="/aportar" className="btn">
                  + Añadir al archivo
                </Link>
                <Link href="/metodologia" className="btn-ghost">
                  ¿Cómo funciona?
                </Link>
              </div>
            </div>

            <aside className="card-flat mx-0 mt-2 w-full max-w-full min-w-0 self-center justify-self-stretch overflow-hidden shadow-brut sm:mt-0 lg:mx-auto lg:max-w-[420px] lg:justify-self-center">
              <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-[var(--edge)] bg-[var(--ink)] px-4 py-2.5">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--paper)]">
                  Cómo leer esta web
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--paper)] opacity-60">
                  3 capas
                </span>
              </div>

              <p className="border-b border-[var(--line)] px-4 py-3 text-[12px] leading-[1.7] text-[var(--ink-2)]">
                Las tres capas no se mezclan <strong className="font-semibold">nunca</strong>. Sabrás
                en cuál estás por el color y por la etiqueta.
              </p>

              <div className="stack-line">
                {[
                  {
                    layer: "ARCHIVO" as const,
                    t: "Lo que está documentado",
                    d: "Declaraciones literales, fechas, hechos y documentos, cada uno con su enlace al original.",
                  },
                  {
                    layer: "VERIFICACION" as const,
                    t: "Lo que las fuentes permiten concluir",
                    d: "Conclusión editorial, fechada, con sus limitaciones declaradas y revisable.",
                  },
                  {
                    layer: "COMUNIDAD" as const,
                    t: "Lo que opinan los usuarios",
                    d: "Debate, contraevidencia y correcciones. No modifica el archivo por sí solo.",
                  },
                ].map((c) => (
                  <div
                    key={c.layer}
                    className="px-4 py-4 transition-colors duration-200 ease-out hover:bg-[var(--panel-2)]"
                  >
                    <LayerTag layer={c.layer} />
                    <p className="mt-2.5 text-[13px] font-semibold">{c.t}</p>
                    <p className="mt-1 text-[12px] leading-[1.6] text-[var(--ink-3)]">{c.d}</p>
                  </div>
                ))}
              </div>

              <p className="border-t-[1.5px] border-[var(--edge)] bg-[var(--panel-2)] px-4 py-3.5 font-mono text-[10px] leading-[1.7] text-[var(--ink-2)]">
                El archivo dice «afirmó X el 14 de marzo». La verificación dice «las fuentes A y B
                describen Y». La comunidad discute si eso significa algo. Son tres frases distintas,
                y la web nunca las convierte en una.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ====================== ¿QUÉ ESTÁS BUSCANDO? ====================== */}
      <section className="border-b" aria-labelledby="buscando">
        <div className="wrap py-12 sm:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 id="buscando" className="display text-[clamp(1.5rem,4vw,2.6rem)]">
              ¿Qué estás buscando?
            </h2>
            <Link href="/buscar" className="btn-ghost">
              O busca directamente <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            {ENTRADAS.filter((e) => e.on).map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="group bg-[var(--panel)] p-6 transition-colors hover:bg-[var(--panel-2)] sm:p-7"
              >
                <Icon
                  name={e.icon}
                  size={34}
                  className="text-[var(--ink)] transition-transform duration-200 ease-out group-hover:-translate-y-[2px]"
                />
                <h3 className="headline mt-4 text-[clamp(1.1rem,2.2vw,1.5rem)] uppercase">{e.label}</h3>
                <p className="mt-2.5 text-[13px] leading-[1.65] text-[var(--ink-3)]">{e.desc}</p>
                <span className="mt-5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] transition-colors group-hover:text-[var(--red)]">
                  Abrir →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hueco publicitario entre secciones */}
      <div className="wrap py-8">
        <AdSlot format="leaderboard" />
      </div>

      {/* ============================ DASHBOARD =========================== */}
      <section className="border-b bg-[var(--paper)]" aria-labelledby="dashboard">
        <div className="wrap py-12 sm:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Label tone="red">Estado del archivo</Label>
              <h2 id="dashboard" className="display mt-3 text-[clamp(1.4rem,3.5vw,2.3rem)]">
                Lo que hay dentro
              </h2>
            </div>
            <p className="max-w-md text-[12px] leading-[1.7] text-[var(--ink-3)]">
              Son las cifras <strong className="text-[var(--ink-2)]">reales</strong> de esta
              instalación. Son bajas porque el archivo acaba de nacer. Preferimos enseñar un número
              pequeño y cierto antes que uno grande e inventado.
            </p>
          </div>

          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-[var(--panel)]">
              <StatTile value={fmtNumber(stats.statements)} label="Declaraciones archivadas" accent />
            </div>
            <div className="bg-[var(--panel)]">
              <StatTile value={fmtNumber(stats.contradictions)} label="Contradicciones documentadas" />
            </div>
            <div className="bg-[var(--panel)]">
              <StatTile value={fmtNumber(stats.dossiers)} label="Expedientes" />
            </div>
            <div className="bg-[var(--panel)]">
              <StatTile value={fmtNumber(stats.sources)} label="Fuentes" size="md" sub={`${stats.videos} vídeos enlazados`} />
            </div>
            <div className="bg-[var(--panel)]">
              <StatTile
                value={fmtNumber(stats.submissions)}
                label="Aportaciones de usuarios"
                size="md"
                sub={`${stats.acceptedSubmissions} aceptadas · ${stats.pending} en cola`}
              />
            </div>
            <div className="bg-[var(--panel)]">
              <StatTile value={fmtNumber(stats.promises)} label="Promesas en seguimiento" size="md" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================= LO MÁS DEBATIDO ======================== */}
      <section className="border-b" aria-labelledby="debatido">
        <div className="wrap py-14 sm:py-18">
          <SectionHead
            index="01"
            title="Lo más debatido"
            note="Ojo con esta sección: mide conversación, no evidencia. Las dos cosas van deliberadamente separadas."
            href="/expedientes"
            hrefLabel="Todos los expedientes"
          />
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <DebateVsEvidence
              rows={debated.map((d) => ({
                title: d.dossier.title,
                href: `/expedientes/${d.dossier.id}`,
                comments: d.comments,
                votes: d.votes,
                evidence: d.dossier.evidence,
              }))}
            />

            <div className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[13px] font-semibold">↻ Expedientes actualizados</h3>
                <Label>{changes.length}</Label>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--ink-3)]">
                Cuando cambia el nivel de evidencia se anota qué cambió y por qué. Un archivo que
                corrige en silencio no es un archivo.
              </p>

              <ul className="mt-5 space-y-5">
                {changes.map(({ dossier, change }) => (
                  <li key={dossier.id} className="border-t pt-4">
                    <Link href={`/expedientes/${dossier.id}`} className="group block">
                      <p className="line-clamp-2 text-[13px] font-medium group-hover:text-[var(--red)]">
                        {dossier.title}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.1em] line-through opacity-60"
                          style={{ color: EVIDENCE[change.from].color }}
                        >
                          {EVIDENCE[change.from].label}
                        </span>
                        <span aria-hidden className="text-[var(--ink-3)]">
                          →
                        </span>
                        <EvidenceBadge level={change.to} size="sm" />
                      </div>
                      <p className="mt-2.5 text-[11px] leading-[1.6] text-[var(--ink-3)]">
                        {change.reason}
                      </p>
                      <Label className="mt-2 block">{fmtDate(change.at)}</Label>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================== EXPEDIENTES =========================== */}
      <section className="border-b bg-[var(--paper)]" aria-labelledby="expedientes">
        <div className="wrap py-14 sm:py-18">
          <SectionHead
            index="02"
            title="Últimos expedientes"
            note="Seis bloques fijos: qué se dijo, cuándo, qué ocurrió después, qué dicen las fuentes, qué las contradice y qué se puede concluir."
            href="/expedientes"
          />
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
            {dossiers.map((d) => (
              <DossierCard key={d.id} d={d} comments={commentCounts[d.id] ?? 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================ ACTIVIDAD ========================== */}
      <section className="border-b" aria-labelledby="actividad">
        <div className="wrap py-14 sm:py-18">
          <SectionHead
            index="03"
            title="Actividad"
            note="Todo lo que entra, se acepta, se corrige o cambia de estado queda registrado, tanto si lo hace el equipo como si lo hace un lector."
            href="/comunidad"
            hrefLabel="Ver la comunidad"
          />
          <ActivityFeed events={activity} />
        </div>
      </section>

      {/* ============================== DATOS ============================ */}
      <section className="border-b bg-[var(--paper)]" aria-labelledby="datos-home">
        <div className="wrap py-14 sm:py-18">
          <SectionHead
            index="04"
            title="Datos"
            note="Los gráficos describen el archivo, no describen a nadie."
            href="/datos"
            hrefLabel="Dashboard completo"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <PromiseChart counts={stats.promiseCounts} />
            <TopicChart data={stats.topicCounts.slice(0, 8)} />
          </div>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="bg-[var(--paper)]">
        <div className="wrap py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
            <div>
              <Label tone="red">Construye el expediente</Label>
              <p className="display mt-5 text-[clamp(2rem,6vw,4.5rem)]">
                ¿Crees que
                <br />
                falta algo?
              </p>
              <p className="doc mt-6 max-w-read">
                Un archivo lo construye mucha gente o no lo construye nadie. Puedes aportar un
                vídeo, un documento, una noticia, una declaración, un dato o una contradicción. Y si
                una conclusión te parece mal fundada, lo más útil que puedes hacer no es discutirla:
                es traer la fuente que la desmonta.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/aportar" className="btn-red">
                  + Añadir al archivo
                </Link>
                <Link href="/moderacion" className="btn">
                  Ver la cola de moderación
                </Link>
              </div>
            </div>

            <div className="border p-6">
              <Label tone="ink">Qué pasa cuando envías algo</Label>
              <ol className="mt-5 space-y-4">
                {[
                  ["01", "Queda PENDIENTE", "Nadie lo ve. Ni tú en el archivo público, ni nadie más."],
                  ["02", "Un moderador lo revisa", "Comprueba que el enlace funciona y que el material es lo que dices."],
                  ["03", "Se acepta o se devuelve", "Con el motivo escrito, visible para quien lo aportó."],
                  ["04", "Si se acepta, entra al archivo", "Tu conclusión personal no: esa se queda etiquetada como opinión."],
                ].map(([n, t, d]) => (
                  <li key={n} className="grid grid-cols-[28px_1fr] gap-3 border-t pt-4">
                    <span className="num text-[15px] text-[var(--red)]">{n}</span>
                    <div>
                      <p className="text-[13px] font-semibold">{t}</p>
                      <p className="mt-1 text-[12px] leading-[1.6] text-[var(--ink-3)]">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}