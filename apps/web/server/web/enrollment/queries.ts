import type { Brand } from "~/.generated/prisma/client"
import { programEnrollmentPayload } from "~/server/web/enrollment/payloads"
import { db } from "~/services/db"

/**
 * Member-private enrollment read helper.
 *
 * MB-002: ProgramEnrollment has no brand/org columns, so every read scopes
 * through Program.brand + Program.organizationId.
 * D-005: no persistent "use cache" on member-private enrollment reads.
 */
export const getProgramEnrollments = async ({
  brand,
  organizationId,
  programId,
}: {
  brand: Brand
  organizationId: string
  programId: string
}) => {
  return db.programEnrollment.findMany({
    where: {
      programId,
      program: {
        brand,
        organizationId,
      },
    },
    select: programEnrollmentPayload,
    orderBy: [{ status: "asc" }, { waitlistPosition: "asc" }, { enrolledAt: "asc" }],
  })
}
