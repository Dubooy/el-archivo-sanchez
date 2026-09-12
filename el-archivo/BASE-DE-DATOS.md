# Base de datos — diseño

Paso 1 de la migración: elegir ORM y dejar el esquema cerrado. Aquí está el porqué de cada
decisión, para que se pueda discutir **antes** de escribir migraciones.

El esquema completo está en [`prisma/schema.prisma`](./prisma/schema.prisma).

---

## 1. ORM: Prisma

**Recomendación: Prisma.** Drizzle es excelente, pero para este proyecto concreto Prisma gana por
cuatro razones, en orden de peso:

1. **Prisma Studio es un panel de administración gratis.** `npx prisma studio` abre una tabla
   navegable donde se pueden leer y editar los registros sin escribir SQL. Hoy el contenido se edita
   a mano en archivos JSON; sin ese panel, el día que los datos entren en Postgres el proyecto se
   queda sin forma de tocarlos salvo programando. Con Drizzle habría que construir ese panel.
2. **El esquema es un solo archivo declarativo**, muy parecido a lo que ya son los `types.ts`
   actuales: se lee de arriba abajo y se entiende sin saber SQL. `prisma migrate dev` traduce los
   cambios a SQL versionado, y `prisma migrate deploy` los aplica en producción.
3. **Auth.js trae adaptador oficial para Prisma** (`@auth/prisma-adapter`). El paso 3 se reduce a
   configurar; con Drizzle el adaptador existe pero es menos rodado.
4. **Los tipos se generan solos.** `src/lib/types.ts` deja de mantenerse a mano: el cliente de
   Prisma exporta los tipos de cada tabla, y las firmas de `src/lib/data.ts` siguen igual.

**Dónde ganaría Drizzle**, para que conste: paquete mucho más ligero, sin binario de motor, mejor en
el *edge runtime* y con control fino del SQL generado. Si en el futuro hace falta consultar la base
de datos desde un *middleware* en el edge, o si las consultas se vuelven analíticas y complejas,
Drizzle sería la elección. Hoy las consultas son sencillas —listar, filtrar, contar— y el sitio se
renderiza en el servidor en Node, así que ninguna de esas ventajas se nota; el panel de
administración, en cambio, se nota desde el primer día.

> Migrar de Prisma a Drizzle más adelante es factible: comparten Postgres y el trabajo estaría
> concentrado en `src/lib/data.ts`, que ya es el único punto por donde la aplicación lee datos.

---

## 2. Los tres principios que el esquema convierte en estructura

Hasta ahora, «no mezclar las tres capas» era una disciplina del código. En la base de datos pasa a
ser una propiedad de las tablas:

| Regla del proyecto | Cómo la garantiza el esquema |
|---|---|
| Archivo y comunidad nunca se mezclan | Son bloques de tablas distintos. No hay ninguna columna de opinión en las tablas del archivo, así que no existe la consulta capaz de mezclarlas por accidente. |
| Nada aportado se publica solo | Todas las tablas de aportación nacen con `reviewState = PENDIENTE` y `publishedAt = null`. Lo público es lo que tiene `publishedAt`, no lo que existe. |
| El voto mide percepción, no verdad | `votes` y `dossiers.evidence` son tablas distintas y no hay ningún cálculo que las relacione. Separarlos es la razón de que sean dos tablas y no dos campos. |
| Un archivo que corrige en silencio no es un archivo | `dossier_changes` es una tabla de historial: los cambios de nivel de evidencia se añaden, no se sobrescriben, y llevan motivo obligatorio. |
| Terminología procesal estricta | `judicial_cases` separa `proven`, `pending` y `allegationsOnly` en tres columnas. El estado es una **fase procesal**, no una culpabilidad. |

---

## 3. Mapa de tablas

### Bloque 1 · Identidad (4 tablas)

`users` · `accounts` · `sessions` · `verification_tokens`

Las tres últimas son las que exige Auth.js y no se tocan. En `users` está lo nuestro: `handle`
(identidad pública, lo único que se muestra), `role` (`USUARIO` / `MODERADOR` / `EDITOR` / `ADMIN`),
`reputation` y `suspendedAt`.

**Decisión:** el correo es opcional y nunca se muestra. Para participar basta un `handle`. Es
coherente con lo que ya promete la política de privacidad: *para participar no hace falta nombre
real, teléfono ni dirección*.

### Bloque 2 · Archivo (12 tablas)

