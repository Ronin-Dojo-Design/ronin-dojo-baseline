---
title: "SESSION 0542 — interrupted-close recovery + belt-review integrity remediation"
slug: session-0542
type: session--implement
status: closed
created: 2026-07-15
updated: 2026-07-16
last_agent: codex-session-0542
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0538.md
  - docs/sprints/SESSION_0540.md
  - docs/sprints/SESSION_0541.md
  - docs/knowledge/wiki/drift-register.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/architecture/decisions/0047-promoter-as-placeholder-recruited-coach-identity.md
  - docs/protocols/failed-steps-log.md
  - docs/runbooks/dev-environment/verification-and-testing.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0542 — interrupted-close recovery + belt-review integrity remediation

## Date

2026-07-15–16

## Operator

Brian + codex-session-0542

## Goal

Recover the interrupted SESSION_0541 without losing or overstating its five committed changes, resolve the
promoter-change review semantics against the canonical domain docs, remediate the verified
data-integrity/server-boundary/AdminCollection findings, and produce full code plus mobile visual evidence.
Hold at the explicit per-push authorization gate.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0541.md`.
- Carryover: SESSION_0541 landed five clean commits on `session-0541-belt-followups`, then Claude hit its
  session limit during the parallel release/architecture/design verify wave. Giddy and Desi returned
  actionable findings; Doug did not return. No uncommitted source work was lost.

### Branch and worktree

- Branch: `session-0542-belt-review-remediation`, created directly from
  `session-0541-belt-followups` at `031b73fa`.
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`.
- Status at bow-in: clean committed tree; canonical `main` left unchanged at `917ee15b`.
- Current HEAD at bow-in: `031b73fa`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma transaction/review state, Auth/Server Actions, and AdminCollection UI |
| Extension or replacement | Extension: harden the landed BBL belt-review lane using existing transaction, permission, and collection patterns |
| Why justified | Credential provenance and irreversible moderation require atomic state changes and inspect-before-decide UX |
| Risk if bypassed | False coach/Lead association, stale or contradictory review outcomes, and blind credential verification |

Live docs checked during planning: not applicable; no purchased L1 capability is being replaced. Local Prisma,
auth, ADR 0045, ADR 0047, and BBL lineage wiring sources are the governing references.

### Graphify check

- Graph status: current; stats at bow-in: 17,308 nodes, 33,940 edges, 2,277 communities, 2,655 files tracked.
- Query used: `RankEntryReview PROMOTER_CHANGED promoter placeholder belt review`.
- Files selected from graph and then opened directly:
  - `apps/web/server/identity/promoter-placeholder.ts`
  - `apps/web/server/web/promoter-lead/emit-promoter-lead.ts`
  - `apps/web/server/admin/rank-reviews/**`
  - `apps/web/app/app/belt-reviews/**`
- Verification note: Graphify supplied navigation only; every finding was confirmed against exact source and
  canonical docs.

### Grill outcome

- The operator approved closing SESSION_0541 as an interrupted session and opening SESSION_0542 from its five
  committed changes.
- D-046 locked to the pending-proposal model: promoter A remains active; established promoter B is immutable
  pending evidence; approval atomically applies + verifies B; denial leaves A untouched. ADR 0047's distinct
  free-typed recruited-coach path remains UNVERIFIED/no-review.
- One pending proposal is allowed per RankEntry. An exact-target retry is idempotent; a different member edit is
  rejected until approval/denial. No SUPERSEDED state and no multiple approvable proposals.
- Ordinary admin promoter edits are blocked while a member proposal is pending. A separate explicit override may
  atomically deny the proposal, apply the admin correction, and audit both consequences.

### Drift logged

- SESSION_0538 and SESSION_0540 contained full close evidence but retained `status: in-progress`;
  SESSION_0542 repairs those stale frontmatter values and records separate incident rows.
- The lineage wiring doc's proposal/apply-on-approval model conflicts with the SESSION_0540 immediate-mutation
  implementation. This is a product-model decision, not a mechanical fix.

## Petey plan

### Goal

