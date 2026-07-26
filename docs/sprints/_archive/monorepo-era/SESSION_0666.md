---
title: "SESSION 0666 — auto-claude social-flywheel approval-queue design spec (continues #281/#288) (overnight auto lane, wave 7/8)"
slug: session-0666
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0666
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
  - docs/product/black-belt-legacy/social-flywheel-approval-queue-spec-draft.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0666 — auto-claude social-flywheel approval-queue design spec (continues #281/#288) (overnight auto lane, wave 7/8)

> Staged by the SESSION_0635 orchestrator (waves 7+8 — operator-directed continuations of waves 5+6).
> Adopted + closed by the wave-8 autonomous lane. Branch: `auto/session-0666-bbl-approval-queue`
> (base: main).

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude social-flywheel approval-queue design spec (continues #281/#288).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0666_TASK_01 | done | Build-ready design spec for the wave-4 "approval-queue-first" recommendation: `docs/product/black-belt-legacy/social-flywheel-approval-queue-spec-draft.md` |

## What landed

Docs-only (design spec — no code, no migrations). The wave-4 /rr (#281,
`social-content-flywheel-draft.md` + `research-review-bbl-social-automation.md`, read via
`git show origin/auto/session-0654-rr-bbl-social:…` — no merge-after dependency) set the v1 ground
rule: approval-queue-first, nothing auto-posts. This session turned that into a spec a Cody build
lane can execute without re-deriving anything — the third build-ready spec in the 0660 house style
(#285 read as the format bar):

- **Event capture (E1–E5, canon-verified):** E1 claim-verified converges on
  `finalizePassportClaim` behind 4 approve doors (all enumerated); E2 is the three
  verified-award moments (`mintAssertedRankAward`, `finalizeRankPromotion`,
  `verifyRankEntryInTransaction`) with UNVERIFIED mints explicitly excluded; E3 corrected from
  "technique publishes" to the ONLY runtime editorial act — `applySetTechniqueFeatured`
  (`Technique.isPublished` has **no runtime writer**; seed-controlled); E5 is `upsertPost` with
  dedupe absorbing the no-discrete-publish-transition problem; E4 is a nightly cron following the
  one existing cron pattern (`/api/cron/publish-tools`, `CRON_SECRET` Bearer). Capture =
  post-commit `after()` fire-and-forget + `@@unique([cardType, subjectKey])` conflict-noop
  (in-tx enqueue rejected: a failed statement aborts a Serializable tx — a lost draft is noise, a
  broken claim path is an incident).
- **Consent gate (F2) as schema:** proposed `Passport.allowSocialCelebration Boolean
  @default(false)` — Passport over DirectoryProfile (identity SoT, person-scoped, PassportEditor
  is the ONE editor; accountless placeholders structurally can never consent). Opt-in, default
  OFF, revocation re-checked at approve AND export (auto-REJECT on revoked).
- **Queue model:** `SocialDraft` sketch (cardType enum ×5, subjectKey idempotency, payload JSON
  snapshot, approval-time `renderedSvg` audit snapshot, DRAFT|APPROVED|EXPORTED|REJECTED, audit
  fields, `passportId` Cascade as the privacy lever); retention posture.
- **Surface:** `/app/social-queue` conformed AdminCollection (sibling of `/app/belt-reviews`,
  ref impl `/app/tools`); columns/filters/row-actions (preview/approve/reject/copy-export);
  authz = new `social-queue.manage` key per the matrix's own documented precedent
  (`roles.ts` clientIntake comment), `posts.manage` as the zero-new-keys fallback.
- **Rendering seam:** the 0657 spike graduates to `apps/web/lib/social-cards/` (pure SVG-string
  renderers; palette resolves from `BrandSettings`/`Rank.colorHex` at payload-build time); kept
  separate from the `/api/og` `ImageResponse` seam at v1 (convergence = new fork); kernel
  extraction deferred per ADR 0040 Option B (extract on demand).
- **Build-lane plan:** 4 phases (schema+consent → capture → surface+renderer → milestone cron)
  with per-phase gates, 0639 hand-authored-migration rules, PL-010 real exit codes, hermetic
  tests (Resend-incident caution), `SOCIAL_QUEUE_DISABLED` kill-switch (surface stays up).
- **Forks:** F1–F6 restated NOT decided; F5 enforced in-design (`TECHNIQUE_FEATURED` export
  disabled until ratified); new forks minted: consent-bit home, consent default, authz key,
  OG/social renderer convergence; auto-posting stays a config-shaped later addition.

## Files touched

| File | Change |
| --- | --- |
| `docs/product/black-belt-legacy/social-flywheel-approval-queue-spec-draft.md` | NEW — build-ready design spec (draft, operator ratifies consent model/default) |
| `docs/sprints/SESSION_0666.md` | Adopted (staged → in-progress → closed), evidence + close |

## Verification

Verify-first evidence for every seam cited in the spec (docs-only lane — commands are reads;
all ran with real exit code 0 unless noted):

| Seam / claim in spec | How verified | Evidence (file:line) |
| --- | --- | --- |
| E1 approve doors converge on `finalizePassportClaim` | `grep finalizePassportClaim(` callers + read each site | `claim-node-for-user.ts:234` · `claim-review-actions.ts:117` (drift-guard comment :112-115) · `passport-claim-review-actions.ts:156` (`applyPassportClaimReview:56`, `reviewPassportClaim:340`) |
| E1 email-token path auto-approves + its 2 callers | Read module header + APPROVED writes | `claim-node-for-user.ts:26-29` (callers: `acceptLineageClaimByToken`, `reconcilePendingLineageClaims` from `lib/auth.ts hooks.after`) · APPROVED update/create `:200/:216` |
| E2 verified-award moments | Read `claim-finalize.ts` + `verify-rank-entry-core.ts` | `mintAssertedRankAward` `claim-finalize.ts:222` (VERIFIED :244/:256, create :251) · `finalizeRankPromotion:718` (VERIFIED mint :724, `node.isVerified` flip :739-742) · `verifyRankEntryInTransaction` `verify-rank-entry-core.ts:27` (promote :46-49, audit :63-64) |
| UNVERIFIED mints are NOT events | Read each prod `rankAward.create/upsert` | `belt/router.ts:161-172` (UNVERIFIED self-backfill) · `admin/users/actions.ts:174-181` · `place-lead-core.ts:95-102` (both UNVERIFIED) |
| E3: `Technique.isPublished` has NO runtime writer | `grep -rn "isPublished: true"` across `apps/web/server` — only query filters hit | `schema.prisma:3907` (default false) · filters `techniques/queries.ts:46,92,208,286` · discovery OR `queries.ts:25-27` · the one editorial act `apply-technique.ts:240-273` via `crud-actions.ts:47-58` |
| E5: Post publish rides `upsertPost`, no discrete transition | Read action + model | `admin/posts/actions.ts:9-46` · `schema.prisma:4321-4322` (`status PostStatus @default(Draft)`, `publishedAt`) |
| E4 cron pattern exists | Read `vercel.json` + route | `apps/web/vercel.json:6-11` (`/api/cron/publish-tools`, `0 0 * * *`) · `publish-tools/route.ts:10-14` (`CRON_SECRET` Bearer) · `env.ts:23` |
| `after()` fire-and-forget precedents | Seen in-file this session | `publish-tools/route.ts:36` · `admin/posts/actions.ts:39` |
| Consent-bit home candidates | Read Passport + DirectoryProfile models | `schema.prisma:1069` (Passport; nullable `userId:1097-1098`) · `:1141-1150` (DirectoryProfile `show*` prefs precedent) · placeholder=accountless `admin/users/actions.ts:167-169` |
| AdminCollection frame + queue precedents | Read component + pages | `components/admin/admin-collection.tsx:16-60` · `app/app/tools/page.tsx:7-16` · `app/app/belt-reviews/page.tsx:14-22` (sibling-queue + layout-gate precedent) · claims tables `app/app/claims/*` |
| Authz matrix + "new NEED = new KEY" precedent | Read roles + can() | `server/orpc/permissions.ts:40` · `roles.ts:118+` (`beltReviews` comment :121-125, `clientIntake` :129-137, `posts.manage`, `techniques.manage`) |
| OG seam is a different renderer class | Read route + component dir | `app/api/og/route.tsx:1-31` (`ImageResponse`/`next/og`) · `components/web/og/og-base.tsx` |
| 0657 renderer shapes | `git show origin/auto/session-0657-bbl-og-cards:scripts/prototypes/bbl-og-cards/cards.ts` | 3 renderers + typed inputs + `escapeXml`/`safeBeltColor` + "Prototype literals only" note |
| Sources #281/#285 | `git show origin/auto/session-0654-rr-bbl-social:…` (both docs) · `git show origin/auto/session-0660-bbl-payout-phase0:…` (spec + SESSION close pattern) | Read in full |
| `SocialDraft` does not already exist | `grep "model SocialDraft" schema.prisma` → no hit (exit 1, expected-negative) | schema model list `:2210/:2274/:3202/:3889/:4313/:4366` |
| Worktree/branch guard | `pwd` + `git branch --show-current` before every write | `/Users/brianscott/dev/ronin-0666` · `auto/session-0666-bbl-approval-queue` |

## Proposed ledger edits

(NOT applied — ledgers are forbidden writes for this lane; AM merge owner routes.)

- **Goals ledger — new row (pointer):** "BBL social flywheel — approval-queue build lane" →
  `docs/product/black-belt-legacy/social-flywheel-approval-queue-spec-draft.md` (build-ready
  pending operator ratification of consent model/default + F5 export posture + authz key). Sits
  alongside the #281 flywheel recommendation and the #288 renderer spike as the third leg; the
  0660 payout spec's goals-row (G-009) is the pattern.

## Open decisions / blockers

- **Consent model + default (F2)** — spec recommends explicit opt-in toggle on Passport,
  **default OFF**; the default is baked into the Phase-A migration, so it must be ratified first.
- Consent-bit home (Passport recommended vs DirectoryProfile) — sub-fork, same ratification.
- Authz key: new `social-queue.manage` (recommended) vs existing `posts.manage`.
- F5 instructor-rights posture gates `TECHNIQUE_FEATURED` export (enqueue ships regardless).

## Residual for AM merge

- Operator ratifies the consent default (§2.3) + schedules the build lane (4 phases, §6).
- Route the proposed goals-ledger row above.
- PR carries no merge-after dependency — #281/#288/#285 were read via `git show` as sources.
