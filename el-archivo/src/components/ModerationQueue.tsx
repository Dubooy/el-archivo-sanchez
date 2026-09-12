"use client";

import { useActionState, useState } from "react";
import type { Submission } from "@/lib/types";
import { SUBMISSION_KIND, fmtDate } from "@/lib/format";
import { REVIEW } from "@/lib/evidence";
import { moderarAportacion } from "@/lib/actions";
import { Avatar } from "./cards";
import { Label, Notice } from "./primitives";
import { ReviewBadge } from "./badges";
import { Aviso } from "./ActionForm";

/* ============================================================
   COLA DE MODERACIÓN
   ------------------------------------------------------------
   Las decisiones se toman en el servidor: cada botón envía una
   Server Action que exige papel de MODERADOR, escribe el estado y
   deja constancia en `moderation_log` con el motivo.

   Tres reglas que la interfaz hace visibles:
     · Rechazar o devolver exige motivo escrito. Sin motivo, la
       acción se rechaza en el servidor, no solo aquí.
     · Lo marcado para revisión reforzada aparece primero.
     · Todo lo decidido queda anotado con autor y fecha.
   ============================================================ */

const DECISIONES = [
  { key: "APROBAR", label: "Aceptar e incorporar", color: "var(--ok)" },
  { key: "PEDIR_INFO", label: "Pedir más información", color: "var(--open)" },
  { key: "RECHAZAR", label: "Rechazar", color: "var(--red)" },
] as const;

