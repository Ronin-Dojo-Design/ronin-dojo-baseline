"use server"

import { after } from "next/server"
import { z } from "zod/v4"
import { adminActionClient } from "~/lib/safe-actions"

/** Convert empty strings to null for DB storage */
const toNullable = (v: string | undefined) => (v === "" || v === undefined ? null : v)

const brandSettingsSchema = z.object({
  brand: z.enum(["BASELINE_MARTIAL_ARTS", "RONIN_DOJO_DESIGN", "BBL", "WEKAF"]),
  primaryColor: z.string().optional(),
  primaryFgColor: z.string().optional(),
  accentColor: z.string().optional(),
  accentFgColor: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  ogImageUrl: z.string().optional(),
})

/**
 * Upsert brand settings — creates if the brand row doesn't exist yet,
 * updates if it does. Only non-undefined fields are written.
 */
export const upsertBrandSettings = adminActionClient
  .inputSchema(brandSettingsSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { brand, ...raw } = parsedInput

    // Convert empty strings to null for DB storage
    const data = {
      primaryColor: toNullable(raw.primaryColor),
      primaryFgColor: toNullable(raw.primaryFgColor),
      accentColor: toNullable(raw.accentColor),
      accentFgColor: toNullable(raw.accentFgColor),
      logoUrl: toNullable(raw.logoUrl),
      faviconUrl: toNullable(raw.faviconUrl),
      ogImageUrl: toNullable(raw.ogImageUrl),
    }

    const settings = await db.brandSettings.upsert({
      where: { brand },
      create: { brand, ...data },
      update: data,
    })

    after(async () => {
      revalidate({
        paths: ["/admin/brand-settings", "/"],
        tags: ["brand-settings"],
      })
    })

    return settings
  })
