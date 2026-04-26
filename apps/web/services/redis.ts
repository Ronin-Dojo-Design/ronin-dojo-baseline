import { Redis } from "@upstash/redis"
import { env } from "~/env"

const url = env.REDIS_REST_URL
const token = env.REDIS_REST_TOKEN

// Create Redis client only if credentials are provided
export const redis = url && token ? new Redis({ url, token }) : null
