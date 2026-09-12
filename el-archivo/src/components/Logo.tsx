/* ============================================================
   LOGOTIPO
   Silueta geométrica anónima dentro de un marco, con la barra de
   censura tapando la mirada: el signo de "expediente clasificado".
   Es vectorial y de dos tintas (la tinta actual + el rojo), así que
   funciona igual en tema claro y oscuro, y en cualquier tamaño.

   Deliberadamente NO es el retrato de nadie: la ficha del sujeto
   vive en los datos, no en la marca.
   ============================================================ */
export function Logo({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="El Archivo Sánchez"
      className={className}
    >
      <clipPath id="logo-frame">
        <rect x="2" y="2" width="28" height="28" />
      </clipPath>
      <g clipPath="url(#logo-frame)">
        <circle cx="16" cy="13" r="6.4" fill="currentColor" />
        <path d="M4 31c0-6.6 5.4-10 12-10s12 3.4 12 10z" fill="currentColor" />
        <rect x="4" y="10.6" width="24" height="4.6" fill="var(--red)" />
      </g>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        stroke="currentColor"
        strokeWidth="2.4"
        fill="none"
      />
    </svg>
  );
}
