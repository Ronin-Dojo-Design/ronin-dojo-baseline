import type { WithRequired } from "@dirstack/utils"
import { render } from "@react-email/components"
import type { CreateEmailOptions, CreateEmailResponse } from "resend"
import wretch from "wretch"
import { Brand } from "~/.generated/prisma/client"
import { siteConfig } from "~/config/site"
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

export const getBrandSenderName = (brand?: Brand) => {
  return brand ? BRAND_SENDER_NAME[brand] : siteConfig.name
}

export const getBrandSenderEnvVar = (brand: Brand) => BRAND_SENDER_ENV_VAR[brand]

export const getConfiguredBrandSenderEmail = (brand?: Brand) => {
  if (!brand) return env.RESEND_SENDER_EMAIL
  return BRAND_CONFIGURED_SENDER_EMAIL[brand]
}

export const isBrandSenderConfigured = (brand: Brand) => {
  return Boolean(getConfiguredBrandSenderEmail(brand))
}

export const getBrandSenderEmail = (brand?: Brand) => {
  if (!brand) return env.RESEND_SENDER_EMAIL ?? env.NEXT_PUBLIC_SITE_EMAIL

  return (
    BRAND_CONFIGURED_SENDER_EMAIL[brand] ??
    (brand === Brand.BASELINE_MARTIAL_ARTS ? env.RESEND_SENDER_EMAIL : undefined) ??
    BRAND_DEFAULT_SENDER_EMAIL[brand]
  )
}

const getBrandSenderEmailForSend = (brand?: Brand) => {
  if (brand && isProd && !isBrandSenderConfigured(brand)) {
    throw new Error(
      `Missing ${getBrandSenderEnvVar(brand)}. Verify the ${BRAND_DEFAULT_SENDER_EMAIL[brand].split("@")[1]} Resend domain before sending ${getBrandSenderName(brand)} email.`,
    )
  }

  return getBrandSenderEmail(brand)
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
