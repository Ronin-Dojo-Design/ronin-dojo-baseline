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
      // @added SESSION_0474 (S2, D472-8) — the free tier's avatar upload. Mirrors
      // `evidence_upload`: IP-keyed + fail-closed so a single network can't mint many
      // free accounts to flood R2 storage with avatar uploads. Lower cap than evidence
      // (avatar change is a rare action) but generous enough for a few retries.
      avatar_upload: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 avatar uploads per hour per IP
      }),
      // @added SESSION_0493 — member community feed (`/posts`, ADR 0042 Amendment 1).
      // `community_post_write`: actor-keyed create throttle (spam guard on a member-generated
      // public surface); fail-open like the other authenticated write buckets.
      community_post_write: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 post creates per minute per member
      }),
      // `community_image_upload`: actor-keyed post-image upload (storage-abuse surface, like
      // evidence/avatar uploads → fail-closed).
      community_image_upload: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(15, "1 h"), // 15 post-image uploads per hour per member
      }),
      // @added SESSION_0592 — the admins-only feature-widget idea-dump (`PlanningIntake`). IP-keyed
      // like `report`/`feedback` (the pinned precedent); generous cap since it's an internal admin
      // tool, not a public surface.
      planning_intake: new Ratelimit({
        redis,
        analytics: true,
        limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 intake submits per hour per IP
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
 * Buckets that fail **closed** when the limiter itself errors (RISK #5).
 *
 * The register's rule: low-risk forms may fail open with an alert, but sensitive
 * surfaces (auth/OTP/invite/claims/payment/admin) should fail closed when the
 * limiter can't be consulted — otherwise a Redis outage silently removes the abuse
 * control. These are the public/abuse-prone or auth-adjacent buckets where one
 * blocked request during a Redis blip is cheaper than an unbounded flood:
 *  - `claim`           — IP-keyed public claim attempts (account-takeover adjacent)
 *  - `invite`          — invite-link generation (privilege grant)
 *  - `evidence_upload` — public, UNAUTHENTICATED upload (storage-abuse surface)
 *  - `avatar_upload`   — free-tier avatar upload, IP-keyed (storage-abuse surface)
 *  - `community_image_upload` — member post-image upload, actor-keyed (storage-abuse surface)
 *  - `teaser_signup`   — public, UNAUTHENTICATED email capture (spam surface)
 *  - `email_notify`    — gates auth-email / notification sends (mail-flood surface)
 *  - `submission` / `report` — public IP-keyed submit/report (spam surface)
 *
 * The authenticated, actor-keyed write buckets (schedule/attendance/enrollment/…)
 * stay fail-OPEN: they're bounded by the session and blocking a legit member's
 * write during a Redis blip is the worse failure for those.
 *
 * NOTE: this only changes behavior when Redis is CONFIGURED but the `.limit()` call
 * ERRORS. When Redis is not configured at all (`limiters === null`, e.g. local dev)
 * the function still fails open so dev/CI work without Redis.
 */
const FAIL_CLOSED_BUCKETS: ReadonlySet<string> = new Set([
  "claim",
  "invite",
  "evidence_upload",
  "avatar_upload",
  "community_image_upload",
  "teaser_signup",
  "email_notify",
  "submission",
  "report",
])

/**
 * The fail-closed decision for a bucket when the limiter errors (RISK #5).
 * Exported as a pure predicate so the classification is unit-testable without
 * standing up Redis or mocking `@upstash/ratelimit`. `true` = block on error.
 */
export const shouldFailClosed = (action: string): boolean => FAIL_CLOSED_BUCKETS.has(action)

/**
 * Check if the user is rate limited
 * @param id - The identifier to check
 * @param action - The action to check
 * @returns True if the user is rate limited (or the limiter errored on a
 *   fail-closed bucket), false otherwise
 */
export const isRateLimited = async (id: string, action: keyof NonNullable<typeof limiters>) => {
  // Redis not configured (e.g. local dev / CI): fail open so the action works.
  if (!limiters) return false

  const { data, error } = await tryCatch(limiters[action].limit(id))

  if (error) {
    console.error("Rate limiter error:", error)
    // RISK #5: fail CLOSED for sensitive buckets (block when we can't consult the
    // limiter), fail open for the rest (don't block legitimate authenticated work
    // on a transient Redis blip).
    return shouldFailClosed(action)
  }

  return !data.success
}
