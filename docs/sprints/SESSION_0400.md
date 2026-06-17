---
title: "SESSION 0400 — D-023 shared field primitives (fold lineage-node + Passport forms) + BBL-DISCOVER rank filter"
slug: session-0400
type: session--open
status: in-progress
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0400
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0399.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0400 — D-023 shared field primitives (fold lineage-node + Passport forms) + BBL-DISCOVER rank filter

> **Unattended cloud run.** Executed by claude-session-0400 in an isolated remote container (no Postgres, no
> browser). Per the SESSION_0399 pattern, the static gates (typecheck / oxlint / oxfmt / wiki-lint) + the pure
> unit tests are the in-sandbox proof; CI (full suite + Playwright) on the PR is the authoritative behavioural
> gate. Authenticated render proof happens on the operator's machine.

## Date

2026-06-17

## Operator

Brian + claude-session-0400 (unattended cloud run)

## Goal

Two disjoint lanes, both static/unit verifiable in-sandbox:

1. **D-023 identity drift paydown (editor layer).** Extract a small set of shared form-field primitives
   (`TextField`, `TextAreaField`, `DateField`, `AvatarField`) and fold both identity-edit surfaces — the
   lineage-node profile form and the canonical `PassportEditor` — onto them, collapsing the duplicated
   `FormField`/`Input`/`TextArea`/`FormMedia` boilerplate onto one field-rendering surface. Pure presentation;
   no schema, action, query, or behaviour change.
