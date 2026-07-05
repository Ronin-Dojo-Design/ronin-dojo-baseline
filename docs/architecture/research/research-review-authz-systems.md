---
title: "Research Review — Authorization Systems: Consolidate or Keep Layered?"
slug: research-review-authz-systems
type: research-review
status: active
created: 2026-07-04
updated: 2026-07-05
last_agent: giddy-session-0498
pairs_with:
  - docs/architecture/auth.md
  - docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
backlinks:
  - docs/sprints/SESSION_0498.md
---

# Research Review — Authorization: 4 Systems, Consolidate or Keep Layered?

Giddy, SESSION_0498 (read-only research review). Decides the shape of the queued `beta.view`
permission key and FI-019 (RBAC grant/toggle admin surface, `POST_LAUNCH_SOT.md:87`).

## TL;DR — Verdict

**Keep layered. Do not consolidate. Run a conformance sweep instead.**

- The "4 systems" are **4 axes answering 4 different questions** about 4 different subjects:
  global capability (`can()`), lineage resource grants (`LineageTreeAccess`), org standing
  (`Membership`+`Role`), commerce entitlements (`UserEntitlement`). Collapsing them is not DRY —
  there is no duplicated *knowledge* across axes, only different scopes. A unified policy engine
  (Zanzibar/OPA-class) at a 2-prod-admin, single-flagship scale is textbook YAGNI.
- This is **already canon**: `docs/architecture/auth.md` § Roles says *"Four distinct role axes —
  do not conflate them."* The operator ratified layering at SESSION_0452/0453 (Petey + Giddy
  converged). This review confirms it and closes the question.
- The real problem is **drift *within* axis 1**, not the axis count: **25 raw
  `role === "admin"` comparisons** bypass `can()`/`isAdmin()` (e.g.
  `app/app/repo-docs/docs-navigator/route.ts:9`, `server/admin/lineage/queries.ts:35,121`,
  `server/admin/claims/passport-claim-review-actions.ts:295`); **3 dead admin HOCs with 0
  consumers** (`components/admin/auth-hoc.tsx:16,39,53`); **twin entitlement checkers**
  (`server/web/entitlement/check-entitlement.ts:9` vs `server/web/entitlements/queries.ts:10`);
  **two lineage resource resolvers** (canonical `server/orpc/resource-permissions.ts` vs
  hand-rolled `server/web/lineage/editor-queries.ts:57–95` +
  `server/web/promotion-events/editor-authorization.ts`); **six deny behaviors** across gate
  helpers.
- Consolidation blast radius: **~350+ touch points** (39 `can()` refs, 39 `requirePermission`,
  25 raw role checks, ~157 `adminActionClient`/`tournamentAdminActionClient` refs, 25
  `hasOrgAdminAccess` refs, 12 entitlement-consumer files, 8 files querying
  `lineageTreeAccess` directly) against a repo with two on-file authz-regression lessons
  (belt-verification authz-widening; WL-P1-8 masked-failure class). Payoff ≈ zero: the four
  data stores must exist regardless. **Risk/payoff fails.**
- **FI-019 = a per-user grant table + UI *inside* axis 1's `can()` resolution** — role grants
  ∪ user-override grants, same `Grant` string vocabulary, same `matchesPattern`, additive-only,
  audited, `revokedAt`-not-delete. It must NOT be a new resolver, a new vocabulary, or a deny
  mechanism. `beta.view` needs zero plumbing day one (admin `"*"` wildcard covers it).

---

## 1. Inventory — what is actually there

SESSION_0453's memory counted: (1) platform `User.role` enum, (2) org-scoped
`Role`+`MembershipRoleAssignment`, (3) code-derived `can()` permissions, (4) per-user
entitlements. That count is **right by accident**: it split axis 1's store (`User.role`) from
its resolver (`can()`) as two systems, and **missed `LineageTreeAccess` entirely**. The honest
decomposition is **four axes + two non-systems**:

### Axis 1 — Global capability (WHO you are platform-wide → what actions)

