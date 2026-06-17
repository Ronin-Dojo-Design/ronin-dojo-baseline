/**
 * enrich-bbl-members-pods.ts
 *
 * Phase 2 of the BBL Pods full-fidelity re-import (docs/product/black-belt-legacy/
 * BBL_PODS_FULL_IMPORT_SPEC.md). SESSION_0408's thin slice landed the roster
 * (name · rank · school · instructor · bio · avatar). This importer ENRICHES that
 * existing roster with the full WordPress/Pods record: profile fields, the per-belt
 * promotion ladder (the lineage-timeline USP — "Promoted by X · date · at Y"), image
 * galleries, and school affiliations.
 *
 * It is the enrich-only sibling of `import-bbl-members-full.ts` and mirrors that
 * file's conventions exactly: string-literal `BRAND = "BBL"` (NEVER value-import the
 * Prisma `Brand` enum — that pulls Prisma into client bundles), the `PrismaPg` adapter
 * defaulting to the local dev DB, `--dry-run`, idempotent dedup, and the per-person loop.
 *
 * ── What it does (idempotent — re-running creates/enriches nothing twice) ───────
 *   0. (--ensure-ranks, ON by default) ensure the BJJ Discipline + IBJJF Belt System
 *      RankSystem + all 31 BJJ Rank rows (prod may be migrate-only/unseeded).
 *   1. ensure an Organization per distinct school (home gym, current/representing
 *      school, and every per-belt promotion school) → name→orgId map.
 *   2. resolve the `bbl-lineage` LineageTree + build a name→passportId roster map
 *      (accountless members) for promoter resolution.
 *   3. per person, MATCHED by displayName within the tree (accountless):
 *        a. enrich Passport profile fields — fill NULLs only (non-destructive):
 *           bio, dob, placeOfBirth, currentResidence, socialLinks (youtube/fb/ig).
 *        b. per ladder entry WITH a date or promoter → upsert a RankAward
 *           (dedup {passportId, rankId} via shortName→Rank): awardedAt (parsed),
 *           awardedByPassportId (in-roster promoter; off-roster → null + notes flag),
 *           organizationId (promotion school), mediaUrls (belt pics), location.
 *        c. galleries → Media + MediaAttachment (purpose "gallery", Passport back-rel).
 *        d. affiliations — home gym (TRAINS_AT) + current/representing school (MEMBER).
 *
 * Mapping notes (Phase 1 gap analysis — prefer mapping over new enum values):
 *   - `current_place_of_residence` → the new `Passport.currentResidence` column.
 *   - per-belt date · promoter · school · pics → existing RankAward fields (no new
 *     columns; awardedAt / awardedByPassportId / organizationId / mediaUrls / location).
 *   - home gym / representing school → existing AffiliationRole (TRAINS_AT / MEMBER);
 *     the promotion school is the RankAward.organizationId, not a separate affiliation.
 *   - galleries → MediaAttachment.passportId (back-relation already wired, SESSION_0289).
 *
 * Safety: this NEVER creates Passports (that is the full importer's job) and only
 * fills NULL profile fields. Real (non-dry-run) writes are gated behind `BBL_COUNTDOWN`
 * (the pre-launch countdown must still be active) — it does NOT flip the countdown,
 * apply migrations, or send claim emails.
 *
 * Usage (from apps/web):
 *   SKIP_ENV_VALIDATION=1 bun run scripts/enrich-bbl-members-pods.ts --dry-run
 *   BBL_COUNTDOWN=1 SKIP_ENV_VALIDATION=1 bun run scripts/enrich-bbl-members-pods.ts \
 *     --uploader-email admin@blackbeltlegacy.com
 *
 * @see apps/web/scripts/import-bbl-members-full.ts (the roster-building sibling)
 * @see apps/web/scripts/import-bbl-wp-media.ts (the avatar/media-upload sibling)
 * @see /tmp/bbl-export/reconciled-full.json (the input — committed by Phase 0)
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
const RANKAWARD_IMPORT_NOTE = "Imported from blackbeltlegacy.com WP Pods export"
const GALLERY_PURPOSE = "gallery"

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function flagValue(name: string, fallback: string | null): string | null {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}
const isDryRun = args.includes("--dry-run")
const inputPath = flagValue("--input", "/tmp/bbl-export/reconciled-full.json")!
const treeSlug = flagValue("--tree-slug", "bbl-lineage")!
const ensureRanks = !args.includes("--no-ensure-ranks")
const importGalleries = !args.includes("--no-galleries")
const uploaderEmail = flagValue("--uploader-email", null)

// ── Countdown gate — real writes only while BBL is still pre-launch ──────────
// Mirrors env.ts: the public site shows the countdown when BBL_COUNTDOWN is "1"/"true".
// We import while behind that countdown (safe — nothing public yet) and never flip it.
const countdownActive =
  process.env.BBL_COUNTDOWN === "1" || process.env.BBL_COUNTDOWN?.toLowerCase() === "true"

// ── Input shape (reconciled-full.json) ──────────────────────────────────────
interface LadderEntry {
  belt: string
  shortName: string // "BL0", "BK1"… → Rank.shortName
  date?: string
  promotedBy?: string
  promotedAt?: string // promotion SCHOOL (→ Organization), not a timestamp
  pictures?: string[]
}
interface ReconciledPerson {
  name: string
  slug: string
  bio?: string
  dob?: string
  placeOfBirth?: string
  residence?: string
  currentRank?: string
  homeGym?: string
  currentSchool?: string
  youtube?: string
  facebook?: string
  instagram?: string
  galleries?: string[]
  ladder: LadderEntry[]
}
interface ReconciledFull {
  people: ReconciledPerson[]
  schools?: string[]
}

// ── Helpers (mirrored from import-bbl-members-full.ts) ──────────────────────
/** Normalize a name for matching (promoter → person, displayName → person). */
function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Normalize a school name for fuzzy matching (D-027): strip punctuation/case,
 *  expand `&`, collapse whitespace — so "South Bay Jiu Jitsu" matches the canonical
 *  "South Bay Jiu-Jitsu" and "The Sanctuary BJJ & Fitness" is stable. */