Lock one promoter-change review model, then close the smallest integrity, server-boundary, UX, documentation,
and proof set needed to make the five SESSION_0541 commits release-ready.

### Tasks

#### SESSION_0542_TASK_01 — recover the interrupted close and establish the clean continuation

- **Agent:** Codex/Petey
- **What:** inventory all worktrees and session records; preserve the unique 0541 commits; repair stale 0538,
  0540, and 0541 close metadata; log incidents; create the 0542 branch/session.
- **Steps:**
  1. Prove worktree cleanliness, ancestry, highest session number, and unique commit set.
  2. Backfill honest 0541 outcomes and partial review verdicts.
  3. Repair the wiki index and incident log, then validate documentation gates.
- **Done means:** one clean recovery commit on the 0542 branch with no source behavior change and no push.
- **Depends on:** operator approval — received.

#### SESSION_0542_TASK_02 — close data-integrity and server-boundary findings

- **Agent:** Cody → Doug
- **What:** test-first remediation for strict normalized coach identity, paired Lead coherence, server-only
  transaction helpers, and atomic/stale-safe review decisions under the operator-ratified review model.
- **Steps:**
  1. Add adversarial matcher, rollback, wrong-reason, stale-proposal, and concurrent-decision tests.
  2. Move transaction-only verification logic behind an `import "server-only"` core boundary.
  3. Implement the minimum persistence/action delta implied by the promoter-change decision.
- **Done means:** focused tests prove one coherent Passport/Lead association and exactly one coherent review
  outcome; no client-callable transaction helper remains.
- **Depends on:** the remaining grill decision.

#### SESSION_0542_TASK_03 — align the queue, ratify docs, and prove the release

- **Agent:** Cody → Desi → Giddy → Doug
- **What:** align G-010 to the established AdminCollection inspect-before-decide law, update ADR/domain docs,
  capture desktop/mobile proof, run the full gate and hostile-close waves, then hold before push.
- **Steps:**
  1. Link list member rows to a review detail; put confirmation and canonical approve/deny actions there.
  2. Remove the constant reason column and residual noncanonical terminology.
  3. Update ADR 0047 and the lineage wiring flow to one model.
  4. Run focused/full gates and publish visual proof for the join picker and review workflow.
- **Done means:** Desi/Giddy/Doug verdicts are complete, documentation and behavior agree, gates are green, and
  the branch is held for the operator's explicit push authorization.
- **Depends on:** SESSION_0542_TASK_02.

### Parallelism

Read-only audits may run in parallel. Code and docs remain sequential after the domain decision because the
schema/action/UI/doc changes encode one shared review model.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0542_TASK_01 | Codex/Petey | Recovery and governance ownership |
| SESSION_0542_TASK_02 | Cody → Doug | Test-first moat/data-integrity remediation and adversarial verification |
| SESSION_0542_TASK_03 | Cody → Desi/Giddy/Doug | UI conformance, architecture closure, and release proof |

### Open decisions

None. The proposal, one-pending, and explicit-admin-override rules are locked.

### Risks

- The chosen model may require an additive proposal snapshot on `RankEntryReview`; mutating actions before
  locking that decision would create another semantic fork.
- The non-disposable local prodsnap must be backed up and inventoried before any migration; browser fixtures
  belong only in the separate disposable E2E database.
- The branch contains unique unpushed work. Do not delete either the branch or the original 0541 worktree.

### Scope guard

- No source-code edits before the promoter-change semantics are locked.
- No unrelated RankAward-retirement work, broad AdminCollection abstraction, nav-badge pattern, or CRM expansion.
- No push, merge, deploy, or branch deletion without the operator's separate explicit authorization.
- `../ronin-dojo-monorepo` remains read-only.

### Dirstarter implementation template

- **Docs read first:** local Prisma/Auth/AdminCollection baselines plus ADR 0045/0047 and BBL lineage wiring.
- **Baseline pattern to extend:** authenticated server action → transaction core; AdminCollection row → detail →
  canonical action/editor.
- **Custom delta:** recruited-coach provenance proposal and approval semantics.
- **No-bypass proof:** actions retain `belt.admin`, transaction cores are server-only, and the UI composes
  existing collection/link/dialog primitives.

