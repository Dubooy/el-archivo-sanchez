"use client";

import { useState } from "react";

/** Microinteracción: toda acción importante confirma que ocurrió. */
export function CopyButton({
  text,
  label = "Copiar",
  done = "Copiado.",
  className = "",
}: {
  text: string;
  label?: string;
  done?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Sin permiso de portapapeles: no mentimos al usuario, le damos el texto.
      window.prompt("Copia el texto manualmente:", text);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`btn ${className}`}
      style={copied ? { background: "var(--ink)", color: "var(--paper)" } : undefined}
      aria-live="polite"
    >
      <span aria-hidden>{copied ? "✓" : "⧉"}</span>
      {copied ? done : label}
    </button>
  );
}
