import type { Metadata } from "next";
import { getStatements, getStats } from "@/lib/data";
import { fmtNumber } from "@/lib/format";
import { LayerTag, Notice, PageHead } from "@/components/primitives";
import { StatementBrowser } from "@/components/browsers";

export const metadata: Metadata = {
  title: "Declaraciones",
  description:
    "Archivo de declaraciones públicas: cita literal, fecha, lugar, contexto y enlace al material original.",
};

export default async function DeclaracionesPage() {
  const rows = await getStatements();
  const stats = await getStats();
  const withVideo = rows.filter((r) => r.video).length;

  return (
    <>
      <PageHead
        eyebrow="Sección 01 · Archivo"
        title="Declaraciones"
        lede="Lo que se dijo, tal y como se dijo. Cada ficha guarda la cita literal, la fecha exacta, el lugar, la situación en la que se produjo y el enlace al material del que sale. Sin ese enlace, la declaración no entra."
        meta={[
          ["Declaraciones", fmtNumber(rows.length)],
          ["Con material audiovisual", fmtNumber(withVideo)],
          ["Temas activos", String(stats.topicCounts.length)],
          ["Fuentes en el registro", fmtNumber(stats.sources)],
        ]}
      >
        <div className="mt-8">
          <LayerTag layer="ARCHIVO" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        <div className="mb-8">
          <Notice kind="info" title="Una cita literal también puede engañar">
            <p>
              Por eso cada ficha lleva un campo de contexto y no es opcional. Recortar una frase
              cierta hasta que signifique lo contrario es la forma más común de desinformar con
              material auténtico, y no queremos hacerlo aunque juegue a nuestro favor.
            </p>
          </Notice>
        </div>

        <StatementBrowser rows={rows} />
      </div>
    </>
  );
}
