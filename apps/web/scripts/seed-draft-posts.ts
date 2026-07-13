/**
 * Seed a couple of DRAFT blog Posts for local dev (SESSION_0533, WL-P2-58).
 *
 * `/app/blog` opens on the Drafts editorial queue (its Drafts-first default). In dev, `prisma/seed.ts`
 * seeds no Posts and the only seeded Post — "The Dirty Dozen" — is Published, so the Drafts queue lands
 * empty. This fixture gives the default view a couple of rows to work with.
 *
 * Data-only: no schema/default change. Idempotent by slug (upsert), authored by the first admin user,
 * routed through the same extended Prisma client (PrismaPg adapter + uniqueSlugsExtension) that backs
 * `server/admin/posts/actions.ts#upsertPost` — NOT a raw SQL insert.
 *
 * Run from apps/web:  bun run scripts/seed-draft-posts.ts
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, PostStatus, PrismaClient } from "~/.generated/prisma/client"
import { uniqueSlugsExtension } from "~/prisma/extensions/unique-slugs"

const DRAFT_POSTS = [
  {
    slug: "draft-notes-on-guard-retention",
    title: "Notes on Guard Retention (Draft)",
    description: "Working notes on frames, hip escapes, and re-guarding under pressure.",
    content:
      "## Guard retention starts before you lose position\n\nThe first frame is a decision, not a reaction. This draft collects the retention concepts we drill on Tuesdays — hip mobility, the inside-position fight, and the difference between recovering guard and re-establishing grips.\n\n_Draft — not yet published._",
  },
  {
    slug: "draft-lineage-spotlight-outline",
    title: "Lineage Spotlight: Outline (Draft)",
    description: "Rough outline for the next lineage-spotlight article.",
    content:
      "## Lineage spotlight — outline\n\nBeats to cover: the instructor's own lineage, the schools they seeded, and a verified promotion or two from the graph. Fill in the interview quotes before publishing.\n\n_Draft — pending review._",
  },
]

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const db = new PrismaClient({ adapter }).$extends(uniqueSlugsExtension)

  try {
    const author = await db.user.findFirst({
      where: { role: "admin" },
      select: { id: true, name: true, email: true },
    })
    if (!author) throw new Error("No admin user found — run the base seed first.")

    const results = []
    for (const fixture of DRAFT_POSTS) {
      // Mirror upsertPost: strip markdown to plain text for search/read-time.
      const plainText = fixture.content.replace(/[#*_~`>[\]()!-]/g, "").trim()

      // `slug` is passed so the uniqueSlugsExtension keeps our canonical slug on update
      // (it derives from `slug || name || title`); publishedAt stays null — these are drafts.
      const data = {
        ...fixture,
        plainText,
        status: PostStatus.Draft,
        publishedAt: null,
        brand: Brand.BBL,
        author: { connect: { id: author.id } },
      }

      const existing = await db.post.findFirst({
        where: { OR: [{ slug: fixture.slug }, { title: fixture.title }] },
        select: { id: true },
      })

      const post = existing
        ? await db.post.update({ where: { id: existing.id }, data })
        : await db.post.create({ data })

      results.push({ action: existing ? "updated" : "created", slug: post.slug, status: post.status })
    }

    console.log(
      JSON.stringify({ author: author.name ?? author.email, drafts: results }, null, 2),
    )
  } finally {
    await db.$disconnect()
  }
}

main().catch(err => {
  console.error("seed-draft-posts failed:", err)
  process.exit(1)
})
