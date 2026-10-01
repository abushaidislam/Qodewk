import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Cursor } from "../components/Cursor";

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame(); // local frame 0..300
  const { fps } = useVideoConfig();

  // Camera zoom-in from 1.0 to 1.12
  const cameraScale = interpolate(frame, [0, 300], [1, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating card spring animations
  const card1Entrance = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const card2Entrance = spring({ frame: frame - 40, fps, config: { damping: 14 } });
  const card3Entrance = spring({ frame: frame - 60, fps, config: { damping: 14 } });

  // Badge click & collapse animation at local frame 160..210
  const clickStartFrame = 160;
  const isClicking = frame >= clickStartFrame && frame <= clickStartFrame + 25;
  const clickProgress = interpolate(frame, [clickStartFrame, clickStartFrame + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeCollapseProgress = interpolate(frame, [clickStartFrame + 15, clickStartFrame + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeScale = interpolate(badgeCollapseProgress, [0, 0.3, 1], [1, 1.15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeOpacity = interpolate(badgeCollapseProgress, [0, 0.7, 1], [1, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeColor = frame >= clickStartFrame + 10 ? "#c64545" : "#181715";

  // Cursor movement path:
  // Starts at (300, 850), moves towards chaotic badge at center (960, 540)
  const cursorX = interpolate(frame, [80, clickStartFrame], [300, 960], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [80, clickStartFrame], [850, 540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#faf9f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${cameraScale})`,
        transformOrigin: "center center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Editorial Header */}
      <div style={{ textAlign: "center", marginBottom: "40px", zIndex: 10 }}>
        <div
          style={{
            fontSize: "13px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#cc785c",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "12px",
            fontWeight: 600,
          }}
        >
          THE FRAGMENTED AI STACK
        </div>
        <h2
          style={{
            fontFamily: "Copernicus, Tiempos Headline, Georgia, serif",
            fontSize: "46px",
            color: "#141413",
            fontWeight: 400,
            margin: 0,
            letterSpacing: "-1px",
          }}
        >
          AI Code Generates Unseen Technical Debt
        </h2>
      </div>

      {/* Floating Fragmented Tool Cards */}
      <div
        style={{
          display: "flex",
          gap: "28px",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          marginBottom: "36px",
        }}
      >
        {/* Card 1: Cursor */}
        <div
          style={{
            width: "260px",
            backgroundColor: "#efe9de",
            borderRadius: "14px",
            padding: "24px",
            border: "1px solid #e6dfd8",
            boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
            transform: `translateY(${(1 - card1Entrance) * 40}px)`,
            opacity: card1Entrance,
          }}
        >
          <div style={{ fontSize: "12px", color: "#6c6a64", fontFamily: "'JetBrains Mono', monospace" }}>IDE ASSISTANT</div>
          <div style={{ fontSize: "20px", fontWeight: 600, color: "#141413", marginTop: "4px" }}>Cursor</div>
          <div style={{ fontSize: "14px", color: "#3d3d3a", marginTop: "8px" }}>+1,240 LOC generated</div>
        </div>

        {/* Card 2: Claude Code */}
        <div
          style={{
            width: "260px",
            backgroundColor: "#efe9de",
            borderRadius: "14px",
            padding: "24px",
            border: "1px solid #e6dfd8",
            boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
            transform: `translateY(${(1 - card2Entrance) * 40}px)`,
            opacity: card2Entrance,
          }}
        >
          <div style={{ fontSize: "12px", color: "#6c6a64", fontFamily: "'JetBrains Mono', monospace" }}>AGENTIC CLI</div>
          <div style={{ fontSize: "20px", fontWeight: 600, color: "#141413", marginTop: "4px" }}>Claude Code</div>
          <div style={{ fontSize: "14px", color: "#3d3d3a", marginTop: "8px" }}>450k Tokens consumed</div>
        </div>

        {/* Card 3: GitHub Copilot */}
        <div
          style={{
            width: "260px",
            backgroundColor: "#efe9de",
            borderRadius: "14px",
            padding: "24px",
            border: "1px solid #e6dfd8",
            boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
            transform: `translateY(${(1 - card3Entrance) * 40}px)`,
            opacity: card3Entrance,
          }}
        >
          <div style={{ fontSize: "12px", color: "#6c6a64", fontFamily: "'JetBrains Mono', monospace" }}>AUTOCOMPLETE</div>
          <div style={{ fontSize: "20px", fontWeight: 600, color: "#141413", marginTop: "4px" }}>Copilot</div>
          <div style={{ fontSize: "14px", color: "#3d3d3a", marginTop: "8px" }}>320 Inline Suggestions</div>
        </div>
      </div>

      {/* Chaotic Token Bill Badge (Target of Cursor Click) */}
      <div
        style={{
          zIndex: 20,
          transform: `scale(${badgeScale})`,
          opacity: badgeOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 28px",
            borderRadius: "9999px",
            backgroundColor: badgeColor,
            color: "#faf9f5",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.25)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "18px",
            fontWeight: 600,
            transition: "background-color 0.15s ease",
          }}
        >
          <span style={{ color: "#e8a55a" }}>⚠️</span>
          <span>Untracked AI Usage: <span style={{ color: "#ffffff", textDecoration: "line-through" }}>Token Bill $120.00</span></span>
        </div>
      </div>

      {/* Collapsed Resolution Banner after click */}
      {badgeCollapseProgress > 0.8 && (
        <div
          style={{
            zIndex: 25,
            padding: "14px 28px",
            borderRadius: "9999px",
            backgroundColor: "#5db872",
            color: "#ffffff",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "16px",
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(93, 184, 114, 0.3)",
          }}
        >
          ✔ Qodewk Unifies Local AI Telemetry
        </div>
      )}

      {/* Interactive Cursor */}
      <Cursor x={cursorX} y={cursorY} isClicking={isClicking} clickProgress={clickProgress} showRipple={isClicking} />
    </div>
  );
};
