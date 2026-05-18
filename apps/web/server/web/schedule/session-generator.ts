import type { ClassSession, ClassSessionStatus, DayOfWeek } from "~/.generated/prisma/client"

/**
 * ScheduleSessionGenerator (SESSION_0031 TASK_02 / OD-2).
 *
 * Pure function module. Given a schedule's recurrence pattern and a window,
 * returns an idempotent upsert plan for `ClassSession` rows.
 *
 * Bounded by gate 6:
 *   - generation window is clamped to `[from, min(to, from + 90 days)]`
 *   - stale future sessions with attached attendance are CANCELLED, not deleted
 *   - stale future sessions with no attendance are deleted
 *
 * No I/O. The caller (server action) wraps this in a transaction.
 */

const DAYS_OF_WEEK_ORDER: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

const MS_PER_DAY = 24 * 60 * 60 * 1000

const MAX_GENERATION_DAYS = 90

export type ExistingSession = Pick<
  ClassSession,
  "id" | "date" | "status" | "startTime" | "endTime"
> & {
  hasAttendance: boolean
}

export type GenerationPlan = {
  toCreate: Array<{
    date: Date
    startTime: string
    endTime: string
  }>
  toCancel: Array<{ id: string }>
  toDelete: Array<{ id: string }>
  toRefreshTimes: Array<{ id: string; startTime: string; endTime: string }>
  windowStart: Date
  windowEnd: Date
}

export type GenerateSessionPlanInput = {
  schedule: {
    daysOfWeek: DayOfWeek[]
    startTime: string
    endTime: string
    effectiveFrom: Date | null
    effectiveTo: Date | null
    /** ACTIVE = generate forward; PAUSED/ARCHIVED = no new rows, treat all future as stale. */
    status: "ACTIVE" | "PAUSED" | "ARCHIVED"
  }
  existingSessions: ExistingSession[]
  /** Override start; defaults to today (UTC midnight). */
  windowStart?: Date
  /** Override end; defaults to windowStart + 90 days. Hard-capped at +90d regardless. */
  windowEnd?: Date
  /** Status to use for cancellations. Schema enum value is "CANCELLED". */
  cancelledStatus?: ClassSessionStatus
}

const toUtcMidnight = (value: Date): Date => {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
}

const sameUtcDay = (a: Date, b: Date): boolean => {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

const dayOfWeekFromUtc = (date: Date): DayOfWeek => {
  return DAYS_OF_WEEK_ORDER[date.getUTCDay()]
}

export const generateSessionPlan = ({
  schedule,
  existingSessions,
  windowStart,
  windowEnd,
  cancelledStatus = "CANCELLED" as ClassSessionStatus,
}: GenerateSessionPlanInput): GenerationPlan => {
  const today = toUtcMidnight(new Date())
  const start = toUtcMidnight(windowStart ?? schedule.effectiveFrom ?? today)
  // Clamp end at +90d from start AND at schedule.effectiveTo (if set).
  const requestedEnd = windowEnd
    ? toUtcMidnight(windowEnd)
    : new Date(start.getTime() + MAX_GENERATION_DAYS * MS_PER_DAY)
  const hardCap = new Date(start.getTime() + MAX_GENERATION_DAYS * MS_PER_DAY)
  const effectiveCap = schedule.effectiveTo ? toUtcMidnight(schedule.effectiveTo) : null
  const end = [requestedEnd, hardCap, effectiveCap].reduce<Date | null>((min, d) => {
    if (!d) return min
    if (!min) return d
    return d.getTime() < min.getTime() ? d : min
  }, null) as Date

  const desiredDays = new Set<DayOfWeek>(schedule.daysOfWeek)
  const isActive = schedule.status === "ACTIVE"

  const desiredDates: Date[] = []
  if (isActive && desiredDays.size > 0 && end.getTime() >= start.getTime()) {
    for (let cursor = start.getTime(); cursor <= end.getTime(); cursor += MS_PER_DAY) {
      const date = new Date(cursor)
      if (desiredDays.has(dayOfWeekFromUtc(date))) {
        desiredDates.push(date)
      }
    }
  }

  // Index existing sessions by date for O(1) lookup; keep a copy of dates we
  // matched against so we can mark unmatched future sessions as stale.
  const existingByDate = new Map<number, ExistingSession>()
  for (const session of existingSessions) {
    existingByDate.set(toUtcMidnight(session.date).getTime(), session)
  }

  const toCreate: GenerationPlan["toCreate"] = []
  const toRefreshTimes: GenerationPlan["toRefreshTimes"] = []

  for (const date of desiredDates) {
    const existing = existingByDate.get(date.getTime())
    if (!existing) {
      toCreate.push({ date, startTime: schedule.startTime, endTime: schedule.endTime })
      continue
    }
    if (existing.startTime !== schedule.startTime || existing.endTime !== schedule.endTime) {
      toRefreshTimes.push({
        id: existing.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })
    }
    existingByDate.delete(date.getTime())
  }

  // Anything still in existingByDate that's >= today is "stale future". Past
  // sessions are left alone — they're history.
  const toCancel: GenerationPlan["toCancel"] = []
  const toDelete: GenerationPlan["toDelete"] = []

  for (const [, session] of existingByDate) {
    const sessionDate = toUtcMidnight(session.date)
    const isFuture = sessionDate.getTime() >= today.getTime() && !sameUtcDay(sessionDate, today)
    if (!isFuture) continue

    if (session.hasAttendance) {
      if (session.status !== cancelledStatus) {
        toCancel.push({ id: session.id })
      }
    } else {
      toDelete.push({ id: session.id })
    }
  }

  return {
    toCreate,
    toCancel,
    toDelete,
    toRefreshTimes,
    windowStart: start,
    windowEnd: end,
  }
}

export const MAX_GENERATION_WINDOW_DAYS = MAX_GENERATION_DAYS
