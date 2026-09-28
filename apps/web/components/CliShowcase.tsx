"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Share2, Code2, GitPullRequest, Workflow, ExternalLink, ShieldCheck } from "lucide-react";

interface CommandTab {
  id: string;
  name: string;
  command: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
  preview: string;
  language: string;
}

const COMMAND_TABS: CommandTab[] = [
  {
    id: "receipt",
    name: "Terminal Receipt",
    command: "npx qodewk",
    icon: Terminal,
    description: "Inspect the latest Git revision and render an instant monospace thermal receipt with AI token consumption and cost estimation.",
    badge: "Most Popular",
    language: "text",
    preview: `  /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\
  |                   Q O D E W K                        |
  |             *** PROOF OF SHIPMENT ***                |
  |                                                      |
  | ID:     rec_5b04095a59f6a59b8db0 DATE: 2026-09-27   |
  | REPO:   qodewk             BRANCH: feat/auth-v2     |
  | ==================================================== |
  | ITEMS CHANGED                                    QTY |
  | ---------------------------------------------------- |
  | Files Touched                                        4 |
  | Lines Inserted                                    + 78 |
  | Lines Deleted                                     - 12 |
  | Net Code Delta                                    + 66 |
  | ---------------------------------------------------- |
  | AI TELEMETRY                                         |
  | Provider: anthropic · claude-3-7-sonnet              |
  | Tokens:   14k in (9k cached) / 2k out                |
  | Total Tokens:                                 16,340 |
  | ==================================================== |
  | ESTIMATED AI COST                             ~$0.06 |
  | CONFIDENCE: 82%    [Mode: observed ]                 |
  | ==================================================== |
  |                                                      |
  |   ||| | ||||| ||| |||| |||||| |||| ||| ||||||| |||   |
   |   https://qodewk.flinkeo.online/r/rec_5b04095a59f6a59b8db0c2a    |
  |                                                      |
  |   [✓] Source code was never uploaded to Qodewk        |
  \\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/`
  },
  {
    id: "json",
    name: "JSON Telemetry",
    command: "npx qodewk --json",
    icon: Code2,
    description: "Export machine-readable telemetry conforming to canonical Receipt v1.0 standard for custom pipelines and compliance audits.",
    badge: "Standard v1.0",
    language: "json",
    preview: `{
  "version": "1.0",
  "receipt": {
    "id": "rec_5b04095a59f6a59b8db0",
    "createdAt": "2026-09-27T16:10:11.842Z",
    "contentHash": "8bd685c2f39eb3734439e874e95a8645775d50cc"
  },
  "repository": {
    "projectAlias": "qodewk",
    "branch": "feat/auth-v2",
    "headSha": "b50fabe4d96a71e6d982bca8192a"
  },
  "mutation": {
    "files": 4,
    "insertions": 78,
    "deletions": 12,
    "netLines": 66,
    "languages": { "TypeScript": 92, "Markdown": 8 }
  },
  "ai": {
    "provider": "anthropic",
    "model": "claude-3-7-sonnet",
    "cost": 0.06,
    "confidence": 0.82,
    "mode": "observed"
  },
  "privacy": {
    "sourceExcluded": true,
    "isPublic": true
  }
}`
  },
  {
    id: "share",
    name: "Shareable Cloud Link",
    command: "npx qodewk share",
    icon: Share2,
    description: "Publish privacy-safe metadata directly to Qodewk Cloud (50KB cap) to get an interactive verifiable web receipt link.",
    badge: "Cloud Share",
    language: "text",
    preview: `$ npx qodewk share

[1/3] Extracting local Git diff metadata... [4 files, +78/-12]
[2/3] Computing token telemetry & cryptographic HMAC-SHA256...
[3/3] Publishing receipt to https://qodewk.flinkeo.online/api/receipts...

✓ Receipt published successfully!

Receipt ID:  rec_5b04095a59f6a59b8db0
Public URL:  https://qodewk.flinkeo.online/r/rec_5b04095a59f6a59b8db0
Claim Token: clm_948a2bc901e84d7... (saved in ~/.qodewk/claim_tokens.json)

[✓] Source code was never uploaded to Qodewk`
  },
  {
    id: "audit",
    name: "PR Branch Audit",
    command: "npx qodewk audit --base origin/main",
    icon: GitPullRequest,
    description: "Calculate aggregate code changes and multi-agent token expenditures across an entire PR branch range against a base commit.",
    badge: "Branch Diff",
    language: "text",
    preview: `$ npx qodewk audit --base origin/main --head HEAD

AUDITING BRANCH DIFF: origin/main...HEAD
---------------------------------------------------------
Commits in range:      3
Files Touched:         9
Lines Inserted:        + 382
Lines Deleted:         - 41
Net Delta:             + 341 lines

AI CONSUMPTION SUMMARY:
Sessions Detected:     2 (Claude Code + Cursor)
Total Tokens:          ~48,200 (prompt cache hit 78%)
Estimated Burn:        ~$0.19 (Confidence: 86%)

Export sticky Markdown PR comment:
  $ npx qodewk audit --base origin/main -f markdown -o pr-receipt.md`
  },
  {
    id: "action",
    name: "GitHub Action CI",
    command: "uses: abushaidislam/Qodewk/packages/action@v0.1.6",
    icon: Workflow,
    description: "Automatically comment digital shipment receipts on every Pull Request without giving CI access to your source code.",
    badge: "CI/CD",
    language: "yaml",
    preview: `# .github/workflows/qodewk.yml
name: "Qodewk Telemetry Receipt"
on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  audit-receipt:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Qodewk PR Receipt
        uses: abushaidislam/Qodewk/packages/action@v0.1.6
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          base-ref: origin/\${{ github.base_ref }}
          head-sha: \${{ github.sha }}
          publish-cloud: "true"`
  }
];

