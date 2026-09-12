"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { MODERATION } from "./config";
import { needsEscalation } from "./moderation";
import { requireRole, requireUser } from "./session";
import {
  comprobar,
  enlace,
  esFallo,
  exito,
  fallo,
  opcion,
  texto,
  type Resultado,
} from "@/server/guard";

/* ============================================================
   MUTACIONES  ·  todo lo que escribe en la base de datos
   ------------------------------------------------------------
   Son Server Actions: funciones que se ejecutan SOLO en el servidor
   y que el formulario llama directamente, sin escribir un `fetch` ni
   montar una API a mano. Se eligieron frente a Route Handlers por
   tres razones concretas:

     · El formulario funciona aunque falle el JavaScript del
       navegador (`<form action={…}>` envía igual).
     · No hay una URL pública que alguien pueda llamar con datos
       arbitrarios sin pasar por la comprobación: la puerta es la
       misma función.
     · Los tipos son los mismos a los dos lados; no hay que mantener
       un contrato JSON en paralelo.

   TODAS empiezan por `comprobar(...)`, que exige sesión, limita el
   ritmo y repite el antispam en el servidor. Si eso falla, no se
   toca la base de datos.

   Y todas las aportaciones nacen PENDIENTE. Publicar es una decisión
   humana, siempre.
   ============================================================ */

const STANCES = ["A_FAVOR", "EN_CONTRA", "FALTA_CONTEXTO", "APORTO_FUENTE", "DETECTO_ERROR"] as const;
const COUNTER_KINDS = ["video", "declaracion", "documento", "noticia", "dato", "explicacion"] as const;
const SUBMISSION_KINDS = [
  "video",
  "noticia",
  "documento",
  "declaracion",
  "fuente",
  "contradiccion",
  "dato",
  "otro",
] as const;
const VOTE_OPTIONS = ["FUNDAMENTADA", "NO_DE_ACUERDO", "FALTA_EVIDENCIA", "FALTA_CONTEXTO"] as const;
const ACCIONES = ["APROBAR", "RECHAZAR", "PEDIR_INFO"] as const;

/* ------------------------------------------------------------------
   1. APORTAR AL ARCHIVO
   ------------------------------------------------------------------ */

export async function enviarAportacion(_prev: Resultado | null, formData: FormData): Promise<Resultado> {
  const puerta = await comprobar(formData, { ruta: "aportar", maximo: 5 });
  if (esFallo(puerta)) return puerta;
  const { user } = puerta.ctx;

  const kind = opcion(formData, "kind", SUBMISSION_KINDS, "Tipo");
  if (esFallo(kind)) return kind;

  const subjectId = String(formData.get("subject") ?? "");
  const sujeto = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!sujeto) return fallo("El sujeto indicado no existe.", "subject");

  const title = texto(formData, "title", { min: 8, max: 180, etiqueta: "Título" });
  if (esFallo(title)) return title;

  const description = texto(formData, "description", { min: 20, max: 2000, etiqueta: "Descripción" });
  if (esFallo(description)) return description;

  // Algunos tipos no se aceptan sin fuente: es la regla de
  // MODERATION.requiresSource, y aquí es donde se hace cumplir.
  const exigeFuente = (MODERATION.requiresSource as readonly string[]).includes(kind);
  const url = enlace(formData, "url", { obligatorio: exigeFuente, etiqueta: "Enlace" });
  if (esFallo(url)) return url;

  const context = texto(formData, "context", { min: 0, max: 1000, etiqueta: "Contexto" });
  if (esFallo(context)) return context;
  const whyRelevant = texto(formData, "whyRelevant", { min: 0, max: 1000, etiqueta: "Relevancia" });
  if (esFallo(whyRelevant)) return whyRelevant;
  const userConclusion = texto(formData, "userConclusion", { min: 0, max: 1000, etiqueta: "Conclusión" });
  if (esFallo(userConclusion)) return userConclusion;

  // El filtro de lenguaje penal mira TODO el envío, no solo un campo.
  const escalated = needsEscalation(
    [title, description, whyRelevant, userConclusion].join(" "),
    MODERATION.escalate,
  );

  const creada = await prisma.submission.create({
    data: {
      kind,
      subjectId,
      title,
      url: url ?? "",
      description,
      approxDate: String(formData.get("approxDate") ?? "").slice(0, 40),
      context,
      whyRelevant,
      // La conclusión del usuario se guarda SIEMPRE como opinión y
      // nunca se copia al archivo. Es lo que separa aportar de
      // editorializar.
      userConclusion,
      byId: user.id,
      reviewState: "PENDIENTE",
      escalated,
      ipHash: puerta.ctx.ip,
    },
    select: { id: true, escalated: true },
  });

  revalidatePath("/moderacion");
  revalidatePath("/comunidad");

  return exito(
    escalated
      ? "Recibido. Como menciona responsabilidad penal, pasa a revisión reforzada antes que el resto."
      : "Recibido. Queda PENDIENTE: nadie lo ve hasta que un moderador lo acepte.",
    creada,
  );
}

