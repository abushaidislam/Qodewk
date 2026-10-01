import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TerminalCard } from "../components/TerminalCard";
import { Cursor } from "../components/Cursor";
export const Scene2Terminal = () => {
    const frame = useCurrentFrame(); // local frame 0..500
    const { fps } = useVideoConfig();
    // Terminal Entrance Spring
    const terminalEntrance = spring({ frame, fps, config: { damping: 15, stiffness: 90 } });
    // Camera Punch-in Zoom onto command prompt
    const zoomProgress = interpolate(frame, [0, 150, 400, 500], [1, 1.15, 1.15, 1.05], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    // Typewriter Progress for "npx qodewk --receipt" over local frame 60..260
    const typeProgress = interpolate(frame, [60, 260], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    // Cursor movement to Execute button at x: 1330, y: 410 (screen coordinates for Execute button)
    const cursorMoveStart = 280;
    const cursorClickStart = 360;
    const cursorX = interpolate(frame, [cursorMoveStart, cursorClickStart], [500, 1320], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const cursorY = interpolate(frame, [cursorMoveStart, cursorClickStart], [750, 410], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const isClicking = frame >= cursorClickStart && frame <= cursorClickStart + 25;
    const clickProgress = interpolate(frame, [cursorClickStart, cursorClickStart + 25], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const isExecuted = frame >= cursorClickStart + 15;
    return (_jsxs("div", { style: {
            width: "100%",
            height: "100%",
            backgroundColor: "#faf9f5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${zoomProgress})`,
            transformOrigin: "center 45%",
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
                            color: "#cc785c",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            marginBottom: "8px",
                            fontWeight: 600,
                        }, children: "GIT-NATIVE CLI ENGINE" }), _jsx("h2", { style: {
                            fontFamily: "Copernicus, Tiempos Headline, Georgia, serif",
                            fontSize: "36px",
                            color: "#141413",
                            fontWeight: 400,
                            margin: 0,
                        }, children: "Instant Proof of Shipment Generation" })] }), _jsx("div", { style: {
                    transform: `translateY(${(1 - terminalEntrance) * 80}px)`,
                    opacity: terminalEntrance,
                    zIndex: 10,
                }, children: _jsx(TerminalCard, { commandText: "npx qodewk --receipt", typeProgress: typeProgress, isExecuted: isExecuted, showExecuteButton: true, executeButtonHovered: frame >= cursorClickStart - 20 && frame < cursorClickStart, executeButtonClicked: isClicking, outputLines: isExecuted
                        ? [
                            "✔ Extracting local git repository metrics (+420 LOC / -80 LOC)...",
                            "✔ Observing Anthropic Claude 3.7 provider session telemetry...",
                            "⚡ Cryptographic Receipt ready: rec_01J8Y29K4Z00ABC123DEF456",
                        ]
                        : [] }) }), frame >= cursorMoveStart && (_jsx(Cursor, { x: cursorX, y: cursorY, isClicking: isClicking, clickProgress: clickProgress, showRipple: isClicking }))] }));
};
//# sourceMappingURL=Scene2Terminal.js.map