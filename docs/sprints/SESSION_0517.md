---
title: "SESSION 0517 - CI/deploy watch and Brian launch gate"
slug: session-0517
type: session--open
status: closed
created: 2026-07-09
updated: 2026-07-09
last_agent: codex-session-0517
sprint: S-launch
pairs_with:

  - docs/sprints/SESSION_0516.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0517 - CI/deploy watch and Brian launch gate

## Date

2026-07-09

## Operator

Brian + codex-session-0517

## Goal

Operator override after bow-in: FI-001/Brian Truelson is blocked until the ledgers are cleared and the site/app is fully working. This session pivots to the ASAP launch blocker: belt-by-belt user profile update UX, including promotion dates, pictures, certificate creation, and certificate download. No prod write, live email send, push, merge, or deploy runs without the operator's explicit word.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0516.md`
- Carryover: SESSION_0516 completed BBL Stripe live pricing, old-price archival, production DB pricing seed, intake-first join routing, dashboard onboarding return, and local gates. Its handoff says to monitor remote CI/e2e and production deploy, then resume the FI-001/Brian launch gate from the board top.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before `SESSION_0517.md` was created
- Current HEAD at bow-in: `3ebeaa62` (`fix: route BBL memberships through intake`)
- Fresh-worktree bootstrap: not needed; this is the canonical checkout and `apps/web/node_modules` is present.
- FS-0024 guard: `pwd` = `/Users/brianscott/dev/ronin-dojo-app`; `origin` = `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Hosting/deploy, payments/monetization, authentication/email-adjacent sign-in flow |
| Extension or replacement | Extension: verify Dirstarter's Vercel/Next deployment, Stripe Checkout/webhook, and auth sign-in patterns while preserving ADR 0030's BBL-specific Stripe account and the BBL claim/onboarding delta. |
| Why justified | BBL needs its own priced lineage membership funnel and first-tester claim flow, but it must still ride the shared deployment, Better Auth, Stripe Checkout, and entitlement spine. |
| Risk if bypassed | A stale deploy, wrong Stripe account, skipped webhook/prebuild proof, or accidental live send could put the first non-admin tester on an unverified path. |

Live docs checked during planning: Dirstarter [Payments](https://dirstarter.com/docs/integrations/payments), [Monetization](https://dirstarter.com/docs/monetization), [Authentication](https://dirstarter.com/docs/authentication), [Postgres Hosting](https://dirstarter.com/docs/database/hosting), plus `docs/knowledge/wiki/dirstarter-docs-inventory.md`.

### BBL SoT set

- Read in the required order: `BBL-SOT-Spec.md`, `SOT-ADR.md`, `PRD.md`, `STORIES.md`, `CUTOVER_CHECKLIST.md`, `GAP_MATRIX.md`.
- Active canon for this lane: the verified lineage graph and claim loop are the north star; BBL membership pricing is governed by SOT-ADR D13; `GAP_MATRIX.md` is useful but known stale and must be re-verified against the live app.

### Backlog intake

- `bun scripts/ledger-backlog.ts`: 67 open items. Top lane remains `G-001` / `FI-001` Brian Truelson first tester.
- `bun scripts/board-backlog.ts --top=10` from `apps/web`: skipped by tool output because the loop-board DB was unreachable. Fallback is the previous session handoff plus ledger rank.
- Open PR source: sandboxed ledger could not reach GitHub, so `gh pr list --state open --limit 20` was run with approved network access and returned no open PRs. `/pr-fix-loop` does not override this lane.

### Graphify check

- Graph status: current; stats at bow-in: 16773 nodes, 33446 edges, 2230 communities, 2568 files tracked.
- Queries used:
  - `main push GitHub Actions production deploy BBL pricing join checkout Brian Truelson FI-001 first tester`
- Files selected from graph:
  - `docs/knowledge/wiki/goals-ledger.md`
  - `docs/petey-plan-0457-operator-gated-lineage.md`
  - `apps/web/scripts/send-bbl-truelson-thankyou.ts`
  - `apps/web/emails/bbl-first-tester-welcome.tsx`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Router and boundary classification

- `agent-systems-map.md` task router classifies this as a clear launch verification lane first, then an operator-gated FI-001 execution lane.
- Matched flows: Doug-style verification for CI/deploy/prod smoke; Petey/Cody inline for Brian send readiness; no subagent fan-out needed at bow-in because the active tasks are sequential and gated.
- Trust boundary: allowed to inspect, plan, dry-run, and verify. Never without explicit operator word: push, merge, deploy, prod write, live Brian email send, `--backfill`, `--grant`, or real `--send`.

### Failure and drift check

- FS-0022: when checking deploys, confirm Vercel build logs still show the prebuild/migrate step if migrations are involved.
- FS-0024: repeat `pwd` + `git remote -v` before any mutating git.
- FS-0026: route migration cache invalidation had deploy-verify pending; production smoke should verify the live `/lineage/join` and dashboard return behavior rather than trusting redirects.
- D-025: media import slug drift is open but not in scope unless this lane touches BBL media import.
- D-041: local S3/MinIO drift is open but not in scope unless this lane touches local uploads.
- No new drift opened during bow-in.

### Grill outcome

- Operator request was bow-in only; there is no standing approval in this turn for live sends, prod writes, push, merge, or deploy.
- Default lane is the SESSION_0516 handoff: remote CI/deploy/prod smoke first, then FI-001/Brian launch gate.
- Board backlog was unavailable, so the previous session handoff and ledger rank are the planning authority for this bow-in.

### Operator override

- Do **not** prepare or send the Brian Truelson email until all ledgers are cleared and the site/app is fully working.
- FI-001 is explicitly blocked by operator direction, even though it remains the ledger P0.
- The active ASAP lane is the belt-by-belt user update/entry UX: users must be able to update belt promotion dates, add pictures, add certificates, create certificates, and download certificates before Brian is invited.
- Clarification: the belt/certificate data is visible, but the edit flow is not usable enough. The immediate problem is UX and mutation access: existing records feel read-only, correction goes to mailto, and the certificate path has no intuitive issue/download flow.

## Petey plan

### Goal

Unblock the belt-by-belt profile update experience enough that a first real BBL tester can maintain rank/promotion history and certificate artifacts in-app.

### Tasks

#### SESSION_0517_TASK_01 - Watch remote CI/deploy and production BBL pricing path

- **Agent:** Codex inline as Doug
- **What:** Check GitHub Actions/Vercel state for `3ebeaa62`, then smoke production BBL pages once the deploy is available.
- **Steps:**
  - Query GitHub Actions/check state for `3ebeaa62`.
  - Inspect deployment state/build logs enough to confirm whether the commit reached production.
  - Smoke `https://blackbeltlegacy.com/` and `/lineage/join` for the ratified `$35/$65/$45` pricing and intake-first behavior.
  - If red, capture failure logs and stop at a fix plan unless the operator asks to implement.
