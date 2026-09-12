import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmissions, getUser, getUsers, getCorrections } from "@/lib/data";
import { reputationTier, REPUTATION_RULES } from "@/lib/evidence";
import { fmtDate } from "@/lib/format";
import { Avatar, CorrectionCard, SubmissionCard } from "@/components/cards";
import { Field, Label, LayerTag, Notice } from "@/components/primitives";

type Params = { params: Promise<{ user: string }> };

export async function generateStaticParams() {
  return (await getUsers()).map((u) => ({ user: u.handle.replace("@", "") }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { user } = await params;
  const u = await getUser(user);
  return { title: u ? `Perfil ${u.handle}` : "Perfil no encontrado", robots: { index: false } };
}

export default async function PerfilPage({ params }: Params) {
  const { user } = await params;
  const u = await getUser(user);
  if (!u) notFound();

  const subs = (await getSubmissions()).filter((s) => s.by === u.handle);
  const cors = (await getCorrections()).filter((c) => c.by === u.handle);
  const t = reputationTier(u.reputation);

  return (
    <>
      <header className="border-b bg-[var(--paper)]">
        <div className="wrap py-8 sm:py-12">
          <nav className="mb-8" aria-label="Miga de pan">
            <Link
              href="/comunidad"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              ← Comunidad
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-5">
            <Avatar handle={u.handle} size={64} />
            <div>
              <h1 className="display text-[clamp(1.6rem,4vw,2.6rem)]">{u.handle}</h1>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: t.color }}>
                {u.role} · {t.label} · desde {fmtDate(u.joinedAt)}
              </p>
            </div>
            <div className="ml-auto text-right">
              <div className="num text-[clamp(2.2rem,6vw,3.5rem)]" style={{ color: t.color }}>
                {u.reputation}
              </div>
              <Label className="mt-1 block">Reputación documental</Label>
            </div>
          </div>

          <p className="mt-6 max-w-read text-[14px] leading-[1.7] text-[var(--ink-2)]">{u.bio}</p>

          <div className="mt-8">
            <LayerTag layer="COMUNIDAD" />
          </div>
        </div>
      </header>

      <div className="wrap grid gap-12 py-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16 sm:py-14">
        <div className="space-y-12">
          <section aria-labelledby="p-aport">
            <div className="mb-5 flex items-end justify-between gap-4 border-b pb-3">
              <h2 id="p-aport" className="headline text-[clamp(1rem,2.2vw,1.35rem)] uppercase">
                Aportaciones
              </h2>
              <Label>{subs.length}</Label>
            </div>
            {subs.length ? (
              <div className="space-y-4">
                {subs.map((s) => (
                  <SubmissionCard key={s.id} s={s} />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--ink-3)]">Sin aportaciones registradas.</p>
            )}
          </section>

          {cors.length ? (
            <section aria-labelledby="p-cor">
              <div className="mb-5 flex items-end justify-between gap-4 border-b pb-3">
                <h2 id="p-cor" className="headline text-[clamp(1rem,2.2vw,1.35rem)] uppercase">
                  Correcciones propuestas
                </h2>
                <Label>{cors.length}</Label>
              </div>
              <div className="space-y-4">
                {cors.map((c) => (
                  <CorrectionCard key={c.id} c={c} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <Label tone="ink">Historial</Label>
            <dl className="mt-3 stack-line border-t">
              <Field k="Aportaciones" v={String(u.stats.submissions)} />
              <Field k="Fuentes aceptadas" v={String(u.stats.acceptedSources)} />
              <Field k="Debates" v={String(u.stats.debates)} />
              <Field k="Correcciones aceptadas" v={String(u.stats.acceptedCorrections)} />
            </dl>
          </div>

          <div className="card p-5">
            <Label tone="ink">Cómo se calcula la reputación</Label>
            <ul className="mt-3 stack-line border-t">
              {REPUTATION_RULES.up.slice(0, 3).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-[12px] text-[var(--ink-2)]">{k}</span>
                  <span className="font-mono text-[11px] text-[var(--ok)]">{v}</span>
                </li>
              ))}
              {REPUTATION_RULES.down.slice(0, 2).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-[12px] text-[var(--ink-2)]">{k}</span>
                  <span className="font-mono text-[11px] text-[var(--red)]">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <Notice kind="info" title="Sin karma político">
            <p>
              La reputación no sube por defender una postura ni baja por criticarla. Sube por traer
              material que resiste la comprobación, venga en la dirección que venga.
            </p>
          </Notice>
        </aside>
      </div>
    </>
  );
}
