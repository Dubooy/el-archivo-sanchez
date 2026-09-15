import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";

// No prerenderizar en el build: @vercel/og intentaba resolver/descargar
// una tipografía por defecto con fetch y rompía con Invalid URL.
// En dinámico se genera a petición, sin llamadas de red en build.
export const dynamic = "force-dynamic";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 72,
          color: "#0d0d0c",
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
          <div style={{ fontSize: 21, letterSpacing: 4, color: "#74736c" }}>
            PROYECTO INDEPENDIENTE
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 900, lineHeight: 0.9, letterSpacing: -7 }}>
            EL ARCHIVO
          </div>
          <div style={{ marginTop: 18, fontSize: 38, color: "#43423e" }}>{SITE.tagline}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 22, fontSize: 30, fontWeight: 800 }}>
            <span>DOCUMENTAR.</span>
            <span>CONTRASTAR.</span>
            <span style={{ color: "#d81e2c" }}>DEBATIR.</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
