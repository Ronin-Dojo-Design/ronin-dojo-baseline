import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3"
import { Brand } from "~/.generated/prisma/client"
import { env } from "~/env"

const BASE_CONFIG = {
  maxAttempts: 5,
  retryMode: "standard",
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  forcePathStyle: true,
} satisfies Partial<S3ClientConfig>

const makeS3Client = (opts: {
  endpoint?: string
  region?: string
  accessKey?: string
  secretKey?: string
}): S3Client =>
  new S3Client({
    ...BASE_CONFIG,
    endpoint: opts.endpoint,
    region: opts.region,
    ...(opts.accessKey && opts.secretKey
      ? { credentials: { accessKeyId: opts.accessKey, secretAccessKey: opts.secretKey } }
      : {}),
  } satisfies S3ClientConfig)

/**
 * Platform media client — Baseline / Ronin Dojo Design / WEKAF (currently AWS S3).
 * Kept as the historical named export so existing imports are unchanged.
 */
export const s3Client = makeS3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_ACCESS_KEY,
})

/**
 * Black Belt Legacy media client — its own bucket (Cloudflare R2). Only built
 * when `S3_BUCKET_BBL` is set; otherwise BBL falls back to the platform client
 * (e.g. preview/dev where the BBL bucket isn't wired). Mirrors the per-brand
 * Stripe seam (ADR 0030). All four brands share one Vercel deployment (ADR 0006),
 * so per-brand buckets are selected at runtime from per-brand env vars.
 */
const s3ClientBBL = env.S3_BUCKET_BBL
  ? makeS3Client({
      endpoint: env.S3_ENDPOINT_BBL,
      region: env.S3_REGION_BBL,
      accessKey: env.S3_ACCESS_KEY_BBL,
      secretKey: env.S3_SECRET_ACCESS_KEY_BBL,
    })
  : null

export type MediaConfig = {
  client: S3Client
  bucket: string | undefined
  region: string | undefined
  publicUrl: string | undefined
}

/**
 * Resolve the media bucket config (client + bucket + region + public base) for a
 * brand. BBL uses its dedicated bucket when configured; every other brand (and
 * BBL when unconfigured) uses the platform bucket. Pass the request brand on the
 * upload/remove paths so objects land in — and are deleted from — the right
 * bucket.
 */
export const getMediaConfig = (brand?: Brand): MediaConfig => {
  if (brand === Brand.BBL && s3ClientBBL) {
    return {
      client: s3ClientBBL,
      bucket: env.S3_BUCKET_BBL,
      region: env.S3_REGION_BBL,
      publicUrl: env.S3_PUBLIC_URL_BBL,
    }
  }
  return {
    client: s3Client,
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    publicUrl: env.S3_PUBLIC_URL,
  }
}
