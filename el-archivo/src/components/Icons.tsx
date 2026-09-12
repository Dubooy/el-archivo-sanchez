import type { ReactElement } from "react";
import type { Layer } from "@/lib/types";

/* ============================================================
   ICONOGRAFÍA PROPIA
   Mismo idioma que el logotipo: marco cuadrado de 2,4 px, geometría
   plana, dos tintas (la tinta actual + el rojo) y ni un degradado.
   Al usar `currentColor` heredan el color del texto, así que sirven
   igual en tema claro y en oscuro, y en cualquier tamaño.

   Sustituyen a los emojis: un emoji lo dibuja el sistema operativo,
   así que cambiaba de estilo en cada dispositivo y no era nuestro.
   ============================================================ */

export type IconName =
  | "declaraciones"
  | "contradicciones"
  | "promesas"
  | "expedientes"
  | "cronologia"
  | "comunidad"
  | "fuentes"
  | "archivo"
  | "verificacion"
  | "buscar";

const FRAME = (
  <rect x="2" y="2" width="28" height="28" stroke="currentColor" strokeWidth="2.4" fill="none" />
);

const SHAPES: Record<IconName, ReactElement> = {
  /* Cita: la marca de apertura en rojo y el texto detrás. */
  declaraciones: (
    <>
      <rect x="7" y="9" width="4.5" height="4.5" fill="var(--red)" />
      <rect x="14" y="9.6" width="11" height="3.2" fill="currentColor" />
      <rect x="7" y="16.4" width="18" height="3.2" fill="currentColor" />
      <rect x="7" y="22" width="11" height="3.2" fill="currentColor" />
    </>
  ),
  /* Dijo → ocurrió: dos bloques desalineados y el salto en rojo. */
  contradicciones: (
    <>
      <rect x="6" y="6.5" width="8" height="8" fill="currentColor" />
      <rect x="18" y="17.5" width="8" height="8" fill="currentColor" />
      <path d="M14.5 11.5 L19 20" stroke="var(--red)" strokeWidth="2.6" fill="none" />
    </>
  ),
  /* Promesa: lo prometido y el plazo anunciado debajo, en rojo. */
  promesas: (
    <>
      <path
        d="M7.5 13.5 L11.5 17.5 L21 8"
        stroke="currentColor"
        strokeWidth="2.8"
        fill="none"
      />
      <rect x="7" y="21" width="18" height="3.4" fill="var(--red)" />
    </>
  ),
  /* Expediente: los seis bloques fijos; el primero es la declaración. */
  expedientes: (
    <>
      <rect x="7" y="9" width="5.5" height="5.5" fill="var(--red)" />
      <rect x="14.2" y="9" width="5.5" height="5.5" fill="currentColor" />
      <rect x="21.4" y="9" width="3.6" height="5.5" fill="currentColor" />
      <rect x="7" y="17.5" width="5.5" height="5.5" fill="currentColor" />
      <rect x="14.2" y="17.5" width="5.5" height="5.5" fill="currentColor" />
      <rect x="21.4" y="17.5" width="3.6" height="5.5" fill="currentColor" />
    </>
  ),
  /* Cronología: el eje y tres hitos; el primero, el más reciente. */
  cronologia: (
    <>
      <rect x="15" y="6" width="2" height="20" fill="currentColor" />
      <circle cx="16" cy="9.5" r="3.4" fill="var(--red)" />
      <circle cx="16" cy="16" r="3.4" fill="currentColor" />
      <circle cx="16" cy="22.5" r="3.4" fill="currentColor" />
    </>
  ),
  /* Comunidad: dos voces que no son la misma. */
  comunidad: (
    <>
      <path d="M6 7h12v8H10l-4 4V7z" fill="currentColor" />
      <path d="M14 14h12v8h-4l-4 4v-4h-4v-8z" fill="var(--red)" />
    </>
  ),
  /* Fuentes: la pila documental, con el nivel de arriba destacado. */
  fuentes: (
    <>
      <rect x="6.5" y="7.5" width="19" height="4.2" fill="var(--red)" />
      <rect x="6.5" y="13.9" width="19" height="4.2" fill="currentColor" />
      <rect x="6.5" y="20.3" width="19" height="4.2" fill="currentColor" />
    </>
  ),
  /* Archivo: la ficha con su filete de encabezado. */
  archivo: (
    <>
      <rect x="6.5" y="6.5" width="19" height="4" fill="currentColor" />
      <rect x="6.5" y="13" width="13" height="3" fill="currentColor" />
      <rect x="6.5" y="19" width="19" height="3" fill="currentColor" />
    </>
  ),
  /* Verificación: comprobado, con la reserva de que es una conclusión. */
  verificacion: (
    <>
      <path d="M7 16 L13 22 L25 9" stroke="currentColor" strokeWidth="3.2" fill="none" />
    </>
  ),
  buscar: (
    <>
      <circle cx="14" cy="14" r="6.5" stroke="currentColor" strokeWidth="2.8" fill="none" />
      <path d="M19 19 L26 26" stroke="var(--red)" strokeWidth="2.8" fill="none" />
    </>
  ),
};

export function Icon({
  name,
  size = 32,
  framed = true,
  className = "",
  title,
}: {
  name: IconName;
  size?: number;
  framed?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {framed ? FRAME : null}
      {SHAPES[name]}
    </svg>
  );
}

/** El icono que acompaña a cada etiqueta de capa. Sin marco: va dentro
    de una etiqueta que ya tiene su propio fondo. */
export function LayerIcon({ layer, size = 12 }: { layer: Layer; size?: number }) {
  const name: IconName =
    layer === "ARCHIVO" ? "archivo" : layer === "VERIFICACION" ? "verificacion" : "comunidad";
  return <Icon name={name} size={size} framed={false} className="shrink-0" />;
}
