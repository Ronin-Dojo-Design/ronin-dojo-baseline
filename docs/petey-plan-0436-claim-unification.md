---
title: "Petey Plan 0436 — E0 claim unification (one Passport-keyed person claim)"
slug: petey-plan-0436-claim-unification
type: petey-plan
status: active
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0436
pairs_with:
  - docs/sprints/SESSION_0436.md
  - docs/architecture/decisions/0023-generic-profile-claim.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0032-social-signin-pending-claim.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0436 — E0 claim unification (one Passport-keyed person claim)

> **Status: DESIGN — awaiting operator approval of ADR 0036 before build.** Architect-subagent
> output (SESSION_0436). Operator decisions: unify PERSON claims (org stays a sibling); unify
> BEFORE Brian Truelson's first real claim email; design produced now via subagent.

## Why

A single human could be claimed through THREE record-types keyed on the *door* not the *identity*:
`LineageClaimRequest` (lineage node, fully built), person `ProfileClaimRequest` (directory page,
approval is a STUB), and the email auto-approve (`LineagePendingClaim` → `claimNodeForUser` →
`finalizeLineageNodeClaim`). Same person, two open claims neither guard could see as one — this is
the "are the two flows aware of each other?" defect (observed with Tony Hua) and the reason a
SESSION_0436 interim already-claimed guard had to be hand-patched onto the lineage door. Passport
is the identity SoT (ADR 0025); both doors already resolve to a `passportId`. Key the claim on
identity and the bug class disappears.

## Decision (to ratify as ADR 0036)

- **New `PassportClaimRequest` keyed on `passportId`** with optional door context
  (`nodeId`/`treeId`/`directoryProfileId`), reusing `LineageClaimStatus`. Recommended over
  extending `LineageClaimRequest` (welded to NOT-NULL tree/node + cohort comp) or generalizing
  `ProfileClaimRequest` (least-built, polymorphic over orgs).
- **Both doors → thin adapters over one core** `submitPassportClaim` (resolve subject → Passport →
  one record; single claimable guard `passport.userId == null` subsumes the interim Gap 1 guard).
- **One finalize** `finalizePassportClaim` (generalize `finalizeLineageNodeClaim`): ALWAYS attaches
  account→Passport + grants entitlement; runs tree-member/NODE_EDITOR/cohort-comp/RankAward
  branches only when node context is present → **un-stubs the directory-person approval**. One
  admin review queue. On finalize, auto-cancel other claimants' open claims on that Passport (Gap 2).
- **Email auto-approve targets the unified record** — `claimNodeForUser` keeps its node
  re-validation + `email-token` semantics but mints a `PassportClaimRequest`; reconcile hook +
  token route unchanged above the core (social-signin parity, ADR 0032, preserved).
- **Org claims stay a separate sibling** in `ProfileClaimRequest` (owner-less Organization is not a
  Passport; approval sets `ownerId`). Only shared surface = a read-only admin-queue view model.

## Phased rollout (gates Brian where noted)

| Phase | Scope | Done-means | Gates Brian? |
| --- | --- | --- | --- |
| P0 Schema | `PassportClaimRequest` table + indexes/FKs (additive) | `db:migrate deploy` green; no read/write yet | — |
| P1 Core + adapters | `submitPassportClaim`; both submit actions become adapters; delete interim guard | both CTAs write `PassportClaimRequest`; guards key on `passportId`; visibility test green | — |
| P2 Finalize + review | `finalizePassportClaim` (node-optional); one review queue; person-stub gone; Gap 2 | admin approves a directory-only person claim → account attaches + entitlement; node door identical to today | **YES** |
| P3 Email path | `claimNodeForUser` mints unified record; reconcile/token/Google unchanged above core | magic-link + Google auto-approve into `PassportClaimRequest`; reconcile + social-signin tests green | **YES** |
| P4 Migrate | idempotent brand-scoped backfill from both legacy tables; preserve Tony APPROVED | re-runnable; counts verified; Tony present + APPROVED | **YES** |
| P5 Retire | cut read/write surfaces to `PassportClaimRequest`; stop writing `LineageClaimRequest` (keep for audit); org `ProfileClaimRequest` retained | no remaining `LineageClaimRequest` writers | — |

**Brian's first real claim email is gated on P2 + P3 + P4 live + verified** (his claim arrives via
the email → reconcile path; it must write the unified record). P5 can follow.

## Risks / do-not-regress

- Visibility allowlist (`server/web/lineage/queries.visibility.test.ts`) — no email/role leak in claim joins.
- Social-signin reconcile (ADR 0032) — Google + magic-link both reconcile; email casing normalized.
- Brand-scope (ADR 0004) — `PassportClaimRequest.brand` NOT NULL, every query BBL-scoped.
- Migration idempotency + Tony's APPROVED history preserved; org `ProfileClaimRequest` untouched.

