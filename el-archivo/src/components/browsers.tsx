"use client";

import { useMemo, useState } from "react";
import type { PoliticalPromise, Statement, TimelineEvent } from "@/lib/types";
import { TIMELINE_KIND, TOPIC_LABEL, fmtDate } from "@/lib/format";
import { PROMISE } from "@/lib/evidence";
import { normalize } from "@/lib/text";
import { PromiseCard, StatementCard } from "./cards";
import { Empty, Label } from "./primitives";
import { FilterGroup, ResultCount, SortSelect, TextFilter } from "./FilterBar";

const PAGE = 24;

function tally<T>(rows: T[], get: (r: T) => string | string[]) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = get(r);
    for (const x of Array.isArray(k) ? k : [k]) m.set(x, (m.get(x) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/* ------------------------------- DECLARACIONES -------------------- */

export function StatementBrowser({ rows }: { rows: Statement[] }) {
  const [topic, setTopic] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("reciente");
  const [text, setText] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const topics = useMemo(
    () => tally(rows, (r) => r.topics).map(([value, count]) => ({ value, label: TOPIC_LABEL[value as never] ?? value, count })),
    [rows],
  );
  const years = useMemo(
    () =>
      tally(rows, (r) => r.date.slice(0, 4))
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([value, count]) => ({ value, label: value, count })),
    [rows],
  );

  const list = useMemo(() => {
    const nt = normalize(text);
    const out = rows.filter((r) => {
      if (topic && !r.topics.includes(topic as never)) return false;
      if (year && !r.date.startsWith(year)) return false;
      if (nt && !normalize(`${r.text} ${r.place} ${r.context}`).includes(nt)) return false;
      return true;
    });
    return out.sort((a, b) =>
      sort === "antigua" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
    );
  }, [rows, topic, year, text, sort]);

  const active = !!(topic || year || text);

  return (
    <div>
      <div className="card mb-6 grid gap-5 p-5 sm:p-6">
        <FilterGroup title="Tema" options={topics} value={topic} onChange={(v) => (setTopic(v), setLimit(PAGE))} />
        <FilterGroup title="Año" options={years} value={year} onChange={(v) => (setYear(v), setLimit(PAGE))} />
        <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
          <TextFilter id="f-decl" value={text} onChange={(v) => (setText(v), setLimit(PAGE))} placeholder="Texto, lugar o contexto…" />
          <SortSelect
            id="s-decl"
            value={sort}
            onChange={setSort}
            options={[
              { value: "reciente", label: "Más reciente" },
              { value: "antigua", label: "Más antigua" },
            ]}
          />
        </div>
      </div>

      <ResultCount
        shown={Math.min(limit, list.length)}
        total={rows.length}
        noun="declaraciones"
        active={active}
        onReset={() => {
          setTopic("");
          setYear("");
          setText("");
          setLimit(PAGE);
        }}
      />

      {list.length === 0 ? (
        <div className="mt-6">
          <Empty title="Sin resultados" body="Ninguna declaración archivada cumple esa combinación de filtros." />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {list.slice(0, limit).map((s) => (
              <StatementCard key={s.id} s={s} />
            ))}
          </div>
          {limit < list.length ? (
            <div className="mt-8 flex justify-center">
              <button type="button" className="btn" onClick={() => setLimit((l) => l + PAGE)}>
                Cargar {Math.min(PAGE, list.length - limit)} más
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/* ---------------------------------- PROMESAS ---------------------- */

export function PromiseBrowser({ rows }: { rows: PoliticalPromise[] }) {
  const [state, setState] = useState("");
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");

  const states = useMemo(
    () => tally(rows, (r) => r.state).map(([value, count]) => ({ value, label: PROMISE[value as keyof typeof PROMISE].label, count })),
    [rows],
  );
  const topics = useMemo(
    () => tally(rows, (r) => r.topics).map(([value, count]) => ({ value, label: TOPIC_LABEL[value as never] ?? value, count })),
    [rows],
  );

  const list = useMemo(() => {
    const nt = normalize(text);
    return rows.filter((r) => {
      if (state && r.state !== state) return false;
      if (topic && !r.topics.includes(topic as never)) return false;
      if (nt && !normalize(`${r.text} ${r.objective}`).includes(nt)) return false;
      return true;
    });
  }, [rows, state, topic, text]);

  return (
    <div>
      <div className="card mb-6 grid gap-5 p-5 sm:p-6">
        <FilterGroup title="Estado" options={states} value={state} onChange={setState} />
        <FilterGroup title="Tema" options={topics} value={topic} onChange={setTopic} />
        <TextFilter id="f-prom" value={text} onChange={setText} placeholder="Texto de la promesa u objetivo…" />
      </div>

      <ResultCount
        shown={list.length}
        total={rows.length}
        noun="promesas"
        active={!!(state || topic || text)}
        onReset={() => {
          setState("");
          setTopic("");
          setText("");
        }}
      />

      {list.length === 0 ? (
        <div className="mt-6">
          <Empty title="Sin resultados" body="Ninguna promesa archivada encaja con esos filtros." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {list.map((p) => (
            <PromiseCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- CRONOLOGÍA ---------------------- */

export function TimelineBrowser({ rows }: { rows: TimelineEvent[] }) {
  const [kind, setKind] = useState("");
  const [topic, setTopic] = useState("");
  const [year, setYear] = useState("");

  const kinds = useMemo(
    () => tally(rows, (r) => r.kind).map(([value, count]) => ({ value, label: TIMELINE_KIND[value]?.label ?? value, count })),
    [rows],
  );
  const topics = useMemo(
    () => tally(rows, (r) => r.topics).map(([value, count]) => ({ value, label: TOPIC_LABEL[value as never] ?? value, count })),
    [rows],
  );
  const years = useMemo(
    () =>
      tally(rows, (r) => r.date.slice(0, 4))
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([value, count]) => ({ value, label: value, count })),
    [rows],
  );

  const list = useMemo(
    () =>
      rows
        .filter((r) => {
          if (kind && r.kind !== kind) return false;
          if (topic && !r.topics.includes(topic as never)) return false;
          if (year && !r.date.startsWith(year)) return false;
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [rows, kind, topic, year],
  );

  /* Agrupado por año: la cronología se lee por bloques, no en una lista plana. */
  const byYear = useMemo(() => {
    const m = new Map<string, TimelineEvent[]>();
    for (const e of list) {
      const y = e.date.slice(0, 4);
      m.set(y, [...(m.get(y) ?? []), e]);
    }
    return [...m.entries()];
  }, [list]);

  return (
    <div>
      <div className="card mb-6 grid gap-5 p-5 sm:p-6">
        <FilterGroup title="Tipo de acontecimiento" options={kinds} value={kind} onChange={setKind} />
        <FilterGroup title="Tema" options={topics} value={topic} onChange={setTopic} />
        <FilterGroup title="Año" options={years} value={year} onChange={setYear} />
      </div>

      <ResultCount
        shown={list.length}
        total={rows.length}
        noun="acontecimientos"
        active={!!(kind || topic || year)}
        onReset={() => {
          setKind("");
          setTopic("");
          setYear("");
        }}
      />

      {list.length === 0 ? (
        <div className="mt-6">
          <Empty title="Sin resultados" body="Ningún acontecimiento archivado encaja con esos filtros." />
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {byYear.map(([y, events]) => (
            <section key={y} aria-labelledby={`y-${y}`}>
              <div className="mb-5 flex items-end gap-5 border-b pb-3">
                <h2 id={`y-${y}`} className="num text-[clamp(2.5rem,7vw,4.5rem)] text-[var(--red)]">
                  {y}
                </h2>
                <Label className="pb-3">
                  {events.length} {events.length === 1 ? "registro" : "registros"}
                </Label>
              </div>

              <ol className="relative border-l-2 border-[var(--line)] pl-6">
                {events.map((e) => {
                  const k = TIMELINE_KIND[e.kind];
                  return (
                    <li key={e.id} id={e.id} className="relative scroll-mt-28 pb-7 last:pb-0">
                      <span
                        className="absolute -left-[31px] top-1 h-[11px] w-[11px] rounded-full border-2 bg-[var(--paper)]"
                        style={{ borderColor: k.color }}
                        aria-hidden
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <Label tone="red">{fmtDate(e.date)}</Label>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: k.color }}>
                          {k.label}
                        </span>
                      </div>
                      <p className="mt-2 font-serif text-[14px] leading-[1.55] text-[var(--ink)]">{e.title}</p>
                      <p className="mt-1.5 text-[12px] leading-[1.6] text-[var(--ink-3)]">{e.detail}</p>
                      <p className="mt-2 font-mono text-[10px] text-[var(--ink-3)]">
                        {e.sources.length} {e.sources.length === 1 ? "fuente" : "fuentes"} ·{" "}
                        {e.topics.map((t) => TOPIC_LABEL[t]).join(" · ")}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
