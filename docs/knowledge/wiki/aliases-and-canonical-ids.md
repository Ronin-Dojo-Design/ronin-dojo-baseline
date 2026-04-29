---
title: Aliases and Canonical IDs
slug: aliases-and-canonical-ids
type: concept
status: active
created: 2026-04-27
updated: 2026-04-29
author: Brian + ChatGPT
last_agent: codex-session-0025
pairs_with:
  - repo-truth-index
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/program-plan.md
  - docs/knowledge/wiki/baseline-docs-adoption-checklist.md
  - docs/knowledge/how-to-use-these-registries.md
tags:
  - naming
  - migration
  - ids
---

## Summary

Prevent naming drift across legacy monorepo references, new baseline repo names, public brand labels, internal enums, content IDs, session files, and future content-engine objects.

## Status

Active, adopted SESSION_0010.

## Key Idea

Public labels stay human; internal IDs stay boring and stable; enum values stay deliberate. System joins should rely on IDs, not slugs or titles. Reference old names only to explain lineage, not as the active standard.

Practical alias rules:

1. Keep public labels human.
2. Keep internal IDs boring and stable.
3. Keep enum values deliberate.
4. Keep repo/package residue documented so it does not confuse the team.
5. Never rely on memory when a migration label could be ambiguous.

## Structure

### 1. Brand aliases

| Canonical label | Alias / legacy label | Notes |
|---|---|---|
| Baseline Martial Arts | TuffBuffs / Tuff Buffs | legacy functional reference; not the new enum label |
| Black Belt Legacy | BBL | acceptable short internal form |
| WEKAF USA | WEKAF | acceptable short internal form |
| Ronin Dojo Design | Ronin / RDD | admin/studio/umbrella lane |

**Rule:** Public display language may say "Baseline Martial Arts" while legacy comparison docs still reference TuffBuffs as the old stack/source brand.

### 2. Repo/package aliases

| Layer | Current value | Meaning |
|---|---|---|
| root package | `ronin-dojo-app` | monorepo root package name |
| web app package | `dirstarter` | inherited app package name, transitional residue |
| repo name | `ronin-dojo-baseline` | canonical repo label |
| web app folder | `apps/web` | canonical web app location |
| mobile app folder | `apps/mobile` | canonical mobile app location |

**Rule:** Do not confuse `dirstarter` package name with product identity. Treat it as transitional internal residue until intentionally renamed.

### 3. Brand enum aliases

Current enum labels:
- `RONIN_DOJO_DESIGN`
- `BASELINE_MARTIAL_ARTS`
- `BBL`
- `WEKAF`

`TUFFBUFFS` is intentionally not the current enum path in the new repo.

**Rule:** Do not add a new enum label unless migration requires it, brand/state separation requires it, or ADR explicitly approves it.

### 4. Auth / context aliases

| Term | Meaning |
|---|---|
| `brand` | host/domain-derived presentation and default context |
| `activeBrandId` | authenticated user's active app/work context |
| host brand | what domain the user is currently on |
| active app brand | which brand's app data their queries are scoped to |

**Rule:** These are related but not identical. Do not collapse them in docs or code comments.

### 5. Content object ID doctrine

Use stable immutable canonical IDs for content/system objects.

Recommended patterns:
- `atom_{uuid}` = content atom
- `variant_{uuid}` = content variant
- `ctask_{uuid}` = content task
- `pub_{uuid}` = publication record
- `session_{NNNN}` = session file identity
- `mb_{NNN}` = manual boundary registry item

Mutable fields (these may change):
- titles
- public labels
- slugs
- CTA text
- display copy
- campaign labels

**Rule:** System joins should rely on IDs, not slugs or titles.

### 6. Session naming

Use `SESSION_0001.md`, `SESSION_0002.md`, etc.

**Rule:** Session numbering is canonical chronological state. Do not invent parallel "next prompt" IDs if the repo protocol already uses SESSION files as the state artifact.

### 7. Documentation aliases

| Canonical | Alias / predecessor |
|---|---|
| `docs/knowledge/JETTY_3.0.md` | old JETTY 2.x logic |
| `docs/protocols/chat-handoff.md` | old giant handoff packs / dashboard state |
| `docs/rituals/opening.md` | `opening_v4.5` predecessor |
| `docs/rituals/closing.md` | `closing_v4.5` predecessor |

**Rule:** Reference the old names only to explain lineage, not as the active standard.

### 8. Migration status labels

Use these statuses:
- `stable`
- `transitional`
- `legacy-reference`
- `active-migration`
- `deprecated`
- `future-slot`

Suggested status examples:
- `ronin-dojo-baseline` → stable
- `dirstarter` package name → transitional
- `TuffBuffs` public reference in new repo → legacy-reference / active-migration depending context
- old monorepo WP/PODS patterns → legacy-reference

## Relationships

- Pairs with: [Repo Truth Index](repo-truth-index.md)
- Backlinks: [wiki index](index.md), [program-plan](../../architecture/program-plan.md)

## Sources

- Raw import: `docs/_imports/baseline-systems-pack/03_ALIASES_AND_CANONICAL_IDS_BASELINE.md`

## Open Questions

_TBD during next adoption pass_
