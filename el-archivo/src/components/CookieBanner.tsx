"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ACCEPT_ALL,
  CATEGORIES,
  CONSENT_EVENT,
  type Consent,
  type ConsentCategory,
  DENY_ALL,
  activateScripts,
  readConsent,
  resetConsent,
  writeConsent,
} from "@/lib/consent";

/* ============================================================
   AVISO DE COOKIES
   Cumple lo que exige la Guía de cookies de la AEPD:
   · No se carga nada no necesario antes de decidir.
   · «Rechazar» está al mismo nivel visual que «Aceptar todo».
   · Cerrar el aviso NO acepta: no hay aspa de cierre.
   · Se puede cambiar de opinión en cualquier momento desde el pie.
   · El panel de configuración explica finalidad y ejemplos por
     categoría, y permite guardar una elección parcial.
   ============================================================ */

type Draft = Record<ConsentCategory, boolean>;

const DRAFT_FROM = (c: Consent | null): Draft => ({
  necesarias: true,
  preferencias: c?.preferencias ?? false,
  analitica: c?.analitica ?? false,
  publicidad: c?.publicidad ?? false,
});

export function CookieBanner() {
  const [decided, setDecided] = useState(true); // en SSR no se pinta nada
  const [panel, setPanel] = useState(false);
  const [draft, setDraft] = useState<Draft>(DRAFT_FROM(null));
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Al montar: ¿hay decisión válida? Si la hay, activamos lo consentido.
  useEffect(() => {
    const c = readConsent();
    setDecided(Boolean(c));
    setDraft(DRAFT_FROM(c));
    activateScripts(c);

    const onChange = () => {
      const next = readConsent();
      setDecided(Boolean(next));
      setDraft(DRAFT_FROM(next));
      activateScripts(next);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  // El botón permanente del pie abre el panel desde cualquier página.
  useEffect(() => {
    const open = (e: Event) => {
      opener.current = (e as CustomEvent).detail ?? null;
      setDraft(DRAFT_FROM(readConsent()));
      setPanel(true);
    };
    window.addEventListener("el-archivo:open-cookies", open);
    return () => window.removeEventListener("el-archivo:open-cookies", open);
  }, []);

  // Escape cierra el panel (no el aviso: cerrar no puede equivaler a aceptar).
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(false);
        opener.current?.focus();
      }
      // Trampa de foco: el tabulador no debe salirse del diálogo.
      if (e.key === "Tab" && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    dialog.current?.querySelector<HTMLElement>("button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  const decide = useCallback((d: Omit<Consent, "at">) => {
    writeConsent(d);
    setPanel(false);
    setDecided(true);
  }, []);

  const acceptAll = () => decide(ACCEPT_ALL);
  const rejectAll = () => decide({ ...DENY_ALL });
  const saveDraft = () =>
    decide({
      necesarias: true,
      preferencias: draft.preferencias,
      analitica: draft.analitica,
      publicidad: draft.publicidad,
      version: ACCEPT_ALL.version,
    });

  if (decided && !panel) return null;

  return (
    <>
      {/* ---------------------------- AVISO ---------------------------- */}
      {!decided && !panel ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-desc"
          className="fixed inset-x-0 bottom-0 z-[70] animate-fade-up border-t-[1.5px] border-[var(--edge)] bg-[var(--paper)] shadow-brut-lg"
        >
          <div className="wrap flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-3xl">
              <h2
                id="cookie-title"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]"
              >
                Cookies en este sitio
              </h2>
              <p id="cookie-desc" className="mt-2 text-[13px] leading-[1.7] text-[var(--ink-2)]">
                Usamos cookies propias necesarias para que la web funcione y, solo si lo autorizas,
                cookies de preferencias, analítica y publicidad. Puedes aceptarlas todas,
                rechazarlas todas o elegir una a una. Si rechazas, la web funciona igual.{" "}
                <Link href="/legal/cookies" className="underline underline-offset-4">
                  Política de cookies
                </Link>
                .
              </p>
            </div>

            {/* Los tres botones pesan lo mismo: rechazar no puede ser más
                difícil que aceptar. */}
            <div className="grid shrink-0 gap-2.5 sm:grid-cols-3 lg:w-[420px]">
              <button type="button" onClick={acceptAll} className="btn-red justify-center">
                Aceptar todo
              </button>
              <button type="button" onClick={rejectAll} className="btn justify-center">
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => setPanel(true)}
                className="btn justify-center"
                aria-haspopup="dialog"
              >
                Configurar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ------------------------ PANEL DETALLADO ----------------------- */}
      {panel ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6">
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-panel-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border-[1.5px] border-[var(--edge)] bg-[var(--paper)] shadow-brut-lg"
          >
            <div className="flex items-center justify-between gap-4 border-b-[1.5px] border-[var(--edge)] bg-[var(--ink)] px-5 py-3">
              <h2
                id="cookie-panel-title"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--paper)]"
              >
                Configuración de cookies
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--paper)] opacity-60">
                {CATEGORIES.length} categorías
              </span>
            </div>

            <div className="stack-line px-5">
              {CATEGORIES.map((cat) => {
                const on = cat.required ? true : draft[cat.key];
                return (
                  <div key={cat.key} className="py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[14px] font-semibold">{cat.name}</p>
                        <p className="mt-1.5 max-w-2xl text-[12.5px] leading-[1.7] text-[var(--ink-3)]">
                          {cat.what}
                        </p>
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                          {cat.examples}
                        </p>
                      </div>

                      {cat.required ? (
                        <span className="chip pointer-events-none shrink-0">Siempre activas</span>
                      ) : (
                        <label className="flex shrink-0 cursor-pointer items-center gap-2">
                          <span className="sr-only">Activar {cat.name}</span>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [cat.key]: e.target.checked }))
                            }
                            className="h-4 w-4 accent-[var(--red)]"
                          />
                          <span
                            aria-hidden
                            className="font-mono text-[10px] uppercase tracking-[0.14em]"
                          >
                            {on ? "Activada" : "Desactivada"}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2.5 border-t-[1.5px] border-[var(--edge)] bg-[var(--panel-2)] px-5 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={rejectAll} className="btn justify-center">
                Rechazar todo
              </button>
              <button type="button" onClick={saveDraft} className="btn justify-center">
                Guardar mi elección
              </button>
              <button type="button" onClick={acceptAll} className="btn-red justify-center">
                Aceptar todo
              </button>
            </div>

            <p className="border-t border-[var(--line)] px-5 py-3 font-mono text-[10px] leading-[1.7] text-[var(--ink-3)]">
              Tu decisión se guarda 6 meses. Puedes cambiarla cuando quieras desde «Cookies» en el
              pie de página. Retirar el consentimiento es tan fácil como darlo.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Botón permanente para revocar o cambiar el consentimiento.
    Va en el pie y está en todas las páginas: es un requisito, no un extra. */
export function CookiePreferencesButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className || "underline underline-offset-4 hover:text-[var(--ink)]"}
      aria-haspopup="dialog"
      onClick={(e) =>
        window.dispatchEvent(
          new CustomEvent("el-archivo:open-cookies", { detail: e.currentTarget }),
        )
      }
    >
      Cookies: cambiar mis preferencias
    </button>
  );
}

/** Enlace para retirar el consentimiento de golpe (vuelve a mostrar el aviso). */
export function CookieResetButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => resetConsent()}>
      Retirar el consentimiento
    </button>
  );
}
