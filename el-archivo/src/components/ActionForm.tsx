"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { HONEYPOT_FIELD } from "@/lib/antispam";
import type { Resultado } from "@/server/guard";
import { Label } from "./primitives";
import { ReviewBadge } from "./badges";

/* ============================================================
   PIEZAS COMPARTIDAS DE LOS FORMULARIOS
   ------------------------------------------------------------
   Tres cosas que todos los formularios de la plataforma necesitan y
   que conviene que estén escritas una sola vez:

     · El campo trampa y la marca de tiempo del antispam.
     · Un botón que se desactiva solo mientras se envía.
     · Un aviso que dice qué ha pasado, con el estado del envío.

   Ojo: esto es la mitad amable. La comprobación de verdad la hace
   el servidor en src/server/guard.ts, y esa no se puede saltar.
   ============================================================ */

/** Campo trampa + reloj. Va dentro de cada <form>. */
export function CamposAntispam() {
  // El reloj arranca cuando el formulario aparece en pantalla, no
  // cuando se envía: es lo que permite detectar un envío instantáneo.
  const [inicio] = useState(() => Date.now());
  return (
    <>
      <input type="hidden" name="startedAt" value={inicio} />
      {/* Invisible para una persona —fuera de pantalla, sin tabulación
          y con aria-hidden— y visible para un bot, que lo rellenará.
          Nunca display:none: eso ya lo detectan. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={HONEYPOT_FIELD}>No rellenes este campo</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
    </>
  );
}

/** Botón de envío que se desactiva mientras la acción está en vuelo.
    `useFormStatus` lee el estado del <form> que lo contiene. */
export function BotonEnviar({
  children,
  enviando = "Enviando…",
  className = "btn-red",
  disabled = false,
}: {
  children: React.ReactNode;
  enviando?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending}>
      {pending ? enviando : children}
    </button>
  );
}

/** El resultado de la acción, contado en cristiano. */
export function Aviso({ resultado }: { resultado: Resultado | null }) {
  const ref = useRef<HTMLDivElement>(null);

  // Al aparecer, se lleva el foco: quien navega con teclado o con
  // lector de pantalla se entera de que ha pasado algo.
  useEffect(() => {
    if (resultado) ref.current?.focus();
  }, [resultado]);

  if (!resultado) return null;

  if (!resultado.ok) {
    return (
      <div
        ref={ref}
        tabIndex={-1}
        role="alert"
        className="mb-5 border-l-4 border-[var(--red)] bg-[var(--red-wash)] px-4 py-3 text-[13px] leading-[1.7] text-[var(--red-deep)]"
      >
        {resultado.error}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="mb-5 border border-[var(--warn)] bg-[color-mix(in_srgb,var(--warn)_7%,transparent)] p-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <ReviewBadge state="PENDIENTE" />
        <Label>Guardado en el servidor</Label>
      </div>
      <p className="mt-2 text-[13px] leading-[1.7] text-[var(--ink-2)]">{resultado.mensaje}</p>
    </div>
  );
}

/** Aviso de que hace falta iniciar sesión, con enlace al acceso.
    Se enseña en lugar del formulario: es más honesto que dejar
    escribir y rechazarlo al final. */
export function HaceFaltaSesion({ que }: { que: string }) {
  return (
    <div className="card-community p-5">
      <Label tone="ink">Para {que} hace falta una cuenta</Label>
      <p className="mt-2 text-[13px] leading-[1.7] text-[var(--ink-2)]">
        Es lo que impide que una sola persona infle una votación o llene la cola de moderación. No
        pedimos nombre real ni teléfono: basta un correo, y lo único que se muestra es tu apodo.
      </p>
      <a href="/acceder" className="btn-red mt-4 inline-flex">
        Entrar o crear cuenta
      </a>
    </div>
  );
}
