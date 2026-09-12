import type { Config } from "tailwindcss";

/* ============================================================
   Los colores viven en globals.css como variables CSS, para que
   se puedan cambiar en un solo sitio y funcionen en claro y oscuro.
   Aquí solo se declaran los alias que Tailwind necesita conocer.
   ============================================================ */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ground: "var(--ground)",
        panel: "var(--panel)",
        line: "var(--line)",
        line2: "var(--line-2)",
        ink: "var(--ink)",
        ink2: "var(--ink-2)",
        ink3: "var(--ink-3)",
        red: "var(--red)",
        "red-deep": "var(--red-deep)",
        ok: "var(--ok)",
        warn: "var(--warn)",
        mixed: "var(--mixed)",
        open: "var(--open)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        /* Sombras paralelas duras, sin difuminado: el lenguaje brutalista. */
        brut: "var(--shadow)",
        "brut-sm": "var(--shadow-sm)",
        "brut-lg": "var(--shadow-lg)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        mega: "-0.05em",
      },
      maxWidth: {
        read: "68ch",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "bar-grow": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "bar-rise": { from: { transform: "scaleY(0)" }, to: { transform: "scaleY(1)" } },
        "draw-line": { from: { transform: "scaleY(0)" }, to: { transform: "scaleY(1)" } },
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0.2" } },
      },
      animation: {
        "fade-up": "fade-up .45s cubic-bezier(.16,1,.3,1) both",
        "fade-in": "fade-in .35s ease both",
        "bar-grow": "bar-grow .8s cubic-bezier(.16,1,.3,1) both",
        "bar-rise": "bar-rise .8s cubic-bezier(.16,1,.3,1) both",
        "draw-line": "draw-line .9s cubic-bezier(.16,1,.3,1) both",
        blink: "blink 1.6s steps(1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
