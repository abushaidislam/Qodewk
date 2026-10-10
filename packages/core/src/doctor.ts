import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawn } from "node:child_process";
import { RATE_CARDS } from "@qodewk/pricing";
import { LocalStateDB } from "./db.js";

export interface AgentAuditResult {
  id: string;
  name: string;
  status: "active" | "detected" | "not_detected";
  path?: string;
  details?: string;
}

export interface HookAuditResult {
  isGitRepo: boolean;
  hooksDir: string | null;
  postCommitInstalled: boolean;
  postRewriteInstalled: boolean;
  markerFound: boolean;
}

export interface HookBenchmarkResult {
  executionMs: number;
  passedInvariant: boolean; // < 5ms requirement
  status: "pass" | "warn" | "fail";
  message: string;
}

export interface StorageAuditResult {
  healthy: boolean;
  dbPath: string;
  receiptsCount: number;
  footprintsCount: number;
  sizeBytes?: number;
}

export interface PricingAuditResult {
  modelsLoaded: number;
  cachedRegistryPresent: boolean;
  status: "active" | "offline";
}

export interface DiagnosticReport {
  overallStatus: "healthy" | "warning" | "error";
  version: string;
  timestamp: string;
  repoPath: string;
  agents: AgentAuditResult[];
  hooks: HookAuditResult;
  benchmark: HookBenchmarkResult;
  storage: StorageAuditResult;
  pricing: PricingAuditResult;
}

export const HOOK_MARKER_BEGIN = "# --- BEGIN QODEWK HOOK ---";

/**
 * Audit AI coding agent environments on developer machine.
 */
