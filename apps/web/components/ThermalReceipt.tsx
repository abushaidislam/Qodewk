"use client";

import React, { useState } from "react";
import type { ReceiptV1 } from "@qodewk/protocol";
import { Check, Copy, Share2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThermalReceiptProps {
  receipt: ReceiptV1;
  showActions?: boolean;
}

export function ThermalReceipt({ receipt, showActions = true }: ThermalReceiptProps) {
  const [copied, setCopied] = useState(false);

  const totalTokens = (receipt.ai.tokens.input + receipt.ai.tokens.output).toLocaleString();
  const inputK = `${Math.round(receipt.ai.tokens.input / 1000)}k`;
  const outputK = `${Math.round(receipt.ai.tokens.output / 1000)}k`;
  const cachedK = `${Math.round(receipt.ai.tokens.cached / 1000)}k`;
  const costPrefix = receipt.ai.mode === "verified" ? "$" : "~$";
  const confidencePercent = `${Math.round(receipt.ai.confidence * 100)}%`;

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.QODEWK_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  ).replace(/\/$/, "");
  const publicUrl = `${baseUrl}/r/${receipt.receipt.id}`;

  const copyMarkdown = () => {
    const md = `### 🤖 Qodewk Receipt
\`\`\`text
Files Changed:     ${receipt.mutation.files}
Lines Inserted:    +${receipt.mutation.insertions}
Lines Deleted:     -${receipt.mutation.deletions}
Net Code Delta:    ${receipt.mutation.netLines >= 0 ? "+" : ""}${receipt.mutation.netLines}
AI Provider:       ${receipt.ai.provider} (${receipt.ai.model || "Unknown"})
Estimated Tokens:  ~${totalTokens}
Estimated Cost:    ${costPrefix}${receipt.ai.cost.toFixed(2)} (${confidencePercent} confidence)
\`\`\`
[✓] Source code was not uploaded to Qodewk.
[View Verified Receipt](${publicUrl})`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Receipt Container with Drop Shadow */}
      <div className="w-full max-w-[380px] relative select-none filter drop-shadow-md">
        
        {/* Top Serrated Edge (ZIG-ZAG TEETH pointing upwards) */}
        <div className="w-full overflow-hidden h-3 text-card">
          <svg className="w-full h-3" preserveAspectRatio="none" viewBox="0 0 400 12">
            <polygon
              fill="currentColor"
              points="0,12 10,0 20,12 30,0 40,12 50,0 60,12 70,0 80,12 90,0 100,12 110,0 120,12 130,0 140,12 150,0 160,12 170,0 180,12 190,0 200,12 210,0 220,12 230,0 240,12 250,0 260,12 270,0 280,12 290,0 300,12 310,0 320,12 330,0 340,12 350,0 360,12 370,0 380,12 390,0 400,12"
            />
          </svg>
        </div>

        {/* Receipt Body — Uses Semantic Tokens (bg-card, text-card-foreground) */}
        <div className="w-full bg-card text-card-foreground border-x border-foreground/15 px-5 sm:px-6 py-5 font-mono text-[12px] sm:text-[13px] space-y-4">
          
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-foreground/15 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-widest text-foreground/50 font-medium">
              Universal Telemetry Layer
            </div>
            <h2 className="text-2xl font-bold font-mono tracking-widest text-foreground">
              Q O D E W K
            </h2>
            <div className="text-[11px] font-mono font-semibold text-primary tracking-wider">
              *** PROOF OF SHIPMENT ***
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="py-2 text-[12px] space-y-1.5 border-b border-dashed border-foreground/15">
            <div className="flex justify-between items-center">
              <span className="text-foreground/50">ORDER #:</span>
              <span className="font-medium text-foreground">{receipt.receipt.id.slice(0, 16)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/50">DATE:</span>
              <span className="text-foreground/80">{receipt.receipt.createdAt.slice(0, 10)} {receipt.receipt.createdAt.slice(11, 16)} UTC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/50">REPO:</span>
              <span className="font-medium text-foreground truncate max-w-[200px]">{receipt.repository.projectAlias}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/50">BRANCH:</span>
              <span className="font-medium text-foreground truncate max-w-[200px]">{receipt.repository.branch}</span>
            </div>
          </div>

          {/* Mutation Items */}
          <div className="py-2 border-b border-dashed border-foreground/15 text-[13px]">
            <div className="flex justify-between text-[10px] text-foreground/50 uppercase tracking-wider mb-2">
              <span>MUTATION ITEM</span>
              <span>METRIC</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-foreground/75">Files Touched</span>
                <span className="font-medium text-foreground">{receipt.mutation.files}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/75">Lines Inserted</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+{receipt.mutation.insertions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/75">Lines Deleted</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">-{receipt.mutation.deletions}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-foreground/10">
                <span className="font-medium text-foreground">Net Delta</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {receipt.mutation.netLines >= 0 ? "+" : ""}{receipt.mutation.netLines} lines
                </span>
              </div>
            </div>
          </div>

          {/* AI Consumption Telemetry */}
          <div className="py-2 border-b border-dashed border-foreground/15 text-[12px] space-y-1.5">
            <div className="text-[10px] text-foreground/50 uppercase tracking-wider font-semibold flex justify-between items-center mb-1">
              <span>AI AGENT TELEMETRY</span>
              <span className="capitalize text-foreground/70">{receipt.ai.mode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/60">Tool / Provider:</span>
              <span className="font-medium text-foreground capitalize">{receipt.ai.provider}</span>
            </div>
            {receipt.ai.model && (
              <div className="flex justify-between items-center">
                <span className="text-foreground/60">Model Basis:</span>
                <span className="font-medium text-foreground">{receipt.ai.model}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-foreground/60">Input Tokens:</span>
              <span className="text-foreground/80">{inputK} <span className="text-[11px] text-foreground/50">({cachedK} cached)</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground/60">Output Tokens:</span>
              <span className="text-foreground/80">{outputK}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-foreground/10 font-medium">
              <span className="text-foreground">Total Est. Tokens:</span>
              <span className="text-foreground">{totalTokens}</span>
            </div>
            {receipt.ai.sessions && receipt.ai.sessions.length > 0 && (
              <div className="pt-2 border-t border-dashed border-foreground/15 space-y-1.5">
                <div className="text-[10px] text-foreground/50 uppercase tracking-wider font-semibold flex justify-between items-center mb-1">
                  <span>ITEMIZED SESSIONS ({receipt.ai.sessions.length})</span>
                  <span>COST</span>
                </div>
                {receipt.ai.sessions.slice(0, 5).map((session, idx) => {
                  const sTitle = session.task
                    ? (session.task.length > 20 ? session.task.slice(0, 19) + "…" : session.task)
                    : (session.sessionId ? "#" + session.sessionId.slice(0, 8) : session.provider);
                  const sModel = (session.model || session.provider).replace(/^(claude-|gemini-|gpt-)/, "");
                  const sCostPrefix = session.mode === "verified" ? "$" : "~$";
                  return (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <div className="flex items-center space-x-1.5 truncate max-w-[210px]">
                        <span className="text-foreground/80 truncate">• {sTitle}</span>
                        <span className="text-[10px] text-foreground/40 font-mono">({sModel})</span>
                      </div>
                      <span className="font-mono font-medium text-foreground">
                        {sCostPrefix}{session.cost.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {receipt.ai.sessions.length > 5 && (
                  <div className="text-[10px] text-foreground/40 italic pt-0.5">
                    + {receipt.ai.sessions.length - 5} more sessions
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Total Cost Box */}
          <div className="py-3 px-4 my-2 border-y-2 border-foreground/20 bg-foreground/[0.02] rounded-xs flex justify-between items-baseline">
            <div>
              <div className="text-[10px] text-foreground/50 uppercase font-mono font-bold tracking-wider">
                {receipt.ai.mode === "verified" ? "VERIFIED AI COST" : "ESTIMATED AI COST"}
              </div>
              <div className="text-[10px] text-foreground/60 font-mono mt-0.5">
                Confidence: {confidencePercent}
              </div>
            </div>
            <div className="text-2xl font-mono font-bold text-primary tabular-nums tracking-tight">
              {costPrefix}{receipt.ai.cost.toFixed(2)}
            </div>
          </div>

          {/* Dynamic Barcode — Uses currentColor for high contrast in light & dark */}
          <div className="pt-2 text-center text-foreground">
            <div className="flex justify-center items-center py-2 h-11 overflow-hidden">
              <svg className="w-56 h-10" viewBox="0 0 240 40">
                <rect x="0" y="0" width="3" height="40" fill="currentColor" />
                <rect x="5" y="0" width="1" height="40" fill="currentColor" />
                <rect x="8" y="0" width="4" height="40" fill="currentColor" />
                <rect x="15" y="0" width="2" height="40" fill="currentColor" />
                <rect x="19" y="0" width="1" height="40" fill="currentColor" />
                <rect x="23" y="0" width="3" height="40" fill="currentColor" />
                <rect x="28" y="0" width="5" height="40" fill="currentColor" />
                <rect x="36" y="0" width="2" height="40" fill="currentColor" />
                <rect x="40" y="0" width="1" height="40" fill="currentColor" />
                <rect x="44" y="0" width="4" height="40" fill="currentColor" />
                <rect x="50" y="0" width="2" height="40" fill="currentColor" />
                <rect x="55" y="0" width="3" height="40" fill="currentColor" />
                <rect x="61" y="0" width="1" height="40" fill="currentColor" />
                <rect x="65" y="0" width="5" height="40" fill="currentColor" />
                <rect x="73" y="0" width="2" height="40" fill="currentColor" />
                <rect x="78" y="0" width="3" height="40" fill="currentColor" />
                <rect x="84" y="0" width="1" height="40" fill="currentColor" />
                <rect x="88" y="0" width="4" height="40" fill="currentColor" />
                <rect x="94" y="0" width="2" height="40" fill="currentColor" />
                <rect x="99" y="0" width="3" height="40" fill="currentColor" />
                <rect x="105" y="0" width="5" height="40" fill="currentColor" />
                <rect x="113" y="0" width="1" height="40" fill="currentColor" />
                <rect x="117" y="0" width="3" height="40" fill="currentColor" />
                <rect x="123" y="0" width="2" height="40" fill="currentColor" />
                <rect x="128" y="0" width="4" height="40" fill="currentColor" />
                <rect x="135" y="0" width="2" height="40" fill="currentColor" />
                <rect x="140" y="0" width="1" height="40" fill="currentColor" />
                <rect x="144" y="0" width="5" height="40" fill="currentColor" />
                <rect x="152" y="0" width="3" height="40" fill="currentColor" />
                <rect x="158" y="0" width="1" height="40" fill="currentColor" />
                <rect x="162" y="0" width="4" height="40" fill="currentColor" />
                <rect x="168" y="0" width="2" height="40" fill="currentColor" />
                <rect x="173" y="0" width="3" height="40" fill="currentColor" />
                <rect x="179" y="0" width="5" height="40" fill="currentColor" />
                <rect x="187" y="0" width="2" height="40" fill="currentColor" />
                <rect x="192" y="0" width="1" height="40" fill="currentColor" />
                <rect x="196" y="0" width="4" height="40" fill="currentColor" />
                <rect x="203" y="0" width="2" height="40" fill="currentColor" />
                <rect x="208" y="0" width="3" height="40" fill="currentColor" />
                <rect x="214" y="0" width="1" height="40" fill="currentColor" />
                <rect x="218" y="0" width="5" height="40" fill="currentColor" />
                <rect x="226" y="0" width="2" height="40" fill="currentColor" />
                <rect x="231" y="0" width="4" height="40" fill="currentColor" />
              </svg>
            </div>
            <div className="text-[10px] text-foreground/50 tracking-wider truncate max-w-full px-2">
              {publicUrl}
            </div>
          </div>

          {/* Zero Exfiltration Trust Guarantee */}
          <div className="pt-2 text-center text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 inline" />
            <span>Source code was never uploaded to Qodewk</span>
          </div>
        </div>

        {/* Bottom Serrated Edge (ZIG-ZAG TEETH pointing downwards) */}
        <div className="w-full overflow-hidden h-3 text-card">
          <svg className="w-full h-3" preserveAspectRatio="none" viewBox="0 0 400 12">
            <polygon
              fill="currentColor"
              points="0,0 10,12 20,0 30,12 40,0 50,12 60,0 70,12 80,0 90,12 100,0 110,12 120,0 130,12 140,0 150,12 160,0 170,12 180,0 190,12 200,0 210,12 220,0 230,12 240,0 250,12 260,0 270,12 280,0 290,12 300,0 310,12 320,0 330,12 340,0 350,12 360,0 370,12 380,0 390,12 400,0"
            />
          </svg>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={copyMarkdown}
            className="flex items-center gap-2 bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-sm text-xs font-mono font-medium transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Markdown!" : "Copy PR Markdown"}</span>
          </button>

          <a
            href={`/api/og/${receipt.receipt.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-background hover:bg-foreground/5 text-foreground border border-foreground/15 px-4 py-2 rounded-sm text-xs font-mono transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-primary" />
            <span>Open OG Card</span>
          </a>
        </div>
      )}
    </div>
  );
}
