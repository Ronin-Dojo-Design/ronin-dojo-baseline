---
title: "SESSION 0348 — BBL profile/detail tier-gating policy consumption"
slug: session-0348
type: session--open
status: closed
created: 2026-06-05
updated: 2026-06-05
last_agent: codex-session-0348
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0347.md
  - docs/runbooks/domain-features/lineage-listing-runbook.md
  - docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/decisions/0019-membership-lifecycle-ownership.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0348 — BBL profile/detail tier-gating policy consumption

## Date

2026-06-05

## Operator

Brian + codex-session-0348

## Goal

Finish BBL tier-gating consumption beyond the lineage tree: identify every public DirectoryProfile/member/detail
surface that exposes lineage-card-style details, consolidate policy usage where possible, apply the entitlement-derived
render policy to those surfaces, and run a focused free vs premium/elite smoke.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0347.md`.
- Carryover: SESSION_0347 added the audited admin entitlement write path, the `LineageListingRenderPolicy` read model,
  lineage tree/card consumption, QR sharing, and WL-P1-6 remediation. It explicitly left directory/profile tier-gating
  consumption as the next-session scope.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0348.md`.
- Current HEAD at bow-in: `63ec6ba`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd is
  `/Users/brianscott/dev/ronin-dojo-app` (not `dirstarter_template`).

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization/listing tiers, auth/session visibility, Prisma read queries, public web components. |
| Extension or replacement | Extension: reuse Dirstarter-style directory/listing primitives plus Ronin's existing entitlement read model; no new Stripe/payment or membership lifecycle path. |
| Why justified | The BBL runbook makes lineage/profile visibility a paid listing concern, and ADR 0011/0019 require paid-feature read sites to consume `UserEntitlement`, not payment IDs or `Membership.status`. |
| Risk if bypassed | Public member/detail pages can keep leaking full-card fields even after the lineage tree is gated, breaking the BBL launch monetization rule. |

Live docs checked during planning on 2026-06-05: Dirstarter Project Structure, Prisma Setup, Authentication, and
Monetization. Relevant anchors: server code stays feature-foldered with Prisma reads; Better Auth/session is the
auth baseline; monetization exposes free/standard/premium listing concepts and paid visibility/placement behavior.

### Graphify check

- Graph status: current; stats at bow-in: 9360 nodes, 14576 edges, 1376 communities, 1591 files tracked.
- Queries used:
  - `DirectoryProfile member profile detail lineage card LineageListingRenderPolicy premium elite`
  - `WL-P1-6 lineage listing render policy directory profile surfaces`
  - `public DirectoryProfile member detail profile page lineage profile drawer rank awards bio links`
  - `members slug page directory payloads DirectoryProfile lineageNode rankAwards public profile`
  - `member-query member-listing DirectoryProfile ranks organizations members public list`
  - `member-card public profile avatar bio disciplines location full card free listing policy`
- Files selected from graph:
  - `apps/web/lib/entitlements/lineage-tier-policy.ts`
  - `apps/web/server/web/entitlements/lineage-tier-policy.ts`
  - `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`
  - `apps/web/components/web/lineage/lineage-node-card.tsx`
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
  - `apps/web/app/(web)/directory/page.tsx`
  - `apps/web/components/web/directory/directory-query.tsx`
  - `apps/web/components/web/directory/directory-list.tsx`
  - `apps/web/server/web/directory/payloads.ts`
  - `apps/web/server/web/directory/queries.ts`
  - `apps/web/app/(web)/members/page.tsx`
  - `apps/web/app/(web)/members/[slug]/page.tsx`
  - `apps/web/components/web/members/member-query.tsx`
  - `apps/web/components/web/members/member-list.tsx`
  - `apps/web/components/web/members/member-card.tsx`
  - `apps/web/server/web/directory/search-profiles.ts`
  - `apps/web/app/(web)/disciplines/_components/member-carousel-by-rank.tsx`
  - `apps/web/app/(web)/disciplines/_components/black-belt-rail.tsx`
  - `apps/web/app/(web)/disciplines/_components/black-belt-rail-list.tsx`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof. No repo-wide grep/rg used
  for surface discovery.

### Grill outcome

