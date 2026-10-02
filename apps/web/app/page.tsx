import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Terminal,
  GitCommit,
  Cpu,
  Lock,
  Eye,
  Hash,
  Layers,
  Zap,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { ReceiptV1 } from "@qodewk/protocol";
import { ThermalReceipt } from "@/components/ThermalReceipt";
import { CliShowcase } from "@/components/CliShowcase";
import { Reveal } from "@/components/Reveal";
import { MorphPipeline } from "@/components/MorphPipeline";
import { FaqAccordion } from "@/components/FaqAccordion";

const heroSampleReceipt: ReceiptV1 = {
  version: "1.0",
  receipt: {
    id: "rec_01J8Y29K4Z00ABC123DEF456",
    createdAt: new Date().toISOString(),
    contentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  repository: {
    repoHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    projectAlias: "hyper-engine",
    branch: "feat/auth-v2",
    headSha: "7f8b2c1e4d3a5f6e7d8c9b0a1f2e3d4c5b6a7f8e",
    commitsCount: 3,
  },
  mutation: {
    files: 14,
    insertions: 381,
    deletions: 72,
    netLines: 309,
    renames: 1,
    languages: {
      TypeScript: 82,
      Rust: 14,
      Markdown: 4,
    },
  },
  ai: {
    provider: "anthropic",
    model: "claude-3-7-sonnet",
    tokens: {
      input: 120000,
      output: 63000,
      cached: 45000,
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
        mode: "estimated",
      },
    ],
  },
  privacy: {
    sourceExcluded: true,
    isPublic: true,
    anonymizeBranch: false,
  },
};

const AGENTS = [
  { name: "Cursor", demoId: "demo-cursor" },
  { name: "Claude Code", demoId: "demo-claude" },
  { name: "Google Antigravity", demoId: "demo-antigravity" },
  { name: "Aider", demoId: "demo-aider" },
  { name: "Windsurf", demoId: "demo-cursor" },
  { name: "GitHub Copilot", demoId: "demo-claude" },
] as const;

const FEATURES = [
  {
    icon: GitCommit,
    accent: "#cc785c",
    title: "Git as truth",
    body: "The revision graph is the source of record. Qodewk reads what changed — never invents precision.",
  },
  {
    icon: Cpu,
    accent: "#5db8a6",
    title: "Multi-model rate cards",
    body: "Versioned pricing for Anthropic, OpenAI, Gemini, and DeepSeek — input, output, cache read, and cache write.",
  },
  {
    icon: Shield,
    accent: "#5db872",
    title: "Zero source exfiltration",
    body: "Diff bodies stay local. Public receipts ship salted hashes and aggregate counts under a hard 50KB cap.",
  },
  {
    icon: Zap,
    accent: "#e8a55a",
    title: "Non-blocking hooks",
    body: "post-commit / post-rewrite spawn detached workers and exit in milliseconds. Compatible with Husky and Lefthook.",
  },
  {
    icon: Layers,
    accent: "#cc785c",
    title: "Dual-engine estimation",
    body: "Deterministic JSONL/SQLite harvest when telemetry exists; AST and Git multipliers when it does not.",
  },
  {
    icon: BookOpen,
    accent: "#5db8a6",
    title: "Git Notes ledger",
    body: "Persist receipts under refs/notes/qodewk so history travels with the repo — even offline.",
  },
] as const;

const MODES = [
  {
    mode: "observed",
    tone: "teal",
    desc: "Provider stream harvested locally. Highest fidelity token counts.",
  },
  {
    mode: "estimated",
    tone: "coral",
    desc: "Heuristic from diffs + rate cards. Always shown with ~ and confidence.",
  },
  {
    mode: "verified",
    tone: "amber",
    desc: "Cross-checked against a billing export or provider invoice import.",
  },
  {
    mode: "unknown",
    tone: "muted",
    desc: "No telemetry available. Mutation receipt still ships; cost stays unlabeled.",
  },
] as const;

const PRIVACY_POINTS = [
  {
    icon: Lock,
    title: "Local by default",
    body: "SQLite state lives in ~/.qodewk. CI falls back to :memory: when CI=true or --no-db.",
  },
  {
    icon: Hash,
    title: "Salted HMAC hashes",
    body: "Repo and content fingerprints use HMAC-SHA256 — irreversible without your local salt.",
  },
  {
    icon: Eye,
    title: "Labeled provenance",
    body: "Every dollar and token count declares how it was derived. Inference is never dressed as invoice truth.",
  },
] as const;