## Cody pre-flight

### Pre-flight: immutable promoter proposal + atomic review transitions

#### 1. Existing component and seam scan

- Graphify query used: `RankEntryReview PROMOTER_CHANGED promoter placeholder belt review`.
- Found: `updateRankAwardFact` / `updateRankAwardFactAsAdmin`,
  `decideBackfillTrust`, `syncRankEntryFromAward`, `verifyRankEntryInTransaction`,
  `AdminCollection`, `DataTableLink`, shared Dialog primitives, and the `/app/claims/[id]` detail precedent.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes (cached baseline sufficient).
- Consulted live alignment URLs: not applicable; no L1 package API is changing.
- Closest L1 pattern: authenticated server action/procedure → one database transaction; route layout permission
  guard; Server Component detail page with a narrow Client Component action island.
- Primitive API spot-check: `AdminCollection` stays the list kernel; `DataTableLink` owns row navigation;
  existing `Dialog`/Button primitives provide irreversible confirmation.

#### 3. Composition decision

- Extending existing components: `AdminCollection`, `DataTableLink`, `BeltSwatch`, Dialog primitives.
- Adding only a route-local belt-review detail/actions composition; no new shared preset or god-component.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADRs read: ADR 0045 and ADR 0047.
- Runbooks/docs consulted: `lineage-data-wiring-flow.md`, `rank-entry-unified-data-flow.md`,
  `rankentry-unification-epic.md`, verification/testing runbook, and the TDD/Next.js skills.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && bun run dev:e2e` for the isolated browser fixture.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: Black Belt Legacy on `localhost:3000` after the dev-login callback established the
  cookie on the configured Better Auth host.
- Postgres.app is available. DB-backed Bun/integration/build verification targets the restored, non-disposable
  `ronindojo_prodsnap`; manual browser proof targets freshly rebuilt `ronindojo_e2e` only.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0024 (wrong-repo git guard), FS-0031 (hermetic E2E fixture discipline), and
  this session's FS-0032 (a raw reset reached the wrong local database).
- Mitigation applied: FS-0024 guard before every git mutation; both effective Prisma URLs pinned; prodsnap restored
  and treated as non-disposable; the literal `ronindojo_e2e` rebuild used only for browser fixtures.

### Test-first behavior order

1. Member A→B edit preserves active A/status and creates immutable proposal B.
2. Same-target retry is idempotent; different target conflicts; sorted referenced Passports→relevant Awards→open
   Reviews plus a fail-closed graph re-read is the application backstop. WL-P1-9 adds the database uniqueness
   contract only after rollout.
3. Approve/deny/wrong-reason/concurrent transitions are atomic; explicit admin override deny+apply+audits.
4. Strict-normalized Passport/Lead matching and fail-closed capture rollback.
5. Queue/detail presentation and confirmation behavior.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0542_TASK_01 | landed | Recovery branch created; 0538/0540/0541 records repaired; incidents/index/ledgers synchronized; recovery gates green |
| SESSION_0542_TASK_02 | landed | Immutable proposal snapshots, authority-scope locks, atomic decisions, rollout barrier, exact identity matching, and server-only cores are regression-covered |
| SESSION_0542_TASK_03 | landed | Inspect-before-decide queue/detail, confirmations, mobile proof, domain/runbook alignment, and hostile follow-ups completed |

## What landed

- Recovery inventory proved there is no uncommitted source work: only five unique committed 0541 changes and
  harmless generated `node_modules` in detached fallow-cache worktrees.
- The operator approved the interrupted close and 0542 continuation branch.
- SESSION_0538, SESSION_0540, and SESSION_0541 now have honest `closed` records; three incident rows and the
  missing index entries are present.
- WL-P3-49 through WL-P3-52 and D-046 make every carried remediation discoverable through the canonical ledger
  read path.
- Established-coach A→B edits now preserve accepted A and create an immutable
  `PROPOSAL_PENDING/PROMOTER_CHANGED` snapshot of A and B. Exact retries are idempotent; different open targets
  conflict. Approval, denial, and explicit admin override use one server-only transaction core with conditional
  claims and audit rows.
- Promoter edits obey one deterministic referenced-Passports→Awards→Reviews law. Member authority edits lock all
  earned Awards; admin/reviewer paths lock the target. The law covers identity merges, existing authority changes,
  and concurrent child-award inserts through foreign-key key-share locks; forced merge-vs-edit/approve/override
  regressions prove no workflow holds an Award while waiting for a merge-owned Passport.
- The additive `PROPOSAL_PENDING` state is a mixed-release safety barrier: the prior PENDING-only reviewer cannot
  action new captured proposals. The new queue inventories legacy `PENDING/PROMOTER_CHANGED` rows but fails them
  closed; only captured proposal rows are actionable.
- Exact normalized Passport and recruitment-Lead matching now use one equality helper. Case, punctuation,
  whitespace, and diacritics normalize together; typos and reordered/repeated tokens remain distinct.
- Recruited-coach classification now requires no account, no lineage node, and no directory profile. Canonical
  identity merges repoint award provenance and every review identity reference under deterministic locks without
  rewriting review status or timestamps. User deletion fails closed for promoter/review references and revalidates
  identity and role state after locking.
- The `/app/belt-reviews` list now leads to an addressable detail page with inspectable member, accepted promoter,
  and proposed promoter context. Approval requires confirmation; Deny is canonical; stale decisions disable the
  controls and action errors remain visible. The join wizard uses the rich belt picker and member surfaces explain
  same-session proposal capture.
- Two expand-only migrations add the immutable proposal snapshot and rollout discriminator. The contract migration
  remains WL-P1-9 until the expand release is live and old writers have drained; it will add one
  `PROPOSAL_PENDING` partial unique and required-snapshot check after an abort-before-DDL inventory.
- A local database incident exposed Prisma effective-target drift: the intended E2E reset reached local
  `ronindojo_prodsnap`. Live production was never mutated. With operator approval, a read-only live-prod dump was
  taken and restored locally; the empty casualty was preserved separately. Guarded E2E helpers now force both
  Prisma URLs to literal `ronindojo_e2e`, and active runbooks define prodsnap as non-disposable.
- The package command surface now makes that policy executable: generic reset/push/migrate aliases are absent,
  deploy uses the exact `db:migrate:deploy` alias, local/root `test:e2e` routes through the guarded launcher, and
  the seed refuses prodsnap/Neon before constructing a Prisma client. Exact-name guards reject E2E-lookalike
  backup names and require both local URLs to resolve to literal `ronindojo_e2e`; CI keeps its raw commands only
  under workflow-pinned `ronindojo_test` URLs.
- A post-suite read-only inventory exposed three legacy integration teardown leaks. The claim-review,
  lineage-editor, and course-query fixtures now clean every created Passport/User; 39 focused tests left the
  prodsnap counts exactly unchanged. Historical tagged fixture rows were not deleted and are routed as D-047.
- Browser proof covers confirmation before mutation, successful atomic approval, updated credential/provenance,
  audits, the responsive review queue/detail, and the join rank picker. The known WL-P2-51 shell hydration warning
  remains pre-existing and is not represented as a clean-console result.

## Decisions resolved

- Preserve all five SESSION_0541 commits and continue from `031b73fa`; do not reset, cherry-pick, or mutate main.
- Treat 0538, 0540, and 0541 as separate unclean-close incidents and repair the canonical records.
- For established-coach promoter changes, preserve A while immutable B is pending; approve applies/verifies B,
  deny preserves A. Free-typed recruited-coach behavior remains the existing UNVERIFIED/no-review path.
- Permit one pending promoter proposal per RankEntry; exact-target retries are idempotent and different member
  targets conflict until resolution.
- Block ordinary admin promoter edits while a proposal is pending; provide only a separate atomic override that
  denies the proposal, applies the correction, and audits both consequences.
- Use `PROPOSAL_PENDING` for captured promoter proposals while retaining the legacy `PENDING` default during the
  expand rollout. The queue may inventory both, but decisions accept only a fully captured proposal.
- Treat promoter provenance as one global lock law: sorted referenced Passports first, then the relevant Award tier,
  then open Reviews, followed by a fail-closed graph re-read. Member authority decisions lock every earned Award;
  award-local admin/reviewer paths lock the target. No Serializable retry loop is required for the covered writer
  set.
- Canonical Passport merges may collapse expected A and proposed B to one identity while leaving the steward
  decision pending. Therefore A≠B is a creation-time application invariant, not part of the future database check.
- Preserve established account-only Passports on user deletion rather than detaching `userId`; detachment would
  falsely reclassify them as recruited identities. Referenced promoter identities fail closed instead.
- Canonical local database roles are now explicit: restored `ronindojo_prodsnap` is non-disposable and serves
  DB-backed Bun/integration/build checks; disposable `ronindojo_e2e` serves Playwright/manual browser fixtures.
  `DATABASE_URL` and `DIRECT_URL` must always name the same effective target.
- Passing DB-backed assertions are insufficient if teardown leaks rows. The corrected fixture lanes must remain
  count-neutral; historical cleanup requires a separate backup-first D-047 data operation.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0538.md` | Repaired stale close status and added recovery note |
