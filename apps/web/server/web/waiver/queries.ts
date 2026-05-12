import type { Brand } from "~/.generated/prisma/client"
import { waiverPayload, waiverSignaturePayload } from "~/server/web/waiver/payloads"
import { db } from "~/services/db"

export const getActiveWaiversForProgram = async ({
  brand,
  organizationId,
  programId,
}: {
  brand: Brand
  organizationId: string
  programId: string
}) => {
  return db.waiver.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ brand }, { brand: null }] },
        { OR: [{ organizationId }, { organizationId: null }] },
      ],
      programs: {
        some: {
          programId,
          program: {
            brand,
            organizationId,
          },
        },
      },
    },
    select: waiverPayload,
    orderBy: [{ isRequired: "desc" }, { title: "asc" }],
  })
}

export const getWaiverSignaturesForOrganization = async ({
  brand,
  organizationId,
  userId,
}: {
  brand: Brand
  organizationId: string
  userId: string
}) => {
  return db.waiverSignature.findMany({
    where: {
      AND: [
        { OR: [{ userId }, { signedOnBehalfId: userId }] },
        {
          OR: [
            {
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
            {
              signedOnBehalfOf: {
                memberships: {
                  some: {
                    brand,
                    organizationId,
                    status: "ACTIVE",
                  },
                },
              },
            },
          ],
        },
      ],
      waiver: {
        isActive: true,
        AND: [
          { OR: [{ brand }, { brand: null }] },
          { OR: [{ organizationId }, { organizationId: null }] },
        ],
      },
    },
    select: waiverSignaturePayload,
    orderBy: { signedAt: "desc" },
  })
}
