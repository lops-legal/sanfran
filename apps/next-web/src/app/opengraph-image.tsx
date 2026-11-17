import { ImageResponse } from "next/og";

export const alt = "sanfran.md — Skills jurídicas brasileiras para o seu assistente de IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 34, display: "flex" }}>
          sanfran<span style={{ color: "#a1a1a1" }}>.md</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, lineHeight: 1.1, fontWeight: 600 }}>O kit de engenharia jurídica brasileira</div>
          <div style={{ fontSize: 30, color: "#a1a1a1", fontFamily: "sans-serif" }}>
            Prazos, cálculos, peças, contratos e LGPD — no Claude, ChatGPT, Grok e Manus.
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
      </div>
    ),
    size,
  );
}
