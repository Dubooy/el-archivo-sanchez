/* Punto de entrada de Auth.js. Aquí aterrizan /api/auth/signin,
   /api/auth/callback/... y /api/auth/signout. La configuración vive
   en src/lib/auth.ts; este archivo solo la expone. */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
