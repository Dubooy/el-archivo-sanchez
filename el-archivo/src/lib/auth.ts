import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";

/* ============================================================
   AUTENTICACIÓN  ·  Auth.js (NextAuth v5)
   ------------------------------------------------------------
   Tres formas de entrar, y las tres acaban en la misma tabla:

     · Enlace mágico por correo — sin contraseñas que robar.
     · Google y GitHub — un clic, para quien ya tenga cuenta.
     · Acceso de desarrollo — SOLO fuera de producción, para poder
       probar el circuito completo sin montar un servidor de correo.

   Cada proveedor se activa solo si están sus variables de entorno.
   Así el proyecto arranca desde el primer minuto y vas añadiendo
   formas de acceso a medida que las configuras.

   IDENTIDAD PÚBLICA: de una cuenta solo se muestra el `handle`.
   Ni el correo, ni el nombre real, ni la foto del proveedor. Es lo
   que promete la política de privacidad y aquí es donde se cumple.
   ============================================================ */

/** Lo que añadimos a la sesión además de lo que trae Auth.js. */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      handle: string;
      role: "USUARIO" | "MODERADOR" | "EDITOR" | "ADMIN";
      suspended: boolean;
    } & DefaultSession["user"];
  }
}

const hayCorreo = Boolean(process.env.AUTH_EMAIL_SERVER && process.env.AUTH_EMAIL_FROM);
const hayGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const hayGitHub = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
/** El acceso de desarrollo NUNCA se enciende en producción, aunque
    la variable esté puesta por error. Dos condiciones, no una. */
export const DEV_LOGIN =
  process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_LOGIN === "1";

/** ¿Se puede entrar de alguna forma? Lo usan las pantallas para
    explicar qué falta en lugar de enseñar un botón que no lleva
    a ningún sitio. */
export const AUTH_READY = hayCorreo || hayGoogle || hayGitHub || DEV_LOGIN;

/** Apodo legible a partir del correo, sin revelarlo entero.
    «maria.lopez@ejemplo.com» → «@maria_lopez». */
function handleDesde(email: string | null | undefined, fallback: string): string {
  const base = (email?.split("@")[0] ?? fallback)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 20)
    .replace(/^_|_$/g, "");
  return `@${base || "usuario"}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  /* Sesión por JWT y no por tabla: es lo único compatible con el
     acceso de desarrollo (Auth.js no admite el proveedor de
     credenciales con sesiones en base de datos). Si algún día quitas
     ese proveedor, puedes pasar a `strategy: "database"` y usar la
     tabla `sessions`, que ya existe en el esquema. */
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },

  pages: { signIn: "/acceder", verifyRequest: "/acceder?revisa=1", error: "/acceder" },

  // Necesario al desplegar detrás de un proxy (Vercel, Nginx…).
  trustHost: true,

  providers: [
    ...(hayCorreo
      ? [
          Nodemailer({
            server: process.env.AUTH_EMAIL_SERVER!,
            from: process.env.AUTH_EMAIL_FROM!,
            // 15 minutos: suficiente para abrir el correo, poco para
            // que un enlace filtrado siga sirviendo.
            maxAge: 15 * 60,
          }),
        ]
      : []),
    ...(hayGoogle
      ? [Google({ clientId: process.env.AUTH_GOOGLE_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET! })]
      : []),
    ...(hayGitHub
      ? [GitHub({ clientId: process.env.AUTH_GITHUB_ID!, clientSecret: process.env.AUTH_GITHUB_SECRET! })]
      : []),
    ...(DEV_LOGIN
      ? [
          Credentials({
            id: "dev",
            name: "Acceso de desarrollo",
            credentials: { handle: { label: "Apodo de un usuario existente", type: "text" } },
            async authorize(credenciales) {
              // Guardia redundante a propósito: si este código llegara
              // a producción por un despiste, no autentica a nadie.
              if (process.env.NODE_ENV === "production") return null;
              const handle = String(credenciales?.handle ?? "").trim();
              if (!handle) return null;
              const user = await prisma.user.findFirst({
                where: { handle: handle.startsWith("@") ? handle : `@${handle}`, deletedAt: null },
              });
              return user ? { id: user.id, email: user.email ?? undefined } : null;
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    /** Un usuario suspendido no inicia sesión. Conserva su historial;
        lo que pierde es la capacidad de escribir. */
    async signIn({ user }) {
      if (!user?.id) return true;
      const row = await prisma.user.findUnique({ where: { id: user.id } });
      if (row?.suspendedAt) return false;
      if (row?.deletedAt) return false;
      return true;
    },

    /** El apodo y el papel viajan en el token para no consultar la
        base de datos en cada petición. */
    async jwt({ token, user, trigger }) {
      if (user?.id) token.uid = user.id;
      if (token.uid && (trigger === "signIn" || trigger === "update" || !token.handle)) {
        const row = await prisma.user.findUnique({
          where: { id: String(token.uid) },
          select: { handle: true, role: true, suspendedAt: true },
        });
        token.handle = row?.handle ?? "@usuario";
        token.role = row?.role ?? "USUARIO";
        token.suspended = Boolean(row?.suspendedAt);
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: String(token.uid ?? ""),
        handle: String(token.handle ?? "@usuario"),
        role: (token.role as "USUARIO" | "MODERADOR" | "EDITOR" | "ADMIN") ?? "USUARIO",
        suspended: Boolean(token.suspended),
        // Nunca se expone el nombre ni la imagen del proveedor: la
        // identidad pública de esta plataforma es el apodo.
        name: null,
        image: null,
      };
      return session;
    },
  },

  events: {
    /** Auth.js crea la fila sin saber de nuestro `handle` (por eso el
        campo lleva valor por defecto). Aquí se sustituye por un apodo
        legible, garantizando que no choque con otro. */
    async createUser({ user }) {
      if (!user.id) return;
      const base = handleDesde(user.email, user.id.slice(0, 6));
      let candidato = base;
      for (let i = 2; i < 50; i++) {
        const ocupado = await prisma.user.findUnique({ where: { handle: candidato } });
        if (!ocupado) break;
        candidato = `${base}_${i}`;
      }
      await prisma.user.update({
        where: { id: user.id },
        // El nombre y la imagen del proveedor se descartan: no se
        // guarda lo que no se va a usar (minimización, art. 5.1.c).
        data: { handle: candidato, name: null, image: null },
      });
    },
  },
});
