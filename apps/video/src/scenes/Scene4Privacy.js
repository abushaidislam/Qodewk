import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PrivacyCard } from "../components/PrivacyCard";
export const Scene4Privacy = () => {
    const frame = useCurrentFrame(); // local frame 0..300
    const { fps } = useVideoConfig();
    // Camera pan and zoom towards right card ("Source Code Exfiltration [Blocked]")
    const cameraX = interpolate(frame, [0, 100, 300], [0, -180, -180], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const cameraScale = interpolate(frame, [0, 100, 300], [1, 1.1, 1.1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    // Focused card state
    const focusedCard = frame < 80 ? "both" : "right";
    // Green Shield Pulse Progress
    const shieldPulseProgress = interpolate(frame, [80, 140, 200], [0, 0.5, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    return (_jsxs("div", { style: {
            width: "100%",
            height: "100%",
            backgroundColor: "#faf9f5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
        }, children: [_jsxs("div", { style: {
                    position: "absolute",
                    top: "80px",
                    textAlign: "center",
                    zIndex: 5,
                }, children: [_jsx("div", { style: {
                            fontSize: "13px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#5db872",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            marginBottom: "8px",
                            fontWeight: 600,
                        }, children: "ZERO-EXFILTRATION ARCHITECTURE" }), _jsx("h2", { style: {
                            fontFamily: "Copernicus, Tiempos Headline, Georgia, serif",
                            fontSize: "40px",
                            color: "#141413",
                            fontWeight: 400,
                            margin: 0,
                            letterSpacing: "-1px",
                        }, children: "Your Source Code Never Leaves Your Machine" })] }), _jsx("div", { style: {
                    transform: `scale(${cameraScale}) translateX(${cameraX}px)`,
                    transformOrigin: "center center",
                    transition: "transform 0.1s linear",
                    zIndex: 10,
                }, children: _jsx(PrivacyCard, { focusedCard: focusedCard, shieldPulseProgress: shieldPulseProgress }) })] }));
};
//# sourceMappingURL=Scene4Privacy.js.map