/* ------------------------------------------------------------------
   2. DEBATE
   ------------------------------------------------------------------ */

export async function enviarComentario(_prev: Resultado | null, formData: FormData): Promise<Resultado> {
  const puerta = await comprobar(formData, { ruta: "comentar", maximo: 10 });
  if (esFallo(puerta)) return puerta;
  const { user } = puerta.ctx;

  const dossierId = String(formData.get("dossierId") ?? "");
  const expediente = await prisma.dossier.findUnique({ where: { id: dossierId }, select: { id: true } });
  if (!expediente) return fallo("Ese expediente no existe.");

  const stance = opcion(formData, "stance", STANCES, "Postura");
  if (esFallo(stance)) return stance;

  const text = texto(formData, "text", { min: 12, max: 2000, etiqueta: "Comentario" });
  if (esFallo(text)) return text;

  // «Aporto una fuente» sin fuente no es aportar una fuente.
  const sourceUrl = enlace(formData, "sourceUrl", {
    obligatorio: stance === "APORTO_FUENTE",
    etiqueta: "Enlace",
  });
  if (esFallo(sourceUrl)) return sourceUrl;

  const escalated = needsEscalation(text, MODERATION.escalate);

  const creado = await prisma.comment.create({
    data: {
      dossierId,
      byId: user.id,
      stance,
      text,
      sourceUrl,
      reviewState: "PENDIENTE",
      escalated,
      ipHash: puerta.ctx.ip,
    },
    select: { id: true },
  });

  revalidatePath(`/expedientes/${dossierId}`);
  revalidatePath("/moderacion");

  return exito(
    escalated
      ? "Enviado. Menciona responsabilidad penal, así que va a revisión reforzada."
      : "Enviado. Se publicará cuando un moderador lo acepte.",
    creado,
  );
}

export async function enviarContraevidencia(
  _prev: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const puerta = await comprobar(formData, { ruta: "contraevidencia", maximo: 6 });
  if (esFallo(puerta)) return puerta;
  const { user } = puerta.ctx;

  const dossierId = String(formData.get("dossierId") ?? "");
  const expediente = await prisma.dossier.findUnique({ where: { id: dossierId }, select: { id: true } });
  if (!expediente) return fallo("Ese expediente no existe.");

  const kind = opcion(formData, "kind", COUNTER_KINDS, "Tipo de material");
  if (esFallo(kind)) return kind;

  const text = texto(formData, "text", { min: 12, max: 2000, etiqueta: "Descripción" });
  if (esFallo(text)) return text;

  // Aquí la fuente NO es opcional: contraevidencia sin material es
  // una opinión, y las opiniones van al debate.
  const url = enlace(formData, "url", { obligatorio: true, etiqueta: "Enlace al material" });
  if (esFallo(url)) return url;

  const creada = await prisma.counterEvidence.create({
    data: { dossierId, byId: user.id, kind, text, url, reviewState: "PENDIENTE" },
    select: { id: true },
  });

  revalidatePath(`/expedientes/${dossierId}`);
  revalidatePath("/moderacion");
  return exito("Recibida. Si resiste la comprobación, se incorpora al expediente.", creada);
}

export async function enviarCorreccion(_prev: Resultado | null, formData: FormData): Promise<Resultado> {
  const puerta = await comprobar(formData, { ruta: "correccion", maximo: 6 });
  if (esFallo(puerta)) return puerta;
  const { user } = puerta.ctx;

  const targetId = String(formData.get("targetId") ?? "");
  const targetLabel = String(formData.get("targetLabel") ?? "").slice(0, 200);
  if (!targetId) return fallo("Falta indicar qué registro se corrige.");

  const whatIsWrong = texto(formData, "whatIsWrong", { min: 8, max: 500, etiqueta: "Qué está mal" });
  if (esFallo(whatIsWrong)) return whatIsWrong;

  const why = texto(formData, "why", { min: 12, max: 1500, etiqueta: "Por qué" });
  if (esFallo(why)) return why;

  // Obligatoria, y además la base de datos tiene una restricción
  // CHECK que rechaza una corrección sin fuente.
  const sourceUrl = enlace(formData, "sourceUrl", { obligatorio: true, etiqueta: "Fuente" });
  if (esFallo(sourceUrl)) return sourceUrl;

  const creada = await prisma.correction.create({
    data: {
      targetType: targetId.split("-")[0] === "exp" ? "dossier" : "registro",
      targetId,
      targetLabel,
      byId: user.id,
      whatIsWrong,
      why,
      sourceUrl: sourceUrl as string,
      reviewState: "PENDIENTE",
    },
    select: { id: true },
  });

  revalidatePath("/moderacion");
  revalidatePath("/comunidad");
  return exito("Anotada. Si se confirma, la corrección queda visible en el historial.", creada);
}