export function CliShowcase() {
  const [activeTab, setActiveTab] = useState<string>("receipt");
  const [copied, setCopied] = useState<boolean>(false);

  const current = COMMAND_TABS.find((t) => t.id === activeTab) || COMMAND_TABS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="cli-guide" className="max-w-6xl mx-auto space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#e6dfd8]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-xs font-mono text-[#141413]">
            <Terminal className="w-3.5 h-3.5 text-[#cc785c]" />
            <span>Zero-Config Terminal CLI</span>
          </div>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-normal text-[#141413] tracking-tight">
            One command. Instant receipt.
          </h2>
          <p className="text-base text-[#6c6a64] max-w-xl">
            Published directly on the public NPM registry. Run without global installation or signup.
          </p>
        </div>

        {/* NPM package live link badge */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.npmjs.com/package/qodewk"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#efe9de] hover:bg-[#e8e0d2] border border-[#e6dfd8] px-4 py-2.5 rounded-lg text-xs font-mono text-[#141413] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#5db872]"></span>
            <span className="font-bold">qodewk@0.1.6</span>
            <span className="text-[#6c6a64]">on npm</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8e8b82]" />
          </a>

          <a
            href="https://github.com/abushaidislam/Qodewk"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#181715] hover:bg-[#252320] text-white px-4 py-2.5 rounded-lg text-xs font-mono transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#a09d96]" />
          </a>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {COMMAND_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "bg-[#cc785c] text-white shadow-sm"
                  : "bg-[#efe9de] text-[#3d3d3a] hover:bg-[#e8e0d2] border border-[#e6dfd8]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-[#faf9f5] text-[#6c6a64] border border-[#e6dfd8]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Command Card & Terminal Screen */}
      <div className="bg-[#181715] text-[#faf9f5] rounded-2xl border border-[#252320] shadow-xl overflow-hidden">
        {/* Terminal Header Bar */}
        <div className="px-6 py-4 border-b border-[#252320] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1f1e1b]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#c64545]"></span>
              <span className="w-3 h-3 rounded-full bg-[#d4a017]"></span>
              <span className="w-3 h-3 rounded-full bg-[#5db872]"></span>
            </div>
            <span className="text-xs font-mono text-[#a09d96] pl-2 border-l border-[#252320]">
              qodewk cli — {current.name}
            </span>
          </div>

          {/* Copyable Command Box */}
          <div className="flex items-center gap-2 bg-[#181715] px-3 py-1.5 rounded-lg border border-[#252320]">
            <code className="text-xs font-mono text-[#faf9f5]">
              {current.command}
            </code>
            <button
              onClick={() => handleCopy(current.command)}
              title="Copy command"
              className="p-1 hover:bg-[#252320] rounded text-[#a09d96] hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#5db872]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Description banner */}
        <div className="px-6 py-3 bg-[#252320]/60 border-b border-[#252320] flex items-center justify-between text-xs text-[#a09d96]">
          <p className="line-clamp-1">{current.description}</p>
          <div className="flex items-center gap-1.5 text-[#5db872] whitespace-nowrap pl-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Source Upload</span>
          </div>
        </div>

        {/* Terminal Output Body */}
        <div className="p-6 overflow-x-auto font-mono text-xs text-[#faf9f5] leading-relaxed max-h-[460px] scrollbar-thin">
          <pre>{current.preview}</pre>
        </div>
      </div>

      {/* Quick Specs Footnotes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-4 space-y-1">
          <span className="font-mono uppercase text-[#cc785c] font-bold text-[11px]">Zero Install</span>
          <p className="text-[#3d3d3a]">Works immediately via <code className="font-mono bg-[#faf9f5] px-1 py-0.5 rounded border border-[#e6dfd8]">npx qodewk</code> on any machine with Node.js 18+.</p>
        </div>
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-4 space-y-1">
          <span className="font-mono uppercase text-[#5db8a6] font-bold text-[11px]">Hardened Privacy</span>
          <p className="text-[#3d3d3a]">Diff bodies and source code stay local. Only token stats and salted hashes are published.</p>
        </div>
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-4 space-y-1">
          <span className="font-mono uppercase text-[#e8a55a] font-bold text-[11px]">Universal Agent Support</span>
          <p className="text-[#3d3d3a]">Harvests telemetry from Claude Code, Cursor, Copilot, Windsurf, and Git commit logs.</p>
        </div>
      </div>
    </section>
  );
}