| `docs/sprints/SESSION_0540.md` | Repaired stale close status/merged evidence and added recovery note |
| `docs/sprints/SESSION_0541.md` | Backfilled committed outcomes, partial reviews, findings, and handoff |
| `docs/sprints/SESSION_0542.md` | Bow-in, bounded plan, and decision gate |
| `docs/knowledge/wiki/incidents.md` | Separate recovery incidents for 0538, 0540, and 0541 |
| `docs/knowledge/wiki/index.md` | Session discoverability/status repair |
| `docs/knowledge/wiki/wiring-ledger.md` | Routed WL-P3-49 through WL-P3-52 |
| `docs/knowledge/wiki/drift-register.md` | Logged D-046 domain-doc versus implementation fork |
| `apps/web/prisma/schema.prisma` + `prisma/migrations/2026071*` | Add captured proposal FKs/timestamp and additive rollout status |
| `apps/web/server/belt/**` | Atomic proposal capture/decision core, authority-scope locks, server-only verification, and regressions |
| `apps/web/server/admin/rank-reviews/**` + `app/app/belt-reviews/**` | Authenticated actions, rollout-safe queries, inspectable detail, confirmation, and stale-state UX |
| `apps/web/server/identity/**` + claim/user/seed/migration scripts | Exact identity rules, deterministic reference repointing, and fail-closed deletion |
| `apps/web/components/web/belt/**` + dashboard/join components | Rich rank picker and proposal feedback on member surfaces |
| `apps/web/scripts/*e2e*` + `.env.e2e.example` | Literal E2E target guard for both Prisma URLs and executable env regressions |
| `apps/web/package.json` + `.env*.example` + seed target guard | Safe exact deploy/E2E commands, same-target templates, and pre-client seed refusal |
| Three legacy DB integration tests | Corrected Passport/User teardown so repeated prodsnap runs are count-neutral |
| `docs/architecture/**` + `docs/product/black-belt-legacy/**` | Ratified proposal, rollout, lock, identity-merge, and review-state domain model |
| `docs/runbooks/database/**` + `docs/runbooks/dev-environment/**` | Local DB roles, effective-target preflight, recovery, and verification policy |
| `docs/sprints/_assets/SESSION_0542-*.png` | Mobile queue/detail/join proof and irreversible-approval confirmation |

