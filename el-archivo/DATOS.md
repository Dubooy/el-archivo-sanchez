# Guía de datos

Cómo sustituir los datos de demostración por información real, campo a campo.

Todo vive en `src/data/`. Son archivos de texto: los abres con cualquier editor, los editas y los
guardas. Con `npm run dev` corriendo, el sitio se recarga solo.

**Antes de tocar nada:** haz una copia del archivo. Un JSON mal cerrado rompe la carga entera.

---

## Reglas que no dependen del formato

1. **Ningún registro sin origen.** Si no puedes enlazar de dónde sale, no entra.
2. **`isDemo: true` hasta que se demuestre lo contrario.** Ponerlo en `false` es una decisión
   consciente: tiene fuente, el enlace funciona y una persona lo ha leído.
3. **Los campos de explicación son obligatorios.** `stateRationale`, `conclusion`, `limitations`,
   `summary`, `relationToSubject`. Un estado sin razón no se publica.
4. **Cita literal o no cites.** Si no puedes reproducir la frase palabra por palabra, describe.
5. **Contexto siempre.** Una cita cierta recortada engaña igual que una inventada.
6. **Cero datos personales.** Ni del sujeto ni de nadie. Solo actividad pública de cargos públicos.

---

## `subjects.json` — a quién documenta el archivo

```jsonc
{
  "id": "sub-004",
  "slug": "nombre-apellido",         // la URL
  "name": "Nombre Apellido",
  "role": "Cargo público",
  "party": "Formación",
  "from": "2018-06-02",              // periodo documentado
  "to": null,                        // null = sigue en el cargo
  "status": "activo",                // activo | pendiente
  "note": "…",                       // por qué está en el archivo
  "isDemo": false
}
```

Un `status: "pendiente"` es un hueco reservado y visible: la plataforma muestra que existe y está
vacío. Es más honesto que ocultarlo.

---

## `statements.json` — las declaraciones

```jsonc
{
  "id": "stm-121",
  "subject": "sub-001",
  "text": "…",                       // LITERAL. Si no puedes citar literal, no lo registres
  "date": "2024-03-14",
  "place": "Congreso de los Diputados, sesión de control",
  "context": "…",                    // OBLIGATORIO
  "topics": ["economia", "empleo"],
  "sources": ["src-047"],
  "video": "vid-012",                // o null
  "videoTimestamp": 511,             // SEGUNDOS. null si no consta
  "reviewState": "VERIFICADO",       // solo lo VERIFICADO sale al archivo público
  "dossier": "exp-007",              // o null
  "isDemo": false,
  "contributedBy": "@usuario",       // o null
  "addedAt": "2026-09-10"
}
```

`reviewState` es la premoderación en acción: `data.ts` filtra y solo publica `VERIFICADO`.

Temas disponibles: `economia` · `vivienda` · `cataluna` · `exterior` · `justicia` · `elecciones` ·
`sanidad` · `educacion` · `empleo` · `energia` · `inmigracion` · `institucional` · `otros`

---

## `promises.json` — el seguimiento de promesas

```jsonc
{
  "id": "prm-041",
  "subject": "sub-001",
  "text": "…",                       // la promesa, literal
  "date": "2023-07-10",
  "context": "…",
  "objective": "…",                  // QUÉ, CUÁNTO y PARA CUÁNDO
  "deadline": "2025-12-31",          // null si no anunció plazo
  "state": "EN_PROCESO",
  "stateRationale": "…",             // OBLIGATORIO: por qué ese estado
  "topics": ["vivienda"],
  "sources": ["src-047"],
  "lastReviewed": "2026-09-10",
  "isDemo": false
}
```

**La regla que más se incumple en este género:**

| Estado | Requisito |
|---|---|
| `CUMPLIDA` | Documentación de la ejecución, en los términos y plazo anunciados |
| `EN_PROCESO` | Constancia de pasos dados **y** plazo no vencido |
| `NO_CUMPLIDA` | Plazo vencido **Y** documentación de que no se alcanzó. Las dos cosas |
| `NO_EVALUABLE` | Falta el qué, el cuánto, el cuándo, o no hay forma pública de comprobarlo |

Que haya pasado el tiempo, por sí solo, nunca clasifica nada.

---

## `contradictions.json` — DIJO → OCURRIÓ

