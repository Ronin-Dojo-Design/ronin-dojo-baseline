import "dotenv/config"

import { Text } from "@react-email/components"
import type { Tool } from "~/.generated/prisma/client"
import { siteConfig } from "~/config/site"
import { EmailActionNudge } from "~/emails/components/action-nudge"
import { EmailButton } from "~/emails/components/button"
import { EmailFeatureNudge } from "~/emails/components/feature-nudge"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type EmailProps = EmailWrapperProps & {
  tool: Tool
}

export const EmailSubmissionPublished = ({ tool, ...props }: EmailProps) => {
  const toolUrl = `${siteConfig.url}/${tool.slug}`

  return (
    <EmailWrapper {...props}>
      <Text>Hey {tool.submitterName?.trim()}!</Text>

      <Text>
        Great news! Your submitted tool, <strong>{tool.name}</strong>, is now{" "}
        <strong>live on {siteConfig.name}</strong>. Thank you for sharing this awesome resource with
        our community!
      </Text>

      <Text>
        We'd love it if you could spread the word. A quick post on your favorite social platform or
        community about {tool.name} would mean a lot to us. It helps other people discover cool
        tools like yours!
      </Text>

      <EmailButton href={toolUrl}>
        Check out {tool.name} on {siteConfig.name}
      </EmailButton>

      <EmailActionNudge tool={tool} />
      <EmailFeatureNudge tool={tool} />
    </EmailWrapper>
  )
}

EmailSubmissionPublished.PreviewProps = {
  to: "alex@example.com",
  tool: {
    name: "Example Tool",
    slug: "example-tool",
    websiteUrl: "https://example.com",
    submitterName: "John Doe",
    publishedAt: new Date(),
    status: "Published",
  } as Tool,
} satisfies EmailProps

export default EmailSubmissionPublished
