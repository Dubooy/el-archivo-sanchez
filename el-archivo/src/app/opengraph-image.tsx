import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";

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
              width: 26,
              height: 26,
              background: "#d81e2c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            A
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
