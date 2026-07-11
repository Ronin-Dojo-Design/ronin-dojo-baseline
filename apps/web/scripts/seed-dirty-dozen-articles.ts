/**
 * Seed the legacy coral-belt PROMOTION articles as published blog `Post`s (SESSION_0525 E1).
 *
 * Source of truth: the legacy Vite/WP BBLApp at
 *   ronin-dojo-monorepo/src/brands/blackbeltlegacy/data/featuredArticles.js
 * Four articles are seeded here — Bob Bass, John Will, Dave Meyer (each linked from a Dirty
 * Dozen landing card via `bbl-landing-content.ts#dirtyDozen.articleSlug`) plus Renato Magno
 * (STANDALONE — unlinked, framed as its own coral-belt promotion, per open sub-decision O4).
 * The legacy overview article (`dirty-dozen-rigan-machado-legacy`) is intentionally NOT seeded
 * here — the existing overview Post (`seed-dirty-dozen-post.ts`) already covers it.
 *
 * The legacy source stores article bodies as HTML; the current `/blog/[slug]` page renders
 * `post.content` through `react-markdown` (+ remark-gfm, no rehype-raw) and derives the TOC from
 * markdown headings, so the bodies below are the legacy prose converted to markdown verbatim.
 *
 * Uses the same extended Prisma client (PrismaPg adapter + uniqueSlugsExtension) that backs
 * `server/admin/posts/actions.ts#upsertPost` — NOT a raw SQL insert. Idempotent: upserts by slug
 * OR title, and passes `slug` so the uniqueSlugsExtension keeps the canonical slug on update.
 *
 * Run from apps/web:  bun run scripts/seed-dirty-dozen-articles.ts
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, PostStatus, PrismaClient } from "~/.generated/prisma/client"
import { uniqueSlugsExtension } from "~/prisma/extensions/unique-slugs"

const AUTHOR_EMAIL = "tonyhua08@gmail.com" // Tony Hua — BBL admin (public byline; matches seed-dirty-dozen-post)
const PUBLISH_DATE = "2026-01-17" // legacy featuredArticles date

const IMG = "/brand/blackbeltlegacy"

type LegacyArticle = {
  slug: string
  title: string
  description: string
  imageUrl: string | null
  content: string
}

const ARTICLES: LegacyArticle[] = [
  {
    slug: "bob-bass-coral-belt-promotion",
    title: "Bob Bass: Competition Legend Receives 7th Degree Coral Belt",
    description:
      "Bob Bass didn't just learn Brazilian Jiu-Jitsu—he conquered it on the competition mats against the best in the world. His 1995 Pan Am victory remains a landmark in American BJJ history.",
    imageUrl: `${IMG}/bob-and-rigan.jpg`,
    content: `Bob Bass didn't just learn Brazilian Jiu-Jitsu—he conquered it on the competition mats against the best in the world.

At the 1995 Pan American Championship, the first official IBJJF Pan Am tournament, Bass achieved what many thought impossible. As a brown belt, he defeated Márcio Feitosa of Gracie Barra—a prodigy groomed by Carlos Gracie Jr. himself. This wasn't just a victory; it was a statement that American BJJ had arrived.

### The Journey to Coral

Bob Bass received his black belt from Rigan Machado on July 1, 1995. Over the next three decades, he would:

- **1998:** Promoted to 1st Degree Black Belt
- **2001:** Promoted to 2nd Degree Black Belt
- **2004:** Promoted to 3rd Degree Black Belt
- **2007:** Promoted to 4th Degree Black Belt
- **2010:** Promoted to 5th Degree Black Belt

Each degree represented not just time, but contribution. Bob built South Bay Jiu Jitsu into one of the premier academies in Southern California. His students went on to become champions, instructors, and leaders in their own right.

### South Bay Jiu Jitsu Legacy

Walk into South Bay Jiu Jitsu and you feel the history. The walls tell stories of championships won, of students who became masters, of a community built on respect, technique, and the endless pursuit of improvement.

Bob's teaching philosophy mirrors his competition approach: technical precision, relentless pressure, and the understanding that every moment on the mat is an opportunity to learn.

### The Coral Belt

The coral belt (7th degree) represents approximately 31 years at black belt. But for Bob Bass, it represents something more:

- Hundreds of students trained
- Dozens of black belts produced
- Countless competitors mentored
- A legacy that will outlast us all

When Rigan Machado ties the coral belt around Bob's waist, he isn't just honoring a student—he's recognizing a peer, a builder, and a keeper of the flame.`,
  },
  {
    slug: "john-will-coral-belt-australia",
    title: "John Will: Australia's BJJ Pioneer Earns Coral Belt",
    description:
      "When John Will returned to Australia with his black belt from Rigan Machado, he brought an entire art form to a continent that had barely heard of it.",
    imageUrl: `${IMG}/john-will.jpg`,
    content: `When John Will returned to Australia with his black belt from Rigan Machado, he didn't just bring back a rank—he brought an entire art form to a continent that had barely heard of it.

Australia in the mid-1990s was a martial arts landscape dominated by traditional styles. Brazilian Jiu-Jitsu was essentially unknown. John Will changed that, one student at a time, one seminar at a time, one decade at a time.

### Building an Empire Down Under

John's impact on Australian martial arts cannot be overstated. He:

- Opened the first dedicated BJJ academy in Australia
- Trained the first generation of Australian black belts
- Built a network of affiliated schools across the country
- Brought international competitors to Australia to share knowledge
- Authored books and instructional materials that spread the art

Today, Brazilian Jiu-Jitsu is one of the most popular martial arts in Australia, and virtually every lineage traces back to John Will.

### The Philosopher-Fighter

What sets John apart is his intellectual approach to the art. He doesn't just teach techniques—he teaches the *why* behind them. His seminars are legendary for their depth, humor, and practical wisdom.

"BJJ is chess, not checkers," John often says. "Every move creates opportunities and risks. Understanding that is what separates practitioners from players."

### Coral Belt Recognition

John Will's coral belt is recognition of what he's built: not just an academy, but a movement. Australian BJJ owes its existence to his vision and dedication.

When he wears that coral belt, he represents everyone he's ever taught—and everyone they've taught—and everyone they will teach. The lineage continues.`,
  },
  {
    slug: "dave-meyer-coral-belt-south-bay",
    title: "Dave Meyer Earns Coral Belt at Historic South Bay Ceremony",
    description:
      "Dave Meyer, one of the original Dirty Dozen under Rigan Machado, receives his coral belt today in a ceremony that brings together the legends of American BJJ.",
    imageUrl: `${IMG}/david-meyer.jpg`,
    content: `*HAPPENING TODAY — January 17, 2026 at South Bay Jiu Jitsu*

Dave Meyer, one of the original Dirty Dozen under Rigan Machado, is receiving his coral belt today in a ceremony that brings together the legends of American BJJ.

### A Lifetime of Dedication

Dave Meyer's journey in Brazilian Jiu-Jitsu spans over three decades. As one of Rigan Machado's earliest American students, he was there when BJJ was still an underground art known only to a dedicated few.

His path to coral belt includes:

- Training alongside Bob Bass, John Will, and the other Dirty Dozen
- Decades of teaching and developing students
- Maintaining the highest standards of technical excellence
- Contributing to the growth of BJJ across Southern California

### Today's Ceremony

The ceremony at South Bay Jiu Jitsu brings together:

- **Rigan Machado** — Officiating the promotion
- **Bob Bass** — Hosting at his academy
- **The Dirty Dozen** — Brothers reunited on the mat
- **Generations of students** — Witnessing history

This isn't just a promotion—it's a family reunion. The men who built American BJJ, together again, celebrating one of their own.

### What Coral Belt Means

For Dave Meyer, the coral belt represents:

> "It's not about me. It's about everyone who trained with me, everyone I trained, and everyone they'll train. The belt is just a symbol of the lineage continuing."

Today, we celebrate Dave Meyer. Tomorrow, the work continues.`,
  },
  {
    // Standalone (open sub-decision O4): Renato is NOT a Dirty Dozen landing card and is not
    // linked from `dirtyDozen`; this article stands on its own as a coral-belt promotion piece.
    slug: "renato-magno-coral-belt",
    title: "Renato Magno Baptista: Master's Journey to Coral Belt",
    description:
      "Renato Magno Baptista represents a unique bridge in Brazilian Jiu-Jitsu—Brazilian by birth, American by choice, and a master by dedication.",
    imageUrl: null,
    content: `Renato Magno Baptista represents a unique bridge in Brazilian Jiu-Jitsu—Brazilian by birth, American by choice, and a master by dedication.

### The Brazilian-American Bridge

Renato brought the authentic Brazilian experience to his American students. He understood both worlds, and he could translate between them.

His teaching style combines:

- Deep technical knowledge from Brazilian roots
- Understanding of American learning styles
- Cultural appreciation for the art's history
- Modern approaches to competition and training

### Building Champions

Renato's students have achieved at the highest levels:

- Multiple world championship medals
- Pan American titles
- National champions across weight classes

But his impact goes beyond competition. He's produced instructors, academy owners, and leaders who carry his technical DNA forward.

### The Coral Belt Journey

Renato Magno's promotion to coral belt recognizes:

- Decades of teaching excellence
- Technical innovation and preservation
- Community building across multiple academies
- Service to the art and its practitioners

### Legacy

When Renato wears his coral belt, he wears the combined history of Brazilian and American BJJ. He is a living connection between the founders and the future.`,
  },
]

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const db = new PrismaClient({ adapter }).$extends(uniqueSlugsExtension)

  try {
    const author = await db.user.findFirst({
      where: { email: AUTHOR_EMAIL, role: "admin" },
      select: { id: true, name: true },
    })
    if (!author) throw new Error(`No admin user found for ${AUTHOR_EMAIL}`)

    const publishedAt = new Date(`${PUBLISH_DATE}T00:00:00Z`)
    const results: Array<{ action: string; slug: string; url: string }> = []

    for (const article of ARTICLES) {
      const content = article.content.trim()
      // Mirror upsertPost: strip markdown to plain text for search/read-time.
      const plainText = content.replace(/[#*_~`>[\]()!-]/g, "").trim()

      // Match by slug OR title so a re-run is idempotent even if a prior run mutated the slug.
      const existing = await db.post.findFirst({
        where: { OR: [{ slug: article.slug }, { title: article.title }] },
        select: { id: true },
      })

      // `slug` is included so the uniqueSlugsExtension keeps our canonical slug on update.
      const data = {
        title: article.title,
        slug: article.slug,
        description: article.description,
        content,
        plainText,
        imageUrl: article.imageUrl,
        status: PostStatus.Published,
        publishedAt,
        brand: Brand.BBL,
        author: { connect: { id: author.id } },
      }

      const post = existing
        ? await db.post.update({ where: { id: existing.id }, data })
        : await db.post.create({ data })

      results.push({
        action: existing ? "updated" : "created",
        slug: post.slug,
        url: `/blog/${post.slug}`,
      })
    }

    console.log(JSON.stringify({ author: author.name, count: results.length, results }, null, 2))
  } finally {
    await db.$disconnect()
  }
}

main().catch(err => {
  console.error("seed-dirty-dozen-articles failed:", err)
  process.exit(1)
})
