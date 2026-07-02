import type { WithRequired } from "@dirstack/utils"
import { render } from "@react-email/components"
import type { CreateEmailOptions, CreateEmailResponse } from "resend"
import wretch from "wretch"
import { Brand } from "~/.generated/prisma/client"
import { env, isProd } from "~/env"
import { resend } from "~/services/resend"

/**
 * Email parameters for sending emails via Resend.
 * `react` and `subject` are required, `from` and `text` are automatically set.
 */
export type EmailParams = WithRequired<
  Omit<CreateEmailOptions, "from" | "text" | "template">,
  "subject"
> & {
  brand?: Brand
}

const BRAND_SENDER_NAME: Record<Brand, string> = {
  BASELINE_MARTIAL_ARTS: "Baseline Martial Arts",
  BBL: "Black Belt Legacy",
  RONIN_DOJO_DESIGN: "Ronin Dojo Design",
  WEKAF: "WEKAF USA",
}

const BRAND_DEFAULT_SENDER_EMAIL: Record<Brand, string> = {
  BASELINE_MARTIAL_ARTS: "welcome@baselinemartialarts.com",
  BBL: "welcome@blackbeltlegacy.com",
  RONIN_DOJO_DESIGN: "welcome@ronindojodesign.com",
  WEKAF: "welcome@wekafusa.com",
}

const BRAND_SENDER_ENV_VAR: Record<Brand, string> = {
  BASELINE_MARTIAL_ARTS: "RESEND_SENDER_EMAIL_BASELINE_MARTIAL_ARTS",
  BBL: "RESEND_SENDER_EMAIL_BBL",
  RONIN_DOJO_DESIGN: "RESEND_SENDER_EMAIL_RONIN_DOJO_DESIGN",
  WEKAF: "RESEND_SENDER_EMAIL_WEKAF",
}

const BRAND_CONFIGURED_SENDER_EMAIL: Record<Brand, string | undefined> = {
  BASELINE_MARTIAL_ARTS: env.RESEND_SENDER_EMAIL_BASELINE_MARTIAL_ARTS ?? env.RESEND_SENDER_EMAIL,
  BBL: env.RESEND_SENDER_EMAIL_BBL,
  RONIN_DOJO_DESIGN: env.RESEND_SENDER_EMAIL_RONIN_DOJO_DESIGN,
  WEKAF: env.RESEND_SENDER_EMAIL_WEKAF,
}

// FI-014 (brand-leak P0): a brandless `sendEmail` MUST resolve to BBL, never to the raw
// `RESEND_SENDER_EMAIL` env (whose default is `welcome@baselinemartialarts.com`). A BBL
// signup dispatched through a brand-omitting call site was rendering a Baseline sender
// identity in Gmail ("Welcome to Baseline Martial Arts") even though the copy was BBL.
// Single-brand platform → BBL is the only correct default (CLAUDE.md: multi-brand is dead).
const resolveBrand = (brand?: Brand): Brand => brand ?? Brand.BBL

export const getBrandSenderName = (brand?: Brand) => {
  return BRAND_SENDER_NAME[resolveBrand(brand)]
}

export const getBrandSenderEnvVar = (brand: Brand) => BRAND_SENDER_ENV_VAR[brand]

export const getConfiguredBrandSenderEmail = (brand?: Brand) => {
  return BRAND_CONFIGURED_SENDER_EMAIL[resolveBrand(brand)]
}

export const isBrandSenderConfigured = (brand: Brand) => {
  return Boolean(getConfiguredBrandSenderEmail(brand))
}

export const getBrandSenderEmail = (brand?: Brand) => {
  const resolved = resolveBrand(brand)
  return (
    BRAND_CONFIGURED_SENDER_EMAIL[resolved] ??
    (resolved === Brand.BASELINE_MARTIAL_ARTS ? env.RESEND_SENDER_EMAIL : undefined) ??
    BRAND_DEFAULT_SENDER_EMAIL[resolved]
  )
}

const getBrandSenderEmailForSend = (brand?: Brand) => {
  // FI-014: resolve brandless → BBL before the prod-config guard too, so a brand-omitting
  // send is validated (and sent) as BBL rather than silently escaping to the Baseline env.
  const resolved = resolveBrand(brand)
  if (isProd && !isBrandSenderConfigured(resolved)) {
    throw new Error(
      `Missing ${getBrandSenderEnvVar(resolved)}. Verify the ${BRAND_DEFAULT_SENDER_EMAIL[resolved].split("@")[1]} Resend domain before sending ${getBrandSenderName(resolved)} email.`,
    )
  }

  return getBrandSenderEmail(resolved)
}

export const getBrandSenderAddress = (brand?: Brand, senderEmail = getBrandSenderEmail(brand)) => {
  return `${getBrandSenderName(brand)} <${senderEmail}>`
}

/**
 * Prepares an email for sending by adding defaults
 * @param email - The email to prepare
 * @returns The prepared email with `from` and `text` fields
 */
const prepareEmail = async (email: EmailParams): Promise<CreateEmailOptions> => {
  const { brand, ...payload } = email
  const senderEmail = getBrandSenderEmailForSend(brand)

  return {
    ...payload,
    from: getBrandSenderAddress(brand, senderEmail),
    replyTo: payload.replyTo ?? senderEmail,
    text: await render(payload.react, { plainText: true }),
  }
}

/**
 * Sends an email to the given recipient using Resend
 * @param email - The email to send
 * @returns The response from Resend, or undefined in development
 */
export const sendEmail = async (email: EmailParams): Promise<CreateEmailResponse | undefined> => {
  // Resend isn't configured (CI, or local without a key): the `resend` client is
  // null, so skip the send instead of crashing the calling flow (Stripe webhooks,
  // notifications, DSR). In production a missing key is a real misconfiguration we
  // still surface loudly.
  if (!env.RESEND_API_KEY) {
    if (isProd) {
      throw new Error("RESEND_API_KEY is not configured — cannot send email in production.")
    }
    return undefined
  }

  const payload = await prepareEmail(email)

  // Log payload in dev for debugging, but still send
  if (!isProd) {
    console.log("📧 Sending email:", payload.to, payload.subject)
  }

  return resend.emails.send(payload)
}

/**
 * Checks if an email is a disposable email by checking if the domain is in the disposable domains list
 * @param email - The email to check
 * @returns True if the email is a disposable email, false otherwise
 */
export const isDisposableEmail = async (email: string) => {
  const disposableJsonURL =
    "https://rawcdn.githack.com/disposable/disposable-email-domains/master/domains.json"

  const disposableDomains = await wretch(disposableJsonURL).get().json<string[]>()
  const domain = email.split("@")[1]

  return disposableDomains.includes(domain)
}
