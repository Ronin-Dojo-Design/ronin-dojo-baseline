/**
 * seed-bbl-technique-videos.ts
 *
 * Seeds real BBL technique videos (3 operator-supplied YouTube playlists) into the
 * `Technique` + `Media(YOUTUBE)` + `MediaAttachment` model, lighting up the belt facet
 * and the browse-by-category video rails (SESSION_0525 Stream D1/D2).
 *
 * Each video →
 *   - Technique { brand: BBL, name, slug, isPublished, disciplineId: bjj,
 *                 organizationId: black-belt-legacy, beltLevelMinId: <belt Rank> }
 *   - Media     { brand: BBL, type: YOUTUBE, url: watch, thumbnailUrl: img.youtube.com,
 *                 title, isPublic: true, uploadedById: Brian }
 *   - MediaAttachment { techniqueId + passportId (author), purpose: "technique-highlight" }
 *     — ONE polymorphic row so the video shows on BOTH the /techniques rails/facet AND the
 *     author's public-profile technique rail.
 *
 * Belts resolve in the IBJJF (BJJ) rank system. White/Blue authored by Brian (his Passport);
 * Purple authored by Bob Bass (his accountless Passport), curated/uploaded by Brian.
 *
 * IDEMPOTENT — upsert Technique by (brand, organizationId, slug); dedupe Media by watch URL
 * and MediaAttachment by (mediaId, techniqueId). Re-running never duplicates and never
 * clobbers an operator's later name/publish edits (update touches only structural links).
 * The local DB is SHARED with live sessions — this script ONLY inserts; it never resets/migrates.
 *
 *   bun run scripts/seed-bbl-technique-videos.ts [--dry-run]
 */
import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const DRY_RUN = process.argv.includes("--dry-run")
const BRAND = "BBL" as const
const ATTACH_PURPOSE = "technique-highlight"

type VideoSeed = {
  /** YouTube video id. */
  id: string
  title: string
  /** Optional canonical slug override (else derived from the title). */
  slug?: string
  /** Optional technique description (lesson copy / backstory). */
  description?: string
  /** Defaults to true. */
  publish?: boolean
}

type BeltGroup = {
  beltName: "White Belt" | "Blue Belt" | "Purple Belt"
  author: "brian" | "bob"
  /**
   * Freemium preview (SESSION_0525): the first `freeCount` videos in the group (by sortOrder)
   * seed with `isPremium = false` — everyone can watch them; the rest stay premium (locked
   * preview). Operator spec: 3 free per author → White(brian)=3, Purple(bob)=3, Blue=0.
   */
  freeCount?: number
  videos: VideoSeed[]
}

// Neutral placeholder for the one entry whose real YouTube title is not publishable.
const CRUDE_TITLE_VIDEO_ID = "lU1NgHIQSxw"

