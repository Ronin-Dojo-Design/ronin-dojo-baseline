import type { Prisma } from "~/.generated/prisma/client"

export const attendanceCheckInPayload = {
  id: true,
  method: true,
  deviceId: true,
  ipAddress: true,
  timestamp: true,
  matchedToAttendanceId: true,
  createdAt: true,
  userId: true,
} satisfies Prisma.CheckInSelect

export const attendanceRecordPayload = {
  id: true,
  status: true,
  notes: true,
  createdAt: true,
  userId: true,
  classSessionId: true,
  checkIn: { select: attendanceCheckInPayload },
} satisfies Prisma.AttendanceSelect

export type AttendanceRecord = Prisma.AttendanceGetPayload<{
  select: typeof attendanceRecordPayload
}>

export type AttendanceCheckIn = Prisma.CheckInGetPayload<{
  select: typeof attendanceCheckInPayload
}>