- Store: `User.role` — Prisma `enum UserRole { user, admin, tournament_director }`
  (`apps/web/prisma/schema.prisma:62`), field owned by the Better Auth `admin()` plugin
  (`apps/web/lib/auth.ts:230`).
- Resolver: `can(user, permission)` (`apps/web/server/orpc/permissions.ts:39`) over the flat
  role→grant map `ROLES` (`apps/web/server/orpc/roles.ts:60`; `admin: ["*"]`, deny-by-default
  `guest` via `roleOf`, `roles.ts:157`). ~35 area keys in `APP_AREA_PERMISSIONS`
  (`roles.ts:115`).
- Enforcement points: oRPC `withPermissionGate` (`apps/web/server/orpc/procedure.ts:79`,
  `meta.permission`), route guards `requirePermission` (`apps/web/lib/auth-guard.ts:39` —
  **39 call sites**), UI visibility (**~39 `can()` refs**, 8 importing files).
- Identity predicate: `isAdmin` (`apps/web/lib/authz-predicates.ts:18`, re-exported by
  `lib/authz.ts`; ratified as THE single admin predicate at SESSION_0495 C2-8) — **15 refs**.

### Axis 2 — Resource-scoped lineage authority (what you may edit in THIS tree/branch/node)

- Store: `LineageTreeAccess` (`schema.prisma:2845`), roles
  `TREE_ADMIN/TREE_EDITOR/BRANCH_EDITOR/NODE_EDITOR` (`schema.prisma:581`), `revokedAt`
  soft-revoke, `grantedById` audit.
- Resolver: `canWithGrants`/`canForResource` (`apps/web/server/orpc/resource-permissions.ts:121,141`)
  over `LINEAGE_RESOURCE_GRANTS` (`roles.ts:95`). **Additive over axis 1** — consults `can()`
  first, can only ADD authority (SOT-ADR D4). 5 non-test call sites.
- Route-area gates: `requireLineageAccess`/`requireLineageManagementAccess`/`hasAnyLineageGrant`
  (`lib/auth-guard.ts:69,90,116`) — 6 call sites.

### Axis 3 — Org-scoped standing (your role within THIS organization)

- Store: `Membership` (`schema.prisma:1355`) + `Role` reference table (`schema.prisma:1406`,
  codes `ORG_ADMIN/OWNER/INSTRUCTOR/COACH`…) + `MembershipRoleAssignment`
  (`schema.prisma:1392`), plus `Organization.ownerId`.
- Resolver: `hasOrgAdminAccess`/`assertOrgAdminAccess`
  (`apps/web/server/web/organization/org-admin-access.ts:15,44`) = platform-admin OR owner OR
  `ORG_ADMIN` assignment — **25 refs**. Feature-level role-set queries (e.g.
  `editor-authorization.ts` `eventOrganizationRoles`).
- Note: `Affiliation` (`schema.prisma:1437`) is **display-only** person↔org linkage per its own
  schema comment — not an authz store. Correctly excluded.

### Axis 4 — Commerce entitlements (what you paid for / were granted)

- Store: `Entitlement` + `UserEntitlement` (keys like `S3_UPLOAD`, tier keys).
- Resolvers: `hasEntitlement` (`apps/web/server/web/entitlements/queries.ts:10`, cached) and
  its **uncached twin** `checkEntitlement`
  (`apps/web/server/web/entitlement/check-entitlement.ts:9`). 12 consumer files. Grant CRUD
  already exists (`server/entitlements/admin-grants.ts`, audited — SESSION_0452/0453).

### Non-system A — Ownership invariants (14 refs)
`userId === owner` checks are **per-aggregate invariants, not a system** — e.g. the belt
router's own-Passport root (`apps/web/server/belt/router.ts:39–42`: "a flat role grant cannot
express 'your own row', so ownership is asserted in-handler"). Correct as-is.

### Non-system B — Better Auth session layer
Authn substrate (session, bans, impersonation; `admin()` plugin owns the `User.role` *field*).
Not a separate authz decision system.

