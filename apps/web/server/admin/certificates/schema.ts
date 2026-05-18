import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import {
  Brand,
  CertificateDeliveryMethod,
  type CertificateTemplate,
  CertificationType,
} from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const certificatesTableParamsSchema = {
  name: parseAsString.withDefault(""),
  sort: getSortingStateParser<CertificateTemplate>().withDefault([{ id: "createdAt", desc: true }]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const certificatesTableParamsCache = createSearchParamsCache(certificatesTableParamsSchema)
export type CertificatesTableSchema = Awaited<ReturnType<typeof certificatesTableParamsCache.parse>>

export const certificateTemplateSchema = z.object({
  id: z.string().optional(),
  brand: z.enum(Brand),
  name: z.string().min(1, "Name is required"),
  type: z.enum(CertificationType),
  deliveryMethod: z.enum(CertificateDeliveryMethod).default("DIGITAL"),
  description: z.string().optional(),
  backgroundUrl: z.string().optional(),
  priceCents: z.number().int().min(0).default(0),
  currency: z.string().length(3).default("USD"),
  isActive: z.boolean().default(true),
  organizationId: z.string().optional().or(z.literal("")),
})

export type CertificateTemplateSchema = z.infer<typeof certificateTemplateSchema>