Round 1 opened:

- Consolidation target: keep one canonical entitlement-to-tier resolver and avoid duplicating premium/elite detection.
- Policy shape under review: either reuse `LineageListingRenderPolicy` directly on all DirectoryProfile/member/detail
  surfaces, or add a narrower named profile/detail adapter derived from the same resolver if field semantics differ.
- Initial surface inventory:
  - Already gated: lineage tree node cards, mobile rows, compact child rows, honor strip avatars, profile drawer opening
    from the tree stack.
  - Needs decision/likely gating: `/members/[slug]` profile detail currently renders avatar, Passport bio, social links,
    organizations, full rank rows, email when profile privacy allows, and QR.
  - Needs decision/likely free-listing clamp: `/directory` cards render avatar, location, organizations, ranks, and email
    when profile privacy allows.
  - Needs decision/likely free-listing clamp: `/members` cards render avatar, location, disciplines, and profile-detail
    links; `bio` is already null in the projection.
  - Likely acceptable free listing: discipline `MemberCarouselByRank` renders name + rank only.
  - Needs decision because it is a flagship BBL-like honor strip: `BlackBeltRail` renders avatar + name + rank for top
    ranked members.

Round 2 from operator:

- Free members should still show an avatar/initials fallback on listing surfaces.
- Operator is leaning toward **no full public profile page for free members**; full profile should be a premium/elite
  feature, with a gated/preview page showing what the paid profile would look like.
- Petey recommendation: distinguish two axes before coding:
  - **Profile owner/listing tier** controls what a public profile is allowed to publish. Free owner/listing =
    avatar/initials + name + rank + minimal preview; premium/elite owner/listing = full profile fields.
  - **Viewer tier** should not expose full details for a free profile owner. Use viewer entitlement only for viewer-owned
    app features, own-preview/admin bypass, or future search/browse features.

Round 3 from operator:

- Canonical public browse slug should be `/directory`, not `/members`.
- Do not expand this session into the full future faceted directory for schools/orgs/members; keep that as follow-up work.
- Implementation decision: keep `/directory` as the canonical people/profile surface for this session, and treat `/members`
  as a compatibility redirect rather than maintaining two DirectoryProfile list implementations.

### Legacy BBL forms review

- Old repo checked: `/Users/brianscott/dev/ronin-dojo-monorepo` (`origin`
  `https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo.git`).
- Graphify in old repo is available but shallow for BBL (59 nodes); direct reads used after Graphify identified
  `src/brands/blackbeltlegacy/BlackBeltLegacyLanding.jsx` and the current repo tear sheet named the form components.
- Files read:
  - `src/brands/blackbeltlegacy/components/auth/BBLClaimProfileForm.jsx`
  - `src/brands/blackbeltlegacy/components/auth/BBLRegisterForm.jsx`
  - `src/brands/blackbeltlegacy/components/auth/BBLSchoolRegisterForm.jsx`
  - `src/brands/blackbeltlegacy/components/auth/BBLLoginForm.jsx`
  - `src/brands/blackbeltlegacy/components/shared/BBLInput.jsx`
  - `src/brands/blackbeltlegacy/components/profile/BBLProfileEditor.jsx`
  - `src/brands/blackbeltlegacy/components/profile/BBLUserProfile.jsx`
  - `src/brands/blackbeltlegacy/components/school/BBLSchoolProfile.jsx`
- Lift/improve:
  - claim/profile stepper shape (`Verify -> Account -> Confirm`) and clear success/error messaging;
  - owner-facing preview/upgrade copy from claim flow;
  - school/profile field grouping (identity, instructor/school, contact/social, biography/history);
  - accessible input/error/checkbox patterns, but implemented with current `Form`/Zod/safe-action primitives;
  - profile page tab vocabulary (`About`, `Training`, `Achievements`, `Lineage`, `Belt History`) as future premium
    profile IA.
- Avoid:
  - WordPress endpoints, JWT/localStorage persistence, hash-router parsing, client-trusted `tier`/`invite`/`ref` params,
    hardcoded rank/tier lists, and legacy arbitrary styling tokens.

### Drift logged

No drift ID yet. Possible follow-up if confirmed: directory/member detail surfaces still expose more than the BBL free
listing contract after SESSION_0347 gated only lineage-tree cards.

