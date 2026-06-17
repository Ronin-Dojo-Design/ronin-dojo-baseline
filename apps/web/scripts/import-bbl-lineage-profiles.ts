/**
 * import-bbl-lineage-profiles.ts
 *
 * Imports the Black Belt Legacy "Dirty Dozen" featured black belts from the
 * monorepo BBLApp WordPress profile data
 * (`src/brands/blackbeltlegacy/data/featuredBlackBelts.js`, mirrored by the
 * `bbl_member` Pods CPT) into the Baseline identity spine as **claimable
 * placeholder Passports** (+ DirectoryProfiles + claimable lineage members),
 * tagged as the "Dirty Dozen" cohort via a `LineageVisualGroup`.
 *
 * This is SESSION_0403 TASK_02 and the BBL.com import lane of the gift/comp
 * membership epic.
 *
 * ── What it does (idempotent) ──────────────────────────────────────────────
 * For each featured black belt:
 *   1. Passport — accountless (`userId: null`) ⇒ claimable. Deduped by plain
 *      `displayName` + `userId: null`, the SAME key `seed-baseline-lineage.ts`
 *      uses, so the five people that seed already creates (Bob Bass, Rick
 *      Williams, Renato Magno, David Meyer, Chris Haueter — and John Will) are
 *      reused, never duplicated (BBL-MIGRATE-002). Identity fields are enriched
 *      **non-destructively** (only when the existing value is empty): avatarUrl,
 *      bio, socialLinks, startedTrainingAt, legal name.
 *   2. DirectoryProfile — PUBLIC, slug, parsed location. `seed-baseline-lineage`
 *      does NOT create these, so the import is what makes the cohort directory-
 *      discoverable AND profile-claimable.
 *   3. LineageNode — verified, PUBLIC (reused by passportId if present).
 *   4. LineageTreeMember — claimable, in a dedicated BBL `bbl-dirty-dozen` tree
 *      (kept separate so we never disturb the existing baseline-cloned BBL Rigan
 *      tree/group). A node can be a member of several trees, so this never
 *      removes anyone from another tree.
 *   5. LineageVisualGroup — one "Dirty Dozen" cohort box; every imported member
 *      is pointed at it (`member.visualGroupId`).
 *
 * Comp grants are NOT written here. The Dirty Dozen cohort is intended to
 * receive a **lifetime LINEAGE_ELITE** comp on claim (operator decision,
 * SESSION_0403). Today that comp is applied by the claim reviewer
 * (`server/admin/lineage/claim-review-actions.ts` `input.comp`); this import
 * makes the cohort identifiable so the reviewer (or a future cohort→comp
 * auto-wire) can grant it. See BBL_LINEAGE_IMPORT_SPEC.md.
 *
 * ── Avatars / media ────────────────────────────────────────────────────────
 * The WordPress profile images are synced to `s3://bbl-media/media/bbl/profiles/`.
 * Each export image is matched **by filename** and resolved under that key via
 * the app's media base URL (the same `NEXT_PUBLIC_MEDIA_BASE_URL` that
 * `lib/media.ts` uses), e.g.
 *   /brand/blackbeltlegacy/images/lineage/Old-school-Bob.jpg
 *     → ${NEXT_PUBLIC_MEDIA_BASE_URL}/media/bbl/profiles/Old-school-Bob.jpg
 * Cover images are resolved the same way when present. With no media base set,
 * the relative `/media/bbl/profiles/<file>` key is stored.
 *
 * Usage (from apps/web):
 *   bun run scripts/import-bbl-lineage-profiles.ts --dry-run
 *   NEXT_PUBLIC_MEDIA_BASE_URL=https://bbl-media.s3.amazonaws.com \
 *     bun run scripts/import-bbl-lineage-profiles.ts
 *   bun run scripts/import-bbl-lineage-profiles.ts --tree-slug bbl-dirty-dozen
 *
 * @see docs/sprints/SESSION_0403.md TASK_02
 * @see docs/product/black-belt-legacy/BBL_LINEAGE_IMPORT_SPEC.md
 * @see docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md
 * @see apps/web/prisma/seed-baseline-lineage.ts (placeholder/visual-group pattern)
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const BRAND = "BBL" as const

const args = process.argv.slice(2)
const isDryRun = args.includes("--dry-run")
const orgIdFlag = args.includes("--org-id") ? args[args.indexOf("--org-id") + 1] : null
const treeSlugFlag = args.includes("--tree-slug")
  ? args[args.indexOf("--tree-slug") + 1]
  : "bbl-dirty-dozen"

const TREE_NAME = "Black Belt Legacy — The Dirty Dozen"
const DIRTY_DOZEN_LABEL = "The Dirty Dozen — BJJ's First American Black Belts"
// WordPress profile images are synced to s3://bbl-media/media/bbl/profiles/.
// Resolve each export image (matched by filename) under that key via the app's
// media base URL — the same NEXT_PUBLIC_MEDIA_BASE_URL that lib/media.ts uses.
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "") ?? null
const BBL_PROFILE_MEDIA_PREFIX = "media/bbl/profiles"

interface BlackBeltProfile {
  /** Plain name — the dedupe key (matches seed-baseline-lineage's Passport key). */
  name: string
  /** URL-safe handle, used to derive the node + profile slug. */
  handle: string
  avatar: string
  /** Optional cover/banner image filename; resolved like the avatar when present. */
  cover?: string | null
  bio: string
  location: string
  website: string
  /** "member since" year → startedTrainingAt. */
  memberSince: string
  /** Position in the BJJ Dirty Dozen, if known; drives sort + null = unranked. */
  dirtyDozenRank: number | null
}

