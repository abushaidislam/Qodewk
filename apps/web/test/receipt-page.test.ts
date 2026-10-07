import { describe, it, expect } from "vitest";
import { DEMO_RECEIPTS } from "../lib/demo-receipts";

describe("Digital Receipt Page (`apps/web/app/r/[id]`)", () => {
  it("resolves seeded demo receipts with full metadata", () => {
    const cursorReceipt = DEMO_RECEIPTS["rec_demo_cursor"];
    expect(cursorReceipt).toBeDefined();
    expect(cursorReceipt.receipt.id).toBe("rec_demo_cursor");
    expect(cursorReceipt.repository.projectAlias).toBe("hyper-engine");
    expect(cursorReceipt.ai.provider).toBe("cursor");
    expect(cursorReceipt.ai.mode).toBe("estimated");
    expect(cursorReceipt.ai.confidence).toBe(0.55);
  });

  it("never labels diff-derived (estimated) receipts with exact confidence", () => {
    Object.values(DEMO_RECEIPTS).forEach((receipt) => {
      if (receipt.ai.mode === "estimated") {
        expect(receipt.ai.confidence).toBeLessThan(0.9);
      }
      expect(receipt.ai.confidence).toBeGreaterThanOrEqual(0);
      expect(receipt.ai.confidence).toBeLessThanOrEqual(1);
    });
  });

  it("enforces strict privacy by construction (sourceExcluded === true)", () => {
    Object.values(DEMO_RECEIPTS).forEach((receipt) => {
      expect(receipt.privacy.sourceExcluded).toBe(true);
      expect(receipt.receipt.contentHash).toHaveLength(64);
      expect(receipt.repository.repoHash).toHaveLength(64);
      expect(receipt.repository.headSha).toHaveLength(40);
    });
  });

  it("contains valid mutation line numbers and language composition", () => {
    const cursorReceipt = DEMO_RECEIPTS["rec_demo_cursor"];
    expect(cursorReceipt.mutation.files).toBeGreaterThan(0);
    expect(cursorReceipt.mutation.insertions).toBeGreaterThanOrEqual(0);
    expect(cursorReceipt.mutation.deletions).toBeGreaterThanOrEqual(0);
    expect(cursorReceipt.mutation.languages).toBeDefined();
    expect(cursorReceipt.mutation.languages?.["TypeScript"]).toBe(85);
  });

  it("generates a dynamic OG image for demo receipts", async () => {
    const { GET } = await import("../app/api/og/[id]/route.js");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest(new URL("http://localhost:3000/api/og/rec_demo_cursor"));
    const res = await GET(req, { params: Promise.resolve({ id: "rec_demo_cursor" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("safely generates a dynamic OG image for arbitrary or non-demo receipt IDs without 500 error", async () => {
    const { GET } = await import("../app/api/og/[id]/route.js");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest(new URL("http://localhost:3000/api/og/rec_5b10008675a0cd20194c3696"));
    const res = await GET(req, { params: Promise.resolve({ id: "rec_5b10008675a0cd20194c3696" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
    const bytes = await res.arrayBuffer();
    expect(bytes.byteLength).toBeGreaterThan(1000);
  });
});