### Legacy parallel gate stack (retiring)
`lib/safe-actions.ts` next-safe-action clients: `adminActionClient` (raw
`ctx.user.role !== "admin"`, `safe-actions.ts:76`, **131 refs**), `tournamentAdminActionClient`
(`safe-actions.ts:87`, **26 refs**), `userActionClient` (**132 refs**),
`mediaUploadActionClient` (`safe-actions.ts:102` — the cross-axis composition point:
`can(user,"media.manage")` OR `canUploadMedia`). Already slated to retire as surfaces migrate
to oRPC (SOT-ADR D3). Plus route HOC `withAdminAuth` (`lib/auth-hoc.ts:31`, 3 refs) and the
page HOCs in `components/admin/auth-hoc.tsx` — **0 consumers, dead**.

---

## 2. Pairwise overlap judgment — true DRY violations vs. distinct axes

| Pair | Same question, same subject? | Judgment |
|---|---|---|
| `can()` vs raw `role === "admin"` (25 sites) | **YES** — both answer "is this account privileged?" | **True DRY violation.** The single worst drift. |
| `can()` vs `canForResource` | No — global action vs action-on-THIS-resource; resolver is explicitly additive over `can()` | Correct layering (SOT-ADR D4). |
| `can()` vs `hasOrgAdminAccess` | No — platform capability vs standing in one org. The platform-admin short-circuit inside it (`org-admin-access.ts:17`) is deliberate (SESSION_0448) but hand-rolls the role check | Distinct axes; short-circuit should route through `isAdmin()`/`can()`. |
| `can()` vs `hasEntitlement` | No — authority vs purchase. WL-P2-19 proved they must *compose*, not merge (admins blocked from upload because the entitlement gate ignored role) | Distinct axes; composition seams must be named. |
| `hasEntitlement` vs `checkEntitlement` | **YES** — identical query, one cached one not, in sibling dirs (`entitlements/` vs `entitlement/`) | **True DRY violation.** Merge. |
| `resource-permissions.ts` vs `editor-queries.ts:57–95` + `editor-authorization.ts` | **YES** — both resolve "may this user edit this lineage resource" from `LineageTreeAccess`; the editor pair predates D4 and hand-rolls role sets + `isAdmin` | **True DRY violation** (intra-axis). Biggest single sweep item. |
| `hasAnyLineageGrant` (`auth-guard.ts:116`) vs `hasLineageAdminAccess` (`components/admin/auth-hoc.tsx:24`) | **Near-twins**, different role sets (TREE_ADMIN+TREE_EDITOR vs TREE_ADMIN-only); the latter is imported by a live public page (`app/(web)/lineage/[treeSlug]/page.tsx:15`) from a mostly-dead HOC file | Consolidate into `auth-guard.ts` with an explicit role-set param; WL-P1-8 lesson says label the difference or unify. |
| Deny behaviors | `requirePermission` → `redirect("/app")`; `withPermissionGate` → `ORPCError FORBIDDEN`; `withAdminAuth` → 403 JSON; `adminActionClient` → `throw Error("User not authorized")`; `assertOrgAdminAccess` → `throw "ACCESS_DENIED"`; dead HOCs → `notFound()` | **Six behaviors.** Partly legitimate per surface type (route vs RPC vs action) — but undocumented; ratify a per-surface standard. |

---

## 3. The four lenses

- **DRY/KISS/YAGNI.** DRY targets duplicated *knowledge*. The axes hold different knowledge
  (platform role ≠ tree grant ≠ org role ≠ purchase); merging their stores duplicates nothing —
  it just builds an abstraction layer nobody asked for. KISS favors four small resolvers with
  one composition pattern over one policy engine with four scope dialects. YAGNI: nothing on
  the roadmap (beta gate, FI-019, Epic A) needs cross-axis policy evaluation.
