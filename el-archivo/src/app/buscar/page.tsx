import type { Metadata } from "next";
import Link from "next/link";
import { KIND_LABEL, KIND_LAYER, KIND_ORDER, group, searchAll } from "@/lib/search";
import { Empty, Label, PageHead } from "@/components/primitives";
import { SearchForm } from "@/components/SearchForm";

export const metadata: Metadata = {
  title: "Buscador",
  description: "Busca a la vez en declaraciones, expedientes, contradicciones, promesas, cronología, fuentes y comentarios.",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function BuscarPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchAll(query) : [];
  const g = group(results);
  const present = KIND_ORDER.filter((k) => g[k].length > 0);

  return (
    <>
      <PageHead
        eyebrow="Buscador global"
        title={query ? `«${query}»` : "Buscar"}
        lede={
          query
            ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"} en todo el archivo.`
            : "Una sola búsqueda en declaraciones, expedientes, contradicciones, promesas, cronología, frases virales, vídeos, fuentes y comentarios. Los resultados vienen agrupados, y los de la comunidad van marcados como tales."
        }
      >
        <div className="mt-8 max-w-2xl">
          <SearchForm initial={query} />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        {!query ? (
          <Empty title="Esperando instrucciones" body="Escribe algo arriba. Dos caracteres bastan." icon="⌕" />
        ) : results.length === 0 ? (
          <Empty
            title="Sin resultados"
            body="Nada coincide con esa búsqueda. Prueba con una palabra más corta o mira las sugerencias."
            icon="⌕"
          />
        ) : (
          <div className="space-y-12">
            <div className="flex flex-wrap gap-2 border-y py-4">
              {present.map((k) => (
                <a key={k} href={`#g-${k}`} className="chip">
                  {KIND_LABEL[k]} <span className="tabular-nums opacity-55">{g[k].length}</span>
                </a>
              ))}
            </div>

            {present.map((k) => {
              const community = KIND_LAYER[k] === "COMUNIDAD";
              return (
                <section key={k} id={`g-${k}`} className="scroll-mt-24" aria-labelledby={`h-${k}`}>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b pb-4">
                    <h2 id={`h-${k}`} className="display text-[clamp(1.05rem,2.6vw,1.6rem)]">
                      {KIND_LABEL[k]}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                      {community ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--open)]">
                          ❝ opinión de usuarios · no es archivo verificado
                        </span>
                      ) : null}
                      <Label>
                        {g[k].length} {g[k].length === 1 ? "resultado" : "resultados"}
                      </Label>
                    </div>
                  </div>

                  <ul className={`stack-line border-b ${community ? "bg-[var(--panel-2)]" : ""}`}>
                    {g[k].map((r) => {
                      const external = r.href.startsWith("http");
                      const inner = (
                        <>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                            <p className="max-w-3xl font-serif text-[14px] leading-snug text-[var(--ink)]">
                              {r.title}
                            </p>
                            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                              {r.meta}
                            </span>
                          </div>
                          {r.snippet ? (
                            <p className="mt-1.5 max-w-3xl text-[12px] leading-[1.6] text-[var(--ink-3)]">
                              {r.snippet}
                            </p>
                          ) : null}
                        </>
                      );
                      return (
                        <li key={`${r.kind}-${r.id}`}>
                          {external ? (
                            <a href={r.href} target="_blank" rel="noopener noreferrer nofollow" className="group block px-3 py-4">
                              {inner}
                            </a>
                          ) : (
                            <Link href={r.href} className="group block px-3 py-4">
                              {inner}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
