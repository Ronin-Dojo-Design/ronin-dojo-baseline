"use server"

import { headers } from "next/headers"
import { after } from "next/server"
import { z } from "zod"
import { Brand, type Prisma, ToolStatus } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getRequestOrigin } from "~/lib/brand-context"
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
import {
  SUBMIT_PASSPORT_CLAIM_ERROR,
  submitPassportClaim,
} from "~/server/web/claims/submit-passport-claim"
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
  // Creatable-combobox refs (SESSION_0441): registered picks persist the *Id; custom
  // entries leave them empty and only the text label survives. Steward reads ref-else-text.
  currentRankId: z.string().trim().max(64).optional().or(z.literal("")),
  role: z.enum(["STUDENT", "BLACK_BELT", "INSTRUCTOR", "SCHOOL_OWNER", "OTHER"]).default("STUDENT"),
  schoolName: z.string().trim().max(160).optional().or(z.literal("")),
  schoolOrgId: z.string().trim().max(64).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  trainedUnder: z.string().trim().max(500).optional().or(z.literal("")),
  trainedUnderNodeId: z.string().trim().max(64).optional().or(z.literal("")),
  represent: z.string().trim().max(500).optional().or(z.literal("")),
  representTreeId: z.string().trim().max(64).optional().or(z.literal("")),
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
  brand: Brand
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
    // Basic IP-based rate limiting
    const ip = await getPublicLeadIp()
    await checkPublicLeadRateLimit({ db, brand: Brand.BBL, ip })

    // Validate org belongs to brand
    const organization = await db.organization.findFirst({
      where: { id: parsedInput.organizationId, brand: Brand.BBL },
      select: { id: true },
    })

    if (!organization) {
      throw new Error("Organization not found")
    }

    const lead = await db.lead.create({
      data: {
        brand: Brand.BBL,
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
        paths: ["/app/leads"],
        tags: ["leads"],
      })
    })

    return { id: lead.id }
  })

/**
 * Join-the-Legacy email dispatch — extracted from `createJoinLegacyInterest`'s `after()`
 * block (SESSION_0438 health: drop the action's cyclomatic below the CRITICAL threshold).
 * Picks exactly ONE recipient-facing email per submission shape (guest-claim magic link →
 * founder letter vs claim-your-profile; guest free signup; guest paid checkout-link; else
 * the generic confirmation), then always notifies admin. Best-effort, post-commit: send
 * failures are swallowed (logged), identical to the inlined behaviour.
 */
