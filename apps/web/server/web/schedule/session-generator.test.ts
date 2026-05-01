/**
 * Gate 6 + 7 unit tests for `ScheduleSessionGenerator`.
 *
 * Run: cd apps/web && bun test server/web/schedule/session-generator.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  MAX_GENERATION_WINDOW_DAYS,
  generateSessionPlan,
} from "~/server/web/schedule/session-generator"

const utc = (iso: string) => new Date(`${iso}T00:00:00.000Z`)

describe("generateSessionPlan", () => {
  it("creates one session per matching weekday in window", () => {
    // 2026-05-04 is Mon, 2026-05-05 Tue, 2026-05-06 Wed, 2026-05-07 Thu, 2026-05-08 Fri
    const plan = generateSessionPlan({
      schedule: {
        daysOfWeek: ["MON", "WED"],
        startTime: "17:00",
        endTime: "18:00",
        effectiveFrom: utc("2026-05-04"),
        effectiveTo: utc("2026-05-15"),
        status: "ACTIVE",
      },
      existingSessions: [],
      windowStart: utc("2026-05-04"),
      windowEnd: utc("2026-05-15"),
    })
    // 2026-05-04 (Mon), 05-06 (Wed), 05-11 (Mon), 05-13 (Wed) = 4 sessions
    expect(plan.toCreate.length).toBe(4)
    expect(plan.toCancel.length).toBe(0)
    expect(plan.toDelete.length).toBe(0)
  })

  it("clamps window to MAX_GENERATION_WINDOW_DAYS (90)", () => {
    const plan = generateSessionPlan({
      schedule: {
        daysOfWeek: ["MON"],
        startTime: "17:00",
        endTime: "18:00",
        effectiveFrom: utc("2026-05-04"),
        effectiveTo: null,
        status: "ACTIVE",
      },
      existingSessions: [],
      windowStart: utc("2026-05-04"),
      windowEnd: utc("2027-12-31"), // year out — should be capped
    })
    const start = utc("2026-05-04").getTime()
    const cap = start + MAX_GENERATION_WINDOW_DAYS * 24 * 60 * 60 * 1000
    expect(plan.windowEnd.getTime()).toBeLessThanOrEqual(cap)
  })

  it("does not delete sessions with attendance — sets CANCELLED instead", () => {
    const plan = generateSessionPlan({
      schedule: {
        daysOfWeek: ["MON"], // Tuesday session is now stale
        startTime: "17:00",
        endTime: "18:00",
        effectiveFrom: utc("2099-01-05"), // far future so existing 2099-01-06 is "future"
        effectiveTo: utc("2099-01-12"),
        status: "ACTIVE",
      },
      existingSessions: [
        {
          id: "session-with-attendance",
          date: utc("2099-01-06"), // Tuesday, no longer in daysOfWeek
          status: "SCHEDULED",
          startTime: "17:00",
          endTime: "18:00",
          hasAttendance: true,
        },
        {
          id: "session-without-attendance",
          date: utc("2099-01-07"), // Wednesday, also stale
          status: "SCHEDULED",
          startTime: "17:00",
          endTime: "18:00",
          hasAttendance: false,
        },
      ],
      windowStart: utc("2099-01-05"),
      windowEnd: utc("2099-01-12"),
    })

    const cancelledIds = plan.toCancel.map(c => c.id)
    const deletedIds = plan.toDelete.map(d => d.id)
    expect(cancelledIds).toContain("session-with-attendance")
    expect(deletedIds).toContain("session-without-attendance")
    expect(deletedIds).not.toContain("session-with-attendance")
  })

  it("is idempotent — re-running with no changes produces empty plan", () => {
    const existing = [
      {
        id: "a",
        date: utc("2026-05-04"),
        status: "SCHEDULED" as const,
        startTime: "17:00",
        endTime: "18:00",
        hasAttendance: false,
      },
      {
        id: "b",
        date: utc("2026-05-11"),
        status: "SCHEDULED" as const,
        startTime: "17:00",
        endTime: "18:00",
        hasAttendance: false,
      },
    ]
    const plan = generateSessionPlan({
      schedule: {
        daysOfWeek: ["MON"],
        startTime: "17:00",
        endTime: "18:00",
        effectiveFrom: utc("2026-05-04"),
        effectiveTo: utc("2026-05-11"),
        status: "ACTIVE",
      },
      existingSessions: existing,
      windowStart: utc("2026-05-04"),
      windowEnd: utc("2026-05-11"),
    })
    expect(plan.toCreate.length).toBe(0)
    expect(plan.toCancel.length).toBe(0)
    expect(plan.toDelete.length).toBe(0)
    expect(plan.toRefreshTimes.length).toBe(0)
  })

  it("refreshes start/end times when schedule changes them", () => {
    const plan = generateSessionPlan({
      schedule: {
        daysOfWeek: ["MON"],
        startTime: "18:00", // changed
        endTime: "19:00", // changed
        effectiveFrom: utc("2099-02-02"),
        effectiveTo: utc("2099-02-09"),
        status: "ACTIVE",
      },
      existingSessions: [
        {
          id: "shift-me",
          date: utc("2099-02-02"),
          status: "SCHEDULED",
          startTime: "17:00",
          endTime: "18:00",
          hasAttendance: false,
        },
      ],
      windowStart: utc("2099-02-02"),
      windowEnd: utc("2099-02-09"),
    })
    expect(plan.toRefreshTimes).toEqual([
      { id: "shift-me", startTime: "18:00", endTime: "19:00" },
    ])
  })

  it("PAUSED schedule generates no new sessions but still cancels stale future with attendance", () => {
    const plan = generateSessionPlan({
      schedule: {
        daysOfWeek: ["MON"],
        startTime: "17:00",
        endTime: "18:00",
        effectiveFrom: utc("2099-03-02"),
        effectiveTo: utc("2099-03-09"),
        status: "PAUSED",
      },
      existingSessions: [
        {
          id: "future-attended",
          date: utc("2099-03-02"),
          status: "SCHEDULED",
          startTime: "17:00",
          endTime: "18:00",
          hasAttendance: true,
        },
      ],
      windowStart: utc("2099-03-02"),
      windowEnd: utc("2099-03-09"),
    })
    expect(plan.toCreate.length).toBe(0)
    expect(plan.toCancel).toEqual([{ id: "future-attended" }])
  })
})