- **WWAD.** Facebook built TAO/privacy-policies and Google built Zanzibar at
  billions-of-edges, thousands-of-engineers scale. At *this* scale the senior platform answer
  is what GitHub/Stripe ship: **site roles + per-resource roles + org roles + billing
  entitlements, layered, with one resolver per layer and permission strings as the shared
  vocabulary**. The repo already has the senior shape — `canWithGrants` consulting `can()`
  first, additive-only, is exactly the right pattern. The Apple move is *ratify the law then
  conform*: the law exists (`auth.md` "do not conflate"); the conformance is the gap.
- **Best practice.** Deny-by-default (`roleOf` → `guest` — present), monotonic/additive grants
  (present in axis 2 — keep for FI-019), audited grant mutations (present since 0452/0453 —
  role-change audit + self-escalation block), no negative grants, one predicate per question
  (violated 25 times — the sweep).
- **DDD.** Each axis is owned by a distinct aggregate: identity (`User`), lineage tree
  (`LineageTreeAccess` hangs off `LineageTree`), organization (`Membership`/`Role`), commerce
  (`Entitlement`). A unified policy store would couple the lineage aggregate to billing and
  org management — aggregates that change on completely different cadences for different
  reasons. The **published language** between them is the `Grant`/`Permission` string
  vocabulary + `matchesPattern` — share the language, never the store. Ownership invariants
  (belt router) belong inside their aggregate's handlers, exactly where they are.

---

## 4. Blast radius of consolidation (the road not taken)

- Touch points: 39 `can()` + 39 `requirePermission` + 6 `requireUser` + 6 `requireLineage*` +
  5 `canForResource` + 25 raw role + 15 `isAdmin` + ~289 safe-action-client refs + 25
  `hasOrgAdminAccess` + 8 `lineageTreeAccess`-querying files + 12 entitlement files ≈
  **350+ sites**, most of them security gates.
