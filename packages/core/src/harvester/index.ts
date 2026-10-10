import { harvestAntigravityFootprints } from "./antigravity.js";
import { harvestClaudeFootprints } from "./claude.js";
import { harvestCursorFootprints } from "./cursor.js";
import { harvestAiderFootprints } from "./aider.js";
import { harvestWindsurfFootprints } from "./windsurf.js";
import { harvestClineFootprints } from "./cline.js";
import { harvestOpenCodeFootprints } from "./opencode.js";
import { selectPrimaryFootprint } from "./scoring.js";
import { AgentFootprint, HarvestOptions } from "./types.js";
import { harvestTrailerFootprints } from "../discovery.js";
import { LocalStateDB } from "../db.js";

export * from "./types.js";
export * from "./scoring.js";
export * from "./antigravity.js";
export * from "./claude.js";
export * from "./cursor.js";
export * from "./aider.js";
export * from "./windsurf.js";
export * from "./cline.js";
export * from "./opencode.js";

export function parseSinceOption(since?: string | Date): Date | undefined {
  if (!since) return undefined;
  if (since instanceof Date) return since;

  const s = since.trim().toLowerCase();
  const now = new Date();

  if (s === "today") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today;
  }

  if (s === "yesterday") {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return yesterday;
  }

  const hoursMatch = s.match(/^(\d+)\s*h(?:ours?)?$/);
  if (hoursMatch && hoursMatch[1]) {
    const hours = parseInt(hoursMatch[1], 10);
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  }

  const daysMatch = s.match(/^(\d+)\s*d(?:ays?)?$/);
  if (daysMatch && daysMatch[1]) {
    const days = parseInt(daysMatch[1], 10);
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  const parsed = new Date(since);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return undefined;
}

export interface UniversalHarvestResult {
  footprints: AgentFootprint[];
  primaryFootprint?: AgentFootprint;
  platforms: string[];
  models: string[];
  tasks: string[];
  filesEdited: string[];
  totalTokens: {
    input: number;
    output: number;
    cached: number;
  };
  totalCost: number;
  mode: "verified" | "imported" | "observed" | "estimated" | "unknown";
  confidence: number;
}

export function harvestRawPlatformFootprints(
  repoPath: string,
  alias: string,
  sinceDate?: Date,
  platform?: string
): AgentFootprint[] {
  const allFootprints: AgentFootprint[] = [];

  // 1. Harvest Google Antigravity
  if (!platform || platform === "all" || platform === "antigravity") {
    const agFootprints = harvestAntigravityFootprints(repoPath, sinceDate);
    allFootprints.push(...agFootprints);
  }

  // 2. Harvest Claude Code CLI
  if (!platform || platform === "all" || platform === "claude") {
    const claudeFootprints = harvestClaudeFootprints(repoPath, alias, sinceDate);
    allFootprints.push(...claudeFootprints);
  }

  // 3. Harvest Cursor IDE
  if (!platform || platform === "all" || platform === "cursor") {
    const cursorFootprints = harvestCursorFootprints(repoPath, sinceDate);
    allFootprints.push(...cursorFootprints);
  }

  // 4. Harvest Aider CLI
  if (!platform || platform === "all" || platform === "aider") {
    const aiderFootprints = harvestAiderFootprints(repoPath, sinceDate);
    allFootprints.push(...aiderFootprints);
  }

  // 5. Harvest Windsurf IDE
  if (!platform || platform === "all" || platform === "windsurf") {
    const windsurfFootprints = harvestWindsurfFootprints(repoPath, sinceDate);
    allFootprints.push(...windsurfFootprints);
  }

  // 6. Harvest Cline / Roo Code IDE extension
  if (!platform || platform === "all" || platform === "cline") {
    const clineFootprints = harvestClineFootprints(repoPath, sinceDate);
    allFootprints.push(...clineFootprints);
  }

  // 7. Harvest OpenCode CLI
  if (!platform || platform === "all" || platform === "opencode") {
    const opencodeFootprints = harvestOpenCodeFootprints(repoPath, sinceDate);
    allFootprints.push(...opencodeFootprints);
  }

  return allFootprints;
}

export interface ProjectChatsOptions {
  repoPath?: string;
  projectAlias?: string;
  since?: string | Date;
  platform?: string;
  all?: boolean;
}

export interface ProjectChatsReport {
  repoPath: string;
  projectAlias: string;
  windowDescription: string;
  totalCost: number;
  totalTokens: {
    input: number;
    output: number;
    cached: number;
  };
  totalSteps: number;
  sessionsCount: number;
  chats: AgentFootprint[];
}

