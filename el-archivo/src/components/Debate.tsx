"use client";

import { useActionState, useState } from "react";
import type { Comment, CounterSubmission, VoteTally } from "@/lib/types";
import { STANCE_LABEL, fmtDate, fmtNumber } from "@/lib/format";
import { VOTE_DISCLAIMER, VOTE_OPTIONS, voteTotals } from "@/lib/evidence";
import { MODERATION } from "@/lib/config";
import { needsEscalation } from "@/lib/moderation";
import {
  emitirVoto,
  enviarComentario,
  enviarContraevidencia,
  enviarCorreccion,
} from "@/lib/actions";
import { Avatar, CommentCard } from "./cards";
import { Label, LayerTag, Notice } from "./primitives";
import { ReviewBadge } from "./badges";
import { Aviso, BotonEnviar, CamposAntispam, HaceFaltaSesion } from "./ActionForm";

/* ============================================================
   DEBATE, CONTRAEVIDENCIA, CORRECCIÓN Y VOTACIÓN
   ------------------------------------------------------------
   Todo lo que se escribe aquí viaja a una Server Action, se comprueba
   en el servidor y entra como PENDIENTE. No se publica hasta que un
   moderador lo acepta, y el aviso de confirmación lo dice.

   Antes esto se guardaba en el navegador de quien escribía. Ahora se
   guarda de verdad: por eso hace falta cuenta, y por eso hay un
   límite de envíos por minuto.
   ============================================================ */

const STANCES = ["A_FAVOR", "EN_CONTRA", "FALTA_CONTEXTO", "APORTO_FUENTE", "DETECTO_ERROR"] as const;
const COUNTER_KINDS = ["video", "declaracion", "documento", "noticia", "dato", "explicacion"] as const;

