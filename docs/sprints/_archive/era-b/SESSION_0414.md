---
title: "SESSION 0414 — BBL single-brand pivot: in-place prune + demo-blocking prod fixes"
slug: session-0414
type: session--implement
status: closed
created: 2026-06-19
updated: 2026-06-19
last_agent: claude-session-0414
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0413.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0414 — D12 BBL extraction: Petey-plan the subtractive fork (operator-driven)

## Date

2026-06-19

## Operator

Brian + claude-session-0414

## Goal

Open the **D12 BBL extraction** program — but operator-driven, not on autopilot. The operator's
standing directive this session: *"nothing is canonical anymore; I want things to happen the way I
want them as I say them."* So the docs/ADRs (including D12) are reference, not orders. This session's
concrete goal: **Petey-plan the extraction** — grill the un-pinned mechanics into a roadmap (new repo
name/remote, FK-safe prune clusters + order, migration sequence, fresh Neon/Vercel/CI, how the held
teaser patch carries in, where/when to commit the recovered reconciler) — **before** any structural
move. No repo created and no code touched until the operator says go.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0413.md` (now closed this bow-in). It pivoted mid-flight
  from "merge the multi-brand launch fleet" to ratifying **SOT-ADR D12** (BBL → own single-brand repo).
- Carryover: #118 (BBL landing engine) merged + the dark cinematic teaser kept; D12 + amendment
  ratified; reconciler rescued to `apps/web/scripts/reconcile-pods.mjs` (untracked). The 0413 merge
  plan is dropped. This session begins the extraction by **planning it**, operator-led.

### Branch and worktree

- Branch: `main` (local == origin/main at bow-in)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: one untracked file — `apps/web/scripts/reconcile-pods.mjs` (rescued reconciler).
- Current HEAD at bow-in: `1bf5cf57`

### Drift logged

- Carry-forward from 0413: D-024/D-025 (bun deploy / R2 case-sensitive keys), D-029 (register tree
  slug `bbl-lineage`) — all relevant to the new repo's migration + deploy setup.

## Petey plan

### Goal

Produce an operator-ratified extraction roadmap (and execute only the steps the operator green-lights
this session). Filled during the grill.

### Open decisions (to grill)

- **New repo:** name, remote (new GitHub repo under which org?), local path (`~/dev/<name>`).
- **Fork mechanic:** clone vs `git init` + import; do we keep `ronin-dojo-app` history or start fresh?
- **Prune order:** the FK-safe cluster sequence for ~122 → ~62 models (which clusters first).
- **Migration sequence:** WP (`local.sql`) → monorepo curriculum → Pods exports; what lands first.
- **Reconciler:** rebuild against `local.sql` now (D12 "first data task") vs commit the CSV version as-is.
- **Infra:** fresh Neon project, new Vercel project, CI shape — set up now or after the fork compiles.
- **This session's actual scope:** how far to go today (plan only? plan + stand up empty repo? + reconciler?).

### Risks

- Filled at plan-lock.

### Scope guard

- No new repo, no clone, no code, no infra until the operator explicitly says go.
- FS-0024 git guard before any mutating git; operate from `/Users/brianscott/dev/ronin-dojo-app`.
- `ronin-dojo-app` stays frozen as reference/parts-donor — do not start ripping BBL out of it.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0414_TASK_01 | complete | Bow-in: closed SESSION_0413, opened 0414, captured "operator drives / nothing canonical" to memory. |
| SESSION_0414_TASK_02 | superseded | Petey-plan grill superseded by the live-driven pivot (operator chose in-place prune over the planned separate fork). |
| SESSION_0414_TASK_03 | complete | Reconciled local D12 commit with origin's 7 cloud-merged PRs (rebase, 0411 number-clash) → pushed coherent main. |
| SESSION_0414_TASK_04 | complete | **Directory empty-for-BBL bug fixed + deployed**: roster is placeholder Passports linked by LineageTree, not Membership → added the lineage-tree OR path (`profile-where.ts` + `queries.ts`). |
| SESSION_0414_TASK_05 | complete | **Full-landing 500 fixed**: `next.config` had no images allowlist → added R2 `remotePatterns`. |
| SESSION_0414_TASK_06 | complete | Pulled the real prod roster (91 Passports) into local DB `ronindojo_prodsnap` (pg_dump/restore from prod Neon). |
| SESSION_0414_TASK_07 | complete | Built throwaway BBL fork clone (`~/dev/black-belt-legacy`) — then superseded by the in-place-prune decision. |
| SESSION_0414_TASK_08 | complete | **Premium directory cards** + belt-color chips (`Rank.colorHex`) + gi-default fallback + `object-cover`. Deployed. |
| SESSION_0414_TASK_09 | complete | **Cinematic explorer width fixed**: `min-width:auto` flex blowout → `min-w-0` + full-bleed `col-span-3`; focal tree now fits + scrolls. Deployed. |
| SESSION_0414_TASK_10 | complete | Authored `docs/prune-roadmap.md` (3 cloud prune prompts + ordering) + handoff epic for the TechniqueGraph + Curriculum port. |

## What landed

The session **pivoted twice** and ended as the most productive BBL day in months.

- **Reconciled main** — local D12 docs commit vs origin's 7 cloud-merged PRs (#110–#117); rebased,
  resolved the `SESSION_0411` number-clash, pushed a coherent `main`.
- **Two demo-blocking prod bugs fixed + deployed to `blackbeltlegacy.com`:**
  - Directory was **empty for BBL** + every member detail **404'd** — root cause: the BBL roster is
    **90/91 placeholder Passports** (no `User`) linked to the brand by **LineageTree membership**, not
    `Membership`. Added the `lineageNode.treeMembers.tree.brand` OR-path to both directory queries.
  - Full BBL landing **500'd** behind the preview gate — `next.config.ts` had **no `images` config**,
    so `next/image` rejected the R2 member photos. Added R2 `remotePatterns`.
- **Pulled the real prod roster into local dev** — `pg_dump` prod Neon → local DB `ronindojo_prodsnap`
  (91 Passports, 79 DirectoryProfiles); `.env` `DATABASE_URL` repointed at it.
- **🔱 DIRECTION PIVOT — in-place prune over separate fork:** the directory bug being the *5th* brand-
  coupling headache crystallized it — **prune the original repo in place to BBL-only** (it already
  deploys to `blackbeltlegacy.com` → zero cutover; other brands don't matter → D12's "harness
  un-deletable in place" obstacle is gone). A throwaway fork clone (`~/dev/black-belt-legacy`) was made
  then deprecated. See [[in-place-prune-supersedes-separate-fork]].
- **Premium directory cards** — fixed name truncation (dedicated `facet-result-card`), large
  `object-cover` avatars, **belt-color rank chips** (`Rank.colorHex`), **gi-default fallback** (no bare
  initials), hover glow.
- **Cinematic explorer width fixed** — focal tree blew past the viewport on node-click (`min-width:auto`
  flex blowout); `min-w-0` + full-bleed `col-span-3` → it fits and scrolls horizontally.
- **Handoff artifacts** — `docs/prune-roadmap.md` (3 cloud prune prompts: brand-resolution→BBL constant
  first, then school/org parity + clients/theming in parallel) and an epic prompt for porting the BJJ
  TechniqueGraph + Curriculum Library from `ronin-dojo-monorepo` (`src/brands/blackbeltlegacy` / tuffbuffs).

## Decisions resolved

- **Operator drives; nothing is canonical** — docs/ADRs are reference, not orders ([[operator-drives-nothing-canonical]]).
- **In-place prune of the original repo**, not a separate-repo fork — supersedes D12's fork framing
  ([[in-place-prune-supersedes-separate-fork]]).
- Rename to `black-belt-legacy` (GitHub repo + local folder) is **approved, deferred** to its own clean
  step (folder rename is disruptive mid-session: FS-0024 guard, CLAUDE.md, `.vercel`, harness cwd).

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0413.md` / `0414.md` | Closed 0413; this ledger. |
| `apps/web/server/web/directory/profile-where.ts` + `queries.ts` | Lineage-tree OR-path so the placeholder-Passport roster surfaces (listing + detail). |
| `apps/web/next.config.ts` | R2 `images.remotePatterns` (un-500 the landing). |
| `apps/web/components/web/directory/facet-result-card.tsx` | New premium card: belt-color chip, gi fallback, full names, hover. |
| `apps/web/lib/directory/facet-result.ts` | Thread `rankColorHex` (from `Rank.colorHex`) through the facet result + mappers. |
| `apps/web/components/common/avatar.tsx` | `object-cover` (un-smush photos). |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | Full-bleed `col-span-3` + `min-w-0` (fix focal explorer width). |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | Comment cleanup (reverted a dead overflow tweak). |
| `docs/prune-roadmap.md` | New — 3 cloud prune prompts + ordering. |
| `apps/web/.env` (gitignored) | `DATABASE_URL` → `ronindojo_prodsnap` (real roster locally). |

