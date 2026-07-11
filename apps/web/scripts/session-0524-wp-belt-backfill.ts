/**
 * SESSION_0524 — backfill canonical-tree members' current BJJ belts from the local
 * Black Belt Legacy WordPress database.
 *
 * The live production tree determines the target set at runtime. WordPress matching is
 * normalized-name exact (never fuzzy), and ranks must come from structured legacy evidence:
 * current-rank postmeta, promotion ladders, rank/category taxonomy, linked Gravity Forms rank
 * fields. Legacy `member` is only a container: it is never treated as rank evidence by itself.
 *
 * DRY RUN (default), from apps/web:
 *   bun --env-file=/Users/brianscott/dev/ronin-0522/apps/web/.env.prod \
 *     scripts/session-0524-wp-belt-backfill.ts
 *
 * APPLY (only after the operator reviews and explicitly authorizes that exact dry-run):
 *   bun --env-file=/Users/brianscott/dev/ronin-0522/apps/web/.env.prod \
 *     scripts/session-0524-wp-belt-backfill.ts --apply --expect-plan=<dry-run sha256>
 *
 * No app-module imports: `.env.prod` replaces the environment and app modules invoke runtime
 * env validation. RankAward stays IMPORTED historical truth; its RankEntry projection is VERIFIED.
 */
import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import { createInterface } from "node:readline"
import { PrismaPg } from "@prisma/adapter-pg"
import {
  PrismaClient,
  RankAwardSource,
  RankAwardVerificationStatus,
} from "../.generated/prisma/client"

const TREE_SLUG = "rigan-machado-lineage"
const BJJ_RANK_SYSTEM = "IBJJF Belt System"
const DEFAULT_WP_SQL = "/Users/brianscott/Local Sites/BlackBeltLegacy/app/sql/local.sql"
const DEFAULT_WP_PREFIX = "wp_6gp3emte7t_"
const APPLY = process.argv.includes("--apply")

const argumentValue = (name: string) =>
  process.argv.find(argument => argument.startsWith(`${name}=`))?.slice(name.length + 1)

const WP_SQL = argumentValue("--wp-sql") ?? process.env.BBL_WP_SQL_DUMP ?? DEFAULT_WP_SQL
const WP_PREFIX =
  argumentValue("--wp-prefix") ?? process.env.BBL_WP_TABLE_PREFIX ?? DEFAULT_WP_PREFIX
const EXPECTED_PLAN = argumentValue("--expect-plan")

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL missing — run with --env-file=<prod env>")

