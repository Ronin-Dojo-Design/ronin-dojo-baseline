"use server"

import { fileTypeFromBuffer } from "file-type"
import { headers } from "next/headers"
import { after } from "next/server"
import { z } from "zod"
import { Brand, type Prisma } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getRequestOrigin } from "~/lib/brand-context"
import { getCountryLabel, normalizeCountryCode } from "~/lib/countries"
import { uploadToS3Storage } from "~/lib/media"
import { getIP, isRateLimited } from "~/lib/rate-limiter"
import { BBL_FOUNDER_NODE_SLUG, isLifetimeComp } from "~/lib/lineage/dirty-dozen"
import {
  type BblJoinLegacyMembershipPath,
  notifyAdminOfBblJoinLegacy,
  notifyFounderOfTheLongRoad,
  notifyMemberOfBblClaimYourProfile,
  notifyUserOfBblFreeSignup,
  notifyUserOfBblJoinLegacy,
} from "~/lib/notifications"
import { publicActionClient } from "~/lib/safe-actions"
import { autoPlaceSignupOnLineage } from "~/server/admin/lineage/place-lead-core"
import {
  SUBMIT_PASSPORT_CLAIM_ERROR,
  submitPassportClaim,
} from "~/server/web/claims/submit-passport-claim"
import { leadPayload } from "~/server/web/lead/payloads"
import { emitSchoolLead } from "~/server/web/school-lead/emit-school-lead"
import {
  bindPendingClaim,
  buildClaimSignInUrl,
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
  // ISO 3166-1 alpha-2 (SESSION_0496) — review-intake only: rides the lead notes/meta
  // for stewards, no Lead/claim column. The live directory flag is set via profile edit.
  country: z.string().trim().max(2).optional().or(z.literal("")),
  trainedUnder: z.string().trim().max(500).optional().or(z.literal("")),
  trainedUnderNodeId: z.string().trim().max(64).optional().or(z.literal("")),
  represent: z.string().trim().max(500).optional().or(z.literal("")),
  representTreeId: z.string().trim().max(64).optional().or(z.literal("")),
  evidenceUrl: httpUrlSchema.optional().or(z.literal("")),
  // FI-010a: a guest-staged profile photo (uploaded via `uploadJoinLegacyAvatar` to an
  // R2 URL). Persisted on the lead so the photo survives the magic-link round-trip for
  // steward review / later Passport re-bind, instead of being silently discarded.
  avatarUrl: httpUrlSchema.optional().or(z.literal("")),
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

const EVIDENCE_MAX_BYTES = 8 * 1024 * 1024
// Allowlist the RASTER image types we accept, sniffed from the bytes. Critically
// EXCLUDES SVG: an SVG can carry inline <script>, so accepting one and serving its
// public R2 URL would be a stored-XSS vector when the link is opened directly.
// `startsWith("image/")` would let `image/svg+xml` through — an allowlist won't.
const EVIDENCE_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])

const evidencePhotoSchema = z.object({
  file: z
    .instanceof(File)
    .refine(f => f.size > 0, "The image is empty.")
    .refine(f => f.size <= EVIDENCE_MAX_BYTES, "Image must be under 8MB.")
    .refine(f => f.type.startsWith("image/"), "Only image files are allowed."),
})

/**
 * Public (unauthenticated) evidence-photo upload for the Join-the-Legacy intake
 * (SESSION_0445 #3). Lets a guest attach a certificate/proof image without an
 * account (the wizard is account-optional). Rate-limited by IP; the bytes get a
 * hard server-side size ceiling and are content-sniffed against a raster-image
 * allowlist (the declared MIME is not trusted; SVG is rejected); stored under an
 * isolated `lineage-evidence/` prefix for steward review. Returns the public URL,
 * which the wizard writes into `evidenceUrl`.
 */
