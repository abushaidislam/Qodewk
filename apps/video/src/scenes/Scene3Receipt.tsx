import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TerminalCard } from "../components/TerminalCard";
import { ThermalReceipt } from "../components/ThermalReceipt";
import { Cursor } from "../components/Cursor";

export const Scene3Receipt: React.FC = () => {
  const frame = useCurrentFrame(); // local frame 0..400
  const { fps } = useVideoConfig();

  // Camera zoom out from 1.15 to 1.0 to reveal receipt emergence
  const cameraScale = interpolate(frame, [0, 100], [1.12, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slide spring for Thermal Receipt print emergence
  const receiptSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Cursor move to Verified badge on receipt
  const cursorMoveStart = 200;
  const cursorClickStart = 270;

  const cursorX = interpolate(frame, [cursorMoveStart, cursorClickStart], [400, 1140], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [cursorMoveStart, cursorClickStart], [800, 720], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isClicking = frame >= cursorClickStart && frame <= cursorClickStart + 25;
  const clickProgress = interpolate(frame, [cursorClickStart, cursorClickStart + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const popoverExpanded = frame >= cursorClickStart + 12;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#faf9f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${cameraScale})`,
        transformOrigin: "center center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Side-by-Side: Terminal Window Left, Emerging Thermal Receipt Right */}
      <div
        style={{
          display: "flex",
          gap: "48px",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "1600px",
          zIndex: 10,
        }}
      >
        {/* Terminal Window Card */}
        <div style={{ transform: "scale(0.92)", transformOrigin: "right center" }}>
          <TerminalCard
            commandText="npx qodewk --receipt"
            typeProgress={1}
            isExecuted={true}
            showExecuteButton={false}
            outputLines={[
              "✔ Extracting git metrics (+420 LOC / -80 LOC)...",
              "✔ Observing Claude 3.7 session telemetry...",
              "⚡ Receipt generated & printed to protocol!",
            ]}
          />
        </div>

        {/* Crisp White Thermal Paper Receipt */}
        <div>
          <ThermalReceipt
            slideProgress={receiptSpring}
            popoverExpanded={popoverExpanded}
            isVerifiedHovered={frame >= cursorClickStart - 20 && frame < cursorClickStart}
            isVerifiedClicked={isClicking}
          />
        </div>
      </div>

      {/* Interactive Cursor */}
      {frame >= cursorMoveStart && (
        <Cursor x={cursorX} y={cursorY} isClicking={isClicking} clickProgress={clickProgress} showRipple={isClicking} />
      )}
    </div>
  );
};
