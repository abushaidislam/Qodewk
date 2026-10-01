#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { pickBarcodePayload, renderTerminalBarcode } from "./barcode.js";
import {
  generateReceipt,
  formatMarkdownReceipt,
  LocalStateDB,
  sanitizeReceiptForShare
} from "@qodewk/core";
import { ReceiptV1 } from "@qodewk/protocol";

const SHARE_PAYLOAD_MAX_BYTES = 50_000;

type OutputOptions = {
  json?: boolean;
  format?: string;
  out?: string;
  /** Kept for backward-compatible CLI flags; thermal 1D barcode is always used. */
  barcode?: boolean;
};

type HarvestCliOptions = {
  provider?: string;
  model?: string;
  since?: string;
  today?: boolean;
  platform?: string;
  anon?: boolean;
};

function resolveCliVersion(): string {
  try {
    const argv1 = process.argv[1] ? path.dirname(path.resolve(process.argv[1])) : process.cwd();
    const candidates = [
      path.join(argv1, "..", "package.json"),
      path.join(argv1, "package.json")
    ];
    for (const candidate of candidates) {
      if (!fs.existsSync(candidate)) continue;
      const pkg = JSON.parse(fs.readFileSync(candidate, "utf-8")) as {
        name?: string;
        version?: string;
      };
      if (pkg.name === "qodewk" && pkg.version) return pkg.version;
    }
  } catch {
    // fall through
  }
  return "0.2.1";
}

function resolveSince(options: HarvestCliOptions): string | undefined {
  return options.today ? "today" : options.since;
}

function persistReceipt(receipt: ReceiptV1, claimToken?: string): void {
  try {
    const db = new LocalStateDB();
    db.saveReceipt(receipt, claimToken);
    db.close();
  } catch {
    // CI / read-only / missing node:sqlite
  }
}

/**
 * Resolve the shared Git hooks directory, including worktrees where `.git` is a file.
 */
function resolveGitHooksDir(cwd: string = process.cwd()): string | null {
  const gitPath = path.join(cwd, ".git");
  if (!fs.existsSync(gitPath)) return null;

  let gitCommonDir: string;

  const stat = fs.statSync(gitPath);
  if (stat.isDirectory()) {
    gitCommonDir = gitPath;
  } else {
    const content = fs.readFileSync(gitPath, "utf-8");
    const match = content.match(/gitdir:\s*(.+)/i);
    if (!match?.[1]) return null;

    let gitDir = match[1].trim();
    if (!path.isAbsolute(gitDir)) {
      gitDir = path.resolve(cwd, gitDir);
    }

    const commonFile = path.join(gitDir, "commondir");
    if (fs.existsSync(commonFile)) {
      let common = fs.readFileSync(commonFile, "utf-8").trim();
      if (!path.isAbsolute(common)) {
        common = path.resolve(gitDir, common);
      }
      gitCommonDir = common;
    } else if (path.basename(path.dirname(gitDir)) === "worktrees") {
      gitCommonDir = path.dirname(path.dirname(gitDir));
    } else {
      gitCommonDir = gitDir;
    }
  }

  return path.join(gitCommonDir, "hooks");
}

const HOOK_MARKER_BEGIN = "# --- BEGIN QODEWK HOOK ---";
const HOOK_MARKER_END = "# --- END QODEWK HOOK ---";
const HOOK_SNIPPET = `
${HOOK_MARKER_BEGIN}
# Non-blocking Qodewk background recorder (< 5ms)
if command -v qodewk >/dev/null 2>&1 || command -v pnpm >/dev/null 2>&1 || [ -f "./node_modules/.bin/qodewk" ]; then
  ( ( qodewk record || pnpm qodewk record || npx qodewk record ) >/dev/null 2>&1 & )
fi
${HOOK_MARKER_END}
`;

function installHookFile(hookFile: string): "installed" | "exists" {
  let content = "";
  if (fs.existsSync(hookFile)) {
    content = fs.readFileSync(hookFile, "utf-8");
  } else {
    content = "#!/bin/sh\n";
  }

  if (content.includes(HOOK_MARKER_BEGIN)) {
    return "exists";
  }

  fs.writeFileSync(hookFile, content + HOOK_SNIPPET, { mode: 0o755 });
  return "installed";
}

