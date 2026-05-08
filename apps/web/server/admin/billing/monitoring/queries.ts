import type { Prisma } from "~/.generated/prisma/client"
import {
  getWebhookMonitoringWindows,
  WEBHOOK_LAUNCH_WINDOW_DAYS,
  WEBHOOK_STALE_PROCESSING_MINUTES,
} from "~/server/web/billing/monitoring-thresholds"
import { db } from "~/services/db"

type StripeWebhookEventRow = {
  id: string
  type: string
  objectId: string | null
  status: string
  attempts: number
  lastError: string | null
  processedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type StripeWebhookEventPreview = Omit<StripeWebhookEventRow, "lastError"> & {
  lastErrorSummary: string | null
}

export type StripeWebhookStatusTypeCount = {
  status: string
  type: string
  count: number
}

export type StripeWebhookOperationsMonitor = {
  generatedAt: Date
  launchReady: boolean
  statusLabel: "READY" | "BLOCKED"
  blockingReasons: string[]
  thresholds: {
    launchWindowDays: number
    staleProcessingMinutes: number
  }
  counts: {
    last24Hours: StripeWebhookStatusTypeCount[]
    last7Days: StripeWebhookStatusTypeCount[]
    processedLastHour: number
    processedLast24Hours: number
    failedLast7Days: number
    staleProcessing: number
  }
  failedEvents: StripeWebhookEventPreview[]
  staleProcessingEvents: StripeWebhookEventPreview[]
  repeatedAttemptEvents: StripeWebhookEventPreview[]
  recentProcessedEvents: StripeWebhookEventPreview[]
}

type GetStripeWebhookOperationsMonitorOptions = {
  now?: Date
  eventIdPrefix?: string
}

const eventSelect = {
  id: true,
  type: true,
  objectId: true,
  status: true,
  attempts: true,
  lastError: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.StripeWebhookEventSelect

const redactOperationalMessage = (message: string | null) => {
  if (!message) return null

  return message
    .replace(/\b(?:sk|rk|pk)_(?:test|live)_[A-Za-z0-9_]+\b/g, "[redacted-stripe-key]")
    .replace(/\bwhsec_[A-Za-z0-9_]+\b/g, "[redacted-webhook-secret]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\b\d{13,19}\b/g, "[redacted-number]")
    .slice(0, 240)
}

const toPreview = (event: StripeWebhookEventRow): StripeWebhookEventPreview => ({
  id: event.id,
  type: event.type,
  objectId: event.objectId,
  status: event.status,
  attempts: event.attempts,
  lastErrorSummary: redactOperationalMessage(event.lastError),
  processedAt: event.processedAt,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
})

const toStatusTypeCounts = (
  rows: Array<{
    status: string
    type: string
    _count: { _all: number }
  }>,
): StripeWebhookStatusTypeCount[] => {
  return rows.map(row => ({
    status: row.status,
    type: row.type,
    count: row._count._all,
  }))
}

export const getStripeWebhookOperationsMonitor = async ({
  now = new Date(),
  eventIdPrefix,
}: GetStripeWebhookOperationsMonitorOptions = {}): Promise<StripeWebhookOperationsMonitor> => {
  const windows = getWebhookMonitoringWindows(now)
  const scopeWhere: Prisma.StripeWebhookEventWhereInput = eventIdPrefix
    ? { id: { startsWith: eventIdPrefix } }
    : {}

  const [
    last24HoursCounts,
    last7DaysCounts,
    failedEvents,
    staleProcessingEvents,
    repeatedAttemptEvents,
    recentProcessedEvents,
    processedLastHour,
    processedLast24Hours,
    failedLast7Days,
    staleProcessing,
  ] = await db.$transaction([
    db.stripeWebhookEvent.groupBy({
      by: ["status", "type"],
      where: { ...scopeWhere, createdAt: { gte: windows.last24Hours } },
      _count: { _all: true },
      orderBy: [{ status: "asc" }, { type: "asc" }],
    }),
    db.stripeWebhookEvent.groupBy({
      by: ["status", "type"],
      where: { ...scopeWhere, createdAt: { gte: windows.last7Days } },
      _count: { _all: true },
      orderBy: [{ status: "asc" }, { type: "asc" }],
    }),
    db.stripeWebhookEvent.findMany({
      where: { ...scopeWhere, status: "FAILED", createdAt: { gte: windows.last7Days } },
      select: eventSelect,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 25,
    }),
    db.stripeWebhookEvent.findMany({
      where: {
        ...scopeWhere,
        status: "PROCESSING",
        createdAt: { lte: windows.staleProcessingBefore },
      },
      select: eventSelect,
      orderBy: [{ createdAt: "asc" }],
      take: 25,
    }),
    db.stripeWebhookEvent.findMany({
      where: { ...scopeWhere, attempts: { gt: 1 }, createdAt: { gte: windows.last7Days } },
      select: eventSelect,
      orderBy: [{ attempts: "desc" }, { updatedAt: "desc" }],
      take: 25,
    }),
    db.stripeWebhookEvent.findMany({
      where: { ...scopeWhere, status: "PROCESSED", processedAt: { not: null } },
      select: eventSelect,
      orderBy: [{ processedAt: "desc" }],
      take: 25,
    }),
    db.stripeWebhookEvent.count({
      where: { ...scopeWhere, status: "PROCESSED", processedAt: { gte: windows.lastHour } },
    }),
    db.stripeWebhookEvent.count({
      where: { ...scopeWhere, status: "PROCESSED", processedAt: { gte: windows.last24Hours } },
    }),
    db.stripeWebhookEvent.count({
      where: { ...scopeWhere, status: "FAILED", createdAt: { gte: windows.last7Days } },
    }),
    db.stripeWebhookEvent.count({
      where: {
        ...scopeWhere,
        status: "PROCESSING",
        createdAt: { lte: windows.staleProcessingBefore },
      },
    }),
  ])

  const blockingReasons = [
    failedLast7Days > 0
      ? `${failedLast7Days} failed webhook event(s) in the last ${WEBHOOK_LAUNCH_WINDOW_DAYS} days`
      : null,
    staleProcessing > 0
      ? `${staleProcessing} processing webhook event(s) older than ${WEBHOOK_STALE_PROCESSING_MINUTES} minutes`
      : null,
  ].filter((reason): reason is string => Boolean(reason))

  return {
    generatedAt: now,
    launchReady: blockingReasons.length === 0,
    statusLabel: blockingReasons.length === 0 ? "READY" : "BLOCKED",
    blockingReasons,
    thresholds: {
      launchWindowDays: WEBHOOK_LAUNCH_WINDOW_DAYS,
      staleProcessingMinutes: WEBHOOK_STALE_PROCESSING_MINUTES,
    },
    counts: {
      last24Hours: toStatusTypeCounts(last24HoursCounts),
      last7Days: toStatusTypeCounts(last7DaysCounts),
      processedLastHour,
      processedLast24Hours,
      failedLast7Days,
      staleProcessing,
    },
    failedEvents: failedEvents.map(toPreview),
    staleProcessingEvents: staleProcessingEvents.map(toPreview),
    repeatedAttemptEvents: repeatedAttemptEvents.map(toPreview),
    recentProcessedEvents: recentProcessedEvents.map(toPreview),
  }
}
