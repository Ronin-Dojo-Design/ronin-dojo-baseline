---
title: "SESSION 0601 — BUILD: apps/rdd scaffold (Slice A) — workspace peer + 3 CI edits (rdd)"
slug: session-0601
type: session--build
status: staged
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0598
sprint: S12
lane: rdd
recipe: new-brand-onboarding
goal_ids: [G-027]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0598.md
  - docs/protocols/recipes/new-brand-onboarding.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0601 — BUILD: apps/rdd scaffold (Slice A)

> **Pre-staged build stub (ADR 0049), planned SESSION_0598 (G-027).** Reservation branch
> `session-0601-rdd-scaffold`. Adopt: FS-0024 guard, FS-0030 id check, ff to main, flip status, run in
> a worktree (`/worktree-setup`). Hydrates from `new-brand-onboarding.md` (Slice A). **Solo** — owns the
> 3 shared CI files, so no CI-touching fan-out sibling.

## Goal

Scaffold `apps/rdd` as a first-party workspace peer off `apps/baseline` (`workspace:*` ui-kit) with a
hello-route, and make **Products-CI pick it up** via the 3 CI edits — local, no cloud, no DB yet.

## First task

Adopt per ADR 0049; read SESSION_0598 grill outcomes + `new-brand-onboarding.md` Slice-A steps + the
`apps/baseline` exemplar (package.json `workspace:*`, `next.config` `transpilePackages` + `turbopack.root`,
tsconfig, postcss). Scaffold `apps/rdd`; add `apps/rdd/**` to `clients-ci.yml` `on.paths` **and** to
`ci.yml` + `playwright.yml` `paths-ignore`; prove Products-CI green + root gates untouched + `next build`.
Leave DB (B1) / auth+State-host (B2) / marketing+portfolio (B3) / cloud (C) to later slices.

## Status

Single source of truth is the frontmatter `status:` field.

## Next session

### Goal

Slice B1 — `rdd_dev` DB (own `schema.prisma` + `prisma.config.ts`) + first migration + **isolation proof**.