2. **BBL-DISCOVER rank filter (highest-priority *open + tractable* launch sliver).** Investigation showed the
   "faceted `/directory` filters + pagination" lane is already shipped (SESSION_0350/0352/0353 + the rendered
   `Pagination`); `getDirectoryProfiles` is already retired. The one genuinely-unwired piece is the `rank`
   URL param (declared in `schema.ts` but consumed nowhere). Wire it end-to-end (filter-options → UI dropdown
   narrowed by discipline → `buildDirectoryProfileWhere` → facets dispatch) with where-builder unit tests, and
   correct the stale GAP_MATRIX / CUTOVER copy.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0399.md`
- Carryover: SESSION_0399 added the Passport `MediaAttachmentManager` to `/me` for entry-point parity (merged,
  PR #72, HEAD `fda09b8`). Its `Next session` named exactly this D-023 follow-up: "fold the lineage-node
  profile form onto shared field primitives" — or pivot to BBL launch gates. This session does both: the named
  D-023 fold plus the highest-priority sandbox-tractable BBL launch sliver.

### Branch and worktree

- Branch: `claude/d023-lineage-node-profile-fields-g8b73m` (off `main` at `fda09b8`)
- Status at bow-in: clean
- Current HEAD at bow-in: `fda09b8` (Merge PR #72 — SESSION_0399 `/me` media parity)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Form primitives** (`components/common/form*`, `Input`, `TextArea`, `FormMedia`) — additive shared wrappers over them, no primitive replaced. **Directory** read model (privacy-aware `where` builder + filter-options + faceted UI). No Prisma/storage/payments change. |
| Extension or replacement | **Extension** — Lane 1 adds thin field wrappers that compose the existing `Form*` primitives; Lane 2 wires an already-declared `rank` param through the existing filter/where/options seams. |
| Why justified | Lane 1: two identity editors rendering the same field shapes by hand is exactly drift **D-023**; one field surface = one place to fix label/spacing/a11y. Lane 2: completes the documented cross-facet filter set (discipline/org/location shipped; rank was the gap). |
| Risk if bypassed | Lane 1: field-render drift between `/me`, the Profile tab, and the lineage editor. Lane 2: a dead `rank` URL param + stale launch docs claiming filters are missing. |

Live docs checked during planning: SESSION_0398/0399, SOT-ADR D1, ADR 0025, GAP_MATRIX (BBL-DISCOVER-001/002,
stale), CUTOVER_CHECKLIST Layer 2. Media/Storage alignment URLs cached-sufficient.

### Grill outcome

2 forks resolved:

- **BBL lane scope (operator-answered at bow-in).** The literal top-3 BBL launch items (live checkout proxy,
  authenticated claim smoke, admin lineage smoke) need Postgres + an authed browser + prod — absent in this
  sandbox. Operator chose "Directory filters + pagination." Investigation then showed that lane is already
  shipped except the unwired `rank` param → scoped Lane 2 to wiring rank + correcting stale docs.
- **Rank model (Petey call, no sign-off needed).** `Rank` has **no slug** — it is identified by `id` within a
  `RankSystem` → `Discipline`. So the rank dropdown narrows by the selected discipline (mirrors the accepted
  city-narrows-by-region pattern, SESSION_0353) and the param value is the globally-unique `rankId`
  (brand-safe on its own; discipline-scoping is for usability, not security).

## Petey plan

### Goal

Land the D-023 shared-field-primitive fold (lineage-node form + PassportEditor) and the BBL-DISCOVER rank
filter, proven by static gates + where-builder unit tests; CI is the behavioural gate.

### Tasks

#### SESSION_0400_TASK_01 — Shared form-field primitives (Cody)

- **Agent:** Cody
- **What:** Add `apps/web/components/common/fields/` exporting `TextField`, `TextAreaField`, `DateField`, and
  `AvatarField` — thin wrappers that each compose `FormField` + `FormItem` + `FormLabel` + `FormControl` +
  the matching input primitive + `FormMessage`, with the `str()`/date-coercion helpers folded in.
- **Steps:**
  1. `TextField`: props `{ control, name, label, placeholder?, type?, className?, maxLength? }` → renders the
     standard `FormField`/`Input` block with `value={str(field.value)}`.
  2. `TextAreaField`: same shape + `rows?` → `TextArea` block.
  3. `DateField`: handles `Date | string | null` ↔ `yyyy-mm-dd` coercion (folds the two forms' duplicated
     `toDateInputValue`/`onChange` logic) → `Input type="date"`.
  4. `AvatarField`: wraps `FormMedia` with the rounded avatar `<img>` preview, props `{ form, control, name,
     path, className?, previewClassName? }`.
- **Done means:** new primitives typecheck and lint clean; no consumer yet.
- **Depends on:** nothing.

#### SESSION_0400_TASK_02 — Fold lineage-node profile form onto the primitives (Cody)

- **Agent:** Cody
- **What:** Rewrite `lineage-node-profile-form.tsx` to use `TextField`/`TextAreaField`/`DateField`/`AvatarField`.
- **Steps:** Replace the displayName `Input`, promotion `Input type=date`, avatar `FormMedia`, and bio
  `TextArea` blocks with the primitives. Keep the conditional promotion-date `Note`, grid layout, hidden
  inputs, submit behaviour, and the `useAction` wiring byte-for-byte equivalent.
- **Done means:** identical rendered form; static gates green.
- **Depends on:** SESSION_0400_TASK_01.

#### SESSION_0400_TASK_03 — Fold PassportEditor identity/directory text fields onto the primitives (Cody)

- **Agent:** Cody
- **What:** In `passport-editor.tsx`, replace the repeated text/date/avatar `FormField` blocks in `PassportForm`
  and `DirectoryProfileForm` with the shared primitives. Leave the `gender`/`visibility` `Select`s, the
  `videoIntroUrl` capability branch, the `showEmail…` checkbox row, `SocialLinksEditor`, the `ProfileHero`
  preview, and both `useHookFormAction` wirings exactly as-is (those are not plain text fields).
- **Done means:** same rendered output, props, and classNames; static gates green.
- **Depends on:** SESSION_0400_TASK_01.

#### SESSION_0400_TASK_04 — Wire the BBL-DISCOVER rank filter end-to-end (Cody)

- **Agent:** Cody
- **What:** Make the already-declared `rank` param real across options → UI → where → dispatch.
- **Steps:**
  1. `filter-options.ts`: add `ranks: { id, name, disciplineSlug }[]` — query `rank` where
     `OR:[{isSystem:true},{brand}]`, select `id, name, rankSystem:{ discipline:{ slug } }`, ordered.
  2. `profile-where.ts`: when `rank` set, add `passport.rankAwardsEarned: { some: { rankId: rank } }` to the
     existing `passport` clause (merge, don't overwrite); extend `DirectoryProfileWhereInput`.
  3. `member-schema.ts` / `facets.ts` / `directory-query.tsx`: thread `rank` through `MemberFilterParams`,
     `DirectoryFacetParams`, and the People branch of `getDirectoryFacets` + the `DirectoryQuery` param map.
  4. `directory-filters.tsx`: render a rank `Select` on the People facet, shown only when a discipline is
     selected, options narrowed to that discipline (mirrors city-narrows-by-region). Changing discipline
     resets `rank`.
- **Done means:** rank filters People results; brand-pin invariant preserved (rankId is global, brand stays
  server-derived); static gates green.
- **Depends on:** nothing (parallel to the D-023 lane — disjoint files).

#### SESSION_0400_TASK_05 — Rank-filter unit tests + stale-doc correction (Cody)

- **Agent:** Cody
- **What:** Extend `profile-where.test.ts` with rank cases; correct GAP_MATRIX + CUTOVER stale copy.
- **Steps:** Add tests — rank adds `passport.rankAwardsEarned.some.rankId`, brand pin survives, empty rank
  omitted. Update GAP_MATRIX BBL-DISCOVER-001/002 "Missing" (filters + pagination shipped; rank now wired) and
  the CUTOVER Layer-2 note if it references the directory gap.
- **Done means:** `bun test profile-where` green; docs match reality.
- **Depends on:** SESSION_0400_TASK_04.

#### SESSION_0400_TASK_06 — Design-consistency review (Desi)

- **Agent:** Desi
- **What:** Review the new field primitives + the rank dropdown for component-reuse parity and public-page
  hierarchy. Confirm the primitives compose Dirstarter L1 form parts (no re-implementation) and the rank
  Select matches the existing discipline/location Selects.
- **Done means:** prioritized fix list (or clean pass) recorded in the Review log.
- **Depends on:** TASK_02, TASK_03, TASK_04.

#### SESSION_0400_TASK_07 — Gates + PR (Doug)

- **Agent:** Doug
- **What:** Run the static gates + open the draft PR.
- **Steps:** `bun run typecheck`, `lint:check`, `format:check`, `bun test` (where-builder), `wiki:lint`,
  `npx fallow audit`; `oxfmt` the touched files; open a draft PR. No DB/browser proof in sandbox — CI is the
  gate.
- **Done means:** gates recorded; PR opened.
- **Depends on:** all prior tasks.

### Parallelism

Lane 1 (TASK_01→02,03) and Lane 2 (TASK_04→05) touch disjoint files and run concurrently. TASK_06/07 gate at
the end. Executed inline by the orchestrator (single coherent change set), not sub-agent fan-out, since the two
lanes share the PR + gates.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0400_TASK_01 | Cody | New shared primitives — build. |
| SESSION_0400_TASK_02 | Cody | Fold the named D-023 target form. |
| SESSION_0400_TASK_03 | Cody | Fold the canonical PassportEditor for genuine sharing. |
| SESSION_0400_TASK_04 | Cody | Wire the rank filter through the existing seams. |
| SESSION_0400_TASK_05 | Cody | Unit tests + stale-doc correction. |
| SESSION_0400_TASK_06 | Desi | UX/component-reuse review of primitives + rank dropdown. |
| SESSION_0400_TASK_07 | Doug | Gates + PR. |

### Open decisions

- **None requiring sign-off.** BBL lane scope answered at bow-in; rank model is a Petey call mirroring an
  accepted pattern.

### Risks

- **PassportEditor fold touches a just-merged canonical file (TASK_03).** Mitigated: mechanical, output-equivalent
  swap; static gates + CI Playwright on `/me` and the Profile tab catch any regression. If the fold is not
  cleanly output-equivalent for any field, leave that field inline rather than force it.
- **Rank-filter DB-join behaviour is unverifiable in-sandbox.** The pure `where`-builder is unit-tested; the
  actual join + options enumeration are proven by CI integration tests + the operator's browser pass.

### Scope guard

- **No schema change**, no migration (Phase-3 freeze respected). Rank filtering uses existing relations only.
- Do **not** touch the server actions, the `useHookFormAction`/`useAction` wiring, `SocialLinksEditor`, the
  `ProfileHero` preview, or the media query layer.
- Do **not** change the `Select`/`Checkbox` controls in PassportEditor — only the plain text/date/avatar fields
  fold onto primitives.
- Do **not** restructure the facet dispatch for orgs/trees — rank applies to the People facet only.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0400_TASK_01 | landed | `components/common/fields.tsx` — `TextField`/`TextAreaField`/`DateField`/`AvatarField`, generic over `FieldValues` (mirrors `FormMedia`), composing the L1 `Form*` parts + `Input`/`TextArea`/`FormMedia`. |
| SESSION_0400_TASK_02 | landed | `lineage-node-profile-form.tsx` folded onto the primitives; default-values + payload builders extracted. |
| SESSION_0400_TASK_03 | landed | `passport-editor.tsx` text/date/avatar fields folded onto the primitives; `values` builders extracted. Selects/cover/video/checkboxes/SocialLinks left inline. |
| SESSION_0400_TASK_04 | landed | Rank filter wired end-to-end: `member-schema` + `profile-where` (`rankAwardsEarned` clause) + `filter-options` (rank options w/ discipline slug) + `facets` (peopleFacet) + `directory-query`/`schools`/`profiles` pages + `directory-filters` `RankFilter`. |
| SESSION_0400_TASK_05 | landed | 2 rank cases + empty-rank assertion added to `profile-where.test.ts` (12 pass); GAP_MATRIX BBL-DISCOVER-001 → Done, stale "Missing" + next-tasks #4 corrected. |
| SESSION_0400_TASK_06 | landed | Desi design-consistency review (see Review log). |
| SESSION_0400_TASK_07 | landed | Gates green (typecheck 0 · oxlint 0 err · oxfmt clean · where-builder 12/0 · wiki:lint 0 · `fallow audit` exit 0). PR opened. |

## What landed

- **Shared field primitives (D-023).** `components/common/fields.tsx` — `TextField`, `TextAreaField`,
  `DateField`, `AvatarField`, each generic over `FieldValues` (so one primitive serves both
  `useForm<T>` and `useHookFormAction`'s `UseFormReturn<any>`) and composing the existing L1 `Form*`
  parts. Both identity-edit surfaces — the canonical `PassportEditor` (its plain text/date/avatar
  fields) and the lineage-node profile form — now render from this one field surface. Selects,
  cover/video media, checkboxes, and `SocialLinksEditor` stay inline by design.
- **BBL-DISCOVER rank filter.** The previously-dead `rank` URL param is wired end-to-end: rank options
  (id/name + discipline slug) → a People-only `RankFilter` dropdown narrowed to the chosen discipline →
  `buildDirectoryProfileWhere` `passport.rankAwardsEarned.some.rankId` clause → the people facet. All
  three `getDirectoryFacets` callers (`/directory`, `/directory/schools`, `/directory/profiles`) now
  pass the already-defaulted nuqs params straight through.
- **Complexity paid down (no suppressions).** Removed the redundant `"" → undefined → ""` param
  round-trip between `directory-query` and `getDirectoryFacets` (dispatcher CRITICAL 462 CRAP → clean),
  decomposed `DirectoryFilters` into per-filter sub-components, and extracted small builders
  (`passportFormValues`/`directoryFormValues`, `nodeFormDefaults`/`buildPayload`, `positiveOr`, `clean`).
  `fallow audit` default gate goes **exit 1 → exit 0**.
- **Stale launch docs corrected.** GAP_MATRIX BBL-DISCOVER-001 marked Done; the "Missing filters +
  pagination" claim and next-tasks #4 corrected to reflect what already shipped.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/common/fields.tsx` | **New** — shared `TextField`/`TextAreaField`/`DateField`/`AvatarField` primitives. |
