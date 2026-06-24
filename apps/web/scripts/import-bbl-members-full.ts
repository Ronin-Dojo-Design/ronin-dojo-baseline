/**
 * import-bbl-members-full.ts
 *
 * Idempotent, dry-run-capable importer that loads the reconciled
 * blackbeltlegacy.com WordPress export (`/tmp/bbl-export/reconciled.json`) and
 * builds the FULL BBL lineage in the Baseline identity spine: every reconciled
 * person becomes a claimable placeholder Passport (+ DirectoryProfile +
 * LineageNode + RankAward + Affiliation + LineageTreeMember) inside the BBL
 * `bbl-lineage` LineageTree, with the WordPress parent→child edges projected
 * onto `LineageTreeMember.primaryVisualParentMemberId` in a second pass.
 *
 * This is the full-roster sibling of `import-bbl-lineage-profiles.ts` (the
 * curated "Dirty Dozen" cohort import). It mirrors that file's conventions
 * exactly: string-literal `BRAND = "BBL"` (NEVER value-import the Prisma `Brand`
 * enum — that pulls Prisma into client bundles), the `PrismaPg` adapter
 * defaulting to the local dev DB, and the `uniqueSlug` / `splitName` /
 * `resolveProfileMedia` helpers.
 *
 * ── What it does (idempotent — re-running creates no duplicate rows) ────────
 *   0. (--ensure-ranks, ON by default) ensure the BJJ Discipline + IBJJF Belt
 *      System RankSystem + all 31 BJJ Rank rows (prod may be migrate-only/unseeded).
 *   1. ensure an Organization per `reconciled.schools` → name→orgId map.
 *   2. ensure the `bbl-lineage` LineageTree.
 *   3. per person: Passport (dedupe by displayName + userId:null, non-destructive
 *      enrich) → DirectoryProfile → LineageNode → RankAward (if rankShort resolves)
 *      → Affiliation (if school in map) → LineageTreeMember (with rankAwardId).
 *   4. 2nd pass: resolve `lineageParent` (a NAME) via a normalized-name→memberId
 *      map and set `primaryVisualParentMemberId` (skip self / unresolved).
 *
 * Avatars: with --media-base set, avatarUrl =
 *   <media-base>/media/bbl/profiles/<avatarBasename>; otherwise left null
 * (images migrate separately). Absolute http(s) avatarBasenames pass through.
 *
 * Usage (from apps/web):
 *   SKIP_ENV_VALIDATION=1 bun run scripts/import-bbl-members-full.ts --dry-run
 *   SKIP_ENV_VALIDATION=1 bun run scripts/import-bbl-members-full.ts \
 *     --media-base https://bbl-media.s3.amazonaws.com --dry-run
 *
 * @see apps/web/scripts/import-bbl-lineage-profiles.ts (the curated-cohort sibling)
 * @see /tmp/bbl-export/reconciled.json (the input)
 */

import { readFileSync } from "node:fs"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

// String literal — do NOT value-import the Prisma `Brand` enum (Prisma-in-browser 500s).
const BRAND = "BBL" as const
const BBL_PROFILE_MEDIA_PREFIX = "media/bbl/profiles"
const RANKAWARD_IMPORT_NOTE = "Imported from blackbeltlegacy.com WP export"

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function flagValue(name: string, fallback: string | null): string | null {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}
const isDryRun = args.includes("--dry-run")
const inputPath = flagValue("--input", "/tmp/bbl-export/reconciled.json")!
const treeSlug = flagValue("--tree-slug", "rigan-machado-lineage")!
const ensureRanks = !args.includes("--no-ensure-ranks")
// --media-base wins; fall back to NEXT_PUBLIC_MEDIA_BASE_URL for parity with lib/media.ts.
const mediaBase = (
  flagValue("--media-base", process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? null) ?? null
)?.replace(/\/+$/, "")

// ── Input shape ───────────────────────────────────────────────────────────
interface ReconciledPerson {
  name: string
  sources: string[]
  rank: string
  rankShort: string | null
  school: string
  instructor: string
  bio: string
  image: string
  avatarBasename: string
  email: string
  slug: string
  parentSlug: string
  lineageParent: string | null
}
interface Reconciled {
  people: ReconciledPerson[]
  schools: string[]
  branches: string[]
  edges: Array<{ child: string; parent: string }>
}

