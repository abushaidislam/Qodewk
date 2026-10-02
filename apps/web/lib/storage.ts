import { ReceiptV1 } from "@qodewk/protocol";

// Global in-memory cache for development and serverless invocations within the same container
declare global {
  // eslint-disable-next-line no-var
  var __qodewk_receipts_store__: Map<string, { receipt: ReceiptV1; claimTokenHash: string; createdAt: string }> | undefined;
}

if (!globalThis.__qodewk_receipts_store__) {
  globalThis.__qodewk_receipts_store__ = new Map();
}

const memoryStore = globalThis.__qodewk_receipts_store__;

/**
 * Returns true if durable storage credentials (Supabase) are provided in environment.
 */
export function isDurableStoreConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
}

/**
 * Saves a receipt either to Supabase (if configured) or in-memory store.
 * In production, durable storage is strictly required to prevent serverless cold-start receipt loss.
 * Uses zero-native fetch to remain 100% compatible with Edge & Serverless runtimes.
 */
export async function saveReceiptToStore(receipt: ReceiptV1, claimTokenHash: string): Promise<void> {
  // Always update memory store
  memoryStore.set(receipt.receipt.id, {
    receipt,
    claimTokenHash,
    createdAt: receipt.receipt.createdAt || new Date().toISOString()
  });

  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (isProduction && (!supabaseUrl || !supabaseKey)) {
    throw new Error(
      "Durable storage is required in production. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) to ensure public receipts persist across serverless instances."
    );
  }

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/receipts`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({
          public_id: receipt.receipt.id,
          project_alias: receipt.repository.projectAlias,
          repo_hash: receipt.repository.repoHash,
          branch_hash: receipt.repository.branchHash || null,
          files_changed: receipt.mutation.files,
          insertions: receipt.mutation.insertions,
          deletions: receipt.mutation.deletions,
          estimated_tokens: receipt.ai.tokens.input + receipt.ai.tokens.output,
          estimated_cost: receipt.ai.cost,
          provider: receipt.ai.provider,
          model: receipt.ai.model || null,
          confidence: receipt.ai.confidence,
          payload_json: receipt,
          claim_token_hash: claimTokenHash,
          is_public: receipt.privacy.isPublic ?? true
        })
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        const errMsg = `Supabase insert failed with status ${res.status}: ${errorText}`;
        if (isProduction) {
          throw new Error(`Failed to persist receipt to durable storage: ${errMsg}`);
        }
        console.warn(`[Qodewk Storage] ${errMsg}`);
      }
    } catch (err: any) {
      if (isProduction) {
        throw err;
      }
      console.warn(`[Qodewk Storage] Supabase sync failed: ${err.message}`);
    }
  }
}

/**
 * Retrieves a receipt by public ID from memory or Supabase.
 */
export async function getReceiptFromStore(id: string): Promise<ReceiptV1 | null> {
  // 1. Check memory store
  if (memoryStore.has(id)) {
    return memoryStore.get(id)!.receipt;
  }

  // 2. Check Supabase REST API if configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl.replace(/\/$/, "")}/rest/v1/receipts?public_id=eq.${encodeURIComponent(id)}&select=payload_json&limit=1`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Accept": "application/json"
          },
          next: { revalidate: 60 }
        }
      );

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0].payload_json) {
          const receipt = rows[0].payload_json as ReceiptV1;
          memoryStore.set(id, {
            receipt,
            claimTokenHash: "",
            createdAt: receipt.receipt.createdAt
          });
          return receipt;
        }
      }
    } catch (err: any) {
      console.warn(`[Qodewk Storage] Supabase fetch failed: ${err.message}`);
    }
  }

  return null;
}
