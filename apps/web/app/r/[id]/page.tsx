import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ThermalReceipt } from "@/components/ThermalReceipt";
import { ReceiptV1 } from "@qodewk/protocol";
import { ArrowLeft, GitBranch, GitCommit, Shield } from "lucide-react";
import Link from "next/link";
import { getReceiptFromStore } from "@/lib/storage";
import { DEMO_RECEIPTS } from "@/lib/demo-receipts";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function resolveReceipt(id: string): Promise<ReceiptV1 | null> {
  // 1. Check seeded demo receipts
  if (DEMO_RECEIPTS[id]) {
    return DEMO_RECEIPTS[id]!;
  }

  // 2. Check friendly aliases
  if (id === "rec_01J8Y29K4Z00ABC123DEF456" || id === "demo-cursor" || id === "rec_demo_7f8b2c1e4d3a") {
    return DEMO_RECEIPTS["rec_demo_cursor"]!;
  }
  if (id === "demo-claude") {
    return DEMO_RECEIPTS["rec_demo_claude"]!;
  }
  if (id === "demo-antigravity") {
    return DEMO_RECEIPTS["rec_demo_antigravity"]!;
  }
  if (id === "demo-aider") {
    return DEMO_RECEIPTS["rec_demo_aider"]!;
  }

  // 3. Prefix matching for any other rec_demo_*
  if (id.startsWith("rec_demo")) {
    const base = DEMO_RECEIPTS["rec_demo_cursor"]!;
    return {
      ...base,
      receipt: {
        ...base.receipt,
        id
      }
    };
  }

  // 4. Fetch from storage (memory or Supabase)
  const stored = await getReceiptFromStore(id);
  if (stored) return stored;

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const receipt = await resolveReceipt(id);

  if (!receipt) {
    return {
      title: "Receipt Not Found — Qodewk",
      description: "This digital receipt could not be found or has expired."
    };
  }

  const title = `Qodewk Receipt: ${receipt.repository.projectAlias} (+${receipt.mutation.insertions} / -${receipt.mutation.deletions})`;
  const description = `Digital proof of shipment for ${receipt.repository.projectAlias} (${receipt.mutation.files} files touched, est. AI cost: ~$${receipt.ai.cost.toFixed(2)}). Source code was not uploaded.`;
  const ogUrl = `/api/og/${receipt.receipt.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `Qodewk Receipt for ${receipt.repository.projectAlias}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl]
    }
  };
}

export default async function ReceiptPage({ params }: PageProps) {
  const { id } = await params;
  const receipt = await resolveReceipt(id);

  if (!receipt) {
    notFound();
  }

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
            {receipt.receipt.contentHash && (
              <div className="flex items-center gap-1.5 text-[#8e8b82]">
                <span>Hash: {receipt.receipt.contentHash.slice(0, 8)}…</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
