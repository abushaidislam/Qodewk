import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "../app/api/receipts/route.js";
import { ReceiptV1 } from "@qodewk/protocol";

describe("/api/receipts API Route Handlers (`api.test.ts`)", () => {
  const validReceipt: ReceiptV1 = {
    version: "1.0",
    receipt: {
      id: "rec_apivalidtest12345678901234",
      createdAt: "2026-10-01T12:00:00.000Z",
      contentHash: "f".repeat(64)
    },
    repository: {
      repoHash: "e".repeat(64),
      projectAlias: "qodewk-web-api",
      branch: "main",
      headSha: "d".repeat(40),
      commitsCount: 1
    },
    mutation: {
      files: 3,
      insertions: 50,
      deletions: 10,
      netLines: 40,
      renames: 0
    },
    ai: {
      provider: "anthropic",
      model: "claude-sonnet-4",
      tokens: { input: 12000, output: 2500, cached: 4000 },
      cost: 0.15,
      mode: "verified",
      confidence: 0.95
    },
    privacy: {
      sourceExcluded: true,
      isPublic: true,
      anonymizeBranch: false
    }
  };

  describe("POST /api/receipts", () => {
    it("enforces 50 KB payload cap and returns 413 when exceeded", async () => {
      const oversizedReq = new NextRequest(new URL("http://localhost:3000/api/receipts"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "60000" // > 51200 bytes
        },
        body: JSON.stringify(validReceipt)
      });

      const res = await POST(oversizedReq);
      expect(res.status).toBe(413);

      const json = await res.json();
      expect(json.error).toContain("50 KB maximum request limit");
    });

    it("rejects invalid receipt schema payloads with 400", async () => {
      const invalidPayload = {
        version: "1.0",
        receipt: { id: "not_a_valid_receipt" }
        // missing required fields
      };

      const req = new NextRequest(new URL("http://localhost:3000/api/receipts"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(JSON.stringify(invalidPayload).length)
        },
        body: JSON.stringify(invalidPayload)
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBe("Invalid receipt protocol payload");
    });

    it("accepts valid ReceiptV1 payload and returns publicId, url, and claimToken with 200", async () => {
      const payloadStr = JSON.stringify(validReceipt);
      const req = new NextRequest(new URL("http://localhost:3000/api/receipts"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(payloadStr.length)
        },
        body: payloadStr
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.publicId).toBe(validReceipt.receipt.id);
      expect(json.url).toContain(`/r/${validReceipt.receipt.id}`);
      expect(json.claimToken).toMatch(/^clm_[0-9a-f]{32}$/);
    });
  });

  describe("GET /api/receipts", () => {
    it("returns 400 when id query parameter is missing", async () => {
      const req = new NextRequest(new URL("http://localhost:3000/api/receipts"));
      const res = await GET(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBe("Missing receipt id");
    });

    it("returns 404 for non-existent receipt ID", async () => {
      const req = new NextRequest(new URL("http://localhost:3000/api/receipts?id=rec_unknown_99999"));
      const res = await GET(req);
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.error).toBe("Receipt not found");
    });

    it("retrieves previously stored receipt by ID with 200", async () => {
      const req = new NextRequest(
        new URL(`http://localhost:3000/api/receipts?id=${validReceipt.receipt.id}`)
      );
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.receipt.id).toBe(validReceipt.receipt.id);
      expect(json.ai.model).toBe("claude-sonnet-4");
      expect(json.privacy.sourceExcluded).toBe(true);
    });
  });
});
