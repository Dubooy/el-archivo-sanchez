import type { Metadata } from "next";
import Link from "next/link";
import { getDecided, getQueue, getStats, getSubmissions } from "@/lib/data";
import { currentUser } from "@/lib/session";
import { MODERATION } from "@/lib/config";
import { Label, LayerTag, Notice, PageHead } from "@/components/primitives";
import { ModerationQueue } from "@/components/ModerationQueue";

/* La cola de moderación no se cachea: lo que espera decisión humana
   se ve en el momento, no cinco minutos después. Y además depende de
   quién mira, así que tampoco podría cachearse aunque quisiéramos. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moderación",
  description: "Cola de aportaciones pendientes de revisión.",
  robots: { index: false, follow: false },
};

const PUEDE_DECIDIR = ["MODERADOR", "EDITOR", "ADMIN"];

export default async function ModeracionPage() {
  const yo = await currentUser();
  const puedeDecidir = Boolean(yo && !yo.suspended && PUEDE_DECIDIR.includes(yo.role));

  // La página se enseña a cualquiera —enseñar cómo se modera es parte
  // de lo que hace creíble a la plataforma— pero solo quien tiene
  // papel de moderador recibe los datos y los botones. El servidor
  // vuelve a comprobarlo en cada acción: esto es la puerta visible,
  // no la cerradura.
  const queue = puedeDecidir ? await getQueue() : [];
  const historial = puedeDecidir ? await getDecided(20) : [];
  const all = await getSubmissions();
  const stats = await getStats();

  return (
    <>
      <PageHead
        eyebrow="Interno · Moderación"
        title="Cola de moderación"
        lede="Lo que la comunidad ha aportado y todavía no está en el archivo. Aceptar algo aquí es lo que lo convierte en parte de la plataforma; hasta entonces no existe públicamente."
        meta={[
          ["En cola", puedeDecidir ? String(queue.length) : "—"],
          ["Aportaciones totales", String(all.length)],
          ["Aceptadas", String(stats.acceptedSubmissions)],
          ["Política", MODERATION.preModeration ? "Premoderación" : "Posmoderación"],
        ]}
      >
        <div className="mt-8">
          <LayerTag layer="COMUNIDAD" />
        </div>
      </PageHead>

      <div className="wrap py-10 sm:py-14">
        <div className="mb-10 grid gap-4 lg:grid-cols-2">
          <Notice kind="legal" title="El criterio, en una línea">
            <p>
              Se acepta <strong>material comprobable</strong>. No se acepta una conclusión, por muy
              razonable que parezca. La diferencia práctica: «este vídeo del 14 de marzo, minuto
              8:42» se acepta; «esto demuestra que mintió» no, aunque venga en el mismo envío.
            </p>
          </Notice>
          <Notice kind="warn" title="Revisión reforzada">
            <p>
              Las aportaciones cuyo texto menciona responsabilidad penal —delito, condena,
              corrupción, malversación— se marcan automáticamente. No es censura: es que afirmar eso
              de una persona identificable exige una resolución judicial, y sin ella se pide
              reformular en términos de lo que consta.
            </p>
          </Notice>
        </div>

        {puedeDecidir ? (
          <ModerationQueue queue={queue} historial={historial} />
        ) : (
          <SinPermiso haySesion={Boolean(yo)} />
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

/** Lo que ve quien entra aquí sin papel de moderador. Se explica el
    proceso —eso es público a propósito— pero no se enseña ni un solo
    texto de la cola: son envíos sin comprobar sobre personas
    identificables, y hasta que se aceptan no los ve nadie más. */
function SinPermiso({ haySesion }: { haySesion: boolean }) {
  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8">
        <Label tone="ink">Zona restringida</Label>
        <h2 className="headline mt-3 text-[clamp(1.05rem,2.4vw,1.5rem)] uppercase">
          Esta cola solo la ve quien modera
        </h2>
        <p className="mt-3 max-w-read text-[13px] leading-[1.75] text-[var(--ink-2)]">
          No es por opacidad: lo que espera en la cola son afirmaciones todavía sin comprobar sobre
          personas vivas e identificables. Enseñarlas mientras se deciden sería publicarlas por la
          puerta de atrás, que es justo lo que la premoderación existe para evitar.
        </p>
        <p className="mt-3 max-w-read text-[13px] leading-[1.75] text-[var(--ink-2)]">
          Lo que sí es público es el criterio con el que se decide —está arriba— y el resultado:
          cada expediente lleva su historial de cambios, con qué se incorporó, cuándo y por qué.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {haySesion ? (
            <Link href="/expedientes" className="btn">
              Ver los expedientes
            </Link>
          ) : (
            <Link href="/acceder" className="btn-red">
              Entrar con tu cuenta
            </Link>
          )}
          <Link href="/aportar" className="btn">
            Aportar al archivo
          </Link>
        </div>
      </div>

      <Notice kind="info" title="¿Quieres moderar?">
        <p>
          Los permisos se dan a mano, no se solicitan con un formulario. Moderar aquí significa
          responder de lo que se publica sobre una persona identificable: es un papel con
          consecuencias, y por eso no se reparte automáticamente.
        </p>
      </Notice>
    </div>
  );
}