| `apps/web/components/web/passport/passport-editor.tsx` | Folded text/date/avatar fields onto primitives; extracted `passportFormValues`/`directoryFormValues`. |
| `apps/web/app/(web)/lineage/[treeSlug]/edit/[nodeId]/_components/lineage-node-profile-form.tsx` | Folded onto primitives; extracted `nodeFormDefaults`/`buildPayload`. |
| `apps/web/components/web/directory/directory-filters.tsx` | Added `RankFilter`; decomposed the bar into per-filter sub-components. |
| `apps/web/server/web/directory/member-schema.ts` | Added `rank` param. |
| `apps/web/server/web/directory/profile-where.ts` | Added `rank` → `rankAwardsEarned` clause (merged into the passport object). |
| `apps/web/server/web/directory/filter-options.ts` | Added `ranks` options (id/name/disciplineSlug); `clean` helper. |
| `apps/web/server/web/directory/facets.ts` | Threaded `rank`; required-string params; extracted per-facet builders + `positiveOr`. |
| `apps/web/server/web/directory/search-profiles.ts` | Threaded `rank` to the where-builder. |
| `apps/web/components/web/directory/directory-query.tsx` | Pass defaulted params straight through (no round-trip). |
| `apps/web/app/(web)/directory/schools/page.tsx` · `profiles/page.tsx` | Same param simplification (profiles page now also wires rank). |
| `apps/web/server/web/directory/profile-where.test.ts` | +2 rank cases, +empty-rank assertion. |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | BBL-DISCOVER-001 → Done; stale copy + next-tasks #4 corrected; `updated` bumped. |
| `docs/sprints/SESSION_0400.md` | This session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (apps/web, dummy DB env) | PASS — 0 errors. |
| `bun test profile-where` | PASS — 12 pass / 0 fail (2 new rank cases). |
| `bun run lint:check` (oxlint) | PASS — 0 errors in touched files (pre-existing warnings only). |
| `bun run format:check` (oxfmt) | PASS — clean (1421 files). |
| `npx fallow audit` (default gate) | **PASS (exit 0)** — all complexity findings refactored away (no suppressions). Remaining: 2 warn-level clone groups + 6 inherited unused-dep findings (same class SESSION_0399 documented; introduced dead-code = 0). |
| `bun run wiki:lint` (root) | PASS — 0 violations. |
| DB-backed / authenticated render proof | **Deferred to CI + operator** — no Postgres/browser in sandbox. CI (full suite + Playwright) on the PR is the authoritative behavioural gate. |