```
subjects ─┬─ statements ──┬─ source_links ─── sources
          ├─ videos       ├─ dossier_statements ─┐
          ├─ promises     └─ contradiction_steps │
          ├─ timeline_events ─┬─ dossier_timeline┤
          │                   └─ contradiction_steps
          ├─ contradictions ── contradiction_steps
          ├─ dossiers ───┬─ dossier_changes
          │              ├─ dossier_statements ──┘
          │              └─ dossier_timeline
          ├─ viral_quotes
          └─ (judicial_cases, módulo apagado)
```

**`source_links`, la tabla que merece explicación.** Una fuente puede sostener una declaración, una
promesa, un expediente, una contradicción, un hecho de la cronología, una frase viral, una causa o
**un paso concreto de una secuencia DIJO → OCURRIÓ**: ocho relaciones de muchos a muchos. (Ese
octavo destino no es un capricho: la tarjeta de contradicción muestra cuántas fuentes respaldan cada
peldaño, no solo el conjunto.) Había tres caminos:

- Ocho tablas puente → ocho veces el mismo código.
- Una relación polimórfica con `targetType` en texto → sin claves ajenas reales: se borra un
  expediente y sus enlaces quedan apuntando al vacío.
- **Una tabla con ocho columnas opcionales y una restricción `CHECK` que obliga a que solo una esté
  rellena** («arco exclusivo»). Es la elegida: claves ajenas de verdad, borrado en cascada real, y
  añadir un tipo nuevo de registro es añadir una columna.

La restricción `CHECK` se añade a mano en la migración (Prisma no las declara en el esquema):

Está escrita en [`prisma/sql/01-restricciones.sql`](./prisma/sql/01-restricciones.sql), junto con el
resto de reglas que Prisma no sabe declarar.

**Los seis bloques del expediente** siguen siendo seis campos, porque son fijos y obligatorios: son
la estructura editorial que obliga a buscar lo que contradice la hipótesis antes de escribir el
final. Los bloques 01 y 03 añaden además sus tablas de referencias (`dossier_statements`,
`dossier_timeline`) para poder enlazar a los registros exactos.

**`publicId`.** Cada registro del archivo conserva su identificador legible (`exp-007`, `stm-111`).
La clave primaria es un `cuid`, pero las URLs, el sitemap y los enlaces ya publicados siguen
funcionando: eso son 145 páginas que no se rompen.

### Bloque 3 · Comunidad (6 tablas)

`submissions` · `comments` · `comment_upvotes` · `counter_evidence` · `votes` · `corrections`
(+ `activity_events` para el feed)

- `votes` lleva `@@unique([dossierId, userId])`: **un voto por persona y expediente**. Cambiar de
  opinión actualiza la fila, no añade otra. Es lo que impide inflar una votación creando cuentas…
  siempre que la cuenta cueste algo, que es de lo que se ocupa el paso 3.
- `comments.upvotes` es un contador cacheado; la verdad está en `comment_upvotes`, para que nadie
  vote dos veces y se pueda deshacer.
- `submissions.escalated` es el resultado del filtro de lenguaje de `antispam.ts`: lo que atribuye
  responsabilidad penal entra marcado para revisión reforzada.
- `corrections.sourceUrl` es **obligatoria**: una corrección sin fuente es una opinión.

### Bloque 4 · Operación (5 tablas)

`moderation_log` · `rate_limits` · `consent_log` · `archive_meta`

`moderation_log` guarda acción, motivo escrito, y el antes y el después en JSON. Sirve para rendir
cuentas, para deshacer, y para responder a un requerimiento legal con fechas y motivos por escrito
—que es exactamente lo que promete el aviso legal.

---

## 4. Protección de datos, en el esquema

Lo que la política de privacidad promete, escrito como columnas:

| Promesa | Implementación |
|---|---|
| No se guardan IPs | `ipHash` (huella con sal) en `submissions`, `comments` y `rate_limits`. Nunca la IP en claro. |
| Los registros técnicos se borran | `rate_limits.expiresAt`: nada dura más de 24 h. |
| Las aportaciones rechazadas se purgan a los 12 meses | `submissions.purgeAfter`, que fija el moderador al rechazar. |
| Derecho de supresión (art. 17 RGPD) | `deletedAt` + `onDelete: SetNull` en la autoría: al borrar una cuenta, sus aportaciones **aceptadas** se quedan en el archivo pero pierden el vínculo con la persona. El material documental sobrevive; el dato personal no. |
| Prueba del consentimiento | `consent_log`, con un identificador aleatorio que no se cruza con la sesión. |
| Minimización | El correo es opcional; no hay teléfono, dirección ni nombre real en ninguna tabla. |

