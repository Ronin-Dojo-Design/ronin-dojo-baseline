import { ORPCError } from "@orpc/server"
import { headers } from "next/headers"
import { RateLimiterMemory } from "rate-limiter-flexible"

/**
 * Inline rate-limit config. Lives on procedure meta:
 *   `rateLimit: { points: 3, duration: 86_400 }`  // 3 requests per day
 *
 * `"none"` disables limiting for that procedure entirely.
 *
 * Ronin delta (Phase 1a): memory-only limiter. Upstream backs this with
 * `RateLimiterRedis` over an ioredis client; Ronin's `services/redis.ts` is an
 * `@upstash/redis` REST client, which rate-limiter-flexible cannot drive.
 * Per-instance memory limiting still protects each serverless instance (the
 * retiring action layer had no limiting at all). Redis-backed limiting is the
 * Phase-1b follow-up (ioredis client or an Upstash-native limiter).
 */
export type RateLimitConfig = { points: number; duration: number } | "none"

const FALLBACK_IP = "0.0.0.0"

const limiterCache = new Map<string, RateLimiterMemory>()

const getLimiter = (config: { points: number; duration: number }) => {
  const cacheKey = `${config.points}:${config.duration}`
  const cached = limiterCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const limiter = new RateLimiterMemory({ keyPrefix: `rl:p:${cacheKey}`, ...config })
  limiterCache.set(cacheKey, limiter)
  return limiter
}

const getClientIp = async () => {
  const list = await headers()
  const forwardedFor = list.get("x-forwarded-for")

  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim()
    return first && first.length > 0 ? first : FALLBACK_IP
  }

  return list.get("x-real-ip") ?? FALLBACK_IP
}

/**
 * Consume one point against the given config. Throws an oRPC
 * `TOO_MANY_REQUESTS` error with `retryAfterSeconds` in `data` when the
 * bucket is exhausted.
 *
 * Identity resolution: prefer the explicit `identifier` (typically the
 * user id), otherwise fall back to the request's client IP.
 *
 * `scope` namespaces the bucket to a single caller action (typically the
 * procedure path). Without it, two procedures that happen to share the same
 * `{ points, duration }` numbers would drain one another's quota, since the
 * limiter is keyed only by those numbers plus the caller identity.
 */
export const consumeRateLimit = async (
  config: { points: number; duration: number },
  identifier?: string | null,
  scope?: string,
): Promise<void> => {
  const id = identifier ?? (await getClientIp())
  const key = scope ? `${scope}:${id}` : id
  const limiter = getLimiter(config)

  try {
    await limiter.consume(key)
    return
  } catch (error) {
    if (typeof error === "object" && error !== null && "msBeforeNext" in error) {
      const raw = Number((error as { msBeforeNext: number }).msBeforeNext)
      const ms = Number.isFinite(raw) ? raw : 0
      throw new ORPCError("TOO_MANY_REQUESTS", {
        message: "Too many requests. Please try again later.",
        data: { retryAfterSeconds: Math.max(1, Math.ceil(ms / 1000)) },
      })
    }

    console.error("[rate-limit] limiter error:", error)
  }
}
