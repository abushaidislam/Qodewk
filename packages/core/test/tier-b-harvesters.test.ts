import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import {
  harvestClineFootprints,
  harvestOpenCodeFootprints,
  harvestUniversalFootprints,
  parseGitTrailers,
  detectProviderFromCommit,
  selectPrimaryFootprint
} from "../src/index.js";

describe("Tier B Harvesters (Cline / Roo Code & OpenCode)", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "qodewk-tier-b-test-"));
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  describe("harvestClineFootprints (Cline & Roo Code)", () => {
    it("handles non-existent or empty directories gracefully without throwing", () => {
      const nonExistent = path.join(tempDir, "does-not-exist");
      expect(() => {
        const fps = harvestClineFootprints(nonExistent, undefined, { storageDirs: [nonExistent] });
        expect(fps).toEqual([]);
      }).not.toThrow();
    });

    it("parses mock Cline task directory with telemetry and tool calls", () => {
      const storageDir = path.join(tempDir, "cline-tasks");
      const taskId = "task-uuid-12345";
      const taskDir = path.join(storageDir, taskId);
      fs.mkdirSync(taskDir, { recursive: true });

      const mockUiMessages = [
        {
          ts: Date.now() - 5000,
          type: "say",
          say: "task",
          text: "Implement universal Cline telemetry adapter for Qodewk"
        },
        {
          ts: Date.now() - 4000,
          type: "say",
          say: "tool",
          text: JSON.stringify({
            tool: "write_to_file",
            path: "packages/core/src/harvester/cline.ts"
          })
        },
        {
          ts: Date.now() - 3000,
          type: "say",
          say: "tool",
          text: JSON.stringify({
            tool: "replace_in_file",
            path: "packages/core/src/index.ts"
          })
        },
        {
          ts: Date.now() - 1000,
          type: "say",
          say: "api_req_finished",
          text: JSON.stringify({
            tokensIn: 8500,
            tokensOut: 1200,
            cacheReads: 4000,
            totalCost: 0.048,
            model: "claude-3-7-sonnet"
          })
        }
      ];

      fs.writeFileSync(
        path.join(taskDir, "ui_messages.json"),
        JSON.stringify(mockUiMessages, null, 2),
        "utf-8"
      );

      const repoPath = tempDir;
      const fps = harvestClineFootprints(repoPath, undefined, {
        storageDirs: [storageDir]
      });

      expect(fps.length).toBe(1);
      const fp = fps[0]!;
      expect(fp.platform).toBe("cline");
      expect(fp.sessionId).toBe(taskId);
      expect(fp.taskTitle).toContain("Implement universal Cline telemetry");
      expect(fp.model).toBe("claude-3-7-sonnet");
      expect(fp.stepsCount).toBe(2);
      expect(fp.filesEdited).toContain("packages/core/src/harvester/cline.ts");
      expect(fp.filesEdited).toContain("packages/core/src/index.ts");
      expect(fp.tokens.input).toBe(8500);
      expect(fp.tokens.output).toBe(1200);
      expect(fp.tokens.cached).toBe(4000);
      expect(fp.cost).toBe(0.048);
      expect(fp.mode).toBe("verified");
      expect(fp.confidence).toBe(0.90);
    });

    it("parses local repository .cline/tasks directory", () => {
      const localTaskDir = path.join(tempDir, ".cline", "tasks", "local-task-001");
      fs.mkdirSync(localTaskDir, { recursive: true });

      const mockUi = [
        {
          ts: Date.now() - 2000,
          type: "say",
          say: "task",
          text: "Fix local bugs in repository"
        },
        {
          ts: Date.now() - 1000,
          type: "say",
          say: "tool",
          text: JSON.stringify({
            tool: "write_to_file",
            path: "src/utils.ts"
          })
        }
      ];

      fs.writeFileSync(
        path.join(localTaskDir, "ui_messages.json"),
        JSON.stringify(mockUi, null, 2),
        "utf-8"
      );

      const fps = harvestClineFootprints(tempDir);
      expect(fps.length).toBe(1);
      expect(fps[0]!.platform).toBe("cline");
      expect(fps[0]!.mode).toBe("imported");
      expect(fps[0]!.filesEdited).toContain("src/utils.ts");
    });
  });

  describe("harvestOpenCodeFootprints (OpenCode CLI)", () => {
    it("handles non-existent directory without throwing", () => {
      const nonExistent = path.join(tempDir, "opencode-missing");
      expect(() => {
        const fps = harvestOpenCodeFootprints(tempDir, undefined, { storageDir: nonExistent });
        expect(fps).toEqual([]);
      }).not.toThrow();
    });

    it("parses mock OpenCode session JSON file in repo .opencode/sessions", () => {
      const opencodeDir = path.join(tempDir, ".opencode", "sessions");
      fs.mkdirSync(opencodeDir, { recursive: true });

      const sessionJson = {
        id: "sess_opencode_99",
        title: "Build fast diff visualization",
        model: "claude-3-5-sonnet",
        created_at: new Date().toISOString(),
        files: ["src/diff.ts", "test/diff.test.ts"],
        tokens: {
          input: 12000,
          output: 1500,
          cached: 6000
        },
        cost: 0.058,
        commit: "fedcba9876543210fedcba9876543210fedcba98"
      };

      fs.writeFileSync(
        path.join(opencodeDir, "sess_opencode_99.json"),
        JSON.stringify(sessionJson, null, 2),
        "utf-8"
      );

      const fps = harvestOpenCodeFootprints(tempDir);
      expect(fps.length).toBe(1);
      const fp = fps[0]!;
      expect(fp.platform).toBe("opencode");
      expect(fp.sessionId).toBe("sess_opencode_99");
      expect(fp.taskTitle).toBe("Build fast diff visualization");
      expect(fp.model).toBe("claude-3-5-sonnet");
      expect(fp.filesEdited).toContain("src/diff.ts");
      expect(fp.filesEdited).toContain("test/diff.test.ts");
      expect(fp.tokens.input).toBe(12000);
      expect(fp.tokens.output).toBe(1500);
      expect(fp.tokens.cached).toBe(6000);
      expect(fp.cost).toBe(0.058);
      expect(fp.mode).toBe("verified");
      expect(fp.boundCommitSha).toBe("fedcba9876543210fedcba9876543210fedcba98");
      expect(fp.confidence).toBe(0.95);
    });
  });

  describe("Git Trailers & Commit Message Detection for Tier B Agents", () => {
    it("parses Co-authored-by trailers for Cline and Roo Code", () => {
      const msg = "feat: add feature\n\nCo-authored-by: Cline <cline@anthropic.com>";
      const trailers = parseGitTrailers(msg);
      expect(trailers.length).toBe(1);
      expect(trailers[0]!.provider).toBe("cline");
      expect(trailers[0]!.model).toBe("claude-3-7-sonnet");

      const rooMsg = "fix: repair bug\n\nCo-authored-by: Roo Code <bot@roocode.com>";
      const rooTrailers = parseGitTrailers(rooMsg);
      expect(rooTrailers.length).toBe(1);
      expect(rooTrailers[0]!.provider).toBe("cline");
    });

    it("parses Co-authored-by trailers for OpenCode and Codex", () => {
      const openCodeMsg = "refactor: clean codebase\n\nCo-authored-by: OpenCode <cli@opencode.ai>";
      const openTrailers = parseGitTrailers(openCodeMsg);
      expect(openTrailers.length).toBe(1);
      expect(openTrailers[0]!.provider).toBe("opencode");

      const codexMsg = "feat: optimize math\n\nCo-authored-by: Codex <codex@openai.com>";
      const codexTrailers = parseGitTrailers(codexMsg);
      expect(codexTrailers.length).toBe(1);
      expect(codexTrailers[0]!.provider).toBe("codex");
      expect(codexTrailers[0]!.model).toBe("gpt-4o");
    });

    it("detects provider from commit message body for cline and opencode", () => {
      const clineResult = detectProviderFromCommit("feat(core): implemented via cline automated agent");
      expect(clineResult).not.toBeNull();
      expect(clineResult?.provider).toBe("cline");
      expect(clineResult?.mode).toBe("observed");

      const openResult = detectProviderFromCommit("feat: created with opencode assistant");
      expect(openResult).not.toBeNull();
      expect(openResult?.provider).toBe("opencode");
    });
  });

  describe("Primary Disambiguation with Tier B Harvesters", () => {
    it("selects Cline as primary when Cline matches commit files over stale peers", () => {
      const headSha = "1122334455667788990011223344556677889900";
      const now = new Date();

      const clineFp = {
        id: "fp_cline",
        platform: "cline" as const,
        sessionId: "s_cline",
        repoPath: tempDir,
        taskTitle: "Refactor core",
        model: "claude-3-7-sonnet",
        stepsCount: 5,
        filesEdited: ["src/index.ts", "src/cline.ts"],
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
        tokens: { input: 5000, output: 800, cached: 2000 },
        cost: 0.03,
        mode: "verified" as const,
        confidence: 0.90
      };

      const staleAntigravity = {
        id: "fp_ag",
        platform: "antigravity" as const,
        sessionId: "s_ag",
        repoPath: tempDir,
        taskTitle: "Stale session",
        model: "claude-sonnet-4-6-thinking",
        stepsCount: 1,
        filesEdited: ["docs/readme.md"], // zero overlap
        timestamp: new Date(now.getTime() - 1000).toISOString(), // slightly newer timestamp
        tokens: { input: 2000, output: 200, cached: 0 },
        cost: 0.01,
        mode: "observed" as const,
        confidence: 0.70
      };

      const gitCtx = {
        headSha,
        commitDate: now.toISOString(),
        changedFiles: ["src/index.ts", "src/cline.ts"]
      };

      const { primary } = selectPrimaryFootprint([staleAntigravity, clineFp], gitCtx);
      expect(primary).toBeDefined();
      expect(primary?.platform).toBe("cline");
    });
  });

  describe("harvestUniversalFootprints integration with Tier B platforms", () => {
    it("runs harvestUniversalFootprints with platform filter without error", async () => {
      const resCline = await harvestUniversalFootprints({
        repoPath: tempDir,
        platform: "cline"
      });
      expect(resCline).toBeDefined();
      expect(Array.isArray(resCline.footprints)).toBe(true);

      const resOpen = await harvestUniversalFootprints({
        repoPath: tempDir,
        platform: "opencode"
      });
      expect(resOpen).toBeDefined();
      expect(Array.isArray(resOpen.footprints)).toBe(true);
    });
  });
});