---

## 5. Búsqueda e índices

- Índices `GIN` sobre las columnas `topics` (son arrays de enum) para filtrar por tema sin recorrer
  la tabla entera.
- Índices compuestos por los filtros reales de la interfaz: `(subjectId, date)`,
  `(reviewState, at)`, `(dossierId, option)`.
- **Búsqueda global**: se sustituye `src/lib/search.ts` (que hoy busca en memoria) por una columna
  `tsvector` generada y un índice `GIN`, con el diccionario en español. Se añade en la migración:

```sql
ALTER TABLE statements ADD COLUMN search tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(text,'') || ' ' ||
                       coalesce(place,'') || ' ' || coalesce(context,''))) STORED;
CREATE INDEX statements_search_idx ON statements USING GIN (search);
```

Con 120 declaraciones da igual; con 12.000 es la diferencia entre 5 ms y 2 s.

---

## 6. Qué cambia en la aplicación (y qué no)

**No cambia:** ni una sola pantalla. Ningún componente importa un `.json`: todos piden los datos a
`src/lib/data.ts`. Ese archivo pasa a hablar con Prisma y sus funciones se vuelven `async`; las
páginas ya son componentes de servidor y aceptan `await` sin tocar nada más. Era el motivo de
haberlo construido así desde el principio.

**Cambia:**

| Hoy | Después |
|---|---|
| `src/data/*.json` (18 archivos) | Tablas en Postgres; los JSON quedan como *seed* |
| `src/lib/data.ts` lee JSON | `src/lib/data.ts` consulta Prisma (mismas firmas) |
| `src/lib/store.ts` guarda en el navegador | Route Handlers que escriben en la base de datos |
| `src/lib/types.ts` a mano | Tipos generados por Prisma (el archivo se queda solo con los tipos de presentación) |
| Moderación sobre datos del navegador | Moderación real sobre la cola compartida |

---

## 7. Decisiones tomadas

| Decisión | Elegido | Dónde se nota |
|---|---|---|
| Proveedor | **Neon** (PostgreSQL gestionado) | `DATABASE_URL` y `DIRECT_URL` en `.env` |
| Acceso | **Enlace mágico por correo + Google y GitHub** | Tablas `accounts`, `sessions` y `verification_tokens`, ya en el esquema |
| Datos demo | **Se importan como semilla**, marcados con `isDemo` | `prisma/seed.ts` |

**Nota sobre Prisma 7.** Desde la versión 7, las cadenas de conexión **no van en
`schema.prisma`**: viven en `prisma.config.ts` (para las migraciones) y en el adaptador del cliente
(`src/lib/prisma.ts`, que usa `@prisma/adapter-pg` sobre `pg`). Es un cambio reciente, y por eso
muchos tutoriales que encontrarás por ahí ya no valen: los de Prisma 5 y 6 ponen `url` dentro del
esquema y hoy eso da error de validación.

---

## 8. Puesta en marcha, paso a paso

### 8.1 Crear la base de datos en Neon

1. Entra en <https://neon.tech> y crea una cuenta (el plan gratuito basta de sobra).
2. **Create project**. Nombre: `el-archivo`. Región: la más cercana a tus lectores
   (`aws-eu-central-1`, Fráncfort, para España).
3. Al terminar te muestra la **connection string**. Necesitas dos variantes:
   - La que lleva **`-pooler`** en el host → va en `DATABASE_URL`.
   - La **directa**, sin `-pooler` (pestaña *Connection details* → desmarca *Pooled connection*) →
     va en `DIRECT_URL`.

### 8.2 Configurar el proyecto

```bash
cp .env.example .env          # y pega ahí las dos cadenas de Neon
npm install                   # instala Prisma, el adaptador y tsx
```

### 8.3 Crear las tablas y cargar los datos

```bash
npm run db:setup
```

Ese comando encadena los tres pasos. Si prefieres verlos por separado:

```bash
npm run db:migrate    # crea las 27 tablas en Neon (te pedirá un nombre: "inicial")
npm run db:sql        # añade las restricciones CHECK y la búsqueda en español
npm run db:seed       # importa los 18 JSON de src/data
```

Al terminar, la semilla imprime una tabla con lo insertado. Debe coincidir con esto:

