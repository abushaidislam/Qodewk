import React from "react";

export interface TerminalCardProps {
  commandText?: string; // full text: "npx qodewk --receipt"
  typeProgress?: number; // 0 to 1 typing progress
  isExecuted?: boolean; // whether command finished typing / executed
  showExecuteButton?: boolean;
  executeButtonHovered?: boolean;
  executeButtonClicked?: boolean;
  outputLines?: string[];
  style?: React.CSSProperties;
}

export const TerminalCard: React.FC<TerminalCardProps> = ({
  commandText = "npx qodewk --receipt",
  typeProgress = 1,
  isExecuted = false,
  showExecuteButton = true,
  executeButtonHovered = false,
  executeButtonClicked = false,
  outputLines = [],
  style,
}) => {
  const charsToDisplay = Math.floor(commandText.length * Math.min(1, Math.max(0, typeProgress)));
  const visibleText = commandText.slice(0, charsToDisplay);
  const showCursor = typeProgress < 1 || !isExecuted;

  return (
    <div
      style={{
        width: "920px",
        backgroundColor: "#181715",
        borderRadius: "16px",
        border: "1px solid rgba(230, 223, 216, 0.15)",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.6)",
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        color: "#faf9f5",
        ...style,
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 22px",
          backgroundColor: "#1f1e1b",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* macOS Control Dots */}
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f56" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27c93f" }} />
        </div>

        <div style={{ fontSize: "13px", color: "#a09d96", fontWeight: 500 }}>
          qodewk terminal — zsh
        </div>

        {/* Execute Button in UI */}
        {showExecuteButton ? (
          <div
            style={{
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
            }}
          >
            <span>Execute</span>
            <span style={{ fontSize: "11px", opacity: 0.9 }}>↵</span>
          </div>
        ) : (
          <div style={{ width: "70px" }} />
        )}
      </div>

      {/* Terminal Body */}
      <div style={{ padding: "28px 32px", minHeight: "200px", fontSize: "16px", lineHeight: "1.7" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#cc785c", fontWeight: "bold" }}>❯</span>
          <span style={{ color: "#5db8a6", fontWeight: 500 }}>~/devhub</span>
          <span style={{ color: "#a09d96" }}>(feat/auth)</span>
        </div>

        <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#faf9f5", fontWeight: 500 }}>{visibleText}</span>
          {showCursor && (
            <span
              style={{
                display: "inline-block",
                width: "9px",
                height: "20px",
                backgroundColor: "#cc785c",
              }}
            />
          )}
        </div>

        {/* Output lines when command is executed */}
        {isExecuted && (
          <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px dashed rgba(255, 255, 255, 0.1)" }}>
            {outputLines.length > 0 ? (
              outputLines.map((line, idx) => (
                <div key={idx} style={{ color: line.startsWith("✔") ? "#5db872" : line.startsWith("⚡") ? "#e8a55a" : "#a09d96" }}>
                  {line}
                </div>
              ))
            ) : (
              <>
                <div style={{ color: "#5db872" }}>✔ Local git metrics extracted (14 files changed, +420/-80 lines)</div>
                <div style={{ color: "#5db872" }}>✔ AI provider telemetry captured (128.5k tokens, Anthropic Claude 3.7)</div>
                <div style={{ color: "#e8a55a", fontWeight: 500 }}>⚡ Receipt generated: rec_01J8Y29K4Z00ABC123DEF456</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
