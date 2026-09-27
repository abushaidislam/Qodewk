"use client";

import React, { useState } from "react";
import { ReceiptV1 } from "@qodewk/protocol";
import { Check, Copy, Share2, ShieldCheck, Terminal } from "lucide-react";

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
[View Verified Receipt](https://qodewk.dev/r/${receipt.receipt.id})`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Receipt Container */}
      <div className="w-full max-w-[440px] paper-texture rounded-lg border border-[#e6dfd8] text-[#141413] font-mono-receipt p-6 md:p-8 relative select-none">
        
        {/* Jagged Saw-tooth Top Cut */}
        <div className="w-full overflow-hidden h-3 -mt-6 md:-mt-8 mb-4 opacity-70">
          <svg className="w-full h-3 text-[#faf9f5]" preserveAspectRatio="none" viewBox="0 0 400 12">
            <polygon fill="currentColor" points="0,0 10,12 20,0 30,12 40,0 50,12 60,0 70,12 80,0 90,12 100,0 110,12 120,0 130,12 140,0 150,12 160,0 170,12 180,0 190,12 200,0 210,12 220,0 230,12 240,0 250,12 260,0 270,12 280,0 290,12 300,0 310,12 320,0 330,12 340,0 350,12 360,0 370,12 380,0 390,12 400,0 400,0 0,0" />
          </svg>
        </div>

        {/* Header */}
        <div className="text-center pb-4 border-b border-dashed border-[#8e8b82]/40">
          <div className="text-xs uppercase tracking-widest text-[#8e8b82] mb-1 font-semibold">
            Universal Telemetry Layer
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#141413]">
            Q O D E W K
          </h2>
          <div className="text-[11px] font-semibold text-[#cc785c] tracking-wider mt-0.5">
            *** PROOF OF SHIPMENT ***
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="py-3 text-[12px] space-y-1 border-b border-dashed border-[#8e8b82]/40 text-[#3d3d3a]">
          <div className="flex justify-between">
            <span className="text-[#8e8b82]">ORDER #:</span>
            <span className="font-semibold">{receipt.receipt.id.slice(0, 16)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8e8b82]">DATE:</span>
            <span>{receipt.receipt.createdAt.slice(0, 10)} {receipt.receipt.createdAt.slice(11, 16)} UTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8e8b82]">REPO:</span>
            <span className="font-medium truncate max-w-[200px]">{receipt.repository.projectAlias}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8e8b82]">BRANCH:</span>
            <span className="font-medium truncate max-w-[200px]">{receipt.repository.branch}</span>
          </div>
        </div>

        {/* Mutation Items */}
        <div className="py-3 border-b border-dashed border-[#8e8b82]/40 text-[13px]">
          <div className="flex justify-between text-[11px] text-[#8e8b82] uppercase mb-2">
            <span>MUTATION ITEM</span>
            <span>METRIC</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>Files Touched</span>
              <span className="font-bold">{receipt.mutation.files}</span>
            </div>
            <div className="flex justify-between">
              <span>Lines Inserted</span>
              <span className="font-bold text-[#5db872]">+{receipt.mutation.insertions}</span>
            </div>
            <div className="flex justify-between">
              <span>Lines Deleted</span>
              <span className="font-bold text-[#c64545]">-{receipt.mutation.deletions}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#8e8b82]/20">
              <span className="font-medium">Net Delta</span>
              <span className="font-bold text-[#5db8a6]">
                {receipt.mutation.netLines >= 0 ? "+" : ""}{receipt.mutation.netLines} lines
              </span>
            </div>
          </div>
        </div>

        {/* AI Consumption Telemetry */}
        <div className="py-3 border-b border-dashed border-[#8e8b82]/40 text-[12px] space-y-1.5">
          <div className="text-[11px] text-[#8e8b82] uppercase mb-1 font-semibold flex justify-between">
            <span>AI AGENT TELEMETRY</span>
            <span className="capitalize">{receipt.ai.mode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6c6a64]">Tool / Provider:</span>
            <span className="font-medium text-[#141413] capitalize">{receipt.ai.provider}</span>
          </div>
          {receipt.ai.model && (
            <div className="flex justify-between">
              <span className="text-[#6c6a64]">Model Basis:</span>
              <span className="font-medium text-[#141413]">{receipt.ai.model}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#6c6a64]">Input Tokens:</span>
            <span>{inputK} <span className="text-[11px] text-[#8e8b82]">({cachedK} cached)</span></span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6c6a64]">Output Tokens:</span>
            <span>{outputK}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-[#8e8b82]/20 font-semibold">
            <span>Total Est. Tokens:</span>
            <span>{totalTokens}</span>
          </div>
        </div>

        {/* Total Cost Box */}
        <div className="py-4 my-2 border-y-2 border-[#141413] flex justify-between items-baseline">
          <div>
            <div className="text-[11px] text-[#8e8b82] uppercase font-bold tracking-wider">
              ESTIMATED AI COST
            </div>
            <div className="text-[10px] text-[#6c6a64] mt-0.5">
              Confidence: {confidencePercent}
            </div>
          </div>
          <div className="text-2xl font-black text-[#cc785c] tracking-tight">
            {costPrefix}{receipt.ai.cost.toFixed(2)}
          </div>
        </div>

        {/* Dynamic Barcode */}
        <div className="pt-3 pb-2 text-center">
          <div className="flex justify-center items-center py-2 h-12 overflow-hidden">
            {/* SVG Code 128 Barcode Simulation */}
            <svg className="w-56 h-10" viewBox="0 0 240 40">
              <rect x="0" y="0" width="3" height="40" fill="#141413" />
              <rect x="5" y="0" width="1" height="40" fill="#141413" />
              <rect x="8" y="0" width="4" height="40" fill="#141413" />
              <rect x="15" y="0" width="2" height="40" fill="#141413" />
              <rect x="19" y="0" width="1" height="40" fill="#141413" />
              <rect x="23" y="0" width="3" height="40" fill="#141413" />
              <rect x="28" y="0" width="5" height="40" fill="#141413" />
              <rect x="36" y="0" width="2" height="40" fill="#141413" />
              <rect x="40" y="0" width="1" height="40" fill="#141413" />
              <rect x="44" y="0" width="4" height="40" fill="#141413" />
              <rect x="50" y="0" width="2" height="40" fill="#141413" />
              <rect x="55" y="0" width="3" height="40" fill="#141413" />
              <rect x="61" y="0" width="1" height="40" fill="#141413" />
              <rect x="65" y="0" width="5" height="40" fill="#141413" />
              <rect x="73" y="0" width="2" height="40" fill="#141413" />
              <rect x="78" y="0" width="3" height="40" fill="#141413" />
              <rect x="84" y="0" width="1" height="40" fill="#141413" />
              <rect x="88" y="0" width="4" height="40" fill="#141413" />
              <rect x="94" y="0" width="2" height="40" fill="#141413" />
              <rect x="99" y="0" width="3" height="40" fill="#141413" />
              <rect x="105" y="0" width="5" height="40" fill="#141413" />
              <rect x="113" y="0" width="1" height="40" fill="#141413" />
              <rect x="117" y="0" width="3" height="40" fill="#141413" />
              <rect x="123" y="0" width="2" height="40" fill="#141413" />
              <rect x="128" y="0" width="4" height="40" fill="#141413" />
              <rect x="135" y="0" width="2" height="40" fill="#141413" />
              <rect x="140" y="0" width="1" height="40" fill="#141413" />
              <rect x="144" y="0" width="5" height="40" fill="#141413" />
              <rect x="152" y="0" width="3" height="40" fill="#141413" />
              <rect x="158" y="0" width="1" height="40" fill="#141413" />
              <rect x="162" y="0" width="4" height="40" fill="#141413" />
              <rect x="168" y="0" width="2" height="40" fill="#141413" />
              <rect x="173" y="0" width="3" height="40" fill="#141413" />
              <rect x="179" y="0" width="5" height="40" fill="#141413" />
              <rect x="187" y="0" width="2" height="40" fill="#141413" />
              <rect x="192" y="0" width="1" height="40" fill="#141413" />
              <rect x="196" y="0" width="4" height="40" fill="#141413" />
              <rect x="203" y="0" width="2" height="40" fill="#141413" />
              <rect x="208" y="0" width="3" height="40" fill="#141413" />
              <rect x="214" y="0" width="1" height="40" fill="#141413" />
              <rect x="218" y="0" width="5" height="40" fill="#141413" />
              <rect x="226" y="0" width="2" height="40" fill="#141413" />
              <rect x="231" y="0" width="4" height="40" fill="#141413" />
            </svg>
          </div>
          <div className="text-[10px] text-[#6c6a64] mt-0.5 tracking-wider">
            https://qodewk.dev/r/{receipt.receipt.id}
          </div>
        </div>

        {/* Zero Exfiltration Trust Guarantee */}
        <div className="pt-2 text-center text-[10px] text-[#5db872] flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 inline" />
          <span>Source code was never uploaded to Qodewk</span>
        </div>

        {/* Jagged Saw-tooth Bottom Cut */}
        <div className="w-full overflow-hidden h-3 -mb-6 md:-mb-8 mt-4 opacity-70">
          <svg className="w-full h-3 text-[#faf9f5]" preserveAspectRatio="none" viewBox="0 0 400 12">
            <polygon fill="currentColor" points="0,12 10,0 20,12 30,0 40,12 50,0 60,12 70,0 80,12 90,0 100,12 110,0 120,12 130,0 140,12 150,0 160,12 170,0 180,12 190,0 200,12 210,0 220,12 230,0 240,12 250,0 260,12 270,0 280,12 290,0 300,12 310,0 320,12 330,0 340,12 350,0 360,12 370,0 380,12 390,0 400,12 400,12 0,12" />
          </svg>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={copyMarkdown}
            className="flex items-center gap-2 bg-[#181715] hover:bg-[#252320] text-[#faf9f5] px-4 py-2 rounded-md text-xs font-mono transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#5db872]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Markdown!" : "Copy PR Markdown"}</span>
          </button>

          <a
            href={`/api/og/${receipt.receipt.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#efe9de] hover:bg-[#e8e0d2] text-[#141413] border border-[#e6dfd8] px-4 py-2 rounded-md text-xs font-mono transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#cc785c]" />
            <span>Open OG Card</span>
          </a>
        </div>
      )}
    </div>
  );
}