| | |
|---|---|
| sujetos | 1 |
| usuarios | 13 (12 demo + `@editorial`) |
| declaraciones | 120 |
| expedientes | 24 |
| contradicciones | 18 (72 pasos) |
| promesas | 40 |
| cronología | 90 |
| fuentes | 60 (834 enlaces) |
| vídeos | 28 · frases virales | 24 |
| aportaciones | 36 · comentarios | 88 |
| contraevidencia | 34 · correcciones | 14 |
| votos | 288 |

### 8.4 Mirar lo que hay dentro

```bash
npm run db:studio
```

Abre <http://localhost:5555> con todas las tablas navegables y editables. **Este es el panel de
administración**: desde aquí se aprueba una aportación, se corrige una ficha o se cambia el nivel
de evidencia de un expediente, sin escribir una línea de código.

### 8.5 Cuando publiques

En el servidor (Vercel, por ejemplo) las mismas dos variables de entorno, y en el despliegue:

```bash
npm run db:deploy     # aplica las migraciones ya creadas, sin preguntar
npm run db:sql
```

`db:migrate` es para desarrollar; `db:deploy` es el que se usa en producción, porque no intenta
regenerar nada ni borrar datos.

---

## 9. Dos detalles de la semilla que conviene saber

**Los votos bajan, y es lo correcto.** En los JSON los votos son recuentos (450 votos en un
expediente). Un voto real necesita una cuenta real, y en la demo solo hay 12 usuarios: la semilla
reparte cada recuento entre ellos respetando las proporciones, con un voto por persona y expediente
—como funcionará en producción—. Los gráficos mostrarán 12 votos donde antes mostraban cientos.
Es la misma decisión que ya tomamos con las cifras de la portada: **un número pequeño y cierto antes
que uno grande e inventado**.

**Las estadísticas de los perfiles se calculan, no se guardan.** El JSON de usuarios traía un objeto
`stats` con contadores. En la base de datos esos números salen de contar filas reales
(aportaciones aceptadas, debates, correcciones), así que no pueden desincronizarse de la realidad.
Lo único que se guarda es `reputation`, porque es una decisión editorial, no un recuento.

---

## 10. Si algo falla

| Mensaje | Qué pasa | Solución |
|---|---|---|
| `Can't reach database server` | La cadena de conexión está mal o el proyecto de Neon está dormido | Abre el panel de Neon (despierta solo) y revisa que copiaste la cadena entera, con `?sslmode=require` |
| `prepared statement "s0" already exists` | Estás usando la URL del **pooler** para migrar | Las migraciones usan `DIRECT_URL`: comprueba que esa no lleva `-pooler` |
| `Environment variable not found: DIRECT_URL` | Falta el `.env` o falta esa línea | `cp .env.example .env` y rellénalo |
| `constraint "source_links_un_solo_destino" is violated` | Un enlace de fuente apunta a dos sitios | Es justo lo que la restricción debe impedir: revisa la fila que menciona el error |
| La semilla falla a mitad | Alguna clave ajena no existe | Vuelve a lanzarla: empieza borrando lo demo, así que no deja restos a medias |

---

## 11. Plan de migración

1. **Paso 1 — esquema, migración y semilla.** Hecho: `prisma/schema.prisma` validado,
   `prisma.config.ts`, `src/lib/prisma.ts`, `prisma/seed.ts`, las restricciones SQL y los comandos.
2. **Paso 2 — capa de datos.** Hecho: `src/lib/data.ts` consulta Prisma, `src/lib/mappers.ts`
   traduce las filas y las veinte pantallas esperan los datos con `await`. Detalle en el §12.
3. **Paso 3 — escritura y autenticación.** Hecho: Server Actions para aportar, comentar, votar,
   corregir y moderar; `antispam.ts` verificado en el servidor antes de cada mutación; Auth.js con
   sesiones, papeles y rutas protegidas. Detalle en el §13.
4. **Paso 4 — limpieza.** Hecho: fuera `src/lib/store.ts` (el almacén en el navegador) y fuera la
   carpeta `vanilla/`. Todo el código vive en Next.js, sin fragmentos sueltos que mantener dos veces.

El orden importó: sin base de datos no había sesiones que proteger, y sin capa de datos migrada los
formularios no tenían dónde escribir.

**El proyecto queda cerrado aquí.** Lo que venga después es contenido y despliegue, no
arquitectura.


---

## 12. Paso 2: qué cambió en la aplicación

