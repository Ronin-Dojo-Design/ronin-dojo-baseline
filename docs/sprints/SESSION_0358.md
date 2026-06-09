---
title: "SESSION 0358 — Passport-centric consolidation: admin add-person (+lineage placement) + read-repoint + doc leave-behind"
slug: session-0358
type: session--open
status: in-progress
created: 2026-06-08
updated: 2026-06-08
last_agent: claude-session-0358
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0357.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0358 — Passport-centric consolidation: admin add-person (+lineage placement) + read-repoint + doc leave-behind

## Date

2026-06-08

## Operator

Brian + claude-session-0358

## Goal

Continue the Passport-centric identity consolidation on the schema foundation landed in SESSION_0357.
Build the admin **add-person** flow (`/admin/users/new`) as **one action** creating a placeholder
`User` + `Passport` + stated `RankAward` + `Affiliation` + **minimal optional lineage placement** — the
operator's "admin needs to just add someone" BBL-launch payoff. Placement is the **first runtime
`createLineageMember` write** (LineageNode upsert → LineageTreeMember with `selectedRankAward` → optional
`PROMOTED_BY` edge), so an added person is visible **end-to-end** on the BBL tree + Top Ranked rail. Then
**repoint reads** (`memberSchoolLabel` + the directory people facet) onto the canonical sources (Passport /
Affiliation / RankAward) instead of `Membership`. Land the **doc leave-behind** (repo-truth-index
canonical-entity layer, `opening.md` links, glossary, one `human-code-runbook.md`) plus the **owed ADR**
(Passport+Shells = identity SoT; `Affiliation`; brand-color SoT = DB `BrandSettings`). Reconcile four
operational docs against the recent work.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0357.md`.
- Carryover: SESSION_0357 landed the **schema foundation** (RankAward `source`/`verificationStatus`,
  Passport identity fields, the `Affiliation` model, `OrganizationType.AFFILIATION`) and the rail→RankAward
  repoint (TASK_01). The add-person (TASK_03), read-repoint (TASK_04), and doc leave-behind (TASK_05) were
  explicitly carried to this session. This session executes them, including minimal lineage placement.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this file (only `SESSION_0358.md` untracked).
- Current HEAD at bow-in: `1d12735`
- Remote guard: `origin` = `Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd not `dirstarter_template`. FS-0024 passed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | The `/admin/tools/new` CRUD/submit-form idiom (react-hook-form + Zod + next-safe-action + `adminActionClient`); Prisma (User/Passport/RankAward/Affiliation + LineageNode/LineageTreeMember/LineageRelationship writes); the directory read-model (people facet / school label). |
| Extension or replacement | **Extension** — adds an admin create-person flow + the first runtime lineage member-create, mirroring `/admin/tools/new`; repoints read-models onto the canonical Passport/Affiliation/RankAward sources. No Dirstarter capability replaced. |
| Why justified | The add-person capability is marked Built in GAP_MATRIX but does not exist (SESSION_0357_FINDING_01); reads still point at `Membership` (wrong source); no runtime path places a person in a lineage tree (seeds only). |
| Risk if bypassed | Operators cannot add people; added people stay invisible on brand surfaces; BBL surfaces keep reading the wrong identity store; the schema foundation goes unused. |

Live docs checked during planning: `passport-and-shells.md`, lineage SOP (ADR 0016), `repo-truth-index.md`,
SESSION_0357 ledger, schema (`schema.prisma`) — 2026-06-08.

### Graphify check

- Graph status: current; stats at bow-in: 9760 nodes, 15390 edges, 1460 communities, 1645 files tracked.
- Queries used:
  - `admin add person create user passport rank award affiliation form`
- Files selected from graph (then verified by direct read):
  - `app/admin/tools/new/page.tsx`, `app/admin/users/_components/user-form.tsx`, `server/admin/users/{actions,schema}.ts`
  - `prisma/schema.prisma` (Passport / RankAward / Affiliation / LineageNode / LineageTreeMember / LineageRelationship)
  - `server/web/lineage/editor-actions.ts` (placement helpers — confirmed update-only, no runtime create)
- Verification note: all model + create-path facts confirmed by direct source read, not the graph alone.

### Grill outcome

Two grill rounds + a verification pass resolved the forks before planning:

1. **Visibility hook = lineage placement** (operator). A person becomes brand-visible on the rail/directory by
   being placed in a brand tree; `Affiliation` stays display-only.
