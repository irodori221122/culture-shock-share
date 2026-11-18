import { ImageResponse } from "next/og";

// SNS でリンクを共有したときに出る画像（OGP 画像）。ビルド時に PNG として作られる。
// 画像生成の仕組みは日本語フォントを持っていないので、画像内の文字は英字にしている
// （日本語のタイトルと説明文は og:title / og:description で別に伝わる）。
// ここでは CSS 変数が使えないため、色は globals.css のテーマと同じ値を直接書く。
export const alt = "Culture Shock Share";
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
          justifyContent: "center",
          padding: "0 96px",
          background: "#faf9f6",
          color: "#1f2430",
        }}
      >
        {/* 地球アイコン（lucide の Globe と同じ形） */}
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ff6b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <div style={{ marginTop: 40, fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>
          Culture Shock Share
        </div>
        <div style={{ marginTop: 16, fontSize: 40, color: "#5e6472" }}>
          Share the culture shocks you found while studying abroad.
        </div>
        <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
          <div style={{ padding: "12px 28px", borderRadius: 999, background: "#e4f5ec", color: "#1a6a4a", fontSize: 32 }}>
            Empathy
          </div>
          <div style={{ padding: "12px 28px", borderRadius: 999, background: "#fff5d1", color: "#7a5600", fontSize: 32 }}>
            Discovery
          </div>
        </div>
      </div>
    ),
    size,
  );
}
