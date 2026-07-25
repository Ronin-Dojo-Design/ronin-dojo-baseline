---
title: "SESSION 0688 — BBL celebration-card feeder → social approval-queue's first real feed (auto lane)"
slug: session-0688
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-25
last_agent: claude-session-0688
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0686.md
  - docs/product/black-belt-legacy/social-content-flywheel-draft.md
  - docs/product/black-belt-legacy/social-flywheel-approval-queue-spec-draft.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0688 — BBL celebration-card feeder (auto lane)

> Overnight-orchestrator build lane. DECLARED STACK on 0686 (PR #318): branch
> `auto/session-0688-bbl-og-publish-path` based on 5f2eb3bb, worktree
> `/Users/brianscott/dev/ronin-0688`. **MERGE-AFTER #318.** PR holds at the gate.

## Date

2026-07-24 / 2026-07-25

## Operator

Brian + autonomous lane (orchestrated)

## Goal

Wire the OG celebration-card render path into 0686's social approval-queue as its FIRST real
feed: a VERIFIED belt promotion (`RankEntry`) → ONE DRAFT `SocialQueueItem` whose payload
carries the celebration-card params + the OG-render URL, previewed as a thumbnail on
`/app/social-queue`. Drafts only — 0686's status machine untouched, no PUBLISHED edge, no
auto-fire, no cron.

## What landed

| Piece | Where |
| --- | --- |
| Celebration-card feeder: `enqueueRankPromotionCelebration({ rankEntryId })` — THE explicit trigger seam (server fn for a LATER admin/event-hook wire-up; deliberately no call site exists) + pure `buildRankPromotionCelebrationPayload` + `canEnqueueMemberOptInDraft` (delegates to 0686's `evaluateApprovalConsent` — one consent brain) | `apps/web/server/social-queue/celebration-cards.ts` (NEW) |
| Payload contract (spec §2.4 snapshot): `kind`, `headline`, `card` (name, beltName, `Rank.colorHex` verbatim, UTC-stable date, lineage line via `getLineageAncestryForPassport`), RELATIVE `ogImageUrl` (`/api/og?…` — no environment host baked into the DB), `ctaPath` (`/directory/<slug>` or `/lineage`), caption seeded into `SocialQueueItem.caption` | same |
| Enqueue rules: VERIFIED-only; consent fails closed (placeholder/unclaimed subject → NOTHING generated); public-data floor via `projectPublicPassport` (`showRanks === false` or no public awards → NOTHING); `subjectKey: award:<rankEntryId>` P2002 conflict-noop (a REJECTED item is never resurrected); every write is `status: DRAFT` | same |
| Queue-surface preview: `SocialQueueRow.previewImageUrl` + router extraction (`previewImageUrlOf` — relative `/api/og?` paths ONLY, foreign/absolute payload URLs ship as null) + a Preview thumbnail column (`next/image` `unoptimized`, the `tool-form.tsx` screenshot idiom — img from the EXISTING og route, no new renderer) | `apps/web/server/social-queue/schema.ts`, `apps/web/server/orpc/routers/social-queue.ts`, `apps/web/app/app/social-queue/_components/social-queue-table-columns.tsx` (all additive edits to 0686 files — flagged in the PR body) |
| Hermetic tests: 18 feeder cases (payload correctness incl. belt color/names/og-url params, consent-fail generates nothing, VERIFIED-only, public-data floor, P2002 dedupe, non-P2002 rethrow, DRAFT-only write sweep) + 2 additive router cases (preview URL extraction + foreign-origin refusal) | `apps/web/server/social-queue/celebration-cards.test.ts` (NEW), `apps/web/server/orpc/routers/social-queue.test.ts` |

## Consent interpretation (flagged for Larry / the orchestrator)

The dispatch said "only members whose consent basis passes 0686's check may generate items;
fails closed." Read STRICTLY, `evaluateApprovalConsent` fails EVERY person-centric item while
fork F2 is unratified (`consent-unratified`) — no draft could ever exist and the required
"drafts land in DRAFT" tests would be impossible. This lane therefore gates enqueue on the
STRUCTURAL legs of 0686's check (live + account-claimed subject Passport), delegating to
`evaluateApprovalConsent` itself: `consent-revoked`/`unknown-basis` → nothing is generated;
`consent-unratified` → the DRAFT may exist but cannot be approved (0686's approve handler
re-runs the live check and fails closed until F2 lands — untouched). Revocation is honored at
every later gate, exactly per spec §2.3. If the orchestrator wants the stricter reading, the
gate is one line in `canEnqueueMemberOptInDraft`.

## Nothing publishes (restated)

The feeder writes `status: "DRAFT"` only (pinned by a whole-file write sweep); 0686's
transition map still has NO edge into PUBLISHED; approve still stops at APPROVED. No cron, no
event hook, no router procedure calls the feeder — the wiring of the trigger seam is an
explicit operator/AM decision.

## Proposed ledger edits

*(Shared ledgers are never edited in-lane — the merge owner routes these.)*

1. **Open decision → operator (trigger wiring):** `enqueueRankPromotionCelebration` has NO
   call site by design. Decide where it fires (admin action on RankEntry verify? event hook?
   Phase-D style nightly diff?) — that decision was explicitly reserved to the operator/AM.
2. **Open decision → operator (fork F2, restated from 0686):** until
   `Passport.allowSocialCelebration` (or the ratified mechanism) lands, RANK_PROMOTION drafts
   accumulate in DRAFT and cannot be approved. Consent interpretation above needs a nod.
3. **Renderer graduation (deferred):** the preview renders the EXISTING generic `/api/og`
   OgBase card (title + lineage-line description). The belt-color celebration card
   (#288/#292 prototype, `scripts/prototypes/bbl-og-cards/` — "app code must not import it")
   still needs graduation into `components/web/og/` as its own render path; the payload
   already carries `beltColorHex`/`lineageLine` for it, so graduation is render-side only.
4. **SOP §13 deviation (inherited from 0686):** feeder tests seam the db in-memory — the
   `SocialQueueItem` migration is still UNAPPLIED on the shared local DB until the 0686 merge
   owner applies it. Same follow-up as 0686's: a real-DB integration test can join later.
5. **Browser smoke deferred to the merge owner:** the queue surface shows rows only after the
   0686 migration applies + a draft is enqueued (no seed path exists yet); preview column is
   null-safe so the empty/legacy-payload states render unchanged.

## Verification table

| Gate | Command | REAL_EXIT |
| --- | --- | --- |
| Bootstrap env strip | `grep -v '^RESEND_API_KEY=' … > apps/web/.env` | 0 |
| Bootstrap install | `bun install` | 0 |
| Bootstrap client | `bunx prisma generate` | 0 |
| Feeder tests | `bun test server/social-queue/celebration-cards.test.ts` — 18 pass / 0 fail | 0 |
| Router tests (additive cases) | `bun test server/orpc/routers/social-queue.test.ts` — 23 pass / 0 fail | 0 |
| Transitions tests (consumed, untouched) | `bun test server/social-queue/transitions.test.ts` — 17 pass / 0 fail | 0 |
| Typecheck | `bun run typecheck` (`next typegen && tsc --noEmit`) | 0 |
| Lint | `bun run lint` (oxlint; zero findings in touched files — 37 pre-existing warnings elsewhere) | 0 |
| Format | `bun run format` (oxfmt) → both reflowed test files re-run green | 0 |

Not run in-lane: full `bun run test` (RESEND-stripped env false-fails the live-Resend suites —
the open fix; plus the shared-DB suites), e2e/browser smoke (no rows until the 0686 migration
+ a trigger call exist — deferred to the merge owner, per #5 above).

## Blockers

None. PR holds at the gate, MERGE-AFTER #318.
