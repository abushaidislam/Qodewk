import pc from "picocolors";
import { DiagnosticReport, HookBenchmarkResult, HookAuditResult } from "@qodewk/core";
import { colors, bg } from "./theme.js";

export function formatDoctorReport(report: DiagnosticReport): string {
  const lines: string[] = [];
  const push = (l: string) => lines.push(l);

  push("");
  const badge = bg.teal(pc.bold(colors.ink(" qodewk doctor ")));
  push(`  ${colors.mutedSoft("┌")}  ${badge}  ${pc.dim(`v${report.version}`)}`);
  push(`  ${colors.mutedSoft("│")}`);

  // 1. AI Agents Subsystem
  push(`  ${colors.teal("◇")}  ${pc.bold(pc.white("AI Agent Environment"))}`);
  push(`  ${colors.mutedSoft("│")}`);
  for (const agent of report.agents) {
    const isAct = agent.status === "active";
    const icon = isAct ? colors.green("✓") : pc.dim("-");
    const namePad = agent.name.padEnd(20, ".");
    const statusText = isAct ? colors.green("Active") : pc.dim("Not detected");
    const detail = agent.path ? pc.dim(` (${agent.path})`) : "";
    push(`  ${colors.mutedSoft("│")}  ${icon} ${pc.white(namePad)} ${statusText}${detail}`);
  }
  push(`  ${colors.mutedSoft("│")}`);

  // 2. Git Hook Subsystem
  push(`  ${colors.teal("◇")}  ${pc.bold(pc.white("Git Hook Telemetry"))}`);
  push(`  ${colors.mutedSoft("│")}`);
  const hookDirText = report.hooks.hooksDir ? pc.dim(` (${report.hooks.hooksDir})`) : "";
  const pcIcon = report.hooks.postCommitInstalled ? colors.green("✓") : colors.red("×");
  const pcStatus = report.hooks.postCommitInstalled ? colors.green("Installed") : colors.red("Missing");
  push(`  ${colors.mutedSoft("│")}  ${pcIcon} ${pc.white("post-commit hook ...")} ${pcStatus}${hookDirText}`);

  const prIcon = report.hooks.postRewriteInstalled ? colors.green("✓") : colors.red("×");
  const prStatus = report.hooks.postRewriteInstalled ? colors.green("Installed") : colors.red("Missing");
  push(`  ${colors.mutedSoft("│")}  ${prIcon} ${pc.white("post-rewrite hook ..")} ${prStatus}`);

  const bench = report.benchmark;
  const benchIcon = bench.status === "pass" ? colors.green("✓") : bench.status === "warn" ? colors.amber("!") : colors.red("×");
  const benchColor = bench.status === "pass" ? colors.green : bench.status === "warn" ? colors.amber : colors.red;
  push(`  ${colors.mutedSoft("│")}  ${benchIcon} ${pc.white("Hook spawn latency .")} ${benchColor(`${bench.executionMs} ms`)} ${pc.dim(`(${bench.message})`)}`);
  push(`  ${colors.mutedSoft("│")}`);

  // 3. Storage & Pricing Subsystem
  push(`  ${colors.teal("◇")}  ${pc.bold(pc.white("Local Storage & Pricing"))}`);
  push(`  ${colors.mutedSoft("│")}`);
  const dbIcon = report.storage.healthy ? colors.green("✓") : colors.red("×");
  const dbStatus = report.storage.healthy ? colors.green("Healthy") : colors.red("Failed");
  const dbDetail = report.storage.healthy
    ? pc.dim(` (${report.storage.receiptsCount} receipts, ${report.storage.footprintsCount} footprints)`)
    : "";
  push(`  ${colors.mutedSoft("│")}  ${dbIcon} ${pc.white("SQLite Database ....")} ${dbStatus}${dbDetail}`);

  const prcIcon = report.pricing.status === "active" ? colors.green("✓") : colors.red("×");
  const prcStatus = report.pricing.status === "active" ? colors.green("Active") : colors.red("Offline");
  push(`  ${colors.mutedSoft("│")}  ${prcIcon} ${pc.white("Rate Card Registry .")} ${prcStatus} ${pc.dim(`(${report.pricing.modelsLoaded} model rate cards loaded)`)}`);
  push(`  ${colors.mutedSoft("│")}`);

  // 4. Overall Assessment Node
  if (report.overallStatus === "healthy") {
    push(`  ${colors.coral("◆")}  ${pc.bold(colors.green("All Systems Operational — Telemetry Ready"))}`);
  } else if (report.overallStatus === "warning") {
    push(`  ${colors.amber("◆")}  ${pc.bold(colors.amber("Operational with Warnings — Run `qodewk hook install` to enable automatic recording"))}`);
  } else {
    push(`  ${colors.red("◆")}  ${pc.bold(colors.red("Diagnostic Issues Detected — Check Git repository or database status"))}`);
  }
  push(`  ${colors.mutedSoft("└")}`);
  push("");

  return lines.join("\n");
}

export function formatHookTestReport(hooks: HookAuditResult, benchmark: HookBenchmarkResult): string {
  const lines: string[] = [];
  const push = (l: string) => lines.push(l);

  push("");
  const badge = bg.teal(pc.bold(colors.ink(" qodewk hook test ")));
  push(`  ${colors.mutedSoft("┌")}  ${badge}`);
  push(`  ${colors.mutedSoft("│")}`);

  const pcIcon = hooks.postCommitInstalled ? colors.green("✓") : colors.red("×");
  const pcStatus = hooks.postCommitInstalled ? colors.green("Installed") : colors.red("Missing");
  push(`  ${colors.mutedSoft("│")}  ${pcIcon} post-commit hook: ${pcStatus}`);

  const prIcon = hooks.postRewriteInstalled ? colors.green("✓") : colors.red("×");
  const prStatus = hooks.postRewriteInstalled ? colors.green("Installed") : colors.red("Missing");
  push(`  ${colors.mutedSoft("│")}  ${prIcon} post-rewrite hook: ${prStatus}`);

  const benchIcon = benchmark.status === "pass" ? colors.green("✓") : benchmark.status === "warn" ? colors.amber("!") : colors.red("×");
  const benchColor = benchmark.status === "pass" ? colors.green : benchmark.status === "warn" ? colors.amber : colors.red;
  push(`  ${colors.mutedSoft("│")}  ${benchIcon} Detachment Latency: ${benchColor(`${benchmark.executionMs} ms`)}`);
  push(`  ${colors.mutedSoft("│")}    ${pc.dim(benchmark.message)}`);
  push(`  ${colors.mutedSoft("│")}`);

  if (benchmark.passedInvariant && hooks.markerFound) {
    push(`  ${colors.coral("◆")}  ${pc.bold(colors.green("Non-blocking Hook Verified (< 5ms Invariant Passed)"))}`);
  } else if (!hooks.markerFound) {
    push(`  ${colors.amber("◆")}  ${pc.bold(colors.amber("Hooks Not Installed — Run `qodewk hook install`"))}`);
  } else {
    push(`  ${colors.red("◆")}  ${pc.bold(colors.red("Latency Threshold Exceeded — Reinstall recommended"))}`);
  }
  push(`  ${colors.mutedSoft("└")}`);
  push("");

  return lines.join("\n");
}
