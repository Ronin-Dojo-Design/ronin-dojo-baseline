"use server"

import { after } from "next/server"
import { z } from "zod/v4"
import { userActionClient } from "~/lib/safe-actions"
import { assertOrgAdminAccess } from "~/server/web/organization/org-admin-access"

const updateOrgGeneralInfoSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric and dashes only"),
  description: z.string().max(2000).optional(),
  websiteUrl: z.string().max(2048).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phoneE164: z.string().max(32).optional(),
  addressLine1: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(2).optional(),
})

/**
 * Self-service org general-info update. Authorized for org owner or ORG_ADMIN
 * via `assertOrgAdminAccess` — consistent with theme + members. Distinct from
 * the legacy dashboard `updateOrganization`, which gates on an OWNER
 * role-assignment (auth-drift logged in SESSION_0298).
 */
export const updateOrgGeneralInfo = userActionClient
  .inputSchema(updateOrgGeneralInfoSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { organizationId, ...data } = parsedInput

    await assertOrgAdminAccess(user.id, organizationId)

    const org = await db.organization.update({
      where: { id: organizationId },
      data,
    })

    after(async () => {
      revalidate({
        paths: [`/organizations/${org.slug}`, `/organizations/${org.slug}/settings/general`],
        tags: [`organization-${org.slug}`],
      })
    })

    return org
  })
