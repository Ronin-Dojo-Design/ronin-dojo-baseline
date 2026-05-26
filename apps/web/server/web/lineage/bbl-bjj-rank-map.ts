export type BblLineageVerificationStatus = "PENDING" | "VERIFIED" | "DISPUTED"

export type BblBjjRankKey =
  | "white_belt"
  | "blue_belt"
  | "purple_belt"
  | "brown_belt"
  | "black_belt"
  | "black_belt_1st_degree"
  | "black_belt_2nd_degree"
  | "black_belt_3rd_degree"
  | "black_belt_4th_degree"
  | "black_belt_5th_degree"
  | "black_belt_6th_degree"
  | "black_belt_7th_degree"
  | "black_belt_8th_degree"
  | "black_belt_9th_degree"
  | "black_belt_10th_degree"

export type BblBjjRankField = {
  key: BblBjjRankKey
  label: string
  rankName: string
  rankShortName: string
  dateFields: readonly string[]
  promoterFields: readonly string[]
  locationFields: readonly string[]
  mediaFields: readonly string[]
}

export type BblBjjRankAwardImport = {
  key: BblBjjRankKey
  label: string
  rankName: string
  rankShortName: string
  awardedAt: string | null
  promotedByLegacyRef: string | null
  locationLegacyRef: string | null
  mediaUrls: string[]
  verificationStatus: BblLineageVerificationStatus
  isVerified: boolean
  sourceDateField: string | null
  sourcePromoterField: string | null
  sourceLocationField: string | null
  sourceMediaField: string | null
}

export type ExtractBblBjjRankAwardsOptions = {
  includeCurrentRankFallback?: boolean
}

const DEGREE_WORDS = [
  "zeroth",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
] as const

