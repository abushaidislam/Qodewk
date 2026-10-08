import { describe, it, expect } from "vitest";
import {
  auditAgentEnvironments,
  auditGitHooks,
  benchmarkHookLatency,
  auditStorageHealth,
  auditPricingSync,
  runDiagnostics
} from "../src/index.js";

describe("Doctor Diagnostic Suite (`doctor.ts`)", () => {
  describe("auditAgentEnvironments", () => {
    it("evaluates all supported coding agents and returns structured audit items", () => {
      const agents = auditAgentEnvironments();
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThanOrEqual(7);

      const agentIds = agents.map((a) => a.id);
      expect(agentIds).toContain("antigravity");
      expect(agentIds).toContain("claude");
      expect(agentIds).toContain("cursor");
      expect(agentIds).toContain("windsurf");
      expect(agentIds).toContain("cline");
      expect(agentIds).toContain("aider");
      expect(agentIds).toContain("opencode");

      for (const a of agents) {
        expect(["active", "detected", "not_detected"]).toContain(a.status);
        expect(typeof a.name).toBe("string");
        expect(typeof a.details).toBe("string");
      }
    });
  });

  describe("auditGitHooks", () => {
    it("correctly identifies git repository and hooks directory", () => {
      const hooks = auditGitHooks();
      expect(hooks).toBeDefined();
      expect(hooks.isGitRepo).toBe(true);
      expect(hooks.hooksDir).not.toBeNull();
      expect(typeof hooks.postCommitInstalled).toBe("boolean");
      expect(typeof hooks.postRewriteInstalled).toBe("boolean");
      expect(typeof hooks.markerFound).toBe("boolean");
    });
  });

  describe("benchmarkHookLatency", () => {
    it("measures detachment latency in milliseconds using high-resolution hardware timers", async () => {
      const result = await benchmarkHookLatency();
      expect(result).toBeDefined();
      expect(typeof result.executionMs).toBe("number");
      expect(result.executionMs).toBeGreaterThan(0);
      expect(["pass", "warn", "fail"]).toContain(result.status);
      expect(typeof result.passedInvariant).toBe("boolean");
      expect(typeof result.message).toBe("string");
    });
  });

  describe("auditStorageHealth", () => {
    it("inspects SQLite state database and returns receipt/footprint counts", () => {
      const storage = auditStorageHealth();
      expect(storage).toBeDefined();
      expect(typeof storage.healthy).toBe("boolean");
      expect(typeof storage.dbPath).toBe("string");
      expect(typeof storage.receiptsCount).toBe("number");
      expect(typeof storage.footprintsCount).toBe("number");
    });
  });

  describe("auditPricingSync", () => {
    it("verifies multi-model rate cards are loaded from registry", () => {
      const pricing = auditPricingSync();
      expect(pricing).toBeDefined();
      expect(pricing.modelsLoaded).toBeGreaterThanOrEqual(15);
      expect(pricing.status).toBe("active");
    });
  });

  describe("runDiagnostics", () => {
    it("returns comprehensive aggregated DiagnosticReport", async () => {
      const report = await runDiagnostics();
      expect(report).toBeDefined();
      expect(["healthy", "warning", "error"]).toContain(report.overallStatus);
      expect(report.version).toBe("0.10.1");
      expect(report.timestamp).toBeDefined();
      expect(report.agents).toBeDefined();
      expect(report.hooks).toBeDefined();
      expect(report.benchmark).toBeDefined();
      expect(report.storage).toBeDefined();
      expect(report.pricing).toBeDefined();
    });
  });
});
