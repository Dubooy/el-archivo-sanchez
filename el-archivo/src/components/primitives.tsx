import Link from "next/link";
import type { ReactNode } from "react";
import type { Layer } from "@/lib/types";
import { LayerIcon } from "./Icons";

/* ============================================================
   PRIMITIVAS
   La pieza más importante de este archivo es <LayerTag>: es lo que
   hace que un lector distinga de un vistazo si lo que está leyendo
   es archivo, verificación u opinión de un usuario.
   ============================================================ */

export function Label({
  children,
  tone = "mute",
  className = "",
}: {
  children: ReactNode;
  tone?: "mute" | "ink" | "red" | "warn";
  className?: string;
}) {
  const c = {
    mute: "text-[var(--ink-3)]",
    ink: "text-[var(--ink-2)]",
    red: "text-[var(--red)]",
    warn: "text-[var(--warn)]",
  }[tone];
  return (
    <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${c} ${className}`}>
      {children}
    </span>
  );
}

/** La marca visual de las tres capas (§17). Nunca deben confundirse. */
export function LayerTag({ layer, className = "" }: { layer: Layer; className?: string }) {
  const m = {
    ARCHIVO: { text: "Archivo · hecho documentado", bg: "var(--ink)", fg: "var(--paper)" },
    VERIFICACION: { text: "Verificación · conclusión editorial", bg: "var(--red)", fg: "#fff" },
    COMUNIDAD: { text: "Comunidad · opinión de usuario", bg: "var(--panel-2)", fg: "var(--ink-2)" },
  }[layer];
  return (
    <span
      className={`layer-tag ${className}`}
      style={{
        background: m.bg,
        color: m.fg,
        border: layer === "COMUNIDAD" ? "1px solid var(--line-2)" : "1px solid transparent",
      }}
    >
      <LayerIcon layer={layer} />
      {m.text}
    </span>
  );
}

export function DemoTag({ className = "" }: { className?: string }) {
  void className;
  return null;
}

export function Hairline({ className = "" }: { className?: string }) {
  return <div className={`hairline ${className}`} role="presentation" />;
}

export function PageHead({
  eyebrow,
  title,
  lede,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  meta?: [string, string][];
  children?: ReactNode;
}) {
  return (
    <header className="border-b bg-[var(--paper)]">
      <div className="wrap py-10 sm:py-14">
        <div className="flex items-center gap-3">
          <Label tone="red">{eyebrow}</Label>
          <div className="h-px flex-1 bg-[var(--line)]" />
        </div>
        <h1 className="display mt-5 max-w-[16ch] text-[clamp(2.1rem,6.5vw,4.5rem)] animate-fade-up">
          {title}
        </h1>
        {lede ? <p className="doc mt-6 max-w-read">{lede}</p> : null}
        {meta?.length ? (
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd className="mt-1 font-mono text-[13px] text-[var(--ink)]">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
    </header>
  );
}

export function SectionHead({
  index,
  title,
  note,
  href,
  hrefLabel,
}: {
  index: string;
  title: string;
  note?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b pb-5">
      <div className="flex items-end gap-4 sm:gap-6">
        <span className="num select-none text-[clamp(2rem,5.5vw,3.5rem)] text-[var(--red)]" aria-hidden>
          {index}
        </span>
        <div className="pb-1">
          <h2 className="display text-[clamp(1.3rem,3.2vw,2.15rem)]">{title}</h2>
          {note ? (
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--ink-3)]">{note}</p>
          ) : null}
        </div>
      </div>
      {href ? (
        <Link href={href} className="btn shrink-0">
          {hrefLabel ?? "Ver todo"} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}

/** Bloque numerado de un expediente (01 — QUÉ SE DIJO, etc.). */
export function Block({
  n,
  title,
  sub,
  children,
}: {
  n: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t pt-6" aria-labelledby={`b-${n}`}>
      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="num text-[22px] text-[var(--red)]">{n}</span>
        <h3 id={`b-${n}`} className="headline text-[clamp(1rem,2.2vw,1.35rem)] uppercase">
          {title}
        </h3>
        {sub ? <span className="label">{sub}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function Empty({
  title = "Sin registros",
  body,
  icon = "∅",
}: {
  title?: string;
  body: string;
  icon?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="num text-4xl text-[var(--line-2)]" aria-hidden>
        {icon}
      </span>
      <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--ink-2)]">
        {title}
      </p>
      <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[var(--ink-3)]">{body}</p>
    </div>
  );
}

export function Notice({
  kind = "info",
  title,
  children,
}: {
  kind?: "info" | "warn" | "legal" | "community";
  title: string;
  children: ReactNode;
}) {
  const t = {
    info: { border: "var(--line-2)", color: "var(--ink-2)", mark: "i", bg: "var(--panel)" },
    warn: { border: "var(--warn)", color: "var(--warn)", mark: "!", bg: "var(--panel)" },
    legal: { border: "var(--red)", color: "var(--red)", mark: "§", bg: "var(--red-wash)" },
    community: { border: "var(--line-2)", color: "var(--ink-3)", mark: "❝", bg: "var(--panel-2)" },
  }[kind];

  return (
    <aside
      className="border px-5 py-4"
      style={{ borderColor: t.border, background: t.bg }}
      aria-label={title}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center border font-mono text-[9px] leading-none"
          style={{ borderColor: t.border, color: t.color }}
          aria-hidden
        >
          {t.mark}
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: t.color }}>
            {title}
          </p>
          <div className="mt-2 space-y-2.5 text-[13px] leading-[1.7] text-[var(--ink-2)]">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Field({ k, v, mono = true }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="py-3">
      <dt className="label">{k}</dt>
      <dd className={`mt-1.5 text-[13px] text-[var(--ink)] ${mono ? "font-mono" : "leading-relaxed"}`}>
        {v}
      </dd>
    </div>
  );
}

export function StatTile({
  value,
  label,
  sub,
  demo = false,
  accent = false,
  size = "lg",
}: {
  value: string;
  label: string;
  sub?: string;
  demo?: boolean;
  accent?: boolean;
  size?: "lg" | "md";
}) {
  void demo;
  const s = size === "md" ? "text-[clamp(1.85rem,4vw,3rem)]" : "text-[clamp(2.4rem,5.5vw,4.5rem)]";
  /* Cifra, rótulo y subtexto comparten eje central: la columna se lee de
     arriba abajo sin que el ojo tenga que saltar de un margen a otro. */
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-7 text-center">
      <div className="flex flex-col items-center gap-2">
        <Label className="max-w-[18ch] leading-relaxed">{label}</Label>
      </div>
      <div>
        <div className={`num ${s} ${accent ? "text-[var(--red)]" : "text-[var(--ink)]"}`}>{value}</div>
        {sub ? (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  );
}
