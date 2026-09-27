export interface ModelRateCard {
  id: string;
  provider: "anthropic" | "openai" | "google" | "deepseek" | "generic";
  name: string;
  inputPerMTok: number; // in USD per million tokens
  outputPerMTok: number;
  cacheReadPerMTok: number;
  cacheWritePerMTok: number;
  contextWindow: number;
}

export const RATE_CARDS: Record<string, ModelRateCard> = {
  // Anthropic
  "claude-opus-4": {
    id: "claude-opus-4",
    provider: "anthropic",
    name: "Claude Opus 4",
    inputPerMTok: 4.0,
    outputPerMTok: 20.0,
    cacheReadPerMTok: 0.2,
    cacheWritePerMTok: 5.0,
    contextWindow: 200_000
  },
  "claude-3-7-sonnet": {
    id: "claude-3-7-sonnet",
    provider: "anthropic",
    name: "Claude 3.7 Sonnet",
    inputPerMTok: 3.0,
    outputPerMTok: 15.0,
    cacheReadPerMTok: 0.3,
    cacheWritePerMTok: 3.75,
    contextWindow: 200_000
  },
  "claude-3-5-sonnet": {
    id: "claude-3-5-sonnet",
    provider: "anthropic",
    name: "Claude 3.5 Sonnet",
    inputPerMTok: 3.0,
    outputPerMTok: 15.0,
    cacheReadPerMTok: 0.3,
    cacheWritePerMTok: 3.75,
    contextWindow: 200_000
  },
  "claude-3-5-haiku": {
    id: "claude-3-5-haiku",
    provider: "anthropic",
    name: "Claude 3.5 Haiku",
    inputPerMTok: 0.8,
    outputPerMTok: 4.0,
    cacheReadPerMTok: 0.08,
    cacheWritePerMTok: 1.0,
    contextWindow: 200_000
  },

  // OpenAI
  "gpt-4o": {
    id: "gpt-4o",
    provider: "openai",
    name: "GPT-4o",
    inputPerMTok: 2.5,
    outputPerMTok: 10.0,
    cacheReadPerMTok: 1.25,
    cacheWritePerMTok: 2.5,
    contextWindow: 128_000
  },
  "o3-mini": {
    id: "o3-mini",
    provider: "openai",
    name: "o3-mini",
    inputPerMTok: 1.1,
    outputPerMTok: 4.4,
    cacheReadPerMTok: 0.55,
    cacheWritePerMTok: 1.1,
    contextWindow: 200_000
  },

  // Google
  "gemini-2-0-flash": {
    id: "gemini-2-0-flash",
    provider: "google",
    name: "Gemini 2.0 Flash",
    inputPerMTok: 0.1,
    outputPerMTok: 0.4,
    cacheReadPerMTok: 0.025,
    cacheWritePerMTok: 0.1,
    contextWindow: 1_000_000
  },
  "gemini-1-5-pro": {
    id: "gemini-1-5-pro",
    provider: "google",
    name: "Gemini 1.5 Pro",
    inputPerMTok: 1.25,
    outputPerMTok: 5.0,
    cacheReadPerMTok: 0.3,
    cacheWritePerMTok: 1.25,
    contextWindow: 2_000_000
  },

  // DeepSeek
  "deepseek-v3": {
    id: "deepseek-v3",
    provider: "deepseek",
    name: "DeepSeek V3",
    inputPerMTok: 0.14,
    outputPerMTok: 0.28,
    cacheReadPerMTok: 0.014,
    cacheWritePerMTok: 0.14,
    contextWindow: 64_000
  },
  "deepseek-r1": {
    id: "deepseek-r1",
    provider: "deepseek",
    name: "DeepSeek R1",
    inputPerMTok: 0.55,
    outputPerMTok: 2.19,
    cacheReadPerMTok: 0.14,
    cacheWritePerMTok: 0.55,
    contextWindow: 64_000
  },

  // Default Fallback
  "default": {
    id: "default",
    provider: "generic",
    name: "Standard Frontier Model",
    inputPerMTok: 3.0,
    outputPerMTok: 15.0,
    cacheReadPerMTok: 0.3,
    cacheWritePerMTok: 3.75,
    contextWindow: 128_000
  }
};

export function getRateCard(modelId?: string): ModelRateCard {
  if (!modelId) return RATE_CARDS["default"]!;
  const key = modelId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return RATE_CARDS[key] || RATE_CARDS["claude-3-7-sonnet"] || RATE_CARDS["default"]!;
}

export function computeCost(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number,
  card: ModelRateCard
): number {
  const freshInput = Math.max(0, inputTokens - cachedTokens);
  const freshCost = (freshInput / 1_000_000) * card.inputPerMTok;
  const cacheCost = (cachedTokens / 1_000_000) * card.cacheReadPerMTok;
  const outCost = (outputTokens / 1_000_000) * card.outputPerMTok;
  return Number((freshCost + cacheCost + outCost).toFixed(4));
}
