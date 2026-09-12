/* ============================================================
   CABECERAS DE SEGURIDAD
   Se aplican a TODAS las respuestas. Si despliegas en Vercel o en
   Netlify, esto es suficiente: la plataforma las sirve tal cual. Si
   despliegas detrás de Nginx o Apache, replica la misma lista allí
   (tienes los bloques listos en SEGURIDAD.md).

   Cada cabecera cierra un ataque concreto; el porqué está anotado en
   cada una para que puedas ajustarlas sin romper nada.
   ============================================================ */

/** Orígenes externos que el sitio necesita. Si añades un proveedor
    (analítica, publicidad, tipografías), su dominio va AQUÍ y en
    ningún otro sitio: es el único punto que hay que tocar. */
const ALLOW = {
  fontsCss: "https://fonts.googleapis.com",
  fontsFiles: "https://fonts.gstatic.com",
  // Descomenta lo que uses de verdad. Cada línea abre una puerta:
  // ads:       "https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  // adsFrames: "https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  // analytics: "https://plausible.io",
};

const CSP = [
  // Todo lo que no se declare expresamente abajo, se bloquea.
  `default-src 'self'`,

  /* script-src
     'unsafe-inline' está aquí por una razón concreta: esta web se
     genera como HTML estático y Next.js incrusta su script de
     hidratación en línea, sin nonce. Si despliegas en modo servidor
     (SSR), usa el middleware con nonce que viene documentado en
     SEGURIDAD.md y BORRA 'unsafe-inline': es notablemente más seguro.
     Aun con 'unsafe-inline', el sitio no acepta scripts de dominios
     ajenos, que es el vector realmente peligroso. */
  `script-src 'self' 'unsafe-inline'`,

  // Tailwind y Next inyectan estilos en línea; las fuentes vienen de Google.
  `style-src 'self' 'unsafe-inline' ${ALLOW.fontsCss}`,
  `font-src 'self' ${ALLOW.fontsFiles} data:`,

  // Imágenes propias, data: (iconos SVG en línea) y blob: (miniaturas).
  `img-src 'self' data: blob:`,

  // Peticiones XHR/fetch: solo al propio origen.
  `connect-src 'self'`,

  // Nada de Flash, applets ni plugins.
  `object-src 'none'`,

  // Sin iframes salvo que actives publicidad (entonces añade ALLOW.adsFrames).
  `frame-src 'none'`,

  // Nadie puede incrustar esta web dentro de un iframe: mata el clickjacking.
  `frame-ancestors 'none'`,

  // El <base> no se puede reescribir para secuestrar rutas relativas.
  `base-uri 'self'`,

  // Los formularios solo pueden enviarse a este mismo dominio.
  `form-action 'self'`,

  // Cualquier recurso http:// se pide como https://.
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },

  // Redundante con frame-ancestors, pero cubre navegadores antiguos.
  { key: "X-Frame-Options", value: "DENY" },

  // Impide que el navegador "adivine" el tipo de un archivo (XSS por MIME).
  { key: "X-Content-Type-Options", value: "nosniff" },

  // No filtramos la URL completa a sitios externos.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Apagamos APIs que esta web no usa: si un script logra colarse, no
  // puede pedir cámara, micrófono ni ubicación.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), interest-cohort=()",
  },

  // Dos años de HTTPS obligatorio, subdominios incluidos.
  // OJO: actívala solo cuando TODO tu dominio sirva ya por HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },

  // Aísla la ventana de otras pestañas (Spectre y robo de referencias).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },

  // No indexamos las páginas de moderación ni los perfiles en buscadores
  // externos por defecto: eso se controla en robots.ts, no aquí.
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Prisma, su adaptador y el driver de Postgres son paquetes de Node:
     no se empaquetan, se cargan tal cual en el servidor. Sin esto, el
     compilador intenta meter `pg` en un bundle donde no existe `fs`. */
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  // Oculta la versión del framework en las respuestas.
  poweredByHeader: false,
  // Las miniaturas demo son SVG generados localmente: sin dominios remotos.
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
