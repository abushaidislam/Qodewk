import { describe, it, expect, beforeEach } from "vitest";
import { saveReceiptToStore, getReceiptFromStore } from "../lib/storage.js";
import { ReceiptV1 } from "@qodewk/protocol";

describe("apps/web storage (`lib/storage.ts`)", () => {
  const mockReceipt: ReceiptV1 = {
    version: "1.0",
    receipt: {
      id: "rec_webtest123456789012345678",
      createdAt: "2025-01-01T00:00:00.000Z",
      contentHash: "a".repeat(64)
    },
    repository: {
      repoHash: "b".repeat(64),
      projectAlias: "web-test-app",
      branch: "main",
      headSha: "c".repeat(40),
      commitsCount: 1
    },
    mutation: {
      files: 2,
      insertions: 40,
      deletions: 10,
      netLines: 30,
      renames: 0
    },
    ai: {
      provider: "anthropic",
      model: "claude-3-7-sonnet",
      tokens: { input: 8000, output: 1500, cached: 3000 },
      cost: 0.10,
      mode: "verified",
      confidence: 0.95
    },
    privacy: {
      sourceExcluded: true,
      isPublic: true,
      anonymizeBranch: false
    }
  };

  it("stores and retrieves receipt from in-memory store", async () => {
    await saveReceiptToStore(mockReceipt, "hash_12345");
    const retrieved = await getReceiptFromStore(mockReceipt.receipt.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.receipt.id).toBe(mockReceipt.receipt.id);
    expect(retrieved?.repository.projectAlias).toBe("web-test-app");
  });

  it("returns null for non-existent receipt ID", async () => {
    const retrieved = await getReceiptFromStore("rec_non_existent_id_999999");
    expect(retrieved).toBeNull();
  });
});
