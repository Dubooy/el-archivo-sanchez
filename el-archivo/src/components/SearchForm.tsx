"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGERENCIAS = ["economía", "vivienda", "promesa", "contradicción", "documento oficial", "contexto"];

export function SearchForm({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  const go = (v: string) => {
    if (v.trim().length < 2) return;
    router.push(`/buscar?q=${encodeURIComponent(v.trim())}`);
  };

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="q" className="sr-only">
          Buscar en el archivo
        </label>
        <input
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Escribe al menos dos caracteres…"
          autoFocus
          className="field flex-1 !px-4 !py-4 !text-[15px]"
        />
        <button type="submit" className="btn-red !py-4">
          Buscar
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
          Prueba con
        </span>
        {SUGERENCIAS.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            onClick={() => {
              setQ(s);
              go(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