function uninstallHookFile(hookFile: string): "removed" | "missing" | "absent" {
  if (!fs.existsSync(hookFile)) return "absent";

  const content = fs.readFileSync(hookFile, "utf-8");
  if (!content.includes(HOOK_MARKER_BEGIN)) return "missing";

  const regex = new RegExp(`\\n?${HOOK_MARKER_BEGIN}[\\s\\S]*?${HOOK_MARKER_END}\\n?`, "g");
  const updated = content.replace(regex, "");
  fs.writeFileSync(hookFile, updated, { mode: 0o755 });
  return "removed";
}

const program = new Command();

program
  .name("qodewk")
  .description("Universal telemetry and digital receipt generator for the AI coding agent era")
  .version(resolveCliVersion())
  .option("-j, --json", "Output receipt in machine-readable JSON format")
  .option("-f, --format <format>", "Output format (terminal, json, markdown)", "terminal")
  .option("-o, --out <path>", "Write receipt output to specified file path")
  .option("-p, --provider <provider>", "Specify AI provider (antigravity, claude, cursor, etc.)")
  .option("-m, --model <model>", "Specify AI model identifier")
  .option("-s, --since <duration>", "Harvest agent footprints since duration (e.g. today, 24h, 7d)")
  .option("--today", "Harvest agent footprints for today")
  .option("--platform <platform>", "Filter agent platform (antigravity, claude, cursor, all)")
  .option("--anon", "Anonymize branch name in output")
  .option("--local", "Force local-only mode (never open network sockets)")
  .option("--barcode", "Render classic 1D thermal barcode (always on; kept for compatibility)")
  .action(async (options) => {
    try {
      const receipt = await generateReceipt({
        provider: options.provider,
        model: options.model,
        since: resolveSince(options),
        platform: options.platform,
        anonymizeBranch: options.anon,
        isPublic: false
      });

      persistReceipt(receipt);
      await outputReceipt(receipt, options);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Error generating receipt: ${message}`));
      process.exit(1);
    }
  });

program
  .command("audit")
  .description("Audit PR or branch diff against a target base commit")
  .option("-b, --base <base>", "Base git ref or commit SHA (e.g. origin/main)")
  .option("-h, --head <head>", "Head git ref or commit SHA")
  .option("-f, --format <format>", "Output format (terminal, json, markdown)", "terminal")
  .option("-o, --out <path>", "Write receipt output to specified file path")
  .option("-p, --provider <provider>", "Specify AI provider")
  .option("-m, --model <model>", "Specify AI model")
  .option("-s, --since <duration>", "Harvest agent footprints since duration")
  .option("--today", "Harvest agent footprints for today")
  .option("--platform <platform>", "Filter agent platform")
  .option("--anon", "Anonymize branch name in output")
  .option("--barcode", "Render classic 1D thermal barcode (always on; kept for compatibility)")
  .action(async (options) => {
    try {
      const receipt = await generateReceipt({
        baseSha: options.base,
        headSha: options.head,
        provider: options.provider,
        model: options.model,
        since: resolveSince(options),
        platform: options.platform,
        anonymizeBranch: options.anon,
        isPublic: false
      });

      persistReceipt(receipt);
      await outputReceipt(receipt, options);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Error auditing git range: ${message}`));
      process.exit(1);
    }
  });

