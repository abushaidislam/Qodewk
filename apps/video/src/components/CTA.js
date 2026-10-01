import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { interpolate } from "remotion";
export const CTA = ({ expansionProgress = 1, isCopyHovered = false, isCopyClicked = false, isCopied = false, style, }) => {
    const scale = interpolate(expansionProgress, [0, 1], [0.2, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const opacity = interpolate(expansionProgress, [0, 0.3, 1], [0, 1, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    return (_jsxs("div", { style: {
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
        }, children: [_jsx("div", { style: {
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
                }, children: "PROOF OF SHIPMENT FOR AI CODE" }), _jsx("h1", { style: {
                    fontFamily: "Copernicus, Tiempos Headline, Georgia, serif",
                    fontSize: "58px",
                    fontWeight: 400,
                    letterSpacing: "-1.5px",
                    lineHeight: 1.1,
                    maxWidth: "920px",
                    margin: "0 0 36px 0",
                    color: "#faf9f5",
                }, children: "Track Your AI Codebase Git-Natively" }), _jsxs("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    backgroundColor: "#181715",
                    padding: "12px 18px 12px 30px",
                    borderRadius: "9999px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                }, children: [_jsx("span", { style: {
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "22px",
                            color: "#faf9f5",
                            fontWeight: 500,
                            letterSpacing: "0.5px",
                        }, children: "npx qodewk" }), _jsx("div", { style: {
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
                        }, children: isCopied ? (_jsxs(_Fragment, { children: [_jsx("span", { style: { fontSize: "16px" }, children: "\u2713" }), _jsx("span", { children: "Copied to Clipboard!" })] })) : (_jsxs(_Fragment, { children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: [_jsx("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }), _jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })] }), _jsx("span", { children: "Copy Command" })] })) })] })] }));
};
//# sourceMappingURL=CTA.js.map