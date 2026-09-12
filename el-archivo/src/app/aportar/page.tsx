import type { Metadata } from "next";
import { getSubjects } from "@/lib/data";
import { currentUser } from "@/lib/session";
import { LayerTag, Notice, PageHead } from "@/components/primitives";
import { SubmitForm } from "@/components/SubmitForm";

/* Depende de la sesión de quien mira: nunca se cachea. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Añadir al archivo",
  description: "Aporta un vídeo, un documento, una noticia, una declaración, un dato o una contradicción.",
  robots: { index: false, follow: true },
};

export default async function AportarPage() {
  const subjects = await getSubjects();
  const yo = await currentUser();

  return (
    <>
      <PageHead
        eyebrow="Construye el expediente"
        title="Añadir al archivo"
        lede="Un archivo lo construye mucha gente o no lo construye nadie. Aquí se aporta material, no conclusiones: lo primero se puede comprobar y lo segundo se discute abajo, en la comunidad."
      >
        <div className="mt-8">
          <LayerTag layer="COMUNIDAD" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        <div className="mb-10 grid gap-4 lg:grid-cols-2">
          <Notice kind="warn" title="Premoderación activa">
            <p>
              Nada de lo que envíes es visible para nadie hasta que un moderador lo acepta. Es más
              lento y es a propósito: cuando se habla de personas vivas e identificables, publicar
              primero y revisar después significa que durante un rato hay una acusación sin
              comprobar en una web que lleva tu nombre.
            </p>
          </Notice>
          <Notice kind="info" title="Qué pasa con lo que envías">
            <p>
              Se guarda en el servidor firmado con tu cuenta, en estado PENDIENTE, y no lo ve nadie
              salvo quien modera. Si se rechaza, se te dice por qué. Si se acepta, entra al archivo
              y queda anotado en el historial de cambios del expediente.
            </p>
          </Notice>
        </div>

        <SubmitForm subjects={subjects} sesion={yo ? { handle: yo.handle } : null} />
      </div>
    </>
  );
}
