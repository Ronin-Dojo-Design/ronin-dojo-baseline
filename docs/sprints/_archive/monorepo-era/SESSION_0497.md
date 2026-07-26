---
title: "SESSION 0497 — lineage/profile surface visibility + belt-save P2003 fix"
slug: session-0497
type: session--implement
status: closed
created: 2026-07-04
updated: 2026-07-04
last_agent: claude-session-0497
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0496.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0497 — lineage/profile surface visibility + belt-save P2003 fix

## Date

2026-07-04

## Operator

Brian + claude-session-0497

## Goal

Operator-directed lane (repointed off the "Epic A A0 story model" Next block, which is claimed by
0496-on-Opus). Three coherent items on the lineage/profile surface: (1) fix the live "Could not save
your belt details" bug; (2) resolve operator confusion about the "vertical timeline" — prove it's
already shipped + visible on the directory profile page (no data/code gap); (3) add a "View full
profile" link inside `LineageProfileDrawer` (the discoverability gap that made the timeline feel
missing). Scrollytelling (A0/A2) explicitly deferred to 0496 to avoid collision.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0496.md`
- Carryover: 0496 shipped Epic A opener (StudentsCarousel V2) + BrandSettings prod fix. Its Next block
  (Epic A A0 `LineageStoryScene`) is live on Opus — NOT re-picked. Operator repointed this session to
  the belt bug + lineage/profile surface visibility.

### Branch and worktree

- Branch: `session-0497-lineage-surfaces`
- Worktree: `/Users/brianscott/dev/ronin-0497` (fresh, bootstrapped via `/worktree-setup`)
- Status at bow-in: clean (canonical `main` had only untracked `prod-live-dirty-dozen.jpeg`)
- Current HEAD at bow-in: `789a8664`

### Graphify check

- Graph status: current; stats 16224 nodes / 31939 edges / 2195 communities / 2452 files (canonical).
- Discovery via 2 read-only roster agents (Giddy = lineage/Epic-A wiring audit; Doug = belt-save
  diagnosis) + a read-only prod/prodsnap ancestry-visibility diagnostic.

### Grill outcome

- The "vertical timeline" the operator couldn't find = `LineageAncestryTimeline`, already shipped
  (0493) + mounted on `/directory/[slug]`, PUBLIC, **data-gated** (needs a PUBLIC lineage node + a
  PUBLIC `INSTRUCTOR_STUDENT` up-edge, chain ≥ 2). Verified LIVE on prod for `tony-hua` + `brian-scott`
  (chain length 5) — NOT a data gap. Root of "can't see it" = discoverability (no drawer→profile link).
- "Continue Epic A vertical timeline" ≠ build `LineageStoryScene` (that's 0496). This session = make the
  EXISTING timeline reachable + fix the belt bug.

## Petey plan

### Goal

Fix the belt-save P2003, prove + wire the already-shipped ancestry timeline, add the drawer profile link.

### Tasks

#### SESSION_0497_TASK_01 — Fix "Could not save your belt details" (P2003)

- **Agent:** Cody (inline)
- **What:** The promoter picker fed **LineageNode ids** into the **Passport**-keyed `awardedByPassportId`
  FK → P2003 → swallowed by a bare `catch {}`. Registered-instructor branch had zero coverage.
- **Steps:** key the belt promoter picker by Passport id (`getBeltPromoterOptions`, belt-tab-loader);
  handler verifies promoter Passport + school Org exist → `BAD_REQUEST` not P2003; `toBeltCard` resolves
  a registered promoter's name; surface the real oRPC error in the client catch; +2 integration tests.
- **Done means:** registered-instructor save persists + shows the name; invalid id → BAD_REQUEST; gates green.
- **Depends on:** nothing

#### SESSION_0497_TASK_02 — Prove the vertical timeline is live (visibility, no writes)

- **Agent:** Petey/Doug (read-only)
- **What:** Diagnose why the operator can't see the ancestry timeline. Confirmed it renders LIVE on prod
  for tony-hua + brian-scott — a discoverability gap, not data/code. No prod writes.
- **Done means:** screenshot + prod SSR confirmation delivered to operator; risky data-publish avoided.
- **Depends on:** nothing

#### SESSION_0497_TASK_03 — LineageProfileDrawer "View full profile" link

- **Agent:** Cody (inline)
- **What:** Add a guarded "View full profile →" link to `/directory/[slug]` in the drawer footer
  (gated PUBLIC-visibility + slug present; zero payload change — slug already on the drawer payload).
- **Done means:** link renders for public profiles, suppressed for MEMBERS_ONLY/HIDDEN; gates green.
- **Depends on:** nothing

### Parallelism

Tasks 1 + 3 are disjoint file sets but built inline sequentially (one worktree, no sub-agent tree
conflict). Task 2 is read-only, done first (de-risked Task 2's prod-data work to zero).

### Scope guard

- NO scrollytelling `LineageStoryScene` / A0 / A2 (0496 lane).
- NO prod lineage-data writes (timeline is already live).
- Registered-promoter card display was pre-existing-broken; fixed as part of Task 1, but no broader
  belt read-model refactor.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0497_TASK_01 | landed | Belt-save P2003 fixed (passport-keyed picker + handler guards + name resolution + catch); 19/19 belt integ tests green |
| SESSION_0497_TASK_02 | landed | Timeline proven LIVE on prod (tony-hua + brian-scott, chain 5) — discoverability gap, no writes |
| SESSION_0497_TASK_03 | landed | Drawer "View full profile" link (PUBLIC-gated); typecheck/lint/fmt green |

## What landed

- **Belt-save P2003 fixed** (the operator-reported "Could not save your belt details"): the belt promoter
  picker fed **LineageNode ids** into the **Passport**-keyed `awardedByPassportId` FK → P2003, swallowed by a
  bare `catch {}`. Re-keyed the belt promoter picker by Passport id (`getBeltPromoterOptions`), added handler
  existence guards (promoter Passport + school Org → `BAD_REQUEST`, not a 500), joined `awardedByPassport` so a
  **registered promoter's name now shows** (was `null` → invisible), and surfaced the real oRPC error in the
  client. +2 integration tests on the previously-zero-coverage registered path.
- **Timeline visibility resolved with zero writes:** proved the ancestry vertical timeline is already **LIVE on
  prod** (`/directory/tony-hua`, `/directory/brian-scott`, chain 5). "Can't see it" was **discoverability**, not
  data/code.
- **Drawer "View profile →" link** added to `LineageProfileDrawer` (PUBLIC-gated to `/directory/[slug]`) — the
  actual fix for the missing path from the lineage canvas to the full profile (where the timeline lives).
- Shipped: Doug 9.6 / Giddy SHIP / Desi SHIP; full CI green (Playwright ×3); PR #189 squash-merged
  (`4a9ab8e6`); prod deploy SUCCESS.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/belt/belt-tab-loader.ts` | NEW `getBeltPromoterOptions()` — passport-keyed promoter picker (the fix) |
