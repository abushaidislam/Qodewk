import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { getRateCard, computeCost } from "@qodewk/pricing";
import { AgentFootprint } from "./types.js";
import { normalizeFilePath } from "./scoring.js";

export interface ClineHarvestOptions {
  storageDirs?: string[];
}

/**
 * Returns potential Cline / Roo Code task storage root directories across platforms.
 */
function resolveClineStorageDirs(customDir?: string): string[] {
  const dirs: string[] = [];

  if (customDir && fs.existsSync(customDir)) {
    dirs.push(customDir);
  }

  if (process.env.CLINE_STORAGE_DIR && fs.existsSync(process.env.CLINE_STORAGE_DIR)) {
    dirs.push(process.env.CLINE_STORAGE_DIR);
  }

  if (process.env.ROO_STORAGE_DIR && fs.existsSync(process.env.ROO_STORAGE_DIR)) {
    dirs.push(process.env.ROO_STORAGE_DIR);
  }

  const homedir = os.homedir();

  if (process.platform === "win32") {
    const appData = process.env.APPDATA || path.join(homedir, "AppData", "Roaming");
    const ideRoots = ["Code", "Code - Insiders", "Cursor", "Windsurf"];
    const extensionIds = [
      "saoudrizwan.claude-dev",
      "rooveterinaryinc.roo-cline"
    ];

    for (const ide of ideRoots) {
      for (const ext of extensionIds) {
        const candidate = path.join(appData, ide, "User", "globalStorage", ext, "tasks");
        if (fs.existsSync(candidate)) dirs.push(candidate);
      }
    }
  } else if (process.platform === "darwin") {
    const appSupport = path.join(homedir, "Library", "Application Support");
    const ideRoots = ["Code", "Code - Insiders", "Cursor", "Windsurf"];
    const extensionIds = [
      "saoudrizwan.claude-dev",
      "rooveterinaryinc.roo-cline"
    ];

    for (const ide of ideRoots) {
      for (const ext of extensionIds) {
        const candidate = path.join(appSupport, ide, "User", "globalStorage", ext, "tasks");
        if (fs.existsSync(candidate)) dirs.push(candidate);
      }
    }
  } else {
    // Linux / POSIX
    const configRoot = process.env.XDG_CONFIG_HOME || path.join(homedir, ".config");
    const ideRoots = ["Code", "Code - Insiders", "Cursor", "Windsurf"];
    const extensionIds = [
      "saoudrizwan.claude-dev",
      "rooveterinaryinc.roo-cline"
    ];

    for (const ide of ideRoots) {
      for (const ext of extensionIds) {
        const candidate = path.join(configRoot, ide, "User", "globalStorage", ext, "tasks");
        if (fs.existsSync(candidate)) dirs.push(candidate);
      }
    }
  }

  return Array.from(new Set(dirs));
}

/**
 * Harvests agent footprints from Cline & Roo Code VS Code extensions.
 * Reads task JSON logs, parses token usage, costs, models, and edited files.
 */
