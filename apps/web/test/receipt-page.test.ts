import { describe, it, expect } from "vitest";
import { DEMO_RECEIPTS } from "../lib/demo-receipts";

describe("Digital Receipt Page (`apps/web/app/r/[id]`)", () => {
  it("resolves seeded demo receipts with full metadata", () => {
    const cursorReceipt = DEMO_RECEIPTS["rec_demo_cursor"];
    expect(cursorReceipt).toBeDefined();
    expect(cursorReceipt.receipt.id).toBe("rec_demo_cursor");
    expect(cursorReceipt.repository.projectAlias).toBe("hyper-engine");
    expect(cursorReceipt.ai.provider).toBe("cursor");
    expect(cursorReceipt.ai.mode).toBe("verified");
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
});
