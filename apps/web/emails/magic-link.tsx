import "dotenv/config"

import { Text } from "@react-email/components"
import { siteConfig } from "~/config/site"
import { EmailButton } from "~/emails/components/button"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type EmailProps = EmailWrapperProps & {
  url: string
}

export const EmailMagicLink = ({ url, ...props }: EmailProps) => {
  return (
    <EmailWrapper {...props}>
      <Text>Welcome to {siteConfig.name}!</Text>

      <Text>Please click the magic link below to sign in to your account.</Text>

      <EmailButton href={url}>Sign in to {siteConfig.name}</EmailButton>

      <Text>or copy and paste this URL into your browser:</Text>

      <Text className="max-w-sm flex-wrap wrap-break-word font-medium leading-snug">{url}</Text>
    </EmailWrapper>
  )
}

EmailMagicLink.PreviewProps = {
  to: "alex@example.com",
  url: "https://example.com",
} satisfies EmailProps

export default EmailMagicLink