2. **Minimal lineage placement BUILT this session** (operator confirmed, after correcting a misread). The form
   exposes a brand-scoped Tree select + an optional searchable Parent select only; the action does the full
   correct multi-row write. (An earlier "defer to next session" was the operator's misunderstanding, reverted.)
3. **Rank select = discipline-scoped cascade** (Discipline → Rank from that discipline's RankSystem; no hardcoding).
4. **Owed ADR written this session** (folded into the doc task).
5. **Edge semantics = visual parent + `PROMOTED_BY` `LineageRelationship`** referencing the stated RankAward
   (ADR 0016-correct). No x/y, no visual groups, no relationship-type picker.

**Decisive verification finding:** `LineageNode`/`LineageTreeMember` are created **only in seeds + test
fixtures** — there is no runtime "create lineage member" write anywhere; the editor only *updates* existing
members (`MEMBER_NOT_FOUND` otherwise). So placement is genuinely net-new surface (the long pole). The new
`createLineageMember` helper lives in `server/web/lineage/` so the editor can reuse it later. `User.email` is
`@unique` + non-null → add-person must mint a unique synthetic placeholder email (seed precedent).

### Drift logged

- Carrying **D-023** (person identity fragmented across Membership/DirectoryProfile/LineageNode/Passport) —
  this session pays down the read side (TASK_04) and the create side (TASK_01/02).

## Petey plan

### Goal

Ship admin add-person (one action: User+Passport+RankAward+Affiliation + minimal optional lineage placement),
repoint the school-label/people-facet reads onto Passport/Affiliation/RankAward, and land the doc leave-behind,
owed ADR, and a four-doc alignment reconciliation.

### Tasks

#### SESSION_0358_TASK_01 — `/admin/users/new` add-person core (one action)

- **Agent:** Cody → Doug/Playwright verify; Desi light form-consistency pass
- **What:** New admin route + form + a single `createPerson` action creating, in one transaction, a
  placeholder `User` (`isPlaceholder`, synthetic unique email, name required) + `Passport` + `RankAward`
  (`source=STATED`, `verificationStatus=UNVERIFIED`) + `Affiliation`. (Placement layered in TASK_02 — same action.)
- **Steps:**
  1. `server/admin/users/schema.ts` — add `createPersonSchema` (name req; displayName/identity optional;
     disciplineId + rankId; affiliation: organizationId OR free-text schoolName + role default `TRAINS_AT`).
  2. `server/admin/users/actions.ts` — `createPerson` (`adminActionClient`, one `db.$transaction`): user →
     passport → rankAward → affiliation; mint unique placeholder email (seed pattern); `revalidate(["/admin/users"])`.
  3. Select data sources (no hardcoding): discipline list + ranks-by-discipline (reuse `server/web/disciplines/queries.ts`
     / `server/admin/programs/queries.ts`; add a small admin query only if none fits); organization list (reuse
     directory/org queries). Discipline-scoped Rank cascade.
  4. `app/admin/users/new/page.tsx` (`withAdminPage` + `Wrapper`) + `_components/person-form.tsx`
     (react-hook-form + `zodResolver` + `useHookFormAction`); Organization searchable combobox + free-text fallback;
     `AffiliationRole` select. Add an "Add person" link on `/admin/users`.
  5. Browser-verify: submit creates all four rows (User `isPlaceholder` / Passport / RankAward STATED / Affiliation).
- **Done means:** route live; one submit creates the four rows; typecheck/biome/tests green; screenshot.
- **Depends on:** nothing.

#### SESSION_0358_TASK_02 — `createLineageMember` + minimal optional placement (extends the one action)

- **Agent:** Cody → Doug/Playwright verify
- **What:** The first runtime lineage member-create. A shared helper `createLineageMember` in
  `server/web/lineage/`, called inside the same `createPerson` transaction when placement fields are present.
- **Steps:**
  1. `createLineageMember` helper: upsert `LineageNode` (userId unique) → create `LineageTreeMember`
     (`selectedRankAward` = the stated award, `visualSortOrder` = append, `primaryVisualParentMemberId` =
     chosen parent) → when a parent is chosen, create a `PROMOTED_BY` `LineageRelationship`
     (fromNode = parent's node, toNode = new node, `rankAwardId` = the award) → `auditLog`. Reuse the editor's
     cycle/parent-existence validation utilities (`wouldCreateLineageParentCycle`, tree context).
  2. Extend `createPersonSchema` + `createPerson` with optional `treeId` + `parentMemberId`; call the helper in-transaction.
  3. Form: brand-scoped **Tree** select (auto-default if the brand has one tree) + optional searchable **Parent**
     select (members of the chosen tree). No x/y, no visual groups, no relationship-type picker.
  4. Browser-verify: place a created person under a parent; confirm they render on the BBL tree + Top Ranked rail.
- **Done means:** placed person appears on the tree + rail; `PROMOTED_BY` edge + LineageTreeMember rows exist;
  unit/integration test on `createLineageMember`; typecheck/biome/tests green; screenshot.
- **Depends on:** SESSION_0358_TASK_01.

#### SESSION_0358_TASK_03 — Repoint reads to canonical sources

- **Agent:** Cody → Doug
- **What:** `memberSchoolLabel` reads the current `Affiliation` (org name or free-text), not `Membership`; the
  directory people facet reads Passport (displayName/avatar) + Affiliation (school) + RankAward (rank). Exemplar
  surfaces, not a repo-wide sweep.
- **Steps:** locate the `memberSchoolLabel` source + directory people-facet projection; repoint to the canonical
  sources; keep the existing DTO/payload boundary; verify on `/directory` with a TASK_01/02-created person.
- **Done means:** school label + people facet read canonical sources; typecheck/biome green; `/directory` verified.
- **Depends on:** SESSION_0358_TASK_01 (needs Affiliation/Passport data to verify end-to-end).

#### SESSION_0358_TASK_04 — Doc leave-behind + owed ADR

- **Agent:** Petey (parallel subagent — docs only)
- **What:** repo-truth-index **canonical-entity source-of-truth** section (incl. brand-color SoT = DB
  `BrandSettings`); link the trio (`passport-and-shells`, `ronin-project-context`, lineage SOP) into `opening.md`;
  glossary entries (DTO, view-model, `fd`, Affiliation, RankAwardSource); one `human-code-runbook.md` (WP/Pods→TS map);
  **write the owed ADR** (Passport+Shells = identity SoT; `Affiliation` model; brand-color SoT = DB). No new ledgers.
- **Done means:** docs + ADR file exist; `bun run wiki:lint` green.
- **Depends on:** nothing (parallel).

#### SESSION_0358_TASK_05 — Four-doc alignment reconciliation

- **Agent:** Explore/Doug (parallel subagent — same docs lane as TASK_04)
- **What:** Assess `docs/security/*`, `docs/runbooks/deploy/bbl-production-runbook.md`,
  `docs/runbooks/sops/sop-data-and-wiring-flows.md`, `docs/runbooks/sops/sop-test-writing.md` against the recent
  Passport/Affiliation/RankAward work (recent work = truth). Update stale docs; route true misalignment to the
  `wiring-ledger` / `fail-fix-ledger` / next-session goal (only if a blocker).
- **Done means:** written assessment per doc (aligned | updated | routed); any edits + routing recorded.
- **Depends on:** nothing (parallel).

#### SESSION_0358_TASK_06 — Governance + verify + full bow-out

- **Agent:** Doug → Petey
- **What:** typecheck/biome/tests/wiki-lint; hostile close review; GAP_MATRIX BBL-EDITOR-001 correction;
  memory sweep; graphify update; full close + single push to `main`. Evaluate `npx fallow audit` as a
  dead-code check (recommend only; no install/CI adoption without approval).
- **Depends on:** all.

### Parallelism

- TASK_01 → TASK_02 inline + sequential (same `createPerson` action; placement is the long-pole net-new write).
- TASK_03 sequential after 01 (needs its data). TASK_04 + TASK_05 run **in parallel via subagents** (docs-only,
  disjoint from the code lane). TASK_06 last.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0358_TASK_01 | Cody (inline) → Doug/Desi | Clear execution mirroring `/admin/tools/new`; browser-verified |
| SESSION_0358_TASK_02 | Cody (inline) → Doug | Net-new runtime lineage write; highest risk; reuses editor validation |
| SESSION_0358_TASK_03 | Cody (inline) → Doug | Read-model repoint, same code lane; sequential on 01's data |
| SESSION_0358_TASK_04 | Petey subagent | Docs + ADR; disjoint from code → parallel |
| SESSION_0358_TASK_05 | Explore/Doug subagent | Doc reconciliation; disjoint from code → parallel |
| SESSION_0358_TASK_06 | Doug → Petey | Verify + full bow-out |

### Open decisions

- None blocking. (Affiliation org-select scope, required-field minimums, and synthetic-email format are
  Cody-pre-flight engineering details with stated defaults, not forks.)

### Risks

- **`createLineageMember` is net-new runtime graph mutation** — the long pole. Mitigate by reusing editor
  validation (`wouldCreateLineageParentCycle`, tree context) + a unit/integration test + browser proof.
- **`User.email @unique` non-null:** placeholder email collisions — mint deterministically-unique (cuid/slug); follow seed precedent.
- **Discipline-scoped rank query** may need a small new admin query if no existing one returns ranks-by-discipline.
- **Scope size:** six tasks. If the code lane (01–03) runs long, TASK_03 repoint may carry; the docs subagents
  (04/05) run cheaply in parallel regardless.

### Scope guard

- Minimal placement only: tree + optional parent + `PROMOTED_BY` edge. No x/y, no visual groups, no relationship-type picker.
- No slug consolidation; no semantic-yellow sweep; no demo-data purge.
- TASK_03 is the two named surfaces only — not a repo-wide read sweep.
- No `Membership.rankId` column removal (Baseline blast radius).

### Dirstarter implementation template

- **Docs read first:** `passport-and-shells.md`, lineage SOP (ADR 0016), `repo-truth-index.md`, SESSION_0357 — 2026-06-08.
- **Baseline pattern to extend:** `/admin/tools/new` → `ToolForm` create idiom (`adminActionClient` + `revalidate`);
  the lineage editor's placement helpers (validation reuse); the directory read-model + payloads (DTO) for TASK_03.
- **Custom delta:** the multi-row add-person action; the first runtime `createLineageMember`; the canonical-source repoint.
- **No-bypass proof:** mirrors the existing admin create pattern, reuses lineage validation + the directory read-model — no parallel system.

## Cody pre-flight

### Pre-flight: SESSION_0358_TASK_01 / TASK_02 (add-person + placement)

#### 1. Existing component scan

- Graphify query: `admin add person create user passport rank award affiliation form`.
- Found: `/admin/tools/new` + `ToolForm` (create idiom); `user-form.tsx` (edit-only, no create); `createTool`/`updateUser`
  actions (`adminActionClient` + `revalidate`); `server/web/disciplines/queries.ts` + `server/admin/programs/queries.ts`
  (discipline/rank); directory/org queries (organization list); `server/web/lineage/editor-actions.ts` placement
  helpers (update-only; validation reusable). No create-person action; no runtime member-create (confirms FINDING_01).

#### 2. L1 template scan

- Closest L1 pattern: `/admin/tools/new` submit-form (react-hook-form + Zod + `useHookFormAction` + next-safe-action).
- Primitive spot-check: `Form`/`FormField`/`Select` (`common/`), `ComboboxSelector` (searchable org + parent), `Wrapper`, `withAdminPage`.

#### 3. Composition decision

- New `person-form.tsx` composing existing `Form`/`Select`/combobox primitives; new `createPerson` action + `createPersonSchema`;
  new shared `createLineageMember` helper in `server/web/lineage/` (reuses editor validation utilities).

#### 4. Lane docs loaded

- `passport-and-shells.md`; lineage SOP / ADR 0016 (RankAward canonical); `repo-truth-index.md`; SESSION_0357 next-session block.

#### 5. Dev environment confirmed

- `cd apps/web && npx next dev --turbo` (FS-0002); admin host; gates `bun run typecheck` / `bunx biome check` / `bun test`.

#### 6. FAILED_STEPS check

- FS-0002 (dev command) acknowledged; FS-0024 git guard passed at bow-in; none open in admin-forms / lineage area.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0358_TASK_01 | landed | `/admin/users/new` add-person. New `createPerson` (`adminActionClient`, one `db.$transaction`): placeholder `User` (synthetic email) + `Passport` + stated `RankAward` + optional `Affiliation`. New `person-form.tsx` (rhf+Zod+next-safe-action; `DataSelect` discipline→rank cascade, `ComboboxSelector` org, role select). "Add person" CTA on `/admin/users`. **Browser-verified** end-to-end (POST 200 → redirect → DB rows confirmed). |
| SESSION_0358_TASK_02 | landed | `createLineageMember` (`server/web/lineage/create-lineage-member.ts`) — the **first runtime** LineageNode upsert + LineageTreeMember(selectedRankAward, visual parent) + optional `PROMOTED_BY` LineageRelationship + audit; wired into `createPerson` (same tx). Form: brand-scoped Tree select + optional searchable Parent. Integration test (4 cases, tagged fixtures + teardown) green; **browser-verified** placement under Rigan Machado. |
| SESSION_0358_TASK_03 | landed | Repoint reads to canonical sources. `memberSchoolLabel` → current `Affiliation` (org/free-text) then Membership fallback; directory org facet (`projectProfileOrganizations`) → Affiliation orgs then Membership. `affiliations` added to lineage + directory payloads. Tests updated (116 lineage/directory green). |
| SESSION_0358_TASK_04 | landed | Doc leave-behind: ADR 0025 (Passport SoT + Affiliation + brand-color SoT); repo-truth-index **canonical-entity layer**; `opening.md` identity-canon links; glossary (Affiliation, RankAwardSource — DTO/view-model/`fd` already present); new `human-code-runbook.md` (WP/Pods→TS). wiki-lint 0 errors. |
| SESSION_0358_TASK_05 | landed | Four-doc reconciliation (subagent): 7 docs aligned; `sop-data-and-wiring-flows.md` §5 updated (Passport SoT / RankAward / Affiliation); `sop-test-writing` aligned. 2 misalignments → next session (see Findings M1/M2). |
| SESSION_0358_TASK_06 | landed | Governance + verify + full bow-out (this section). |

## What landed

- **Admin add-person (`/admin/users/new`) — ONE action, browser-verified end-to-end.** `createPerson`
  (`adminActionClient`, single `db.$transaction`) creates a placeholder `User` (`isPlaceholder`, synthetic
  unique email) + `Passport` + stated `RankAward` (`STATED`/`UNVERIFIED`) + optional `Affiliation`. New
  `person-form.tsx` mirrors the `/admin/tools/new` idiom (react-hook-form + Zod + next-safe-action), with a
  discipline-scoped `DataSelect` rank cascade (belt swatches), a searchable `ComboboxSelector` org + free-text
  school + role, and an "Add person" CTA on `/admin/users`. The whole flow was driven in a real browser
  (dev-login → fill → submit → POST 200 → redirect → DB rows confirmed: User/Passport/RankAward/Affiliation).
- **First runtime lineage member-create (`createLineageMember`).** Before this, `LineageNode`/`LineageTreeMember`
  existed only via seeds; the editor only *updates*. The new shared helper (`server/web/lineage/`) upserts the
  node, creates the tree member (selecting the stated award + a visual parent), and — when a parent is given —
  records the canonical `PROMOTED_BY` `LineageRelationship` referencing that award (ADR 0016). Wired into
  `createPerson` in the same transaction (still one action). Integration test (place-under-parent, MEMBER_EXISTS,
  TREE_NOT_FOUND, root) green; **browser-verified** placing a black belt under Rigan Machado on the live tree.
- **Reads repointed to canonical sources (D-023).** `memberSchoolLabel` and the directory org facet now read the
  **Affiliation** axis (linked org → free-text school), falling back to Membership during the transition; both
  payloads gained `affiliations`. 116 lineage/directory tests green.
- **Doc leave-behind + owed ADR.** ADR 0025 (Passport = identity SoT; Affiliation; brand-color SoT = DB); a
  canonical-entity source-of-truth table in `repo-truth-index.md`; identity-canon links in `opening.md`; glossary
  (Affiliation, RankAwardSource); a new `human-code-runbook.md` (WP/Pods→TS). Four operational docs reconciled
  (sop-data-and-wiring-flows §5 corrected). wiki-lint 0 errors.
- **Goal reached** for the planned scope (add-person + placement + repoint + docs). Two follow-ups surfaced
  (security-doc coverage M1, a wiring-flow diagram M2) plus an operator-raised **form/identity consolidation**
  need — all routed to next session.

## Decisions resolved

- Minimal lineage placement **built this session** (operator confirmed after correcting a misread).
- Visibility hook = lineage placement; `Affiliation` is display-only.
- Rank select = discipline-scoped cascade; no hardcoding.
- Edge semantics = visual parent + `PROMOTED_BY` edge referencing the stated RankAward.
- Owed ADR written this session (TASK_04).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/admin/users/schema.ts` | New `createPersonSchema` (name/displayName/email, disciplineId+rankId, affiliation org/schoolName/role, optional treeId/parentMemberId). |
| `apps/web/server/admin/users/actions.ts` | New `createPerson` action — one transaction: User+Passport+RankAward+Affiliation (+ optional `createLineageMember`). |
| `apps/web/server/admin/users/queries.ts` | New `findAddPersonOptions` (brand-scoped disciplines, ranks-by-discipline, orgs, trees, tree members). |
| `apps/web/app/admin/users/_components/person-form.tsx` | **New.** Add-person form (DataSelect cascade + ComboboxSelector + placement section). |
| `apps/web/app/admin/users/new/page.tsx` | **New.** `withAdminPage` route rendering `PersonForm`. |
| `apps/web/app/admin/users/_components/users-table.tsx` | "Add person" CTA in the table header (Invite user → secondary). |
| `apps/web/server/web/lineage/create-lineage-member.ts` | **New.** First runtime LineageNode/LineageTreeMember + PROMOTED_BY create helper + audit. |
| `apps/web/server/web/lineage/create-lineage-member.test.ts` | **New.** Integration test (4 cases, tagged fixtures + teardown). |
| `apps/web/server/web/lineage/payloads.ts` | Added `affiliations` (current) to `lineageNodeRowPayload`. |
| `apps/web/lib/lineage/canvas-model.ts` | `memberSchoolLabel` → Affiliation-first (Membership fallback). |
| `apps/web/lib/lineage/canvas-model.test.ts` | Affiliation-precedence test + `affiliations` fixture. |
| `apps/web/server/web/directory/payloads.ts` | New `directoryAffiliationPayload`; `affiliations` on the list payload. |
| `apps/web/server/web/directory/profile-projection.ts` | New `projectProfileOrganizations` (Affiliation-first); org facet repoint. |
| `apps/web/server/web/directory/profile-projection.test.ts` | Affiliation-precedence test + `affiliations` fixture. |
| `docs/architecture/decisions/0025-passport-identity-source-of-truth.md` | **New ADR** — Passport SoT + Affiliation + brand-color SoT. |
| `docs/knowledge/wiki/repo-truth-index.md` | New "Canonical entity source-of-truth" section (entity → SoT table). |
| `docs/rituals/opening.md` | Identity-canon links in step 3 (passport-and-shells, ronin-project-context, lineage SOP, repo-truth-index, ADR 0025). |
| `docs/architecture/ubiquitous-language.md` | New terms: Affiliation, RankAwardSource. |
| `docs/runbooks/porting/human-code-runbook.md` | **New.** WP/Pods → TS mapping. |
| `docs/runbooks/sops/sop-data-and-wiring-flows.md` | §5 identity-shell flow corrected (Passport SoT / RankAward / Affiliation). |
| `docs/sprints/SESSION_0358.md` | This ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | ✅ clean (after `prisma generate`) |
| `bunx biome check` (14 changed/new TS/TSX) | ✅ clean |
| `bun test server/web/lineage/create-lineage-member.test.ts` | ✅ 4 pass |
| `bun test lib/lineage/canvas-model.test.ts` | ✅ 9 pass |
| `bun test server/web/lineage/ server/web/directory/` | ✅ 116 pass |
| `bun test server/admin/users/` | ✅ 2 pass |
| `bun run wiki:lint` | ✅ 0 errors, 0 warnings |
| Browser — add-person submit → POST 200 → redirect to `/admin/users` | ✅ (DB rows confirmed: User `isPlaceholder` + Passport + RankAward STATED + Affiliation) |
| Browser — placement under Rigan Machado | ✅ LineageTreeMember(selectedRankAward) + `PROMOTED_BY` edge confirmed in DB |
| Test data cleanup | ✅ 5 users + leaked fixtures removed; temp scripts deleted |

## Open decisions / blockers

- **Form/identity shape (operator, this session):** the add-person form collects a single `name`
  (→ `User.name`) + `displayName`, but **does not** populate `Passport.legalFirstName`/`legalLastName`
  (or dob/gender/phone). It diverges from how invite / claim / registration forms collect a person.
  → next session (form consolidation + schema alignment). Not a blocker for what landed.
- **M1 — security docs don't cover add-person (medium).** Risk register Risk #3 + brand-scope-hardening
  allowlist don't account for admin placeholder-`User` minting (synthetic email) or the new brand-scoped
  models (Affiliation/RankAward/LineageNode/TreeMember/Relationship). → next-session security pass.
- **M2 — no wiring-flow diagram for add-person → placement (low–medium).** `sop-data-and-wiring-flows`
  documents the static identity model (fixed this session) but has no numbered *create-flow* diagram for
  `createPerson → createLineageMember`. → next-session doc add.
- **Dev-server staleness gotcha:** a long-running `next dev` from a prior session served a stale Prisma
  client (`Unknown argument 'source'`) even though the on-disk client was current. Restart `next dev` (and
  `prisma generate`) after any migration before browser-verifying. (Reflections + memory.)

## Next session

### Goal

Consolidate the person-creation surfaces onto the canonical Passport identity shape, then layer the richer
lineage-placement controls. (BBL-launch-relevant: a consistent "add/invite/claim/register a person" path.)

### First task

**Form + identity consolidation (operator-raised).** Give add-person a real **first name / last name**
(`Passport.legalFirstName`/`legalLastName`) instead of a single `name`, and **align the person-creation
forms** — add-person, invite, profile-claim, and registration — onto one shared person view-model + field
set (name parts, displayName, email, identity fields), reconciling the **backend schema** (`User.name`
derivation vs Passport legal-name fields) so all four write the same canonical shape. Audit the four forms
for drift first (Desi), then consolidate (Cody). **Then** layer the richer lineage-placement controls
deferred this session — **free x/y positioning, visual groups, and a relationship-type picker** — onto
`createLineageMember` / the add-person form + lineage editor. Also fold in: **M1** (security-doc coverage for
the add-person authz surface) and **M2** (the add-person→placement wiring-flow diagram). Deferred still: slug
consolidation; semantic-yellow sweep; demo-data cleanup.

## Review log

### SESSION_0358_REVIEW_01 — add-person + placement + repoint + docs

- **Reviewed tasks:** TASK_01–05.
- **Dirstarter docs check:** extended the `/admin/tools/new` create idiom + the directory read-model
  (cached docs sufficient); the add-person + `createLineageMember` writes are custom delta over the L1
  CRUD pattern, no Dirstarter capability replaced.
- **Verdict:** Pass. The add-person flow is a clean mirror of the existing admin create idiom and was
  proven end-to-end in a real browser (not just unit tests) — including catching two real bugs the unit
  tests could not: the Base UI `Button` default `type="button"` (no native submit) and a stale long-running
  dev server serving an old Prisma client. `createLineageMember` fills a genuine gap (first runtime
  member-create) and is reusable by the editor. The repoint is exemplar-scoped with a Membership fallback
  (no Baseline regression). Honest gap: the form is a partial Passport shape (single `name`), surfaced by
  the operator → next-session consolidation.
- **Score:** 8.5/10 locally.
- **Follow-up:** form/identity consolidation (first/last name + invite/claim/registration alignment + schema);
  M1 security-doc coverage; M2 wiring-flow diagram; richer placement controls (x/y, groups, relationship-type).

## Hostile close review

- **Giddy:** Pass — reuses existing primitives (`DataSelect`, `ComboboxSelector`, `BeltSwatch`, the directory
  read-model, the lineage payload) and the established `adminActionClient`+`revalidate` idiom; no parallel
  system. `createLineageMember` is net-new but is the *missing* runtime path, not a fork — and it's a shared
  helper the editor can adopt.
- **Doug:** Pass — typecheck + biome (14 files) + wiki-lint (0 errors) green; the new helper has an
  integration test with proper tagged-fixture teardown (clears `AuditLog` before users for the RESTRICT FK);
  both add-person and placement browser-verified with DB confirmation; test data cleaned up. Honest gaps
  recorded (M1/M2, form shape).
- **Desi:** Pass (light) — the form mirrors the other admin forms (Form/FormField/DataSelect), belt swatch
  uses the canonical `BeltSwatch` (no hardcoded color), placement section carries a plain-language visibility
  note. Cross-form consistency (add-person vs invite/claim/registration) is the operator-raised next-session item.
- **Security review:** the add-person action is `adminActionClient`-gated; it mints a placeholder `User` with a
  synthetic `@placeholder.invalid` email + `isPlaceholder`. `createLineageMember` enforces tree brand-ownership.
  No new public payload surface (the directory facet still gates by tier/visibility). **M1** (security docs don't
  yet model this admin write surface or the new brand-scoped models) is logged for next session.
- **Kaizen aggregate:** 8.5/10 — browser-proven, honestly scoped, reusable helper; the standout lesson is that
  the live-DOM run caught two bugs (button type, stale dev client) that all green unit tests missed.

### Findings (severity ≥ medium)

#### SESSION_0358_FINDING_01 — Security docs don't cover the add-person authz/data surface (M1)

- **Severity:** medium
- **Task:** TASK_05 (surfaced by the reconciliation subagent)
- **Evidence:** `docs/security/ronin-security-risk-register.md` Risk #3; `docs/security/brand-scope-hardening-plan.md` §1 model allowlist (no `Affiliation`/`RankAward`/`LineageNode`/`LineageTreeMember`/`LineageRelationship`); `apps/web/server/admin/users/actions.ts` (`createPerson` mints placeholder `User` + synthetic email).
- **Impact:** the new admin identity-write surface + brand-scoped models are undocumented in the security model.
- **Required follow-up:** next-session security pass — extend Risk #3 + the brand-scope allowlist.
- **Status:** open (next session).

#### SESSION_0358_FINDING_02 — No wiring-flow diagram for add-person → lineage placement (M2)

- **Severity:** low–medium
- **Task:** TASK_05
- **Evidence:** `docs/runbooks/sops/sop-data-and-wiring-flows.md` — §5 static identity model corrected, but no numbered create-flow for `createPerson → createLineageMember` (cf. invite→claim §15).
- **Impact:** the major new create flow isn't diagrammed for the next agent.
- **Required follow-up:** add a numbered "Add-person / lineage placement" flow section next session.
- **Status:** open (next session).

#### SESSION_0358_FINDING_03 — Add-person form is a partial Passport identity shape (operator-raised)

- **Severity:** medium
- **Task:** TASK_01
- **Evidence:** `apps/web/app/admin/users/_components/person-form.tsx` + `createPersonSchema` collect a single `name` → `User.name` + `Passport.displayName`; `Passport.legalFirstName`/`legalLastName` (and dob/gender/phone) are not captured. Diverges from invite/claim/registration forms.
- **Impact:** identity records created via add-person lack legal first/last name; person-creation forms are not consolidated onto one shape.
- **Required follow-up:** next-session form + schema consolidation (first task).
- **Status:** open (next session).

## ADR / ubiquitous-language check

- ADR update **done** — [ADR 0025](../architecture/decisions/0025-passport-identity-source-of-truth.md) written
  (Passport = identity SoT; `Affiliation`; brand-color SoT = DB `BrandSettings`); it extends ADR 0016 and
  records the `createLineageMember` runtime write. Touches Prisma (L1); alignment woven into Consequences.
- Ubiquitous-language update **done** — `Affiliation` + `RankAwardSource` added to `ubiquitous-language.md`;
  DTO / view-model / `fd` were already present in `repo-code-glossary.md` (no change needed).

## Reflections

- **Live-DOM verification earned its keep — twice.** typecheck + biome + 120+ unit tests were all green while
  the form silently failed to submit (Base UI `Button` defaults to `type="button"`, so no native submit fired)
  AND the action threw `Unknown argument 'source'` because a long-running `next dev` from a prior session was
  serving a stale Prisma client. Neither is catchable without running the real app. The operator's standing
  "prove it on the live DOM" lesson (the SESSION_0357 yellow chase) held again — and the diagnosis path was
  network-tab → response body → restart server, not more code edits.
- **The "one action" held under real data.** Replicating the exact write server-side first (a throwaway script)
  isolated backend-correct from frontend-broken in one step, which is what let me localize the bug to the form.
- **Scope discipline:** the operator twice corrected my read of the placement decision (defer vs build), and
  late-flagged the form/identity-shape gap. Capturing those as explicit next-session findings (not silently
  expanding) kept the session shippable while honoring the bigger consolidation they want.
- **A subagent paid off for the read-heavy doc reconciliation** (7 docs assessed, 1 corrected, 2 misalignments
  reported) while the code lane ran inline — the genuinely-disjoint split the orchestration model is for.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Bumped `updated`/`last_agent` on `repo-truth-index.md`, `opening.md`, `ubiquitous-language.md`; new ADR 0025 + `human-code-runbook.md` carry full frontmatter. |
| Backlinks/index sweep | ADR 0025 + runbook `pairs_with` the canon docs; wiki `index.md` row added (below). |
| Wiki lint | `bun run wiki:lint` — ✅ 0 errors, 0 warnings (2 introduced warnings fixed: leading-`+` line-as-list). |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0358_REVIEW_01 + Giddy/Doug/Desi/security + 3 findings. |
| Review & Recommend | Next session = form/identity consolidation, then richer placement + M1/M2. |
| Memory sweep | Updated `passport-identity-consolidation`; new gotcha note (dev-server stale Prisma client + Base UI button type). |
| Next session unblock check | Unblocked — form consolidation is doable now (schema + 4 forms exist). |
| Git hygiene | Branch `main`; FS-0024 guard passed; single push — hash reported at bow-out / see git log. |
| Graphify update | `graphify update .` before the commit — incremental (244 nodes / 945 edges touched); total **9793 nodes / 15487 edges / 1445 communities / 1639 files**. |
</content>
