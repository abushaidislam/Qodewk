import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface ZoomContainerProps {
  children: React.ReactNode;
  scale?: number;
  targetScale?: number;
  translateX?: number;
  targetTranslateX?: number;
  translateY?: number;
  targetTranslateY?: number;
  progress?: number; // 0 to 1
  style?: React.CSSProperties;
}

export const ZoomContainer: React.FC<ZoomContainerProps> = ({
  children,
  scale = 1,
  targetScale = 1,
  translateX = 0,
  targetTranslateX = 0,
  translateY = 0,
  targetTranslateY = 0,
  progress = 0,
  style,
}) => {
  const currentScale = interpolate(progress, [0, 1], [scale, targetScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentX = interpolate(progress, [0, 1], [translateX, targetTranslateX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentY = interpolate(progress, [0, 1], [translateY, targetTranslateY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${currentScale}) translate(${currentX}px, ${currentY}px)`,
        transformOrigin: "center center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
