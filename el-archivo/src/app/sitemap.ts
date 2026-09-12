import type { MetadataRoute } from "next";
import { getDossiers, getMeta, getStatements, getUsers } from "@/lib/data";
import { MODULES } from "@/lib/config";
import { SITE_URL } from "./layout";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [meta, dossiers, statements, users] = await Promise.all([
    getMeta(),
    getDossiers(),
    getStatements(),
    getUsers(),
  ]);
  const now = new Date(meta.lastUpdated);

  const statics = [
    "",
    MODULES.statements && "/declaraciones",
    MODULES.contradictions && "/contradicciones",
    MODULES.promises && "/promesas",
    MODULES.dossiers && "/expedientes",
    MODULES.timeline && "/cronologia",
    MODULES.community && "/comunidad",
    MODULES.sources && "/fuentes",
    MODULES.viralQuotes && "/realmente-lo-dijo",
    MODULES.judicial && "/investigaciones",
    "/sujetos",
    "/datos",
    "/metodologia",
    "/legal/aviso-legal",
    "/legal/privacidad",
    "/legal/cookies",
  ].filter(Boolean) as string[];

  const dynamic = [
    ...dossiers.map((d) => `/expedientes/${d.id}`),
    ...statements.map((s) => `/declaraciones/${s.id}`),
    ...users.map((u) => `/perfil/${u.handle.replace("@", "")}`),
  ];

  return [
    ...statics.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...dynamic.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