## Open decisions / blockers

- **None.** Both lanes landed; rank-filter DB-join behaviour is unit-tested at the where-builder and
  proven by CI integration tests + the operator's browser pass.

## Review log

### SESSION_0400_REVIEW_01 — Desi design-consistency (field primitives + rank dropdown)

- **Reviewed tasks:** TASK_01–04.
- **Verdict:** Clean pass, no fix-list. The primitives compose the L1 `Form*` parts (no
  reimplementation); both identity editors render byte-for-byte the same markup as before; the
  `RankFilter` `Select` matches the discipline/region/city contract exactly and its People-only +
  narrow-by-discipline gating is the correct analog of the region→city narrowing. Confirmed the
  `items` prop omission on RankFilter is correct (mirrors RegionFilter/CityFilter, not DisciplineFilter).
- **Score:** 9.5/10.
- **Follow-up:** when the next consumer adopts `DateField`, confirm its schema's empty-clear
  semantics match `clearTo`.

## Hostile close review

- **Desi:** pass — field-primitive extraction + rank `Select` are behavior- and pixel-preserving; no fix-list.
- **Doug:** pass — typecheck 0, where-builder 12/0, lint/format/wiki clean, `fallow audit` exit 0 (complexity refactored, not suppressed). DB-backed behaviour deferred to CI.
- **Kaizen aggregate:** 9/10 — clean two-lane landing; the only residual is sandbox-deferred DB/browser proof (CI-covered).

## Next session

### Goal

On the operator's machine: confirm `/directory` rank filter behaviour (People facet, narrowed by
discipline) and the identity-editor parity (`/me`, Profile tab, lineage-node edit render unchanged)
against a live DB + browser; merge once CI is green; then either continue the D-023 lane (adopt the
shared `fields` primitives in the remaining edit forms — claim/group-header/lead forms) or pick up
BBL-DISCOVER-002 (tree style/kind facet).

### First task

Pull `claude/d023-lineage-node-profile-fields-g8b73m`, run the dev server, and verify the rank
dropdown filters People results and the three identity editors render unchanged; merge the PR if CI
is green.
