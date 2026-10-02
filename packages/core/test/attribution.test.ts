import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import {
  normalizeFilePath,
  scoreFootprint,
  selectPrimaryFootprint,
  computeAiWrittenRatio,
  sanitizeReceiptForShare,
  parseGitTrailers,
  harvestTrailerFootprints,
  harvestAiderFootprints
} from "../src/index.js";
import { ReceiptV1 } from "@qodewk/protocol";

describe("attribution legacy test suite", () => {
  describe("normalizeFilePath", () => {
    it("normalizes Windows backslashes and case", () => {
      expect(normalizeFilePath("src\\git.ts")).toBe("src/git.ts");
      expect(normalizeFilePath("SRC\\Git.TS")).toBe("src/git.ts");
    });

    it("strips repoPath prefix and leading dot-slash", () => {
      const repoPath = "/Users/dev/Qodewk";
      expect(normalizeFilePath("/Users/dev/Qodewk/packages/core/src/git.ts", repoPath)).toBe("packages/core/src/git.ts");
      expect(normalizeFilePath("./packages/core/src/git.ts", repoPath)).toBe("packages/core/src/git.ts");
    });
  });

  describe("scoreFootprint (P0 Commit-Bound Attribution)", () => {
    it("gives maximum +1.00 score to commit-bound footprint", () => {
      const fp = {
        id: "fp_1",
        platform: "cursor" as const,
        sessionId: "s_1",
        repoPath: "/app",
        taskTitle: "Test",
        model: "claude-3-7-sonnet",
        stepsCount: 1,
        filesEdited: ["src/index.ts"],
        timestamp: new Date().toISOString(),
        boundCommitSha: "a1b2c3d4e5f67890123456789012345678901234",
        tokens: { input: 100, output: 100, cached: 0 },
        cost: 0.01,
        mode: "verified" as const,
        confidence: 0.95
      };

      const gitCtx = {
        headSha: "a1b2c3d4e5f67890123456789012345678901234",
        commitDate: new Date().toISOString(),
        changedFiles: ["src/index.ts"]
      };

      const score = scoreFootprint(fp, gitCtx);
      expect(score).toBeGreaterThan(1.0);
    });

    it("penalizes footprint with zero file overlap", () => {
      const fp = {
        id: "fp_1",
        platform: "cursor" as const,
        sessionId: "s_1",
        repoPath: "/app",
        taskTitle: "Test",
        model: "claude-3-7-sonnet",
        stepsCount: 1,
        filesEdited: ["unrelated.ts"],
        timestamp: new Date().toISOString(),
        tokens: { input: 100, output: 100, cached: 0 },
        cost: 0.01,
        mode: "verified" as const,
        confidence: 0.95
      };

      const gitCtx = {
        headSha: "a1b2c3d4e5f67890123456789012345678901234",
        commitDate: new Date().toISOString(),
        changedFiles: ["src/index.ts"]
      };

      const score = scoreFootprint(fp, gitCtx);
      expect(score).toBeLessThan(0.35);
    });
  });

  describe("selectPrimaryFootprint (Disambiguation Engine)", () => {
    it("selects Cursor when Cursor matches commit even if Antigravity timestamp is newer", () => {
      const now = new Date();
      const cursorFp = {
        id: "fp_cursor",
        platform: "cursor" as const,
        sessionId: "s_cursor",
        repoPath: "/app",
        taskTitle: "Cursor task",
        model: "claude-3-7-sonnet",
        stepsCount: 1,
        filesEdited: ["src/index.ts"],
        timestamp: new Date(now.getTime() - 60000).toISOString(),
        boundCommitSha: "a1b2c3d4e5f67890123456789012345678901234",
        tokens: { input: 100, output: 100, cached: 0 },
        cost: 0.01,
        mode: "verified" as const,
        confidence: 0.95
      };

      const antigravityFp = {
        id: "fp_ag",
        platform: "antigravity" as const,
        sessionId: "s_ag",
        repoPath: "/app",
        taskTitle: "Antigravity task",
        model: "claude-sonnet-4-6-thinking",
        stepsCount: 1,
        filesEdited: ["unrelated.ts"],
        timestamp: now.toISOString(),
        tokens: { input: 100, output: 100, cached: 0 },
        cost: 0.01,
        mode: "verified" as const,
        confidence: 0.95
      };

      const gitCtx = {
        headSha: "a1b2c3d4e5f67890123456789012345678901234",
        commitDate: now.toISOString(),
        changedFiles: ["src/index.ts"]
      };

      const { primary } = selectPrimaryFootprint([antigravityFp, cursorFp], gitCtx);
      expect(primary?.id).toBe("fp_cursor");
    });
  });

  describe("computeAiWrittenRatio", () => {
    it("returns undefined when either side is empty", () => {
      expect(computeAiWrittenRatio([], ["src/index.ts"])).toBeUndefined();
      expect(computeAiWrittenRatio(["src/index.ts"], [])).toBeUndefined();
    });

    it("computes overlap without inventing coverage", () => {
      expect(computeAiWrittenRatio(["src/a.ts", "src/b.ts"], ["src/a.ts"])).toBe(0.5);
    });

    it("matches path suffix forms", () => {
      expect(computeAiWrittenRatio(["packages/core/src/git.ts"], ["git.ts"])).toBe(1);
    });
  });

  describe("sanitizeReceiptForShare", () => {
    it("strips filesTouched and forces isPublic", () => {
      const receipt: ReceiptV1 = {
        version: "1.0",
        receipt: {
          id: "rec_123456789012345678901234",
          createdAt: "2025-01-01T00:00:00.000Z",
          contentHash: "a".repeat(64)
        },
        repository: {
          repoHash: "b".repeat(64),
          projectAlias: "test",
          branch: "main",
          headSha: "c".repeat(40),
          commitsCount: 1
        },
        mutation: {
          files: 1,
          insertions: 10,
          deletions: 0,
          netLines: 10,
          renames: 0
        },
        ai: {
          provider: "anthropic",
          tokens: { input: 100, output: 100, cached: 0 },
          cost: 0.01,
          mode: "verified",
          confidence: 0.95,
          sessions: [
            {
              provider: "anthropic",
              model: "claude-3-7-sonnet",
              filesTouched: ["src/secret.ts"],
              tokens: { input: 100, output: 100, cached: 0 },
              cost: 0.01,
              confidence: 0.95,
              mode: "verified"
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
      expect(sanitized.privacy.isPublic).toBe(true);
      expect(sanitized.ai.sessions?.[0] && ("filesTouched" in sanitized.ai.sessions[0])).toBe(false);
    });
  });

  describe("Phase P1: Git Commit Trailers & Copilot Discovery", () => {
    it("parses standard Co-authored-by trailers for Copilot, Claude, Cursor, Aider", () => {
      const msg = `feat: add awesome feature

Co-authored-by: GitHub Copilot <copilot@github.com>
Co-authored-by: Claude <noreply@anthropic.com>`;

      const trailers = parseGitTrailers(msg);
      expect(trailers.length).toBe(2);
      expect(trailers[0]?.provider).toBe("copilot");
      expect(trailers[0]?.model).toBe("gpt-4o");
      expect(trailers[1]?.provider).toBe("claude");
      expect(trailers[1]?.model).toBe("claude-3-7-sonnet");
    });

    it("harvestTrailerFootprints produces bound footprints with observed mode", () => {
      const msg = "fix: critical bug\n\nCo-authored-by: GitHub Copilot <copilot@github.com>";
      const headSha = "1234567890abcdef1234567890abcdef12345678";
      const fps = harvestTrailerFootprints("/repo", msg, headSha, "2026-09-30T10:00:00.000Z");

      expect(fps.length).toBe(1);
      const fp = fps[0]!;
      expect(fp.platform).toBe("copilot");
      expect(fp.boundCommitSha).toBe(headSha);
      expect(fp.mode).toBe("observed");
      expect(fp.confidence).toBe(0.90);
    });
  });

  describe("Phase P1: Aider Markdown Harvester", () => {
    it("parses .aider.chat.history.md sessions, models, files, and commits", () => {
      const tmpDir = path.join(process.cwd(), "test-tmp-aider");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const mockAiderHistory = `# aider chat started at 2026-09-28 14:00:00

#### fix user login issue
Model: claude-3-5-sonnet-20241022 with diff edit format

> Applied edit to src/auth.ts
> Commit 82ace2c feat: fix login logic
Tokens: 2.5k sent, 350 received. Cost: $0.03 session.
`;

      fs.writeFileSync(path.join(tmpDir, ".aider.chat.history.md"), mockAiderHistory, "utf-8");

      try {
        const fps = harvestAiderFootprints(tmpDir);
        expect(fps.length).toBe(1);
        const fp = fps[0]!;
        expect(fp.platform).toBe("aider");
        expect(fp.model).toBe("claude-3-5-sonnet-20241022");
        expect(fp.taskTitle).toBe("fix user login issue");
        expect(fp.boundCommitSha).toBe("82ace2c");
        expect(fp.filesEdited).toContain("src/auth.ts");
        expect(fp.cost).toBe(0.03);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