export const BBL_BJJ_RANK_FIELDS: readonly BblBjjRankField[] = [
  {
    key: "white_belt",
    label: "White Belt",
    rankName: "White Belt",
    rankShortName: "W0",
    dateFields: ["white_belt_promotion_date", "white_belt_start_date"],
    promoterFields: [],
    locationFields: [],
    mediaFields: ["white_belt_pictures"],
  },
  {
    key: "blue_belt",
    label: "Blue Belt",
    rankName: "Blue Belt",
    rankShortName: "BL0",
    dateFields: ["blue_belt_promotion_date", "date_of_blue_belt_promotion"],
    promoterFields: ["who_promoted_you_to_blue_belt"],
    locationFields: ["where_you_were_promoted_to_blue_belt"],
    mediaFields: ["blue_belt_pictures"],
  },
  {
    key: "purple_belt",
    label: "Purple Belt",
    rankName: "Purple Belt",
    rankShortName: "P0",
    dateFields: ["purple_belt_promotion_date", "date_of_purple_belt_promotion"],
    promoterFields: ["who_promoted_you_to_purple_belt"],
    locationFields: ["where_you_were_promoted_to_purple_belt"],
    mediaFields: ["purple_belt_pictures"],
  },
  {
    key: "brown_belt",
    label: "Brown Belt",
    rankName: "Brown Belt",
    rankShortName: "BR0",
    dateFields: ["brown_belt_promotion_date", "date_of_brown_belt_promotion"],
    promoterFields: ["who_promoted_you_to_brown_belt"],
    locationFields: ["where_you_were_promoted_to_brown_belt"],
    mediaFields: ["brown_belt_pictures"],
  },
  {
    key: "black_belt",
    label: "Black Belt",
    rankName: "Black Belt",
    rankShortName: "BK0",
    dateFields: ["black_belt_promotion_date", "date_of_black_belt_promotion"],
    promoterFields: ["who_promoted_you_to_black_belt"],
    locationFields: ["where_you_were_promoted_to_black_belt"],
    mediaFields: ["black_belt_pictures"],
  },
  {
    key: "black_belt_1st_degree",
    label: "1st Degree Black Belt",
    rankName: "Black Belt - 1st Degree",
    rankShortName: "BK1",
    dateFields: ["1st_degree_black_belt_promotion_date", "date_of_1st_degree_black_belt_promotion"],
    promoterFields: ["who_promoted_you_to_1st_degree_black_belt"],
    locationFields: ["where_you_were_promoted_to_1st_degree_black_belt"],
    mediaFields: ["1st_degree_black_belt_pictures"],
  },
  {
    key: "black_belt_2nd_degree",
    label: "2nd Degree Black Belt",
    rankName: "Black Belt - 2nd Degree",
    rankShortName: "BK2",
    dateFields: ["2nd_degree_black_belt_promotion_date", "date_of_2nd_degree_black_belt_promotion"],
    promoterFields: ["who_promoted_you_to_2nd_degree_black_belt"],
    locationFields: ["where_you_were_promoted_to_2nd_degree_black_belt"],
    mediaFields: ["2nd_degree_black_belt_pictures"],
  },
  {
    key: "black_belt_3rd_degree",
    label: "3rd Degree Black Belt",
    rankName: "Black Belt - 3rd Degree",
    rankShortName: "BK3",
    dateFields: ["3rd_degree_black_belt_promotion_date", "date_of_3rd_degree_black_belt_promotion"],
    promoterFields: ["who_promoted_you_to_3rd_degree_black_belt"],
    locationFields: ["where_you_were_promoted_to_3rd_degree_black_belt"],
    mediaFields: ["3rd_degree_black_belt_pictures"],
  },
  {
    key: "black_belt_4th_degree",
    label: "4th Degree Black Belt",
    rankName: "Black Belt - 4th Degree",
    rankShortName: "BK4",
    dateFields: ["4th_degree_black_belt_promotion_date", "date_of_4th_degree_black_belt_promotion"],
    promoterFields: ["who_promoted_you_to_4th_degree_black_belt"],
    locationFields: ["where_you_were_promoted_to_4th_degree_black_belt"],
    mediaFields: ["4th_degree_black_belt_pictures"],
  },
  {
    key: "black_belt_5th_degree",
    label: "5th Degree Black Belt",
    rankName: "Black Belt - 5th Degree",
    rankShortName: "BK5",
    dateFields: ["5th_degree_black_belt_promotion_date", "date_of_5th_degree_black_belt_promotion"],
    promoterFields: ["who_promoted_you_to_5th_degree_black_belt"],
    locationFields: ["where_you_were_promoted_to_5th_degree_black_belt"],
    mediaFields: ["5th_degree_black_belt_pictures"],
  },
  {
    key: "black_belt_6th_degree",
    label: "6th Degree Black Belt",
    rankName: "Black Belt - 6th Degree",
    rankShortName: "BK6",
    dateFields: ["6th_degree_black_belt_promotion_date", "date_of_6th_degree_black_belt_promotion"],
    promoterFields: ["who_promoted_you_to_6th_degree_black_belt"],
    locationFields: ["where_you_were_promoted_to_6th_degree_black_belt"],
    mediaFields: ["6th_degree_black_belt_pictures"],
  },
  {
    key: "black_belt_7th_degree",
    label: "7th Degree Coral Belt",
    rankName: "Coral Belt (Red/Black) - 7th Degree",
    rankShortName: "CB7",
    dateFields: ["7th_degree_black_belt_promotion_date", "date_of_7th_degree_black_belt_promotion"],
    promoterFields: ["who_promoted_you_to_7th_degree_black_belt"],
    locationFields: ["where_you_were_promoted_to_7th_degree_black_belt"],
    mediaFields: ["7th_degree_black_belt_pictures"],
  },
  {
    key: "black_belt_8th_degree",
    label: "8th Degree Coral Belt",
    rankName: "Coral Belt (Red/White) - 8th Degree",
    rankShortName: "CB8",
    dateFields: [
      "8th_degree_coral_belt_promotion_date",
      "date_of_8th_degree_coral_belt_promotion",
      "date_of_8th_degree_black_belt_promotion",
    ],
    promoterFields: ["who_promoted_you_to_8th_degree_coral_belt"],
    locationFields: ["promoted_at", "where_you_were_promoted_to_8th_degree_coral_belt"],
    mediaFields: ["8th_degree_coral_belt_pictures"],
  },
  {
    key: "black_belt_9th_degree",
    label: "9th Degree Red Belt",
    rankName: "Red Belt - 9th Degree",
    rankShortName: "R9",
    dateFields: [
      "9th_degree_coral_belt_promotion_date",
      "date_of_9th_degree_coral_belt_promotion",
      "date_of_9th_degree_black_belt_promotion",
    ],
    promoterFields: ["who_promoted_you_to_9th_degree_black_belt"],
    locationFields: ["where_you_were_promoted_to_9th_degree_coral_belt"],
    mediaFields: ["9th_degree_black_belt_pictures"],
  },
  {
    key: "black_belt_10th_degree",
    label: "10th Degree Red Belt",
    rankName: "Red Belt - 10th Degree (Grand Master)",
    rankShortName: "R10",
    dateFields: [
      "10th_degree_coral_belt_promotion_date",
      "date_of_10th_degree_coral_belt_promotion",
      "date_of_10th_degree_black_belt_promotion",
    ],
    promoterFields: ["who_promoted_you_to_10th_degree_coral_belt"],
    locationFields: ["where_you_were_promoted_to_10th_degree_coral_belt"],
    mediaFields: ["10th_degree_black_belt_pictures"],
  },
] as const

