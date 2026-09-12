import { EVIDENCE, PROMISE, REVIEW, TIER } from "@/lib/evidence";
import { VIRAL_RESULT, PROCEDURAL_LABEL } from "@/lib/format";
import type { EvidenceLevel, PromiseState, ReviewState, SourceTier } from "@/lib/types";

/* ============================================================
   ETIQUETAS DE ESTADO
   Regla del proyecto: ningún estado se muestra sin poder consultar
   qué significa. Los que ocupan una ficha entera lo llevan escrito;
   los de listado lo llevan en el `title`.
   ============================================================ */

function Pill({
  label,
  color,
  size = "md",
  title,
  dot = true,
}: {
  label: string;
  color: string;
  size?: "sm" | "md" | "lg";
  title?: string;
  dot?: boolean;
}) {
  const pad = size === "lg" ? "px-3.5 py-2" : size === "sm" ? "px-2 py-[3px]" : "px-2.5 py-1.5";
  const fs = size === "lg" ? "text-[12px]" : "text-[10px]";
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 border font-mono uppercase tracking-[0.12em] ${pad} ${fs}`}
      style={{ borderColor: color, color, background: `color-mix(in srgb, ${color} 8%, transparent)` }}
      title={title}
    >
      {dot ? (
        <span className="inline-block h-[6px] w-[6px] rounded-full" style={{ background: color }} aria-hidden />
      ) : null}
      {label}
    </span>
  );
}

export function EvidenceBadge({
  level,
  size = "md",
  explain = false,
}: {
  level: EvidenceLevel;
  size?: "sm" | "md" | "lg";
  explain?: boolean;
}) {
  const m = EVIDENCE[level];
  return (
    <span className="inline-flex flex-col gap-2">
      <Pill label={m.label} color={m.color} size={size} title={m.meaning} />
      {explain ? (
        <span className="max-w-lg space-y-1.5 text-[12px] leading-[1.65] text-[var(--ink-3)]">
          <span className="block">{m.meaning}</span>
          <span className="block font-medium text-[var(--ink-2)]">{m.notMeaning}</span>
        </span>
      ) : null}
    </span>
  );
}

export function PromiseBadge({
  state,
  size = "md",
  explain = false,
}: {
  state: PromiseState;
  size?: "sm" | "md" | "lg";
  explain?: boolean;
}) {
  const m = PROMISE[state];
  return (
    <span className="inline-flex flex-col gap-2">
      <Pill label={`${m.icon} ${m.label}`} color={m.color} size={size} title={m.rule} dot={false} />
      {explain ? (
        <span className="max-w-lg text-[12px] leading-[1.65] text-[var(--ink-3)]">{m.rule}</span>
      ) : null}
    </span>
  );
}

export function ReviewBadge({ state, size = "sm" }: { state: ReviewState; size?: "sm" | "md" }) {
  const m = REVIEW[state];
  return <Pill label={m.label} color={m.color} size={size} title={m.meaning} />;
}

export function ViralBadge({ result, size = "md" }: { result: string; size?: "sm" | "md" | "lg" }) {
  const m = VIRAL_RESULT[result];
  return <Pill label={`${m.icon} ${m.label}`} color={m.color} size={size} title={m.meaning} dot={false} />;
}

export function ProceduralBadge({ status }: { status: string }) {
  const firm = status === "CONDENADO_FIRME";
  const color = firm ? "var(--red)" : status === "ABSUELTO" || status === "ARCHIVADO" ? "var(--ok)" : "var(--warn)";
  return (
    <Pill
      label={PROCEDURAL_LABEL[status] ?? status}
      color={color}
      title="Terminología procesal estricta. Solo una sentencia condenatoria firme acredita responsabilidad penal."
    />
  );
}

/** Nivel documental de una fuente, con su puesto en la jerarquía. */
export function TierBadge({ tier }: { tier: SourceTier }) {
  const m = TIER[tier];
  return (
    <span
      className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]"
      title={m.note}
    >
      <span
        className="inline-flex h-[18px] w-[18px] items-center justify-center border text-[9px] font-medium"
        style={{ borderColor: "var(--line-2)" }}
      >
        {m.rank}
      </span>
      {m.label}
    </span>
  );
}
