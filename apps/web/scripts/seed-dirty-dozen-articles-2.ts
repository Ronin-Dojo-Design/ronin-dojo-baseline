/**
 * Seed the Rick Williams + Chris Haueter Dirty Dozen articles (SESSION_0525 E1 follow-up) as
 * published blog `Post`s. Unlike `seed-dirty-dozen-articles.ts` (legacy inline bodies), these two
 * were authored this session and live as committed markdown docs under
 * `docs/product/black-belt-legacy/posts/` — the single source of truth. Byline = Brian Scott.
 *
 * Idempotent: upserts by slug (uniqueSlugsExtension keeps the canonical slug on update). The seed's
 * update path DOES refresh title/description/content so editing the .md + re-running propagates.
 *
 * Run from apps/web:  bun --env-file=.env.prod scripts/seed-dirty-dozen-articles-2.ts   (or no env-file for local)
 */
import "dotenv/config"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, PostStatus, PrismaClient } from "~/.generated/prisma/client"
import { uniqueSlugsExtension } from "~/prisma/extensions/unique-slugs"

const AUTHOR_EMAIL = "mrbscott@gmail.com" // Brian Scott — BBL admin (public byline)

const IMG = "/brand/blackbeltlegacy"
const ARTICLES = [
  { slug: "chris-haueter-dirty-dozen", imageUrl: `${IMG}/chris-haueter.jpg` },
  { slug: "rick-williams-dirty-dozen", imageUrl: `${IMG}/rick-williams.jpg` },
]

/** Parse an article doc into { title, description, publishDate, content } (content = verbatim body). */
function parseArticle(slug: string) {
  const path = fileURLToPath(
    new URL(`../../../docs/product/black-belt-legacy/posts/${slug}.md`, import.meta.url),
  )
  const raw = readFileSync(path, "utf8")
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) throw new Error(`${slug}: missing YAML frontmatter`)
  const [, frontmatter, bodyRaw] = fmMatch
  const scalar = (key: string) =>
    frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim()
  // `description:` uses a YAML folded block (`>`) — fold the indented continuation lines into one.
  const descBlock = frontmatter.match(/^description:\s*>\s*\n([\s\S]*?)(?=\n\S|\n?$)/m)?.[1]
  const description = descBlock
    ? descBlock
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .join(" ")
    : (scalar("description") ?? "").replace(/^["']|["']$/g, "")
  const title = (scalar("title") ?? "").replace(/^["']|["']$/g, "")
  const publishDate = scalar("publishDate") ?? "2026-07-11"
  if (!title || !description) throw new Error(`${slug}: frontmatter needs title + description`)
  // Drop a leading duplicate H1 (the body may repeat the title as `# ...`).
  const content = bodyRaw.replace(/^\s*#\s+.+\n+/, "").trim()
  return { title, description, publishDate, content }
}

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  }).$extends(uniqueSlugsExtension)
  try {
    const author = await db.user.findFirst({
      where: { email: AUTHOR_EMAIL, role: "admin" },
      select: { id: true, name: true },
    })
    if (!author) throw new Error(`No admin user found for ${AUTHOR_EMAIL}`)

    const results: Array<{ action: string; slug: string }> = []
    for (const article of ARTICLES) {
      const { title, description, publishDate, content } = parseArticle(article.slug)
      const plainText = content.replace(/[#*_~`>[\]()!-]/g, "").trim()
      const data = {
        title,
        slug: article.slug,
        description,
        content,
        plainText,
        imageUrl: article.imageUrl,
        status: PostStatus.Published,
        publishedAt: new Date(`${publishDate}T00:00:00Z`),
        brand: Brand.BBL,
        author: { connect: { id: author.id } },
      }
      const existing = await db.post.findFirst({
        where: { OR: [{ slug: article.slug }, { title }] },
        select: { id: true },
      })
      const post = existing
        ? await db.post.update({ where: { id: existing.id }, data })
        : await db.post.create({ data })
      results.push({ action: existing ? "updated" : "created", slug: post.slug })
    }
    console.log(JSON.stringify({ author: author.name, results }, null, 2))
  } finally {
    await db.$disconnect()
  }
}

main().catch(error => {
  console.error("seed-dirty-dozen-articles-2 failed:", error)
  process.exit(1)
})
