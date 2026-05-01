import { z } from "zod"

const ScheduleStatus = z.enum(["ACTIVE", "PAUSED", "ARCHIVED"])

const DayOfWeek = z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])

const optionalCuid = z.union([z.literal(""), z.literal("none"), z.string().cuid()]).optional()

const HHMM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * Gate 7: validate timezone against IANA list.
 *
 * `Intl.supportedValuesOf("timeZone")` returns every IANA zone the runtime knows.
 * We accept any string in that list. If the runtime is too old to support the
 * call (Node <18 / older browsers), we fall back to a permissive non-empty
 * check; in practice this codepath only executes server-side in Node 20+.
 */
const SUPPORTED_TIMEZONES = (() => {
  try {
    return new Set<string>(Intl.supportedValuesOf("timeZone"))
  } catch {
    return null
  }
})()

const timezoneSchema = z
  .string()
  .trim()
  .min(1, "Timezone is required")
  .refine(
    value => (SUPPORTED_TIMEZONES ? SUPPORTED_TIMEZONES.has(value) : value.length > 0),
    "Timezone must be a valid IANA zone (e.g., America/Denver)",
  )

export const saveScheduleSchema = z
  .object({
    id: optionalCuid,
    organizationId: z.string().cuid(),
    programId: z.string().cuid(),
    disciplineId: optionalCuid,
    name: z.string().trim().min(1, "Name is required").max(200),
    description: z.string().trim().max(1000).optional(),
    status: ScheduleStatus.default("ACTIVE"),
    daysOfWeek: z.array(DayOfWeek).min(1, "Select at least one day"),
    startTime: z.string().regex(HHMM_PATTERN, "Use HH:MM (24-hour)"),
    endTime: z.string().regex(HHMM_PATTERN, "Use HH:MM (24-hour)"),
    timezone: timezoneSchema,
    effectiveFrom: z.coerce.date().optional(),
    effectiveTo: z.coerce.date().optional(),
    capacity: z.coerce.number().int().min(1).max(500).optional(),
    locationName: z.string().trim().max(200).optional(),
  })
  .refine(value => value.startTime < value.endTime, {
    path: ["endTime"],
    message: "End time must be after start time",
  })
  .refine(
    value => !value.effectiveFrom || !value.effectiveTo || value.effectiveTo >= value.effectiveFrom,
    { path: ["effectiveTo"], message: "End date must be on or after start date" },
  )

export const archiveScheduleSchema = z.object({
  id: z.string().cuid(),
})

export const assignInstructorSchema = z.object({
  classScheduleId: z.string().cuid(),
  userId: z.string().cuid(),
  displayTitle: z.string().trim().max(200).optional(),
  isPrimary: z.boolean().default(false),
})

export const unassignInstructorSchema = z.object({
  assignmentId: z.string().cuid(),
})

export const setPrimaryInstructorSchema = z.object({
  assignmentId: z.string().cuid(),
})

export const materializeScheduleSchema = z.object({
  id: z.string().cuid(),
  /** Optional override; defaults to today (UTC) -> +90d. */
  windowStart: z.coerce.date().optional(),
  windowEnd: z.coerce.date().optional(),
})
