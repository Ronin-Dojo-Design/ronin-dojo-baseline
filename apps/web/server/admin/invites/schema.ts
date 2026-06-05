/**
 * @added   SESSION_0147 (2026-05-12)
 * @why     Zod schema + nuqs table params for invite admin CRUD
 * @wired   app/admin/invites/ (list, new, detail pages), server/admin/invites/queries.ts
 */
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import { type Invite, InviteStatus, InviteType } from "~/.generated/prisma/browser"
import { lineageCompSelectionSchema } from "~/lib/entitlements/lineage-comp"
import { getSortingStateParser } from "~/lib/parsers"

export const invitesTableParamsSchema = {
  code: parseAsString.withDefault(""),
  status: parseAsArrayOf(parseAsStringEnum<InviteStatus>(Object.values(InviteStatus))).withDefault(
    [],
  ),
  type: parseAsArrayOf(parseAsStringEnum<InviteType>(Object.values(InviteType))).withDefault([]),
  organizationId: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<Invite>().withDefault([{ id: "createdAt", desc: true }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const invitesTableParamsCache = createSearchParamsCache(invitesTableParamsSchema)
export type InvitesTableSchema = Awaited<ReturnType<typeof invitesTableParamsCache.parse>>

export const inviteSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().min(1, "Organization is required"),
  type: z.enum(["ORGANIZATION", "PROGRAM", "TOURNAMENT", "EVENT"]),
  maxUses: z.coerce.number().int().positive().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  meta: z.record(z.string(), z.unknown()).nullable().optional(),
  compTier: lineageCompSelectionSchema.optional(),
  compTermDays: z.coerce.number().int().positive().nullable().optional(),
})

export type InviteSchema = z.infer<typeof inviteSchema>
