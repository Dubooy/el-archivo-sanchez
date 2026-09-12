import Link from "next/link";
import { Label } from "@/components/primitives";
import { Icon } from "@/components/Icons";
import { SearchForm } from "@/components/SearchForm";

/* ============================================================
   404
   Una página de error útil hace tres cosas: dice qué ha pasado sin
   jerga, no culpa a quien llega, y ofrece salidas concretas. Aquí:
   volver a la portada, buscar, y las cuatro secciones más visitadas.

   Next.js devuelve automáticamente el código HTTP 404 con este
   archivo, que es lo que importa para el buscador: una 404 que
   responde 200 («soft 404») acaba indexada como página válida.
   ============================================================ */
export default function NotFound() {
  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <Icon name="buscar" size={56} className="text-[var(--line-2)]" />

      <span className="num mt-6 text-[clamp(3.5rem,15vw,9rem)] text-[var(--line-2)]" aria-hidden>
        404
      </span>

      <Label tone="red" className="mt-4 block">
        Registro no encontrado
      </Label>

      <h1 className="display mt-5 max-w-2xl text-[clamp(1.5rem,4vw,2.6rem)]">
        Aquí no hay nada archivado
      </h1>

      <p className="mt-5 max-w-md text-[14px] leading-[1.75] text-[var(--ink-2)]">
        O nunca existió, o cambió de sitio. Como en el resto de la plataforma: no vamos a inventarnos
        lo que había aquí.
      </p>

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-red">
          Volver a la portada
        </Link>
        <Link href="/expedientes" className="btn">
          Ver los expedientes
        </Link>
      </div>

      <div className="mt-12 w-full max-w-xl border-t-[1.5px] border-[var(--edge)] pt-8">
        <Label>O busca lo que venías a leer</Label>
        <div className="mt-4 text-left">
          <SearchForm />
        </div>
      </div>

      <nav aria-label="Secciones principales" className="mt-10">
        <ul className="flex flex-wrap justify-center gap-2">
          {[
            ["/declaraciones", "Declaraciones"],
            ["/contradicciones", "Contradicciones"],
            ["/promesas", "Promesas"],
            ["/fuentes", "Fuentes"],
            ["/metodologia", "Metodología"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="chip">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
