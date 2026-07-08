---
title: "Migration Proposal — Lineage Promotion-Event Editor Resolver → canonical canWithGrants/canForResource"
slug: 0510-item5-lineage-editor-resolver-migration-proposal
type: research
status: proposal
created: 2026-07-07
updated: 2026-07-07
last_agent: claude-session-0510
pairs_with:
  - apps/web/server/web/promotion-events/editor-authorization.ts
  - apps/web/server/orpc/resource-permissions.ts
  - apps/web/server/web/promotion-events/editor-authorization.security.test.ts
backlinks:
  - docs/sprints/SESSION_0510.md
---

# Migration Proposal — Promotion-Event Editor Resolver → canonical resource-permissions

> ## ⚠ REQUIRES OPERATOR SIGN-OFF BEFORE LANDING
>
> This is a **proposal only**. The SESSION_0510 item-5 task **wrote adversarial characterization
> tests + this doc**; it did **NOT** touch any resolver/source. Do not begin the migration below
> until the operator has reviewed this document and explicitly authorized the staged plan. The
> security-boundary tests in `editor-authorization.security.test.ts` are the gate the migration
> must keep green at every step — a green test-run is necessary but **not sufficient** for landing;
> operator sign-off is required.

## 1. Scope + why this exists

`server/web/promotion-events/editor-authorization.ts` hand-rolls `LineageTreeAccess` resolution
for **who may author promotion events / rank awards**, in parallel to the canonical
`canWithGrants` / `canForResource` in `server/orpc/resource-permissions.ts` (SOT-ADR D4). Two
parallel authorization codepaths against the same `LineageTreeAccess` model is exactly the drift
risk SOT-ADR D4 exists to remove. This proposal maps the hand-rolled resolver onto the canonical
one, flags the behavioral deltas, and stages a migration that the adversarial tests gate.

Resolvers in scope (all in `editor-authorization.ts`):

| Resolver                              | Kind       | Role                                                                                                             |
| ------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `resolvePromotionEventAuthoringScope` | async (DB) | Loads the user's org roles + lineage grants → a `PromotionEventAuthoringScope` (the sets everything else reads). |
| `canAuthorHostOrganization`           | pure       | Is a host org in the user's authoring orgs (or admin)?                                                           |
| `canAuthorRankAward`                  | pure       | May the user author a single award (self / org / node scope)?                                                    |
| `canAuthorRankAwards`                 | pure       | `.every()` over `canAuthorRankAward`.                                                                            |
| `canAuthorPromotionEvent`             | pure       | Compose host-org + award + hostless-event authority.                                                             |
| `buildAuthorizedRankAwardWhere`       | pure       | The Prisma `WHERE` that lists rows the user may see/link (row-level scoping for the editor list).                |

Consumers: `editor-actions.ts` (`applyPromotionEventEditorUpsert`), `editor-queries.ts`
(`findEditablePromotionEvents`, `getPromotionEventEditorData`).

## 2. The two models, side by side

### 2a. Canonical (`resource-permissions.ts`)

- **Per-request, per-resource.** `canForResource(db, user, permission, resource)` answers a single
  yes/no for ONE target (`{ treeId, nodeId?, memberId?, branchRootMemberIds? }`).
- Consults flat `can(user, permission)` FIRST (admin `*` wildcard + role grants), then a matching
  in-scope non-revoked `LineageTreeAccess` grant via `canWithGrants` (pure).
- Scope columns: `TREE_ADMIN`/`TREE_EDITOR` → whole tree; `BRANCH_EDITOR` → `resource.branchRootMemberIds.includes(grant.rootMemberId)`; `NODE_EDITOR` → `grant.nodeId === resource.nodeId || grant.memberId === resource.memberId`.
- Permissions are strings gated by `LINEAGE_RESOURCE_GRANTS[role]` (`roles.ts`).
- **Branch matching is pre-resolved by the caller**: `branchRootMemberIds` = the target's own
  member id + its ancestor chain to the tree root (mirrors `editor-graph.isLineageMemberInBranch`).

### 2b. Hand-rolled (`editor-authorization.ts`)

- **Batch, up-front.** `resolvePromotionEventAuthoringScope` materializes, in TWO queries, the whole
  authorization surface into a `scope` object (org id sets + full-tree node-id set + scoped node-id
  set + `canAuthorHostlessEvents`). Everything else reads that struct with no DB.
