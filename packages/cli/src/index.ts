#!/usr/bin/env node

import * as fs from "node:fs";
import { Command } from "commander";
import pc from "picocolors";
import { generateReceipt, formatMarkdownReceipt, LocalStateDB } from "@qodewk/core";
import { ReceiptV1 } from "@qodewk/protocol";

const program = new Command();

program
  .name("qodewk")
  .description("Universal telemetry and digital receipt generator for the AI coding agent era")
  .version("0.1.6")
  .option("-j, --json", "Output receipt in machine-readable JSON format")
  .option("-f, --format <format>", "Output format (terminal, json, markdown)", "terminal")
  .option("-o, --out <path>", "Write receipt output to specified file path")
  .option("-p, --provider <provider>", "Specify AI provider (antigravity, claude, cursor, etc.)")
  .option("-m, --model <model>", "Specify AI model identifier")
  .option("-s, --since <duration>", "Harvest agent footprints since duration (e.g. today, 24h, 7d)")
  .option("--today", "Harvest agent footprints for today")
  .option("--platform <platform>", "Filter agent platform (antigravity, claude, cursor, all)")
  .option("--anon", "Anonymize branch name in output")
  .action(async (options) => {
    try {
      const since = options.today ? "today" : options.since;
      const receipt = await generateReceipt({
        provider: options.provider,
        model: options.model,
        since,
        platform: options.platform,
        anonymizeBranch: options.anon
      });

      // Save to local SQLite database
      try {
        const db = new LocalStateDB();
        db.saveReceipt(receipt);
        db.close();
      } catch {
        // Fallback for CI or read-only environments
      }

      outputReceipt(receipt, options);
    } catch (err: any) {
      console.error(pc.red(`Error generating receipt: ${err.message}`));
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
  .action(async (options) => {
    try {
      const receipt = await generateReceipt({
        baseSha: options.base,
        headSha: options.head,
        provider: options.provider,
        model: options.model
      });

      outputReceipt(receipt, options);
    } catch (err: any) {
      console.error(pc.red(`Error auditing git range: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command("share")
  .description("Publish privacy-safe receipt to Qodewk cloud and get a shareable URL")
  .option("-p, --provider <provider>", "Specify AI provider")
  .option("-m, --model <model>", "Specify AI model")
  .action(async (options) => {
    try {
      const receipt = await generateReceipt({
        provider: options.provider,
        model: options.model
      });

      if (process.env.QODEWK_TELEMETRY === "off") {
        console.log(pc.yellow("\n⚠️ Cloud publishing is disabled because QODEWK_TELEMETRY=off."));
        console.log(pc.dim("Telemetry remains strictly stored in local SQLite (~/.qodewk/state.db).\n"));
        renderTerminalReceipt(receipt);
        return;
      }

      const endpoint = process.env.QODEWK_API_URL || "https://qodewk.dev/api/receipts";
      console.log(pc.dim(`Publishing receipt ${receipt.receipt.id} to ${endpoint}...`));

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(receipt)
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json() as { url: string; claimToken: string };

        // Save claim token to local DB
        const db = new LocalStateDB();
        db.saveReceipt(receipt, data.claimToken);
        db.close();

        renderTerminalReceipt(receipt, data.url);
      } catch (networkErr: any) {
        console.log(pc.yellow(`\nCould not reach cloud API (${networkErr.message}). Rendered locally:`));
        renderTerminalReceipt(receipt);
      }
    } catch (err: any) {
      console.error(pc.red(`Error sharing receipt: ${err.message}`));
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

function outputReceipt(receipt: ReceiptV1, options: { json?: boolean; format?: string; out?: string }, publicUrl?: string) {
  let content = "";
  const format = options.json ? "json" : options.format || "terminal";

  if (format === "json") {
    content = JSON.stringify(receipt, null, 2);
  } else if (format === "markdown") {
    content = formatMarkdownReceipt(receipt, publicUrl);
  }

  if (options.out) {
    fs.writeFileSync(options.out, content || formatMarkdownReceipt(receipt, publicUrl), "utf-8");
    console.log(pc.green(`✓ Receipt written to ${options.out}`));
  }

  if (format === "terminal" && !options.out) {
    renderTerminalReceipt(receipt, publicUrl);
  } else if (format !== "terminal" && !options.out) {
    console.log(content);
  }
}

const stripAnsi = (str: string): string => {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1B\([B0]/g, "");
};

const visibleWidth = (str: string): number => {
  return stripAnsi(str).length;
};

function renderTerminalReceipt(receipt: ReceiptV1, publicUrl?: string) {
  const coral = ansiHex("#cc785c");
  const green = ansiHex("#5db872");
  const red = ansiHex("#c64545");
  const teal = ansiHex("#5db8a6");

  const INNER_WIDTH = 52;

  const printRow = (content: string, width = INNER_WIDTH) => {
    const visLen = visibleWidth(content);
    const pad = Math.max(0, width - visLen);
    console.log(`  | ${content}${" ".repeat(pad)} |`);
  };

  const printRowSplit = (left: string, right: string, width = INNER_WIDTH) => {
    const leftVis = visibleWidth(left);
    const rightVis = visibleWidth(right);
    const pad = Math.max(1, width - leftVis - rightVis);
    console.log(`  | ${left}${" ".repeat(pad)}${right} |`);
  };

  const printCenteredRow = (content: string, width = INNER_WIDTH) => {
    const visLen = visibleWidth(content);
    const totalPad = Math.max(0, width - visLen);
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    console.log(`  | ${" ".repeat(leftPad)}${content}${" ".repeat(rightPad)} |`);
  };

  const printDivider = (char = "=", width = INNER_WIDTH) => {
    console.log(`  | ${char.repeat(width)} |`);
  };

  const totalTokens = (receipt.ai.tokens.input + receipt.ai.tokens.output).toLocaleString();
  const inputK = `${Math.round(receipt.ai.tokens.input / 1000)}k`;
  const outputK = `${Math.round(receipt.ai.tokens.output / 1000)}k`;
  const costPrefix = receipt.ai.mode === "verified" ? "$" : "~$";
  const confidencePercent = `${Math.round(receipt.ai.confidence * 100)}%`;

  console.log("");
  console.log("  " + pc.bold(coral("/\\".repeat(28))));
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
  printRowSplit("ITEMS CHANGED", "QTY");
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
  printRowSplit(
    costLabel,
    pc.bold(coral(costPrefix + receipt.ai.cost.toFixed(2)))
  );
  printRowSplit(
    `CONFIDENCE: ${confidencePercent}`,
    `[Mode: ${receipt.ai.mode}]`
  );
  printDivider("=");
  printRow("");
  printCenteredRow(pc.bold("||| | ||||| ||| |||| |||||| |||| ||| ||||||| |||"));
  const urlToDisplay = publicUrl || `https://qodewk.dev/r/${receipt.receipt.id}`;
  const cleanUrl = urlToDisplay.length > 48 ? urlToDisplay.slice(0, 47) + "…" : urlToDisplay;
  printCenteredRow(pc.underline(pc.cyan(cleanUrl)));
  printRow("");
  if (process.env.QODEWK_TELEMETRY === "off") {
    printRow(`  ${teal("[✓]")} QODEWK_TELEMETRY=off (Cloud sync disabled)`);
  }
  printRow(`  ${green("[✓]")} Source code was never uploaded to Qodewk`);
  console.log("  " + pc.bold(coral("\\/".repeat(28))));
  console.log("");
}

program.parse(process.argv);
