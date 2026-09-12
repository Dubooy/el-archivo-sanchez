import { EVIDENCE, PROMISE, TIER } from "@/lib/evidence";
import { fmtNumber, TOPIC_LABEL, VIRAL_RESULT } from "@/lib/format";
import { Label } from "./primitives";

/* ============================================================
   GRÁFICOS
   SVG y CSS, renderizados en el servidor. Sin librería de gráficos.

   Reglas: un solo eje; serie única en una sola tonalidad; los
   colores de estado están reservados y SIEMPRE llevan su etiqueta
   de texto al lado; y todo gráfico ofrece su tabla equivalente.
   ============================================================ */

function DataTable({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <details className="mt-4 border-t pt-3">
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-[var(--ink)]">
        Ver los datos en tabla
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[240px] border-collapse text-left">
          <thead>
            <tr>
              <th scope="col" className="label border-b pb-2 font-normal">{head[0]}</th>
              <th scope="col" className="label border-b pb-2 text-right font-normal">{head[1]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td className="border-b py-1.5 font-mono text-[11px] text-[var(--ink-2)]">{k}</td>
                <td className="border-b py-1.5 text-right font-mono text-[11px] tabular-nums">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Frame({
  title,
  note,
  children,
  table,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  table: React.ReactNode;
}) {
  return (
    <figure className="card m-0 p-5 sm:p-6">
      <figcaption>
        <h3 className="text-[13px] font-semibold tracking-tight">{title}</h3>
        {note ? <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--ink-3)]">{note}</p> : null}
      </figcaption>
      <div className="mt-5">{children}</div>
      {table}
    </figure>
  );
}

/** Barras verticales, una sola serie. */
export function ColumnChart({
  title,
  note,
  data,
}: {
  title: string;
  note?: string;
  data: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Frame
      title={title}
      note={note}
      table={<DataTable head={["Periodo", "Total"]} rows={data.map((d) => [d.label, fmtNumber(d.value)])} />}
    >
      {/* La fila no lleva items-end: con él las columnas se encogen a su
          contenido, la altura deja de ser definida y el height:% se anula. */}
      <div className="flex h-[170px] gap-[2px]">
        {data.map((d, i) => (
          <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="font-mono text-[10px] tabular-nums text-[var(--ink-3)]">{d.value}</span>
            <div
              className="w-full origin-bottom animate-bar-rise bg-[var(--ink-2)] transition-colors group-hover:bg-[var(--red)]"
              style={{ height: `${Math.max(2, (d.value / max) * 100)}%`, animationDelay: `${i * 50}ms` }}
              title={`${d.label}: ${fmtNumber(d.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[2px] border-t pt-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center font-mono text-[10px] text-[var(--ink-3)]">
            {d.label}
          </span>
        ))}
      </div>
    </Frame>
  );
}

/** Ranking horizontal, una sola serie. */
export function RankChart({
  title,
  note,
  data,
  labelMap,
}: {
  title: string;
  note?: string;
  data: { key: string; count: number }[];
  labelMap?: Record<string, string>;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const lbl = (k: string) => labelMap?.[k] ?? k;
  return (
    <Frame
      title={title}
      note={note}
      table={<DataTable head={["Categoría", "Registros"]} rows={data.map((d) => [lbl(d.key), fmtNumber(d.count)])} />}
    >
      <ul className="space-y-2.5">
        {data.map((d, i) => (
          <li key={d.key} className="group grid grid-cols-[1fr_auto] items-center gap-3">
            <div>
              <span className="mb-1 block text-[12px] text-[var(--ink-2)]">{lbl(d.key)}</span>
              <div className="h-[6px] w-full bg-[var(--line)]">
                <div
                  className="h-full origin-left animate-bar-grow bg-[var(--ink-2)] transition-colors group-hover:bg-[var(--red)]"
                  style={{ width: `${(d.count / max) * 100}%`, animationDelay: `${i * 35}ms` }}
                  title={`${lbl(d.key)}: ${fmtNumber(d.count)}`}
                />
              </div>
            </div>
            <span className="num w-8 text-right text-[15px]">{d.count}</span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/** Distribución por estado. Color reservado + etiqueta siempre visible. */
export function StateChart({
  title,
  note,
  counts,
  meta,
  order,
}: {
  title: string;
  note?: string;
  counts: Record<string, number>;
  meta: Record<string, { label: string; color: string; explain?: string }>;
  order: string[];
}) {
  const rows = order.map((k) => ({ k, n: counts[k] ?? 0 })).filter((r) => r.n > 0);
  const total = rows.reduce((a, r) => a + r.n, 0) || 1;

  return (
    <Frame
      title={title}
      note={note}
      table={<DataTable head={["Estado", "Registros"]} rows={rows.map((r) => [meta[r.k].label, fmtNumber(r.n)])} />}
    >
      <div className="flex h-6 w-full gap-[2px]">
        {rows.map((r) => (
          <div
            key={r.k}
            style={{ width: `${(r.n / total) * 100}%`, background: meta[r.k].color, opacity: 0.9 }}
            title={`${meta[r.k].label}: ${r.n}`}
          />
        ))}
      </div>
      <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.k} className="flex items-start gap-2.5">
            <span className="mt-[5px] h-[8px] w-[8px] shrink-0" style={{ background: meta[r.k].color }} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12px] font-medium">{meta[r.k].label}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--ink-3)]">
                  {r.n} · {Math.round((r.n / total) * 100)}%
                </span>
              </div>
              {meta[r.k].explain ? (
                <p className="mt-1 text-[11px] leading-[1.55] text-[var(--ink-3)]">{meta[r.k].explain}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/* --- Envoltorios listos para las páginas -------------------------- */

export const EvidenceChart = ({ counts }: { counts: Record<string, number> }) => (
  <StateChart
    title="Nivel de evidencia de los expedientes"
    note="El color nunca es la única señal: cada estado va con su etiqueta y su definición."
    counts={counts}
    order={[
      "RESPALDADO",
      "PARCIALMENTE_RESPALDADO",
      "EVIDENCIA_INSUFICIENTE",
      "CONTRADICCION_DOCUMENTADA",
      "NO_VERIFICABLE",
      "EN_INVESTIGACION",
    ]}
    meta={Object.fromEntries(
      Object.entries(EVIDENCE).map(([k, v]) => [k, { label: v.label, color: v.color, explain: v.meaning }]),
    )}
  />
);

export const PromiseChart = ({ counts }: { counts: Record<string, number> }) => (
  <StateChart
    title="Estado de las promesas"
    note="«No cumplida» exige plazo vencido Y documentación del resultado. El paso del tiempo por sí solo no clasifica nada."
    counts={counts}
    order={["CUMPLIDA", "EN_PROCESO", "NO_CUMPLIDA", "NO_EVALUABLE"]}
    meta={Object.fromEntries(
      Object.entries(PROMISE).map(([k, v]) => [k, { label: v.label, color: v.color, explain: v.rule }]),
    )}
  />
);

export const ViralChart = ({ counts }: { counts: Record<string, number> }) => (
  <StateChart
    title="Frases virales contrastadas"
    note="Lo que ocurre cuando se busca la fuente primaria de una frase que circula."
    counts={counts}
    order={["DOCUMENTADA", "PARCIAL", "SIN_EVIDENCIA", "CONTEXTO_ENGANOSO"]}
    meta={Object.fromEntries(
      Object.entries(VIRAL_RESULT).map(([k, v]) => [k, { label: v.label, color: v.color, explain: v.meaning }]),
    )}
  />
);

export const TopicChart = ({ data }: { data: { key: string; count: number }[] }) => (
  <RankChart
    title="Temas más documentados"
    note="Describe el archivo, no la realidad: si un tema aparece mucho es porque hemos archivado mucho de ese tema."
    data={data}
    labelMap={TOPIC_LABEL}
  />
);

export const TierChart = ({ data }: { data: { key: string; count: number }[] }) => (
  <RankChart
    title="Fuentes por nivel documental"
    note="Ordenadas por jerarquía: un documento oficial y un tuit no pesan lo mismo, y el archivo lo dice."
    data={[...data].sort((a, b) => TIER[a.key as keyof typeof TIER].rank - TIER[b.key as keyof typeof TIER].rank)}
    labelMap={Object.fromEntries(Object.entries(TIER).map(([k, v]) => [k, v.label]))}
  />
);

/** Dos magnitudes que NO deben compararse: popularidad y evidencia (§38). */
export function DebateVsEvidence({
  rows,
}: {
  rows: { title: string; href: string; comments: number; votes: number; evidence: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.comments * 30 + r.votes));
  return (
    <Frame
      title="Lo más debatido"
      note="La barra mide conversación. La etiqueta mide evidencia. Son cosas distintas y por eso van separadas: un expediente puede ser viral y estar mal fundado."
      table={<DataTable head={["Expediente", "Interacciones"]} rows={rows.map((r) => [r.title.slice(0, 40), fmtNumber(r.comments * 30 + r.votes)])} />}
    >
      <ul className="space-y-4">
        {rows.map((r) => {
          const heat = r.comments * 30 + r.votes;
          const ev = EVIDENCE[r.evidence as keyof typeof EVIDENCE];
          return (
            <li key={r.href}>
              <a href={r.href} className="group block">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="line-clamp-1 max-w-[60ch] text-[12px] text-[var(--ink-2)] group-hover:text-[var(--ink)]">
                    {r.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-[10px] text-[var(--ink-3)]">◆ {r.comments} com.</span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.1em]"
                      style={{ color: ev.color }}
                      title={ev.meaning}
                    >
                      ⧉ {ev.label}
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-[5px] w-full bg-[var(--line)]">
                  <div
                    className="h-full origin-left animate-bar-grow bg-[var(--red)]"
                    style={{ width: `${(heat / max) * 100}%` }}
                  />
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 border-t pt-3 font-mono text-[10px] leading-relaxed text-[var(--ink-3)]">
        ◆ popularidad ≠ ⧉ evidencia
      </p>
    </Frame>
  );
}

export function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="num text-[clamp(1.4rem,3vw,2rem)]">{value}</div>
      <Label className="mt-1 block">{label}</Label>
    </div>
  );
}