**Las firmas se mantienen.** `getDossiers()`, `getStatement(id)`, `getStats()`… se llaman igual,
reciben lo mismo y devuelven lo mismo. La única diferencia es que ahora devuelven promesas, así que
las pantallas las esperan con `await`. Ninguna pantalla sabe que detrás hay una base de datos.

| Archivo | Qué hace ahora |
|---|---|
| `src/lib/data.ts` | Consulta Prisma. Tipos de retorno **explícitos**: el contrato con las pantallas no depende de lo que infiera el ORM |
| `src/lib/mappers.ts` | Traduce filas de Postgres a los tipos de `types.ts` |
| `src/lib/text.ts` | `normalize()`, que usan los filtros del navegador **y** el buscador |
| 20 pantallas | `async` + `await`, y varias consultas en paralelo con `Promise.all` |

### Las tres traducciones que hacen falta

1. **Fechas.** Postgres devuelve `Date`; la aplicación ordena con `localeCompare` y recorta
   `date.slice(0, 4)`, así que espera cadenas `2026-03-14`. Se convierte en UTC para que no baile un
   día según la zona horaria del servidor.
2. **Enums.** Un enum de Postgres no admite guiones: `resolucion-judicial` se guarda como
   `RESOLUCION_JUDICIAL` y vuelve a su forma al salir.
3. **Relaciones.** Donde el JSON tenía `sources: ["src-001"]`, la base de datos tiene filas en
   `source_links`; cada consulta las incluye y el traductor las aplana.

### Cuatro decisiones que merecen explicación

**Se acabaron las consultas en bucle.** Pintar la lista de expedientes pedía los comentarios de cada
uno: veinticuatro consultas para una página. Ahora hay `getCommentCounts()`, que los cuenta todos de
una vez agrupando por expediente. Lo mismo en la comunidad y en el buscador con
`getPublishedComments()`.

**Las estadísticas las cuenta Postgres.** `getStats()` eran veinte recorridos de arrays en memoria;
ahora son recuentos y agrupaciones. Los temas viven en una columna de array, que no se puede agrupar
con la API normal, así que esos dos cálculos van en SQL con `unnest`.

**Las estadísticas de perfil se calculan, no se guardan.** Aportaciones, fuentes aceptadas, debates y
correcciones salen de contar filas reales, así que no pueden desincronizarse.

**`normalize()` se mudó a `src/lib/text.ts`.** Estaba en el buscador, y un componente de cliente la
importaba de ahí: eso arrastraba la capa de datos —y con ella el driver de Postgres— al paquete que
descarga el navegador. El compilador lo cantó con un `Can't resolve 'fs'`. Separarla lo arregla, y es
la razón de que `next.config.mjs` declare ahora `serverExternalPackages`.

### Caché

`src/app/layout.tsx` exporta `revalidate = 300`: las páginas se siguen sirviendo como HTML estático,
pero Next las regenera en segundo plano cada cinco minutos, así que un cambio en la base de datos
aparece solo, sin desplegar. `/moderacion` lo sobrescribe con `revalidate = 0`, porque una cola de
revisión con cinco minutos de retraso no sirve de nada.

---

## 13. Paso 3: formularios, servidor y autenticación

Hasta aquí la base de datos sabía leer. Este paso es el que le enseña a
escribir, y escribir es donde están todos los riesgos: por ahí entra el
spam, por ahí entran las afirmaciones sin fuente y por ahí entraría
cualquiera que quisiera votar cien veces.

### 13.1 Una sola puerta, y está en el servidor

Todo lo que muta la base de datos pasa por `src/server/guard.ts`. Las
acciones de `src/lib/actions.ts` empiezan **siempre** con la misma línea:

```ts
const puerta = await comprobar(formData, { ruta: "aportacion", maximo: 5 });
if (esFallo(puerta)) return puerta;
```

Esa llamada hace tres cosas, en este orden, y si falla cualquiera no se
ejecuta ni una consulta de escritura:

1. **Sesión.** `requireUser()` exige cuenta activa y no suspendida.
2. **Ritmo.** Ventana deslizante en la tabla `rate_limits`. Cuenta por
   usuario y por procedencia.
3. **Antispam.** `checkHuman()` de `src/lib/antispam.ts`: campo trampa
   relleno → fuera; formulario enviado en menos de 2,5 segundos → fuera.

El detalle que importa: el antispam del navegador (`CamposAntispam` en
`ActionForm.tsx`) es cortesía. La comprobación que cuenta es la del
servidor, y esa no se puede saltar desactivando JavaScript ni enviando
la petición con `curl`.

