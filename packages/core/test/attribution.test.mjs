import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeAiWrittenRatio } from "../dist/git.js";
import { sanitizeReceiptForShare } from "../dist/index.js";

describe("computeAiWrittenRatio", () => {
  it("returns undefined when either side is empty", () => {
    assert.equal(computeAiWrittenRatio([], ["a.ts"]), undefined);
    assert.equal(computeAiWrittenRatio(["a.ts"], []), undefined);
  });

  it("computes overlap without inventing coverage", () => {
    const ratio = computeAiWrittenRatio(
      ["src/a.ts", "src/b.ts", "README.md"],
      ["src/a.ts", "src/c.ts"]
    );
    assert.equal(ratio, 0.33);
  });

  it("matches path suffix forms", () => {
    const ratio = computeAiWrittenRatio(["packages/cli/src/index.ts"], ["src/index.ts"]);
    assert.equal(ratio, 1);
  });
});

describe("sanitizeReceiptForShare", () => {
  it("strips filesTouched and forces isPublic", () => {
    const receipt = {
      version: "1.0",
      receipt: {
        id: "rec_" + "a".repeat(24),
        createdAt: "2026-09-28T00:00:00.000Z",
        contentHash: "b".repeat(64)
      },
      repository: {
        repoHash: "c".repeat(64),
        projectAlias: "demo",
        branch: "main",
        headSha: "d".repeat(40),
        commitsCount: 1
      },
      mutation: {
        files: 1,
        insertions: 10,
        deletions: 2,
        netLines: 8,
        renames: 0
      },
      ai: {
        provider: "claude",
        model: "claude-sonnet-4",
        tokens: { input: 100, output: 50, cached: 10 },
        cost: 0.01,
        mode: "verified",
        confidence: 0.9,
        sessions: [
          {
            provider: "claude",
            tokens: { input: 100, output: 50, cached: 10 },
            cost: 0.01,
            confidence: 0.9,
            mode: "verified",
            filesTouched: ["secret/path.ts"]
          }
        ]
      },
      privacy: {
        sourceExcluded: true,
        isPublic: false,
        anonymizeBranch: false
      }
    };

    const sanitized = sanitizeReceiptForShare(receipt);
    assert.equal(sanitized.privacy.isPublic, true);
    assert.equal(sanitized.ai.sessions?.[0]?.filesTouched, undefined);
    assert.equal(sanitized.ai.sessions?.[0]?.provider, "claude");
  });
});
