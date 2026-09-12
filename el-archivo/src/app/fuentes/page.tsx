import type { Metadata } from "next";
import { getSources, getStats } from "@/lib/data";
import { TIER, sortByTier } from "@/lib/evidence";
import { fmtNumber } from "@/lib/format";
import { Label, LayerTag, Notice, PageHead } from "@/components/primitives";
import { SourceCard } from "@/components/cards";
import { TierChart } from "@/components/charts";

export const metadata: Metadata = {
  title: "Fuentes",
  description:
    "Biblioteca de fuentes ordenada por nivel documental: de documento oficial a publicación en red social.",
};

export default async function FuentesPage() {
  const rows = sortByTier(await getSources());
  const stats = await getStats();
  const contributed = rows.filter((r) => r.contributedBy).length;

  return (
    <>
      <PageHead
        eyebrow="Sección 07 · Archivo"
        title="Fuentes"
        lede="Todo lo que sostiene el archivo, ordenado por lo que pesa. Un documento oficial y una captura de un tuit no son la misma cosa, y esta plataforma lo dice en vez de disimularlo."
        meta={[
          ["Fuentes registradas", fmtNumber(rows.length)],
          ["Aportadas por la comunidad", fmtNumber(contributed)],
          ["Niveles documentales", String(Object.keys(TIER).length)],
        ]}
      >
        <div className="mt-8">
          <LayerTag layer="ARCHIVO" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        {/* La jerarquía, explicada antes que la lista */}
        <section className="mb-10" aria-labelledby="jerarquia">
          <h2 id="jerarquia" className="headline mb-5 text-[clamp(1.05rem,2.4vw,1.5rem)] uppercase">
            La jerarquía documental
          </h2>
          <ol className="stack-line border-y">
            {Object.entries(TIER)
              .sort((a, b) => a[1].rank - b[1].rank)
              .map(([k, m]) => {
                const n = rows.filter((r) => r.tier === k).length;
                return (
                  <li key={k} className="grid grid-cols-[36px_1fr_auto] items-start gap-4 py-4">
                    <span className="num text-[18px] text-[var(--red)]">{m.rank}</span>
                    <div>
                      <p className="text-[13px] font-semibold">{m.label}</p>
                      <p className="mt-1 text-[12px] leading-[1.65] text-[var(--ink-3)]">{m.note}</p>
                    </div>
                    <span className="num text-[16px] text-[var(--ink-3)]">{n}</span>
                  </li>
                );
              })}
          </ol>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Notice kind="info" title="Por qué esto importa más de lo que parece">
              <p>
                Diez medios reproduciendo la misma nota de prensa no son diez fuentes: son una. La
                jerarquía existe para que no se pueda construir una apariencia de solidez apilando
                material que en realidad viene todo del mismo sitio.
              </p>
            </Notice>
            <TierChart data={stats.tierCounts} />
          </div>
        </section>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b pb-4">
          <h2 className="headline text-[clamp(1.05rem,2.4vw,1.5rem)] uppercase">Registro completo</h2>
          <Label>{rows.length} fuentes</Label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((s) => (
            <SourceCard key={s.id} s={s} />
          ))}
        </div>
      </div>
    </>
  );
}
