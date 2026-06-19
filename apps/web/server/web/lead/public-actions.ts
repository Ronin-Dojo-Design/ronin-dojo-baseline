"use server"

import { headers } from "next/headers"
import { after } from "next/server"
import { z } from "zod"
import { type Prisma, ToolStatus } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand, getRequestOrigin } from "~/lib/brand-context"
import {
  type BblJoinLegacyMembershipPath,
  notifyAdminOfBblJoinLegacy,
  notifyUserOfBblJoinLegacy,
} from "~/lib/notifications"
import { publicActionClient } from "~/lib/safe-actions"
import { createSlugTakenCheck, generateUniqueSlug } from "~/lib/slug"
import { leadPayload } from "~/server/web/lead/payloads"

const publicLeadSchema = z.object({
  organizationId: z.string().min(1),
  programId: z.string().optional(),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email(),
  phoneE164: z.string().trim().max(32).optional().or(z.literal("")),
})

const httpUrlSchema = z
  .string()
  .trim()
  .url("Use a valid http or https URL")
  .refine(
    value => {
      // new URL() throws on invalid/empty input; fail closed instead of letting the
      // throw escape and abort validation (mirrors the wizard schema fix).
      try {
        return ["http:", "https:"].includes(new URL(value).protocol)
      } catch {
        return false
      }
    },
    { message: "Use a valid http or https URL" },
  )

const legacyInterestSchema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  preferredName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email(),
  phoneE164: z.string().trim().max(32).optional().or(z.literal("")),
  currentRank: z.string().trim().max(200).optional().or(z.literal("")),
  role: z.enum(["STUDENT", "BLACK_BELT", "INSTRUCTOR", "SCHOOL_OWNER", "OTHER"]).default("STUDENT"),
  schoolName: z.string().trim().max(160).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  trainedUnder: z.string().trim().max(500).optional().or(z.literal("")),
  represent: z.string().trim().max(500).optional().or(z.literal("")),
  evidenceUrl: httpUrlSchema.optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  profileUrl: httpUrlSchema.optional().or(z.literal("")),
  instagramUrl: httpUrlSchema.optional().or(z.literal("")),
  martialArtsExperience: z.string().trim().max(1200).optional().or(z.literal("")),
  primaryGoal: z
    .enum(["CLAIM_PROFILE", "PRESERVE_LINEAGE", "PROMOTE_SCHOOL", "CONNECT_COMMUNITY", "EXPLORE"])
    .default("PRESERVE_LINEAGE"),
  discoverySource: z
    .enum(["INSTAGRAM", "FACEBOOK", "GOOGLE", "FRIEND", "INSTRUCTOR", "EVENT", "OTHER"])
    .default("INSTRUCTOR"),
  discoverySourceOther: z.string().trim().max(160).optional().or(z.literal("")),
  shareConsent: z.boolean().default(false),
  membershipPath: z.enum(["FREE", "PREMIUM", "ELITE"]).default("FREE"),
  treeId: z.string().optional(),
  nodeId: z.string().optional(),
})

const normalizeOptional = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const getPublicLeadIp = async () => {
  const headersList = await headers()
  return headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}

const checkPublicLeadRateLimit = async ({
  db,
  brand,
  ip,
}: {
  db: any
  brand: Awaited<ReturnType<typeof getRequestBrand>>
  ip: string
}) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentFromIp = await db.lead.count({
    where: {
      brand,
      createdAt: { gte: oneHourAgo },
      meta: { path: ["captureIp"], equals: ip },
    },
  })

  if (recentFromIp >= 5) {
    throw new Error("Too many submissions. Please try again later.")
  }
}

/**
 * Public (unauthenticated) lead capture action.
 * Rate-limited by IP. No session required.
 */
export const createPublicLead = publicActionClient
  .inputSchema(publicLeadSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    // Basic IP-based rate limiting
    const ip = await getPublicLeadIp()
    await checkPublicLeadRateLimit({ db, brand, ip })

    // Validate org belongs to brand
    const organization = await db.organization.findFirst({
      where: { id: parsedInput.organizationId, brand },
      select: { id: true },
    })

    if (!organization) {
      throw new Error("Organization not found")
    }

    const lead = await db.lead.create({
      data: {
        brand,
        organizationId: organization.id,
        programId: parsedInput.programId || null,
        source: "WEBSITE",
        firstName: parsedInput.firstName.trim(),
        lastName: parsedInput.lastName?.trim() || null,
        email: parsedInput.email.trim().toLowerCase(),
        phoneE164: parsedInput.phoneE164?.trim() || null,
        meta: { captureIp: ip },
      },
      select: leadPayload,
    })

    after(() => {
      revalidate({
        paths: ["/admin/leads"],
        tags: ["leads"],
      })
    })

    return { id: lead.id }
  })

