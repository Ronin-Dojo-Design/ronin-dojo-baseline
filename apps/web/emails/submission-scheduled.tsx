import "dotenv/config"

import { Text } from "@react-email/components"
import { addHours, differenceInDays, format, formatDistanceToNowStrict } from "date-fns"
import type { Tool } from "~/.generated/prisma/client"
import { siteConfig } from "~/config/site"
import { EmailActionNudge } from "~/emails/components/action-nudge"
import { EmailExpediteNudge } from "~/emails/components/expedite-nudge"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type EmailProps = EmailWrapperProps & {
  tool: Tool
}

export const EmailSubmissionScheduled = ({ tool, ...props }: EmailProps) => {
  const publishedAt = addHours(tool.publishedAt || new Date(), 2)
  const isLongQueue = differenceInDays(publishedAt, new Date()) > 7
  const dateRelative = formatDistanceToNowStrict(publishedAt, { addSuffix: true })
  const dateFormatted = format(publishedAt, "MMMM do, yyyy")

  return (
    <EmailWrapper {...props}>
      <Text>Hey {tool.submitterName?.trim()}!</Text>

      <Text>
        Great news! Your submitted tool, <strong>{tool.name}</strong>, was{" "}
        <strong>accepted and scheduled</strong> for publication on {siteConfig.name}.
      </Text>

      {isLongQueue ? (
        <EmailExpediteNudge tool={tool}>
          on <strong>{dateFormatted}</strong>
        </EmailExpediteNudge>
      ) : (
        <Text>
          {tool.name} is scheduled to be added <strong>{dateRelative}</strong>.
        </Text>
      )}

      <EmailActionNudge tool={tool} />
    </EmailWrapper>
  )
}

EmailSubmissionScheduled.PreviewProps = {
  to: "alex@example.com",
  tool: {
    name: "Example Tool",
    slug: "example-tool",
    websiteUrl: "https://example.com",
    submitterName: "John Doe",
    publishedAt: addHours(new Date(), 2),
    status: "Scheduled",
  } as Tool,
} satisfies EmailProps

export default EmailSubmissionScheduled
