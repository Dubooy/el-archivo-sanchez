"use client";

import { useEffect, useRef, useState } from "react";
import { ADS } from "@/lib/config";
import { CONSENT_EVENT, hasConsent } from "@/lib/consent";

/* ============================================================
   HUECO PUBLICITARIO
   Tres reglas, en este orden:

   1. No es intrusivo. Vive entre secciones o en el carril lateral,
      nunca encima del contenido, nunca flotando en móvil, nunca
      empujando lo que estabas leyendo.
   2. Reserva su altura ANTES de cargar nada. Si el anuncio tarda o
      no llega, la página no da el salto que hace perder la línea que
      estabas leyendo (eso es lo que mide Google como CLS).
   3. No contacta con la red publicitaria hasta que el visitante
      acepta la categoría «publicidad». Sin consentimiento, el hueco
      se queda vacío y no se descarga ni un byte de terceros.

   Va etiquetado como «Publicidad»: distinguir contenido de anuncio
   es obligatorio (LSSI art. 20) y, en un archivo documental, además
   es cuestión de credibilidad.
   ============================================================ */

type Format = "leaderboard" | "rectangle" | "rail";

const BOX: Record<Format, { className: string; slotKey: keyof typeof ADS.slots }> = {
  // Banner ancho: 90 px de alto en móvil, 90–120 en escritorio.
  leaderboard: { className: "min-h-[100px] w-full sm:min-h-[110px]", slotKey: "leaderboard" },
  // Rectángulo dentro del contenido.
  rectangle: { className: "min-h-[250px] w-full max-w-[336px]", slotKey: "rectangle" },
  // Carril lateral: solo en pantallas muy anchas, y pegajoso sin tapar nada.
  rail: { className: "min-h-[600px] w-[300px]", slotKey: "rail" },
};

let loaderInjected = false;

/** Inserta el script de la red publicitaria una sola vez y solo con
    consentimiento. Antes de esto no se ha hecho ninguna petición. */
function injectLoader() {
  if (loaderInjected || !ADS.enabled || !ADS.client) return;
  loaderInjected = true;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.client}`;
  document.head.appendChild(s);
}

export function AdSlot({
  format = "leaderboard",
  className = "",
}: {
  format?: Format;
  className?: string;
}) {
  const [allowed, setAllowed] = useState(false);
  const ins = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);
  const box = BOX[format];

  useEffect(() => {
    const sync = () => setAllowed(hasConsent("publicidad"));
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!allowed || !ADS.enabled || !ADS.client || pushed.current) return;
    injectLoader();
    pushed.current = true;
    try {
      // @ts-expect-error — lo define el script de la red publicitaria.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* Un bloqueador de anuncios puede impedirlo: no es un error del sitio. */
    }
  }, [allowed]);

  const live = allowed && ADS.enabled && ADS.client && ADS.slots[box.slotKey];

  return (
    <aside
      aria-label="Publicidad"
      className={`mx-auto flex flex-col items-center ${className}`}
      // El espacio se reserva aunque no haya anuncio: cero saltos de diseño.
    >
      <span className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-3)]">
        Publicidad
      </span>
      <div
        className={`flex items-center justify-center border border-dashed border-[var(--line-2)] bg-[var(--panel-2)] ${box.className}`}
      >
        {live ? (
          <ins
            ref={ins}
            className="adsbygoogle block w-full"
            style={{ display: "block", width: "100%" }}
            data-ad-client={ADS.client}
            data-ad-slot={ADS.slots[box.slotKey]}
            data-ad-format={format === "rail" ? "vertical" : "auto"}
            data-full-width-responsive={format === "leaderboard" ? "true" : "false"}
          />
        ) : (
          <p className="px-4 text-center font-mono text-[10px] uppercase leading-[1.8] tracking-[0.14em] text-[var(--ink-3)]">
            Espacio reservado
            <br />
            <span className="normal-case tracking-normal">
              {ADS.enabled
                ? "Sin publicidad hasta que aceptes esa categoría de cookies."
                : "Publicidad desactivada en esta instalación."}
            </span>
          </p>
        )}
      </div>
    </aside>
  );
}

/** Carril lateral: aparece solo a partir de 1536 px, se queda pegado
    mientras lees y desaparece en cuanto la pantalla no le sobra sitio. */
export function AdRail() {
  return (
    <div className="hidden 2xl:block">
      <div className="sticky top-[88px]">
        <AdSlot format="rail" />
      </div>
    </div>
  );
}
