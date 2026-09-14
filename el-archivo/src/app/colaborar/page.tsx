import type { Metadata } from "next";
import Link from "next/link";
import { Notice, PageHead } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Colaborar",
  description:
    "Cómo pasar de leer el archivo a construirlo: los cuatro papeles, qué se busca en quien modera o edita, y cómo se gana cada uno.",
};

const PAPELES = [
  {
    rol: "USUARIO",
    resumen: "El papel de partida. Se obtiene al crear una cuenta.",
    puede: ["Aportar material al archivo", "Comentar y debatir en la comunidad", "Votar percepción en un expediente", "Proponer correcciones con fuente"],
  },
  {
    rol: "MODERADOR",
    resumen: "Responde de lo que entra en la cola antes de hacerse público.",
    puede: ["Todo lo de USUARIO", "Aceptar o rechazar aportaciones pendientes", "Aplicar el criterio de revisión reforzada"],
  },
  {
    rol: "EDITOR",
    resumen: "Toca el archivo mismo, no solo la cola de entrada.",
    puede: ["Todo lo de MODERADOR", "Incorporar contraevidencia a un expediente", "Cambiar el nivel de evidencia, con motivo anotado"],
  },
  {
    rol: "ADMIN",
    resumen: "Gestiona quién tiene cada papel.",
    puede: ["Todo lo de EDITOR", "Gestionar cuentas y papeles de otros usuarios"],
  },
];

export default function ColaborarPage() {
  return (
    <>
      <PageHead
        eyebrow="Colaborar"
        title="Un archivo lo construye mucha gente, o no lo construye nadie"
        lede="Leer este archivo no exige cuenta y nunca la exigirá. Construirlo sí: alguien tiene que responder de lo que se publica sobre una persona identificable. Así es como se pasa de lector a parte del equipo."
      />

      {/* ------------------------------- LOS CUATRO PAPELES */}
      <section className="border-b" aria-labelledby="papeles">
        <div className="wrap py-12 sm:py-16">
          <h2 id="papeles" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Los cuatro papeles
          </h2>
          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {PAPELES.map((p, i) => (
              <div key={p.rol} className="bg-[var(--panel)] p-6">
                <span className="num text-[13px] text-[var(--red)]">0{i + 1}</span>
                <h3 className="headline mt-2 text-[15px] uppercase tracking-[0.06em]">{p.rol}</h3>
                <p className="mt-2 text-[12px] leading-[1.6] text-[var(--ink-3)]">{p.resumen}</p>
                <ul className="mt-4 space-y-1.5 border-t pt-4">
                  {p.puede.map((linea) => (
                    <li key={linea} className="text-[12px] leading-[1.6] text-[var(--ink-2)]">
                      · {linea}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- QUÉ SE BUSCA */}
      <section className="border-b bg-[var(--paper)]" aria-labelledby="busca">
        <div className="wrap py-12 sm:py-16">
          <h2 id="busca" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Qué se busca en quien modera o edita
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ["Disciplina de fuente", "Distinguir sin dudar entre lo que una fuente acredita y lo que a alguien le gustaría que acreditara. Si no está en la fuente, no entra, por muy razonable que parezca."],
              ["Comodidad con la duda", "Saber dejar un expediente en «evidencia insuficiente» en vez de forzar una conclusión más fuerte de lo que da el material. Aquí no hay premio por resolver rápido."],
              ["Tolerar la contradicción propia", "Aceptar contraevidencia que debilite una lectura que tú mismo propusiste. Un editor que solo busca lo que confirma su hipótesis está coleccionando, no verificando."],
            ].map(([t, b]) => (
              <div key={t} className="card p-5">
                <h3 className="text-[13px] font-semibold">{t}</h3>
                <p className="mt-3 text-[13px] leading-[1.7] text-[var(--ink-3)]">{b}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Notice kind="info" title="Diversidad de criterio, como política y no como accidente">
              <p>
                Un archivo moderado solo por gente que ya está de acuerdo entre sí deja de ser un
                archivo y pasa a ser una cámara de eco con formato de base de datos. Se busca
                activamente moderadores y editores con simpatías políticas distintas entre sí: no
                para equilibrar el resultado de cada ficha, sino porque el desacuerdo entre quienes
                revisan es lo que obliga a que la fuente hable más alto que la opinión de nadie.
              </p>
            </Notice>
          </div>
        </div>
      </section>

      {/* ------------------------------- CÓMO SE GANA */}
      <section className="border-b" aria-labelledby="gana">
        <div className="wrap py-12 sm:py-16">
          <h2 id="gana" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Cómo se gana un papel
          </h2>
          <div className="stack-line border-y">
            {[
              ["01", "Crea una cuenta", "Entra con Google desde /acceder. No hace falta nombre real ni foto: tu identidad pública es un apodo."],
              ["02", "Participa como USUARIO un tiempo", "Aporta material con fuente, comenta con criterio, propón correcciones. Es lo único que deja ver cómo trabajas de verdad."],
              ["03", "El papel se asigna a mano", "No hay un formulario para pedirlo, y es deliberado: moderar aquí significa responder de lo que se publica sobre una persona identificable. Es un papel con consecuencias, no un ascenso automático."],
            ].map(([n, t, b]) => (
              <article key={n} className="grid gap-4 py-7 lg:grid-cols-[70px_1fr_2fr] lg:gap-10">
                <span className="num text-[26px] text-[var(--red)]">{n}</span>
                <h3 className="headline text-[15px] uppercase leading-tight">{t}</h3>
                <p className="doc">{b}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/acceder" className="btn-red">
              Crear cuenta y empezar <span aria-hidden>→</span>
            </Link>
            <Link href="/metodologia" className="btn">
              Leer la metodología completa
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------- LÍMITES */}
      <section aria-labelledby="limites">
        <div className="wrap py-12 sm:py-16">
          <h2 id="limites" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Lo que no cambia con el papel
          </h2>
          <Notice kind="legal" title="Ni un ADMIN puede saltarse la puerta">
            <p>
              Todo lo que escribe en la base de datos pasa por la misma comprobación de sesión,
              ritmo y antispam, sin importar el papel. Un papel más alto da más permiso para decidir
              qué se publica, nunca permiso para publicar sin pasar por el mismo camino que todos los
              demás.
            </p>
          </Notice>
        </div>
      </section>
    </>
  );
}
