---
title: "ADR 0018 - ContentAtom owns tags, tools, and media for variant-backed posts"
slug: adr-0018
type: adr
status: accepted
created: 2026-05-22
updated: 2026-05-22
last_agent: codex-session-0351
pairs_with:
  - docs/sprints/SESSION_0224.md
  - docs/knowledge/wiki/content-engine/content-atoms.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0224.md
---

# ADR 0018 - ContentAtom owns tags, tools, and media for variant-backed posts

**Status:** Accepted
**Date:** 2026-05-22

## Context

The Content Engine uses `ContentAtom` as the canonical upstream object and `ContentVariant` as the channel/brand render surface. SESSION_0223 proved `/posts/[slug]` from a published BLOG variant, but the detail page still lacked inherited tags, tools mentioned, and multi-media rendering.

The repo already had Dirstarter blog/tool/sidebar patterns, shared `Tag` and `Tool` models, and `MediaAttachment.contentAtomId` as a scalar without a declared Prisma relation. Adding ContentVariant-specific tag/tool/media relations would duplicate canonical metadata and make each channel variant drift from the atom.

## Decision

Store post metadata and media at the `ContentAtom` level:

- `ContentAtom.tags` ↔ `Tag.contentAtoms`
- `ContentAtom.tools` ↔ `Tool.contentAtoms`
- `ContentAtom.mediaAttachments` ↔ `MediaAttachment.contentAtom`

`ContentVariant` continues to own public title, slug, channel, status, rendered copy, thumbnail/video overrides, and publish timing. Variant detail pages inherit atom tags/tools/media through the atom relation.

## Alternatives considered

### Option A - ContentAtom-owned tags/tools/media (chosen)

- **Pros:** Single canonical source, matches ContentAtom's role, reuses existing Tag/Tool/Media/MediaAttachment models, avoids new override tables, and keeps `/blog` Post flow untouched.
- **Cons:** No per-channel tag/tool/media overrides yet. If a future Instagram or email variant needs materially different metadata, that will require an explicit override model.

### Option B - ContentVariant-owned tags/tools/media

- **Pros:** Each render surface can diverge independently.
- **Cons:** Duplicates canonical content metadata, forces extra seed/admin work, and makes the common `/posts` proof heavier than needed.

### Option C - New ContentVariantMedia join

- **Pros:** Precise variant media ordering and overrides.
- **Cons:** Ignores the existing `MediaAttachment.contentAtomId` field and creates a second attachment system before product evidence needs it.

## Dirstarter docs proof

| Layer | URL | Date checked |
| --- | --- | --- |
| Prisma/database | <https://dirstarter.com/docs/database/prisma> | 2026-05-22 |
| Content | <https://dirstarter.com/docs/content> | 2026-05-22 |
| Blog | <https://dirstarter.com/docs/blog> | 2026-05-22 |
| SEO | <https://dirstarter.com/docs/seo> | 2026-05-22 |
| Media | <https://dirstarter.com/docs/integrations/media> | 2026-05-22 |
| Storage | <https://dirstarter.com/docs/integrations/storage> | 2026-05-22 |

## Consequences

- `/posts/[slug]` can render inherited tags, tools mentioned, and carousel media from the atom without duplicating `/blog`'s Post model.
- Seeded proof data can connect durable Tag/Tool/Media rows once and let variants inherit them.
- Admin editing remains a follow-up: the schema supports it, but SESSION_0224 intentionally shipped only seed/query/render proof.
- If per-channel overrides become necessary, they should be added as an explicit override layer rather than by moving canonical metadata off ContentAtom.

## Cross-references

- [SESSION_0224](../../sprints/SESSION_0224.md)
- [Custom Component Inventory](../../knowledge/wiki/custom-component-inventory.md)
- [Content Atoms](../../knowledge/wiki/content-engine/content-atoms.md)
