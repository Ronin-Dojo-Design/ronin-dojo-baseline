import { Brand, LeadSource, LeadStatus, type Prisma } from "~/.generated/prisma/client"
import { fuzzyMatchSchool, normalizeSchoolName } from "~/lib/dedup"
import { generateUniqueSlug } from "~/lib/slug"
import {
  demandCountFromMeta,
  jsonRecord,
  stringArray,
  uniqueWithLatestFirst,
} from "~/server/web/lead/lead-meta-helpers"
import { db } from "~/services/db"

export const SCHOOL_OUTREACH_KIND = "school_outreach"
export const SCHOOL_OUTREACH_FOLLOW_UP_NOTE = "auto — pending invite"

const OPEN_LEAD_STATUSES = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.TRIAL_BOOKED,
  LeadStatus.TRIAL_COMPLETED,
  LeadStatus.NURTURE,
] as const

const MAX_STORED_MEMBER_EMAILS = 10

const openSchoolLeadSelect = {
  id: true,
  organizationId: true,
  meta: true,
  organization: { select: { id: true, name: true } },
} satisfies Prisma.LeadSelect

type OpenSchoolLead = Prisma.LeadGetPayload<{ select: typeof openSchoolLeadSelect }>
type SchoolLeadTransaction = Pick<typeof db, "lead" | "organization" | "leadFollowUp">
type SchoolLeadOrganization = { id: string; name: string }

type SchoolLeadMetaOptions = {
  schoolName: string
  memberEmail: string | null
  source: string
  now: Date
}

type EmitSchoolLeadInput = {
  schoolName: string
  memberEmail?: string | null
  source: string
  /**
   * ISO 3166-1 alpha-2 country for the school (Petey Plan 0477 Locked #7 — country
   * belongs to the SCHOOL, not the award). Only ever SETS a placeholder org's
   * `country` on CREATE; a matched/existing org's country is left untouched (we
   * never overwrite an org's own data from an unverified member freetext entry).
   */
  country?: string | null
}

export type EmitSchoolLeadResult = {
  organizationId: string
  leadId: string
  demandCount: number
  createdOrganization: boolean
  createdLead: boolean
  matchedBy: "lead" | "organization" | "none"
}

const openLeadWhere = {
  brand: Brand.BBL,
  status: { in: [...OPEN_LEAD_STATUSES] },
  meta: { path: ["kind"], equals: SCHOOL_OUTREACH_KIND },
} satisfies Prisma.LeadWhereInput

function buildSchoolLeadMeta(
  currentMeta: Prisma.JsonValue | null | undefined,
  options: SchoolLeadMetaOptions,
): Prisma.InputJsonObject {
  const record = jsonRecord(currentMeta)
  const nowIso = options.now.toISOString()
  const nextDemandCount = demandCountFromMeta(currentMeta) + 1
  const currentEmails = stringArray(record.memberEmails)
  const memberEmails = options.memberEmail
    ? uniqueWithLatestFirst([options.memberEmail, ...currentEmails]).slice(
        0,
        MAX_STORED_MEMBER_EMAILS,
      )
    : currentEmails
  const sources = uniqueWithLatestFirst([options.source, ...stringArray(record.sources)])

  return {
    ...record,
    kind: SCHOOL_OUTREACH_KIND,
    schoolName: options.schoolName,
    schoolNameNormalized: normalizeSchoolName(options.schoolName),
    demandCount: nextDemandCount,
    firstDemandAt: typeof record.firstDemandAt === "string" ? record.firstDemandAt : nowIso,
    lastDemandAt: nowIso,
    lastMemberEmail: options.memberEmail,
    memberEmails,
    sources,
  } satisfies Prisma.InputJsonObject
}

function schoolLeadName(lead: OpenSchoolLead): string {
  const metaSchoolName = jsonRecord(lead.meta).schoolName
  return typeof metaSchoolName === "string" && metaSchoolName.trim().length > 0
    ? metaSchoolName
    : lead.organization.name
}

function resultFromLead(
  lead: Pick<OpenSchoolLead, "id" | "organizationId" | "meta">,
  flags: Pick<EmitSchoolLeadResult, "createdOrganization" | "createdLead" | "matchedBy">,
): EmitSchoolLeadResult {
  return {
    organizationId: lead.organizationId,
    leadId: lead.id,
    demandCount: demandCountFromMeta(lead.meta),
    ...flags,
  }
}

async function findMatchedOpenLead(
  tx: SchoolLeadTransaction,
  schoolName: string,
): Promise<OpenSchoolLead | null> {
  const openLeads = await tx.lead.findMany({
    where: openLeadWhere,
    select: openSchoolLeadSelect,
  })

  return (
    fuzzyMatchSchool(
      schoolName,
      openLeads.map(lead => ({ name: schoolLeadName(lead), lead })),
    )?.lead ?? null
  )
}

