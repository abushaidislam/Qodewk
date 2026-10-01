import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
export const ThermalReceipt = ({ slideProgress = 1, popoverExpanded = false, isVerifiedHovered = false, isVerifiedClicked = false, style, }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    // Slide spring transform
    const translateY = interpolate(slideProgress, [0, 1], [300, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const opacity = interpolate(slideProgress, [0, 0.2, 1], [0, 1, 1]);
    return (_jsxs("div", { style: {
            position: "relative",
            width: "540px",
            backgroundColor: "#ffffff",
            color: "#141413",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.1)",
            transform: `translateY(${translateY}px)`,
            opacity,
            ...style,
        }, children: [_jsx("svg", { width: "100%", height: "16", viewBox: "0 0 540 16", preserveAspectRatio: "none", style: { position: "absolute", top: "-16px", left: 0 }, children: _jsx("path", { d: "M0 16 L15 0 L30 16 L45 0 L60 16 L75 0 L90 16 L105 0 L120 16 L135 0 L150 16 L165 0 L180 16 L195 0 L210 16 L225 0 L240 16 L255 0 L270 16 L285 0 L300 16 L315 0 L330 16 L345 0 L360 16 L375 0 L390 16 L405 0 L420 16 L435 0 L450 16 L465 0 L480 16 L495 0 L510 16 L525 0 L540 16 Z", fill: "#ffffff" }) }), _jsxs("div", { style: { padding: "28px 32px 24px 32px" }, children: [_jsxs("div", { style: { textAlign: "center", borderBottom: "2px dashed #141413", paddingBottom: "16px", marginBottom: "18px" }, children: [_jsx("div", { style: { fontSize: "11px", letterSpacing: "2px", color: "#6c6a64", marginBottom: "4px" }, children: "OFFICIAL RECEIPT" }), _jsx("div", { style: { fontSize: "20px", fontWeight: "bold", letterSpacing: "-0.5px", color: "#141413" }, children: "QODEWK PROOF OF SHIPMENT" }), _jsx("div", { style: { fontSize: "12px", color: "#6c6a64", marginTop: "4px" }, children: "ID: rec_01J8Y29K4Z00ABC123DEF456" })] }), _jsxs("div", { style: { fontSize: "14px", lineHeight: "1.8" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { style: { color: "#6c6a64" }, children: "Repository:" }), _jsx("span", { style: { fontWeight: 600 }, children: "devhub" })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { style: { color: "#6c6a64" }, children: "Branch:" }), _jsx("span", { style: { fontWeight: 600, color: "#cc785c" }, children: "feat/auth" })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { style: { color: "#6c6a64" }, children: "Git Mutation:" }), _jsx("span", { style: { fontWeight: 600, color: "#5db872" }, children: "+420 LOC / -80 LOC" })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { style: { color: "#6c6a64" }, children: "Token Usage:" }), _jsx("span", { style: { fontWeight: 600 }, children: "128.5k (Observed)" })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { style: { color: "#6c6a64" }, children: "AI Model:" }), _jsx("span", { style: { fontWeight: 600 }, children: "claude-3-7-sonnet" })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { style: { color: "#6c6a64" }, children: "Estimated Cost:" }), _jsx("span", { style: { fontWeight: 700, color: "#141413" }, children: "$0.38" })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }, children: [_jsx("span", { style: { color: "#6c6a64" }, children: "Attribution Confidence:" }), _jsx("span", { style: { fontWeight: 600, color: "#5db872" }, children: "0.94 (High)" })] })] }), _jsx("div", { style: { borderBottom: "1px dashed #e6dfd8", margin: "16px 0" } }), _jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }, children: [_jsx("div", { style: { fontSize: "11px", color: "#6c6a64" }, children: "Privacy: Source Code Omitted" }), _jsxs("div", { style: {
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
                                }, children: [_jsx("span", { style: { color: "#5db872", fontSize: "14px" }, children: "\u2713" }), _jsx("span", { children: "Verified" })] }), popoverExpanded && (_jsxs("div", { style: {
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
                                }, children: [_jsx("div", { style: { fontWeight: "bold", color: "#cc785c", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }, children: _jsx("span", { children: "\uD83D\uDD12 Cryptographic Verification" }) }), _jsxs("div", { style: { color: "#a09d96" }, children: ["SHA-256: ", _jsx("span", { style: { color: "#faf9f5" }, children: "e3b0c44298fc..." })] }), _jsx("div", { style: { color: "#5db872", marginTop: "4px", fontWeight: 500 }, children: "\u2714 Zero code exfiltration verified" })] }))] }), _jsxs("div", { style: { marginTop: "20px", textAlign: "center" }, children: [_jsx("div", { style: { height: "32px", display: "flex", justifyContent: "center", gap: "3px" }, children: [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 3].map((w, idx) => (_jsx("div", { style: { width: `${w * 2}px`, height: "100%", backgroundColor: "#141413" } }, idx))) }), _jsx("div", { style: { fontSize: "10px", color: "#6c6a64", marginTop: "4px", letterSpacing: "3px" }, children: "QODEWK-PROT-V1.0" })] })] }), _jsx("svg", { width: "100%", height: "16", viewBox: "0 0 540 16", preserveAspectRatio: "none", style: { position: "absolute", bottom: "-16px", left: 0 }, children: _jsx("path", { d: "M0 0 L15 16 L30 0 L45 16 L60 0 L75 16 L90 0 L105 16 L120 0 L135 16 L150 0 L165 16 L180 0 L195 16 L210 0 L225 16 L240 0 L255 16 L270 0 L285 16 L300 0 L315 16 L330 0 L345 16 L360 0 L375 16 L390 0 L405 16 L420 0 L435 16 L450 0 L465 16 L480 0 L495 16 L510 0 L525 16 L540 0 Z", fill: "#ffffff" }) })] }));
};
//# sourceMappingURL=ThermalReceipt.js.map