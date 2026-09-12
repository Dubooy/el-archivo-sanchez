import type { ReactNode } from "react";
import Link from "next/link";
import { OWNER } from "@/lib/config";
import { fmtDate } from "@/lib/format";
import { Label, Notice, PageHead } from "./primitives";

/* ============================================================
   MARCO DE LOS TEXTOS LEGALES
   Los tres documentos comparten estructura: encabezado, índice,
   cuerpo y aviso de última revisión. Los datos del titular NO se
   escriben aquí: salen de OWNER, en src/lib/config.ts, así que se
   rellenan una vez y quedan bien en los tres.
   ============================================================ */

/** Marca un dato que hay que rellenar antes de publicar. Se ve a
    simple vista precisamente para que no se te olvide ninguno. */
export function Fill({ children }: { children: ReactNode }) {
  const txt = String(children);
  const pending = txt.startsWith("[") && txt.endsWith("]");
  return pending ? <span className="fill">{txt}</span> : <>{txt}</>;
}

export function LegalPage({
  eyebrow,
  title,
  lede,
  toc,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  toc: [string, string][];
  children: ReactNode;
}) {
  return (
    <>
      <PageHead eyebrow={eyebrow} title={title} lede={lede} />
      <div className="wrap grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
        {/* min-w-0: sin esto, una celda ancha de tabla estira la columna de
            la rejilla y la página entera se desplaza en horizontal. */}
        <article className="legal min-w-0">
          <Notice kind="legal" title="Plantilla, no asesoramiento jurídico">
            <p>
              Este texto es una <strong>plantilla profesional</strong> adaptada al RGPD, a la LOPDGDD
              y a la LSSI-CE, pensada para cubrir los apartados que exige la normativa española y
              europea. Los datos entre corchetes y en rojo hay que rellenarlos en{" "}
              <code>src/lib/config.ts</code>. Antes de publicar, revísalo con alguien con formación
              jurídica: solo esa persona puede confirmar que se ajusta a tu caso concreto.
            </p>
          </Notice>
          {children}
          <p className="mt-12 border-t-[1.5px] border-[var(--edge)] pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
            Última revisión: {fmtDate(OWNER.legalUpdated)}
          </p>
        </article>

        <nav aria-label="Índice del documento" className="lg:sticky lg:top-[88px] lg:self-start">
          <div className="card-flat p-4">
            <Label tone="red">En esta página</Label>
            <ul className="mt-3 space-y-2">
              {toc.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="text-[12.5px] leading-snug text-[var(--ink-3)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t pt-4">
              {[
                ["/legal/aviso-legal", "Aviso legal"],
                ["/legal/privacidad", "Política de privacidad"],
                ["/legal/cookies", "Política de cookies"],
              ].map(([h, l]) => (
                <Link
                  key={h}
                  href={h}
                  className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-[var(--red)]"
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

/** Ficha del titular, idéntica en los tres documentos. */
export function OwnerBlock() {
  return (
    <table>
      <tbody>
        <tr>
          <th>Titular</th>
          <td>
            <Fill>{OWNER.legalName}</Fill>
          </td>
        </tr>
        <tr>
          <th>Nombre comercial</th>
          <td>{OWNER.tradeName}</td>
        </tr>
        <tr>
          <th>NIF / CIF</th>
          <td>
            <Fill>{OWNER.nif}</Fill>
          </td>
        </tr>
        <tr>
          <th>Domicilio</th>
          <td>
            <Fill>{OWNER.address}</Fill>
          </td>
        </tr>
        <tr>
          <th>Correo de contacto</th>
          <td>
            <Fill>{OWNER.email}</Fill>
          </td>
        </tr>
        {OWNER.registry ? (
          <tr>
            <th>Datos registrales</th>
            <td>
              <Fill>{OWNER.registry}</Fill>
            </td>
          </tr>
        ) : null}
        <tr>
          <th>Alojamiento</th>
          <td>
            <Fill>{OWNER.host}</Fill> — <Fill>{OWNER.hostAddress}</Fill>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
