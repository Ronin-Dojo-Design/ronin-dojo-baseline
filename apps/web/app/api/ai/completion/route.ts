import { streamText } from "ai"
import { z } from "zod"
import { AI_GATEWAY_DISABLED_MESSAGE, getAiCompletionModel, isAiGatewayConfigured } from "~/lib/ai"
import { withAdminAuth } from "~/lib/auth-hoc"

const completionSchema = z.object({
  prompt: z.string(),
  model: z.string().optional(),
})

export const POST = withAdminAuth(async req => {
  const { prompt, model } = completionSchema.parse(await req.json())

  if (!isAiGatewayConfigured()) {
    return new Response(AI_GATEWAY_DISABLED_MESSAGE, { status: 503 })
  }

  const result = streamText({
    model: getAiCompletionModel(model),
    prompt,
  })

  return result.toUIMessageStreamResponse()
})
