import { z } from "zod"

const AttendanceStatus = z.enum(["PRESENT", "LATE", "EXCUSED", "NO_SHOW"])

const CheckInMethod = z.enum(["QR_SCAN", "MANUAL", "KIOSK_TAP", "APP"])

export const recordCheckInSchema = z.object({
  classSessionId: z.string().cuid(),
  userId: z.string().cuid(),
  method: CheckInMethod.default("MANUAL"),
  deviceId: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
})

export const markAttendanceSchema = z.object({
  classSessionId: z.string().cuid(),
  userId: z.string().cuid(),
  status: AttendanceStatus.default("PRESENT"),
  notes: z.string().trim().max(1000).optional(),
})

export const voidCheckInSchema = z.object({
  attendanceId: z.string().cuid(),
  statusAfterVoid: z.enum(["EXCUSED", "NO_SHOW"]).default("NO_SHOW"),
  notes: z.string().trim().max(1000).optional(),
})
