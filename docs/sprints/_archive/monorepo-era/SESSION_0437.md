---
title: "SESSION 0437 — E0 claim unification (P0–P4) + admin set-placeholder-avatar"
slug: session-0437
type: session--open
status: closed
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0437
sprint: S43
pairs_with:

  - docs/sprints/SESSION_0436.md
  - docs/petey-plan-0436-claim-unification.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0437 — E0 claim unification (P0–P4) + admin set-placeholder-avatar

## Date

2026-06-23

## Operator

Brian + claude-session-0437

## Goal

Build the unified Passport-keyed person claim (ADR 0036) end-to-end through P4: one
`PassportClaimRequest` record both doors write, one `finalizePassportClaim` (node-optional, un-stubs
the directory-person approval), the email auto-approve path minting the unified record, and an
idempotent BBL-scoped backfill verified against prodsnap. Built **inline as one coherent Cody pass**
(the phases are a strict dependency chain, not disjoint work). In parallel, ship the admin
"set placeholder avatar" path (option A — narrow admin-only action). Brian's real claim invite is
ARMED but stays gated on P2+P3+P4 verifying green and an explicit operator go.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0436.md`
- Carryover: SESSION_0436 diagnosed the two-claim-systems defect, ratified ADR 0036, staged E0
  fan-out prompts in `petey-plan-0436`, and SENT Brian's holding note (Resend `681a8d65…`). This
  session executes E0 P0–P4 and arms (does not auto-send) Brian's real claim invite.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `7b8c26b6`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma, auth, media (storage) |
| Extension or replacement | Extension: claim is BBL-custom domain logic over the Better-Auth/Prisma baseline; admin-avatar extends the media-upload authz seam |
| Why justified | No Dirstarter capability is replaced — claim + lineage are bespoke; ADR 0036 ratified |
| Risk if bypassed | Two divergent claim records keep a person claimable twice; admins still can't fix decapitated placeholder photos |

Live docs checked during planning: Prisma + auth baseline (via ADR 0036 grounding in ADR 0023/0025/0032).

### Grill outcome

3 forks resolved (Petey grill, this session):

- **Execution mode:** E0 P0–P4 built **inline as one coherent Cody pass** (strict dependency chain
  P0→P1→P2→P3→P4 — not disjoint, so no subagent fan-out); only the truly-disjoint TASK_0A runs as a
  parallel subagent. The plan's "fan-out prompts" serve as the inline phase checklist.
- **Session scope:** P0→P4 this session (P4 backfill against **prodsnap only**); P5 retire, the
  Kanban `BoardStore`, and Neon rotation deferred to carryover; Brian's real send ARMED but gated on
  P2+P3+P4 green + explicit operator go (holding note already covers goodwill).
- **TASK_0A authz:** option **(A) narrow** — dedicated `setPassportAvatarAsAdmin` on
  `adminActionClient` + an admin-only bypass branch in `authorizeMediaTarget`; non-admin ownership
  path byte-for-byte unchanged + a test proving it. Option **(B) broad** (generalize the authz fn
  across all media callers) is authored as deferred cloud-prompt specs (TASK_0B), not built.

## Petey plan

### Goal

Land ADR 0036 E0 phases P0–P4 inline + verified locally, plus the admin set-placeholder-avatar path.

### Tasks

#### SESSION_0437_TASK_01 — P0 schema

- **Agent:** Cody (inline)
- **What:** Add `PassportClaimRequest` + `PassportClaimEvidence` models + additive migration.
- **Done means:** migration applies clean locally; `bun run typecheck` green; no read/write wiring.
- **Depends on:** nothing

#### SESSION_0437_TASK_02 — P1 core + door adapters

- **Agent:** Cody (inline)
- **What:** `submitPassportClaim` core; both submit actions → thin adapters; delete SESSION_0436 interim guard.
- **Done means:** both CTAs write `PassportClaimRequest`; guards key on `passportId`; `submit-passport-claim.test.ts` + `queries.visibility.test.ts` green.
- **Depends on:** TASK_01

#### SESSION_0437_TASK_03 — P2 finalize + review (GATES BRIAN)

- **Agent:** Cody (inline)
- **What:** `finalizePassportClaim` (node-optional); one review queue; un-stub directory-person approval; Gap 2 auto-cancel.
- **Done means:** admin approves a directory-only person claim → account attaches + entitlement; node door identical to today; finalize/review tests green; browser-verified.
- **Depends on:** TASK_02

#### SESSION_0437_TASK_04 — P3 email auto-approve path (GATES BRIAN)

- **Agent:** Cody (inline)
- **What:** `claimNodeForUser` mints `PassportClaimRequest{APPROVED,email-token}` + calls `finalizePassportClaim`; reconcile/token/Google unchanged above core.
- **Done means:** magic-link + Google auto-approve into `PassportClaimRequest`; reconcile + social-signin tests green.
- **Depends on:** TASK_03

#### SESSION_0437_TASK_05 — P4 migrate (prodsnap) (GATES BRIAN)

- **Agent:** Cody (inline)
- **What:** idempotent BBL-scoped backfill from both legacy tables; backfill idempotency test; run against **prodsnap only**.
- **Done means:** re-runnable (no dupes); counts verified; Tony Hua present + APPROVED; prod run deferred to gated operator go.
- **Depends on:** TASK_04

#### SESSION_0437_TASK_0A — admin set-placeholder-avatar (option A)

- **Agent:** subagent (parallel — disjoint from E0)
- **What:** `setPassportAvatarAsAdmin` admin action + guarded `authorizeMediaTarget` bypass + admin surface reusing the circle cropper.
- **Done means:** admin can crop+set any placeholder person's avatar; non-admin ownership boundary unchanged (test added); browser-verified if runway allows.
- **Depends on:** nothing

#### SESSION_0437_TASK_0B — author option-B broad-authz cloud specs (deferred build)

- **Agent:** Petey (inline doc)
- **What:** write cloud-prompt/subagent specs to generalize `authorizeMediaTarget` to actor+role across all media callers.
- **Done means:** specs staged in the plan/sprint doc for a later supervised lane; NOT built this session.
- **Depends on:** nothing

### Parallelism

TASK_01→05 are a strict sequential chain (built inline by one Cody pass). TASK_0A is disjoint
(media-authz + admin UI, no overlap with claim files) → runs as a parallel subagent on `main`.
TASK_0B is an inline doc.

### Open decisions

- Brian real-send: gated on P2+P3+P4 green + explicit operator go.
- Prod backfill run + Neon rotation: deferred, operator-gated.

### Risks

- Migration idempotency + Tony Hua's APPROVED history must survive backfill.
- TASK_0A authz extension is security-sensitive — non-admin ownership boundary must not weaken.

### Scope guard

- Do NOT build P5 (retire legacy writers), the Kanban `BoardStore`, or rotate Neon this session.
- Do NOT run the backfill against prod or send Brian's real invite without explicit operator go.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0437_TASK_01 | landed | P0 schema — `PassportClaimRequest`+`PassportClaimEvidence` + additive migration applied to prodsnap; typecheck green |
| SESSION_0437_TASK_02 | landed | P1 core `submitPassportClaim` + both doors→adapters; interim guard deleted; 21 tests green |
| SESSION_0437_TASK_03 | landed | P2 finalize→`finalizePassportClaim` (node-optional) + Gap-2 helper + `reviewPassportClaim` unified review (directory-person un-stub) + tests |
| SESSION_0437_TASK_04 | landed | P3 email path mints `PassportClaimRequest{APPROVED,email-token}` + finalize + Gap-2; accept/reconcile tests updated→green |
| SESSION_0437_TASK_05 | landed | P4 backfill (idempotent, BBL-scoped) + idempotency test; prodsnap run = clean no-op (prod = gated) |
| SESSION_0437_TASK_0A | landed | admin set-placeholder-avatar (A) — new admin action + cropper surface; 18 tests; browser-verify pending |
| SESSION_0437_TASK_0B | landed | option-B broad-authz cloud spec authored (deferred build) — see below |

**Final (P0–P4 + 0A landed):** full claim-area + scripts suite **153 pass / 0 fail**; `bun run typecheck`
green; `oxfmt --check` clean on touched dirs. Prodsnap backfill = clean no-op (0 legacy BBL claims —
Tony Hua's APPROVED history lives only in **prod Neon**, so the real backfill is the gated prod step).

## What landed

- **P0** `PassportClaimRequest` + `PassportClaimEvidence` (additive migration `20260623000000_unified_passport_claim`, applied to prodsnap + resolved).
- **P1** `submitPassportClaim` core; lineage + directory-person doors → thin adapters; SESSION_0436 interim guard deleted.
- **P2** `finalizeLineageNodeClaim` → `finalizePassportClaim` (node-optional); `cancelSiblingPassportClaims` (Gap 2); `reviewPassportClaim` unified admin review (directory-only person now gets a REAL attach — un-stub).
- **P3** `claimNodeForUser` mints `PassportClaimRequest{APPROVED,email-token}` → finalize → Gap 2; reconcile/token/Google unchanged above the core. **This is Brian's path.**
- **P4** `scripts/backfill-passport-claims.ts` (idempotent, BBL-scoped) + idempotency test; prodsnap run = clean no-op.
- **TASK_0A** admin set-placeholder-avatar (option A) — `setPassportAvatarAsAdmin` + guarded `authorizeMediaTarget` bypass + cropper surface on `/admin/lineage/[treeId]`; non-admin boundary test-proven.

## Deferred — TASK_0B: option-B broad-authz (cloud-prompt spec, NOT built this session)

> **Cloud agent / subagent prompt (supervised media lane).** Generalize `authorizeMediaTarget`
> (`apps/web/server/web/media/media-authorization.ts`) from the SESSION_0437 narrow admin-override
> (option A) to a first-class **actor+role** model used by ALL media callers, so admin media
> management is provable at every call site rather than relying on the top-of-function global
> `if (isAdmin(user)) return true`. Steps: (1) thread an explicit `actor: { userId, role }` (or a
> capability token) through `applyWebMediaUpload` + every caller (org/technique/course/promotionEvent/
> passport media); (2) replace the global admin bypass with per-target capability checks
> (`canAdminManage(target, actor)`); (3) keep the non-admin ownership path byte-for-byte; (4) add
> per-caller boundary tests. Security-sensitive — review the removal of the global bypass especially.
> Done: every media caller passes an explicit actor; no implicit global admin short-circuit; all media
> tests green; `bun run typecheck` clean. Run AFTER E0 settles; isolate in its own worktree.

## Fallow health (SESSION_0437)

Repo-wide signal healthy: maintainability **90.8 (good)**, **0 dead files**, avg cyclomatic **2.5**,
duplication **0.6%**. Findings localized to the new E0 code.

**Fixed:** `finalizePassportClaim` was 204 LOC / cyclomatic 27 (HIGH) → **137 LOC / cyclomatic 20**
(HIGH flag cleared) by extracting three single-purpose private helpers (`grantNodeEditorAccess`,
`mintAssertedRankAward`, `grantClaimComp`); behavior identical (153 tests green). Commit `9a5843b1`.

**Triaged — deliberately left:**

- *Staged for P5:* `reviewPassportClaim` / `passportClaimDecision` flagged "unused exports" (consumed
  when P5 wires the admin queue); the 19-line mirror between `passport-claim-review-actions.ts` ↔
  `claim-review-actions.ts` (P5 deletes the lineage one — extracting now is churn).
- *Pre-existing (not introduced this session):* `AdminLineageTreeRow` unused type; the `applyWebMedia*`
  authorize-preamble dup; the 225-line admin-vs-claimant `lineage/[treeId]/page.tsx` clone (inside P5's
  surface — consolidates there).

**Dead-code / dupes:** 0 dead files; dead-exports 10.3% dominated by the staged P5 surface (no genuine
orphans); 1,029 dup lines (0.6%) — actionable claim-side ones are the two P5-staged items, rest is
test-setup boilerplate.

## Open decisions / blockers

- **P5 scope discovery (deferred from this session):** P5 ("retire legacy `LineageClaimRequest`
  writers, cut surfaces to `PassportClaimRequest`") is a **coupled multi-surface migration**, wider
  than the plan one-liner. Once the LAST writer (`server/web/lead/public-actions.ts:356`, the
  "Join the Legacy" lead path) is converted to `submitPassportClaim`, NO new `LineageClaimRequest`
  rows are created — so the admin review queue MUST be repointed in the SAME change or PENDING
  claims become invisible to admins. Surfaces to migrate together:
  - writer: `server/web/lead/public-actions.ts` (the lead-intake claim create) → `submitPassportClaim`.
  - admin queue/detail: `server/admin/lineage/claim-queries.ts` (`findPendingClaims`/`findClaimById`)
    → `passportClaimRequest` (use direct `passport.displayName`; keep `node`/`tree` context).
  - admin UI: `app/admin/lineage/claims/page.tsx`, `[id]/page.tsx`, and `_components/claim-status-actions.tsx`
    (swap `reviewLineageClaim` → `reviewPassportClaim`; adapt the detail shape).
  - claimant UI: `app/app/lineage/claims/page.tsx` + `[id]/page.tsx` (read the unified record).
  - `server/admin/claims/claim-queries.ts` — confirm the person path reads `passportClaimRequest`
    (org stays on `ProfileClaimRequest`).
  - Keep `applyLineageClaimReview` only for any straggler legacy rows until the legacy table is
    dropped in a later migration. **Needs browser verification of BOTH claim queues** → its own
    focused session.
- **Prod backfill + Brian's real send:** gated. Run `scripts/backfill-passport-claims.ts` against
  prod Neon (where Tony Hua's APPROVED + Brian's state live) only after the Neon password rotation;
  then send Brian's claim invite. Operator go required for both.
- **Kanban `BoardStore`** (deferred): DB-backed `BoardStore` + E0 `BoardConfig` as the epic's visual hub.
- **TASK_0A browser verification** pending: admin avatar-set surface at `/admin/lineage/[treeId]`.
- **Neon password rotation** (carryover from SESSION_0436) — still pending.

## Next session

### Goal

Land E0 **P5** (retire legacy `LineageClaimRequest` surfaces) as one coupled, browser-verified change,
then run the gated prod backfill + send Brian's real claim invite.

### First task

`SESSION_0438_TASK_01` — P5 writer + queue + UI repoint (see Open decisions for the exact file set).
Convert the `public-actions.ts` lead-claim writer to `submitPassportClaim`, repoint
`claim-queries.ts` + the admin and claimant claim pages to `PassportClaimRequest` /
`reviewPassportClaim`, keep tests green, and **browser-verify both the admin review queue and the
claimant claim list** before pushing.
