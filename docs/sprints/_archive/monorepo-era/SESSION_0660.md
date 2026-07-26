---
title: "SESSION 0660 — auto-claude G-009 Phase-0 instrumentation design spec (continues #277) (overnight auto lane, wave 5/6)"
slug: session-0660
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0660
sprint: S12
lane: bbl
goal_ids:
  - G-009
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
  - docs/product/black-belt-legacy/payout-phase0-instrumentation-spec-draft.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0660 — auto-claude G-009 Phase-0 instrumentation design spec (continues #277) (overnight auto lane, wave 5/6)

> Staged by the SESSION_0635 orchestrator (waves 5+6 — operator-directed continuations of waves 3+4).
> Adopted + closed by the wave-6 autonomous lane. Branch: `auto/session-0660-bbl-payout-phase0`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude G-009 Phase-0 instrumentation design spec (continues #277).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0660_TASK_01 | done | Build-ready design spec for #277's no-regret Phase 0 (entitled-read instrumentation): `docs/product/black-belt-legacy/payout-phase0-instrumentation-spec-draft.md` |

## What landed

Docs-only (design spec — no code, no migrations). The parent /rr (#277,
`research-review-creator-payout-model.md`, read via
`git show origin/auto/session-0651-rr-creator-payout:…` — no merge-after dependency) named ONE
no-regret move: ship Phase 0 (entitled-read instrumentation) first, because it is correct under
every open fork and converts the F4 attribution decision from taste into data. This session turned
that recommendation into a spec a Cody build lane can execute without re-deriving anything:

- **Event model sketch (NOT a migration):** `PremiumReadEvent` — `postId` (FK Cascade),
  `readerUserId` (FK Cascade — the privacy lever), denormalized `authorUserId` (no FK; canon says
  `CommunityPost.author` is User-keyed, so the brief's `authorPassportId?` was corrected to what
  the write path actually has), `entitlementKey` (`LINEAGE_PREMIUM|ELITE|LEGEND`,
  `lib/entitlements/lineage-comp.ts:3-5`), `readDay @db.Date` with
  `@@unique([postId, readerUserId, readDay])` as BOTH the dedupe window and the idempotent-write
  mechanism; indexes for author/period aggregation; retention posture (raw retained until Phase-2
  period snapshots, then prunable).
- **Capture point, cited:** the detail page ONLY —
  `apps/web/app/(web)/posts/[slug]/page.tsx:57-58` (React-`cache`d `getData`,
  `resolveCommunityViewerContext` + `gateCommunityPost`); the feed
  (`posts/page.tsx:94-96`) is explicitly NOT a capture point (cards/rows render excerpt-only —
  `community-post-card.tsx:78`, `community-post-row.tsx:85-87` — no read intent). Seam: one new
  module `server/web/community/read-event.ts` (pure predicate + `after()`-deferred conflict-noop
  write, the proven repo idiom — `privacy/request/_actions.ts:30` etc.), ONE call-site line, plus
  an additive `tier` thread through `CommunityViewerContext` (zero extra queries).
- **Recording predicate:** premium post ∧ signed-in ∧ NOT admin ∧ NOT author-self ∧ paid-tier leg
  entitled — mirrors `isCommunityPostViewerEntitled` (`post-access.ts:71-85`) with the
  admin/author legs excluded (preview and self-reads must not pollute pool math).
- **Privacy posture:** data-minimized schema (ids + day + tier only — no IP/UA/session/duration),
  aggregation-only reads as a standing rule, Cascade deletion composing with the DSR queue, DSR
  EXPORT helper query included.
- **Aggregation queries** for the forks: reads/post/period, view-weighted pool math with the
  largest-remainder rounding note, the F4-deciding concentration query, per-tier mix (F1),
  threshold preview (F2/F7), DSR export.
- **Gates + rollout:** 0639 hand-authored-migration pattern (commit `e5f51f03`; `migrate dev`
  BANNED), `prisma generate` + real-exit-code rules (PL-010), pure-unit + one seamed integration
  test plan, test-hermeticity guard (the live-Resend precedent), ship-dark rollout with a live
  dedupe smoke, `PREMIUM_READ_EVENTS_DISABLED` kill-switch (env.ts-registered, incident-response
  semantics).
- **Fork inheritance table:** all 7 #277 forks stay open; per-fork statement of what Phase-0 data
  contributes to deciding each.

## Verify-first evidence — "no existing view-tracking" (the spec's load-bearing negative)

| Probe | Result (REAL exit codes; run in the worktree) |
| --- | --- |
| `grep "viewCount\|ViewEvent\|PageView\|ReadEvent\|impression\|analytics" apps/web/prisma/schema.prisma` | zero view-tracking hits |
| `grep "^model.*Event" apps/web/prisma/schema.prisma` | BeltTestEvent · StripeWebhookEvent · PromotionEvent · GamificationEventType/Event · Event/EventRegistration — none are view/read tracking |
| `grep -rn "recordView\|trackView\|incrementView\|viewedAt\|lastViewed" apps/web/server apps/web/app` | only `reviewedAt` (claims/rank *review* fields) — false-positive family, no view tracking |
| `grep -in "views\|viewed" apps/web/prisma/schema.prisma` | only claim/rank review relations |
| `model TechniqueProgress` (schema.prisma:4010) | self-reported drill status (`status`, `lastDrilledAt`) — progress, not view tracking |
| Only analytics in repo | server-read Plausible aggregates (`lib/analytics.ts`) — site-level visitors, no per-post/per-member signal |

## Files touched

| File | Change |
| --- | --- |
| `docs/product/black-belt-legacy/payout-phase0-instrumentation-spec-draft.md` | NEW — build-ready G-009 Phase-0 design spec (draft; DRAFT watermark) |
| `docs/sprints/SESSION_0660.md` | adopted + closed |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0660` · `auto/session-0660-bbl-payout-phase0` (exit 0) |
| `git merge-base --is-ancestor origin/main HEAD` | exit 0 (branch based on current main) |
| Docs-only diff — no code/migrations | `git status` shows only the two owned files |

## Proposed ledger edits

> Proposed only — this lane does not write `docs/knowledge/wiki/**` (forbidden paths). For the AM
> merge owner:

- **goals-ledger G-009:** add row pointer — Phase-0 entitled-read instrumentation spec staged,
  build-ready (`docs/product/black-belt-legacy/payout-phase0-instrumentation-spec-draft.md`,
  SESSION_0660, continues #277). Build lane can execute after the §2.4 dedupe sub-fork is
  ratified.

## Open decisions / blockers

- **§2.4 dedupe sub-fork (operator ratification needed pre-build):** one read per
  reader/post/UTC-day (RECOMMENDED — constraint-enforced, race-safe, matches the pool-math unit,
  most private) vs per-session (no durable session key on the read path, multi-device
  double-count, more member data) vs record-every-render (noise). It shapes the unique
  constraint, so it must be decided before the migration is authored.
- Privacy-policy wording line for the new first-party measurement (flagged for operator wording in
  the build-lane PR).

## Residual for AM merge

- Operator ratifies the §2.4 dedupe recommendation, then schedules the Phase-0 build lane
  (est. small: one model + one module + one call-site line + tests, per spec §3/§6).
- goals-ledger G-009 row per "Proposed ledger edits" above.
