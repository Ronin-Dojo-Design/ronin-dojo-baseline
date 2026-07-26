---
title: "SESSION 0450 — prodsnap refresh + Stage-2 brand-drop gate-review"
slug: session-0450
type: session--plan
status: closed
created: 2026-06-26
updated: 2026-06-26
last_agent: claude-session-0450
sprint: S45
pairs_with:

  - docs/sprints/SESSION_0449.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0450 — prodsnap refresh + Stage-2 brand-drop gate-review

## Date

2026-06-26

## Operator

Brian + claude-session-0450

## Goal

Pick up SESSION_0449's Next-session lane: the **gated Stage-2 brand schema drop**. Operator chose
**refresh prodsnap first** so the prod-row audit + local dev match prod, then **gate-review** the
drop (BASELINE comp-fixture fate + a non-BBL prod-row audit) before any migration is written.
Migration + PR only if the gates clear and the operator says go.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0449.md` (fully closed; Next-session block populated).
- Carryover: 0449 landed PRs #163–#166 to prod (org-authz determinism fix, `User.role`→`UserRole`
  enum, brand destales, owner-email PII fix). Next-session **Candidate** goal = the gated Stage-2
  brand schema drop. PRs #165/#166 already merged → first-task "confirm #165 + resync main" is
  satisfied; base clean on `main`.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `849d39a3`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (schema/migration) — gate-review only this session |
| Extension or replacement | Neither yet — read-only audit of an existing single-brand-collapse vestige |
| Why justified | Removing the dead 4-brand `Brand` axis (ADR 0034 single-brand collapse) |
| Risk if bypassed | A blind `brand`-column/`Brand`-enum drop breaks the intentionally-BASELINE comp fixture + assumes no non-BBL prod rows |

### Grill outcome

- Operator fork resolved at bow-in: **refresh prodsnap first** (vs gate-review against prod directly,
  vs a different lane). Chosen so the prod-row audit is accurate AND local dev realigns with prod.

## Petey plan

### Goal

Realign prodsnap with prod, then gate-review the Stage-2 brand schema drop; hold before writing any
migration pending gate results + operator go.

### Tasks

#### SESSION_0450_TASK_00 — Refresh prodsnap from prod

- **Agent:** Cody
- **What:** `pg_dump` prod (direct Neon endpoint) → drop/recreate local `ronindojo_prodsnap` → restore.
- **Steps:** insurance-backup current prodsnap; dump prod `--no-owner --no-acl -Fc`; `dropdb --force` +
  `createdb`; `pg_restore`; verify counts/migrations/enum; `prisma migrate status`.
- **Done means:** prodsnap counts == prod (6 users / 14 orgs / 91 passports), 60 migrations, no drift.
- **Depends on:** nothing

#### SESSION_0450_TASK_01 — Gate review: BASELINE comp-fixture fate

- **Agent:** Petey/Doug
- **What:** Determine how the brand-drop affects the intentionally-`BASELINE` lineage-comp-fixture seed.
- **Done means:** a decision on the fixture (drop brand from it / re-seed BBL / other) + why a blind
  `BASELINE→BBL` replace breaks it, documented.
- **Depends on:** nothing

#### SESSION_0450_TASK_02 — Gate review: non-BBL prod-row audit

- **Agent:** Doug
- **What:** Audit every `brand` column on prod (via refreshed prodsnap) for any non-BBL / null values.
- **Done means:** a per-table brand-value report; gate = PASS only if no live non-BBL rows exist.
- **Depends on:** TASK_00

#### SESSION_0450_TASK_03 — (conditional) write the migration + PR

- **Agent:** Cody
- **What:** Only if gates clear + operator go: hand-author the in-place migration dropping the `brand`
  columns + `Brand` enum + `Brand.BBL` literals; keep `lib/brand-context.ts` (MB-002). PR + full CI.
- **Depends on:** TASK_01, TASK_02, operator go

### Open decisions

- Comp-fixture fate (TASK_01 output).
- Whether to proceed to the migration this session or stop at the gate-review (operator go).

### Risks

- A `brand`-column drop is irreversible on prod → PR route + full CI + Vercel preview before merge.
- 471 `Brand.BBL` literals + 3 `*brand-isolation*.test.ts` guards must be handled together (one
  interconnected refactor, per `[[brand-vestige-trim-inventory]]`).

### Scope guard

- Do NOT touch `lib/brand-context.ts` `resolveBrand`/`HOST_TO_BRAND`/`BRAND_TRUSTED_ORIGINS` (MB-002
  host→brand security gate — KEEP-FOREVER).
- No migration written until both gates pass and the operator says go.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0450_TASK_00 | landed | prodsnap refreshed from prod; verified 6/14/91, 60 migrations, no drift |
| SESSION_0450_TASK_01 | landed | comp-fixture: hardcodes `BASELINE_MARTIAL_ARTS` for a unit-test path (Entitlement `brand_key` unique, grantComp). Mechanical to update WITH the schema, not a blocker — but confirms a live BASELINE unit-test path. |
| SESSION_0450_TASK_02 | landed | **prod-row audit: GATE FAILS.** 390 non-BBL rows (388 BASELINE + 1 WEKAF + 1 RONIN) + 219 NULL across 44 brand cols. Full legacy Baseline demo dataset co-resident on prod. |
| SESSION_0450_TASK_03 | built+verified | `scripts/purge-non-bbl-baseline-data.ts` — transactional, dry-run default. Dry-run on prodsnap: deletes the legacy island, asserts 0 non-BBL remain + BBL integrity unchanged, rolls back. Gates green (oxlint/oxfmt/tsc). **Prod `--apply` GATED on operator go.** |
| SESSION_0450_TASK_04 | cancelled | prod `--apply` NOT run — operator chose to PARK + keep all Baseline data (multi-product future). Purge tool banked. |
| SESSION_0450_TASK_05 | landed | Memory + governance-docs cleanup (operator-requested): compacted MEMORY.md (25.2→14.1KB), deleted 5 superseded files, de-staled 3 memory files, leaned CLAUDE.md (push-conflict fix) + AGENTS.md (de-dup wiki schema → canonical doc). Read-only memory audit (Explore subagent) drove it. |
| SESSION_0450_TASK_06 | landed | Pre-staged SESSION_0451 (Petey plan + bow-in prompt) so the next session starts cold. |

### Memory + governance-docs cleanup (TASK_05)

Operator pivoted mid-close to a memory/docs tidy. A read-only Explore subagent audited all 54 memory
topic files against current ground truth. Actions taken:

- **MEMORY.md index:** compacted 25.2KB → 14.1KB (one terse line per entry; the index was over its
  24.4KB read limit so detail beyond it was being dropped).
- **Deleted 5 superseded memory files** (conflicting BBL direction-pivots + stale launch-prep):
  `in-place-prune-supersedes-separate-fork`, `bbl-extracts-to-own-repo`, `bbl-no-real-users-reproducible-data`,
  `session-0417-launch-prep-and-prod-env`, `held-work-vs-cloud-pr-base`.
- **De-staled 3 memory files:** `brand-vestige-trim-inventory` (Stage-2 parked + prod-Baseline-dataset),
  `userrole-enum-and-prodsnap-stale` (prodsnap refreshed; kept the enum-migration template), and
  `env-prod-overlay-and-prodsnap` (prodsnap refreshed + the `--env-file`-is-a-replace / `dotenv/config` gotcha).
- **CLAUDE.md:** replaced the stale "Standing authorization: auto-push to `main`" bullet with the operator's
  actual **explicit per-push authorization** policy (resolved a real conflict); tightened the intro.
- **AGENTS.md (Codex-facing):** replaced ~160 lines of inlined, drifted wiki-schema with a pointer to the
  canonical `docs/protocols/llm-wiki-schema.md` (matches CLAUDE.md per ADR 0033 D7) + a strategy pointer.
- **Deferred to SESSION_0451** (audit leftovers): `bbl-sot-spec-program` stale prodsnap line; the
  `bbl-launch-is-the-focus` ↔ `bbl-paid-live` launch-status conflict (curl shows `blackbeltlegacy.com` 200
  with the live site + no "countdown" text → likely revealed; verify `BBL_COUNTDOWN` before editing); claim-file
  merges; leaning `.github/copilot-instructions.md` (12KB) the same way.

### Purge build + verification (TASK_03)

`apps/web/scripts/purge-non-bbl-baseline-data.ts` (modeled on `delete-test-orgs.ts`; `db` + `--apply`
dry-run default). Deletes `brand IN (BASELINE_MARTIAL_ARTS, WEKAF, RONIN_DOJO_DESIGN)` — never BBL,
never NULL — in FK-safe order: Certification (Brian's demo cert, the 1 RESTRICT blocker) → Rank →
RankSystem → Entitlement → LineageTree → ContentVariant → AuditLog → Organization (cascades
Course/PricingPlan/Program/ClassSchedule/Membership/Invite).

Dry-run on prodsnap (real deletes in one tx, then rollback):

| Check | Result |
| --- | --- |
| Direct deletes | cert 1, rank 16, rankSystem 2, entitlement 21, lineageTree 5, contentVariant 5, auditLog 9, org 2 (+ cascades: 218 courses, 92 pricing, 27 tree-members, 32 grants, …) |
| Assertion: 0 non-BBL rows remain | PASS (in-tx) |
| Assertion: BBL integrity unchanged | PASS — orgs 12, trees 3, treeMembers 100, courses 5, pricing 4, users 6, passports 91 (identical before/after) |
| Rollback | clean — prodsnap still has the 2 baseline orgs |
| oxlint / oxfmt / tsc | 0 / no-diff / clean |

Cross-brand landmine sweep (all clear): 0 RankAwards/BeltTestRegs→BASELINE ranks; 0 UserEntitlements
on deleted entitlements; 0 tournaments; 0 BBL-tree members→BASELINE ranks. The 17-member
`rigan-machado-bjj-lineage` orphan is non-destructive (deleting a tree drops only membership rows;
people/passports/nodes survive).

### Gate-review findings (TASK_01 + TASK_02)

The Stage-2 brand-drop gate "confirm no non-BBL prod rows" **does not hold.** Prod carries the original
Baseline Martial Arts demo dataset, brand-scoped (so invisible on the live BBL site) but still present:

| Table | BBL (live) | Non-BBL (legacy) |
| --- | --- | --- |
| Organization | 12 | 2 (`Baseline Martial Arts`, `Big Roy`) + 8 Memberships |
| Course | 5 | 218 BASELINE |
| PricingPlan | 4 | 92 active BASELINE |
| LineageTree | 3 | 5 BASELINE (4 published demo trees + `rigan-machado-bjj-lineage` 17-member consolidation leftover) |
| Entitlement | (BBL) | 19 BASELINE + 1 WEKAF + 1 RONIN_DOJO_DESIGN |

- Live BBL roster is BBL-branded + safe (Rigan Machado Lineage 77, Dirty Dozen 7, BBL Rigan-BJJ 16).
- 11 brand-nullable reference tables (Rank/RankSystem/Discipline/Role/…) hold 219 NULL rows = shared
  reference data; the column simply drops there.
- **The `brand` column is still load-bearing** — it isolates ~388 legacy rows from BBL surfaces. Stage-2
  is therefore two phases: (1) reconcile/purge the legacy Baseline prod data, then (2) the clean column drop.
- ⚠ The BASELINE `rigan-machado-bjj-lineage` (17 members, unpublished) needs dedup-vs-BBL-tree analysis
  before any delete (consolidation orphan; ties to `[[lineage-branch-heads-and-tree-consolidation]]`).

## What landed

- **Refreshed prodsnap from prod (TASK_00) — the session's concrete win.** `pg_dump` prod (direct Neon
  endpoint) → drop/recreate local `ronindojo_prodsnap` → restore. Verified an exact match to prod
  (6 users / 14 orgs / 91 passports, 140 tables, 60 migrations, `role` = `UserRole` enum, 0 `@test.local`
  users; `prisma migrate status` = up to date). The stale-prodsnap warning carried since ~SESSION_0443
  is **resolved** — local dev/tests now run against true-prod data.
- **Gate-review disproved the Stage-2 premise (TASK_01/02).** The gate "confirm no non-BBL prod rows"
  **fails**: prod carries the full original Baseline Martial Arts demo dataset — **391 non-BBL rows**
  (388 BASELINE + 1 WEKAF + 1 RONIN) co-resident with live BBL data, brand-hidden from BBL surfaces
  (verified: the public courses page calls `searchCourses(..., Brand.BBL)` + `where:{brand}`). The
  `brand` column is **not a vestige** — it's the still-load-bearing BBL-vs-future-Baseline separator.
- **Built + verified (but deliberately did NOT run) a reversible purge tool (TASK_03).**
  `scripts/purge-non-bbl-baseline-data.ts` — transactional, dry-run default, full cross-brand landmine
  sweep clean. Dry-run on BOTH prodsnap and **prod** (read-only, rolled back): would remove the legacy
  island with **BBL integrity byte-identical** before/after. Gates green (oxlint/oxfmt/tsc).
- **Operator decision: PARK it — keep everything (TASK_04 cancelled).** The Baseline data is harmless
  (brand-hidden) and is the seed for a future `baselinemartialarts.com` product (multi-product model,
  CLAUDE.md). Keeping it ⟺ keeping the `brand` column ⟺ the Stage-2 column drop is **parked, not done**.
  Nothing was deleted; the purge tool is banked for the eventual Baseline extraction.

## Decisions resolved

- **Refresh prodsnap first** (operator) — done + verified == prod.
- **The `brand` column is the multi-product separator, NOT a vestige to drop now** (operator) — prod is
  not single-brand at the data layer; the legacy Baseline dataset is intentional/future-useful.
- **Park the Stage-2 brand-schema drop + the purge** (operator: "keep everything") — keep all Baseline
  data (brand-hidden, harmless); bank the purge tool for the future `baselinemartialarts.com` extraction.
- **"BJJ courses under a Baseline school listing on BBL"** = a separate future *feature* (re-brand or
  cross-brand listing), not part of any cleanup — deferred to its own lane.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/scripts/purge-non-bbl-baseline-data.ts` | NEW — banked/parked reversible Baseline-data purge tool (dry-run default; never applied; for the future `baselinemartialarts.com` extraction). **Held out of this docs push** (it's the only file under `apps/web/` → would fire a no-op BBL redeploy + the CI matrix); lands free on the next app-code push. |
| `CLAUDE.md` | TASK_05 — push policy: auto-push bullet → explicit per-push authorization; intro tightened |
| `AGENTS.md` | TASK_05 — de-dup ~160 lines of inlined wiki schema → pointer to `docs/protocols/llm-wiki-schema.md` + strategy pointer |
| `docs/knowledge/wiki/index.md` | SESSION_0450 row added |
| `docs/sprints/SESSION_0451.md` | NEW — pre-staged next session (Petey plan + bow-in) |
| `docs/sprints/SESSION_0450.md` | this session record |

(Non-file changes: local `ronindojo_prodsnap` refreshed from prod; operator memory swept — MEMORY.md compacted 25.2→14.1KB, 5 superseded files deleted, 3 de-staled.)

## Verification

| Command / smoke | Result |
| --- | --- |
| prodsnap refresh + verify | counts == prod (6/14/91), 140 tables, 60 migrations, role=`UserRole`, 0 `@test.local`; `prisma migrate status` = up to date |
| prod-row brand audit (44 brand cols) | 391 non-BBL rows on prod (388 BASELINE + 1 WEKAF + 1 RONIN) + 219 NULL reference rows; live BBL data BBL-branded |
| course brand-gating check | `app/(web)/courses/page.tsx` → `searchCourses(..., Brand.BBL)`; `queries.ts` `where:{brand}` → baseline courses brand-hidden on BBL (operator's "no harm" claim confirmed) |
| purge dry-run (prodsnap + prod) | real deletes in one tx, asserted 0 non-BBL remain + BBL integrity unchanged, then ROLLED BACK; nothing written |
| oxlint / oxfmt / tsc on new script | 0 / no-diff / clean |

## Open decisions / blockers

- **Stage-2 brand-schema drop = PARKED** (not blocked). Revisit only if/when `baselinemartialarts.com`
  is extracted to its own product and its data is migrated out of the BBL DB — then run the banked
  `purge-non-bbl-baseline-data.ts` and drop the `brand` column. Until then the column is load-bearing.
- **🔐 Rotate the prod Neon password** — carried from SESSION_0449 and **re-exposed in this session's
  transcript** (a psql error echoed the connection string before the libpq-env-var switch). Now more
  worth doing. Not blocking.
- **prodsnap is now fresh** — the long-standing "prodsnap is stale" caveat is resolved this session.

## Next session

### Goal

Operator's call — the Stage-2 brand-drop lane is parked. Candidate next lanes: (a) the SESSION_0446
stale-security-docs audit (the `docs/security/*` set written for the dead multi-brand model); (b) the
prod Neon password rotation; (c) a BBL feature lane from `POST_LAUNCH_SOT.md`. No autopilot — surface
options and let the operator choose.

### First task

Confirm base is clean on `main`, then ask the operator which lane. If continuing brand cleanup at all,
note it's now a *future-product extraction* problem, not a vestige trim.

### Inputs to read

- `[[brand-vestige-trim-inventory]]` (now updated: Stage-2 parked, prod has a live Baseline dataset),
  this file, `apps/web/scripts/purge-non-bbl-baseline-data.ts` (the banked tool).

## Review log

### SESSION_0450_REVIEW_01 — prodsnap refresh + gate-review + banked purge

- **Reviewed tasks:** TASK_00 (prodsnap refresh), TASK_01/02 (gate-review), TASK_03 (purge tool).
- **Verdict:** Clean. The refresh is verified an exact prod match (counts/migrations/enum/`migrate
  status`). The gate-review is well-grounded: the "no non-BBL prod rows" assumption was tested against
  real prod (not the snapshot) and disproved with a per-table audit + a verified cross-brand landmine
  sweep. The purge tool was dry-run-proven on prod with an in-transaction BBL-integrity assertion and
  deliberately not applied. The park decision is consistent with the multi-product strategy. No code
  shipped to prod; no schema/authz/public-surface change.
- **Score:** 9.5/10 (½ off: the original Next-session "drop the brand vestige" goal rested on an
  unverified single-brand-at-the-data-layer assumption; one prod audit would have reframed it before it
  was ever written as the lane — same "verify against prod, not the framing" lesson as SESSION_0449).
- **Follow-up:** none blocking; banked purge tool + parked column drop recorded.

## Hostile close review

- **Giddy:** **pass** — every prod-touching step was operator-gated (refresh, then dry-run, then the
  apply was withheld and re-questioned when the operator surfaced new context). No deletes ran. The
  credential re-exposure is flagged for rotation, not buried. The decision to park was the operator's,
  recorded with its rationale.
- **Doug:** **pass** — the purge was proven safe on five legs (FK introspection, cross-brand landmine
  sweep = all clear, dry-run on prodsnap AND prod with a 0-remaining + BBL-unchanged assertion, gates
  green, rollback verified) yet correctly NOT applied. prodsnap refresh verified against prod, not
  assumed. No production data mutated.
- **Desi:** **pass (n/a)** — no UI built; verified (read-only) that baseline content is brand-hidden on
  the BBL public courses surface.
- **Kaizen aggregate:** 9.5/10 — strong gate discipline; the only miss is upstream (the lane premise
  itself was unverified).

## ADR / ubiquitous-language check

- **No new ADR required.** Nothing was decided architecturally that isn't already covered: the
  multi-product model (separate apps, not the `brand` column) is ADR 0034 / CLAUDE.md; the decision to
  *keep* the `brand` column reaffirms that the single-brand collapse is a chrome/UI-layer fact, not a
  data-layer one. Worth noting in `[[brand-vestige-trim-inventory]]` (done) rather than a new ADR.
- **Ubiquitous language:** no new terms (reused: brand column, single-brand collapse, vestige,
  multi-product, host→brand security gate, prodsnap).

## Reflections

- **Verify the lane premise against prod before adopting it as the goal.** The Next-session goal "drop
  the brand vestige" was a *candidate* built on "prod is already single-brand-BBL." One prod audit
  showed 391 non-BBL rows — a whole co-resident Baseline dataset. The same lesson as SESSION_0449 (the
  "2nd admin" scare): for anything prod-affecting, the framing and the snapshot are conveniences, not
  truth. The operator's strategic context (Baseline = future product) then reframed the column from
  "vestige" to "load-bearing separator" — which no amount of code-reading would have surfaced.
- **A brand-scoped filter and a brand-column drop are the same fact from two sides.** `searchCourses(...,
  Brand.BBL)` is exactly what would vanish when the column drops. Recognizing that coupling turned an
  apparently-safe "drop the dead column" into "this would surface 218 hidden courses on BBL" — and made
  the keep-vs-drop decision obviously the operator's, not a mechanical cleanup.
- **Build-and-verify the destructive tool even when you may not run it.** The dry-run-on-prod (real
  deletes, asserted, rolled back) is what made the keep-vs-purge decision concrete and reversible. The
  tool is now banked, proven, and documented for the real future use (Baseline extraction) — cheap
  insurance, zero prod risk.
- **`bun --env-file` is a replace, not an overlay, unless you `import "dotenv/config"`.** The prod
  dry-run first failed env validation because `--env-file=.env.prod` loaded ONLY that file. The proven
  fix (matching `consolidate-rigan-machado-tree.ts`) is `import "dotenv/config"` as the first import so
  `.env` backfills the required vars without clobbering the `--env-file` prod `DATABASE_URL`.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | touched files: new banked script (inline-doc-commented, parked-status header); SESSION_0450 frontmatter `status: closed`, `last_agent: claude-session-0450`. No wiki/architecture page edited. |
| Backlinks/index sweep | wiki `index.md` SESSION_0450 row added; SESSION pairs_with → SESSION_0449 |
| Wiki lint | `bun run wiki:lint` → result recorded in bow-out chat |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | SESSION_0450_REVIEW_01 + Giddy/Doug/Desi above (9.5/10) |
| Review & Recommend | yes — Next session = operator's choice (Stage-2 parked); options surfaced |
| Memory sweep | updated `[[brand-vestige-trim-inventory]]` (Stage-2 parked; prod has a live Baseline dataset; column = multi-product separator) + the prodsnap-stale caveat (now fresh) |
| Next session unblock check | unblocked — next lane is operator's pick; no hard dependency |
| Git hygiene | branch `main`; 2 new files; single commit — hash reported at bow-out / see git log; **push HELD on explicit operator authorization** |
| Graphify update | run before the close commit — stats recorded in bow-out chat |
| Pre-push cost gate | no app-code runtime change (new script is tooling, not imported by the app); docs+script push = no Vercel deploy (paths-ignored / `ignoreCommand`) |
