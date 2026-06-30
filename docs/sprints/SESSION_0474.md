---
title: "SESSION 0474 — S2: BBL free-tier render + avatar + rate-limit (parallel track B)"
slug: session-0474
type: session--implement
status: in-progress
created: 2026-06-29
updated: 2026-06-29
last_agent: claude-session-0472
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0472.md
  - docs/sprints/SESSION_0473.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0474 — S2: BBL free-tier render + avatar + rate-limit (parallel track B)

> **⚠️ POST-SESSION CORRECTION (in-session grill).** The `## What landed` / `Decisions` below describe a
> **prefer-verified resolver + a per-award "Unverified" belt badge** keyed off `RankAward.verificationStatus`.
> An operator grill (this session) **reverted that approach** — it contradicted **ADR 0035 §5** (which marks
> `RankAward.verificationStatus` *vestigial, never displayed*) and showed founders (Rigan Machado, Brian Scott)
> as both Verified **and** Unverified. The **shipped model**: belt = highest *awarded* rank by sortOrder
> (`memberTopRank`); verification = the single `node.isVerified` axis (binary Verified/Unverified); Claimable
> removed from the tree (drawer + directory only). Also fixed a pre-existing regression — the honor strip +
> canvas branch read the deprecated `selectedRank` (stale WP-import), mis-ranking Meyer/Casey. Canonical model:
> the [[bbl-verification-claim-display-model]] memory + ADR 0035. The consolidation (one `resolveLineageMemberView`
> resolver, `initials` 4→1) **stands**. TASK_01 (avatar) + TASK_03 (rate-limit) **stand**.

> **PRE-STAGED at SESSION_0472 close.** This is **build slice S2** of the ratified BBL membership epic
> (SESSION_0472 build-sequencing block). It is the **head of parallel track B** (the verification on-ramp) and
> can run **concurrently with SESSION_0473 (S1)** in its own worktree — disjoint files. It unblocks **S3**
> (fresh-member rank-submission door), which renders the pending nodes this slice introduces.

## Date

2026-06-29 (pre-staged; executes next)

## Operator

Brian + claude-session-0474

## Goal

