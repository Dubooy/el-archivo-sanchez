import type { Metadata } from "next";
import { getContradictions } from "@/lib/data";
import { EVIDENCE } from "@/lib/evidence";
import { LayerTag, Notice, PageHead } from "@/components/primitives";
import { ContradictionCard } from "@/components/cards";

export const metadata: Metadata = {
  title: "Contradicciones",
  description:
    "Dijo → ocurrió: declaraciones y hechos posteriores documentados, unidos por su línea temporal, con la conclusión editorial y sus limitaciones.",
};

export default async function ContradiccionesPage() {
  const rows = await getContradictions();
  const documented = rows.filter((r) => r.evidence === "CONTRADICCION_DOCUMENTADA").length;

  return (
    <>
      <PageHead
        eyebrow="Sección 03 · Archivo"
        title="Dijo → ocurrió"
        lede="A la izquierda, lo que se dijo. A la derecha, lo que ocurrió después. En medio, la línea temporal y las fuentes de ambas cosas. Lo que no hay en ningún sitio es la palabra «mintió»."
        meta={[
          ["Secuencias documentadas", String(rows.length)],
          ["Con contradicción acreditada", String(documented)],
          ["Nivel más frecuente", EVIDENCE.EVIDENCIA_INSUFICIENTE.label],
        ]}
      >
        <div className="mt-8">
          <LayerTag layer="VERIFICACION" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        <div className="mb-10 grid gap-4 lg:grid-cols-2">
          <Notice kind="legal" title="La distinción que sostiene toda esta sección">
            <p>
              <strong>Contradicción</strong> es que consten dos cosas incompatibles: una declaración
              en una fecha y un hecho documentado después. Eso se puede acreditar con dos enlaces.
            </p>
            <p>
              <strong>Mentira</strong> es afirmar algo sabiendo que es falso. Eso requiere demostrar
              qué sabía una persona en un momento dado, y casi nunca se puede. Por eso esta
              plataforma documenta lo primero y no afirma lo segundo.
            </p>
          </Notice>
          <Notice kind="info" title="Por qué cada ficha declara sus limitaciones">
            <p>
              Porque una secuencia puede tener explicaciones que no son mala fe: las circunstancias
              cambian, un compromiso depende de terceros, una declaración admite más de una lectura.
            </p>
            <p>
              Listar esas explicaciones no debilita el archivo: es lo que hace que se le pueda creer
              cuando dice que en algún caso no las hay.
            </p>
          </Notice>
        </div>

        <div className="space-y-6">
          {rows.map((c) => (
            <ContradictionCard key={c.id} c={c} />
          ))}
        </div>
      </div>
    </>
  );
}
