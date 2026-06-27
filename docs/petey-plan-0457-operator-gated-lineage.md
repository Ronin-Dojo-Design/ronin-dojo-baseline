---
title: "Petey Plan 0457 — Operator-Gated Lineage Lane (Brian Truelson launch + topology engineering)"
slug: petey-plan-0457-operator-gated-lineage
type: plan
status: active
created: 2026-06-27
updated: 2026-06-27
last_agent: claude-session-0454
pairs_with:
  - docs/sprints/SESSION_0456.md
  - docs/petey-plan-0454-autonomous-paydown.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/architecture/decisions/0037-lineage-branch-heads-and-visual-placement.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0457 — Operator-Gated Lineage Lane

> Authored at the SESSION_0454 close. The autonomous paydown (`petey-plan-0454`) is **done** (D-024,
> WL-P2-5, WL-P2-18, WL-P2-17 all merged; flaky tools test fixed → PR #171). This is the **operator-gated
> lane** the Codex run correctly refused to autonomize — every item touches **prod data**, a **live email
> send**, or a **behavior-risky refactor**. Four items, two phases.

## ⛔ HARD GATE (read first)

- **NOT autonomous.** Run interactively. Petey grills open decisions; **explicit operator "go" before any
  prod mutation, email send, push, PR merge, or deploy** (the standing `explicit-push-authorization` rule +
  hook).
- **Verify against PROD, not the prodsnap**, for anything reading/writing prod lineage data
  (`bun --env-file=apps/web/.env.prod …`; the `.env.prod` overlay — `import "dotenv/config"` first).
- **Dry-run → show → operator approves → apply.** Every prod script runs `--dry-run`/`--verify` first.

## Recommended sequencing (Petey's call — operator's `/goal` overrides)

The operator listed: WL-P2-21 → admin CRUD → WL-P2-22 → FI-001. Petey recommends a **regroup** that lands
the P0 (Brian Truelson) first and sequences the engineering by file-conflict:

- **Phase A — Land Brian Truelson (P0, SESSION_0457):** A1 WL-P2-21 clone cleanup → A2 FI-001 send. Both are
  lineage-prod + operator-gated + the actual "first tester live" goal. FI-001's `--verify` already passes
  (fixed 0453) and the test-send is proven, so this is mostly *execution*, not build.
- **Phase B — Lineage topology engineering (SESSION_0458+):** B1 WL-P2-22 board refactor **first** (cleaner
  surface), then B2 admin branch/subtree CRUD on the refactored board. They both edit
  `lineage-tree-board.tsx`, so refactor-then-build avoids a worktree merge-conflict.

Rationale: get the first tester onboarded ASAP (the moat is the claim loop); decouple the bigger
engineering. If the operator wants the literal listed order, A1 still goes first (CRUD needs no prod data).

---

## Phase A — Land Brian Truelson

### Slice A1 — WL-P2-21: remove the duplicate unpublished `rigan-machado-bjj-lineage` clone trees (PROD)

- **What:** Brian Truelson's node belongs to 3 trees — the published canonical `rigan-machado-lineage`
  (77m, correct) + **2 leftover UNPUBLISHED `rigan-machado-bjj-lineage` clones** (residue of the PR #162
  consolidation, brand-distinct per `@@unique[brand,slug]`). Audit FULL prod published-trees, then remove
  the unpublished clones + Brian's redundant memberships. The clones are already inert to live ops
  (`claimNodeForUser` enforces `tree.isPublished=true`, `server/web/lineage/claim-node-for-user.ts:62-78`),
  so this is **hygiene**, not a blocker — but it removes the false-negative source.
- **Files / scripts:**
  - `apps/web/prisma/schema.prisma` — `LineageTree` (2688-2733, `isPublished`, `@@unique[brand,slug]`),
    `LineageNode` (2628-2657), `LineageTreeMember` (2734-2761, `visualGroupId` onDelete SetNull).
  - `apps/web/scripts/consolidate-rigan-machado-tree.ts` — the **model** for safe atomic tree ops
    (`--apply`/`--rollback`, JSON backup to `/tmp`). Reuse its pattern.
  - `apps/web/scripts/send-bbl-truelson-thankyou.ts:88-141` (`resolveNode`) + `:150-256` (`--verify`,
    rolled-back Serializable tx) — the published-membership-preferring audit pattern.
  - **NEW (Cody):** `apps/web/scripts/remove-residual-lineage-clones.ts` — `--dry-run` (audit + log) →
    `--apply` (JSON backup, delete unpublished clone trees + Brian's clone memberships in one tx) →
    `--rollback <file>`. Idempotent; never touches the published tree/membership.
- **Graphify (run first):** `graphify query "lineage tree clone published membership prune consolidation" --budget 2000`.
- **Done means:** prod audit shows Brian has exactly ONE published membership (canonical) + zero active on
  unpublished clones; the 2 clone trees removed (or re-confirmed intentionally kept — operator decides);
  `send-bbl-truelson-thankyou.ts --verify` against PROD still returns CLAIMED; D-033/WL-P2-21 → resolved.
- **Risk:** prod data mutation. Mitigation: dry-run + JSON backup + verify-vs-PROD + operator approves
  `--apply`. ⚠ Delete ONLY `isPublished=false` rows; double-check the published tree is untouched.
- **Personas:** **Petey** grills the prod-verify plan → **Cody** writes the script (dry-run first) →
  operator approves `--apply` → **Doug** re-runs `--verify` + spot-checks Brian's profile renders on prod.

### Slice A2 — FI-001: Brian Truelson thank-you / first-tester send

- **What:** Send Brian his one-click claim magic-link + lifetime Elite comp. **The send-flow is proven**
  (SESSION_0439/0444 delivered the claim email to `ronindojodesign@gmail.com`, operator clicked through;
  Resend id `72524eab…`). `--verify` passes (0453). So this is **execution**, gated on the operator.
- **Script:** `apps/web/scripts/send-bbl-truelson-thankyou.ts` (`TARGET` hardcodes `btruelson@gmail.com` +
  node `brian-truelson`; modes run in order **verify → backfill → grant → send**):
  - `--dry-run` — render email HTML to `/tmp` (no DB, no send).
  - `--verify` — rolled-back tx; asserts CLAIMED. **Run vs PROD.**
  - `--backfill` — upsert `LineagePendingClaim {email, nodeId, brand:BBL, expiresAt:null}` (auto-claim on
    any sign-in, no expiry).
  - `--send` — mint magic-link + Resend send. **Supports `--to <addr>` override** (added 0439).
  - `--grant --grantor-email <admin>` — lifetime Elite comp (after account exists).
- **The operator-wanted test-send (PROVEN — do as a final confirmation, not a build):**
  ```bash
  cd apps/web
  # final confirmation: send the exact Brian-T email to the test inbox (no binding created by --send alone)
  DATABASE_URL=<prod> RESEND_API_KEY=<BBL-scoped re_…> SKIP_ENV_VALIDATION=1 \
    bun scripts/send-bbl-truelson-thankyou.ts --send --to ronindojodesign@gmail.com
  # operator reviews the email + (optionally) clicks the link to walk the exact claim flow
  ```
  **MANDATORY teardown after a test click:** `DELETE FROM "LineagePendingClaim" WHERE email='ronindojodesign@gmail.com';`
  (+ delete the test `User` if created). **Never `--reset`** — it leaves the row and re-fires (SESSION_0444
  stale-binding trap: it auto-claimed `cullet-eric`).
- **Real send sequence (operator-gated, each step explicit):**
  `--verify` (PROD, CLAIMED) → `--backfill` → `--send` (live to btruelson) → after Brian signs in:
  `--grant --grantor-email <admin>` → **Doug verifies Brian's claim E2E** (node claimed, Elite entitlement,
  profile renders).
- **Prerequisites (operator):** a **`blackbeltlegacy.com`-scoped Resend key** (the Baseline key 403s —
  `[[bbl-resend-key-and-dogfood-teardown]]`); pasted **inline one-shot**, never written to a file.
  `EMAIL_LIFECYCLE_DRYRUN=0` in prod (already set, 0419).
- **Graphify:** `graphify query "truelson claim pending lineage send magic-link" --budget 1500`.
- **Docs to update:** FI ledger (`feature-intake-ledger.md` FI-001 → completed) + `POST_LAUNCH_SOT.md` +
  `resend-setup-runbook.md` (BBL key-scope note).
- **Personas:** **Cody** runs the sends (operator approves each) → **Doug** verifies Brian's claim E2E.

---

## Phase B — Lineage topology engineering

### Slice B1 — WL-P2-22: `LineageTreeBoard` refactor (behavior-preserving; do BEFORE B2)

- **What:** `components/web/lineage/lineage-tree-board.tsx` `LineageTreeBoard` (≈line 90, 159 LOC) is
  **CRAP 1190 / cyclomatic 34**; `descendantMemberIds` (≈line 70) is CRAP 90. Extract — **props contract
  frozen** (3 callers unchanged).
- **Extraction plan (behavior-preserving):**
  - `use-drawer-state.ts` — the 4 drawer states + 400ms-delayed-open timer + `handleNodeSelect` /
    `handleChangePromoterIntent` / `handleDrawerClose` + cleanup effect (the timer cancel/reschedule
    appears verbatim 3×).
  - `use-lineage-selection.ts` — `selectedProfile`/`selectedMember`/`descendants`/`promoterChangeContext`
    derivation (the 14-line promoter-context ternary → a pure `buildPromoterChangeContext`).
  - `use-effective-render-policy.ts` — the capability→policy ternary.
  - `lineage-tree-board-descendant-helpers.ts` — split `descendantMemberIds` into `buildChildrenMap` +
    `collectDescendants` (DFS; keep cycle-guard).
  - `lineage-tree-board.test.tsx` (NEW) — unit-test the hooks + descendant traversal (cycles, leaf, deep).
- **Verification (behavior-RISKY — render proof required):** typecheck/oxlint/oxfmt; the new unit tests;
  `next build`; **headless render proof** of drawer open (400ms delay) / select student / editMode move /
  change-promoter (rank-history tab); re-run `npx fallow audit --base origin/main` to **prove CRAP drops**
  (`dead_code_introduced: 0`); judge vs `docs/protocols/code-quality-matrix.md` (target ≥9, Class B).
- **Graphify:** `graphify query "lineage tree board state handlers drawer canvas promoter" --budget 1500`.
- **Personas:** **Cody** extracts → **Doug** render-proofs + re-runs fallow → **Giddy** hostile review of
  behavior-preservation. Update `custom-component-inventory.md` + flip WL-P2-22 → resolved.

### Slice B2 — Admin branch/subtree CRUD + chrome (on the refactored board)

- **What:** operator-manageable tree topology (create/move/merge/delete branches + subtrees) under `/app`
  — no more hand-SQL. **Schema is complete; no migration.** Much already exists — extend, don't rebuild:
  placement move (`server/web/lineage/editor-actions.ts updateLineageMemberPlacement` + dnd-kit), change-
  promoter (`LineageMemberActionsMenu`), claimability/rank toggles (`server/admin/lineage/actions.ts`).
- **Files to create:** `app/app/lineage/[treeId]/_components/branch-list.tsx`, `branch-form.tsx`,
  `member-actions.tsx`; `server/admin/lineage/branch-actions.ts` (`createBranch`, `updateBranchHead`,
  `deleteMember`, `moveMemberToParent`) + `branch-schemas.ts`. **Touch:**
  `components/web/lineage/lineage-member-actions-menu.tsx` (new menu items),
  `app/app/lineage/[treeId]/page.tsx` (branches section), `server/admin/lineage/queries.ts`
  (`findBranchesInTree`, reuse the new `server/admin/list-query.ts` helper).
- **Reuse:** `adminActionClient`; the `assertCanManageLineageTree()` capability-gate pattern
  (`server/admin/lineage/actions.ts:20`, checks `LineageTreeAccess` TREE_ADMIN/BRANCH_EDITOR);
  `useHookFormAction` admin-form pattern; `ListingCard`; audit-log-before-mutation.
- **Branch model (ADR 0037):** a branch head = a `LineageTreeMember` whose `primaryVisualParentMemberId`
  is the tree root; students point their `primaryVisualParentMemberId` at the instructor's member.
- **Graphify:** `graphify query "lineage tree branch subtree admin CRUD topology node move promoter" --budget 2000`.
- **Docs to update:** `lineage-hub.md` (CRUD section), maybe ADR 0038 if merge/federation is in scope.
- **Personas:** **Petey** grills the CRUD surface (which ops are MVP; where under `/app`) → **Cody** builds
  → **Desi** UX-reviews the admin chrome → **Doug** verifies the ops + capability gates.

---

## Worktree / sub-agent parallelization

- **A1 + A2 (Brian launch):** SEQUENTIAL — prod-data + live send, single careful operator-gated thread. Not
  parallelizable.
- **B1 (refactor):** one coherent edit of `lineage-tree-board.tsx` → don't split the file across agents.
  DO parallelize the *supporting* work: one sub-agent extracts, one writes the unit tests, one drives the
  headless render proof.
- **B2 (CRUD):** the tracks are **disjoint-file** → genuinely parallelizable, ideally **worktree-isolated**:
  (a) UI components `app/app/lineage/[treeId]/_components/*` + (b) server actions/schemas
  `server/admin/lineage/branch-*.ts`. The shared touch-point is `lineage-member-actions-menu.tsx` (small —
  do last, single agent).
- **B1 must precede B2** (both touch `lineage-tree-board.tsx`); doing them in parallel worktrees would
  force a merge-conflict reconcile. FI-001/A2 (scripts) is disjoint from all of B → could run in a parallel
  worktree, but it's operator-gated (interactive), so keep it in the main thread.

## Graphify queries (run at bow-in for file↔doc alignment)

```bash
graphify stats
graphify query "lineage tree clone published membership prune consolidation" --budget 2000   # A1
graphify query "truelson claim pending lineage send magic-link" --budget 1500                # A2
graphify query "lineage tree board state handlers drawer canvas promoter" --budget 1500      # B1
graphify query "lineage tree branch subtree admin CRUD topology node move promoter" --budget 2000  # B2
```

## Docs to review/update (consolidated)

- **Read:** `lineage-hub.md`; ADR 0037 (branch heads); ADR 0016 (promotion SoT); `drift-register.md` D-033;
  `code-quality-matrix.md`; `resend-setup-runbook.md`; `cody-preflight.md`; `[[bbl-resend-key-and-dogfood-teardown]]`.
- **Update:** `wiring-ledger.md` (WL-P2-21, WL-P2-22 → resolved); `feature-intake-ledger.md` + `POST_LAUNCH_SOT.md`
  (FI-001 → completed); `lineage-hub.md` (CRUD section); `custom-component-inventory.md` (B1 hooks); `drift-register.md` (D-033).

## Persona summary

| Slice | Petey | Cody | Doug | Desi | Giddy |
| --- | --- | --- | --- | --- | --- |
| A1 clone cleanup | grill prod-verify plan | write+run dry-run/apply script | verify vs PROD + re-`--verify` | — | — |
| A2 FI-001 send | — | run sends (operator-gated) | verify Brian claim E2E | — | — |
| B1 board refactor | — | extract hooks/helpers | render-proof + re-fallow | — | hostile behavior-preservation review |
| B2 admin CRUD | grill CRUD surface | build actions+UI | verify ops+gates | UX review of chrome | — |
