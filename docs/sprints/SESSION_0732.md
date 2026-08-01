---
title: "SESSION 0732 — #377 CI rank-read guard"
slug: session-0732
type: session--implement
status: closed
created: 2026-08-01
updated: 2026-08-01
last_agent: codex-session-0732
sprint: S13
lane: bbl
recipe: "seq-lane-build"
goal_ids: ["G-011"]
tickets: ["#377"]
next_session: docs/sprints/SESSION_0733.md
pairs_with:
  - docs/sprints/SESSION_0731.md
  - docs/sprints/SESSION_0733.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0732 — #377 CI rank-read guard

> **Staged by SESSION_0731.** Adopt: flip `status:` → `in-progress`. #376/#397 is merged and the
> polish wave is complete; #380 remains separately blocked on #398. PR-only main and explicit
> per-push authorization remain binding.

## Goal

Build #377: mechanically fail new direct `RankAward` display/read roots while preserving the
temporary RankAward write, compatibility-sync, and fact-anchor joins until #380. Adopt or explicitly
classify the contract-only `member-ranks.ts` seam; keep the ADR 0035/0058 display law intact.

## Bow-in

- **Previous goal: YES.** SESSION_0731 records weighted code quality 9.8, FS-0028 mechanically
  mitigated, the final delta cleared at 9.8, and the operator-authorized close push completed;
  its historical systemic score remains 8.9.
- Adopted the staged SESSION_0732 stub in canonical on clean `main`. The canonical checkout was
  free and claimed for SESSION_0732; the FS-0024 origin/path checks and `githooks/doctor.sh`
  passed, including the PR-only ruleset and force-push block. Dependencies are present.
- Graphify-first discovery ran at 15,180 nodes / 33,673 edges. The rank-read query surfaced ADR
  0058, the RankEntry/RankAward transition, rank import/seed bridges, and the current rank seam;
  direct inspection confirmed `server/belt/member-ranks.ts` is contract-only and names #377 as
  its first runtime adoption.
- Backlog scan: the operator board begins FI-001 then G-002; open PR #361 is a clean P2 backlog
  item. The explicit operator-pinned #377 lane and SESSION_0731's `Next session` block override
  both. #377 is unblocked; #380 remains separately blocked on #398.
- Router result: **clear build** — Cody + `cody-preflight` builds the tracked guard and CI wiring,
  then Doug verifies the policy boundary and defeat fixture. The allowed-vs-never table permits
  local build/test/commit work but forbids push, merge, or deploy without the operator's explicit
  per-action word.
- Parallel-lane assessment: one coherent rank-read enforcement lane. Hook logic, scanner policy,
  CI wiring, and negative proof share the same contract and files, so fan-out would create merge
  coupling rather than independent deliverables.
- Operator confirmed #377 remains the lane and declined a frozen State-of-Dojo snapshot. The
  always-current zero-token view remains `/app/state`.

## Petey plan

- `SESSION_0732_TASK_01` — Run Cody preflight and capture the complete existing `RankAward`
  reference inventory, classifying allowed writes/compatibility/fact-anchor joins versus forbidden
  member-rank display reads; explicitly decide how `member-ranks.ts` participates. **COMPLETED**
- `SESSION_0732_TASK_02` — Implement the standalone RankAward read scanner, tracked pre-commit
  integration, CI job/wiring, and checked positive/negative fixtures without coupling its policy to
  the generic staged-format guard. **COMPLETED**
- `SESSION_0732_TASK_03` — Doug-verify hook installation/doctor behavior, defeat cases,
  RankEntry/display-order regressions, and proportional type/lint/test/build gates; record evidence
  and hold at the explicit push gate. **COMPLETED**

## Open decisions / blockers

- No implementation blocker. The operator confirmed the elected #377 lane at bow-in.
- #380 remains out of scope and blocked on #398; no schema migration or RankAward bridge removal
  belongs in this session.
- Push + PR creation are operator-authorized for the single close push. Merge/deploy remain held.

## Pre-flight: repo policy tooling — RankAward read guard

