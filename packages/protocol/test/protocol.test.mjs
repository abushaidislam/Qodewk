import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ReceiptV1Schema, AttributionModeSchema } from "../dist/index.js";

describe("packages/protocol", () => {
  it("validates attribution mode enum values", () => {
    assert.equal(AttributionModeSchema.parse("observed"), "observed");
    assert.equal(AttributionModeSchema.parse("estimated"), "estimated");
    assert.equal(AttributionModeSchema.parse("verified"), "verified");
    assert.throws(() => AttributionModeSchema.parse("invalid_mode"));
  });

  it("validates a compliant ReceiptV1 payload", () => {
    const validReceipt = {
      version: "1.0",
      receipt: {
        id: "rec_1234567890abcdef12345678",
        createdAt: "2026-10-01T12:00:00.000Z",
        contentHash: "a".repeat(64)
      },
      repository: {
        repoHash: "b".repeat(64),
        projectAlias: "qodewk",
        branch: "main",
        headSha: "c".repeat(40),
        commitsCount: 1
      },
      mutation: {
        files: 2,
        insertions: 50,
        deletions: 10,
        netLines: 40
      },
      ai: {
        provider: "anthropic",
        model: "claude-sonnet-4",
        tokens: {
          input: 1000,
          output: 200,
          cached: 500
        },
        cost: 0.05,
        mode: "verified",
        confidence: 0.95
      },
      privacy: {
        sourceExcluded: true,
        isPublic: true
      }
    };

    const parsed = ReceiptV1Schema.parse(validReceipt);
    assert.equal(parsed.version, "1.0");
    assert.equal(parsed.privacy.sourceExcluded, true);
    assert.equal(parsed.ai.confidence, 0.95);
  });

  it("rejects receipt if sourceExcluded is false (Privacy by Construction)", () => {
    const invalidReceipt = {
      version: "1.0",
      receipt: {
        id: "rec_1234567890abcdef12345678",
        createdAt: "2026-10-01T12:00:00.000Z",
        contentHash: "a".repeat(64)
      },
      repository: {
        repoHash: "b".repeat(64),
        projectAlias: "qodewk",
        branch: "main",
        headSha: "c".repeat(40)
      },
      mutation: {
        files: 1,
        insertions: 10,
        deletions: 0,
        netLines: 10
      },
      ai: {
        provider: "openai",
        tokens: { input: 100, output: 50 },
        cost: 0.01,
        mode: "estimated",
        confidence: 0.5
      },
      privacy: {
        sourceExcluded: false // Must fail!
      }
    };

    assert.throws(() => ReceiptV1Schema.parse(invalidReceipt));
  });

  it("rejects confidence outside 0.0 - 1.0", () => {
    const invalidReceipt = {
      version: "1.0",
      receipt: {
        id: "rec_1234567890abcdef12345678",
        createdAt: "2026-10-01T12:00:00.000Z",
        contentHash: "a".repeat(64)
      },
      repository: {
        repoHash: "b".repeat(64),
        projectAlias: "qodewk",
        branch: "main",
        headSha: "c".repeat(40)
      },
      mutation: {
        files: 1,
        insertions: 10,
        deletions: 0,
        netLines: 10
      },
      ai: {
        provider: "openai",
        tokens: { input: 100, output: 50 },
        cost: 0.01,
        mode: "estimated",
        confidence: 1.5 // > 1.0 must fail!
      },
      privacy: {
        sourceExcluded: true
      }
    };

    assert.throws(() => ReceiptV1Schema.parse(invalidReceipt));
  });
});
