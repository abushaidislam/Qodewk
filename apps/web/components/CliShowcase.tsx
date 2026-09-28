"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Share2,
  Code2,
  GitPullRequest,
  Workflow,
  ExternalLink,
  ShieldCheck,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

type DemoId = "receipt" | "json" | "share" | "audit" | "action";

interface DemoScene {
  id: DemoId;
  name: string;
  short: string;
  command: string;
  icon: React.ElementType;
  description: string;
  badge: string;
  lines: string[];
}

const DEMOS: DemoScene[] = [
  {
    id: "receipt",
    name: "Terminal Receipt",
    short: "Thermal print",
    command: "npx qodewk",
    icon: Terminal,
    description: "Type one command. Watch a thermal receipt materialize from your latest Git revision.",
    badge: "Most Popular",
    lines: [
      "$ npx qodewk",
      "",
      "  /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/",
      "  |              Q O D E W K                     |",
      "  |         *** PROOF OF SHIPMENT ***            |",
      "  |                                              |",
      "  | ID:   rec_5b04095a59f6a59b   DATE: 2026-09-27 |",
      "  | REPO: qodewk               BRANCH: feat/auth |",
      "  | ============================================ |",
      "  | Files Touched                              4 |",
      "  | Lines Inserted                          + 78 |",
      "  | Lines Deleted                           - 12 |",
      "  | Net Code Delta                          + 66 |",
      "  | -------------------------------------------- |",
      "  | AI · anthropic · claude-3-7-sonnet           |",
      "  | Tokens  14k in (9k cached) / 2k out          |",
      "  | ESTIMATED AI COST                   ~$0.06   |",
      "  | CONFIDENCE 82%  [mode: observed]             |",
      "  | ============================================ |",
      "  | [✓] Source code was never uploaded to Qodewk |",
      "  \\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/",
    ],
  },
  {
    id: "json",
    name: "JSON Telemetry",
    short: "Machine output",
    command: "npx qodewk --json",
    icon: Code2,
    description: "Pipe Receipt v1.0 into CI, audits, or your own dashboards — labeled confidence included.",
    badge: "Standard v1.0",
    lines: [
      "$ npx qodewk --json",
      "",
      "{",
      '  "version": "1.0",',
      '  "receipt": {',
      '    "id": "rec_5b04095a59f6a59b",',
      '    "createdAt": "2026-09-27T16:10:11.842Z"',
      "  },",
      '  "mutation": { "files": 4, "insertions": 78, "deletions": 12 },',
      '  "ai": {',
      '    "provider": "anthropic",',
      '    "model": "claude-3-7-sonnet",',
      '    "cost": 0.06,',
      '    "confidence": 0.82,',
      '    "mode": "observed"',
      "  },",
      '  "privacy": { "sourceExcluded": true }',
      "}",
    ],
  },
  {
    id: "share",
    name: "Shareable Cloud Link",
    short: "Publish link",
    command: "npx qodewk share",
    icon: Share2,
    description: "Sanitize metadata, POST under a 50KB cap, get a public /r/[id] receipt — no source upload.",
    badge: "Cloud Share",
    lines: [
      "$ npx qodewk share",
      "",
      "[1/3] Extracting local Git diff metadata... [4 files, +78/−12]",
      "[2/3] Computing token telemetry & HMAC-SHA256...",
      "[3/3] Publishing receipt to qodewk.dev/api/receipts...",
      "",
      "✓ Receipt published successfully!",
      "",
      "Receipt ID:  rec_5b04095a59f6a59b",
      "Public URL:  https://qodewk.flinkeo.online/r/rec_5b04095a59f6a59b",
      "Claim Token: clm_948a2bc901e84d7… (saved in ~/.qodewk)",
      "",
      "[✓] Source code was never uploaded to Qodewk",
    ],
  },
  {
    id: "audit",
    name: "PR Branch Audit",
    short: "Branch burn",
    command: "npx qodewk audit --base origin/main",
    icon: GitPullRequest,
    description: "Aggregate mutations and multi-agent burn across an entire PR range.",
    badge: "Branch Diff",
    lines: [
      "$ npx qodewk audit --base origin/main --head HEAD",
      "",
      "AUDITING BRANCH DIFF: origin/main…HEAD",
      "-------------------------------------------------",
      "Commits in range:      3",
      "Files Touched:         9",
      "Lines Inserted:        + 382",
      "Lines Deleted:         − 41",
      "Net Delta:             + 341 lines",
      "",
      "AI CONSUMPTION SUMMARY:",
      "Sessions Detected:     2 (Claude Code + Cursor)",
      "Total Tokens:          ~48,200 (cache hit 78%)",
      "Estimated Burn:        ~$0.19 (confidence 86%)",
      "",
      "Export sticky PR comment:",
      "  $ npx qodewk audit --base origin/main -f markdown",
    ],
  },
  {
    id: "action",
    name: "GitHub Action CI",
    short: "Sticky PR",
    command: "uses: …/packages/action@v0.1.6",
    icon: Workflow,
    description: "Drop a composite action into CI — sticky markdown receipts on every PR sync.",
    badge: "CI/CD",
    lines: [
      "# .github/workflows/qodewk.yml",
      "name: Qodewk Telemetry Receipt",
      "on:",
      "  pull_request:",
      "    types: [opened, synchronize, reopened]",
      "",
      "jobs:",
      "  audit-receipt:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "        with: { fetch-depth: 0 }",
      "",
      "      - name: Generate Qodewk PR Receipt",
      "        uses: abushaidislam/Qodewk/packages/action@v0.1.6",
      "        with:",
      "          github-token: ${{ secrets.GITHUB_TOKEN }}",
      "          publish-cloud: \"true\"",
    ],
  },
];

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type Phase = "idle" | "typing" | "running" | "done";

