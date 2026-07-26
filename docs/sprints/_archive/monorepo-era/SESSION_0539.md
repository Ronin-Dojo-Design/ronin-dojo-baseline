---
title: "SESSION 0539 — FI-006 claim→award rank lifecycle + belt-rendering design pass (rank-bar striping + BeltSwatch consolidation)"
slug: session-0539
type: session--implement
status: closed
created: 2026-07-14
updated: 2026-07-15
last_agent: claude-session-0539
sprint: S12
pairs_with:
  - docs/sprints/SESSION_0538.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0539 — FI-006 claim→award rank lifecycle + belt-rendering design pass (rank-bar striping + BeltSwatch consolidation)

## Date

2026-07-14

## Operator

Brian + claude-session-0539

## Goal

Operator pinned **FI-006 (claim→award rank lifecycle, P1)** as the lane and **folded in a belt-rendering
design pass**: refine the vertical ancestry-timeline belt (directory profile page) with a proper BJJ
**rank bar** (contrasting rectangle inset from the tip, degree stripes on the bar, belt-color tip), apply
the operator's category striping rules, and **consolidate every belt render onto the refined component** —
deleting the "ugly" folded-belt `bar` variant and its ~14 usages (incl. the cinematic cohort-timeline
explorer). Desi runs a `/grill-me` on the striping details before any build. FI-006 and the belt pass share
the `Rank`/rank-award domain but touch mostly disjoint code (lifecycle = server/claim; belts = presentation)
— Petey plan slices scope at the grill/plan checkpoint.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0538.md` (G-002 Baseline Phase 2 local — own-DB wiring,
  per-product auth, Lead funnel + gated board). **LANDED + MERGED as [#207](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/207)**; origin/main is now `7fc33138`.
- Carryover: **G-002's remaining half is the operator-gated cloud batch** (Neon/Vercel provisioning + the
  Baseline domain cutover, RISK #13 Neon rotation first) — off the autonomous table. The board still shows
  `G-002 in-progress` for that reason. FI-028/FI-028b community freemium ladder shipped (0535/0537) — do NOT
  rebuild.

### Branch and worktree

- Branch: `session-0539-fi006-belts`
- Worktree: `/Users/brianscott/dev/ronin-0539` (recreated once — the first `git worktree add` timed out
  mid-checkout and left broken metadata; pruned + recreated clean, full 3436-file checkout).
- Status at bow-in: clean (fresh worktree off origin/main; this SESSION file untracked).
- Current HEAD at bow-in: `7fc33138`

### Lane selection

Ran `bun scripts/board-backlog.ts --top=10`. FI-001 (P0) PARKED; G-002 (P1) merged, cloud half
operator-gated. Top non-parked actionable P1 card = **FI-006** (its `in-progress` board badge is stale — no
live branch/worktree/session owns it; last touched in planning sessions 0430–0433/0529). Operator confirmed
FI-006 and folded in the belt design pass.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (`Rank` model — possible new rank-bar field for FI-006 + belt category); Theming/UI (belt rendering — `BeltSwatch`, ADR 0022 data-driven colors). |
| Extension or replacement | **Extension** — extends the existing data-driven `BeltSwatch` (`Rank.colorHex`/`secondaryColorHex`/`degree`) and the claim/rank-award lifecycle; no Dirstarter capability replaced. |
| Why justified | FI-006 completes the claim→pending-claim→award rank flow; the belt pass unifies ~15 divergent belt renders onto one refined component ("one foundation" per the Apple/Facebook mantra). |
| Risk if bypassed | Belt renders stay split across an ugly `bar` + a `flat-bar`; the rank-bar striping stays a hardcoded-map temptation instead of a data-driven contract. |

Live docs checked during planning: not applicable yet — internal component + schema lane.

### Graphify check

- Graph status: current (canonical checkout — 17255 nodes / 33754 edges / 2262 communities / 2650 files).
  Worktree graphify would return 0 (not built there); recon run from canonical + direct grep.
- Belt-surface recon (grep, canonical checkout):
  - **Canonical belt renderer:** `apps/web/components/common/belt-swatch.tsx` — ONE `BeltSwatch` with 3
    variants: `dot` (dense listings) · `bar` (folded-belt-with-knot — "for the cinematic lineage explorer",
    THE ugly one) · `flat-bar` (flat rank bar, SESSION_0493 ancestry-timeline — THE one we refine).
  - **`flat-bar` (refine target):** 2 sites — `lineage-ancestry-entry.tsx` (the directory-profile vertical
    ancestry timeline via `ancestry-section.tsx`), `students-carousel-v2.tsx`.
  - **`bar` (ugly — delete + migrate):** ~14 sites — `lineage-cohort-timeline/{box-card,leaf-row,ancestor-spine}.tsx`
    (cinematic explorer), `lineage-view-a/{focus-panel,filter-bar}.tsx`, `lineage-profile-drawer/drawer-header.tsx`,
    `directory-profile/ranks-section.tsx`, `profile/bjj-passport-card.tsx`, `belt/{belt-edit-card,belt-edit-form}.tsx`,
    `events/.../award-card.tsx`, `app/lineage/claims/[id]/.../claim-review-detail.tsx`.
- **`Rank` schema (data available):** `colorHex`, `secondaryColorHex` (coral/red-white alternating panels),
  `degree` (Int?, e.g. 8 = 8th degree), `sortOrder`, `name`. **No belt-category field** — the central fork.

### Central design fork (for the grill)

The operator's bar-color rules are a **category → treatment map** (black-belt → red bar; white/blue/purple/
brown → black bar; coral → red bar; red belt → red bar + thin white outline + 9 stripes; belt-color tip,
bar inset). But **ADR 0022 forbids a hardcoded belt-color map in the component** (data-driven only). So the
key decision: does the rank-bar treatment **derive** from existing fields (`degree`/`secondaryColorHex`/
`sortOrder`) or come from a **new seeded `Rank` field** (data-driven, respects ADR 0022)? This also
intersects FI-006's rank model and the in-flight RankEntry migration. → Desi `/grill-me` resolves it.

### Grill outcome

Desi `/grill-me` on the belt striping — 6 forks resolved (operator answered each; a live SVG spec-sheet
mockup drove the visual calls):

1. **Stripe/degree model = grade-as-marks, all belts.** White marks on the rank bar = the belt's grade
   number. Colored belts (white/blue/purple/brown) = **0–4 stripes on a BLACK bar** (bar present even at 0).
   Black/coral/red = **degrees on a RED bar** (black 1–6, coral 7–8, red 9–10) — each degree = one white
   mark, no intermediary stripes. **Reverses** the component's old "suppress 7+" cap (a 9th-degree red belt
   shows 9 marks → the belt must size for up to 10 legibly). Operator clarified the terminology precisely
   (colored = "stripes" 1–4; black+ = "degrees" 1–10; both render as white marks).
2. **Bar treatment by family:** COLORED → black bar, no outline · BLACK → red bar, no outline · CORAL → red
   bar **+ thin white outline** (alternating red/black 7th, red/white 8th panel body via `secondaryColorHex`)
   · RED → red bar **+ thin white outline** (solid red body). Outline whenever the body is red-ish (coral+red).
3. **Belt-color tip:** the rank bar is **inset** from the right; a segment of belt-color shows past it.
4. **Data source = STRUCTURED on `Rank`** (operator's instinct, over name-parsing). Populate `Rank.degree`
   (the white-mark count) + add a small **`beltFamily`** signal, seeded per belt. Component reads clean
   structured fields; `RankEntry` unchanged as the person→belt link (resolved via `memberTopRank`). Explained
   the `Rank` (belt definition) vs `RankEntry` (person's holding) distinction; "decouple" meant only *don't
   entangle the in-flight `RankAward`→`RankEntry` table-drop migration* — a different, additive-safe concern.
5. **Coral:** alternating panels + outlined red bar (fork 2).
6. **Session scope = belts THIS session, FI-006 NEXT.** The belt pass (Rank data + BeltSwatch redesign +
   ~14-surface consolidation + verify) is one coherent lane; the FI-006 claim→award lifecycle is teed up for
   the next session, now on solid rank data. **Consolidation = full striped belt everywhere** (delete the ugly
   `bar` variant; migrate all ~14 usages, dense surfaces included; `dot` variant stays as-is).

### Design review (live mock) — geometry LOCKED

After the first build, a live-mock review with the operator (artifact
`claude.ai/code/artifact/2e14a1a7-b3d4-4767-9254-c299a7d0a336`) surfaced two legibility findings (Desi
PASS-WITH-FIXES) and locked the final geometry:

- **Fully countable everywhere (operator's explicit call).** Marks must be countable up to 10 on ALL surfaces
  — no "decorative texture on dense cells" compromise. Drove: reworked geometry (viewBox **148×20**, rank bar
  **62 units ≈ 42%** of the belt, `MARK_W=2.6`, `PITCH=5.3`) so 9 vs 10 read at inline sizes; **`size` presets**
  (sm/md/lg) replacing the ad-hoc `h-4 w-12`/`h-2 w-10` overrides that were letterboxing the belt *smaller*
  than default (SVG width governs size; `h-*` just letterboxes — Desi's HIGH finding).
- **Degree marks = full-height "wrapped athletic tape"** — edge to edge, no vertical inset (real BJJ degrees
  are white tape wrapped around the belt). Bar + marks clipped to the rounded body; hairline borders
  throughout (body stroke 0.5, coral/red white outline 0.6).
- **Roster rows stack** (name + rank on their own line, full-width belt below) so degrees stay countable and
  names never truncate — operator's fix for the leaf-row (NOT name-on-belt overlay).
- **Prestige surfaces → `lg`** (timeline, cinematic explorer, hero, drawer, focus panel); **filter chips stay
  a compact swatch** (belt-color filter, not a person's degree).
- Non-blocking follow-ups logged (not this batch): the pre-existing repo-wide **ADR 0022→0026** belt-color
  citation (Giddy — belt rule actually lives in ADR 0026 + design-system doctrine, not 0022 "Brand Chrome");
  the grouped-`{...belt}` vs enumerated-props consumption idiom (Giddy tidy); the `organizations-section`
  dup-key console warning (Doug, pre-existing non-belt).

### Drift logged

- The `Rank.degree` field (added SESSION_0493 for exactly this belt rendering) was **never populated** — the
  IBJJF ladder ships `degree=null`, so the existing `flat-bar` renders no marks. Belt "correctness" is a DATA
  gap as much as a component gap. (Backfilled in TASK_01.)

## Petey plan

### Goal

Refine the BJJ belt rendering to a proper BJJ **rank-bar** design (inset bar + belt-color tip + degree/stripe
marks + family-driven bar color/outline), on a structured `Rank` data foundation, and consolidate **every**
belt surface onto the one refined `BeltSwatch` — deleting the ugly folded-belt `bar` variant. FI-006's
claim→award lifecycle is explicitly next-session.

### Tasks

#### SESSION_0539_TASK_01 — `Rank` structured-data foundation (schema + seed + backfill)

- **Agent:** Cody
- **What:** Give `Rank` the data the striping needs: `beltFamily` (new) + populated `degree` (existing).
- **Steps:**
  1. Add a `BeltFamily` enum (`COLORED | BLACK | CORAL | RED`) + `Rank.beltFamily BeltFamily?` (nullable →
     additive; non-BJJ systems stay null). Confirm the enum name/values with Giddy at build.
  2. Set `degree` (white-mark count: 0–4 colored stripe grades, 1–6 black, 7–8 coral, 9–10 red) + `beltFamily`
     explicitly in `buildBjjRanks()` (`seed-baseline-programs.ts`) — the seed is SoT.
  3. Backfill existing rows: mirror `scripts/seed-rank-secondary-colors.ts` (name-derived, idempotent upsert)
     for `degree`+`beltFamily`, OR carry explicit UPDATEs in the migration. Confirm coral `secondaryColorHex`
     already seeded (it is — `secondaryColorFromRankName`).
  4. **Hand-author** the migration (shared local DB ⇒ `migrate dev` BANNED; additive ⇒ `migrate deploy` ok;
     shadow-replay). Prove isolation (mammoth/baseline/other DBs untouched). Prod auto-applies via prebuild.
- **Done means:** every IBJJF rank has `beltFamily` + non-null `degree`; migration SQL committed + prod-safe;
  Prisma client regenerates; isolation proven.
- **Depends on:** nothing

#### SESSION_0539_TASK_02 — Refined `BeltSwatch` (striped rank-bar belt) + `beltBarTreatment` util

- **Agent:** Cody (with Desi spec = the approved mockup)
- **What:** Turn the `flat-bar` variant into the proper rank-bar belt; delete the ugly `bar` variant.
- **Steps:**
  1. One `beltBarTreatment(family)` util → `{ barColorHex, outline }` (COLORED→black/no-outline; BLACK→red/
     no-outline; CORAL/RED→red/outline). The ONE home for bar-treatment design constants — belt colors still
     come from `colorHex` data (ADR 0022 intact; the bar color is family-driven design, not per-belt data).
  2. Refine the belt SVG: **inset rank bar** (belt-color tip past it), white marks = `degree` right-anchored
     from the tip, coral alternating panels (`secondaryColorHex`) + outlined bar, red-belt outlined bar. Size
     for up to 10 marks legibly. **Graceful fallback** when `beltFamily`/`degree` are null (belt-color body,
     neutral bar, no marks) — non-BJJ + unseeded ranks.
  3. Delete the `bar` variant; keep `dot`. Update `belt-swatch.test.tsx` for the new spec.
- **Done means:** `BeltSwatch` renders the approved spec-sheet from `Rank` data; `bar` variant removed; test green.
- **Depends on:** TASK_01 (data shape)

#### SESSION_0539_TASK_03 — Migrate every belt surface onto the refined belt

- **Agent:** Cody
- **What:** Full striped belt everywhere; extend the rank read-models to carry the new fields.
- **Steps:**
  1. Extend the rank resolvers/projections to carry `{ colorHex, secondaryColorHex, degree, beltFamily }`:
     `memberTopRank` consumers + `lib/lineage/{canvas-model,to-lineage-visual}.ts` + the ancestry payload
     (`server/web/lineage/ancestry`) + `directory-profile-data.ts`.
  2. Migrate all ~14 `variant="bar"` sites + the 2 `flat-bar` sites to the refined belt with full data
     (cohort-timeline box-card/leaf-row/ancestor-spine, view-a focus-panel/filter-bar, drawer-header,
     directory ranks-section, bjj-passport-card, belt-edit-card/-form, award-card, claim-review-detail,
     ancestry-entry, students-carousel-v2).
- **Done means:** no `variant="bar"` remains; every belt surface renders the refined striped belt from data.
- **Depends on:** TASK_01, TASK_02

#### SESSION_0539_TASK_04 — Verify (fan-out)

- **Agent:** Doug + Giddy + Desi
- **Doug:** gates (tsc/oxlint/oxfmt/`next build` + affected lineage/belt e2e) · migration isolation · live
  render of every belt surface (0 console errors).
- **Giddy:** ADR 0022 compliance (no hardcoded belt map; bar-treatment family-driven) · additive-migration
  safety + NO `RankAward`→`RankEntry` collision · one-foundation consolidation (`bar` gone).
- **Desi:** visual fidelity to the approved spec across all surfaces · dark mode · sizing/legibility at up to
  10 marks · flag any dense surface the full-belt-everywhere call genuinely crowds.
- **Depends on:** TASK_01–03

### Parallelism

**Sequential single Cody build** (01 → 02 → 03) — shared data shape + shared files (`BeltSwatch`, rank
resolvers). **Verification fans out** (Doug + Giddy + Desi) after the build.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01–03 | Cody | One coherent belt lane over shared files; sequential build with gate checkpoints. |
| TASK_04 | Doug + Giddy + Desi | Doug gates+render+isolation; Giddy ADR-0022+migration safety; Desi spec fidelity. |

### Open decisions

- `beltFamily` enum name/values (`COLORED|BLACK|CORAL|RED` vs per-color) — Giddy confirms at build (minimal set that drives the bar).
- Timeline belt default size (legibility at up to 10 marks) — Desi confirms in verify; pick a sensible default at build.

### Risks

- **Shared local DB migration** (`migrate dev` banned) — hand-author + shadow-replay + isolation proof (TASK_01).
- **Read-model plumbing across many surfaces** — mitigate by extending the central rank resolvers once.
- **Full-belt-everywhere** may crowd dense surfaces (filter chips, table rows) — operator's explicit call; Desi flags real breakage in verify.
- **Non-BJJ / unseeded ranks** (eskrima, kajukenbo) have null `beltFamily`/`degree` — component must degrade gracefully.

### Scope guard

- **NO FI-006 lifecycle build this session** (pending-claim rankId → award-on-approval) — teed up next.
- Do **NOT** touch the `RankAward`→`RankEntry` table-drop migration.
- Do **NOT** touch the no-leak technique/community freemium surfaces (out of scope).
- `dot` variant stays as-is (it was never the ugly `bar`).
- FI-001 / Brian Truelson email STAYS PARKED.

### Dirstarter implementation template

- **Docs read first:** ADR 0022 (data-driven belt colors), ADR 0035 (awarded-truth rank display).
- **Baseline pattern to extend:** the existing data-driven `BeltSwatch` + `Rank` model + lineage rank resolvers.
- **Custom delta:** a proper BJJ rank-bar belt shape + a `beltFamily` structured field + one-foundation consolidation.
- **No-bypass proof:** extends `BeltSwatch`/`Rank`; replaces nothing; deletes a redundant variant (net −1 shape).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0539_TASK_01 | landed | `Rank` structured-data foundation — `BeltFamily` enum + populated `degree`; hand-authored additive migration `20260714010000_rank_belt_family` (name-scoped backfill); isolation proven (IBJJF 31/31 family-set, other product DBs untouched) |
| SESSION_0539_TASK_02 | landed | Refined `BeltSwatch` (`variant="belt"`) + `beltBarTreatment` util; full-height wrapped-tape degrees, `size` presets, variable ¾/full bar length, flush seams, non-BJJ no-bar; ugly `bar` variant DELETED |
| SESSION_0539_TASK_03 | landed | Migrated ~16 belt surfaces + extended the rank read-models (`canvas-model`/`to-lineage-visual`/`ancestry`/`payloads`/projections) to carry `beltFamily`/`degree`/`secondaryColorHex`; roster rows stacked |
| SESSION_0539_TASK_04 | landed | Verify wave — Doug **GO 9.7** · Giddy **PASS** · Desi **PASS** + locked-geometry re-verify **PASS** (zero silver bars confirmed live) |

## What landed

A full BJJ belt-rendering redesign on a new `Rank` structured-data foundation — FI-006's lane, with the
claim→award lifecycle itself deferred to next session (this laid the rank data it consumes).

- **`Rank` data foundation.** New `BeltFamily` enum (`COLORED | BLACK | CORAL | RED`) + populated `Rank.degree`
  (0–4 colored stripe grades, 1–6 black, 7–8 coral, 9–10 red) on the IBJJF ladder, via the seed + a
  hand-authored **additive** migration (`20260714010000_rank_belt_family`: `CREATE TYPE` + nullable `ADD COLUMN`
  + name-scoped backfill `UPDATE`s). Disjoint from the in-flight `RankAward`→`RankEntry` table-drop; prod-safe
  (auto-applies via prebuild); isolation empirically proven (IBJJF 31/31 family-set; mammoth/baseline DBs byte-unchanged).
- **Refined `BeltSwatch` (`variant="belt"`).** A proper BJJ rank-bar belt: belt-color body + inset rank bar +
  belt-color tip; **full-height "wrapped athletic-tape" degree marks** (2.9 wide, equal 1:1 tape-to-gap,
  right-anchored, countable to 10); family-driven bar treatment via the ONE `beltBarTreatment` util
  (COLORED→black bar; BLACK→red bar; CORAL/RED→red bar + flush white seams; coral `secondaryColorHex` panels);
  **variable bar length** (¾ for white→6th-black, full for coral/red); **non-BJJ (null family) → no bar** (just
  the belt color — fixes the gray "silver bars"); hairline body border kept (black/white belt visibility). ADR
  0022/0026 intact — belt colors from `colorHex` data, only the bar *treatment* is family-driven design.
- **Consolidation.** The ugly folded-belt-with-knot `bar` variant DELETED; all ~16 usages migrated to the one
  refined belt (`dot` kept for dense swatches); `size` presets (sm/md/lg/full) replaced the ad-hoc `h-*`/`w-*`
  overrides that were letterboxing belts to slivers; dense roster rows (leaf-row, students-carousel) stacked
  name-above-belt so names never truncate; prestige surfaces sized up; filter chips kept compact.

## Decisions resolved

- Design locked over a live-mock loop (published-artifact channel): grade-as-marks model; bar treatment by
  family; belt-color tip; **structured `Rank` data** (not name-parsing — operator's call); coral = alternating
  panels + outlined bar; **belts this session, FI-006 lifecycle next**; full countable belt everywhere; roster =
  name-above-belt stack (not name-on-belt overlay); full-height wrapped-tape marks; hairline borders; variable
  bar length (¾ vs full); flush coral/red seams (not a boxed outline); wider 2.9 marks; equal 1:1 tape/gap;
  non-BJJ ranks render bar-free; keep the hairline belt border.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | +`BeltFamily` enum + `Rank.beltFamily` column |
| `apps/web/prisma/migrations/20260714010000_rank_belt_family/migration.sql` | new — additive (enum + column + name-scoped backfill) |
| `apps/web/prisma/seed-baseline-programs.ts` · `seed.ts` | populate `degree` + `beltFamily` on the IBJJF ladder |
| `apps/web/components/common/belt-swatch.tsx` · `belt-swatch.test.tsx` | the refined `belt` variant + `beltBarTreatment` + presets; `bar` variant deleted; new spec tests |
| `apps/web/components/web/belt/belt-view-model.ts` · `.test.ts` | rank-ref shape carries the belt render fields |
| rank read-models: `lib/lineage/{canvas-model,to-lineage-visual,filter-facets}.ts` · `server/web/lineage/{ancestry,payloads,rank-queries}.ts` · `server/belt/profile-projection.ts` · `server/web/passport/{public-payloads,public-projection}.ts` · `server/web/promotion-events/payloads.ts` · `server/admin/lineage/claim-queries.ts` | thread `{colorHex, secondaryColorHex, degree, beltFamily}` |
| ~16 belt surfaces (lineage cohort-timeline, view-a, drawer, directory profile, passport card, belt-edit, award-card, claim-review, ancestry-entry, students-carousel) | migrate to `variant="belt"` + `size` presets; roster stacking |
| `apps/web/app/styles.css` | removed dead `.belt-shimmer` / keyframes |
| `apps/web/app/(web)/directory/[slug]/_components/directory-profile/ranks-section.tsx` · `lineage-view-a/focus-panel.tsx` | polish: size + stacked-caption fixes (Desi LOW) |
| `apps/web/server/belt/router.integration.test.ts` · `server/web/directory/profile-detail-projection.test.ts` | test-type fixes surfaced by the payload widening |
| `docs/sprints/SESSION_0539.md` | this session record |

## Verification

| Command / check | Result |
| --- | --- |
| `bun run typecheck` (full) | ✅ exit 0 |
| `oxfmt` format:check | ✅ 0 diff |
| `bun run test` (belt/lineage/rank specs) | ✅ belt-swatch 17/17 · full suite 1430/0 (Doug) |
| Affected chromium e2e (lineage/directory) | ✅ 15/15 (1 pre-existing redirect-race flake, isolated 3/3) |
| Migration isolation | ✅ IBJJF 31/31 family-set · 0 non-IBJJF touched · mammoth/baseline DBs unchanged |
| `next build` (final, on the complete diff) | ✅ exit 0 (`.next/BUILD_ID` written) |
| Live re-verify (Desi, `:3009`, light+dark) | ✅ PASS — **0 silver bars** (Brian Scott Kajukenbo bar-free beside BJJ belts; 84-belt explorer clean); geometry faithful; 0 console errors |

## Open decisions / blockers

- **Push authorized; PR opened, merge HELD for the operator.** The PR triggers CI + a preview deploy; the BBL
  prod deploy fires on merge — held per operator (a second gate). `/pr-review-fix` runs on this PR next session.
- Deferred follow-ups routed to ledgers (WL-P3-41/42/43 · D-044) + board card FI-006 — see `Next session`.

## Next session

### Goal

Clean up + harden the belt lane and run the review loops, then start the FI-006 claim→award rank lifecycle —
plus a page/component design pass (spacing, rhythm, type sizing, layout & flow).

### Inputs to read

- This file (`SESSION_0539.md`) · the open PR + its CI/`/pr-review-fix` output · `belt-swatch.tsx` ·
  the deferred-follow-ups list below · ADR 0026 + design-system doctrine (belt-color rule home).

### First task

Run **`/pr-review-fix`** on this session's PR (triage + fix mechanical blockers on the branch), then work the
deferred follow-ups and loops:

1. **`/fallow-fix-loop`** on the belt diff (CRAP/dupes/dead-code/complexity), then **`/code-quality`** on
   `belt-swatch.tsx` (the Class-A custom module).
2. **Apply the hostile-close-review fixes** captured in `## Hostile close review` below (deferred here per operator).
3. **Deferred belt follow-ups** (ledgered: WL-P3-41 · WL-P3-42 · WL-P3-43 · D-044)**:** the light-mode *beltless*-fallback tint (`belt-swatch.tsx:160` — give the
   `!colorHex` fallback an explicit neutral fill instead of theme-following `currentColor`, so an empty belt
   reads consistently on the always-dark cinematic card — Desi LOW); the **ADR 0022→0026** belt-color citation
   (pre-existing repo-wide mis-cite — belt rule lives in ADR 0026 + design-system doctrine, not 0022 "Brand
   Chrome"); the grouped-`{...belt}` vs enumerated-props consumption idiom (Giddy tidy — expose a grouped
   `belt: BeltRenderData` on the ~8 enumerating projections); the `organizations-section.tsx` duplicate-`key`
   React console warning (pre-existing, non-belt — Doug).