- The `isAdmin(user)` short-circuit returns a global-admin scope (no DB touched at all).
- Branch expansion is done **inside** the resolver: for a `BRANCH_EDITOR` grant it walks every
  member and calls `isLineageMemberInBranch` to add in-branch node ids to `scopedNodeIds`.
- Adds TWO authority axes the canonical resolver has NO equivalent for:
  1. **Org-role authoring** (`eventOrganizationRoles` = OWNER/ORG_ADMIN/INSTRUCTOR/COACH → an org
     you may host events for) and **org-admin full-tree** (`organizationAdminRoles` = OWNER/ORG_ADMIN
     of an `ORGANIZATION`-scoped tree → the whole tree).
  2. **Self-award** (`award.awardedById === userId` authors regardless of scope).

## 3. Mapping — hand-rolled → canonical

| Hand-rolled concept                                                                                                             | Canonical equivalent                                                                                                 | Maps cleanly?                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isAdmin(user)` short-circuit                                                                                                   | `can(user, permission)` (admin `*` wildcard) inside `canWithGrants`                                                  | **Yes** — the canonical path checks `can()` first, so admin authorizes without a grant. Same outcome.                                                                                                                                                                                                                                                                                                              |
| `TREE_ADMIN`/`TREE_EDITOR` → `fullTreeNodeIds` (whole tree)                                                                     | `scopeCoversResource` returns `true` for these roles (tree already matched)                                          | **Yes** — identical whole-tree semantics.                                                                                                                                                                                                                                                                                                                                                                          |
| `BRANCH_EDITOR` → `addBranchNodes` via `isLineageMemberInBranch`                                                                | `BRANCH_EDITOR` + `resource.branchRootMemberIds.includes(grant.rootMemberId)`                                        | **Yes, but inverted.** Canonical expects the CALLER to pre-compute `branchRootMemberIds` (ancestor chain of the target). Hand-rolled expands descendants up-front. Same set, computed at opposite ends — the migration must move the ancestor walk to each call site (or a shared helper).                                                                                                                         |
| `NODE_EDITOR` → `grant.nodeId ?? grant.member.nodeId`                                                                           | `NODE_EDITOR` → `grant.nodeId === resource.nodeId \|\| grant.memberId === resource.memberId`                         | **Mostly.** Canonical matches on `nodeId` OR `memberId` against the RESOURCE. Hand-rolled resolves the grant's node (falling back to `grant.member.nodeId`) and stores it in `scopedNodeIds`. Equivalent AS LONG AS the resource carries both `nodeId` and `memberId` (award passports carry `nodeId`; the editor resource must also thread `memberId` to preserve the memberId-bound-grant path). **Watch this.** |
| `revokedAt: null` filter (tree WHERE + accessGrants sub-select)                                                                 | `grantAuthorizes` returns `false` on `grant.revokedAt`; `canForResource` also filters `revokedAt: null` in its query | **Yes** — both deny revoked grants. Pinned green by the "grant hygiene" tests.                                                                                                                                                                                                                                                                                                                                     |
| **Org-role authoring** (`eventOrganizationRoles` → `organizationIds`; `canAuthorHostOrganization`; award `organizationId` path) | **NONE**                                                                                                             | **No canonical equivalent.** `resource-permissions.ts` has no org-role concept — it is purely `LineageTreeAccess`-scoped. This authority axis must either (a) stay hand-rolled as a supplement, or (b) be modeled as new permission grants / a new resource type. **Biggest gap.**                                                                                                                                 |
| **Org-admin full-tree** (`organizationAdminRoles` unlock the whole `ORGANIZATION`-scoped tree)                                  | **NONE** (partial)                                                                                                   | **No direct equivalent.** Canonical only knows explicit `LineageTreeAccess` rows; it does not derive tree authority from org-admin role. Would require either synthesizing grants or a new rule.                                                                                                                                                                                                                   |
| **Self-award** (`award.awardedById === userId`)                                                                                 | **NONE**                                                                                                             | **No canonical equivalent.** This is an ownership check on the RankAward, not a tree grant. Must remain a separate rule (or become an ownership-aware permission).                                                                                                                                                                                                                                                 |
| `canAuthorHostlessEvents` (a full-tree grantee may create host-less, award-less events)                                         | **NONE**                                                                                                             | Derived state (`fullTreeNodeIds.size > 0`). No canonical notion of "author a resource-less event." Keep as a supplement.                                                                                                                                                                                                                                                                                           |
| `buildAuthorizedRankAwardWhere` (Prisma `WHERE` for the editor LIST)                                                            | **NONE**                                                                                                             | **No canonical equivalent.** `canForResource` answers per-resource yes/no; it cannot emit a row-scoping `WHERE`. Listing/row-level filtering is out of the canonical resolver's remit. This is a **list-authorization** concern that has to be built separately (or the list must post-filter every row through `canForResource`, which is O(rows) DB calls unless the grants are preloaded).                      |

**Headline:** the two lineage-grant axes (`TREE_*`, `BRANCH_`, `NODE_`) map cleanly (modulo the
branch-walk inversion and the NODE memberId thread). Everything ORG-shaped, the self-award path, the
hostless-event derivation, and the row-scoping `WHERE` have **no canonical equivalent** and are the
real work.

## 4. Behavioral deltas to watch (where a naive migration would allow/deny differently)

1. **Branch scope direction.** Hand-rolled expands DESCENDANTS of `rootMemberId` up front; canonical
   matches the target's ANCESTOR chain. If a call site forgets to populate `branchRootMemberIds`, a
   `BRANCH_EDITOR` silently loses authority (deny regression) — or, if it over-populates, gains it
   (allow regression). The `resolvePromotionClaimResources` helper already computes the ancestor
   chain correctly (`promotion-claim-resource.test.ts`); reuse it, don't re-derive.
2. **NODE_EDITOR via memberId.** Hand-rolled resolves `grant.member.nodeId` when `grant.nodeId` is
   null. The award-authoring resource today carries only `nodeId` (via `passport.lineageNode.id`).
   If the migrated resource does not ALSO thread the award's `memberId`, a memberId-bound `NODE_EDITOR`
   grant that has a null `nodeId` will **stop authorizing** (deny regression). Pinned by the
   "resolves its node from the linked member" test.
3. **Org authority is invisible to the canonical resolver.** Any migration that routes ONLY through
   `canForResource` and drops the org axis will **deny** every OWNER/ORG_ADMIN/INSTRUCTOR/COACH who
   authors by org role today (large deny regression), and drop the org-admin full-tree unlock.
4. **Self-award drop.** Routing solely through tree grants **denies** a user authoring their own
   award if they hold no tree grant (deny regression). Pinned by the "self-awarded path" test.
5. **List scoping vs per-row checks.** Replacing `buildAuthorizedRankAwardWhere` with per-row
   `canForResource` changes the editor LIST from one indexed query to N authorization checks. Correctness
   can be preserved, but a naive swap risks either a perf cliff or (if the `WHERE` is loosened to "fetch
   all then filter") **leaking row existence** through counts/pagination. The `buildAuthorizedRankAwardWhere`
   tests pin that the emitted `WHERE` is a CLOSED `OR` of only authorized dimensions — the migration
   must preserve that closure.
6. **Hostless-event authority.** `canAuthorHostlessEvents` has no target resource, so `canForResource`
   cannot express it. Dropping it **denies** full-tree grantees the "create an empty event" path.

## 5. Latent findings surfaced while characterizing (report-only, NOT fixed here)

- **F-1 (informational, not a vuln): the `role: { in: editorRoles }` filter is a DB-layer no-op.**
  The `LineageTreeAccessRole` enum contains ONLY the four editor roles (`TREE_ADMIN`, `TREE_EDITOR`,
  `BRANCH_EDITOR`, `NODE_EDITOR`) — there is no `VIEWER`/`READ_ONLY` role. So the resolver's
  `editorRoles` filter can never exclude anything at the DB layer; "insufficient role" reduces to the
  no-grant case. It is still defensively correct (and the canonical `LINEAGE_RESOURCE_GRANTS` keys off
  the same closed set). Pinned by the enum-shape test so that ADDING a non-editor role forces an
  explicit authoring-scope decision. **No action required now.**
- **F-2 (no gap found): revoked grants ARE denied.** The resolver filters `revokedAt: null` on BOTH
  the tree WHERE and the `accessGrants` sub-select, and the canonical `grantAuthorizes` independently
  denies revoked grants. The adversarial "grant hygiene" tests confirm a revoked `TREE_ADMIN` leaks NO
  scope and does not survive alongside an active narrower grant. **The revoked-grant boundary is sound
  in BOTH resolvers.**
- **F-3 (no expiry axis):** `LineageTreeAccess` has NO `expiresAt` column — only `revokedAt`. There is
  therefore no time-expiry to test or migrate; any future "temporary grant" feature would add the
  column to both resolvers. Noted so the migration does not assume an expiry semantic that doesn't exist.

None of F-1/F-2/F-3 is an active security hole; they are documented so the migration inherits them
knowingly rather than by accident.

## 6. Risk assessment

| Risk                                             | Likelihood           | Impact                                        | Mitigation                                                                                                                         |
| ------------------------------------------------ | -------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Dropping the org authority axis in migration     | High if done naively | Large deny regression (all org-role authors)  | Keep org axis as an explicit supplement; migrate the LINEAGE axis first, in isolation.                                             |
| Branch-walk direction inversion                  | Medium               | Allow OR deny regression on `BRANCH_EDITOR`   | Reuse `resolvePromotionClaimResources`' ancestor walk; gate with the branch-boundary tests.                                        |
| NODE memberId thread lost                        | Medium               | Deny regression on memberId-bound node grants | Thread `memberId` into the migrated resource; gate with the member-resolution test.                                                |
| List `WHERE` → per-row check leaks or perf cliff | Medium               | Row-existence leak or slow editor list        | Preserve the closed-`OR` `WHERE` semantics; if moving to per-row, preload grants (no N queries) and never "fetch-all-then-filter". |
| Self-award / hostless authority dropped          | Medium               | Deny regression                               | Model both as explicit supplements, not tree grants.                                                                               |

**Overall:** the lineage-grant axis is a clean, low-risk swap; the org axis + self-award + list
scoping are the high-risk, no-equivalent parts and are the reason this is item 5 (biggest, riskiest).

## 7. Staged plan (each stage gated by the adversarial tests staying green)

Every stage must keep `editor-authorization.security.test.ts` + the existing
`editor-actions.test.ts` / `queries.test.ts` / `editor-queries.test.ts` /
`promotion-claim-resource.test.ts` GREEN, and requires operator sign-off before landing.

- **Stage 0 (this task).** Adversarial characterization tests + this proposal. No source change.
- **Stage 1 — LINEAGE axis only, behind an equivalence assertion.** Introduce a canonical-backed
  path for the `TREE_*`/`BRANCH_`/`NODE_` grant decision (reusing the ancestor-walk helper), and run
  it ALONGSIDE the hand-rolled path in a dev-only assertion that they agree on every award/event.
  Ship nothing user-visible; collect divergence telemetry. First adversarial gate: cross-tree,
  branch-boundary, node-boundary, revoked-grant tests.
- **Stage 2 — cut the LINEAGE axis over.** Once Stage-1 shows zero divergence, replace the
  hand-rolled lineage-grant computation with the canonical call, keeping the org axis + self-award +
  hostless + list `WHERE` as explicit supplements. Re-run the full adversarial suite.
- **Stage 3 — decide the org axis.** Separately, with its own proposal + sign-off: either formalize
  org-role authoring as a new permission/resource in the canonical model, or ratify it as a
  documented supplement that lives outside `resource-permissions.ts`. Do NOT fold it in silently.
- **Stage 4 — list scoping.** Decide whether `buildAuthorizedRankAwardWhere` stays (as the
  list-authorization primitive the canonical resolver deliberately doesn't cover) or is rebuilt on
  preloaded grants. Gate with the `buildAuthorizedRankAwardWhere` closure tests.

## 8. Recommendation

Migrate the **lineage-grant axis only** (Stages 1–2) — it maps cleanly and removes the bulk of the
drift. Treat the **org axis, self-award, hostless-event, and list `WHERE`** as first-class supplements
with their own explicit decisions (Stages 3–4), because `resource-permissions.ts` has no equivalent
for them and forcing them in would either loosen the boundary or bloat the canonical resolver past its
single responsibility (per-resource yes/no). **Nothing here is authorized to land without operator
sign-off.**
