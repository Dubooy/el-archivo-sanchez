# Seguridad y protección de datos

Guía práctica de lo que hay que dejar configurado antes de publicar. Cada apartado dice **qué
hace**, **dónde se pone** y **cómo comprobar que está funcionando**.

---

## 1. Cabeceras de seguridad HTTP

Son la defensa más barata que existe: una línea de configuración cierra ataques enteros. Ya están
aplicadas en [`next.config.mjs`](./next.config.mjs) para todo el sitio.

| Cabecera | Qué ataque corta | Valor recomendado |
|---|---|---|
| `Content-Security-Policy` | XSS, inyección de scripts, exfiltración de datos | Ver abajo |
| `X-Frame-Options` | Clickjacking (tu web dentro de un iframe ajeno) | `DENY` |
| `X-Content-Type-Options` | Ejecución de un archivo subido como si fuera script | `nosniff` |
| `Referrer-Policy` | Fuga de la URL completa a terceros | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Acceso a cámara, micrófono, ubicación | Todo a `()` salvo lo que uses |
| `Strict-Transport-Security` | Degradación a HTTP y ataques de intermediario | `max-age=63072000; includeSubDomains; preload` |
| `Cross-Origin-Opener-Policy` | Robo de referencias entre pestañas (Spectre) | `same-origin` |
| `Cross-Origin-Resource-Policy` | Carga de tus recursos desde otros dominios | `same-origin` |

> **HSTS**: actívala solo cuando **todo** el dominio y sus subdominios sirvan ya por HTTPS. Si la
> activas antes, dejas fuera lo que aún no tenga certificado, y el navegador lo recordará meses.

### Si despliegas en Nginx

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
server_tokens off;
```

### Si despliegas en Apache (`.htaccess`)

```apache
<IfModule mod_headers.c>
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
  Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
</IfModule>
ServerSignature Off
```

### Cómo comprobarlo

1. `curl -sI https://tu-dominio.com | grep -i -E "content-security|x-frame|strict-transport"`
2. Analizadores públicos: `securityheaders.com` y el observatorio de Mozilla.
3. Abre la consola del navegador: si la CSP está rompiendo algo, lo dice con el nombre exacto de la
   directiva que hay que ampliar. **Amplía solo esa**, nunca abras la política entera.

### CSP estricta con nonce (para despliegue en modo servidor)

La CSP incluida lleva `'unsafe-inline'` en `script-src` porque este proyecto se genera como HTML
estático y Next.js incrusta su script de hidratación en línea. Si despliegas en modo servidor, usa
un **nonce** por petición y borra `'unsafe-inline'`: es notablemente más seguro. Crea
`src/middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob:`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [{ source: "/((?!_next/static|_next/image|favicon.ico).*)" }],
};
```

Y en `layout.tsx`, lee el nonce con `headers().get("x-nonce")` y pásalo a cualquier `<script>`
propio. **Aviso**: usar `headers()` convierte las páginas en dinámicas, así que dejas de generar
HTML estático. Es un intercambio consciente: más seguridad, menos caché.

---

## 2. Formularios: spam, bots y datos

Tres capas, de la más barata a la más cara. Las dos primeras ya están implementadas en
[`src/lib/antispam.ts`](./src/lib/antispam.ts) y aplicadas en el formulario de aportaciones.

### Capa 1 — Honeypot (campo trampa)

Un campo que las personas no ven y los bots sí rellenan. Coste cero, sin cookies, sin terceros y sin
molestar a nadie.

```html
<div aria-hidden="true" style="position:absolute; left:-9999px; height:0; overflow:hidden">
  <label for="website">No rellenes este campo</label>
  <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
