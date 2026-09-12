import { MODERATION } from "./config";

/* ============================================================
   FILTRO DE LENGUAJE PENAL
   ------------------------------------------------------------
   No censura: MARCA. Lo que atribuye responsabilidad penal a una
   persona («corrupto», «condenado», «malversación») entra en la cola
   con `escalated: true` y se revisa antes que el resto.

   Vive en su propio archivo porque lo usan las dos orillas: el
   formulario, para avisar a quien escribe de que su texto irá a
   revisión reforzada, y el servidor, que es quien lo decide de
   verdad. El cliente puede saltárselo; el servidor, no.
   ============================================================ */

/** Compara sin acentos ni mayúsculas: «malversación» y «malversacion»
    son la misma palabra para este filtro. */
const plano = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function needsEscalation(
  text: string,
  words: readonly string[] = MODERATION.escalate,
): boolean {
  const n = plano(text);
  return words.some((w) => n.includes(plano(w)));
}
