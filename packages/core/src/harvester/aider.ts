import * as fs from "node:fs";
import * as path from "node:path";
import { getRateCard, computeCost } from "@qodewk/pricing";
import { AgentFootprint } from "./types.js";
import { normalizeFilePath } from "./scoring.js";

/**
 * Harvests agent footprints from Aider (CLI pairing assistant).
 * Reads repo-local `.aider.chat.history.md` and extracts sessions, models,
 * edited files, and auto-committed Git hashes.
 */
export function harvestAiderFootprints(repoPath: string, sinceDate?: Date): AgentFootprint[] {
  const footprints: AgentFootprint[] = [];
  const historyPath = path.join(repoPath, ".aider.chat.history.md");

  if (!fs.existsSync(historyPath)) {
    return footprints;
  }

  try {
    const stat = fs.statSync(historyPath);
    if (sinceDate && stat.mtime < sinceDate) {
      return footprints;
    }

    const content = fs.readFileSync(historyPath, "utf-8");
    // Split by session headers: "# aider chat started at YYYY-MM-DD HH:MM:SS"
    const sessionChunks = content.split(/^#\s+aider chat started at\s+/m);

    for (let i = 1; i < sessionChunks.length; i++) {
      const chunk = sessionChunks[i]!;
      const firstNewline = chunk.indexOf("\n");
      const dateStr = firstNewline !== -1 ? chunk.slice(0, firstNewline).trim() : chunk.slice(0, 30).trim();
      const sessionDate = new Date(dateStr);

      if (sinceDate && !isNaN(sessionDate.getTime()) && sessionDate < sinceDate) {
        continue;
      }

      const timestamp = !isNaN(sessionDate.getTime()) ? sessionDate.toISOString() : stat.mtime.toISOString();
      const lines = chunk.split("\n");

      let taskTitle = "";
      let model = "claude-3-5-sonnet";
      let boundCommitSha: string | undefined;
      const filesEdited = new Set<string>();
      let stepCount = 0;
      let reportedInputTokens = 0;
      let reportedOutputTokens = 0;
      let reportedCost = 0;

      for (const line of lines) {
        const trimmed = line.trim();

        // 1. Detect Model
        const modelMatch = trimmed.match(/^(?:Main\s+)?model:\s*([^\s,]+)/i);
        if (modelMatch && modelMatch[1]) {
          model = modelMatch[1].replace(/[`"']/g, "").trim();
        }

        // 2. Detect User Prompts / Task Title
        if (!taskTitle && trimmed.startsWith("#### ")) {
          const query = trimmed.replace(/^####\s+/, "").trim();
          if (query && !query.startsWith("/") && !query.startsWith("add ") && !query.startsWith("drop ")) {
            taskTitle = query.slice(0, 60);
          }
        }

        // 3. Count steps on user message / tool action
        if (trimmed.startsWith("#### ") || trimmed.startsWith("> Applied edit to") || trimmed.startsWith("> Commit ")) {
          stepCount++;
        }

        // 4. Detect Edited Files
        const editMatch = trimmed.match(/^>\s*(?:Applied edit to|Wrote|Updated)\s+([^\s]+)/i);
        if (editMatch && editMatch[1]) {
          filesEdited.add(normalizeFilePath(editMatch[1], repoPath));
        }

        // 5. Detect Bound Git Commit SHA
        const commitMatch = trimmed.match(/^>\s*Commit\s+([a-f0-9]{7,40})/i);
        if (commitMatch && commitMatch[1]) {
          boundCommitSha = commitMatch[1];
        }

        // 6. Detect Explicit Tokens / Cost
        // Example: "Tokens: 3.5k sent, 412 received. Cost: $0.02 message, $0.15 session."
        const tokenMatch = trimmed.match(/Tokens:\s*([0-9\.]+)k?\s*sent,\s*([0-9\.]+)k?\s*received/i);
        if (tokenMatch && tokenMatch[1] && tokenMatch[2]) {
          const sentMult = trimmed.includes(tokenMatch[1] + "k") ? 1000 : 1;
          const recvMult = trimmed.includes(tokenMatch[2] + "k") ? 1000 : 1;
          reportedInputTokens += Math.round(parseFloat(tokenMatch[1]) * sentMult);
          reportedOutputTokens += Math.round(parseFloat(tokenMatch[2]) * recvMult);
        }

        const costMatch = trimmed.match(/Cost:\s*\$([0-9\.]+)\s*(?:message|session)/i);
        if (costMatch && costMatch[1]) {
          reportedCost = Math.max(reportedCost, parseFloat(costMatch[1]));
        }
      }

      if (stepCount > 0 || filesEdited.size > 0) {
        const rateCard = getRateCard(model);
        const estInput = reportedInputTokens > 0 ? reportedInputTokens : Math.max(stepCount * 2500, 3000);
        const estCached = Math.round(estInput * 0.5);
        const estOutput = reportedOutputTokens > 0 ? reportedOutputTokens : Math.max(stepCount * 350, 400);
        const cost = reportedCost > 0 ? reportedCost : computeCost(estInput, estOutput, estCached, rateCard);

        footprints.push({
          id: `aider_${i}_${timestamp.slice(0, 10)}`,
          platform: "aider",
          sessionId: `aider_session_${i}`,
          repoPath,
          taskTitle: taskTitle || "Aider Pairing Session",
          model,
          stepsCount: Math.max(stepCount, 1),
          filesEdited: Array.from(filesEdited),
          timestamp,
          boundCommitSha,
          tokens: {
            input: estInput,
            output: estOutput,
            cached: estCached
          },
          cost,
          mode: reportedInputTokens > 0 ? "verified" : "imported",
          confidence: boundCommitSha ? 0.95 : 0.85,
          rawTranscriptPath: historyPath
        });
      }
    }
  } catch {
    // Fail-safe
  }

  return footprints;
}
