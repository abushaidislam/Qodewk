import { AttributionMode } from "@qodewk/protocol";

export interface AgentFootprint {
  id: string;
  platform: "antigravity" | "claude" | "cursor" | "aider" | "copilot";
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
}

export interface HarvestOptions {
  repoPath: string;
  since?: string | Date;
  platform?: string;
}
