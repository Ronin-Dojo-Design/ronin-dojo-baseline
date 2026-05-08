/**
 * SESSION_0098 - Stripe webhook operations monitor proof.
 *
 * Run: cd apps/web && bun test server/admin/billing/monitoring/queries.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { afterAll, beforeEach, describe, expect, it } from "bun:test"
import { getStripeWebhookOperationsMonitor } from "~/server/admin/billing/monitoring/queries"
import { db } from "~/services/db"

const TS = Date.now()
const EVENT_PREFIX = `session-0098-monitor-${TS}`
const now = new Date("2026-05-08T12:00:00.000Z")

const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60 * 1000)
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

beforeEach(async () => {
  await db.stripeWebhookEvent.deleteMany({ where: { id: { startsWith: EVENT_PREFIX } } })
})

afterAll(async () => {
  await db.stripeWebhookEvent.deleteMany({ where: { id: { startsWith: EVENT_PREFIX } } })
  await db.$disconnect()
})

describe("getStripeWebhookOperationsMonitor", () => {
  it("reports launch-blocking failed and stale webhook state without leaking sensitive error text", async () => {
    await db.stripeWebhookEvent.createMany({
      data: [
        {
          id: `${EVENT_PREFIX}-failed`,
          type: "invoice.payment_failed",
          objectId: "in_test_0098",
          status: "FAILED",
          attempts: 2,
          lastError:
            "Failed for brian@example.test with sk_test_secret_0098 and whsec_secret_0098 4242424242424242",
          createdAt: minutesAgo(120),
          updatedAt: minutesAgo(119),
        },
        {
          id: `${EVENT_PREFIX}-stale`,
          type: "checkout.session.completed",
          objectId: "cs_test_stale_0098",
          status: "PROCESSING",
          attempts: 1,
          createdAt: minutesAgo(20),
          updatedAt: minutesAgo(20),
        },
        {
          id: `${EVENT_PREFIX}-fresh`,
          type: "checkout.session.completed",
          objectId: "cs_test_fresh_0098",
          status: "PROCESSING",
          attempts: 1,
          createdAt: minutesAgo(5),
          updatedAt: minutesAgo(5),
        },
        {
          id: `${EVENT_PREFIX}-processed`,
          type: "invoice.paid",
          objectId: "in_test_processed_0098",
          status: "PROCESSED",
          attempts: 1,
          processedAt: minutesAgo(9),
          createdAt: minutesAgo(10),
          updatedAt: minutesAgo(9),
        },
        {
          id: `${EVENT_PREFIX}-repeated`,
          type: "customer.subscription.updated",
          objectId: "sub_test_repeated_0098",
          status: "PROCESSED",
          attempts: 3,
          processedAt: minutesAgo(29),
          createdAt: minutesAgo(30),
          updatedAt: minutesAgo(29),
        },
        {
          id: `${EVENT_PREFIX}-old-failed`,
          type: "charge.refunded",
          objectId: "ch_test_old_0098",
          status: "FAILED",
          attempts: 1,
          createdAt: daysAgo(8),
          updatedAt: daysAgo(8),
        },
      ],
    })

    const monitor = await getStripeWebhookOperationsMonitor({ now, eventIdPrefix: EVENT_PREFIX })

    expect(monitor.launchReady).toBe(false)
    expect(monitor.statusLabel).toBe("BLOCKED")
    expect(monitor.failedEvents.map(event => event.id)).toEqual([`${EVENT_PREFIX}-failed`])
    expect(monitor.staleProcessingEvents.map(event => event.id)).toEqual([`${EVENT_PREFIX}-stale`])
    expect(monitor.repeatedAttemptEvents.map(event => event.id).sort()).toEqual(
      [`${EVENT_PREFIX}-failed`, `${EVENT_PREFIX}-repeated`].sort(),
    )
    expect(monitor.counts.failedLast7Days).toBe(1)
    expect(monitor.counts.staleProcessing).toBe(1)
    expect(monitor.counts.processedLastHour).toBe(2)
    expect(monitor.counts.processedLast24Hours).toBe(2)

    const failedError = monitor.failedEvents[0]?.lastErrorSummary ?? ""
    expect(failedError).not.toContain("brian@example.test")
    expect(failedError).not.toContain("sk_test_secret_0098")
    expect(failedError).not.toContain("whsec_secret_0098")
    expect(failedError).not.toContain("4242424242424242")
    expect(failedError).toContain("[redacted-email]")
    expect(failedError).toContain("[redacted-stripe-key]")
    expect(failedError).toContain("[redacted-webhook-secret]")
  })
})
