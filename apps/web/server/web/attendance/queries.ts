import type { Brand } from "~/.generated/prisma/client"
import { attendanceRecordPayload } from "~/server/web/attendance/payloads"
import { db } from "~/services/db"

export const ATTENDANCE_STAFF_ROLE_CODES = ["OWNER", "ORG_ADMIN", "INSTRUCTOR"] as const

/**
 * Member-private attendance read helper.
 *
 * MB-002: brand and organization predicates are explicit through the
 * ClassSession -> ClassSchedule scope chain.
 * D-005: no persistent "use cache" on attendance/member-private reads.
 */
export const getAttendanceByClassSession = async ({
  brand,
  organizationId,
  classSessionId,
}: {
  brand: Brand
  organizationId: string
  classSessionId: string
}) => {
  return db.attendance.findMany({
    where: {
      classSessionId,
      classSession: {
        classSchedule: {
          brand,
          organizationId,
        },
      },
    },
    select: attendanceRecordPayload,
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  })
}
