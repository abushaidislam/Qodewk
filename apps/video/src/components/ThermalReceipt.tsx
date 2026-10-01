import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface ThermalReceiptProps {
  slideProgress?: number; // 0 (hidden inside terminal) to 1 (fully printed)
  popoverExpanded?: boolean; // whether Verified badge was clicked
  isVerifiedHovered?: boolean;
  isVerifiedClicked?: boolean;
  style?: React.CSSProperties;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  slideProgress = 1,
  popoverExpanded = false,
  isVerifiedHovered = false,
  isVerifiedClicked = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide spring transform
  const translateY = interpolate(slideProgress, [0, 1], [300, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(slideProgress, [0, 0.2, 1], [0, 1, 1]);

  return (
    <div
      style={{
        position: "relative",
        width: "540px",
        backgroundColor: "#ffffff",
        color: "#141413",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.1)",
        transform: `translateY(${translateY}px)`,
        opacity,
        ...style,
      }}
    >
      {/* Top Jagged Serrated Edge */}
      <svg
        width="100%"
        height="16"
        viewBox="0 0 540 16"
        preserveAspectRatio="none"
        style={{ position: "absolute", top: "-16px", left: 0 }}
      >
        <path
          d="M0 16 L15 0 L30 16 L45 0 L60 16 L75 0 L90 16 L105 0 L120 16 L135 0 L150 16 L165 0 L180 16 L195 0 L210 16 L225 0 L240 16 L255 0 L270 16 L285 0 L300 16 L315 0 L330 16 L345 0 L360 16 L375 0 L390 16 L405 0 L420 16 L435 0 L450 16 L465 0 L480 16 L495 0 L510 16 L525 0 L540 16 Z"
          fill="#ffffff"
        />
      </svg>

      {/* Receipt Content Body */}
      <div style={{ padding: "28px 32px 24px 32px" }}>
        {/* Receipt Header */}
        <div style={{ textAlign: "center", borderBottom: "2px dashed #141413", paddingBottom: "16px", marginBottom: "18px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#6c6a64", marginBottom: "4px" }}>
            OFFICIAL RECEIPT
          </div>
          <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "-0.5px", color: "#141413" }}>
            QODEWK PROOF OF SHIPMENT
          </div>
          <div style={{ fontSize: "12px", color: "#6c6a64", marginTop: "4px" }}>
            ID: rec_01J8Y29K4Z00ABC123DEF456
          </div>
        </div>

        {/* Protocol Details Grid */}
        <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6c6a64" }}>Repository:</span>
            <span style={{ fontWeight: 600 }}>devhub</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6c6a64" }}>Branch:</span>
            <span style={{ fontWeight: 600, color: "#cc785c" }}>feat/auth</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6c6a64" }}>Git Mutation:</span>
            <span style={{ fontWeight: 600, color: "#5db872" }}>+420 LOC / -80 LOC</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6c6a64" }}>Token Usage:</span>
            <span style={{ fontWeight: 600 }}>128.5k (Observed)</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6c6a64" }}>AI Model:</span>
            <span style={{ fontWeight: 600 }}>claude-3-7-sonnet</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6c6a64" }}>Estimated Cost:</span>
            <span style={{ fontWeight: 700, color: "#141413" }}>$0.38</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
            <span style={{ color: "#6c6a64" }}>Attribution Confidence:</span>
            <span style={{ fontWeight: 600, color: "#5db872" }}>0.94 (High)</span>
          </div>
        </div>

        {/* Dashed Line */}
        <div style={{ borderBottom: "1px dashed #e6dfd8", margin: "16px 0" }} />

        {/* Footer Row with Verified Badge & Interactive Trigger */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <div style={{ fontSize: "11px", color: "#6c6a64" }}>
            Privacy: Source Code Omitted
          </div>

          {/* Verified Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "9999px",
              backgroundColor: isVerifiedClicked
                ? "#252523"
                : isVerifiedHovered
                ? "#3d3d3a"
                : "#141413",
              color: "#faf9f5",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              transform: isVerifiedClicked ? "scale(0.95)" : "scale(1)",
              transition: "transform 0.1s ease",
            }}
          >
            <span style={{ color: "#5db872", fontSize: "14px" }}>✓</span>
            <span>Verified</span>
          </div>

          {/* Expanded Popover Detail */}
          {popoverExpanded && (
            <div
              style={{
                position: "absolute",
                bottom: "40px",
                right: "0px",
                width: "280px",
                backgroundColor: "#181715",
                color: "#faf9f5",
                padding: "14px 16px",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                fontSize: "12px",
                lineHeight: "1.6",
                border: "1px solid #cc785c",
                zIndex: 50,
              }}
            >
              <div style={{ fontWeight: "bold", color: "#cc785c", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🔒 Cryptographic Verification</span>
              </div>
              <div style={{ color: "#a09d96" }}>
                SHA-256: <span style={{ color: "#faf9f5" }}>e3b0c44298fc...</span>
              </div>
              <div style={{ color: "#5db872", marginTop: "4px", fontWeight: 500 }}>
                ✔ Zero code exfiltration verified
              </div>
            </div>
          )}
        </div>

        {/* Simulated Barcode */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div style={{ height: "32px", display: "flex", justifyContent: "center", gap: "3px" }}>
            {[3,1,2,4,1,3,2,1,4,2,1,3,1,2,4,1,2,3,1,4,2,1,3,2,1,4,1,3].map((w, idx) => (
              <div key={idx} style={{ width: `${w * 2}px`, height: "100%", backgroundColor: "#141413" }} />
            ))}
          </div>
          <div style={{ fontSize: "10px", color: "#6c6a64", marginTop: "4px", letterSpacing: "3px" }}>
            QODEWK-PROT-V1.0
          </div>
        </div>
      </div>

      {/* Bottom Jagged Serrated Edge */}
      <svg
        width="100%"
        height="16"
        viewBox="0 0 540 16"
        preserveAspectRatio="none"
        style={{ position: "absolute", bottom: "-16px", left: 0 }}
      >
        <path
          d="M0 0 L15 16 L30 0 L45 16 L60 0 L75 16 L90 0 L105 16 L120 0 L135 16 L150 0 L165 16 L180 0 L195 16 L210 0 L225 16 L240 0 L255 16 L270 0 L285 16 L300 0 L315 16 L330 0 L345 16 L360 0 L375 16 L390 0 L405 16 L420 0 L435 16 L450 0 L465 16 L480 0 L495 16 L510 0 L525 16 L540 0 Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
};
