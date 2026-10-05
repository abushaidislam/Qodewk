import { describe, it, expect } from "vitest";
import { RATE_CARDS, computeCost, getRateCard } from "@qodewk/pricing";

describe("Dedicated Model Rate Cards Page (`apps/web/app/rate-cards`)", () => {
  it("contains complete rate cards for frontier providers", () => {
    const cards = Object.values(RATE_CARDS).filter((c) => c.id !== "default");
    expect(cards.length).toBeGreaterThanOrEqual(10);

    const providers = new Set(cards.map((c) => c.provider));
    expect(providers.has("anthropic")).toBe(true);
    expect(providers.has("openai")).toBe(true);
    expect(providers.has("google")).toBe(true);
    expect(providers.has("deepseek")).toBe(true);
  });

  it("accurately computes token diff cost with prompt cache discount", () => {
    const sonnet = getRateCard("claude-3-7-sonnet");
    expect(sonnet).toBeDefined();

    // 50,000 input, 2,500 output, 20,000 cached
    // fresh input: 30k * $3/M = $0.09
    // cache read: 20k * $0.3/M = $0.006
    // output: 2.5k * $15/M = $0.0375
    // total = ~0.1335
    const cost = computeCost(50000, 2500, 20000, sonnet);
    expect(cost).toBeCloseTo(0.1335, 3);
  });

  it("handles DeepSeek V3 cost calculation properly", () => {
    const deepseek = getRateCard("deepseek-v3");
    expect(deepseek).toBeDefined();
    expect(deepseek.inputPerMTok).toBe(0.14);
    expect(deepseek.outputPerMTok).toBe(0.28);

    const cost = computeCost(100000, 5000, 0, deepseek);
    // 100k * 0.14 / 1M = 0.014
    // 5k * 0.28 / 1M = 0.0014
    // total = ~0.0154
    expect(cost).toBeCloseTo(0.0154, 4);
  });

  it("formats context window units properly", () => {
    const formatContext = (ctx: number) => {
      if (ctx >= 1_000_000) return `${(ctx / 1_000_000).toFixed(0)}M`;
      return `${Math.round(ctx / 1000)}k`;
    };

    expect(formatContext(200_000)).toBe("200k");
    expect(formatContext(1_000_000)).toBe("1M");
    expect(formatContext(2_000_000)).toBe("2M");
    expect(formatContext(64_000)).toBe("64k");
    expect(formatContext(128_000)).toBe("128k");
  });
});
