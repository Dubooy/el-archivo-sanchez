import type { Metadata } from "next";
import Link from "next/link";
import { getMeta, getStats } from "@/lib/data";
import { MODERATION, MODULES, SITE } from "@/lib/config";
import { EVIDENCE, PROMISE, REVIEW, TIER } from "@/lib/evidence";
import { PROCEDURAL_LABEL, fmtNumber } from "@/lib/format";
import { Label, LayerTag, Notice, PageHead } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Metodología",
  description:
    "Cómo se selecciona, se verifica, se clasifica, se modera y se corrige todo lo que hay en el archivo.",
};

const PASOS = [
  {
    n: "01",
    t: "Cómo se seleccionan los casos",
    b: "Entra lo que es público, comprobable y relevante para la actividad política del sujeto: declaraciones en sede parlamentaria, entrevistas, comparecencias, actos y publicaciones oficiales. No entra la vida privada de nadie, ni la de sus familiares, ni material sobre personas que no son cargos públicos. Un asunto se abre por una pregunta que se pueda comprobar, no por una intuición.",
  },
  {
    n: "02",
    t: "Cómo se verifica una declaración",
    b: "Se localiza el material original y se transcribe literalmente el fragmento. Se anota la fecha, el lugar y la situación. Si no se puede citar palabra por palabra, no se archiva como cita: se describe. Y siempre se guarda el contexto, porque recortar una frase cierta hasta que signifique lo contrario es la forma más eficaz de desinformar con material auténtico.",
  },
  {
    n: "03",
    t: "Cómo se determina una contradicción",
    b: "Hacen falta dos cosas documentadas por separado: una declaración con fecha y un hecho posterior con fuente. La ficha muestra ambas y la línea temporal entre ellas. Lo que la ficha no dice nunca es que alguien mintiera: mentir exige demostrar qué sabía una persona en un momento dado, y eso casi nunca se puede acreditar.",
  },
  {
    n: "04",
    t: "Cómo se evalúa una promesa",
    b: "Primero se convierte en algo medible: qué, cuánto y para cuándo. Si falta cualquiera de las tres cosas, entra como «no evaluable» y ahí se queda. Para marcarla «no cumplida» hacen falta dos condiciones a la vez: que el plazo anunciado por quien la formuló haya vencido y que exista documentación de que el objetivo no se alcanzó. El paso del tiempo, por sí solo, no clasifica nada.",
  },
  {
    n: "05",
    t: "Cómo se incorporan las fuentes",
    b: "Cada fuente entra con su nivel documental, del 1 al 8. Se busca primero material de primera mano y siempre, explícitamente, lo que contradice la hipótesis. Diez medios reproduciendo la misma nota de prensa cuentan como una sola fuente, y la ficha lo dice.",
  },
  {
    n: "06",
    t: "Cómo funciona la moderación",
    b: "Premoderación: nada de lo que aporta un usuario es visible hasta que un moderador lo acepta. Se acepta material comprobable, no conclusiones. Las aportaciones cuyo texto atribuye responsabilidad penal se marcan para revisión reforzada y solo se aceptan con una resolución judicial que lo acredite.",
  },
  {
    n: "07",
    t: "Cómo se corrigen los errores",
    b: "Cualquiera puede proponer una corrección desde la propia ficha, indicando qué está mal, por qué y con qué fuente. Si se acepta, se corrige el registro, se actualiza la fecha y el cambio queda anotado en el historial del expediente, a la vista de todos. Nunca se corrige en silencio.",
  },
  {
    n: "08",
    t: "Cómo se diferencia hecho y opinión",
    b: "Con tres tratamientos visuales distintos que no se mezclan nunca: el archivo va sobre papel blanco con serif documental; la verificación lleva etiqueta roja y conclusión fechada; la comunidad va sobre gris, con avatares y voto. Si en algún punto de la web no sabes en cuál de las tres estás, es un fallo de diseño y hay que arreglarlo.",
  },
  {
    n: "09",
    t: "Cómo se tratan los casos judiciales",
    b: "Con terminología procesal estricta y sin atajos. Investigado no es acusado, acusado no es condenado, y condenado sin sentencia firme no acredita responsabilidad penal. Una causa que afecte al entorno político, institucional o partidario de un cargo no le atribuye nada a ese cargo: hace falta una relación acreditada con documento, y ese campo es obligatorio.",
  },
];

