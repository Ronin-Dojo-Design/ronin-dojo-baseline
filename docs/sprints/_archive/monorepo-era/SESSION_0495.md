---
title: "SESSION 0495 — Epic C build: feed + component-library hardening (operating loop)"
slug: session-0495
type: session--implement
status: closed
created: 2026-07-03
updated: 2026-07-03
last_agent: claude-session-0495
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0494.md
  - docs/petey-plan-0494-experience-epics.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0495 — Epic C build: feed + component-library hardening

## Date

2026-07-03

## Operator

Brian + claude-session-0495

## Goal

Run the operating loop (Desi rubric → Cody build → Giddy architecture score, 3-pass max, ≥9.5 gate, Doug
verify at end) on **Epic C** of `petey-plan-0494`: harden the just-shipped `/posts` community feed **and**
the shared component library so rubric fixes propagate everywhere at once. Single lane — **Epic A opens only
after C closes.** Hold at the push gate for the operator's explicit "go."

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0494.md` (planning — authored `petey-plan-0494`).
- Carryover: 0494 banked the C→A→B experience-epics plan (no code). This session is the **0494 build**,
  Epic C first, per 0494's `Next session` block.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app` (canonical checkout — node_modules present, no bootstrap)
- Status at bow-in: clean except untracked `prod-live-dirty-dozen.jpeg` (known 0494 stray; left out)
- Current HEAD at bow-in: `3ba9836a`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Blog/content (community feed), Theming (card/button primitives) |
| Extension or replacement | Extension: hardening existing `/posts` + shared `ListingCard`/button/`BeltSwatch`/nav primitives against the code-quality rubric — no new capability |
| Why justified | Bank quality wins on the shipped 0493 surface before new build; rubric fixes propagate repo-wide |
| Risk if bypassed | Feed/component debt compounds into Epic A's scrollytelling surface |

Live docs checked during planning: not re-fetched (hardening existing surfaces, no new L1 capability).

### Environment readiness

- ffmpeg: **still installing** (`brew install ffmpeg` building `python@3.14` dep at bow-in). Not needed for
  Epic C — gated before Epic A slice A5 only.
- Dev server for live SSR review: `cd apps/web && npx next dev --turbo` (FS-0002).

### Board check (inbound loop)

- `board-backlog.ts`: 51 open cards; top = FI-001/G-001 (Brian Truelson onboarding, P0, in-progress) — the
  standing alternative. **Operator explicitly pinned Epic C this session**, which wins over the board rank
  (board is the fallback only when nothing is pinned).

## Petey plan

### Goal

Execute Epic C slices C0→C3 through the operating loop; hold at the push gate.

### Tasks

#### SESSION_0495_TASK_01 — C0 pass-0 baseline (Desi)

- **Agent:** Desi (model: fable) — read-only
- **What:** Rubric /10 snapshot of `/posts` community feed + shared component library (`ListingCard` family,
  buttons, `BeltSwatch`, `nav-sheet`, community-feed FAB, `Section`/card shells) + a **baseline-only** score
  of the current `/directory/[slug]` ancestry timeline (the Epic A handoff score — do NOT polish twice).
- **Steps:** review live SSR (headless browser) + source; produce prioritized improvement notes per
  page/component; fold in the P2 batch already logged from 0493.
- **Done means:** a scored baseline + prioritized fix list that feeds Cody's C1/C2.
- **Depends on:** nothing.

#### SESSION_0495_TASK_02 — C1 feed harden (Cody)

- **Agent:** Cody (session model)
- **What:** Fix the 0493 P2 batch (mobile filter/sticky, hero count, form hints, native-share hide,
  red-name contrast) + Desi's `/posts` round findings.
- **Done means:** `/posts` fixes land, gates green, no regressions.
- **Depends on:** TASK_01.

#### SESSION_0495_TASK_03 — C2 component-library sweep (Cody)

- **Agent:** Cody (session model)
- **What:** Rubric fixes on shared cards/buttons/`BeltSwatch`/nav — propagate repo-wide; verify no visual
  regressions on consumers.
