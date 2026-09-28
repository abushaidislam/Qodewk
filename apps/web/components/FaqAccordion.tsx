"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Does Qodewk upload my source code?",
    a: "No. Diff bodies and raw source never leave your machine by default. Public receipts only carry metadata: file counts, line deltas, language ratios, token stats, costs, and salted HMAC hashes.",
  },
  {
    q: "How accurate are the dollar amounts?",
    a: "Every cost carries a provenance label — observed, estimated, imported, verified, or unknown — plus a 0.0–1.0 confidence float. Heuristic figures always show a ~ prefix. Qodewk never presents inference as exact billing.",
  },
  {
    q: "Which agents and editors are supported?",
    a: "Claude Code, Cursor, Windsurf, Copilot, and plain Git workflows. When provider telemetry is missing, the Git revision graph still produces a mutation receipt.",
  },
  {
    q: "Will Git hooks slow my commits?",
    a: "No. post-commit and post-rewrite hooks spawn detached background processes and exit immediately (target < 5ms). They coexist with Husky/Lefthook via boundary markers.",
  },
  {
    q: "Does local mode need a cloud account?",
    a: "Local terminal receipts and SQLite/Git Notes work fully offline. Cloud share is optional — sanitize, POST under a 50KB cap, and receive a public /r/[id] link.",
  },
] as const;

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[#e6dfd8] border border-[#e6dfd8] rounded-2xl overflow-hidden bg-[#faf9f5]">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="bg-[#faf9f5]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full cursor-pointer flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#f5f0e8] transition-colors duration-200"
            >
              <span className="font-medium text-[#141413] text-base pr-2">{item.q}</span>
              <span
                className={`shrink-0 w-8 h-8 rounded-lg border border-[#e6dfd8] flex items-center justify-center transition-colors duration-200 ${
                  isOpen ? "bg-[#cc785c] text-white border-[#cc785c]" : "bg-[#efe9de] text-[#6c6a64]"
                }`}
              >
                {isOpen ? (
                  <Minus className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Plus className="w-4 h-4" aria-hidden="true" />
                )}
              </span>
            </button>
            <div
              className={`faq-panel ${isOpen ? "is-open" : ""}`}
              role="region"
            >
              <div className="faq-panel-inner">
                <p className="px-6 pb-5 text-sm text-[#6c6a64] leading-relaxed max-w-3xl">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
