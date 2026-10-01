import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeAiWrittenRatio } from "../dist/git.js";
import {
  sanitizeReceiptForShare,
  scoreFootprint,
  selectPrimaryFootprint,
  normalizeFilePath
} from "../dist/index.js";

describe("normalizeFilePath", () => {
  it("normalizes Windows backslashes and case", () => {
    assert.equal(
      normalizeFilePath("src\\components\\App.tsx"),
      "src/components/app.tsx"
    );
  });

  it("strips repoPath prefix and leading dot-slash", () => {
    assert.equal(
      normalizeFilePath("C:/Users/dev/project/src/index.ts", "C:/Users/dev/project"),
      "src/index.ts"
    );
    assert.equal(normalizeFilePath("./packages/cli/src/index.ts"), "packages/cli/src/index.ts");
  });
});

describe("scoreFootprint (P0 Commit-Bound Attribution)", () => {
  const gitCtx = {
    headSha: "ab4f9b6b93ca4b8b4df756526339959793ec4068",
    commitDate: "2026-09-29T12:00:00.000Z",
    changedFiles: ["packages/cli/src/index.ts", "packages/cli/package.json"]
  };

  it("gives maximum +1.00 score to commit-bound footprint", () => {
    const cursorFp = {
      id: "cursor_commit_1",
      platform: "cursor",
      sessionId: "ws_1",
      repoPath: "/repo",
      taskTitle: "feat: add cli",
      model: "claude-3-7-sonnet",
      stepsCount: 10,
      filesEdited: ["packages/cli/src/index.ts"],
      timestamp: "2026-09-29T12:05:00.000Z",
      boundCommitSha: "ab4f9b6b93ca4b8b4df756526339959793ec4068",
      tokens: { input: 1000, output: 500, cached: 200 },
      cost: 0.05,
      mode: "verified",
      confidence: 0.95
    };

    const score = scoreFootprint(cursorFp, gitCtx);
    // Base 0.10 + Commit 1.00 + Overlap (1/2 * 0.40) 0.20 + Time (<15m) 0.25 + Mode (verified) 0.10 = 1.65
    assert.ok(score >= 1.5, `Score should be >= 1.5, got ${score}`);
  });

  it("penalizes footprint with zero file overlap", () => {
    const unrelatedFp = {
      id: "antigravity_old",
      platform: "antigravity",
      sessionId: "conv_1",
      repoPath: "/repo",
      taskTitle: "unrelated docs work",
      model: "claude-sonnet-4-6-thinking",
      stepsCount: 5,
      filesEdited: ["docs/README.md"],
      timestamp: "2026-09-29T12:01:00.000Z",
      tokens: { input: 1000, output: 500, cached: 200 },
      cost: 0.05,
      mode: "verified",
      confidence: 0.95
    };

    const score = scoreFootprint(unrelatedFp, gitCtx);
    // Base 0.10 - Overlap penalty 0.15 + Time 0.25 + Mode 0.10 = 0.30
    assert.ok(score < 0.5, `Score should be penalised, got ${score}`);
  });
});

describe("selectPrimaryFootprint (Disambiguation Engine)", () => {
  const gitCtx = {
    headSha: "ab4f9b6b93ca4b8b4df756526339959793ec4068",
    commitDate: "2026-09-29T12:00:00.000Z",
    changedFiles: ["apps/web/page.tsx"]
  };

  it("selects Cursor when Cursor matches commit even if Antigravity timestamp is newer", () => {
    const staleNewerAntigravity = {
      id: "ag_stale",
      platform: "antigravity",
      sessionId: "conv_stale",
      repoPath: "/repo",
      taskTitle: "some other work",
      model: "gemini-3-8-flash",
      stepsCount: 8,
      filesEdited: ["packages/core/src/index.ts"],
      timestamp: "2026-09-29T12:10:00.000Z", // Newer timestamp!
      tokens: { input: 500, output: 200, cached: 100 },
      cost: 0.01,
      mode: "verified",
      confidence: 0.95
    };

    const cursorMatched = {
      id: "cursor_exact",
      platform: "cursor",
      sessionId: "ws_exact",
      repoPath: "/repo",
      taskTitle: "Fix home page",
      model: "claude-3-7-sonnet",
      stepsCount: 15,
      filesEdited: ["apps/web/page.tsx"], // 100% overlap!
      timestamp: "2026-09-29T11:58:00.000Z", // Slightly older timestamp
      boundCommitSha: "ab4f9b6b93ca4b8b4df756526339959793ec4068", // Direct commit bind!
      tokens: { input: 2000, output: 800, cached: 500 },
      cost: 0.08,
      mode: "verified",
      confidence: 0.95
    };

    const result = selectPrimaryFootprint([staleNewerAntigravity, cursorMatched], gitCtx);
    assert.equal(result.primary?.platform, "cursor");
    assert.equal(result.rankedFootprints[0].platform, "cursor");
    assert.equal(result.rankedFootprints[1].platform, "antigravity");
    assert.ok(result.rankedFootprints[0].attributionScore > result.rankedFootprints[1].attributionScore);
  });
});

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
