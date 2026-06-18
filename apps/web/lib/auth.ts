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
import { resolveBrand, resolveRequestOrigin } from "~/lib/brand-context"
import { getBrandSenderName, sendEmail } from "~/lib/email"
import { generateUniqueProfileSlug } from "~/lib/slug"
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

async function ensureIdentityShell(userId: string, displayName: string | null) {
  const existing = await db.passport.findUnique({ where: { userId } })
  if (existing) return

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
          await ensureIdentityShell(newUserId, displayName)
        }
      }
    }),
  },

  plugins: [
    magicLink({
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