- **Done means:** CI/deploy verdict plus production smoke evidence is recorded in this SESSION file.
- **Depends on:** nothing

#### SESSION_0517_TASK_02 - Reconfirm FI-001 Brian Truelson readiness

- **Agent:** Codex inline as Petey/Cody
- **What:** Re-open the FI-001 artifacts and run only safe readiness checks for the first-tester send.
- **Steps:**
  - Use `send-bbl-truelson-thankyou.ts` and `bbl-first-tester-welcome.tsx` as the code anchors.
  - If needed, render the email with `--dry-run`.
  - If prod credentials are available and the operator accepts prod read/rolled-back verification, run `--verify`; do not persist any row.
  - Record exact prerequisites still needed for a real send.
- **Done means:** Brian send readiness is known, with no live send and no prod mutation.
- **Depends on:** SESSION_0517_TASK_01

#### SESSION_0517_TASK_03 - Present the operator-gated Brian send packet

- **Agent:** Codex inline
- **What:** Give the operator the exact go/no-go sequence for FI-001 after the remote release is known good.
- **Steps:**
  - Summarize CI/deploy/prod smoke.
  - Summarize FI-001 readiness.
  - Present the gated sequence: `--backfill`, real `--send`, post-sign-in `--grant`, Doug verification.
  - Wait for explicit operator authorization before running any gated step.
