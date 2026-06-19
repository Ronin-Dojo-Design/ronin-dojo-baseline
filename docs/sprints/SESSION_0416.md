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
| SESSION_0416_TASK_08 | landed | BBL type system: Poppins/Inter site-wide (global font load + `@theme` tokens + `--font-geist` rename); brand-theme guard/dedupe helper. |
| SESSION_0416_TASK_09 | landed | Landing composition on `/lineage/join`: scrolling-phone hero + Rigan/video slots + email capture; heading weights; ads removed. |
| SESSION_0416_TASK_10 | landed | Recovered + extended the BBL footer (`5413dc15`) → global; BBL logo in header; curated right-nav; programs removed. |
| SESSION_0416_TASK_11 | landed | gi + Passport avatar via `getCurrentUserAvatar` server seam (Prisma-in-browser fix); magic-link login modal wired; Create Account→join. |
| SESSION_0416_TASK_12 | landed | Join form → 3-step wizard (StepProgress + per-step validation); Explore→`/lineage/bbl-lineage`. |
| SESSION_0416_TASK_13 | landed | Promoted the landing to home `/` (`(home)/bbl-join-landing.tsx`); gate untouched; `/lineage/join` kept. |
| SESSION_0416_TASK_14 | landed | SOT'd the foundation: 7 `wiki/files/bbl-*.md` + index/log. |

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

## Phase 2 — BBL landing foundation (same session, post-consolidation)

After the consolidation, rebuilt the BBL public landing from a solid foundation and **promoted it to
the home page `/`** — gate untouched (public still sees the teaser; the bob-tony cookie sees the
landing). "Finally building from a solid foundation" (operator). Task log: `SESSION_0416_TASK_08..14`.

### What landed (Phase 2)

- **Type system, the idiomatic way** — Poppins headings + Inter body **site-wide**: fonts loaded
  globally on `<html>` (`app/layout.tsx`), Geist var renamed `--font-geist`, `@theme`
  `--font-display`/`--font-sans` point at the BBL fonts. One guarded `brandThemeCss()` helper for
  `[data-brand]` + `[data-org]` (closes the previously-unguarded inject seam). ⚠ Tailwind v4 `@theme`
  caches in Turbopack — a `@theme` edit needs a full `rm -rf .next` in dev (prod build is fresh).
- **Landing composition** (`join-legacy-landing.tsx`, promoted to `/` via `(home)/bbl-join-landing.tsx`):
  scrolling-phone hero → Rigan heritage → Rigan video → **3-step claim wizard** (`join-legacy-form.tsx`,
  monorepo stepper UX on our existing fields/action) → email capture. "Explore the lineage" →
  `/lineage/bbl-lineage`. `/lineage/join` kept as-is.
