import Link from "next/link";
import { getMeta } from "@/lib/data";
import { SITE } from "@/lib/config";
import { Label } from "./primitives";
import { CookiePreferencesButton } from "./CookieBanner";

const COLS = [
  {
    title: "El archivo",
    links: [
      ["/declaraciones", "Declaraciones"],
      ["/contradicciones", "Contradicciones"],
      ["/promesas", "Promesas"],
      ["/expedientes", "Expedientes"],
      ["/cronologia", "Cronología"],
    ],
  },
  {
    title: "Contrastar",
    links: [
      ["/fuentes", "Biblioteca de fuentes"],
      ["/realmente-lo-dijo", "¿Realmente lo dijo?"],
      ["/datos", "Datos del archivo"],
      ["/buscar", "Buscador global"],
      ["/sujetos", "Ficha del sujeto"],
    ],
  },
  {
    title: "Participar",
    links: [
      ["/aportar", "Añadir al archivo"],
      ["/comunidad", "Comunidad y debate"],
      ["/colaborar", "Ser moderador o editor"],
      ["/moderacion", "Cola de moderación"],
      ["/metodologia", "Metodología"],
      ["/metodologia#correcciones", "Proponer una corrección"],
    ],
  },
];

/* El pie lee el estado del archivo (build, fecha) de la
   base de datos, así que es un componente de servidor asíncrono. Va
   dentro del layout, que ya lo es. */
export async function Footer() {
  const meta = await getMeta();
  return (
    <footer className="mt-20 border-t bg-[var(--paper)]">
      <div className="wrap py-14">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <p className="display text-[clamp(1.6rem,3.5vw,2.4rem)]">
              Documentar.
              <br />
              Contrastar.
              <br />
              <span className="text-[var(--red)]">Debatir.</span>
            </p>
            <p className="mt-5 max-w-sm text-[13px] leading-[1.75] text-[var(--ink-3)]">
              El archivo recoge lo que consta. La verificación dice hasta dónde llegan las fuentes.
              La comunidad discute. Las tres cosas van siempre separadas.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {COLS.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <Label tone="ink">{c.title}</Label>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map(([href, label]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-[13px] text-[var(--ink-3)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bloque legal: obligatorio y accesible desde cualquier página.
            El botón de cookies está aquí porque retirar el consentimiento
            tiene que ser tan fácil como darlo. */}
        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
          <Link href="/legal/aviso-legal" className="hover:text-[var(--ink)]">
            Aviso legal
          </Link>
          <Link href="/legal/privacidad" className="hover:text-[var(--ink)]">
            Privacidad
          </Link>
          <Link href="/legal/cookies" className="hover:text-[var(--ink)]">
            Política de cookies
          </Link>
          <CookiePreferencesButton className="uppercase tracking-[0.12em] underline underline-offset-4 hover:text-[var(--ink)]" />
        </div>

        <div className="mt-10 space-y-6 border-t pt-8">
          {/* Independencia: obligatorio y destacado (§2, §30) */}
          <div className="border-l-4 border-[var(--red)] pl-4">
            <Label tone="red">Proyecto independiente</Label>
            <p className="mt-2 max-w-3xl text-[13px] font-medium leading-[1.7] text-[var(--ink-2)]">
              {SITE.independence}
            </p>
            <p className="mt-2 max-w-3xl text-[12px] leading-[1.7] text-[var(--ink-3)]">
              No se utiliza el emblema, el nombre ni la identidad gráfica oficial de ninguna
              formación política. El uso del rojo es una decisión editorial de esta plataforma.
            </p>
          </div>

          <div className="border-l-4 border-[var(--line-2)] pl-4">
            <Label tone="ink">Responsabilidad editorial</Label>
            <p className="mt-2 max-w-3xl text-[12px] leading-[1.75] text-[var(--ink-3)]">
              {SITE.editorial}
            </p>
          </div>

          <div className="border-l-4 border-[var(--warn)] pl-4">
            <Label tone="warn">Presunción de inocencia</Label>
            <p className="mt-2 max-w-3xl text-[12px] leading-[1.75] text-[var(--ink-3)]">
              {SITE.judicialNotice}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
            <span>
              Actualizado {meta.lastUpdated}
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-[6px] w-[6px] animate-blink bg-[var(--red)]" aria-hidden />
              Premoderación activa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
