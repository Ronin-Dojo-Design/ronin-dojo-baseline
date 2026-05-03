import type { Prisma } from "~/.generated/prisma/client"

export const waiverPayload = {
  id: true,
  type: true,
  title: true,
  version: true,
  isRequired: true,
  isActive: true,
  brand: true,
  organizationId: true,
  programs: {
    select: {
      programId: true,
      required: true,
    },
  },
} satisfies Prisma.WaiverSelect

export const waiverSignaturePayload = {
  id: true,
  signedAt: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  waiverId: true,
  userId: true,
  signedOnBehalfOfId: true,
  waiver: { select: waiverPayload },
} satisfies Prisma.WaiverSignatureSelect

export type WaiverRecord = Prisma.WaiverGetPayload<{
  select: typeof waiverPayload
}>

export type WaiverSignatureRecord = Prisma.WaiverSignatureGetPayload<{
  select: typeof waiverSignaturePayload
}>