## Tests

Add: `submit-passport-claim.test.ts`, `finalize-passport-claim.test.ts`, `review-passport-claim.test.ts`,
backfill idempotency test. Keep green: `queries.visibility.test.ts`, `reconcile-pending-claims.test.ts`,
`claim-accept-actions.safe-action.test.ts`, `claim-rank-lifecycle.test.ts`.

## Critical files

- `apps/web/prisma/schema.prisma` — add `PassportClaimRequest` (legacy models at `:2804`/`:2846`/`:2909`, Passport `:1029`)
- `apps/web/server/web/claims/submit-passport-claim.ts` — NEW core
- `apps/web/server/admin/lineage/claim-finalize.ts` — generalize → `finalizePassportClaim`
- `apps/web/server/web/lineage/claim-actions.ts` + `apps/web/server/web/claims/claim-actions.ts` — door adapters
- `apps/web/server/web/lineage/claim-node-for-user.ts` (+ reconcile hook `apps/web/lib/auth.ts:164`) — email path
- `apps/web/server/admin/lineage/claim-review-actions.ts` — one review queue (org branch stays in `server/admin/claims/`)

## ADR 0036 — RATIFIED (SESSION_0436)

Accepted: [`docs/architecture/decisions/0036-unified-passport-claim.md`](architecture/decisions/0036-unified-passport-claim.md).

## Fan-out prompts (one per phase — cloud-prompt or subagent ready)