function normSchool(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Slug base for a school Organization (mirrors the full importer). */
function schoolSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "school"
  )
}

/**
 * Parse a Pods promotion/birth date. Handles ISO ("2009-07-08") and long form
 * ("July 8th, 2009" — ordinal suffixes stripped). Returns a UTC date-only value
 * (stable for `@db.Date` columns); `0000-00-00`, `1970-01-01` placeholders, empty,
 * and unparseable strings all return null.
 */
function parseImportDate(raw: string | null | undefined): Date | null {
  if (!raw) {
    return null
  }
  const s = raw.trim()
  if (!s || /^0{4}-0{2}-0{2}/.test(s) || s.startsWith("1970-01-01")) {
    return null
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (iso) {
    const d = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])))
    return Number.isNaN(d.getTime()) ? null : d
  }
  // Long form: drop ordinal suffixes ("8th" → "8") then let the engine parse.
  const cleaned = s.replace(/(\d+)(st|nd|rd|th)\b/gi, "$1")
  const parsed = new Date(cleaned)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()))
}

/** Pull the present social links into a { platform: url } map (the directory read shape). */
function socialMap(p: ReconciledPerson): Record<string, string> {
  const out: Record<string, string> = {}
  if (p.youtube) {
    out.youtube = p.youtube.trim()
  }
  if (p.facebook) {
    out.facebook = p.facebook.trim()
  }
  if (p.instagram) {
    out.instagram = p.instagram.trim()
  }
  return out
}

// ── BJJ ranks (mirrors import-bbl-members-full.ts) — for --ensure-ranks. ────
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
  // Append after the current max sortOrder (prod may already be populated with its own ordering).
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

/** Resolve the import uploader (Media.uploadedById is a required FK). Priority:
 *  --uploader-email → first admin → first non-placeholder user → null (galleries skipped). */
async function resolveUploaderId(): Promise<{ id: string; label: string } | null> {
  if (uploaderEmail) {
    const u = await db.user.findUnique({
      where: { email: uploaderEmail },
      select: { id: true, email: true },
    })
    if (u) {
      return { id: u.id, label: u.email }
    }
  }
  const admin = await db.user.findFirst({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  })
  if (admin) {
    return { id: admin.id, label: `admin:${admin.email}` }
  }
  const any = await db.user.findFirst({
    where: { isPlaceholder: false },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  })
  return any ? { id: any.id, label: any.email } : null
}