</div>
```

No uses `display:none`: los bots modernos ya lo detectan. Sácalo de pantalla y quítalo del orden de
tabulación.

### Capa 2 — Trampa de tiempo

Se guarda cuándo se abrió el formulario. Si el envío llega en menos de ~2,5 segundos, es un bot.

### Capa 3 — Captcha, solo si hace falta

Añade un tercero, cookies y una barrera de accesibilidad, así que es el último recurso. Se prefiere
**hCaptcha** por privacidad. Activa `CAPTCHA.enabled` en `src/lib/antispam.ts` y añade en el
formulario:

```html
<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
<div class="h-captcha" data-sitekey="TU_CLAVE_PUBLICA"></div>
```

Si lo activas, **añade su dominio a la CSP** (`script-src`, `frame-src`, `connect-src`):
`https://hcaptcha.com https://*.hcaptcha.com`.

### La parte que de verdad importa: el servidor

Todo lo anterior se puede saltar con `curl`. La comprobación de verdad se repite **siempre** en el
servidor. Ejemplo completo para un Route Handler de Next (`src/app/api/aportar/route.ts`):

```ts
import { NextResponse } from "next/server";
import { checkHuman, isSafeUrl, inRange, sanitizeText } from "@/lib/antispam";

// Limitador por IP en memoria. Para varias instancias, usa Redis o Upstash.
const hits = new Map<string, number[]>();
const WINDOW = 60_000; // 1 minuto
const MAX = 5; // 5 envíos por minuto e IP

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  return list.length > MAX;
}

async function verifyCaptcha(token: string, ip: string) {
  const body = new URLSearchParams({
    secret: process.env.HCAPTCHA_SECRET!, // NUNCA en el cliente
    response: token,
    remoteip: ip,
  });
  const r = await fetch("https://api.hcaptcha.com/siteverify", { method: "POST", body });
  const data = (await r.json()) as { success: boolean };
  return data.success === true;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Demasiados envíos. Prueba en un minuto." }, { status: 429 });
  }

  // Nunca confíes en el tamaño del cuerpo: córtalo.
  const raw = await req.text();
  if (raw.length > 20_000) return NextResponse.json({ error: "Envío demasiado grande" }, { status: 413 });

  const body = JSON.parse(raw) as Record<string, string>;

  // 1. Honeypot y tiempo (los mismos que en el cliente).
  const human = checkHuman(body.website ?? "", Number(body.startedAt) || 0);
  if (!human.ok) return NextResponse.json({ error: human.reason }, { status: 400 });

  // 2. Captcha, si está activado.
  if (process.env.HCAPTCHA_SECRET && !(await verifyCaptcha(body.captcha ?? "", ip))) {
    return NextResponse.json({ error: "Verificación fallida" }, { status: 400 });
  }

  // 3. Validación estricta: lista blanca de campos, tipos y longitudes.
  if (!inRange(body.title ?? "", 8, 180)) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }
  if (body.url && !isSafeUrl(body.url)) {
    return NextResponse.json({ error: "Enlace no válido" }, { status: 400 });
  }

  // 4. Limpieza antes de guardar. Guarda SIEMPRE con consulta parametrizada
  //    (nunca concatenando SQL) y escapa al pintar (React ya lo hace).
  const record = {
    title: sanitizeText(body.title, 180),
    url: body.url?.trim() ?? "",
    description: sanitizeText(body.description ?? "", 2000),
    reviewState: "PENDIENTE" as const, // premoderación: nada se publica solo
    at: new Date().toISOString(),
  };

  // await db.submissions.insert(record);
  return NextResponse.json({ ok: true, record }, { status: 201 });
}
```

### Reglas de oro para cualquier formulario

1. **Lista blanca, no lista negra.** Define qué campos aceptas y descarta el resto.
2. **Valida tipo, longitud y formato** en el servidor, aunque ya lo hagas en el cliente.
3. **Consultas parametrizadas** siempre: es lo que evita la inyección SQL.
4. **Escapa al pintar**, no al guardar. React lo hace solo; si usas plantillas propias, escapa
   `< > & " '`. No uses `dangerouslySetInnerHTML` con contenido de usuarios.
