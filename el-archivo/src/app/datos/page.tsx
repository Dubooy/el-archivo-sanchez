import type { Metadata } from "next";
import { getMostDebated, getStats } from "@/lib/data";
import { fmtNumber } from "@/lib/format";
import { Notice, PageHead, StatTile } from "@/components/primitives";
import {
  ColumnChart,
  DebateVsEvidence,
  EvidenceChart,
  PromiseChart,
  TierChart,
  TopicChart,
  ViralChart,
} from "@/components/charts";

export const metadata: Metadata = {
  title: "Datos",
  description: "Dashboard del archivo: volumen, temas, estados de evidencia, promesas y fuentes.",
};

export default async function DatosPage() {
  const [stats, debated] = await Promise.all([getStats(), getMostDebated(6)]);

  return (
    <>
      <PageHead
        eyebrow="Datos"
        title="Dashboard"
        lede="Estos gráficos describen el archivo, no describen a nadie. Si un tema aparece mucho es porque hemos archivado mucho de ese tema; si un estado domina, es por dónde está el trabajo, no por cómo es el mundo."
        meta={[
          ["Registros totales", fmtNumber(stats.statements + stats.dossiers + stats.promises + stats.timeline)],
          ["Fuentes", fmtNumber(stats.sources)],
          ["Aportaciones", fmtNumber(stats.submissions)],
        ]}
      />

      <div className="wrap py-10 sm:py-14">
        <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[var(--panel)]">
            <StatTile value={fmtNumber(stats.statements)} label="Declaraciones" size="md" />
          </div>
          <div className="bg-[var(--panel)]">
            <StatTile value={fmtNumber(stats.dossiers)} label="Expedientes" size="md" />
          </div>
          <div className="bg-[var(--panel)]">
            <StatTile value={fmtNumber(stats.promises)} label="Promesas" size="md" />
          </div>
          <div className="bg-[var(--panel)]">
            <StatTile value={fmtNumber(stats.timeline)} label="Acontecimientos" size="md" />
          </div>
          <div className="bg-[var(--panel)]">
            <StatTile value={fmtNumber(stats.sources)} label="Fuentes" size="md" />
          </div>
          <div className="bg-[var(--panel)]">
            <StatTile value={fmtNumber(stats.submissions)} label="Aportaciones" size="md" />
          </div>
          <div className="bg-[var(--panel)]">
            <StatTile value={fmtNumber(stats.comments)} label="Comentarios" size="md" />
          </div>
          <div className="bg-[var(--panel)]">
            <StatTile value={fmtNumber(stats.corrections)} label="Correcciones" size="md" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ColumnChart
            title="Declaraciones archivadas por año"
            note="Cuenta cuándo se pronunció la declaración, no cuándo la archivamos."
            data={stats.byYear.map((y) => ({ label: y.year, value: y.count }))}
          />
          <TopicChart data={stats.topicCounts} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <EvidenceChart counts={stats.evidenceCounts} />
          <PromiseChart counts={stats.promiseCounts} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TierChart data={stats.tierCounts} />
          <ViralChart counts={stats.viralCounts} />
        </div>

        <div className="mt-4">
          <DebateVsEvidence
            rows={debated.map((d) => ({
              title: d.dossier.title,
              href: `/expedientes/${d.dossier.id}`,
              comments: d.comments,
              votes: d.votes,
              evidence: d.dossier.evidence,
            }))}
          />
        </div>

        <div className="mt-8">
          <Notice kind="info" title="Por qué no hay un gráfico de «mentiras»">
            <p>
              Porque no se puede medir. Esta plataforma mide cuánta evidencia hay disponible y cuánto
              material se ha documentado, que es otra cosa. Un gráfico titulado «porcentaje de
              mentiras» sería mucho más compartible y bastante menos defendible.
            </p>
          </Notice>
        </div>
      </div>
    </>
  );
}