// ── Per-person plan (for the dry-run report). ──────────────────────────────
interface PersonPlan {
  name: string
  matched: boolean
  profileFieldsFilled: string[]
  rankAwardsCreated: number
  rankAwardsEnriched: number
  galleriesAttached: number
  affiliationsCreated: number
  offRosterPromoters: string[]
}

async function main() {
  console.log(
    `\n🥋 BBL Pods full-fidelity enrichment${isDryRun ? " (DRY RUN — writes NOTHING)" : ""}`,
  )
  console.log(
    `   input=${inputPath} tree=${treeSlug} ensure-ranks=${ensureRanks} galleries=${importGalleries}\n`,
  )

  if (!isDryRun && !countdownActive) {
    console.error(
      "❌ Refusing a REAL import: BBL_COUNTDOWN is not active (the public site has launched).\n" +
        "   Run with --dry-run, or only while the site is still behind the countdown.",
    )
    process.exit(1)
  }

  const raw = JSON.parse(readFileSync(inputPath, "utf8")) as ReconciledFull | ReconciledPerson[]
  const people: ReconciledPerson[] = Array.isArray(raw) ? raw : (raw.people ?? [])
  console.log(`   Loaded ${people.length} people.\n`)

  const warnings: string[] = []

  // ── Step 0 — ranks. ───────────────────────────────────────────────────────
  if (ensureRanks && !isDryRun) {
    const { created, existing } = await ensureBjjRanks()
    console.log(`   Ranks: ${created} created, ${existing} already present.\n`)
  }
  // shortName → rankId (null = unresolved). Covers every ladder belt + currentRank.
  const allShorts = new Set<string>()
  for (const p of people) {
    for (const entry of p.ladder ?? []) {
      if (entry.shortName) {
        allShorts.add(entry.shortName)
      }
    }
  }
  const rankIdByShort = new Map<string, string | null>()
  for (const shortName of allShorts) {
    const id = await resolveRankId(shortName)
    rankIdByShort.set(shortName, id)
    if (id === null) {
      warnings.push(
        `Unresolved rank shortName "${shortName}" — no BJJ Rank row` +
          (ensureRanks ? " (would be created by --ensure-ranks in a real run)" : ""),
      )
    }
  }

  // ── Step 1 — Organizations (schools → name→id map). ──────────────────────
  // Collect every distinct school the dataset references: home gym, current school,
  // and every per-belt promotion school.
  const schoolNames = new Set<string>()
  function addSchool(name: string | null | undefined): void {
    const n = (name ?? "").trim()
    if (n && !/^\d+$/.test(n)) {
      schoolNames.add(n)
    }
  }
  for (const p of people) {
    addSchool(p.homeGym)
    addSchool(p.currentSchool)
    for (const entry of p.ladder ?? []) {
      addSchool(entry.promotedAt)
    }
  }

  const schoolToOrgId = new Map<string, string>()
  let orgsCreated = 0
  let orgsExisting = 0
  for (const name of schoolNames) {
    const slug = schoolSlug(name)
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
  // Normalized lookup (D-027) so free-text school strings resolve despite punctuation.
  const schoolNorm = new Map<string, { name: string; orgId: string }>()
  for (const [name, orgId] of schoolToOrgId) {
    schoolNorm.set(normSchool(name), { name, orgId })
  }
  function matchSchool(name: string | null | undefined): { name: string; orgId: string } | null {
    const n = (name ?? "").trim()
    if (!n || /^\d+$/.test(n)) {
      return null
    }
    return schoolNorm.get(normSchool(n)) ?? null
  }

  // ── Step 2 — tree + roster name→passportId map (for promoter resolution). ─
  const tree = await db.lineageTree.findUnique({
    where: { brand_slug: { brand: BRAND, slug: treeSlug } },
    select: { id: true },
  })
  if (!tree) {
    console.error(
      `❌ LineageTree "${treeSlug}" (brand ${BRAND}) not found — run import-bbl-members-full.ts ` +
        "first to build the roster. Nothing to enrich.",
    )
    process.exit(1)
  }
  const treeId = tree.id

  // All accountless passports that are members of the tree → normName → passportId.
  const rosterMembers = await db.passport.findMany({
    where: { userId: null, lineageNode: { treeMembers: { some: { treeId } } } },
    select: { id: true, displayName: true },
  })
  const rosterByName = new Map<string, string>()
  for (const m of rosterMembers) {
    if (m.displayName) {
      rosterByName.set(normName(m.displayName), m.id)
    }
  }
  console.log(`   Roster in tree: ${rosterMembers.length} accountless passports.\n`)

  // Resolve the gallery uploader once.
  const uploader = importGalleries ? await resolveUploaderId() : null
  if (importGalleries && !uploader) {
    warnings.push(
      "Galleries skipped — no uploader User found (Media.uploadedById is required). " +
        "Pass --uploader-email <email> or seed an admin user.",
    )
  }

  // ── Step 3 — per person (MATCHED only; never creates Passports). ──────────
  const plans: PersonPlan[] = []
  let totalRankCreated = 0
  let totalRankEnriched = 0
  let totalGalleries = 0
  let totalAffiliations = 0
  let totalProfileFills = 0
  let matchedCount = 0

  for (const p of people) {
    const plan: PersonPlan = {
      name: p.name,
      matched: false,
      profileFieldsFilled: [],
      rankAwardsCreated: 0,
      rankAwardsEnriched: 0,
      galleriesAttached: 0,
      affiliationsCreated: 0,
      offRosterPromoters: [],
    }

    // Match by displayName within the tree (accountless).
    const passport = await db.passport.findFirst({
      where: {
        displayName: p.name,
        userId: null,
        lineageNode: { treeMembers: { some: { treeId } } },
      },
      select: {
        id: true,
        bio: true,
        dob: true,
        placeOfBirth: true,
        currentResidence: true,
        socialLinks: true,
      },
    })
    if (!passport) {
      warnings.push(`Unmatched person "${p.name}" — no accountless Passport in tree "${treeSlug}"`)
      plans.push(plan)
      continue
    }
    plan.matched = true
    matchedCount++
    const passportId = passport.id

    // 3a. Profile enrich — fill NULLs only (non-destructive).
    const update: Record<string, unknown> = {}
    if (!passport.bio && p.bio?.trim()) {
      update.bio = p.bio.trim()
      plan.profileFieldsFilled.push("bio")
    }
    if (!passport.dob) {
      const dob = parseImportDate(p.dob)
      if (dob) {
        update.dob = dob
        plan.profileFieldsFilled.push("dob")
      }
    }
    if (!passport.placeOfBirth && p.placeOfBirth?.trim()) {
      update.placeOfBirth = p.placeOfBirth.trim()
      plan.profileFieldsFilled.push("placeOfBirth")
    }
    if (!passport.currentResidence && p.residence?.trim()) {
      update.currentResidence = p.residence.trim()
      plan.profileFieldsFilled.push("currentResidence")
    }
    // socialLinks merge — only add platform keys that aren't already present.
    const incomingSocials = socialMap(p)
    if (Object.keys(incomingSocials).length > 0) {
      const existingSocials =
        passport.socialLinks && typeof passport.socialLinks === "object"
          ? (passport.socialLinks as Record<string, string>)
          : {}
      const merged = { ...existingSocials }
      let added = false
      for (const [platform, url] of Object.entries(incomingSocials)) {
        if (!merged[platform]) {
          merged[platform] = url
          added = true
        }
      }
      if (added) {
        update.socialLinks = merged
        plan.profileFieldsFilled.push("socialLinks")
      }
    }
    if (plan.profileFieldsFilled.length > 0) {
      totalProfileFills += plan.profileFieldsFilled.length
      if (!isDryRun) {
        await db.passport.update({ where: { id: passportId }, data: update })
      }
    }

    // 3b. Ladder → RankAwards (entries with a date OR a promoter).
    const seenRankIds = new Set<string>()
    for (const entry of p.ladder ?? []) {
      if (!entry.date && !entry.promotedBy) {
        continue
      }
      const rankId = entry.shortName ? rankIdByShort.get(entry.shortName) : null
      if (!rankId) {
        if (entry.shortName) {
          warnings.push(`Skipped ladder entry "${entry.shortName}" for ${p.name} — rank unresolved`)
        }
        continue
      }
      if (seenRankIds.has(rankId)) {
        continue // two ladder rows map to the same Rank; keep the first.
      }
      seenRankIds.add(rankId)

      const awardedAt = parseImportDate(entry.date)
      const school = matchSchool(entry.promotedAt)
      const organizationId = school && school.orgId !== "(new)" ? school.orgId : null
      const pictures = (entry.pictures ?? []).map(u => u.trim()).filter(Boolean)
      // `location` is the free-text promotion place — set it ONLY when the school did not
      // resolve to a linked Organization. Otherwise org.name === location and the rank-history
      // timeline renders the school twice ("date · School · School").
      const location = organizationId ? null : entry.promotedAt?.trim() || null

      // Promoter: in-roster → awardedByPassportId; off-roster → null + flagged in notes.
      let awardedByPassportId: string | null = null
      let notes = RANKAWARD_IMPORT_NOTE
      if (entry.promotedBy?.trim()) {
        const promoter = entry.promotedBy.trim()
        const hit = rosterByName.get(normName(promoter))
        if (hit) {
          awardedByPassportId = hit
        } else {
          plan.offRosterPromoters.push(promoter)
          notes = `${RANKAWARD_IMPORT_NOTE} · promoted by ${promoter} (off-roster — operator to reconcile)`
          warnings.push(
            `Off-roster promoter "${promoter}" for ${p.name} (${entry.shortName}) — kept in notes, awardedByPassportId left null`,
          )
        }
      }

      const existingAward = await db.rankAward.findFirst({
        where: { passportId, rankId },
        select: {
          id: true,
          awardedAt: true,
          awardedByPassportId: true,
          organizationId: true,
          location: true,
          mediaUrls: true,
        },
      })

      if (existingAward) {
        // Enrich the existing award — fill only the provenance fields still missing.
        const awardUpdate: Record<string, unknown> = {}
        if (!existingAward.awardedAt && awardedAt) {
          awardUpdate.awardedAt = awardedAt
        }
        if (!existingAward.awardedByPassportId && awardedByPassportId) {
          awardUpdate.awardedByPassportId = awardedByPassportId
        }
        if (!existingAward.organizationId && organizationId) {
          awardUpdate.organizationId = organizationId
        }
        if (!existingAward.location && location) {
          awardUpdate.location = location
        }
        if (
          (existingAward.mediaUrls === null || existingAward.mediaUrls === undefined) &&
          pictures.length > 0
        ) {
          awardUpdate.mediaUrls = pictures
        }
        if (Object.keys(awardUpdate).length > 0) {
          plan.rankAwardsEnriched++
          totalRankEnriched++
          if (!isDryRun) {
            await db.rankAward.update({ where: { id: existingAward.id }, data: awardUpdate })
          }
        }
      } else {
        plan.rankAwardsCreated++
        totalRankCreated++
        if (!isDryRun) {
          await db.rankAward.create({
            data: {
              passportId,
              rankId,
              awardedAt,
              awardedByPassportId,
              organizationId,
              location,
              mediaUrls: pictures.length > 0 ? pictures : undefined,
              notes,
              source: "STATED",
              verificationStatus: "IMPORTED",
            },
          })
        }
      }
    }

    // 3c. Galleries → Media + MediaAttachment (purpose "gallery").
    if (importGalleries && uploader) {
      const urls = (p.galleries ?? []).map(u => u.trim()).filter(Boolean)
      let sortOrder = 0
      for (const url of urls) {
        sortOrder++
        // Dedup the Media row by {url, brand} so re-runs reuse it.
        let media = await db.media.findFirst({
          where: { url, brand: BRAND },
          select: { id: true },
        })
        if (!media) {
          if (isDryRun) {
            // No Media id yet — but a fresh URL implies no attachment exists either.
            plan.galleriesAttached++
            totalGalleries++
            continue
          }
          media = await db.media.create({
            data: {
              brand: BRAND,
              type: "IMAGE",
              url,
              isPublic: true,
              sortOrder,
              uploadedById: uploader.id,
              title: `${p.name} — gallery ${sortOrder}`,
            },
            select: { id: true },
          })
        }
        const existingAttachment = await db.mediaAttachment.findFirst({
          where: { passportId, mediaId: media.id },
          select: { id: true },
        })
        if (!existingAttachment) {
          plan.galleriesAttached++
          totalGalleries++
          if (!isDryRun) {
            await db.mediaAttachment.create({
              data: { mediaId: media.id, passportId, purpose: GALLERY_PURPOSE, sortOrder },
            })
          }
        }
      }
    }

    // 3d. Affiliations — home gym (TRAINS_AT) + current/representing school (MEMBER).
    const affPlan: Array<{ school: string; role: "TRAINS_AT" | "MEMBER" }> = []
    if (p.homeGym?.trim()) {
      affPlan.push({ school: p.homeGym.trim(), role: "TRAINS_AT" })
    }
    if (p.currentSchool?.trim() && normSchool(p.currentSchool) !== normSchool(p.homeGym ?? "")) {
      affPlan.push({ school: p.currentSchool.trim(), role: "MEMBER" })
    }
    for (const aff of affPlan) {
      const school = matchSchool(aff.school)
      if (!school) {
        warnings.push(`Unresolved affiliation school "${aff.school}" for ${p.name}`)
        continue
      }
      if (school.orgId === "(new)") {
        // Dry-run only: a not-yet-created org implies no pre-existing affiliation.
        plan.affiliationsCreated++
        totalAffiliations++
        continue
      }
      const existingAff = await db.affiliation.findFirst({
        where: { passportId, organizationId: school.orgId, role: aff.role },
        select: { id: true },
      })
      if (!existingAff) {
        plan.affiliationsCreated++
        totalAffiliations++
        if (!isDryRun) {
          await db.affiliation.create({
            data: {
              passportId,
              organizationId: school.orgId,
              role: aff.role,
              isCurrent: true,
              schoolName: school.name,
            },
          })
        }
      }
    }

    plans.push(plan)
  }

  // ── Report. ────────────────────────────────────────────────────────────────
  console.log("── Per-person plan ──────────────────────────────────────────")
  for (const pl of plans) {
    if (!pl.matched) {
      console.log(`   UNMATCHED  ${pl.name}`)
      continue
    }
    const fields = pl.profileFieldsFilled.length > 0 ? pl.profileFieldsFilled.join(",") : "—"
    console.log(
      `   MATCH  ${pl.name.padEnd(30)} fields=${fields.padEnd(40)} ` +
        `awards=+${pl.rankAwardsCreated}/~${pl.rankAwardsEnriched} ` +
        `gallery=+${pl.galleriesAttached} aff=+${pl.affiliationsCreated}`,
    )
  }

  console.log("\n── Summary ──────────────────────────────────────────────────")
  console.log(`   People in input:         ${people.length}`)
  console.log(`   Matched in tree:         ${matchedCount}`)
  console.log(`   Unmatched (skipped):     ${people.length - matchedCount}`)
  console.log(
    `   Organizations:           ${orgsCreated} ${isDryRun ? "would create" : "created"}, ${orgsExisting} existing`,
  )
  console.log(
    `   Profile fields filled:   ${totalProfileFills} ${isDryRun ? "would fill" : "filled"}`,
  )
  console.log(
    `   RankAwards:              ${totalRankCreated} ${isDryRun ? "would create" : "created"}, ${totalRankEnriched} ${isDryRun ? "would enrich" : "enriched"}`,
  )
  console.log(
    `   Gallery attachments:     ${totalGalleries} ${isDryRun ? "would attach" : "attached"}`,
  )
  console.log(
    `   Affiliations:            ${totalAffiliations} ${isDryRun ? "would create" : "created"}`,
  )

  const uniqueWarnings = Array.from(new Set(warnings))
  console.log(`\n── Warnings (${uniqueWarnings.length}) ─────────────────────────────────────────`)
  if (uniqueWarnings.length === 0) {
    console.log("   (none)")
  } else {
    for (const w of uniqueWarnings) {
      console.log(`   ⚠ ${w}`)
    }
  }

  console.log(
    `\n${isDryRun ? "✅ DRY RUN complete — nothing written." : "🎉 Enrichment complete."}\n`,
  )
}

main()
  .catch(e => {
    console.error("❌ Enrichment error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
