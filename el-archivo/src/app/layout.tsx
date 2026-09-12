import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { EasterEggs } from "@/components/EasterEggs";
import { AutoScroll } from "@/components/AutoScroll";
import { CookieBanner } from "@/components/CookieBanner";
import { SITE } from "@/lib/config";

export const SITE_URL = SITE.url;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.intro,
  applicationName: SITE.name,
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  keywords: [
    "archivo político",
    "hemeroteca",
    "verificación",
    "declaraciones",
    "promesas políticas",
    "fact-checking",
    "fuentes",
    "metodología",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.motto,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: "Documentar. Contrastar. Debatir.",
  },
  robots: { index: true, follow: true },
};

/* ============================================================
   REVALIDACIÓN (ISR)
   Las páginas se siguen generando como HTML estático —rápidas y
   baratas—, pero Next las regenera en segundo plano cada cinco
   minutos, así que un cambio en la base de datos aparece solo, sin
   volver a desplegar. Este valor vale para todas las páginas; una
   página concreta puede sobrescribirlo (la cola de moderación lo
   pone a 0 porque ahí cinco minutos de retraso son inaceptables).
   ============================================================ */
export const revalidate = 300;

export const viewport: Viewport = {
  themeColor: "#f4f4f5",
  width: "device-width",
  initialScale: 1,
};

/* Se ejecuta antes de pintar: si el visitante eligió el tema oscuro en
   una visita anterior, se aplica ya, y no hay destello blanco. El tema
   claro es el principal, así que sin elección guardada no se toca nada. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("el-archivo:theme");if(t==="dark"){document.documentElement.setAttribute("data-theme","dark")}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        {/* La sesión se resuelve en el cliente: si la leyera aquí, el
            archivo entero dejaría de poder cachearse solo por pintar
            un apodo en la cabecera. Los permisos no dependen de esto:
            cada acción los vuelve a comprobar en el servidor. */}
        <SessionProvider refetchOnWindowFocus={false}>
          <div className="flex min-h-screen flex-col">
            <Nav />
            <main id="contenido" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
        <EasterEggs />
        {/* Desplazamiento con el botón central del ratón. */}
        <AutoScroll />
        {/* Aviso de cookies: se pinta solo si no hay una decisión válida
            guardada, y es lo único que puede activar scripts de terceros. */}
        <CookieBanner />
      </body>
    </html>
  );
}