program
  .command("share")
  .description("Publish privacy-safe receipt to Qodewk cloud and get a shareable URL")
  .option("-p, --provider <provider>", "Specify AI provider")
  .option("-m, --model <model>", "Specify AI model")
  .option("-s, --since <duration>", "Harvest agent footprints since duration")
  .option("--today", "Harvest agent footprints for today")
  .option("--platform <platform>", "Filter agent platform")
  .option("--anon", "Anonymize branch name in output")
  .option("-f, --format <format>", "Local fallback output format", "terminal")
  .option("-j, --json", "Also print JSON after share")
  .option("--barcode", "Render classic 1D thermal barcode (always on; kept for compatibility)")
  .action(async (options) => {
    try {
      const receipt = await generateReceipt({
        provider: options.provider,
        model: options.model,
        since: resolveSince(options),
        platform: options.platform,
        anonymizeBranch: options.anon,
        isPublic: false
      });

      const localFlag = program.opts().local === true;
      if (process.env.QODEWK_TELEMETRY === "off" || localFlag) {
        console.log(
          pc.yellow(
            `\nCloud publishing is disabled (${localFlag ? "--local" : "QODEWK_TELEMETRY=off"}).`
          )
        );
        console.log(pc.dim("Telemetry remains strictly stored in local SQLite (~/.qodewk/state.db).\n"));
        persistReceipt(receipt);
        await renderTerminalReceipt(receipt);
        return;
      }

      const sanitized = sanitizeReceiptForShare(receipt);
      let body = JSON.stringify(sanitized);

      // Drop optional sessions if still over the 50 KB API cap
      if (Buffer.byteLength(body, "utf-8") > SHARE_PAYLOAD_MAX_BYTES && sanitized.ai.sessions) {
        const trimmed = {
          ...sanitized,
          ai: { ...sanitized.ai, sessions: undefined }
        };
        body = JSON.stringify(trimmed);
      }

      if (Buffer.byteLength(body, "utf-8") > SHARE_PAYLOAD_MAX_BYTES) {
        console.error(pc.red("Sanitized receipt still exceeds the 50 KB cloud payload limit."));
        process.exit(1);
      }

      const endpoint =
        process.env.QODEWK_API_URL ||
        `${process.env.NEXT_PUBLIC_APP_URL || process.env.QODEWK_APP_URL || "https://qodewk.flinkeo.online"}/api/receipts`;
      console.log(pc.dim(`Publishing receipt ${sanitized.receipt.id} to ${endpoint}...`));

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": String(Buffer.byteLength(body, "utf-8"))
          },
          body
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(`API responded with status ${response.status}${errText ? `: ${errText.slice(0, 200)}` : ""}`);
        }

        const data = (await response.json()) as { url: string; claimToken: string };

        persistReceipt(sanitized, data.claimToken);

        console.log("");
        console.log(pc.green("  Published successfully."));
        console.log(`  ${pc.dim("Public URL:")} ${pc.underline(pc.cyan(data.url))}`);
        console.log(`  ${pc.bold(pc.yellow("  Claim token (store securely — shown once):"))}`);
        console.log(`  ${pc.yellow(data.claimToken)}`);
        console.log(pc.dim("  Saved to ~/.qodewk/state.db — required to prove authorship later."));
        console.log("");

        await renderTerminalReceipt(sanitized, data.url);

        if (options.json) {
          console.log(JSON.stringify({ url: data.url, claimToken: data.claimToken, receipt: sanitized }, null, 2));
        }
      } catch (networkErr: unknown) {
        const message = networkErr instanceof Error ? networkErr.message : String(networkErr);
        console.log(pc.yellow(`\nCould not reach cloud API (${message}). Rendered locally:`));
        persistReceipt(receipt);
        await renderTerminalReceipt(receipt);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Error sharing receipt: ${message}`));
      process.exit(1);
    }
  });

program
  .command("record")
  .alias("record-event")
  .description("Silently record local telemetry receipt into SQLite (used by git hooks)")
  .action(async () => {
    try {
      const receipt = await generateReceipt({ isPublic: false });
      persistReceipt(receipt);
      process.exit(0);
    } catch {
      // Non-blocking, never fail git commit
      process.exit(0);
    }
  });

const hookCommand = program
  .command("hook")
  .aliases(["hooks"])
  .description("Manage non-blocking Git hooks for automatic telemetry recording");

hookCommand
  .command("install")
  .description("Install non-blocking post-commit and post-rewrite Git hooks")
  .action(async () => {
    try {
      const hooksDir = resolveGitHooksDir();
      if (!hooksDir) {
        console.error(pc.red("Error: Current directory is not a Git repository (.git not found)."));
        process.exit(1);
      }

      if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
      }

      const targets = ["post-commit", "post-rewrite"] as const;
      let installed = 0;
      let existing = 0;

      for (const name of targets) {
        const result = installHookFile(path.join(hooksDir, name));
        if (result === "installed") installed++;
        else existing++;
      }

      if (installed === 0 && existing > 0) {
        console.log(pc.yellow("Qodewk Git hooks are already installed (post-commit, post-rewrite)."));
        return;
      }

      console.log(
        pc.green(
          `✓ Non-blocking Qodewk hooks installed in ${hooksDir} (post-commit${installed > 1 || existing > 0 ? ", post-rewrite" : installed === 1 && targets.length === 2 ? " + post-rewrite" : ""})`
        )
      );
      if (existing > 0) {
        console.log(pc.dim(`  (${existing} hook file(s) already contained the Qodewk marker)`));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Failed to install Git hook: ${message}`));
      process.exit(1);
    }
  });

