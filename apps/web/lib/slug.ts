/**
 * Convert a string to a URL-safe slug: lowercase, hyphenated, alphanumeric.
 *
 * Used for `DirectoryProfile.slug`, `Organization.slug`, and other public route slugs.
 */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

export type SlugTakenDelegate = {
  findUnique: (args: { where: { slug: string }; select: { slug: true } }) => PromiseLike<unknown>
}

export const createSlugTakenCheck = <D extends SlugTakenDelegate>(delegate: D) => {
  return (slug: string): Promise<boolean> => {
    return Promise.resolve(delegate.findUnique({ where: { slug }, select: { slug: true } })).then(
      Boolean,
    )
  }
}

export const generateUniqueSlug = async (options: {
  source: string
  isSlugTaken: (slug: string) => Promise<boolean>
  currentSlug?: string
  maxAttempts?: number
}): Promise<string> => {
  const { source, isSlugTaken, currentSlug, maxAttempts = 20 } = options
  const baseSlug = slugify(source)

  if (currentSlug === baseSlug) {
    return baseSlug
  }

  if (!(await isSlugTaken(baseSlug))) {
    return baseSlug
  }

  let suffix = 2

  while (suffix <= maxAttempts) {
    const candidate = `${baseSlug}-${suffix}`

    if (!(await isSlugTaken(candidate))) {
      return candidate
    }

    suffix++
  }

  throw new Error(`Failed to generate unique slug for "${source}".`)
}

/**
 * Generate a unique DirectoryProfile slug given a base name. Collisions resolved
 * by appending a 6-char random suffix; falls back to "user-<random>" when the
 * base produces an empty slug.
 *
 * @param baseName  Display name to derive a slug from
 * @param exists    Async check that returns true when the slug is already taken
 */
export const generateUniqueProfileSlug = async (
  baseName: string | null | undefined,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> => {
  const base = slugify(baseName ?? "") || "user"
  let candidate = base
  let attempt = 0
  while (await exists(candidate)) {
    if (++attempt > 5) {
      candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`
      break
    }
    candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`
  }
  return candidate
}
