import type { Brand } from "~/.generated/prisma/client"
import { familyMemberPayload } from "~/server/web/family/payloads"
import { db } from "~/services/db"

/**
 * Staff-private family read helper.
 *
 * FamilyGroup has no brand/org column, so scope is enforced by returning only
 * FamilyMember rows whose user has an ACTIVE same-brand/same-org Membership.
 */
export const getFamilyMembersForOrganization = async ({
  brand,
  organizationId,
  familyGroupId,
}: {
  brand: Brand
  organizationId: string
  familyGroupId: string
}) => {
  return db.familyMember.findMany({
    where: {
      familyGroupId,
      user: {
        memberships: {
          some: {
            brand,
            organizationId,
            status: "ACTIVE",
          },
        },
      },
    },
    select: familyMemberPayload,
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  })
}
