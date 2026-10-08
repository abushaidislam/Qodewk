import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import * as path from "node:path";
import { formatDoctorReport, formatHookTestReport } from "../src/doctor-view.js";
import { DiagnosticReport } from "@qodewk/core";

const binPath = path.resolve(__dirname, "../dist/index.cjs");

describe("Qodewk CLI Doctor & Hook Diagnostics (`doctor.test.ts`)", () => {
  describe("formatDoctorReport", () => {
    it("renders formatted Claude Warm Editorial diagnostic frame", () => {
      const mockReport: DiagnosticReport = {
        overallStatus: "healthy",
        version: "0.10.0",
        timestamp: new Date().toISOString(),
        repoPath: "/app",
        agents: [
          { id: "cursor", name: "Cursor IDE", status: "active", details: "Active" },
          { id: "claude", name: "Claude Code CLI", status: "not_detected", details: "None" }
        ],
        hooks: {
          isGitRepo: true,
          hooksDir: "/app/.git/hooks",
          postCommitInstalled: true,
          postRewriteInstalled: true,
          markerFound: true
        },
        benchmark: {
          executionMs: 1.84,
          passedInvariant: true,
          status: "pass",
          message: "Detached in 1.84 ms"
        },
        storage: {
          healthy: true,
          dbPath: "/home/.qodewk/state.db",
          receiptsCount: 12,
          footprintsCount: 4
        },
        pricing: {
          modelsLoaded: 18,
          cachedRegistryPresent: true,
          status: "active"
        }
      };

      const output = formatDoctorReport(mockReport);
      expect(output).toContain("qodewk doctor");
      expect(output).toContain("v0.10.0");
      expect(output).toContain("Cursor IDE");
      expect(output).toContain("post-commit hook");
      expect(output).toContain("1.84 ms");
      expect(output).toContain("All Systems Operational");
    });
  });

  describe("formatHookTestReport", () => {
    it("renders hook latency and marker benchmark frame", () => {
      const mockHooks = {
        isGitRepo: true,
        hooksDir: "/app/.git/hooks",
        postCommitInstalled: true,
        postRewriteInstalled: true,
        markerFound: true
      };
      const mockBench = {
        executionMs: 2.15,
        passedInvariant: true,
        status: "pass" as const,
        message: "Detached in 2.15 ms"
      };

      const output = formatHookTestReport(mockHooks, mockBench);
      expect(output).toContain("qodewk hook test");
      expect(output).toContain("2.15 ms");
      expect(output).toContain("Non-blocking Hook Verified");
    });
  });

  describe("CLI Command Integration", () => {
    it("exposes doctor command in --help", () => {
      const help = execSync(`node "${binPath}" --help`, { encoding: "utf-8" });
      expect(help).toContain("doctor");
      expect(help).toContain("diagnostic health check");
    });

    it("exposes test command under hook --help", () => {
      const help = execSync(`node "${binPath}" hook --help`, { encoding: "utf-8" });
      expect(help).toContain("test");
      expect(help).toMatch(/benchmark\s+latency/);
    });

    it("executes qodewk doctor --json returning valid diagnostic JSON", () => {
      const stdout = execSync(`node "${binPath}" doctor --json`, { encoding: "utf-8" });
      const parsed = JSON.parse(stdout);
      expect(parsed).toHaveProperty("overallStatus");
      expect(parsed).toHaveProperty("version", "0.10.0");
      expect(parsed).toHaveProperty("agents");
      expect(parsed).toHaveProperty("hooks");
      expect(parsed).toHaveProperty("benchmark");
      expect(parsed).toHaveProperty("storage");
      expect(parsed).toHaveProperty("pricing");
      expect(Array.isArray(parsed.agents)).toBe(true);
    });

    it("executes qodewk hook test --json returning valid benchmark JSON", () => {
      const stdout = execSync(`node "${binPath}" hook test --json`, { encoding: "utf-8" });
      const parsed = JSON.parse(stdout);
      expect(parsed).toHaveProperty("hooks");
      expect(parsed).toHaveProperty("benchmark");
      expect(parsed.benchmark).toHaveProperty("executionMs");
      expect(parsed.benchmark).toHaveProperty("passedInvariant");
    });
  });
});
