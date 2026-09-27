import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
            width: "560px",
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
              <span style={{ fontSize: "28px", fontWeight: "bold", color: "#141413", letterSpacing: "-1px" }}>
                QODEWK
              </span>
            </div>
            <div
              style={{
                fontSize: "13px",
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
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "16px", color: "#3d3d3a" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8e8b82" }}>Files Touched:</span>
              <span style={{ fontWeight: "bold", color: "#141413" }}>14 files</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8e8b82" }}>Lines Inserted / Deleted:</span>
              <span style={{ fontWeight: "bold", color: "#5db872" }}>+381 / -72</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8e8b82" }}>AI Provider:</span>
              <span style={{ fontWeight: "bold", color: "#141413" }}>Claude Code · Opus 4</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8e8b82" }}>Estimated Tokens:</span>
              <span style={{ fontWeight: "bold", color: "#141413" }}>~183K tokens</span>
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
              ESTIMATED AI COST
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#cc785c" }}>
              ~$2.41
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
