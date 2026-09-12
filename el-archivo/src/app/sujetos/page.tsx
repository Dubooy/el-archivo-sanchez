import type { Metadata } from "next";
import Link from "next/link";
import { getStats, getSubjects } from "@/lib/data";
import { fmtDate, fmtNumber } from "@/lib/format";
import { Label, Notice, PageHead } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Sujetos documentados",
  description: "Los cargos públicos que documenta el archivo, y los huecos abiertos para los siguientes.",
};

export default async function SujetosPage() {
  const subjects = await getSubjects();
  const stats = await getStats();
  const active = subjects.filter((s) => s.status === "activo");

  return (
    <>
      <PageHead
        eyebrow="Alcance"
        title="Sujetos documentados"
        lede="La plataforma admite varios cargos públicos y está construida así a propósito. Un archivo dedicado a una sola persona no es un archivo: es una campaña con buena tipografía, y se descarta antes de leer la primera fuente."
        meta={[
          ["Sujetos con material", String(active.length)],
          ["Huecos reservados", String(subjects.length - active.length)],
          ["Registros del archivo", fmtNumber(stats.statements + stats.dossiers + stats.promises)],
        ]}
      />

      <div className="wrap py-10 sm:py-14">
        <div className="mb-10">
          <Notice kind="info" title="Por qué esto no es un detalle de arquitectura">
            <p>
              Si el archivo solo puede documentar a una persona, la conclusión de cualquier ficha
              queda contaminada de origen: el lector no sabe si el hallazgo es relevante o si es
              simplemente lo único que se estaba mirando.
            </p>
            <p>
              Con varios sujetos, una contradicción documentada significa algo, porque se aplicó el
              mismo método a otros y se puede comparar. Ese es todo el argumento, y es de método
              antes que de equilibrio político.
            </p>
          </Notice>
        </div>

        <div className="space-y-4">
          {subjects.map((s) => {
            const isActive = s.status === "activo";
            return (
              <article
                key={s.id}
                id={s.slug}
                className="card scroll-mt-28 p-5 sm:p-7"
                style={isActive ? { borderLeft: "4px solid var(--red)" } : undefined}
              >
                <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Label tone={isActive ? "red" : "mute"}>
                        {isActive ? "Documentado" : "Hueco reservado"}
                      </Label>
                    </div>
                    <h2 className="display mt-3 text-[clamp(1.4rem,3.5vw,2.3rem)]">{s.name}</h2>
                    <p className="mt-2 font-serif text-[15px] text-[var(--ink-2)]">{s.role}</p>
                    <p className="mt-4 max-w-read text-[13px] leading-[1.7] text-[var(--ink-3)]">
                      {s.note}
                    </p>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-start border-t pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <div>
                      <dt className="label">Formación</dt>
                      <dd className="mt-1 font-mono text-[13px]">{s.party}</dd>
                    </div>
                    <div>
                      <dt className="label">Periodo documentado</dt>
                      <dd className="mt-1 font-mono text-[13px]">
                        {fmtDate(s.from)} → {s.to ? fmtDate(s.to) : "en el cargo"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="label">Material en el archivo</dt>
                      <dd className="mt-2">
                        {isActive ? (
                          <div className="flex flex-wrap gap-4">
                            <span className="text-[13px]">
                              <strong className="num text-[18px]">{stats.statements}</strong>{" "}
                              declaraciones
                            </span>
                            <span className="text-[13px]">
                              <strong className="num text-[18px]">{stats.dossiers}</strong>{" "}
                              expedientes
                            </span>
                            <span className="text-[13px]">
                              <strong className="num text-[18px]">{stats.promises}</strong> promesas
                            </span>
                          </div>
                        ) : (
                          <span className="text-[13px] text-[var(--ink-3)]">
                            Sin material. El hueco existe y está vacío, que es más honesto que no
                            existir.
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                {isActive ? (
                  <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
                    <Link href="/declaraciones" className="btn-ghost">
                      Ver declaraciones
                    </Link>
                    <Link href="/expedientes" className="btn-ghost">
                      Ver expedientes
                    </Link>
                    <Link href="/promesas" className="btn-ghost">
                      Ver promesas
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 border-t pt-5">
                    <Link href="/aportar" className="btn-ghost">
                      Aportar material para este hueco →
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
