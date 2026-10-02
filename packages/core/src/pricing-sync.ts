import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { updatePricingRegistry } from "@qodewk/pricing";

export interface PricingSyncOptions {
  force?: boolean;
  timeoutMs?: number;
}

/**
 * Dynamically fetches the latest AI model pricing registry from the cloud.
 * Implements an advanced offline-first caching mechanism with a 24-hour TTL.
 * Falls back silently to static hardcoded rates if offline or if the fetch fails.
 */
export async function syncDynamicPricing(options?: PricingSyncOptions): Promise<void> {
  try {
    const qodewkDir = path.join(os.homedir(), ".qodewk");
    if (!fs.existsSync(qodewkDir)) {
      fs.mkdirSync(qodewkDir, { recursive: true });
    }
    
    const cacheFile = path.join(qodewkDir, "pricing_registry_cache.json");
    const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    // 1. Check offline-first cache
    if (!options?.force && fs.existsSync(cacheFile)) {
      try {
        const stats = fs.statSync(cacheFile);
        if (now - stats.mtimeMs < TTL_MS) {
          const cachedData = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
          if (cachedData.rates) {
            updatePricingRegistry(cachedData.rates, cachedData.aliases);
          }
          return; // Cache is still fresh
        }
      } catch {
        // Corrupt cache, ignore and fetch
      }
    }

    // 2. Fetch fresh dynamic pricing registry
    const REMOTE_URL = process.env.QODEWK_PRICING_URL || "https://raw.githubusercontent.com/abushaidislam/Qodewk/master/registry/pricing.json";
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs || 2500);

    const response = await fetch(REMOTE_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = (await response.json()) as any;
      
      // Validate structure loosely
      if (data && typeof data === "object" && data.rates) {
        updatePricingRegistry(data.rates, data.aliases);
        
        // Save to cache asynchronously (fire-and-forget to avoid blocking)
        fs.promises.writeFile(cacheFile, JSON.stringify(data, null, 2), "utf-8").catch(() => {});
      }
    }
  } catch (error) {
    // Advanced optimization: Silent fallback. 
    // If user is on an airplane or has no internet, we just use the static @qodewk/pricing rates.
    // Do nothing.
  }
}
