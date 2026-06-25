import { tryCatch } from "@dirstack/utils"
import { Ratelimit } from "@upstash/ratelimit"
import { headers } from "next/headers"
import { redis } from "~/services/redis"

const limiters = redis
  ? {
      submission: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(3, "24 h"), // 3 attempts per day
      }),
      report: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 attempts per hour
      }),
      newsletter: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(3, "24 h"), // 3 attempts per day
      }),
      // BBL launch-teaser email capture (public form). Higher than `newsletter`
      // so clustered signups from one network (e.g. a gym's shared wifi) aren't
      // blocked, while still stopping bot spam.
      teaser_signup: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(30, "24 h"), // 30 signups per day per IP
      }),
      claim: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 attempts per hour
      }),
      // SESSION_0031 gate 4: schedule mutations + instructor selector lookups.
      // Failure mode = fail-open per `isRateLimited`; monitoring signal added to
      // docs/architecture/security-privacy-payments-monitoring-plan.md.
      schedule_write: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 schedule mutations per minute per actor
      }),
      instructor_search: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 instructor lookups per minute per actor
      }),
      attendance_write: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 attendance/check-in mutations per minute per actor
      }),
      enrollment_write: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 enrollment/waitlist mutations per minute per actor
      }),
      family_write: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 family-group mutations per minute per actor
      }),
      waiver_write: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 waiver signature mutations per minute per actor
      }),
      lead_write: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 lead lifecycle mutations per minute per actor
      }),
      trial_book: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 trial booking mutations per minute per actor
      }),
      // @added SESSION_0258 (2026-05-25) — keyed on `email:<template>:<recipient>`,
      // shared across every helper in `lib/notifications.ts`. Catches duplicate-fire
      // patterns (rapid resubmits, double-click on admin transition buttons, webhook
      // retries) without blocking the action itself; fail-open in dev when redis is null.
      email_notify: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(3, "5 m"), // 3 sends of same template to same recipient per 5 min
      }),
      // @added SESSION_0302 — F-0300-3: rate-limit org invite generation.
      // Keyed on userId to prevent any single admin from flooding invite links.
      invite: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 invite generations per hour per actor
      }),
      // @added SESSION_0445 #3 — public, UNAUTHENTICATED evidence-photo upload on the
      // Join-the-Legacy intake. Keyed on client IP; caps storage abuse of the public
      // upload surface while leaving room for a few cert photos + retries. Fail-open in
      // dev when redis is null (uploads work locally).
      evidence_upload: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(15, "1 h"), // 15 evidence uploads per hour per IP
      }),
    }
  : null

/**
 * Get the IP address of the client
 * @returns IP address
 */
export const getIP = async () => {
  const FALLBACK_IP_ADDRESS = "0.0.0.0"
  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS
  }

  return headersList.get("x-real-ip") ?? FALLBACK_IP_ADDRESS
}

/**
 * Check if the user is rate limited
 * @param id - The identifier to check
 * @param action - The action to check
 * @returns True if the user is rate limited, false otherwise
 */
export const isRateLimited = async (id: string, action: keyof NonNullable<typeof limiters>) => {
  if (!limiters) return false

  const { data, error } = await tryCatch(limiters[action].limit(id))

  if (error) {
    console.error("Rate limiter error:", error)
    return false // Fail open to prevent blocking legitimate users
  }

  return !data.success
}