| `apps/web/server/belt/router.ts` | `updateRankAwardFact` verifies promoter Passport + school Org → `BAD_REQUEST` not P2003 |
| `apps/web/server/belt/queries.ts` | `gateAwardSelect` joins `awardedByPassport`; `toBeltCard.promoterName` resolves the registered name |
| `apps/web/server/belt/schemas.ts` | Clarify `promoter.awardedByPassportId` is a Passport id |
| `apps/web/components/web/belt/belt-edit-form.tsx` | Both catches surface the real oRPC message (was a blanket toast) |
| `apps/web/server/web/lineage/join-options.ts` | Reciprocal do-not-merge guard comment on `getInstructorOptions` |
| `apps/web/components/web/lineage/lineage-profile-drawer/index.tsx` | `ClaimCtaButton` + `DrawerFooter` split; PUBLIC-gated "View profile →" link |
| `apps/web/server/belt/router.integration.test.ts` | +2 tests (registered round-trip + invalid-id → BAD_REQUEST) |
| `docs/sprints/SESSION_0497.md` | This session record |

## Decisions resolved

- Repointed off the SESSION_0496 "Epic A A0" Next block (operator: it's not actually running) to the belt bug +
  lineage/profile visibility lane.
- Belt fix approach = **align the id-spaces** (passport-keyed picker), not a handler-only node→passport
  translation — the latter would have broken the re-save round-trip (the card pre-fills from the passport-id FK).
- `getBeltPromoterOptions` is a **deliberate, do-not-merge** twin of `getInstructorOptions` (Giddy ruling).
- No prod lineage-data writes needed — the timeline was already live.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run test server/belt/router.integration.test.ts` | 19/19 pass (2 new) |
| `bun run test belt-gate + belt-view-model` | 30/30 pass |
| `bun run typecheck` | clean |
| oxlint / oxfmt (touched files) | clean |
| CI (PR #189, `ff146ecd`) | all green incl. Playwright ×3 (belt-journey + lineage/public-visibility) |
| Prod deploy (`4a9ab8e6`) | Vercel SUCCESS |
| Prod SSR smoke `/directory/tony-hua` | 200; "Lineage" section + founder chain rendered |

## Open decisions / blockers

None blocking. Deferred follow-ups (logged): WL-P1-8 (picker re-key wiring fact / do-not-merge),
D-039 (`DrawerFooter.hasClaim` two-source-of-truth smell), Desi P3 footer `p-4→p-6` alignment.

## Next session

### Goal

Open **Epic A — the Lineage Journey scrollytelling** (per `petey-plan-0494` §Epic A): the `LineageStoryScene`
data model (A0) + a `motion/react` scroll scaffold (A2) that turns the existing static ancestry timeline into a
scrolling founder→member story. **Confirmed unclaimed/unstarted** — no worktree, branch, or code anywhere; the
0496 "Epic A on Opus" lane never produced any A0/A2 work (only the A0.5 StudentsCarousel opener landed). No
collision risk.

### First task

Petey: pull `petey-plan-0494` §Epic A into a grillable plan and resolve the A0 forks — `LineageStoryScene` table
shape (rec: 1:1 by `nodeId`), storyboard CRUD depth, the prologue seed (Carlos Sr→Jr→Rorion→Rigan + conditional
bridges), and the motion bake-off (motion/react → Lenis → GSAP). **Migration lane** — hand-author +
`migrate diff` shadow-replay, NEVER `migrate dev` (shared local DB). Then Cody pre-flight → build A0. Standing
alternative if the operator repoints: board P0 FI-001 Brian Truelson onboarding.

## Review log

### SESSION_0497_REVIEW_01 — belt P2003 fix + drawer profile link

- **Reviewed tasks:** SESSION_0497_TASK_01, _02, _03
- **Dirstarter docs check:** not applicable — extends existing custom belt/claim/lineage modules; no baseline layer replaced.
- **Verdict:** Doug 9.6 SHIP (P2003 root-caused at the id-space level, previously-zero-coverage path now tested);
  Giddy SHIP (duplication is a deliberate id-space fork, uncached belt list is correct); Desi SHIP (pre-merge UX
  fixes applied — ghost variant, "View profile" copy parity, single affix).
- **Score:** 9.6/10
- **Follow-up:** WL-P1-8, D-039, Desi P3 padding (all non-blocking).

## Hostile close review

- **Giddy:** pass — SHIP; duplication ruled a correct do-not-merge fork; no ADR conflict (reinforces Passport-SoT); WL/D rows logged.
- **Doug:** pass — SHIP 9.6; gates green; P2003 → BAD_REQUEST guards verified; registered round-trip tested.
- **Desi:** pass — SHIP; P1 button-hierarchy + both P2 copy/affix items fixed before merge; belt promoter round-trip correct.
- **Kaizen aggregate:** 9.6/10 — a clean two-bug kill + a discoverability fix, all gated and merged.

## ADR / ubiquitous-language check

- ADR update **not required** — no architectural decision made/changed; the fix reinforces ADR 0025 (Passport =
  identity SoT) by correctly keying the promoter FK to Passport, and is coherent with ADR 0035 (belt) / 0036 (claim).
- Ubiquitous-language update **not required** — no new domain terms.

## Reflections

- The operator's "I can't see the timeline anywhere" was neither a bug nor a data gap — it was **built,
  merged, and live, just unreachable**. The highest-leverage move was *proving it live* (DB check + prod SSR +
  screenshot) before touching anything, which converted a risky prod-data lane into a zero-write discoverability
  fix. Verify visibility before assuming brokenness.
- The belt P2003 is a textbook **id-space mismatch masked by a bare `catch {}`**: a reused option source
  (`getInstructorOptions`, node-keyed) wrote a node id into a Passport FK. TypeScript couldn't catch it (both
  `string`); only the runtime P2003 surfaced, and the blanket toast hid *which* failure. The fix that mattered
  was aligning the id-spaces (not translating in the handler), because the prefill round-trip also depended on it
  — a handler-only patch would have traded one failure for another. Committing first made the three hostile
  reviews safe from the git-stash-clobber trap.
- Running e2e locally would have tested the *wrong* code (a concurrent session's `:3000` server) and mutated the
  *shared* prodsnap DB — so CI (isolated env, own DB, exact commit) was the correct authority. The 0495 "run
  affected e2e locally" lesson assumes a safe local env; a busy multi-session box isn't one.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0497 frontmatter `status: closed`, `updated: 2026-07-04`, `last_agent: claude-session-0497`; wiki/index + custom-component-inventory rows added |
| Backlinks/index sweep | wiki/index.md SESSION_0497 row added; inventory rows for `getBeltPromoterOptions` + `DrawerFooter`; no new cross-doc `pairs_with` beyond SESSION_0496 |
| Wiki lint | `bun run wiki:lint` → 0 err / 29 warn (all pre-existing, none introduced) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0497_REVIEW_01 (Doug 9.6 / Giddy SHIP / Desi SHIP) |
| Code-quality gate (Class-A) | Belt fix + drawer are custom modules; verified via Doug 9.6 + Giddy hostile pass (SHIP) in lieu of a separate `/code-quality` run |
| Runtime verification (Doug) | CI Playwright ×3 (belt-journey + lineage/public-visibility) green on `ff146ecd`; prod SSR smoke `/directory/tony-hua` 200 |
| Review & Recommend | Next session goal written: yes (Epic A, from `petey-plan-0494` §Epic A) |
| Memory sweep | `belt-picker-id-space-p2003` memory added; timeline-live + Epic-A-unstarted captured |
| Next session unblock check | unblocked — Epic A plan doc exists; first task is a Petey grill (no user input required) |
| Git hygiene | branch `session-0497-lineage-surfaces` (code merged via #189); docs close = single commit — hash reported at bow-out / see git log |
| Graphify update | worktree count nodes=12376 edges=26953 communities=1368 (partial — canonical refresh on next bow-in when main is pulled) |