const GROUPS: BeltGroup[] = [
  {
    beltName: "White Belt",
    author: "brian",
    // 3 free-preview videos (Brian's first 3 by sortOrder); the rest premium.
    freeCount: 3,
    videos: [
      { id: "BHfkD14tm6c", title: "How to Tie Your Belt - Half Method" },
      { id: "lOz81dx31jQ", title: "How to Tie Your Belt - Quarter Method" },
      { id: "TE4Qr3_oJgA", title: "Intro to BJJ - Breakfall" },
      { id: "eUrYQbIa_7A", title: "Intro to BJJ - Windshield Wipers" },
      { id: "vjXg92mzJ0M", title: "Intro to BJJ - Spiderwalk" },
      { id: "4kUBxNHQcdk", title: "Intro to BJJ - Breakfall to Figure Four" },
      { id: "dkxUSi5cgV8", title: "Professor Scott's 8 Clinches" },
      { id: "ZAXsZfqIiUQ", title: "Basic Pummeling" },
      { id: "GTWzex1T97Y", title: "Double Leg Stack - Tips and Safety School" },
      { id: "B0BE7XQKG64", title: "Rear Naked Choke - Safety School" },
    ],
  },
  {
    beltName: "Blue Belt",
    author: "brian",
    // dkxUSi5cgV8 intentionally omitted — it is the White-belt "8 Clinches" duplicate.
    videos: [
      { id: "19LRtJkIkDg", title: "Top Mount - Americana to Arm Bar Drill 2" },
      { id: "GWzJliA-idI", title: "Top Mount Gi Choke Set" },
      {
        id: "1o66EJpcBX4",
        title: "Shoot-Sprawl-Spiderwalk-Rear Quarter - Back Mount - Rear Naked Choke",
      },
      { id: "KUnLhfRlA1Q", title: "Armbar Guard Replace Set - Back Take" },
      { id: "3Sly2eDjuUI", title: "Hula Hoop Attacks from Guard - Two Hands to One Side" },
      { id: "6Pnr7MNPmiI", title: "Top Mount Escape Combo #1 - Bump and Roll to Guard Passes" },
      { id: "rL7F9EDg7xM", title: "Side Mount Submissions 1-5" },
    ],
  },
  {
    beltName: "Purple Belt",
    author: "bob",
    // 3 free-preview videos (Bob's first 3 by sortOrder); the rest premium.
    freeCount: 3,
    videos: [
      { id: "HXCWU1a7Ls0", title: "Back Mount Escape to Double Leg Pin Set" },
      { id: "x4EWOWFNw7w", title: "Side Mount #5 Escape" },
      { id: "AA0rA99asZU", title: "Half Guard - Lock Down Counter to Leg Bar" },
      { id: "XKzRajSPx0k", title: "Arm Bar Counter to the Counter" },
      { id: "6iW7xcnYrJU", title: "North South Choke" },
      // Bob Bass's "A**hole Choke" — semi-censored per operator (SESSION_0525); his real move name.
      {
        id: CRUDE_TITLE_VIDEO_ID,
        title: "A**hole Choke and Failed A**hole Choke",
        slug: "a-hole-choke",
        description:
          "The A**hole Choke is Bob Bass's calling card for the over-eager seminar attendee — the young buck who comes at him full-bore with something to prove. Bob obliges with a grin: \"Ok, a**hole, here ya go!\" The lesson covers the finish and, just as important, the failed version — because knowing why it doesn't lock up is how you make sure it does.",
      },
      {
        id: "U_3491uykqU",
        title: "Finishing the Takedown or Pass with Elbow Trap - Grab the Arm",
      },
      {
        id: "EmQfamaFZ8k",
        title: "Proper Getup to Not Get Caught by Your Underhook and Wizzer Counter",
      },
      { id: "fwlq20h_uA0", title: "Counter to Underhook - Hand Fighting to Chokes and Head Grabs" },
      { id: "8ht5hbw7_JE", title: "Counter to Rolling Calf Slicer - Underhook Bicep" },
      { id: "Ep3k6Fmqudc", title: "Counter to Lockdown - Cross the Feet" },
      { id: "2tKDWewKDq4", title: "Counter to Underhook to Leg Bar" },
      { id: "c5uD63MogTY", title: "Back Mount Make Space Escape Set" },
      { id: "pFugd56qkNQ", title: "Back Mount Wipe Out Escape Set" },
      {
        id: "34VkPHV62o4",
        title: "Standing Foot Locks and Half Guard Foot Locks plus Counter",
      },
      // T3-kzH6x8zU intentionally omitted — no title supplied.
    ],
  },
]

/** URL-safe slug from a title; falls back to the video id when a title slugifies to empty. */
function slugify(title: string, videoId: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || `technique-${videoId.toLowerCase()}`
}

