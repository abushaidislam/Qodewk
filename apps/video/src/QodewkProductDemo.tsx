import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene2Terminal } from "./scenes/Scene2Terminal";
import { Scene3Receipt } from "./scenes/Scene3Receipt";
import { Scene4Privacy } from "./scenes/Scene4Privacy";
import { Scene5CTA } from "./scenes/Scene5CTA";

export const QodewkProductDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#faf9f5" }}>
      {/* Scene 1: The Problem & Interactive Cursor (Frames 0 - 300) */}
      <Sequence from={0} durationInFrames={300} name="Scene 1: Problem & Cursor">
        <Scene1Problem />
      </Sequence>

      {/* Scene 2: Terminal Focus & Command Typing (Frames 300 - 800) */}
      <Sequence from={300} durationInFrames={500} name="Scene 2: Terminal Focus & Typing">
        <Scene2Terminal />
      </Sequence>

      {/* Scene 3: Thermal Paper Receipt Print & Extraction (Frames 800 - 1200) */}
      <Sequence from={800} durationInFrames={400} name="Scene 3: Thermal Receipt Print">
        <Scene3Receipt />
      </Sequence>

      {/* Scene 4: Zero-Exfiltration Privacy Shield (Frames 1200 - 1500) */}
      <Sequence from={1200} durationInFrames={300} name="Scene 4: Privacy Shield">
        <Scene4Privacy />
      </Sequence>

      {/* Scene 5: High-Impact Call To Action (Frames 1500 - 1800) */}
      <Sequence from={1500} durationInFrames={300} name="Scene 5: High-Impact CTA">
        <Scene5CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
