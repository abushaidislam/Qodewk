import React from "react";
import { interpolate } from "remotion";

export interface CTAProps {
  expansionProgress?: number; // 0 to 1 full bleed scale/opacity
  isCopyHovered?: boolean;
  isCopyClicked?: boolean;
  isCopied?: boolean;
  style?: React.CSSProperties;
}

export const CTA: React.FC<CTAProps> = ({
  expansionProgress = 1,
  isCopyHovered = false,
  isCopyClicked = false,
  isCopied = false,
  style,
}) => {
  const scale = interpolate(expansionProgress, [0, 1], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(expansionProgress, [0, 0.3, 1], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#cc785c",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        textAlign: "center",
        padding: "64px",
        transform: `scale(${scale})`,
        opacity,
        ...style,
      }}
    >
      {/* Subtitle Badge */}
      <div
        style={{
          display: "inline-block",
          padding: "6px 18px",
          borderRadius: "9999px",
          backgroundColor: "rgba(255, 255, 255, 0.22)",
          fontSize: "13px",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: "28px",
          color: "#faf9f5",
        }}
      >
        PROOF OF SHIPMENT FOR AI CODE
      </div>

      {/* Bold Serif Headline */}
      <h1
        style={{
          fontFamily: "Copernicus, Tiempos Headline, Georgia, serif",
          fontSize: "58px",
          fontWeight: 400,
          letterSpacing: "-1.5px",
          lineHeight: 1.1,
          maxWidth: "920px",
          margin: "0 0 36px 0",
          color: "#faf9f5",
        }}
      >
        Track Your AI Codebase Git-Natively
      </h1>

      {/* Centerpiece: Dark Navy Pill with Command & Copy Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          backgroundColor: "#181715",
          padding: "12px 18px 12px 30px",
          borderRadius: "9999px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "22px",
            color: "#faf9f5",
            fontWeight: 500,
            letterSpacing: "0.5px",
          }}
        >
          npx qodewk
        </span>

        {/* Copy Command Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 22px",
            borderRadius: "9999px",
            backgroundColor: isCopied
              ? "#5db872"
              : isCopyClicked
              ? "#a9583e"
              : isCopyHovered
              ? "#ffffff"
              : "rgba(250, 249, 245, 0.95)",
            color: isCopied ? "#ffffff" : "#141413",
            fontFamily: "Inter, -apple-system, sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            transform: isCopyClicked ? "scale(0.93)" : "scale(1)",
            transition: "transform 0.08s ease, background-color 0.1s ease",
          }}
        >
          {isCopied ? (
            <>
              <span style={{ fontSize: "16px" }}>✓</span>
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy Command</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