- **Done means:** Operator has a precise action packet and the session has not crossed a gated boundary.
- **Depends on:** SESSION_0517_TASK_02

#### SESSION_0517_TASK_04 - Discover current belt/certificate UX gaps

- **Agent:** Codex inline as Petey/Cody
- **What:** Trace the current member/profile belt-by-belt surfaces, rank award update paths, media/picture fields, and certificate create/download routes.
- **Steps:**
  - Read the lineage and directory/profile domain hubs before planning the change.
  - Run Graphify queries for belt profile updates, rank awards, certificate creation, and certificate download.
  - Open the exact existing files and tests before editing.
  - Identify the smallest coherent implementation slice that covers promotion date updates, pictures, and certificates without inventing a parallel model.
- **Done means:** Cody pre-flight records the existing components/actions/models and a concrete implementation path.
- **Depends on:** nothing

#### SESSION_0517_TASK_05 - Build belt-by-belt update entries

- **Agent:** Codex inline as Cody
- **What:** Let users/admins update per-belt promotion dates and attach rank/promotion pictures from the existing profile/dashboard path.
- **Steps:**
  - Reuse existing rank award, profile editor, media, and form primitives.
  - Add server validation and persistence through the existing permission/auth boundaries.
  - Add focused tests for date update and picture persistence.
- **Done means:** A belt/rank entry can be edited and verified by tests and, if feasible, browser proof.
- **Depends on:** SESSION_0517_TASK_04

#### SESSION_0517_TASK_06 - Build certificate create/download path

- **Agent:** Codex inline as Cody/Doug
- **What:** Enable certificate creation and download from the belt/profile context using the existing certificate model/admin surface where possible.
- **Steps:**
  - Reuse existing certificate CRUD/issuance code if present.
  - Add or wire a certificate download endpoint/action with appropriate access checks.
  - Add focused tests and browser/API proof for create + download.
- **Done means:** A certificate can be created for a belt/rank entry and downloaded by an authorized user.
- **Depends on:** SESSION_0517_TASK_04

### Parallelism

Sequential for the build lane. Task 04 must complete before implementation. Tasks 05 and 06 may split only if they touch disjoint files after discovery; otherwise keep them inline to avoid duplicating profile/certificate state.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0517_TASK_01 | Codex inline as Doug | Verification-heavy lane over remote CI/deploy/prod smoke. |
| SESSION_0517_TASK_02 | Codex inline as Petey/Cody | Small, stateful readiness pass over known FI-001 files and scripts. |
| SESSION_0517_TASK_03 | Codex inline | Same context should present the gate packet and hold the boundary. |
| SESSION_0517_TASK_04 | Codex inline as Petey/Cody | Needs domain discovery and pre-flight before any code edits. |
| SESSION_0517_TASK_05 | Codex inline as Cody | Clear feature build after discovery. |
| SESSION_0517_TASK_06 | Codex inline as Cody/Doug | Certificate create/download needs implementation plus verification. |

### Open decisions

- Operator has explicitly blocked the Brian email until all ledgers are cleared and the app/site is fully working.
- Decide after discovery whether certificate creation/download belongs in the same PR as belt-date/picture updates or needs a follow-up slice.

### Risks

