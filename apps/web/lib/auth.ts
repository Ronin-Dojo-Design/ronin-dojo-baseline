import { getRandomDigits } from "@primoui/utils"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { betterAuth } from "better-auth/minimal"
import { admin, createAuthMiddleware, magicLink, oneTimeToken } from "better-auth/plugins"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import type { NextRequest } from "next/server"
import { cache } from "react"
import { claimsConfig } from "~/config/claims"
import { siteConfig } from "~/config/site"
import { EmailMagicLink } from "~/emails/magic-link"
import { env } from "~/env"
import { sendEmail } from "~/lib/email"
import { generateUniqueProfileSlug } from "~/lib/slug"
import { db } from "~/services/db"

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
        const newUserId = context.body?.user?.id ?? context.body?.id
        if (newUserId && typeof newUserId === "string") {
          // Only create if not already present (idempotent for social re-auth)
          const existing = await db.passport.findUnique({ where: { userId: newUserId } })
          if (!existing) {
            const displayName = context.body?.user?.name ?? null
            const slug = await generateUniqueProfileSlug(
              displayName,
              async (s) =>
                (await db.directoryProfile.count({ where: { slug: s } })) > 0,
            )
            await db.$transaction([
              db.passport.create({
                data: {
                  userId: newUserId,
                  displayName,
                },
              }),
              db.directoryProfile.create({
                data: {
                  userId: newUserId,
                  slug,
                  // Defaults from schema: visibility=MEMBERS_ONLY, showOrgs=true, showRanks=true
                },
              }),
            ])
          }
        }
      }
    }),
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const to = email
        const subject = `Your ${siteConfig.name} Login Link`
        await sendEmail({ to, subject, react: EmailMagicLink({ to, url }) })
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
