import type { Brand, Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Lightweight AuditLog writer for School Operations slices.
 *
 * Fail-soft by design: audit failures are logged server-side but never break
 * the user-visible action. Entity/action strings are canonical callsite
 * literals, not Prisma enums.
 */
export type WriteSchoolOpsAuditInput = {
  brand: Brand
  userId: string
  organizationId?: string | null
  entityType: string
  entityId: string
  action: string
  before?: Prisma.InputJsonValue | null
  after?: Prisma.InputJsonValue | null
  ipAddress?: string | null
  userAgent?: string | null
}

export const writeSchoolOpsAudit = async ({
  brand,
  userId,
  organizationId,
  entityType,
  entityId,
  action,
  before,
  after,
  ipAddress,
  userAgent,
}: WriteSchoolOpsAuditInput): Promise<void> => {
  try {
    await db.auditLog.create({
      data: {
        brand,
        userId,
        organizationId: organizationId ?? null,
        entityType,
        entityId,
        action,
        before: before ?? undefined,
        after: after ?? undefined,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    })
  } catch (error) {
    console.error("School ops audit log write failed", { entityType, entityId, action, error })
  }
}
