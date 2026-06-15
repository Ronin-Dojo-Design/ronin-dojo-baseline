import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"

const AttendanceStatus = z.enum(["PRESENT", "LATE", "EXCUSED", "NO_SHOW"])

const CheckInMethod = z.enum(["QR_SCAN", "MANUAL", "KIOSK_TAP", "APP"])

export const recordCheckInSchema = z.object({
  classSessionId: databaseIdSchema,
  userId: databaseIdSchema,
  method: CheckInMethod.default("MANUAL"),
  deviceId: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
})

export const markAttendanceSchema = z.object({
  classSessionId: databaseIdSchema,
  userId: databaseIdSchema,
  status: AttendanceStatus.default("PRESENT"),
  notes: z.string().trim().max(1000).optional(),
})

export const voidCheckInSchema = z.object({
  attendanceId: databaseIdSchema,
  statusAfterVoid: z.enum(["EXCUSED", "NO_SHOW"]).default("NO_SHOW"),
  notes: z.string().trim().max(1000).optional(),
})
