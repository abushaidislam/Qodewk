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
  "claude-opus-4-6-thinking": {
    id: "claude-opus-4-6-thinking",
    provider: "anthropic",
    name: "Claude Opus 4.6 Thinking",
    inputPerMTok: 5.0,
    outputPerMTok: 25.0,
    cacheReadPerMTok: 0.25,
    cacheWritePerMTok: 6.25,
    contextWindow: 200_000
  },
  "claude-sonnet-4-6-thinking": {
    id: "claude-sonnet-4-6-thinking",
    provider: "anthropic",
    name: "Claude Sonnet 4.6 Thinking",
    inputPerMTok: 3.0,
    outputPerMTok: 15.0,
    cacheReadPerMTok: 0.3,
    cacheWritePerMTok: 3.75,
    contextWindow: 200_000
  },
  "claude-sonnet-4": {
    id: "claude-sonnet-4",
    provider: "anthropic",
    name: "Claude Sonnet 4",
    inputPerMTok: 3.0,
    outputPerMTok: 15.0,
    cacheReadPerMTok: 0.3,
    cacheWritePerMTok: 3.75,
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
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    provider: "openai",
    name: "GPT-4o Mini",
    inputPerMTok: 0.15,
    outputPerMTok: 0.6,
    cacheReadPerMTok: 0.075,
    cacheWritePerMTok: 0.15,
    contextWindow: 128_000
  },
  "o1": {
    id: "o1",
    provider: "openai",
    name: "o1",
    inputPerMTok: 15.0,
    outputPerMTok: 60.0,
    cacheReadPerMTok: 7.5,
    cacheWritePerMTok: 15.0,
    contextWindow: 200_000
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
  "gemini-3-8-flash": {
    id: "gemini-3-8-flash",
    provider: "google",
    name: "Gemini 3.8 Flash",
    inputPerMTok: 0.1,
    outputPerMTok: 0.4,
    cacheReadPerMTok: 0.025,
    cacheWritePerMTok: 0.1,
    contextWindow: 1_000_000
  },
  "gemini-2-5-pro": {
    id: "gemini-2-5-pro",
    provider: "google",
    name: "Gemini 2.5 Pro",
    inputPerMTok: 1.25,
    outputPerMTok: 5.0,
    cacheReadPerMTok: 0.3,
    cacheWritePerMTok: 1.25,
    contextWindow: 2_000_000
  },
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

export const MODEL_ALIASES: Record<string, string> = {
  // Anthropic aliases
  "claude-3-7-sonnet-latest": "claude-3-7-sonnet",
  "claude-3-7-sonnet-20250219": "claude-3-7-sonnet",
  "claude-3-5-sonnet-latest": "claude-3-5-sonnet",
  "claude-3-5-sonnet-20241022": "claude-3-5-sonnet",
  "claude-3-5-sonnet-20240620": "claude-3-5-sonnet",
  "claude-3-5-haiku-latest": "claude-3-5-haiku",
  "claude-3-5-haiku-20241022": "claude-3-5-haiku",
  "claude-3-opus-20240229": "claude-opus-4",
  "claude-code": "claude-3-7-sonnet",
  "cursor-fast": "claude-3-5-sonnet",
  "cursor-small": "claude-3-5-haiku",

  // OpenAI aliases
  "chatgpt-4o-latest": "gpt-4o",
  "gpt-4o-2024-08-06": "gpt-4o",
  "gpt-4o-2024-11-20": "gpt-4o",
  "gpt-4o-mini-2024-07-18": "gpt-4o-mini",
  "o1-preview": "o1",
  "o1-2024-12-17": "o1",
  "o3": "o3-mini",

  // Google aliases
  "gemini-3": "gemini-3-8-flash",
  "gemini-flash": "gemini-3-8-flash",
  "gemini-pro": "gemini-2-5-pro",
  "gemini-3-1-pro": "gemini-2-5-pro",
  "gemini-3-pro": "gemini-2-5-pro",
  "gemini-3-1-flash": "gemini-3-8-flash",
  "gemini-2.0-flash": "gemini-2-0-flash",
  "gemini-1.5-pro": "gemini-1-5-pro",
  "gemini-1.5-flash": "gemini-2-0-flash",

  // DeepSeek aliases
  "deepseek-chat": "deepseek-v3",
  "deepseek-coder": "deepseek-v3",
  "deepseek/deepseek-chat": "deepseek-v3",
  "deepseek-reasoner": "deepseek-r1",
  "deepseek/deepseek-r1": "deepseek-r1"
};

let DYNAMIC_RATE_CARDS: Record<string, ModelRateCard> = {};
let DYNAMIC_ALIASES: Record<string, string> = {};

const PROVIDERS = new Set(["anthropic", "openai", "google", "deepseek", "generic"]);

function isPrice(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1000;
}

/**
 * Keeps only well-formed rate cards (finite, non-negative, bounded prices).
 * Invalid entries are dropped so a bad registry can never poison cost math.
 */
export function sanitizeRateCards(raw: unknown): Record<string, ModelRateCard> {
  const out: Record<string, ModelRateCard> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const c = value as Partial<ModelRateCard> | null;
    if (!c || typeof c !== "object") continue;
    if (
      isPrice(c.inputPerMTok) &&
      isPrice(c.outputPerMTok) &&
      isPrice(c.cacheReadPerMTok) &&
      isPrice(c.cacheWritePerMTok)
    ) {
      out[key] = {
        id: typeof c.id === "string" ? c.id : key,
        provider: PROVIDERS.has(c.provider as string) ? (c.provider as ModelRateCard["provider"]) : "generic",
        name: typeof c.name === "string" ? c.name : key,
        inputPerMTok: c.inputPerMTok,
        outputPerMTok: c.outputPerMTok,
        cacheReadPerMTok: c.cacheReadPerMTok,
        cacheWritePerMTok: c.cacheWritePerMTok,
        contextWindow:
          typeof c.contextWindow === "number" && c.contextWindow > 0 ? c.contextWindow : 128_000
      };
    }
  }
  return out;
}