/* ------------------------------------------------------------------
   3. VOTO
   Mide percepción, no verdad. Un voto por persona y expediente: la
   restricción única de la base de datos lo garantiza, y cambiar de
   opinión actualiza la fila en lugar de añadir otra.
   ------------------------------------------------------------------ */

export async function emitirVoto(_prev: Resultado | null, formData: FormData): Promise<Resultado> {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return fallo(e instanceof Error ? e.message : "Necesitas iniciar sesión para votar.");
  }

  const dossierId = String(formData.get("dossierId") ?? "");
  const option = opcion(formData, "option", VOTE_OPTIONS, "Voto");
  if (esFallo(option)) return option;

  const expediente = await prisma.dossier.findUnique({ where: { id: dossierId }, select: { id: true } });
  if (!expediente) return fallo("Ese expediente no existe.");

  await prisma.vote.upsert({
    where: { dossierId_userId: { dossierId, userId: user.id } },
    create: { dossierId, userId: user.id, option },
    update: { option },
  });

  revalidatePath(`/expedientes/${dossierId}`);
  return exito("Tu voto está registrado. Recuerda: mide opinión, no verifica hechos.");
}

/* ------------------------------------------------------------------
   4. MODERACIÓN
   A partir de aquí hace falta papel de MODERADOR. Toda decisión
   queda anotada en moderation_log con su motivo: sirve para rendir
   cuentas, para deshacer y para responder a un requerimiento legal.
   ------------------------------------------------------------------ */

async function anotar(
  byId: string,
  action: "APROBAR" | "RECHAZAR" | "PEDIR_INFO" | "INCORPORAR",
  targetType: string,
  targetId: string,
  reason: string,
) {
  await prisma.moderationEntry.create({
    data: { byId, action, targetType, targetId, reason },
  });
}

export async function moderarAportacion(_prev: Resultado | null, formData: FormData): Promise<Resultado> {
  let mod;
  try {
    mod = await requireRole("MODERADOR");
  } catch (e) {
    return fallo(e instanceof Error ? e.message : "No tienes permisos.");
  }

  const id = String(formData.get("id") ?? "");
  const accion = opcion(formData, "accion", ACCIONES, "Acción");
  if (esFallo(accion)) return accion;

  const nota = String(formData.get("nota") ?? "").trim().slice(0, 500);
  // Rechazar sin motivo escrito no es moderar: es descartar.
  if (accion !== "APROBAR" && nota.length < 4) {
    return fallo("Escribe el motivo: quien lo envió tiene derecho a saber por qué.", "nota");
  }

  const estado = accion === "APROBAR" ? "VERIFICADO" : accion === "RECHAZAR" ? "RECHAZADO" : "NECESITA_INFO";

  const actualizada = await prisma.submission.update({
    where: { id },
    data: {
      reviewState: estado,
      moderatorNote: nota,
      moderatedById: mod.id,
      moderatedAt: new Date(),
      // Lo rechazado se conserva 12 meses para poder justificar la
      // decisión, y después se purga (política de privacidad).
      purgeAfter:
        accion === "RECHAZAR" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
    },
    select: { id: true, title: true, by: { select: { handle: true } } },
  });

  await anotar(mod.id, accion, "submission", id, nota || "Aceptada sin observaciones.");

  if (accion === "APROBAR") {
    await prisma.activityEvent.create({
      data: {
        kind: "APORTACION",
        layer: "COMUNIDAD",
        text: `aportó material aceptado por moderación: «${actualizada.title.slice(0, 60)}».`,
        href: "/comunidad",
        actorId: null,
      },
    });
  }

  revalidatePath("/moderacion");
  revalidatePath("/comunidad");
  return exito(
    accion === "APROBAR"
      ? "Aceptada. Pasa al archivo y queda anotada en el registro de moderación."
      : accion === "RECHAZAR"
        ? "Rechazada, con el motivo visible para quien la envió."
        : "Devuelta: se le pide más información a quien la envió.",
  );
}

