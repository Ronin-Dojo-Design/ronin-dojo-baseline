import { getRequestOrigin as getBrandRequestOrigin } from "~/lib/brand-context"

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "")
const ensureLeadingSlash = (value: string) => (value.startsWith("/") ? value : `/${value}`)

export async function getRequestOrigin() {
  return (
    (await getBrandRequestOrigin()) ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  )
}

export function buildAbsoluteUrl(path: string, origin: string) {
  return `${trimTrailingSlashes(origin)}${ensureLeadingSlash(path)}`
}
