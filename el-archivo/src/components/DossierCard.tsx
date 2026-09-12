"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { Dossier } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { Label } from "./primitives";
import { EvidenceBadge } from "./badges";

/* ============================================================
   TARJETA DE EXPEDIENTE
   Escritorio: toda la densidad de datos a la vista.
   Móvil: acordeón. Se ve solo lo que sirve para decidir si abrir
   —número, título y etiqueta de estado— y el resto se despliega al
   tocar. Una lista de veinte expedientes deja de ser un scroll
   interminable sin esconder nada al que quiera verlo.

   El despliegue lo hace CSS (.accordion en globals.css: la fila de
   la rejilla va de 0fr a 1fr). En ≥768px la regla lo deja abierto
   siempre, así que el estado de React solo manda en móvil.
   ============================================================ */
export function DossierCard({ d, comments }: { d: Dossier; comments: number }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const changed = d.changes.length > 0;

  return (
    <article className="card card-hover flex flex-col">
      {/* --- cabecera: siempre visible, también plegado --- */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="num text-[clamp(1.4rem,3vw,2rem)] text-[var(--line-2)]">
            {String(d.number).padStart(3, "0")}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {changed ? (
              <span className="chip pointer-events-none border-[var(--open)] text-[var(--open)]">
                ↻ Actualizado
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="headline mt-3 text-[clamp(1rem,2vw,1.25rem)]">
          <Link
            href={`/expedientes/${d.id}`}
            className="transition-colors duration-200 ease-out hover:text-[var(--red)]"
          >
            {d.title}
          </Link>
        </h3>

        <div className="mt-4">
          <EvidenceBadge level={d.evidence} size="sm" />
        </div>
      </div>

      {/* --- interruptor del acordeón: solo móvil --- */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center justify-between gap-3 border-t border-[var(--line)] px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] transition-colors duration-200 ease-out hover:bg-[var(--panel-2)] hover:text-[var(--ink)] md:hidden"
      >
        <span>{open ? "Ocultar detalles" : "Ver detalles"}</span>
        <span
          aria-hidden
          className={`inline-block transition-transform duration-200 ease-out ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {/* --- cuerpo: plegable en móvil, siempre abierto en escritorio --- */}
      <div id={bodyId} className="accordion flex-1" data-open={open}>
        <div>
          <div className="border-t border-[var(--line)] p-5 pt-4 sm:p-6 sm:pt-4 md:border-t-0 md:pt-0">
            <p className="line-clamp-3 text-[13px] leading-[1.7] text-[var(--ink-3)]">
              {d.conclusion}
            </p>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--line)] pt-4">
              <div className="flex items-end gap-5">
                <div>
                  <div className="num text-xl">{d.sources.length}</div>
                  <Label className="text-[9px]">fuentes</Label>
                </div>
                <div>
                  <div className="num text-xl">{comments}</div>
                  <Label className="text-[9px]">debate</Label>
                </div>
              </div>
              <Label>Act. {fmtDate(d.lastUpdated)}</Label>
            </div>

            <Link
              href={`/expedientes/${d.id}`}
              className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] transition-all duration-200 ease-out hover:gap-3 hover:text-[var(--red)]"
            >
              Abrir expediente <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