### 0. Architecture gate

- `bun scripts/arch-gate.ts`: **PASS** — 4/4 invariants green (`no-get-request-brand` 0/0,
  `next-safe-action-imports-shrink` 87/87, `legacy-claim-model-refs-shrink` 7/7,
  `no-new-next-safe-action-server-actions` 0/0). No ceiling or allowlist changed.

### 1. Existing implementation scan

- Graphify query: `RankAward direct read guard pre-commit CI member ranks ADR 0058 FS-0049
  SESSION 0731.5` at budget 2000 from canonical (15,180 nodes / 33,673 edges). Selected and
  directly read: ADR 0058, FS-0049, `server/belt/member-ranks.ts`,
  `server/belt/rank-entry-{display-order,trust-axes}.ts`, `scripts/githooks/pre-commit{,.test.sh}`,
  and `.github/workflows/ci.yml`.
- Existing guard pattern: SESSION_0731.5's tracked pre-commit harness proves INDEX authority,
  read-only behavior, partial staging, config changes, and canonical hook installation. Reused that
  harness; the rank policy remains a separate executable and separate CI job.
- Dirstarter baseline: N/A — this is repo policy/tooling, not product UI, API, auth, Prisma, or an
  L1 template extension. No front-end, data source, schema, migration, or production DB change.

### 2. Complete current reference inventory and classification

The Graphify-guided full lexical sweep found 2,170 `RankAward`/relation/id lines across current
code, schema, migrations, tests, and historical documentation. Definitions (`schema.prisma`),
generated/migration history, prose, types, FK ids, writes (`create`/`update`/`upsert`/`delete`), and
ordinary value projection are not direct read roots. The narrower executable-policy inventory found
**191 Prisma read-root tokens**: 60 runtime, 23 operational seed/import/reconcile, and 108 test/E2E
fixture/assertion roots. Every root is classified below; there are **zero surviving forbidden
member-rank aggregate/display roots** after #397.

| Classification | Existing roots | Disposition through #380 |
| --- | --- | --- |
| Writes + compatibility synchronization | `server/admin/lineage/{claim-finalize,place-lead-core}.ts`; `server/belt/{promoter-proposal-core,queries,rank-entry-compatibility,router,verify-rank-entry-core}.ts`; `server/web/lineage/editor-actions.ts`; `server/identity/repoint-promoter-identity.ts`; seed/import/reconcile scripts | Allowed transitional bridge. Direct lookup supplies write conflict checks, before/after facts, sync, or attended data repair; write methods are never flagged. |
| Promotion facts / temporary RankEntry anchor joins | `server/admin/lineage/queries.ts`; `server/admin/rank-reviews/queries.ts`; `server/belt/rank-entry-display-order.ts`; `server/social-queue/celebration-cards.ts`; `server/web/belt/belt-tab-loader.ts`; `server/web/lineage/{node-profile-actions,node-profile-queries,payloads}.ts`; `server/web/{media/media-authorization,passport/public-payloads}.ts` | Allowed: these start from RankEntry or a satellite and join the temporary award only for `awardedAt`, authority/editability, ownership, or an FK anchor. |
| Promotion-event fact reads | `bbl-promotion-marquee-data.ts`; `server/web/promotion-events/{editor-actions,editor-authorization,editor-queries,payloads,queries}.ts`; dashboard editor types | Allowed: event rosters and promotion history are rich promotion facts, not the member-rank aggregate/display source. |
| Identity/existence relations | `server/identity/promoter-placeholder.ts`; `server/orpc/routers/users.ts` | Allowed: relation existence scopes promoter identities; they do not derive a member's rank. |
| Types/projections | `server/belt/profile-projection.ts` plus payload/editor structural types | Allowed non-query references; scanner conservatively counts relation-shaped tokens so any new one still receives review. |
| Tests and E2E helpers | 108 roots under `*.test.*`, `*.spec.*`, and `e2e/helpers/` | Allowed existing setup/assertion/cleanup and bridge proof. New direct test reads must carry the same reviewed exemption instead of silently expanding the surface. |
| Forbidden member-rank reads | None in the current tree | Any new delegate read (`rankAward.find*`/count/aggregate/groupBy) or RankAward relation root raises the per-file root count and fails hook + CI unless the immediately adjacent reviewed `rank-read-guard: allow -- <reason>` marker documents a temporary fact/compatibility join. |

