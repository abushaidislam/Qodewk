import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

export interface RateLimitOptions {
  windowMs?: number; // Duration of window in ms (default: 60,000)
  maxRequests?: number; // Max requests per window (default: 30)
}

interface ClientBucket {
  tokens: number;
  resetAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __qodewk_ratelimit_store__: Map<string, ClientBucket> | undefined;
}

if (!globalThis.__qodewk_ratelimit_store__) {
  globalThis.__qodewk_ratelimit_store__ = new Map();
}

const rateLimitStore = globalThis.__qodewk_ratelimit_store__;

/**
 * Sliding window token bucket rate limiter for serverless / edge runtime.
 * Zero external dependencies.
 */
export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 30;
  const now = Date.now();

  // Periodic cleanup if store grows past 5,000 entries
  if (rateLimitStore.size > 5000) {
    for (const [key, val] of rateLimitStore.entries()) {
      if (now >= val.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }

  let bucket = rateLimitStore.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    bucket = {
      tokens: maxRequests - 1,
      resetAt: now + windowMs
    };
    rateLimitStore.set(ip, bucket);
    return {
      allowed: true,
      limit: maxRequests,
      remaining: bucket.tokens,
      reset: Math.ceil(bucket.resetAt / 1000)
    };
  }

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return {
      allowed: true,
      limit: maxRequests,
      remaining: bucket.tokens,
      reset: Math.ceil(bucket.resetAt / 1000)
    };
  }

  return {
    allowed: false,
    limit: maxRequests,
    remaining: 0,
    reset: Math.ceil(bucket.resetAt / 1000)
  };
}

let _distributed: { limiter: Ratelimit; windowMs: number; maxRequests: number } | null = null;

function getDistributedLimiter(windowMs: number, maxRequests: number): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!_distributed || _distributed.windowMs !== windowMs || _distributed.maxRequests !== maxRequests) {
    _distributed = {
      limiter: new Ratelimit({
        redis: new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN
        }),
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
        prefix: "receipts"
      }),
      windowMs,
      maxRequests
    };
  }
  return _distributed.limiter;
}

/**
 * Rate limiter shared across all serverless instances when Upstash Redis is configured
 * (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`). The in-memory limiter is
 * per-instance only, so it is the fallback when Redis is unconfigured or unreachable.
 */
export async function checkDistributedRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const windowMs = options.windowMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 30;
  const limiter = getDistributedLimiter(windowMs, maxRequests);

  if (limiter) {
    try {
      const result = await limiter.limit(ip);
      return {
        allowed: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: Math.ceil(result.reset / 1000)
      };
    } catch (err: any) {
      console.warn(`[Qodewk RateLimit] Upstash unavailable, using in-memory limiter: ${err.message}`);
    }
  }

  return checkRateLimit(ip, options);
}

/**
 * Utility for tests to reset state.
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
  _distributed = null;
}
