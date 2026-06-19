---
title: "SESSION 0416 — BBL prune-stream consolidation: land 4 streams on a green main"
slug: session-0416
type: session--implement
status: closed
created: 2026-06-19
updated: 2026-06-19
last_agent: claude-session-0416
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0414.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0416 — BBL prune-stream consolidation

## Date

2026-06-19

## Operator

Brian + claude-session-0416

## Goal

Consolidate four parallel BBL-prune streams (PR #120 brand→BBL constant, the
`codex/technique-graph-curriculum` branch, PR #121 schools/orgs parity, PR #119 header/nav parity)
onto a single green `main`, one stream at a time, green before each merge — without losing the
codex work and without regressing the SESSION_0414 directory-roster / premium-cards / explorer-width
fixes. Operator drives the merge order and each go/no-go.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0414.md` (closed) + `docs/prune-roadmap.md` +
  `docs/epics/technique-graph-curriculum-port.md`.
- Carryover: 0414 pivoted to in-place single-brand prune; three cloud PRs (#119/#120/#121) and the
  codex branch were produced from the roadmap prompts. This session lands them.

### Branch and worktree

- Branch: `main` (local == origin/main at bow-in)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean. One IDE-opened file (`apps/web/scripts/reconcile-pods.mjs`, untracked from 0414).
- Current HEAD at bow-in: `4e43dac5`

### Stream state at bow-in

| Stream | What | CI | Merge-base / overlap notes |
| --- | --- | --- | --- |
| PR #120 | brand-resolution → BBL constant (`brand-context`, `proxy.ts`, `brand-features`) | RED: Oxc (unused `BrandFeature` import + format), unit (`robotsDisallowRoutesForBrand` stale), all 3 Playwright. Typecheck/Vercel green. | FOUNDATION. Failures are stale multi-brand assertions, not a real bug. |
| codex branch | BJJ TechniqueGraph + Curriculum port (~20 files, 4.2k LOC, its own SESSION_0415.md) | n/a (branch, not PR) | merge-base `3149204b`; main is exactly 1 docs-commit ahead → trivially rebasable. |
| PR #121 | schools/orgs premium parity + single-brand query collapse | RED: Oxc + unit. Playwright/typecheck/Vercel green. | Touches `server/web/directory/facets.ts` + `search-organizations.ts` — NOT `profile-where.ts`/`queries.ts`, so the 0414 person-roster fix is untouched. |
| PR #119 | header + left-nav + right-drawer parity | ALL GREEN | Overlaps codex on `header.tsx`, `nav/nav-sheet.tsx`, `messages/en/navigation.json`. |

### Collision hotspot

`config/brand-features.ts` (+ `.test.ts`) is touched by #120, #121, AND the codex branch — resolve
once in #120's favor (the collapse), then rebase the others onto it.

## Petey plan

### Goal

Land the four streams on a green `main` in operator-confirmed order, green before each merge.

### Recommended order (default — confirm before executing)

1. **#120** (brand → BBL constant) — foundation; rebase onto main, fix stale lint+test, green, merge.
2. **codex/technique-graph-curriculum** — rebase onto new main; resolve `brand-features.ts`; green; merge. Its SESSION_0415.md lands here.
3. **#121** (schools/orgs) — rebase; resolve `brand-features.ts` + org-facet without regressing the 0414 lineage-tree roster; green; merge.
4. **#119** (header/nav) — rebase; resolve header/footer/nav-sheet vs codex nav edits; green; merge.

### Scope guard

- Don't lose codex work; other brands don't matter; don't regress SESSION_0414 (directory roster,
  premium cards, explorer width); brand colors come from `BrandSettings` (don't blank).
- Show prod-visual via the bob-tony preview cookie before any push. One push at close.
- FS-0024 git guard before mutating git. Operator confirms each merge.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0416_TASK_01 | landed | Bow-in: read SoT set, surveyed all 4 streams (CI + file overlap), authored this ledger + merge plan. |
| SESSION_0416_TASK_02 | landed | #120 cherry-picked (`3c791b48`) + test-alignment (`e0c49d1f`). Diagnosed 39 unit fails = 27 #120-caused + 12 pre-existing 0414 drift; fixed via 2 parallel agents. |
| SESSION_0416_TASK_03 | landed | codex cherry-picked (`0be7eacc`); resolved brand-features.ts (kept collapse, carried `curriculum`) + seo/brand-features tests; SESSION_0415.md landed. |
| SESSION_0416_TASK_04 | landed | #121 cherry-picked (`86de4833`); no conflicts; confirmed it doesn't touch the roster query (profile-where/queries.ts). |
| SESSION_0416_TASK_05 | landed | #119 cherry-picked (`a5d43a9d`); auto-merged clean with codex nav; navigation.json keeps techniques+curriculum. |
| SESSION_0416_TASK_06 | landed | Pre-push: dev server on consolidate (prodsnap roster); all surfaces 200; confirmed countdown gate untouched. ff `main`→consolidate, pushed `a5d43a9d`, closed PRs #119/#120/#121. |
| SESSION_0416_TASK_07 | landed | Greened main's pre-existing Oxc failure (formatted `reconcile-pods.mjs`, tracked+unformatted since 0414). |

## What landed

All four parallel BBL-prune streams consolidated onto a single green `main` (`a5d43a9d`),
one stream at a time, full local gate green before each:

- **#120 — brand → BBL constant** (`getRequestBrand()` always BBL; `proxy.ts` harness + `/_gated`
  removed; `brandHasFeature` collapsed to `() => true`). Landing it surfaced **39 unit failures**:
  27 were #120's brand-collapse (brand-scoped action tests asserting non-BBL behavior → flipped
  `requestBrand` to BBL) and **12 were pre-existing SESSION_0414 drift** (facet-mapper +
  `buildDirectoryProfileWhere` tests never re-run after 0414 changed their source). Fixed both via
  two parallel sub-agents on disjoint file sets.
- **codex — BJJ TechniqueGraph + Curriculum port** (~18 files: custom canvas w/ html2canvas PNG
  export, curriculum browser, server queries, prisma importer + data JSONs, `/techniques/graph` +
  `/curriculum` routes, nav entries). brand-features conflict resolved by keeping #120's collapse and
  carrying only codex's `curriculum` additions; dropped the resurrected `BBL_FEATURES` allowlist.
- **#121 — schools/orgs premium parity** (brand-neutral detail pages + facet cards; single-brand
  org-facet collapse). Verified the SESSION_0414 placeholder-Passport person-roster query is untouched.
- **#119 — header/left-nav/right-drawer BBLApp parity**. Auto-merged clean with codex's nav edits.

The public **countdown holding page is intact** (gate code in `app/(web)/layout.tsx` + bbl-countdown +
bbl-teaser untouched by all 57 files; gate is driven by the `BBL_COUNTDOWN=1` Vercel env, which a code
push doesn't change). All consolidated work ships to prod **behind the bob-tony preview cookie**.

## Decisions resolved

- **Local cherry-pick consolidation over GitHub merges** — replayed each PR/branch onto a local
  `consolidate` branch, resolved conflicts, gated green per stream, then ff `main`→consolidate + one
  push; closed the draft PRs referencing the consolidated SHAs. Preserves one-push-per-session cadence.
- **brand-features collapse wins over codex's allowlist** — `brandHasFeature` stays `() => true`; the
  technique/curriculum surfaces are real BBL features, so `robotsDisallowRoutesForBrand` is empty.
- **The 12 facet/profile-where failures were 0414 debt, not #120** — fixed the tests to assert the
  current (correct) source, preserving the lineage-tree OR roster fix rather than reverting it.

## Files touched

| File | Change |
| --- | --- |
| (57 files, +4,837/−390 vs main) | The 4 cherry-picked streams — see commits `3c791b48`, `e0c49d1f`, `0be7eacc`, `86de4833`, `a5d43a9d`. |
| `apps/web/config/{brand-features,seo}.test.ts` | Single-brand test assertions (ships-all-features, empty robots-disallow). |
| 12 `server/**/*.test.ts` | `requestBrand` → BBL (Agent B) so seeded data matches always-BBL resolution. |
| `apps/web/lib/directory/facet-result.test.ts`, `server/web/directory/profile-where.test.ts` | 0414-drift fixes: rankColorHex + lineage-tree OR brand path (Agent A). |
| `apps/web/scripts/reconcile-pods.mjs` | oxfmt (pre-existing 0414 Oxc-gate blocker). |
| `docs/sprints/SESSION_0415.md` | Landed with the codex commit (its own session doc). |

## Verification

| Check | Result |
| --- | --- |
| Final consolidated gate (typecheck) | ✅ |
| Final consolidated gate (`next build`) | ✅ middleware + `/techniques/graph` + `/curriculum` compile |
| Full unit suite (per stream + final) | ✅ **679 pass / 0 fail** (was 39 fail on #120) |
| format:check / oxlint | ✅ clean / 0 errors (after reconcile-pods.mjs fmt) |
| Dev-server smoke (consolidate, prodsnap) | `/`, `/directory`, `/schools`, `/techniques/graph`, `/curriculum`, `/lineage` → all 200 |
| Push | `4e43dac5..a5d43a9d main -> main`; Vercel Production deploy Building |
| Countdown gate | untouched — public holding page intact |

## Next session

### Goal

Confirm the `a5d43a9d` prod deploy is Ready on `blackbeltlegacy.com` and the consolidated work renders
behind the bob-tony preview (directory roster, schools/org cards, technique graph, curriculum, nav).
Then resume the prune: the deferred `getRequestBrand()` call-site inlining + dropping the brand columns/
indexes (Prisma migration), and the GitHub+folder rename to `black-belt-legacy`.

### First task

Verify the prod deploy + bob-tony preview surfaces on `blackbeltlegacy.com`; spot-check the ~7 pages
that still read `x-brand` directly with a non-BBL fallback (`disciplines`, `programs/*`,
`organizations/new`) — now that the header is gone they resolve to a wrong default; collapse those to
BBL as the next call-site cleanup.
