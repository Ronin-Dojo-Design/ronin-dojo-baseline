/**
 * metadata.ts — pulls the ONE metadata-header shape out of a doc's frontmatter.
 *
 * Every field is optional; a missing key renders as absent (never the string "undefined") — the
 * template layer only emits a header row for fields that are actually set.
 */

export interface DocMetadata {
  title?: string
  created?: string
  updated?: string
  /** `author` wins over `last_agent` when both are present. */
  author?: string
  status?: string
  /** `session` wins over `slug` when both are present. */
  sessionOrSlug?: string
  decision?: string
}

function asString(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}

export function extractMetadata(
  frontmatter: Record<string, string | string[]>,
  titleFallback?: string,
): DocMetadata {
  return {
    title: asString(frontmatter.title) ?? titleFallback,
    created: asString(frontmatter.created),
    updated: asString(frontmatter.updated),
    author: asString(frontmatter.author) ?? asString(frontmatter.last_agent),
    status: asString(frontmatter.status),
    sessionOrSlug: asString(frontmatter.session) ?? asString(frontmatter.slug),
    decision: asString(frontmatter.decision),
  }
}
