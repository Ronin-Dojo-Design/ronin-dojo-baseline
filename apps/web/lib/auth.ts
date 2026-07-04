import { getRandomDigits } from "@dirstack/utils"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { createAuthMiddleware } from "better-auth/api"
import { betterAuth } from "better-auth/minimal"
import { admin, magicLink, oneTimeToken } from "better-auth/plugins"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import type { NextRequest } from "next/server"
import { cache } from "react"
import { claimsConfig } from "~/config/claims"
import { EmailMagicLink } from "~/emails/magic-link"
import { env } from "~/env"
import { BRAND_TRUSTED_ORIGINS, resolveBrand, resolveRequestOrigin } from "~/lib/brand-context"
import { getBrandSenderName, sendEmail } from "~/lib/email"
import { generateUniqueProfileSlug } from "~/lib/slug"
import { findJoinLegacyLeadCountry } from "~/server/web/lead/lead-country"
import { reconcilePendingLineageClaims } from "~/server/web/lineage/reconcile-pending-claims"
import { db } from "~/services/db"

type AuthEndpointContext = {
  headers?: Headers
  request?: Request
  body?: {
    id?: unknown
    user?: {
      id?: unknown
      name?: unknown
    }
  }
  context?: {
    baseURL?: string
    newSession?: {
      user?: {
        id?: unknown
        name?: unknown
      }
    } | null
  }
}

async function ensureIdentityShell(
  userId: string,
  displayName: string | null,
  email?: string | null,
) {
  const existing = await db.passport.findUnique({ where: { userId } })
  if (existing) return

  // SESSION_0496 TASK_05 — creation-only (after the early return, so the every-sign-in
  // path pays nothing): seed the profile stub's country from the newest join-the-legacy
  // lead this email submitted, so the wizard's answer survives the magic-link signup.
  // Read OUTSIDE the tx (keep it short); never throws — a bad lead must not block signup.
  const locationCountry = email ? await findJoinLegacyLeadCountry({ email }) : null

  const slug = await generateUniqueProfileSlug(
    displayName,
    async s => (await db.directoryProfile.count({ where: { slug: s } })) > 0,
  )

  // Phase 3c (SOT-ADR D1): DirectoryProfile is Passport-rooted, so the Passport must exist first
  // to supply `passportId`. Create both in one transaction with the Passport id threaded through.
  await db.$transaction(async tx => {
    const passport = await tx.passport.create({
      data: {
        userId,
        displayName,
      },
      select: { id: true },
    })
    await tx.directoryProfile.create({
      data: {
        passportId: passport.id,
        slug,
        ...(locationCountry ? { locationCountry } : {}),
        // Defaults from schema: visibility=MEMBERS_ONLY, showOrgs=true, showRanks=true
      },
    })
  })
}

const getAuthContextHeaders = (ctx?: AuthEndpointContext) => ctx?.headers ?? ctx?.request?.headers

const resolveAuthEmailBrand = (ctx?: AuthEndpointContext) => {
  const requestHeaders = getAuthContextHeaders(ctx)
  const host = requestHeaders?.get("x-forwarded-host") ?? requestHeaders?.get("host")
  const contextHost = ctx?.context?.baseURL ? new URL(ctx.context.baseURL).host : null

  return resolveBrand(host ?? contextHost)
}

