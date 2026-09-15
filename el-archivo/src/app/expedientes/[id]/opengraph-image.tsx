import { ImageResponse } from "next/og";
import { getDossier } from "@/lib/data";
import { SITE } from "@/lib/config";

// Igual que la OG genérica: dinámica, sin llamadas de red en build.
export const dynamic = "force-dynamic";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Los colores de EVIDENCE viven como var(--x) para el DOM real; aquí,
   dentro de @vercel/og, no hay hoja de estilos que las resuelva, así
   que se repiten en hexadecimal (mismos valores que globals.css,
   tema claro). Es la única duplicación deliberada del proyecto: el
   coste de mantenerla al día es menor que el de renderizar sin CSS. */
const EVIDENCE_HEX: Record<string, string> = {
  RESPALDADO: "#14713c",
  PARCIALMENTE_RESPALDADO: "#b25607",
  EVIDENCIA_INSUFICIENTE: "#8f6500",
  CONTRADICCION_DOCUMENTADA: "#d81e2c",
  NO_VERIFICABLE: "#5d5d64",
  EN_INVESTIGACION: "#1a4bb0",
};

const EVIDENCE_LABEL: Record<string, string> = {
  RESPALDADO: "RESPALDADO",
  PARCIALMENTE_RESPALDADO: "PARCIALMENTE RESPALDADO",
  EVIDENCIA_INSUFICIENTE: "EVIDENCIA INSUFICIENTE",
  CONTRADICCION_DOCUMENTADA: "CONTRADICCIÓN DOCUMENTADA",
  NO_VERIFICABLE: "NO VERIFICABLE",
  EN_INVESTIGACION: "EN INVESTIGACIÓN",
};

export default async function OG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getDossier(id);

  const color = d ? (EVIDENCE_HEX[d.evidence] ?? "#5d5d64") : "#5d5d64";
  const etiqueta = d ? (EVIDENCE_LABEL[d.evidence] ?? d.evidence) : "EXPEDIENTE";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f4f5",
          padding: 72,
          color: "#000000",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#ffffff",
                marginTop: -6,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 14,
                height: 6,
                background: "#d81e2c",
              }}
            />
          </div>
          <div style={{ fontSize: 20, letterSpacing: 3, color: "#5d5d64" }}>
            {SITE.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `2px solid ${color}`,
              color,
              fontSize: 22,
              letterSpacing: 2,
              padding: "8px 16px",
              alignSelf: "flex-start",
              marginBottom: 28,
            }}
          >
            {etiqueta}
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>
            {d ? d.title : "Expediente no encontrado"}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: "#5d5d64" }}>
          DOCUMENTAR. CONTRASTAR. <span style={{ color: "#d81e2c", marginLeft: 8 }}>DEBATIR.</span>
        </div>
      </div>
    ),
    size,
  );
}
