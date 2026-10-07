import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getReceiptFromStore } from "@/lib/storage";
import { DEMO_RECEIPTS } from "@/lib/demo-receipts";

async function loadGeistFont(): Promise<ArrayBuffer | null> {
  try {
    const { fileURLToPath } = await import("node:url");
    const fs = await import("node:fs/promises");
    const fontPath = fileURLToPath(new URL("../../../../assets/Geist.ttf", import.meta.url));
    const buf = await fs.readFile(fontPath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    try {
      const res = await fetch(new URL("../../../../assets/Geist.ttf", import.meta.url));
      if (res.ok) {
        return await res.arrayBuffer();
      }
    } catch {
      // Fallback cleanly to default sans-serif font
    }
    return null;
  }
}

async function resolveReceiptForOg(id: string) {
  if (DEMO_RECEIPTS[id]) return DEMO_RECEIPTS[id]!;
  if (id === "demo-cursor" || id === "rec_01J8Y29K4Z00ABC123DEF456") return DEMO_RECEIPTS["rec_demo_cursor"]!;
  if (id === "demo-claude") return DEMO_RECEIPTS["rec_demo_claude"]!;
  if (id === "demo-antigravity") return DEMO_RECEIPTS["rec_demo_antigravity"]!;
  if (id === "demo-aider") return DEMO_RECEIPTS["rec_demo_aider"]!;
  if (id.startsWith("rec_demo")) {
    const base = DEMO_RECEIPTS["rec_demo_cursor"]!;
    return { ...base, receipt: { ...base.receipt, id } };
  }
  return await getReceiptFromStore(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const receipt = await resolveReceiptForOg(id);
    const geist = await loadGeistFont();
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

    const imageOptions: any = {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
      },
    };

    if (geist) {
      imageOptions.fonts = [
        {
          name: "Geist",
          data: geist,
          weight: 400,
          style: "normal",
        },
      ];
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#faf9f5",
            fontFamily: geist ? "Geist" : "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px",
              backgroundColor: "#efe9de",
              borderRadius: "12px",
              border: "1px solid #e6dfd8",
              width: "700px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingBottom: "16px",
                borderBottom: "1px solid #dcd5c9",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", fontSize: "32px", fontWeight: "bold", color: "#141413" }}>
                QODEWK
              </div>
              <div
                style={{
                  display: "flex",
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

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                fontSize: "17px",
                color: "#3d3d3a",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px" }}>
                <span style={{ color: "#8e8b82" }}>Project / Repo:</span>
                <span style={{ fontWeight: "bold", color: "#141413" }}>{projectAlias}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px" }}>
                <span style={{ color: "#8e8b82" }}>Files Touched:</span>
                <span style={{ fontWeight: "bold", color: "#141413" }}>{filesTouched} files</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px" }}>
                <span style={{ color: "#8e8b82" }}>Lines Inserted / Deleted:</span>
                <span style={{ fontWeight: "bold", color: "#5db8a6" }}>+{insertions} / -{deletions}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px" }}>
                <span style={{ color: "#8e8b82" }}>AI Provider:</span>
                <span style={{ fontWeight: "bold", color: "#141413" }}>{providerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span style={{ color: "#8e8b82" }}>Estimated Tokens:</span>
                <span style={{ fontWeight: "bold", color: "#141413" }}>{tokensStr}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingTop: "16px",
                paddingBottom: "16px",
                borderTop: "2px solid #141413",
                borderBottom: "2px solid #141413",
                marginTop: "24px",
                marginBottom: "24px",
              }}
            >
              <span style={{ fontSize: "15px", fontWeight: "bold", color: "#6c6a64" }}>{costLabel}</span>
              <span style={{ fontSize: "36px", fontWeight: "bold", color: "#cc785c" }}>{costPrefix}{costVal.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", fontSize: "14px", color: "#5db8a6", fontWeight: 600 }}>
              <span style={{ marginRight: "6px" }}>[OK]</span>
              <span>Source code was never uploaded to Qodewk</span>
            </div>
          </div>
        </div>
      ),
      imageOptions
    );
  } catch (err) {
    console.error("Error generating OG image, falling back to safe placeholder:", err);
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#faf9f5",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px",
              backgroundColor: "#efe9de",
              borderRadius: "12px",
              border: "1px solid #e6dfd8",
              width: "600px",
            }}
          >
            <div style={{ display: "flex", fontSize: "32px", fontWeight: "bold", color: "#141413", marginBottom: "16px" }}>
              QODEWK
            </div>
            <div style={{ display: "flex", fontSize: "18px", color: "#3d3d3a", marginBottom: "12px" }}>
              Digital Telemetry Receipt
            </div>
            <div style={{ display: "flex", alignItems: "center", fontSize: "14px", color: "#5db8a6", fontWeight: 600 }}>
              <span style={{ marginRight: "6px" }}>[OK]</span>
              <span>Source code was never uploaded to Qodewk</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }
    );
  }
}