## Verification

| Command / smoke | Result |
| --- | --- |
| Worktree/branch/ancestry inventory | canonical main clean; 0541 branch exactly five commits ahead; no lost source edits |
| Bow-in `graphify stats` | 17,308 nodes / 33,940 edges / 2,277 communities / 2,655 files |
| Read-only integrity/UI/governance audit | confirmed matcher asymmetry, server boundary, action atomicity/staleness, and AdminCollection-law findings |
| Final `graphify update .` + two requested queries | 17,418 nodes / 34,230 edges / 2,253 communities / 2,683 files; requested traversals returned 40 and 109 nodes; active verification/local-dev docs align; 61 deleted/moved doc ghosts remain index-only |
| `bun run wiki:lint` | exit 0; 53 pre-existing R8 warnings, none in SESSION_0542 |
| `bun scripts/deferral-guard.ts docs/sprints/SESSION_0542.md` | exit 0; every deferral-shaped item is routed |
| `git diff --check` | exit 0 after formatter and close edits |
| Final focused concurrency/identity wave | 78/78: core 5/5; belt router 49/49; review actions 15/15; repoint + claim finalize 9/9 |
| Focused identity/user deletion | user deletion 2/2; directory dedup 1/1; shared classifier/merge coverage included above |
| DB command safety guards | 6/6 exact E2E/seed-target units; `db:seed` refuses prodsnap before client; `db:reset` and `db:push` are absent |
| Canonical full serial Bun suite | 1,509 pass / 0 fail across 199 files in 841s (`--parallel=1 --timeout=60000`, E2E excluded) |
| Post-suite teardown remediation | 39/39 affected tests; prodsnap stayed 34 Users / 18 Organizations / 134 Passports / 0 reviews before and after |
| Typecheck / lint / format / Prisma | typecheck 0; lint 0 (warning-only baseline); format 0; schema valid; 79/79 migrations applied |
| Production build | PASS: compile, TypeScript, 194 static pages, and sitemap; known unrelated NFT trace + pg adapter deprecation warnings remain |
| E2E evidence guard | explicit waiver accepted: only local run-instruction comments changed in five E2E specs; no assertions, fixtures, or helpers changed |
| Read-only DB target proof | prodsnap and E2E both at 79 migrations with four review statuses; prodsnap has 0 reviews, disposable E2E has the one terminal browser-smoke review |
| Browser approval smoke | confirmation makes no mutation; confirmed action returns 200, marks APPROVED, applies/verifies B, and writes audits |
| Responsive browser proof | review detail, review queue, and join picker captured at mobile width in `docs/sprints/_assets/` |