## Petey plan

### Goal

Apply one coherent entitlement-derived render policy to public DirectoryProfile/member/detail surfaces without splitting
paid access into duplicate policy systems.

### Tasks

#### SESSION_0348_TASK_01 — Surface inventory + policy decision

- **Agent:** Petey -> Cody
- **What:** Finish the public surface inventory and decide whether profile/detail views consume
  `LineageListingRenderPolicy` directly or a narrower profile-detail adapter derived from it.
- **Steps:**
  1. Confirm each public DirectoryProfile/member/detail render path and fields exposed.
  2. Map each field to the BBL free-listing contract (`name + rank`) or full-card contract (`photo/bio/links/attachments`,
     school/org, verification/claim badges, detail drawer/page).
  3. Lock the policy shape: direct reuse vs one adapter that reuses the same entitlement resolver.
  4. Record the decision in this SESSION file before implementation.
- **Done means:** a field/surface matrix and policy decision are recorded; no code edits beyond session notes.
- **Depends on:** nothing.

#### SESSION_0348_TASK_02 — Directory/profile policy consumption

- **Agent:** Cody -> Desi -> Doug
- **What:** Implement the locked policy across `/members`, `/members/[slug]`, and `/directory` public surfaces.
- **Steps:**
  1. Reuse `getLineageListingRenderPolicyForUser` or a derived profile-detail helper; default unauthenticated/no
     entitlement to free.
  2. Clamp list-card fields so free viewers see only allowed listing details.
  3. Clamp member detail fields so free viewers do not receive/render full-card details.
  4. Keep DirectoryProfile privacy flags as an additional floor; tier policy must not override a user's hidden fields.
  5. Add focused tests proving free no-leak and premium/elite full-detail branches.
- **Done means:** public member/directory/detail surfaces consume the policy; tests prove free vs premium/elite behavior.
- **Depends on:** SESSION_0348_TASK_01.

#### SESSION_0348_TASK_03 — Launch smoke + close

- **Agent:** Doug -> Petey
- **What:** Run focused free vs premium/elite launch smoke, update docs/ledgers, evaluate fallow read-only if useful, then
  bow out with full close and Graphify refresh.
- **Steps:**
  1. Run targeted tests plus relevant lint/wiki gates.
  2. Start the `apps/web` dev server with `npx next dev --turbo` if browser verification is needed.
  3. Smoke anonymous/free and premium/elite viewers on lineage tree plus member/detail routes.
  4. Evaluate `fallow-rs/fallow` read-only only if it can add signal without becoming a gate.
  5. Run full `closing.md`, stage, commit, push to `main`, then `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`.
- **Done means:** smoke evidence is recorded; session closes full; commit is pushed to `main`; Graphify is refreshed.
- **Depends on:** SESSION_0348_TASK_02.

### Parallelism

Keep inline for now. The policy decision and implementation overlap the same read models and public surfaces; subagents or
worktrees would add coordination overhead. Doug/Desi review can run after Cody implementation.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0348_TASK_01 | Petey -> Cody | The policy split/consolidation is the key decision before code. |
| SESSION_0348_TASK_02 | Cody -> Desi -> Doug | Shared read-model implementation, UI field clamp, and no-leak verification. |
| SESSION_0348_TASK_03 | Doug -> Petey | Launch smoke, close ritual, git hygiene, and graph refresh. |

### Open decisions

- Confirm policy axis: profile owner/listing tier should control whether full profile fields publish publicly; viewer tier
  should not override a free profile owner into full public detail. Petey recommends this as the launch rule.
- Confirm `/members` vs `/directory`: locked — `/directory` is canonical. `/members` should not remain a duplicate people
  list; use compatibility redirects and leave true multi-entity faceting for follow-up sessions.
- Confirm free profile detail behavior: Petey recommends `/directory/[slug]` remains reachable but returns a minimal,
  server-side gated preview page with avatar/initials + name + rank + upgrade/claim CTA; full fields are fetched/rendered
  only for premium/elite profile owners, admin/editor, or own-account preview.

### Risks

