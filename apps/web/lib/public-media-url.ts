const PUBLIC_MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z0-9+.-]*:/i

type ResolvePublicMediaUrlOptions = {
  baseUrl?: string
}

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "")
const trimLeadingSlashes = (value: string) => value.replace(/^\/+/, "")

export const resolvePublicMediaUrl = (
  path: string | null | undefined,
  options: ResolvePublicMediaUrlOptions = {},
) => {
  if (!path) return path

  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path
  }

  const baseUrl = options.baseUrl ?? PUBLIC_MEDIA_BASE_URL
  if (!baseUrl) {
    return path
  }

  return `${trimTrailingSlashes(baseUrl)}/${trimLeadingSlashes(path)}`
}
