---
title: Content Atoms
slug: content-atoms
type: concept
status: active
created: 2026-04-26
updated: 2026-04-26
author: Brian + Copilot (SESSION_0005)
last_agent: Copilot (SESSION_0005)
pairs_with:
  - knowledge/wiki/files/schema-prisma
  - architecture/data-model
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0005
  - knowledge/wiki/content-engine/curriculum-extract-schema
health: 7
needs_fix:
  - "Seed data for sample content atoms not yet written"
  - "Admin UI for content atom CRUD not yet built"
  - "API/server actions for content engine not yet wired"
wiring:
  - "apps/web/prisma/schema.prisma — ContentAtom, ContentVariant, ContentTask, ContentPublication models"
  - "apps/web/prisma/seed.ts — (future) sample content atoms"
tags: [content-engine, content-atom, schema, s1]
---

# Content Atoms

## Summary

A Content Atom is the smallest reusable unit of teaching and marketing content. It stores one canonical truth — a technique, a lesson concept, a seminar topic, an interview excerpt — and lets every brand and channel derive formatted outputs from that single source.

## Key Idea

**Store the teaching truth once. Derive everything else.**

One Content Atom can produce a blog post, an Instagram reel caption, a curriculum lesson, a YouTube video script, and a tournament promo — all traced back to the same canonical record. Brand voice changes per variant; core truth doesn't.

## Structure

### ContentAtom (the canonical source)

| Field | Purpose |
| --- | --- |
| `canonicalId` | Stable human-readable ID (e.g., `atom-2026-cross-training-001`) |
| `title` / `slug` | Display name and URL-safe key |
| `status` | Workflow: INBOX → DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED |
| `hook` / `promise` / `proof` / `cta` | Marketing framework fields |
| `teachingTruth` | Core teaching content (markdown) — the canonical lesson |
| `longFormCopy` | Full article/lesson body |
| `curriculumExtract` | Structured JSON: objective, movements, drills, coaching cues, safety notes |
| `videoExtract` | Structured JSON: teaser line, reel outline, lesson outline, b-roll notes |
| `siteTargets` | Which Brand(s) this atom targets |
| `channelTargets` | Which ContentChannel(s) to distribute to |
| `qualityScore` | 0–10 editorial quality rating |
| `discipline` / `style` / `organization` | Optional scoping to martial arts context |

### ContentVariant (brand × channel adaptation)

One variant per (atom, brand, channel) tuple. The variant adapts voice, length, CTA, and layout for a specific output — but inherits the canonical truth from the parent atom.

| Field | Purpose |
| --- | --- |
| `brand` | Which brand this variant is for |
| `channel` | BLOG, INSTAGRAM, YOUTUBE_SHORT, CURRICULUM, etc. |
| `status` | DRAFT → READY → PUBLISHED → ARCHIVED |
| `publicTitle` / `publicSlug` | Channel-specific title and URL |
| `renderedCopy` | Channel-formatted output |
| `voiceNotes` | Notes on brand voice adaptation |
| `thumbnailUrl` / `videoUrl` | Media references |

### ContentTask (operational workflow)

Tracks the work needed to move an atom from inbox to published. Each task is typed (WRITING, MEDIA, REVIEW, PUBLISH, QA) and can depend on another task.

### ContentPublication (publication log)

Records what actually went live. One row per published artifact — tracks platform post ID, public URL, publish timestamp, and content checksum for change detection.

## Relationships

```text
ContentAtom (1)
  ├─ ContentVariant (N) — one per brand × channel
  ├─ ContentTask (N) — operational workflow items
  ├─ ContentPublication (N) — published artifact log
  ├─ Discipline? — optional martial arts context
  ├─ Style? — optional substyle context
  ├─ Organization? — optional org context
  └─ User (createdBy)
```

## Content Channels

The `ContentChannel` enum defines where content can be distributed:

| Channel | Notes |
| --- | --- |
| `BLOG` | Long-form article on brand website |
| `INSTAGRAM` | Reel, carousel, or story |
| `FACEBOOK` | Post or share |
| `YOUTUBE_SHORT` | Short-form vertical video |
| `YOUTUBE_LONG` | Full lesson/interview video |
| `REDDIT` | Post in relevant subreddit |
| `TIKTOK` | Short-form vertical video |
| `EMAIL` | Newsletter or drip campaign |
| `CURRICULUM` | Internal curriculum/course content |

## Workflow

```text
INBOX → DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED
                   ↑                      │
                   └── rejection ──────────┘
```

1. **INBOX**: Raw idea captured — technique saw in class, seminar note, interview clip
2. **DRAFT**: Teaching truth written, marketing fields filled
3. **REVIEW**: Ready for editorial/instructor review
4. **APPROVED**: Signed off — variants can be created
5. **PUBLISHED**: At least one variant is live
6. **ARCHIVED**: Retired from active distribution

## Brand Voice Strategy

Each brand consumes the same canonical truth differently:

| Brand | Voice | Emphasis |
| --- | --- | --- |
| `BASELINE_MARTIAL_ARTS` | Fitness + toughness + training motivation | Conditioning, practical application |
| `BBL` | Heritage + instruction + community authority | Lineage, tradition, instructor depth |
| `WEKAF` | Tournament + officials + competitive media | Competition rules, scoring, event coverage |
| `RONIN_DOJO_DESIGN` | System + design + architecture | Technical documentation, design patterns |

## Migration from Obsidian

This architecture replaces the Obsidian Content Engine Pack (`ronin_obsidian_content_engine_pack/`). Key translations:

| Obsidian concept | Prisma model |
| --- | --- |
| Content Atom Template | `ContentAtom` |
| Distribution Variant Template | `ContentVariant` |
| Publication Runbook Template | `ContentTask` (type: PUBLISH) |
| `wp_ronin_content_publications` | `ContentPublication` |
| `wp_ronin_content_tasks` | `ContentTask` |
| Pods `content_atoms` | `ContentAtom` (direct Prisma, no Pods) |
| WP REST `/wp-json/ronin/v1/` | Next.js server actions |
| React Query hooks | Server components + server actions |

## Sources

- `ronin_obsidian_content_engine_pack/98_Admin/Ronin Shared Content Architecture.md` — original ChatGPT architecture
- `ronin_obsidian_content_engine_pack/12_Content_Engine/Content Atom Template.md` — original template
- `ronin_obsidian_content_engine_pack/99_Code/JETTY React + API Examples.md` — original React patterns

## Open Questions

- [ ] Should `curriculumExtract` and `videoExtract` be structured JSON or separate related models? (2026-04-26)
- [ ] Do we need a Campaign model to group atoms for launches/seminars? (2026-04-26)
- [ ] Should content atoms support MDX rendering via content-collections, or stay DB-only? (2026-04-26)