- **Done means:** shared-primitive fixes land, consumers verified, gates green.
- **Depends on:** TASK_01.

#### SESSION_0495_TASK_04 — C3 loop close (Giddy → loop → Doug)

- **Agent:** Giddy (fable) scores architecture each pass; loop to ≥9.5 (max 3 passes); Doug (fable) verifies
  at end.
- **Done means:** aggregate ≥9.5 or 3 passes spent; Doug launch-safe verdict; report state.
- **Depends on:** TASK_02, TASK_03.

### Parallelism

C1 (`/posts`) and C2 (shared primitives) touch overlapping files (feed consumes the shared cards) — run
**sequential inline Cody**, not disjoint fan-out. Review agents (Desi/Giddy/Doug) dispatched with
`model: fable`; build (Cody) stays on the session model.

### Open decisions

- None blocking — C mechanics are locked (loop, 3-pass, 9.5 gate). Desi decides component-audit depth within
  the pass budget.

### Scope guard

- Do **not** polish the ancestry timeline — C baseline-scores it only (Epic A rebuilds it).
- No Epic A / B work until C closes (single lane).
- No push/merge/deploy — hold at the gate for the operator.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0495_TASK_01 | landed | C0 Desi pass-0 baseline — /posts **8.4** · component lib **8.5** · timeline **8.4** (Epic A handoff) |
| SESSION_0495_TASK_02 | landed | C1 feed harden — passes 1+2; accepted at **9.6** |
| SESSION_0495_TASK_03 | landed | C2 component-library sweep — passes 1+2; accepted at **9.6** |
| SESSION_0495_TASK_04 | in-progress | C3 loop close — gate cleared at **9.6** (Giddy 9.6 + Desi 9.6); Doug final verify running |

## Pre-flight: Epic C pass-1 (Cody)

Hardening pass on shipped 0493 code — enhance, not rip-and-replace. No NEW capability; two small
extractions (`FeedFilterBar`, `CommunityPostActions`) + one primitive variant each on `Sticky` and
`Button`. Component checklist below (schema/backend checklists N/A — no model change, existing action
seams reused).

### 1. Existing component scan
- Searched `components/web/` + `components/common/` for: feed filter bar, tabs, sticky, icon button,
  results count, post actions, hint, share menu, save button.
- Found (reuse targets): `Sticky` (`web/ui/sticky.tsx`), `Button` (`common/button.tsx`), `DataSelect`
  (`common/data-select.tsx`), `Hint` (`common/hint.tsx`), `EmptyList` (`common/empty-list.tsx`),
  `ResultsCount` (`web/ui/results-count.tsx`), `ListingSaveButton`/`ListingCard` (`web/listing/*`),
  `CommunityShareMenu`/`CommunityPostAdminMenu`/`CommunityPostFlair` (`web/community/*`), `isAdmin`
  (`lib/authz.ts`).

### 2. L1 template scan
- Consulted `dirstarter-component-inventory.md`: yes. Primitive API spot-check:
  - `Button (variant: fancy|primary|secondary|soft|ghost|destructive, size: xs|sm|md|lg, prefix, suffix, isPending)`
    — adding an opt-in `size: icon` for circular icon-only (FAB / Epic B MAB). Default `size: lg` unchanged.
  - `Sticky (isOverlay: bool, className)` — adding opt-in `mobile: bool` variant; default (`md:sticky`) byte-identical.
  - `DataSelect (options, value, onValueChange, placeholder, size, triggerClassName)`.
  - `Hint (children)` — plain `<p>` help text.
  - `ResultsCount (total, label)` — `total` currently discarded; repair to gate render on `total > 0`.
- Closest L1 pattern: `PostFeed` ↔ `CommunityFeed` verbatim dup → extract shared `FeedFilterBar` under `web/ui/`.

### 3. Composition decision
- Extending: `Sticky` (+mobile variant), `Button` (+icon size), `ResultsCount` (repair), `EmptyList` (+`render`).
- Composing (new thin wrappers, no L1 match for the exact shape): `FeedFilterBar` (shared sticky tabs+toggle
  bar consumed by both feeds — extracts verbatim dup, D3/D7 win) and `CommunityPostActions` (Save/Share/Admin
  trio pasted 3× — vote-readiness single-site). Both compose existing primitives; recorded in §New components.

