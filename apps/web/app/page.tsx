import React from "react";
import { ThermalReceipt } from "@/components/ThermalReceipt";
import { ReceiptV1 } from "@qodewk/protocol";
import { Terminal, Shield, ArrowRight, GitCommit, Cpu, Zap } from "lucide-react";
import Link from "next/link";

const heroSampleReceipt: ReceiptV1 = {
  version: "1.0",
  receipt: {
    id: "rec_01J8Y29K4Z00ABC123DEF456",
    createdAt: new Date().toISOString(),
    contentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  repository: {
    repoHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    projectAlias: "hyper-engine",
    branch: "feat/auth-v2",
    headSha: "7f8b2c1e4d3a5f6e7d8c9b0a1f2e3d4c5b6a7f8e",
    commitsCount: 3
  },
  mutation: {
    files: 14,
    insertions: 381,
    deletions: 72,
    netLines: 309,
    renames: 1,
    languages: {
      "TypeScript": 82,
      "Rust": 14,
      "Markdown": 4
    }
  },
  ai: {
    provider: "anthropic",
    model: "claude-3-7-sonnet",
    tokens: {
      input: 120000,
      output: 63000,
      cached: 45000
    },
    cost: 2.41,
    mode: "estimated",
    confidence: 0.74,
    sessions: [
      {
        provider: "anthropic",
        model: "claude-3-7-sonnet",
        tokens: { input: 120000, output: 63000, cached: 45000 },
        cost: 2.41,
        confidence: 0.74,
        mode: "estimated"
      }
    ]
  },
  privacy: {
    sourceExcluded: true,
    isPublic: true,
    anonymizeBranch: false
  }
};

export default function HomePage() {
  return (
    <div className="space-y-24 py-16 px-6">
      {/* 1. Hero Section (Cream Canvas) */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-xs font-mono text-[#141413]">
            <span className="w-2 h-2 rounded-full bg-[#5db8a6] animate-pulse"></span>
            <span>Git-Native AI Telemetry Protocol</span>
          </div>

          <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl font-normal text-[#141413] leading-[1.05] tracking-tight">
            The receipt layer for AI software development.
          </h1>

          <p className="text-lg text-[#3d3d3a] max-w-xl leading-relaxed">
            Track what changed, estimate what it cost, and prove what you shipped across Claude Code, Cursor, Windsurf, and Copilot — without uploading your source code.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center bg-[#181715] text-[#faf9f5] font-mono text-sm px-4 py-3 rounded-lg border border-[#252320] shadow-sm">
              <span className="text-[#8e8b82] mr-2">$</span>
              <span>npx qodewk</span>
            </div>

            <Link
              href="/r/rec_01J8Y29K4Z00ABC123DEF456"
              className="inline-flex items-center gap-2 bg-[#cc785c] hover:bg-[#a9583e] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <span>View Sample Receipt</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs font-mono text-[#6c6a64]">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#5db872]" />
              <span>Zero source exfiltration</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#cc785c]" />
              <span>Non-blocking Git hooks</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Receipt Preview */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="transform hover:-translate-y-1 transition-transform duration-300">
            <ThermalReceipt receipt={heroSampleReceipt} showActions={true} />
          </div>
        </div>
      </section>

      {/* 2. Feature Cards Section (Cream Cards #efe9de) */}
      <section id="how-it-works" className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif-display text-4xl text-[#141413]">
            Engineered for the multi-agent developer
          </h2>
          <p className="text-sm text-[#6c6a64]">
            Single-vendor telemetry fails when you switch between editors, terminals, and CLI agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-8 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#cc785c]">
              <GitCommit className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-2xl text-[#141413]">
              Git as Truth
            </h3>
            <p className="text-sm text-[#6c6a64] leading-relaxed">
              Git tells Qodewk what changed. Telemetry, when available, tells what was consumed. Inferences are never presented as exact billing usage.
            </p>
          </div>

          <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-8 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#5db8a6]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-2xl text-[#141413]">
              Multi-Model Rate Cards
            </h3>
            <p className="text-sm text-[#6c6a64] leading-relaxed">
              Versioned pricing registries account for input, output, and 90% prompt caching discounts across Anthropic, OpenAI, DeepSeek, and Gemini.
            </p>
          </div>

          <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-8 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#5db872]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-2xl text-[#141413]">
              Zero Source Exfiltration
            </h3>
            <p className="text-sm text-[#6c6a64] leading-relaxed">
              Your source code and diff bodies never leave your machine. Public receipts transmit only salted hashes and aggregate line/token counts.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Dark Terminal Product Chrome Mockup (#181715) */}
      <section className="max-w-6xl mx-auto">
        <div className="bg-[#181715] text-[#faf9f5] rounded-2xl p-8 md:p-12 border border-[#252320] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#cc785c]">
                Non-Blocking CLI Workflow
              </span>
              <h2 className="font-serif-display text-3xl md:text-4xl text-[#faf9f5]">
                Generate receipts in terminal or CI.
              </h2>
              <p className="text-sm text-[#a09d96] leading-relaxed">
                Run <code className="text-[#faf9f5] font-mono">qodewk</code> right after an agent finishes a task. Instantly output ASCII receipts, machine-readable JSON, or shareable web URLs.
              </p>
              <div className="pt-2">
                <a
                  href="https://github.com/qodewk/qodewk"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#cc785c] hover:underline font-mono"
                >
                  <span>Explore on GitHub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#1f1e1b] rounded-xl border border-[#252320] p-5 font-mono text-xs text-[#a09d96] overflow-x-auto">
              <div className="flex items-center gap-1.5 pb-3 border-b border-[#252320] text-[#6c6a64] mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c64545]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4a017]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#5db872]"></span>
                <span className="ml-2 text-[11px]">terminal — qodewk</span>
              </div>
              <pre className="text-[#faf9f5] leading-relaxed">
{`$ npx qodewk

  /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\
  |                   Q O D E W K                        |
  |             *** PROOF OF SHIPMENT ***                |
  | ID: rec_01J8Y29K4Z00ABC      DATE: 2026-09-27        |
  | REPO: hyper-engine           BRANCH: feat/auth-v2    |
  | ==================================================== |
  | Files Touched:   14   | Lines: +381 / -72            |
  | AI Telemetry:    Claude Code · Opus 4                |
  | Tokens:          ~183K (60% cached)                  |
  | ESTIMATED COST:  ~$2.41 (74% confidence)             |
  |                                                      |
  |   ||| | ||||| ||| |||| |||||| |||| ||| ||||||| |||   |
  |   https://qodewk.dev/r/rec_01J8Y29K4Z00ABC           |
  |                                                      |
  |   [✓] Source code was never uploaded to Qodewk        |
  \\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Coral Full-Bleed Callout Band (#cc785c) */}
      <section className="max-w-6xl mx-auto">
        <div className="bg-[#cc785c] text-white rounded-2xl p-10 md:p-14 text-center space-y-6 shadow-md">
          <h2 className="font-serif-display text-4xl md:text-5xl font-normal leading-tight">
            Stop guessing your agent burn. Start generating receipts.
          </h2>
          <p className="max-w-xl mx-auto text-white/90 text-sm md:text-base">
            Free, open-source, and local-first. Works with Claude Code, Cursor, Windsurf, Copilot, and manual Git workflows.
          </p>
          <div className="pt-2">
            <a
              href="https://github.com/qodewk/qodewk"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#181715] hover:bg-[#252320] text-white px-6 py-3.5 rounded-lg text-sm font-medium transition-colors shadow-lg"
            >
              <Terminal className="w-4 h-4" />
              <span>Get Started in 30 Seconds</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
