"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   DESPLAZAMIENTO CON EL BOTÓN CENTRAL (autoscroll)
   Pulsas la rueda, sueltas, y la página se desplaza sola: hacia
   abajo si mueves el ratón por debajo del punto de anclaje, hacia
   arriba si lo mueves por encima, y más rápido cuanto más lejos.
   Se para con cualquier clic, con Escape o al girar la rueda.

   Por qué está escrito a mano: el autoscroll nativo existe en
   Windows pero no en macOS ni en Linux, y en las páginas con
   `overflow` propio deja de funcionar. Así se comporta igual en
   todos los sistemas.

   Respeta el hábito del navegador: sobre un enlace, el botón
   central sigue abriendo en una pestaña nueva. Solo se activa en
   zonas sin enlace ni campo de formulario.
   ============================================================ */

const DEAD_ZONE = 12; // px sin movimiento alrededor del ancla
const MAX_SPEED = 26; // px por fotograma a distancia máxima

export function AutoScroll() {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const isInteractive = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return Boolean(el?.closest?.("a[href], button, input, textarea, select, [contenteditable]"));
    };

    function stop() {
      setAnchor(null);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      raf.current = null;
      document.body.style.removeProperty("user-select");
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 1) {
        if (anchor) {
          // Cualquier otro clic cierra el modo autoscroll.
          e.preventDefault();
          stop();
        }
        return;
      }
      if (anchor) {
        e.preventDefault();
        stop();
        return;
      }
      if (isInteractive(e.target)) return; // enlaces: se respeta el navegador
      e.preventDefault(); // evita el autoscroll nativo y el pegado del botón central
      pointer.current = { x: e.clientX, y: e.clientY };
      setAnchor({ x: e.clientX, y: e.clientY });
      document.body.style.setProperty("user-select", "none");
    }

    function onMove(e: MouseEvent) {
      pointer.current = { x: e.clientX, y: e.clientY };
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") stop();
    }
    function onWheel() {
      stop();
    }
    // El botón central pega el portapapeles en X11: hay que anularlo.
    function onAuxClick(e: MouseEvent) {
      if (e.button === 1 && !isInteractive(e.target)) e.preventDefault();
    }

    window.addEventListener("mousedown", onMouseDown, { capture: true });
    window.addEventListener("auxclick", onAuxClick, { capture: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("blur", stop);

    return () => {
      window.removeEventListener("mousedown", onMouseDown, { capture: true } as never);
      window.removeEventListener("auxclick", onAuxClick, { capture: true } as never);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("blur", stop);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      document.body.style.removeProperty("user-select");
    };
  }, [anchor]);

  // Bucle de desplazamiento: velocidad proporcional a la distancia.
  useEffect(() => {
    if (!anchor) return;
    let alive = true;
    const step = () => {
      if (!alive) return;
      const dy = pointer.current.y - anchor.y;
      const dx = pointer.current.x - anchor.x;
      const speed = (d: number) => {
        const mag = Math.abs(d);
        if (mag <= DEAD_ZONE) return 0;
        // Curva cuadrática: control fino cerca del ancla, rápido lejos.
        const norm = Math.min((mag - DEAD_ZONE) / 260, 1);
        return Math.sign(d) * norm * norm * MAX_SPEED;
      };
      const vy = speed(dy);
      const vx = speed(dx) * 0.5;
      if (vy || vx) window.scrollBy(vx, vy);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      alive = false;
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [anchor]);

  if (!anchor) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[90]"
      style={{ left: anchor.x - 17, top: anchor.y - 17 }}
    >
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="15" fill="var(--paper)" stroke="var(--edge)" strokeWidth="1.5" />
        <circle cx="17" cy="17" r="2.4" fill="var(--red)" />
        <path d="M17 6.5 L21 11 H13 Z" fill="var(--ink)" />
        <path d="M17 27.5 L13 23 H21 Z" fill="var(--ink)" />
      </svg>
    </div>
  );
}