```jsonc
{
  "id": "con-019",
  "subject": "sub-001",
  "title": "…",
  "topics": ["energia"],
  "steps": [                         // alternan DIJO / OCURRIO
    { "at": "2021-04-12", "side": "DIJO",
      "label": "…", "detail": "…", "ref": "stm-045", "sources": ["src-012"] },
    { "at": "2022-01-30", "side": "OCURRIO",
      "label": "…", "detail": "…", "ref": "tml-067", "sources": ["src-031"] }
  ],
  "evidence": "CONTRADICCION_DOCUMENTADA",
  "conclusion": "…",                 // nunca «mintió»
  "limitations": ["…", "…"],         // si va vacío, la ficha no está terminada
  "sources": ["src-012", "src-031"],
  "dossier": "exp-007",              // o null
  "lastUpdated": "2026-09-10",
  "isDemo": false
}
```

**Cómo se redacta la conclusión:**

| ✅ Así | ❌ Así no |
|---|---|
| «Afirmó X. Después consta Y. Ambas cosas están documentadas.» | «Mintió sobre X.» |
| «La declaración entra en contradicción con lo documentado en…» | «Sabía perfectamente que…» |
| «No consta si las circunstancias cambiaron entre ambas fechas.» | (omitir la limitación) |

---

## `dossiers.json` — los expedientes

```jsonc
{
  "id": "exp-025", "number": 25, "slug": "expediente-025", "subject": "sub-001",
  "title": "…",
  "topics": ["vivienda"],
  "whatWasSaid": "…",                // 01
  "statementRefs": ["stm-045"],
  "whenAndContext": "…",             // 02
  "timelineRefs": ["tml-067"],       // 03
  "whatSourcesSay": "…",             // 04
  "sources": ["src-012"],
  "counterEvidence": ["…"],          // 05 — OBLIGATORIO
  "conclusion": "…",                 // 06
  "evidence": "EVIDENCIA_INSUFICIENTE",
  "limitations": ["…"],
  "changes": [                       // historial visible de cambios de estado
    { "at": "2026-05-02", "from": "EVIDENCIA_INSUFICIENTE",
      "to": "PARCIALMENTE_RESPALDADO", "reason": "Actualizado tras incorporar…" }
  ],
  "openedAt": "2025-11-03", "lastUpdated": "2026-09-10", "isDemo": false
}
```

El orden de los campos no es decorativo: escribir `counterEvidence` **antes** que `conclusion`
obliga a buscar lo que te lleva la contraria antes de redactar el final.

**Nunca edites un expediente publicado sin añadir una entrada a `changes`.** Es lo que separa un
archivo de una versión.

### Niveles de evidencia

| Valor | Significa | NO significa |
|---|---|---|
| `RESPALDADO` | Fuentes independientes, al menos una de primer nivel | «Verdad absoluta» |
| `PARCIALMENTE_RESPALDADO` | Parte documentada, parte no. La ficha dice cuál | Que el resto sea falso |
| `EVIDENCIA_INSUFICIENTE` | No hay material para sostener ni descartar | Acusación ni absolución |
| `CONTRADICCION_DOCUMENTADA` | Declaración y hecho posterior que no encajan, ambos citados | Que alguien mintiera |
| `NO_VERIFICABLE` | No admite comprobación: juicio de valor o sin referente medible | Un reproche |
| `EN_INVESTIGACION` | Expediente abierto e incompleto | Nada, no adelanta conclusión |

---

## `timeline.json` — la cronología

```jsonc
{
  "id": "tml-091", "subject": "sub-001", "date": "2024-06-02",
  "kind": "RESOLUCION",              // DECLARACION | DECISION | HECHO | MEDIDA | RESOLUCION | PUBLICACION
  "title": "…", "detail": "…",
  "topics": ["justicia"], "sources": ["src-012"],
  "relatedStatement": "stm-045",     // o null
  "isDemo": false
}
```

Es un registro de acontecimientos, no un relato. Que dos cosas aparezcan seguidas no implica que
una produjera la otra, y la interfaz no dibuja ninguna flecha causal.

---

## `sources.json` — la biblioteca

```jsonc
{
  "id": "src-061", "title": "…", "url": "https://…", "author": "Emisor",
  "publishedAt": "2024-05-02",       // null si no consta
  "tier": "documento-oficial",
  "summary": "…",                    // OBLIGATORIO: qué aporta exactamente
  "relatedDossiers": [], "isDemo": false, "addedAt": "2026-09-10",
  "contributedBy": "@usuario"        // o null
}
```