- Over-clamping generic Baseline directory UX if BBL policy is applied brand-globally without brand/context nuance.
- Under-clamping BBL launch surfaces if DirectoryProfile privacy settings are treated as sufficient paid-tier policy.
- Test fixture cost: proving premium/elite needs active `UserEntitlement` rows without relying on client-trusted state.

### Scope guard

- No schema migration.
- No new Stripe/payment path.
- No changes to `Membership.status` or membership lifecycle ownership.
- No delegated school-owner/instructor comp authority matrix.

## Implementation record

### Surface decision

| Surface | Decision | Notes |
| --- | --- | --- |
| `/directory` | Canonical public people/profile browse route | Keeps the slug available for future faceted people/schools/orgs/lineage-tree discovery. |
| `/directory/[slug]` | Canonical public DirectoryProfile detail route | Applies owner/listing-tier policy before selecting full detail fields. |
| `/members` | Compatibility redirect to `/directory` | Removes the duplicate people list implementation from the public route surface. |
| `/members/[slug]` | Compatibility redirect to `/directory/[slug]` | Prevents the legacy full-profile render path from bypassing tier policy. |
| Directory listing cards | Policy-gated card fields | Free listing owners show avatar/initials, name, rank summary, and preview badge; full fields require full-profile policy. |
| Discipline black-belt rail / member carousel | Left unchanged | Already limited to name/rank/avatar-style summary and does not expose full profile detail fields this session. |

### Code changes

- Added `LineageProfileDetailRenderPolicy` as a narrow profile-detail adapter derived from the existing
  `LineageListingRenderPolicy` resolver. No duplicate entitlement source of truth was introduced.
- Added server batch helpers for listing/profile detail policies to avoid N+1 entitlement lookups on directory lists.
- Changed `findProfileBySlug` to a two-stage read:
  1. preview payload: slug, owner id/name/avatar, and one rank summary only;
  2. full detail payload only when the owner/listing policy, owner preview, or admin preview allows it.
- Changed directory list projection to consume owner/listing profile policies and clamp free listings to preview fields.
- Added real Next redirects for `/members` and `/members/:slug`, plus route-level redirect fallbacks.
- Added focused tests:
  - pure policy mapping for free vs premium profile detail;
  - real-DB public detail no-leak test for free owner, premium full profile, and free owner preview.

### Docs changes

- Updated BBL PRD/STORIES/GAP_MATRIX to distinguish free public listing preview from premium/elite full profile.
- Updated lineage listing runbook with SESSION_0348 public profile consumption rules and ADR 0011/0019 alignment.
- Updated directory wiki page and lineage profile drawer port spec to reflect the active tier-gating rule.
- Updated wiki index discoverability for the BBL gap matrix and SESSION_0348.

## Verification

### Automated

- `cd apps/web && bun test lib/entitlements/lineage-tier-policy.test.ts`
- `cd apps/web && bun test server/web/directory/profile-tier-policy.integration.test.ts`
- `cd apps/web && bun test lib/entitlements/lineage-tier-policy.test.ts server/web/directory/profile-tier-policy.integration.test.ts`
- `cd apps/web && bun run typecheck`
- `bun run wiki:lint`

### Browser smoke

Clean dev server was started with `cd apps/web && npx next dev --turbo` after an older 7-hour stale dev server
blocked the dev lock and hung route compilation. Browser smoke used local Playwright against `http://localhost:3000`:

| Route | Result |
| --- | --- |
| `/directory` | 200, body contains `Directory`, no console errors |
| `/directory/sensei-demo` | 200, body contains `Sensei`, no console errors |
| `/members/sensei-demo` | final URL `http://localhost:3000/directory/sensei-demo`, 200, body contains `Sensei`, no console errors |

HTTP redirect check:

- `curl -I http://localhost:3000/members/sensei-demo` returns `307 Temporary Redirect` with
  `location: /directory/sensei-demo`.

### Fallow note

`fallow-rs/fallow` remains a good future read-only code-cleanliness gate, but it was not introduced as a close
requirement this session. The useful first follow-up is a separate non-blocking spike that compares Fallow output
against existing Biome/typecheck findings before adding it to `closing.md`.

## Follow-up recommendations