export async function moderarComentario(_prev: Resultado | null, formData: FormData): Promise<Resultado> {
  let mod;
  try {
    mod = await requireRole("MODERADOR");
  } catch (e) {
    return fallo(e instanceof Error ? e.message : "No tienes permisos.");
  }

  const id = String(formData.get("id") ?? "");
  const accion = opcion(formData, "accion", ACCIONES, "Acción");
  if (esFallo(accion)) return accion;
  const nota = String(formData.get("nota") ?? "").trim().slice(0, 500);
  if (accion !== "APROBAR" && nota.length < 4) {
    return fallo("Escribe el motivo del rechazo.", "nota");
  }

  const comentario = await prisma.comment.update({
    where: { id },
    data: {
      reviewState: accion === "APROBAR" ? "VERIFICADO" : accion === "RECHAZAR" ? "RECHAZADO" : "NECESITA_INFO",
      // publishedAt solo se rellena si queda VERIFICADO: hay una
      // restricción CHECK que rechaza cualquier otra combinación.
      publishedAt: accion === "APROBAR" ? new Date() : null,
      moderatedById: mod.id,
    },
    select: { id: true, dossierId: true },
  });

  await anotar(mod.id, accion, "comment", id, nota || "Aceptado sin observaciones.");

  revalidatePath(`/expedientes/${comentario.dossierId}`);
  revalidatePath("/moderacion");
  return exito(accion === "APROBAR" ? "Comentario publicado." : "Comentario retirado de la cola.");
}

/** Incorporar contraevidencia al expediente es una decisión
    editorial, no de moderación: exige papel de EDITOR. */
export async function incorporarContraevidencia(
  _prev: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  let editor;
  try {
    editor = await requireRole("EDITOR");
  } catch (e) {
    return fallo(e instanceof Error ? e.message : "No tienes permisos.");
  }

  const id = String(formData.get("id") ?? "");
  const motivo = String(formData.get("nota") ?? "").trim().slice(0, 500);
  if (motivo.length < 8) {
    return fallo("Explica qué aporta esta contraevidencia al expediente.", "nota");
  }

  const fila = await prisma.counterEvidence.update({
    where: { id },
    data: { reviewState: "VERIFICADO", incorporated: true, moderatedById: editor.id },
    select: { id: true, dossierId: true },
  });

  await anotar(editor.id, "INCORPORAR", "counterEvidence", id, motivo);
  await prisma.activityEvent.create({
    data: {
      kind: "EVIDENCIA_INCORPORADA",
      layer: "VERIFICACION",
      text: `incorporó contraevidencia al expediente y anotó el motivo.`,
      href: `/expedientes/${fila.dossierId}`,
      actorId: editor.id,
    },
  });

  revalidatePath(`/expedientes/${fila.dossierId}`);
  return exito("Incorporada. El expediente queda marcado como actualizado.");
}

export async function resolverCorreccion(_prev: Resultado | null, formData: FormData): Promise<Resultado> {
  let mod;
  try {
    mod = await requireRole("MODERADOR");
  } catch (e) {
    return fallo(e instanceof Error ? e.message : "No tienes permisos.");
  }

  const id = String(formData.get("id") ?? "");
  const accion = opcion(formData, "accion", ACCIONES, "Acción");
  if (esFallo(accion)) return accion;
  const resolution = String(formData.get("nota") ?? "").trim().slice(0, 800);
  // Aquí el motivo es obligatorio SIEMPRE, se acepte o se rechace:
  // quien señala un error tiene derecho a una respuesta motivada.
  if (resolution.length < 8) {
    return fallo("Escribe la resolución: quien propuso la corrección tiene derecho a leerla.", "nota");
  }

  await prisma.correction.update({
    where: { id },
    data: {
      reviewState: accion === "APROBAR" ? "VERIFICADO" : accion === "RECHAZAR" ? "RECHAZADO" : "NECESITA_INFO",
      resolution,
      resolvedById: mod.id,
      resolvedAt: new Date(),
    },
  });

  await anotar(mod.id, accion, "correction", id, resolution);

  if (accion === "APROBAR") {
    await prisma.activityEvent.create({
      data: {
        kind: "CORRECCION_ACEPTADA",
        layer: "VERIFICACION",
        text: "aceptó una corrección propuesta por la comunidad.",
        href: "/comunidad",
        actorId: mod.id,
      },
    });
  }

  revalidatePath("/moderacion");
  revalidatePath("/comunidad");
  return exito("Resuelta, con la respuesta visible para quien la propuso.");
}
