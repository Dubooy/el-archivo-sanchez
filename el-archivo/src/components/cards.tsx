import Link from "next/link";
import type {
  Comment,
  Contradiction,
  Correction,
  Dossier,
  PoliticalPromise,
  Source,
  Statement,
  Submission,
  User,
  VideoRecord,
  ViralQuote,
} from "@/lib/types";
import {
  fileNo,
  fmtDate,
  fmtDuration,
  fmtNumber,
  fmtTs,
  SUBMISSION_KIND,
  STANCE_LABEL,
  TOPIC_LABEL,
} from "@/lib/format";
import { EVIDENCE, reputationTier } from "@/lib/evidence";
import { Label } from "./primitives";
import { EvidenceBadge, PromiseBadge, ReviewBadge, TierBadge, ViralBadge } from "./badges";

/* ============================================================
   TARJETAS
   Las del ARCHIVO van sobre papel blanco con filetes finos.
   Las de COMUNIDAD van sobre gris, con esquina redondeada y avatar.
   La diferencia es deliberada y no se debe suavizar.
   ============================================================ */

export function StatementCard({ s }: { s: Statement }) {
  return (
    <Link href={`/declaraciones/${s.id}`} className="card card-hover group block p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Label tone="red">{fmtDate(s.date)}</Label>
        <span className="h-px w-5 bg-[var(--line-2)]" aria-hidden />
        <Label>{s.place}</Label>
      </div>

      {/* La cita va en serif: es material de archivo, no interfaz. */}
      <blockquote className="mt-4 border-l-2 border-[var(--red)] pl-4">
        <p className="font-serif text-[15px] leading-[1.6] text-[var(--ink)]">{s.text}</p>
      </blockquote>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div className="flex flex-wrap gap-1.5">
          {s.topics.map((t) => (
            <span key={t} className="chip pointer-events-none">
              {TOPIC_LABEL[t]}
            </span>
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] transition-colors group-hover:text-[var(--red)]">
          {s.video ? `Vídeo ${fmtTs(s.videoTimestamp)} · ` : ""}
          Abrir →
        </span>
      </div>
    </Link>
  );
}

/* La tarjeta de expediente vive en su propio archivo porque necesita
   estado en el cliente para el acordeón de móvil. Se reexporta aquí
   para que todo el proyecto la siga importando desde "@/components/cards". */
export { DossierCard } from "./DossierCard";

export function PromiseCard({ p }: { p: PoliticalPromise }) {
  return (
    <article id={p.id} className="card scroll-mt-28 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Label tone="red">{fmtDate(p.date)}</Label>
          {p.deadline ? (
            <Label>Plazo anunciado: {fmtDate(p.deadline)}</Label>
          ) : (
            <Label tone="warn">Sin plazo anunciado</Label>
          )}
        </div>
      </div>

      <p className="mt-4 font-serif text-[15px] leading-[1.6] text-[var(--ink)]">{p.text}</p>

      <dl className="mt-5 space-y-4 border-t pt-4">
        <div>
          <dt className="label">Objetivo medible</dt>
          <dd className="mt-1.5 text-[13px] leading-[1.7] text-[var(--ink-2)]">{p.objective}</dd>
        </div>
        <div>
          <dt className="label">Estado y por qué</dt>
          <dd className="mt-2 space-y-2.5">
            <PromiseBadge state={p.state} />
            <p className="text-[12px] leading-[1.7] text-[var(--ink-3)]">{p.stateRationale}</p>
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div className="flex flex-wrap gap-1.5">
          {p.topics.map((t) => (
            <span key={t} className="chip pointer-events-none">
              {TOPIC_LABEL[t]}
            </span>
          ))}
        </div>
        <Label>
          {p.sources.length} fuentes · revisado {fmtDate(p.lastReviewed)}
        </Label>
      </div>
    </article>
  );
}

export function SourceCard({ s }: { s: Source }) {
  return (
    <article id={s.id} className="card scroll-mt-28 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <TierBadge tier={s.tier} />
      </div>
      <h4 className="mt-3 text-[13px] font-semibold leading-snug text-[var(--ink)]">{s.title}</h4>
      <p className="mt-2 text-[12px] leading-[1.6] text-[var(--ink-3)]">{s.summary}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <span className="truncate font-mono text-[10px] text-[var(--ink-3)]">
          {s.author} · {fmtDate(s.publishedAt)}
        </span>
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-2)] underline-offset-4 hover:text-[var(--red)] hover:underline"
        >
          Abrir ↗
        </a>
      </div>
      {s.contributedBy ? (
        <p className="mt-3 border-t pt-3 font-mono text-[10px] text-[var(--ink-3)]">
          Aportada por <span className="text-[var(--ink-2)]">{s.contributedBy}</span> y aceptada por
          moderación
        </p>
      ) : null}
    </article>
  );
}