function toneClass(tone: (typeof MODES)[number]["tone"]) {
  switch (tone) {
    case "teal":
      return "text-[#5db8a6] bg-[#5db8a6]/10 border-[#5db8a6]/25";
    case "coral":
      return "text-[#cc785c] bg-[#cc785c]/10 border-[#cc785c]/25";
    case "amber":
      return "text-[#e8a55a] bg-[#e8a55a]/10 border-[#e8a55a]/25";
    default:
      return "text-[#8e8b82] bg-[#efe9de] border-[#e6dfd8]";
  }
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero (canvas) ─────────────────────────────────────────── */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="pointer-events-none absolute inset-0 hero-atmosphere" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-7">
            <Reveal variant="fade">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-xs font-mono text-[#141413]">
                <span className="w-2 h-2 rounded-full bg-[#5db8a6] status-pulse" />
                <span>Git-native AI telemetry protocol</span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-[64px] font-normal text-[#141413] leading-[1.05] tracking-[-1.5px]">
                Qodewk — the receipt layer for AI software development.
              </h1>
            </Reveal>

            <Reveal delay={120} variant="fade">
              <p className="text-lg text-[#3d3d3a] max-w-xl leading-relaxed">
                Track what changed, estimate what it cost, and prove what you shipped — without uploading your source code.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center bg-[#181715] text-[#faf9f5] font-mono text-sm px-4 py-3 rounded-lg border border-[#252320]">
                  <span className="text-[#8e8b82] mr-2">$</span>
                  <span>npx qodewk</span>
                </div>
                <Link
                  href="/r/rec_01J8Y29K4Z00ABC123DEF456"
                  className="inline-flex items-center gap-2 cursor-pointer bg-[#cc785c] hover:bg-[#a9583e] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  <span>View sample receipt</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={240} variant="fade">
              <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-mono text-[#6c6a64]">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#5db872]" aria-hidden="true" />
                  <span>Zero source exfiltration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#cc785c]" aria-hidden="true" />
                  <span>Non-blocking Git hooks</span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <Reveal variant="morph" delay={100} className="w-full max-w-[380px]">
              <div className="hero-receipt-float">
                <ThermalReceipt receipt={heroSampleReceipt} showActions={true} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Agent strip (cream-strong) ────────────────────────────── */}
      <section className="border-y border-[#e6dfd8] bg-[#e8e0d2]/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Reveal variant="fade">
            <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#8e8b82] mb-5 text-center">
              Works across the multi-agent desk
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {AGENTS.map((agent, i) => (
                <Link
                  key={agent.name}
                  href={`/r/${agent.demoId}`}
                  className="agent-chip px-4 py-2 rounded-lg bg-[#faf9f5] hover:bg-[#efe9de] hover:border-[#cc785c] border border-[#e6dfd8] text-sm font-medium text-[#252523] transition-colors duration-150 inline-flex items-center gap-1.5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span>{agent.name}</span>
                  <span className="text-[10px] font-mono text-[#8e8b82] uppercase">receipt →</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Problem (canvas) ──────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
          <Reveal className="md:col-span-7 space-y-4">
            <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#cc785c]">
              The problem
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#141413] tracking-tight leading-[1.1]">
              Single-vendor telemetry collapses the moment you switch agents.
            </h2>
          </Reveal>
          <Reveal delay={100} variant="fade" className="md:col-span-5">
            <p className="text-[#6c6a64] leading-relaxed">
              Cursor logs one way. Claude Code another. Copilot a third. Git is the only ledger every tool already writes. Qodewk starts there — then layers provider telemetry when it exists.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Pipeline morph (surface-soft band) ────────────────────── */}
      <section id="how-it-works" className="px-6 py-24 bg-[#f5f0e8] border-y border-[#e6dfd8]">
        <div className="max-w-6xl mx-auto space-y-12">
          <Reveal className="max-w-2xl space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#cc785c]">
              How it works
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#141413] tracking-tight">
              Three stages. One morphing proof.
            </h2>
            <p className="text-[#6c6a64] text-base leading-relaxed">
              Watch the pipeline reshape from Git mutation → telemetry → thermal receipt. Hover to pause.
            </p>
          </Reveal>
          <Reveal delay={80} variant="scale">
            <MorphPipeline />
          </Reveal>
        </div>
      </section>

      {/* ── Features (canvas → cream cards) ───────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto space-y-12">
          <Reveal className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#141413] tracking-tight">
              Engineered for the multi-agent developer
            </h2>
            <p className="text-sm text-[#6c6a64]">
              Local-first contracts, labeled confidence, and receipts that travel with your Git history.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 60} variant="up">
                  <article className="feature-card-lift h-full bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-8 space-y-4">
                    <div
                      className="w-10 h-10 rounded-lg bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center"
                      style={{ color: f.accent }}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-serif-display text-2xl text-[#141413] tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm text-[#6c6a64] leading-relaxed">{f.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Privacy / dark product band ───────────────────────────── */}
      <section id="privacy" className="px-6 py-24 bg-[#181715]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <Reveal className="lg:col-span-5 space-y-5">
            <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#cc785c]">
              Privacy by construction
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#faf9f5] tracking-tight leading-[1.1]">
              Your code never becomes our product.
            </h2>
            <p className="text-[#a09d96] leading-relaxed">
              Qodewk is a receipt generator — not a cloud IDE. Public links prove shipment with metadata alone.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1f1e1b] border border-[#252320] text-xs font-mono text-[#5db872]">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>[✓] Source code was never uploaded to Qodewk</span>
            </div>
          </Reveal>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PRIVACY_POINTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 80} variant="up">
                  <div className="h-full rounded-xl bg-[#1f1e1b] border border-[#252320] p-6 space-y-3">
                    <Icon className="w-5 h-5 text-[#cc785c]" aria-hidden="true" />
                    <h3 className="text-[#faf9f5] font-medium text-base">{p.title}</h3>
                    <p className="text-sm text-[#a09d96] leading-relaxed">{p.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Provenance modes (cream cards) ────────────────────────── */}
      <section className="px-6 py-24 bg-[#efe9de]/40">
        <div className="max-w-6xl mx-auto space-y-10">
          <Reveal className="max-w-2xl space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#cc785c]">
              Never fake precision
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#141413] tracking-tight">
              Every metric declares its provenance.
            </h2>
            <p className="text-[#6c6a64] leading-relaxed">
              Confidence is always a 0.0–1.0 float. Estimated dollars always carry a tilde.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODES.map((m, i) => (
              <Reveal key={m.mode} delay={i * 70}>
                <div className="h-full rounded-xl bg-[#faf9f5] border border-[#e6dfd8] p-6 space-y-3">
                  <span
                    className={`inline-flex font-mono text-xs px-2.5 py-1 rounded-full border ${toneClass(m.tone)}`}
                  >
                    {m.mode}
                  </span>
                  <p className="text-sm text-[#6c6a64] leading-relaxed">{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLI showcase (dark mockup inside) ─────────────────────── */}
      <section className="px-6 py-24">
        <CliShowcase />
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section id="faq" className="px-6 py-24 bg-[#f5f0e8] border-y border-[#e6dfd8]">
        <div className="max-w-3xl mx-auto space-y-10">
          <Reveal className="text-center space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#cc785c]">
              FAQ
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#141413] tracking-tight">
              Straight answers for skeptical engineers.
            </h2>
          </Reveal>
          <Reveal delay={80} variant="fade">
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      {/* ── Coral CTA ─────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <Reveal variant="scale">
          <div className="max-w-6xl mx-auto bg-[#cc785c] text-white rounded-2xl p-10 md:p-16 text-center space-y-6 cta-morph-glow">
            <h2 className="font-serif-display text-4xl md:text-5xl font-normal leading-tight tracking-tight">
              Stop guessing your agent burn. Start generating receipts.
            </h2>
            <p className="max-w-xl mx-auto text-white/90 text-sm md:text-base leading-relaxed">
              Free, open-source, and local-first. Works with Claude Code, Cursor, Windsurf, Copilot, and manual Git workflows.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <div className="bg-[#181715] text-[#faf9f5] font-mono text-xs px-4 py-3 rounded-lg border border-[#252320]">
                <span className="text-[#8e8b82] mr-2">$</span>
                <span>npx qodewk</span>
              </div>
              <a
                href="https://github.com/abushaidislam/Qodewk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 cursor-pointer bg-[#181715] hover:bg-[#252320] text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <Terminal className="w-4 h-4" aria-hidden="true" />
                <span>Star on GitHub</span>
              </a>
              <a
                href="https://www.npmjs.com/package/qodewk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 cursor-pointer bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <span>View on NPM</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