export function Debate({
  dossierId,
  dossierTitle,
  comments,
  counters,
  votes,
  sesion,
  miVoto,
}: {
  dossierId: string;
  dossierTitle: string;
  comments: Comment[];
  counters: CounterSubmission[];
  votes: VoteTally | undefined;
  /** El apodo de quien mira, o null si no ha entrado. Lo resuelve el
      servidor: el cliente no decide si hay sesión. */
  sesion: { handle: string } | null;
  /** Qué votó esta persona en este expediente, si votó. */
  miVoto: string | null;
}) {
  const [tab, setTab] = useState<"debate" | "contra" | "correccion">("debate");
  const [votoEstado, votar] = useActionState(emitirVoto, null);
  // Voto optimista: se pinta el elegido en cuanto se pulsa, sin
  // esperar a que el servidor conteste.
  const [votoLocal, setVotoLocal] = useState<string | null>(miVoto);

  const t = voteTotals(votes);
  const counts = votes ?? {
    dossier: dossierId,
    FUNDAMENTADA: 0,
    NO_DE_ACUERDO: 0,
    FALTA_EVIDENCIA: 0,
    FALTA_CONTEXTO: 0,
  };

  return (
    <div className="space-y-10">
      {/* -------------------------------- VOTACIÓN */}
      <section aria-labelledby="votacion" className="card-community p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="votacion" className="headline text-[15px] uppercase">
            ¿Qué opinas de este expediente?
          </h3>
          <LayerTag layer="COMUNIDAD" />
        </div>

        {sesion ? (
          <form action={votar}>
            <input type="hidden" name="dossierId" value={dossierId} />
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {VOTE_OPTIONS.map((o) => {
                const n = counts[o.key as keyof typeof counts] as number;
                const pct = t.pct(n);
                const picked = votoLocal === o.key;
                return (
                  <button
                    key={o.key}
                    type="submit"
                    name="option"
                    value={o.key}
                    onClick={() => setVotoLocal(o.key)}
                    aria-pressed={picked}
                    className="group relative overflow-hidden border p-3 text-left transition-colors"
                    style={{ borderColor: picked ? o.color : "var(--line-2)" }}
                  >
                    <span
                      className="absolute inset-y-0 left-0 -z-0 transition-[width] duration-500"
                      style={{ width: `${pct}%`, background: `color-mix(in srgb, ${o.color} 12%, transparent)` }}
                      aria-hidden
                    />
                    <span className="relative z-10 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2.5 text-[12px] leading-snug">
                        <span aria-hidden>{o.icon}</span>
                        {o.label}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--ink-3)]">
                        {pct}%
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </form>
        ) : (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {VOTE_OPTIONS.map((o) => {
              const n = counts[o.key as keyof typeof counts] as number;
              const pct = t.pct(n);
              return (
                <div
                  key={o.key}
                  className="relative overflow-hidden border border-[var(--line-2)] p-3 opacity-80"
                >
                  <span
                    className="absolute inset-y-0 left-0 -z-0"
                    style={{ width: `${pct}%`, background: `color-mix(in srgb, ${o.color} 12%, transparent)` }}
                    aria-hidden
                  />
                  <span className="relative z-10 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 text-[12px] leading-snug">
                      <span aria-hidden>{o.icon}</span>
                      {o.label}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--ink-3)]">
                      {pct}%
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-[13px] text-[var(--ink-2)]">
          <strong className="font-semibold">{t.wellFounded}%</strong> de {fmtNumber(t.total)} votos
          considera que la conclusión está bien fundamentada.
          {votoLocal ? (
            <span className="ml-2 font-mono text-[11px] text-[var(--ok)]">Tu voto está registrado.</span>
          ) : null}
        </p>

        {votoEstado && !votoEstado.ok ? (
          <p role="alert" className="mt-3 font-mono text-[11px] text-[var(--red)]">
            {votoEstado.error}
          </p>
        ) : null}

        {!sesion ? (
          <p className="mt-3 text-[12px] text-[var(--ink-3)]">
            Para votar hace falta una cuenta:{" "}
            <a href="/acceder" className="underline underline-offset-4">
              entrar o crear una
            </a>
            . Es lo que impide que una sola persona vote cien veces.
          </p>
        ) : null}

        <p className="mt-3 border-t pt-3 font-mono text-[10px] leading-[1.7] text-[var(--ink-3)]">
          {VOTE_DISCLAIMER}
        </p>
      </section>

      {/* -------------------------------- PESTAÑAS */}
      <section aria-labelledby="debate-h" id="debate" className="scroll-mt-24">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
          <h3 id="debate-h" className="headline text-[clamp(1.05rem,2.2vw,1.4rem)] uppercase">
            Debate
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["debate", `Comentarios · ${comments.length}`],
                ["contra", `Contraevidencia · ${counters.length}`],
                ["correccion", "Proponer corrección"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                className="chip"
                data-active={tab === k}
                aria-pressed={tab === k}
                onClick={() => setTab(k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {tab === "debate" ? (
          <div className="space-y-5">
            {sesion ? (
              <FormComentario dossierId={dossierId} />
            ) : (
              <HaceFaltaSesion que="comentar" />
            )}

            {comments.length ? (
              <div className="space-y-3">
                {comments.map((c) => (
                  <CommentCard key={c.id} c={c} />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-[13px] text-[var(--ink-3)]">
                Todavía no hay comentarios aprobados en este expediente.
              </p>
            )}
          </div>
        ) : null}

        {tab === "contra" ? (
          <div className="space-y-5">
            <Notice kind="community" title="¿Crees que falta contexto?">
              <p>
                Esta es la parte más útil de la plataforma. Si la conclusión de un expediente te
                parece mal fundada, no hace falta que discutas: <strong>trae la fuente</strong>. Si
                resiste la comprobación, se incorpora al expediente y el estado cambia.
              </p>
            </Notice>

            {sesion ? (
              <FormContraevidencia dossierId={dossierId} />
            ) : (
              <HaceFaltaSesion que="aportar contraevidencia" />
            )}

            {counters.length ? (
              <div className="space-y-3">
                <Label tone="ink">Contraevidencia aceptada de la comunidad</Label>
                {counters.map((c) => (
                  <article key={c.id} className="card-community p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar handle={c.by} size={22} />
                        <span className="font-mono text-[11px]">{c.by}</span>
                        <Label>{fmtDate(c.at)}</Label>
                        <span className="chip pointer-events-none">{c.kind}</span>
                      </div>
                      {c.incorporated ? (
                        <span className="chip pointer-events-none border-[var(--ok)] text-[var(--ok)]">
                          Incorporada al expediente
                        </span>
                      ) : (
                        <ReviewBadge state={c.reviewState} />
                      )}
                    </div>
                    <p className="mt-3 text-[13px] leading-[1.7] text-[var(--ink-2)]">{c.text}</p>
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--open)] hover:underline"
                      >
                        Ver material ↗
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-[13px] text-[var(--ink-3)]">
                Nadie ha aportado contraevidencia todavía. Eso no significa que el expediente sea
                correcto: significa que aún no lo ha discutido nadie.
              </p>
            )}
          </div>
        ) : null}

        {tab === "correccion" ? (
          <div className="space-y-5">
            <Notice kind="info" title="¿Has detectado un error?">
              <p>
                Una fecha mal puesta, una cita mal atribuida, una fuente que no dice lo que decimos
                que dice. Las correcciones aceptadas se anotan en el historial del expediente, a la
                vista. Un archivo que corrige en silencio no es un archivo.
              </p>
            </Notice>

            {sesion ? (
              <FormCorreccion targetId={dossierId} targetLabel={dossierTitle} />
            ) : (
              <HaceFaltaSesion que="proponer una corrección" />
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}

/* ------------------------------- FORMULARIOS ------------------------ */

function FormComentario({ dossierId }: { dossierId: string }) {
  const [estado, enviar] = useActionState(enviarComentario, null);
  const [stance, setStance] = useState<(typeof STANCES)[number]>("A_FAVOR");
  const [text, setText] = useState("");
  const needsUrl = stance === "APORTO_FUENTE";

  // Aviso temprano: si el texto atribuye responsabilidad penal, quien
  // escribe se entera ANTES de enviar de que irá a revisión reforzada.
  const escalara = text.length > 10 && needsEscalation(text, MODERATION.escalate);

  return (
    <form action={enviar} className="card-community relative p-4 sm:p-5">
      <Aviso resultado={estado} />
      <CamposAntispam />
      <input type="hidden" name="dossierId" value={dossierId} />
      <input type="hidden" name="stance" value={stance} />

      <Label tone="ink">Clasifica tu comentario</Label>
      <p className="mt-1.5 text-[12px] leading-[1.6] text-[var(--ink-3)]">
        No es decoración: clasificar convierte un hilo en algo utilizable. Un «detecto un error»
        llega antes a quien puede arreglarlo.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STANCES.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            data-active={stance === s}
            aria-pressed={stance === s}
            onClick={() => setStance(s)}
          >
            {STANCE_LABEL[s].icon} {STANCE_LABEL[s].label}
          </button>
        ))}
      </div>

      <label htmlFor="cmt" className="label mt-5 block">
        Tu comentario
      </label>
      <textarea
        id="cmt"
        name="text"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        minLength={12}
        maxLength={2000}
        required
        className="field mt-2"
        placeholder="Argumenta con lo que se pueda comprobar."
      />

      {needsUrl ? (
        <>
          <label htmlFor="cmt-url" className="label mt-4 block">
            Enlace a la fuente (obligatorio en este tipo)
          </label>
          <input
            id="cmt-url"
            name="sourceUrl"
            type="url"
            className="field mt-2"
            placeholder="https://…"
          />
        </>
      ) : null}

      {escalara ? (
        <p className="mt-3 border-l-2 border-[var(--warn)] pl-3 text-[12px] leading-[1.6] text-[var(--warn)]">
          Tu comentario menciona responsabilidad penal. Se puede enviar, pero pasará por revisión
          reforzada antes de publicarse.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="font-mono text-[10px] leading-relaxed text-[var(--ink-3)]">
          Premoderación activa: no se publica hasta que un moderador lo acepta.
        </p>
        <BotonEnviar>Enviar comentario</BotonEnviar>
      </div>
    </form>
  );
}

function FormContraevidencia({ dossierId }: { dossierId: string }) {
  const [estado, enviar] = useActionState(enviarContraevidencia, null);
  const [kind, setKind] = useState<string>("documento");

  return (
    <form action={enviar} className="card-community relative p-4 sm:p-5">
      <Aviso resultado={estado} />
      <CamposAntispam />
      <input type="hidden" name="dossierId" value={dossierId} />
      <input type="hidden" name="kind" value={kind} />

      <Label tone="ink">Tipo de material</Label>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {COUNTER_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            className="chip"
            data-active={kind === k}
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
          >
            {k}
          </button>
        ))}
      </div>

      <label htmlFor="cev" className="label mt-5 block">
        Qué aporta y qué parte del expediente discute
      </label>
      <textarea
        id="cev"
        name="text"
        rows={3}
        minLength={12}
        maxLength={2000}
        required
        className="field mt-2"
        placeholder="Sé concreto: qué punto del expediente cambia con esto."
      />

      <label htmlFor="cev-url" className="label mt-4 block">
        Enlace al material (obligatorio)
      </label>
      <input id="cev-url" name="url" type="url" required className="field mt-2" placeholder="https://…" />

      <div className="mt-4 flex justify-end border-t pt-4">
        <BotonEnviar>Aportar contraevidencia</BotonEnviar>
      </div>
    </form>
  );
}

function FormCorreccion({ targetId, targetLabel }: { targetId: string; targetLabel: string }) {
  const [estado, enviar] = useActionState(enviarCorreccion, null);

  return (
    <form action={enviar} className="card-community relative p-4 sm:p-5">
      <Aviso resultado={estado} />
      <CamposAntispam />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="targetLabel" value={targetLabel} />

      <label htmlFor="cor-what" className="label block">
        Qué está mal
      </label>
      <input
        id="cor-what"
        name="whatIsWrong"
        minLength={8}
        maxLength={500}
        required
        className="field mt-2"
        placeholder="Ej.: la fecha del bloque 02 no coincide con la de la fuente."
      />

      <label htmlFor="cor-why" className="label mt-4 block">
        Por qué
      </label>
      <textarea
        id="cor-why"
        name="why"
        rows={3}
        minLength={12}
        maxLength={1500}
        required
        className="field mt-2"
        placeholder="Explica el error con precisión."
      />

      <label htmlFor="cor-url" className="label mt-4 block">
        Fuente que lo demuestra (obligatorio)
      </label>
      <input
        id="cor-url"
        name="sourceUrl"
        type="url"
        required
        className="field mt-2"
        placeholder="https://…"
      />

      <div className="mt-4 flex justify-end border-t pt-4">
        <BotonEnviar>Proponer corrección</BotonEnviar>
      </div>
    </form>
  );
}