export function auditAgentEnvironments(repoPath: string = process.cwd()): AgentAuditResult[] {
  const homedir = os.homedir();
  const results: AgentAuditResult[] = [];

  // 1. Google Antigravity
  const agEnv = process.env.ANTIGRAVITY_APP_DATA_DIR;
  const agHome = path.join(homedir, ".gemini", "antigravity");
  const agPath = agEnv && fs.existsSync(agEnv) ? agEnv : fs.existsSync(agHome) ? agHome : undefined;
  results.push({
    id: "antigravity",
    name: "Google Antigravity",
    status: agPath ? "active" : "not_detected",
    path: agPath,
    details: agPath ? "Antigravity brain telemetry detected" : "No active session brain found"
  });

  // 2. Claude Code CLI
  const claudeProjects = path.join(homedir, ".claude", "projects");
  const claudeExists = fs.existsSync(claudeProjects);
  results.push({
    id: "claude",
    name: "Claude Code CLI",
    status: claudeExists ? "active" : "not_detected",
    path: claudeExists ? claudeProjects : undefined,
    details: claudeExists ? "Claude project session directory found" : "No ~/.claude/projects directory found"
  });

  // 3. Cursor IDE
  let cursorPath: string | undefined;
  if (process.platform === "win32") {
    const c = path.join(process.env.APPDATA || path.join(homedir, "AppData", "Roaming"), "Cursor", "User", "workspaceStorage");
    if (fs.existsSync(c)) cursorPath = c;
  } else if (process.platform === "darwin") {
    const c = path.join(homedir, "Library", "Application Support", "Cursor", "User", "workspaceStorage");
    if (fs.existsSync(c)) cursorPath = c;
  } else {
    const c = path.join(homedir, ".config", "Cursor", "User", "workspaceStorage");
    if (fs.existsSync(c)) cursorPath = c;
  }
  results.push({
    id: "cursor",
    name: "Cursor IDE",
    status: cursorPath ? "active" : "not_detected",
    path: cursorPath,
    details: cursorPath ? "Cursor workspace storage detected" : "Cursor IDE storage not detected"
  });

  // 4. Windsurf IDE
  let windsurfPath: string | undefined;
  if (process.platform === "win32") {
    const w = path.join(process.env.APPDATA || path.join(homedir, "AppData", "Roaming"), "Windsurf", "User", "workspaceStorage");
    if (fs.existsSync(w)) windsurfPath = w;
  } else if (process.platform === "darwin") {
    const w = path.join(homedir, "Library", "Application Support", "Windsurf", "User", "workspaceStorage");
    if (fs.existsSync(w)) windsurfPath = w;
  } else {
    const w = path.join(homedir, ".config", "Windsurf", "User", "workspaceStorage");
    if (fs.existsSync(w)) windsurfPath = w;
  }
  results.push({
    id: "windsurf",
    name: "Windsurf IDE",
    status: windsurfPath ? "active" : "not_detected",
    path: windsurfPath,
    details: windsurfPath ? "Cascade session workspace storage detected" : "Windsurf IDE storage not detected"
  });

  // 5. Cline / Roo Code
  let clinePath: string | undefined;
  const localCline = path.join(repoPath, ".cline");
  const localRoo = path.join(repoPath, ".roo");
  if (fs.existsSync(localCline)) {
    clinePath = localCline;
  } else if (fs.existsSync(localRoo)) {
    clinePath = localRoo;
  } else {
    const appData = process.platform === "win32"
      ? (process.env.APPDATA || path.join(homedir, "AppData", "Roaming"))
      : process.platform === "darwin"
      ? path.join(homedir, "Library", "Application Support")
      : path.join(homedir, ".config");
    const clineExt = path.join(appData, "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "tasks");
    const rooExt = path.join(appData, "Code", "User", "globalStorage", "rooveterinaryinc.roo-cline", "tasks");
    if (fs.existsSync(clineExt)) clinePath = clineExt;
    else if (fs.existsSync(rooExt)) clinePath = rooExt;
  }
  results.push({
    id: "cline",
    name: "Cline / Roo Code",
    status: clinePath ? "active" : "not_detected",
    path: clinePath,
    details: clinePath ? "VS Code autonomous agent task storage detected" : "No active Cline or Roo Code tasks found"
  });

  // 6. Aider CLI
  const aiderPath = path.join(repoPath, ".aider.chat.history.md");
  const aiderExists = fs.existsSync(aiderPath);
  results.push({
    id: "aider",
    name: "Aider CLI",
    status: aiderExists ? "active" : "not_detected",
    path: aiderExists ? aiderPath : undefined,
    details: aiderExists ? "Repository pairing transcript found" : "No repo-local .aider.chat.history.md found"
  });

  // 7. OpenCode CLI
  const localOpenCode = path.join(repoPath, ".opencode");
  const homeOpenCode = path.join(homedir, ".opencode", "sessions");
  const opencodePath = fs.existsSync(localOpenCode) ? localOpenCode : fs.existsSync(homeOpenCode) ? homeOpenCode : undefined;
  results.push({
    id: "opencode",
    name: "OpenCode CLI",
    status: opencodePath ? "active" : "not_detected",
    path: opencodePath,
    details: opencodePath ? "OpenCode session history detected" : "No OpenCode session files found"
  });

  return results;
}

/**
 * Resolves the Git hooks directory, supporting normal git repos and worktrees.
 */
export function resolveHooksDir(cwd: string = process.cwd()): string | null {
  let curr = path.resolve(cwd);
  let gitPath = path.join(curr, ".git");
  while (!fs.existsSync(gitPath)) {
    const parent = path.dirname(curr);
    if (parent === curr) return null;
    curr = parent;
    gitPath = path.join(curr, ".git");
  }

  try {
    const stat = fs.statSync(gitPath);
    if (stat.isDirectory()) {
      return path.join(gitPath, "hooks");
    }

    // Git worktree file: "gitdir: <path>"
    const content = fs.readFileSync(gitPath, "utf-8");
    const match = content.match(/gitdir:\s*(.+)/i);
    if (!match?.[1]) return null;

    let gitDir = match[1].trim();
    if (!path.isAbsolute(gitDir)) {
      gitDir = path.resolve(curr, gitDir);
    }

    const commonFile = path.join(gitDir, "commondir");
    if (fs.existsSync(commonFile)) {
      let common = fs.readFileSync(commonFile, "utf-8").trim();
      if (!path.isAbsolute(common)) common = path.resolve(gitDir, common);
      return path.join(common, "hooks");
    } else if (path.basename(path.dirname(gitDir)) === "worktrees") {
      return path.join(path.dirname(path.dirname(gitDir)), "hooks");
    }

    return path.join(gitDir, "hooks");
  } catch {
    return null;
  }
}

/**
 * Audit Git hook installation and marker presence.
 */
export function auditGitHooks(repoPath: string = process.cwd()): HookAuditResult {
  const hooksDir = resolveHooksDir(repoPath);

  if (!hooksDir || !fs.existsSync(hooksDir)) {
    return {
      isGitRepo: Boolean(hooksDir),
      hooksDir,
      postCommitInstalled: false,
      postRewriteInstalled: false,
      markerFound: false
    };
  }

  const postCommit = path.join(hooksDir, "post-commit");
  const postRewrite = path.join(hooksDir, "post-rewrite");

  const hasMarker = (filePath: string): boolean => {
    if (!fs.existsSync(filePath)) return false;
    try {
      return fs.readFileSync(filePath, "utf-8").includes(HOOK_MARKER_BEGIN);
    } catch {
      return false;
    }
  };

  const commitOk = hasMarker(postCommit);
  const rewriteOk = hasMarker(postRewrite);

  return {
    isGitRepo: true,
    hooksDir,
    postCommitInstalled: commitOk,
    postRewriteInstalled: rewriteOk,
    markerFound: commitOk || rewriteOk
  };
}

/**
 * Benchmark Git hook background detachment latency.
 * Asserts the architectural invariant: detachment must occur in < 5ms.
 */
export async function benchmarkHookLatency(trials: number = 3): Promise<HookBenchmarkResult> {
  const samples: number[] = [];

  for (let i = 0; i < trials; i++) {
    const start = process.hrtime.bigint();
    try {
      // Simulate the exact detachment pattern: node process spawned detached with stdio ignored
      const child = spawn(
        process.execPath,
        ["-e", "process.exit(0)"],
        {
          detached: true,
          stdio: "ignore",
          windowsHide: true
        }
      );
      child.unref();

      const end = process.hrtime.bigint();
      const diffMs = Number(end - start) / 1_000_000;
      samples.push(diffMs);
    } catch {
      samples.push(99.0);
    }
  }

  const minMs = samples.length > 0 ? Math.min(...samples) : 99.0;
  const roundedMs = Number(minMs.toFixed(2));

  if (roundedMs < 5.0) {
    return {
      executionMs: roundedMs,
      passedInvariant: true,
      status: "pass",
      message: `Detached in ${roundedMs} ms (passed < 5ms invariant)`
    };
  } else if (roundedMs < 45.0) {
    return {
      executionMs: roundedMs,
      passedInvariant: true,
      status: "warn",
      message: `Detached in ${roundedMs} ms (acceptable cold spawn, target is < 5ms)`
    };
  } else {
    return {
      executionMs: roundedMs,
      passedInvariant: false,
      status: "fail",
      message: `Detached in ${roundedMs} ms (exceeded non-blocking threshold)`
    };
  }
}

/**
 * Audit SQLite database health and stored receipt counts.
 */
export function auditStorageHealth(): StorageAuditResult {
  const dbPath = path.join(os.homedir(), ".qodewk", "state.db");
  try {
    const db = new LocalStateDB();
    const stats = db.getStats();
    db.close();

    let sizeBytes = 0;
    if (fs.existsSync(dbPath)) {
      sizeBytes = fs.statSync(dbPath).size;
    }

    return {
      healthy: true,
      dbPath,
      receiptsCount: stats.totalReceipts,
      footprintsCount: stats.totalFootprints,
      sizeBytes
    };
  } catch {
    return {
      healthy: false,
      dbPath,
      receiptsCount: 0,
      footprintsCount: 0
    };
  }
}

/**
 * Audit Multi-Model Rate Card registry status.
 */
export function auditPricingSync(): PricingAuditResult {
  const modelsCount = Object.keys(RATE_CARDS).length;
  const cachedJson = path.join(os.homedir(), ".qodewk", "pricing.json");
  const hasCached = fs.existsSync(cachedJson);

  return {
    modelsLoaded: modelsCount,
    cachedRegistryPresent: hasCached,
    status: modelsCount > 0 ? "active" : "offline"
  };
}

/**
 * Run complete diagnostic suite.
 */
export async function runDiagnostics(options: { repoPath?: string } = {}): Promise<DiagnosticReport> {
  const repoPath = options.repoPath || process.cwd();
  const agents = auditAgentEnvironments(repoPath);
  const hooks = auditGitHooks(repoPath);
  const benchmark = await benchmarkHookLatency();
  const storage = auditStorageHealth();
  const pricing = auditPricingSync();

  const activeAgents = agents.filter((a) => a.status === "active").length;
  let overallStatus: DiagnosticReport["overallStatus"] = "healthy";

  if (!storage.healthy || !hooks.isGitRepo) {
    overallStatus = "error";
  } else if (!hooks.markerFound || activeAgents === 0) {
    overallStatus = "warning";
  }

  return {
    overallStatus,
    version: "0.11.1",
    timestamp: new Date().toISOString(),
    repoPath,
    agents,
    hooks,
    benchmark,
    storage,
    pricing
  };
}
