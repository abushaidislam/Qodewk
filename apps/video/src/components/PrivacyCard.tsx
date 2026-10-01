import React from "react";
import { interpolate } from "remotion";

export interface PrivacyCardProps {
  focusedCard?: "both" | "left" | "right";
  shieldPulseProgress?: number;
  style?: React.CSSProperties;
}

export const PrivacyCard: React.FC<PrivacyCardProps> = ({
  focusedCard = "both",
  shieldPulseProgress = 1,
  style,
}) => {
  const shieldScale = interpolate(shieldPulseProgress, [0, 0.5, 1], [0.85, 1.15, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "36px",
        alignItems: "stretch",
        justifyContent: "center",
        width: "1240px",
        ...style,
      }}
    >
      {/* Left Card: Local Git Hashes Only */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#efe9de",
          borderRadius: "16px",
          padding: "36px",
          border: "1px solid #e6dfd8",
          boxShadow: focusedCard === "left" ? "0 15px 30px rgba(0,0,0,0.1)" : "0 4px 12px rgba(0,0,0,0.05)",
          opacity: focusedCard === "right" ? 0.65 : 1,
          transform: focusedCard === "left" ? "scale(1.02)" : "scale(1)",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              backgroundColor: "#faf9f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#6c6a64", textTransform: "uppercase", letterSpacing: "1px" }}>
              PROTOCOL PRIVACY
            </div>
            <div style={{ fontSize: "22px", fontFamily: "Copernicus, Tiempos Headline, Georgia, serif", color: "#141413", fontWeight: 500 }}>
              Local Git Hashes Only
            </div>
          </div>
        </div>

        <p style={{ fontSize: "15px", color: "#3d3d3a", lineHeight: "1.6", marginBottom: "20px" }}>
          Qodewk operates entirely on local git diffs, commit metadata, and salted SHA-256 project identifiers.
        </p>

        <div
          style={{
            backgroundColor: "#181715",
            borderRadius: "10px",
            padding: "16px 20px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            color: "#faf9f5",
            lineHeight: "1.7",
          }}
        >
          <div style={{ color: "#5db8a6" }}>repoHash:  a1b2c3d4e5f6...</div>
          <div style={{ color: "#a09d96" }}>headSha:   7f8b2c1e4d3a...</div>
          <div style={{ color: "#5db872", marginTop: "6px", fontWeight: 600 }}>✔ 100% Local Git Telemetry</div>
        </div>
      </div>

      {/* Right Card: Source Code Exfiltration [Blocked] */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#efe9de",
          borderRadius: "16px",
          padding: "36px",
          border: focusedCard === "right" ? "2px solid #5db872" : "1px solid #e6dfd8",
          boxShadow: focusedCard === "right" ? "0 20px 40px rgba(93, 184, 114, 0.2)" : "0 4px 12px rgba(0,0,0,0.05)",
          opacity: focusedCard === "left" ? 0.65 : 1,
          transform: focusedCard === "right" ? "scale(1.02)" : "scale(1)",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          {/* Animated Green Shield Icon */}
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              backgroundColor: "rgba(93, 184, 114, 0.15)",
              border: "2px solid #5db872",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${shieldScale})`,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                fill="#5db872"
                fillOpacity="0.25"
                stroke="#5db872"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#5db872"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#5db872", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
              ZERO EXFILTRATION
            </div>
            <div style={{ fontSize: "22px", fontFamily: "Copernicus, Tiempos Headline, Georgia, serif", color: "#141413", fontWeight: 500 }}>
              Source Code Exfiltration [Blocked]
            </div>
          </div>
        </div>

        <p style={{ fontSize: "15px", color: "#3d3d3a", lineHeight: "1.6", marginBottom: "20px" }}>
          Cryptographic assertion guarantees no raw source code, diff contents, or prompt transcripts leave your environment.
        </p>

        <div
          style={{
            backgroundColor: "rgba(93, 184, 114, 0.12)",
            border: "1px dashed #5db872",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span style={{ fontSize: "14px", color: "#141413", fontWeight: 600 }}>sourceExcluded: true</span>
          <span style={{ fontSize: "15px", color: "#5db872", fontWeight: "bold" }}>0 Bytes Code Sent</span>
        </div>
      </div>
    </div>
  );
};
