"use server"

import { headers } from "next/headers"
import { after } from "next/server"
import { z } from "zod"
import { type Prisma, ToolStatus } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getBblPreviewToken } from "~/lib/bbl-preview"
import { getRequestBrand, getRequestOrigin } from "~/lib/brand-context"
import { BBL_FOUNDER_NODE_SLUG, DIRTY_DOZEN_LABEL } from "~/lib/lineage/dirty-dozen"
import {
  type BblJoinLegacyMembershipPath,
  notifyAdminOfBblJoinLegacy,
  notifyFounderOfTheLongRoad,
  notifyMemberOfBblClaimYourProfile,
  notifyUserOfBblFreeSignup,
  notifyUserOfBblJoinLegacy,
} from "~/lib/notifications"
import { publicActionClient } from "~/lib/safe-actions"
import { createSlugTakenCheck, generateUniqueSlug } from "~/lib/slug"
import { leadPayload } from "~/server/web/lead/payloads"
import {
  claimAcceptNextPath,
  FREE_SIGNUP_NEXT_PATH,
  mintClaimMagicLink,
} from "~/server/web/lineage/mint-claim-magic-link"

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
            select: {
              id: true,
              // Cohort drives the comp term in the email copy (lifetime vs 1yr) — read off the
              // claimed node's visual group, the SAME signal finalizeLineageNodeClaim uses to
              // grant the comp, so the email never contradicts the grant.
              visualGroup: { select: { label: true } },
              node: {
                select: { slug: true, passport: { select: { displayName: true } } },
              },
            },
          })
        : null
    const isClaimOfExistingNode = Boolean(claimTree && claimMember)

    // Dirty Dozen → lifetime Elite comp; everyone else → one free year. (Byte-matches the
    // seeded visual-group label, the single source of truth shared with claim-finalize.)
    const claimIsLifetime = claimMember?.visualGroup?.label === DIRTY_DOZEN_LABEL
    // The founder (Bob Bass) claiming his OWN node gets the celebratory welcome — detected
    // deterministically off the node slug, never a name string.
    const claimIsFounder = claimMember?.node?.slug === BBL_FOUNDER_NODE_SLUG
    const claimProfileName = claimMember?.node?.passport?.displayName ?? fullName

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

    const email = parsedInput.email.trim().toLowerCase()
    // Magic links must point at the BBL brand host so the verify endpoint + preview hop
    // resolve to the recipient's origin (not BETTER_AUTH_URL).
    const bblOrigin = requestOrigin ?? "https://blackbeltlegacy.com"
    // A guest (no session) on the FREE path is the self-serve magic-link case: a claim of an
    // existing node gets the branded "claim your profile" email; a plain free signup gets a
    // `/me` verify link. Signed-in users + paid tiers keep the original confirmation email.
    const isGuestFreeSubmission = membershipPath === "FREE" && !session?.user?.id
    // A guest picking a PAID tier can't run the auth-gated membership checkout. Reconcile
    // them first with an email-bound magic link (the same primitive the FREE path uses):
    // the link signs them in and lands them on /lineage/join, where the membership picker
    // creates the real Stripe checkout. Signed-in users keep the direct redirect.
    const isGuestPaidSubmission = membershipPath !== "FREE" && !session?.user?.id

    after(async () => {
      const notification = {
        brand,
        to: email,
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
        if (isGuestFreeSubmission && isClaimOfExistingNode && parsedInput.nodeId) {
          // Guest claiming an existing profile → email-bound magic link that one-click claims
          // the node (account attach + comp grant happen in finalizeLineageNodeClaim). No
          // sign-in bounce — the link IS the proof of identity.
          const claimUrl = await mintClaimMagicLink({
            baseUrl: bblOrigin,
            email,
            nextPath: claimAcceptNextPath(parsedInput.nodeId),
            previewToken: getBblPreviewToken(),
          })
          if (claimIsFounder) {
            // The founder (Bob Bass) gets "The Long Road" — Brian's testament, founder to
            // founder — with his one-click claim link carried inside.
            await notifyFounderOfTheLongRoad({ brand, to: email, firstName, claimUrl })
          } else {
            await notifyMemberOfBblClaimYourProfile({
              brand,
              to: email,
              firstName,
              profileName: claimProfileName,
              claimUrl,
              compTier: "ELITE",
              isLifetime: claimIsLifetime,
            })
          }
        } else if (isGuestFreeSubmission) {
          // Guest free signup with no node to claim → mint a `/me` magic link; Better Auth
          // provisions the account on verify and lands them on `/me`.
          const verifyUrl = await mintClaimMagicLink({
            baseUrl: bblOrigin,
            email,
            nextPath: FREE_SIGNUP_NEXT_PATH,
            previewToken: getBblPreviewToken(),
          })
          await notifyUserOfBblFreeSignup({ brand, to: email, firstName, verifyUrl })
        } else if (isGuestPaidSubmission) {
          // Guest paid tier → mint a magic link that signs them in and lands them on the
          // join page's membership picker, which runs the (now-authenticated) Stripe
          // checkout. No webhook change: metadata.userId is real once they're signed in.
          const verifyUrl = await mintClaimMagicLink({
            baseUrl: bblOrigin,
            email,
            nextPath: "/lineage/join#lineage-membership",
            previewToken: getBblPreviewToken(),
          })
          await notifyUserOfBblFreeSignup({ brand, to: email, firstName, verifyUrl })
        } else {
          // Signed-in users (claim already created above) + paid tiers (Stripe checkout next):
          // the original Join-the-Legacy confirmation.
          await notifyUserOfBblJoinLegacy(notification)
        }
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
      // Guest paid submission → a checkout magic link was emailed instead of an immediate
      // redirect; the wizard shows the success ("check your email") state.
      checkoutEmailSent: isGuestPaidSubmission,
      // Retained for back-compat, but the guest-claim magic link now replaces the sign-in
      // bounce — the wizard shows the success state and the emailed link finishes the claim.
      claimRequiresSignIn: isClaimOfExistingNode && !session?.user?.id,
      // The founder claiming his own profile → the celebratory founder welcome (submit-time
      // success state + the `/me` landing both read this).
      isFounder: claimIsFounder,
    }
  })
