import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getReceiptFromStore } from "@/lib/storage";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let receipt = await getReceiptFromStore(id);

  // Fallback demo values if receipt not yet saved or matching demo ID
  const projectAlias = receipt?.repository?.projectAlias || "hyper-engine";
  const filesTouched = receipt?.mutation?.files ?? 14;
  const insertions = receipt?.mutation?.insertions ?? 381;
  const deletions = receipt?.mutation?.deletions ?? 72;
  const providerName = receipt?.ai?.provider ? `${receipt.ai.provider} · ${receipt.ai.model || "frontier"}` : "Claude Code · Opus 4";
  const totalTokens = receipt?.ai?.tokens 
    ? receipt.ai.tokens.input + receipt.ai.tokens.output 
    : 183000;
  const tokensStr = totalTokens >= 1000 ? `~${Math.round(totalTokens / 1000)}K tokens` : `${totalTokens} tokens`;
  const costVal = receipt?.ai?.cost ?? 2.41;
  const costPrefix = receipt?.ai?.mode === "verified" ? "$" : "~$";
  const costLabel = receipt?.ai?.mode === "verified" ? "VERIFIED AI COST" : "ESTIMATED AI COST";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf9f5",
          fontFamily: "monospace",
          padding: "40px",
        }}
      >
        <div
          style={{
            width: "600px",
            backgroundColor: "#efe9de",
            border: "2px solid #e6dfd8",
            borderRadius: "12px",
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 30px rgba(20, 20, 19, 0.08)",
          }}
        >
          {/* Top Label */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px dashed #8e8b82",
              paddingBottom: "16px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px", color: "#141413" }}>✱</span>
              <span style={{ fontSize: "26px", fontWeight: "bold", color: "#141413", letterSpacing: "-1px" }}>
                QODEWK
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#cc785c",
                backgroundColor: "#faf9f5",
                padding: "4px 12px",
                borderRadius: "9999px",
                border: "1px solid #e6dfd8",
              }}
            >
              PROOF OF SHIPMENT
            </div>
          </div>

          {/* Metric Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "16px", color: "#3d3d3a" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8e8b82" }}>Project / Repo:</span>
              <span style={{ fontWeight: "bold", color: "#141413" }}>{projectAlias}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8e8b82" }}>Files Touched:</span>
              <span style={{ fontWeight: "bold", color: "#141413" }}>{filesTouched} files</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8e8b82" }}>Lines Inserted / Deleted:</span>
              <span style={{ fontWeight: "bold", color: "#5db872" }}>+{insertions} / -{deletions}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8e8b82" }}>AI Provider:</span>
              <span style={{ fontWeight: "bold", color: "#141413" }}>{providerName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8e8b82" }}>Estimated Tokens:</span>
              <span style={{ fontWeight: "bold", color: "#141413" }}>{tokensStr}</span>
            </div>
          </div>

          {/* Cost Callout */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "2px solid #141413",
              borderBottom: "2px solid #141413",
              padding: "16px 0",
              margin: "24px 0",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#6c6a64" }}>
              {costLabel}
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#cc785c" }}>
              {costPrefix}{costVal.toFixed(2)}
            </div>
          </div>

          {/* Trust Statement */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "12px",
              color: "#5db872",
              fontWeight: "600",
            }}
          >
            [✓] Source code was never uploaded to Qodewk
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
