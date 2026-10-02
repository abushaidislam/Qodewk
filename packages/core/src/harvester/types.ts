import { AttributionMode } from "@qodewk/protocol";

export type AgentPlatform =
  | "antigravity"
  | "claude"
  | "cursor"
  | "aider"
  | "copilot"
  | "windsurf"
  | "opencode"
  | "cline"
  | "codex"
  | "kilo"
  | "generic";

export interface AgentFootprint {
  id: string;
  platform: AgentPlatform;
  sessionId: string;
  repoPath: string;
  taskTitle: string;
  model: string;
  stepsCount: number;
  filesEdited: string[];
  timestamp: string; // ISO string
  tokens: {
    input: number;
    output: number;
    cached: number;
  };
  cost: number;
  mode: AttributionMode;
  confidence: number;
  rawTranscriptPath?: string;
  /** Explicit Git commit SHA recorded by the agent (e.g. Cursor recentCommit). */
  boundCommitSha?: string;
  /** Scored confidence that this footprint produced the inspected Git mutation. */
  attributionScore?: number;
}

export interface GitAttributionContext {
  headSha?: string;
  commitDate?: string | Date;
  commitMessage?: string;
  changedFiles?: string[];
  branch?: string;
}

export interface HarvestOptions {
  repoPath: string;
  since?: string | Date;
  platform?: string;
  projectAlias?: string;
  gitContext?: GitAttributionContext;
}
