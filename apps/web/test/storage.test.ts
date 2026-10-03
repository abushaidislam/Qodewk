import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  saveReceiptToStore,
  getReceiptFromStore,
  isDurableStoreConfigured
} from "../lib/storage.js";
import { ReceiptV1 } from "@qodewk/protocol";

describe("Supabase Storage & Durable Persistence (`lib/storage.ts`)", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  const mockReceipt: ReceiptV1 = {
    version: "1.0",
    receipt: {
      id: "rec_supabase_test_9876543210",
      createdAt: "2026-10-04T00:00:00.000Z",
      contentHash: "a".repeat(64)
    },
    repository: {
      repoHash: "b".repeat(64),
      projectAlias: "supabase-test-app",
      branch: "main",
      headSha: "c".repeat(40),
      commitsCount: 1
    },
    mutation: {
      files: 5,
      insertions: 120,
      deletions: 15,
      netLines: 105,
      renames: 0
    },
    ai: {
      provider: "google",
      model: "gemini-3-8-flash",
      tokens: { input: 15000, output: 3000, cached: 5000 },
      cost: 0.05,
      mode: "estimated",
      confidence: 0.65
    },
    privacy: {
      sourceExcluded: true,
      isPublic: true,
      anonymizeBranch: false
    }
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    global.fetch = vi.fn();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("isDurableStoreConfigured returns true only when URL and Key are provided", () => {
    expect(isDurableStoreConfigured()).toBe(false);

    process.env.SUPABASE_URL = "https://test.supabase.co";
    expect(isDurableStoreConfigured()).toBe(false);

    process.env.SUPABASE_ANON_KEY = "test-anon-key";
    expect(isDurableStoreConfigured()).toBe(true);
  });

  it("saveReceiptToStore sends well-formed REST request to Supabase endpoint", async () => {
    process.env.SUPABASE_URL = "https://mock.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-key";

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({})
    });

    await saveReceiptToStore(mockReceipt, "claim_hash_999");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as any).mock.calls[0];

    expect(url).toBe("https://mock.supabase.co/rest/v1/receipts");
    expect(options.method).toBe("POST");
    expect(options.headers["apikey"]).toBe("mock-service-key");
    expect(options.headers["Authorization"]).toBe("Bearer mock-service-key");
    expect(options.headers["Prefer"]).toBe("resolution=merge-duplicates");

    const parsedBody = JSON.parse(options.body);
    expect(parsedBody.public_id).toBe(mockReceipt.receipt.id);
    expect(parsedBody.project_alias).toBe("supabase-test-app");
    expect(parsedBody.estimated_cost).toBe(0.05);
    expect(parsedBody.claim_token_hash).toBe("claim_hash_999");
  });

  it("getReceiptFromStore fetches from Supabase REST API on memory cache miss", async () => {
    const freshId = "rec_from_supabase_remote_999";
    process.env.SUPABASE_URL = "https://mock.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-key";

    const remotePayload = {
      ...mockReceipt,
      receipt: { ...mockReceipt.receipt, id: freshId }
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ payload_json: remotePayload }]
    });

    const result = await getReceiptFromStore(freshId);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as any).mock.calls[0];
    expect(url).toContain(`public_id=eq.${freshId}`);
    expect(options.headers["apikey"]).toBe("mock-service-key");

    expect(result).not.toBeNull();
    expect(result?.receipt.id).toBe(freshId);
    expect(result?.ai.model).toBe("gemini-3-8-flash");
  });

  it("handles Supabase fetch failure gracefully without crashing", async () => {
    process.env.SUPABASE_URL = "https://mock.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-key";

    (global.fetch as any).mockRejectedValue(new Error("Supabase network timeout"));

    const result = await getReceiptFromStore("rec_unreachable_id_000");
    expect(result).toBeNull();
  });
});
