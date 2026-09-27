import * as crypto from "node:crypto";
import { ReceiptV1, ReceiptV1Schema } from "@qodewk/protocol";
import { extractGitMetrics, GitDiffMetrics } from "./git.js";
import { detectProviderFromCommit, discoverLocalClaudeSessions } from "./discovery.js";
import { estimateCost } from "./estimator.js";
import { LocalStateDB } from "./db.js";

export * from "./git.js";
export * from "./discovery.js";
export * from "./estimator.js";
export * from "./db.js";
export * from "./format.js";

export interface GenerateReceiptOptions {
  repoPath?: string;
  baseSha?: string;
  headSha?: string;
  provider?: string;
  model?: string;
  isPublic?: boolean;
  anonymizeBranch?: boolean;
}

export async function generateReceipt(options: GenerateReceiptOptions = {}): Promise<ReceiptV1> {
  const metrics: GitDiffMetrics = await extractGitMetrics({
    repoPath: options.repoPath || process.cwd(),
    baseSha: options.baseSha,
    headSha: options.headSha
  });

  // 1. Discover Provider / Sessions
  let detected = detectProviderFromCommit(metrics.commitMessage);
  let localSessions = discoverLocalClaudeSessions(metrics.projectAlias);

  const provider = options.provider || detected?.provider || (localSessions.length > 0 ? "anthropic" : "unknown");
  const model = options.model || detected?.model || (localSessions.length > 0 ? localSessions[0]?.model : undefined);

  // 2. Dual-Engine Cost Estimation
  const costResult = estimateCost({
    files: metrics.files,
    insertions: metrics.insertions,
    deletions: metrics.deletions,
    provider: provider !== "unknown" ? provider : undefined,
    model,
    sessions: localSessions.length > 0 ? localSessions : undefined,
    confidence: detected?.confidence
  });

  // 3. Assemble Canonical Payload
  const receiptId = `rec_${crypto.randomBytes(12).toString("hex")}`;
  const now = new Date().toISOString();

  // Temporary object for content hash
  const payloadToHash = {
    repoHash: metrics.repoHash,
    headSha: metrics.headSha,
    files: metrics.files,
    insertions: metrics.insertions,
    deletions: metrics.deletions,
    cost: costResult.cost,
    tokens: costResult.tokens
  };
  const contentHash = crypto.createHash("sha256").update(JSON.stringify(payloadToHash)).digest("hex");

  const receipt: ReceiptV1 = {
    version: "1.0",
    receipt: {
      id: receiptId,
      createdAt: now,
      contentHash
    },
    repository: {
      repoHash: metrics.repoHash,
      projectAlias: metrics.projectAlias,
      branch: options.anonymizeBranch ? "anonymized-branch" : metrics.branch,
      headSha: metrics.headSha,
      baseSha: metrics.baseSha,
      commitsCount: 1
    },
    mutation: {
      files: metrics.files,
      insertions: metrics.insertions,
      deletions: metrics.deletions,
      netLines: metrics.netLines,
      renames: metrics.renames,
      languages: metrics.languages
    },
    ai: {
      provider: costResult.provider,
      model: costResult.model,
      tokens: costResult.tokens,
      cost: costResult.cost,
      mode: costResult.mode,
      confidence: costResult.confidence,
      sessions: costResult.sessions
    },
    privacy: {
      sourceExcluded: true,
      isPublic: options.isPublic ?? true,
      anonymizeBranch: options.anonymizeBranch ?? false
    }
  };

  // Validate against Zod schema
  return ReceiptV1Schema.parse(receipt);
}
