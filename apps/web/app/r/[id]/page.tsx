import React from "react";
import { notFound } from "next/navigation";
import { ThermalReceipt } from "@/components/ThermalReceipt";
import { ReceiptV1 } from "@qodewk/protocol";
import { ArrowLeft, GitBranch, GitCommit, Shield } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

// In-memory / ephemeral store for MVP demonstration
const sampleReceipt: ReceiptV1 = {
  version: "1.0",
  receipt: {
    id: "rec_demo_7f8b2c1e4d3a",
    createdAt: new Date().toISOString(),
    contentHash: "b53f0fad4c7eb3669a54111b4590d5b0ad094000242608c8f3a1167f6d179426"
  },
  repository: {
    repoHash: "1aae43678eec89514114cd1c1ccdec3ae6a6dedb5686d487e8afe7a2c28823df",
    projectAlias: "qodewk-core",
    branch: "main",
    headSha: "7f8b2c1e4d3a5f6e7d8c9b0a1f2e3d4c5b6a7f8e",
    commitsCount: 1
  },
  mutation: {
    files: 14,
    insertions: 381,
    deletions: 72,
    netLines: 309,
    renames: 1,
    languages: {
      "TypeScript": 85,
      "Markdown": 15
    }
  },
  ai: {
    provider: "anthropic",
    model: "claude-3-7-sonnet",
    tokens: {
      input: 120000,
      output: 63000,
      cached: 72000
    },
    cost: 2.41,
    mode: "estimated",
    confidence: 0.74,
    sessions: [
      {
        provider: "anthropic",
        model: "claude-3-7-sonnet",
        tokens: { input: 120000, output: 63000, cached: 72000 },
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

export default async function ReceiptPage({ params }: PageProps) {
  const { id } = await params;

  // Use sample receipt if demo or matching ID
  const receipt = {
    ...sampleReceipt,
    receipt: {
      ...sampleReceipt.receipt,
      id
    }
  };

  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#6c6a64] hover:text-[#141413] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Qodewk</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-[#8e8b82] bg-[#efe9de] px-3 py-1 rounded-full border border-[#e6dfd8]">
            <Shield className="w-3.5 h-3.5 text-[#5db872]" />
            <span>Cryptographically Verified Receipt</span>
          </div>
        </div>

        {/* Receipt Display */}
        <div className="flex justify-center">
          <ThermalReceipt receipt={receipt} />
        </div>

        {/* Bottom Details Section */}
        <div className="mt-16 max-w-xl mx-auto bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-6 text-sm text-[#3d3d3a]">
          <h3 className="font-serif-display text-xl text-[#141413] mb-3">
            About This Receipt
          </h3>
          <p className="text-[#6c6a64] text-xs leading-relaxed mb-4">
            This digital receipt was generated locally by the Qodewk CLI. Git was used to observe the code mutations, and the pricing registry was used to calculate estimated model burn. No proprietary source code was exfiltrated during generation.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-[#141413] pt-3 border-t border-[#e6dfd8]">
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#cc785c]" />
              <span>{receipt.repository.branch}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-[#cc785c]" />
              <span>{receipt.repository.headSha.slice(0, 7)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
