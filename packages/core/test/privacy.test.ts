import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { simpleGit } from "simple-git";
import {
  generateReceipt,
  sanitizeReceiptForShare,
  computeSaltedHash
} from "../src/index.js";
import { ReceiptV1 } from "@qodewk/protocol";

describe("Privacy by Construction Regression Suite (`privacy.test.ts`)", { timeout: 30000 }, () => {
  let tempRepoDir: string;

  beforeEach(async () => {
    tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), "qodewk-privacy-repo-"));
    const git = simpleGit(tempRepoDir);
    await git.init();
    await git.addConfig("user.name", "Security Auditor");
    await git.addConfig("user.email", "audit@qodewk.dev");

    // Create file containing proprietary sensitive code
    const sensitiveCode = `
      // PROPRIETARY AND CONFIDENTIAL
      const DB_PASSWORD = "super_secret_db_pass_12345";
      function proprietaryAlgorithm() {
        return "top-secret-ip-logic";
      }
    `;
    fs.writeFileSync(path.join(tempRepoDir, "sensitive.ts"), sensitiveCode, "utf-8");
    await git.add("sensitive.ts");
    await git.commit("Add proprietary logic and internal secrets");
  });

  afterEach(() => {
    try {
      fs.rmSync(tempRepoDir, { recursive: true, force: true });
    } catch {}
  });

  it("never includes raw source code, diff hunks, or proprietary content in ReceiptV1", async () => {
    const receipt = await generateReceipt({
      repoPath: tempRepoDir
    });

    const serialized = JSON.stringify(receipt);

    // Assert that proprietary strings and diff markers are NEVER present in the receipt
    expect(serialized).not.toContain("super_secret_db_pass_12345");
    expect(serialized).not.toContain("proprietaryAlgorithm");
    expect(serialized).not.toContain("PROPRIETARY AND CONFIDENTIAL");
    expect(serialized).not.toContain("diff --git");
    expect(serialized).not.toContain("@@ -");
    expect(serialized).not.toContain("+++ b/");
    expect(serialized).not.toContain("--- a/");

    // Explicit privacy flag must be true
    expect(receipt.privacy.sourceExcluded).toBe(true);
  });

  it("sanitizeReceiptForShare strips all local file paths from AI sessions", () => {
    const rawReceipt: ReceiptV1 = {
      version: "1.0",
      receipt: {
        id: "rec_privacy_test_01",
        createdAt: "2026-10-01T00:00:00.000Z",
        contentHash: "a".repeat(64)
      },
      repository: {
        repoHash: "b".repeat(64),
        projectAlias: "confidential-client-repo",
        branch: "feature/secret-feature",
        headSha: "c".repeat(40),
        commitsCount: 1
      },
      mutation: {
        files: 2,
        insertions: 30,
        deletions: 5,
        netLines: 25,
        renames: 0
      },
      ai: {
        provider: "anthropic",
        model: "claude-3-7-sonnet",
        tokens: { input: 15000, output: 2500, cached: 6000 },
        cost: 0.18,
        mode: "verified",
        confidence: 0.95,
        sessions: [
          {
            provider: "anthropic",
            model: "claude-3-7-sonnet",
            task: "Security hardening",
            tokens: { input: 15000, output: 2500, cached: 6000 },
            cost: 0.18,
            confidence: 0.95,
            mode: "verified",
            // Local paths that must be stripped before share
            ...({ filesTouched: ["/Users/dev/internal/secret.ts", "C:\\confidential\\key.pem"] } as any)
          }
        ]
      },
      privacy: {
        sourceExcluded: true,
        isPublic: false,
        anonymizeBranch: false
      }
    };

    const sanitized = sanitizeReceiptForShare(rawReceipt);

    expect(sanitized.privacy.isPublic).toBe(true);
    const session = sanitized.ai.sessions?.[0] as any;
    expect(session).toBeDefined();
    expect(session.filesTouched).toBeUndefined();

    const sanitizedStr = JSON.stringify(sanitized);
    expect(sanitizedStr).not.toContain("internal/secret.ts");
    expect(sanitizedStr).not.toContain("confidential\\key.pem");
  });

  it("anonymizes branch name when anonymizeBranch option is enabled", async () => {
    const receipt = await generateReceipt({
      repoPath: tempRepoDir,
      anonymizeBranch: true
    });

    expect(receipt.repository.branch).toBe("anonymized-branch");
    expect(receipt.privacy.anonymizeBranch).toBe(true);
  });

  it("produces irreversible HMAC-SHA256 repository hashes", () => {
    const url = "https://github.com/internal-corp/very-private-project.git";
    const salt = "qodewk-audit-salt";
    const hash = computeSaltedHash(url, salt);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("internal-corp");
    expect(hash).not.toContain("very-private-project");
  });

  it("ensures public receipt payload remains far below the 50 KB ceiling", async () => {
    const receipt = await generateReceipt({
      repoPath: tempRepoDir
    });
    const sanitized = sanitizeReceiptForShare(receipt);
    const byteSize = Buffer.byteLength(JSON.stringify(sanitized), "utf-8");

    // Standard receipt payload should be compact (typically 1–3 KB, strictly < 50 KB)
    expect(byteSize).toBeLessThan(50_000);
    expect(byteSize).toBeLessThan(10_000); // Strict safety check
  });
});