const resolveAuthEmailUrl = (url: string, ctx?: AuthEndpointContext) => {
  const requestHeaders = getAuthContextHeaders(ctx)
  const requestOrigin = requestHeaders ? resolveRequestOrigin(requestHeaders) : null

  if (!requestOrigin) return url

  const parsedUrl = new URL(url)
  return new URL(`${parsedUrl.pathname}${parsedUrl.search}`, requestOrigin).toString()
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,

  // ADR 0004/0006: one Vercel deployment serves every brand by host. Without this,
  // Better Auth trusts only BETTER_AUTH_URL's host and rejects auth requests from
  // other brand hosts (e.g. blackbeltlegacy.com) with "invalid origin" — breaking
  // both the magic-link callbackURL check and the Google OAuth redirect. The list is
  // derived from HOST_TO_BRAND so it stays in lockstep with the host→brand map.
  trustedOrigins: BRAND_TRUSTED_ORIGINS,

  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  socialProviders:
    env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? {
          google: {
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
          },
        }
      : {},

  session: {
    freshAge: 0,

    cookieCache: {
      enabled: true,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
    },
  },

  onAPIError: {
    onError: error => console.error(error),
  },

  hooks: {
    after: createAuthMiddleware(async ({ path, context }) => {
      const { responseHeaders } = context

      // Revalidate the callback URL after login
      if (path.startsWith("/callback/:id")) {
        const callbackURL = responseHeaders?.get("location")

        if (callbackURL) {
          revalidatePath(callbackURL)
        }
      }

      // On sign-up, create Passport + DirectoryProfile stubs in a transaction.
      // Better-Auth creates the User row; we extend with identity shell records.
      if (
        path === "/sign-up/email" ||
        path === "/sign-up/social" ||
        path === "/callback/:id" ||
        path.startsWith("/magic-link")
      ) {
        const userFromBody = context.body?.user
        const userFromSession = context.newSession?.user
        const newUserId = userFromBody?.id ?? context.body?.id ?? userFromSession?.id
        if (newUserId && typeof newUserId === "string") {
          const displayName =
            typeof userFromBody?.name === "string"
              ? userFromBody.name
              : typeof userFromSession?.name === "string"
                ? userFromSession.name
                : null
          // Fetched BEFORE ensureIdentityShell (SESSION_0496 TASK_05) so the shell can seed
          // the profile country from the email's join-the-legacy lead — same single query the
          // reconcile below already needed, just hoisted.
          const account = await db.user.findUnique({
            where: { id: newUserId },
            select: { email: true, emailVerified: true },
          })
          await ensureIdentityShell(newUserId, displayName, account?.email)

          // SESSION_0419: claim any email-bound pending lineage node on EVERY successful auth, so
          // a founder who signs in with Google (the email's recommended method, which never carries
          // the node) still claims their profile — not just the magic-link callbackURL path. Runs
          // AFTER ensureIdentityShell (the signup Passport must exist first; finalize swaps it for
          // the node's). Never throws — reconcile swallows per-binding failures so auth can't break.
          await reconcilePendingLineageClaims({
            userId: newUserId,
            email: account?.email,
            emailVerified: account?.emailVerified ?? false,
          })
        }
      }
    }),
  },

  plugins: [
    magicLink({
      // Claim/login links are single-use + email-bound. Better Auth's 5-minute default
      // stranded real recipients who read a long email before clicking (SESSION_0418 —
      // the founder "Long Road" letter). 7 days gives an emailed invite room to breathe.
      expiresIn: 60 * 60 * 24 * 7,
      sendMagicLink: async ({ email, url, metadata }, ctx) => {
        // FIX #3 (SESSION_0412): the BBL claim-link minter calls `signInMagicLink` only to
        // create the verification token — it sends its OWN branded "claim your profile" email
        // (with the token-accept callbackURL), so suppress the generic login email here. Plain
        // login keeps sending as before (metadata is undefined). This guards the global send
        // seam WITHOUT touching the plugin's expiresIn/storeToken config.
        if ((metadata as { skipEmail?: boolean } | undefined)?.skipEmail) return

        const brand = resolveAuthEmailBrand(ctx)
        const brandedUrl = resolveAuthEmailUrl(url, ctx)
        const to = email
        const subject = `Your ${getBrandSenderName(brand)} Login Link`
        await sendEmail({
          brand,
          to,
          subject,
          react: EmailMagicLink({ to, url: brandedUrl }),
        })
      },
    }),

    oneTimeToken({
      expiresIn: claimsConfig.otpExpiration,
      generateToken: async () => getRandomDigits(claimsConfig.otpLength),
    }),

    admin(),
  ] as const,
})

export const getServerSession = cache(async (request?: NextRequest) => {
  return auth.api.getSession({
    headers: request?.headers ?? (await headers()),
  })
})

export type Session = typeof auth.$Infer.Session
