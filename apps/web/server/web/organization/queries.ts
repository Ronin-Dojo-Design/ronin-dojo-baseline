import { cacheLife, cacheTag } from "next/cache"
import { cache } from "react"
import { db } from "~/services/db"
import {
  organizationDetailPayload,
  organizationManyPayload,
  organizationOnePayload,
} from "~/server/web/organization/payloads"

export const getOrganizationById = cache(async (id: string) => {
  return db.organization.findUnique({
    where: { id },
    select: organizationOnePayload,
  })
})

export const getOrganizationBySlug = async (brand: string, slug: string) => {
  "use cache"

  cacheTag(`organization-${slug}`)
  cacheLife("minutes")

  return db.organization.findUnique({
    where: { brand_slug: { brand: brand as any, slug } },
    select: organizationDetailPayload,
  })
}

export const getOrganizationByInviteCode = cache(async (inviteCode: string) => {
  return db.organization.findUnique({
    where: { inviteCode },
    select: organizationManyPayload,
  })
})

export const getOrganizationsByBrand = async (brand: string) => {
  "use cache"

  cacheTag("organizations")
  cacheLife("minutes")

  return db.organization.findMany({
    where: { brand: brand as any },
    select: organizationManyPayload,
    orderBy: { name: "asc" },
  })
}

export const getUserMemberships = cache(async (userId: string) => {
  return db.membership.findMany({
    where: { userId },
    select: {
      id: true,
      brand: true,
      status: true,
      joinedAt: true,
      createdAt: true,
      organization: {
        select: { id: true, name: true, slug: true, brand: true },
      },
      discipline: {
        select: { id: true, name: true, slug: true },
      },
      style: {
        select: { id: true, name: true },
      },
      rank: {
        select: { id: true, name: true, sortOrder: true },
      },
      roleAssignments: {
        select: {
          role: { select: { id: true, code: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
})

export const getSystemRoles = async () => {
  "use cache"

  cacheTag("system-roles")
  cacheLife("infinite")

  return db.role.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  })
}