export default async function MetodologiaPage() {
  const [stats, meta] = await Promise.all([getStats(), getMeta()]);

  return (
    <>
      <PageHead
        eyebrow="Metodología"
        title="Cómo funciona esto"
        lede="Si una plataforma te enseña una conclusión y no te enseña cómo ha llegado a ella, la conclusión no es el producto: tú lo eres. Aquí está el método entero, incluido lo que este archivo se niega a hacer."
        meta={[
          ["Fuentes registradas", fmtNumber(stats.sources)],
          ["Niveles documentales", String(Object.keys(TIER).length)],
          ["Moderación", MODERATION.preModeration ? "Previa" : "Posterior"],
          ["Última actualización", meta.lastUpdated],
        ]}
      />

      {/* ------------------------------- LAS TRES CAPAS */}
      <section className="border-b bg-[var(--paper)]" aria-labelledby="capas">
        <div className="wrap py-12 sm:py-16">
          <h2 id="capas" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Las tres capas
          </h2>

          <div className="grid gap-px bg-[var(--line)] lg:grid-cols-3">
            {[
              {
                layer: "ARCHIVO" as const,
                t: "Lo que está documentado",
                d: "Declaraciones literales, fechas, lugares, hechos y documentos. Cada uno con enlace a su origen. Esta capa no interpreta: registra.",
                ex: "«Afirmó X el 14 de marzo de 2023, en Y. Fuente: enlace.»",
              },
              {
                layer: "VERIFICACION" as const,
                t: "Lo que las fuentes permiten concluir",
                d: "Conclusión editorial, fechada, con su nivel de evidencia y sus limitaciones declaradas. Revisable cuando aparece material nuevo.",
                ex: "«Las fuentes A, B y C describen Z. La declaración entra en contradicción con lo documentado en…»",
              },
              {
                layer: "COMUNIDAD" as const,
                t: "Lo que opinan los usuarios",
                d: "Debate clasificado, contraevidencia y correcciones. Puede cambiar el archivo, pero solo pasando por moderación y quedando anotado.",
                ex: "«@usuario cree que falta contexto y aporta este documento.»",
              },
            ].map((c) => (
              <div key={c.layer} className="bg-[var(--panel)] p-6">
                <LayerTag layer={c.layer} />
                <h3 className="headline mt-4 text-[15px] uppercase">{c.t}</h3>
                <p className="mt-3 text-[13px] leading-[1.7] text-[var(--ink-3)]">{c.d}</p>
                <p className="mt-4 border-l-2 border-[var(--line-2)] pl-3 font-serif text-[13px] italic leading-[1.6] text-[var(--ink-2)]">
                  {c.ex}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Notice kind="legal" title="La frase que este archivo no escribe">
              <p>
                <strong>«Pedro Sánchez mintió sobre X»</strong> no es una frase que esta plataforma
                pueda sostener, ni sobre él ni sobre ningún otro cargo. Lo que sí puede sostener es:
                «afirmó X el 14 de marzo»; «posteriormente ocurrió Y»; «las fuentes A, B y C lo
                acreditan»; y una conclusión editorial que describa esa distancia sin atribuir
                intención.
              </p>
              <p>
                La diferencia no es cosmética. La primera frase es una acusación que hay que poder
                probar; las otras cuatro son un archivo que cualquiera puede comprobar y discutir.
              </p>
            </Notice>
          </div>
        </div>
      </section>

      {/* ------------------------------- EL PROCESO */}
      <section className="border-b" aria-labelledby="proceso">
        <div className="wrap py-12 sm:py-16">
          <h2 id="proceso" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            El método, paso a paso
          </h2>
          <div className="stack-line border-y">
            {PASOS.map((p) => (
              <article key={p.n} className="grid gap-4 py-7 lg:grid-cols-[70px_1fr_2fr] lg:gap-10">
                <span className="num text-[26px] text-[var(--red)]">{p.n}</span>
                <h3 className="headline text-[15px] uppercase leading-tight">{p.t}</h3>
                <p className="doc">{p.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- NIVELES DE EVIDENCIA */}
      <section className="border-b bg-[var(--paper)]" aria-labelledby="niveles">
        <div className="wrap py-12 sm:py-16">
          <h2 id="niveles" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Los niveles de evidencia
          </h2>
          <dl className="stack-line border-y">
            {Object.entries(EVIDENCE).map(([k, m]) => (
              <div key={k} className="grid gap-3 py-5 lg:grid-cols-[260px_1fr] lg:gap-10">
                <dt>
                  <span
                    className="inline-flex items-center gap-2 border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em]"
                    style={{ borderColor: m.color, color: m.color, background: `color-mix(in srgb, ${m.color} 8%, transparent)` }}
                  >
                    <span className="inline-block h-[6px] w-[6px] rounded-full" style={{ background: m.color }} aria-hidden />
                    {m.label}
                  </span>
                </dt>
                <dd>
                  <p className="doc">{m.meaning}</p>
                  <p className="mt-2 text-[13px] font-medium leading-[1.7] text-[var(--ink)]">
                    {m.notMeaning}
                  </p>
                </dd>
              </div>
            ))}
          </dl>

          <h3 className="headline mt-12 text-[15px] uppercase">Estados de promesa</h3>
          <dl className="mt-5 stack-line border-y">
            {Object.entries(PROMISE).map(([k, m]) => (
              <div key={k} className="grid gap-3 py-4 lg:grid-cols-[260px_1fr] lg:gap-10">
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: m.color }}>
                  {m.icon} {m.label}
                </dt>
                <dd className="text-[13px] leading-[1.7] text-[var(--ink-2)]">{m.rule}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------- JERARQUÍA */}
      <section className="border-b" aria-labelledby="jerarquia-m">
        <div className="wrap py-12 sm:py-16">
          <h2 id="jerarquia-m" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Jerarquía de fuentes
          </h2>
          <ol className="stack-line border-y">
            {Object.entries(TIER)
              .sort((a, b) => a[1].rank - b[1].rank)
              .map(([k, m]) => (
                <li key={k} className="grid grid-cols-[40px_1fr] gap-4 py-4 sm:grid-cols-[40px_240px_1fr] sm:gap-8">
                  <span className="num text-[18px] text-[var(--red)]">{m.rank}</span>
                  <span className="text-[13px] font-semibold">{m.label}</span>
                  <span className="col-span-2 text-[13px] leading-[1.7] text-[var(--ink-3)] sm:col-span-1">
                    {m.note}
                  </span>
                </li>
              ))}
          </ol>
          <p className="mt-5 max-w-read text-[13px] leading-[1.7] text-[var(--ink-3)]">
            Una publicación en una red social no equivale a una sentencia judicial, y esta
            plataforma no las presenta como si lo fueran aunque digan lo mismo.
          </p>
        </div>
      </section>

      {/* ------------------------------- MODERACIÓN */}
      <section id="moderacion" className="scroll-mt-24 border-b bg-[var(--paper)]" aria-labelledby="mod">
        <div className="wrap py-12 sm:py-16">
          <h2 id="mod" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Moderación
          </h2>

          <dl className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(REVIEW).map(([k, m]) => (
              <div key={k} className="bg-[var(--panel)] p-5">
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: m.color }}>
                  {m.label}
                </dt>
                <dd className="mt-2.5 text-[12px] leading-[1.65] text-[var(--ink-3)]">{m.meaning}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Notice kind="warn" title="Revisión reforzada: cuándo se activa">
              <p>
                Cuando el texto de una aportación menciona responsabilidad penal. Las palabras que lo
                disparan están en el código, a la vista, no en una lista secreta:
              </p>
              <p className="font-mono text-[11px] leading-[1.9] text-[var(--ink-3)]">
                {MODERATION.escalate.join(" · ")}
              </p>
              <p>
                No se borra nada por decirlas. Se exige lo mismo que exigiría un juzgado: la
                resolución que lo acredite, o una reformulación en términos de lo que consta.
              </p>
            </Notice>
            <Notice kind="info" title="Qué se acepta y qué no">
              <p>
                <strong>Se acepta material:</strong> un vídeo con su minuto, un documento oficial,
                una serie estadística con periodo y unidad, una noticia enlazada a su publicación.
              </p>
              <p>
                <strong>No se acepta una conclusión</strong> por muy razonable que parezca. Se
                guarda, se muestra etiquetada como opinión del usuario, y no entra al archivo.
              </p>
            </Notice>
          </div>

          <div className="mt-6">
            <Link href="/moderacion" className="btn">
              Ver la cola de moderación <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------- JUDICIAL */}
      <section id="judicial" className="scroll-mt-24 border-b" aria-labelledby="jud">
        <div className="wrap py-12 sm:py-16">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <h2 id="jud" className="display text-[clamp(1.4rem,3.5vw,2.3rem)]">
              Casos judiciales
            </h2>
            <span className="chip pointer-events-none border-[var(--warn)] text-[var(--warn)]">
              Módulo desactivado
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
            <div>
              <p className="doc">
                El módulo judicial está construido y apagado. Existe el modelo de datos completo —
                órgano, hechos investigados, situación procesal, qué está probado, qué está pendiente
                y qué es solo acusación— y existe un campo obligatorio de{" "}
                <strong>relación acreditada con el sujeto</strong> que no admite insinuaciones: o hay
                un documento que la acredita, o el caso no entra.
              </p>
              <p className="doc mt-4">
                Está apagado porque publicar sobre causas abiertas que afectan a personas vivas es la
                parte con más riesgo de todo el proyecto, y merece criterio —y asesoría— antes de
                encenderse. Es una decisión editorial, no una limitación técnica: se activa cambiando
                un valor en <span className="font-mono text-[13px]">src/lib/config.ts</span>.
              </p>

              <div className="mt-6">
                <Label tone="ink">Terminología que usa el módulo</Label>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.values(PROCEDURAL_LABEL).map((l) => (
                    <span key={l} className="chip pointer-events-none">
                      {l}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[12px] leading-[1.7] text-[var(--ink-3)]">
                  Investigado no es acusado. Acusado no es procesado. Condenado sin firmeza no
                  acredita responsabilidad penal. Y estar relacionado políticamente con alguien
                  investigado no es ninguna de esas cosas.
                </p>
              </div>
            </div>

            <Notice kind="legal" title="Presunción de inocencia">
              <p>{SITE.judicialNotice}</p>
              <p>
                Este archivo no convierte una acusación en un hecho, no convierte una investigación
                en una condena y no convierte una relación política en responsabilidad penal. Si
                alguna ficha lo hiciera, es un error grave y hay un botón para señalarlo en cada
                expediente.
              </p>
              <p className="font-mono text-[11px]">
                Estado del módulo: {MODULES.judicial ? "ACTIVO" : "DESACTIVADO"}
              </p>
            </Notice>
          </div>
        </div>
      </section>

      {/* ------------------------------- CORRECCIONES */}
      <section id="correcciones" className="scroll-mt-24 border-b bg-[var(--paper)]" aria-labelledby="cor">
        <div className="wrap py-12 sm:py-16">
          <h2 id="cor" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Errores y correcciones
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ["Qué se corrige", "Cualquier dato mal registrado: una fecha, una cita mal atribuida, un enlace roto, un nivel de evidencia mal asignado o una conclusión más fuerte de lo que las fuentes soportaban."],
              ["Cómo se corrige", "Se modifica el registro, se actualiza su fecha y el cambio queda anotado en el historial del expediente, con el estado anterior tachado y el motivo escrito."],
              ["Qué no se hace nunca", "Corregir en silencio. Si esta plataforma se equivoca, la corrección tiene que ser tan visible como lo fue el error. Es lo único que hace que valga algo."],
            ].map(([t, b]) => (
              <div key={t} className="card p-5">
                <h3 className="text-[13px] font-semibold">{t}</h3>
                <p className="mt-3 text-[13px] leading-[1.7] text-[var(--ink-3)]">{b}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Notice kind="info" title="Por qué esta sección existe">
              <p>
                Porque es la diferencia entre un archivo y una plataforma diseñada para confirmar
                una opinión. Si un proyecto de este tipo no tiene una forma clara y pública de
                decirle «esto está mal, aquí está la prueba», no está documentando: está haciendo
                campaña con formato de base de datos.
              </p>
            </Notice>
          </div>
        </div>
      </section>

      {/* ------------------------------- INDEPENDENCIA */}
      <section aria-labelledby="indep">
        <div className="wrap py-12 sm:py-16">
          <h2 id="indep" className="display mb-8 text-[clamp(1.4rem,3.5vw,2.3rem)]">
            Independencia y alcance
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <Notice kind="legal" title="Proyecto independiente">
              <p>{SITE.independence}</p>
              <p>
                No se utiliza el emblema, el nombre ni la identidad gráfica oficial de ninguna
                formación. El rojo de esta web es una decisión editorial de la plataforma y no
                pretende sugerir vínculo con nadie.
              </p>
            </Notice>
            <Notice kind="info" title="Alcance del archivo">
              <p>
                El archivo admite varios cargos públicos. No es un gesto de equilibrio: es de
                método. Si solo se puede documentar a una persona, el lector no sabe si un hallazgo
                es relevante o es simplemente lo único que se estaba mirando.
              </p>
              <p>
                <Link href="/sujetos" className="underline underline-offset-4 hover:text-[var(--red)]">
                  Ver la ficha del sujeto →
                </Link>
              </p>
            </Notice>
          </div>

        </div>
      </section>
    </>
  );
}
