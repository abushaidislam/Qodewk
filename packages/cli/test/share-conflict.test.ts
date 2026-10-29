import { describe, it, expect, vi, afterEach } from "vitest";
import type { ReceiptV1 } from "@qodewk/protocol";

const saveReceipt = vi.fn();

vi.mock("@qodewk/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@qodewk/core")>();
  return {
    ...actual,
    LocalStateDB: vi.fn().mockImplementation(() => ({ saveReceipt, close: vi.fn() }))
  };
});

vi.mock("../src/receipt-view.js", () => ({ renderTerminalReceipt: vi.fn() }));

const { publishReceiptToCloud } = await import("../src/menu.js");

const receipt: ReceiptV1 = {
  version: "1.0",
  receipt: {
    id: "rec_share_conflict_test",
    createdAt: "2026-10-01T12:00:00.000Z",
    contentHash: "f".repeat(64)
  },
  repository: {
    repoHash: "e".repeat(64),
    projectAlias: "share-conflict",
    branch: "main",
    headSha: "d".repeat(40),
    commitsCount: 1
  },
  mutation: { files: 1, insertions: 1, deletions: 0, netLines: 1, renames: 0 },
  ai: {
    provider: "anthropic",
    model: "claude-sonnet-4",
    tokens: { input: 10, output: 10, cached: 0 },
    cost: 0.01,
    mode: "estimated",
    confidence: 0.5
  },
  privacy: { sourceExcluded: true, isPublic: true, anonymizeBranch: false }
};

describe("publishReceiptToCloud on an already-published receipt (`share-conflict.test.ts`)", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("keeps the original local claim token when the API answers 409", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: "Receipt already published",
        publicId: receipt.receipt.id,
        url: `https://qodewk.test/r/${receipt.receipt.id}`
      })
    }) as unknown as typeof fetch;

    const result = await publishReceiptToCloud(receipt);

    expect(result).toBeNull();
    // Saving again would replace the stored claim token with null
    expect(saveReceipt).not.toHaveBeenCalled();
  });
});
