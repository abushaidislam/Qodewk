import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getRateCard, computeCost, RATE_CARDS } from "../dist/index.js";

describe("packages/pricing", () => {
  it("exports known model rate cards", () => {
    assert.ok(RATE_CARDS["claude-opus-4"]);
    assert.ok(RATE_CARDS["claude-sonnet-4"]);
    assert.ok(RATE_CARDS["claude-3-7-sonnet"]);
    assert.ok(RATE_CARDS["gpt-4o"]);
    assert.ok(RATE_CARDS["gpt-4o-mini"]);
    assert.ok(RATE_CARDS["o1"]);
    assert.ok(RATE_CARDS["o3-mini"]);
    assert.ok(RATE_CARDS["gemini-3-8-flash"]);
    assert.ok(RATE_CARDS["deepseek-v3"]);
  });

  it("resolves exact and fuzzy rate cards", () => {
    assert.equal(getRateCard("gpt-4o-mini").id, "gpt-4o-mini");
    assert.equal(getRateCard("o1").id, "o1");
    assert.equal(getRateCard("claude-sonnet-4").id, "claude-sonnet-4");
    assert.equal(getRateCard("claude-3-7-sonnet-20250219").id, "claude-3-7-sonnet");
    assert.equal(getRateCard("gemini-flash").id, "gemini-3-8-flash");
    assert.equal(getRateCard("unknown-future-model").id, "default");
    assert.equal(getRateCard(undefined).id, "default");
  });

  it("computes cost with fresh input and output tokens", () => {
    const card = RATE_CARDS["gpt-4o"];
    // 1M input ($2.50) + 1M output ($10.00) = $12.50
    const cost = computeCost(1_000_000, 1_000_000, 0, card);
    assert.equal(cost, 12.5);
  });

  it("computes cost taking cache read discount into account", () => {
    const card = RATE_CARDS["claude-sonnet-4"];
    // 1M total input, 500k cached read:
    // 500k fresh * $3.0/M = $1.50
    // 500k cache read * $0.30/M = $0.15
    // 0 output = $0
    // Total = $1.65
    const cost = computeCost(1_000_000, 0, 500_000, card);
    assert.equal(cost, 1.65);
  });

  it("computes cost including cache write tokens", () => {
    const card = RATE_CARDS["claude-sonnet-4"];
    // 500k fresh * $3.0/M = $1.50
    // 500k cache read * $0.30/M = $0.15
    // 200k cache write * $3.75/M = $0.75
    // Total = $2.40
    const cost = computeCost(1_000_000, 0, 500_000, card, 200_000);
    assert.equal(cost, 2.4);
  });
});
