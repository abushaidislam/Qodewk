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
      expect(res.headers.get("x-ratelimit-limit")).toBe("30");
    });

    it("enforces rate limits and returns 429 when client exceeds request limit", async () => {
      const uniqueIp = "192.168.100.42";
      const payloadStr = JSON.stringify(validReceipt);

      // Consume up to limit (30 requests)
      for (let i = 0; i < 30; i++) {
        const req = new NextRequest(new URL("http://localhost:3000/api/receipts"), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "content-length": String(payloadStr.length),
            "x-forwarded-for": uniqueIp
          },
          body: payloadStr
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
      }

      // 31st request should be rejected with 429 Too Many Requests
      const limitReq = new NextRequest(new URL("http://localhost:3000/api/receipts"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(payloadStr.length),
          "x-forwarded-for": uniqueIp
        },
        body: payloadStr
      });
      const limitRes = await POST(limitReq);
      expect(limitRes.status).toBe(429);

      const json = await limitRes.json();
      expect(json.error).toContain("Too many requests");
      expect(limitRes.headers.get("retry-after")).toBeDefined();
    });

    it("returns 503 Service Unavailable in production when durable store is unconfigured", async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevSupabaseUrl = process.env.SUPABASE_URL;
      const prevSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        (process.env as any).NODE_ENV = "production";
        delete process.env.SUPABASE_URL;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        delete process.env.SUPABASE_ANON_KEY;

        const payloadStr = JSON.stringify(validReceipt);
        const req = new NextRequest(new URL("http://localhost:3000/api/receipts"), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "content-length": String(payloadStr.length),
            "x-forwarded-for": "10.0.0.99"
          },
          body: payloadStr
        });

        const res = await POST(req);
        expect(res.status).toBe(503);
        const json = await res.json();
        expect(json.error).toBe("Durable storage failure");
        expect(json.message).toContain("Durable storage is required in production");
      } finally {
        (process.env as any).NODE_ENV = prevEnv;
        if (prevSupabaseUrl) process.env.SUPABASE_URL = prevSupabaseUrl;
        if (prevSupabaseKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevSupabaseKey;
      }
    });

    it("dynamically formats public URL using NEXT_PUBLIC_APP_URL when present", async () => {
      const prev = process.env.NEXT_PUBLIC_APP_URL;
      try {
        process.env.NEXT_PUBLIC_APP_URL = "https://custom.mycompany.com";
        const req = new NextRequest(new URL("http://localhost:3000/api/receipts"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...validReceipt, receipt: { ...validReceipt.receipt, id: "rec_url_test_1" } })
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.url).toBe("https://custom.mycompany.com/r/rec_url_test_1");
      } finally {
        if (prev) process.env.NEXT_PUBLIC_APP_URL = prev;
        else delete process.env.NEXT_PUBLIC_APP_URL;
      }
    });

    it("dynamically resolves domain from x-forwarded-host header if env is not configured", async () => {
      const prev = process.env.NEXT_PUBLIC_APP_URL;
      try {
        delete process.env.NEXT_PUBLIC_APP_URL;
        delete process.env.QODEWK_APP_URL;
        delete process.env.VERCEL_URL;

        const req = new NextRequest(new URL("http://localhost:3000/api/receipts"), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-host": "preview-branch.vercel.app",
            "x-forwarded-proto": "https"
          },
          body: JSON.stringify({ ...validReceipt, receipt: { ...validReceipt.receipt, id: "rec_url_test_2" } })
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.url).toBe("https://preview-branch.vercel.app/r/rec_url_test_2");
      } finally {
        if (prev) process.env.NEXT_PUBLIC_APP_URL = prev;
      }
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
