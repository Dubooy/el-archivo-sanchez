import type { MetadataRoute } from "next";
import { SITE_URL } from "./layout";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Ni la cola de moderación, ni el formulario, ni los perfiles ni el
      // buscador aportan nada a un índice público.
      disallow: ["/moderacion", "/aportar", "/buscar", "/perfil"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
