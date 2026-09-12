import { auth } from "./auth";

/* ============================================================
   SESIÓN Y PERMISOS
   ------------------------------------------------------------
   Un solo sitio decide quién puede hacer qué. Las acciones del
   servidor empiezan SIEMPRE llamando aquí: si esto lanza, no se
   ejecuta ninguna mutación.

   Los papeles, de menos a más:
     USUARIO    aporta, comenta, vota, propone correcciones
     MODERADOR  además, acepta o rechaza lo que entra en la cola
     EDITOR     además, incorpora contraevidencia y cambia evidencia
     ADMIN      además, gestiona cuentas
   ============================================================ */

export type Role = "USUARIO" | "MODERADOR" | "EDITOR" | "ADMIN";

const JERARQUIA: Record<Role, number> = { USUARIO: 0, MODERADOR: 1, EDITOR: 2, ADMIN: 3 };

export type SessionUser = { id: string; handle: string; role: Role; suspended: boolean };

/** Quién está mirando, o null si nadie ha iniciado sesión. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    handle: session.user.handle,
    role: session.user.role,
    suspended: session.user.suspended,
  };
}

/** Error con mensaje pensado para enseñárselo a una persona. */
export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: "SIN_SESION" | "SUSPENDIDO" | "SIN_PERMISO",
  ) {
    super(message);
  }
}

/** Exige sesión. Lo primero de toda mutación. */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) {
    throw new AuthError("Necesitas iniciar sesión para participar.", "SIN_SESION");
  }
  if (user.suspended) {
    throw new AuthError("Tu cuenta está suspendida y no puede escribir.", "SUSPENDIDO");
  }
  return user;
}

/** Exige un papel mínimo. Se usa en la cola de moderación. */
export async function requireRole(min: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (JERARQUIA[user.role] < JERARQUIA[min]) {
    throw new AuthError("No tienes permisos para esta acción.", "SIN_PERMISO");
  }
  return user;
}

export async function isModerator(): Promise<boolean> {
  const user = await currentUser();
  return Boolean(user && JERARQUIA[user.role] >= JERARQUIA.MODERADOR);
}
