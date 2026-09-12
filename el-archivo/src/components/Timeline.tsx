import Link from "next/link";
import type { ActivityEvent } from "@/lib/types";
import { ACTIVITY_KIND, fmtDate } from "@/lib/format";
import { Avatar } from "./cards";
import { Label } from "./primitives";

/** Feed de actividad. Distingue si el movimiento lo hizo el archivo o la comunidad. */
export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="stack-line border-t">
      {events.map((e) => {
        const archive = e.layer === "ARCHIVO";
        return (
          <li key={e.id}>
            <Link
              href={e.href}
              className="group grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 py-3.5 sm:grid-cols-[92px_auto_1fr_auto] sm:gap-x-5"
            >
              <time
                dateTime={e.at}
                className="hidden pt-1 font-mono text-[10px] tabular-nums text-[var(--ink-3)] sm:block"
              >
                {fmtDate(e.at)}
              </time>
              {e.actor.startsWith("@") ? (
                <Avatar handle={e.actor} size={22} />
              ) : (
                <span
                  className="mt-[2px] inline-flex h-[22px] w-[22px] items-center justify-center bg-[var(--ink)] font-mono text-[9px] text-[var(--paper)]"
                  aria-hidden
                >
                  ED
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[13px] leading-snug text-[var(--ink-2)] group-hover:text-[var(--ink)]">
                  <span className="font-mono text-[12px]">{e.actor}</span>{" "}
                  <span className="text-[var(--ink-3)]">{e.text}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.14em]"
                    style={{ color: archive ? "var(--ink-3)" : "var(--open)" }}
                  >
                    {archive ? "⧉ archivo" : "❝ comunidad"}
                  </span>
                  <Label className="sm:hidden">{fmtDate(e.at)}</Label>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    {ACTIVITY_KIND[e.kind]}
                  </span>
                </div>
              </div>
              <span
                className="hidden self-center font-mono text-[10px] text-[var(--ink-3)] transition-colors group-hover:text-[var(--red)] sm:block"
                aria-hidden
              >
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
