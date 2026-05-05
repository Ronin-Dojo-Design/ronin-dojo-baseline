import type { Prisma } from "~/.generated/prisma/client"

// ---------------------------------------------------------------------------
// Organization payloads — Dirstarter L1 pattern
// ---------------------------------------------------------------------------

export const organizationDisciplinePayload = {
  discipline: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.OrganizationDisciplineSelect

export const organizationOwnerPayload = {
  select: { id: true, name: true },
} satisfies Prisma.Organization$ownerArgs

export const organizationManyPayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  city: true,
  state: true,
  country: true,
  createdAt: true,
  ownerId: true,
  disciplines: { select: organizationDisciplinePayload },
  _count: { select: { memberships: true } },
} satisfies Prisma.OrganizationSelect

export const organizationOnePayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  zip: true,
  country: true,
  websiteUrl: true,
  inviteCode: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true,
  owner: organizationOwnerPayload,
  disciplines: { select: organizationDisciplinePayload },
  _count: { select: { memberships: true } },
} satisfies Prisma.OrganizationSelect

export const organizationDetailPayload = {
  ...organizationOnePayload,
  memberships: {
    select: {
      id: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
      discipline: { select: { id: true, name: true } },
      roleAssignments: {
        select: { role: { select: { id: true, code: true, name: true } } },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  owner: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OrganizationSelect

export type OrganizationMany = Prisma.OrganizationGetPayload<{
  select: typeof organizationManyPayload
}>
export type OrganizationOne = Prisma.OrganizationGetPayload<{
  select: typeof organizationOnePayload
}>
export type OrganizationDetail = Prisma.OrganizationGetPayload<{
  select: typeof organizationDetailPayload
}>
