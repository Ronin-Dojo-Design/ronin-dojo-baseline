/**
 * Seed BBL profile-highlight media (SESSION_0525) — podcasts + featured match videos attached to
 * member Passports, surfaced by the public-profile "Profile Highlights" rails (server/web/directory/
 * profile-media.ts). External YouTube links: `Media{ type: YOUTUBE, url }` + a polymorphic
 * `MediaAttachment{ passportId, purpose }`. Idempotent: Media deduped by url, attachment by
 * (mediaId, passportId). No schema change.
 *
 * Purpose axis (profile-media.ts): "podcast" → Podcast rail (external link-out); "match" → the
 * Featured Matches rail. A single Media can attach to several passports (e.g. a Bob+Dave episode).
 *
 * DRY RUN: bun scripts/seed-bbl-profile-media.ts   (local)
 * PROD:    bun --env-file=.env.prod scripts/seed-bbl-profile-media.ts
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_prodsnap"
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

type MediaSeed = {
  title: string
  youtubeId: string
  purpose: "podcast" | "match"
  /** directoryProfile slugs to attach this media to. */
  slugs: string[]
}

const ITEMS: MediaSeed[] = [
  // Podcasts (external YouTube link-out on the Podcast rail).
  {
    title: "The Ageless Warrior Podcast — Bob Bass & Dave Meyer",
    youtubeId: "kFkqr1r_Py0",
    purpose: "podcast",
    slugs: ["bob-bass", "david-meyer"],
  },
  {
    title: "Combat Base Podcast — Chris Haueter with Dave Meyer",
    youtubeId: "0wUp_xXk_ak",
    purpose: "podcast",
    slugs: ["chris-haueter", "david-meyer"],
  },
  {
    title: "The Rol Podcast — Bob Bass",
    youtubeId: "4wlpxj5s3h0",
    purpose: "podcast",
    slugs: ["bob-bass"],
  },
  {
    title: "The Inferno Podcast — Bob Bass",
    youtubeId: "v_2Bea65pu4",
    purpose: "podcast",
    slugs: ["bob-bass"],
  },
  // Featured matches — Bob Bass's legendary wins over Márcio Feitosa.
  {
    title: "Bob Bass def. Márcio Feitosa — Legendary Win (I)",
    youtubeId: "UauuTMMsJL4",
    purpose: "match",
    slugs: ["bob-bass"],
  },
  {
    title: "Bob Bass def. Márcio Feitosa — Legendary Win (II)",
    youtubeId: "7Kii9qrQ7KE",
    purpose: "match",
    slugs: ["bob-bass"],
  },
]

async function main() {
  const host = connectionString.replace(/^.*@/, "").replace(/\/.*$/, "").split("?")[0]
  console.log(`DB host: ${host}`)

  const brian = await db.user.findFirst({
    where: { email: "mrbscott@gmail.com" },
    select: { id: true },
  })
  if (!brian) throw new Error("Brian's User (mrbscott@gmail.com) not found")

  const slugSet = [...new Set(ITEMS.flatMap(item => item.slugs))]
  const passports = await db.passport.findMany({
    where: { directoryProfile: { slug: { in: slugSet } } },
    select: { id: true, displayName: true, directoryProfile: { select: { slug: true } } },
  })
  const passportBySlug = new Map(passports.map(p => [p.directoryProfile!.slug, p]))
  for (const slug of slugSet) {
    if (!passportBySlug.has(slug))
      throw new Error(`No passport for directoryProfile slug "${slug}"`)
  }

  let createdMedia = 0
  let createdAttachments = 0
  for (const item of ITEMS) {
    const url = `https://www.youtube.com/watch?v=${item.youtubeId}`
    const thumbnailUrl = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`

    let media = await db.media.findFirst({ where: { brand: "BBL", url }, select: { id: true } })
    if (!media) {
      media = await db.media.create({
        data: {
          brand: "BBL",
          type: "YOUTUBE",
          url,
          thumbnailUrl,
          title: item.title,
          isPublic: true,
          uploadedById: brian.id,
        },
        select: { id: true },
      })
      createdMedia += 1
    }

    for (const slug of item.slugs) {
      const passport = passportBySlug.get(slug)!
      const existing = await db.mediaAttachment.findFirst({
        where: { mediaId: media.id, passportId: passport.id, purpose: item.purpose },
        select: { id: true },
      })
      if (!existing) {
        await db.mediaAttachment.create({
          data: { mediaId: media.id, passportId: passport.id, purpose: item.purpose },
        })
        createdAttachments += 1
      }
      console.log(`  ${item.purpose.padEnd(7)} ${passport.displayName} ← ${item.title}`)
    }
  }

  console.log(
    `\nSeed complete: ${createdMedia} Media created, ${createdAttachments} attachments created.`,
  )
}

main()
  .then(() => db.$disconnect())
  .catch(async error => {
    console.error(error)
    await db.$disconnect()
    process.exit(1)
  })