Give the **free tier** its immediate value (D472-15): a free member uploads an **avatar**, declares a
**self-reported belt** (shown with an `unverified` badge), and is **listed under their instructor** — gated
against abuse by an **IP-keyed `avatar_upload` rate-limit** bucket. Lays the render groundwork the
verification on-ramp (S3–S5) builds on.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0472.md` — read **D472-8** (rate-limit reuse) + **D472-15**
  (free-tier value + unverified-belt display) + the **Build sequencing** block.
- Carryover: SESSION_0472 ratified that verification is open to all and free members get immediate value
  (avatar + self-belt + listing). This slice implements the free-tier render + the avatar abuse-control.

### Branch and worktree

- Branch: `session-0474-free-render` (own worktree — parallel-dispatch; run `/worktree-setup` first if fresh)
- Worktree: `../ronin-0474` (or main if run solo)
- Status at bow-in: TBD (verify clean at pickup)

## Petey plan

### Goal

Free-tier render policy (avatar + self-belt + listing) + the `avatar_upload` IP rate-limit, verified on the live DOM.

### Tasks

#### SESSION_0474_TASK_01 — Free-tier render policy: avatar + self-declared belt + listing

- **Agent:** Cody
- **What:** Update the lineage render read-model so the **free** tier renders an **avatar** (today
  `FREE_LINEAGE_LISTING_RENDER_POLICY` has `avatar: false`) and the person stays **listed under their
  instructor**. The full profile (bio/links/rank history/QR/video/cert) stays Premium+.
- **Done means:** a free member shows avatar + name + belt + listing on the card/tree; premium gate unchanged; policy unit tests updated.
- **Depends on:** nothing.

#### SESSION_0474_TASK_02 — Unverified-belt display

- **Agent:** Cody
- **What:** A self-declared belt is `STATED`/`UNVERIFIED`; current-rank display today = highest **VERIFIED**
  award, so an unverified self-belt wouldn't render. Show the highest `STATED` award with an **unverified
  trust badge** when no verified award exists (reuse the existing trust-badge component).
- **Done means:** a free member with only a self-declared belt shows that belt + an `unverified` badge; a verified member is unchanged.
- **Depends on:** TASK_01.

#### SESSION_0474_TASK_03 — `avatar_upload` IP rate-limit bucket

- **Agent:** Cody
- **What:** Add an `avatar_upload` bucket to `lib/rate-limiter.ts` — mirror `evidence_upload` (public,
  **IP-keyed**, fail-closed; e.g. ~10/hour per IP). Call `isRateLimited(await getIP(), "avatar_upload")` in the
  free-avatar upload action.
- **Done means:** free avatar upload is IP-rate-limited; `shouldFailClosed("avatar_upload")` returns true; unit test.
- **Depends on:** TASK_01.

### Reuse targets (files)

- `apps/web/lib/entitlements/lineage-tier-policy.ts` — `FREE_LINEAGE_LISTING_RENDER_POLICY` (flip `avatar` on)
- `apps/web/lib/rate-limiter.ts` — add the `avatar_upload` bucket + `FAIL_CLOSED_BUCKETS` (mirror `evidence_upload`)
- the trust-badge resolver/component (BBL-PROFILE-004) — for the unverified badge
- `apps/web/lib/lineage/rank-progression.ts` — rank display (highest STATED fallback)

### Scope guard

- Don't gate verification behind payment — verification is **open to anyone** (D472-15); this slice only renders
  the unverified state. The actual submission flow is **S3** (next slice).
- Don't touch tiers/Stripe (that's S1 / SESSION_0473) or the Instructor Hub (S6+).

## Cody pre-flight

<!-- Run cody-preflight before code. Prior art: SESSION_0445 `evidence_upload` (the IP-rate-limit pattern to mirror). -->

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0474_TASK_01 | done | Free render policy: avatar flip (`?view=board` cards) + self-belt + listing |
| SESSION_0474_TASK_02 | done | Prefer-verified rank resolver (universal) + root-card unverified belt badge |
| SESSION_0474_TASK_03 | done | `avatar_upload` IP rate-limit bucket (fail-closed) wired into the avatar action |

## What landed

S2 render groundwork for the verification on-ramp, built reuse-first (no new components).
**Petey grilled one open fork before build** — how a self-declared belt is modeled/rendered
(D472-15 wants it visible on submit, ADR 0035 mints the award only on approve). Operator
ratified **Option A**: a self-declared belt is a `RankAward{source: STATED, verificationStatus:
UNVERIFIED}` minted on submit (flips → VERIFIED on approve — a mint-early/verify-late amendment to
ADR 0035, ADR pass deferred to S3/S4); the listing display reads `rankAwardsEarned` with a
**prefer-verified** rule.

- **TASK_01** — flipped `FREE_LINEAGE_LISTING_RENDER_POLICY.features.avatar → true` (school /
  honor-strip avatar stay Premium+). This gates the `?view=board` surfaces (root `LineageNodeCard`
  + compact child rows + mobile list). **Finding:** the *default* public view is the View A timeline
  (`?view=board` is the fallback), and View A does **not** consume the listing policy — it already
  shows avatars to free/anonymous viewers. So free-tier avatar value was already live on the default
  view; this flip brings the board cards into parity.
- **TASK_02** — new `memberShownRankAward` / `memberRankIsUnverified` in `canvas-model.ts`: shown
  belt = highest **VERIFIED/IMPORTED** award, else the highest award overall (a STATED/UNVERIFIED
  self-belt) flagged unverified. **Universal** — View A timeline, board (root + compact rows), and
  mobile all read belt via these, so an unverified self-promotion can never mask a verified rank
  (closes the SESSION_0430 founders-mis-rank class at the source). Payload drops `take: 1` and adds
  `verificationStatus` so the resolver can see >1 award. The explicit belt-level "Unverified" badge
  (reuses `LineageTrustBadge`) renders on the root `LineageNodeCard`; the existing **node** trust
  badge already shows "Unverified" for fresh members on View A / mobile / the root card.
- **TASK_03** — `avatar_upload` bucket (10/h per IP, fail-closed) mirroring `evidence_upload`; called
  at the top of `uploadAndPromotePassportAvatar` (before the passport lookup / R2 write).

## Decisions resolved

- **D474-1 — Self-declared belt = a STATED/UNVERIFIED `RankAward` (operator-ratified Option A).**
  Minted on submit (S3), flips UNVERIFIED→VERIFIED on approve (S4) — mint-early/verify-late, a small
  ADR 0035 amendment (full ADR pass at S3/S4). Display reads `rankAwardsEarned` (keeps the SESSION_0430
  `selectedRankAward` display-decoupling intact); `selectedRankAward` stays the pending-claim pointer.
- **D474-2 — Prefer-verified is the display rule, not a query filter.** Resolved in `canvas-model.ts`
  (JS), not Prisma orderBy (the enum can't express verified-first cleanly). Trusted = VERIFIED or
  IMPORTED; UNVERIFIED/DISPUTED → unverified.
- **D474-3 — Scope boundary:** prefer-verified is universal via `canvas-model`; the *explicit*
  belt-level badge currently lands on the root `LineageNodeCard` only. Compact descendant rows render
  no verification badge (pre-existing); View A / mobile convey unverified via the node trust badge.
  Per-surface explicit belt badges deferred to S3 (revisit with real fresh-member data) — no masking
  is possible today since all awards are VERIFIED/IMPORTED.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/entitlements/lineage-tier-policy.ts` | Free listing policy `avatar: false → true` (TASK_01) |
