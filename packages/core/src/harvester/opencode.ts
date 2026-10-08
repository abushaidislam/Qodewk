import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { getRateCard, computeCost } from "@qodewk/pricing";
import { AgentFootprint } from "./types.js";
import { normalizeFilePath } from "./scoring.js";

export interface OpenCodeHarvestOptions {
  storageDir?: string;
}

/**
 * Harvests agent footprints from OpenCode CLI pairing sessions.
 * Inspects `.opencode/` within the repository and user-level `~/.opencode/sessions`.
 */
export function harvestOpenCodeFootprints(
  repoPath: string,
  sinceDate?: Date,
  options?: OpenCodeHarvestOptions
): AgentFootprint[] {
  const footprints: AgentFootprint[] = [];
  const normRepo = repoPath.toLowerCase().replace(/\\/g, "/").replace(/\/$/, "");

  const candidateDirs: string[] = [];

  // 1. Explicit or environment storage dir
  if (options?.storageDir && fs.existsSync(options.storageDir)) {
    candidateDirs.push(options.storageDir);
  }
  if (process.env.OPENCODE_STORAGE_DIR && fs.existsSync(process.env.OPENCODE_STORAGE_DIR)) {
    candidateDirs.push(process.env.OPENCODE_STORAGE_DIR);
  }

  // 2. Repo-local .opencode directories
  const localDirs = [
    path.join(repoPath, ".opencode", "sessions"),
    path.join(repoPath, ".opencode", "history"),
    path.join(repoPath, ".opencode")
  ];
  for (const d of localDirs) {
    if (fs.existsSync(d) && !candidateDirs.includes(d)) {
      candidateDirs.push(d);
    }
  }

  // 3. User home ~/.opencode/sessions
  const homeSessions = path.join(os.homedir(), ".opencode", "sessions");
  if (fs.existsSync(homeSessions) && !candidateDirs.includes(homeSessions)) {
    candidateDirs.push(homeSessions);
  }

  if (candidateDirs.length === 0) {
    return footprints;
  }

  for (const dir of candidateDirs) {
    try {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        if (!entry.endsWith(".json") && !entry.endsWith(".jsonl")) continue;
        const filePath = path.join(dir, entry);

        let stat: fs.Stats;
        try {
          stat = fs.statSync(filePath);
        } catch {
          continue;
        }

        if (sinceDate && stat.mtime < sinceDate) continue;

        try {
          const content = fs.readFileSync(filePath, "utf-8").trim();
          if (!content) continue;

          let sessionData: any = null;

          if (entry.endsWith(".json")) {
            sessionData = JSON.parse(content);
          } else if (entry.endsWith(".jsonl")) {
            // Take the last record or merge records
            const lines = content.split("\n").filter(Boolean);
            const records = lines.map((l) => {
              try {
                return JSON.parse(l);
              } catch {
                return null;
              }
            }).filter(Boolean);

            if (records.length > 0) {
              sessionData = records[records.length - 1];
            }
          }

          if (!sessionData || typeof sessionData !== "object") continue;

          // Check if session belongs to this repo if repo path is specified
          if (sessionData.repo || sessionData.project || sessionData.workingDirectory) {
            const sessRepo = String(sessionData.repo || sessionData.project || sessionData.workingDirectory)
              .toLowerCase()
              .replace(/\\/g, "/");
            if (!sessRepo.includes(normRepo) && !normRepo.includes(sessRepo)) {
              continue;
            }
          }

          const sessionId = sessionData.id || sessionData.sessionId || path.basename(entry, path.extname(entry));
          const taskTitle =
            sessionData.title ||
            sessionData.task ||
            sessionData.prompt ||
            (Array.isArray(sessionData.messages) && sessionData.messages[0]?.content
              ? String(sessionData.messages[0].content).slice(0, 60)
              : "OpenCode Pairing Session");

          const model = sessionData.model || "claude-3-5-sonnet";
          const timestamp = sessionData.created_at || sessionData.timestamp || stat.mtime.toISOString();

          // Files edited
          const filesSet = new Set<string>();
          if (Array.isArray(sessionData.files)) {
            for (const f of sessionData.files) {
              if (typeof f === "string") filesSet.add(normalizeFilePath(f, repoPath));
            }
          }
          if (Array.isArray(sessionData.changedFiles)) {
            for (const f of sessionData.changedFiles) {
              if (typeof f === "string") filesSet.add(normalizeFilePath(f, repoPath));
            }
          }

          let stepCount = sessionData.steps || sessionData.stepCount || 1;
          if (Array.isArray(sessionData.messages)) {
            stepCount = Math.max(stepCount, sessionData.messages.length);
          }

          // Tokens & cost
          let inputTokens = 0;
          let outputTokens = 0;
          let cachedTokens = 0;
          let cost = 0;

          if (sessionData.tokens && typeof sessionData.tokens === "object") {
            inputTokens = sessionData.tokens.input || sessionData.tokens.prompt || 0;
            outputTokens = sessionData.tokens.output || sessionData.tokens.completion || 0;
            cachedTokens = sessionData.tokens.cached || sessionData.tokens.cache_read || 0;
          } else if (typeof sessionData.input_tokens === "number") {
            inputTokens = sessionData.input_tokens;
            outputTokens = sessionData.output_tokens || 0;
            cachedTokens = sessionData.cached_tokens || 0;
          }

          const rateCard = getRateCard(model);
          const hasExactTokens = inputTokens > 0 || outputTokens > 0;

          if (!hasExactTokens) {
            inputTokens = Math.max(stepCount * 2500, 3000);
            outputTokens = Math.max(stepCount * 400, 500);
            cachedTokens = Math.round(inputTokens * 0.5);
          }

          if (typeof sessionData.cost === "number" && sessionData.cost > 0) {
            cost = Number(sessionData.cost.toFixed(4));
          } else {
            cost = computeCost(inputTokens, outputTokens, cachedTokens, rateCard);
          }

          const boundCommitSha = sessionData.commit || sessionData.commitSha || sessionData.gitCommit;

          footprints.push({
            id: `opencode_${sessionId}_${String(timestamp).slice(0, 10)}`,
            platform: "opencode",
            sessionId,
            repoPath,
            taskTitle: String(taskTitle).slice(0, 60),
            model,
            stepsCount: Math.max(stepCount, 1),
            filesEdited: Array.from(filesSet),
            timestamp: new Date(timestamp).toISOString(),
            boundCommitSha: typeof boundCommitSha === "string" ? boundCommitSha : undefined,
            tokens: {
              input: inputTokens,
              output: outputTokens,
              cached: cachedTokens
            },
            cost,
            mode: hasExactTokens ? "verified" : "imported",
            confidence: boundCommitSha ? 0.95 : hasExactTokens ? 0.90 : 0.80,
            rawTranscriptPath: filePath
          });
        } catch {
          // Skip corrupt session file
        }
      }
    } catch {
      // Directory read fail-safe
    }
  }

  return footprints;
}
