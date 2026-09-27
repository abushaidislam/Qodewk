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
  .version("0.1.0")
  .option("-j, --json", "Output receipt in machine-readable JSON format")
  .option("-f, --format <format>", "Output format (terminal, json, markdown)", "terminal")
  .option("-o, --out <path>", "Write receipt output to specified file path")
  .option("-p, --provider <provider>", "Specify AI provider (anthropic, openai, cursor, etc.)")
  .option("-m, --model <model>", "Specify AI model identifier")
  .option("--anon", "Anonymize branch name in output")
  .action(async (options) => {
    try {
      const receipt = await generateReceipt({
        provider: options.provider,
        model: options.model,
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

function renderTerminalReceipt(receipt: ReceiptV1, publicUrl?: string) {
  const coral = ansiHex("#cc785c");
  const cream = ansiHex("#faf9f5");
  const muted = ansiHex("#8e8b82");
  const green = ansiHex("#5db872");
  const teal = ansiHex("#5db8a6");

  const totalTokens = (receipt.ai.tokens.input + receipt.ai.tokens.output).toLocaleString();
  const inputK = `${Math.round(receipt.ai.tokens.input / 1000)}k`;
  const outputK = `${Math.round(receipt.ai.tokens.output / 1000)}k`;
  const costPrefix = receipt.ai.mode === "verified" ? "$" : "~$";
  const confidencePercent = `${Math.round(receipt.ai.confidence * 100)}%`;

  console.log("");
  console.log(pc.bold(coral("  /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\")));
  console.log(`  |                   ${pc.bold(pc.white("Q O D E W K"))}                        |`);
  console.log(`  |             ${coral("*** PROOF OF SHIPMENT ***")}                |`);
  console.log("  |                                                      |");
  console.log(`  | ID:     ${receipt.receipt.id.slice(0, 24).padEnd(24)} DATE: ${receipt.receipt.createdAt.slice(0, 10)}   |`);
  console.log(`  | REPO:   ${receipt.repository.projectAlias.slice(0, 18).padEnd(18)} BRANCH: ${receipt.repository.branch.slice(0, 16).padEnd(16)} |`);
  console.log("  | ==================================================== |");
  console.log("  | ITEMS CHANGED                                    QTY |");
  console.log("  | ---------------------------------------------------- |");
  console.log(`  | Files Touched                                     ${String(receipt.mutation.files).padStart(4)} |`);
  console.log(`  | Lines Inserted                                  ${green(("+ " + receipt.mutation.insertions).padStart(6))} |`);
  console.log(`  | Lines Deleted                                   ${pc.red(("- " + receipt.mutation.deletions).padStart(6))} |`);
  console.log(`  | Net Code Delta                                  ${teal((receipt.mutation.netLines >= 0 ? "+ " : "- ") + Math.abs(receipt.mutation.netLines)).padStart(6)} |`);
  console.log("  | ---------------------------------------------------- |");
  console.log("  | AI TELEMETRY                                         |");
  console.log(`  | Provider: ${(receipt.ai.provider + " · " + (receipt.ai.model || "Unknown")).slice(0, 36).padEnd(42)} |`);
  console.log(`  | Tokens:   ${(inputK + " in (" + Math.round(receipt.ai.tokens.cached / 1000) + "k cached) / " + outputK + " out").padEnd(42)} |`);
  console.log(`  | Total Tokens: ${totalTokens.padStart(38)} |`);
  console.log("  | ==================================================== |");
  console.log(`  | ESTIMATED AI COST                           ${pc.bold(coral((costPrefix + receipt.ai.cost.toFixed(2)).padStart(8)))} |`);
  console.log(`  | CONFIDENCE: ${confidencePercent.padEnd(6)} [Mode: ${receipt.ai.mode.padEnd(9)}]             |`);
  console.log("  | ==================================================== |");
  console.log("  |                                                      |");
  console.log(`  |   ${pc.bold("||| | ||||| ||| |||| |||||| |||| ||| ||||||| |||")}   |`);
  const urlToDisplay = publicUrl || `https://qodewk.dev/r/${receipt.receipt.id}`;
  console.log(`  |   ${pc.underline(pc.cyan(urlToDisplay.slice(0, 48))).padEnd(59)}|`);
  console.log("  |                                                      |");
  console.log(`  |   ${green("[✓]")} Source code was never uploaded to Qodewk        |`);
  console.log(pc.bold(coral("  \\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/")));
  console.log("");
}

program.parse(process.argv);