5. **Limita el tamaño** del cuerpo de la petición y el número de envíos por IP.
6. **Nunca envíes secretos al cliente**: las claves privadas viven en variables de entorno del
   servidor (`process.env`), no en `NEXT_PUBLIC_*`.
7. **Sube archivos con cuidado**: valida el tipo real (no la extensión), guárdalos fuera de la raíz
   web y sírvelos desde otro dominio o con `Content-Disposition: attachment`.
8. **Mensajes de error sin pistas**: «no hemos podido procesar el envío», no «el honeypot venía
   relleno».

---

## 3. Cookies y consentimiento

Implementado en [`src/lib/consent.ts`](./src/lib/consent.ts) —el motor: leer, escribir, revocar y
activar los scripts aparcados— y [`src/components/CookieBanner.tsx`](./src/components/CookieBanner.tsx),
que es la parte visible. El motor no depende de React: si algún día hace falta el aviso fuera de
Next, `consent.ts` funciona tal cual en cualquier página.

Lo que exige la Guía de cookies de la AEPD y que aquí se cumple:

- Ninguna cookie no necesaria antes del consentimiento. Los scripts de terceros se aparcan con
  `type="text/plain"` y solo se activan al aceptar.
- «Rechazar» al mismo nivel visual que «Aceptar todo». Nada de patrones oscuros.
- Cerrar el aviso o seguir navegando **no** es consentimiento.
- Botón permanente en el pie para cambiar de opinión.
- Se guarda prueba: qué se aceptó, cuándo y con qué versión del texto.
- Caduca a los 6 meses y se vuelve a preguntar.

---

## 4. Tipografías: aloja las fuentes en tu servidor

Esta plantilla carga Inter y JetBrains Mono desde Google Fonts, lo cual **envía la IP del visitante
a Google en cada visita, antes de cualquier consentimiento**. Un juzgado alemán (LG München I,
enero de 2022) ya condenó a un sitio por exactamente eso, y la AEPD sigue el mismo criterio: si
puedes evitar la comunicación a un tercero, evítala.

Solución, cinco minutos:

1. Descarga las familias desde <https://gwfh.mranftl.com> o con `google-webfonts-helper`, en formato
   **woff2**, y déjalas en `public/fonts/`.
2. Borra el `@import` de Google del principio de `src/app/globals.css` y pon en su lugar:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-variable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap; /* el texto se ve desde el primer momento */
}
@font-face {
  font-family: "JetBrains Mono";
  src: url("/fonts/jetbrains-mono-variable.woff2") format("woff2");
  font-weight: 400 700;
  font-display: swap;
}
```

3. Quita `https://fonts.googleapis.com` y `https://fonts.gstatic.com` de la CSP en
   `next.config.mjs`: ya no hacen falta y la política queda más cerrada.

Ganas además velocidad: una petición menos a otro dominio, sin negociación TLS adicional.

---

## 5. Antes de publicar

- [ ] HTTPS en todo el dominio, con redirección 301 desde HTTP.
- [ ] Cabeceras verificadas en `securityheaders.com` (objetivo: A o superior).
- [ ] `Strict-Transport-Security` activada **después** de comprobar que todo va por HTTPS.
- [ ] Textos legales completos: ni un `[CORCHETE]` sin rellenar en `src/lib/config.ts`.
- [ ] Banner de cookies probado: aceptar, rechazar, configurar y volver a cambiar.
- [ ] Comprobado con las herramientas de desarrollo que, tras **rechazar**, no hay ni una petición a
      dominios de terceros.
- [ ] Formularios probados con el campo trampa relleno (debe fallar) y con envío inmediato (debe
      fallar).
- [ ] Copias de seguridad automáticas y probadas: una copia que no se ha restaurado nunca no es una
      copia.
- [ ] `npm audit` sin vulnerabilidades altas o críticas.
- [ ] Panel de administración y moderación detrás de autenticación real.
- [ ] Registro de accesos con retención máxima de 12 meses.
- [ ] Procedimiento escrito para atender solicitudes de derechos y retirada de contenidos.