async function bumpSchoolLead(
  tx: SchoolLeadTransaction,
  lead: OpenSchoolLead,
  options: SchoolLeadMetaOptions,
  matchedBy: "lead" | "organization",
): Promise<EmitSchoolLeadResult> {
  const updated = await tx.lead.update({
    where: { id: lead.id },
    data: { meta: buildSchoolLeadMeta(lead.meta, options) },
    select: openSchoolLeadSelect,
  })

  return resultFromLead(updated, {
    createdOrganization: false,
    createdLead: false,
    matchedBy,
  })
}

async function createPlaceholderOrganization(
  tx: SchoolLeadTransaction,
  schoolName: string,
  country: string | null,
): Promise<SchoolLeadOrganization> {
  return tx.organization.create({
    data: {
      brand: Brand.BBL,
      name: schoolName,
      slug: await generateUniqueSlug({
        source: schoolName,
        isSlugTaken: slug =>
          tx.organization
            .findUnique({
              where: { brand_slug: { brand: Brand.BBL, slug } },
              select: { slug: true },
            })
            .then(Boolean),
      }),
      type: "SCHOOL",
      ownerId: null,
      // Country only lands on a NEW placeholder org (Locked #7); undefined keeps
      // the schema default rather than nulling it out.
      ...(country ? { country } : {}),
    },
    select: { id: true, name: true },
  })
}

async function resolveOrganization(
  tx: SchoolLeadTransaction,
  schoolName: string,
  country: string | null,
): Promise<{ organization: SchoolLeadOrganization; createdOrganization: boolean }> {
  const organizations = await tx.organization.findMany({
    where: { brand: Brand.BBL },
    select: { id: true, name: true },
  })
  const matchedOrganization = fuzzyMatchSchool(schoolName, organizations)

  return matchedOrganization
    ? { organization: matchedOrganization, createdOrganization: false }
    : {
        organization: await createPlaceholderOrganization(tx, schoolName, country),
        createdOrganization: true,
      }
}

function findExistingLeadForOrganization(
  tx: SchoolLeadTransaction,
  organizationId: string,
): Promise<OpenSchoolLead | null> {
  return tx.lead.findFirst({
    where: { ...openLeadWhere, organizationId },
    select: openSchoolLeadSelect,
  })
}

async function createSchoolLead(
  tx: SchoolLeadTransaction,
  organization: SchoolLeadOrganization,
  options: SchoolLeadMetaOptions,
  createdOrganization: boolean,
): Promise<EmitSchoolLeadResult> {
  const createdLead = await tx.lead.create({
    data: {
      brand: Brand.BBL,
      organizationId: organization.id,
      source: LeadSource.OTHER,
      firstName: options.schoolName,
      email: null,
      notes: `School outreach demand captured from ${options.source}.`,
      meta: buildSchoolLeadMeta(null, options),
    },
    select: openSchoolLeadSelect,
  })

  await tx.leadFollowUp.create({
    data: {
      leadId: createdLead.id,
      channel: "email",
      notes: SCHOOL_OUTREACH_FOLLOW_UP_NOTE,
    },
  })

  return resultFromLead(createdLead, {
    createdOrganization,
    createdLead: true,
    matchedBy: createdOrganization ? "none" : "organization",
  })
}

/** The find-or-bump sequence, on a caller-supplied tx (the award tx, or our own below). */
async function emitSchoolLeadOnTx(
  tx: SchoolLeadTransaction,
  schoolName: string,
  country: string | null,
  options: SchoolLeadMetaOptions,
): Promise<EmitSchoolLeadResult> {
  const matchedOpenLead = await findMatchedOpenLead(tx, schoolName)
  if (matchedOpenLead) return bumpSchoolLead(tx, matchedOpenLead, options, "lead")

  const { organization, createdOrganization } = await resolveOrganization(tx, schoolName, country)
  const existingLead = await findExistingLeadForOrganization(tx, organization.id)
  if (existingLead) return bumpSchoolLead(tx, existingLead, options, "organization")

  return createSchoolLead(tx, organization, options, createdOrganization)
}

/**
 * Emit / bump the school-outreach lead for a free-typed school. Pass `tx` to fold this into the
 * caller's award transaction (WL-P3-44 — no orphan placeholder org / lead on a failed award write);
 * omit it to run in its own transaction. Never sends outreach.
 */
export async function emitSchoolLead(
  input: EmitSchoolLeadInput,
  tx?: SchoolLeadTransaction,
): Promise<EmitSchoolLeadResult> {
  const schoolName = input.schoolName.trim()
  if (!schoolName) {
    throw new Error("School name is required")
  }

  const country = input.country?.trim().toUpperCase() || null

  const options = {
    schoolName,
    memberEmail: input.memberEmail?.trim().toLowerCase() || null,
    source: input.source.trim() || "unknown",
    now: new Date(),
  } satisfies SchoolLeadMetaOptions

  if (tx) return emitSchoolLeadOnTx(tx, schoolName, country, options)

  return db.$transaction(tx => emitSchoolLeadOnTx(tx, schoolName, country, options), {
    maxWait: 10000,
    timeout: 20000,
  })
}
