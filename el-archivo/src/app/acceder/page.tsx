import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AUTH_READY, DEV_LOGIN } from "@/lib/auth";
import { currentUser } from "@/lib/session";
import { Label, Notice, PageHead } from "@/components/primitives";
import { AccederForm } from "@/components/AccederForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Accede para aportar material, comentar, votar y proponer correcciones.",
  robots: { index: false, follow: false },
};

type Search = { searchParams: Promise<{ volver?: string; revisa?: string; error?: string }> };

/** Solo se admite volver a una ruta interna. Un `callbackUrl` que
    apunte fuera convierte la pantalla de acceso en un redirector
    abierto, que es un clásico del phishing. */
function destinoSeguro(valor: string | undefined): string {
  if (!valor) return "/";
  if (!valor.startsWith("/") || valor.startsWith("//")) return "/";
  return valor;
}

export default async function AccederPage({ searchParams }: Search) {
  const { volver, revisa, error } = await searchParams;
  const volverA = destinoSeguro(volver);

  const yo = await currentUser();
  if (yo) redirect(volverA);

  const correo = Boolean(process.env.AUTH_EMAIL_SERVER && process.env.AUTH_EMAIL_FROM);
  const google = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const github = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

  return (
    <>
      <PageHead
        eyebrow="Acceso"
        title="Entrar al archivo"
        lede="Hace falta cuenta para aportar, comentar, votar o proponer correcciones. Leer no la necesita, y nunca la necesitará: un archivo que exige registrarse para consultarlo no es un archivo público."
      />

      <div className="wrap py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {revisa ? (
              <div
                role="status"
                className="mb-5 border border-[var(--warn)] bg-[color-mix(in_srgb,var(--warn)_7%,transparent)] p-4 text-[13px] leading-[1.75] text-[var(--ink-2)]"
              >
                Si esa dirección puede entrar, acaba de recibir un enlace. Caduca en quince minutos.
              </div>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="mb-5 border-l-4 border-[var(--red)] bg-[var(--red-wash)] px-4 py-3 text-[13px] leading-[1.7] text-[var(--red-deep)]"
              >
                No se ha podido completar el acceso. Si tu cuenta está suspendida, escribir queda
                bloqueado aunque el proveedor te identifique correctamente.
              </div>
            ) : null}

            {AUTH_READY ? (
              <AccederForm
                correo={correo}
                google={google}
                github={github}
                dev={DEV_LOGIN}
                volverA={volverA}
              />
            ) : (
              <div className="card p-6">
                <Label tone="warn">Acceso todavía sin configurar</Label>
                <p className="mt-3 max-w-read text-[13px] leading-[1.75] text-[var(--ink-2)]">
                  No hay ningún proveedor activo en este despliegue. Cada forma de entrar se
                  enciende sola cuando están sus variables de entorno; mientras no las haya, la
                  pantalla dice la verdad en lugar de enseñar un botón que no lleva a ningún sitio.
                </p>
                <ul className="mt-4 space-y-2 font-mono text-[11px] leading-[1.8] text-[var(--ink-3)]">
                  <li>
                    Enlace por correo → <span className="text-[var(--ink)]">AUTH_EMAIL_SERVER</span> +{" "}
                    <span className="text-[var(--ink)]">AUTH_EMAIL_FROM</span>
                  </li>
                  <li>
                    Google → <span className="text-[var(--ink)]">AUTH_GOOGLE_ID</span> +{" "}
                    <span className="text-[var(--ink)]">AUTH_GOOGLE_SECRET</span>
                  </li>
                  <li>
                    GitHub → <span className="text-[var(--ink)]">AUTH_GITHUB_ID</span> +{" "}
                    <span className="text-[var(--ink)]">AUTH_GITHUB_SECRET</span>
                  </li>
                  <li>
                    Desarrollo → <span className="text-[var(--ink)]">AUTH_DEV_LOGIN=1</span> (jamás en
                    producción)
                  </li>
                </ul>
                <p className="mt-4 font-mono text-[11px] text-[var(--ink-3)]">
                  Los pasos completos están en <span className="text-[var(--ink)]">BASE-DE-DATOS.md</span>.
                </p>
              </div>
            )}
          </div>

          <aside className="min-w-0 space-y-4">
            <Notice kind="legal" title="Qué guardamos de ti">
              <p>
                Tu correo, para identificarte y poder avisarte de lo que pasa con lo que envías. Un
                apodo, que es lo único que se muestra. Y la fecha de cada cosa que haces, porque un
                archivo sin trazabilidad no vale nada.
              </p>
              <p>
                No guardamos tu nombre real, ni tu foto, ni tu IP en claro: para los límites de
                envío se usa un resumen criptográfico que no permite reconstruirla.
              </p>
            </Notice>

            <div className="card-flat p-5">
              <Label tone="ink">Por qué hace falta cuenta</Label>
              <p className="mt-2 text-[12px] leading-[1.7] text-[var(--ink-3)]">
                Porque sin ella una sola persona puede inflar una votación con diez pestañas, y
                porque de lo que se publica sobre una persona identificable tiene que poder
                responder alguien.
              </p>
              <p className="mt-3 text-[12px] leading-[1.7] text-[var(--ink-3)]">
                Detalle completo en la{" "}
                <Link href="/legal/privacidad" className="underline underline-offset-4">
                  política de privacidad
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
