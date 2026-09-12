# EL ARCHIVO SÁNCHEZ

Plataforma documental y comunitaria. **Pedro Sánchez bajo lupa.**

> Documentar. Contrastar. Debatir.

**PROYECTO INDEPENDIENTE.** No afiliado al PSOE, al PP, a ningún otro partido, institución
pública o medio de comunicación. No se utiliza el emblema ni la identidad gráfica oficial de
ninguna formación: el rojo de esta web es una decisión editorial propia.

---

## Qué es esta versión

Funciona entera —navegación, filtros, expedientes, debate, votación, aportaciones, moderación,
buscador y dashboard— con **datos de demostración**.

Todo el contenido es plantilla que se describe a sí misma como plantilla: `[DECLARACIÓN DEMO]`,
`[EXPEDIENTE DEMO 007]`, `[FUENTE DEMO 042]`. Los enlaces apuntan a `example.org`, un dominio
reservado.

**No se atribuye ni una sola declaración, fecha, cifra o causa judicial a ninguna persona real.**
Pedro Sánchez existe en la base de datos como ficha de sujeto —nombre y cargo, que son hechos
públicos y neutros— y todo lo asociado a esa ficha es material generado para probar la aplicación.

---

## Arrancarlo (sin saber programar)

Necesitas **Node.js 18 o superior**, instalado una sola vez desde <https://nodejs.org> (versión
LTS, siguiente-siguiente-siguiente).

Abre una terminal en esta carpeta y escribe:

```bash
cp .env.example .env   # y pega ahí la cadena de conexión de Neon
npm install
npm run db:setup       # crea las tablas y carga los datos de demostración
npm run dev
```

Abre <http://localhost:3000>. Para cerrar: `Ctrl + C`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Modo desarrollo. Se recarga solo al guardar. |
| `npm run build` | Compila producción. Úsalo antes de publicar. |
| `npm run start` | Sirve lo compilado (requiere `build` antes). |
| `npm run typecheck` | Comprueba que no hay errores en el código. |
| `npm run db:setup` | Crea las tablas, aplica el SQL y carga los datos de demostración. |
| `npm run db:studio` | Panel para leer y editar el contenido de la base de datos. |

---

## Las tres capas (lo más importante del proyecto)

La plataforma nunca mezcla estas tres cosas, y se distinguen visualmente de un vistazo:

| Capa | Aspecto | Qué contiene |
|---|---|---|
| 📚 **ARCHIVO** | Superficie papel, filete duro y sombra | Declaraciones literales, fechas, hechos, documentos. Con enlace a su origen. |
| ⚖ **VERIFICACIÓN** | Etiqueta roja, conclusión fechada | Lo que las fuentes permiten concluir, con nivel de evidencia y limitaciones. |
| 💬 **COMUNIDAD** | Superficie hundida, esquina redondeada, sin sombra | Debate, contraevidencia y correcciones. No modifica el archivo por sí sola. |

**La frase que esta plataforma no escribe:** «X mintió sobre Y». Lo que sí escribe: «afirmó Y el
14 de marzo»; «posteriormente ocurrió Z»; «las fuentes A, B y C lo acreditan»; y una conclusión
editorial que describe esa distancia sin atribuir intención.

---

## Estructura

```
src/
├── app/                     Una carpeta = una página
│   ├── page.tsx                     Portada
│   ├── declaraciones/               Base + ficha de cada declaración
│   ├── contradicciones/             DIJO → OCURRIÓ
│   ├── promesas/                    Seguimiento con estado razonado
│   ├── expedientes/                 Los casos de 6 bloques + debate
│   ├── cronologia/                  Línea temporal filtrable
│   ├── comunidad/                   Foro, reputación, correcciones
│   ├── aportar/                     + AÑADIR AL ARCHIVO
│   ├── moderacion/                  Cola de revisión (solo moderadores)
│   ├── acceder/                     Entrar: correo, Google, GitHub
│   ├── legal/                       Privacidad, aviso legal, cookies
│   ├── api/auth/[...nextauth]/      Auth.js
│   ├── fuentes/                     Biblioteca por nivel documental
│   ├── realmente-lo-dijo/           Frases virales contrastadas
│   ├── investigaciones/             Módulo judicial (DESACTIVADO)
│   ├── perfil/[user]/               Perfiles
│   ├── sujetos/  datos/  metodologia/  buscar/
│   └── globals.css                  ← LA IDENTIDAD VISUAL VIVE AQUÍ
│
├── components/              Piezas reutilizables
├── lib/
│   ├── config.ts                    ← ALCANCE, MÓDULOS Y MODERACIÓN
│   ├── types.ts                     Qué campos tiene cada cosa
│   ├── data.ts                      ← ÚNICO SITIO QUE LEE LOS DATOS
│   ├── evidence.ts                  Niveles, estados y jerarquía de fuentes
│   ├── mappers.ts                   Filas de Postgres → tipos de la app
│   ├── prisma.ts                    Cliente de base de datos
│   ├── auth.ts                      Auth.js: quién entra y cómo
│   ├── session.ts                   Quién eres y qué puedes hacer
│   ├── actions.ts                   Las 9 Server Actions que escriben
│   ├── antispam.ts                  Campo trampa, reloj, validadores
│   ├── moderation.ts                Detección de lenguaje penal
│   ├── format.ts                    Fechas, etiquetas
│   ├── consent.ts                   Motor de cookies: aparcar y activar scripts
│   ├── text.ts                      Normalización de texto (cliente y servidor)
│   └── search.ts                    Buscador
├── server/
│   └── guard.ts                     ← LA PUERTA: sesión + ritmo + antispam
└── data/                    Los 18 .json: ahora son la SEMILLA, no la fuente

prisma/
├── schema.prisma            30 tablas, 19 enumerados
├── seed.ts                  Carga los .json marcados isDemo
├── sql/01-restricciones.sql CHECK, búsqueda en español, purga
└── aplicar-sql.ts
```

