import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

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
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
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
        name: null,
        image: null,
      };
      return session;
    },
  },
});