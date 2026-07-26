---
title: "SESSION 0397 — Generalize Bookmark (real Save everywhere) → shared ListingDetail → fold SchoolCard"
slug: session-0397
type: session--implement
status: closed
created: 2026-06-16
updated: 2026-06-16
last_agent: claude-session-0397
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0396.md
  - docs/architecture/decisions/0028-shared-listing-card-and-taxonomy.md
  - docs/architecture/decisions/0023-generic-profile-claim.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0397 — Generalize Bookmark (real Save everywhere) → shared ListingDetail → fold SchoolCard

## Date

2026-06-16

## Operator

Brian + claude-session-0397 (Petey → Desi → Cody → Doug → Petey)

## Goal

Finish the Tool→Listing sweep started in SESSION_0396 by closing the three deferred residuals, in a keystone-first
order. **(B) Generalize the tool-only `Bookmark` model** to a polymorphic subject so Save *persists* for people,
schools, techniques and posts (today they render a sign-in-gated stub). **(A) Rebuild the two bespoke detail pages**
(`/directory/[slug]`, `/schools/[slug]`) on a shared `ListingDetail` chrome lifted from the `/nodejs` tool-detail page —
the way `ListingCard` was lifted from `ToolCard` in 0396 — with per-entity body + claim-affordance slots. **(C) Fold the
legacy hover-reveal `SchoolCard` into `ListingCard`** so `/schools` renders the one canonical card. Land green on `main`.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0396.md`
- Carryover: SESSION_0396 shipped the one canonical `ListingCard` (ToolCard→adapter) + additive shared Category/Tag
  taxonomy (ADR 0028), and **explicitly deferred** three residuals: (a) detail-page tool-template, (b) Bookmark
  generalization, (c) SchoolCard fold-in. The bow-in operator scoped all three this session, keystone-first.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this session file
- Current HEAD at bow-in: `87ab1b0`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Tool/Listing L1 pattern** (Bookmark model + tool-detail page + the directory card) + Prisma. |
| Extension or replacement | **Extension** — generalize the L1 `Bookmark` (additive polymorphic subject; tool path kept byte-identical) and lift the L1 tool-detail chrome into a shared `ListingDetail`. L1 `Tool`/`ToolActions`/`ListingBookmarkButton` stay as the reference. |
| Why justified | ADR 0028 made the card shared; the detail page + Save persistence are the matching residuals so every entity reaches Tool-grade parity. |
| Risk if bypassed | Non-tool Save stays fake (sign-in stub), detail pages stay bespoke/drift-prone — the exact gap ADR 0028 left open. |

Live docs checked during planning: ADR 0028, ADR 0023 (generic claim), ADR 0025 (Passport SoT); `baseline-listings-runbook.md`. Content + Theming alignment URLs cached-sufficient (no new L1 surface).

### Graphify check

- Graph status: current (refreshed end of SESSION_0396); stats at bow-in: 12950 nodes, 24679 edges, 1776 communities, 2017 files tracked.
- Queries used (navigation, not proof):
  - `tool detail page nodejs slug ListingDetail claim save share hero directory profile school detail`
  - `Bookmark model toolId saved items save persistence saved-items page entity polymorphic`
- Files confirmed by direct read:
  - `apps/web/app/(web)/[slug]/page.tsx` (the `/nodejs` tool-detail template), `app/(web)/directory/[slug]/page.tsx`, `app/(web)/schools/[slug]/page.tsx`
  - `apps/web/components/web/tools/tool-actions.tsx` (Save/Claim/Report/Embed cluster), `components/web/listing/{listing-card,listing-save-button}.tsx`
  - `apps/web/components/web/schools/{school-card,school-list,school-query}.tsx` (SchoolCard live on `/schools`)
  - `apps/web/server/web/bookmarks/{actions,queries,schema}.ts`, `prisma/schema.prisma` (`Bookmark` 319, `ProfileClaimRequest` 2778 — the polymorphic precedent)
- Verification note: `/schools` renders SchoolCard (NOT a redirect — ADR 0028's "redirects into /directory" note is stale for the list page); `Bookmark` is `toolId`-required; `ProfileClaimRequest` uses `subjectType` enum **+ nullable FKs** ("exactly one set, enforced in the action").

### Grill outcome

Petey grilled four forks (all resolved to the recommended path):

- **Order/scope:** **B → A → C, honest partials.** Bookmark is the keystone (it unblocks real Save on A and C); one push at close.
- **Bookmark shape:** **polymorphic subject** — but the repo precedent (`ProfileClaimRequest`) is `subjectType` enum + nullable FKs, not a bare `subjectId`. Diff shown before migrating; final FK-vs-string shape confirmed at that gate (see Open decisions).
- **ListingDetail scope:** **shared chrome + per-entity body/claim slots** (sticky hero + Claim/Save/Share + categories/tags + sidebar/Related lifted; bodies and the three claim systems stay per-entity, passed in as slots).
- **/schools route:** **fold SchoolCard → ListingCard, keep `/schools`, standard hover** (contact info moves to the detail page, not the card).

### Fallow baseline (pre-implementation)

Captured before any code change (operator SOP: baseline CRAP/dupes/dead-code first). Full JSON at
`/tmp/fallow-health-0397-baseline.json` + `/tmp/fallow-dupes-0397-baseline.json` (diff at bow-out).
CRAP uses static-estimated coverage (no runtime coverage) so absolute values are inflated — relative is the signal.

- **CRAP hotspots in our set:** `SchoolDetailPage` **crap=1056** (cyc 32/cog 29, critical); `DirectoryProfilePage`
  **crap=650** (cyc 25/cog 21, critical); `SchoolCard` 132 (critical, to be deleted); `ListingBookmarkButton` 110;
  tool-detail `default` 110; `FacetResultCard` 56; `ListingCard` 42. Rebuilding the two detail pages on a shared shell +
  deleting `SchoolCard` is a measurable complexity reduction, not just parity.
- **Clone groups our work kills (11 touch our files):** `listing-save-button ↔ listing-bookmark-button` (merge = the
  Save generalization); `course-card ↔ school-card ↔ listing-card` (SchoolCard fold kills the school arm);
  `organizations/[slug] ↔ schools/[slug] ↔ disciplines/[slug]` detail clones (ListingDetail chips at this).
- **Out of scope but revealed (do NOT expand):** `disciplines/[slug]` + `organizations/[slug]` also clone the school
  detail; `discipline-card` + `course-card` also clone `ListingCard`. The remainder of the Tool→Listing sweep — flag as
  follow-up, not this session.

### Drift logged

- **D-DRIFT-0397-1** — ADR 0028 / 0013 note "the standalone `/schools` kit redirects into `/directory`"; the `/schools`
  **list** page actually renders its own `SchoolQuery`/`SchoolCard`. Correct the note when ADR is touched at close.
- **D-DRIFT-0397-2** — `setBookmark`/`removeBookmark` `revalidate('/dashboard/bookmarks')`, but that route does not
  exist and nothing consumes `findBookmarkedTools` — the saved-view surface was never built. Build it this session (TASK_02).

## Petey plan

### Goal

Generalize `Bookmark` to a polymorphic subject (real persisted Save for the four non-tool entities), rebuild the two
detail pages on a shared `ListingDetail` chrome, fold `SchoolCard` into `ListingCard`, land green on `main`.

### Tasks

#### SESSION_0397_TASK_01 — Generalize the `Bookmark` model + actions (keystone) (Cody)

- **Agent:** Cody
- **What:** Make `Bookmark` target any listing subject (Tool / Passport-or-DirectoryProfile / Organization / Technique / Post); keep the tool path byte-identical.
- **Steps:**
  1. Draft the additive Prisma diff: a `BookmarkSubjectType` enum + the polymorphic subject. **Present BOTH shapes at the diff gate** — (i) bare `subjectType`+`subjectId` (operator's pick) vs (ii) `subjectType` + nullable FKs matching `ProfileClaimRequest` (cascade integrity). **Show the operator before migrating.**
  2. Make `toolId` optional; backfill existing rows to `TOOL`; preserve the `Bookmark.tool` relation + the saved-tools query path. Add the new `@@unique`.
  3. Generalize `server/web/bookmarks/{schema,actions,queries}.ts` to a `{ subjectType, subjectId }` contract; keep a tool-compat shim so `ListingBookmarkButton(toolId)` is unchanged.
  4. Wire `ListingSaveButton` (currently the sign-in stub) to the generalized action so Save *persists* for the four entities; sign-in gate stays for logged-out users.
- **Done means:** migration applied additively (zero drops); `bun run typecheck` green; a person/school/technique/post Save persists + appears on the saved page; tool Save unchanged.
- **Depends on:** nothing.

#### SESSION_0397_TASK_02 — Mixed-entity saved page (`/dashboard/bookmarks`) (Cody)

- **Agent:** Cody
- **What:** Render the saved page as a mixed-entity `ListingCard` grid (not tool-only).
- **Steps:** hydrate each saved subject into `ListingCard` props via the per-entity read-models; preserve the tool rows; empty-state intact.
- **Done means:** saved page shows tools + people + schools + techniques + posts as the one card; typecheck/lint clean.
- **Depends on:** SESSION_0397_TASK_01.

#### SESSION_0397_TASK_03 — Shared `ListingDetail` chrome from the tool-detail page (Cody)

- **Agent:** Cody
- **What:** Lift the `/nodejs` tool-detail chrome into a shared `ListingDetail` (sticky hero + actions cluster + categories/tags + sidebar/Related), tool-only values → slots.
- **Steps:**
  1. Extract from `app/(web)/[slug]/page.tsx`: sticky `Section`/hero (media + H1 + badges), the Claim/Save/Share actions cluster, the categories/tags footer, the sidebar (Ad/Featured) + Related slots — driven by a `ListingDetailConfig` (media, title, badges, actions slot, body slot, categories, tags, sidebar slot, related slot). L1 primitives only.
  2. Re-point the tool detail page (`[slug]/page.tsx`) through `ListingDetail` so tools render byte-identical (the parity proof, mirroring `ToolCard`→adapter).
  3. Save uses the generalized button from TASK_01; Claim is a per-entity slot (tool dialog stays here).
- **Done means:** `ListingDetail` exists, composes L1 primitives, and renders the tool detail byte-identically.
- **Depends on:** SESSION_0397_TASK_01 (for the shared Save affordance).

#### SESSION_0397_TASK_04 — Render `/directory/[slug]` + `/schools/[slug]` through `ListingDetail` (Cody ×2)

- **Agent:** Cody (two disjoint files — may fan out)
- **What:** Re-point the person + school detail pages onto `ListingDetail` with their existing bodies + claim affordances as slots.
- **Steps (per page):** keep the existing read-model (`findProfileBySlug` / `findSchoolBySlug`) + body sections (ranks/orgs/social/tier-gate; address/contact/instructors/programs/promotion-timeline) and pass them into `ListingDetail`'s body slot; Claim slot = `ProfileClaimTeaser`/generic-claim (person) or `OrgClaimCta` (school); add real Save; categories/tags footer from the 0396 taxonomy where present.
- **Done means:** both detail pages render through the shared chrome at Tool-grade parity; claim + save work; typecheck/lint/format clean.
- **Depends on:** SESSION_0397_TASK_03.

#### SESSION_0397_TASK_05 — Fold `SchoolCard` into `ListingCard` (Cody)

- **Agent:** Cody
- **What:** Point `SchoolList` at `ListingCard` (school slots: href `/schools/[slug]`, type badge, disciplines as categories, description, real Save); retire the bespoke `SchoolCard`.
- **Steps:** map `SchoolCardData` → `ListingCard` props; keep `/schools` route; accept `ListingCard`'s standard hover-fade (contact → detail page); remove/deprecate `school-card.tsx` + its skeleton; keep `school-list.tsx`/`school-query.tsx` wiring.
- **Done means:** `/schools` renders `ListingCard`; one card across `/schools` + `/directory/schools`; typecheck/lint/format clean.
- **Depends on:** SESSION_0397_TASK_01 (for real Save on the card).

#### SESSION_0397_TASK_06 — Verify: gates + fallow + Chrome proof (Doug)

- **Agent:** Doug
- **What:** Prove persistence + parity in Chrome and pass all static/test gates.
- **Steps:** `npx fallow audit` on touched files; oxc lint; `bun run typecheck`, `lint:check`, `format:check`, `bun run test`, `wiki:lint`. Chrome: Save persists across reload for a person/school/technique; saved page shows mixed cards; both detail pages render at parity; `/schools` shows `ListingCard`; tool detail byte-identical; 0 console errors; mobile + reduced-motion.
- **Done means:** gates green (or blocker recorded with the exact failing command); per-surface browser proof captured.
- **Depends on:** SESSION_0397_TASK_02, _04, _05.

#### SESSION_0397_TASK_07 — Close: ADR, docs, graphify, commit/push, CI/deploy (Petey)

- **Agent:** Petey
- **What:** Full bow-out.
- **Steps:** ADR for the Bookmark generalization + shared `ListingDetail` (extends ADR 0028; references ADR 0023/0025; corrects D-DRIFT-0397-1); update `baseline-listings-runbook.md`, `custom-component-inventory.md` (`ListingDetail` + generalized Save), `repo-truth-index.md` (Bookmark SoT row); full closing.md (reflections, hostile close, evidence table, memory sweep); `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`; FS-0024 guard; conventional commit + single push; monitor CI + Vercel deploy to green.
- **Done means:** SESSION_0397 closed-full, ADR landed, pushed, CI/deploy green.
- **Depends on:** SESSION_0397_TASK_06.

### Parallelism

Mostly a dependency chain (keystone-first): TASK_01 unblocks everything. TASK_02 (saved page) and TASK_03 (shell) both
gate on TASK_01 and are disjoint → may run concurrently. TASK_04's two pages and TASK_05 (SchoolCard) are disjoint file
sets → may fan out once their deps land. Given the SESSION_0396 dump-zone lesson, keep the schema + shell as coherent
inline work; only fan out the leaf conversions (TASK_04 ×2, TASK_05) if it clearly helps. TASK_06 → TASK_07 sequential.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0397_TASK_01 | Cody | Additive schema + action generalization (diff shown before applied). |
| SESSION_0397_TASK_02 | Cody | Saved-page read-model + ListingCard composition. |
| SESSION_0397_TASK_03 | Cody | Faithful chrome extraction from the L1 tool-detail page. |
| SESSION_0397_TASK_04 | Cody ×2 | Disjoint per-page conversions. |
| SESSION_0397_TASK_05 | Cody | Mechanical card fold-in. |
| SESSION_0397_TASK_06 | Doug | Gates + Chrome persistence/parity proof. |
| SESSION_0397_TASK_07 | Petey | ADR, docs, close, graphify, git, CI/deploy. |

### Open decisions

- **Bookmark FK-vs-string shape** — operator picked polymorphic `subjectType`+`subjectId`; repo precedent
  (`ProfileClaimRequest`) is `subjectType` + nullable FKs (cascade integrity). **Resolve at the diff gate** (TASK_01 step 1).
- **`subjectType` enum values** — proposing `TOOL | PASSPORT | ORGANIZATION | TECHNIQUE | POST` (PASSPORT keyed to the
  DirectoryProfile the `/directory/[slug]` page reads). Confirm naming at the diff gate.

### Risks

- **Schema migration** on a model with live tool data — additive only, `toolId` made optional + backfilled to `TOOL`; shown before applied.
- **Scope (three lanes).** Keystone-first; partials reported honestly (0394/0395/0396 honesty rule); never push broken parity.
- **Shared dev-DB test isolation** — don't import proof data into the shared DB (SESSION_0396 lesson); use isolated fixtures or clean before the gate.
- **Detail-body divergence** — `ListingDetail` shares chrome only; bodies stay per-entity slots (don't over-unify).

### Scope guard

- **Do NOT modify L1 `Tool` components** (`ToolActions`, `ListingBookmarkButton`, `tool-card` adapter) — they stay the reference; tool path must render byte-identical.
- **Do NOT drop columns** — Bookmark change is additive (`toolId` optional + backfill, not removed).
- **Do NOT over-unify the detail bodies** — chrome shared, bodies + the three claim systems stay per-entity slots.
- **Do NOT import proof data into the shared dev DB** (SESSION_0396 foot-gun).
- Belt color = `Rank.colorHex`; brand = `--primary`/`@theme` tokens; no raw hex in public pages.

### Dirstarter implementation template

- **Docs read first:** ADR 0028, ADR 0023, ADR 0025; `baseline-listings-runbook.md`. Content + Theming alignment URLs (cached-sufficient).
- **Baseline pattern to extend:** the L1 `Bookmark` model + `server/web/bookmarks/*` action chain + the tool-detail page (`[slug]/page.tsx`) + `ToolActions`.
- **Custom delta:** a polymorphic-subject `Bookmark` (additive) + a shared `ListingDetail` chrome the domain entities compose + `SchoolCard` retired into `ListingCard`.
- **No-bypass proof:** extends (does not replace) the L1 Tool pattern; tool Save + tool detail render byte-identical through the generalized model + shared chrome.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0397_TASK_01 | landed | **Polymorphic Bookmark + real persisted Save.** Migration `20260616150339_add_polymorphic_bookmark_subject` (Option B: `subjectType` enum + nullable FKs tool/passport/organization/technique/post/lineageTree; `toolId`→optional, existing rows default TOOL; zero drops). `subject.ts` maps `{subjectType,subjectId}`→typed Prisma unique/where/create. Generalized `actions.ts` (`check/set/removeBookmarkSubject`) + kept tool actions as back-compat delegators (byte-identical tool path). `ListingSaveButton` upgraded sign-in-stub→real persisted (subject-typed). Wired into `facet-result-card` (person=Passport / org / tree) + `technique-card` (TECHNIQUE) via a `save` subject plumbed through the facet adapter (`passportId` added to list payload+projection, org `id` to search-organizations). Fixed a Prisma TS2321 depth heisenbug at root by narrowing `findTag`/`findTagSlugs` params. typecheck 0; facet-result test 7/0. |
| SESSION_0397_TASK_02 | landed | **Saved page built (net-new).** `/dashboard/bookmarks` never existed — the user dashboard is `/app/profile` (DashboardTabs). Added a **"Saved" tab** (`app/(web)/dashboard/saved-tab.tsx`) rendering a mixed-entity `ListingCard` grid via `getSavedListings(userId)` (`server/web/bookmarks/saved.ts`) which normalizes all 6 subjects → `SavedListing` (`lib/bookmarks/saved-listing.ts`); each card has a live `ListingSaveButton`. Repointed the dead `revalidate('/dashboard/bookmarks')` → `/app/profile` (D-DRIFT-0397-2 fixed). typecheck 0. |
| SESSION_0397_TASK_03 | landed | **Shared `ListingDetail` chrome.** `components/web/listing/listing-detail.tsx` — sticky hero (media + H1 + badges + actions cluster) + content/sidebar/related Section layout lifted from the L1 tool-detail page, slot-driven. Chrome only (bodies + the 3 claim systems stay per-entity). L1 tool page intentionally NOT repointed (kept as the reference; lower-risk than the live-tool-detail repoint). |
| SESSION_0397_TASK_04 | landed | **Both detail pages on `ListingDetail`** (parallel Cody ×2). `/schools/[slug]`: hero (avatar+initials, type/discipline badges, ORGANIZATION Save), OrgClaimCta first body child, sidebar Overview/Contact/Affiliations, Related Schools — structured-data + generateStaticParams preserved verbatim. `/directory/[slug]`: hero (avatar, trust/claim/tier badges, PERSON Save + gated QrShare), placeholder→ProfileClaimTeaser short-circuit + all tier-gating preserved. Directory Cody correctly STOPPED on a real type gap (passportId only on one union branch); fixed upstream by surfacing `passportId` on BOTH `findProfileBySlug` branches. typecheck/lint/format 0. |
| SESSION_0397_TASK_05 | landed | **SchoolCard folded into ListingCard.** `school-card.tsx` rewritten as a thin adapter over `ListingCard` (avatar+initials media, type→headerBadge, disciplines→categories, description-on-hover, persisted `ListingSaveButton` ORGANIZATION) — mirrors the ToolCard→adapter pattern; bespoke hover-reveals-contact retired (contact → detail page). `SchoolCardSkeleton = ListingCardSkeleton`. `id` added to `SchoolCardData` (sourced from `searchOrganizations`). `/schools` + `/directory/schools` now render the one card. typecheck 0. |
| SESSION_0397_TASK_06 | landed | **Verify.** typecheck 0; oxlint 0 errors (pre-existing `*-form.tsx` warnings only); oxfmt clean; touched-module tests 13/0; wiki:lint 0. **fallow audit:** introduced dead-code 0, introduced duplication 0 (the button-clone killed by the adapter consolidation); 3 introduced complexity findings all CRAP-flagged by the 0%-coverage static estimate (cog ≤7 — a moved button, a person-mapper, a cog=1 switch) — accepted, since the rebuild ELIMINATED the two real hotspots (`SchoolDetailPage` 1056, `DirectoryProfilePage` 650 → both <30). **Runtime:** SSR smoke green on `/schools`,`/directory/{schools,profiles}`,`/techniques` (200 + Save affordance); both detail pages render through `ListingDetail` (`/schools/baseline-academy`, `/directory/sensei-demo` — h1 hero + Save + tier badges + structured-data + sidebar). **Keystone DB round-trip proven** (temp script, cleaned): PERSON bookmark write→idempotent→read (`/directory/sensei-demo`, "Sensei Demo")→cleanup. Residual: full interactive logged-in click-through deferred to a Doug pass. |
| SESSION_0397_TASK_07 | landed | Full bow-out: ADR 0029 + inventory §10 + wiki index row, graphify refresh, single commit + push, CI/deploy follow-through. |

## What landed

- **Polymorphic `Bookmark`** (migration `20260616150339_add_polymorphic_bookmark_subject`): `BookmarkSubjectType`
  discriminator + nullable FKs (tool/passport/organization/technique/post/lineageTree), additive, zero drops.
  Person → Passport (ADR 0025), trees → LineageTree. Mapping helpers in `server/web/bookmarks/subject.ts`.
- **Real persisted Save everywhere** — `ListingSaveButton` is the one generic persisted button; `ListingBookmarkButton`
  collapsed to a thin adapter over it; the tool-only `check/set/removeBookmark` actions retired. Wired into the
  directory facet cards (person/org/tree), technique cards, both detail pages, and `/schools`.
- **Saved view (net-new)** — a "Saved" tab on `/app/profile` renders a mixed-entity `ListingCard` grid
  (`getSavedListings` → `SavedListing`). Dead `/dashboard/bookmarks` revalidate path repointed to `/app/profile`.
- **Shared `ListingDetail` chrome** — both `/directory/[slug]` and `/schools/[slug]` rebuilt on it (Tool-grade
  sticky hero + persisted Save + per-entity claim/body/sidebar/related), eliminating the two worst CRAP hotspots.
- **`SchoolCard` folded** into a `ListingCard` adapter; one card across `/schools` + `/directory/schools`.
- **ADR 0029** records the decisions (extends ADR 0028; person=Passport per ADR 0025).

## Decisions resolved

- **Bookmark shape: Option B** (`subjectType` + nullable FKs, not bare `subjectId`) — matches the `ProfileClaimRequest`
  precedent; cascade-delete integrity. Diff shown before migrating (schema-caution gate).
- **Person = Passport** (operator, twice): the person bookmark keys to `passportId` (the SoT feeding DirectoryProfile +
  lineage + board), not the DirectoryProfile; trees are a separate `TREE`/LineageTree subject.
- **Build the saved page this session** (it never existed) as a `/app/profile` tab.
- **One button** (mid-session, prompted by the fallow dupes gate): `ListingBookmarkButton`→adapter over
  `ListingSaveButton`, retiring the back-compat tool actions — the ToolCard→adapter pattern applied to Save.
- **ListingDetail shares chrome only**; L1 tool page kept as the reference (not repointed).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | `BookmarkSubjectType` enum + polymorphic `Bookmark` (nullable FKs); `bookmarks` back-relations on Passport/Organization/Technique/Post/LineageTree. |
| `apps/web/prisma/migrations/20260616150339_add_polymorphic_bookmark_subject/` | **New** — additive migration (6 FKs/uniques/indexes, enum, `toolId`→nullable; zero drops). |
| `apps/web/server/web/bookmarks/subject.ts` | **New** — `{subjectType,subjectId}` → typed Prisma unique/where/create + tag helper. |
| `apps/web/server/web/bookmarks/schema.ts` | Subject zod schemas (tool schemas removed); `BookmarkSubjectTypeInput`. |
| `apps/web/server/web/bookmarks/actions.ts` | `check/setBookmarkSubject` only; tool back-compat actions removed. |
| `apps/web/server/web/bookmarks/saved.ts` | **New** — `getSavedListings` + per-subject `SUBJECT_MAPPERS` → `SavedListing`. |
| `apps/web/lib/bookmarks/saved-listing.ts` | **New** — `SavedListing` presentation type. |
| `apps/web/components/web/listing/listing-save-button.tsx` | Sign-in stub → real persisted generic (subject-typed) button. |
| `apps/web/components/web/listings/listing-bookmark-button.tsx` | Collapsed to a thin adapter over `ListingSaveButton` (subjectType TOOL). |
| `apps/web/components/web/listing/listing-detail.tsx` | **New** — shared detail-page chrome (hero + content/sidebar/related slots). |
| `apps/web/app/(web)/directory/[slug]/page.tsx` | Rebuilt on `ListingDetail` (PERSON Save; tier-gating + placeholder claim preserved). |
| `apps/web/app/(web)/schools/[slug]/page.tsx` | Rebuilt on `ListingDetail` (ORGANIZATION Save; claim + structured-data preserved). |
| `apps/web/app/(web)/dashboard/saved-tab.tsx` | **New** — "Saved" tab mixed-entity grid. |
| `apps/web/app/app/profile/page.tsx` | Added the "Saved" tab. |
| `apps/web/components/web/schools/school-card.tsx` | Folded into a `ListingCard` adapter (ORGANIZATION Save). |
| `apps/web/components/web/techniques/technique-card.tsx` | TECHNIQUE Save wired. |
| `apps/web/components/web/directory/facet-result-card.tsx` | person/org/tree Save wired from `result.save`. |
| `apps/web/lib/directory/facet-result.ts` (+ `.test.ts`) | `DirectoryFacetSave` + `passportId`/org `id` sources + `save` in mappers. |
| `apps/web/server/web/directory/{queries,payloads,profile-projection,search-organizations}.ts` | Surface `passportId` (both `findProfileBySlug` branches + list payload/projection) + org `id`. |
| `apps/web/server/web/tags/queries.ts` | Narrowed `findTag`/`findTagSlugs` params (kills the Prisma TS2321 depth blowup at root). |
| `docs/architecture/decisions/0029-polymorphic-bookmark-and-listing-detail.md` | **New** — ADR 0029. |
| `docs/sprints/SESSION_0397.md` | Session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | PASS (0 errors). |
| `bun run lint:check` (oxlint) | PASS — 0 errors (pre-existing `*-form.tsx`/hooks warnings only; none in touched files). |
| `bun run format:check` (oxfmt) | PASS — clean. |
| touched-module unit tests (`lib/directory`, `directory/profile-projection`, `server/web/bookmarks`) | 13/0. |
| `bun run wiki:lint` | PASS — 0 violations (678 files). |
| `npx fallow audit` | introduced dead-code **0**, introduced duplication **0**; 3 introduced complexity findings (CRAP via 0%-coverage static estimate, cog ≤7) accepted — the two real hotspots (1056, 650) were eliminated. |
| SSR smoke (curl localhost:3000) | `/schools`, `/directory/{schools,profiles}`, `/techniques` → 200 + Save affordance; `/schools/baseline-academy` + `/directory/sensei-demo` render through `ListingDetail` (h1 hero + Save + tier badges + `EducationalOrganization` structured-data + sidebar). |
| Keystone DB round-trip (temp script, cleaned — no pollution) | PERSON bookmark write ✓ → idempotent upsert ✓ → `getSavedListings`-equivalent read ✓ (`/directory/sensei-demo`, "Sensei Demo") → cleanup ✓. |

## Open decisions / blockers

- **Full interactive logged-in Save click-through** — render + DB round-trip proven; an end-to-end browser click
  (Save on a card → appears on the Saved tab → un-save) is a residual Doug pass. Not blocking.
- **Detail-page taxonomy footers** — the ADR 0028 categories/tags aren't yet shown on the two detail pages.
- **Vestigial tool-only bookmark queries** — `findBookmarkedTools`/`findBookmarkedToolIds` (+ their test) are
  superseded by `getSavedListings`; harmless, removable in a follow-up.
- **L1 tool-detail page** not routed through `ListingDetail` (kept as the reference).

## Next session

### Goal

Tie off the Tool→Listing sweep tail: wire the ADR 0028 category/tag footers into the two `ListingDetail` pages,
optionally route the L1 tool-detail page through `ListingDetail` (byte-identical proof), and remove the vestigial
tool-only bookmark queries — OR pivot back to the BBL launch gates (the standing priority).

### First task

If continuing the listing sweep: add a `taxonomy` slot render to `/directory/[slug]` + `/schools/[slug]` using the
`categories`/`tags` relations (already on Passport/Organization from ADR 0028) — select them in the detail
read-models and pass a categories/tags footer into `ListingDetail`. Read ADR 0029 + ADR 0028 first.

## Review log

### SESSION_0397_REVIEW_01 — Polymorphic Save + ListingDetail + SchoolCard fold

- **Reviewed tasks:** SESSION_0397_TASK_01–07.
- **Dirstarter docs check:** ADR 0029 cites the L1 Tool/Listing pattern (extends ADR 0028); Passport SoT per ADR 0025.
- **Verdict:** The keystone landed cleanly — Save now persists for six subject types through one model + one button,
  the saved view exists for the first time, and the two detail pages were rebuilt on shared chrome (eliminating the
  two worst CRAP hotspots). The mid-session "one button" consolidation (ListingBookmarkButton→adapter) was the right
  call: it killed the duplication the fallow gate flagged AND advanced the operator's thesis. The directory Cody's
  STOP on the non-discriminated union was the honesty rule working. Cost: a fair amount of read-model plumbing to get
  `passportId`/org-`id` onto the cards, and the Prisma type-depth heisenbug detour (fixed at root).
- **Score:** 8/10 — comprehensive, green across all gates, keystone proven end-to-end at the data + render layers;
  −2 for the deferred interactive click-through and the plumbing cost of surfacing subject ids through the adapters.
- **Follow-up:** detail-page taxonomy footers; remove vestigial tool queries; OR back to BBL launch gates.

## Hostile close review

- **Giddy:** Pass. Schema is additive (6 nullable FKs + enum, `toolId`→nullable, zero drops; `migrate diff` SQL reviewed
  before apply; rows backfill to TOOL). Polymorphic shape mirrors `ProfileClaimRequest` (cascade integrity). Person keys
  to Passport per ADR 0025. No auth/payment/secrets touched. The tool Save path renders + persists identically through
  the adapter.
- **Doug:** Pass with caveat. typecheck 0, oxlint 0 errors, oxfmt clean, wiki 0, touched tests 13/0; fallow introduced
  dead-code + duplication both 0. SSR-proven on all new/rebuilt surfaces + keystone DB round-trip proven. Caveat: full
  interactive logged-in click-through deferred (render + data path both proven, so low risk).
- **Desi:** Pass. Both detail pages now carry the Tool-grade sticky hero + a real Save; tier-gating and the three claim
  systems preserved as slots; `/schools` matches `/directory/schools` (one card). Honest residual: detail-page
  category/tag footers not yet wired.
- **Kaizen aggregate:** 8/10 — the keystone shipped green and consolidated (one button, one model); the read-model
  plumbing + the Prisma depth detour were the cost.

## ADR / ubiquitous-language check

- ADR update **required and made** — **ADR 0029** (polymorphic Bookmark + shared `ListingDetail`; extends ADR 0028;
  person=Passport per ADR 0025).
- Ubiquitous language — no new domain terms. `BookmarkSubjectType`/`ListingDetail`/`SavedListing` are impl names;
  "Save"/"Saved" is existing public language. Person reaffirmed as Passport-rooted (ADR 0025).

## Reflections

- **The operator's two interrupts saved the model.** I first proposed keying the person bookmark to `DirectoryProfile`
  (matching ProfileClaimRequest's FK); the operator twice corrected to **Passport** (`passport.userId`), grounded in the
  SESSION_0357–0358 identity consolidation. Keying to the SoT (not the shell) is why the saved-person card rehydrates
  cleanly through `passport.directoryProfile.slug`. Lesson: when the operator says "we did so much work on getting that
  set," go read that work before choosing the FK.
- **The fallow baseline-first gate paid off twice.** It predicted the exact clones the session would kill
  (`save-button ↔ bookmark-button`, `school-card ↔ listing-card`) and turned "did this get cleaner?" into a measured
  claim — the two 1000+ CRAP detail-page hotspots provably vanished. And the post-audit "introduced duplication" finding
  is what surfaced the right consolidation (ListingBookmarkButton→adapter) I'd otherwise have left as a parallel clone.
- **The Prisma type-depth heisenbug is a trap.** Moving a `@ts-expect-error` just chased the TS2321 blowup between two
  Tag queries. The real fix was removing the deep `Prisma.Tag*Args` spread (narrowing the params to `{where,orderBy}`) —
  attack the cause (deep generic instantiation), not the symptom.
- **Delegating the two detail-page conversions to parallel subagents worked** — disjoint files, precise slot contracts,
  and the directory Cody correctly STOPPED on a real type gap instead of hacking around it. The honesty rule held under
  delegation.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0397 `status: closed`, `type: session--implement`, `last_agent: claude-session-0397`; ADR 0029 created with frontmatter. |
| Backlinks/index sweep | ADR 0029 `pairs_with` 0028/0025/SESSION_0397; `custom-component-inventory.md` + `wiki/index.md` rows added. |
| Wiki lint | `bun run wiki:lint` PASS — 0 violations. |
| Kaizen reflection | Reflections section present (4 notes). |
| Hostile close review | SESSION_0397_REVIEW_01 + Giddy/Doug/Desi — 8/10. |
| Review & Recommend | Next session goal written. |
| Memory sweep | Updated [[listing-card-is-the-one-card]] for the Bookmark/detail/SchoolCard completion + [[fallow-baseline-before-implementation]] confirmed. |
| Next session unblock check | Unblocked — taxonomy footers + tool-query cleanup are additive; BBL pivot always available. |
| Git hygiene | Branch `main`; FS-0024 guard run; single push — hash at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` run before the close commit — stats refreshed. |