- **Chrome:** recovered the reverted BBL footer (`5413dc15`) → global, socials + link columns un-gated,
  no programs; BBL logo in the header (`config/site.ts` logoSrc); curated right-nav; **gi + Passport
  avatar** via the server seam `getCurrentUserAvatar` (the Prisma-in-browser rule); magic-link **login
  modal** wired to the nav; ads removed (a #120 `brandHasFeature→true` regression re-enabled them).
- **SOT'd** the foundation: 7 new `docs/knowledge/wiki/files/bbl-*.md` file docs + wiki index/log.

### Files touched (Phase 2)

| File | Change |
| --- | --- |
| `app/(web)/(home)/{page,bbl-join-landing}.tsx` | Home `/` renders the join landing for BBL (new shared component). |
| `app/(web)/lineage/join/{join-legacy-landing,join-legacy-form,page}.tsx` | Phone hero + Rigan/video slots; 3-step wizard; rankColors. |
| `app/(web)/_components/bbl-footer.tsx` (new) | Global BBL footer (recovered + extended). |
| `app/(web)/layout.tsx` | Ads removed; BblFooter; avatar server seam. |
| `lib/{fonts,brand-theme}.ts` (brand-theme new), `app/styles.css` | Type system + one guarded theme helper. |
| `components/web/{header,nav/nav-sheet}.tsx` | Avatar prop; curated nav; login modal; programs removed. |
| `server/web/account/current-user-avatar.ts` (new) | Passport→client avatar seam. |
| `bbl/bbl-landing/bbl-heritage.tsx`, `bbl-teaser/email-capture.tsx`, `config/site.ts`, `organizations/[slug]/layout.tsx` | Heritage CTA removed; centered logo; BBL logoSrc; brand-theme. |
| `docs/knowledge/wiki/files/bbl-*.md` (7 new) + `wiki/index.md` + `wiki/log.md` | SOT file docs. |

### Verification (Phase 2)

| Check | Result |
| --- | --- |
| typecheck | ✅ |
| `next build` (full, incl. home promotion) | ✅ exit 0 |
| Dev smoke (preview cookie) | `/`, `/lineage/join`, `/lineage/bbl-lineage` → 200; home renders phone-hero + Rigan + video + wizard |
| Countdown gate | untouched (early-return runs before the avatar seam + new render) |
| Prisma-in-browser | login-modal/avatar leak caught + fixed (inlined gi const; server `getCurrentUserAvatar` seam) |

## Next session

### Goal

Operator review of the promoted landing on prod (`blackbeltlegacy.com` via the bob-tony cookie), then
continue toward reveal-prep. Deferred: the ~7 `x-brand` non-BBL-fallback pages, the `getRequestBrand()`
call-site inlining + brand-column Prisma migration, and the `black-belt-legacy` rename.

### First task

Verify the pushed landing renders on prod behind the preview cookie (phone hero, Rigan, video, wizard,
footer, nav avatar). Then spot-check the `x-brand` fallback pages (`disciplines`, `programs/*`,
`organizations/new`) — header's gone, so they resolve to a wrong default — and collapse them to BBL.

## Reflections

- **The whole day proved the prune thesis.** Phase 1: once "other brands don't matter," every hard
  thing (un-deletable harness, brand-scoping bugs, the 39 test failures) turned mechanical — and
  parallel sub-agents on disjoint file sets (operator-enabled ultracode) cut the wall-clock in half.
- **Two latent regressions hid inside the #120 brand collapse**, both surfaced by building real
  surfaces on top: `brandHasFeature → true` silently re-enabled **ads** (BBL was excluded) and the
  programs link. The lesson: a "collapse to always-true" needs a follow-up audit of every
  feature-gated surface, not just the call sites.
- **The Prisma-in-browser rule bit twice** (login modal + avatar). `lib/media` pulls Prisma via
  `services/s3`; importing it into client chrome breaks the Turbopack build. The fix is always the
  same shape: resolve server-side, pass the string down as a prop (the `getCurrentUserAvatar` seam).
- **Tailwind v4 `@theme` + Turbopack** cost a misdiagnosis: I called the `@theme` edit an "idiom
  limit" when it was a cache — `.next/cache` clear wasn't enough; only `rm -rf .next` showed it. Verify
  with a clean build before concluding a thing "can't work."
- **Reuse beat rebuild repeatedly:** the footer (recovered from a reverted commit), the login modal
  (a prior session's `LoginDialog`), the magic-link `LoginForm`, the heritage/video sections — almost
  nothing was written from scratch. The "files folder" SOT now records these so the next session reuses
  instead of re-deriving.

## Hostile close review

- **Giddy:** pass — gates green (typecheck + `next build` exit 0); countdown gate proven untouched
  (early-return precedes the new render); no client Prisma leak (build clean). Honest verification:
  every claim browser-/build-checked.
- **Doug:** pass — wizard per-step validation works; avatar seam typed + resolves; footer/nav render
  200. Note: this is a UI/landing session — no schema/auth/payment changes, so Dirstarter L1 proof n/a.
- **Desi:** pass — Poppins/Inter consistent top-to-bottom; the landing matches the holding-page voice
  (operator-confirmed live on :3000).
- **Kaizen aggregate:** 9/10 — the only ding is the two #120 regressions that a feature-gate audit
  would have caught earlier.

## ADR / ubiquitous-language check

- ADR update **not required** — no new architectural decision; the brand-token/type-system approach
  follows existing Dirstarter Tailwind-v4 patterns. The Prisma-in-browser + `@theme`-cache gotchas are
  captured in the SOT file docs + memory, not an ADR.
- No new ubiquitous-language terms.
