import type { Metadata } from "next";
import { getStats, getViralQuotes } from "@/lib/data";
import { VIRAL_RESULT, fmtNumber } from "@/lib/format";
import { LayerTag, Notice, PageHead } from "@/components/primitives";
import { ViralCard } from "@/components/cards";
import { ViralChart } from "@/components/charts";

export const metadata: Metadata = {
  title: "¿Realmente lo dijo?",
  description:
    "Frases que circulan por redes, contrastadas con su material original: documentada, parcial, sin evidencia o sacada de contexto.",
};

export default async function RealmenteLoDijoPage() {
  const rows = await getViralQuotes();
  const stats = await getStats();
  const noSource = stats.viralCounts.SIN_EVIDENCIA ?? 0;

  return (
    <>
      <PageHead
        eyebrow="Contrastar"
        title="¿Realmente lo dijo?"
        lede="Internet atribuye frases con una seguridad admirable y una documentación variable. Aquí se busca el material original de cada una. A veces aparece tal cual, a veces aparece cambiada, a veces no aparece — y a veces existe pero circula recortada hasta significar lo contrario."
        meta={[
          ["Frases contrastadas", String(rows.length)],
          ["Documentadas", String(stats.viralCounts.DOCUMENTADA ?? 0)],
          ["Sin fuente localizada", String(noSource)],
          ["Contexto engañoso", String(stats.viralCounts.CONTEXTO_ENGANOSO ?? 0)],
        ]}
      >
        <div className="mt-8">
          <LayerTag layer="VERIFICACION" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        <div className="mb-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <Notice kind="warn" title="«Sin evidencia» no significa «es mentira»">
              <p>
                Significa que hemos buscado el material original y no lo hemos encontrado. Puede que
                exista y no demos con él, que la frase se deformara al repetirse, o que nunca se
                dijera. Las tres cosas caben en ese estado, y por eso el estado no afirma ninguna.
              </p>
            </Notice>
            <Notice kind="info" title="El caso más interesante es el cuarto">
              <p>
                <strong>Contexto engañoso</strong>: la cita es literal, la fecha es correcta, el
                vídeo existe — y aun así circula significando lo contrario de lo que significó.
                Recortar material auténtico es la forma más eficaz de desinformar, precisamente
                porque resiste una comprobación superficial.
              </p>
            </Notice>
          </div>
          <ViralChart counts={stats.viralCounts} />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(VIRAL_RESULT).map(([k, m]) => (
            <span
              key={k}
              className="chip pointer-events-none"
              style={{ borderColor: m.color, color: m.color }}
              title={m.meaning}
            >
              {m.icon} {m.label} <span className="opacity-60">{stats.viralCounts[k] ?? 0}</span>
            </span>
          ))}
        </div>

        <div className="space-y-4">
          {rows.map((v) => (
            <ViralCard key={v.id} v={v} />
          ))}
        </div>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
          {fmtNumber(rows.reduce((a, r) => a + r.shares, 0))} apariciones en circulación documentadas
        </p>
      </div>
    </>
  );
}