export function ModerationQueue({
  queue,
  historial,
}: {
  /** Lo que espera decisión: PENDIENTE y NECESITA_INFO. */
  queue: Submission[];
  /** Lo ya decidido, para poder revisar lo que se hizo. */
  historial: Submission[];
}) {
  const [filtro, setFiltro] = useState<string>("PENDIENTE");

  const cuenta = queue.reduce<Record<string, number>>(
    (m, r) => ((m[r.reviewState] = (m[r.reviewState] ?? 0) + 1), m),
    {},
  );
  const filas = filtro ? queue.filter((r) => r.reviewState === filtro) : queue;

  return (
    <div className="space-y-10">
      <Notice kind="warn" title="Cómo funciona la premoderación">
        <p>
          Nada de lo que aporta un usuario aparece en el archivo público hasta que alguien lo
          acepta aquí. Es lo que impide que una acusación sin fuente esté visible, aunque sea diez
          minutos, con el nombre de la plataforma encima.
        </p>
        <p>
          El coste es real: la comunidad se siente más lenta. Es el precio de poder responder de lo
          que publicas.
        </p>
      </Notice>

      <section aria-labelledby="cola">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
          <div>
            <h2 id="cola" className="headline text-[clamp(1.05rem,2.4vw,1.5rem)] uppercase">
              Cola en vivo
            </h2>
            <p className="mt-1.5 text-[12px] text-[var(--ink-3)]">
              Lo que la comunidad ha enviado y espera decisión. Lo marcado para revisión reforzada
              sale primero.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["PENDIENTE", "NECESITA_INFO", ""] as const).map((k) => (
              <button
                key={k || "todo"}
                type="button"
                className="chip"
                data-active={filtro === k}
                aria-pressed={filtro === k}
                onClick={() => setFiltro(k)}
              >
                {k ? REVIEW[k].label : "Toda la cola"}
                {k && cuenta[k] ? <span className="opacity-55">{cuenta[k]}</span> : null}
              </button>
            ))}
          </div>
        </div>

        {filas.length === 0 ? (
          <div className="card px-6 py-12 text-center">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--ink-2)]">
              Cola vacía
            </p>
            <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-[var(--ink-3)]">
              No hay nada con ese estado. Envía una aportación desde «Añadir al archivo» y vuelve
              aquí para verla llegar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filas.map((r) => (
              <FichaCola key={r.id} r={r} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="decidido">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
          <h2 id="decidido" className="headline text-[clamp(1.05rem,2.4vw,1.5rem)] uppercase">
            Ya decidido
          </h2>
          <Label>{historial.length} registros</Label>
        </div>
        <div className="space-y-3">
          {historial.map((s) => (
            <article key={s.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span aria-hidden>{SUBMISSION_KIND[s.kind].icon}</span>
                  <Label tone="ink">{SUBMISSION_KIND[s.kind].label}</Label>
                  <span className="font-mono text-[11px]">{s.by}</span>
                  <Label>{fmtDate(s.at)}</Label>
                </div>
                <ReviewBadge state={s.reviewState} />
              </div>
              <h3 className="mt-2 text-[13px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[12px] leading-[1.6] text-[var(--ink-3)]">{s.whyRelevant}</p>
              {s.moderatorNote ? (
                <p className="mt-3 border-t pt-3 font-mono text-[10px] leading-[1.7] text-[var(--ink-3)]">
                  Moderación: {s.moderatorNote}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FichaCola({ r }: { r: Submission }) {
  const [estado, decidir] = useActionState(moderarAportacion, null);

  return (
    <article className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span aria-hidden>{SUBMISSION_KIND[r.kind].icon}</span>
          <Label tone="ink">{SUBMISSION_KIND[r.kind].label}</Label>
          <Avatar handle={r.by} size={22} />
          <span className="font-mono text-[11px]">{r.by}</span>
          <Label>{fmtDate(r.at)}</Label>
        </div>
        <ReviewBadge state={r.reviewState} />
      </div>

      <h3 className="mt-3 text-[14px] font-semibold">{r.title}</h3>
      {r.description ? (
        <p className="mt-2 text-[12px] leading-[1.65] text-[var(--ink-3)]">{r.description}</p>
      ) : null}

      <dl className="mt-4 grid gap-3 border-t pt-3 sm:grid-cols-2">
        <div>
          <dt className="label">Enlace</dt>
          <dd className="mt-1 truncate font-mono text-[11px]">
            {r.url ? (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-[var(--open)] hover:underline"
              >
                {r.url}
              </a>
            ) : (
              <span className="text-[var(--warn)]">sin enlace</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="label">Relevancia declarada</dt>
          <dd className="mt-1 text-[12px] leading-[1.6] text-[var(--ink-2)]">{r.whyRelevant}</dd>
        </div>
      </dl>

      {r.userConclusion ? (
        <p className="mt-3 border-l-2 border-[var(--line-2)] pl-3 text-[12px] italic leading-[1.65] text-[var(--ink-3)]">
          ❝ Opinión del usuario (no se incorpora al archivo): {r.userConclusion}
        </p>
      ) : null}

      {r.escalated ? (
        <p className="mt-3 border-l-2 border-[var(--red)] bg-[var(--red-wash)] py-2 pl-3 text-[12px] leading-[1.65] text-[var(--ink-2)]">
          <strong className="text-[var(--red)]">Revisión reforzada.</strong> El texto menciona
          responsabilidad penal. Solo se acepta si aporta una resolución judicial que lo acredite;
          en caso contrario se rechaza o se pide reformular en términos de lo que consta.
        </p>
      ) : null}

      <div className="mt-4 border-t pt-4">
        <Aviso resultado={estado} />
        <form action={decidir}>
          <input type="hidden" name="id" value={r.id} />
          <label htmlFor={`n-${r.id}`} className="label block">
            Nota de moderación (se muestra a quien lo aportó)
          </label>
          <input
            id={`n-${r.id}`}
            name="nota"
            className="field mt-2"
            placeholder="Por qué se acepta, se devuelve o se rechaza."
            maxLength={500}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {DECISIONES.map((d) => (
              <BotonDecision key={d.key} valor={d.key} color={d.color}>
                {d.label}
              </BotonDecision>
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px] leading-[1.7] text-[var(--ink-3)]">
            Rechazar o devolver exige motivo escrito: quien lo envió tiene derecho a saber por qué.
          </p>
        </form>
      </div>
    </article>
  );
}

/** Cada decisión es un botón de envío del mismo formulario: lo que
    cambia es el valor de `accion` que viaja con él. */
function BotonDecision({
  valor,
  color,
  children,
}: {
  valor: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      name="accion"
      value={valor}
      className="border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-all duration-200 ease-out hover:-translate-y-[2px]"
      style={{ borderColor: color, color }}
    >
      {children}
    </button>
  );
}