export function harvestClineFootprints(
  repoPath: string,
  sinceDate?: Date,
  options?: ClineHarvestOptions
): AgentFootprint[] {
  const footprints: AgentFootprint[] = [];
  const normRepo = repoPath.toLowerCase().replace(/\\/g, "/").replace(/\/$/, "");
  const repoBasename = path.basename(repoPath).toLowerCase();

  // Also check repo-local .cline/tasks or .roo/tasks directories
  const localDirs = [
    path.join(repoPath, ".cline", "tasks"),
    path.join(repoPath, ".roo", "tasks")
  ].filter((d) => fs.existsSync(d));

  const storageDirs = [
    ...localDirs,
    ...resolveClineStorageDirs(options?.storageDirs?.[0])
  ];

  if (storageDirs.length === 0) {
    return footprints;
  }

  for (const storageDir of storageDirs) {
    try {
      const taskEntries = fs.readdirSync(storageDir);

      for (const entry of taskEntries) {
        const taskDir = path.join(storageDir, entry);
        let stat: fs.Stats;
        try {
          stat = fs.statSync(taskDir);
        } catch {
          continue;
        }

        if (!stat.isDirectory()) continue;
        if (sinceDate && stat.mtime < sinceDate) continue;

        // Try reading ui_messages.json or api_conversation_history.json
        const uiMessagesPath = path.join(taskDir, "ui_messages.json");
        const apiHistoryPath = path.join(taskDir, "api_conversation_history.json");

        if (!fs.existsSync(uiMessagesPath) && !fs.existsSync(apiHistoryPath)) {
          continue;
        }

        let taskTitle = "";
        let model = "claude-3-7-sonnet";
        let stepCount = 0;
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let totalCachedTokens = 0;
        let reportedCost = 0;
        let isTaskRelevant = false;
        let timestamp = stat.mtime.toISOString();
        const filesEditedSet = new Set<string>();

        // 1. Inspect ui_messages.json
        if (fs.existsSync(uiMessagesPath)) {
          try {
            const rawUi = fs.readFileSync(uiMessagesPath, "utf-8");
            const messages = JSON.parse(rawUi);

            if (Array.isArray(messages)) {
              for (const msg of messages) {
                if (!msg || typeof msg !== "object") continue;

                if (msg.ts && typeof msg.ts === "number") {
                  const msgDate = new Date(msg.ts);
                  if (!isNaN(msgDate.getTime())) {
                    timestamp = msgDate.toISOString();
                  }
                }

                // Extract task description
                if (!taskTitle && msg.type === "say" && (msg.say === "task" || msg.say === "user_feedback")) {
                  if (typeof msg.text === "string" && msg.text.trim()) {
                    taskTitle = msg.text.trim().replace(/\r?\n.*/s, "").slice(0, 60);
                  }
                }

                // Tool calls / edited files
                if (msg.type === "say" && (msg.say === "tool" || msg.say === "command")) {
                  stepCount++;
                  if (typeof msg.text === "string") {
                    try {
                      const toolData = JSON.parse(msg.text);
                      const targetPath = toolData.path || toolData.filePath || toolData.target;
                      if (typeof targetPath === "string" && targetPath.trim()) {
                        const normPath = normalizeFilePath(targetPath, repoPath);
                        filesEditedSet.add(normPath);
                        // Check if file is related to current repo
                        const lowerTarget = targetPath.toLowerCase().replace(/\\/g, "/");
                        if (
                          lowerTarget.includes(normRepo) ||
                          lowerTarget.includes(repoBasename) ||
                          !path.isAbsolute(targetPath)
                        ) {
                          isTaskRelevant = true;
                        }
                      }
                    } catch {
                      // plain text tool message
                      const pathMatch = msg.text.match(/(?:write_to_file|replace_in_file|edit_file|new_file)[^\n]*?(?:path|file)["':\s]+([^\s"']+)/i);
                      if (pathMatch && pathMatch[1]) {
                        filesEditedSet.add(normalizeFilePath(pathMatch[1], repoPath));
                      }
                    }
                  }
                }

                // API token & cost telemetry
                if (msg.say === "api_req_started" || msg.say === "api_req_finished") {
                  if (typeof msg.text === "string") {
                    try {
                      const apiData = JSON.parse(msg.text);
                      if (typeof apiData.tokensIn === "number") totalInputTokens += apiData.tokensIn;
                      if (typeof apiData.tokensOut === "number") totalOutputTokens += apiData.tokensOut;
                      if (typeof apiData.cacheReads === "number") totalCachedTokens += apiData.cacheReads;
                      if (typeof apiData.totalCost === "number") reportedCost = Math.max(reportedCost, apiData.totalCost);
                      if (typeof apiData.cost === "number") reportedCost += apiData.cost;
                      if (typeof apiData.model === "string" && apiData.model) model = apiData.model;
                    } catch {}
                  }
                }
              }
            }
          } catch {
            // malformed ui_messages.json
          }
        }

        // 2. Inspect api_conversation_history.json for models / tool calls if needed
        if (fs.existsSync(apiHistoryPath) && (!isTaskRelevant || totalInputTokens === 0)) {
          try {
            const rawApi = fs.readFileSync(apiHistoryPath, "utf-8");
            const history = JSON.parse(rawApi);

            if (Array.isArray(history)) {
              for (const item of history) {
                if (item.model && typeof item.model === "string") {
                  model = item.model;
                }
                if (item.content && Array.isArray(item.content)) {
                  for (const block of item.content) {
                    if (block.type === "tool_use" && block.input) {
                      stepCount++;
                      const p = block.input.path || block.input.filePath;
                      if (typeof p === "string") {
                        filesEditedSet.add(normalizeFilePath(p, repoPath));
                        const lowerP = p.toLowerCase().replace(/\\/g, "/");
                        if (lowerP.includes(normRepo) || lowerP.includes(repoBasename) || !path.isAbsolute(p)) {
                          isTaskRelevant = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch {}
        }

        // Check if any edited file exists in repo or matches repoPath
        if (!isTaskRelevant && filesEditedSet.size > 0) {
          for (const f of filesEditedSet) {
            const full = path.resolve(repoPath, f);
            if (fs.existsSync(full)) {
              isTaskRelevant = true;
              break;
            }
          }
        }

        // If local storage dir (.cline/tasks or .roo/tasks), it is guaranteed relevant
        if (taskDir.toLowerCase().startsWith(normRepo)) {
          isTaskRelevant = true;
        }

        if (!isTaskRelevant) continue;

        const rateCard = getRateCard(model);
        const estInput = totalInputTokens > 0 ? totalInputTokens : Math.max(stepCount * 2500, 3000);
        const estCached = totalCachedTokens > 0 ? totalCachedTokens : Math.round(estInput * 0.5);
        const estOutput = totalOutputTokens > 0 ? totalOutputTokens : Math.max(stepCount * 400, 500);
        const cost = reportedCost > 0 ? Number(reportedCost.toFixed(4)) : computeCost(estInput, estOutput, estCached, rateCard);
        const isVerified = totalInputTokens > 0;

        footprints.push({
          id: `cline_${entry.slice(0, 16)}_${timestamp.slice(0, 10)}`,
          platform: "cline",
          sessionId: entry,
          repoPath,
          taskTitle: taskTitle || "Cline Autonomous Task",
          model,
          stepsCount: Math.max(stepCount, 1),
          filesEdited: Array.from(filesEditedSet),
          timestamp,
          tokens: {
            input: estInput,
            output: estOutput,
            cached: estCached
          },
          cost,
          mode: isVerified ? "verified" : "imported",
          confidence: isVerified ? 0.90 : 0.80,
          rawTranscriptPath: uiMessagesPath
        });
      }
    } catch {
      // Graceful directory traversal fallback
    }
  }

  return footprints;
}
