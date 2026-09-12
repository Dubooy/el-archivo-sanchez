"use client";

import { useEffect, useState } from "react";

/* ============================================================
   EASTER EGGS
   ------------------------------------------------------------
   §28: la sátira vive en los detalles de interfaz, nunca en los
   datos. Estos avisos no tapan nada, no bloquean ningún clic, se
   van solos y no alteran ni un registro. Si alguna vez uno impide
   entender qué está documentado y qué no, sobra.
   ============================================================ */

const SEQ = "fuentes".split("");

export function EasterEggs() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let buf: string[] = [];
    let konami: number[] = [];
    const KON = [38, 38, 40, 40, 37, 39, 37, 39];
    let n = 0;

    const fire = (t: string) => {
      setMsg(t);
      window.setTimeout(() => setMsg(null), reduced ? 1500 : 2800);
    };

    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

      buf = [...buf, e.key.toLowerCase()].slice(-SEQ.length);
      if (buf.join("") === SEQ.join("")) {
        n += 1;
        fire(`Rigor documental +${n}`);
        buf = [];
      }

      konami = [...konami, e.keyCode].slice(-KON.length);
      if (konami.join() === KON.join()) {
        fire("Modo hemeroteca activado — sigue haciendo falta la fuente");
        konami = [];
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!msg) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 animate-fade-up"
      role="status"
      aria-live="polite"
    >
      <div className="border border-[var(--red)] bg-[var(--paper)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--red)]">
        {msg}
      </div>
    </div>
  );
}
