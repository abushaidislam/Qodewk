"use client";

import React, { useEffect, useState } from "react";
import { GitCommit, Binary, Receipt } from "lucide-react";

const STAGES = [
  {
    id: "git",
    label: "Git mutation",
    icon: GitCommit,
    title: "Diff is truth",
    body: "Hooks capture files, insertions, deletions, and language ratios from the revision graph — never from guesswork.",
    metric: "+381 / −72",
    metricLabel: "line delta",
  },
  {
    id: "telemetry",
    label: "Provider telemetry",
    icon: Binary,
    title: "Consume when available",
    body: "Harvest observed token streams from Claude Code, Cursor, Copilot, and Windsurf. Missing data stays labeled unknown.",
    metric: "183k",
    metricLabel: "tokens (est.)",
  },
  {
    id: "receipt",
    label: "Thermal receipt",
    icon: Receipt,
    title: "Proof of shipment",
    body: "Emit a local receipt with provenance mode, confidence float, and a privacy badge. Share only salted metadata.",
    metric: "~$2.41",
    metricLabel: "estimated cost",
  },
] as const;

export function MorphPipeline() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused) return;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % STAGES.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [paused]);

  const stage = STAGES[active];
  const Icon = stage.icon;

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="lg:col-span-5 space-y-3">
        {STAGES.map((s, i) => {
          const StageIcon = s.icon;
          const isActive = i === active;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              className={`w-full text-left cursor-pointer rounded-xl border p-5 transition-all duration-300 ${
                isActive
                  ? "bg-[#efe9de] border-[#cc785c]/40 shadow-[0_1px_3px_rgba(20,20,19,0.06)]"
                  : "bg-transparent border-[#e6dfd8] hover:bg-[#f5f0e8]"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center border transition-colors duration-300 ${
                    isActive
                      ? "bg-[#cc785c] text-white border-[#cc785c]"
                      : "bg-[#faf9f5] text-[#6c6a64] border-[#e6dfd8]"
                  }`}
                >
                  <StageIcon className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#8e8b82]">
                      0{i + 1}
                    </span>
                    <span className="text-sm font-medium text-[#141413]">{s.label}</span>
                  </div>
                  <p className="text-sm text-[#6c6a64] leading-relaxed">{s.body}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-7">
        <div className="relative h-full min-h-[320px] rounded-2xl bg-[#181715] border border-[#252320] overflow-hidden morph-stage-shell">
          <div className="absolute inset-0 morph-grain pointer-events-none opacity-40" />
          <div className="relative p-8 md:p-10 flex flex-col justify-between h-full gap-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#252320] border border-[#252320] flex items-center justify-center text-[#cc785c]">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#a09d96]">
                    Stage 0{active + 1} / 03
                  </p>
                  <h3 className="font-serif-display text-2xl md:text-3xl text-[#faf9f5] tracking-tight">
                    {stage.title}
                  </h3>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                {STAGES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === active ? "w-6 bg-[#cc785c]" : "w-1.5 bg-[#252320]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div
              key={stage.id}
              className="morph-panel space-y-6"
            >
              <p className="text-[#a09d96] text-sm md:text-base leading-relaxed max-w-md">
                {stage.body}
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="rounded-xl bg-[#1f1e1b] border border-[#252320] p-4">
                  <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#8e8b82] mb-2">
                    {stage.metricLabel}
                  </p>
                  <p className="font-mono text-2xl text-[#faf9f5] tabular-nums">{stage.metric}</p>
                </div>
                <div className="rounded-xl bg-[#1f1e1b] border border-[#252320] p-4">
                  <p className="text-[11px] font-mono uppercase tracking-[1.5px] text-[#8e8b82] mb-2">
                    provenance
                  </p>
                  <p className="font-mono text-sm text-[#5db8a6]">
                    {active === 0 ? "observed" : active === 1 ? "estimated" : "verified · ~"}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs font-mono text-[#6c6a64]">
              [✓] Source code was never uploaded to Qodewk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
