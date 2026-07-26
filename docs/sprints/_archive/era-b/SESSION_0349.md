---
title: "SESSION 0349 - BBL trust badges and directory discovery plan"
slug: session-0349
type: session--open
status: closed
created: 2026-06-06
updated: 2026-06-06
last_agent: codex-session-0349
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0348.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
  - docs/product/black-belt-legacy/STORIES.md
  - docs/runbooks/domain-features/lineage-listing-runbook.md
  - docs/architecture/decisions/0012-tier-auto-grant.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0349 - BBL trust badges and directory discovery plan

## Date

2026-06-06

## Operator

Brian + codex-session-0349

## Goal

Finish BBL launch trust/discovery polish by adding consistent trust status badges to directory cards,
`/directory/[slug]`, and lineage drawer/card surfaces, then plan the first faceted `/directory` slice.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md).
Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0348.md`.
- Carryover: SESSION_0348 made `/directory` the canonical public people/profile surface, tier-gated profile detail
  reads by owner/listing entitlement, and redirected `/members` compatibility routes. It explicitly deferred trust
  badge consistency, future faceted directory expansion, and old `components/web/members/*` cleanup.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0349.md`.
- Current HEAD at bow-in: `991a948`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd is
  `/Users/brianscott/dev/ronin-dojo-app` (not `dirstarter_template`).

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Public web components, Prisma read projections, auth/session-derived preview behavior, monetized listing tiers. |
| Extension or replacement | Extension: keep Dirstarter-style feature folders and Prisma query payloads, reuse common UI primitives, and build on the existing entitlement/listing read model. |
| Why justified | BBL launch stories require trust/status badges on public directory and lineage surfaces, while ADR 0011/0019 keep paid feature state in entitlement rows rather than membership lifecycle rows. |
| Risk if bypassed | Badge labels could drift by surface, public pages could imply trust that the data model does not prove, or tier naming could diverge across docs/admin/code. |

Live docs checked during planning on 2026-06-06:

- Dirstarter Project Structure: `https://dirstarter.com/docs/codebase/structure`
- Dirstarter Prisma Setup: `https://dirstarter.com/docs/database/prisma`
- Dirstarter Authentication: `https://dirstarter.com/docs/authentication`
- Dirstarter Monetization: `https://dirstarter.com/docs/monetization`

### Graphify check

- Graph status: usable/current enough for bow-in; SESSION_0348 refreshed Graphify at close, and `graphify stats`
  at bow-in returned 9379 nodes, 14645 edges, 1379 communities, 1592 files tracked. The report has no commit header,
  so exact source reads remain the proof.
- Queries used:
  - `DirectoryProfile trust status badge claim state LineageNode rank awards directory slug lineage drawer ADR 012 subscription tiers legend`
  - `trust badge verified claimed DirectoryProfile LineageNode rankAward lineage profile drawer directory status`
  - `ADR 012 subscription tiers free basic premium elite legend UserEntitlement listing tier`
  - `DirectoryProfile claim status LineageClaim rank award verified source review status admin lineage claims`
  - `LineageVerificationStatus verificationStatus isVerified RankAward DirectoryProfile schema prisma LineageClaimRequest status`
  - `subscription tier form code basic legend SubscriptionTier seed free premium elite`
- Files selected from graph:
  - `docs/sprints/SESSION_0348.md`
  - `docs/product/black-belt-legacy/GAP_MATRIX.md`
  - `docs/product/black-belt-legacy/STORIES.md`
  - `docs/runbooks/domain-features/lineage-listing-runbook.md`
  - `docs/architecture/decisions/0012-tier-auto-grant.md`
  - `apps/web/prisma/schema.prisma`
  - `apps/web/server/web/directory/queries.ts`
  - `apps/web/server/web/directory/payloads.ts`
  - `apps/web/app/(web)/directory/[slug]/page.tsx`
  - `apps/web/components/web/lineage/lineage-node-card.tsx`
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/lib/entitlements/lineage-tier-policy.ts`
  - `apps/web/lib/entitlements/lineage-comp.ts`
  - `apps/web/app/admin/subscription-tiers/_components/subscription-tier-form.tsx`
  - `apps/web/server/admin/subscription-tiers/actions.ts`
  - `apps/web/server/admin/subscription-tiers/schema.ts`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof. No repo-wide grep/rg
  was used for file or doc discovery.

### Field inventory

| Source | Current trust/status fields available | Launch badge implication |
| --- | --- | --- |
| `DirectoryProfile` | `visibility`; field privacy flags `showEmail`, `showPhone`, `showOrgs`, `showRanks`; `slug`; media fields; no direct trust, claim, imported, disputed, or verification field. | Directory badges cannot come from `DirectoryProfile` alone. They need a presentation adapter fed by related `LineageNode`, claim, and entitlement/listing policy fields. |
| `LineageNode` | `visibility`, `isVerified`, `verificationStatus: PENDING | VERIFIED | DISPUTED`, `archivedAt`, `slug`, `claimRequests`. | Existing enum is enough for `Verified`, `Disputed`, and pending/unverified launch labels. `isVerified` is legacy/compat and should be treated as a fallback for `VERIFIED`. |
| `LineageRelationship` | `isVerified`, `verificationStatus: PENDING | VERIFIED | DISPUTED`, relation type/dates, optional `rankAwardId`. | Relationship badges can use the same trust adapter later; current session can avoid widening relationship UI beyond existing drawer labels unless needed. |
| `RankAward` | `awardedAt`, `notes`, `location`, `mediaUrls`, `awardedById`, `organizationId`, `promotionEventId`; no trust/status enum. | Rank trust is inferential only today: promoter, awarding organization, ceremony, media attachments, or linked relationship can support copy, but a true rank-dispute badge needs a later schema/status expansion. |
| `LineageClaimRequest` | `status: PENDING | APPROVED | DENIED | NEEDS_INFO | CANCELLED`, notes, `reviewedAt`, claimant/reviewer, evidence. | Claim state can derive `Claimed`, `Claim pending`, or `Claimable` when queries select latest/relevant claims. Public evidence must stay private. |
| `LineageTree` / `LineageTreeMember` | `visibility`, `isPublished`, `isClaimable`; tree member `isClaimable`, `showPromotionDatePublic`, `showRankPublic`, `rankAwardId`. | Claimability and tree/member public flags can feed secondary badges, but they should not be confused with verification. |
| Listing/tier policy | `LineageListingTier` currently `free | premium | elite`; lineages use premium/elite entitlement keys only. | Launch trust badges should not require tier schema. ADR 0012 tier docs/code need cleanup if `legend` is now the all-features-free-for-life tier and `basic` is retired. |

### Grill outcome

Round 1 from operator:

- Agreed: ship the trust badge as a shared presentation adapter over existing fields for this launch slice; no trust
  schema migration this session.
- Agreed: use badge vocabulary/priority `Disputed` > `Verified` > `Claimed` > `Claim pending` > `Imported` >
  `Unverified`, with `Claimable` as a secondary badge when relevant.
- Agreed: do the limited `basic`/`legend` cleanup now, but defer broad checkout/webhook/seed migration to the next
  session if it expands.

- Petey recommendation: ship the trust badge as a shared presentation adapter over existing fields for this launch
  slice. Do not add a trust schema migration yet. The only schema gap worth recording is rank-award dispute status,
  and that is already a known follow-up (`BBL-RANK-004`).
- Petey recommendation: make `/directory` consume derived lineage trust by joining the related `LineageNode` for the
  profile user and latest public/approved claim state. Keep claim evidence and reviewer notes out of public payloads.
- Petey recommendation: treat `legend` tier alignment as a small parallel cleanup only if the implementation is limited
  to tier constants, policy adapters, seeds/docs, and tests. If it requires broader checkout/webhook/admin data migration,
  split it to a follow-up.

### Drift logged

- `D-019` logged and resolved: `docs/architecture/decisions/0012-tier-auto-grant.md` still documented `BASIC` while
  lineage policy code did not recognize `LEGEND`. SESSION_0349 removed `BASIC` from the tier ADR, added limited
  `LINEAGE_LEGEND` policy/helper support, and deferred broad checkout/webhook/seed migration.

## Petey plan

### Goal

Ship one coherent BBL trust badge/status presentation across the current public directory and lineage surfaces, then
leave the first faceted `/directory` slice planned but not built.

### Tasks

#### SESSION_0349_TASK_01 - Trust/status inventory and decision lock

- **Agent:** Petey -> Cody
- **What:** Finish the trust/status field inventory and lock the launch badge source contract.
- **Steps:**
  1. Confirm every currently selected public field for `DirectoryProfile`, `LineageNode`, rank awards, and claim state.
  2. Decide whether the launch badge is a shared presentation adapter over existing fields or a schema/status expansion.
  3. Decide how much of the ADR 0012 `basic`/`legend` cleanup belongs in this session.
  4. Record the decisions and field matrix in this SESSION file before code edits.
- **Done means:** field matrix plus explicit badge/tier decisions are recorded; code scope is locked.
- **Depends on:** nothing.

#### SESSION_0349_TASK_02 - Shared trust badge implementation

- **Agent:** Cody -> Desi -> Doug
- **What:** Add and consume a shared trust badge/status adapter across directory card/detail and lineage card/drawer
  surfaces.
- **Steps:**
  1. Add a small typed trust-status resolver/component using existing `LineageVerificationStatus`, legacy `isVerified`,
     claim state, and claimability inputs.
  2. Widen only the necessary public read payloads so `/directory` and `/directory/[slug]` can derive trust without
     selecting private claim evidence or review notes.
  3. Replace ad hoc badge logic in `lineage-node-card.tsx` and `lineage-profile-drawer.tsx` with the shared adapter.
  4. Add badges to directory cards and `/directory/[slug]` without changing the tier-gating privacy contract from
     SESSION_0348.
  5. Add focused tests for resolver priority and public payload no-leak behavior.
- **Done means:** one shared trust/status component or adapter is used by the target surfaces; tests prove status priority
  and public payload safety.
- **Depends on:** SESSION_0349_TASK_01.

#### SESSION_0349_TASK_03 - Tier-doc alignment, faceted-directory plan, and close

- **Agent:** Giddy -> Doug -> Petey
- **What:** Align the stale ADR/tier note if in approved scope, write the first faceted `/directory` slice plan, verify,
  and run full bow-out.
- **Steps:**
  1. If approved in the grill, remove stale `basic` tier language from the tier-auto-grant ADR and add `legend` to the
     relevant code/docs without broad payment rewiring.
  2. Plan the first faceted `/directory` slice across people, schools, organizations, and lineage trees without restoring
     `/members` as a duplicate list.
  3. Run targeted tests, typecheck, wiki lint, and browser smoke if UI routes changed.
  4. Run full `closing.md`, including optional deep close items, component inventory updates if a new shared component
     lands, ADR check, hostile close review, Graphify refresh, commit, and push to `main`.
- **Done means:** docs/code tier scope is either landed or explicitly deferred; next directory slice is staged; gates pass;
  session is closed, committed, and pushed.
- **Depends on:** SESSION_0349_TASK_02.

### Parallelism

Keep this inline with baton handoffs: Petey -> Cody -> Desi -> Doug -> Petey. The implementation touches the same
directory/lineage payloads and UI components, so subagents or worktrees would add more coordination cost than they save.
Use Graphify queries as the discovery accelerator instead of spawning parallel agents.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0349_TASK_01 | Petey -> Cody | The main fork is policy/source selection, not typing code. |
| SESSION_0349_TASK_02 | Cody -> Desi -> Doug | Shared UI adapter, server read widening, design consistency, and no-leak verification are coupled. |
| SESSION_0349_TASK_03 | Giddy -> Doug -> Petey | ADR/tier alignment, close gates, and next-slice planning need architecture/process review. |

### Open decisions

- None at plan-lock. Operator confirmed the existing-field adapter, badge priority, and limited `basic`/`legend` scope.

### Risks

- Directory profile rows do not have direct trust fields, so the query must join only safe lineage/claim summary fields
  without leaking claim evidence.
- `RankAward` has no trust/status enum; forcing rank-dispute UI this session would require a schema decision and should
  be deferred unless the operator explicitly expands scope.
- There are duplicate ADR 0012 numbers. Any tier work must reference `docs/architecture/decisions/0012-tier-auto-grant.md`
  by path.

### Scope guard

- No BBL.com import cohort or dedup work.
- No restoration of `/members` as a public list.
- No full faceted `/directory` implementation this session; plan only.
- No broad Stripe checkout/webhook rewrite for `legend` unless the operator explicitly expands scope after the grill.
- Do not delete `components/web/members/*` until a cleanup session proves internal references are dead.
- Do not add `fallow` as a CI/local gate without separate approval; at most record a read-only spike recommendation.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Project Structure, Prisma Setup, Authentication, and Monetization checked on 2026-06-06;
  local SESSION_0348, BBL GAP/STORIES, lineage listing runbook, ADR 0012 tier-auto-grant, schema, and target files read.
- **Baseline pattern to extend:** feature-foldered server reads under `server/web/*`, Prisma `select` payload allowlists,
  Better Auth server session via `getServerSession`, common Badge/Avatar/Button primitives, public web components under
  `components/web`.
- **Custom delta:** Ronin lineage trust status derived from `LineageNode`, `LineageClaimRequest`, and entitlement/listing
  policy fields.
- **No-bypass proof:** no duplicate payment, membership lifecycle, or directory substrate; badges present existing trust
  state rather than inventing a parallel status system.

## Cody pre-flight

### Pre-flight: SESSION_0349_TASK_02 - Shared trust badge implementation

#### 1. Existing component scan

- Graphify query used: `trust badge verified claimed DirectoryProfile LineageNode rankAward lineage profile drawer directory status`.
- Found:
  - `apps/web/components/web/verified-badge.tsx` - icon-only verified tooltip; not enough for disputed/imported/claimed.
  - `apps/web/components/web/lineage/lineage-node-card.tsx` - ad hoc verified/unverified and claim badges.
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx` - local `VerificationBadge` helper with
    disputed/verified/unverified handling.
  - `apps/web/components/web/directory/directory-list.tsx` and
    `apps/web/app/(web)/directory/[slug]/page.tsx` - no lineage trust badge today.
  - `apps/web/server/web/directory/payloads.ts` and `apps/web/server/web/lineage/payloads.ts` - safe select payloads
    that can be widened with status-only trust summaries.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Consulted live alignment URLs: yes, Dirstarter Project Structure, Prisma Setup, Authentication, Monetization.
- Closest L1 pattern: common primitives composed inside public feature-folder components; server reads use Prisma select
  payload allowlists under `server/web/<feature>/payloads.ts`.
- Primitive API spot-check:
  - `Badge`: `variant: primary | soft | outline | success | caution | warning | info | danger`, `size: sm | md | lg`,
    `prefix`, `suffix`, `render`, `children`.
  - `Avatar`: `className`, Base UI root props; `AvatarImage` image props; `AvatarFallback` fallback props.
  - `Card`: `hover`, `focus`, `isRevealed`, `isHighlighted`, `render`, native div props.
  - `Button`: `variant: fancy | primary | secondary | soft | ghost | destructive`, `size: xs | sm | md | lg`,
    `isPending`, `prefix`, `suffix`, `render`, `children`.
  - `Note`: paragraph props plus optional `as` element.

#### 3. Composition decision

- Extending existing component: replace local/ad hoc trust badge render blocks in `LineageNodeCard` and
  `LineageProfileDrawer`.
- Composing existing components: new `LineageTrustBadge` / `LineageClaimBadge` will compose `Badge` + lucide icons.
- New component justification: existing `VerifiedBadge` only represents one verified icon state and uses tooltip copy;
  BBL launch needs visible labels for disputed, verified, claimed, claim pending, imported, unverified, and claimable.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: `docs/architecture/decisions/0011-entitlement-first-commerce.md`,
  `docs/architecture/decisions/0019-membership-lifecycle-ownership.md`,
  `docs/architecture/decisions/0012-tier-auto-grant.md`.
- Runbook consulted: `docs/runbooks/domain-features/lineage-listing-runbook.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: `http://localhost:3000`, likely `/directory`, `/directory/sensei-demo`, and
  `/lineage/rigan-machado-bjj-lineage` if browser smoke is needed.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0002, FS-0008, FS-0024, FS-0342-class deterministic full-suite behavior from
  recent session notes.
- Mitigation acknowledged: Graphify-first discovery, exact primitive/schema spot-checks, known dev server command,
  repo/remote guard completed, focused tests instead of broad noisy suites.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0349_TASK_01 | complete | Field inventory and Petey grill locked the existing-field adapter, badge priority, and limited tier scope. |
| SESSION_0349_TASK_02 | complete | Added shared trust resolver/badges; widened safe directory/lineage payload summaries; wired badges into directory cards/detail and lineage cards/drawer; added focused tests. |
| SESSION_0349_TASK_03 | complete | Removed stale `BASIC` ADR language, added limited `LEGEND` policy support, documented drift, planned the first faceted `/directory` slice, verified, and completed close prep. |

## What landed

- Shared trust status resolver in `lib/lineage/trust-status.ts` with the launch priority:
  `Disputed` > `Verified` > `Claimed` > `Claim pending` > `Imported` > `Unverified`, plus optional secondary
  `Claimable`.
- Shared `LineageTrustBadge` / `LineageClaimBadge` component that composes the existing `Badge` primitive and lucide
  icons.
- Directory cards and `/directory/[slug]` now render trust badges from safe lineage/claim summaries.
- Lineage node cards and the lineage profile drawer now consume the shared trust badge instead of ad hoc local
  verification badge logic.
- Directory and lineage payloads select status-only trust summaries (`verificationStatus`, `isVerified`,
  `User.isPlaceholder`, and claim statuses) without selecting claim evidence, claimant notes, reviewer notes, or reviewer
  identity.
- Free lineage cards can render public trust/claim badges while avatar, school, action menu, honor-strip avatar,
  bio preview, and drawer opening remain tier-gated.
- `LINEAGE_LEGEND` is now recognized by lineage comp/tier policy helpers as the top full-feature tier; broad
  checkout/webhook/seed migration remains a follow-up.
- `BASIC` was removed from the active tier-auto-grant ADR table; `D-019` records the resolved tier-ladder drift.
- Product/runbook/wiki docs now reflect SESSION_0349 trust badges, `premium/elite/legend` wording, and next faceted
  `/directory` scope.

## Faceted `/directory` Slice Plan

### Recommended first slice

Build a read-only canonical `/directory` faceted browse shell with four result groups, preserving `/directory` as the
single public discovery URL:

1. **People** — current `DirectoryProfile` results stay the default tab/group and keep SESSION_0348 tier gating plus
   SESSION_0349 trust badges.
2. **Schools / Organizations** — reuse existing public organization/school query patterns; card fields should be name,
   type, location, discipline count or discipline label, and public profile link.
3. **Lineage trees** — reuse published `LineageTree` public payloads; card fields should be tree name, discipline/scope,
   published/claimable/trust summary if available, and link to `/lineage/[treeSlug]`.
4. **Disciplines / filters** — first filter set should be discipline, rank, school/org, location, and result type. Do not
   introduce `/members` as a duplicate public list.

### First implementation task for that slice

Use Graphify to inventory existing public read models for directory, organizations/schools, and lineage trees, then design
a compact `DirectoryFacetResult` read model that keeps each entity's source query separate but normalizes only the card
header fields, href, type, and badges for display.

### Guardrails

- Keep `/directory` canonical; `/members` remains redirects only.
- Start with server-rendered grouped results or a simple result-type segmented control; do not build a heavy client-side
  search app in the first slice.
- Reuse existing filter primitives and query params where possible.
- Preserve privacy floors: `DirectoryProfile` field flags, lineage visibility/published flags, and organization brand
  scoping.

## Decisions resolved

- Use a shared presentation adapter/component over existing fields now; no trust schema migration this session.
- Badge priority: `Disputed` > `Verified` > `Claimed` > `Claim pending` > `Imported` > `Unverified`; `Claimable` can render
  as a secondary badge where the surface has claimability data.
- Directory trust must be derived through safe related lineage/claim summary fields, not added to `DirectoryProfile`.
- Rank-award dispute status remains a future schema/status expansion (`BBL-RANK-004`), because `RankAward` has no
  trust/status field today.
- Limited `basic`/`legend` cleanup is in scope; broad checkout/webhook/seed migration is deferred if it expands.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0349.md` | Bow-in, field inventory, Petey plan, and pending task ledger. |
| `apps/web/lib/lineage/trust-status.ts` | New pure trust/claim status resolver over existing lineage/user/claim fields. |
| `apps/web/lib/lineage/trust-status.test.ts` | New unit coverage for launch badge priority and claimable secondary status. |
| `apps/web/components/web/lineage/lineage-trust-badge.tsx` | New shared trust and claim badge presentation component. |
| `apps/web/components/web/directory/directory-list.tsx` | Renders trust/claim badges and `legend` tier labels on directory cards. |
| `apps/web/app/(web)/directory/[slug]/page.tsx` | Renders trust/claim badges and `legend` tier labels on the canonical profile detail route. |
| `apps/web/components/web/lineage/lineage-node-card.tsx` | Replaces ad hoc verified/claim badge logic with shared resolver/badges. |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | Replaces local verification helper with shared resolver/badges. |
| `apps/web/server/web/directory/payloads.ts` | Adds safe lineage trust summary fields to directory list/preview/detail payloads. |
| `apps/web/server/web/directory/queries.ts` | Projects directory trust/claim badge status from safe related fields. |
| `apps/web/server/web/directory/profile-tier-policy.integration.test.ts` | Extends real-DB profile gating proof with lineage trust projection. |
| `apps/web/server/web/lineage/payloads.ts` | Adds safe placeholder/claim summary fields to lineage card/drawer payloads. |
| `apps/web/lib/entitlements/lineage-comp.ts` | Adds `LINEAGE_LEGEND` entitlement key/schema support and grant expansion helper. |
| `apps/web/lib/entitlements/lineage-tier-policy.ts` | Adds `legend` policy and allows free lineage cards to show public trust/claim badges. |
| `apps/web/lib/entitlements/lineage-tier-policy.test.ts` | Adds `legend` policy and free trust-badge expectations. |
| `docs/architecture/decisions/0012-tier-auto-grant.md` | Retires `BASIC` from the active tier table and documents `LEGEND` as all-features free-for-life. |
| `docs/product/black-belt-legacy/PRD.md` | Aligns full-profile tier wording to premium/elite/legend. |
| `docs/product/black-belt-legacy/STORIES.md` | Aligns profile story acceptance criteria to premium/elite/legend. |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | Marks BBL-PROFILE-004 and BBL-LINEAGE-005 built; updates next recommendations. |
| `docs/runbooks/domain-features/lineage-listing-runbook.md` | Documents SESSION_0349 trust badge source contract and limited legend support. |
| `docs/knowledge/wiki/drift-register.md` | Adds resolved drift D-019 for BASIC/LEGEND tier mismatch. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Documents `LineageTrustBadge` / `LineageClaimBadge` and updated free lineage policy behavior. |
| `docs/knowledge/wiki/files/directory-page.md` | Documents directory trust derivation and premium/elite/legend full-profile gating. |
| `docs/knowledge/wiki/files/directory-list-component.md` | Documents directory card trust badge behavior. |
| `docs/knowledge/wiki/index.md` | Adds SESSION_0349 and new component discoverability; updates BBL gap matrix summary. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` at bow-in | Passed - 9379 nodes, 14645 edges, 1379 communities, 1592 files tracked. |
| Graphify queries listed above | Passed; selected files opened directly afterward. |
| `cd apps/web && bun test lib/lineage/trust-status.test.ts lib/entitlements/lineage-tier-policy.test.ts server/web/directory/profile-tier-policy.integration.test.ts` | Passed - 20 tests, 67 assertions. |
| `cd apps/web && bun run typecheck` | Passed - `next typegen` + `tsc --noEmit --pretty false`. |
| `cd apps/web && bun run lint` | Passed - Biome checked 1198 files and fixed 1 formatting file. |
| `bun run wiki:lint` | Passed - 603 markdown files, 0 violations. |
| `git diff --check` | Passed - no whitespace errors. |
| Local Playwright desktop smoke (`/directory`, `/directory/sensei-demo`, `/lineage/rigan-machado-bjj-lineage`) | Passed - all 200, expected route text present, trust badge text present, no console/page errors. |
| Local Playwright mobile smoke at 390x844 (`/directory`, `/directory/sensei-demo`, `/lineage/rigan-machado-bjj-lineage`) | Passed - all 200, trust badge text present, no horizontal overflow, no console/page errors. |
| `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` then `graphify stats` | Passed - final stats 9395 nodes, 14688 edges, 1376 communities, 1595 files tracked. |

## Open decisions / blockers

- No blockers.
- Broad `legend` checkout/webhook/seed migration is explicitly deferred to a follow-up session.
- Rank-award disputed status remains a future schema/status decision (`BBL-RANK-004`); this session did not add a
  `RankAward` trust enum.
- Old `components/web/members/*` deletion remains deferred until a cleanup session proves no internal consumers remain.
- `fallow-rs/fallow` remains a good read-only spike candidate, but it was not introduced as a close/CI gate.

## Next session

### Goal

Plan and implement the first faceted `/directory` browse slice across people, schools/organizations, and lineage trees
without restoring `/members` as a duplicate public list.

### Inputs to read

- `docs/sprints/SESSION_0349.md`
- `docs/product/black-belt-legacy/GAP_MATRIX.md`
- `docs/runbooks/domain-features/lineage-listing-runbook.md`
- `apps/web/server/web/directory/queries.ts`
- `apps/web/components/web/directory/directory-query.tsx`
- `apps/web/components/web/directory/directory-list.tsx`
- existing public organization/school query and card files selected by Graphify
- existing public lineage tree query/list files selected by Graphify

### First task

Use Graphify first with `faceted directory people schools organizations lineage trees filters` to inventory existing public
read models and card components, then design the smallest `DirectoryFacetResult` adapter that lets `/directory` render
grouped people, organization/school, and lineage-tree cards while preserving each source model's privacy and brand-scope
rules.

## Review log

### SESSION_0349_REVIEW_01 - Trust badge launch polish

- **Reviewed tasks:** SESSION_0349_TASK_01, SESSION_0349_TASK_02, SESSION_0349_TASK_03
- **Dirstarter docs check:** live docs checked.
- **Sources:** Dirstarter Project Structure, Prisma Setup, Authentication, Monetization; local BBL GAP/STORIES/PRD,
  lineage listing runbook, ADR 0012 tier-auto-grant, ADR 0011/0019.
- **Verdict:** Pass. The session used a presentation adapter over existing lineage/claim fields, kept DirectoryProfile
  privacy/tier gating intact, avoided a trust schema migration, and proved the visible routes with focused tests plus
  browser smoke.
- **Score:** 9.7/10
- **Follow-up:** Broad `legend` checkout/webhook/seed migration and rank-award disputed status remain separate sessions.

## Hostile close review

| Check | Verdict |
| --- | --- |
| Giddy / architecture | Pass. Extends Dirstarter-style feature folders, Prisma select payloads, common Badge primitives, and the existing entitlement/listing policy rather than creating a parallel trust or commerce substrate. |
| Doug / QA | Pass. Pure resolver tests prove priority, real-DB test proves directory trust projection with no tier-gating regression, typecheck/lint/wiki gates are green, and Playwright desktop/mobile smoke proves route rendering with no console errors or mobile overflow. |
| Desi / UX | Pass. Badge vocabulary is consistent across directory card/detail and lineage card/drawer; free cards show public trust without exposing gated profile fields. |
| Dirstarter docs check | Live docs checked: Project Structure, Prisma Setup, Authentication, Monetization. Aligned. |
| Security/privacy | Pass. Public payloads select claim status summaries only; no claim evidence, claimant notes, reviewer notes, or reviewer identity are selected or rendered. |
| Data integrity | Pass. Trust badges present existing data; no new schema invariant is claimed. `RankAward` dispute status is explicitly deferred. |
| Verification honesty | Pass. Tests and browser smoke prove the actual surfaces touched. |
| Workflow honesty | Pass. Bow-in, Graphify-first discovery, Petey grill, Cody pre-flight, task IDs, review, docs, and close evidence are recorded. |
| Score cap | No cap. |

### Findings (severity >= medium)

None.

### Kaizen triage

- **Safe/security proof:** The safe part is the public payload shape: only lineage verification flags, placeholder flag,
  and claim statuses are selected. The tests prove resolver priority and directory projection; browser smoke proves
  route rendering. Remaining unproven work is the future faceted `/directory` slice and broad `legend` migration.
- **Failed-step prevention:** No failed steps. The useful simplification was keeping this inline instead of spawning
  subagents; overlapping payload/UI files made baton handoff cheaper than parallel work.
- **Scale confidence:** 100 profiles: 9.7; 1,000 profiles: 9.4 because directory list now includes nested lineage claim
  summaries and should be watched during faceting; 10,000 profiles: 8.8 until faceted search/pagination is designed.
  Aggregate for this launch slice: 9.4, acceptable because current public lists are not at 10k scale before the next
  directory slice.

## ADR / ubiquitous-language check

- Updated existing ADR: `docs/architecture/decisions/0012-tier-auto-grant.md` removed stale `BASIC` and documented
  `LEGEND` as all-features free-for-life.
- New ADR not needed: trust badges are presentation over existing `LineageVerificationStatus`, `LineageClaimRequest`,
  and `User.isPlaceholder` fields.
- Ubiquitous language update not needed: `DirectoryProfile`, `LineageNode`, `RankAward`, `LineageClaimRequest`, and
  `UserEntitlement` are existing terms.

## Reflections

- The key safety decision was not to add a `DirectoryProfile` trust field. Directory trust is derived from the related
  lineage/claim substrate, which keeps DirectoryProfile focused on visibility/privacy.
- The real-DB test initially failed because the detail preview payload did not select the lineage trust summary. That
  caught the exact class of read-model drift this session was meant to prevent.
- The browser MCP profile was locked, so local Playwright with a fresh Chromium instance was the right fallback for
  route, console, and mobile overflow checks.
- `legend` support is intentionally partial: policy/helper code recognizes it, but broad checkout/webhook/seed migration
  is queued rather than smuggled into a trust-badge session.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated touched docs/frontmatter dates and `last_agent` on BBL PRD/STORIES/GAP_MATRIX, ADR 0012 tier-auto-grant, lineage listing runbook, directory wiki pages, drift register, custom component inventory, wiki index, and this SESSION. |
| Backlinks/index sweep | Added SESSION_0349 backlinks/pairs where relevant; wiki index now includes SESSION_0349 and the new trust badge component. |
| Wiki lint | `bun run wiki:lint` passed - 603 markdown files, 0 violations. |
| Kaizen reflection | Present in `## Reflections` and `### Kaizen triage`. |
| Hostile close review | Present in `## Hostile close review`; no medium+ findings. |
| Review & Recommend | Next session goal, inputs, and first task written for faceted `/directory`. |
| Memory sweep | No operator memory update needed; durable facts live in ADR/runbook/product/wiki docs. |
| Next session unblock check | Unblocked; first task is Graphify-first inventory and read-model design. |
| Git hygiene | Branch `main`; single push planned; hash reported at bow-out - see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` passed before commit; final `graphify stats`: 9395 nodes, 14688 edges, 1376 communities, 1595 files tracked. |