export const uploadJoinLegacyEvidence = publicActionClient
  .inputSchema(evidencePhotoSchema)
  .action(async ({ parsedInput }) => {
    if (await isRateLimited(await getIP(), "evidence_upload")) {
      throw new Error("Too many uploads. Please try again in a bit.")
    }
    const buffer = Buffer.from(await parsedInput.file.arrayBuffer())
    // Hard server-side ceiling — the Zod refine trusts the File's self-reported size,
    // which a direct (non-browser) caller controls.
    if (buffer.byteLength > EVIDENCE_MAX_BYTES) {
      throw new Error("Image must be under 8MB.")
    }
    // Trust the bytes, not the declared type — sniff + allowlist raster images (no SVG).
    const sniffed = await fileTypeFromBuffer(buffer)
    if (!sniffed || !EVIDENCE_IMAGE_MIMES.has(sniffed.mime)) {
      throw new Error("Upload a JPEG, PNG, WebP, or AVIF image.")
    }
    const url = await uploadToS3Storage(
      buffer,
      `lineage-evidence/${crypto.randomUUID()}`,
      Brand.BBL,
    )
    return { url }
  })

/**
 * Public (unauthenticated) guest AVATAR upload for the Join-the-Legacy intake
 * (SESSION_0492 FI-010a). Sibling of `uploadJoinLegacyEvidence`: the wizard's
 * `AvatarUploader` runs for guests (no account/Passport yet), so it CANNOT use the
 * auth-gated `uploadAndPromotePassportAvatar`. This action uploads the cropped
 * avatar bytes to R2 under an isolated `lineage-avatar/` prefix and returns the
 * public URL, which the wizard writes into `avatarUrl` and carries to
 * `createJoinLegacyInterest` (persisted on the lead for steward review + later
 * Passport re-bind). Same guardrails as the evidence path: IP rate-limit, hard
 * server-side byte ceiling, content-sniffed raster-image allowlist (no SVG).
 */