// ── Helpers (mirrored from import-bbl-lineage-profiles.ts) ──────────────────
function splitName(name: string): { first: string; last: string | null } {
  const idx = name.indexOf(" ")
  return idx === -1
    ? { first: name, last: null }
    : { first: name.slice(0, idx), last: name.slice(idx + 1) }
}

function basename(path: string): string {
  return path.split("/").pop() ?? path
}

/** Map an avatar basename/path to its synced media URL. http(s) passes through;
 *  with no media base, returns null (images migrate separately). */
function resolveProfileMedia(avatarBasename: string | null | undefined): string | null {
  if (!avatarBasename) {
    return null
  }
  if (/^https?:\/\//.test(avatarBasename)) {
    return avatarBasename
  }
  if (!mediaBase) {
    return null
  }
  return `${mediaBase}/${BBL_PROFILE_MEDIA_PREFIX}/${basename(avatarBasename)}`
}

/** Find a free globally-unique slug for the given table, appending -2, -3, … */
async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base || "member"
  let n = 2
  while (await exists(candidate)) {
    candidate = `${base || "member"}-${n++}`
  }
  return candidate
}

/** Normalize a name for matching (lineageParent → person). */
function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Normalize a school name for fuzzy matching (D-027): strip punctuation/case,
 *  expand `&`, collapse whitespace — so "South Bay Jiu Jitsu" (export) matches
 *  "South Bay Jiu-Jitsu" (canonical) and "The Sanctuary BJJ & Fitness" is stable. */
