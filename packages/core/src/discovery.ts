import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { ProviderSession } from "@qodewk/protocol";

export interface ProviderDiscoveryResult {
  provider: string;
  model?: string;
  sessions?: ProviderSession[];
  confidence: number;
  mode: "observed" | "estimated" | "imported" | "verified" | "unknown";
}

import { AgentFootprint } from "./harvester/types.js";
import { getRateCard, computeCost } from "@qodewk/pricing";

export interface GitTrailerInfo {
  token: string;
  value: string;
  provider: "copilot" | "claude" | "cursor" | "aider" | "windsurf" | "antigravity" | "generic";
  model: string;
}

export function parseGitTrailers(commitMessage?: string): GitTrailerInfo[] {
  if (!commitMessage) return [];

  const trailers: GitTrailerInfo[] = [];
  const lines = commitMessage.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    // Match trailers like "Co-authored-by: Name <email>" or "Generated-by: Copilot"
    const match = trimmed.match(/^([A-Za-z\-]+):\s*(.+)$/i);
    if (!match || !match[1] || !match[2]) continue;

    const token = match[1].toLowerCase();
    const value = match[2];
    const valLower = value.toLowerCase();

    if (token === "co-authored-by" || token === "generated-by" || token === "assisted-by" || token === "signed-off-by") {
      if (valLower.includes("copilot") || valLower.includes("github-actions")) {
        trailers.push({ token, value, provider: "copilot", model: "gpt-4o" });
      } else if (valLower.includes("claude") || valLower.includes("anthropic")) {
        trailers.push({ token, value, provider: "claude", model: "claude-3-7-sonnet" });
      } else if (valLower.includes("cursor") || valLower.includes("anysphere")) {
        trailers.push({ token, value, provider: "cursor", model: "claude-3-5-sonnet" });
      } else if (valLower.includes("aider")) {
        trailers.push({ token, value, provider: "aider", model: "claude-3-5-sonnet" });
      } else if (valLower.includes("windsurf") || valLower.includes("codeium")) {
        trailers.push({ token, value, provider: "windsurf", model: "claude-3-5-sonnet" });
      } else if (valLower.includes("antigravity") || valLower.includes("gemini")) {
        trailers.push({ token, value, provider: "antigravity", model: "claude-sonnet-4-6-thinking" });
      }
    }
  }

  return trailers;
}

export function detectProviderFromCommit(commitMessage?: string): Partial<ProviderDiscoveryResult> | null {
  if (!commitMessage) return null;

  // 1. Try structured Git trailers first (highest fidelity)
  const trailers = parseGitTrailers(commitMessage);
  if (trailers.length > 0) {
    const primary = trailers[0]!;
    return {
      provider: primary.provider === "claude" ? "anthropic" : primary.provider,
      model: primary.model,
      confidence: 0.90,
      mode: "observed"
    };
  }

  const msg = commitMessage.toLowerCase();

  // 2. Substring fallbacks
  if (msg.includes("claude") || msg.includes("anthropic")) {
    return {
      provider: "anthropic",
      model: "claude-3-7-sonnet",
      confidence: 0.80,
      mode: "observed"
    };
  }

  if (msg.includes("antigravity")) {
    return {
      provider: "antigravity",
      model: "claude-sonnet-4-6-thinking",
      confidence: 0.80,
      mode: "observed"
    };
  }

  if (msg.includes("gemini")) {
    return {
      provider: "google",
      model: "gemini-3-8-flash",
      confidence: 0.80,
      mode: "observed"
    };
  }

  if (msg.includes("cursor")) {
    return {
      provider: "cursor",
      model: "claude-3-5-sonnet",
      confidence: 0.80,
      mode: "observed"
    };
  }

  if (msg.includes("aider")) {
    return {
      provider: "aider",
      model: "claude-3-5-sonnet",
      confidence: 0.80,
      mode: "observed"
    };
  }

  if (msg.includes("windsurf")) {
    return {
      provider: "windsurf",
      model: "claude-3-5-sonnet",
      confidence: 0.80,
      mode: "observed"
    };
  }

  if (msg.includes("copilot") || msg.includes("github-actions")) {
    return {
      provider: "copilot",
      model: "gpt-4o",
      confidence: 0.80,
      mode: "observed"
    };
  }

  return null;
}