async function main() {
  // --- Resolve fixtures by natural key (fail loudly if any is missing). ---
  const org = await db.organization.findFirst({
    where: { brand: BRAND, slug: "black-belt-legacy" },
    select: { id: true },
  })
  if (!org) throw new Error("BBL organization (slug black-belt-legacy) not found")

  const discipline = await db.discipline.findFirst({
    where: { slug: "bjj" },
    select: { id: true },
  })
  if (!discipline) throw new Error("BJJ discipline (slug bjj) not found")

  const beltRanks = await db.rank.findMany({
    where: {
      rankSystem: { name: "IBJJF Belt System" },
      name: { in: ["White Belt", "Blue Belt", "Purple Belt"] },
    },
    select: { id: true, name: true },
  })
  const beltIdByName = new Map(beltRanks.map(r => [r.name, r.id]))
  for (const name of ["White Belt", "Blue Belt", "Purple Belt"]) {
    if (!beltIdByName.has(name)) throw new Error(`IBJJF rank "${name}" not found`)
  }

  const brian = await db.user.findFirst({
    where: { email: "mrbscott@gmail.com" },
    select: { id: true, passport: { select: { id: true } } },
  })
  if (!brian?.passport) throw new Error("Brian's User/Passport (mrbscott@gmail.com) not found")

  const bob = await db.passport.findFirst({
    where: { directoryProfile: { slug: "bob-bass" } },
    select: { id: true },
  })
  if (!bob) throw new Error("Bob Bass Passport (directoryProfile slug bob-bass) not found")

  const authorPassportId = { brian: brian.passport.id, bob: bob.id }

  const counts: Record<
    string,
    { techniques: number; published: number; free: number; attachments: number }
  > = {}

  for (const group of GROUPS) {
    const beltLevelMinId = beltIdByName.get(group.beltName)!
    const passportId = authorPassportId[group.author]
    const freeCount = group.freeCount ?? 0
    const stat = { techniques: 0, published: 0, free: 0, attachments: 0 }

    let sortOrder = 0
    for (const video of group.videos) {
      const publish = video.publish ?? true
      // Freemium (SESSION_0525): the first `freeCount` videos in the group (by sortOrder) are
      // free-preview (`isPremium = false`); the rest stay premium (locked). Set on BOTH the
      // create and update paths so a re-run flips existing rows too.
      const isPremium = sortOrder >= freeCount
      const slug = video.slug ?? slugify(video.title, video.id)
      const watchUrl = `https://www.youtube.com/watch?v=${video.id}`
      const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`

      if (DRY_RUN) {
        console.log(
          `  [dry] ${group.beltName} ${publish ? "" : "(unpublished) "}${isPremium ? "" : "[FREE] "}${slug}  <- ${video.id}`,
        )
        stat.techniques += 1
        if (publish) stat.published += 1
        if (!isPremium) stat.free += 1
        stat.attachments += 1
        sortOrder += 1
        continue
      }

      // 1) Technique — upsert by the (brand, organizationId, slug) composite unique.
      //    Update touches only structural links so an operator's later rename/publish sticks.
      const technique = await db.technique.upsert({
        where: {
          brand_organizationId_slug: { brand: BRAND, organizationId: org.id, slug },
        },
        create: {
          brand: BRAND,
          name: video.title,
          slug,
          description: video.description ?? null,
          isPublished: publish,
          isPremium,
          disciplineId: discipline.id,
          organizationId: org.id,
          beltLevelMinId,
        },
        update: { disciplineId: discipline.id, beltLevelMinId, isPremium },
        select: { id: true },
      })
      stat.techniques += 1
      if (publish) stat.published += 1
      if (!isPremium) stat.free += 1

      // 2) Media (YOUTUBE) — dedupe by watch URL (Media has no natural unique key).
      let media = await db.media.findFirst({
        where: { brand: BRAND, url: watchUrl },
        select: { id: true },
      })
      if (!media) {
        media = await db.media.create({
          data: {
            brand: BRAND,
            type: "YOUTUBE",
            url: watchUrl,
            thumbnailUrl,
            title: video.title,
            isPublic: true,
            uploadedById: brian.id,
          },
          select: { id: true },
        })
      }

      // 3) MediaAttachment — ONE polymorphic row (technique + author passport).
      const existing = await db.mediaAttachment.findFirst({
        where: { mediaId: media.id, techniqueId: technique.id },
        select: { id: true, passportId: true },
      })
      if (!existing) {
        await db.mediaAttachment.create({
          data: {
            mediaId: media.id,
            techniqueId: technique.id,
            passportId,
            purpose: ATTACH_PURPOSE,
            sortOrder,
          },
        })
      } else if (existing.passportId !== passportId) {
        await db.mediaAttachment.update({
          where: { id: existing.id },
          data: { passportId, purpose: ATTACH_PURPOSE },
        })
      }
      stat.attachments += 1
      sortOrder += 1
    }

    counts[group.beltName] = stat
  }

  console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Seed complete:`)
  for (const [belt, stat] of Object.entries(counts)) {
    console.log(
      `  ${belt}: ${stat.techniques} techniques (${stat.published} published, ${stat.free} free), ${stat.attachments} attachments`,
    )
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async err => {
    console.error(err)
    await db.$disconnect()
    process.exit(1)
  })