### 4. Lane docs loaded
- Prior SESSION "Next session" read (0494 plan Epic C). Wiki: dirstarter-component-inventory, code-quality-matrix.
- Runbook: N/A (no new data flow).

### 5. Dev environment confirmed
- Dev server already running at `http://localhost:3000` (do NOT start a second). Working dir: `apps/web/`.
- Gates: `bunx tsc --noEmit`, `bun run lint` (FIXER — accept writes), `bun run test` (=`--parallel=1`),
  `next build` if a `"use server"` file is touched.

### 6. FAILED_STEPS check
- FS-0001 (raw HTML when component exists): mitigated — filter-bar tabs stay `<button role="tab">` (a11y
  tablist, no L1 tab primitive), everything else routes through primitives. `bun run lint` FIXER writes
  accepted per [[bun-run-lint-is-a-fixer]]. MUST-NOT-CHANGE guards honored (BeltSwatch internals, flair
  token map, timeline layout/motion, LoginDialog gate order, GAINER authz seams, shared-primitive defaults).

### SESSION_0495_TASK_01 — C0 pass-0 baseline (Desi, fable)

Desi scored live SSR (playwright, 1280 + 375px) + source against `code-quality-matrix.md`. Local feed is
empty ("No posts yet") — card/row/detail scored from source + the 0493 verification record; empty-state,
filter bar, FAB, timeline verified live.

- **/posts feed: 8.4** (Class B) — D3 Simplicity 7.5 (verbatim dup with `posts/post-feed.tsx` + action-trio ×3), D6 Scalability 7.5 (unbounded fetch + per-card save-check) drag it.
- **Component library: 8.5** — `Card`/`Grid`/`BeltSwatch` 9.5; laggards `ResultsCount` 7.0, `ListingSaveButton` 7.5, `Sticky` 7.5.
- **Ancestry timeline: 8.4** — Epic A handoff score. **Frozen** except the C1-9 token contrast fix (red-name 4.25:1 AA fail).

**Key sequencing (Desi):** C2 extractions precede C1 fixes — C2-1 `FeedFilterBar` before C1-1/2/3; C2-6
`ResultsCount` repair before C1-4. All five 0493 P2 items confirmed still open. Full prioritized fix list
handed to Cody (pass 1 = C1 P1+P2 + C2 P1+P2, dependency-ordered; P3 rides if budget allows).

### Operating-loop record (C3)

| Pass | Cody build | Giddy (architecture) | Desi (rubric) | Gate |
| --- | --- | --- | --- | --- |
| 0 | — | — | /posts 8.4 · comp-lib 8.5 · timeline 8.4 | baseline |
| 1 | all C1+C2 P1/P2/P3 landed; tsc 0 · test 36/36 | **8.9** (capped — new components not inventoried) | **9.25** (/posts 9.2 · comp-lib 9.3) | under 9.5 → pass 2 |
| 2 | wire `initialSaved` batch · cap `findCommunityPosts` · media-url bug · authz twins · inventory rows | **9.6** (cap lifted) | **9.6** (/posts 9.6 · comp-lib 9.6) | **≥9.5 ACCEPT** |

- **Two-lens value:** Giddy caught a real `media-url` prefix bug (path-style local-MinIO URLs rejecting image
  posts) that Desi's green D2 score missed — her pass-1 tests used origin-only bases.
- **D6 flip (the gate-mover):** `initialSaved` was dead API in pass 1 (per-mount `checkBookmarkSubject`
  storm still live); pass 2 added a batch seam (`server/web/bookmarks/saved-subjects.ts`) + threaded it
  through `/posts` → ONE query for signed-in viewers (verified by code trace + live save/unsave + RSC payload
  `savedPostIds: null` anonymous).
- **Accepted at pass 2** — no pass 3 needed. LOW residual (stale heart on in-session grid↔list remount) →
  follow-up notes, not returned to Cody.
