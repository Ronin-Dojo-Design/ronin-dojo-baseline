const DEFAULT_SCHOOL_MATCH_THRESHOLD = 0.9

export type SchoolMatchCandidate = {
  name: string
}

export function normalizeSchoolName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i++) {
    const current = [i]

    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(
        current[j - 1]! + 1,
        previous[j]! + 1,
        previous[j - 1]! + substitutionCost,
      )
    }

    previous = current
  }

  return previous[b.length]!
}

function bigrams(value: string): string[] {
  const compact = value.replace(/\s+/g, "")
  if (compact.length < 2) return compact ? [compact] : []

  const pairs: string[] = []
  for (let index = 0; index < compact.length - 1; index++) {
    pairs.push(compact.slice(index, index + 2))
  }
  return pairs
}

function diceCoefficient(a: string, b: string): number {
  const aBigrams = bigrams(a)
  const bBigrams = bigrams(b)
  if (aBigrams.length === 0 || bBigrams.length === 0) return a === b ? 1 : 0

  const bCounts = new Map<string, number>()
  for (const pair of bBigrams) {
    bCounts.set(pair, (bCounts.get(pair) ?? 0) + 1)
  }

  let intersection = 0
  for (const pair of aBigrams) {
    const count = bCounts.get(pair) ?? 0
    if (count > 0) {
      intersection++
      bCounts.set(pair, count - 1)
    }
  }

  return (2 * intersection) / (aBigrams.length + bBigrams.length)
}

function tokenDice(a: string, b: string): number {
  const aTokens = new Set(a.split(" ").filter(Boolean))
  const bTokens = new Set(b.split(" ").filter(Boolean))
  if (aTokens.size === 0 || bTokens.size === 0) return 0

  let overlap = 0
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap++
  }

  return (2 * overlap) / (aTokens.size + bTokens.size)
}

export function schoolNameSimilarity(a: string, b: string): number {
  const normalizedA = normalizeSchoolName(a)
  const normalizedB = normalizeSchoolName(b)

  if (!normalizedA || !normalizedB) return 0
  if (normalizedA === normalizedB) return 1

  const maxLength = Math.max(normalizedA.length, normalizedB.length)
  const editSimilarity = 1 - levenshteinDistance(normalizedA, normalizedB) / maxLength

  return Math.max(
    editSimilarity,
    diceCoefficient(normalizedA, normalizedB),
    tokenDice(normalizedA, normalizedB),
  )
}

/**
 * Identity-safe name matching: normalization equivalence only, never fuzzy similarity.
 * Use where a false merge would transfer identity/provenance; school discovery keeps
 * using `fuzzyMatchSchool` because its error trade-off is intentionally different.
 */
export function exactNormalizedNameMatch<T extends SchoolMatchCandidate>(
  name: string,
  candidates: T[],
): T | null {
  const normalizedName = normalizeSchoolName(name)
  if (!normalizedName) return null

  return (
    candidates.find(candidate => normalizeSchoolName(candidate.name) === normalizedName) ?? null
  )
}

export function fuzzyMatchSchool<T extends SchoolMatchCandidate>(
  name: string,
  candidates: T[],
  threshold = DEFAULT_SCHOOL_MATCH_THRESHOLD,
): T | null {
  let best: { candidate: T; score: number } | null = null

  for (const candidate of candidates) {
    const score = schoolNameSimilarity(name, candidate.name)
    if (!best || score > best.score) {
      best = { candidate, score }
    }
  }

  return best && best.score >= threshold ? best.candidate : null
}
