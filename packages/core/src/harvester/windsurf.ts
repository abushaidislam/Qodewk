import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { createRequire } from "node:module";
import { getRateCard, computeCost } from "@qodewk/pricing";
import { AgentFootprint } from "./types.js";
import { normalizeFilePath } from "./scoring.js";

function getSqliteDatabase(): any {
  try {
    const mod = "node:" + "sqlite";
    if (typeof require !== "undefined") {
      return require(mod).DatabaseSync;
    }
  } catch {}
  try {
    const mod = "node:" + "sqlite";
    const req = createRequire(import.meta.url);
    return req(mod).DatabaseSync;
  } catch {
    return null;
  }
}

/**
 * Harvests agent footprints from Windsurf IDE (Codeium Cascade).
 * Reads Windsurf workspaceStorage and extracts Cascade conversation steps,
 * models, and files edited.
 */
export function harvestWindsurfFootprints(repoPath: string, sinceDate?: Date): AgentFootprint[] {
  const footprints: AgentFootprint[] = [];
  const DatabaseSync = getSqliteDatabase();
  if (!DatabaseSync) return footprints;

  const normTarget = repoPath.toLowerCase().replace(/\\/g, "/").replace(/\/$/, "");
  const targetBasename = path.basename(repoPath).toLowerCase();

  let storageDir = "";
  if (process.platform === "win32") {
    storageDir = path.join(
      process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
      "Windsurf",
      "User",
      "workspaceStorage"
    );
  } else if (process.platform === "darwin") {
    storageDir = path.join(os.homedir(), "Library", "Application Support", "Windsurf", "User", "workspaceStorage");
  } else {
    storageDir = path.join(os.homedir(), ".config", "Windsurf", "User", "workspaceStorage");
  }

  if (!fs.existsSync(storageDir)) return footprints;

  try {
    const wsDirs = fs.readdirSync(storageDir);

    for (const ws of wsDirs) {
      const wsPath = path.join(storageDir, ws);
      const wsJsonPath = path.join(wsPath, "workspace.json");
      if (!fs.existsSync(wsJsonPath)) continue;

      try {
        const wsJson = JSON.parse(fs.readFileSync(wsJsonPath, "utf-8"));
        let folderUri = wsJson.folder || wsJson.workspace || "";

        try {
          folderUri = decodeURIComponent(folderUri.replace(/^file:\/\/\/?/, ""));
        } catch {}

        const folder = folderUri.toLowerCase().replace(/\\/g, "/");
        if (!folder.includes(normTarget) && !normTarget.includes(folder) && !folder.endsWith(targetBasename)) {
          continue;
        }

        const dbFile = path.join(wsPath, "state.vscdb");
        if (!fs.existsSync(dbFile)) continue;

        const dbStat = fs.statSync(dbFile);
        if (sinceDate && dbStat.mtime < sinceDate) continue;

        const db = new DatabaseSync(dbFile, { readOnly: true });

        // Query Cascade / Codeium tables or chat data
        const rows = db
          .prepare(
            "SELECT key, value FROM ItemTable WHERE key LIKE '%cascade%' OR key LIKE '%codeium%' LIMIT 5"
          )
          .all() as { key: string; value: string }[];

        if (rows && rows.length > 0) {
          let stepCount = 0;
          let taskTitle = "";
          let model = "claude-3-5-sonnet";
          const filesEditedSet = new Set<string>();

          for (const row of rows) {
            try {
              const parsed = JSON.parse(row.value);
              if (Array.isArray(parsed)) {
                stepCount += parsed.length;
              } else if (parsed && typeof parsed === "object") {
                if (parsed.steps || parsed.messages) {
                  stepCount += (parsed.steps || parsed.messages).length;
                }
                if (parsed.title) taskTitle = String(parsed.title);
                if (parsed.model) model = String(parsed.model);
              }
            } catch {}
          }

          const count = Math.max(stepCount, 1);
          const rateCard = getRateCard(model);
          const estInput = count * 2500;
          const estCached = Math.round(estInput * 0.6);
          const estOutput = count * 300;
          const cost = computeCost(estInput, estOutput, estCached, rateCard);

          footprints.push({
            id: `windsurf_${ws}`,
            platform: "windsurf",
            sessionId: ws,
            repoPath,
            taskTitle: taskTitle || "Windsurf Cascade Session",
            model,
            stepsCount: count,
            filesEdited: Array.from(filesEditedSet),
            timestamp: dbStat.mtime.toISOString(),
            tokens: {
              input: estInput,
              output: estOutput,
              cached: estCached
            },
            cost,
            mode: "imported",
            confidence: 0.85,
            rawTranscriptPath: dbFile
          });
        }
      } catch {}
    }
  } catch {}

  return footprints;
}