- Board backlog DB was unreachable at bow-in, so operator-set board ordering could not be read.
- This lane likely touches identity/lineage/certificates/media; the risk is creating a second path instead of reusing the canonical RankAward/Passport/Certificate surfaces.
- `GAP_MATRIX.md` is known stale; live app evidence wins.

### Scope guard

- No Brian email work beyond recording the operator block.
- No price changes, Stripe object changes, DB seed changes, or entitlement policy changes.
- No real Brian send, pending-claim backfill, or lifetime grant.
- No push, merge, deploy, or force-push.
- No unrelated ledger cleanup while building the belt/certificate lane.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, `WORKFLOW_5.0.md`, `program-plan.md`, `agent-systems-map.md`, `failed-steps-log.md`, `drift-register.md`, `goals-ledger.md`, `petey-plan-0457-operator-gated-lineage.md`, Dirstarter alignment URLs above.
- **Baseline pattern to extend:** Dirstarter deployment + Better Auth sign-in + Stripe Checkout/webhook + entitlement lifecycle.
- **Custom delta:** BBL per-brand Stripe account/pricing, intake-first lineage membership funnel, Brian Truelson durable pending-claim and first-tester email.
- **No-bypass proof:** This session verifies the Dirstarter-aligned deploy/payment/auth path before considering the BBL-specific first-tester send, and keeps all prod writes/sends behind the operator gate.

## Cody pre-flight

No code-writing Cody task began in this documentation/architecture session. The next implementation session must run
the relevant `docs/protocols/cody-preflight.md` checks before editing app code.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0517_TASK_01 | superseded | GitHub `main` CI and Playwright E2E were checked green for `fix: route BBL memberships through intake`; Vercel/prod smoke deferred by operator pivot. |
| SESSION_0517_TASK_02 | blocked | FI-001 Brian readiness is blocked by operator direction until ledgers are cleared and the site/app is fully working. |
| SESSION_0517_TASK_03 | blocked | Brian send packet is blocked by operator direction; no email/send prep this session. |
| SESSION_0517_TASK_04 | complete | Traced current belt/certificate/profile surfaces, ran Graphify queries, and consolidated the product direction into the BBL RankEntry architecture and wiring flow. |
| SESSION_0517_TASK_05 | pending | TBD |
| SESSION_0517_TASK_06 | pending | TBD |

## What landed

- Grilled and ratified the RankEntry domain, status model, review flow, custom-rank rules, certificate boundaries, and profile-surface ownership.
- Added the BBL-specific [RankEntry Unified Domain and Data Flow](../product/black-belt-legacy/rank-entry-unified-data-flow.md).
- Rewrote the BBL [Lineage Data and Wiring Flow](../product/black-belt-legacy/lineage-data-wiring-flow.md) as current canon.
- Relocated the lineage wiring flow from the generic SOP folder into the BBL product folder and relinked inbound references.
- Marked ADR 0043 and Petey Plan 0477 superseded for this member rank workflow.
- Confirmed `wiki:lint` at 0 errors / 48 pre-existing warnings; docs-only close gate skipped the app build.

## Decisions resolved

- `RankEntry` is the single generic cross-discipline rank record; “belt” is BJJ-facing UI language.
- `RankEntryStatus` is `PENDING | UNVERIFIED | VERIFIED | DISPUTED`.
- `RankEntryReviewStatus` is only `PENDING | APPROVED | DENIED`, with reasons for new ranks, promoter/school edits, and disputes.
- `/app/profile` is the only authenticated rank-entry write surface; `/me` is retired via redirect; public profiles are read-only projections.
- Brian Truelson email remains blocked until ledgers are cleared and the app is fully working.

## Files touched