## Verification

| Check | Result |
| --- | --- |
| `bun run typecheck` (×3) | 0 errors |
| Prod `blackbeltlegacy.com/directory` (preview cookie) | 79 people, member detail 200 (was empty/404) |
| Prod full landing | 200, photos render (was 500) |
| Local cinematic explorer | page no longer overflows X; focal tree scroller `scrollsX: true`, focus panel visible |
| Directory cards (browser) | belt-color chips (coral=red, black clean), gi fallback, photos round |
| Deploys | 3 prod deploys Ready on `blackbeltlegacy.com` (bun build) |

## Open decisions / blockers

- **Rename** `ronin-dojo-baseline` → `black-belt-legacy` (GitHub + folder) — approved, deferred to a clean step.
- **Broken R2 photo URLs** for a few members (now fall back to gi cleanly) — re-check importer R2 key case (drift D-025).
- Local state: dev servers on :3000 (original) + :3001 (throwaway fork); `.env` points at `ronindojo_prodsnap`; throwaway clone `~/dev/black-belt-legacy` can be deleted.

## Next session

### Goal

Continue the in-place BBL prune. Hand the 3 `docs/prune-roadmap.md` prompts to cloud sessions (run
**brand-resolution → BBL constant** first; then school/org parity + clients/theming in parallel). Do the
**GitHub + folder rename** to `black-belt-legacy` as its own clean step.

