import type { Brand } from "~/.generated/prisma/client"
import { leadPayload } from "~/server/web/lead/payloads"
import { db } from "~/services/db"

export const getLeadsForOrganization = async ({
  brand,
  organizationId,
}: {
  brand: Brand
  organizationId: string
}) => {
  return db.lead.findMany({
    where: {
      brand,
      organizationId,
    },
    select: leadPayload,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  })
}