Una regla de lectura: **nada escribe en la base de datos sin pasar por `src/server/guard.ts`.**
Si algún día alguien añade una mutación que no empieza ahí, es un error, no un atajo.

**Los cuatro archivos que importan si quieres cambiar algo:**

- El contenido vive en **PostgreSQL** (ver [`BASE-DE-DATOS.md`](./BASE-DE-DATOS.md)). Se edita con
  `npm run db:studio`. Los `src/data/*.json` ya solo son la semilla inicial.
- `src/app/globals.css` → colores y tipografía. Cambia `--red` en `:root` y cambia toda la web.
- `src/lib/config.ts` → qué secciones existen, política de moderación, textos legales.
- `src/lib/data.ts` → la puerta entre datos y pantallas (ver «Escalar»).

---

## Qué ha cambiado respecto al proyecto anterior

Se ha **transformado** el proyecto, no duplicado. Lo que se conservó, lo que cambió y lo que se
eliminó:

**Conservado y adaptado** — arquitectura Next.js + TypeScript + Tailwind; la capa de acceso a
datos como único punto de entrada; el sistema de filtros; los gráficos SVG sin librerías; el
buscador global; el patrón «ningún estado sin su explicación»; los estados vacíos, de error y de
carga; sitemap, robots y Open Graph; y los easter eggs.

**Cambiado**

- **Identidad visual completa.** De terminal negra a neo-brutalismo fluido: papel gris claro
  (nunca blanco puro), tinta negra, filete estructural de 1,5 px y sombras paralelas duras, sin
  difuminar. Dos fuentes y solo dos: **Inter** para la prosa y **JetBrains Mono** para todo lo que
  es dato —botones, navegación, fechas, metadatos, etiquetas de estado y números de expediente.
  Todo lo que se puede tocar responde igual: 200 ms `ease-out` y −2 px al pasar por encima.
- **Tema claro y tema oscuro.** El claro es el principal. El oscuro (gris carbón `#1c1c1c` sobre
  `#121212`, texto gris tiza, rojo apagado) se activa con el interruptor de la cabecera, se guarda
  en el navegador y se aplica antes de pintar, así que al recargar no hay destello blanco. La
  preferencia del sistema no lo activa sola: se elige.
- **Responsive de verdad.** En escritorio, barra de enlaces completa y tarjetas con toda su
  densidad de datos. En móvil, menú hamburguesa accesible y las tarjetas de expediente plegadas a
  número, título y estado; el resto se despliega al tocar, con transición fluida.
- **Modelo de datos.** De 8 colecciones a 17. El modelo admite varios sujetos aunque esta
  versión documente solo a uno: añadir otro es añadir una ficha a `subjects.json`.
- **De índices numéricos a niveles de evidencia.** El «índice de humo» desaparece: sobre una
  persona viva, una puntuación agregada de credibilidad es indefendible. En su lugar, seis niveles
  de evidencia, cada uno con lo que significa **y lo que no significa**.

**Nuevo**

- Contradicciones DIJO → OCURRIÓ con línea temporal de dos columnas.
- Promesas con objetivo medible, plazo anunciado y estado razonado.
- Expedientes de seis bloques con historial de cambios de estado visible.
- Capa comunidad entera: debate clasificado, contraevidencia, correcciones, votación de
  percepción, perfiles y reputación documental.
