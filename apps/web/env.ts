import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  shared: {
    PORT: z.coerce.number().default(8000),
    VERCEL_URL: z
      .string()
      .optional()
      .transform(v => (v ? `https://${v}` : undefined)),
  },

  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).default("development"),
    NEXT_PHASE: z.string().optional(),
    DATABASE_URL: z.string().min(1),
    DATABASE_PUBLIC_URL: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url().min(1),
    // Optional until wired — these are upstream Dirstarter services not yet configured
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    REDIS_REST_URL: z.string().optional(),
    REDIS_REST_TOKEN: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_SENDER_EMAIL: z.string().email().optional(),
    RESEND_SENDER_EMAIL_BASELINE_MARTIAL_ARTS: z.string().email().optional(),
    RESEND_SENDER_EMAIL_BBL: z.string().email().optional(),
    RESEND_SENDER_EMAIL_RONIN_DOJO_DESIGN: z.string().email().optional(),
    RESEND_SENDER_EMAIL_WEKAF: z.string().email().optional(),
    RESEND_AUDIENCE_ID: z.string().optional(),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_URL: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    // Black Belt Legacy runs on its own Stripe account (separate keys + webhook
    // secret). Optional so other brands / preview envs work without them.
    STRIPE_SECRET_KEY_BBL: z.string().optional(),
    STRIPE_WEBHOOK_SECRET_BBL: z.string().optional(),
    PRINTFUL_API_KEY: z.string().optional(),
    PRINTFUL_WEBHOOK_SECRET: z.string().optional(),
    PRINTFUL_CONFIRM_ORDERS: z.enum(["true", "false"]).default("false"),
    DEV_LOGIN_USER_ID: z.string().optional(),
    SCREENSHOTONE_ACCESS_KEY: z.string().optional(),
    PLAUSIBLE_API_KEY: z.string().optional(),
    AI_GATEWAY_API_KEY: z.string().optional(),
    AI_CHAT_MODEL: z.string().default("openai/gpt-4o"),
    AI_COMPLETION_MODEL: z.string().default("openai/gpt-4o-mini"),
    JINA_API_KEY: z.string().optional(),
    // Pre-launch holding page for Black Belt Legacy. When truthy ("1"/"true"),
    // BBL public pages render the countdown instead of the app (other brands
    // unaffected). Unset = normal app. Flip off + redeploy to go live.
    BBL_COUNTDOWN: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().min(1),
    NEXT_PUBLIC_SITE_EMAIL: z.email().min(1),
    NEXT_PUBLIC_PLAUSIBLE_URL: z.url().optional(),
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().min(1).optional(),
    NEXT_PUBLIC_MEDIA_BASE_URL: z.url().optional(),
    // ISO timestamp the BBL countdown ticks toward (display only). Optional —
    // without it the holding page shows "Launching soon" with no clock.
    NEXT_PUBLIC_BBL_LAUNCH_AT: z.string().optional(),
  },

  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    PORT: process.env.PORT,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_EMAIL: process.env.NEXT_PUBLIC_SITE_EMAIL,
    NEXT_PUBLIC_PLAUSIBLE_URL: process.env.NEXT_PUBLIC_PLAUSIBLE_URL,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
    NEXT_PUBLIC_BBL_LAUNCH_AT: process.env.NEXT_PUBLIC_BBL_LAUNCH_AT,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})

export const isProd =
  process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production"
export const isDev = !isProd