### 13.2 La IP nunca se guarda

Para contar envíos hace falta distinguir procedencias, no identificarlas.
`ipHash()` guarda `sha256(ip + IP_SALT)` recortado a 40 caracteres. Sirve
para contar y no para reconstruir la dirección. Si cambias `IP_SALT`, los
contadores en vuelo se reinician: es lo correcto, son datos técnicos y no
historial.

### 13.3 Autenticación: Auth.js v5

`src/lib/auth.ts`. Tres formas de entrar, cada una encendida solo si
están sus variables de entorno:

| Forma | Variables | Nota |
|---|---|---|
| Enlace por correo | `AUTH_EMAIL_SERVER`, `AUTH_EMAIL_FROM` | Caduca en 15 min, un solo uso |
| Google | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Retorno: `/api/auth/callback/google` |
| GitHub | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | Retorno: `/api/auth/callback/github` |
| Desarrollo | `AUTH_DEV_LOGIN=1` | **Nunca** en producción |

Sin contraseñas, a propósito: lo que no se guarda no se puede filtrar.

Dos decisiones que conviene entender antes de tocarlas:

- **Sesión por JWT, no por tabla.** Es lo único compatible con el
  proveedor de credenciales del acceso de desarrollo. Si algún día lo
  quitas, puedes pasar a `strategy: "database"`; la tabla `sessions` ya
  está en el esquema esperando.
- **De una cuenta solo se muestra el apodo.** El evento `createUser`
  deriva un `@apodo` legible del correo y pone `name` e `image` a `null`.
  No es cosmético: es el artículo 5.1.c del RGPD —minimización— cumplido
  en el único sitio donde se puede cumplir, que es al escribir.

### 13.4 Papeles

`src/lib/session.ts` es el único sitio que decide quién puede qué:

```
USUARIO    aporta, comenta, vota, propone correcciones
MODERADOR  además, acepta o rechaza lo que entra en la cola
EDITOR     además, incorpora contraevidencia y cambia el nivel de evidencia
ADMIN      además, gestiona cuentas
```

Para dar permisos a alguien, una sola sentencia:

```sql
UPDATE users SET role = 'MODERADOR' WHERE handle = '@apodo';
```

No hay formulario para pedirlo, y es deliberado: moderar aquí significa
responder de lo que se publica sobre una persona identificable.

### 13.5 Qué se cachea y qué no

| Ruta | Modo | Por qué |
|---|---|---|
| `/aportar`, `/moderacion`, `/acceder` | `force-dynamic` | Dependen de quién mira |
| `/expedientes/[id]` | `force-dynamic` | Enseña **tu** voto |
| El resto del archivo | estático / ISR | Es igual para todo el mundo |

La cabecera es la excepción interesante: el apodo se resuelve en el
cliente (`SessionChip` + `SessionProvider`). Si lo leyera en el servidor,
el sitio entero dejaría de poder cachearse solo por pintar un nombre en
una esquina.

### 13.6 Archivos de este paso

```
src/lib/auth.ts                        Auth.js: proveedores, callbacks, apodos
src/lib/session.ts                     currentUser / requireUser / requireRole
src/lib/actions.ts                     Las 9 Server Actions
src/lib/moderation.ts                  needsEscalation, compartido cliente/servidor
src/server/guard.ts                    La puerta: sesión + ritmo + antispam
src/app/api/auth/[...nextauth]/route.ts
src/app/acceder/page.tsx               Pantalla de acceso
src/components/ActionForm.tsx          Campos antispam, botón, avisos
src/components/AccederForm.tsx
src/components/SessionChip.tsx         Apodo y cierre de sesión en la cabecera
```

Y `src/lib/store.ts` desaparece: era el almacén en el navegador de la
versión de demostración. Ya no queda nada que guardar en el cliente.

### 13.7 Probarlo entero en local

```bash
AUTH_DEV_LOGIN=1 npm run dev
```

1. Entra en `/acceder` → «Entrar sin correo» → `@editorial`.
2. Envía algo en `/aportar`. Fíjate en que sale PENDIENTE.
3. Dale permisos a tu usuario:
   `UPDATE users SET role='MODERADOR' WHERE handle='@editorial';`
4. Vuelve a `/moderacion`: ahora sí ves la cola, y puedes decidir.
5. Prueba a enviar dos cosas seguidas en menos de tres segundos: el
   límite de ritmo te para. Es el comportamiento correcto.
