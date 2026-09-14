"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MODULES } from "@/lib/config";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { SessionChip, SessionLinksMovil } from "./SessionChip";

const ALL = [
  { href: "/declaraciones", label: "Declaraciones", hint: "Qué dijo", on: MODULES.statements },
  { href: "/contradicciones", label: "Contradicciones", hint: "Dijo → ocurrió", on: MODULES.contradictions },
  { href: "/promesas", label: "Promesas", hint: "Qué prometió", on: MODULES.promises },
  { href: "/expedientes", label: "Expedientes", hint: "Casos completos", on: MODULES.dossiers },
  { href: "/cronologia", label: "Cronología", hint: "Línea temporal", on: MODULES.timeline },
  { href: "/comunidad", label: "Comunidad", hint: "Debate y aportaciones", on: MODULES.community },
  { href: "/fuentes", label: "Fuentes", hint: "De dónde sale todo", on: MODULES.sources },
];

export function Nav() {
  const links = ALL.filter((l) => l.on);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const burger = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === "Escape") {
        input.current?.blur();
        // Al cerrar con Escape el foco vuelve al botón que abrió el menú:
        // sin esto, quien navega con teclado se queda huérfano al final del documento.
        setOpen((wasOpen) => {
          if (wasOpen) burger.current?.focus();
          return false;
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = (h: string) => pathname === h || pathname.startsWith(`${h}/`);

  return (
    <header className="sticky top-0 z-50 border-b-[1.5px] border-[var(--edge)] bg-[var(--paper)]/95 backdrop-blur-md">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:border-[1.5px] focus:border-[var(--edge)] focus:bg-[var(--ink)] focus:px-3 focus:py-2 focus:font-mono focus:text-[11px] focus:uppercase focus:text-[var(--paper)]"
      >
        Saltar al contenido
      </a>

      <div className="wrap flex h-[58px] items-center gap-3 sm:h-[64px] sm:gap-4">
        {/* Espacio reservado para el logotipo: marca vectorial + rótulo. */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 transition-transform duration-200 ease-out hover:-translate-y-[2px]"
          aria-label="Portada"
        >
          <Logo size={26} className="text-[var(--ink)]" />
          <span className="font-mono text-[13px] font-bold uppercase leading-none tracking-[-0.02em] sm:text-[14px]">
            Archivo
            <span className="text-[var(--red)]">·</span>
            Sánchez
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden flex-1 items-center gap-0.5 xl:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={`px-2.5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-all duration-200 ease-out hover:-translate-y-[2px] ${
                active(l.href) ? "text-[var(--ink)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"
              }`}
            >
              {l.label}
              <span
                className={`mt-1 block h-[2px] w-full transition-all duration-200 ease-out ${
                  active(l.href) ? "bg-[var(--red)]" : "bg-transparent"
                }`}
                aria-hidden
              />
            </Link>
          ))}
        </nav>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim().length >= 2) router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
          }}
          className="ml-auto hidden md:block xl:ml-0"
        >
          <div className="relative">
            <input
              ref={input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en el archivo"
              aria-label="Buscar en el archivo"
              className="field w-[170px] pr-9 2xl:w-[210px]"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 border px-1.5 py-0.5 font-mono text-[9px] text-[var(--ink-3)]">
              /
            </kbd>
          </div>
        </form>

        <ThemeToggle className="ml-auto md:ml-0" />

        <SessionChip />

        <Link href="/aportar" className="btn-red hidden shrink-0 lg:inline-flex">
          + Añadir al archivo
        </Link>

        <button
          ref={burger}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="menu-movil"
          className="flex h-9 w-9 shrink-0 items-center justify-center border-[1.5px] border-[var(--edge)] bg-[var(--panel)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-brut-sm xl:hidden"
        >
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          {/* Hamburguesa dibujada con tres filetes: al abrirse se cruzan. */}
          <span aria-hidden className="relative block h-[12px] w-[16px]">
            <span
              className={`absolute left-0 block h-[2px] w-full bg-[var(--ink)] transition-all duration-200 ease-out ${
                open ? "top-[5px] rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-[5px] block h-[2px] w-full bg-[var(--ink)] transition-all duration-200 ease-out ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-[2px] w-full bg-[var(--ink)] transition-all duration-200 ease-out ${
                open ? "top-[5px] -rotate-45" : "top-[10px]"
              }`}
            />
          </span>
        </button>
      </div>

      {open ? (
        <div
          id="menu-movil"
          className="animate-fade-in border-t-[1.5px] border-[var(--edge)] bg-[var(--paper)] xl:hidden"
        >
          <div className="wrap py-4">
            <form
              role="search"
              className="mb-4 md:hidden"
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim().length >= 2) router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
              }}
            >
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar en el archivo"
                aria-label="Buscar en el archivo"
                className="field"
              />
            </form>
            <ul className="stack-line border-t">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-baseline justify-between py-3 transition-all duration-200 ease-out hover:translate-x-1"
                  >
                    <span
                      className={`font-mono text-[12px] uppercase tracking-[0.12em] ${
                        active(l.href) ? "text-[var(--red)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {l.label}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--ink-3)]">{l.hint}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/metodologia"
                  className="flex items-baseline justify-between py-3 transition-all duration-200 ease-out hover:translate-x-1"
                >
                  <span className="font-mono text-[12px] uppercase tracking-[0.12em]">Metodología</span>
                  <span className="font-mono text-[10px] text-[var(--ink-3)]">Cómo funciona</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/colaborar"
                  className="flex items-baseline justify-between py-3 transition-all duration-200 ease-out hover:translate-x-1"
                >
                  <span className="font-mono text-[12px] uppercase tracking-[0.12em]">Colaborar</span>
                  <span className="font-mono text-[10px] text-[var(--ink-3)]">Sé editor o moderador</span>
                </Link>
              </li>
            </ul>
            <Link href="/aportar" className="btn-red mt-5 w-full justify-center">
              + Añadir al archivo
            </Link>
            <div className="mt-3">
              <SessionLinksMovil />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
