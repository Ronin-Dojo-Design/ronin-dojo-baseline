"use server"

import { z } from "zod"
import { userActionClient } from "~/lib/safe-actions"
import { assertOrgAdminAccess } from "~/server/web/organization/org-admin-access"

const updateOrganizationSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]+$/),
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
 * Update organization general info from the dashboard school-form.
 * Authorized via `assertOrgAdminAccess` — org owner (by `ownerId`) OR
 * a member with the ORG_ADMIN role. Consolidated from the legacy OWNER
 * role-assignment check (drift D-017, SESSION_0300).
 *
 * @see server/web/organization/org-admin-access.ts
 */
export const updateOrganization = userActionClient
  .inputSchema(updateOrganizationSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { organizationId, ...data } = parsedInput

    await assertOrgAdminAccess(user.id, organizationId)

    const org = await db.organization.update({
      where: { id: organizationId },
      data,
    })

    revalidate({ paths: ["/dashboard", `/organizations/${org.slug}`] })
    return org
  })
