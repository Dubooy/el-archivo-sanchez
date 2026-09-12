/* ============================================================
   UTILIDADES DE TEXTO
   ------------------------------------------------------------
   Viven aparte del buscador a propósito. `normalize` la usan los
   filtros del navegador (componentes de cliente) y también el
   buscador del servidor; si siguiera dentro de search.ts, importarla
   desde el cliente arrastraría toda la capa de datos —y con ella el
   driver de Postgres— al paquete que se descarga el navegador.
   ============================================================ */

/** Minúsculas y sin acentos: «Cataluña» y «cataluna» son lo mismo
    cuando alguien está buscando. */
export function normalize(s: string): string {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}