| `apps/web/lib/entitlements/lineage-tier-policy.test.ts` | Assert free avatar true; school/honor-strip stay false |
| `apps/web/lib/rate-limiter.ts` | +`avatar_upload` bucket (10/h IP) + `FAIL_CLOSED_BUCKETS` entry (TASK_03) |
| `apps/web/lib/rate-limiter.test.ts` | `avatar_upload` in the fail-closed classification |
| `apps/web/server/web/actions/passport-avatar.ts` | IP rate-limit gate before lookup/upload |
| `apps/web/server/web/actions/passport-avatar.safe-action.test.ts` | +rate-limited-path test (blocks before upload) |
| `apps/web/lib/test/safe-action-env.ts` | Shared mock now exports `getIP` (faithful IP for IP-keyed actions) |
| `apps/web/server/web/lineage/payloads.ts` | `rankAwardsEarned`: +`verificationStatus`, drop `take: 1` |
| `apps/web/lib/lineage/canvas-model.ts` | +`memberShownRankAward`/`memberRankIsUnverified` (prefer-verified); belt/label route through them |
| `apps/web/lib/lineage/canvas-model.test.ts` | +5 prefer-verified cases; rich fixture gains `verificationStatus` |
| `apps/web/components/web/lineage/lineage-node-card.tsx` | Root card: belt-level "Unverified" badge (de-duped vs node badge) |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run test` (4 touched files, `--parallel=1`) | **31 pass / 0 fail** (62 expect) |
| `bun run typecheck` (`next typegen && tsc --noEmit`) | clean |
| `oxlint` (touched files) | exit 0 |
| `oxfmt --check` (11 touched files) | all correctly formatted |
| `bun run build` (`next build`) | succeeded (sitemap post-step ran) |
| Live SSR — `?view=board` (anonymous = free) | avatars now render on board cards (TASK_01); 77 verified members show no spurious "Unverified" |
| Live SSR — View A default tree | 200; belts + R2 avatars render; prefer-verified change = no regression (0 spurious unverified across 77) |
| Live positive proof (flip 1 award → UNVERIFIED, revert) | root-card belt path + prefer-verified resolver exercised on real data; reverted to IMPORTED |
| Prefer-verified safety (unit) | unverified self-promotion (higher belt) does NOT mask a VERIFIED lower belt |

## Open decisions / blockers

- None at plan-lock. Self-contained; no operator input required to start (browser-proof on `bbl.local`).

## Next session

### Goal

TBD at bow-out (likely: S3 — fresh-member rank-submission door, which renders these pending nodes).

### First task

TBD at bow-out.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