- Security-regression posture: this repo has already shipped (and caught) authz widening in
  the belt-verification lane (lesson: write the GAINER's adversarial test first), a masked-FK
  class failure (WL-P1-8), an unaudited self-role-escalation gap (closed 0452, risk-register
  #11), and an admin lockout from a gate that ignored an axis (WL-P2-19). Every consolidated
  gate is a chance to widen or narrow silently.
- Payoff: the four stores still exist after consolidation (the data is irreducible); you'd buy
  one resolver signature at the cost of a months-long, adversarial-test-heavy migration.
  **Not worth one slice of it.**

---

## 5. Verdict, canonical rule, conformance sweep, FI-019

### Verdict: **keep-layered-and-conform**

### The canonical rule (so this is never re-litigated)

> **Four authz axes, one resolver each, compose — never merge, never fork.**
> 1. **Capability** — `can(user, key)` (`server/orpc/permissions.ts`) answers "may this
>    account perform this action platform-wide?" It is the ONLY authorized reader of
>    `User.role` for action gates; `isAdmin()` is the ONLY identity predicate for non-action
>    branching (labels, row-selection chrome).
> 2. **Lineage resource grants** — `canForResource`/`canWithGrants`
>    (`server/orpc/resource-permissions.ts`) answers "may this account do this to THIS
>    tree/branch/node?" Additive over capability; the ONLY authorized reader of
>    `LineageTreeAccess` for decisions.
> 3. **Org standing** — `hasOrgAdminAccess` + role-assignment queries
>    (`server/web/organization/org-admin-access.ts`) answers "what is this account's standing
>    in THIS organization?" The ONLY authz reader of `Membership` role assignments.
> 4. **Entitlements** — `hasEntitlement` (`server/web/entitlements/queries.ts`) answers "has
>    this account been granted this product capability (paid or comped)?" Commerce, not
>    authority-of-record.
>
> Ownership (`userId === owner`) is an aggregate invariant asserted in-handler (belt-router
> pattern), not a system. Surfaces needing multiple axes compose predicates in a named server
> helper (`canUploadMedia` pattern), never inline. Grants are additive-only and audited.
> A new authz need = a new *key* or a new *composition helper* — never a new store or resolver.

Deny-behavior standard (ratify in `auth.md`): route segment → `redirect`; public-route page →
`notFound()`; oRPC/API → 401/403; server action → typed error. Each gate helper documents its
lane.

### Conformance sweep (future lane — sized S/M per item, independent slices)

| # | Item | Evidence | Size |
|---|---|---|---|
| 1 | Delete dead HOCs `withAdminPage`/`withLineageAdminPage`/`withTournamentAdminPage`; relocate `hasLineageAdminAccess` to `lib/auth-guard.ts` | `components/admin/auth-hoc.tsx` (0 consumers for all three HOCs); live importer `app/(web)/lineage/[treeSlug]/page.tsx:15` | S |
| 2 | Unify `hasLineageAdminAccess` + `hasAnyLineageGrant` behind one helper with an explicit role-set param (or label as do-not-merge twins with a WL entry) | `auth-guard.ts:116` vs `auth-hoc.tsx:24` — different role sets, undocumented | S |
| 3 | Convert raw `role === "admin"` action gates to `can(user, <area-key>)`; identity-only branches to `isAdmin()` | `app/app/repo-docs/docs-navigator/route.ts:9` → `can(user,"repo-docs.manage")`; `server/web/actions/search.ts:18`; `server/web/onboarding/queries.ts:73`; `server/admin/lineage/queries.ts:35,121`; `server/admin/claims/passport-claim-review-actions.ts:295`; `org-admin-access.ts:17` → `isAdmin()` | M (~10 live sites; `app/admin/layout.tsx` dies with `/admin`) |
| 4 | Merge `checkEntitlement` into `hasEntitlement` (kill the `entitlement/` vs `entitlements/` dir twin); mind the 60s cache-tag invalidation gotcha (WL-P2-19) | `server/web/entitlement/check-entitlement.ts:9` | S |
| 5 | Migrate `editor-queries.ts`/`editor-authorization.ts` hand-rolled `LineageTreeAccess` resolution onto `resource-permissions.ts` (SOT-ADR D4 completion) | `editor-queries.ts:57–95`; `editor-authorization.ts`; 8 files query the table directly, 5 legitimately | M–L (adversarial tests first, per belt-lane lesson) |
| 6 | Swap `lib/safe-actions.ts:76,87` raw comparisons to `isAdmin()`/`roleOf()` as an interim; full retirement rides the oRPC migration (don't accelerate it for this) | `safe-actions.ts:76,87` | S |
| 7 | Ratify the deny-behavior table + this rule in `docs/architecture/auth.md` | `auth.md` § Roles already carries the axes | S |

### FI-019 design implication

- **Where it belongs:** inside axis 1's resolution, exactly as `POST_LAUNCH_SOT.md` FI-019 frames
  it. Add a `UserPermissionGrant` table shaped like `LineageTreeAccess`'s grant hygiene:
  `{ userId, grant (Grant string, e.g. "beta.view"), grantedById, reason?, createdAt,
  revokedAt }` — soft-revoke, audited (the 0452 role-change-audit precedent), self-grant
  blocked (the 0452 self-escalation precedent).
- **Resolution:** effective grants = `ROLES[roleOf(user)]` ∪ active user-override grants, same
  `matchesPattern`. **Keep `can()` synchronous** — it is load-bearing in UI visibility and the
  procedure gate (39+ sites). Resolve overrides once at session load and carry them on
  `SessionUser` (e.g. `extraGrants: Grant[]` via the Better Auth session seam), so
  `can()` becomes `[...roleGrants, ...(user.extraGrants ?? [])].some(matchesPattern)`.
  Invalidate on grant change (session refresh or short TTL — same class of gotcha as the
  WL-P2-19 entitlement cache; check it live at grant time).
- **What it must NOT be:** a fifth store read inline by feature code; an async fork of
  `can()`; a second permission vocabulary; a deny/negative-grant mechanism (stay monotonic —
  overrides only ADD, mirroring `canWithGrants`); an org- or resource-scoped thing (axes 3/2
  already exist for that).
- **`beta.view` day one:** zero plumbing — `admin: ["*"]` (`roles.ts:62`) already covers it;
  gate the `/app/beta` layout with `requirePermission("beta.view")` and the key is
  FI-019-ready the moment the override table lands.
