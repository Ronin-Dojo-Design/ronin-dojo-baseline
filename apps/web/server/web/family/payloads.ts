import type { Prisma } from "~/.generated/prisma/client"

export const familyUserPayload = {
  id: true,
  name: true,
  email: true,
  passport: {
    select: {
      dob: true,
      displayName: true,
      legalFirstName: true,
      legalLastName: true,
    },
  },
} satisfies Prisma.UserSelect

export const familyMemberPayload = {
  id: true,
  role: true,
  isPrimary: true,
  createdAt: true,
  familyGroupId: true,
  userId: true,
  user: { select: familyUserPayload },
} satisfies Prisma.FamilyMemberSelect

export const familyGroupPayload = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  members: {
    select: familyMemberPayload,
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
  },
} satisfies Prisma.FamilyGroupSelect

export type FamilyMemberRecord = Prisma.FamilyMemberGetPayload<{
  select: typeof familyMemberPayload
}>

export type FamilyGroupRecord = Prisma.FamilyGroupGetPayload<{
  select: typeof familyGroupPayload
}>