const dbHost = connectionString.replace(/^.*@/, "").replace(/\/.*$/, "").split("?")[0]
if (/^(localhost|127\.0\.0\.1|\[?::1\]?)\b/i.test(dbHost) || dbHost.endsWith(".local")) {
  throw new Error(`Expected live production, got local database host ${dbHost}`)
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const RANK_ORDER = {
  W0: 0,
  BL0: 1,
  P0: 2,
  BR0: 3,
  BK0: 4,
  BK1: 5,
  BK2: 6,
  BK3: 7,
  BK4: 8,
  BK5: 9,
  BK6: 10,
  CB7: 11,
  CB8: 12,
  R9: 13,
  R10: 14,
} as const

type RankShortName = keyof typeof RANK_ORDER

const SUPPORTED_MEMBER_POST_TYPES = new Set([
  "bbl_member",
  "bbl_member_profile",
  "member",
  "bob_bass_student",
  "rigan_machado_studen",
  "bill_hosken_student",
  "renato_magno_student",
  "andre_lima_student",
])

const NAME_META_KEYS = [
  "name",
  "full_name",
  "student_name",
  "name_of_student",
  "renato_magno_student_name",
  "display_name",
] as const

const CURRENT_RANK_META_KEYS = [
  "current_rank_in_bjj",
  "current_rank_in_brazilian_jiu_jitsu",
  "current_rank",
  "current_belt",
  "belt",
] as const

const normalizeName = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&[a-z0-9#]+;/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

const shortNameForDegree = (degree: number): RankShortName | null => {
  if (degree >= 1 && degree <= 6) return `BK${degree}` as RankShortName
  if (degree === 7) return "CB7"
  if (degree === 8) return "CB8"
  if (degree === 9) return "R9"
  if (degree === 10) return "R10"
  return null
}

/** Accepts exact rank labels and rank-category labels such as "Brown Belts of Bob Bass". */
const shortNameForRankLabel = (label: string): RankShortName | null => {
  const normalized = normalizeName(label)
    .replace(/^bjj\s+/, "")
    .replace(/^new\s+/, "")
  const core = normalized.replace(/\s+of\s+.+$/, "").trim()
  const degree =
    core.match(/^(\d+)(?:st|nd|rd|th)? degree (?:black|coral|red) belts?$/)?.[1] ??
    core.match(/^(?:black|coral|red) belts? (\d+)(?:st|nd|rd|th)? degree$/)?.[1]
  if (degree) return shortNameForDegree(Number(degree))
  if (/^white(?: belts?)?$/.test(core)) return "W0"
  if (/^blue(?: belts?)?$/.test(core)) return "BL0"
  if (/^purple(?: belts?)?$/.test(core)) return "P0"
  if (/^brown(?: belts?)?$/.test(core)) return "BR0"
  if (/^black(?: belts?)?$/.test(core)) return "BK0"
  if (/^coral(?: belts?)?$/.test(core)) return "CB7"
  if (/^red(?: belts?)?$/.test(core)) return "R9"
  return null
}

const shortNameForLadderKey = (key: string): RankShortName | null => {
  const normalized = key.toLowerCase()
  const degree = normalized.match(/(?:^|_)(10th|9th|8th|7th|6th|5th|4th|3rd|2nd|1st)_degree/)?.[1]
  if (degree) return shortNameForDegree(Number.parseInt(degree, 10))
  if (normalized.includes("black_belt")) return "BK0"
  if (normalized.includes("brown_belt")) return "BR0"
  if (normalized.includes("purple_belt")) return "P0"
  if (normalized.includes("blue_belt")) return "BL0"
  if (normalized.includes("white_belt")) return "W0"
  return null
}

/** Inlined equivalent of server/belt/queries.ts; app imports are unsafe under `.env.prod`. */
const rankEntryStatusForAward = (
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "DISPUTED" | "IMPORTED",
) => {
  if (verificationStatus === "VERIFIED" || verificationStatus === "IMPORTED") return "VERIFIED"
  if (verificationStatus === "DISPUTED") return "DISPUTED"
  return "UNVERIFIED"
}

const isRealLegacyValue = (value: string) => {
  const normalized = value.trim().toLowerCase()
  return !["", "0", "0000-00-00", "null", "false", "n/a"].includes(normalized)
}

/** Parse one mysqldump VALUES tuple. The Local dump emits exactly one tuple per INSERT line. */
function parseSqlTuple(line: string, tableName: string): Array<string | null> | null {
  const marker = `INSERT INTO \`${WP_PREFIX}${tableName}\` VALUES (`
  if (!line.startsWith(marker) || !line.endsWith(");")) return null
  const input = line.slice(marker.length, -2)
  const values: Array<string | null> = []
  let field = ""
  let quoted = false
  let wasQuoted = false
  let escaped = false

  const push = () => {
    const value = wasQuoted ? field : field.trim()
    values.push(!wasQuoted && value === "NULL" ? null : value)
    field = ""
    wasQuoted = false
  }

  for (let index = 0; index < input.length; index++) {
    const character = input[index]
    if (quoted) {
      if (escaped) {
        const escapes: Record<string, string> = {
          "0": "\0",
          b: "\b",
          n: "\n",
          r: "\r",
          t: "\t",
          Z: "\x1a",
          "'": "'",
          '"': '"',
          "\\": "\\",
        }
        field += escapes[character] ?? character
        escaped = false
      } else if (character === "\\") {
        escaped = true
      } else if (character === "'") {
        quoted = false
      } else {
        field += character
      }
      continue
    }

    if (character === "'") {
      quoted = true
      wasQuoted = true
    } else if (character === ",") {
      push()
    } else {
      field += character
    }
  }
  if (quoted || escaped) throw new Error(`Malformed SQL tuple for ${tableName}`)
  push()
  return values
}

type WpPost = {
  id: number
  title: string
  status: string
  slug: string
  type: string
}

type WpTerm = { name: string; slug: string }
type WpTaxonomy = { termId: number; taxonomy: string }
type GravityFieldValue = { metaKey: string; value: string }
type GravityEntry = {
  formId: number
  entryId: number
  postIds: Set<number>
  fields: GravityFieldValue[]
}

type WpSnapshot = {
  posts: Map<number, WpPost>
  postmeta: Map<number, Map<string, string[]>>
  terms: Map<number, WpTerm>
  taxonomies: Map<number, WpTaxonomy>
  relationships: Map<number, number[]>
  gravityEntries: Map<string, GravityEntry>
  gravityFieldLabels: Map<number, Map<string, string>>
}

const relevantPostmeta = (key: string) =>
  NAME_META_KEYS.includes(key as (typeof NAME_META_KEYS)[number]) ||
  CURRENT_RANK_META_KEYS.includes(key as (typeof CURRENT_RANK_META_KEYS)[number]) ||
  key === "belt_degree" ||
  /(?:belt|degree).*(?:promotion|date)|(?:promotion|date).*(?:belt|degree)/i.test(key)

const gravityEntryKey = (formId: number, entryId: number) => `${formId}:${entryId}`

async function readWordPressSnapshot(): Promise<WpSnapshot> {
  const posts = new Map<number, WpPost>()
  const postmeta = new Map<number, Map<string, string[]>>()
  const terms = new Map<number, WpTerm>()
  const taxonomies = new Map<number, WpTaxonomy>()
  const relationships = new Map<number, number[]>()
  const gravityEntries = new Map<string, GravityEntry>()
  const gravityFieldLabels = new Map<number, Map<string, string>>()

  const lines = createInterface({
    input: createReadStream(WP_SQL),
    crlfDelay: Number.POSITIVE_INFINITY,
  })

  for await (const line of lines) {
    if (!line.startsWith(`INSERT INTO \`${WP_PREFIX}`)) continue

    const postRow = parseSqlTuple(line, "posts")
    if (postRow) {
      if (postRow.length !== 23)
        throw new Error(`Unexpected WordPress posts row width ${postRow.length}`)
      posts.set(Number(postRow[0]), {
        id: Number(postRow[0]),
        title: postRow[5] ?? "",
        status: postRow[7] ?? "",
        slug: postRow[11] ?? "",
        type: postRow[20] ?? "",
      })
      continue
    }

    const metaRow = parseSqlTuple(line, "postmeta")
    if (metaRow) {
      if (metaRow.length !== 4)
        throw new Error(`Unexpected WordPress postmeta row width ${metaRow.length}`)
      const postId = Number(metaRow[1])
      const key = metaRow[2]
      const value = metaRow[3]
      if (!key || value === null || !relevantPostmeta(key)) continue
      const valuesByKey = postmeta.get(postId) ?? new Map<string, string[]>()
      valuesByKey.set(key, [...(valuesByKey.get(key) ?? []), value])
      postmeta.set(postId, valuesByKey)
      continue
    }

    const termRow = parseSqlTuple(line, "terms")
    if (termRow) {
      if (termRow.length !== 4)
        throw new Error(`Unexpected WordPress terms row width ${termRow.length}`)
      terms.set(Number(termRow[0]), { name: termRow[1] ?? "", slug: termRow[2] ?? "" })
      continue
    }

    const taxonomyRow = parseSqlTuple(line, "term_taxonomy")
    if (taxonomyRow) {
      if (taxonomyRow.length !== 6) {
        throw new Error(`Unexpected WordPress term_taxonomy row width ${taxonomyRow.length}`)
      }
      taxonomies.set(Number(taxonomyRow[0]), {
        termId: Number(taxonomyRow[1]),
        taxonomy: taxonomyRow[2] ?? "",
      })
      continue
    }

    const relationshipRow = parseSqlTuple(line, "term_relationships")
    if (relationshipRow) {
      if (relationshipRow.length !== 3) {
        throw new Error(
          `Unexpected WordPress term_relationships row width ${relationshipRow.length}`,
        )
      }
      const objectId = Number(relationshipRow[0])
      relationships.set(objectId, [
        ...(relationships.get(objectId) ?? []),
        Number(relationshipRow[1]),
      ])
      continue
    }

    const gravityMetaRow = parseSqlTuple(line, "gf_entry_meta")
    if (gravityMetaRow) {
      if (gravityMetaRow.length !== 6) {
        throw new Error(`Unexpected WordPress gf_entry_meta row width ${gravityMetaRow.length}`)
      }
      const formId = Number(gravityMetaRow[1])
      const entryId = Number(gravityMetaRow[2])
      const metaKey = gravityMetaRow[3]
      const value = gravityMetaRow[4]
      if (!metaKey || value === null) continue
      const key = gravityEntryKey(formId, entryId)
      const entry = gravityEntries.get(key) ?? {
        formId,
        entryId,
        postIds: new Set<number>(),
        fields: [],
      }
      if (metaKey === "_pods_item_id" && /^\d+$/.test(value)) {
        entry.postIds.add(Number(value))
      } else if (!metaKey.startsWith("_") && !metaKey.includes("feed")) {
        entry.fields.push({ metaKey, value })
      }
      gravityEntries.set(key, entry)
      continue
    }

    const gravityFormRow = parseSqlTuple(line, "gf_form_meta")
    if (gravityFormRow) {
      if (gravityFormRow.length !== 5) {
        throw new Error(`Unexpected WordPress gf_form_meta row width ${gravityFormRow.length}`)
      }
      const formId = Number(gravityFormRow[0])
      const displayMeta = gravityFormRow[1]
      if (!displayMeta) continue
      const parsed = JSON.parse(displayMeta) as {
        fields?: Array<{ id?: number | string; label?: string }>
      }
      const labels = new Map<string, string>()
      for (const field of parsed.fields ?? []) {
        if (field.id === undefined || !field.label) continue
        labels.set(String(field.id), field.label)
      }
      gravityFieldLabels.set(formId, labels)
    }
  }

  return {
    posts,
    postmeta,
    terms,
    taxonomies,
    relationships,
    gravityEntries,
    gravityFieldLabels,
  }
}

const valuesForMeta = (values: Map<string, string[]>, key: string) => values.get(key) ?? []

const resolveWpPick = (raw: string, snapshot: WpSnapshot) => {
  const postTitle = raw.match(/post_title";s:\d+:"([^"]*)"/)?.[1]
  if (postTitle) return postTitle
  const termName = raw.match(/"name";s:\d+:"([^"]*)"/)?.[1]
  if (termName) return termName
  if (/^\d+$/.test(raw)) {
    const id = Number(raw)
    return snapshot.terms.get(id)?.name ?? snapshot.posts.get(id)?.title ?? raw
  }
  return raw
}

type RankEvidenceKind =
  | "current-rank-postmeta"
  | "promotion-ladder"
  | "rank-taxonomy"
  | "gravity-form-rank"
  | "belt-degree-postmeta"

type RankEvidence = {
  rank: RankShortName
  kind: RankEvidenceKind
  postId: number
  source: string
}

type WpCandidate = {
  post: WpPost
  matchedNames: string[]
  evidence: RankEvidence[]
}

const gravityEntriesByPost = (snapshot: WpSnapshot) => {
  const byPost = new Map<number, GravityEntry[]>()
  for (const entry of snapshot.gravityEntries.values()) {
    for (const postId of entry.postIds) {
      byPost.set(postId, [...(byPost.get(postId) ?? []), entry])
    }
  }
  return byPost
}

function collectCandidateEvidence(
  post: WpPost,
  snapshot: WpSnapshot,
  gravityByPost: Map<number, GravityEntry[]>,
): RankEvidence[] {
  const evidence: RankEvidence[] = []
  const values = snapshot.postmeta.get(post.id) ?? new Map<string, string[]>()

  for (const key of CURRENT_RANK_META_KEYS) {
    for (const raw of valuesForMeta(values, key)) {
      const resolved = resolveWpPick(raw, snapshot)
      const rank = shortNameForRankLabel(resolved)
      if (!rank) continue
      evidence.push({
        rank,
        kind: "current-rank-postmeta",
        postId: post.id,
        source: `WP#${post.id} postmeta.${key}="${resolved}"`,
      })
    }
  }

  for (const [key, rawValues] of values) {
    if (!/(?:belt|degree).*(?:promotion|date)|(?:promotion|date).*(?:belt|degree)/i.test(key)) {
      continue
    }
    const rank = shortNameForLadderKey(key)
    if (!rank) continue
    for (const value of rawValues) {
      if (!isRealLegacyValue(value)) continue
      evidence.push({
        rank,
        kind: "promotion-ladder",
        postId: post.id,
        source: `WP#${post.id} postmeta.${key}="${value}"`,
      })
    }
  }

  for (const raw of valuesForMeta(values, "belt_degree")) {
    const match = normalizeName(raw).match(/^(\d+)(?:st|nd|rd|th)?(?: degree)?$/)
    const rank = match ? shortNameForDegree(Number(match[1])) : null
    if (!rank) continue
    evidence.push({
      rank,
      kind: "belt-degree-postmeta",
      postId: post.id,
      source: `WP#${post.id} postmeta.belt_degree="${raw}"`,
    })
  }

  for (const taxonomyId of snapshot.relationships.get(post.id) ?? []) {
    const taxonomy = snapshot.taxonomies.get(taxonomyId)
    const term = taxonomy ? snapshot.terms.get(taxonomy.termId) : null
    if (!taxonomy || !term) continue
    const rank = shortNameForRankLabel(term.name) ?? shortNameForRankLabel(term.slug)
    if (!rank) continue
    evidence.push({
      rank,
      kind: "rank-taxonomy",
      postId: post.id,
      source: `WP#${post.id} ${taxonomy.taxonomy}="${term.name}"`,
    })
  }

  for (const entry of gravityByPost.get(post.id) ?? []) {
    const labels = snapshot.gravityFieldLabels.get(entry.formId)
    for (const field of entry.fields) {
      const baseFieldId = field.metaKey.split(".")[0]
      const label = labels?.get(baseFieldId)
      if (!label || !/(?:rank|current\s+belt)/i.test(label) || /size/i.test(label)) continue
      const resolved = resolveWpPick(field.value, snapshot)
      const rank = shortNameForRankLabel(resolved)
      if (!rank) continue
      evidence.push({
        rank,
        kind: "gravity-form-rank",
        postId: post.id,
        source: `WP#${post.id} GF form=${entry.formId} entry=${entry.entryId} field=${field.metaKey} (${label})="${resolved}"`,
      })
    }
  }

  const deduplicated = new Map(evidence.map(item => [`${item.rank}:${item.source}`, item]))
  return [...deduplicated.values()].sort(
    (left, right) =>
      RANK_ORDER[left.rank] - RANK_ORDER[right.rank] || left.source.localeCompare(right.source),
  )
}

function reconcileWordPressTargets(
  targetNames: string[],
  snapshot: WpSnapshot,
): Map<string, WpCandidate[]> {
  const targetByNormalizedName = new Map<string, string>()
  for (const name of targetNames) {
    const normalized = normalizeName(name)
    const collision = targetByNormalizedName.get(normalized)
    if (collision)
      throw new Error(`Production name collision after normalization: "${collision}" / "${name}"`)
    targetByNormalizedName.set(normalized, name)
  }

  const candidatesByTarget = new Map<string, WpCandidate[]>()
  const gravityByPost = gravityEntriesByPost(snapshot)
  for (const post of snapshot.posts.values()) {
    if (!SUPPORTED_MEMBER_POST_TYPES.has(post.type)) continue
    if (["trash", "auto-draft", "inherit"].includes(post.status)) continue
    const values = snapshot.postmeta.get(post.id) ?? new Map<string, string[]>()
    const names = new Set<string>([post.title])
    for (const key of NAME_META_KEYS) {
      for (const value of valuesForMeta(values, key)) names.add(value)
    }
    const matchedTargets = new Set(
      [...names]
        .map(normalizeName)
        .map(name => targetByNormalizedName.get(name))
        .filter((name): name is string => Boolean(name)),
    )
    if (matchedTargets.size === 0) continue
    if (matchedTargets.size > 1) {
      throw new Error(
        `WordPress post ${post.id} matched multiple production targets: ${[...matchedTargets].join(", ")}`,
      )
    }
    const target = [...matchedTargets][0]
    const candidate: WpCandidate = {
      post,
      matchedNames: [...names].filter(Boolean).sort(),
      evidence: collectCandidateEvidence(post, snapshot, gravityByPost),
    }
    candidatesByTarget.set(target, [...(candidatesByTarget.get(target) ?? []), candidate])
  }

  for (const candidates of candidatesByTarget.values()) {
    candidates.sort((left, right) => left.post.id - right.post.id)
  }
  return candidatesByTarget
}

type LiveTarget = {
  memberId: string
  nodeId: string
  passportId: string
  displayName: string
}

type BackfillPlanItem = LiveTarget & {
  rankId: string
  rankName: string
  rankShortName: RankShortName
  wpRecords: Array<Pick<WpPost, "id" | "status" | "type">>
  evidence: RankEvidence[]
}

async function getLiveTargetSet(treeId: string) {
  const members = await db.lineageTreeMember.findMany({
    where: { treeId },
    orderBy: [{ node: { passport: { displayName: "asc" } } }, { id: "asc" }],
    select: {
      id: true,
      node: {
        select: {
          id: true,
          isVerified: true,
          verificationStatus: true,
          passport: {
            select: {
              id: true,
              displayName: true,
              rankAwardsEarned: { select: { id: true } },
            },
          },
        },
      },
    },
  })

  const beltless = members.filter(member => member.node.passport.rankAwardsEarned.length === 0)
  const targets: LiveTarget[] = beltless
    .filter(member => member.node.isVerified || member.node.verificationStatus === "VERIFIED")
    .map(member => {
      const displayName = member.node.passport.displayName?.trim()
      if (!displayName)
        throw new Error(`Target passport ${member.node.passport.id} has no displayName`)
      return {
        memberId: member.id,
        nodeId: member.node.id,
        passportId: member.node.passport.id,
        displayName,
      }
    })

  const excluded = beltless.filter(
    member => !member.node.isVerified && member.node.verificationStatus !== "VERIFIED",
  )
  return { members, beltless, targets, excluded }
}

async function resolveBjjRanks(shortNames: RankShortName[]) {
  const systems = await db.rankSystem.findMany({
    where: { name: BJJ_RANK_SYSTEM, discipline: { code: "bjj" } },
    select: { id: true, name: true },
  })
  if (systems.length !== 1) {
    throw new Error(`Expected exactly one BJJ ${BJJ_RANK_SYSTEM}, found ${systems.length}`)
  }
  const ranks = await db.rank.findMany({
    where: { rankSystemId: systems[0].id, shortName: { in: shortNames } },
    select: { id: true, name: true, shortName: true },
  })
  const byShortName = new Map(ranks.map(rank => [rank.shortName, rank]))
  for (const shortName of shortNames) {
    if (!byShortName.has(shortName))
      throw new Error(`No ${BJJ_RANK_SYSTEM} Rank found for ${shortName}`)
  }
  return byShortName
}

function selectedRank(candidates: WpCandidate[]) {
  const allEvidence = candidates.flatMap(candidate => candidate.evidence)
  if (allEvidence.length === 0) return null
  return [...allEvidence].sort(
    (left, right) =>
      RANK_ORDER[right.rank] - RANK_ORDER[left.rank] || left.source.localeCompare(right.source),
  )[0].rank
}

function planFingerprint(items: BackfillPlanItem[], wpFile: { size: number; mtimeMs: number }) {
  const payload = {
    treeSlug: TREE_SLUG,
    wp: { path: WP_SQL, prefix: WP_PREFIX, size: wpFile.size, mtimeMs: Math.trunc(wpFile.mtimeMs) },
    items: items.map(item => ({
      memberId: item.memberId,
      nodeId: item.nodeId,
      passportId: item.passportId,
      displayName: item.displayName,
      rankId: item.rankId,
      rankShortName: item.rankShortName,
      wpRecords: item.wpRecords,
      evidence: item.evidence,
    })),
  }
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex")
}

function notesFor(item: BackfillPlanItem) {
  const recordSummary = item.wpRecords.map(record => `${record.id}:${record.type}`).join(",")
  const selectedEvidence = item.evidence
    .filter(evidence => evidence.rank === item.rankShortName)
    .map(evidence => evidence.source)
    .join("; ")
  return `SESSION_0524 WordPress belt backfill from blackbeltlegacy.local; records=${recordSummary}; evidence=${selectedEvidence}`
}

type AxisMember = {
  displayName: string
  oldVerified: boolean
  topRankStatus: "PENDING" | "UNVERIFIED" | "VERIFIED" | "DISPUTED" | null
  awardCount: number
}

async function crossAxisProbe(treeId: string) {
  const members = await db.lineageTreeMember.findMany({
    where: { treeId },
    orderBy: [{ node: { passport: { displayName: "asc" } } }, { id: "asc" }],
    select: {
      node: {
        select: {
          isVerified: true,
          verificationStatus: true,
          passport: {
            select: {
              displayName: true,
              rankAwardsEarned: {
                orderBy: [{ rank: { sortOrder: "desc" } }, { awardedAt: "desc" }, { id: "asc" }],
                select: { rankEntry: { select: { status: true } } },
              },
            },
          },
        },
      },
    },
  })

  const axis: AxisMember[] = members.map(member => {
    const awards = member.node.passport.rankAwardsEarned
    const topRankStatus = awards
      .map(award => award.rankEntry?.status ?? null)
      .find(status => status !== null && status !== "PENDING")
    return {
      displayName: member.node.passport.displayName ?? "(unnamed)",
      oldVerified: member.node.isVerified || member.node.verificationStatus === "VERIFIED",
      topRankStatus: topRankStatus ?? null,
      awardCount: awards.length,
    }
  })
  const oldVerified = axis.filter(member => member.oldVerified)
  const rankVerified = axis.filter(member => member.topRankStatus === "VERIFIED")
  const regressions = axis.filter(
    member => member.oldVerified && member.topRankStatus !== "VERIFIED",
  )
  const intendedFixes = axis.filter(
    member => !member.oldVerified && member.topRankStatus === "VERIFIED",
  )
  const fallback = axis.filter(member => member.oldVerified && member.topRankStatus === null)
  const resolvedVerified = axis.filter(
    member =>
      member.topRankStatus === "VERIFIED" || (member.topRankStatus === null && member.oldVerified),
  )
  const beltless = axis.filter(member => member.awardCount === 0)

  return {
    total: axis.length,
    oldVerified,
    rankVerified,
    regressions,
    intendedFixes,
    fallback,
    resolvedVerified,
    beltless,
  }
}

function printAxisProbe(label: string, probe: Awaited<ReturnType<typeof crossAxisProbe>>) {
  console.log(`\n== ${label}: cross-axis proof ==`)
  console.log(`  canonical-tree members: ${probe.total}`)
  console.log(`  OLD membership-verified: ${probe.oldVerified.length}`)
  console.log(`  RankEntry VERIFIED: ${probe.rankVerified.length}`)
  console.log(
    `  resolved VERIFIED (RankEntry + beltless fallback): ${probe.resolvedVerified.length}`,
  )
  console.log(`  intended RankEntry-only fixes: ${probe.intendedFixes.length}`)
  console.log(`  OLD→RankEntry regressions: ${probe.regressions.length}`)
  console.log(`  membership fallback used: ${probe.fallback.length}`)
  console.log(`  no RankAward: ${probe.beltless.length}`)
  if (probe.regressions.length) {
    console.log(
      `  regression names: ${probe.regressions.map(member => member.displayName).join(" | ")}`,
    )
  }
}

async function applyPlan(treeId: string, items: BackfillPlanItem[]) {
  return db.$transaction(
    async transaction => {
      const results: Array<{ displayName: string; rankAwardId: string; rankEntryId: string }> = []
      for (const item of items) {
        const member = await transaction.lineageTreeMember.findUnique({
          where: { id: item.memberId },
          select: {
            treeId: true,
            node: {
              select: {
                id: true,
                passportId: true,
                isVerified: true,
                verificationStatus: true,
                passport: { select: { rankAwardsEarned: { select: { id: true } } } },
              },
            },
          },
        })
        if (!member || member.treeId !== treeId || member.node.id !== item.nodeId) {
          throw new Error(`${item.displayName}: canonical-tree membership changed after dry-run`)
        }
        if (member.node.passportId !== item.passportId) {
          throw new Error(`${item.displayName}: member passport changed after dry-run`)
        }
        if (!member.node.isVerified && member.node.verificationStatus !== "VERIFIED") {
          throw new Error(`${item.displayName}: membership trust changed after dry-run`)
        }
        if (member.node.passport.rankAwardsEarned.length !== 0) {
          throw new Error(
            `${item.displayName}: RankAward appeared after dry-run; refusing to overwrite`,
          )
        }

        const award = await transaction.rankAward.create({
          data: {
            passportId: item.passportId,
            rankId: item.rankId,
            source: RankAwardSource.STATED,
            verificationStatus: RankAwardVerificationStatus.IMPORTED,
            notes: notesFor(item),
          },
          select: { id: true },
        })
        const entry = await transaction.rankEntry.create({
          data: {
            rankAwardId: award.id,
            passportId: item.passportId,
            rankId: item.rankId,
            status: rankEntryStatusForAward(RankAwardVerificationStatus.IMPORTED),
          },
          select: { id: true },
        })
        results.push({
          displayName: item.displayName,
          rankAwardId: award.id,
          rankEntryId: entry.id,
        })
      }
      return results
    },
    { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 },
  )
}

async function verifyAppliedPlan(items: BackfillPlanItem[]) {
  const passports = await db.passport.findMany({
    where: { id: { in: items.map(item => item.passportId) } },
    select: {
      id: true,
      displayName: true,
      rankAwardsEarned: {
        select: {
          id: true,
          rankId: true,
          source: true,
          verificationStatus: true,
          rankEntry: { select: { id: true, status: true, passportId: true, rankId: true } },
        },
      },
    },
  })
  const byPassport = new Map(passports.map(passport => [passport.id, passport]))
  const failures: string[] = []
  for (const item of items) {
    const passport = byPassport.get(item.passportId)
    const award = passport?.rankAwardsEarned.find(candidate => candidate.rankId === item.rankId)
    if (
      !award ||
      award.source !== "STATED" ||
      award.verificationStatus !== "IMPORTED" ||
      award.rankEntry?.status !== "VERIFIED" ||
      award.rankEntry.passportId !== item.passportId ||
      award.rankEntry.rankId !== item.rankId
    ) {
      failures.push(item.displayName)
    }
  }
  if (failures.length)
    throw new Error(`Post-apply award/entry verification failed: ${failures.join(", ")}`)
  console.log(
    `Post-apply row proof: ${items.length}/${items.length} IMPORTED awards + VERIFIED entries.`,
  )
}

async function main() {
  console.log(`\n### SESSION_0524 WordPress belt backfill — ${APPLY ? "APPLY" : "DRY RUN"} ###`)
  console.log(`DB host: ${dbHost}`)
  console.log(`WP source: ${WP_SQL} (prefix ${WP_PREFIX})`)

  const trees = await db.lineageTree.findMany({
    where: { slug: TREE_SLUG },
    select: { id: true, brand: true, name: true },
  })
  if (trees.length !== 1)
    throw new Error(`Expected exactly one ${TREE_SLUG} tree, found ${trees.length}`)
  const tree = trees[0]
  if (tree.brand !== "BBL") throw new Error(`Expected BBL tree, found brand ${tree.brand}`)

  const targetSet = await getLiveTargetSet(tree.id)
  console.log(`Tree: ${tree.name} (${tree.brand}/${TREE_SLUG})`)
  console.log(`Live members: ${targetSet.members.length}`)
  console.log(`Live no-award members: ${targetSet.beltless.length}`)
  console.log(`Live membership-verified + no-award targets: ${targetSet.targets.length}`)
  if (targetSet.excluded.length) {
    console.log(`Excluded no-award/unverified members: ${targetSet.excluded.length}`)
  }

  const beforeProbe = await crossAxisProbe(tree.id)
  printAxisProbe("BEFORE", beforeProbe)

  if (targetSet.targets.length === 0) {
    console.log(
      "\nNothing to do — the live canonical tree has no membership-verified, awardless targets.",
    )
    return
  }

  const wpFile = await stat(WP_SQL)
  if (!wpFile.isFile()) throw new Error(`WordPress SQL source is not a file: ${WP_SQL}`)
  const snapshot = await readWordPressSnapshot()
  const wpFileAfterRead = await stat(WP_SQL)
  if (wpFile.size !== wpFileAfterRead.size || wpFile.mtimeMs !== wpFileAfterRead.mtimeMs) {
    throw new Error(
      "WordPress SQL source changed while it was being read; re-run from a stable dump",
    )
  }
  const candidatesByTarget = reconcileWordPressTargets(
    targetSet.targets.map(target => target.displayName),
    snapshot,
  )

  const reconciliationErrors: string[] = []
  const selectedByTarget = new Map<
    string,
    { candidates: WpCandidate[]; rankShortName: RankShortName; evidence: RankEvidence[] }
  >()
  for (const target of targetSet.targets) {
    const candidates = candidatesByTarget.get(target.displayName) ?? []
    if (candidates.length === 0) {
      reconciliationErrors.push(`${target.displayName}: no exact normalized-name WordPress match`)
      continue
    }
    const rankShortName = selectedRank(candidates)
    if (!rankShortName) {
      reconciliationErrors.push(
        `${target.displayName}: ${candidates.length} WordPress match(es), but no structured belt evidence`,
      )
      continue
    }
    selectedByTarget.set(target.displayName, {
      candidates,
      rankShortName,
      evidence: candidates.flatMap(candidate => candidate.evidence),
    })
  }

  if (reconciliationErrors.length) {
    console.error("\nRECONCILIATION FAILED — no writes are possible:")
    for (const error of reconciliationErrors) console.error(`  - ${error}`)
    throw new Error(`WordPress reconciliation failed for ${reconciliationErrors.length} target(s)`)
  }

  const neededShortNames = [
    ...new Set([...selectedByTarget.values()].map(item => item.rankShortName)),
  ].sort((left, right) => RANK_ORDER[left] - RANK_ORDER[right])
  const rankByShortName = await resolveBjjRanks(neededShortNames)
  const plan: BackfillPlanItem[] = targetSet.targets.map(target => {
    const selected = selectedByTarget.get(target.displayName)
    if (!selected)
      throw new Error(`Internal error: no selected WordPress rank for ${target.displayName}`)
    const rank = rankByShortName.get(selected.rankShortName)
    if (!rank) throw new Error(`Internal error: no Prisma rank for ${selected.rankShortName}`)
    return {
      ...target,
      rankId: rank.id,
      rankName: rank.name,
      rankShortName: selected.rankShortName,
      wpRecords: selected.candidates.map(candidate => ({
        id: candidate.post.id,
        status: candidate.post.status,
        type: candidate.post.type,
      })),
      evidence: selected.evidence,
    }
  })
  const fingerprint = planFingerprint(plan, { size: wpFile.size, mtimeMs: wpFile.mtimeMs })

  console.log(`\n== Exact ${plan.length}-action plan ==`)
  for (const [index, item] of plan.entries()) {
    const records = item.wpRecords
      .map(record => `#${record.id} ${record.type}/${record.status}`)
      .join(", ")
    const observedRanks = [...new Set(item.evidence.map(evidence => evidence.rank))].sort(
      (left, right) => RANK_ORDER[left] - RANK_ORDER[right],
    )
    const evidenceByRecord = item.wpRecords.map(record => {
      const recordRanks = [
        ...new Set(
          item.evidence
            .filter(evidence => evidence.postId === record.id)
            .map(evidence => evidence.rank),
        ),
      ].sort((left, right) => RANK_ORDER[left] - RANK_ORDER[right])
      return `#${record.id}=${recordRanks.join("→") || "none"}`
    })
    console.log(
      `${String(index + 1).padStart(2, "0")}. ${item.displayName} | ${item.rankName} (${item.rankShortName})`,
    )
    console.log(`    WP: ${records}`)
    console.log(`    per-record observed ranks: ${evidenceByRecord.join(", ")}`)
    console.log(
      `    selection: highest structured progression ${observedRanks.join("→")} ⇒ ${item.rankShortName}`,
    )
    console.log(
      `    ALL evidence: ${item.evidence.map(evidence => `[${evidence.rank}] ${evidence.source}`).join(" ; ")}`,
    )
    console.log("    change: RankAward ∅ → STATED/IMPORTED; RankEntry ∅ → VERIFIED")
  }
  console.log(`\nPlan fingerprint (sha256): ${fingerprint}`)

  if (!APPLY) {
    console.log("\nDRY RUN — no production writes were attempted.")
    console.log("After explicit operator authorization of every action above, apply with:")
    console.log(`  --apply --expect-plan=${fingerprint}`)
    return
  }

  if (!EXPECTED_PLAN) {
    throw new Error(
      "--apply requires --expect-plan=<sha256 from the explicitly authorized dry-run>",
    )
  }
  if (EXPECTED_PLAN !== fingerprint) {
    throw new Error(
      `Plan changed after review: expected ${EXPECTED_PLAN}, derived ${fingerprint}. Re-review; no writes made.`,
    )
  }

  console.log(
    `\nApplying ${plan.length} explicitly fingerprinted actions in one serializable transaction...`,
  )
  const results = await applyPlan(tree.id, plan)
  console.log(`APPLIED: ${results.length} RankAward + RankEntry pairs created.`)
  await verifyAppliedPlan(plan)
  const afterProbe = await crossAxisProbe(tree.id)
  printAxisProbe("AFTER", afterProbe)
  if (
    afterProbe.regressions.length !== 0 ||
    afterProbe.fallback.length !== 0 ||
    afterProbe.beltless.length !== 0
  ) {
    throw new Error(
      `Cross-axis proof failed: regressions=${afterProbe.regressions.length}, fallback=${afterProbe.fallback.length}, beltless=${afterProbe.beltless.length}`,
    )
  }
  console.log(
    "\nSUCCESS: zero cross-axis regressions; all former beltless targets now resolve via VERIFIED RankEntry.",
  )
}

main()
  .then(() => db.$disconnect())
  .catch(async error => {
    console.error(error)
    await db.$disconnect()
    process.exit(1)
  })