const BJJ_RANK_BY_KEY = new Map(BBL_BJJ_RANK_FIELDS.map(rank => [rank.key, rank]))
const BJJ_RANK_BY_SHORT_NAME = new Map(BBL_BJJ_RANK_FIELDS.map(rank => [rank.rankShortName, rank]))
const BJJ_RANK_ALIASES = new Map<string, BblBjjRankKey>()

for (const rank of BBL_BJJ_RANK_FIELDS) {
  BJJ_RANK_ALIASES.set(normalizeRankText(rank.key), rank.key)
  BJJ_RANK_ALIASES.set(normalizeRankText(rank.label), rank.key)
  BJJ_RANK_ALIASES.set(normalizeRankText(rank.rankName), rank.key)
  BJJ_RANK_ALIASES.set(normalizeRankText(rank.rankShortName), rank.key)
}

for (let degree = 1; degree <= 10; degree++) {
  const key = `black_belt_${ordinal(degree)}_degree` as BblBjjRankKey
  const degreeWord = DEGREE_WORDS[degree]
  BJJ_RANK_ALIASES.set(
    normalizeRankText(`${degree}${ordinalSuffix(degree)} Degree Black Belt`),
    key,
  )
  BJJ_RANK_ALIASES.set(
    normalizeRankText(`${degree}${ordinalSuffix(degree)} Degree Coral Belt`),
    key,
  )
  BJJ_RANK_ALIASES.set(normalizeRankText(`${degree}${ordinalSuffix(degree)} Degree Red Belt`), key)
  BJJ_RANK_ALIASES.set(normalizeRankText(`${degreeWord} Degree Black Belt`), key)
  BJJ_RANK_ALIASES.set(
    normalizeRankText(`Black Belt ${degree}${ordinalSuffix(degree)} Degree`),
    key,
  )
}

BJJ_RANK_ALIASES.set(normalizeRankText("Black Belt"), "black_belt")
BJJ_RANK_ALIASES.set(normalizeRankText("Coral Belt"), "black_belt_8th_degree")
BJJ_RANK_ALIASES.set(normalizeRankText("Red and Black Coral Belt"), "black_belt_7th_degree")
BJJ_RANK_ALIASES.set(normalizeRankText("Red White Coral Belt"), "black_belt_8th_degree")
BJJ_RANK_ALIASES.set(normalizeRankText("Red Belt"), "black_belt_9th_degree")

export function getBblBjjRankByKey(key: BblBjjRankKey): BblBjjRankField {
  const rank = BJJ_RANK_BY_KEY.get(key)
  if (!rank) {
    throw new Error(`Unknown BBL BJJ rank key: ${key}`)
  }
  return rank
}

export function findBblBjjRankByShortName(shortName: string): BblBjjRankField | null {
  return BJJ_RANK_BY_SHORT_NAME.get(shortName.trim().toUpperCase()) ?? null
}

export function normalizeBblBjjRankName(value: unknown): BblBjjRankField | null {
  const text = readScalar(value)
  if (!text) {
    return null
  }
  const key = BJJ_RANK_ALIASES.get(normalizeRankText(text))
  return key ? getBblBjjRankByKey(key) : null
}

export function normalizeBblVerificationStatus(value: unknown): BblLineageVerificationStatus {
  if (typeof value === "boolean") {
    return value ? "VERIFIED" : "PENDING"
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    return normalizeBblVerificationStatus(
      record.verificationStatus ??
        record.verification_status ??
        record.status ??
        record.decision ??
        record.verified ??
        record.is_verified,
    )
  }

  const text = readScalar(value)
  if (!text) {
    return "PENDING"
  }

  const normalized = normalizeRankText(text)
  if (["verified", "approved", "approve", "active", "true", "yes"].includes(normalized)) {
    return "VERIFIED"
  }
  if (["disputed", "dispute", "rejected", "denied", "false"].includes(normalized)) {
    return normalized === "false" ? "PENDING" : "DISPUTED"
  }
  return "PENDING"
}