function normSchool(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Derive a slug base from a person's `slug` (preferred) or `name`. */
function slugBase(p: ReconciledPerson): string {
  if (p.slug && p.slug.trim()) {
    return p.slug.trim()
  }
  return (
    p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "member"
  )
}

// ── BJJ ranks (mirrors prisma/seed.ts ~726–757) — for --ensure-ranks. ──────
function buildBjjRanks(): Array<{ name: string; shortName: string; colorHex: string }> {
  const ranks: Array<{ name: string; shortName: string; colorHex: string }> = []
  const belts = [
    { belt: "White Belt", prefix: "W", hex: "#FFFFFF" },
    { belt: "Blue Belt", prefix: "BL", hex: "#0000FF" },
    { belt: "Purple Belt", prefix: "P", hex: "#800080" },
    { belt: "Brown Belt", prefix: "BR", hex: "#8B4513" },
  ]
  for (const { belt, prefix, hex } of belts) {
    ranks.push({ name: belt, shortName: `${prefix}0`, colorHex: hex })
    for (let s = 1; s <= 4; s++) {
      ranks.push({
        name: `${belt} - ${s} Stripe${s > 1 ? "s" : ""}`,
        shortName: `${prefix}${s}`,
        colorHex: hex,
      })
    }
  }
  ranks.push(
    { name: "Black Belt", shortName: "BK0", colorHex: "#000000" },
    { name: "Black Belt - 1st Degree", shortName: "BK1", colorHex: "#000000" },
    { name: "Black Belt - 2nd Degree", shortName: "BK2", colorHex: "#000000" },
    { name: "Black Belt - 3rd Degree", shortName: "BK3", colorHex: "#000000" },
    { name: "Black Belt - 4th Degree", shortName: "BK4", colorHex: "#000000" },
    { name: "Black Belt - 5th Degree", shortName: "BK5", colorHex: "#000000" },
    { name: "Black Belt - 6th Degree", shortName: "BK6", colorHex: "#000000" },
    { name: "Coral Belt (Red/Black) - 7th Degree", shortName: "CB7", colorHex: "#FF0000" },
    { name: "Coral Belt (Red/White) - 8th Degree", shortName: "CB8", colorHex: "#FF0000" },
    { name: "Red Belt - 9th Degree", shortName: "R9", colorHex: "#FF0000" },
    { name: "Red Belt - 10th Degree (Grand Master)", shortName: "R10", colorHex: "#FF0000" },
  )
  return ranks
}

// ── Step 0 — ensure BJJ Discipline + RankSystem + Rank rows. ────────────────
async function ensureBjjRanks(): Promise<{ created: number; existing: number }> {
  let created = 0
  let existing = 0

  let discipline = await db.discipline.findFirst({ where: { code: "bjj" }, select: { id: true } })
  if (!discipline) {
    discipline = await db.discipline.create({
      data: { name: "Brazilian Jiu-Jitsu", slug: "bjj", code: "bjj", isSystem: true },
      select: { id: true },
    })
    console.log("   ✅ Discipline created: Brazilian Jiu-Jitsu (bjj)")
  }

  let rankSystem = await db.rankSystem.findFirst({
    where: { name: "IBJJF Belt System", discipline: { code: "bjj" } },
    select: { id: true },
  })
  if (!rankSystem) {
    rankSystem = await db.rankSystem.create({
      data: {
        name: "IBJJF Belt System",
        kind: "BELT",
        isSystem: true,
        disciplineId: discipline.id,
      },
      select: { id: true },
    })
    console.log("   ✅ RankSystem created: IBJJF Belt System")
  }

  const ranks = buildBjjRanks()
  // Append any missing ranks after the current max sortOrder — the rank system may already be
  // populated (prod) with its own ordering, so a fixed `i+1` would collide on @@unique([rankSystemId, sortOrder]).
  const maxRow = await db.rank.findFirst({
    where: { rankSystemId: rankSystem.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  })
  let nextSort = (maxRow?.sortOrder ?? 0) + 1
  for (const r of ranks) {
    const found = await db.rank.findFirst({
      where: { shortName: r.shortName, rankSystemId: rankSystem.id },
      select: { id: true },
    })
    if (found) {
      existing++
      continue
    }
    await db.rank.create({
      data: {
        sortOrder: nextSort++,
        name: r.name,
        shortName: r.shortName,
        colorHex: r.colorHex,
        isSystem: true,
        rankSystemId: rankSystem.id,
      },
    })
    created++
  }
  return { created, existing }
}

async function resolveRankId(shortName: string): Promise<string | null> {
  const rank = await db.rank.findFirst({
    where: { shortName, rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true },
  })
  return rank?.id ?? null
}

// ── Per-person plan (for the dry-run report). ──────────────────────────────
type Action = "CREATE" | "ENRICH" | "SKIP"
interface PersonPlan {
  name: string
  passportAction: Action
  passportId: string | null
  rankShort: string | null
  rankResolved: boolean
  school: string | null
  schoolResolved: boolean
  parentName: string | null
  parentResolved: boolean
}

async function main() {
  console.log(`\n🥋 BBL full-roster lineage import${isDryRun ? " (DRY RUN — writes NOTHING)" : ""}`)
  console.log(
    `   input=${inputPath} tree=${treeSlug} ensure-ranks=${ensureRanks} media-base=${mediaBase ?? "(none → avatarUrl null)"}\n`,
  )

  const data: Reconciled = JSON.parse(readFileSync(inputPath, "utf8"))
  const people = data.people ?? []
  const schools = data.schools ?? []
  console.log(`   Loaded ${people.length} people, ${schools.length} schools.\n`)

  const warnings: string[] = []

  // ── Step 0 — ranks ──────────────────────────────────────────────────────
  // Build the shortName→resolved map up-front so the dry-run can report
  // resolution. In a real run we ensure the rows first.
  if (ensureRanks && !isDryRun) {
    const { created, existing } = await ensureBjjRanks()
    console.log(`   Ranks: ${created} created, ${existing} already present.\n`)
  }
  const distinctRankShorts = Array.from(
    new Set(people.map(p => p.rankShort).filter((s): s is string => !!s)),
  )
  const rankResolved = new Map<string, boolean>()
  for (const shortName of distinctRankShorts) {
    const id = await resolveRankId(shortName)
    rankResolved.set(shortName, id !== null)
    if (id === null) {
      warnings.push(
        `Unresolved rank shortName "${shortName}" — no BJJ Rank row` +
          (ensureRanks
            ? " (would be created by --ensure-ranks in a real run)"
            : " (--no-ensure-ranks)"),
      )
    }
  }

  // ── Step 1 — Organizations (name→id map). ────────────────────────────────
  const schoolToOrgId = new Map<string, string>()
  let orgsCreated = 0
  let orgsExisting = 0
  for (const name of schools) {
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "school"
    const existing = await db.organization.findFirst({
      where: { brand: BRAND, slug },
      select: { id: true },
    })
    if (existing) {
      schoolToOrgId.set(name, existing.id)
      orgsExisting++
      continue
    }
    if (isDryRun) {
      // No write — mark "would create" with a sentinel so school resolution still reports true.
      schoolToOrgId.set(name, "(new)")
      orgsCreated++
      continue
    }
    const org = await db.organization.create({
      data: { brand: BRAND, name, slug, type: "DOJO" },
      select: { id: true },
    })
    schoolToOrgId.set(name, org.id)
    orgsCreated++
  }

  // Normalized school lookup (D-027) — match a person's free-text `school` to an
  // Organization ignoring punctuation/case and stray numeric Pods post-ids.
  const schoolNorm = new Map<string, { name: string; orgId: string }>()
  for (const [name, orgId] of schoolToOrgId) {
    schoolNorm.set(normSchool(name), { name, orgId })
  }
  function matchSchoolForPerson(school: string): { name: string; orgId: string } | null {
    const tokens = (school || "")
      .split("|")
      .map(s => s.trim())
      .filter(Boolean)
    for (const tok of tokens) {
      if (/^\d+$/.test(tok)) {
        continue // stray Pods post-id (e.g. "231"), not a school name
      }
      const hit = schoolNorm.get(normSchool(tok))
      if (hit) {
        return hit
      }
    }
    return null
  }

  // ── Step 2 — LineageTree. ────────────────────────────────────────────────
  let treeId: string | null = null
  let treeAction: Action = "SKIP"
  const existingTree = await db.lineageTree.findUnique({
    where: { brand_slug: { brand: BRAND, slug: treeSlug } },
    select: { id: true },
  })
  if (existingTree) {
    treeId = existingTree.id
  } else if (isDryRun) {
    treeAction = "CREATE"
  } else {
    const tree = await db.lineageTree.create({
      data: {
        brand: BRAND,
        slug: treeSlug,
        name: "Black Belt Legacy — Rigan Machado Lineage",
        scopeType: "CUSTOM",
        visibility: "PUBLIC",
        isPublished: true,
        isClaimable: true,
      },
      select: { id: true },
    })
    treeId = tree.id
    treeAction = "CREATE"
  }

  // ── Step 3 — per person. ─────────────────────────────────────────────────
  const plans: PersonPlan[] = []
  // normalized name → memberId (real) | sentinel (dry-run) for the edge pass.
  const nameToMemberId = new Map<string, string>()
  let passportsCreated = 0
  let passportsEnriched = 0
  let profilesCreated = 0
  let nodesCreated = 0
  let rankAwardsCreated = 0
  let affiliationsCreated = 0
  let membersCreated = 0
  let sortOrder = 0

  for (const p of people) {
    sortOrder++
    const { first, last } = splitName(p.name)
    const avatarUrl = resolveProfileMedia(p.avatarBasename)

    // 1. Passport — dedupe by displayName + accountless.
    const existing = await db.passport.findFirst({
      where: { displayName: p.name, userId: null },
      select: { id: true, avatarUrl: true, bio: true, legalFirstName: true, legalLastName: true },
    })
    let passportId: string | null = null
    let passportAction: Action
    if (existing) {
      passportId = existing.id
      const update: Record<string, unknown> = {}
      if (!existing.avatarUrl && avatarUrl) {
        update.avatarUrl = avatarUrl
      }
      if (!existing.bio && p.bio) {
        update.bio = p.bio
      }
      if (!existing.legalFirstName) {
        update.legalFirstName = first
      }
      if (!existing.legalLastName && last) {
        update.legalLastName = last
      }
      if (Object.keys(update).length > 0) {
        passportAction = "ENRICH"
        passportsEnriched++
        if (!isDryRun) {
          await db.passport.update({ where: { id: passportId }, data: update })
        }
      } else {
        passportAction = "SKIP"
      }
    } else {
      passportAction = "CREATE"
      passportsCreated++
      if (!isDryRun) {
        const row = await db.passport.create({
          data: {
            displayName: p.name,
            legalFirstName: first,
            legalLastName: last,
            bio: p.bio || null,
            avatarUrl,
          },
          select: { id: true },
        })
        passportId = row.id
      }
    }

    // For the rest of the per-person work we need a passportId. In dry-run with
    // a not-yet-existing passport we can't look up satellites, so we record the
    // plan and continue (resolution of "already exists" is simply unknown).
    let rankAwardId: string | null = null
    if (passportId) {
      // 2. DirectoryProfile.
      const existingProfile = await db.directoryProfile.findUnique({
        where: { passportId },
        select: { id: true },
      })
      if (!existingProfile) {
        profilesCreated++
        if (!isDryRun) {
          const slug = await uniqueSlug(
            slugBase(p),
            async s =>
              (await db.directoryProfile.findUnique({
                where: { slug: s },
                select: { id: true },
              })) !== null,
          )
          await db.directoryProfile.create({
            data: { passportId, slug, visibility: "PUBLIC", showRanks: true },
          })
        }
      }

      // 3. LineageNode.
      let node = await db.lineageNode.findFirst({ where: { passportId }, select: { id: true } })
      if (!node) {
        nodesCreated++
        if (!isDryRun) {
          const slug = await uniqueSlug(
            slugBase(p),
            async s =>
              (await db.lineageNode.findUnique({ where: { slug: s }, select: { id: true } })) !==
              null,
          )
          node = await db.lineageNode.create({
            data: {
              passportId,
              slug,
              bio: p.bio || null,
              visibility: "PUBLIC",
              isVerified: true,
              verificationStatus: "VERIFIED",
            },
            select: { id: true },
          })
        }
      }

      // 4. RankAward — if rankShort resolves to a BJJ Rank row.
      if (p.rankShort && rankResolved.get(p.rankShort)) {
        const rankId = await resolveRankId(p.rankShort)
        if (rankId) {
          const existingAward = await db.rankAward.findFirst({
            where: { passportId, rankId },
            select: { id: true },
          })
          if (existingAward) {
            rankAwardId = existingAward.id
          } else {
            rankAwardsCreated++
            if (!isDryRun) {
              const created = await db.rankAward.create({
                data: {
                  passportId,
                  rankId,
                  source: "STATED",
                  verificationStatus: "IMPORTED",
                  notes: RANKAWARD_IMPORT_NOTE,
                },
                select: { id: true },
              })
              rankAwardId = created.id
            }
          }
        }
      }

      // 5. Affiliation — if school resolves (normalized match, D-027).
      const affMatch = matchSchoolForPerson(p.school)
      if (affMatch) {
        const organizationId = affMatch.orgId
        // D-026: count an affiliation as "would create" ONLY when it doesn't already
        // exist (so a post-run dry-run reports 0, proving idempotency). The real-run
        // path is the same guard — it just also writes. A "(new)" org sentinel only
        // occurs in dry-run and implies no pre-existing affiliation.
        if (organizationId === "(new)") {
          affiliationsCreated++
        } else {
          const existingAff = await db.affiliation.findFirst({
            where: { passportId, organizationId },
            select: { id: true },
          })
          if (!existingAff) {
            affiliationsCreated++
            if (!isDryRun) {
              await db.affiliation.create({
                data: {
                  passportId,
                  organizationId,
                  role: "TRAINS_AT",
                  isCurrent: true,
                  schoolName: affMatch.name,
                },
              })
            }
          }
        }
      }

      // 6. LineageTreeMember — with rankAwardId.
      if (treeId && node) {
        const existingMember = await db.lineageTreeMember.findUnique({
          where: { treeId_nodeId: { treeId, nodeId: node.id } },
          select: { id: true },
        })
        if (existingMember) {
          nameToMemberId.set(normName(p.name), existingMember.id)
        } else {
          membersCreated++
          if (!isDryRun) {
            const member = await db.lineageTreeMember.create({
              data: {
                treeId,
                nodeId: node.id,
                isClaimable: true,
                visualSortOrder: sortOrder,
                rankAwardId,
              },
              select: { id: true },
            })
            nameToMemberId.set(normName(p.name), member.id)
          } else {
            nameToMemberId.set(normName(p.name), "(new)")
          }
        }
      } else if (isDryRun) {
        // Tree doesn't exist yet in dry-run; member would be created.
        membersCreated++
        nameToMemberId.set(normName(p.name), "(new)")
      }
    } else {
      // Dry-run, brand-new passport: satellites + member would all be created.
      profilesCreated++
      nodesCreated++
      if (p.rankShort && rankResolved.get(p.rankShort)) {
        rankAwardsCreated++
      }
      if (matchSchoolForPerson(p.school)) {
        affiliationsCreated++
      }
      membersCreated++
      nameToMemberId.set(normName(p.name), "(new)")
    }

    // Plan row.
    const planSchoolTokens = (p.school || "")
      .split("|")
      .map(s => s.trim())
      .filter(Boolean)
    const planMatch = matchSchoolForPerson(p.school)
    plans.push({
      name: p.name,
      passportAction,
      passportId,
      rankShort: p.rankShort,
      rankResolved: p.rankShort ? !!rankResolved.get(p.rankShort) : false,
      school: planSchoolTokens[0] ?? null,
      schoolResolved: planMatch !== null,
      parentName: p.lineageParent,
      parentResolved: false, // filled in the edge pass below
    })

    // Warn only when a *real* (non-numeric) school token failed to resolve — a
    // stray Pods post-id like "231" is intentionally ignored, not a miss (D-027).
    const realTokens = planSchoolTokens.filter(t => !/^\d+$/.test(t))
    if (realTokens.length > 0 && !planMatch) {
      warnings.push(`Unresolved school "${p.school}" for ${p.name} — no normalized org match`)
    }
  }

  // ── Step 4 — edges (2nd pass): set primaryVisualParentMemberId. ──────────
  let edgesSet = 0
  for (const plan of plans) {
    if (!plan.parentName) {
      continue
    }
    const selfKey = normName(plan.name)
    const parentKey = normName(plan.parentName)
    const parentMemberId = nameToMemberId.get(parentKey)
    if (!parentMemberId || parentKey === selfKey) {
      if (!parentMemberId) {
        warnings.push(
          `Unresolved lineageParent "${plan.parentName}" for ${plan.name} — no matching person`,
        )
      }
      continue
    }
    plan.parentResolved = true
    edgesSet++
    if (!isDryRun) {
      const childMemberId = nameToMemberId.get(selfKey)
      if (childMemberId && childMemberId !== "(new)" && parentMemberId !== "(new)") {
        await db.lineageTreeMember.update({
          where: { id: childMemberId },
          data: { primaryVisualParentMemberId: parentMemberId },
        })
      }
    }
  }

  // ── Report. ──────────────────────────────────────────────────────────────
  console.log("── Per-person plan ──────────────────────────────────────────")
  for (const pl of plans) {
    const rankBit = pl.rankShort ? `${pl.rankShort}${pl.rankResolved ? "✓" : "✗"}` : "—"
    const schoolBit = pl.school ? (pl.schoolResolved ? "school✓" : "school✗") : "school—"
    const parentBit = pl.parentName
      ? `parent=${pl.parentName}${pl.parentResolved ? "✓" : "✗"}`
      : "parent=root"
    console.log(
      `   ${pl.passportAction.padEnd(6)} ${pl.name.padEnd(30)} rank=${rankBit.padEnd(6)} ${schoolBit.padEnd(8)} ${parentBit}`,
    )
  }

  console.log("\n── Summary ──────────────────────────────────────────────────")
  console.log(`   People processed:        ${plans.length}`)
  console.log(
    `   LineageTree:             ${treeAction === "CREATE" ? (isDryRun ? "would create" : "created") : "exists"} ("${treeSlug}")`,
  )
  console.log(
    `   Organizations:           ${orgsCreated} ${isDryRun ? "would create" : "created"}, ${orgsExisting} existing`,
  )
  console.log(
    `   Passports:               ${passportsCreated} ${isDryRun ? "would create" : "created"}, ${passportsEnriched} ${isDryRun ? "would enrich" : "enriched"}`,
  )
  console.log(
    `   DirectoryProfiles:       ${profilesCreated} ${isDryRun ? "would create" : "created"}`,
  )
  console.log(
    `   LineageNodes:            ${nodesCreated} ${isDryRun ? "would create" : "created"}`,
  )
  console.log(
    `   RankAwards:              ${rankAwardsCreated} ${isDryRun ? "would create" : "created"}`,
  )
  console.log(
    `   Affiliations:            ${affiliationsCreated} ${isDryRun ? "would create" : "created"}`,
  )
  console.log(
    `   LineageTreeMembers:      ${membersCreated} ${isDryRun ? "would create" : "created"}`,
  )
  console.log(
    `   Parent edges resolved:   ${edgesSet} / ${plans.filter(p => p.parentName).length} with a lineageParent`,
  )

  // De-dupe warnings for a clean list.
  const uniqueWarnings = Array.from(new Set(warnings))
  console.log(`\n── Warnings (${uniqueWarnings.length}) ─────────────────────────────────────────`)
  if (uniqueWarnings.length === 0) {
    console.log("   (none)")
  } else {
    for (const w of uniqueWarnings) {
      console.log(`   ⚠ ${w}`)
    }
  }

  console.log(`\n${isDryRun ? "✅ DRY RUN complete — nothing written." : "🎉 Import complete."}\n`)
}

main()
  .catch(e => {
    console.error("❌ Import error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
