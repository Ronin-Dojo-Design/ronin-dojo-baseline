import { type CreateContactOptions, Resend } from "resend"
import { env } from "~/env"

export const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : (null as unknown as Resend)

export const createResendContact = async (payload: Omit<CreateContactOptions, "audienceId">) => {
  const audienceId = env.RESEND_AUDIENCE_ID
  if (!audienceId) {
    throw new Error("Missing RESEND_AUDIENCE_ID")
  }

  const { error, data } = await resend.contacts.create({ audienceId, ...payload })

  if (error) {
    throw new Error("Failed to create resend contact. Please try again later.")
  }

  return data?.id
}
