---
title: "SESSION 0510 — AdminCollection + Passport consolidation, then authz conformance sweep"
slug: session-0510
type: session--open
status: closed
created: 2026-07-07
updated: 2026-07-07
last_agent: claude-session-0510
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0509.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/architecture/research/research-review-authz-systems.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0510 — AdminCollection + Passport consolidation, then authz conformance sweep

## Date

2026-07-07

## Operator

Brian + claude-session-0510

## Goal

Two sequenced lanes pinned by the operator from SESSION_0509's Next-session block. **Item 1
(foundation):** land the `AdminCollection` frame (one generic shell over the `components/data-table/*`
kit), conform `/app/users` into the Passport-backed **People** collection (accountless placeholders
included), reframe `/app/brand-settings` into a single-brand **Appearance** editor (keep the pickers —
operator revision of the earlier "delete" call), and land bio **Slice A** (fold `LineageNode.bio` →
`Passport.bio` + backfill). **Item 2 (behind it):** the 7-item authz conformance sweep — keep the 4
authz axes, conform them, do **not** merge; the one security-gate item is adversarial-tests-first and
operator-gated before landing.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0509.md`
- Carryover: 0509 shipped per-user RBAC capability grants (`UserPermissionGrant`) and deferred the
  AdminCollection + profile-consolidation lane (operator pivoted). 0509's Next-session block pins that
  lane as #1 and the authz conformance sweep as #2. This session executes both, in that order.

### Branch and worktree

- Branch: `session-0510-adminpassport`
- Worktree: `/Users/brianscott/dev/ronin-0510-adminpassport`
- Status at bow-in: clean (fresh off `origin/main`)
- Current HEAD at bow-in: `1002b0d1`
- FS-0024 guard: `pwd` confirmed the ronin-dojo-app checkout; remote `Ronin-Dojo-Design/ronin-dojo-baseline`.
- Fresh-worktree bootstrap: done — `.env` copied, `bun install` (exit 0), `bunx prisma generate` OK.
- Live siblings NOT touched: 0503/0504/0505/0506; `../ronin-dojo-monorepo` READ-ONLY.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming (`/app/brand-settings` → Appearance editor), auth (People action gating), Prisma (bio Slice A migration) |
| Extension or replacement | Extension: `AdminCollection` wraps the existing `components/data-table/*` kit; Appearance editor keeps the live `BrandSettings` SoT |
| Why justified | The law (memory `admin-collection-one-surface-law`) makes conformance the cheap path; no L1 capability is replaced |
| Risk if bypassed | Continued admin-surface sprawl; `/app/users` stays a stunted account list, placeholders invisible |

### Grill outcome

Five forks resolved with the operator (recs accepted except Fork 4):

1. **Rollout scope** — build `AdminCollection` + conform `/app/users` as the single reference
   implementation; ledger the other ~29 kit pages + non-kit stragglers (media/organizations/claims/
   leads-pipeline) as a follow-up conformance sweep.
2. **People collection** — flip `/app/users` from `db.user.findMany` → `db.passport.findMany`
   (Passport-keyed; accountless placeholders via `userId == null`), keep the `/app/users` route,
   relabel nav → "People". Account-only row actions hide/disable on placeholder rows.
3. **bio Slice A** — `LineageNode.passportId` is `@unique NOT NULL` (clean fold). Backfill
   `Passport.bio` from `LineageNode.bio` where null (**Passport.bio wins** on conflict); repoint
   lineage editor + readers to `passport.bio`; **defer** the `LineageNode.bio` column drop to a later
   slice (destructive; `migrate dev` banned on shared local DB).
4. **brand-settings (operator revision)** — do **NOT** delete the editing capability. The multi-brand
   switcher is already dead (form hard-codes BBL); reframe the route as a single-brand **Appearance**
   editor, keep the color/logo/favicon/og pickers over the live `BrandSettings` SoT. Follow-ups
   queued: font settings + an optional `appearance.manage` RBAC grant (ties into 0509's grant system).
5. **ADR / doc prune** — ratify one tight ADR for the AdminCollection law + point CLAUDE.md/
   cody-preflight at it; **defer** the full enforcement-doc prune sweep to a dedicated docs session.

## Petey plan

### Goal

Land Item 1 (AdminCollection frame + People collection + Appearance editor + bio Slice A) as the
foundation, then sequence Item 2 (authz conformance sweep) behind it, security-gate item last and
tests-first.

### Tasks

#### SESSION_0510_TASK_01 — Build the `AdminCollection` frame

- **Agent:** Cody
- **What:** One generic shell over `components/data-table/*` — props: data-source promise + columns
  (+ toolbar/faceted-filter config) → the full `/app/tools` experience for free.
- **Steps:** Extract the near-identical `*-table.tsx` boilerplate into `AdminCollection`; keep
  per-entity `columns` declarations. Prove it renders one existing surface unchanged.
- **Done means:** `AdminCollection` exists; a reference page renders through it with no behavior change.
- **Depends on:** nothing

#### SESSION_0510_TASK_02 — Conform `/app/users` → Passport-backed People collection

- **Agent:** Cody
- **What:** Flip the query to `db.passport.findMany` (People; placeholders included), member columns
  (Name/Belt/Listed-under/Verified/School/Account/Role), placeholder-aware action gating.
- **Steps:** New People query + columns; render via `AdminCollection`; hide account-only actions
  (RBAC grant, role change, ban, delete-account) when `passport.userId == null`; relabel nav "People".
- **Done means:** `/app/users` lists every Person incl. accountless placeholders; account-only actions
  correctly gated; existing account actions still work for account-holders.
- **Depends on:** SESSION_0510_TASK_01

#### SESSION_0510_TASK_03 — Reframe `/app/brand-settings` → Appearance editor

- **Agent:** Cody
- **What:** Keep the editor; relabel nav + heading "Appearance"; strip residual multi-brand framing;
  confirm admin gating; leave `BrandSettings` model + seed + `layout.tsx` injection untouched.
- **Done means:** Appearance editor saves color/logo/favicon/og to the live SoT; no multi-brand UI.
- **Depends on:** nothing

#### SESSION_0510_TASK_04 — bio Slice A (fold LineageNode.bio → Passport.bio)

- **Agent:** Cody (careful; hand-authored migration)
- **What:** Additive backfill (`Passport.bio` ← `LineageNode.bio` where null) + repoint lineage
  editor (`node-profile-actions.ts`) and readers (canvas board-card, drawer info-tab,
  `node-profile-queries`) to `passport.bio`.
- **Steps:** Hand-author migration + shadow-replay (no `migrate dev`); backfill null-only; repoint
  reader/writer; leave `LineageNode.bio` column in place (drop = later slice).
- **Done means:** lineage bio reads/writes `passport.bio`; existing values backfilled; directory/me
  unaffected; column drop deferred.
- **Depends on:** nothing (independent of the table work)

#### SESSION_0510_TASK_05 — ADR: ratify the AdminCollection law

- **Agent:** Cody
- **What:** One tight ADR capturing the AdminCollection-one-surface law; link from CLAUDE.md /
  cody-preflight. Defer the full enforcement-doc prune.
- **Done means:** ADR filed + referenced in the read-path; prune sweep ledgered, not done.
- **Depends on:** SESSION_0510_TASK_01

#### SESSION_0510_TASK_06 — Authz conformance sweep (Item 2, quick-win batch)

- **Agent:** Cody (sequential batches; no fan-out — overlapping authz files)
- **What:** Keep the 4 axes, conform: (1) delete 3 dead admin HOCs; (2) unify/label near-twin lineage
  helpers; (3) convert 19 raw `role === "admin"` → `can()`/`isAdmin()`; (4) merge twin entitlement
  checkers; (6) `safe-actions.ts` → `isAdmin()`; (7) ratify deny-table + 4-axes rule in `auth.md`.
- **Done means:** the 6 low-risk items land gate-green; no axis merged.
- **Depends on:** Item 1 (conform the consolidated surface, not the old one)

#### SESSION_0510_TASK_07 — Authz security gate (Item 2 #5) — ADVERSARIAL-TESTS-FIRST, operator-gated

- **Agent:** Cody (build) + Doug (adversarial verify); Petey grill + operator sign-off before landing
- **What:** Migrate the hand-rolled lineage editor resolvers → canonical `resource-permissions.ts`.
- **Steps:** Write negative/adversarial tests (red) **before** touching the gate; make green; grill +
  show the operator the diff **before** landing. Treat as security-sensitive.
- **Done means:** resolvers on the canonical path; adversarial tests present and green; operator signed off.
- **Depends on:** SESSION_0510_TASK_06

### Parallelism

Item 1 tasks touch coupled files → mostly sequential single-Cody (TASK_01 → 02; 03 and 04 independent
and can interleave). Item 2 is sequenced entirely behind Item 1; its quick-win batch runs sequentially
(overlapping authz files — no fan-out per the clobber lesson), the security gate runs last, tests-first.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01–05 | Cody → Doug | Coupled build; single coherent lane, verify the diff |
| TASK_06 | Cody | Mechanical conform, sequential batches |
| TASK_07 | Cody + Doug + operator | Security gate; adversarial-tests-first + sign-off |

### Open decisions

- Route rename `/app/users` → `/app/people`? Default: keep `/app/users`, relabel nav only.
- Appearance editor route rename to `/app/appearance`? Default: keep route, relabel only.

### Risks

- bio Slice A migration on the shared local DB — hand-author + shadow-replay only; never `migrate dev`.
- The security-gate migration (TASK_07) is a real authz boundary — tests-first + operator sign-off.

### Scope guard

- Do **not** retrofit the other ~29 kit pages or rebuild `/app/media`/organizations/claims this session
  (ledger follow-up).
- Do **not** drop the `LineageNode.bio` column this session (deferred slice).
- Do **not** delete `BrandSettings` model / seed / layout injection.
- Do **not** merge any authz axis; conform only.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0510_TASK_01 | landed | AdminCollection frame built (`components/admin/admin-collection.tsx`); `/app/users` migrated onto it behavior-identical; typecheck/lint/SSR-smoke green |
| SESSION_0510_TASK_02a | landed | `/app/users` LIST → Passport-keyed `findPeople` (`server/admin/people/*`); member columns (Name/Account/Belt/School/Verified/Listed-under/Created) via resolver-mirrors; account-only actions gated on `userId==null`; 41 placeholders now visible; 0509 RBAC detail flow untouched; gates green |
| SESSION_0510_TASK_02b | deferred (operator fork) | Unify row→detail→PassportEditor (re-key `[id]` userId→passportId + conditional account panel). Higher-risk re-key on the account surface — surfaced for operator decision, not built overnight |
| SESSION_0510_TASK_03 | landed | Reframed `/app/brand-settings` → **Appearance** editor (operator Fork-4 revision: keep the capability, not delete). Relabeled nav+H2 "Appearance", stripped the multi-brand `Black Belt Legacy` H3 vestige → "Theme", toast "Appearance saved". Route/permission/redirects + `BrandSettings` model/seed/layout injection untouched. Follow-ups ledgered: font settings + `appearance.manage` RBAC grant. Gates green |
| SESSION_0510_TASK_04 | landed | bio Slice A: `Passport.bio` is now SoT. Null-only idempotent backfill migration (`20260707223000_slice_a_backfill_passport_bio_from_lineage_node`, applied via `migrate deploy`, status clean); precedence proven (existing passport bios preserved, 12 nulls filled). Writer + all lineage readers (payloads/queries/board-card/drawer/edit-form) repointed to `passport.bio`; zero node-level bio refs remain; `LineageNode.bio` column retained (drop deferred). Directory/me untouched. Gates green + render smoke confirms bio renders from passport |
| SESSION_0510_TASK_05 | landed | ADR 0045 (AdminCollection: one frame, one editor, Passport-backed People, Appearance-not-deleted, conform-incrementally) filed + cody-preflight rule 5 pointer added. Full enforcement-doc prune deferred (separate docs lane, per ADR D5) |
| SESSION_0510_TASK_06 | landed | Authz conformance quick-wins (items 1/2/3/4/6). 19 files. Item1: deleted 3 dead HOCs + empty `auth-hoc.tsx`, relocated `hasLineageAdminAccess`→`auth-guard.ts` (2 live importers updated). Item2: co-locate+label do-not-merge twins + extracted shared `hasLineageTreeGrant` query primitive. Item3: ~11 raw `role==="admin"` sites → `can(key)` (action gates, all admin-only keys = NO widening) / `isAdmin()` (identity), no-widening tests added. Item4: merged entitlement twin (cache-safe, 1 consumer). Item6: `safe-actions.ts`→`isAdmin()`/`roleOf()`. NO axis merged. Gates green |
| SESSION_0510_TASK_07-item7 | landed | Ratified the 4-axes resolver law + deny-behavior table in `docs/architecture/auth.md` (new "Authorization axes — the resolver law" section, cross-refs the research doc) |
| SESSION_0510_TASK_07 | tests+proposal landed; MIGRATION HELD for operator | Security gate (sweep item 5). 33 adversarial characterization tests (`editor-authorization.security.test.ts`, green vs current behavior, ZERO source diffs) pin the promotion-authoring boundary (cross-tree/brand/branch/node isolation, revoked-grant hygiene, org-role paths, admin short-circuit, `buildAuthorizedRankAwardWhere` where-shape). Proposal doc `0510-item5-...migration-proposal.md` (sign-off-gated). Findings: F-1 `editorRoles` filter is a DB no-op (enum has only editor roles — pinned); F-2 revoked grants correctly denied in BOTH paths (boundary sound); F-3 no `expiresAt` axis. **Migration NOT performed — awaits operator sign-off** (org-role/self-award/`buildAuthorizedRankAwardWhere` have no canonical equivalent = the real risk) |

## What landed

**Item 1 — AdminCollection + Passport consolidation (foundation):**
- `AdminCollection<TData>` frame (`components/admin/admin-collection.tsx`) over the `data-table` kit — "new admin surface = columns + query."
- `/app/users` conformed to the **Passport-keyed People collection** (`server/admin/people/*`): all 3 populations surface (443 userless roster placeholders + add-person placeholders + 23 real accounts), member columns via `canvas-model.ts` resolver-mirrors, account-only actions gated on `userId==null`. Dead old list stack removed.
- `/app/brand-settings` → single-brand **Appearance** editor (operator Fork-4 revision — kept, not deleted; multi-brand vestige stripped).
- bio **Slice A**: `Passport.bio` is now SoT (writer + all lineage readers repointed; null-only idempotent backfill migration; `LineageNode.bio` column retained, drop deferred).
- **ADR 0045** ratifies the AdminCollection law; cody-preflight rule 5 points at it.

**Item 2 — authz conformance sweep (keep 4 axes, conform, no merge):**
- Quick-wins (items 1/2/3/4/6): deleted 3 dead HOCs + relocated `hasLineageAdminAccess`→`auth-guard.ts`; co-locate+label the lineage-grant twins + extracted `hasLineageTreeGrant`; converted ~11 raw `role==="admin"` → `can(key)` (action, admin-only keys → no widening) / `isAdmin()` (identity); merged the `checkEntitlement`→`hasEntitlement` twin; `safe-actions.ts`→`isAdmin()`/`roleOf()`.
- Item 7: ratified the 4-axes resolver law + deny-behavior table in `auth.md`.
- Item 5 (security gate): **characterized only** — 33 adversarial DENY tests (zero resolver diffs) + a sign-off-gated migration proposal. **Migration NOT performed** (awaits operator sign-off).

Goal reached: both pinned lanes landed, with TASK_02b and the item-5 migration correctly deferred/gated by design.

## Decisions resolved

- Fork 1 — build the frame + ONE exemplar (`/app/users`); ledger the ~29-page conformance sweep (WL-P2-34).
- Fork 2 — People = Passport-keyed, keep the `/app/users` route (relabel nav "People"); account-only actions gate on `userId==null`.
- Fork 3 — bio Slice A: Passport.bio wins on conflict, backfill nulls-only, defer the `LineageNode.bio` column drop.
- **Fork 4 (operator revision)** — do NOT delete `/app/brand-settings`; reframe as the single-brand Appearance editor (keep the color/asset pickers). Fonts + `appearance.manage` grant = follow-ups (WL-P3-32).
- Fork 5 — ratify one ADR (0045) now; defer the full enforcement-doc prune.
- Item-5 migration held for operator sign-off (adversarial-tests-first honored).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/admin/admin-collection.tsx` | NEW — the generic admin-list frame |
| `apps/web/server/admin/people/{queries,schema}.ts` | NEW — Passport-keyed `findPeople` + params |
| `apps/web/app/app/users/_components/people-*.tsx`, `person-actions.tsx` | NEW — People table + gated actions |
| `apps/web/app/app/users/page.tsx`, `_components/users-table*.tsx` (deleted) | Page → People; dead old list stack removed |
| `apps/web/app/app/brand-settings/{page,_components/brand-settings-form}.tsx` | Reframe → Appearance |
| `apps/web/config/admin-sections.ts` | Nav labels: Users→People, Brand Settings→Appearance |
| `apps/web/prisma/migrations/20260707223000_slice_a_backfill_passport_bio_from_lineage_node/` | NEW — bio backfill (data-only) |
| `apps/web/server/web/lineage/{payloads,node-profile-actions,node-profile-queries}.ts` + lineage bio readers | Repoint bio → `passport.bio` |
| `apps/web/components/admin/auth-hoc.tsx` (deleted), `lib/auth-guard.ts` | Delete dead HOCs; relocate `hasLineageAdminAccess` + `hasLineageTreeGrant` |
| `apps/web/server/{web,admin}/**` (~11 sites), `lib/safe-actions.ts` | raw `role==="admin"` → `can()`/`isAdmin()` |
| `apps/web/server/web/entitlement/check-entitlement.ts` (deleted); `tournaments/register.ts` | Merge entitlement twin |
| `apps/web/server/web/promotion-events/editor-authorization.security.test.ts` | NEW — 33 adversarial char-tests (item 5) |
| `docs/architecture/decisions/0045-...md`; `docs/architecture/auth.md`; `docs/architecture/research/0510-item5-...md` | ADR 0045; 4-axes law; item-5 proposal |
| `docs/knowledge/wiki/wiring-ledger.md` | WL-P2-33..35, WL-P3-32..34 |

## Verification

| Command / smoke | Result |
| --- | --- |
| `git branch --show-current` | `session-0510-adminpassport` (worktree `../ronin-0510-adminpassport`, off `1002b0d1`) |
| `bun run typecheck` | clean (all tasks) |
| `bun run lint:check` | exit 0 (only pre-existing warnings, none in touched files) |
| `bun run test` (affected authz/entitlement/claim/promotion/lineage suites) | **184 pass / 0 fail** (Doug close run) |
| `cd apps/web && bun run build` (pre-push gate) | **exit 0** (green) |
| `bunx prisma migrate status` | clean; single data-only additive backfill migration |
| `bun run wiki:lint` | 0 errors / 45 warnings (all pre-existing class) |
| Graphify refresh | nodes=12778 edges=28172 communities=1414 (worktree graph) |
| Doug — Item 1 verify | LAUNCH-SAFE 9.6/10, zero P1/P2 |
| Doug — hostile close (Item 2 + integration + prod-push) | **LAUNCH-SAFE 9.7/10**, zero P1/P2; no widening; push+deploy safe |
| Giddy — hostile close (architecture) | **PASS 9.4/10**; no axis merged, honest half-cut, gate correctly held |

## Open decisions / blockers

- **Item-5 lineage-editor resolver migration (WL-P2-33) — BLOCKED ON OPERATOR:** review `0510-item5-...migration-proposal.md` + the 33 char-tests, then sign off (or decline). The org-role/self-award/`buildAuthorizedRankAwardWhere` paths have no canonical equivalent = the decision point.
- **PR #194 opened (operator-directed at close); MERGE held for the next-session vetting.** Branch `session-0510-adminpassport` pushed; merge to `main` (→ prod deploy + bio backfill) gated on `/pr-fix-loop` + fresh hostile-close-review + `/fallow-fix-loop` all green, per the Next session block.
- Route/label naming (`/app/users` route vs "People" label) — deferred to TASK_02b (WL-P2-35).

## Next session

> **This is a FRESH-SESSION vetting lane, operator-directed at the SESSION_0510 close.** The 10-commit
> branch is on **[PR #194](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/194)**. Vet it
> with fresh eyes (past the ~120K dumb-zone) before it touches `main`, then handle the item-5 sign-off.

### Goal

Vet **PR #194** (`session-0510-adminpassport`) through three independent passes, then merge when all green; separately, the item-5 sign-off. In order:

1. **`/pr-fix-loop` on PR #194** — review → score → fix mechanical blockers, pause-on-merge.
2. **Fresh `hostile-close-review.md`** (Giddy + Doug, clean context). This session's *in-worktree* review was Giddy 9.4 / Doug 9.7 LAUNCH-SAFE — the operator wants a fresh-session re-vet before `main` anyway.
3. **`/fallow-fix-loop` on the diff** — CRAP / dupes / dead-code / complexity. ⚠ `fallow` was **OFF-PATH in this worktree**, so it NEVER ran this session (Doug + Cody both noted); run it in the canonical checkout or a fallow-bootstrapped worktree.

**Merge-gate:** all three green **+** the item-5 decision made. Merging PR #194 → prod deploy + applies the (safe, additive) bio backfill to prod Neon.

4. **Item-5 sign-off (WL-P2-33):** operator reviews `docs/architecture/research/0510-item5-lineage-editor-resolver-migration-proposal.md`, then land the staged lineage-editor resolver migration (dev-equivalence assertion first, the 33 char-tests as the safety net; org-role/self-award/`buildAuthorizedRankAwardWhere` have no canonical equivalent = the decision point) — or defer to WL-P2-33.

### First task

Run `/pr-fix-loop` targeting **PR #194**, then the fresh hostile-close-review + `/fallow-fix-loop` on the same diff. Do NOT merge until all three are green and the item-5 call is made. If the whole PR is parked, fall back to WL-P2-34 (AdminCollection conformance sweep).

## Review log

### SESSION_0510_REVIEW_01 — Doug verify of Item 1 cumulative diff (`1002b0d1..570b373c`)

- **Verdict:** LAUNCH-SAFE, 9.6/10, zero P1/P2. Passport-keyed `findPeople` proven against 466 live
  rows; account-only actions provably gated off the 443 placeholders; 0509 RBAC detail flow
  byte-for-byte untouched; bio backfill is null-only/idempotent/Passport-wins — safe to deploy to prod.
  Gates: typecheck clean, lint:check exit 0, 22 affected tests pass.
- **P3 dispositions:**
  1. School mirror omits canonical `where:{isCurrent:true}` + D-023 Membership fallback → **affirmed as
     intentional admin see-all** (comment added; 0/466 impacted today).
  2. "Listed under" mirror omits `fromNode.visibility:PUBLIC` → already comment-affirmed "admin sees
     all" (0 edges impacted).
  3. Backfill treats `bio=''` as unfilled (would refill a deliberately-blanked bio once) → **accepted**:
     empty ≈ no bio, and it refills the person's OWN lineage bio; the migration is already applied
     (editing it would break Prisma's checksum), and it has not reached prod. Documented, not changed.
- **Follow-up ledgered:** add `server/admin/people/queries.test.ts` (three populations + placeholder
  gating) to replace Doug's ad-hoc runtime proof — coverage gap, not a defect.

## Hostile close review

- **Giddy (architecture):** PASS 9.4/10 — AdminCollection at the right altitude (frame-only, no god-props); People/Passport half-cut is honest (zero dangling links/routes); bio fold is single-writer (no two-SoT); authz conform is discriminating (action→`can()`, identity→`isAdmin()`, org short-circuit kept as identity, no axis merged); item-5 correctly held. Scope guards all honored.
- **Doug (release):** LAUNCH-SAFE 9.7/10 — **no gate widened** (independently verified `ROLES`: no non-admin role holds the converted keys; FI-019 grants double-gated to `beta.view`+`media.upload`, re-filtered on read); `session!` asserts guard-safe; item-5 char-tests non-tautological (real DENY, zero resolver diffs); 184 tests pass; sole migration idempotent additive → **safe to push + deploy**.
- **Kaizen aggregate:** 9.5/10 — disciplined incremental work; the one security boundary was tested-first and held for sign-off rather than rushed.

### Findings (severity ≥ medium)

None. Two LOW notes handled: **N-1** (auth.md "two fours" conflation) — fixed inline (clarifying clause added). **N-2** (`/admin/layout.tsx` raw `role` check on the retiring surface) — ledgered **WL-P3-34**.

## ADR / ubiquitous-language check

- **ADR 0045** filed (AdminCollection: one frame, one editor, Passport-backed People, Appearance-not-deleted, conform-incrementally). Cross-refs ADR 0025/0040/0034.
- `docs/architecture/auth.md` gained the **4-axes resolver law + deny-behavior table** (ratifies `research-review-authz-systems.md`; carried by the research doc + auth.md, not a separate ADR).
- **Ubiquitous language:** "People" (= a Passport, account or not) vs "User" (= a Passport with an account) clarified; "Appearance" replaces "Brand Settings". Residual `users`-route / "People"-label debt noted (WL-P2-35).

## Reflections

- **The identity model was the whole game.** The one fact that de-risked TASK_02 was reading the schema before briefing: `LineageNode.passportId` is `@unique NOT NULL` and `Passport.userId` is nullable. That made "People must be Passport-keyed" a proof (userless roster Passports are invisible to any `User.findMany`), not an opinion — and made the bio fold clean (every node has exactly one Passport).
- **The operator's Fork-4 override was the highest-value moment.** The law said "delete brand-settings"; the operator's "keep the color picker" reframed it to "the multi-brand switcher is dead, the appearance editor is not." Looking at the target before deleting (it was a live SoT editor, already single-brand-collapsed) is exactly why the "surface before deleting" rule exists. I corrected the law memory so no sibling re-deletes it.
- **Committing per-task was the right call against the clobber lesson** — 9 sub-agent handoffs in one worktree, zero clobbered edits, because each task committed before the next dispatched. The cost: the bow-out gate runner saw a clean tree and mis-classified the session as "docs-only" (skipped the build), so I ran `next build` by hand. Worth flagging: the gate runner assumes an uncommitted working tree (FS-0025), which per-task-commit sessions violate.
- **Holding the security gate was correct, not slow.** Characterizing the boundary with 33 adversarial tests (green vs current behavior) turned an unbounded "migrate the authz resolver" into a reviewable diff + a proposal — the operator can now greenlight from evidence, and the tests are the safety net the migration can't break.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | ADR 0045 + item-5 proposal + auth.md carry full frontmatter (`updated`/`last_agent` set); proposal-doc missing-`updated` caught by wiki:lint + fixed |
| Backlinks/index sweep | ADR 0045 `pairs_with` verified (0025/0040/0034 real filenames); wiki index session row added below |
| Wiki lint | `bun run wiki:lint` → **0 errors / 45 warnings** (all pre-existing "list needs blank line" class; none in this session's docs) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | Giddy PASS 9.4 + Doug LAUNCH-SAFE 9.7 (this section); zero P1/P2 |
| Code-quality gate (Class-A) | AdminCollection + People query are Class-A custom; covered by Giddy 9.4 architecture pass + Doug 9.6/9.7 (no separate `/code-quality` run) |
| Runtime verification (Doug) | `/app/users` People SSR proven against 466 live rows; lineage drawer bio render confirmed; 184 tests pass |
| Review & Recommend | Next session goal written: yes (item-5 migration on sign-off, else WL-P2-34) |
| Memory sweep | Updated `admin-collection-one-surface-law` (frame built + Fork-4) + `admin-upload-gate-and-role-audit` (keep-layered verdict + sweep status) |
| Next session unblock check | Primary next task BLOCKED ON OPERATOR (item-5 sign-off); clear fallback (WL-P2-34) is unblocked |
| Git hygiene | branch `session-0510-adminpassport`, 10 commits; **pushed → PR #194** (operator-authorized at close for the `/pr-fix-loop` lane); NOT merged (held for next-session vetting); worktree retained (branch unmerged); FS-0024 guard run each commit |
| Graphify update | nodes=12778 edges=28172 communities=1414 (worktree graph; ran before close commit per FS-0025) |
