"use client";

import { useEffect, useState } from "react";

const KEY = "el-archivo:theme";

/* ============================================================
   INTERRUPTOR DE TEMA
   El claro es el principal; el oscuro es alternativo y explícito:
   no se activa solo por la preferencia del sistema, se elige aquí.
   La elección se guarda en el navegador y la aplica el script
   que hay en layout.tsx antes de pintar, para que no haya
   parpadeo blanco al cargar en oscuro.
   ============================================================ */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* Navegación privada o almacenamiento bloqueado: el tema
         funciona igual, simplemente no se recuerda. */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={ready ? dark : undefined}
      title={dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center border-[1.5px] border-[var(--edge)] bg-[var(--panel)] font-mono text-[12px] leading-none text-[var(--ink)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-brut-sm ${className}`}
    >
      <span className="sr-only">{dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}</span>
      <span aria-hidden>{ready && dark ? "☀" : "☾"}</span>
    </button>
  );
}