function sanitizeAliases(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.length > 0) out[k.toLowerCase()] = v;
  }
  return out;
}

export function updatePricingRegistry(
  newCards: Record<string, ModelRateCard>,
  newAliases?: Record<string, string>
) {
  DYNAMIC_RATE_CARDS = { ...DYNAMIC_RATE_CARDS, ...sanitizeRateCards(newCards) };
  if (newAliases) {
    DYNAMIC_ALIASES = { ...DYNAMIC_ALIASES, ...sanitizeAliases(newAliases) };
  }
}

export function resetPricingRegistry() {
  DYNAMIC_RATE_CARDS = {};
  DYNAMIC_ALIASES = {};
}

export function getRateCard(modelId?: string): ModelRateCard {
  if (!modelId) return DYNAMIC_RATE_CARDS["default"] ?? RATE_CARDS["default"]!;
  let key = modelId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  
  // 1. Exact alias match
  const aliasMatch = DYNAMIC_ALIASES[modelId.toLowerCase()] ?? MODEL_ALIASES[modelId.toLowerCase()];
  if (aliasMatch) {
    key = aliasMatch;
  } else {
    const fallbackAliasMatch = DYNAMIC_ALIASES[key] ?? MODEL_ALIASES[key];
    if (fallbackAliasMatch) {
      key = fallbackAliasMatch;
    }
  }

  // 2. Exact rate card match
  if (DYNAMIC_RATE_CARDS[key]) return DYNAMIC_RATE_CARDS[key]!;
  if (RATE_CARDS[key]) return RATE_CARDS[key]!;

  if (key.includes("opus")) {
    return RATE_CARDS["claude-opus-4-6-thinking"] ?? RATE_CARDS["claude-opus-4"]!;
  }
  if (key.includes("sonnet")) {
    if (key.includes("3-7") || key.includes("sonnet-3-7")) {
      return RATE_CARDS["claude-3-7-sonnet"]!;
    }
    if (key.includes("3-5") || key.includes("sonnet-3-5")) {
      return RATE_CARDS["claude-3-5-sonnet"]!;
    }
    // Any other Sonnet generation (4.x, 5.x, thinking variants) -> current Sonnet tier
    return RATE_CARDS["claude-sonnet-4-6-thinking"]!;
  }
  if (key.includes("haiku")) {
    return RATE_CARDS["claude-3-5-haiku"]!;
  }
  if (key.includes("o1-mini") || key.includes("o3-mini")) {
    return RATE_CARDS["o3-mini"]!;
  }
  if (key.includes("o1")) {
    return RATE_CARDS["o1"]!;
  }
  if (key.includes("4o-mini")) {
    return RATE_CARDS["gpt-4o-mini"]!;
  }
  if (key.includes("4o")) {
    return RATE_CARDS["gpt-4o"]!;
  }
  if (key.includes("gemini") && key.includes("flash")) {
    return RATE_CARDS["gemini-3-8-flash"] ?? RATE_CARDS["gemini-2-0-flash"]!;
  }
  if (key.includes("gemini") && (key.includes("pro") || key.includes("2-5"))) {
    return RATE_CARDS["gemini-2-5-pro"] ?? RATE_CARDS["gemini-1-5-pro"]!;
  }

  return RATE_CARDS["default"]!;
}

export function computeCost(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number,
  card: ModelRateCard,
  cacheWriteTokens: number = 0
): number {
  const freshInput = Math.max(0, inputTokens - cachedTokens);
  const freshCost = (freshInput / 1_000_000) * card.inputPerMTok;
  const cacheReadCost = (cachedTokens / 1_000_000) * card.cacheReadPerMTok;
  const cacheWriteCost = (cacheWriteTokens / 1_000_000) * card.cacheWritePerMTok;
  const outCost = (outputTokens / 1_000_000) * card.outputPerMTok;
  return Number((freshCost + cacheReadCost + cacheWriteCost + outCost).toFixed(4));
}
