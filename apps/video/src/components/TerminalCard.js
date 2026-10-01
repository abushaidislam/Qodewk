import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const TerminalCard = ({ commandText = "npx qodewk --receipt", typeProgress = 1, isExecuted = false, showExecuteButton = true, executeButtonHovered = false, executeButtonClicked = false, outputLines = [], style, }) => {
    const charsToDisplay = Math.floor(commandText.length * Math.min(1, Math.max(0, typeProgress)));
    const visibleText = commandText.slice(0, charsToDisplay);
    const showCursor = typeProgress < 1 || !isExecuted;
    return (_jsxs("div", { style: {
            width: "920px",
            backgroundColor: "#181715",
            borderRadius: "16px",
            border: "1px solid rgba(230, 223, 216, 0.15)",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            color: "#faf9f5",
            ...style,
        }, children: [_jsxs("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 22px",
                    backgroundColor: "#1f1e1b",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }, children: [_jsxs("div", { style: { display: "flex", gap: "8px" }, children: [_jsx("div", { style: { width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f56" } }), _jsx("div", { style: { width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e" } }), _jsx("div", { style: { width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27c93f" } })] }), _jsx("div", { style: { fontSize: "13px", color: "#a09d96", fontWeight: 500 }, children: "qodewk terminal \u2014 zsh" }), showExecuteButton ? (_jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            backgroundColor: executeButtonClicked
                                ? "#a9583e"
                                : executeButtonHovered
                                    ? "#cc785c"
                                    : "rgba(204, 120, 92, 0.85)",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: 600,
                            transform: executeButtonClicked ? "scale(0.92)" : "scale(1)",
                            transition: "transform 0.08s ease, background-color 0.1s ease",
                        }, children: [_jsx("span", { children: "Execute" }), _jsx("span", { style: { fontSize: "11px", opacity: 0.9 }, children: "\u21B5" })] })) : (_jsx("div", { style: { width: "70px" } }))] }), _jsxs("div", { style: { padding: "28px 32px", minHeight: "200px", fontSize: "16px", lineHeight: "1.7" }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [_jsx("span", { style: { color: "#cc785c", fontWeight: "bold" }, children: "\u276F" }), _jsx("span", { style: { color: "#5db8a6", fontWeight: 500 }, children: "~/devhub" }), _jsx("span", { style: { color: "#a09d96" }, children: "(feat/auth)" })] }), _jsxs("div", { style: { marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }, children: [_jsx("span", { style: { color: "#faf9f5", fontWeight: 500 }, children: visibleText }), showCursor && (_jsx("span", { style: {
                                    display: "inline-block",
                                    width: "9px",
                                    height: "20px",
                                    backgroundColor: "#cc785c",
                                } }))] }), isExecuted && (_jsx("div", { style: { marginTop: "20px", paddingTop: "14px", borderTop: "1px dashed rgba(255, 255, 255, 0.1)" }, children: outputLines.length > 0 ? (outputLines.map((line, idx) => (_jsx("div", { style: { color: line.startsWith("✔") ? "#5db872" : line.startsWith("⚡") ? "#e8a55a" : "#a09d96" }, children: line }, idx)))) : (_jsxs(_Fragment, { children: [_jsx("div", { style: { color: "#5db872" }, children: "\u2714 Local git metrics extracted (14 files changed, +420/-80 lines)" }), _jsx("div", { style: { color: "#5db872" }, children: "\u2714 AI provider telemetry captured (128.5k tokens, Anthropic Claude 3.7)" }), _jsx("div", { style: { color: "#e8a55a", fontWeight: 500 }, children: "\u26A1 Receipt generated: rec_01J8Y29K4Z00ABC123DEF456" })] })) }))] })] }));
};
//# sourceMappingURL=TerminalCard.js.map