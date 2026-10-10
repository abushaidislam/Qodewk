import pc from "picocolors";
import { ProjectChatsReport } from "@qodewk/core";
import { colors, visibleWidth } from "./theme.js";

export function buildTerminalChatLedger(report: ProjectChatsReport): string {
  const lines: string[] = [];
  const coral = colors.coral;
  const teal = colors.teal;
  const green = colors.green;
  const INNER_WIDTH = 68;

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

  push("");
  push("  " + pc.bold(coral("/\\".repeat(36))));
  printCenteredRow(pc.bold(pc.white("Q O D E W K")));
  printCenteredRow(coral("*** WORKSPACE CHAT TELEMETRY LEDGER ***"));
  printRow("");
  printRowSplit(
    `REPO:   ${report.projectAlias.slice(0, 24)}`,
    `WINDOW: ${report.windowDescription}`
  );
  printRowSplit(
    `CHATS:  ${report.sessionsCount} sessions`,
    `STEPS:  ${report.totalSteps.toLocaleString()} steps`
  );
  printDivider("=");

  if (report.chats.length === 0) {
    printCenteredRow(pc.dim("No agent chat sessions found in this workspace window."));
    printRow("");
  } else {
    // Header
    const colTask = "CHAT / TASK".padEnd(28);
    const colModel = "MODEL".padEnd(18);
    const colTok = "TOKENS".padStart(8);
    const colCost = "COST".padStart(10);
    printRow(`${colTask} ${colModel} ${colTok} ${colCost}`);
    printDivider("-");

    for (const chat of report.chats) {
      const cleanTitle = (chat.taskTitle || chat.sessionId || "Untitled Session")
        .replace(/\n/g, " ")
        .trim();
      const taskDisplay = (cleanTitle.length > 27 ? cleanTitle.slice(0, 26) + "…" : cleanTitle).padEnd(28);
      
      const cleanModel = (chat.model || chat.platform || "default")
        .replace(/^(claude-|gemini-|gpt-)/, "")
        .slice(0, 17);
      const modelDisplay = cleanModel.padEnd(18);

      const tokK = `${Math.round((chat.tokens.input + chat.tokens.output) / 1000)}k`.padStart(8);
      const costStr = (chat.mode === "verified" ? `$${chat.cost.toFixed(2)}` : `~$${chat.cost.toFixed(2)}`).padStart(10);

      printRow(`${taskDisplay} ${pc.dim(modelDisplay)} ${teal(tokK)} ${coral(costStr)}`);
    }
  }

  printDivider("=");
  const totalTokK = `${Math.round((report.totalTokens.input + report.totalTokens.output) / 1000)}k tokens`;
  printRowSplit("TOTAL ESTIMATED TOKENS:", green(totalTokK));
  printRowSplit("TOTAL ESTIMATED SPEND:", pc.bold(coral(`~$${report.totalCost.toFixed(2)}`)));
  printDivider("=");
  printCenteredRow(pc.dim("[✓] Zero code exfiltration · Telemetry calculated locally"));
  push("  " + pc.bold(coral("\\/".repeat(36))));
  push("");

  return lines.join("\n");
}

export function buildMarkdownChatLedger(report: ProjectChatsReport): string {
  const lines: string[] = [];
  lines.push(`### 🤖 Qodewk Workspace Chat Telemetry Ledger`);
  lines.push(`**Repository:** \`${report.projectAlias}\` | **Window:** ${report.windowDescription} | **Total Spend:** \`~$${report.totalCost.toFixed(2)}\``);
  lines.push("");
  lines.push("| Chat / Task | Platform | Model | Steps | Tokens | Cost |");
  lines.push("| :--- | :--- | :--- | :--- | :--- | :--- |");

  for (const chat of report.chats) {
    const title = (chat.taskTitle || chat.sessionId).replace(/\|/g, "\\|").trim();
    const tokensK = `${Math.round((chat.tokens.input + chat.tokens.output) / 1000)}k`;
    const cost = chat.mode === "verified" ? `$${chat.cost.toFixed(2)}` : `~$${chat.cost.toFixed(2)}`;
    lines.push(`| ${title} | \`${chat.platform}\` | \`${chat.model}\` | ${chat.stepsCount} | ${tokensK} | ${cost} |`);
  }

  lines.push("");
  lines.push(`*Total Sessions: ${report.sessionsCount} · Total Steps: ${report.totalSteps.toLocaleString()}*`);
  return lines.join("\n");
}
