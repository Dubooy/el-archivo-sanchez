"use client";

import { useEffect } from "react";
import { Label } from "@/components/primitives";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción, aquí es donde engancharías tu servicio de registro de errores.
    console.error("[EL EXPEDIENTE]", error);
  }, [error]);

  return (
    <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="num text-[clamp(3rem,12vw,7rem)] text-[var(--red)]" aria-hidden>
        ERR
      </span>
      <Label tone="red" className="mt-4 block">
        Fallo del sistema
      </Label>
      <h1 className="display mt-5 max-w-2xl text-[clamp(1.5rem,4vw,2.5rem)]">
        Algo se ha roto por nuestra parte
      </h1>
      <p className="mt-5 max-w-md text-[13px] leading-[1.75] text-[var(--ink-3)]">
        No es culpa tuya. El detalle técnico está en la consola del navegador.
        {error.digest ? (
          <>
            {" "}
            Referencia: <span className="font-mono text-[var(--ink-2)]">{error.digest}</span>
          </>
        ) : null}
      </p>
      <button type="button" onClick={reset} className="btn-alert mt-9">
        Reintentar
      </button>
    </div>
  );
}
