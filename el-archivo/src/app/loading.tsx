export default function Loading() {
  return (
    <div className="wrap flex min-h-[50vh] items-center justify-center py-24">
      <p
        className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-3)]"
        role="status"
        aria-live="polite"
      >
        Abriendo el archivo
        <span className="ml-1 animate-blink" aria-hidden>
          ▌
        </span>
      </p>
    </div>
  );
}
