import * as crypto from "node:crypto";
import { ReceiptV1, ReceiptV1Schema, ProviderSession } from "@qodewk/protocol";
import { extractGitMetrics, GitDiffMetrics } from "./git.js";
import {
  detectProviderFromCommit,
  discoverLocalClaudeSessions,
  discoverAntigravityEnvironment
} from "./discovery.js";
import { harvestUniversalFootprints } from "./harvester/index.js";
import { estimateCost } from "./estimator.js";
import { LocalStateDB } from "./db.js";

export * from "./git.js";
export * from "./discovery.js";
export * from "./harvester/index.js";
export * from "./estimator.js";
export * from "./db.js";
export * from "./format.js";

export interface GenerateReceiptOptions {
  repoPath?: string;
  baseSha?: string;
  headSha?: string;
  provider?: string;
  model?: string;
  task?: string;
  since?: string | Date;
  platform?: string;
  isPublic?: boolean;
  anonymizeBranch?: boolean;
}

export async function generateReceipt(options: GenerateReceiptOptions = {}): Promise<ReceiptV1> {
  const metrics: GitDiffMetrics = await extractGitMetrics({
    repoPath: options.repoPath || process.cwd(),
    baseSha: options.baseSha,
    headSha: options.headSha
  });

  // 1. Universal Multi-Platform Footprint Harvesting (Antigravity, Claude, Cursor, etc.)
  const repoPath = options.repoPath || process.cwd();
  const harvestResult = await harvestUniversalFootprints({
    repoPath,
    projectAlias: metrics.projectAlias,
    since: options.since,
    platform: options.platform
  });

  const primaryFp = harvestResult.primaryFootprint;
  let detected = detectProviderFromCommit(metrics.commitMessage);

  const provider = options.provider || primaryFp?.platform || detected?.provider || "unknown";
  const model = options.model || primaryFp?.model || detected?.model;
  const task = options.task || primaryFp?.taskTitle || (harvestResult.tasks.length > 0 ? harvestResult.tasks[0] : undefined);

  // Convert footprints to ProviderSession[]
  const sessions: ProviderSession[] = harvestResult.footprints.map(fp => ({
    provider: fp.platform,
    model: fp.model,
    task: fp.taskTitle,
    filesTouched: fp.filesEdited,
    tokens: fp.tokens,
    cost: fp.cost,
    confidence: fp.confidence,
    mode: fp.mode
  }));

  let aiWrittenRatio: number | undefined = undefined;
  if (primaryFp) {
    aiWrittenRatio = 0.88;
  }

  // 2. Dual-Engine Cost Estimation
  const costResult = estimateCost({
    files: metrics.files,
    insertions: metrics.insertions,
    deletions: metrics.deletions,
    provider: provider !== "unknown" ? provider : undefined,
    model,
    sessions: sessions.length > 0 ? sessions : undefined,
    confidence: primaryFp?.confidence || detected?.confidence
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
      task,
      aiWrittenRatio,
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