- «+ Añadir al archivo» con premoderación y cola funcional.
- Filtro de lenguaje que marca para revisión reforzada lo que atribuye responsabilidad penal.
- Módulo judicial construido y **apagado**.

**Eliminado** — el índice de humo, el ranking de frases por impacto, la sección de testimonios de
seguidores (sustituida por la capa comunidad, que hace lo mismo con reglas mucho más estrictas) y
la estética de terminal.

---

## Base de datos

El contenido vive en **PostgreSQL (Neon)** y se consulta con **Prisma**. Lo que hay que saber:

| Archivo | Para qué |
|---|---|
| `prisma/schema.prisma` | Las 30 tablas y sus relaciones |
| `prisma/seed.ts` | Importa los JSON de `src/data` como datos de demostración |
| `prisma/sql/01-restricciones.sql` | Lo que Prisma no sabe declarar: CHECK y búsqueda en español |
| `src/lib/prisma.ts` | El cliente, con el adaptador de Postgres |
| `src/lib/data.ts` | **El único sitio que consulta la base de datos** |
| `src/lib/mappers.ts` | Traduce filas de Postgres a los tipos de la aplicación |

```bash
npm run db:setup    # crea las tablas, aplica el SQL y carga los datos demo
npm run db:studio   # panel para leer y editar el contenido
```

Puesta en marcha completa, decisiones y solución de problemas en
[`BASE-DE-DATOS.md`](./BASE-DE-DATOS.md).

**Las pantallas no han cambiado.** Siguen pidiendo los datos a `src/lib/data.ts` con las mismas
funciones y los mismos tipos; lo único distinto es que ahora las esperan con `await`. Esa fue la
razón de construir la capa de datos así desde el principio.

**La parte interactiva ya escribe de verdad.** Aportar, comentar, votar, proponer correcciones y
moderar pasan por Server Actions (`src/lib/actions.ts`) que comprueban sesión, ritmo de envío y
antispam **en el servidor** antes de tocar la base de datos (`src/server/guard.ts`). El almacén en
el navegador ha desaparecido.

| Pieza | Estado |
|---|---|
| Autenticación | Auth.js v5: enlace por correo, Google, GitHub. Sin contraseñas |
| Permisos | `USUARIO` · `MODERADOR` · `EDITOR` · `ADMIN`, en `src/lib/session.ts` |
| Antispam | Campo trampa + reloj + límite de ritmo, verificados en servidor |
| Moderación | Cola real sobre `submissions`, con `moderation_log` para dejar constancia |
| Votos | Un voto por persona y expediente, garantizado por la base de datos |
| Comentarios y contraevidencia | Entran como PENDIENTE; nada es público sin aprobación |
| Correcciones | Exigen fuente y quedan anotadas con su resolución |
| Módulo judicial | `MODULES.judicial: true` en `config.ts` |

De la IP nunca se guarda la dirección: solo `sha256(ip + IP_SALT)`, que sirve para contar envíos y
no para reconstruirla. Detalle en el §13 de [`BASE-DE-DATOS.md`](./BASE-DE-DATOS.md).

---

## Cómo hacer cada cosa

**Añadir un expediente** → `npm run db:studio`, tabla `dossiers`, botón *Add record*. Los seis
bloques son campos: `whatWasSaid`, `whenAndContext`, `whatSourcesSay`, `counterEvidence`,
`conclusion` (y las referencias a declaraciones y hechos, en sus tablas de enlace). Detalle campo a
campo en [`DATOS.md`](./DATOS.md) y estructura completa en [`BASE-DE-DATOS.md`](./BASE-DE-DATOS.md).

**Añadir una fuente** → `npm run db:studio`, tabla `sources`. Obligatorio elegir `tier` (nivel 1 a
8) y escribir el `summary`. Para enlazarla a un registro, una fila en `source_links`. La jerarquía
está en `src/lib/evidence.ts`.

**Moderar aportaciones** → entra en `/moderacion`. La cola solo la ve quien tiene papel de
moderador; a los demás se les explica el criterio pero no se les enseña ni un texto sin comprobar.
Para darte permisos: `UPDATE users SET role='MODERADOR' WHERE handle='@tu_apodo';`

**Entrar sin montar un servidor de correo** → `AUTH_DEV_LOGIN=1 npm run dev`, y en `/acceder`
escribe el apodo de cualquier usuario de la semilla. Esa puerta está apagada en producción por dos
condiciones independientes.