hookCommand
  .command("uninstall")
  .description("Remove Qodewk post-commit and post-rewrite Git hooks")
  .action(async () => {
    try {
      const hooksDir = resolveGitHooksDir();
      if (!hooksDir) {
        console.log(pc.yellow("No Git repository found."));
        return;
      }

      const targets = ["post-commit", "post-rewrite"] as const;
      let removed = 0;

      for (const name of targets) {
        const result = uninstallHookFile(path.join(hooksDir, name));
        if (result === "removed") removed++;
      }

      if (removed === 0) {
        console.log(pc.yellow("Qodewk hooks are not installed."));
        return;
      }

      console.log(pc.green(`✓ Qodewk hook markers removed from ${removed} file(s).`));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Failed to uninstall hook: ${message}`));
      process.exit(1);
    }
  });

const ansiHex = (hexColor: string) => {
  const num = parseInt(hexColor.replace("#", ""), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return (text: string) => `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;
};

const stripAnsi = (str: string): string => {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1B\([B0]/g, "");
};

const visibleWidth = (str: string): number => {
  return stripAnsi(str).length;
};

function buildTerminalReceipt(receipt: ReceiptV1, publicUrl?: string): string {
  const lines: string[] = [];
  const coral = ansiHex("#cc785c");
  const green = ansiHex("#5db872");
  const red = ansiHex("#c64545");
  const teal = ansiHex("#5db8a6");
  const INNER_WIDTH = 52;

  const push = (line: string) => lines.push(line);

  const printRow = (content: string, width = INNER_WIDTH) => {
    const visLen = visibleWidth(content);
    const pad = Math.max(0, width - visLen);
    push(`  | ${content}${" ".repeat(pad)} |`);
  };

  const printRowSplit = (left: string, right: string, width = INNER_WIDTH) => {
    const leftVis = visibleWidth(left);
    const rightVis = visibleWidth(right);
    const pad = Math.max(1, width - leftVis - rightVis);
    push(`  | ${left}${" ".repeat(pad)}${right} |`);
  };

  const printCenteredRow = (content: string, width = INNER_WIDTH) => {
    const visLen = visibleWidth(content);
    const totalPad = Math.max(0, width - visLen);
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    push(`  | ${" ".repeat(leftPad)}${content}${" ".repeat(rightPad)} |`);
  };

  const printDivider = (char = "=", width = INNER_WIDTH) => {
    push(`  | ${char.repeat(width)} |`);
  };

  const totalTokens = (receipt.ai.tokens.input + receipt.ai.tokens.output).toLocaleString();
  const inputK = `${Math.round(receipt.ai.tokens.input / 1000)}k`;
  const outputK = `${Math.round(receipt.ai.tokens.output / 1000)}k`;
  const costPrefix = receipt.ai.mode === "verified" ? "$" : "~$";
  const confidencePercent = `${Math.round(receipt.ai.confidence * 100)}%`;

  push("");
  push("  " + pc.bold(coral("/\\".repeat(28))));
  printCenteredRow(pc.bold(pc.white("Q O D E W K")));
  printCenteredRow(coral("*** PROOF OF SHIPMENT ***"));
  printRow("");
  printRowSplit(
    `ID:   ${receipt.receipt.id.slice(0, 24)}`,
    `DATE: ${receipt.receipt.createdAt.slice(0, 10)}`
  );
  printRowSplit(
    `REPO: ${receipt.repository.projectAlias.slice(0, 18)}`,
    `BRANCH: ${receipt.repository.branch.slice(0, 16)}`
  );
  if (receipt.ai.task) {
    const taskClean = receipt.ai.task.length > 44 ? receipt.ai.task.slice(0, 43) + "…" : receipt.ai.task;
    printRow(`TASK: ${taskClean}`);
  }
  printDivider("=");
  const itemsHeader =
    receipt.repository.commitsCount && receipt.repository.commitsCount > 1
      ? `ITEMS CHANGED (${receipt.repository.commitsCount} COMMITS)`
      : "ITEMS CHANGED";
  printRowSplit(itemsHeader, "QTY");
  printDivider("-");
  printRowSplit("Files Touched", String(receipt.mutation.files));
  printRowSplit("Lines Inserted", green("+ " + receipt.mutation.insertions));
  printRowSplit("Lines Deleted", red("- " + receipt.mutation.deletions));
  printRowSplit(
    "Net Code Delta",
    teal((receipt.mutation.netLines >= 0 ? "+ " : "- ") + Math.abs(receipt.mutation.netLines))
  );
  printDivider("-");
  printRow("AI TELEMETRY & ATTRIBUTION");
  const provString = receipt.ai.provider + " · " + (receipt.ai.model || "Unknown");
  const cleanProv = provString.length > 40 ? provString.slice(0, 39) + "…" : provString;
  printRow(`Provider: ${cleanProv}`);
  if (receipt.ai.sessions && receipt.ai.sessions.length > 1) {
    const others = receipt.ai.sessions
      .slice(1)
      .map((s) => s.provider)
      .filter((p, i, arr) => arr.indexOf(p) === i && p !== receipt.ai.provider);
    if (others.length > 0) {
      printRow(pc.dim(`Also seen: ${others.join(", ")}`));
    }
  }
  if (receipt.ai.aiWrittenRatio !== undefined) {
    const aiPct = Math.round(receipt.ai.aiWrittenRatio * 100);
    printRowSplit("AI Written Code", `${aiPct}% (Human: ${100 - aiPct}%)`);
  }
  const tokenDetail = `${inputK} in (${Math.round(receipt.ai.tokens.cached / 1000)}k cached) / ${outputK} out`;
  const cleanTokens = tokenDetail.length > 40 ? tokenDetail.slice(0, 39) + "…" : tokenDetail;
  printRow(`Tokens:   ${cleanTokens}`);
  printRowSplit("Total Tokens:", totalTokens);
  printDivider("=");
  const costLabel = receipt.ai.mode === "verified" ? "VERIFIED AI COST" : "ESTIMATED AI COST";
  printRowSplit(costLabel, pc.bold(coral(costPrefix + receipt.ai.cost.toFixed(2))));
  printRowSplit(`CONFIDENCE: ${confidencePercent}`, `[Mode: ${receipt.ai.mode}]`);
  printDivider("=");
  printRow("");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.QODEWK_APP_URL || "https://qodewk.flinkeo.online";
  const isPublished = Boolean(publicUrl);
  const displayHost = baseUrl.replace(/^https?:\/\//, "");

  const barcodePayload = pickBarcodePayload({
    publicUrl,
    receiptId: receipt.receipt.id,
    displayHost,
    maxChars: 28
  });
  const barcodeRows = renderTerminalBarcode(barcodePayload, {
    maxWidth: INNER_WIDTH,
    height: 3,
    quietZone: 8
  });
  for (const barRow of barcodeRows) {
    printCenteredRow(pc.bold(barRow));
  }

  if (isPublished) {
    printCenteredRow(pc.cyan(displayHost));
    printCenteredRow(pc.underline(pc.cyan(`r/${receipt.receipt.id}`)));
  } else {
    printCenteredRow(pc.yellow("[ LOCAL RECORD — NOT PUBLISHED ]"));
  }
  printRow("");
  if (process.env.QODEWK_TELEMETRY === "off") {
    printRow(`  ${teal("[✓]")} QODEWK_TELEMETRY=off (Cloud sync disabled)`);
  }
  printRow(`  ${green("[✓]")} Source code was never uploaded to Qodewk`);
  push("  " + pc.bold(coral("\\/".repeat(28))));
  push("");

  if (isPublished && publicUrl) {
    push(`  ${pc.dim("Public Receipt:")} ${pc.underline(pc.cyan(publicUrl))}`);
  } else {
    push(`  ${pc.dim("Saved to local DB:")} ${pc.dim("~/.qodewk/state.db")}`);
    push(`  ${pc.dim("To publish & get shareable URL:")} ${pc.cyan("qodewk share")}`);
  }

  push("");

  return lines.join("\n");
}

async function renderTerminalReceipt(receipt: ReceiptV1, publicUrl?: string): Promise<void> {
  console.log(buildTerminalReceipt(receipt, publicUrl));
}

async function outputReceipt(
  receipt: ReceiptV1,
  options: OutputOptions,
  publicUrl?: string
): Promise<void> {
  const format = options.json ? "json" : options.format || "terminal";

  let content: string;
  if (format === "json") {
    content = JSON.stringify(receipt, null, 2);
  } else if (format === "markdown") {
    content = formatMarkdownReceipt(receipt, publicUrl);
  } else {
    content = buildTerminalReceipt(receipt, publicUrl);
  }

  if (options.out) {
    const fileContent = format === "terminal" ? stripAnsi(content) : content;
    fs.writeFileSync(options.out, fileContent.endsWith("\n") ? fileContent : fileContent + "\n", "utf-8");
    console.log(pc.green(`✓ Receipt written to ${options.out}`));
  }

  // Always echo to stdout unless writing terminal-only to a file without wanting duplicate —
  // if -o was set, still print a short confirmation; for non-file runs print full content.
  if (!options.out) {
    if (format === "terminal") {
      console.log(content);
    } else {
      console.log(content);
    }
  } else if (format !== "terminal") {
    // File already written; also show path was enough. Optionally skip stdout spam for json/md files.
  }
}

program.parse(process.argv);
