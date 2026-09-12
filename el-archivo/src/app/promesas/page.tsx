import type { Metadata } from "next";
import { getPromises, getStats } from "@/lib/data";
import { PROMISE } from "@/lib/evidence";
import { fmtNumber } from "@/lib/format";
import { LayerTag, Notice, PageHead } from "@/components/primitives";
import { PromiseBrowser } from "@/components/browsers";
import { PromiseChart } from "@/components/charts";

export const metadata: Metadata = {
  title: "Promesas",
  description:
    "Seguimiento de promesas políticas: objetivo medible, plazo anunciado, estado y el razonamiento que justifica ese estado.",
};

export default async function PromesasPage() {
  const rows = await getPromises();
  const stats = await getStats();

  return (
    <>
      <PageHead
        eyebrow="Sección 02 · Archivo"
        title="Promesas"
        lede="Lo que se prometió, con qué objetivo medible y para cuándo. Es la parte más útil de un archivo político y la que casi nadie hace bien, porque exige paciencia y no da titulares rápidos."
        meta={[
          ["En seguimiento", fmtNumber(rows.length)],
          ["Cumplidas", String(stats.promiseCounts.CUMPLIDA ?? 0)],
          ["En proceso", String(stats.promiseCounts.EN_PROCESO ?? 0)],
          ["No evaluables", String(stats.promiseCounts.NO_EVALUABLE ?? 0)],
        ]}
      >
        <div className="mt-8">
          <LayerTag layer="ARCHIVO" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        {/* La metodología de clasificación, antes de los datos */}
        <div className="mb-10">
          <h2 className="headline mb-5 text-[clamp(1.05rem,2.4vw,1.5rem)] uppercase">
            Cómo se clasifica una promesa
          </h2>
          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {(["CUMPLIDA", "EN_PROCESO", "NO_CUMPLIDA", "NO_EVALUABLE"] as const).map((k) => {
              const m = PROMISE[k];
              const n = stats.promiseCounts[k] ?? 0;
              return (
                <div key={k} className="bg-[var(--panel)] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="font-mono text-[11px] uppercase tracking-[0.12em]"
                      style={{ color: m.color }}
                    >
                      {m.icon} {m.label}
                    </span>
                    <span className="num text-xl" style={{ color: m.color }}>
                      {n}
                    </span>
                  </div>
                  <p className="mt-3 text-[12px] leading-[1.65] text-[var(--ink-3)]">{m.rule}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Notice kind="warn" title="La trampa más habitual de este género">
              <p>
                Dar por incumplida una promesa solo porque ha pasado el tiempo. No basta: hace falta
                que el plazo <strong>anunciado por quien la formuló</strong> haya vencido{" "}
                <strong>y</strong> que exista documentación de que el objetivo no se alcanzó.
              </p>
              <p>
                Sin esas dos cosas, la promesa se queda «en proceso» o «no evaluable», aunque
                resulte menos satisfactorio.
              </p>
            </Notice>
            <PromiseChart counts={stats.promiseCounts} />
          </div>
        </div>

        <PromiseBrowser rows={rows} />
      </div>
    </>
  );
}
