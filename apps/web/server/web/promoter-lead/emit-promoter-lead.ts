import { Brand, LeadSource, LeadStatus, type Prisma } from "~/.generated/prisma/client"
import { fuzzyMatchSchool, normalizeSchoolName } from "~/lib/dedup"
import { db } from "~/services/db"

/**
 * Promoter-outreach lead capture (SESSION_0540) — the PERSON mirror of
 * `emit-school-lead.ts`. When a member backfills a belt and free-types the coach who
 * promoted them, we capture that coach BOTH as an identity (a claimable placeholder
 * `Passport` — `ensurePromoterPlaceholder`, set as the award's `awardedByPassportId`)
 * AND, here, as a recruitment `Lead` so the coach enters the outreach / CRM pipeline to
 * be invited. Idempotent + deduped by the normalized coach name (demand-counted),
 * matching the school-lead shape.
 *
 * IDENTITY vs PIPELINE (operator decision, SESSION_0540): the coach's IDENTITY lives on
 * the placeholder Passport, NOT on the org. The `Lead.organizationId` required FK is now
 * purely the CRM *bucket* — every promoter lead anchors to ONE shared, hidden placeholder
 * org ("BBL Coach Outreach", type AFFILIATION, ownerId null); the earlier objection was
 * only that this org was standing in for the coach's identity, which it no longer does.
 * The lead is LINKED back to the placeholder Passport via `meta.passportId` (no schema
 * change — a nullable FK on Lead was deemed unnecessary churn). This never sends outreach;
 * the "invite this coach" action is an operator click.
 */

export const PROMOTER_OUTREACH_KIND = "promoter_outreach"
export const PROMOTER_OUTREACH_FOLLOW_UP_NOTE = "auto — pending promoter invite"

/** The single shared bucket org every promoter lead anchors to (see IDENTITY vs PIPELINE). */
const COACH_OUTREACH_ORG_SLUG = "bbl-coach-outreach"
const COACH_OUTREACH_ORG_NAME = "BBL Coach Outreach"

const OPEN_LEAD_STATUSES = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.TRIAL_BOOKED,
  LeadStatus.TRIAL_COMPLETED,
  LeadStatus.NURTURE,
] as const

const openPromoterLeadSelect = {
  id: true,
  organizationId: true,
  meta: true,
} satisfies Prisma.LeadSelect

type OpenPromoterLead = Prisma.LeadGetPayload<{ select: typeof openPromoterLeadSelect }>
type PromoterLeadTransaction = Pick<typeof db, "lead" | "organization" | "leadFollowUp">

type PromoterLeadMetaOptions = {
  promoterName: string
  source: string
  /** The placeholder Passport this coach's identity lives on — the link, stored in `meta.passportId`. */
  passportId: string | null
  now: Date
}

type EmitPromoterLeadInput = {
  promoterName: string
  source: string
  /** The claimable placeholder Passport minted for this coach (`ensurePromoterPlaceholder`). */
  passportId?: string | null
}

export type EmitPromoterLeadResult = {
  organizationId: string
  leadId: string
  demandCount: number
  createdLead: boolean
  matchedBy: "lead" | "none"
  /** The linked placeholder Passport id echoed back (the identity ↔ pipeline join). */
  passportId: string | null
}

const openLeadWhere = {
  brand: Brand.BBL,
  status: { in: [...OPEN_LEAD_STATUSES] },
  meta: { path: ["kind"], equals: PROMOTER_OUTREACH_KIND },
} satisfies Prisma.LeadWhereInput

function jsonRecord(meta: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return meta && typeof meta === "object" && !Array.isArray(meta)
    ? (meta as Record<string, unknown>)
    : {}
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : []
}

function uniqueWithLatestFirst(values: string[]): string[] {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))
}

function demandCountFromMeta(meta: Prisma.JsonValue | null | undefined): number {
  const count = jsonRecord(meta).demandCount
  return typeof count === "number" && Number.isFinite(count) && count > 0 ? count : 0
}

function passportIdFromMeta(meta: Prisma.JsonValue | null | undefined): string | null {
  const value = jsonRecord(meta).passportId
  return typeof value === "string" && value.length > 0 ? value : null
}

function buildPromoterLeadMeta(
  currentMeta: Prisma.JsonValue | null | undefined,
  options: PromoterLeadMetaOptions,
): Prisma.InputJsonObject {
  const record = jsonRecord(currentMeta)
  const nowIso = options.now.toISOString()
  const nextDemandCount = demandCountFromMeta(currentMeta) + 1
  const sources = uniqueWithLatestFirst([options.source, ...stringArray(record.sources)])
  // Link to the placeholder Passport — the coach's identity. Keep a prior link if this
  // demand bump carried none (a re-type without a re-resolved placeholder).
  const passportId = options.passportId ?? passportIdFromMeta(currentMeta)

  return {
    ...record,
    kind: PROMOTER_OUTREACH_KIND,
    promoterName: options.promoterName,
    promoterNameNormalized: normalizeSchoolName(options.promoterName),
    passportId,
    demandCount: nextDemandCount,
    firstDemandAt: typeof record.firstDemandAt === "string" ? record.firstDemandAt : nowIso,
    lastDemandAt: nowIso,
    sources,
  } satisfies Prisma.InputJsonObject
}

