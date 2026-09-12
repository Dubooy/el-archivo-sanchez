"use client";

import { Label } from "./primitives";

export interface Opt {
  value: string;
  label: string;
  count?: number;
}

export function FilterGroup({
  title,
  options,
  value,
  onChange,
  allLabel = "Todo",
}: {
  title: string;
  options: Opt[];
  value: string;
  onChange: (v: string) => void;
  allLabel?: string;
}) {
  return (
    // min-w-0 evita que una fila larga estire la celda del grid y
    // desborde la página en horizontal.
    <div className="min-w-0">
      <Label>{title}</Label>
      <div
        className="no-scrollbar mt-2 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
        role="group"
        aria-label={title}
      >
        <button
          type="button"
          className="chip shrink-0"
          data-active={value === ""}
          aria-pressed={value === ""}
          onClick={() => onChange("")}
        >
          {allLabel}
        </button>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="chip shrink-0"
            data-active={value === o.value}
            aria-pressed={value === o.value}
            onClick={() => onChange(value === o.value ? "" : o.value)}
          >
            {o.label}
            {o.count !== undefined ? <span className="tabular-nums opacity-55">{o.count}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
  options,
  id = "sort",
}: {
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  id?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="label block">
        Ordenar por
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field mt-2 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextFilter({
  value,
  onChange,
  placeholder,
  id = "filtro-texto",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  id?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="label block">
        Filtrar por texto
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field mt-2"
      />
    </div>
  );
}

export function ResultCount({
  shown,
  total,
  noun,
  onReset,
  active,
}: {
  shown: number;
  total: number;
  noun: string;
  onReset: () => void;
  active: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-y py-3" aria-live="polite">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
        <span className="text-[var(--ink)]">{shown}</span> de {total} {noun}
      </p>
      {active ? (
        <button
          type="button"
          onClick={onReset}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-2)] underline-offset-4 hover:text-[var(--red)] hover:underline"
        >
          Limpiar filtros ×
        </button>
      ) : null}
    </div>
  );
}
