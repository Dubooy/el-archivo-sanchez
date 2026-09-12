import type { Metadata } from "next";
import Link from "next/link";
import { getJudicialCases, getSourcesByIds } from "@/lib/data";
import { MODULES, SITE } from "@/lib/config";
import { PROCEDURAL_LABEL, fmtDate } from "@/lib/format";
import { sortByTier } from "@/lib/evidence";
import { Label, LayerTag, Notice, PageHead } from "@/components/primitives";
import { ProceduralBadge } from "@/components/badges";
import { SourceCard } from "@/components/cards";

export const metadata: Metadata = {
  title: "Investigaciones judiciales",
  description: "Módulo judicial: causas, situación procesal y relación acreditada con el sujeto.",
  robots: { index: MODULES.judicial, follow: true },
};

/* ============================================================
   MÓDULO JUDICIAL
   Construido y funcional. Encendido o apagado desde
   src/lib/config.ts → MODULES.judicial
   ============================================================ */

export default async function InvestigacionesPage() {
  const cases = await getJudicialCases();
  // Las fuentes de cada causa, resueltas antes de pintar: dentro del
  // JSX no se puede esperar una consulta.
  const fuentesPorCausa = new Map(
    await Promise.all(
      cases.map(async (c) => [c.id, sortByTier(await getSourcesByIds(c.sources))] as const),
    ),
  );

  if (!MODULES.judicial) {
    return (
      <>
        <PageHead
          eyebrow="Módulo desactivado"
          title="Investigaciones judiciales"
          lede="Esta sección existe, está construida y está apagada. No es una limitación técnica: es una decisión editorial sobre la parte con más riesgo de todo el proyecto."
        />

        <div className="wrap py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="headline text-[15px] uppercase">Qué hay construido</h2>
                <ul className="mt-4 space-y-3">
                  {[
                    ["Modelo de datos completo", "Órgano judicial, hechos investigados, documentos, resoluciones y fuentes."],
                    ["Terminología procesal estricta", "Diez estados distintos, del que solo uno acredita responsabilidad penal."],
                    ["Separación probado / pendiente / acusación", "Tres campos distintos que la ficha nunca fusiona en un titular."],
                    ["Relación acreditada obligatoria", "Un caso no entra si no hay documento que acredite la relación con el sujeto del archivo."],
                    ["Aviso de presunción de inocencia por ficha", "No en un pie de página: en cada caso, visible."],
                  ].map(([t, d]) => (
                    <li key={t} className="grid grid-cols-[18px_1fr] gap-3 border-t pt-3">
                      <span className="mt-[3px] text-[var(--ok)]" aria-hidden>
                        ✓
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold">{t}</p>
                        <p className="mt-1 text-[12px] leading-[1.6] text-[var(--ink-3)]">{d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-6">
                <h2 className="headline text-[15px] uppercase">Por qué está apagado</h2>
                <p className="doc mt-4">
                  Publicar sobre causas abiertas que afectan a personas vivas e identificables es
                  donde un proyecto como este puede hacer daño real y meterse en problemas reales, en
                  ese orden. Las declaraciones y las promesas son registro público y su riesgo es
                  casi nulo; una causa en instrucción no lo es.
                </p>
                <p className="doc mt-4">
                  Encenderlo es cambiar un valor. Merece hacerlo cuando tengas criterio formado
                  sobre qué entra y qué no —y, si el archivo va a ser público, después de que alguien
                  con formación jurídica lea la sección.
                </p>
                <p className="mt-5 border-l-2 border-[var(--line-2)] pl-4 font-mono text-[11px] leading-[1.8] text-[var(--ink-3)]">
                  src/lib/config.ts
                  <br />
                  MODULES.judicial: <span className="text-[var(--red)]">false</span> → true
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Notice kind="legal" title="Presunción de inocencia">
                <p>{SITE.judicialNotice}</p>
              </Notice>

              <div className="card p-5">
                <Label tone="ink">Terminología del módulo</Label>
                <ul className="mt-4 stack-line border-t">
                  {Object.entries(PROCEDURAL_LABEL).map(([k, v]) => (
                    <li key={k} className="py-2.5">
                      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ink-2)]">
                        {v}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t pt-3 text-[12px] leading-[1.7] text-[var(--ink-3)]">
                  Investigado no es acusado. Acusado no es condenado. Condenado sin firmeza no
                  acredita responsabilidad penal. Y estar relacionado políticamente con alguien
                  investigado no es ninguna de las tres cosas.
                </p>
              </div>

              <Link href="/metodologia#judicial" className="btn w-full">
                Leer el criterio completo →
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ---- Módulo activo ---- */
  return (
    <>
      <PageHead
        eyebrow="Sección · Judicial"
        title="Investigaciones judiciales"
        lede="Causas relacionadas con el entorno político, institucional o partidario del sujeto. Estar relacionado con una investigación no implica participar en los hechos investigados."
        meta={[["Casos", String(cases.length)]]}
      >
        <div className="mt-8">
          <LayerTag layer="ARCHIVO" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        <div className="mb-8">
          <Notice kind="legal" title="Presunción de inocencia">
            <p>{SITE.judicialNotice}</p>
          </Notice>
        </div>

        <div className="space-y-6">
          {cases.map((c) => (
            <article key={c.id} className="card p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="headline text-[clamp(1.05rem,2.2vw,1.5rem)]">{c.caseName}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <ProceduralBadge status={c.status} />
                </div>
              </div>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="label">Quién está investigado</dt>
                  <dd className="mt-1.5 text-[13px] leading-[1.7] text-[var(--ink-2)]">
                    {c.investigatedParties.join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="label">Órgano que investiga</dt>
                  <dd className="mt-1.5 text-[13px] text-[var(--ink-2)]">{c.court}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="label">Hechos que se investigan</dt>
                  <dd className="mt-1.5 doc">{c.facts}</dd>
                </div>
                <div className="sm:col-span-2 border-l-2 border-[var(--red)] pl-4">
                  <dt className="label">Relación acreditada con el sujeto del archivo</dt>
                  <dd className="mt-1.5 text-[13px] leading-[1.7] text-[var(--ink-2)]">
                    {c.relationToSubject}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-3">
                {[
                  ["Qué está probado", c.proven, "var(--ok)"],
                  ["Qué está pendiente", c.pending, "var(--warn)"],
                  ["Qué es solo acusación", c.allegationsOnly, "var(--red)"],
                ].map(([t, items, color]) => (
                  <div key={t as string}>
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: color as string }}
                    >
                      {t as string}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {(items as string[]).map((i) => (
                        <li key={i} className="text-[12px] leading-[1.6] text-[var(--ink-3)]">
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-5">
                <Label tone="ink">Fuentes</Label>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {(fuentesPorCausa.get(c.id) ?? []).map((s) => (
                    <SourceCard key={s.id} s={s} />
                  ))}
                </div>
              </div>

              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                Última actualización {fmtDate(c.lastUpdated)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
