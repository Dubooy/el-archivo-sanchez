import type { Metadata } from "next";
import Link from "next/link";
import {
  getActivity,
  getPublishedComments,
  getCorrections,
  getDossiers,
  getStats,
  getSubmissions,
  getUsers,
} from "@/lib/data";
import { REPUTATION_RULES } from "@/lib/evidence";
import { fmtNumber } from "@/lib/format";
import { Label, LayerTag, Notice, PageHead, SectionHead } from "@/components/primitives";
import { CommentCard, CorrectionCard, SubmissionCard, UserCard } from "@/components/cards";
import { ActivityFeed } from "@/components/Timeline";

export const metadata: Metadata = {
  title: "Comunidad",
  description:
    "Debate clasificado, aportaciones, contraevidencia y correcciones. Todo separado del archivo verificado.",
};

export default async function ComunidadPage() {
  const [stats, users, allSubmissions, allCorrections, activity, dossiers, comments] =
    await Promise.all([
      getStats(),
      getUsers(),
      getSubmissions(),
      getCorrections(),
      getActivity(14),
      getDossiers(),
      getPublishedComments(),
    ]);
  const submissions = allSubmissions.slice(0, 8);
  const corrections = allCorrections.slice(0, 5);

  // Comentarios recientes de toda la plataforma, con su expediente.
  // Se traen todos los comentarios publicados de una vez y se cruzan
  // aquí: antes era una consulta por expediente.
  const porExpediente = new Map(dossiers.map((d) => [d.id, d]));
  const recent = comments
    .map((c) => ({ c, d: porExpediente.get(c.dossier) }))
    .filter((x): x is { c: (typeof comments)[number]; d: (typeof dossiers)[number] } => Boolean(x.d))
    .sort((a, b) => b.c.at.localeCompare(a.c.at))
    .slice(0, 6);

  return (
    <>
      <PageHead
        eyebrow="Sección 06 · Comunidad"
        title="Comunidad"
        lede="Aquí se discute, se aporta material y se señalan errores. Nada de lo que hay en esta sección forma parte del archivo verificado: para llegar allí hay que pasar por moderación y quedar anotado."
        meta={[
          ["Usuarios", String(stats.users)],
          ["Aportaciones", fmtNumber(stats.submissions)],
          ["Aceptadas", fmtNumber(stats.acceptedSubmissions)],
          ["En cola", String(stats.pending)],
        ]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <LayerTag layer="COMUNIDAD" />
          <Link href="/aportar" className="btn-red">
            + Añadir al archivo
          </Link>
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        <div className="mb-10 grid gap-4 lg:grid-cols-2">
          <Notice kind="community" title="La regla que hace que esto no sea otro foro político">
            <p>
              La comunidad <strong>no modifica los hechos del archivo</strong>. Puede aportar
              material, señalar errores y discutir conclusiones — y cuando una aportación resiste la
              comprobación, entra al archivo y se anota quién la trajo.
            </p>
            <p>
              Lo que no ocurre nunca es que una opinión muy votada se convierta en un hecho
              documentado.
            </p>
          </Notice>
          <Notice kind="info" title="La reputación no premia opinar de una forma determinada">
            <p>
              Sube por aportar fuentes que resisten, por detectar errores reales y por añadir
              contexto que cambia una ficha. Baja por publicar sin fuente, manipular material o
              atacar a personas.
            </p>
            <p>
              No hay ninguna señal política en el cálculo. Quien trae buenas fuentes contra las
              conclusiones de la plataforma sube igual que quien las trae a favor.
            </p>
          </Notice>
        </div>

        {/* ------------------------------- ACTIVIDAD */}
        <section className="mb-14" aria-labelledby="feed">
          <SectionHead index="01" title="Actividad" note="Lo que se mueve en la plataforma, del archivo y de la comunidad." />
          <ActivityFeed events={activity} />
        </section>

        {/* ------------------------------- APORTACIONES */}
        <section className="mb-14" aria-labelledby="aportaciones">
          <SectionHead
            index="02"
            title="Últimas aportaciones"
            note="Cada una con su estado. Las que llevan opinión del usuario la muestran claramente separada del material."
            href="/moderacion"
            hrefLabel="Ver la cola completa"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {submissions.map((s) => (
              <SubmissionCard key={s.id} s={s} />
            ))}
          </div>
        </section>

        {/* ------------------------------- DEBATE */}
        <section className="mb-14" aria-labelledby="debate-reciente">
          <SectionHead
            index="03"
            title="Debate reciente"
            note="Los comentarios se clasifican al escribirlos. Un «detecto un error» llega antes a quien puede arreglarlo que un hilo de doscientas respuestas."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {recent.map(({ c, d }) => (
              <div key={c.id}>
                <Link
                  href={`/expedientes/${d.id}#debate`}
                  className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] hover:text-[var(--red)]"
                >
                  En: {d.title.slice(0, 60)}…
                </Link>
                <CommentCard c={c} />
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------- CORRECCIONES */}
        <section className="mb-14" aria-labelledby="correcciones-com">
          <SectionHead
            index="04"
            title="Correcciones propuestas"
            note="La función más importante de la plataforma y la que más credibilidad da: que cualquiera pueda decir «esto está mal» y demostrarlo."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {corrections.map((c) => (
              <CorrectionCard key={c.id} c={c} />
            ))}
          </div>
        </section>

        {/* ------------------------------- REPUTACIÓN */}
        <section className="mb-14" aria-labelledby="reputacion">
          <SectionHead index="05" title="Reputación documental" note="Cómo se calcula, sin letra pequeña." />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <Label tone="ink">Sube</Label>
              <ul className="mt-4 stack-line border-t">
                {REPUTATION_RULES.up.map(([t, n]) => (
                  <li key={t} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="text-[13px] text-[var(--ink-2)]">{t}</span>
                    <span className="font-mono text-[12px] font-medium text-[var(--ok)]">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <Label tone="ink">Baja</Label>
              <ul className="mt-4 stack-line border-t">
                {REPUTATION_RULES.down.map(([t, n]) => (
                  <li key={t} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="text-[13px] text-[var(--ink-2)]">{t}</span>
                    <span className="font-mono text-[12px] font-medium text-[var(--red)]">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ------------------------------- PERFILES */}
        <section aria-labelledby="perfiles">
          <SectionHead index="06" title="Quién aporta" note="Ordenados por reputación documental, no por número de mensajes." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((u) => (
              <UserCard key={u.id} u={u} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
