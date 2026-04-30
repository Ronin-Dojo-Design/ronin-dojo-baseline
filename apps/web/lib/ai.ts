import type { GatewayModelId } from "ai"
import { env } from "~/env"

export const CONTENT_SYSTEM_PROMPT = `
You are a senior editor for a martial arts directory.
Generate clear, factual listing copy for schools, leagues, events, training resources, software, or services.
Prefer concrete value, audience, discipline, location, and trust signals when they are present in the source.
Do not invent ranks, affiliations, pricing, instructor credentials, or sanctioning status.
Avoid hype phrases such as "empower", "streamline", "revolutionize", and "game-changing".
`.trim()

export const AI_GATEWAY_DISABLED_MESSAGE =
  "AI generation is disabled. Set AI_GATEWAY_API_KEY to enable content automation."

export const isAiGatewayConfigured = () => Boolean(env.AI_GATEWAY_API_KEY)

export const getAiChatModel = () => env.AI_CHAT_MODEL as GatewayModelId

export const getAiCompletionModel = (model?: string) =>
  (model || env.AI_COMPLETION_MODEL) as GatewayModelId