| File | Change |
| --- | --- |
| `docs/product/black-belt-legacy/rank-entry-unified-data-flow.md` | New BBL RankEntry architecture, status, review, certificate, and migration spec. |
| `docs/product/black-belt-legacy/lineage-data-wiring-flow.md` | Rewritten current BBL lineage/rank/profile data-flow map and moved into product ownership. |
| `docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md` | Marked superseded by RankEntry canon. |
| `docs/petey-plan-0477-belt-journey-crm-epic.md` | Marked historical/superseded for the rank workflow. |
| `docs/knowledge/wiki/index.md` | Added product-scoped RankEntry and wiring-flow entries. |
| `docs/sprints/SESSION_0517.md` | Recorded the architecture decisions, close evidence, and next implementation lane. |

## Architecture decision record

- `docs/product/black-belt-legacy/lineage-data-wiring-flow.md` was updated as the current canonical BBL lineage/rank data-flow map.
- `docs/product/black-belt-legacy/rank-entry-unified-data-flow.md` records the focused RankEntry architecture and migration target.
- The target is generic `RankEntry` plus `RankEntryReview`; the old `RankAward`/`RankMilestone` split is not to be extended.
- `/app/profile` is the sole authenticated rank-entry write surface; `/me` is retired through redirect; public profiles are read-only projections.

## Verification

| Command / smoke | Result |
| --- | --- |
| `pwd` | `/Users/brianscott/dev/ronin-dojo-app` |
| `git remote -v` | `origin` = `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git` |
| `git branch --show-current` | `main` |
| `git status --short` | Clean before `SESSION_0517.md` was created. |
| `graphify stats` | 16773 nodes, 33446 edges, 2230 communities, 2568 files tracked. |
| `bun scripts/ledger-backlog.ts` | 67 open items; `G-001` / `FI-001` top P0 lane; PR source skipped in sandbox. |
| `bun scripts/board-backlog.ts --top=10` | Could not read loop-board; DB unreachable. |
| `gh pr list --state open --limit 20` | Network-approved live check returned no open PRs. |

## Open decisions / blockers

- Implementation remains: schema migration from `RankAward`/`RankMilestone` to `RankEntry`, unified review mutations, profile UX, and certificate create/download.
- Exact Prisma rename/compatibility strategy and generated certificate renderer remain implementation decisions.
- Brian send, production writes, merge, and deploy remain separately gated; this docs commit does not authorize them.

## Next session

### Goal

Implement the BBL RankEntry vertical slice from the new product canon, starting with the unified member dashboard belt workspace.

### First task

Read the two BBL RankEntry docs, run Cody pre-flight, then map the current Prisma/router/UI seams and implement the first
tested vertical slice for a member editing an existing rank entry on `/app/profile`.

## Review log

- SESSION_0517_TASK_04: architecture/data-flow discovery completed; no app-code review required.
- Docs-only close: no hostile code review or runtime browser verification required.

## Hostile close review

Not applicable for this docs-only architecture session. The close gate found 0 introduced fallow findings and no app-code changes.

## ADR / ubiquitous-language check

ADR 0043 was marked superseded; the new canonical terms and flow are recorded in the BBL RankEntry spec and wiring flow.

## Reflections

- The main product problem was not a missing button; it was a split domain model that made one member concept look like award, milestone, claim, and certificate surfaces.
- Pending higher-rank entries and pending edits to existing entries must be represented differently so a review never lowers the member's active-rank ceiling.
- `/app/profile` already has the right authenticated workspace boundary; retiring `/me` removes a competing editor surface.

## Full close evidence

| Gate | Result |
| --- | --- |
| Task log | PASS (6 task rows; 1 completed architecture task, implementation tasks carried forward) |
| Format-fix | 0 code files; docs-only |
| Wiki lint | PASS: 0 errors / 48 pre-existing formatting warnings |
| Build | Skipped: no `apps/web` changes |
| Graphify | 16803 nodes / 33491 edges / 2249 communities |
| Fallow | 0 introduced findings |
| Hostile review | Not applicable: docs-only |
| Git hygiene | `main`; changes intentionally left uncommitted until explicit commit/push authorization |
| Next session unblock | Unblocked for implementation; Brian email remains operator-blocked |