Each prompt is self-contained for a fresh agent. **Run order: P0 → P1 → (P2 ∥ P3 designable in parallel,
but P3 depends on P2's `finalizePassportClaim`) → P4 → P5.** P2+P3+P4 gate Brian's send. Each agent must:
typecheck clean (`bun run typecheck`), keep the named tests green, NOT push (operator pushes one/ session),
and return a structured report of files changed + verification. Read
[ADR 0036](architecture/decisions/0036-unified-passport-claim.md) + this plan first.

### P0 — Schema (additive)
> Add a `PassportClaimRequest` Prisma model to `apps/web/prisma/schema.prisma` per ADR 0036 §1: keyed on
> `passportId` (NOT NULL, Cascade), optional `nodeId`/`treeId`/`directoryProfileId` (SetNull), reuse
> `LineageClaimStatus` + `ProfileClaimRelationship` enums, fields `bypassReason`/`claimedRankId`/`claimantNote`/
> `reviewerNote`/`reviewedById`/`reviewedAt`/`brand`, indexes `[brand,status]`/`[passportId,status]`/
> `[nodeId,status]`/`[directoryProfileId,status]`/`[claimantUserId,status]`. Add back-relations on Passport,
> LineageNode, LineageTree, DirectoryProfile, User (claimant + reviewer), Rank. Add `PassportClaimEvidence`
> (mirror `LineageClaimEvidence`). Generate the migration (additive only — safe for `db:migrate deploy`). No
> read/write wiring yet. Done: migration applies clean locally; `bun run typecheck` green.

### P1 — Core + door adapters
> Create `apps/web/server/web/claims/submit-passport-claim.ts` (core: resolve subject→Passport, claimable
> guard `passport.userId == null`, duplicate guard on `(claimantUserId, passportId)`, create
> `PassportClaimRequest`). Refactor `submitLineageClaimRequest` (`server/web/lineage/claim-actions.ts`) and the
> PERSON branch of `submitProfileClaimRequest` (`server/web/claims/claim-actions.ts`) into thin adapters over
> the core (lineage keeps tree/node validation then passes `node.passportId` + node/tree context; profile
> resolves `directoryProfile.passportId` + back-fills node/tree if the Passport owns a node). **Delete the
> SESSION_0436 interim already-claimed guard** (now subsumed). Add `submit-passport-claim.test.ts`. Keep
> `queries.visibility.test.ts` green. Org branch untouched.

### P2 — Finalize + review (GATES BRIAN)
> Generalize `finalizeLineageNodeClaim` (`server/admin/lineage/claim-finalize.ts`) → `finalizePassportClaim`:
> ALWAYS attach account→Passport + grant entitlement; run tree-member/NODE_EDITOR/cohort-comp/RankAward
> branches ONLY when `nodeId` present; directory-only person gets attach + brand entitlement (default term or
> `compOverride`). Add Gap 2: on finalize, `UPDATE PassportClaimRequest SET status=CANCELLED WHERE
> passportId=:p AND status IN (PENDING,NEEDS_INFO) AND id != :winner` + audit row. Add `reviewPassportClaim`
> (one review queue; mirror `applyLineageClaimReview`, same emails/audit). Un-stub the person-profile approval
> in `server/admin/claims/claim-review-actions.ts` (org branch stays). Add `finalize-passport-claim.test.ts` +
> `review-passport-claim.test.ts`.

### P3 — Email auto-approve path (GATES BRIAN)
> Make `claimNodeForUser` (`server/web/lineage/claim-node-for-user.ts`) mint a `PassportClaimRequest`
> {status:APPROVED, bypassReason:"email-token"} and call `finalizePassportClaim`, keeping its node
> re-validation. Leave the reconcile hook (`lib/auth.ts:164`), `reconcile-pending-claims.ts`, and
> `acceptLineageClaimByToken` unchanged above the core (social-signin parity, ADR 0032). Keep
> `reconcile-pending-claims.test.ts` + `claim-accept-actions.safe-action.test.ts` green; add an assertion that
> the resulting row is a `PassportClaimRequest`.

### P4 — Migrate (GATES BRIAN)
> Write an idempotent, BBL-scoped backfill script under `apps/web/scripts/` (supervised lane, NOT auto-fleet):
> from every `LineageClaimRequest` → `PassportClaimRequest` (passportId=node.passportId, preserve status incl.
> Tony Hua APPROVED, nodeId/treeId/claimedRankId/bypassReason/reviewed*); from person `ProfileClaimRequest` →
> (passportId=directoryProfile.passportId, directoryProfileId). Org `ProfileClaimRequest` untouched. Dedupe on
> a deterministic key so re-runs are no-ops. Add a backfill idempotency test on a seeded fixture (run twice,
> assert no dupes + APPROVED preserved). Verify counts. Run against prodsnap first, then prod (gated, operator go).

### P5 — Retire (after Brian)
> Cut all read/admin surfaces to `PassportClaimRequest`; stop writing `LineageClaimRequest`. Keep the legacy
> table read-only for audit (drop in a later migration). Org `ProfileClaimRequest` retained.

### E0 tracking board (use the Mammoth AdminKanban — corrected SESSION_0436)

There are TWO boards — use the right one:
- `apps/web/app/admin/task-board/` → BBL `AdminTaskBoard`, backed by `ContentTask` (**content-bound**: every
  task needs a `ContentAtom`). NOT suitable for engineering epics.
- `packages/ui-kit/src/kanban/` → **Mammoth `AdminKanban` (PWCC-007)** — config-driven, brand/content-
  **agnostic** (ADR 0033 D5: board = config + data, zero per-project code). Generic `StageConfig`
  (gate/sla/requires/terminal/intake) + automations (rotting/sla/reminders) + m-card rendering. Persistence
  is a clean **`BoardStore` port** (ADR 0033 D2) — ships `localStorage` + in-memory adapters only.

**Task (small, reusable — not an E0 gate but the E0 visual hub):** implement a **DB-backed `BoardStore`**
(Prisma model behind the existing port) + an engineering `BoardConfig` (stages: Backlog → In Progress →
Review → Done; cards = E0 P0–P6) so E0 (and future epics) show as a real shared Kanban. The durable
cross-agent ledger stays the SESSION file; the AdminKanban is the visualization on top.

## Brian Truelson holding note — operator-approved copy (SESSION_0436)

> Send mechanism TBD next session (no existing no-link template). **Note for wiring:** operator copy says the
> claim invite is "hopefully by tonight" — reconcile with E0-first gating before send (soften the line, or
> expedite Brian on the existing lineage+email claim path decoupled from E0). The lineage line reads
> "Machado / Bill Hosken" (operator wording; historically "Machado / Bob Bass") — confirm at wire-time.

```
Subject: Your Black Belt Legacy profile — we've got you, Brian

Brian,

Thank you for reaching out — and I'm sorry the old site left you staring at a blank where your profile and
certificates should've been. That's exactly the kind of thing we're rebuilding Black Belt Legacy to never do
again.

I want you to know: your place in the lineage is already preserved. You're recorded as a 1st-degree black
belt under Bill Hosken (please let me know if you have been promoted recently, you will be able to add
pictures and edit dates, etc and think about any features you would think might be helpful, we are pulling in
features from beta as we speak constantly) in the line traced back through the Machado / Bill Hosken lineage
— and your promotion history is in the system, not lost.

We're putting the final polish on the part that lets you claim your own profile — sign in, edit it, and see
it live on your page, the way it always should have worked. I didn't want to send you a half-working link, so
I'm holding the claim invite until it's a clean, one-click experience. It's coming shortly, and you'll be the
very first we send it to, hopefully by tonight.

Certificates are on the way too — we're building a proper home for them so your rank shows up digitally and
you can order physical copies, the way you earned it.

Appreciate your patience and your loyalty over the years. More soon.

— Brian Scott
Black Belt Legacy
```