// Sourced from monorepo src/brands/blackbeltlegacy/data/featuredBlackBelts.js
// (FEATURED_BLACK_BELTS). Bios are the curated profile.bio one-liners.
const BBL_DIRTY_DOZEN: BlackBeltProfile[] = [
  {
    name: "Bob Bass",
    handle: "bob-bass",
    avatar: "/brand/blackbeltlegacy/images/lineage/Old-school-Bob.jpg",
    bio: "American coral belt and South Bay Jiu-Jitsu founder recognized for his 1995 Pan American win and leadership in preserving BJJ lineage.",
    location: "Los Angeles, CA",
    website: "https://southbayjiujitsu.com",
    memberSince: "1996",
    dirtyDozenRank: 8,
  },
  {
    name: "John Will",
    handle: "john-will",
    avatar: "/brand/blackbeltlegacy/images/members/john-will.jpg",
    bio: "Australian pioneer who helped establish Brazilian jiu-jitsu throughout Australasia while mentoring early MMA champions and editing the Blitz martial arts magazine.",
    location: "Melbourne, Australia",
    website: "https://johnwill.net",
    memberSince: "1997",
    dirtyDozenRank: 12,
  },
  {
    name: "David Meyer",
    handle: "david-meyer",
    avatar: "/brand/blackbeltlegacy/images/members/David-Meyer.jpg",
    bio: "Machado Academy standout who arrived as a Japanese jiu-jitsu black belt, later earning major Masters titles and a 2026 coral belt promotion.",
    location: "Seattle, WA",
    website: "",
    memberSince: "1996",
    dirtyDozenRank: 10,
  },
  {
    name: "Rick Williams",
    handle: "rick-williams",
    avatar: "/brand/blackbeltlegacy/images/lineage/Bob-Bass-Rick-Williams.jpg",
    bio: "Machado Academy wrestler who won the 1996 Pan American title and helped build South Bay Jiu-Jitsu alongside Bob Bass.",
    location: "Los Angeles, CA",
    website: "https://southbayjiujitsu.com",
    memberSince: "1996",
    dirtyDozenRank: 9,
  },
  {
    name: "Chris Haueter",
    handle: "chris-haueter",
    avatar: "/brand/blackbeltlegacy/images/members/chris-haueter.jpg",
    bio: "Dirty Dozen pioneer who trained under Rorion and Rigan Machado, founded Combat Base, and helped define early American BJJ terminology.",
    location: "California",
    website: "https://combatbase.com",
    memberSince: "1996",
    dirtyDozenRank: 11,
  },
  {
    name: "Renato Magno",
    handle: "renato-magno",
    avatar: "/brand/blackbeltlegacy/images/default-black-belt.png",
    bio: "Brazilian black belt promoted alongside the Dirty Dozen ceremony in December 1996; additional biographical details are not publicly verified.",
    location: "Unknown",
    website: "",
    memberSince: "1996",
    dirtyDozenRank: null,
  },
  {
    name: "John Lewis",
    handle: "john-lewis",
    avatar: "/brand/blackbeltlegacy/images/default-black-belt.png",
    bio: "American jiu-jitsu pioneer listed as Dirty Dozen #3, known for founding J-Sect and coaching elite MMA champions.",
    location: "California",
    website: "",
    memberSince: "1995",
    dirtyDozenRank: 3,
  },
]

const US_STATES = new Set([
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
])
const COUNTRY_NAME_TO_ISO2: Record<string, string> = { Australia: "AU", Brazil: "BR", Canada: "CA" }

interface ParsedLocation {
  locationCity?: string
  locationRegion?: string
  locationCountry?: string
}

function parseLocation(loc: string): ParsedLocation {
  if (!loc || loc.toLowerCase() === "unknown") {
    return {}
  }
  const parts = loc
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
  if (parts.length >= 2) {
    const [city, second] = parts
    if (US_STATES.has(second)) {
      return { locationCity: city, locationRegion: second, locationCountry: "US" }
    }
    const iso2 = COUNTRY_NAME_TO_ISO2[second]
    return iso2
      ? { locationCity: city, locationCountry: iso2 }
      : { locationCity: city, locationRegion: second }
  }
  // single token, e.g. "California" — treat as a US region
  return { locationRegion: parts[0], locationCountry: "US" }
}

