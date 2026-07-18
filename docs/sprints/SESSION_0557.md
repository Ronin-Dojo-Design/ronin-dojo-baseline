---
title: "SESSION 0557 — FI-016 community-feed + ancestry polish batch (+ WL-P3-25 verify, WL-P3-26)"
slug: session-0557
type: session--implement
status: in-progress
created: 2026-07-17
updated: 2026-07-17
last_agent: claude-session-0557
sprint: S24
pairs_with:

  - docs/sprints/SESSION_0555.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0557 — FI-016 community-feed + ancestry polish batch (+ WL-P3-25 verify, WL-P3-26)

## Date

2026-07-17

## Operator

Brian + claude-session-0557 (autonomous build lane, staggered fan-out)

## Goal

Land the FI-016 community-feed + ancestry polish batch (SESSION_0493 backlog) in one lane: mobile
style-filter visibility + sticky filter bar, filter-aware hero post-count, create-dialog hints,
native-share capability gating, timeline red-name dark contrast, community image origin-guard
prefix scoping, YouTube id charset validation, bjj-passport-card #000-rank ring visibility, and
bbl-reveal SSR-hidden initial state. Plus: verify WL-P3-25's student-count no-wrap fix (marked done
SESSION_0506) and apply WL-P3-26's V1 StudentsCarousel `w-full min-w-0` width fix per dispatch.
Desi-style consistency pass in-lane after building. Commit and HOLD at push gate.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0555.md`
- Carryover: 0555 closed the Claudex fan-out execution and planned the operator-directed merge wave
  (lanes A→B→C→D→F). That wave is NOT this lane. This session is the parallel-dispatched FI-016
  polish batch; lanes B (admin), C (test-infra), D (emails) are held by other worktrees — their
  files are out of scope here.

### Branch and worktree

- Branch: `session-0557-community-polish`
- Worktree: `/Users/brianscott/dev/ronin-0557` (pre-created off origin/main `09b042c9`)
- Status at bow-in: clean
- Current HEAD at bow-in: `09b042c9`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (polish-only edits to existing custom components) |
| Extension or replacement | Extension: small fixes inside existing community/lineage/profile components |
| Why justified | No new components; conformance + defect fixes on shipped surfaces |
| Risk if bypassed | n/a |

Live docs checked during planning: not applicable (no L1 area behavior change).

### Graphify check

- Graph status: worktree — graphify returns 0 nodes here (graph lives in canonical checkout); per
  opening.md this is "not built here", not "no matches". Skipped; target files are itemized in the
  FI-016 row and located by direct `find`.

### Grill outcome

1 fork resolved at bow-in:

- **WL-P3-26 vs FI-018 freeze:** the wiring ledger says "do NOT touch V1 during the bake-off";
  the dispatch brief explicitly itemizes the WL-P3-26 fix. Dispatch wins (operator-directed lane).
  The fix is layout-containment only (`w-full min-w-0`) — it does not alter the visual comparison
  axis of the bake-off. Tension recorded here for the operator.

### Drift logged

None at bow-in.

## Petey plan

### Goal

One coherent polish lane: every FI-016 itemized fix + WL-P3-25 verification + WL-P3-26, gated and
committed locally, held at push gate.

### Tasks

#### SESSION_0557_TASK_01 — Community feed filter UX (mobile visibility + sticky bar + filter-aware count)

- **Agent:** Cody (inline)
- **What:** style-filter hidden on mobile (`max-sm:hidden`) → visible/sticky mobile filter bar; hero post-count reflects active filter.
- **Steps:** read `community-feed.tsx` + posts page; expose the filter on small screens (sticky bar); make the hero count filter-aware.
- **Done means:** mobile viewport shows the filter; count matches filtered set.
- **Depends on:** nothing

#### SESSION_0557_TASK_02 — Create-dialog hints

- **Agent:** Cody (inline)
- **What:** YouTube/Vimeo-only hint on video field + title max-length counter in `create-community-post-dialog.tsx`.
- **Done means:** hints render; counter tracks title length against schema max.
- **Depends on:** nothing

#### SESSION_0557_TASK_03 — Share + validation hardening

- **Agent:** Cody (inline)
- **What:** hide native-share item when `navigator.share` unsupported (`community-share-menu.tsx`); scope community image origin-guard to `community-posts/` prefix; YouTube id charset validation.
- **Done means:** share item conditional; guard rejects non-prefixed bucket paths; invalid YT ids rejected.
- **Depends on:** nothing

#### SESSION_0557_TASK_04 — Visual polish trio (timeline contrast, passport ring, bbl-reveal SSR)

- **Agent:** Cody (inline)
- **What:** timeline red-name dark-contrast check/fix; `bjj-passport-card` avatar ring invisible for #000 ranks on dark; `bbl-reveal.tsx` SSR-hidden initial state (opacity:0 + whileInView without JS).
- **Done means:** contrast passes on dark; black-belt ring visible on dark; bbl content visible pre-hydration / no-JS.
- **Depends on:** nothing

#### SESSION_0557_TASK_05 — WL-P3-25 verify + WL-P3-26 fix

- **Agent:** Cody (inline)
- **What:** verify the student-count no-wrap fix exists in both carousels (SESSION_0506 claims done); apply `w-full min-w-0` width containment to V1 `students-carousel.tsx` section.
- **Done means:** code inspection confirms no-wrap classes; V1 section can engage overflow-x under `items-start` Stack.
- **Depends on:** nothing

#### SESSION_0557_TASK_06 — Desi consistency pass + gates + visual verify

- **Agent:** Desi (review) + Cody (fixes) + Doug-style gate run, inline
- **What:** Dirstarter L1 reuse / tokens / empty-state consistency pass over the diff; fix findings; run gates; visual verify on worktree `next dev` (non-3000 port).
- **Done means:** typecheck · lint:check · focused tests · format:check (if files added) · `npx next build` all green; screenshots/observations recorded.
- **Depends on:** TASK_01–05

### Parallelism

All build tasks are disjoint files — executed sequentially inline (single lane, one coherent
reviewable diff). No sub-agent fan-out needed.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01–05 | Cody (inline) | Small scoped edits against an itemized brief |
| TASK_06 | Desi/Doug (inline pass) | In-lane consistency + gate verification |

### Open decisions

None — WL-P3-26 fork resolved at bow-in (see Grill outcome).

### Risks

- Shared local DB: no `migrate dev`, no full `bun run test` (CI authoritative; focused single-file tests only).
- Parallel lane 0556 owns technique-graph surfaces tonight — do not touch.
- Browser MCPs may be locked by parallel sessions — fall back to isolated Playwright script if so.

### Scope guard

- Do NOT touch: `emails/*`, `lib/notifications.ts` (Lane D), admin surfaces (Lane B), `lib/email.ts`, `lib/test/*` (Lane C), the 4 ledger docs (Lane A holds them — findings route into THIS file), technique-graph surfaces (lane 0556).
- SKIP: ancestry-walk DB test (Lane C owns test conventions); WL-P2-23 deep-link seam (log, don't build).
- No push / PR / merge / deploy — hold at push gate.

### Dirstarter implementation template

- **Docs read first:** not applicable (no new L1-area capability)
- **Baseline pattern to extend:** existing community/lineage/profile components
- **Custom delta:** defect + polish fixes only
- **No-bypass proof:** no Dirstarter capability replaced

## Cody pre-flight

### Pre-flight: FI-016 batch (all tasks)

#### 1. Existing component scan

- Graphify query used: n/a (worktree graph empty); direct `find` + FI-016 itemized file list
- Found: `components/web/community/*` (feed, create dialog, share menu), `components/web/profile/bjj-passport-card.tsx`, `app/(web)/(home)/bbl/bbl-reveal.tsx`, `components/web/lineage/students-carousel.tsx`, lineage timeline components

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: no — polish edits inside existing components, no new primitives
- Closest L1 pattern: existing component composition retained

#### 3. Composition decision

- Extending existing components only; no new components planned

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (0555 — merge wave is a different lane)
- ADR read: none required (no architectural change)
- Runbook consulted: opening.md fresh-worktree bootstrap section

#### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo -p <non-3000>` from worktree `apps/web` via Bash
- Working directory: `/Users/brianscott/dev/ronin-0557`
- Brand/host for testing: localhost worktree dev server

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0024 (git guard — worktree branch confirmed), fresh-worktree bootstrap trap (LR 0007) — bootstrap run before gates
- Mitigation acknowledged: no full `bun test` (shared DB); `bun run lint` writes files — use `lint:check`

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0557_TASK_01 | landed (verified pre-existing) | Mobile sticky bar (0495 C1-1, `Sticky mobile` in `FeedFilterBar`), mobile-visible style facet (C1-2), filter-aware `ResultsCount` under the bar (C1-4 — hero deliberately shows the TOTAL; resolved-by-design). No code change needed. |
| SESSION_0557_TASK_02 | landed (verified pre-existing) | C1-6 video hint + C1-7 title remaining-chars counter both present in `create-community-post-dialog.tsx`. No code change needed. |
| SESSION_0557_TASK_03 | landed (verified pre-existing) | C1-8 `canNativeShare` mount-gate in `community-share-menu.tsx`; C1-11 `YOUTUBE_ID` charset regex in `lib/video-embed.ts`; C1-11 `community-posts/` prefix scoping in `server/web/community/media-url.ts` (base-relative, MinIO-safe). No code change needed. |
| SESSION_0557_TASK_04 | landed (verified pre-existing) | Timeline red-name: 0495 C1-9 contrast token fix (6.27:1) then SUPERSEDED at 0525 — names are `text-foreground` (red dropped, operator call). Passport ring: C2-9 unconditional `outline outline-border/60` under the `--rank-color` ring. bbl-reveal: C2-10 `initial={false}` + `whileInView` keyframes (SSR-visible). No code change needed. |
| SESSION_0557_TASK_05 | landed | WL-P3-25 count no-wrap VERIFIED in both carousels (V1:86-87, V2:118-119 — `min-w-0 truncate` label + `shrink-0 whitespace-nowrap` count; SESSION_0506 claim holds). WL-P3-26 FIXED: V1 `students-carousel.tsx` section now `w-full min-w-0` (mirrors V2's load-bearing fix, comment included). |
| SESSION_0557_TASK_06 | in-progress | Desi pass dispatched; gates + visual verify pending. |

### Verification finding — FI-016 row is stale (route-to-SOT at merge)

Every itemized FI-016 fix already landed on origin/main: SESSION_0495 executed the SESSION_0493
backlog as its C1/C2 list (C1-1/2/4/6/7/8/9/11, C2-9/10), and SESSION_0525 superseded the red-name
item entirely (`text-foreground`). The POST_LAUNCH_SOT FI-016 row was never flipped. **This lane
does not edit the SOT/ledger docs (held by the merge-wave lanes)** — whoever merges this branch
should flip FI-016 → resolved (evidence: this file's Task log) and update WL-P3-26 → resolved.
WL-P2-23 (ancestor deep-link seam) remains open by design — logged, not built (per dispatch).
Ancestry-walk DB test skipped — Lane C owns test conventions.

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/students-carousel.tsx` | WL-P3-26: `w-full min-w-0` on the V1 section (containment; mirrors V2's load-bearing fix) |
| `apps/web/components/web/community/community-premium.tsx` | NEW — `UPGRADE_HREF` + `CommunityPremiumBadge` + `CommunityUnlockButton` (Desi P2 DRY; directive-free for server+client trees) |
| `apps/web/components/web/ui/feed-filter-bar.tsx` | Desi P1: `role="tablist"/"tab"/aria-selected` → `role="group"` + `aria-pressed` (filters, not tabs; both feeds) |
| `apps/web/components/web/community/community-feed.tsx` | `aria-label` on the style DataSelect; focus-visible ring on clear-filters |
| `apps/web/components/web/community/community-post-card.tsx` | Consume shared premium components; `sizes` on the grid image |
| `apps/web/components/web/community/community-post-row.tsx` | Video-thumbnail fallback + row-scale play scrim (list/grid media parity); shared premium components |
| `apps/web/components/web/community/create-community-post-dialog.tsx` | Shared `UPGRADE_HREF`; content-field live countdown under 100 left (`chars_left`) |
| `apps/web/app/(web)/posts/page.tsx` | `bg-gradient-to-br` → `bg-linear-to-br` (v4 idiom unification) |
| `apps/web/app/(web)/posts/[slug]/page.tsx` | Consume shared `UPGRADE_HREF` + `CommunityPremiumBadge` (4th hand-copy removed) |
| `apps/web/messages/en/community.json` | `filter_by_style` added; `title_hint` → generic `chars_left` (en-only, rename-safe) |
| `apps/web/components/web/lineage/students-carousel-v2.tsx` | Comment-only: verified chip bound to Badge `success` recipe (V2 frozen for FI-018 bake-off) |
| `docs/sprints/SESSION_0557.md` | NEW — this session file |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.

## Review log

### SESSION_0557_REVIEW_01 — Desi in-lane consistency pass

- **Reviewed tasks:** SESSION_0557_TASK_01–05 surfaces (12 files)
- **Dirstarter docs check:** cached docs sufficient (no L1 API change)
- **Verdict:** surfaces in strong shape; all SESSION_0495 C1/C2 fixes verified holding with
  file:line evidence. One P1 (FeedFilterBar ARIA-tabs contract break — announced tabs, behaved as
  filter buttons), 3 P2s (list-density video-thumbnail parity gap; premium-lock/unlock-CTA/
  `UPGRADE_HREF` hand-copied ×4; unlabeled style DataSelect), 6 P3s.
- **Fixed in-lane:** P1 → `role="group"` + `aria-pressed` (the grid/list-toggle idiom; e2e greps
  confirm no spec selects the feed bar by tab role). P2s → row now falls back to
  `toVideoThumbnailUrl` with a row-scale play scrim; NEW `community-premium.tsx`
  (`UPGRADE_HREF` + `CommunityPremiumBadge` + `CommunityUnlockButton`, directive-free) consumed by
  card/row/detail/composer; style select gained `aria-label` + `filter_by_style` key. P3s →
  `bg-linear-to-br` unification on /posts hero; content-field live countdown under 100 chars left
  (`title_hint`→generic `chars_left` key, en-only locale so rename-safe); focus-visible ring on
  clear-filters; `sizes` on the grid card image; V2 verified-chip comment binding it to the Badge
  `success` recipe (comment-only — V2 frozen for the FI-018 bake-off).
- **Logged, NOT fixed (rationale):** V1 bare count → pluralized label (visible-copy change on the
  FI-018 frozen baseline — deferred to the bake-off winner lane, unlike WL-P3-26's invisible
  containment fix); locked-teaser share retention (product call — sharing a locked teaser is
  funnel-positive; operator/Petey to rule); `tablistLabel` prop name now slightly stale for a
  `role="group"` (kept — renaming churns the blog consumer for zero user value).
- **Score:** 8.5/10 pre-fixes; the P1 was real (shipped on both feeds).
- **Follow-up:** the two logged product/copy items above.

## Hostile close review

## ADR / ubiquitous-language check

- ADR update TBD at bow-out.
- Ubiquitous language update TBD at bow-out.

## Reflections

## Full close evidence

| Step | Proof |
| --- | --- |
