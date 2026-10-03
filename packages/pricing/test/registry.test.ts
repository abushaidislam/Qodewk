import { describe, it, expect, beforeEach } from "vitest";
import {
  getRateCard,
  RATE_CARDS,
  sanitizeRateCards,
  updatePricingRegistry,
  resetPricingRegistry
} from "../src/index.js";

const card = (over: Record<string, unknown> = {}) => ({
  id: "x",
  provider: "google",
  name: "X",
  inputPerMTok: 1,
  outputPerMTok: 2,
  cacheReadPerMTok: 0.1,
  cacheWritePerMTok: 1,
  contextWindow: 1000,
  ...over
});

describe("dynamic pricing registry", () => {
  beforeEach(() => resetPricingRegistry());

  it("sanitizeRateCards keeps valid cards", () => {
    const out = sanitizeRateCards({ a: card() });
    expect(out.a?.inputPerMTok).toBe(1);
  });

  it("rejects NaN, negative, string, infinite and absurd prices", () => {
    const out = sanitizeRateCards({
      nan: card({ inputPerMTok: NaN }),
      neg: card({ outputPerMTok: -1 }),
      str: card({ cacheReadPerMTok: "1" }),
      inf: card({ inputPerMTok: Infinity }),
      huge: card({ inputPerMTok: 1_000_000 }),
      missing: { id: "m" },
      nul: null
    });
    expect(Object.keys(out)).toHaveLength(0);
  });

  it("returns empty for non-object input", () => {
    expect(sanitizeRateCards(null)).toEqual({});
    expect(sanitizeRateCards("x")).toEqual({});
    expect(sanitizeRateCards(42)).toEqual({});
  });

  it("falls back to generic provider and default context for bad metadata", () => {
    const out = sanitizeRateCards({ a: card({ provider: "evil", contextWindow: -5 }) });
    expect(out.a?.provider).toBe("generic");
    expect(out.a?.contextWindow).toBe(128_000);
  });

  it("dynamic card overrides built-in card of same key", () => {
    updatePricingRegistry({ "gpt-4o": card({ inputPerMTok: 9 }) } as never);
    expect(getRateCard("gpt-4o").inputPerMTok).toBe(9);
    resetPricingRegistry();
    expect(getRateCard("gpt-4o").inputPerMTok).toBe(RATE_CARDS["gpt-4o"]!.inputPerMTok);
  });

  it("invalid dynamic card never overrides built-ins", () => {
    updatePricingRegistry({ "gpt-4o": card({ inputPerMTok: -3 }) } as never);
    expect(getRateCard("gpt-4o")).toEqual(RATE_CARDS["gpt-4o"]);
  });

  it("dynamic aliases resolve case-insensitively", () => {
    updatePricingRegistry({ "new-model": card({ inputPerMTok: 7 }) } as never, { "Fancy-Name": "new-model" });
    expect(getRateCard("fancy-name").inputPerMTok).toBe(7);
  });
});

describe("new model fallbacks (never the expensive default)", () => {
  it("Gemini 3.1 Pro maps to Gemini pro tier", () => {
    expect(getRateCard("gemini-3-1-pro")).toEqual(RATE_CARDS["gemini-2-5-pro"]);
  });

  it("future Sonnet generations map to the Sonnet tier", () => {
    expect(getRateCard("claude-sonnet-5-5")).toEqual(RATE_CARDS["claude-sonnet-4-6-thinking"]);
  });

  it("haiku variants map to Haiku", () => {
    expect(getRateCard("claude-haiku-9")).toEqual(RATE_CARDS["claude-3-5-haiku"]);
  });

  it("unknown model still returns default", () => {
    expect(getRateCard("totally-unknown-xyz")).toEqual(RATE_CARDS["default"]);
  });
});
