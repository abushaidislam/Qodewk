import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import { syncDynamicPricing } from "../src/pricing-sync.js";
import { getRateCard, resetPricingRegistry } from "@qodewk/pricing";

// Advanced Mocking for isolated testing
vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    statSync: vi.fn(),
    readFileSync: vi.fn(),
    promises: {
      writeFile: vi.fn().mockResolvedValue(undefined)
    }
  },
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  statSync: vi.fn(),
  readFileSync: vi.fn(),
  promises: {
    writeFile: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock("node:os", () => ({
  default: {
    homedir: vi.fn().mockReturnValue("/mock/home")
  },
  homedir: vi.fn().mockReturnValue("/mock/home")
}));

describe("Advanced Dynamic Pricing Sync", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
    (os.homedir as any).mockReturnValue("/mock/home");
    (fs.existsSync as any).mockReturnValue(false); // Default: No dir, no cache
    
    // Clear out dynamic registry to avoid state leakage between tests
    resetPricingRegistry();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  it("should gracefully handle network failure (Silent Fallback) without crashing", async () => {
    // Simulate airplane mode / offline
    (global.fetch as any).mockRejectedValue(new Error("Network Error"));
    
    // Should NOT throw an error
    await expect(syncDynamicPricing({ timeoutMs: 100 })).resolves.not.toThrow();
  });

  it("should fetch remote rates, update registry, and trigger async cache save on Cache Miss", async () => {
    const fakeRemoteData = {
      rates: {
        "future-gpt-10": { inputPerMTok: 1.0, outputPerMTok: 2.0, cacheReadPerMTok: 0.5, cacheWritePerMTok: 1.0 }
      },
      aliases: {
        "gpt-10-alias": "future-gpt-10"
      }
    };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => fakeRemoteData
    });

    await syncDynamicPricing();

    // 1. Assert network was called
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // 2. Assert pricing registry was successfully updated dynamically!
    const rateCard = getRateCard("gpt-10-alias");
    expect(rateCard).toBeDefined();
    expect(rateCard.inputPerMTok).toBe(1.0);
    expect(rateCard.outputPerMTok).toBe(2.0);

    // 3. Assert fire-and-forget file write was triggered
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("pricing_registry_cache.json"),
      expect.any(String),
      "utf-8"
    );
  });

  it("should use the local filesystem cache if within the 24-hour TTL (Offline-first / Zero Latency)", async () => {
    // Mock that the cache file exists
    (fs.existsSync as any).mockImplementation((pathStr: string) => pathStr.endsWith(".json"));
    
    // Mock that the file was modified 1 minute ago (Fresh!)
    const ONE_MINUTE_AGO = Date.now() - 60 * 1000;
    (fs.statSync as any).mockReturnValue({ mtimeMs: ONE_MINUTE_AGO });
    
    // Mock file content
    (fs.readFileSync as any).mockReturnValue(JSON.stringify({
      rates: { "cached-fast-model": { inputPerMTok: 0.05, outputPerMTok: 0.15, cacheReadPerMTok: 0.01, cacheWritePerMTok: 0.05 } }
    }));

    await syncDynamicPricing();
    
    // THE MAGIC: It should NOT call the network!
    expect(global.fetch).not.toHaveBeenCalled();
    
    // But the registry should still have the cached rates!
    const rateCard = getRateCard("cached-fast-model");
    expect(rateCard.inputPerMTok).toBe(0.05);
  });

  it("should ignore cache and fetch network if force=true is passed", async () => {
    // Setup valid cache
    (fs.existsSync as any).mockImplementation((p: string) => p.endsWith(".json"));
    (fs.statSync as any).mockReturnValue({ mtimeMs: Date.now() - 1000 });
    (fs.readFileSync as any).mockReturnValue(JSON.stringify({ rates: {} }));
    
    // Setup network response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { "forced-model": { inputPerMTok: 99, outputPerMTok: 99, cacheReadPerMTok: 9, cacheWritePerMTok: 9 } } })
    });

    // Pass force: true
    await syncDynamicPricing({ force: true });
    
    // It should skip cache and hit the network
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(getRateCard("forced-model").inputPerMTok).toBe(99);
  });
});

