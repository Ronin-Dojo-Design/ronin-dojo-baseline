import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3"
import { env } from "~/env"

const s3ClientConfig = {
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  ...(env.S3_ACCESS_KEY && env.S3_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        },
      }
    : {}),
  maxAttempts: 5,
  retryMode: "standard",
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  forcePathStyle: true,
} satisfies S3ClientConfig

export const s3Client = new S3Client(s3ClientConfig)
