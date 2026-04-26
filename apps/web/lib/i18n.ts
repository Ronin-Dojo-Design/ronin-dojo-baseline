import { glob, readFile } from "node:fs/promises"
import { basename, join } from "node:path"
import { getRequestConfig } from "next-intl/server"

export const locales = ["en"] as const
export const defaultLocale = "en" as const

export type Locale = (typeof locales)[number]

// Dynamically load all JSON files from the locale directory
const loadMessages = async (locale: Locale) => {
  const messagesPath = join(process.cwd(), "messages", locale)
  const files = glob(`${messagesPath}/*.json`)
  const filesArray = await Array.fromAsync(files)

  const messages = await Promise.all(
    filesArray.map(async file => {
      const namespace = basename(file, ".json")
      const content = JSON.parse(await readFile(file, "utf-8"))
      return [namespace, content]
    }),
  )

  return Object.fromEntries(messages)
}

export default getRequestConfig(async () => {
  // TODO: get locale from headers or URL params
  const locale = defaultLocale
  const messages = await loadMessages(locale)

  return { locale, messages }
})
