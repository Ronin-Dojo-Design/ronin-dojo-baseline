import "dotenv/config"

import { Text } from "@react-email/components"
import type { Tool } from "~/.generated/prisma/client"
import { siteConfig } from "~/config/site"
import {
  BblEmailButton,
  BblEmailWrapper as EmailWrapper,
  type BblEmailWrapperProps as EmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

type EmailProps = EmailWrapperProps & {
  tool: Tool
}

export const EmailAdminSubmissionPremium = ({ tool, ...props }: EmailProps) => {
  return (
    <EmailWrapper {...props}>
      <Text>Hi!</Text>

      <Text>
        {tool.submitterName} has opted to {tool.isFeatured ? "feature" : "expedite"} the submission
        of {tool.name}. You should review and approve it as soon as possible.
      </Text>

      <BblEmailButton href={`${siteConfig.url}/admin/tools/${tool.slug}`}>
        Review {tool.name}
      </BblEmailButton>
    </EmailWrapper>
  )
}

EmailAdminSubmissionPremium.PreviewProps = {
  to: "alex@example.com",
  tool: {
    name: "Example Tool",
    slug: "example-tool",
    websiteUrl: "https://example.com",
    submitterName: "John Doe",
    publishedAt: null,
    status: "Draft",
  } as Tool,
} satisfies EmailProps

export default EmailAdminSubmissionPremium
