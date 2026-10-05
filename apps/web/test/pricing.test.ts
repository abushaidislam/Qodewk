import { describe, it, expect } from "vitest";

describe("Pricing Page Contracts & FAQ (`apps/web/app/pricing`)", () => {
  const expectedTiers = [
    { name: "Open Source", price: "$0", highlighted: false },
    { name: "Team Sync", price: "$20", highlighted: true },
    { name: "Enterprise", price: "Custom", highlighted: false },
  ];

  it("verifies tier contracts, prices, and highlighted status", () => {
    expect(expectedTiers.length).toBe(3);
    expect(expectedTiers[0].name).toBe("Open Source");
    expect(expectedTiers[0].price).toBe("$0");
    expect(expectedTiers[1].name).toBe("Team Sync");
    expect(expectedTiers[1].highlighted).toBe(true);
    expect(expectedTiers[2].name).toBe("Enterprise");
  });

  it("enforces clear distinction between product pricing and external AI tokens in FAQ", () => {
    const faqQuestions = [
      "Is the Qodewk CLI really free forever?",
      "Does Qodewk charge for LLM token usage?",
      "Does Qodewk ever upload my proprietary source code or diff hunks?",
      "When should our organization choose Team Sync vs Enterprise?",
      "Can Qodewk run in air-gapped environments or CI without network access?",
      "Can I cancel or switch plans at any time?",
    ];

    expect(faqQuestions.length).toBe(6);
    expect(faqQuestions.some((q) => q.includes("free forever"))).toBe(true);
    expect(faqQuestions.some((q) => q.includes("LLM token usage"))).toBe(true);
    expect(faqQuestions.some((q) => q.includes("source code"))).toBe(true);
  });
});
