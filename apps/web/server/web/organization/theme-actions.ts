"use server"

import { after } from "next/server"
import { z } from "zod/v4"
import { userActionClient } from "~/lib/safe-actions"
import { db } from "~/services/db"

/** Convert empty strings to null for DB storage */
const toNullable = (v: string | undefined) => (v === "" || v === undefined ? null : v)

const orgThemeSchema = z.object({
  organizationId: z.string().min(1),
  primaryColor: z.string().optional(),
  primaryFgColor: z.string().optional(),
  accentColor: z.string().optional(),
  accentFgColor: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  ogImageUrl: z.string().optional(),
})

/**
 * Check if a user is authorized to manage an org's theme.
 * Authorized = org owner OR has a membership with ORG_ADMIN role.
 */
async function assertOrgThemeAccess(userId: string, organizationId: string) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { ownerId: true },
  })

  if (!org) throw new Error("Organization not found")
  if (org.ownerId === userId) return // owner is always authorized

  const adminMembership = await db.membership.findFirst({
    where: {
      userId,
      organizationId,
      roleAssignments: {
        some: { role: { code: "ORG_ADMIN" } },
      },
    },
  })

  if (!adminMembership) {
    throw new Error("ACCESS_DENIED")
  }
}

/**
 * Self-service org theme update. Authorized for org owner or ORG_ADMIN role.
 */
export const updateOrgThemeSelfService = userActionClient
  .inputSchema(orgThemeSchema)
  .action(async ({ parsedInput, ctx: { user, db: prisma, revalidate } }) => {
    const { organizationId, ...raw } = parsedInput

    await assertOrgThemeAccess(user.id, organizationId)

    const data = {
      primaryColor: toNullable(raw.primaryColor),
      primaryFgColor: toNullable(raw.primaryFgColor),
      accentColor: toNullable(raw.accentColor),
      accentFgColor: toNullable(raw.accentFgColor),
      logoUrl: toNullable(raw.logoUrl),
      faviconUrl: toNullable(raw.faviconUrl),
      ogImageUrl: toNullable(raw.ogImageUrl),
    }

    const settings = await prisma.orgSettings.update({
      where: { organizationId },
      data,
    })

    after(async () => {
      // Fetch slug for path revalidation
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { slug: true },
      })
      if (org) {
        revalidate({
          paths: [`/organizations/${org.slug}`, `/organizations/${org.slug}/settings/theme`],
          tags: [`org-settings-${organizationId}`, `organization-${org.slug}`],
        })
      }
    })

    return settings
  })