### Jerarquía documental — el orden importa

| Nivel | `tier` | Nota |
|---|---|---|
| 1 | `documento-oficial` | Emisor identificable y responsable de lo publicado |
| 2 | `resolucion-judicial` | Se cita lo que dice, no lo que se interpreta |
| 3 | `organismo-publico` | Publicación institucional con método declarado |
| 4 | `dato-oficial` | Serie estadística, con periodo y unidad |
| 5 | `declaracion-original` | El material donde se pronuncia |
| 6 | `medio` | Se distingue si aporta material propio o reproduce |
| 7 | `fuente-secundaria` | Comentario o análisis. No sustituye al original |
| 8 | `red-social` | Editable y borrable. Nunca equivale a un documento oficial |

**Diez medios copiando la misma nota de prensa no son diez fuentes. Son una.**

---

## `viralQuotes.json` — ¿Realmente lo dijo?

```jsonc
{
  "id": "vq-025", "subject": "sub-001",
  "circulating": "…",                // como circula por redes
  "result": "CONTEXTO_ENGANOSO",     // DOCUMENTADA | PARCIAL | SIN_EVIDENCIA | CONTEXTO_ENGANOSO
  "whatIsDocumented": "…",           // qué consta exactamente
  "explanation": "…",
  "video": "vid-012", "videoTimestamp": 340, "date": "2023-09-11",
  "sources": ["src-012"], "shares": 12400, "isDemo": false
}
```

`SIN_EVIDENCIA` significa que se buscó el original y no aparece. **No** significa que no se dijera.

---

## `videos.json`, `users.json`, `submissions.json`, `comments.json`, `counterEvidence.json`, `votes.json`, `corrections.json`, `activity.json`

Estructuras auxiliares de la capa comunidad. Sus campos son legibles y siguen el mismo patrón:
`reviewState` para lo moderable, `isDemo` para lo demostrativo, `by` para la autoría.

De vídeos **solo se guarda la URL**: la plataforma no aloja material audiovisual de terceros.

---

## `judicial.json` — módulo desactivado

```jsonc
{
  "id": "jud-002", "caseName": "…",
  "investigatedParties": ["…"],      // quién. NO se asume que sea el sujeto del archivo
  "court": "…", "facts": "…",        // según el auto que lo acredita
  "relationToSubject": "…",          // OBLIGATORIO. Sin relación documentada, no entra
  "relationEvidence": ["…"],
  "status": "INVESTIGADO",
  "proven": ["…"],                   // solo lo que una resolución declara probado
  "pending": ["…"],                  // lo que está por resolver
  "allegationsOnly": ["…"],          // lo que sostiene una parte y nadie ha declarado probado
  "documents": ["https://…"], "sources": ["src-012"],
  "lastUpdated": "2026-09-10", "isDemo": false
}
```

Se activa con `MODULES.judicial: true` en `src/lib/config.ts`.

**Terminología, en orden y sin atajos:** `DENUNCIA` → `INVESTIGADO` → `ACUSADO` → `PROCESADO` →
`JUICIO_ORAL` → `CONDENADO_NO_FIRME` → `CONDENADO_FIRME`, más `ABSUELTO`, `ARCHIVADO` y
`RECURRIDO`.

Solo `CONDENADO_FIRME` acredita responsabilidad penal. Estar relacionado políticamente con alguien
investigado no es ninguno de esos estados.

---

## `meta.json`

```jsonc
{
  "build": "ARCHIVO-MVP-1.0",
  "lastUpdated": "2026-09-10",
  "demoMode": true,                  // false cuando el archivo tenga datos reales
  "disclaimer": "…"                  // el aviso amarillo del pie
}
```

---

## Errores frecuentes

| Síntoma | Causa casi siempre |
|---|---|
| La web no carga, error de JSON | Coma de más antes de `]` o `}`, o una que falta entre registros |
| Una declaración no aparece | Su `reviewState` no es `VERIFICADO` |
| Un expediente sale sin declaraciones | Los ids de `statementRefs` no coinciden con los reales |
| Una fuente no sale en la ficha | Falta su id en el array `sources` |
| El gráfico de estados sale vacío | Los valores no coinciden con los de la tabla de niveles |
| Sale «DEMO» en algo verificado | `isDemo` sigue en `true` |
| Una sección desapareció del menú | Su módulo está en `false` en `config.ts` |
