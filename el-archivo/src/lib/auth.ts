import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { handleDesde } from "@/lib/utils";
/* ============================================================
   AUTENTICACIÓN  ·  Auth.js (NextAuth v5)
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

export const DEV_LOGIN =
  process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_LOGIN === "1";

export const AUTH_READY = hayCorreo || hayGoogle || hayGitHub || DEV_LOGIN;

function handleDesde(email: string | null | undefined, fallback: string): string {
  const base = (email?.split("@")[0] ?? fallback)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 20)
    .replace(/^_|_$/g, "");
  return `@${base || "usuario"}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },

  pages: { signIn: "/acceder", verifyRequest: "/acceder?revisa=1", error: "/acceder" },

  trustHost: true,

  providers: [
    ...(hayCorreo
      ? [
          Nodemailer({
            server: process.env.AUTH_EMAIL_SERVER!,
            from: process.env.AUTH_EMAIL_FROM!,
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
    async signIn({ user, profile }) {
      // 1. Bloquear acceso si el usuario está suspendido o eliminado
      if (user?.id) {
        const row = await prisma.user.findUnique({ where: { id: user.id } });
        if (row?.suspendedAt || row?.deletedAt) return false;
      }

      // 2. Sincronizar nombre y foto del proveedor OAuth (Google/GitHub) en la BD
      if (profile && user.email) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: profile.name ?? user.name,
              image: (profile.picture as string) ?? profile.avatar_url ?? user.image,
            },
          });
        } catch (e) {
          // Si el usuario aún no existe (primer login), el adapter lo creará automáticamente
        }
      }

      return true;
    },

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
      if (token.uid && session.user) {
        session.user.id = String(token.uid);
        session.user.handle = String(token.handle ?? "@usuario");
        session.user.role = (token.role as any) ?? "USUARIO";
        session.user.suspended = Boolean(token.suspended);
      }
      return session;
    },
  },
});
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