export function VideoCard({ v }: { v: VideoRecord }) {
  return (
    <article className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label tone="red">{v.platform}</Label>
        <Label>{fmtDate(v.date)}</Label>
      </div>
      <h4 className="mt-3 text-[13px] font-semibold leading-snug">{v.title}</h4>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Label>{fmtDuration(v.duration)}</Label>
        {v.transcriptAvailable ? <Label>Con transcripción</Label> : <Label>Sin transcripción</Label>}
        {!v.embeddable ? <Label tone="warn">No incrustable</Label> : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
        <ReviewBadge state={v.reviewState} />
        <a
          href={v.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-2)] hover:text-[var(--red)]"
        >
          Ver original ↗
        </a>
      </div>
      {v.contributedBy ? (
        <p className="mt-3 font-mono text-[10px] text-[var(--ink-3)]">
          Aportado por {v.contributedBy}
        </p>
      ) : null}
    </article>
  );
}

export function ViralCard({ v }: { v: ViralQuote }) {
  return (
    <article id={v.id} className="card scroll-mt-28 p-5 sm:p-7">
      <div className="grid gap-7 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Label tone="warn">Internet dice</Label>
          </div>
          <blockquote className="mt-4 border-l-4 border-[var(--warn)] pl-5">
            <p className="font-serif text-[clamp(1rem,2.2vw,1.35rem)] leading-[1.5] text-[var(--ink)]">
              {v.circulating}
            </p>
          </blockquote>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
            {fmtNumber(v.shares)} apariciones documentadas en circulación
          </p>
        </div>

        <div className="border-t pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <Label>Resultado</Label>
          <div className="mt-2">
            <ViralBadge result={v.result} size="lg" />
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <Label>Qué consta exactamente</Label>
              <p className="mt-1.5 text-[13px] leading-[1.7] text-[var(--ink-2)]">
                {v.whatIsDocumented}
              </p>
            </div>
            <div>
              <Label>Explicación</Label>
              <p className="mt-1.5 text-[13px] leading-[1.7] text-[var(--ink-3)]">{v.explanation}</p>
            </div>
          </div>

          {v.video ? (
            <p className="mt-5 border-t pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
              Material original · {fmtTs(v.videoTimestamp)} · {fmtDate(v.date)}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ContradictionCard({ c }: { c: Contradiction }) {
  return (
    <article id={c.id} className="card scroll-mt-28 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label tone="red">Contradicción {fileNo(c.id)}</Label>
          <h3 className="headline mt-2 text-[clamp(1.05rem,2.2vw,1.5rem)]">{c.title}</h3>
        </div>
      </div>

      {/* DIJO → OCURRIÓ: dos columnas unidas por la línea temporal */}
      <div className="mt-7">
        <div className="mb-3 hidden grid-cols-[1fr_auto_1fr] gap-4 sm:grid">
          <Label tone="red" className="text-right">
            Lo que dijo
          </Label>
          <span className="w-8" />
          <Label>Lo que ocurrió</Label>
        </div>

        <ol className="relative">
          {/* Raíl central */}
          <span
            className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px origin-top animate-draw-line bg-[var(--line-2)] sm:left-1/2 sm:-translate-x-1/2"
            aria-hidden
          />
          {c.steps.map((s, i) => {
            const dijo = s.side === "DIJO";
            return (
              <li key={i} className="relative pb-6 last:pb-0">
                <div className="grid gap-3 pl-8 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:pl-0">
                  <div className={dijo ? "sm:text-right" : "sm:col-start-3"}>
                    <div
                      className={`inline-block max-w-full border p-4 text-left ${
                        dijo ? "bg-[var(--red-wash)]" : "bg-[var(--panel-2)]"
                      }`}
                      style={{ borderColor: dijo ? "var(--red)" : "var(--line-2)" }}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Label tone={dijo ? "red" : "mute"}>{s.at}</Label>
                        <Label>{dijo ? "Declaración" : "Hecho documentado"}</Label>
                      </div>
                      <p className="mt-2 font-serif text-[13px] leading-[1.6] text-[var(--ink)]">
                        {s.label}
                      </p>
                      <p className="mt-2 text-[12px] leading-[1.6] text-[var(--ink-3)]">{s.detail}</p>
                      <p className="mt-2 font-mono text-[10px] text-[var(--ink-3)]">
                        {s.sources.length} {s.sources.length === 1 ? "fuente" : "fuentes"}
                      </p>
                    </div>
                  </div>
                  <span
                    className="absolute left-0 top-3 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 bg-[var(--paper)] sm:static sm:col-start-2 sm:mt-3 sm:self-start"
                    style={{ borderColor: dijo ? "var(--red)" : "var(--line-2)" }}
                    aria-hidden
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 border-t pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <Label tone="red">Conclusión editorial</Label>
          <EvidenceBadge level={c.evidence} size="sm" />
        </div>
        <p className="doc mt-3 max-w-read">{c.conclusion}</p>

        <details className="mt-4">
          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-[var(--ink)]">
            Limitaciones declaradas ({c.limitations.length})
          </summary>
          <ul className="mt-3 space-y-2 border-l-2 border-[var(--warn)] pl-4">
            {c.limitations.map((l, i) => (
              <li key={i} className="text-[12px] leading-[1.65] text-[var(--ink-3)]">
                {l}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </article>
  );
}

/* ---------------------- CAPA COMUNIDAD ---------------------------- */

export function Avatar({ handle, size = 28 }: { handle: string; size?: number }) {
  const n = handle.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = n % 360;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold"
      style={{
        width: size,
        height: size,
        background: `hsl(${hue} 35% 88%)`,
        color: `hsl(${hue} 45% 28%)`,
      }}
      aria-hidden
    >
      {handle.replace("@", "").slice(0, 2).toUpperCase()}
    </span>
  );
}

export function CommentCard({ c }: { c: Comment }) {
  const s = STANCE_LABEL[c.stance];
  return (
    <article className="card-community p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar handle={c.by} />
          <Link href={`/perfil/${c.by.replace("@", "")}`} className="font-mono text-[11px] hover:underline">
            {c.by}
          </Link>
          <Label>{fmtDate(c.at)}</Label>
        </div>
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ color: s.color }}
        >
          <span aria-hidden>{s.icon}</span>
          {s.label}
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-[1.7] text-[var(--ink-2)]">{c.text}</p>
      {c.sourceUrl ? (
        <a
          href={c.sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--open)] underline-offset-4 hover:underline"
        >
          Fuente aportada ↗
        </a>
      ) : null}
      <div className="mt-3 flex items-center gap-4 border-t pt-3">
        <span className="font-mono text-[10px] text-[var(--ink-3)]">▲ {c.upvotes} útil</span>
      </div>
    </article>
  );
}

export function SubmissionCard({ s, showConclusion = true }: { s: Submission; showConclusion?: boolean }) {
  const k = SUBMISSION_KIND[s.kind];
  return (
    <article className="card-community p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[15px]" aria-hidden>
            {k.icon}
          </span>
          <Label tone="ink">{k.label}</Label>
          <Avatar handle={s.by} size={22} />
          <Link href={`/perfil/${s.by.replace("@", "")}`} className="font-mono text-[11px] hover:underline">
            {s.by}
          </Link>
          <Label>{fmtDate(s.at)}</Label>
        </div>
        <ReviewBadge state={s.reviewState} />
      </div>

      <h4 className="mt-3 text-[13px] font-semibold leading-snug">{s.title}</h4>
      <p className="mt-2 text-[12px] leading-[1.65] text-[var(--ink-3)]">{s.description}</p>

      <dl className="mt-4 space-y-3 border-t pt-3">
        <div>
          <dt className="label">Por qué lo considera relevante</dt>
          <dd className="mt-1 text-[12px] leading-[1.65] text-[var(--ink-2)]">{s.whyRelevant}</dd>
        </div>
        {showConclusion && s.userConclusion ? (
          <div className="border-l-2 border-[var(--line-2)] pl-3">
            <dt className="label">❝ Opinión del usuario — no forma parte del archivo</dt>
            <dd className="mt-1 text-[12px] italic leading-[1.65] text-[var(--ink-3)]">
              {s.userConclusion}
            </dd>
          </div>
        ) : null}
      </dl>

      {s.moderatorNote ? (
        <p className="mt-4 border-t pt-3 font-mono text-[10px] leading-[1.7] text-[var(--ink-3)]">
          Moderación: {s.moderatorNote}
        </p>
      ) : null}
    </article>
  );
}

export function CorrectionCard({ c }: { c: Correction }) {
  return (
    <article className="card-community p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar handle={c.by} size={22} />
          <span className="font-mono text-[11px]">{c.by}</span>
          <Label>{fmtDate(c.at)}</Label>
        </div>
        <ReviewBadge state={c.reviewState} />
      </div>
      <p className="mt-3 text-[12px] text-[var(--ink-3)]">Sobre: {c.targetLabel}</p>
      <dl className="mt-3 space-y-2">
        <div>
          <dt className="label">Qué está mal</dt>
          <dd className="mt-1 text-[13px] leading-[1.65] text-[var(--ink-2)]">{c.whatIsWrong}</dd>
        </div>
        <div>
          <dt className="label">Por qué</dt>
          <dd className="mt-1 text-[13px] leading-[1.65] text-[var(--ink-2)]">{c.why}</dd>
        </div>
      </dl>
      {c.resolution ? (
        <p className="mt-3 border-t pt-3 font-mono text-[10px] leading-[1.7] text-[var(--ink-3)]">
          {c.resolution}
        </p>
      ) : null}
    </article>
  );
}

export function UserCard({ u }: { u: User }) {
  const t = reputationTier(u.reputation);
  return (
    <Link href={`/perfil/${u.handle.replace("@", "")}`} className="card-community block p-4 transition-colors hover:border-[var(--line-2)]">
      <div className="flex items-center gap-3">
        <Avatar handle={u.handle} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[12px]">{u.handle}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: t.color }}>
            {u.role} · {t.label}
          </p>
        </div>
        <span className="num text-xl">{u.reputation}</span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 border-t pt-3 text-center">
        {[
          [u.stats.submissions, "aport."],
          [u.stats.acceptedSources, "fuentes"],
          [u.stats.debates, "debates"],
          [u.stats.acceptedCorrections, "correc."],
        ].map(([v, l]) => (
          <div key={String(l)}>
            <div className="num text-[15px]">{v}</div>
            <Label className="text-[9px]">{l}</Label>
          </div>
        ))}
      </div>
    </Link>
  );
}