- **Drift-register items (log at bow-out):** (1) `search.tsx` admin-detail href routing decision;
  (2) `auth-hoc.tsx` residual `role === "admin"` fork; (3) blog `findPublishedPosts` unbounded follow-up.

## What landed

**Epic C — feed + component-library hardening, run through the operating loop (Desi→Cody→Giddy, 3-pass max,
≥9.5 gate, Doug at end). Accepted at pass 2, aggregate 9.6; Doug = SHIP.**

- **Feed (`/posts`):** mobile-sticky filter bar, all-5-tabs edge-fade overflow, mobile-visible style facet,
  filter-aware `ResultsCount` under the bar (hero total only when >0), extracted `CommunityPostActions`
  (Save/Share/Admin trio ×3 → 1, the phase-2 vote single-site), video/title-counter hints, native-share hidden
  where unsupported, `findCommunityPosts` capped `take: FEED_TAKE=100`.
- **The D6 flip:** new batch bookmark seam `server/web/bookmarks/saved-subjects.ts` — `/posts` now fires ONE
  saved-state query threaded via `initialSaved` (was N per-mount `checkBookmarkSubject` actions).
- **Shared kernel:** new `components/web/ui/feed-filter-bar.tsx` (dedup of `community-feed`↔`post-feed`;
  `/blog` inherits the mobile fixes — **resolves D-035**); `Sticky` opt-in `mobile` variant; `Button`
  `size="icon"` (FAB off its `!`-hacks; Epic B MAB reuses it); `EmptyList` `render`; `ListingCard`
  touch-reachable description; `ResultsCount` `total` repaired; `ListingSaveButton` `initialSaved` + i18n.
- **Real bug fixed:** `media-url.ts` prefix guard now base-derived (path-style local-MinIO image posts were
  rejected; adversarial tests added). Caught by Giddy's lens, missed by Desi's green D2 — the two-lens win.
- **authz consolidation:** `nav-sheet`/`user-menu`/`search` → db-free `isAdmin` (`lib/authz-predicates.ts`,
  re-exported by `lib/authz`); `/admin`→`/app`; `AuthzUserRole` index signature dropped.
- **Hardening:** `bbl-reveal` SSR-visible keyframes; YouTube-id charset validation; i18n string extraction;
  timeline red-name AA contrast token fix (6.27:1) — the ONLY timeline change (frozen for Epic A, 8.4 handoff).
- **Docs:** `custom-component-inventory.md` rows for the 5 new/changed primitives (Cody); D-035 resolved +
  D-036/D-037 logged; `petey-plan-0494` staged with **Epic A slice A0.5 (StudentsCarousel V2)**.

## Decisions resolved

- **Epic C mechanics** (loop, 3-pass, 9.5 gate) — accepted at pass 2 (9.6), no pass 3.
- **`findCommunityPosts` bound** — Petey-ratified `take: 100` MVP safety bound now; cursor pagination is the
  follow-up (D-037). Blog `findPublishedPosts` stays unbounded per scope.
- **`authz-predicates.ts` split** — db-free predicate module is the correct home (avoids Prisma-in-browser),
  ratified by Giddy; not a 5th authz system (one definition, re-exported).