## Open decisions / blockers

- Push is deliberately blocked on the repository's explicit per-push authorization gate. This session may commit
  locally but must not push, merge, deploy, or remove the unique 0541 worktree without the operator's separate
  “go.”
- WL-P1-9 is intentionally not part of this expand release. After the application deploy is live and old writers
  have drained, inventory legacy/malformed/duplicate proposal rows, resolve them without guessing provenance, and
  apply the abort-before-DDL contract migration.
- Legacy payloadless `PENDING/PROMOTER_CHANGED` rows are operator inventory only. They remain visible and fail
  closed until explicitly resolved; no code path fabricates A/B provenance for them.
- D-047 tracks historical tagged integration fixtures already present in local prodsnap. The repeatable teardown
  leaks are fixed; historical deletion is a separate backup-first local data operation, not part of this release.

## Next session

### Goal

Publish and observe the verified SESSION_0542 expand release, then schedule the WL-P1-9 contract only after old
writers have drained.

### Inputs to read

- `docs/sprints/SESSION_0542.md`
- `docs/architecture/decisions/0047-promoter-as-placeholder-recruited-coach-identity.md`
- `docs/knowledge/wiki/wiring-ledger.md` (WL-P1-9 and WL-P3-49–52)
- `docs/runbooks/database/schema-migration.md`
- `docs/runbooks/dev-environment/verification-and-testing.md`
- `docs/knowledge/wiki/drift-register.md` (D-047)

### First task

After Brian gives the separate explicit push authorization, push the local concern-split commits, monitor CI and
the Vercel expand migration/application activation, and record the deployed writer version before beginning the
old-writer drain window. Do not run WL-P1-9 in the same deployment.

## Review log

- Giddy carried forward **PROCEED, 9.0/10** from the clean 0541 tree and identified the matcher asymmetry,
  client-callable transaction helper, inline moderation divergence, and ADR precision gaps. All six notes are
  implemented or explicitly routed.
- Desi returned **CONFORM-WITH-FIXES**: exact swatch parity and AdminCollection composition were sound; the member
  needed an inspectable detail link, irreversible approval needed confirmation, and the constant reason column
  should be removed. All three fixes landed and were captured at mobile width.
