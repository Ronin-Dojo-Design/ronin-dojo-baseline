import { streamObject } from "ai"
import { z } from "zod"
import {
  AI_GATEWAY_DISABLED_MESSAGE,
  CONTENT_SYSTEM_PROMPT,
  getAiChatModel,
  isAiGatewayConfigured,
} from "~/lib/ai"
import { withAdminAuth } from "~/lib/auth-hoc"
import { descriptionSchema } from "~/server/admin/shared/schema"

export const maxDuration = 60

export const POST = withAdminAuth(async req => {
  const { prompt, temperature } = z
    .object({
      prompt: z.string(),
      temperature: z.number().default(0.3),
    })
    .parse(await req.json())

  if (!isAiGatewayConfigured()) {
    return new Response(AI_GATEWAY_DISABLED_MESSAGE, { status: 503 })
  }

  const result = streamObject({
    model: getAiChatModel(),
    schema: descriptionSchema,
    system: CONTENT_SYSTEM_PROMPT,
    temperature,
    prompt,
    onError: error => {
      console.error(error)
      throw error
    },
  })

  return result.toTextStreamResponse()
})
