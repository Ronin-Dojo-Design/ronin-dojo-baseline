import "dotenv/config"

import { Text } from "@react-email/components"
import type { Tool } from "~/.generated/prisma/client"
import { EmailExpediteNudge } from "~/emails/components/expedite-nudge"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"
import { calculateQueueDuration } from "~/lib/products"

type EmailProps = EmailWrapperProps & {
  tool: Tool
  queue?: number
}

export const EmailSubmission = ({ tool, queue = 100, ...props }: EmailProps) => {
  return (
    <EmailWrapper {...props}>
      <Text>Hey {tool.submitterName?.trim()}!</Text>

      <Text>Thanks for submitting {tool.name}, it'll be reviewed shortly!</Text>

      {queue > 10 && (
        <EmailExpediteNudge tool={tool}>
          in approximately <strong>{calculateQueueDuration(queue)}</strong>
        </EmailExpediteNudge>
      )}
    </EmailWrapper>
  )
}

EmailSubmission.PreviewProps = {
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

export default EmailSubmission
