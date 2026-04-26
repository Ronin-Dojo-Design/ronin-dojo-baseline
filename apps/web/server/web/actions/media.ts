"use server"

import { tryCatch } from "@primoui/utils"
import { getTranslations } from "next-intl/server"
import wretch from "wretch"
import { getFaviconFetchUrl, getScreenshotFetchUrl, uploadToS3Storage } from "~/lib/media"
import { actionClient } from "~/lib/safe-actions"
import { createFetchMediaSchema, createUploadMediaSchema } from "~/server/web/shared/schema"

export const fetchMedia = actionClient
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

    return await uploadToS3Storage(data, path)
  })

export const uploadMedia = actionClient
  .inputSchema(async () => {
    const t = await getTranslations("schema")
    return createUploadMediaSchema(t)
  })
  .action(async ({ parsedInput: { file, path } }) => {
    const buffer = Buffer.from(await file.arrayBuffer())

    return await uploadToS3Storage(buffer, path)
  })