**Cambiar colores o tipografía** → `src/app/globals.css`, bloque `:root`, con el bloque
`:root[data-theme="dark"]` justo debajo para el tema oscuro. Ahí están los colores, las dos
fuentes, el grosor del filete (`--edge`) y las sombras duras (`--shadow`). No hay ningún color
escrito a mano en los componentes: cambia `--red` y cambia la web entera, en los dos temas.

**Cambiar el alcance** → `src/lib/config.ts`: qué módulos existen, si la moderación es previa o
posterior, qué palabras disparan revisión reforzada y los textos legales del pie.

**Añadir otro sujeto** → tabla `subjects`. El modelo lo admite sin tocar nada más.

---

## Legal, cookies y seguridad

Todo lo obligatorio para publicar en España y la UE viene montado y funcionando:

| Pieza | Dónde | Qué hay que hacer |
|---|---|---|
| Datos del titular | `src/lib/config.ts` → `OWNER` | Rellenar. Es el **único** sitio: los tres textos legales se alimentan de ahí. |
| Aviso legal | `/legal/aviso-legal` | Revisar el apartado de propiedad intelectual y el de retirada de contenidos. |
| Política de privacidad | `/legal/privacidad` | Ajustar plazos y encargados a tus proveedores reales. |
| Política de cookies | `/legal/cookies` | Completar la tabla con las cookies de tus proveedores. |
| Banner de cookies | `src/components/CookieBanner.tsx` | Nada: funciona. Bloquea terceros hasta el consentimiento. |
| Motor de consentimiento | `src/lib/consent.ts` | Subir `CONSENT_VERSION` si cambian las finalidades. |
| Cabeceras de seguridad | `next.config.mjs` | Añadir ahí el dominio de cada proveedor que actives. |
| Antispam de formularios | `src/lib/antispam.ts` | Nada. El captcha solo si el honeypot se queda corto. |
| Guía de seguridad | [`SEGURIDAD.md`](./SEGURIDAD.md) | Leerla antes de desplegar. |
| Guía de accesibilidad | [`ACCESIBILIDAD.md`](./ACCESIBILIDAD.md) | Leerla al añadir componentes nuevos. |
| Página 404 | `src/app/not-found.tsx` | Nada: la sirve el propio App Router. |

**La regla que rige todo esto:** nada que no sea estrictamente necesario se carga antes de que el
visitante lo autorice, y rechazar cuesta exactamente lo mismo que aceptar. Si añades un proveedor,
aparca su script con `type="text/plain" data-consent="analitica"` y déjalo en manos del motor de
consentimiento.

## Publicidad

Los huecos existen desde el principio, reservan su altura (para que la página no dé saltos) y
**no contactan con ninguna red hasta que el visitante acepta esa categoría de cookies**. Se
configuran en `src/lib/config.ts` → `ADS`: pon `enabled: true`, tu identificador de editor y los
bloques. Van entre secciones y en un carril lateral que solo aparece a partir de 1536 px: nunca
encima del contenido, nunca flotando en móvil, siempre etiquetados como «Publicidad».

## Antes de publicar esto en internet

- [ ] Cambia `SITE.url` en `src/lib/config.ts` por tu dominio.
- [ ] Rellena `OWNER` en `src/lib/config.ts`: no puede quedar ni un `[CORCHETE]` en rojo en las
      páginas legales.
- [ ] Prueba el banner de cookies: aceptar, rechazar, configurar y volver a cambiar desde el pie.
- [ ] Con la pestaña «Red» abierta, pulsa **Rechazar**: no debe haber ni una petición a terceros.
- [ ] Repasa la lista completa de [`SEGURIDAD.md`](./SEGURIDAD.md) (cabeceras, HTTPS, formularios).
- [ ] Sustituye los datos demo y pon `meta.demoMode` en `false` cuando corresponda.
- [ ] Comprueba que ningún registro con `isDemo: true` se presenta como verificado.
- [ ] Lee entera `/metodologia` y ajústala a cómo trabajas de verdad.
- [ ] Decide si enciendes el módulo judicial. Si lo enciendes, que lo lea alguien con formación
      jurídica antes de publicar una sola causa.
- [ ] Monta backend real antes de abrir la comunidad: sin él no hay moderación efectiva.
- [ ] `npm run build` sin errores.

---

## Aviso

Esta plataforma recopila y organiza información procedente de fuentes públicas. Las conclusiones
son editoriales, están fechadas y pueden revisarse o corregirse cuando aparece nueva evidencia. La
votación de la comunidad mide percepción, no verifica hechos.

**La existencia de una investigación, denuncia, querella, acusación o procedimiento judicial NO
implica culpabilidad. Toda persona es inocente mientras no exista sentencia condenatoria firme.**