- Expand `/directory` into the planned faceted browse surface across people, schools, organizations, and lineage trees
  without restoring `/members` as a duplicate public list.
- Add the trust badge/status component across directory card, `/directory/[slug]`, and lineage drawer/card
  (BBL-PROFILE-004 + BBL-LINEAGE-005).
- Decide whether the old `components/web/members/*` implementation should be deleted in a cleanup session after any
  internal references are proven dead.
- No BBL.com import cohort or dedup work.
- No adoption of `fallow` as a CI/local gate unless separately approved.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Project Structure, Prisma Setup, Authentication, Monetization checked 2026-06-05; local
  runbook/ADR inputs listed in the goal were read.
- **Baseline pattern to extend:** feature-foldered server reads in `server/web/directory`, public components under
  `components/web`, Better Auth server session via `getServerSession`, Prisma client via `~/services/db`, and the existing
  entitlement read helper.
- **Custom delta:** BBL lineage/profile paid-field policy over Ronin's `DirectoryProfile` and lineage surfaces.
- **No-bypass proof:** the implementation reads `UserEntitlement` through the existing helper and does not fork payment,
  membership, or directory listing substrates.

## Cody pre-flight

### Pre-flight: SESSION_0348_TASK_02 — Directory/profile policy consumption

#### 1. Existing component scan

- Graphify query used: `DirectoryProfile member profile detail lineage card LineageListingRenderPolicy premium elite`
- Found: existing policy helpers, lineage card policy consumption, directory/member list components, member detail page,
  directory payload/query projections, and discipline honor/list cards.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Consulted live alignment URLs: yes, Dirstarter Project Structure, Prisma Setup, Authentication, Monetization.
- Closest L1 pattern: public directory/listing read projections plus server session derived viewer state.
- Primitive API spot-check: defer until final UI edit list is locked; likely existing `Avatar`, `Badge`, `Card`,
  `Stack`, `Section`, and `QrShareButton` only.

#### 3. Composition decision

- Extending existing component: `MemberCard`, `DirectoryList`, `MemberDetailPage`, and directory read projections.
- Composing existing components: no new public primitive expected; field visibility should be data/policy-driven.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: `docs/architecture/decisions/0011-entitlement-first-commerce.md`,
  `docs/architecture/decisions/0019-membership-lifecycle-ownership.md`.
