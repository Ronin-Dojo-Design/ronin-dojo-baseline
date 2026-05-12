import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import type { PricingPlan } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const pricingPlansTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<PricingPlan>().withDefault([{ id: "createdAt", desc: true }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const pricingPlansTableParamsCache = createSearchParamsCache(pricingPlansTableParamsSchema)
export type PricingPlansTableSchema = Awaited<ReturnType<typeof pricingPlansTableParamsCache.parse>>

export const pricingPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  pricingModel: z.enum([
    "MONTHLY",
    "ANNUAL",
    "DROP_IN",
    "CLASS_PACK",
    "PUNCH_CARD",
    "PRIVATE_LESSON",
    "PER_TEST",
    "FREE_TRIAL",
    "INTRO_PACK",
    "CUSTOM",
  ]),
  amountCents: z.coerce.number().int().min(0, "Amount must be 0 or greater"),
  currency: z.string().length(3).default("USD"),
  intervalMonths: z.coerce.number().int().min(1).optional().nullable(),
  classCount: z.coerce.number().int().min(1).optional().nullable(),
  punchCardSize: z.coerce.number().int().min(1).optional().nullable(),
  bonusSessions: z.coerce.number().int().min(0).optional().nullable(),
  isPrivateLesson: z.boolean().default(false),
  trialDays: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  stripeProductId: z.string().optional().nullable(),
  stripePriceId: z.string().optional().nullable(),
  organizationId: z.string().min(1, "Organization is required"),
  programId: z.string().optional().nullable(),
  entitlementIds: z.array(z.string()).optional(),
  metadata: z.union([
    z.string().transform((val, ctx) => {
      if (!val || val.trim() === "") return null
      try {
        return JSON.parse(val) as Record<string, unknown>
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" })
        return z.NEVER
      }
    }),
    z.record(z.string(), z.unknown()),
  ]).optional().nullable(),
})

export type PricingPlanSchema = z.infer<typeof pricingPlanSchema>