function basename(path: string): string {
  return path.split("/").pop() ?? path
}

// Map an export image path to its synced media URL, matched by filename.
// Absolute URLs pass through; with no media base set, the relative key is stored.
function resolveProfileMedia(path: string | null | undefined): string | null {
  if (!path) {
    return null
  }
  if (/^https?:\/\//.test(path)) {
    return path
  }
  const key = `${BBL_PROFILE_MEDIA_PREFIX}/${basename(path)}`
  return MEDIA_BASE_URL ? `${MEDIA_BASE_URL}/${key}` : `/${key}`
}

function toSocialLinks(p: BlackBeltProfile): Array<{ platform: string; url: string }> {
  const links: Array<{ platform: string; url: string }> = []
  if (p.website && /^https?:\/\//.test(p.website)) {
    links.push({ platform: "website", url: p.website })
  }
  return links
}

function splitName(name: string): { first: string; last: string | null } {
  const idx = name.indexOf(" ")
  return idx === -1
    ? { first: name, last: null }
    : { first: name.slice(0, idx), last: name.slice(idx + 1) }
}

function startedTrainingAt(year: string): Date | null {
  return /^\d{4}$/.test(year) ? new Date(`${year}-01-01T00:00:00.000Z`) : null
}

/** Find a free globally-unique slug for the given table, appending -2, -3, … */
async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base
  let n = 2
  while (await exists(candidate)) {
    candidate = `${base}-${n++}`
  }
  return candidate
}