async function dispatchJoinLegacyNotifications(opts: {
  email: string
  firstName: string
  bblOrigin: string
  leadId: string
  nodeId: string | undefined
  isGuestFreeSubmission: boolean
  isGuestPaidSubmission: boolean
  isClaimOfExistingNode: boolean
  claimIsFounder: boolean
  claimIsLifetime: boolean
  claimProfileName: string
  notification: Parameters<typeof notifyUserOfBblJoinLegacy>[0]
}): Promise<void> {
  const {
    email,
    firstName,
    bblOrigin,
    leadId,
    nodeId,
    isGuestFreeSubmission,
    isGuestPaidSubmission,
    isClaimOfExistingNode,
    claimIsFounder,
    claimIsLifetime,
    claimProfileName,
    notification,
  } = opts

  try {
    if (isGuestFreeSubmission && isClaimOfExistingNode && nodeId) {
      // Guest claiming an existing profile → email-bound magic link that one-click claims
      // the node (account attach + comp grant happen in finalizeLineageNodeClaim). No
      // sign-in bounce — the link IS the proof of identity.
      const claimUrl = await mintClaimMagicLink({
        baseUrl: bblOrigin,
        email,
        nextPath: claimAcceptNextPath(nodeId),
      })
      if (claimIsFounder) {
        // The founder (Bob Bass) gets "The Long Road" — Brian's testament, founder to
        // founder — with his one-click claim link carried inside.
        await notifyFounderOfTheLongRoad({ brand: Brand.BBL, to: email, firstName, claimUrl })
      } else {
        await notifyMemberOfBblClaimYourProfile({
          brand: Brand.BBL,
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
      })
      await notifyUserOfBblFreeSignup({ brand: Brand.BBL, to: email, firstName, verifyUrl })
    } else if (isGuestPaidSubmission) {
      // Guest paid tier → mint a magic link that signs them in and lands them on the
      // join page's membership picker, which runs the (now-authenticated) Stripe
      // checkout. No webhook change: metadata.userId is real once they're signed in.
      const verifyUrl = await mintClaimMagicLink({
        baseUrl: bblOrigin,
        email,
        nextPath: "/lineage/join#lineage-membership",
      })
      await notifyUserOfBblFreeSignup({ brand: Brand.BBL, to: email, firstName, verifyUrl })
    } else {
      // Signed-in users (claim already created above) + paid tiers (Stripe checkout next):
      // the original Join-the-Legacy confirmation.
      await notifyUserOfBblJoinLegacy(notification)
    }
    await notifyAdminOfBblJoinLegacy(notification)
  } catch (error) {
    console.error("[notify] Join the Legacy email failed", { leadId, error })
  }
}

export const createJoinLegacyInterest = publicActionClient
  .inputSchema(legacyInterestSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const requestOrigin = await getRequestOrigin()
    const session = await getServerSession()
    const ip = await getPublicLeadIp()
    await checkPublicLeadRateLimit({ db, brand: Brand.BBL, ip })

    const organization = await db.organization.findFirst({
      where: { brand: Brand.BBL },
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
    // Creatable-combobox refs — a registered pick carries an *Id; a custom entry
    // carries only the text above. Persisted alongside the text so the steward
    // reads the ref when present, else the text (SESSION_0441).
    const currentRankId = normalizeOptional(parsedInput.currentRankId)
    const schoolOrgId = normalizeOptional(parsedInput.schoolOrgId)
    const trainedUnderNodeId = normalizeOptional(parsedInput.trainedUnderNodeId)
    const representTreeId = normalizeOptional(parsedInput.representTreeId)
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
            where: {
              id: parsedInput.treeId,
              brand: Brand.BBL,
              isPublished: true,
              isClaimable: true,
            },
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
                select: {
                  slug: true,
                  // Identity key for the unified claim core (ADR 0036, P5): the lead door
                  // now writes PassportClaimRequest keyed on the node's Passport, not a
                  // node-keyed LineageClaimRequest.
                  passportId: true,
                  passport: { select: { displayName: true } },
                },
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
        brand: Brand.BBL,
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
          schoolOrgId: schoolOrgId ?? null,
          location: location ?? null,
          trainedUnder: trainedUnder ?? null,
          trainedUnderNodeId: trainedUnderNodeId ?? null,
          represent: represent ?? null,
          representTreeId: representTreeId ?? null,
          currentRankId: currentRankId ?? null,
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
    if (
      session?.user?.id &&
      isClaimOfExistingNode &&
      claimTree &&
      claimMember &&
      parsedInput.nodeId
    ) {
      // ADR 0036 P5: the last LineageClaimRequest writer — converted to the unified
      // Passport-keyed core. submitPassportClaim resolves the identity guards
      // (already-claimed / duplicate open claim) and throws on either; for the lead
      // flow those are benign (it silently skipped a duplicate before), so swallow the
      // known guard errors and leave claimCreated false. Any other error still propagates.
      try {
        await submitPassportClaim(db, {
          passportId: claimMember.node.passportId,
          claimantUserId: session.user.id,
          brand: Brand.BBL,
          claimantNote: notes || "Submitted through Join the Legacy.",
          // A registered rank pick asserts the claimed rank (ADR 0035) — the award is
          // built from this on steward approval (FI-006). A custom rank carries no id,
          // so the narrative text stays in `notes` only.
          claimedRankId: currentRankId ?? null,
          // Registered school/instructor/tree picks become typed refs on the claim so the
          // steward sees resolved links + can act on approve (SESSION_0441). Custom entries
          // carry no id — their text stays in `notes`.
          claimedSchoolId: schoolOrgId ?? null,
          trainedUnderNodeId: trainedUnderNodeId ?? null,
          representTreeId: representTreeId ?? null,
          nodeId: parsedInput.nodeId,
          treeId: claimTree.id,
          evidence: claimEvidence,
        })
        claimCreated = true
      } catch (error) {
        const benign =
          error instanceof Error &&
          (error.message === SUBMIT_PASSPORT_CLAIM_ERROR.DUPLICATE_CLAIM ||
            error.message === SUBMIT_PASSPORT_CLAIM_ERROR.ALREADY_CLAIMED ||
            error.message === SUBMIT_PASSPORT_CLAIM_ERROR.PASSPORT_NOT_FOUND)
        if (!benign) throw error
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
      await dispatchJoinLegacyNotifications({
        email,
        firstName,
        bblOrigin,
        leadId: lead.id,
        nodeId: parsedInput.nodeId,
        isGuestFreeSubmission,
        isGuestPaidSubmission,
        isClaimOfExistingNode,
        claimIsFounder,
        claimIsLifetime,
        claimProfileName,
        notification: {
          brand: Brand.BBL,
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
        },
      })

      revalidate({
        paths: ["/app/leads", "/lineage/join"],
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
