# Accesibilidad

Objetivo: **WCAG 2.1 nivel AA**. En España, además, el Real Decreto 1112/2018 lo exige a las webs
del sector público y a las financiadas con fondos públicos; para el resto es la diferencia entre una
web que puede usar todo el mundo y una que deja fuera a mucha gente.

Lo que ya está aplicado en este proyecto y lo que tienes que mantener cuando añadas cosas.

---

## 1. Lo que ya está hecho

| Requisito | Cómo se cumple aquí |
|---|---|
| Saltar al contenido | Primer enlace del documento, visible al tabular |
| Estructura semántica | `header`, `nav`, `main`, `aside`, `footer`, `article`, `section` reales |
| Un solo `h1` por página | En `PageHead` y en la portada |
| Estado de los menús | `aria-expanded` y `aria-controls` en la hamburguesa y en el acordeón |
| Página actual | `aria-current="page"` en el enlace activo del menú |
| Foco visible | `:focus-visible` con contorno rojo de 2 px y separación de 2 px |
| Foco atrapado en diálogos | Panel de cookies: tabulación circular y Escape para cerrar |
| Errores de formulario | `role="alert"`, texto explicativo y nunca solo color |
| Movimiento reducido | `@media (prefers-reduced-motion: reduce)` desactiva animaciones |
| Objetivos táctiles | Botones de 44 px de alto mínimo |
| Idioma | `<html lang="es">` |
| Imágenes decorativas | `aria-hidden="true"` en los iconos SVG |

---

## 2. Contraste

**Mínimos AA:** 4,5:1 para texto normal, 3:1 para texto grande (≥ 24 px, o ≥ 19 px en negrita) y
3:1 para bordes de controles e iconos con significado.

Contrastes de la paleta actual:

| Combinación | Ratio | Uso |
|---|---|---|
| `#000000` sobre `#f4f4f5` | 19,8:1 | Texto principal, tema claro |
| `#5d5d64` sobre `#f4f4f5` | 6,6:1 | Texto secundario |
| `#d81e2c` sobre `#f4f4f5` | 4,9:1 | Acento y enlaces |
| `#e8e6e1` sobre `#1c1c1c` | 13,4:1 | Texto principal, tema oscuro |
| `#8e8c88` sobre `#1c1c1c` | 5,3:1 | Texto secundario, tema oscuro |

**Regla que no se rompe:** el color nunca es el único portador de información. Cada estado de
evidencia lleva **texto** además de color (`RESPALDADO`, `EVIDENCIA INSUFICIENTE`…), y cada gráfico
incluye su tabla de datos en un `<details>`. Alguien con daltonismo, o mirando una impresión en
blanco y negro, entiende lo mismo.

Herramientas: el panel *Contrast* de las DevTools, [WebAIM Contrast Checker], y la auditoría
Lighthouse → *Accessibility*.

---

## 3. Textos alternativos

- **Imagen que aporta información** → `alt` que diga lo que aporta, no cómo se ve.
  `alt="Gráfico: 12 de 24 expedientes están respaldados por documento oficial"`.
- **Imagen decorativa** → `alt=""` (vacío, pero presente) o `aria-hidden="true"` si es un SVG en
  línea. Un `alt` ausente hace que el lector de pantalla lea el nombre del archivo.
- **Imagen dentro de un enlace** → el `alt` describe el destino: `alt="Volver a la portada"`.
- **Icono junto a un texto que ya lo explica** → decorativo. Repetir «icono de expedientes» delante
  de la palabra «Expedientes» es ruido.
- **Icono solo, sin texto** → necesita nombre accesible: `<button aria-label="Abrir menú">`, o un
  `<span class="sr-only">` dentro.
- **Gráficos y tablas complejas** → resumen en texto + la tabla de datos completa. Aquí cada
  gráfico ya la lleva.

---

## 4. ARIA: lo básico y lo que no hay que hacer

> **Primera regla de ARIA: no usar ARIA.** Si existe un elemento HTML que ya hace el trabajo,
> úsalo. Un `<button>` es accesible de nacimiento; un `<div role="button">` obliga a reimplementar
> a mano el foco, la tecla Intro, la barra espaciadora y el estado.

Los que sí hacen falta:

```html
<!-- Navegación: nombra cada una si hay varias -->
<nav aria-label="Principal">…</nav>
<nav aria-label="Índice del documento">…</nav>

<!-- Página actual dentro del menú -->
<a href="/expedientes" aria-current="page">Expedientes</a>

<!-- Control que abre o cierra algo -->
<button aria-expanded="false" aria-controls="menu-movil">Menú</button>
<div id="menu-movil" hidden>…</div>

<!-- Diálogo modal -->
<div role="dialog" aria-modal="true" aria-labelledby="titulo-dialogo">
  <h2 id="titulo-dialogo">Configuración de cookies</h2>
</div>

<!-- Mensaje que aparece sin recargar: se anuncia solo -->
<p role="alert">El enlace no es válido.</p>       <!-- urgente, interrumpe -->
<p role="status">Guardado.</p>                     <!-- cortés, espera turno -->

<!-- Texto solo para lectores de pantalla -->
<span class="sr-only">Cambiar a tema oscuro</span>

<!-- Región con nombre -->
<section aria-labelledby="titulo-seccion">
  <h2 id="titulo-seccion">Últimos expedientes</h2>
</section>
```

Errores frecuentes que conviene evitar:

- `aria-label` en un elemento que ya tiene texto visible: el lector lee el `aria-label` y la persona
  ve otra cosa. Si usas comandos de voz, deja de funcionar.
- `role="button"` sobre un `<div>` sin `tabindex="0"` ni manejo de teclado.
- `aria-hidden="true"` sobre algo que contiene un elemento enfocable: el foco entra en un sitio que
  el lector de pantalla no anuncia.
- Diálogos que no devuelven el foco al botón que los abrió al cerrarse.
- `title` como única etiqueta: no se muestra en móvil ni con teclado.

---

## 5. Teclado

Todo lo que se puede hacer con ratón tiene que poder hacerse con teclado:

- **Tab / Shift+Tab** recorre en orden lógico; el orden visual y el del DOM coinciden.
- **Intro** activa enlaces y botones; **Espacio** activa botones y casillas.
- **Escape** cierra menús y diálogos y **devuelve el foco** al control que los abrió.
- Nada de trampas de foco fuera de los diálogos modales.
- El indicador de foco se ve siempre: nunca `outline: none` sin sustituto.

Prueba rápida: recorre la portada entera con el tabulador sin tocar el ratón. Si en algún momento no
sabes dónde está el foco, hay un problema.

---

## 6. Formularios

- Cada campo, con su `<label for>` real. El `placeholder` **no** es una etiqueta: desaparece al
  escribir.
- Errores en texto, junto al campo, y anunciados con `role="alert"`.
- Agrupa opciones relacionadas con `<fieldset>` y `<legend>`.
- Usa `autocomplete` (`name`, `email`) para que el navegador ayude a rellenar.
- No valides solo con color rojo: acompaña siempre con texto.

---

## 7. Comprobación

1. **Automática** (detecta ~30 % de los problemas): Lighthouse, axe DevTools, WAVE.
2. **Con teclado**: recorrer la web entera sin ratón.
3. **Con lector de pantalla**: NVDA en Windows (gratuito) o VoiceOver en macOS (`Cmd + F5`).
4. **Zoom al 200 %**: nada se recorta ni obliga a desplazamiento horizontal.
5. **Solo en blanco y negro**: si algo deja de entenderse, dependía únicamente del color.

[WebAIM Contrast Checker]: https://webaim.org/resources/contrastchecker/