4. **Design pass** on the page/component itself: spacing, rhythm, typography *sizing* (not the font), page
   layout & flow across the belt-bearing surfaces.
5. **FI-006 claim→award rank lifecycle:** registration/claim rank picker → pending claim (`rankId` on the claim
   record) → award on approval — now on the structured rank data this session shipped (`getBeltRanks`,
   `RankEntry`, the `BeltFamily`/`degree` fields).
6. **Author a `/preview-artifacts` skill** (operator request, SESSION_0539) — codify the published-HTML-artifact
   review channel that worked this session: two shapes — (a) a live design mock (inline JS/SVG from a data array,
   theme-aware, republish-same-path to iterate) and (b) a screenshot gallery (`sips -Z` downscale → base64-embed
   PNGs into self-contained HTML → Artifact). Use `/write-a-skill`. See the `preview-via-published-artifacts` memory.

## Review log

### SESSION_0539_REVIEW_01 — verify wave (Doug + Giddy + Desi)

- **Reviewed tasks:** SESSION_0539_TASK_01–03.
- **Verdict:** Doug **GO 9.7/10** (full tsc 0, unit 1430/0, e2e 15/15, migration additive + isolated, 3 reported
  suite failures confirmed pre-existing shared-DB flakes) · Giddy **PASS** (ADR 0022/0026 compliant — belt colors
  data-driven, bar treatment family-driven; migration disjoint from the RankEntry table-drop; one-foundation
  consolidation, net −1 variant) · Desi **PASS-WITH-FIXES** (spec-accurate; legibility HIGHs → the operator-locked
  geometry pass).
