import type { Metadata } from "next";
import { getCommentCounts, getDossiers, getStats } from "@/lib/data";
import { EVIDENCE } from "@/lib/evidence";
import { LayerTag, Notice, PageHead } from "@/components/primitives";
import { DossierCard } from "@/components/cards";
import { EvidenceChart } from "@/components/charts";
import { AdRail } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Expedientes",
  description:
    "Cada asunto en seis bloques: qué se dijo, cuándo, qué ocurrió después, qué dicen las fuentes, qué las contradice y qué se puede concluir.",
};

const BLOQUES = [
  ["01", "Qué se dijo", "La declaración de partida, literal y enlazada."],
  ["02", "Cuándo se dijo", "Fecha, lugar y situación."],
  ["03", "Qué ocurrió después", "Cronología de hechos documentados."],
  ["04", "Qué dicen las fuentes", "Ordenadas por nivel documental."],
  ["05", "Contraevidencia", "Lo que debilita la lectura inicial."],
  ["06", "Conclusión", "Lo que las fuentes permiten sostener, y ni un grado más."],
];

export default async function ExpedientesPage() {
  // Las tres consultas salen a la vez: no dependen unas de otras y
  // esperarlas en fila multiplicaría por tres el tiempo de la página.
  const [rows, stats, commentCounts] = await Promise.all([
    getDossiers(),
    getStats(),
    getCommentCounts(),
  ]);
  const updated = rows.filter((r) => r.changes.length > 0).length;

  return (
    <>
      <PageHead
        eyebrow="Sección 04 · Archivo"
        title="Expedientes"
        lede="La unidad central de la plataforma. Un expediente no es un artículo: es una estructura fija de seis bloques que obliga a buscar lo que contradice la hipótesis antes de escribir el final."
        meta={[
          ["Expedientes", String(rows.length)],
          ["Actualizados tras nueva evidencia", String(updated)],
          ["Respaldados", String(stats.evidenceCounts.RESPALDADO ?? 0)],
          ["En investigación", String(stats.evidenceCounts.EN_INVESTIGACION ?? 0)],
        ]}
      >
        <div className="mt-8">
          <LayerTag layer="VERIFICACION" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        <div className="mb-10">
          <h2 className="headline mb-5 text-[clamp(1.05rem,2.4vw,1.5rem)] uppercase">
            La estructura, siempre la misma
          </h2>
          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            {BLOQUES.map(([n, t, d]) => (
              <div key={n} className="bg-[var(--panel)] p-5">
                <span className="num text-[20px] text-[var(--red)]">{n}</span>
                <h3 className="headline mt-2 text-[13px] uppercase">{t}</h3>
                <p className="mt-2 text-[12px] leading-[1.65] text-[var(--ink-3)]">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Notice kind="info" title="Un expediente sin bloque 05 no está terminado">
              <p>
                El quinto bloque es contraevidencia, y es obligatorio. Si no aparece nada, el
                expediente no dice «no hay»: dice qué se buscó y dónde. Buscar solo lo que confirma
                la hipótesis no es investigar, es coleccionar.
              </p>
            </Notice>
            <EvidenceChart counts={stats.evidenceCounts} />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(EVIDENCE).map(([k, m]) => (
            <span
              key={k}
              className="chip pointer-events-none"
              style={{ borderColor: m.color, color: m.color }}
              title={m.meaning}
            >
              {m.label} <span className="opacity-60">{stats.evidenceCounts[k] ?? 0}</span>
            </span>
          ))}
        </div>

        {/* Carril lateral: solo a partir de 1536 px. Por debajo desaparece
            y la rejilla ocupa todo el ancho, sin huecos raros. */}
        <div className="with-rail">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-2 2xl:grid-cols-3">
            {rows.map((d) => (
              <DossierCard key={d.id} d={d} comments={commentCounts[d.id] ?? 0} />
            ))}
          </div>
          <AdRail />
        </div>
      </div>
    </>
  );
}
