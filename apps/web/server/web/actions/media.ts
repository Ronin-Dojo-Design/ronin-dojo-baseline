"use server"

import { tryCatch } from "@dirstack/utils"
import { getTranslations } from "next-intl/server"
import wretch from "wretch"
import { Brand } from "~/.generated/prisma/client"
import { getFaviconFetchUrl, getScreenshotFetchUrl, uploadToS3Storage } from "~/lib/media"
import { sniffUploadBuffer } from "~/lib/media-guard"
import { mediaUploadActionClient } from "~/lib/safe-actions"
import { createFetchMediaSchema, createUploadMediaSchema } from "~/server/web/shared/schema"

export const fetchMedia = mediaUploadActionClient
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createFetchMediaSchema(t)
  })
  .action(async ({ parsedInput: { url, path, type } }) => {
    const endpoint = type === "favicon" ? getFaviconFetchUrl(url) : getScreenshotFetchUrl(url)
    const { data, error } = await tryCatch(wretch(endpoint).get().arrayBuffer().then(Buffer.from))

    if (error) {
      console.error("Failed to fetch media:", error)
      throw error
    }

    return await uploadToS3Storage(data, path, Brand.BBL)
  })

export const uploadMedia = mediaUploadActionClient
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createUploadMediaSchema(t)
  })
  .action(async ({ parsedInput: { file, path } }) => {
    // Trust the bytes, not the client-declared MIME: sniff + reject SVG / non-image
    // (matches createFileSchema's 512KB image ceiling).
    const { buffer } = await sniffUploadBuffer(file, { maxBytes: 512 * 1024 })

    return await uploadToS3Storage(buffer, path, Brand.BBL)
  })
