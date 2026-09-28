import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { createRequire } from "node:module";
import { getRateCard, computeCost } from "@qodewk/pricing";
import { AgentFootprint } from "./types.js";

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

export function harvestCursorFootprints(repoPath: string, sinceDate?: Date): AgentFootprint[] {
  const footprints: AgentFootprint[] = [];
  const DatabaseSync = getSqliteDatabase();
  if (!DatabaseSync) return footprints;

  let storageDir = "";
  if (process.platform === "win32") {
    storageDir = path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "Cursor", "User", "workspaceStorage");
  } else if (process.platform === "darwin") {
    storageDir = path.join(os.homedir(), "Library", "Application Support", "Cursor", "User", "workspaceStorage");
  } else {
    storageDir = path.join(os.homedir(), ".config", "Cursor", "User", "workspaceStorage");
  }

  if (!fs.existsSync(storageDir)) return footprints;

  try {
    const normTarget = repoPath.toLowerCase().replace(/\\/g, "/");
    const wsDirs = fs.readdirSync(storageDir);

    for (const ws of wsDirs) {
      const wsPath = path.join(storageDir, ws);
      const wsJsonPath = path.join(wsPath, "workspace.json");
      if (!fs.existsSync(wsJsonPath)) continue;

      try {
        const wsJson = JSON.parse(fs.readFileSync(wsJsonPath, "utf-8"));
        const folder = (wsJson.folder || wsJson.workspace || "").toLowerCase().replace(/\\/g, "/");
        if (!folder.includes(normTarget) && !normTarget.includes(folder)) continue;

        const dbFile = path.join(wsPath, "state.vscdb");
        if (!fs.existsSync(dbFile)) continue;

        const dbStat = fs.statSync(dbFile);
        if (sinceDate && dbStat.mtime < sinceDate) continue;

        const db = new DatabaseSync(dbFile, { readOnly: true });
        const row = db.prepare("SELECT value FROM ItemTable WHERE key = 'workbench.panel.aichat.chatdata' OR key = 'aiService.generations' LIMIT 1").get() as { value: string } | undefined;

        if (row && row.value) {
          const parsed = JSON.parse(row.value);
          const tabs = parsed.tabs || (Array.isArray(parsed) ? parsed : []);
          let stepCount = 0;
          let taskTitle = "";
          let model = "claude-3-5-sonnet";

          for (const tab of tabs) {
            const bubbles = tab.bubbles || [];
            stepCount += bubbles.length;
            if (!taskTitle && tab.chatTitle) taskTitle = tab.chatTitle;
            for (const b of bubbles) {
              if (b.modelType) model = b.modelType;
            }
          }

          if (stepCount > 0) {
            const rateCard = getRateCard(model);
            const estInput = stepCount * 2500;
            const estCached = Math.round(estInput * 0.6);
            const estOutput = stepCount * 250;
            const cost = computeCost(estInput, estOutput, estCached, rateCard);

            footprints.push({
              id: `cursor_${ws}`,
              platform: "cursor",
              sessionId: ws,
              repoPath,
              taskTitle: taskTitle || "Cursor AI Session",
              model,
              stepsCount: stepCount,
              filesEdited: [],
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
        }
      } catch {}
    }
  } catch {}

  return footprints;
}