### 3. `member-ranks.ts` decision

- **Explicitly classified, not artificially re-consumed.** `memberRanks` / `memberTopRank` is the
  canonical compact RankEntry seam: its DB delegate is `rankEntry`, it reuses
  `rankEntryDisplayOrder`, carries mutable `status` + immutable `provenance`, and exposes only the
  temporary `rankAwardId` anchor (G-011 / #380). Adding an unrelated caller merely to satisfy the old
  “contract-only” label would widen #377 beyond enforcement.
- The seam is adopted as the guard's positive contract: focused regression keeps its RankEntry
  query, highest-first/discipline behavior, no-brand law, trust axes, and temporary `awardedAt DESC
  NULLS LAST` anchor join green. #380 owns physical anchor removal.

### 4. FAILED_STEPS and policy boundary

- FS-0049 acknowledged: reviewer memory missed a retired-model query root. The scanner compares the
  candidate INDEX/commit with its base and mechanically rejects an increased RankAward-read root
  multiplicity. Existing transitional debt stays visible without becoming a broad path allowlist.
- FS-0028 remains semantically separate: the tracked hook invokes the domain scanner first, then its
  existing staged Oxfmt policy. Each has its own failure message and defeat proof.

## Cody implementation evidence (TASK_01 / TASK_02)

- Added standalone `scripts/rank-award-read-guard.ts` with `--staged`, `--base <ref>`, and
  `--fixture` modes. The scanner reads Git blobs (INDEX for hooks; base-vs-HEAD for CI), ignores
  writes, detects Prisma delegate + relation read roots, and permits only an adjacent explicit
  reviewed transitional exemption.
- Added checked positive fixtures for a RankAward write and an exempt fact-anchor join, plus a
  checked negative direct-display fixture. The tracked hook harness additionally proves a formatted
  write passes and a formatted `rankAward.findMany` fails through the installed hook path.
- Added always-run `RankAward read guard` CI job with full history, fixture proof, event-base diff,
  workflow-dispatch fallback, and fail-closed wiring into required `CI complete`.
- Focused evidence: scanner unit/defeat fixtures **4 pass / 0 fail**; root scripts typecheck **PASS**;
  tracked pre-commit integration harness **PASS**, including INDEX authority, installation,
  independent rank-read defeat, and read-only behavior; `member-ranks.test.ts` **8 pass / 0 fail**;
  `githooks/doctor.sh` **PASS**, including its new staged RankAward-guard check; shell syntax,
  `git diff --check`, and the post-change architecture gate **PASS**.

## Doug verification — TASK_03

### Doug — adversarial rank-read guard findings

**Rubric score:** 9.8 / 10 · **Hard cap triggered?** no

**P1 — Launch blockers**

- **ADDRESSED:** the first scanner compared only per-file root-kind multiplicity, so replacing an
  existing fact `findMany` with a different display `findMany` passed. Semantic AST fingerprints
  now distinguish changed roots while preserving formatting-only changes and pure renames;
  duplicate occurrences remain counted.
- **ADDRESSED:** bracket/optional delegate access, delegate aliases, typed/validated/shared select
  objects, same-name bindings in nested or sibling lexical scopes, and exported cross-file
  relation-bearing query constants initially bypassed detection. The final AST scanner and checked
  two-file hook fixture defeat each shape without flagging ordinary exported RankAward values.
- **ADDRESSED:** the first lexical relation matcher rejected nested RankAward writes and counted
  comments, strings, types, and ordinary object data. Final AST context recognizes relation keys
  only in Prisma read/query shapes and keeps writes/compatibility synchronization green.

**P2 — Must-fix soon**

- **ADDRESSED:** the first exemption accepted a bare marker or marker text in strings/same-line
  trivia. Final syntax requires an immediately preceding line comment with a nonempty reason.
- **ADDRESSED:** candidate/base blob reads initially converted an unexpected `git show` failure to
  empty source. Reads for diff-guaranteed blobs are now strict; the installed-hook harness injects
  a missing INDEX object and proves fail-closed behavior.

**P3 — Nice-to-have**

- None.

**Data gaps (not code bugs)**

- None. This is repository policy tooling; no runtime data, schema, or migration changed.

**Final evidence**

- Scanner semantic/adversarial suite: **19 pass / 0 fail**. Covers writes, relation reads,
  same-kind replacement, multiplicity, rename/move equivalence, dot/bracket/optional calls,
  delegate aliases, typed/validator/shared/cross-file selects, lexical-scope shadowing, strict
  exemptions, comments/strings/types, and ordinary exported values.
- Tracked hook integration: **PASS**. Covers INDEX authority, partial staging, installation,
  read-only behavior, allowed write, forbidden direct read, semantic replacement, pure rename,
  cross-file shared select, and missing-blob fail-closed defeat.
- RankEntry contract: `member-ranks.test.ts` **8 pass / 0 fail**. Full app unit suite:
  **1,963 pass / 0 fail** across 246 files (5,367 expectations).
- Static gates: root scripts `tsc --noEmit` **PASS**; app typecheck **PASS**; app lint **PASS** with
  pre-existing warnings only; app `format:check` **PASS**; shell syntax, `git diff --check`, and
  `githooks/doctor.sh` **PASS**. The CI job installs dependencies required by the scanner's
  TypeScript AST import, fetches full history, resolves the event base, runs on every change, and
  is fail-closed in required `CI complete` through `needs` + result checking.
- Build/runtime verification: **not applicable**. Diff touches policy scripts, tracked hooks, CI,
  fixtures/tests, and this SESSION record only; no app route, server action, Prisma runtime read,
  component, schema, or bundle input changed. App typecheck + complete unit suite are the
  proportional runtime boundary.
- Dirstarter docs check: **not applicable** — no Dirstarter-owned app layer changed. Security/data
  integrity caps do not apply; credible verification is complete, so no hostile-review cap fires.

**Verdict:** merge-ready at 9.8 after the addressed adversarial findings. TASK_03 is complete; hold
at the explicit push gate. No push, PR, merge, deploy, or bow-out was performed by Doug.

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0732_TASK_01 | landed | Complete RankAward reference inventory + allowed write/compatibility/fact-anchor versus forbidden member-display classification; `member-ranks.ts` retained as canonical RankEntry seam. |
| SESSION_0732_TASK_02 | landed | TypeScript-AST read guard, 21-case adversarial suite, fixtures, tracked INDEX hook + defeat harness/doctor proof, and always-run fail-closed CI job. |
| SESSION_0732_TASK_03 | landed | Doug three-pass verification + Giddy structural review; every P1/P2 fixed, full app/static gates green, Fallow introduced findings reduced to zero. |

**Decisions resolved:** compare semantic AST occurrence fingerprints across Git trees; writes remain
structurally legal; new fact/compatibility reads require an immediately preceding reasoned exemption;
cross-file exported relation/delegate roots are guarded; #380 retains physical bridge removal.

**Key files:** `scripts/rank-award-read-guard.ts` (policy),
`scripts/rank-award-read-guard.test.ts` + `scripts/fixtures/rank-award-read-guard/` (defeat proofs),
`scripts/githooks/pre-commit{,.test.sh}` + `doctor.sh` (tracked local enforcement), and
`.github/workflows/ci.yml` (required remote enforcement).

## Goal verdict

**YES — #377 now mechanically rejects new direct RankAward reads while preserving the temporary
write/compatibility/fact-anchor bridge; operator confirmed the goal hit.**

## Review log

### Giddy Gate Review — build lane

**Class:** C — new repository-policy primitive; reference is ADR 0058 + existing tracked-hook/CI pattern.

| Dim | Score | Evidence |
| --- | ---: | --- |
| D1 Correctness | 9.8 | 21 adversarial scanner tests, installed-hook defeat proofs, full app 1,963/0. |
| D2 Security/integrity | 9.8 | Strict Git blob reads; missing INDEX/blob failures close; no runtime/prod-data surface. |
| D3 Simplicity | 9.7 | Fallow after refactor: 0 introduced findings, avg CC 2.3, p90 5. |
| D4 Readability | 9.7 | Cohesive AST collector/binding/Git helpers; JETTY header names every consumer. |
| D5 Maintainability | 9.8 | MI 96.0; dead files/exports 0; 21 regression shapes. |
| D6 Scalability | 10.0 | Linear changed-file AST scan; CI scope avoids whole-repo runtime work. |
| D7 Convention/reuse | 9.8 | Standalone domain policy reuses tracked hook, doctor, and required-check pattern. |

**Weighted average / local composite:** 9.8/10 · **Caps:** none · **Verdict:** GO.
**Systemic health:** CI = pending pre-push (operator authorized; own-lane run URL required before
merge) · findings routed 2/2 (FS-0049, FS-0055) · FS patterns: none recurring.
**Reviewer verdicts:** Doug GO 9.8 · Giddy GO 9.8 · Desi n/a (no UI).
**Dirstarter docs check:** not applicable — repository policy tooling only; no L1/app layer changed.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | Scanner `@added/@why/@wired` current; SESSION + failed-steps frontmatter current; SESSION_0732↔0733 pairing added; no wiki index/component inventory change. |
| Wiki lint | `bun run wiki:lint`: 0 errors / 115 inherited warnings. |
| Reflections routing receipt | 3 lessons → 3 routes (FS-0049, FS-0055, SESSION_0732). |
| `/ggr` + code-quality gate | 9.8/10, no cap; Fallow initial 3 complexity findings → 0; MI 96.0. |
| Runtime verification (Doug) + artifact URL | No runtime surface touched; scanner 21/0, member-ranks 8/0, full app 1,963/0, typecheck/lint/format green; artifact n/a. |
| ADR / ubiquitous-language | No new decision/term; ADR 0058/legacy 0035 remain coherent and unchanged. |
| Deferral guard (§6.8) | Clean after the temporary anchor scope note was tied to G-011 / #380. |
| Memory sweep · next-session unblock | No memory change: durable policy lives in ADR/hook/FS row. #380 remains blocked on open #398; SESSION_0733 stages #398 proof first. |
| Git hygiene · Graphify update | `session-0732-ci-rank-read-guard`; single authorized push — see git log; Graphify 15,246 nodes / 33,881 edges / 1,774 communities. |

## Reflections

- Lexical/multiplicity guards cannot enforce model-read law across aliases, scopes, or files; AST + adversarial defeat fixtures made the prose executable. → route: FS-0049
- `bow-out-gates` classified the diff as five tracked files and missed untracked Class-C scanner complexity; GGR's explicit no-index audit caught three findings before push. → route: FS-0055
- Keeping domain policy separate from FS-0028 formatting preserved clear failures while sharing tracked installation and INDEX authority. → route: docs/sprints/SESSION_0732.md

## Artifacts

None published. The operator declined a frozen snapshot; use live `/app/state`.

## First task

1. Run the FS-0024 repo/remote guard and read issue #377, map #374, ADR 0058, FS-0049, the tracked
   githook framework, and current CI jobs.
2. Inventory every existing `RankAward` reference and classify allowed write/bridge/fact-anchor
   uses versus forbidden member-rank display reads.
3. Reuse the SESSION_0731.5 pre-commit guard/test harness, but keep its generic staged-format
   policy separate from #377's RankAward scanner. Build the tracked hook + CI guard with a negative
   fixture that proves a new forbidden read fails; run hook doctor, unit/type/lint/build gates, then
   hold the push for operator authorization.

## Next session

### Goal

Run the #380 one-table fold grill only after #398 supplies the required preview-environment proof.

### First task

Re-check #398 blocker evidence and the four ratified #380 forks before authorizing schema work.