export async function listProjectChats(
  options: ProjectChatsOptions = {}
): Promise<ProjectChatsReport> {
  const repoPath = options.repoPath || process.cwd();
  const alias = options.projectAlias || "";

  let sinceDate: Date | undefined;
  let windowDescription = "All-time";

  if (!options.all) {
    if (options.since) {
      sinceDate = parseSinceOption(options.since);
      windowDescription =
        typeof options.since === "string"
          ? `Since ${options.since}`
          : `Since ${options.since.toISOString().slice(0, 10)}`;
    } else {
      // Default to last 30 days
      sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      windowDescription = "Last 30 Days";
    }
  }

  const allFootprints = harvestRawPlatformFootprints(repoPath, alias, sinceDate, options.platform);

  // Sort newest first
  allFootprints.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  let totalInput = 0;
  let totalOutput = 0;
  let totalCached = 0;
  let totalCost = 0;
  let totalSteps = 0;

  for (const fp of allFootprints) {
    totalInput += fp.tokens.input;
    totalOutput += fp.tokens.output;
    totalCached += fp.tokens.cached;
    totalCost += fp.cost;
    totalSteps += fp.stepsCount || 0;
  }

  return {
    repoPath,
    projectAlias: alias,
    windowDescription,
    totalCost: Number(totalCost.toFixed(4)),
    totalTokens: {
      input: totalInput,
      output: totalOutput,
      cached: totalCached
    },
    totalSteps,
    sessionsCount: allFootprints.length,
    chats: allFootprints
  };
}

export async function harvestUniversalFootprints(
  options: HarvestOptions
): Promise<UniversalHarvestResult> {
  const parsedSince = parseSinceOption(options.since);
  // Pad the harvester horizon by 24 hours to ensure we don't miss sessions
  // that occurred just before the commit boundary (e.g. working late at night, committing next morning).
  const sinceDate = parsedSince ? new Date(parsedSince.getTime() - 24 * 60 * 60 * 1000) : undefined;
  const alias = options.projectAlias || "";
  let allFootprints: AgentFootprint[] = harvestRawPlatformFootprints(
    options.repoPath,
    alias,
    sinceDate,
    options.platform
  );

  // 8. Harvest Git Commit Trailers (Copilot, Claude, Cursor, Aider, Windsurf, Cline, OpenCode co-authors)
  if (options.gitContext?.commitMessage) {
    const trailerFps = harvestTrailerFootprints(
      options.repoPath,
      options.gitContext.commitMessage,
      options.gitContext.headSha,
      options.gitContext.commitDate
    );
    allFootprints.push(...trailerFps);
  }

  // Score, rank, and filter footprints using commit-bound attribution
  const { primary, rankedFootprints } = selectPrimaryFootprint(allFootprints, options.gitContext);
  
  // Filter out irrelevant/stale sessions that received penalties (score < 0.10)
  allFootprints = rankedFootprints.filter(fp => 
    fp.attributionScore === undefined || fp.attributionScore >= 0.10
  );

  // Save footprints to local state DB
  try {
    const db = new LocalStateDB();
    for (const fp of allFootprints) {
      db.saveFootprint(fp);
    }
    db.close();
  } catch {}

  const platforms = Array.from(new Set(allFootprints.map((f) => f.platform)));
  const models = Array.from(new Set(allFootprints.map((f) => f.model)));
  const tasks = Array.from(new Set(allFootprints.map((f) => f.taskTitle).filter(Boolean)));
  const filesSet = new Set<string>();
  for (const fp of allFootprints) {
    for (const f of fp.filesEdited) filesSet.add(f);
  }

  let totalInput = 0;
  let totalOutput = 0;
  let totalCached = 0;
  let totalCost = 0;

  for (const fp of allFootprints) {
    totalInput += fp.tokens.input;
    totalOutput += fp.tokens.output;
    totalCached += fp.tokens.cached;
    totalCost += fp.cost;
  }

  return {
    footprints: allFootprints,
    primaryFootprint: primary,
    platforms,
    models,
    tasks,
    filesEdited: Array.from(filesSet),
    totalTokens: {
      input: totalInput,
      output: totalOutput,
      cached: totalCached
    },
    totalCost: Number(totalCost.toFixed(4)),
    mode: primary ? primary.mode : "unknown",
    confidence: primary ? primary.confidence : 0.45
  };
}