- Doug's release/data-integrity review identified the member authority-scope race, mixed-release old-reviewer risk,
  and promoter-identity merge/delete references. The Passport→awards→review lock, `PROPOSAL_PENDING` barrier,
  deterministic identity repointing, and deletion guards close those findings with executable regressions.
- Final hostile integrity rereview returned **PROCEED** with no remaining severity finding: every active promoter
  writer now uses the shared Passport-union→Award(s)→Review(s) law, and forced merge schedules prove the old
  deadlock inversion is gone. Close/push remained held only until the final deterministic evidence was refreshed.
- The final build diagnosis returned **PROCEED** after replacing Prisma's extension-incompatible full delegate
  `Pick` with the exact structural transaction port. Uncached TypeScript and all production callers confirmed the
  fix; no runtime cast or behavior change was introduced.

## Hostile close review

The release is locally **PROCEED** and **HOLD only at explicit push authorization**, not on an open semantic,
integrity, build, or documentation defect. The database contract remains intentionally open as WL-P1-9 because
adding it before the expand writer is deployed would break rolling compatibility. Known residuals are explicit:
legacy payloadless rows fail closed; D-047 owns historical local fixture residue; WL-P2-51 is a pre-existing
hydration warning; Graphify retains 61 deleted/moved documentation nodes even though filesystem references and
active docs are aligned.

## ADR / ubiquitous-language check

ADR 0047 D7, the ubiquitous-language Trust State and Promoter-change proposal entries, and both BBL rank-entry
flows now encode the same A-kept/B-proposed model, rollout discriminator, authority-scope lock, identity-merge
policy, and expand/contract boundary. Residual `claimable` wording was removed; no new ADR is needed.

## Reflections

Recovery is part of correctness: clean concern-split commits made the code recoverable, while stale session
frontmatter showed why the canonical operational record still needs an explicit repair pass.

The database incident also proved that a named env file is not evidence of Prisma's effective datasource. Both
URLs and the database name must be asserted by guarded helpers before destructive work. Preserving the empty
casualty and live dump made the recovery auditable instead of silently reconstructing an approximation.

Rolling-release safety required a state the old reviewer could not recognize. `PROPOSAL_PENDING` is intentionally
boring but stronger than relying on the old action's accidental transaction-argument shape. Likewise, identity
merges must repoint provenance without pretending the merge itself decided a belt proposal.

The final count inventory caught what green assertions did not: teardown correctness is part of verification on a
non-disposable mirror. Before/after counts gave the legacy fixture leaks a fast feedback loop without authorizing
an ad hoc cleanup of historical local data.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched architecture/product/wiki/runbook/session docs stamped 2026-07-16 and checked against active paths; status closed |
| Backlinks/index sweep | SESSION_0542 pairs/backlinks and wiki index row closed; moved-runbook references resolve to active nested paths |
| Wiki lint | Exit 0 with exactly 53 pre-existing R8 warnings |
| Kaizen reflection | Reflections section records interrupted-close recovery, effective DB target drift, rollout status, and identity-merge lessons |
| Hostile close review | Giddy, Desi, Doug findings closed or routed; final integrity and build-type reviews returned PROCEED |
| Code-quality gate (Class-A) | Typecheck/lint/format/schema/build green; full serial suite 1,509/1,509; teardown rerun 39/39 and count-neutral |
| Runtime verification (Doug) | Browser→action→database approval proof plus focused public-router/action concurrency regressions |
| Review & Recommend | Next goal and first task specify explicit authorization, push/observe, old-writer drain, then WL-P1-9 |
| Memory sweep | FS-0032, D-047, DB/runbook policy, ADR 0047, ubiquitous language, ledgers, flow docs, and Graphify path drift updated |
| Next session unblock check | All local gates complete; external publication waits only for Brian's per-push “go” |
| Git hygiene | `session-0542-belt-review-remediation`; 0541 worktree retained because it has unique unpushed commits; local commits only, no push |
| Graphify update | 17,418 nodes / 34,230 edges / 2,253 communities / 2,683 files; both requested queries reconciled against `rg --files` / `test -e` |
