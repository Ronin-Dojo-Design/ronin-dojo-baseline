/**
 * Seed "The Dirty Dozen" — the FIRST published blog Post for Black Belt Legacy (SESSION_0485, TASK_03).
 *
 * Publishes the operator-supplied article at
 *   docs/product/black-belt-legacy/posts/dirty-dozen-first-post.md
 * onto the canonical public blog surface (`Post` / `/blog`; SESSION_0485 TASK_02 decision) via the
 * real authoring path — the same extended Prisma client (PrismaPg adapter + uniqueSlugsExtension) that
 * backs `server/admin/posts/actions.ts#upsertPost`, NOT a raw SQL insert.
 *
 * The article doc is the single source of truth: this script strips the frontmatter, the duplicate H1
 * (rendered from `Post.title`), and the date line (rendered from `Post.publishedAt`), and preserves the
 * remaining prose verbatim. Idempotent: upserts by slug.
 *
 * Run from apps/web:  bun run scripts/seed-dirty-dozen-post.ts
 */
import "dotenv/config"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, PostStatus, PrismaClient } from "~/.generated/prisma/client"
import { uniqueSlugsExtension } from "~/prisma/extensions/unique-slugs"

const ARTICLE_PATH = fileURLToPath(
  new URL(
    "../../../docs/product/black-belt-legacy/posts/dirty-dozen-first-post.md",
    import.meta.url,
  ),
)
const AUTHOR_EMAIL = "mrbscott@gmail.com" // Brian — BBL admin
const DESCRIPTION =
  "The first twelve non-Brazilians to earn a Brazilian Jiu-Jitsu black belt — and why so many of the Dirty Dozen came through Rigan Machado's lineage."

/** Parse the article doc into { title, slug, publishDate, content } — content is the verbatim prose. */
function parseArticle(raw: string) {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) throw new Error("Article is missing YAML frontmatter")
  const [, frontmatter, bodyRaw] = fmMatch

  const field = (key: string) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))
    return m?.[1]?.trim().replace(/^["']|["']$/g, "")
  }

  const title = field("title")
  const slug = field("slug")
  const publishDate = field("publishDate")
  if (!title || !slug || !publishDate) {
    throw new Error("Article frontmatter must have title, slug, publishDate")
  }

  // Strip the leading H1 (== title) and the italic date line (== publishedAt); preserve the rest verbatim.
  const content = bodyRaw
    .replace(/^#\s+.*$/m, "") // first H1
    .replace(/^\*[^*\n]+\*\s*$/m, "") // first *date* line
    .replace(/^\n+/, "") // leading blank lines
    .trimEnd()

  return { title, slug, publishDate, content }
}

async function main() {
  const raw = readFileSync(ARTICLE_PATH, "utf8")
  const { title, slug, publishDate, content } = parseArticle(raw)

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const db = new PrismaClient({ adapter }).$extends(uniqueSlugsExtension)

  try {
    const author = await db.user.findFirst({
      where: { email: AUTHOR_EMAIL, role: "admin" },
      select: { id: true, name: true },
    })
    if (!author) throw new Error(`No admin user found for ${AUTHOR_EMAIL}`)

    // Mirror upsertPost: strip markdown to plain text for search/read-time.
    const plainText = content.replace(/[#*_~`>[\]()!-]/g, "").trim()
    const publishedAt = new Date(`${publishDate}T00:00:00Z`)

    // Match by slug OR title so a re-run is idempotent even if a prior run mutated the slug.
    const existing = await db.post.findFirst({
      where: { OR: [{ slug }, { title }] },
      select: { id: true },
    })

    // `slug` is included so the uniqueSlugsExtension keeps our canonical slug on update
    // (it derives the slug from `slug || name || title`, so omitting it would re-slug the title).
    const data = {
      title,
      slug,
      description: DESCRIPTION,
      content,
      plainText,
      status: PostStatus.Published,
      publishedAt,
      brand: Brand.BBL,
    }

    const post = existing
      ? await db.post.update({ where: { id: existing.id }, data })
      : await db.post.create({ data: { ...data, author: { connect: { id: author.id } } } })

    console.log(
      JSON.stringify(
        {
          action: existing ? "updated" : "created",
          id: post.id,
          slug: post.slug,
          status: post.status,
          publishedAt: post.publishedAt,
          author: author.name,
          contentChars: content.length,
          url: `/blog/${post.slug}`,
        },
        null,
        2,
      ),
    )
  } finally {
    await db.$disconnect()
  }
}

main().catch(err => {
  console.error("seed-dirty-dozen-post failed:", err)
  process.exit(1)
})