async function main() {
  console.log(`\n🥋 BBL Dirty Dozen profile import${isDryRun ? " (DRY RUN)" : ""}\n`)

  if (isDryRun) {
    for (const p of BBL_DIRTY_DOZEN) {
      const loc = parseLocation(p.location)
      console.log(
        `   • ${p.name} (#${p.dirtyDozenRank ?? "—"}) — avatar=${resolveProfileMedia(p.avatar)} ` +
          `loc=${JSON.stringify(loc)} links=${toSocialLinks(p).length}`,
      )
    }
    console.log(
      `\n✅ Dry run — ${BBL_DIRTY_DOZEN.length} profiles previewed; tree="${treeSlugFlag}"; ` +
        `cohort="${DIRTY_DOZEN_LABEL}". Nothing written.\n`,
    )
    return
  }

  // ── Resolve the BBL org (for the tree's organizationId; optional). ──
  let organizationId = orgIdFlag
  if (!organizationId) {
    const org = await db.organization.findFirst({
      where: { brand: BRAND },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    })
    organizationId = org?.id ?? null
  }

  // ── Ensure the dedicated BBL Dirty Dozen tree. ──
  let tree = await db.lineageTree.findUnique({
    where: { brand_slug: { brand: BRAND, slug: treeSlugFlag } },
    select: { id: true },
  })
  if (!tree) {
    tree = await db.lineageTree.create({
      data: {
        brand: BRAND,
        slug: treeSlugFlag,
        name: TREE_NAME,
        description: "The first Americans to earn BJJ black belts — claimable BBL founding cohort.",
        scopeType: "CUSTOM",
        visibility: "PUBLIC",
        isPublished: true,
        isClaimable: true,
        organizationId,
      },
      select: { id: true },
    })
    console.log(`✅ Created tree "${treeSlugFlag}" (${tree.id})`)
  } else {
    console.log(`⏭️  Tree "${treeSlugFlag}" exists (${tree.id})`)
  }

  // ── Ensure the Dirty Dozen visual group (reuse by label if present). ──
  let group = await db.lineageVisualGroup.findFirst({
    where: { treeId: tree.id, label: { contains: "Dirty Dozen", mode: "insensitive" } },
    select: { id: true },
  })
  if (!group) {
    group = await db.lineageVisualGroup.create({
      data: {
        treeId: tree.id,
        label: DIRTY_DOZEN_LABEL,
        groupType: "CUSTOM",
        showPublicLabel: true,
        sortOrder: 0,
      },
      select: { id: true },
    })
    console.log(`✅ Created visual group "${DIRTY_DOZEN_LABEL}" (${group.id})`)
  } else {
    console.log(`⏭️  Visual group exists (${group.id})`)
  }

  let passportsCreated = 0
  let passportsEnriched = 0
  let profilesCreated = 0
  let membersCreated = 0

  for (const p of BBL_DIRTY_DOZEN) {
    // 1. Passport — dedupe by plain displayName + accountless.
    const existing = await db.passport.findFirst({
      where: { displayName: p.name, userId: null },
      select: {
        id: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        bio: true,
        socialLinks: true,
        startedTrainingAt: true,
        legalFirstName: true,
        legalLastName: true,
      },
    })

    const { first, last } = splitName(p.name)
    let passportId: string
    if (!existing) {
      const row = await db.passport.create({
        data: {
          displayName: p.name,
          legalFirstName: first,
          legalLastName: last,
          avatarUrl: resolveProfileMedia(p.avatar),
          coverPhotoUrl: resolveProfileMedia(p.cover),
          bio: p.bio,
          socialLinks: toSocialLinks(p),
          startedTrainingAt: startedTrainingAt(p.memberSince),
        },
        select: { id: true },
      })
      passportId = row.id
      passportsCreated++
      console.log(`   ✅ Passport created: ${p.name}`)
    } else {
      passportId = existing.id
      // Non-destructive enrich: only fill empties.
      const update: Record<string, unknown> = {}
      if (!existing.avatarUrl) {
        update.avatarUrl = resolveProfileMedia(p.avatar)
      }
      if (!existing.coverPhotoUrl && resolveProfileMedia(p.cover)) {
        update.coverPhotoUrl = resolveProfileMedia(p.cover)
      }
      if (!existing.bio) {
        update.bio = p.bio
      }
      const hasSocial = Array.isArray(existing.socialLinks) && existing.socialLinks.length > 0
      if (!hasSocial && toSocialLinks(p).length > 0) {
        update.socialLinks = toSocialLinks(p)
      }
      if (!existing.startedTrainingAt) {
        update.startedTrainingAt = startedTrainingAt(p.memberSince)
      }
      if (!existing.legalFirstName) {
        update.legalFirstName = first
      }
      if (!existing.legalLastName && last) {
        update.legalLastName = last
      }
      if (Object.keys(update).length > 0) {
        await db.passport.update({ where: { id: passportId }, data: update })
        passportsEnriched++
        console.log(`   ✏️  Passport enriched: ${p.name} (${Object.keys(update).join(", ")})`)
      } else {
        console.log(`   ⏭️  Passport unchanged: ${p.name}`)
      }
    }

    // 2. DirectoryProfile — ensure by passportId.
    const existingProfile = await db.directoryProfile.findUnique({
      where: { passportId },
      select: { id: true },
    })
    if (!existingProfile) {
      const slug = await uniqueSlug(
        p.handle,
        async s =>
          (await db.directoryProfile.findUnique({ where: { slug: s }, select: { id: true } })) !==
          null,
      )
      await db.directoryProfile.create({
        data: {
          passportId,
          slug,
          visibility: "PUBLIC",
          showRanks: true,
          coverPhotoUrl: resolveProfileMedia(p.cover),
          ...parseLocation(p.location),
        },
      })
      profilesCreated++
    }

    // 3. LineageNode — reuse by passportId, else create.
    let node = await db.lineageNode.findFirst({ where: { passportId }, select: { id: true } })
    if (!node) {
      const slug = await uniqueSlug(
        p.handle,
        async s =>
          (await db.lineageNode.findUnique({ where: { slug: s }, select: { id: true } })) !== null,
      )
      node = await db.lineageNode.create({
        data: {
          passportId,
          slug,
          bio: p.bio,
          visibility: "PUBLIC",
          isVerified: true,
          verificationStatus: "VERIFIED",
        },
        select: { id: true },
      })
    }

    // 4. LineageTreeMember — claimable, in the dedicated tree, tagged to the group.
    const sortOrder = p.dirtyDozenRank ?? 99
    const existingMember = await db.lineageTreeMember.findUnique({
      where: { treeId_nodeId: { treeId: tree.id, nodeId: node.id } },
      select: { id: true },
    })
    if (!existingMember) {
      await db.lineageTreeMember.create({
        data: {
          treeId: tree.id,
          nodeId: node.id,
          isClaimable: true,
          visualSortOrder: sortOrder,
          visualGroupId: group.id,
        },
      })
      membersCreated++
    } else {
      await db.lineageTreeMember.update({
        where: { id: existingMember.id },
        data: { isClaimable: true, visualSortOrder: sortOrder, visualGroupId: group.id },
      })
    }
  }

  console.log(
    `\n🎉 Done. Passports created: ${passportsCreated}, enriched: ${passportsEnriched}; ` +
      `DirectoryProfiles created: ${profilesCreated}; tree members created: ${membersCreated} ` +
      `(of ${BBL_DIRTY_DOZEN.length}).`,
  )
  console.log(
    `   Cohort "${DIRTY_DOZEN_LABEL}" → intended comp on claim: lifetime LINEAGE_ELITE ` +
      "(reviewer-applied today — see BBL_LINEAGE_IMPORT_SPEC.md).\n",
  )
}

main()
  .catch(e => {
    console.error("❌ Import error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
