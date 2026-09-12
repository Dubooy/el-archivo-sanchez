"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Label } from "./primitives";

/* ============================================================
   ENTRAR
   ------------------------------------------------------------
   Tres puertas, todas opcionales: cada una aparece solo si su
   proveedor está configurado. Ninguna pide contraseña, que es la
   decisión de seguridad más rentable del proyecto: lo que no se
   guarda no se puede filtrar.
   ============================================================ */

type Props = {
  correo: boolean;
  google: boolean;
  github: boolean;
  dev: boolean;
  /** A dónde volver después de entrar. */
  volverA: string;
};

export function AccederForm({ correo, google, github, dev, volverA }: Props) {
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function porCorreo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando("correo");
    try {
      const r = await signIn("nodemailer", { email, redirect: false, callbackUrl: volverA });
      if (r?.error) setError("No se ha podido enviar el enlace. Revisa el correo e inténtalo de nuevo.");
      else setEnviado(true);
    } catch {
      setError("No se ha podido contactar con el servidor.");
    } finally {
      setEnviando(null);
    }
  }

  async function porDev(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando("dev");
    const r = await signIn("dev", { handle, redirect: false, callbackUrl: volverA });
    setEnviando(null);
    if (r?.error) setError("Ese apodo no existe en la base de datos de desarrollo.");
    else window.location.href = volverA;
  }

  if (enviado) {
    return (
      <div className="card p-6">
        <Label tone="ink">Revisa tu correo</Label>
        <p className="mt-3 text-[13px] leading-[1.75] text-[var(--ink-2)]">
          Si esa dirección puede entrar, acaba de recibir un enlace. Caduca en quince minutos y
          solo sirve una vez. No decimos si la dirección existe o no: saberlo permitiría averiguar
          quién tiene cuenta aquí, y eso no es asunto de nadie.
        </p>
        <button
          type="button"
          onClick={() => setEnviado(false)}
          className="btn mt-5"
        >
          Usar otra dirección
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="border-l-4 border-[var(--red)] bg-[var(--red-wash)] px-4 py-3 text-[13px] leading-[1.7] text-[var(--red-deep)]"
        >
          {error}
        </div>
      ) : null}

      {correo ? (
        <form onSubmit={porCorreo} className="card p-5 sm:p-6">
          <Label tone="ink">Enlace por correo</Label>
          <p className="mt-2 text-[12px] leading-[1.7] text-[var(--ink-3)]">
            Te enviamos un enlace que entra sin contraseña. Sin contraseña no hay contraseña que
            filtrar.
          </p>
          <label htmlFor="email" className="label mt-4 block">
            Tu correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field mt-2"
            placeholder="tu@correo.com"
          />
          <button type="submit" className="btn-red mt-4" disabled={enviando === "correo"}>
            {enviando === "correo" ? "Enviando…" : "Enviarme el enlace"}
          </button>
        </form>
      ) : null}

      {google || github ? (
        <div className="card p-5 sm:p-6">
          <Label tone="ink">Con una cuenta que ya tienes</Label>
          <p className="mt-2 text-[12px] leading-[1.7] text-[var(--ink-3)]">
            Solo recibimos tu correo para identificarte. El nombre y la foto del proveedor se
            descartan al crear la cuenta: aquí tu identidad pública es un apodo.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {google ? (
              <button type="button" className="btn" onClick={() => signIn("google", { callbackUrl: volverA })}>
                Continuar con Google
              </button>
            ) : null}
            {github ? (
              <button type="button" className="btn" onClick={() => signIn("github", { callbackUrl: volverA })}>
                Continuar con GitHub
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {dev ? (
        <form onSubmit={porDev} className="card border-dashed p-5 sm:p-6">
          <Label tone="warn">Solo desarrollo</Label>
          <p className="mt-2 text-[12px] leading-[1.7] text-[var(--ink-3)]">
            Entra como cualquier usuario de la semilla para probar el circuito sin montar un
            servidor de correo. Esta puerta no existe en producción: está apagada por dos
            condiciones independientes en <code className="font-mono">src/lib/auth.ts</code>.
          </p>
          <label htmlFor="handle" className="label mt-4 block">
            Apodo existente
          </label>
          <input
            id="handle"
            name="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="field mt-2"
            placeholder="@editorial"
          />
          <button type="submit" className="btn mt-4" disabled={enviando === "dev"}>
            {enviando === "dev" ? "Entrando…" : "Entrar sin correo"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
