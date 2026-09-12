"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { SubmissionKind, Subject } from "@/lib/types";
import { SUBMISSION_KIND } from "@/lib/format";
import { MODERATION } from "@/lib/config";
import { needsEscalation } from "@/lib/moderation";
import { enviarAportacion } from "@/lib/actions";
import { Label, LayerTag, Notice } from "./primitives";
import { Aviso, BotonEnviar, CamposAntispam, HaceFaltaSesion } from "./ActionForm";

/* ============================================================
   + AÑADIR AL ARCHIVO
   ------------------------------------------------------------
   Un formulario, no un muro. La diferencia importante sigue estando
   en el último campo: la conclusión de quien aporta se guarda, se
   muestra y se etiqueta como OPINIÓN. Nunca entra al archivo como
   hecho, y eso lo garantiza el servidor, no este componente.

   Lo que cambia respecto a la versión anterior: esto ya no se
   guarda en tu navegador. Viaja a una Server Action que comprueba
   sesión, ritmo de envío y antispam antes de escribir nada.
   ============================================================ */

const KINDS = Object.keys(SUBMISSION_KIND) as SubmissionKind[];

export function SubmitForm({
  subjects,
  sesion,
}: {
  subjects: Subject[];
  /** Lo resuelve el servidor. Sin sesión no se enseña el formulario:
      es más honesto que dejar escribir y rechazarlo al final. */
  sesion: { handle: string } | null;
}) {
  const [kind, setKind] = useState<SubmissionKind | null>(null);
  const [estado, enviar] = useActionState(enviarAportacion, null);

  if (!sesion) {
    return (
      <div className="space-y-6">
        <HaceFaltaSesion que="aportar al archivo" />
        <Notice kind="info" title="Por qué hace falta cuenta para aportar">
          <p>
            Porque todo lo que entra queda firmado y con historial. Si mañana hay que responder de
            un registro, tiene que poder saberse quién lo aportó y quién lo aceptó. No pedimos
            nombre real: basta un correo, y lo único que se muestra es tu apodo.
          </p>
        </Notice>
      </div>
    );
  }

  /* ---------- Paso 1: qué quieres aportar ---------- */
  if (!kind) {
    return (
      <div className="space-y-8">
        <Aviso resultado={estado} />

        <div>
          <h2 className="headline text-[clamp(1.2rem,3vw,1.9rem)] uppercase">¿Qué quieres aportar?</h2>
          <p className="mt-3 max-w-read text-[14px] leading-[1.7] text-[var(--ink-3)]">
            Elige el tipo y te pediremos solo lo que hace falta para poder comprobarlo. Entras como{" "}
            <span className="font-mono text-[var(--ink)]">{sesion.handle}</span>.
          </p>
        </div>

        <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {KINDS.map((k) => {
            const m = SUBMISSION_KIND[k];
            const exigeFuente = (MODERATION.requiresSource as readonly string[]).includes(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className="bg-[var(--panel)] p-5 text-left transition-colors hover:bg-[var(--panel-2)]"
              >
                <span className="text-[20px]" aria-hidden>
                  {m.icon}
                </span>
                <p className="headline mt-3 text-[14px] uppercase">{m.label}</p>
                <p className="mt-2 text-[12px] leading-[1.6] text-[var(--ink-3)]">{m.hint}</p>
                {exigeFuente ? (
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--warn)]">
                    Exige enlace
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>

        <QuePasaDespues />
      </div>
    );
  }

  /* ---------- Paso 2: el formulario ---------- */
  const m = SUBMISSION_KIND[kind];
  const exigeFuente = (MODERATION.requiresSource as readonly string[]).includes(kind);

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => setKind(null)}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-[var(--ink)]"
      >
        ← Cambiar tipo
      </button>

      <form action={enviar} className="card relative p-5 sm:p-7">
        <Aviso resultado={estado} />
        <CamposAntispam />
        <input type="hidden" name="kind" value={kind} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="text-[22px]" aria-hidden>
              {m.icon}
            </span>
            <h2 className="headline text-[18px] uppercase">{m.label}</h2>
          </div>
          <LayerTag layer="COMUNIDAD" />
        </div>

        <div className="mt-6 grid gap-5">
          <div>
            <label htmlFor="subject" className="label block">
              Sobre quién
            </label>
            <select id="subject" name="subject" className="field mt-2 block" defaultValue={subjects[0]?.id}>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="label block">
              Título breve
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={8}
              maxLength={180}
              className="field mt-2"
              placeholder="Qué es, en una línea."
            />
          </div>

          <div>
            <label htmlFor="url" className="label block">
              Enlace al original {exigeFuente ? "(obligatorio para este tipo)" : "(recomendado)"}
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required={exigeFuente}
              className="field mt-2"
              placeholder="https://…"
            />
            <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-[var(--ink-3)]">
              Al original, no a una captura ni a un hilo que lo comenta.
            </p>
          </div>

          <div>
            <label htmlFor="description" className="label block">
              Qué contiene
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              required
              minLength={20}
              maxLength={2000}
              className="field mt-2"
              placeholder="Descríbelo como si quien lo lee no hubiera visto el enlace."
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="approxDate" className="label block">
                Fecha (aproximada vale)
              </label>
              <input
                id="approxDate"
                name="approxDate"
                className="field mt-2"
                placeholder="14/03/2024, o «marzo de 2024»"
              />
            </div>
            <div>
              <label htmlFor="context" className="label block">
                Dónde ocurrió
              </label>
              <input
                id="context"
                name="context"
                maxLength={1000}
                className="field mt-2"
                placeholder="Sede, medio, acto, programa…"
              />
            </div>
          </div>

          <div>
            <label htmlFor="whyRelevant" className="label block">
              Por qué es relevante para el archivo
            </label>
            <textarea
              id="whyRelevant"
              name="whyRelevant"
              rows={2}
              maxLength={1000}
              className="field mt-2"
              placeholder="Qué añade a lo que ya está documentado."
            />
          </div>

          <ConclusionDelUsuario />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
          <p className="max-w-md font-mono text-[10px] leading-[1.7] text-[var(--ink-3)]">
            Al enviar, esto queda <strong className="text-[var(--warn)]">PENDIENTE</strong>: no lo ve
            nadie hasta que un moderador lo acepte.
          </p>
          <BotonEnviar>Enviar al archivo</BotonEnviar>
        </div>
      </form>

      <QuePasaDespues />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** El campo que separa aportar de editorializar. Avisa mientras se
    escribe si el texto va a ir a revisión reforzada. */
function ConclusionDelUsuario() {
  const [texto, setTexto] = useState("");
  const escalara = texto.length > 10 && needsEscalation(texto, MODERATION.escalate);

  return (
    <div className="border-t pt-5">
      <label htmlFor="userConclusion" className="label block">
        ❝ ¿Qué conclusión sacas tú? (opcional)
      </label>
      <p className="mt-1.5 max-w-read text-[12px] leading-[1.65] text-[var(--ink-3)]">
        Se guarda y se muestra <strong>etiquetada como opinión tuya</strong>. No entra al archivo
        como hecho: eso es lo que separa aportar material de escribir la conclusión por nosotros.
      </p>
      <textarea
        id="userConclusion"
        name="userConclusion"
        rows={2}
        maxLength={1000}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="field mt-2"
        placeholder="Tu lectura de lo que aportas."
      />
      {escalara ? (
        <p className="mt-3 border-l-2 border-[var(--red)] bg-[var(--red-wash)] py-2 pl-3 text-[12px] leading-[1.65] text-[var(--ink-2)]">
          <strong className="text-[var(--red)]">Aviso.</strong> Tu texto atribuye responsabilidad
          penal. Se puede enviar, pero irá a revisión reforzada: sin una resolución judicial que lo
          acredite, se te pedirá reformularlo en términos de lo que consta.
        </p>
      ) : null}
    </div>
  );
}

function QuePasaDespues() {
  return (
    <div className="card-flat p-5 sm:p-6">
      <Label tone="ink">Qué pasa cuando envías algo</Label>
      <ol className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ["01", "Queda PENDIENTE", "Nadie lo ve. Ni tú en el archivo público, ni nadie más."],
          ["02", "Un moderador lo revisa", "Comprueba que el enlace funciona y que el material es lo que dices."],
          ["03", "Se acepta o se devuelve", "Con el motivo escrito, visible para quien lo aportó."],
          ["04", "Si se acepta, entra al archivo", "Tu conclusión personal no: esa se queda etiquetada como opinión."],
        ].map(([n, t, d]) => (
          <li key={n} className="grid grid-cols-[28px_1fr] gap-3 border-t pt-4">
            <span className="num text-[15px] text-[var(--red)]">{n}</span>
            <div>
              <p className="text-[13px] font-semibold">{t}</p>
              <p className="mt-1 text-[12px] leading-[1.6] text-[var(--ink-3)]">{d}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 border-t pt-4 text-[12px] leading-[1.7] text-[var(--ink-3)]">
        ¿Quieres ver el otro lado? La{" "}
        <Link href="/moderacion" className="underline underline-offset-4">
          cola de moderación
        </Link>{" "}
        enseña lo que espera decisión (hace falta papel de moderador para decidir).
      </p>
    </div>
  );
}
