"use server"

import { after } from "next/server"
import { z } from "zod/v4"
import { adminActionClient } from "~/lib/safe-actions"

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
 * Update OrgSettings theme fields. Uses `update` since OrgSettings rows
 * are created when the org is created (not upsert — the row must exist).
 */
export const updateOrgTheme = adminActionClient
  .inputSchema(orgThemeSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { organizationId, ...raw } = parsedInput

    const data = {
      primaryColor: toNullable(raw.primaryColor),
      primaryFgColor: toNullable(raw.primaryFgColor),
      accentColor: toNullable(raw.accentColor),
      accentFgColor: toNullable(raw.accentFgColor),
      logoUrl: toNullable(raw.logoUrl),
      faviconUrl: toNullable(raw.faviconUrl),
      ogImageUrl: toNullable(raw.ogImageUrl),
    }

    const settings = await db.orgSettings.update({
      where: { organizationId },
      data,
    })

    after(async () => {
      revalidate({
        paths: [`/app/organizations/${organizationId}/theme`, "/app/organizations"],
        tags: [`org-settings-${organizationId}`],
      })
    })

    return settings
  })