- Runbook consulted: `docs/runbooks/domain-features/lineage-listing-runbook.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: likely `localhost:3000` / BBL local brand host, plus targeted bun tests.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 component scan, FS-0002 dev server command, FS-0024 git guard,
  FS-0342 deterministic full-suite behavior.
- Mitigation acknowledged: Graphify-first discovery, known dev command, repo guard completed, focused tests plus isolation
  where broad suite behavior is noisy.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0348_TASK_01 | complete | Inventory and grill closed the policy axis: owner/listing tier controls public profile detail; `/directory` is canonical; `/members` is compatibility only. |
| SESSION_0348_TASK_02 | complete | Added profile-detail render policy adapter, server batch helpers, gated directory list/detail reads, canonical `/directory/[slug]`, and `/members` redirects. |
| SESSION_0348_TASK_03 | complete | Focused tests, typecheck, wiki lint, browser smoke, docs updates, fallow recommendation, and bow-out preparation completed. |

## What landed

- `LineageProfileDetailRenderPolicy` now derives profile-detail publication behavior from the existing
  `LineageListingRenderPolicy`/`UserEntitlement` source of truth.
- Directory list and detail read models clamp free owner/listings to avatar/initials, name, and one-rank summary while
  preserving premium/elite full-profile fields behind the entitlement-derived policy and DirectoryProfile privacy flags.
- `/directory/[slug]` is the canonical public profile detail route; `/members` and `/members/[slug]` redirect to
  `/directory`.
- Focused real-DB integration coverage proves free no-leak, premium full detail, and owner preview behavior.
- BBL product docs, lineage listing runbook, directory wiki page, profile drawer port spec, and wiki index now match the
  launch rule.

## Decisions resolved

- Use a narrow `LineageProfileDetailRenderPolicy` adapter derived from the existing listing policy rather than a second
  entitlement resolver.
- Public full profile is controlled by the profile owner/listing tier, not the viewer tier.
- Free listings still show avatar/initials fallback and rank summary.
- Free profile detail URLs remain reachable as a preview/upgrade surface but do not select bio, social links, email,
  organizations, QR, or full rank history for public viewers.
- `/directory` is canonical; `/members` is redirect compatibility only.
- Do not adopt `fallow` as a close/CI gate yet; run a separate read-only spike first.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/entitlements/lineage-tier-policy.ts` | Added profile-detail policy constants and adapters derived from listing policy. |
| `apps/web/server/web/entitlements/lineage-tier-policy.ts` | Added batch listing/profile policy helpers and single-user profile helper. |
| `apps/web/lib/entitlements/lineage-tier-policy.test.ts` | Added free and premium profile-detail policy assertions. |
| `apps/web/server/web/directory/payloads.ts` | Added slug to list payload and preview payload that selects only avatar/name/one-rank summary before policy approval. |
| `apps/web/server/web/directory/queries.ts` | Applied owner/listing-tier policy to directory list/detail projections and added owner/admin preview bypass. |
| `apps/web/server/web/directory/profile-tier-policy.integration.test.ts` | New real-DB no-leak coverage for free, premium, and owner preview detail reads. |
| `apps/web/components/web/directory/directory-query.tsx` | Passes viewer role to directory read model for admin preview. |
| `apps/web/components/web/directory/directory-list.tsx` | Links cards to `/directory/[slug]` and renders tier/preview badges. |
| `apps/web/app/(web)/directory/page.tsx` | Keeps `/directory` as canonical browse page and passes viewer role. |
| `apps/web/app/(web)/directory/[slug]/page.tsx` | Canonical tier-gated public profile detail/preview page. |
| `apps/web/app/(web)/members/page.tsx` | Route-level compatibility redirect to `/directory`. |
| `apps/web/app/(web)/members/[slug]/page.tsx` | Route-level compatibility redirect to `/directory/[slug]`. |
| `apps/web/next.config.ts` | HTTP redirects for `/members` and `/members/:slug`. |
| `docs/product/black-belt-legacy/PRD.md` | Clarified free listing preview vs premium/elite full profile. |
| `docs/product/black-belt-legacy/STORIES.md` | Updated BBL-PROFILE-001 and discovery acceptance criteria. |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | Updated public profile evidence and next task recommendation. |
| `docs/runbooks/domain-features/lineage-listing-runbook.md` | Added SESSION_0348 profile consumption rules and tier table updates. |
| `docs/knowledge/wiki/files/directory-page.md` | Updated current route contract, policy gating, and wiring. |
| `docs/knowledge/wiki/component-porting/specs/lineage-profile-drawer-port-spec.md` | Updated visibility/tier-gating behavior for free previews. |
| `docs/knowledge/wiki/index.md` | Added BBL gap matrix entry and SESSION_0348 discoverability row. |
| `docs/sprints/SESSION_0348.md` | Bow-in, plan, implementation record, verification, review, and close evidence. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` | Passed — 9360 nodes, 14576 edges, 1376 communities, 1591 files tracked. |
| Graphify queries listed above | Passed; selected files opened directly afterward. |
| `cd apps/web && bun test lib/entitlements/lineage-tier-policy.test.ts server/web/directory/profile-tier-policy.integration.test.ts` | Passed — 9 tests, 47 assertions. |
| `cd apps/web && bun run typecheck` | Passed — `next typegen` + `tsc --noEmit --pretty false`. |
| `bun run wiki:lint` | Passed — 602 markdown files, 0 violations. |
| Browser smoke with local Playwright | Passed — `/directory`, `/directory/sensei-demo`, `/members/sensei-demo` all load; `/members/sensei-demo` lands on `/directory/sensei-demo`; no console errors. |
| `curl -I http://localhost:3000/members/sensei-demo` | Passed — `307 Temporary Redirect`, `location: /directory/sensei-demo`. |
| `git diff --check` | Passed — no whitespace errors. |

## Open decisions / blockers

- No blockers for the next session.
- Follow-up decision: whether to delete old `components/web/members/*` after proving no internal consumers remain.
- Follow-up product scope: facet `/directory` across people, schools, organizations, and lineage trees without restoring a
  duplicate `/members` browse surface.

