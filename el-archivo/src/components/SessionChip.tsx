"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

/* ============================================================
   QUIÉN ESTÁ MIRANDO
   ------------------------------------------------------------
   Se resuelve en el cliente a propósito. Si la cabecera leyera la
   sesión en el servidor, TODAS las páginas del sitio pasarían a
   renderizarse en cada petición —el archivo entero dejaría de ser
   cacheable— solo por pintar un apodo en una esquina.

   Lo que esto pinta es informativo. Ningún permiso depende de este
   componente: cada acción vuelve a comprobar la sesión en el
   servidor, donde no se puede falsear.
   ============================================================ */

export function SessionChip({ className = "" }: { className?: string }) {
  const { data, status } = useSession();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function fuera(e: MouseEvent) {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    }
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  // Mientras se resuelve no se pinta ni «Entrar» ni el apodo: un
  // botón que cambia de texto medio segundo después mueve la
  // cabecera entera y da sensación de error.
  if (status === "loading") {
    return <span className={`hidden h-9 w-[92px] shrink-0 sm:block ${className}`} aria-hidden />;
  }

  if (status !== "authenticated" || !data?.user?.handle) {
    return (
      <Link
        href="/acceder"
        className={`hidden shrink-0 border-[1.5px] border-[var(--edge)] bg-[var(--panel)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-brut-sm sm:inline-flex ${className}`}
      >
        Entrar
      </Link>
    );
  }

  const u = data.user;
  const esEquipo = u.role !== "USUARIO";

  return (
    <div ref={caja} className={`relative hidden shrink-0 sm:block ${className}`}>
      <button
        type="button"
        onClick={() => setAbierto((o) => !o)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="flex items-center gap-2 border-[1.5px] border-[var(--edge)] bg-[var(--panel)] px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-brut-sm"
      >
        <span
          aria-hidden
          className="grid h-[18px] w-[18px] place-items-center border border-[var(--edge)] bg-[var(--red)] text-[9px] font-bold text-white"
        >
          {u.handle.replace("@", "").charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[92px] truncate normal-case tracking-normal">{u.handle}</span>
      </button>

      {abierto ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[210px] border-[1.5px] border-[var(--edge)] bg-[var(--paper)] shadow-brut"
        >
          <div className="border-b px-3 py-2.5">
            <p className="font-mono text-[11px]">{u.handle}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
              {u.suspended ? "Cuenta suspendida" : u.role.toLowerCase()}
            </p>
          </div>

          <Link
            href={`/perfil/${u.handle.replace("@", "")}`}
            role="menuitem"
            className="block px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors hover:bg-[var(--panel-2)]"
            onClick={() => setAbierto(false)}
          >
            Tu perfil
          </Link>
          <Link
            href="/aportar"
            role="menuitem"
            className="block px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors hover:bg-[var(--panel-2)]"
            onClick={() => setAbierto(false)}
          >
            Aportar al archivo
          </Link>
          {esEquipo ? (
            <Link
              href="/moderacion"
              role="menuitem"
              className="block px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors hover:bg-[var(--panel-2)]"
              onClick={() => setAbierto(false)}
            >
              Cola de moderación
            </Link>
          ) : null}

          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full border-t px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--red)] transition-colors hover:bg-[var(--red-wash)]"
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Versión plana para el menú móvil, donde no cabe un desplegable. */
export function SessionLinksMovil() {
  const { data, status } = useSession();

  if (status === "loading") return null;

  if (status !== "authenticated" || !data?.user?.handle) {
    return (
      <Link href="/acceder" className="btn-red w-full justify-center">
        Entrar o crear cuenta
      </Link>
    );
  }

  const u = data.user;
  return (
    <div className="grid gap-2">
      <Link href={`/perfil/${u.handle.replace("@", "")}`} className="btn w-full justify-center">
        {u.handle}
      </Link>
      {u.role !== "USUARIO" ? (
        <Link href="/moderacion" className="btn w-full justify-center">
          Cola de moderación
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="btn w-full justify-center text-[var(--red)]"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
