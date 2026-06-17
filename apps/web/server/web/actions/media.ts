"use server"

import { tryCatch } from "@dirstack/utils"
import { getTranslations } from "next-intl/server"
import wretch from "wretch"
import { getRequestBrand } from "~/lib/brand-context"
import { getFaviconFetchUrl, getScreenshotFetchUrl, uploadToS3Storage } from "~/lib/media"
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

    return await uploadToS3Storage(data, path, await getRequestBrand())
  })

export const uploadMedia = mediaUploadActionClient
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createUploadMediaSchema(t)
  })
  .action(async ({ parsedInput: { file, path } }) => {
    const buffer = Buffer.from(await file.arrayBuffer())

    return await uploadToS3Storage(buffer, path, await getRequestBrand())
  })
