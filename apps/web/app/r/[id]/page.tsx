import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReceiptV1 } from "@qodewk/protocol";
import { getReceiptFromStore } from "@/lib/storage";
import { DEMO_RECEIPTS } from "@/lib/demo-receipts";
import { createMetadata } from "@/lib/metadata";
import { ReceiptClient } from "./receipt-client";

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
    return createMetadata({
      title: "Receipt Not Found — Qodewk",
      description: "This digital receipt could not be found or has expired."
    });
  }

  const title = `Qodewk Receipt: ${receipt.repository.projectAlias} (+${receipt.mutation.insertions} / -${receipt.mutation.deletions})`;
  const description = `Digital proof of shipment for ${receipt.repository.projectAlias} (${receipt.mutation.files} files touched, est. AI cost: ~$${receipt.ai.cost.toFixed(2)}). Source code was not uploaded.`;
  const ogUrl = `/api/og/${receipt.receipt.id}`;

  return createMetadata({
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
  });
}

export default async function ReceiptPage({ params }: PageProps) {
  const { id } = await params;
  const receipt = await resolveReceipt(id);

  if (!receipt) {
    notFound();
  }

  return <ReceiptClient receipt={receipt} />;
}
