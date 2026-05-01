import type { Brand, Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Gate 9: lightweight AuditLog writer for the schedule slice.
 *
 * Wraps `db.auditLog.create` with a fail-soft try/catch so an audit failure
 * never breaks the user-visible action. Errors surface in server logs only.
 *
 * `entityType`/`action` are short canonical strings (e.g. "ClassSchedule",
 * "schedule.created"). `before`/`after` are stored as JSON snapshots; payloads
 * should be small (no nested relations, no PII beyond what already lives on the
 * row).
 */
type WriteAuditLogInput = {
  brand: Brand
  userId: string
  organizationId?: string | null
  entityType: string
  entityId: string
  action: string
  before?: Prisma.InputJsonValue | null
  after?: Prisma.InputJsonValue | null
}

export const writeScheduleAudit = async ({
  brand,
  userId,
  organizationId,
  entityType,
  entityId,
  action,
  before,
  after,
}: WriteAuditLogInput): Promise<void> => {
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
      },
    })
  } catch (error) {
    console.error("Schedule audit log write failed", { entityType, entityId, action, error })
  }
}