- **Epic A0.5 = StudentsCarousel V2** (operator, this session): additive bake-off variant with BBLApp parity on
  **gesture/behavior/feature** (bigger "baseball-card" player cards + country flag + school logo + verified,
  NO premium; embla swiper; `layoutId` grow-into-drawer) — **NOT the content-tab/filter chrome**. Featured-blog
  carousel comes AFTER Epic A, reusing the A0.5 swiper. (Memory `epic-a05-students-carousel-v2-scope`.)

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/bookmarks/saved-subjects.ts` (+`.test.ts`) | NEW — batch saved-state seam (one query) |
| `apps/web/components/web/ui/feed-filter-bar.tsx` | NEW — shared feed sticky tabs/toggle bar (resolves D-035) |
| `apps/web/components/web/community/community-post-actions.tsx` | NEW — Save/Share/Admin cluster (vote single-site) |
| `apps/web/lib/authz-predicates.ts` | NEW — db-free `isAdmin` predicate |
| `apps/web/app/(web)/posts/page.tsx` · `[slug]/page.tsx` | batch saved-state; filter-aware count; `isAdmin` |
| `apps/web/components/web/community/*` (feed, card, row, share-menu, create-dialog) | feed harden + action extract |
| `apps/web/components/common/{button,empty-list,search}.tsx` | `size:icon`; `render`; `isAdmin` migrate |
| `apps/web/components/web/{ui/sticky,ui/results-count,listing/listing-card,listing/listing-save-button,nav/nav-sheet,user-menu,profile/bjj-passport-card}.tsx` | primitive fixes + i18n + a11y |
| `apps/web/server/web/community/{media-url,queries}.ts` (+media-url test) | prefix-guard fix; `take` cap |
| `apps/web/lib/video-embed.ts` (+test) · `components/web/lineage/lineage-ancestry-timeline.tsx` · `app/(web)/(home)/bbl/bbl-reveal.tsx` | YT charset; contrast token; SSR keyframes |
| `apps/web/messages/en/{community,components,navigation}.json` | i18n keys |
| `apps/web/server/web/program/queries.ts` | `AuthzUserRole` call-site tightening |
| `docs/knowledge/wiki/custom-component-inventory.md` | 5 new/changed primitive rows |
| `docs/knowledge/wiki/drift-register.md` | D-035 → RESOLVED; D-036, D-037 logged |
| `docs/petey-plan-0494-experience-epics.md` | staged Epic A slice A0.5 (StudentsCarousel V2) |
| `docs/sprints/SESSION_0495.md` · `docs/knowledge/wiki/index.md` | this session record + index row |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx tsc --noEmit` (Doug + gate build) | PASS — 0 errors |
| `bun run test` (`--parallel=1`) | PASS — **1045 / 0**, 159 files (new `saved-subjects` + `media-url` green) |
| `next build` (Doug + gate runner) | PASS — exit 0, **190/190 pages**, RSC boundary clean |
| Failure-mode (batch seam · media-url · authz · ListingCard) | PASS — no data-integrity holes (Doug) |
| Live UAT | `/posts` 375+1280 via SSR classes; save round-trip **7/7** vs real DB; consumer sweep (`/techniques` `/schools` `/directory` `/blog`) 200/clean. Boundary: no authenticated browser click this session (click-toggle verified in loop pass 2) |
| Migration / schema | NONE touched (confirmed — `git diff --stat apps/web/prisma/` empty) |
| Operating loop | pass 0 baseline → pass 1 (Giddy 8.9 / Desi 9.25) → pass 2 **Giddy 9.6 · Desi 9.6** ACCEPT |
| fallow introduced-findings delta | 0 |
| ffmpeg (Epic A dependency) | **READY** — v8.1.2 installed |

## Open decisions / blockers

- **None blocking.** Epic C is launch-safe, held at the push gate for the operator's explicit go (app-code
  push = full CI matrix + prod deploy).
- Deferred (logged): D-036 (`isAdmin` residual forks), D-037 (blog feed unbounded + hero-count past cap),
  LOW cosmetic stale-heart on in-session grid↔list remount (data layer proven idempotent).

## Next session

### Goal

**Open Epic A (the Lineage Journey), first slice A0.5 — StudentsCarousel V2.** Build the additive
"baseball-card" player-card + embla swiper + `layoutId` grow-into-drawer variant (BBLApp gesture/behavior/
feature parity, not chrome), through the operating loop to ≥9.5. Standing alternative if the operator
repoints: board P0 Brian Truelson onboarding (FI-001 / G-001).

### First task

Desi pass-0: baseline the current `students-carousel.tsx` + score a V2 target against the "player-card" rubric
(avatar + name + belt + country flag + school logo + verified). Confirm the read-model projection reach on
`LineageTreeMemberRow` (`isVerified` have it; `countryOfOrigin` + school `logoUrl` need projecting — no
migration). Then Cody pre-flight → build V2 behind a toggle. Full spec: `petey-plan-0494` slice A0.5 +
memory `epic-a05-students-carousel-v2-scope`.

## Review log

### SESSION_0495_REVIEW_01 — Epic C operating loop + Doug final verify

- **Reviewed tasks:** SESSION_0495_TASK_01–04.
- **Method:** the operating loop — Desi rubric baseline (C0) → Cody build (pass 1) → Giddy architecture + Desi
  rubric re-score → Cody pass 2 → Giddy + Desi confirm → Doug final launch-safety verify. Review agents on
  Fable-5; Cody on the session model.
- **Verdict:** Accepted at pass 2, aggregate **9.6** (Giddy 9.6 + Desi 9.6), Doug **SHIP** with 0 blockers.
  Clean, well-sequenced hardening; the two-lens review caught a real bug single-lens missed (media-url).
- **Score:** 9.6/10.
- **Follow-up:** D-036, D-037 (deferred); LOW stale-heart accepted; Epic A0.5 staged.

## Hostile close review

- **Giddy:** PASS — architecture 9.6; extraction seams sound, additive variants keep consumers byte-identical,
  `authz-predicates` split ratified; 3 drift items logged (D-036/D-037 + auth-hoc residual).
- **Doug:** PASS — SHIP; tsc 0 / test 1045-0 / next build 190-190; failure-mode clean; no schema/migration; one
  honest UAT boundary declared (no authenticated browser click this session).
- **Desi:** PASS — rubric 9.6 (/posts 9.6 · comp-lib 9.6); live SSR + consumer regression sweep clean; timeline
  frozen at 8.4 with contrast fix confirmed.
- **Kaizen aggregate:** 9.6/10 — verified, launch-safe, no findings ≥ medium open.

## ADR / ubiquitous-language check

- **ADR update: not required.** No architectural decision made/changed/rejected — Epic C is hardening on the
  ADR 0042 (blog/community) + design-system-doctrine surfaces; `feed-filter-bar`/`community-post-actions` are
  component-inventory material, and the `authz-predicates` split encodes an already-documented gotcha
  (Prisma-in-browser), not a new decision (Giddy ruled an ADR would be ceremony). ADR 0035 (awarded-truth) and
  ADR 0042 confirmed still valid.
- **Ubiquitous language: not required this session.** New terms (*feed filter bar*, *community post actions*,
  *player card* / *StudentsCarousel V2*, *grow-into-drawer*) are staged for `ubiquitous-language.md` when A0.5
  lands them in code next session.

## Reflections

- **The two-lens review earned its cost in one finding.** Desi scored D2 Security a green 9.5 with passing
  media-url tests; Giddy, reading the same diff for architecture, caught that the prefix guard was root-anchored
  and would reject every image post on local path-style MinIO — because Desi's tests only used origin-only R2
  bases. Neither lens alone finds it; the union does. That's the argument for Giddy-and-Desi in parallel, not
  either/or.

- **The gate cap did its job as a forcing function.** Giddy's pass-1 8.9 wasn't a quality complaint — the raw
  score was ~9.3 — it was the "new custom component not inventoried" hard cap. It converted a documentation
  omission into a blocking number, which is exactly the point: the inventory row is how the *next* agent finds
  the component. Pass 2 lifting the cap (inventory rows) alongside the real D6 fix is what cleared 9.5.

- **Mechanism-before-wiring is a real trap the loop caught.** Cody's pass 1 shipped `initialSaved` as a clean
  opt-in prop — but no page consumed it, so the per-mount query storm the epic exists to kill was still live,
  and D6 hadn't actually moved. It *looked* done (tests green, API well-shaped) while being dead API. Both
  reviewers flagged it independently; pass 2 wired it. Lesson: a scalability fix isn't done when the mechanism
  exists, only when a consumer proves the old cost is gone.

- **Scope discipline held under a tempting adjacency.** The operator's StudentsCarousel-V2 / baseball-card idea
  is genuinely exciting and it would have been easy to start bolting it onto C. Keeping C a clean single lane
  (and banking A0.5 to plan+memory instead) is what let Doug certify a coherent, verifiable diff.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | touched docs bumped `last_agent: claude-session-0495` (petey-plan-0494, drift-register, custom-component-inventory by Cody); SESSION_0495 new (full frontmatter); wiki index row added |
| Backlinks/index sweep | SESSION_0495 pairs_with SESSION_0494 + petey-plan-0494; wiki index += SESSION_0495 row; drift-register D-035↔C2-1, D-036/D-037 reference this session |
| Wiki lint | `bun run wiki:lint` — **0 err / 33 warn** (0 errors; warnings = pre-existing + SESSION_0495 pre-flight heading-then-list style; the 2 I introduced in the A0.5 plan section were fixed) |
| Kaizen reflection | yes — `## Reflections` (4) |
| Hostile close review | SESSION_0495_REVIEW_01 — Giddy/Doug/Desi all PASS; aggregate 9.6 |
| Code-quality gate (Class-A) | operating loop IS the Class-A gate this session — aggregate 9.6 (Giddy 9.6 + Desi 9.6) against `code-quality-matrix.md` |
| Runtime verification (Doug) | SHIP — tsc 0 / test 1045-0 / next build 190-190; save round-trip 7/7 vs real DB; UAT boundary declared |
| Review & Recommend | Next session goal written (Epic A / A0.5); board P0 (FI-001) surfaced as standing alternative |
| Memory sweep | new project memory `epic-a05-students-carousel-v2-scope` + MEMORY.md index row |
| Next session unblock check | unblocked — A0.5 Desi pass-0 is read-only + doable; read-model projection reach to confirm (no migration) |
| Git hygiene | branch main; single commit at close; **NOT pushed** — explicit-push-authorization (app-code push = prod deploy); hash reported in bow-out chat |
| Graphify update | nodes=16209 edges=31961 communities=2169 (gate runner, pre-commit) |
| Ledger cross-off | D-035 → RESOLVED (C2-1). Runner candidates FI-001/G-001/FS-0001/FS-0002 = referenced, NOT resolved (standing) → not flipped. No board-tracked card resolved → board cross-off skipped |

## Post-close addendum — CI-caught regression + fix (post-push)

The push to `main` (`44d67d36`) went out on the operator's go; the Vercel prod deploy went **Ready/live**,
but the CI matrix caught two issues the loop missed:

1. **oxfmt --check (format gate) FAILED** on 2 NEW files (`feed-filter-bar.tsx`, `saved-subjects.test.ts`).
   Root cause: the bow-out format-fixer only formats **tracked** diffs, so **untracked new files slipped**.
   Whitespace-only fix committed (`f4dc4aba`). *(Follow-up: the gate runner's format-fix should include
   untracked new files — logged as a gate-runner gap.)*

2. **Playwright E2E FAILED (real regression)** — `e2e/lineage/public-visibility.spec.ts:74` (webkit +
   chromium): `getByText("0 lineage trees")` not visible. **Cause:** C2-6 made `ResultsCount` self-hide at
   `total <= 0` for **all 7 consumers**; `lineage-query.tsx` needs the visible "0 lineage trees" — a
   public-visibility **contract** (anonymous search matching only hidden members must show the zero count).
   Giddy flagged the consumer-safety risk; Cody "verified-safe" by **source inspection** — but the loop never
   ran Playwright, so the E2E contract went unchecked. **NOT a security leak** (hidden names still never
   rendered; only the "0" affirmation was missing) and prod's exposure was cosmetic.
   **Fix:** hide-at-0 made **opt-in** (`hideWhenEmpty`, default renders) — `community-feed` opts in; the other
   6 consumers restore their zero-signal. Verified: tsc 0; live `/lineage?q=<no-match>` renders "0 lineage
   trees" again; format:check clean. CI re-run confirms.

**Process lesson (see memory `operating-loop-needs-e2e-for-ui-contracts`):** the Desi→Cody→Giddy→Doug loop
verified at source + unit + `next build` levels but **never ran the Playwright E2E suite**, so a
shared-primitive change that broke a *tested UI contract* passed the loop and only failed in CI. Doug's SHIP
even declared "no authenticated browser click" — but this was an **anonymous** contract the local loop could
have run. For any change to a **shared primitive with existing E2E coverage**, run the affected E2E specs
locally before the SHIP verdict, not just unit + build.
