/**
 * genre.ts — which template a doc gets, derived from frontmatter `type:` + its path.
 *
 * v1 ships two genre templates (`research-review`, `sop-ritual` — the latter covers SOPs, rituals,
 * and workflows) plus a `generic` fallback so an unrecognized doc still renders instead of crashing.
 * Overridable via an explicit flag (never auto-detected past the override).
 */

export type Genre = "research-review" | "sop-ritual" | "generic"

const KNOWN_GENRES: readonly Genre[] = ["research-review", "sop-ritual", "generic"]

export function isGenre(value: string): value is Genre {
  return (KNOWN_GENRES as readonly string[]).includes(value)
}

export function detectGenre(
  frontmatter: Record<string, string | string[]>,
  filePath: string,
  override?: string,
): Genre {
  if (override) {
    if (!isGenre(override)) {
      throw new Error(
        `Unknown --genre override "${override}" — expected one of: ${KNOWN_GENRES.join(", ")}`,
      )
    }
    return override
  }

  const type = typeof frontmatter.type === "string" ? frontmatter.type.toLowerCase() : ""
  const path = filePath.toLowerCase()

  if (type.includes("research-review") || path.includes("research-review")) return "research-review"

  if (
    type.includes("sop") ||
    type.includes("ritual") ||
    type.includes("workflow") ||
    type.includes("protocol") ||
    path.includes("/rituals/") ||
    path.includes("/sops/") ||
    path.includes("sop-") ||
    path.includes("ritual")
  ) {
    return "sop-ritual"
  }

  return "generic"
}