## Next session

### Goal

Finish BBL launch trust/discovery polish by adding consistent trust status badges to directory cards, `/directory/[slug]`,
and lineage drawer/card surfaces, then plan the first faceted `/directory` slice.

### Inputs to read

- `docs/sprints/SESSION_0348.md`
- `docs/product/black-belt-legacy/GAP_MATRIX.md`
- `docs/product/black-belt-legacy/STORIES.md`
- `docs/runbooks/domain-features/lineage-listing-runbook.md`
- `apps/web/server/web/directory/queries.ts`
- `apps/web/app/(web)/directory/[slug]/page.tsx`
- `apps/web/components/web/lineage/lineage-node-card.tsx`
- `apps/web/components/web/lineage/lineage-profile-drawer.tsx`

### First task

Inventory every trust/status field currently available for `DirectoryProfile`, `LineageNode`, rank awards, and claim state;
then decide whether the launch badge should be a shared presentation adapter over existing fields or requires a small
schema/status expansion.

## Review log

| Review | Result |
| --- | --- |
| Doug code/data review | Pass. Free public detail performs a preview-only read; full profile fields are selected only after policy approval. DirectoryProfile privacy flags still floor premium/elite output. |
| Desi UX review | Pass with follow-up. Free preview keeps avatar/initials and rank summary, avoids duplicate `/members`, and uses `/directory` as the public mental model. Future faceted directory should be a separate session. |
| Petey close recommendation | Ship this slice; next highest-value work is trust badge/status consistency before expanding `/directory` facets. |

## Hostile close review

| Check | Verdict |
| --- | --- |
| Dirstarter alignment | Pass. Extends existing directory/server-query/auth/monetization patterns; no new payment or membership lifecycle path. |
| Security/privacy | Pass. Public free detail path does not select or return bio, email, social links, organizations, QR, or full rank history. |
| Data integrity | Pass. Entitlements remain the paid-feature source; `Membership.status` remains lifecycle-only per ADR 0019. |
| Verification honesty | Pass. Focused pure/unit + real-DB tests, typecheck, wiki lint, HTTP redirect check, and browser smoke recorded. |
| Scope control | Pass. Faceted directory and member-component deletion explicitly deferred. |
| Score cap | No cap. |

## ADR / ubiquitous-language check

- ADR update not needed: this implements ADR 0011 and ADR 0019 without changing their decisions.
- New ADR not needed: the `/directory` canonical slug and profile-detail policy adapter are implementation decisions
  within the existing entitlement-first architecture.
- Ubiquitous language update not needed: `DirectoryProfile`, `Membership`, `UserEntitlement`, and listing/profile terms
  already exist in the domain language. Docs were updated where launch semantics changed.

## Reflections

- The important split was owner/listing tier vs viewer tier. Keeping that distinction avoided a security mistake where a
  premium viewer could reveal full fields from a free profile owner.
- Next redirects were necessary in addition to route-level redirects; the App Router route fallback alone did not produce
  the expected HTTP redirect in the browser smoke.
- Restarting a stale dev server was required for truthful browser verification; the first route compile hung behind a
  seven-hour process that held the Next dev lock.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated touched docs/frontmatter dates and `last_agent` on BBL PRD/STORIES/GAP_MATRIX, lineage listing runbook, directory wiki page, profile drawer port spec, wiki index, and this SESSION. |
| Backlinks/index sweep | Added SESSION_0348 backlinks/pairs where relevant; wiki index now includes the BBL gap matrix and SESSION_0348. |
| Wiki lint | `bun run wiki:lint` passed — 602 markdown files, 0 violations. |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | Present in `## Hostile close review`; no unresolved medium+ findings. |
| Review & Recommend | Next session goal, inputs, and first task written. |
| Memory sweep | No global memory update needed; durable facts live in updated runbook/product/wiki docs. |
| Next session unblock check | Unblocked. |
| Git hygiene | Branch `main`; `git worktree list` shows only `/Users/brianscott/dev/ronin-dojo-app 63ec6ba [main]`; single push planned; hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` passed; final stats: 9379 nodes, 14670 edges, 1381 communities, 1592 files tracked. |
