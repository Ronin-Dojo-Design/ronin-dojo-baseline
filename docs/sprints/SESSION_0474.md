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
| SESSION_0474_TASK_01 | pending | Free render policy: avatar + self-belt + listing |
| SESSION_0474_TASK_02 | pending | Unverified-belt display (highest STATED + badge) |
| SESSION_0474_TASK_03 | pending | `avatar_upload` IP rate-limit bucket |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

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