function useDemoPlayer(scene: DemoScene, playing: boolean, inView: boolean) {
  const [typed, setTyped] = useState("");
  const [visibleLines, setVisibleLines] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);
  const runId = useRef(0);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const finishInstant = useCallback((s: DemoScene) => {
    setTyped(s.command);
    setVisibleLines(s.lines.length);
    setPhase("done");
  }, []);

  const start = useCallback(
    (s: DemoScene) => {
      clearTimers();
      const id = ++runId.current;

      if (prefersReducedMotion()) {
        finishInstant(s);
        return;
      }

      setTyped("");
      setVisibleLines(0);
      setPhase("typing");

      const schedule = (fn: () => void, ms: number) => {
        const t = window.setTimeout(() => {
          if (runId.current !== id) return;
          fn();
        }, ms);
        timers.current.push(t);
      };

      // Type the command character by character
      const cmd = s.command;
      let i = 0;
      const typeNext = () => {
        if (runId.current !== id) return;
        i += 1;
        setTyped(cmd.slice(0, i));
        if (i < cmd.length) {
          const jitter = 28 + Math.random() * 36;
          schedule(typeNext, jitter);
        } else {
          setPhase("running");
          // Brief pause, then stream output lines
          schedule(() => {
            let line = 0;
            const reveal = () => {
              if (runId.current !== id) return;
              line += 1;
              setVisibleLines(line);
              if (line < s.lines.length) {
                const delay =
                  s.lines[line - 1] === "" ? 80 : 55 + Math.min(s.lines[line - 1].length, 40) * 2;
                schedule(reveal, delay);
              } else {
                setPhase("done");
              }
            };
            reveal();
          }, 420);
        }
      };
      schedule(typeNext, 180);
    },
    [clearTimers, finishInstant]
  );

  // Restart whenever scene changes or when entering view while playing
  useEffect(() => {
    if (!inView) {
      clearTimers();
      return;
    }
    if (!playing) {
      clearTimers();
      return;
    }
    start(scene);
    return () => clearTimers();
    // Restart only when scene / play / view changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, playing, inView]);

  const replay = useCallback(() => {
    start(scene);
  }, [scene, start]);

  return { typed, visibleLines, phase, replay };
}

export function CliShowcase() {
  const [activeId, setActiveId] = useState<DemoId>("receipt");
  const [playing, setPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  const activeIndex = DEMOS.findIndex((d) => d.id === activeId);
  const scene = DEMOS[activeIndex] ?? DEMOS[0];
  const { typed, visibleLines, phase, replay } = useDemoPlayer(scene, playing, inView);

  // Observe section visibility — pause demo offscreen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio > 0.2),
      { threshold: [0, 0.2, 0.5] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-advance to next scene when demo completes
  useEffect(() => {
    if (phase !== "done" || !playing || !inView || prefersReducedMotion()) return;
    const t = window.setTimeout(() => {
      const next = (activeIndex + 1) % DEMOS.length;
      setActiveId(DEMOS[next].id);
    }, 2200);
    return () => window.clearTimeout(t);
  }, [phase, playing, inView, activeIndex]);

  // Sliding pill under vertical/horizontal scene tabs
  const syncPill = useCallback(() => {
    const list = tabListRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;
    const activeBtn = list.querySelector<HTMLButtonElement>(`[data-demo="${activeId}"]`);
    if (!activeBtn) return;
    const listRect = list.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    pill.style.width = `${btnRect.width}px`;
    pill.style.height = `${btnRect.height}px`;
    pill.style.transform = `translate(${btnRect.left - listRect.left}px, ${btnRect.top - listRect.top}px)`;
  }, [activeId]);

  useEffect(() => {
    const pill = pillRef.current;
    if (pill) pill.style.transition = "none";
    syncPill();
    // force reflow then restore transition
    void pill?.offsetWidth;
    if (pill) pill.style.transition = "";
    const onResize = () => syncPill();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncPill]);

  useEffect(() => {
    syncPill();
  }, [activeId, syncPill]);

  const handleCopy = () => {
    navigator.clipboard.writeText(scene.command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const selectDemo = (id: DemoId) => {
    setActiveId(id);
    setPlaying(true);
  };

  const Icon = scene.icon;
  const progress =
    phase === "typing"
      ? Math.min(0.35, (typed.length / Math.max(scene.command.length, 1)) * 0.35)
      : phase === "running"
        ? 0.35 + (visibleLines / Math.max(scene.lines.length, 1)) * 0.65
        : phase === "done"
          ? 1
          : 0;

  return (
    <section
      id="cli-guide"
      ref={sectionRef}
      className="cli-demo max-w-6xl mx-auto"
      aria-label="Interactive CLI demo"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-xs font-mono text-[#141413]">
            <Terminal className="w-3.5 h-3.5 text-[#cc785c]" aria-hidden="true" />
            <span>Live terminal demo</span>
          </div>
          <h2 className="font-serif-display text-4xl sm:text-5xl font-normal text-[#141413] tracking-tight leading-[1.1]">
            Watch what one command prints.
          </h2>
          <p className="text-base text-[#6c6a64] leading-relaxed">
            Pick a scene — the terminal types the command, then morphs the output like a product demo reel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://www.npmjs.com/package/qodewk"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 cursor-pointer bg-[#efe9de] hover:bg-[#e8e0d2] border border-[#e6dfd8] px-4 py-2.5 rounded-lg text-xs font-mono text-[#141413] transition-colors duration-200"
          >
            <span className="w-2 h-2 rounded-full bg-[#5db872]" />
            <span className="font-medium">qodewk@0.1.6</span>
            <span className="text-[#6c6a64]">on npm</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8e8b82]" aria-hidden="true" />
          </a>
          <a
            href="https://github.com/abushaidislam/Qodewk"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 cursor-pointer bg-[#181715] hover:bg-[#252320] text-white px-4 py-2.5 rounded-lg text-xs font-mono transition-colors duration-200"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#a09d96]" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Demo stage: scene rail + terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* Scene rail */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div
            ref={tabListRef}
            role="tablist"
            aria-label="CLI demos"
            className="cli-demo-tabs relative flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0"
          >
            <span ref={pillRef} className="cli-demo-pill" aria-hidden="true" />
            {DEMOS.map((demo) => {
              const DemoIcon = demo.icon;
              const selected = demo.id === activeId;
              return (
                <button
                  key={demo.id}
                  type="button"
                  role="tab"
                  data-demo={demo.id}
                  aria-selected={selected}
                  onClick={() => selectDemo(demo.id)}
                  className={`cli-demo-tab relative z-[1] cursor-pointer flex items-start gap-3 text-left px-4 py-3.5 rounded-xl border transition-colors duration-200 whitespace-nowrap lg:whitespace-normal min-w-[200px] lg:min-w-0 ${
                    selected
                      ? "border-transparent text-[#141413]"
                      : "border-[#e6dfd8] bg-[#faf9f5] text-[#3d3d3a] hover:bg-[#f5f0e8]"
                  }`}
                >
                  <span
                    className={`mt-0.5 w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border ${
                      selected
                        ? "bg-[#cc785c] text-white border-[#cc785c]"
                        : "bg-[#efe9de] text-[#6c6a64] border-[#e6dfd8]"
                    }`}
                  >
                    <DemoIcon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 space-y-0.5">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">{demo.name}</span>
                      {selected && (
                        <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#faf9f5]/80 text-[#6c6a64] border border-[#e6dfd8]">
                          {demo.badge}
                        </span>
                      )}
                    </span>
                    <span className="hidden lg:block text-xs text-[#6c6a64] leading-snug">
                      {demo.short} · <span className="font-mono text-[11px]">{demo.command}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="hidden lg:block text-sm text-[#6c6a64] leading-relaxed px-1 pt-2">
            {scene.description}
          </p>
        </div>

        {/* Terminal morph stage */}
        <div className="lg:col-span-8">
          <div className="cli-demo-stage bg-[#181715] text-[#faf9f5] rounded-2xl border border-[#252320] overflow-hidden flex flex-col min-h-[420px] md:min-h-[480px]">
            {/* Chrome */}
            <div className="px-4 sm:px-5 py-3.5 border-b border-[#252320] bg-[#1f1e1b] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c64545]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d4a017]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5db872]" />
                </div>
                <div className="flex items-center gap-2 min-w-0 pl-2 border-l border-[#252320]">
                  <Icon className="w-3.5 h-3.5 text-[#cc785c] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-mono text-[#a09d96] truncate">
                    demo — {scene.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="cursor-pointer p-2 rounded-lg text-[#a09d96] hover:text-[#faf9f5] hover:bg-[#252320] transition-colors duration-200"
                  aria-label={playing ? "Pause demo" : "Play demo"}
                  title={playing ? "Pause" : "Play"}
                >
                  {playing ? (
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(true);
                    replay();
                  }}
                  className="cursor-pointer p-2 rounded-lg text-[#a09d96] hover:text-[#faf9f5] hover:bg-[#252320] transition-colors duration-200"
                  aria-label="Replay demo"
                  title="Replay"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="cursor-pointer inline-flex items-center gap-1.5 ml-1 px-2.5 py-1.5 rounded-lg bg-[#181715] border border-[#252320] text-[11px] font-mono text-[#a09d96] hover:text-[#faf9f5] transition-colors duration-200"
                  title="Copy command"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#5db872]" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">copy</span>
                </button>
              </div>
            </div>

            {/* Progress morph bar */}
            <div className="h-0.5 bg-[#252320]" aria-hidden="true">
              <div
                className="cli-demo-progress h-full bg-[#cc785c]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Status strip */}
            <div className="px-4 sm:px-5 py-2.5 border-b border-[#252320] flex items-center justify-between gap-3 text-[11px] font-mono text-[#a09d96]">
              <p className="line-clamp-1 lg:hidden">{scene.description}</p>
              <p className="hidden lg:block line-clamp-1">
                {phase === "typing" && "Typing command…"}
                {phase === "running" && "Streaming output…"}
                {phase === "done" && "Demo complete — advancing next scene"}
                {phase === "idle" && "Ready"}
              </p>
              <div className="flex items-center gap-1.5 text-[#5db872] whitespace-nowrap shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Zero source upload</span>
              </div>
            </div>

            {/* Terminal body */}
            <div className="relative flex-1 p-4 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-relaxed overflow-hidden">
              <div
                key={scene.id}
                className="cli-demo-morph absolute inset-0 p-4 sm:p-6 overflow-y-auto"
              >
                {/* Prompt + typed command */}
                <div className="flex items-start gap-2 mb-4 text-[#faf9f5]">
                  <span className="text-[#5db8a6] select-none">➜</span>
                  <span className="text-[#8e8b82] select-none">~</span>
                  <span>
                    <span className="text-[#faf9f5]">{typed}</span>
                    {(phase === "typing" || phase === "idle") && (
                      <span className="cli-demo-caret" aria-hidden="true" />
                    )}
                  </span>
                </div>

                {/* Streamed lines */}
                {visibleLines > 0 && (
                  <div className="space-y-0.5 text-[#a09d96]" aria-live="polite">
                    {scene.lines.slice(0, visibleLines).map((line, i) => {
                      const isLatest = i === visibleLines - 1 && phase === "running";
                      const isPrompt = line.startsWith("$");
                      const isSuccess = line.startsWith("✓") || line.includes("[✓]");
                      const isMeta = line.startsWith("[") && line.includes("/");
                      return (
                        <div
                          key={`${scene.id}-${i}`}
                          className={`cli-demo-line ${isLatest ? "is-fresh" : "is-in"} ${
                            isPrompt ? "text-[#faf9f5]" : ""
                          } ${isSuccess ? "text-[#5db872]" : ""} ${isMeta ? "text-[#e8a55a]" : ""}`}
                        >
                          {line === "" ? "\u00A0" : line}
                        </div>
                      );
                    })}
                    {phase === "running" && <span className="cli-demo-caret mt-1" aria-hidden="true" />}
                  </div>
                )}

                {phase === "idle" && !typed && (
                  <p className="text-[#6c6a64] text-xs mt-2">Press play or pick a scene to start the demo.</p>
                )}
              </div>
            </div>

            {/* Scene dots */}
            <div className="px-5 py-3 border-t border-[#252320] bg-[#1f1e1b] flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {DEMOS.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => selectDemo(d.id)}
                    className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                      i === activeIndex ? "w-5 bg-[#cc785c]" : "w-1.5 bg-[#252320] hover:bg-[#a09d96]"
                    }`}
                    aria-label={`Show ${d.name}`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-[#6c6a64] tabular-nums">
                {String(activeIndex + 1).padStart(2, "0")} / {String(DEMOS.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spec footnotes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-xs">
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-4 space-y-1">
          <span className="font-mono uppercase text-[#cc785c] font-medium text-[11px] tracking-[1px]">
            Zero install
          </span>
          <p className="text-[#3d3d3a] leading-relaxed">
            Run via{" "}
            <code className="font-mono bg-[#faf9f5] px-1 py-0.5 rounded border border-[#e6dfd8]">
              npx qodewk
            </code>{" "}
            on Node.js 18+ — no global install, no signup.
          </p>
        </div>
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-4 space-y-1">
          <span className="font-mono uppercase text-[#5db8a6] font-medium text-[11px] tracking-[1px]">
            Hardened privacy
          </span>
          <p className="text-[#3d3d3a] leading-relaxed">
            Diff bodies stay local. Public receipts ship salted hashes and aggregate counts only.
          </p>
        </div>
        <div className="bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-4 space-y-1">
          <span className="font-mono uppercase text-[#e8a55a] font-medium text-[11px] tracking-[1px]">
            Universal agents
          </span>
          <p className="text-[#3d3d3a] leading-relaxed">
            Claude Code, Cursor, Copilot, Windsurf — plus plain Git when telemetry is missing.
          </p>
        </div>
      </div>
    </section>
  );
}