export const uploadJoinLegacyAvatar = publicActionClient
  .inputSchema(evidencePhotoSchema)
  .action(async ({ parsedInput }) => {
    if (await isRateLimited(await getIP(), "avatar_upload")) {
      throw new Error("Too many uploads. Please try again in a bit.")
    }
    const buffer = Buffer.from(await parsedInput.file.arrayBuffer())
    if (buffer.byteLength > EVIDENCE_MAX_BYTES) {
      throw new Error("Image must be under 8MB.")
    }
    const sniffed = await fileTypeFromBuffer(buffer)
    if (!sniffed || !EVIDENCE_IMAGE_MIMES.has(sniffed.mime)) {
      throw new Error("Upload a JPEG, PNG, WebP, or AVIF image.")
    }
    const url = await uploadToS3Storage(buffer, `lineage-avatar/${crypto.randomUUID()}`, Brand.BBL)
    return { url }
  })

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
      // SESSION_0513: guest claiming an existing profile → bind the email→node durably (90-day)
      // and link the email to the PUBLIC sign-in URL. No one-shot magic-link token to be consumed
      // by a mail scanner / late click; the node auto-claims on the recipient's next sign-in
      // (Google OR magic link) via `lib/auth.ts` reconciliation (account attach + comp grant in
      // finalizeLineageNodeClaim).
      await bindPendingClaim(email, nodeId)
      const claimUrl = buildClaimSignInUrl(bblOrigin)
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
      // Guest free signup with no node to claim → mint an `/app/profile` magic link; Better Auth
      // provisions the account on verify and lands them on `/app/profile`.
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
    const country = normalizeCountryCode(parsedInput.country)
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
    const avatarUrl = normalizeOptional(parsedInput.avatarUrl)
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
            // `passport.userId: null` — a node whose passport already belongs to an
            // account is NOT claimable by someone else. Without this, students who
            // arrived via their instructor's ?node= link were emailed "Claim your
            // profile — <instructor>" for an already-claimed node (SESSION_0508 P0:
            // Tony Hua's students). Finalize always refused; now the offer does too.
            where: {
              treeId: claimTree.id,
              nodeId: parsedInput.nodeId,
              isClaimable: true,
              node: { passport: { userId: null } },
            },
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

    // Dirty Dozen → lifetime Elite comp; everyone else → one free year. Shared predicate
    // with the claim card UI + claim-finalize so the term shown never diverges from the grant.
    const claimIsLifetime = isLifetimeComp(claimMember?.visualGroup?.label)
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
      country ? `Country: ${getCountryLabel(country)} (${country})` : null,
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
          country: country ?? null,
          trainedUnder: trainedUnder ?? null,
          trainedUnderNodeId: trainedUnderNodeId ?? null,
          represent: represent ?? null,
          representTreeId: representTreeId ?? null,
          currentRankId: currentRankId ?? null,
          evidenceUrl: evidenceUrl ?? null,
          // FI-010a: guest-staged profile photo URL — persisted so it survives the
          // magic-link round-trip for steward review / later Passport re-bind.
          avatarUrl: avatarUrl ?? null,
          profileUrl: profileUrl ?? null,
          instagramUrl: instagramUrl ?? null,
          martialArtsExperience: martialArtsExperience ?? null,
          claimIntent: claimSelected,
        } satisfies Prisma.InputJsonObject,
      },
      select: leadPayload,
    })

    if (!schoolOrgId && schoolName) {
      await emitSchoolLead({
        schoolName,
        memberEmail: parsedInput.email,
        source: "join-the-legacy",
      })
    }

    // SESSION_0508 (FI-003): a NEW signup no longer spawns a pending "Legacy Profile" Tool.
    // Auto-placement (`autoPlaceSignupOnLineage`, below) now files the person on the canonical
    // lineage tree at submit time — the placeholder Tool was a DUPLICATE identity an admin would
    // have had to reconcile. The Lead (CRM record) remains the intake; Tools stay reserved for
    // real tool/listing submissions (`/app/tools`), not signup misuse.

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
          claimCreated,
        } satisfies Prisma.InputJsonObject,
      },
    })

    const checkoutUrl =
      membershipPath === "FREE"
        ? "/lineage/join?submitted=true"
        : "/lineage/join?submitted=true#lineage-membership"
    // FI-015: the join/checkout follow-up link must land on the BBL brand host, not
    // Baseline. When there's no request context the fallback is BBL (matching the
    // magic-link origin below and the FI-014 "brandless sends default to BBL" rule).
    const absoluteCheckoutUrl = new URL(
      checkoutUrl,
      requestOrigin ?? "https://blackbeltlegacy.com",
    ).toString()

    const email = parsedInput.email.trim().toLowerCase()
    // Magic links must point at the BBL brand host so the verify endpoint + preview hop
    // resolve to the recipient's origin (not BETTER_AUTH_URL).
    const bblOrigin = requestOrigin ?? "https://blackbeltlegacy.com"
    // A guest (no session) on the FREE path is the self-serve magic-link case: a claim of an
    // existing node gets the branded "claim your profile" email; a plain free signup gets an
    // `/app/profile` verify link. Signed-in users + paid tiers keep the original confirmation email.
    const isGuestFreeSubmission = membershipPath === "FREE" && !session?.user?.id
    // A guest picking a PAID tier can't run the auth-gated membership checkout. Reconcile
    // them first with an email-bound magic link (the same primitive the FREE path uses):
    // the link signs them in and lands them on /lineage/join, where the membership picker
    // creates the real Stripe checkout. Signed-in users keep the direct redirect.
    const isGuestPaidSubmission = membershipPath !== "FREE" && !session?.user?.id

    after(async () => {
      // FI-003 auto-placement — a NEW person (not a claim of an existing node) who named a registered
      // instructor is placed on the canonical lineage tree UNDER that instructor at submit time:
      // Unverified, NOT claimable, bound to their account (or an accountless placeholder that attaches
      // on sign-in — never a claim). Membership is automatic (ADR 0035 / SESSION_0474), not gated behind
      // an approval. Reuses the SAME placement core as the manual steward control; best-effort +
      // idempotent — the core swallows/logs any failure so a placement error never loses the lead or
      // account, and only places when the instructor resolves to a canonical member (else the steward
      // handles it via the manual "Place on lineage tree" control).
      if (!isClaimOfExistingNode && trainedUnderNodeId) {
        await autoPlaceSignupOnLineage(db, {
          leadId: lead.id,
          sessionUserId: session?.user?.id ?? null,
          brand: Brand.BBL,
        })
      }

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
        tags: ["leads", `lead-${lead.id}`],
      })
    })

    return {
      leadId: lead.id,
      checkoutUrl,
      claimCreated,
      // Guest paid submission → a checkout magic link was emailed instead of an immediate
      // redirect; the wizard shows the success ("check your email") state.
      checkoutEmailSent: isGuestPaidSubmission,
      // Retained for back-compat, but the guest-claim magic link now replaces the sign-in
      // bounce — the wizard shows the success state and the emailed link finishes the claim.
      claimRequiresSignIn: isClaimOfExistingNode && !session?.user?.id,
      // The founder claiming his own profile → the celebratory founder welcome (submit-time
      // success state + the `/app/profile` landing both read this).
      isFounder: claimIsFounder,
    }
  })