export const createJoinLegacyInterest = publicActionClient
  .inputSchema(legacyInterestSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()
    const requestOrigin = await getRequestOrigin()
    const session = await getServerSession()
    const ip = await getPublicLeadIp()
    await checkPublicLeadRateLimit({ db, brand, ip })

    const organization = await db.organization.findFirst({
      where: { brand },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    })

    if (!organization) {
      throw new Error("Join the Legacy is not configured for this brand yet.")
    }

    const firstName = parsedInput.firstName.trim()
    const lastName = normalizeOptional(parsedInput.lastName)
    const fullName = [firstName, lastName].filter(Boolean).join(" ")
    const preferredName = normalizeOptional(parsedInput.preferredName)
    const rankSummary = normalizeOptional(parsedInput.currentRank)
    const role = parsedInput.role
    const schoolName = normalizeOptional(parsedInput.schoolName)
    const location = normalizeOptional(parsedInput.location)
    const trainedUnder = normalizeOptional(parsedInput.trainedUnder)
    const represent = normalizeOptional(parsedInput.represent)
    const evidenceUrl = normalizeOptional(parsedInput.evidenceUrl)
    const bio = normalizeOptional(parsedInput.bio)
    const profileUrl = normalizeOptional(parsedInput.profileUrl)
    const instagramUrl = normalizeOptional(parsedInput.instagramUrl)
    const martialArtsExperience = normalizeOptional(parsedInput.martialArtsExperience)
    const primaryGoal = parsedInput.primaryGoal
    const discoverySource = parsedInput.discoverySource
    const discoverySourceOther = normalizeOptional(parsedInput.discoverySourceOther)
    const shareConsent = parsedInput.shareConsent
    const membershipPath = parsedInput.membershipPath as BblJoinLegacyMembershipPath
    const claimSelected = Boolean(parsedInput.treeId && parsedInput.nodeId)

    // Resolve whether this submission targets a real, claimable, EXISTING node.
    // Hoisted so the Tool-skip (#4: don't spawn a duplicate placeholder for a
    // claim of an existing node) and the signed-out sign-in handoff (#2) share
    // one source of truth — and so it's evaluated regardless of session.
    const claimTree =
      parsedInput.treeId && parsedInput.nodeId
        ? await db.lineageTree.findFirst({
            where: { id: parsedInput.treeId, brand, isPublished: true, isClaimable: true },
            select: { id: true },
          })
        : null
    const claimMember =
      claimTree && parsedInput.nodeId
        ? await db.lineageTreeMember.findFirst({
            where: { treeId: claimTree.id, nodeId: parsedInput.nodeId, isClaimable: true },
            select: { id: true },
          })
        : null
    const isClaimOfExistingNode = Boolean(claimTree && claimMember)

    const notes = [
      `Role: ${role.replaceAll("_", " ").toLowerCase()}`,
      `Primary goal: ${primaryGoal.replaceAll("_", " ").toLowerCase()}`,
      `Discovery source: ${discoverySource.replaceAll("_", " ").toLowerCase()}${discoverySourceOther ? ` — ${discoverySourceOther}` : ""}`,
      `Private review consent: ${shareConsent ? "yes" : "no"}`,
      preferredName ? `Preferred display name: ${preferredName}` : null,
      rankSummary ? `Rank/history: ${rankSummary}` : null,
      schoolName ? `Current school/academy: ${schoolName}` : null,
      location ? `Location: ${location}` : null,
      trainedUnder ? `Trained under: ${trainedUnder}` : null,
      represent ? `Wants to represent/connect to: ${represent}` : null,
      profileUrl ? `Website/public profile: ${profileUrl}` : null,
      instagramUrl ? `Instagram/social proof: ${instagramUrl}` : null,
      evidenceUrl ? `Evidence/reference URL: ${evidenceUrl}` : null,
      martialArtsExperience ? `Martial arts experience: ${martialArtsExperience}` : null,
      bio ? `Bio/history: ${bio}` : null,
    ]
      .filter(Boolean)
      .join("\n\n")
    const claimEvidence = [
      {
        label: "Join the Legacy intake",
        text: notes || `Submitted by ${fullName} (${parsedInput.email}).`,
      },
      ...(evidenceUrl
        ? [
            {
              label: "Public evidence/reference",
              url: evidenceUrl,
            },
          ]
        : []),
    ]

    const lead = await db.lead.create({
      data: {
        brand,
        organizationId: organization.id,
        source: "WEBSITE",
        firstName,
        lastName: lastName ?? null,
        email: parsedInput.email.trim().toLowerCase(),
        phoneE164: normalizeOptional(parsedInput.phoneE164) ?? null,
        notes: notes || null,
        referredBy: trainedUnder ?? null,
        meta: {
          captureIp: ip,
          source: "join-the-legacy",
          membershipPath,
          currentRank: rankSummary ?? null,
          preferredName: preferredName ?? null,
          role,
          primaryGoal,
          discoverySource,
          discoverySourceOther: discoverySourceOther ?? null,
          shareConsent,
          schoolName: schoolName ?? null,
          location: location ?? null,
          trainedUnder: trainedUnder ?? null,
          represent: represent ?? null,
          evidenceUrl: evidenceUrl ?? null,
          profileUrl: profileUrl ?? null,
          instagramUrl: instagramUrl ?? null,
          martialArtsExperience: martialArtsExperience ?? null,
          claimIntent: claimSelected,
        } satisfies Prisma.InputJsonObject,
      },
      select: leadPayload,
    })

    // Claiming an EXISTING placeholder node should not spawn a second pending
    // "Legacy Profile" Tool — that's a duplicate identity an admin would have to
    // reconcile. Only the pure-lead path (no node, or an invalid/non-claimable
    // node) creates the Tool. (#4)
    let tool: { id: string; slug: string } | null = null
    if (!isClaimOfExistingNode) {
      const toolSlug = await generateUniqueSlug({
        source: `${fullName} legacy profile`,
        isSlugTaken: createSlugTakenCheck(db.tool),
      })

      tool = await db.tool.create({
        data: {
          name: `${fullName} Legacy Profile`,
          slug: toolSlug,
          websiteUrl: profileUrl ?? `https://blackbeltlegacy.com/people/${toolSlug}`,
          tagline: rankSummary ?? "Black Belt Legacy profile submission",
          description:
            bio ?? `Lineage profile intake submitted through Join the Legacy for ${fullName}.`,
          submitterName: fullName,
          submitterEmail: parsedInput.email.trim().toLowerCase(),
          submitterNote: notes || null,
          status: ToolStatus.Pending,
        },
        select: { id: true, slug: true },
      })
    }

    let claimCreated = false
    if (session?.user?.id && isClaimOfExistingNode && claimTree && parsedInput.nodeId) {
      const existingClaim = await db.lineageClaimRequest.findFirst({
        where: {
          treeId: claimTree.id,
          nodeId: parsedInput.nodeId,
          claimantUserId: session.user.id,
          status: { in: ["PENDING", "APPROVED"] },
        },
        select: { id: true },
      })

      if (!existingClaim) {
        await db.lineageClaimRequest.create({
          data: {
            treeId: claimTree.id,
            nodeId: parsedInput.nodeId,
            claimantUserId: session.user.id,
            claimantNote: notes || "Submitted through Join the Legacy.",
            evidence: {
              create: claimEvidence,
            },
          },
        })
        claimCreated = true
      }
    }

    await db.lead.update({
      where: { id: lead.id },
      data: {
        meta: {
          ...(lead.meta && typeof lead.meta === "object" && !Array.isArray(lead.meta)
            ? lead.meta
            : {}),
          toolSlug: tool?.slug ?? null,
          claimCreated,
        } satisfies Prisma.InputJsonObject,
      },
    })

    const checkoutUrl =
      membershipPath === "FREE"
        ? "/lineage/join?submitted=true"
        : "/lineage/join?submitted=true#lineage-membership"
    const absoluteCheckoutUrl = new URL(
      checkoutUrl,
      requestOrigin ?? "https://baselinemartialarts.com",
    ).toString()

    after(async () => {
      const notification = {
        brand,
        to: parsedInput.email.trim().toLowerCase(),
        firstName,
        fullName,
        membershipPath,
        leadId: lead.id,
        rankSummary,
        trainedUnder,
        represent,
        checkoutUrl: absoluteCheckoutUrl,
        appUrl: requestOrigin,
        claimCreated,
      }

      try {
        await notifyUserOfBblJoinLegacy(notification)
        await notifyAdminOfBblJoinLegacy(notification)
      } catch (error) {
        console.error("[notify] Join the Legacy email failed", { leadId: lead.id, error })
      }

      revalidate({
        paths: ["/admin/leads", "/lineage/join"],
        tags: ["leads", "tools", `lead-${lead.id}`],
      })
    })

    return {
      leadId: lead.id,
      toolSlug: tool?.slug ?? null,
      checkoutUrl,
      claimCreated,
      claimRequiresSignIn: isClaimOfExistingNode && !session?.user?.id,
    }
  })
