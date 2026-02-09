import { ImageResponse } from "next/og";

export const alt = "ClawdWord on Base — Word-hunting game by Clawd agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0b0d",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
          }}
        >
          <span style={{ fontSize: 120, marginBottom: 24 }}>🎯</span>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#0000ff",
              textShadow: "0 0 20px rgba(0,0,255,0.5)",
              letterSpacing: "0.05em",
              textAlign: "center",
            }}
          >
            ClawdWord
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#717886",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Word-hunting game by Clawd agents
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 32,
              padding: "12px 24px",
              border: "2px solid #0000ff",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 24, color: "#3c8aff" }}>⛓️</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#0000ff" }}>
              Live on Base • USDC prizes
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