export function extractBblBjjRankAwards(
  record: Record<string, unknown>,
  options: ExtractBblBjjRankAwardsOptions = {},
): BblBjjRankAwardImport[] {
  const verificationStatus = normalizeBblVerificationStatus(
    record.is_verified ??
      record.verified ??
      record.verificationStatus ??
      record.verification_status,
  )
  const awards = BBL_BJJ_RANK_FIELDS.flatMap(rank => {
    const date = readFirstField(record, rank.dateFields)
    const promoter = readFirstField(record, rank.promoterFields)
    const location = readFirstField(record, rank.locationFields)
    const media = readFirstField(record, rank.mediaFields)
    const mediaUrls = readMediaUrls(media?.value)

    if (!date && !promoter && !location && mediaUrls.length === 0) {
      return []
    }

    return [
      {
        key: rank.key,
        label: rank.label,
        rankName: rank.rankName,
        rankShortName: rank.rankShortName,
        awardedAt: readScalar(date?.value),
        promotedByLegacyRef: readReference(promoter?.value),
        locationLegacyRef: readReference(location?.value),
        mediaUrls,
        verificationStatus,
        isVerified: verificationStatus === "VERIFIED",
        sourceDateField: date?.field ?? null,
        sourcePromoterField: promoter?.field ?? null,
        sourceLocationField: location?.field ?? null,
        sourceMediaField: media?.field ?? null,
      },
    ]
  })

  if (!options.includeCurrentRankFallback || awards.length > 0) {
    return awards
  }

  const currentRank = normalizeBblBjjRankName(
    record.current_rank_in_bjj ?? record.current_rank ?? record.belt_color ?? record.rank,
  )
  if (!currentRank) {
    return awards
  }

  return [
    {
      key: currentRank.key,
      label: currentRank.label,
      rankName: currentRank.rankName,
      rankShortName: currentRank.rankShortName,
      awardedAt: null,
      promotedByLegacyRef: readReference(record.instructor ?? record.instructor_id),
      locationLegacyRef: readReference(record.promotion_school ?? record.promoted_at),
      mediaUrls: [],
      verificationStatus,
      isVerified: verificationStatus === "VERIFIED",
      sourceDateField: null,
      sourcePromoterField: record.instructor
        ? "instructor"
        : record.instructor_id
          ? "instructor_id"
          : null,
      sourceLocationField: record.promotion_school
        ? "promotion_school"
        : record.promoted_at
          ? "promoted_at"
          : null,
      sourceMediaField: null,
    },
  ]
}

function readFirstField(record: Record<string, unknown>, fields: readonly string[]) {
  for (const field of fields) {
    const value = record[field]
    if (hasValue(value)) {
      return { field, value }
    }
  }
  return null
}

function readScalar(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(readScalar).find(Boolean) ?? null
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    return (
      readScalar(record.id) ??
      readScalar(record.ID) ??
      readScalar(record.value) ??
      readScalar(record.slug) ??
      readScalar(record.post_name) ??
      readScalar(record.name) ??
      readScalar(record.post_title) ??
      readScalar(record.title) ??
      readScalar(record.label)
    )
  }
  return null
}

function readReference(value: unknown): string | null {
  return readScalar(value)
}

function readMediaUrls(value: unknown): string[] {
  if (!hasValue(value)) {
    return []
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map(url => url.trim())
      .filter(Boolean)
  }
  if (Array.isArray(value)) {
    return value.flatMap(readMediaUrls)
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    const url =
      readScalar(record.url) ??
      readScalar(record.guid) ??
      readScalar(record.source_url) ??
      readScalar(record.file) ??
      readScalar(record.href)
    return url ? [url] : []
  }
  return []
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value === "string") {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.some(hasValue)
  }
  return true
}

function normalizeRankText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_/()-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function ordinal(value: number): string {
  if (value === 1) return "1st"
  if (value === 2) return "2nd"
  if (value === 3) return "3rd"
  return `${value}th`
}

function ordinalSuffix(value: number): string {
  if (value === 1) return "st"
  if (value === 2) return "nd"
  if (value === 3) return "rd"
  return "th"
}
