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
import { db } from "~/services/db"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },

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
  ],
})

export const getServerSession = cache(async (request?: NextRequest) => {
  return auth.api.getSession({
    headers: request?.headers ?? (await headers()),
  })
})

export type Session = typeof auth.$Infer.Session