function promoterLeadName(lead: OpenPromoterLead): string {
  const metaName = jsonRecord(lead.meta).promoterName
  return typeof metaName === "string" ? metaName : ""
}

function resultFromLead(
  lead: Pick<OpenPromoterLead, "id" | "organizationId" | "meta">,
  flags: Pick<EmitPromoterLeadResult, "createdLead" | "matchedBy">,
): EmitPromoterLeadResult {
  return {
    organizationId: lead.organizationId,
    leadId: lead.id,
    demandCount: demandCountFromMeta(lead.meta),
    passportId: passportIdFromMeta(lead.meta),
    ...flags,
  }
}

async function findMatchedOpenLead(
  tx: PromoterLeadTransaction,
  promoterName: string,
): Promise<OpenPromoterLead | null> {
  const openLeads = await tx.lead.findMany({
    where: openLeadWhere,
    select: openPromoterLeadSelect,
  })

  return (
    fuzzyMatchSchool(
      promoterName,
      openLeads.map(lead => ({ name: promoterLeadName(lead), lead })),
    )?.lead ?? null
  )
}

/** Find-or-create the single shared coach-outreach bucket org. Upsert on the fixed
 *  compound-unique slug so concurrent first writes never collide (CRM bucket, not identity). */
async function getCoachOutreachOrgId(tx: PromoterLeadTransaction): Promise<string> {
  const org = await tx.organization.upsert({
    where: { brand_slug: { brand: Brand.BBL, slug: COACH_OUTREACH_ORG_SLUG } },
    create: {
      brand: Brand.BBL,
      name: COACH_OUTREACH_ORG_NAME,
      slug: COACH_OUTREACH_ORG_SLUG,
      type: "AFFILIATION",
      ownerId: null,
    },
    update: {},
    select: { id: true },
  })
  return org.id
}

async function bumpPromoterLead(
  tx: PromoterLeadTransaction,
  lead: OpenPromoterLead,
  options: PromoterLeadMetaOptions,
): Promise<EmitPromoterLeadResult> {
  const updated = await tx.lead.update({
    where: { id: lead.id },
    data: { meta: buildPromoterLeadMeta(lead.meta, options) },
    select: openPromoterLeadSelect,
  })

  return resultFromLead(updated, { createdLead: false, matchedBy: "lead" })
}

async function createPromoterLead(
  tx: PromoterLeadTransaction,
  organizationId: string,
  options: PromoterLeadMetaOptions,
): Promise<EmitPromoterLeadResult> {
  const createdLead = await tx.lead.create({
    data: {
      brand: Brand.BBL,
      organizationId,
      source: LeadSource.OTHER,
      firstName: options.promoterName,
      email: null,
      notes: `Coach outreach demand captured from ${options.source}.`,
      meta: buildPromoterLeadMeta(null, options),
    },
    select: openPromoterLeadSelect,
  })

  await tx.leadFollowUp.create({
    data: {
      leadId: createdLead.id,
      channel: "email",
      notes: PROMOTER_OUTREACH_FOLLOW_UP_NOTE,
    },
  })

  return resultFromLead(createdLead, { createdLead: true, matchedBy: "none" })
}

/**
 * Emit / bump the recruitment lead for a free-typed coach, linked to their placeholder
 * Passport via `meta.passportId`. Runs in its OWN transaction (matching the school-lead
 * pattern), fired from the belt fact-save path alongside `ensurePromoterPlaceholder`.
 */
export async function emitPromoterLead(
  input: EmitPromoterLeadInput,
): Promise<EmitPromoterLeadResult | null> {
  const promoterName = input.promoterName.trim()
  if (!promoterName) return null

  const options = {
    promoterName,
    source: input.source.trim() || "unknown",
    passportId: input.passportId ?? null,
    now: new Date(),
  } satisfies PromoterLeadMetaOptions

  return db.$transaction(
    async tx => {
      const matchedOpenLead = await findMatchedOpenLead(tx, promoterName)
      if (matchedOpenLead) return bumpPromoterLead(tx, matchedOpenLead, options)

      const organizationId = await getCoachOutreachOrgId(tx)
      return createPromoterLead(tx, organizationId, options)
    },
    // The find-or-create spans a few sequential queries; a generous ceiling keeps it off the
    // default 5s interactive-tx limit on a cold Prisma engine (the app server is always warm, so
    // this ceiling never triggers in prod — it only saves a cold-start standalone unit test).
    { maxWait: 10000, timeout: 20000 },
  )
}