### First task

Run prune prompt #2 (collapse `getRequestBrand()` → `Brand.BBL`, strip `proxy.ts` brand harness +
`brand-features` gate) — the foundation the other two build on.

## Review log

Operator-driven session; each fix browser- + curl-verified before deploy; typecheck green ×3. No formal
Giddy/Doug pass (lean close per operator's minimal-docs directive) — the prod deploys are the proof.

## ADR / ubiquitous-language check

- ADR update **deferred**: the in-place-prune pivot supersedes D12's fork framing — worth a `SOT-ADR D13`
  amendment in a daylight session (captured in memory now). No new ubiquitous-language terms.

## Reflections

The whole session is one lesson: **the brand harness was the tax, and single-brand collapse is the
lever.** The directory was empty not because of a hard bug but because identity was brand-scoped through
`Membership` while BBL's roster lives in `LineageTree` — a harness mismatch. Once the operator said "other
brands don't matter," every hard thing (un-deletable harness, separate-repo cutover, brand-scoping bugs)
turned easy. The cinematic-explorer width was the same shape: a `min-width:auto` blowout, one `min-w-0`.

What almost went wrong: I nearly deferred the explorer-width fix to "daylight" — the operator pushed
("fix it now"), and it was a 2-line fix once I measured the actual DOM instead of guessing. Measure the
live DOM before editing layout (the repo's own standing lesson, re-learned).

Operator's words: "should have been one repo, one brand from the start." Agreed — and now it is becoming that.
