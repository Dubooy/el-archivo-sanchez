import type { Metadata } from "next";
import { getTimeline } from "@/lib/data";
import { LayerTag, Notice, PageHead } from "@/components/primitives";
import { TimelineBrowser } from "@/components/browsers";

export const metadata: Metadata = {
  title: "Cronología",
  description: "Todo lo archivado en orden temporal, filtrable por año, tema y tipo de acontecimiento.",
};

export default async function CronologiaPage() {
  const rows = await getTimeline();
  const years = new Set(rows.map((r) => r.date.slice(0, 4)));

  return (
    <>
      <PageHead
        eyebrow="Sección 05 · Archivo"
        title="Cronología"
        lede="Declaraciones, decisiones, medidas, resoluciones y publicaciones oficiales en el orden en que ocurrieron. El orden es información: mucho de lo que parece contradicción se explica al ver qué había en medio."
        meta={[
          ["Acontecimientos", String(rows.length)],
          ["Años cubiertos", String(years.size)],
          ["Ordenación", "Del más reciente al más antiguo"],
        ]}
      >
        <div className="mt-8">
          <LayerTag layer="ARCHIVO" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        <div className="mb-8">
          <Notice kind="info" title="Qué es y qué no es esta página">
            <p>
              Es un registro de acontecimientos con fuente, no un relato. No hay flechas causales
              entre unos y otros: si dos cosas aparecen seguidas es porque ocurrieron seguidas, no
              porque una produjera la otra.
            </p>
          </Notice>
        </div>

        <TimelineBrowser rows={rows} />
      </div>
    </>
  );
}
