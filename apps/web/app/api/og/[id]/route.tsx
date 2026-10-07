import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getReceiptFromStore } from "@/lib/storage";
import { DEMO_RECEIPTS } from "@/lib/demo-receipts";

async function loadGeistFont(): Promise<ArrayBuffer> {
  try {
    const { fileURLToPath } = await import("node:url");
    const fs = await import("node:fs/promises");
    const fontPath = fileURLToPath(new URL("../../../../assets/Geist.ttf", import.meta.url));
    const buf = await fs.readFile(fontPath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    return await fetch(new URL("../../../../assets/Geist.ttf", import.meta.url)).then((res) => res.arrayBuffer());
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

    return new ImageResponse(
      (
        <div
          tw="flex w-full h-full items-center justify-center bg-[#faf9f5]"
          style={{ fontFamily: "Geist" }}
        >
          <div tw="flex flex-col items-center justify-center p-12 bg-[#efe9de] rounded-xl border border-[#e6dfd8] w-[700px]">
            <div tw="flex justify-between w-full pb-4 border-b border-[#dcd5c9] mb-6">
              <div tw="flex text-3xl font-bold text-[#141413]">QODEWK</div>
              <div tw="flex text-sm font-bold text-[#cc785c] bg-[#faf9f5] px-3 py-1 rounded-full border border-[#e6dfd8]">
                PROOF OF SHIPMENT
              </div>
            </div>

            <div tw="flex flex-col w-full text-lg text-[#3d3d3a]">
              <div tw="flex justify-between w-full mb-3">
                <div tw="text-[#8e8b82]">Project / Repo:</div>
                <div tw="font-bold text-[#141413]">{projectAlias}</div>
              </div>
              <div tw="flex justify-between w-full mb-3">
                <div tw="text-[#8e8b82]">Files Touched:</div>
                <div tw="font-bold text-[#141413]">{filesTouched} files</div>
              </div>
              <div tw="flex justify-between w-full mb-3">
                <div tw="text-[#8e8b82]">Lines Inserted / Deleted:</div>
                <div tw="font-bold text-[#5db8a6]">+{insertions} / -{deletions}</div>
              </div>
              <div tw="flex justify-between w-full mb-3">
                <div tw="text-[#8e8b82]">AI Provider:</div>
                <div tw="font-bold text-[#141413]">{providerName}</div>
              </div>
              <div tw="flex justify-between w-full">
                <div tw="text-[#8e8b82]">Estimated Tokens:</div>
                <div tw="font-bold text-[#141413]">{tokensStr}</div>
              </div>
            </div>

            <div tw="flex justify-between items-center w-full py-4 border-t-2 border-b-2 border-[#141413] my-6">
              <div tw="text-base font-bold text-[#6c6a64]">{costLabel}</div>
              <div tw="text-4xl font-bold text-[#cc785c]">{costPrefix}{costVal.toFixed(2)}</div>
            </div>

            <div tw="flex text-sm text-[#5db8a6] font-semibold">
              [✓] Source code was never uploaded to Qodewk
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Geist",
            data: geist,
            weight: 400,
            style: "normal",
          },
        ],
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
        },
      }
    );
  } catch (err) {
    console.error("Error generating OG image:", err);
    return new Response("Failed to generate receipt OG image", { status: 500 });
  }
}