- **Follow-up:** the locked-geometry re-verify (REVIEW_02); deferred LOWs → next session.

### SESSION_0539_REVIEW_02 — locked-geometry re-verify (Desi)

- **Reviewed:** the operator-locked geometry pass (variable bar length, flush seams, wider 2.9 marks, 1:1
  spacing, non-BJJ no-bar) on `belt-swatch.tsx`.
- **Verdict:** **PASS** — all five deltas faithful; **zero gray/silver bars remain** (verified 3 ways live incl.
  the Brian Scott Kajukenbo side-by-side + an 84-belt explorer scan); 0 console errors light+dark. No fix-list.
- **Follow-up:** one deferred LOW (light-mode beltless-fallback tint) → WL-P3-41, next session.

## Hostile close review

### SESSION_0539_REVIEW_03 — Giddy hostile close (architecture / merge / data-integrity lens)

- **Reviewed tasks:** SESSION_0539_TASK_01–04. **Dirstarter check:** cached sufficient (additive nullable
  column + app-custom presentation component extend repo patterns; no Dirstarter capability's current shape
  load-bearing). **Sources:** the migration SQL, seed, `belt-swatch.tsx`, schema, `git status`.
- **Verdict:** shipped work is clean + honestly verified. Extends `BeltSwatch`/`Rank`, replaces nothing, net
  −1 variant. Migration genuinely additive + isolated from the `RankAward`→`RankEntry` table-drop; backfill
  name-scoped + `shortName`-keyed (5 other rank systems reusing codes provably untouched); **two-writer parity
  clean by construction** (the migration re-derives the seed's values from the trailing digit — cannot drift).
  The "silver bars" were a **data** defect (null `beltFamily` on non-BJJ ranks), now the *designed* null state
  (null → no bar), unit-tested + live-re-verified. No security surface. Real debt is close-hygiene, not code.
- **WORKFLOW 5.0 score: 9.4/10** (no hard cap — Dirstarter aligned · data-integrity additive+parity-clean+isolated
  · verification behavioral · no security surface; −0.6 for the uncommitted-tree risk + the FI-006 headline
  deferral + logged tidy debt). **Kaizen aggregate: 9.0/10 → proceed** to the FI-006 session; carry
  FINDING_01–05 as open follow-ups (operator deferred all fixes to next session).
- **Desi arm:** PASS + re-verify PASS (REVIEW_01/02). **Doug arm:** GO 9.7 (REVIEW_01).

### Findings (severity ≥ medium)

#### SESSION_0539_FINDING_01 — Session uncommitted; migration dir untracked

- **Severity:** high (close-hygiene, not a code defect). **Evidence:** `git status` = 38 `M` +
  `?? …/migrations/20260714010000_rank_belt_family/`; HEAD still `7fc33138`.
- **Impact:** a `git stash` (review subagent) wipes the work; a `git clean` removes the untracked migration.
- **Follow-up:** **RESOLVED at this bow-out** — `git add -A` (stages the migration dir) → checkpoint-commit → push → PR.
- **Status:** addressed (this close).

#### SESSION_0539_FINDING_02 — FI-006 shipped no lifecycle (operator-sanctioned scope-swap)

- **Severity:** medium. The pinned P1 FI-006 card delivered the belt design pass; its `in-progress` board badge
  is stale (no live owner). **Follow-up:** FI-006 claim→award lifecycle = next-session first task (on solid rank
  data); board badge to be corrected. **Status:** open → next session.

#### Low findings (→ ledgers / next-session tidy)

- **F03** backfill keys on `RankSystem.name` string (accepted-risk — graceful bar-less degrade if a product's
  BJJ system is renamed) → **D-044**. **F04** `BAR_NEUTRAL` branch effectively dead (kept as tested type-safety
  fallback) → next tidy pass. **F05** logged doc/idiom drift (ADR 0022→0026 citation → **D-044**; grouped-`{...belt}`
  idiom → **WL-P3-42**; `organizations-section` dup-key → **WL-P3-43**; light-mode beltless tint → **WL-P3-41**).

## ADR / ubiquitous-language check

- **ADR update NOT required (no new ADR).** The belt rendering extends `BeltSwatch`/`Rank` under the existing
  data-driven-belt-color rule (**ADR 0026** + design-system doctrine — NOT ADR 0022 "Brand Chrome Resolution",
  a pre-existing repo-wide mis-citation logged for next session). The additive `beltFamily`/`degree` data is a
  render-layer fact, not a rank-authority change (ADR 0035/0036 untouched).
- **Ubiquitous-language update REQUIRED** — new/clarified terms: **belt family** (COLORED/BLACK/CORAL/RED — the
  bar-treatment axis), **rank bar** (the contrasting tab near the belt tip), **degree marks / stripes** (the
  white wrapped-tape marks; "stripes" for colored 0–4, "degrees" for black+ 1–10). Added to
  `docs/architecture/ubiquitous-language.md`.

## Reflections

- **The belt was a DATA gap as much as a component gap.** `Rank.degree` had existed since SESSION_0493 for
  exactly this rendering but was never populated, so the old `flat-bar` silently showed no marks — and the
  "silver bars" turned out to be non-BJJ (eskrima/kajukenbo) ranks with a null `beltFamily` hitting the neutral
  fallback. The fix was as much seeding + graceful null-handling as SVG geometry. Lesson: when a data-driven
  component "looks empty," suspect the data before the component.
- **The reliable operator-review channel was a published HTML artifact.** Inline widget/image previews (and even
  file attachments) didn't render in the operator's client; the design converged over ~6 tight iterations only
  once each version was published to a stable artifact link the operator could open in a browser. For a
  visual-design loop, ship a viewable artifact, not an inline render.
- **Trust `.next/BUILD_ID`, not the subagent build monitor.** The Cody build "monitor" repeatedly went quiet
  (phantom-stall) while the build had actually finished; the honest signal was checking the OS process +
  `.next/BUILD_ID` freshness directly. Verify the artifact, not the messenger.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | PASS — 4 rows, all `landed` (gate runner Gate 2) |
| JETTY/frontmatter sweep | touched docs updated: `ubiquitous-language.md` (+belt family/rank bar/degree marks), `custom-component-inventory.md` (BeltSwatch row rewritten), `wiki/index.md` (0539 + 0538 gap-fill rows), `wiring-ledger.md` (WL-P3-41/42/43), `drift-register.md` (D-044), new LR `0016`; `last_agent=claude-session-0539` |
| Backlinks/index sweep | LR 0016 pairs_with 0008/0009/0004 + wiki index backlink; SESSION pairs_with 0538 + wiring-ledger |
| Wiki lint | `bun run wiki:lint` → **0 errors / 52 warnings** (all pre-existing) — gate runner Gate 5 |
| Format-fix | 36 code files auto-formatted (gate runner Gate 4) |
| Build | `next build` **PASS** (gate runner Gate 6) + independently exit 0 (`.next/BUILD_ID`) |
| Kaizen reflection | `## Reflections` present (3 notes) |
| Hostile close review | SESSION_0539_REVIEW_03 (Giddy 9.4 workflow / Kaizen 9.0; FINDING_01–05) |
| Code-quality gate (Class-A) | DEFERRED to next session (operator: `/code-quality` on `belt-swatch.tsx` next session, with the fallow loop) |
| Runtime verification (Doug/Desi) | Desi live re-verify PASS (0 silver bars, `:3009`, light+dark); Doug GO 9.7 (unit 1430/0 · e2e 15/15) |
| Review & Recommend | Next session goal + 6 first-tasks written (loops + follow-ups + FI-006 + design pass + `/preview-artifacts`) |
| Memory sweep | new `preview-via-published-artifacts` memory + index pointer |
| Deferral guard | `bun scripts/deferral-guard.ts` — belt follow-ups ledgered (WL-P3-41/42/43 · D-044); next-session process tasks tracked via the `Next session` block |
| Next session unblock check | UNBLOCKED — first task (`/pr-review-fix` on the PR) is doable; PR opened |
| Board cross-off | none flipped — FI-006 stays `in-progress` (belt sub-deliverable landed; claim→award lifecycle deferred); board badge correction noted (FINDING_02) |
| Git hygiene | branch `session-0539-fi006-belts`; `git add -A` (stages the untracked migration dir — FINDING_01); single commit; **push authorized, PR opened, merge HELD**; hash reported at bow-out / see git log |
| Graphify update | nodes=13306 · edges=29845 · communities=1395 (gate runner Gate 7, pre-commit) |