export function harvestTrailerFootprints(
  repoPath: string,
  commitMessage?: string,
  headSha?: string,
  commitDate?: string | Date
): AgentFootprint[] {
  if (!commitMessage) return [];

  const trailers = parseGitTrailers(commitMessage);
  const footprints: AgentFootprint[] = [];
  const dateIso = commitDate
    ? (commitDate instanceof Date ? commitDate.toISOString() : new Date(commitDate).toISOString())
    : new Date().toISOString();

  for (const t of trailers) {
    const rateCard = getRateCard(t.model);
    const estInput = 5000;
    const estCached = 2500;
    const estOutput = 600;
    const cost = computeCost(estInput, estOutput, estCached, rateCard);

    footprints.push({
      id: `trailer_${t.provider}_${(headSha || "head").slice(0, 8)}`,
      platform: t.provider,
      sessionId: `commit_trailer_${t.provider}`,
      repoPath,
      taskTitle: `Commit Trailer (${t.token}: ${t.value.slice(0, 30)})`,
      model: t.model,
      stepsCount: 1,
      filesEdited: [],
      timestamp: dateIso,
      boundCommitSha: headSha,
      tokens: {
        input: estInput,
        output: estOutput,
        cached: estCached
      },
      cost,
      mode: "observed",
      confidence: 0.90
    });
  }

  return footprints;
}

export function discoverAntigravityEnvironment(): Partial<ProviderDiscoveryResult> | null {
  const isAgent = process.env.ANTIGRAVITY_AGENT === "1" || Boolean(process.env.ANTIGRAVITY_CONVERSATION_ID);
  const homedir = os.homedir();
  const antigravityDir = process.env.ANTIGRAVITY_APP_DATA_DIR || path.join(homedir, ".gemini", "antigravity");

  if (isAgent) {
    return {
      provider: "antigravity",
      model: "claude-sonnet-4-6-thinking",
      confidence: 0.85,
      mode: "observed"
    };
  }

  if (fs.existsSync(antigravityDir)) {
    return {
      provider: "antigravity",
      model: "claude-sonnet-4-6-thinking",
      confidence: 0.65,
      mode: "estimated"
    };
  }

  return null;
}

export function discoverLocalClaudeSessions(projectAlias: string): ProviderSession[] {
  const sessions: ProviderSession[] = [];
  const homedir = os.homedir();
  const claudeProjectsDir = path.join(homedir, ".claude", "projects");

  if (!fs.existsSync(claudeProjectsDir)) {
    return sessions;
  }

  try {
    const projectDirs = fs.readdirSync(claudeProjectsDir);
    const matchedDir = projectDirs.find(d => d.toLowerCase().includes(projectAlias.toLowerCase()));
    
    if (matchedDir) {
      const sessionPath = path.join(claudeProjectsDir, matchedDir);
      const files = fs.readdirSync(sessionPath).filter(f => f.endsWith(".jsonl"));
      
      // Read latest session
      if (files.length > 0) {
        const latestFile = path.join(sessionPath, files[files.length - 1]!);
        const content = fs.readFileSync(latestFile, "utf-8");
        const lines = content.trim().split("\n");

        let inputTokens = 0;
        let outputTokens = 0;
        let cachedTokens = 0;

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.usage) {
              inputTokens += data.usage.input_tokens || 0;
              outputTokens += data.usage.output_tokens || 0;
              cachedTokens += data.usage.cache_read_input_tokens || 0;
            }
          } catch {
            // skip unparseable lines
          }
        }

        if (inputTokens > 0 || outputTokens > 0) {
          sessions.push({
            provider: "anthropic",
            model: "claude-3-7-sonnet",
            tokens: {
              input: inputTokens,
              output: outputTokens,
              cached: cachedTokens
            },
            cost: Number((((inputTokens - cachedTokens) * 3.0 + cachedTokens * 0.3 + outputTokens * 15.0) / 1_000_000).toFixed(4)),
            confidence: 0.95,
            mode: "verified"
          });
        }
      }
    }
  } catch {
    // Graceful fallback on permission or file system issues
  }

  return sessions;
}
