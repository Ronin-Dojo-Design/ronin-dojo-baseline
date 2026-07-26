---
title: "SESSION 0401 — D-023 fields-primitive fold (remaining edit forms) + BBL-DISCOVER-002 tree kind facet"
slug: session-0401
type: session--implement
status: closed
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0401
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0400.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0401 — D-023 fields-primitive fold (remaining edit forms) + BBL-DISCOVER-002 tree kind facet

> **Unattended cloud run.** Executed by claude-session-0401 in an isolated remote container (no Postgres, no
> browser). Per the SESSION_0399/0400 pattern, the static gates (typecheck / oxlint / oxfmt / wiki-lint) + the
> pure unit tests are the in-sandbox proof; CI (full suite + Playwright) on the PR is the authoritative
> behavioural gate. Authenticated render proof happens on the operator's machine.

## Date

2026-06-17

## Operator

Brian + claude-session-0401 (unattended cloud run)

## Goal

The two natural follow-ups queued in SESSION_0400's `Next session` block, both static/unit verifiable
in-sandbox:

1. **D-023 fields-primitive fold (continuation).** Adopt the SESSION_0400 shared `fields.tsx` primitives
   (`TextField` / `TextAreaField` / `DateField` / `AvatarField`) in the remaining react-hook-form edit
   surfaces — the admin **lead form**, the public **lead-capture form**, the **profile-claim** form, and the
   **lineage-claim** form's note field — collapsing each hand-rolled `FormField`/`Input`/`TextArea` block onto
   the one shared field surface. Pure presentation; no schema, action, query, or behaviour change.
2. **BBL-DISCOVER-002 tree kind facet.** Wire a tree **kind** (`scopeType`) facet on the `/directory` Trees tab,
   end-to-end (filter param → KindFilter dropdown → extracted pure `tree-where` builder → trees facet dispatch),
   with where-builder unit tests, and mark GAP_MATRIX BBL-DISCOVER-002 Done. Mirrors the SESSION_0400 rank-filter
   wiring; the tree where-clause is extracted from `searchPublishedLineageTrees` into a pure, unit-testable
   `tree-where.ts` (the `profile-where.ts` pattern).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0400.md`
- Carryover: SESSION_0400 (PR #73, merged at HEAD `5fcd4a9`) landed the shared `fields.tsx` primitives + folded
  the two identity editors (`PassportEditor`, lineage-node profile form) onto them, and wired the BBL-DISCOVER
  **rank** filter on People. Its `Next session` named exactly these two follow-ups: adopt the `fields` primitives
  in the remaining edit forms, and pick up BBL-DISCOVER-002 (tree style/kind facet). This session does both.

### Branch and worktree

- Branch: `claude/bow-in-session-planning-j3x83h` (off `main` at `5fcd4a9`)
- Worktree: `/home/user/ronin-dojo-baseline` (remote container)
- Status at bow-in: clean
- Current HEAD at bow-in: `5fcd4a9` (Merge PR #73 — SESSION_0400)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Form primitives** (`components/common/form*`, `Input`, `TextArea`) via the SESSION_0400 `fields.tsx` wrappers — additive, no primitive replaced. **Directory** read model (privacy-aware tree `where` builder + filter param + facet UI). No Prisma/storage/payments change. |
| Extension or replacement | **Extension** — Lane 1 swaps four more forms onto the existing shared field wrappers; Lane 2 adds a `kind` param + a `KindFilter` Select through the existing directory filter/facet seams and extracts the already-inline tree `where` into a tested pure builder. |
| Why justified | Lane 1: four more forms hand-rolling the same field block is the same drift **D-023** the SESSION_0400 primitives exist to retire. Lane 2: completes the documented cross-facet tree filter (BBL-DISCOVER-002) and pays down the inline tree `where` into a unit-tested pure function. |
| Risk if bypassed | Lane 1: field-render drift keeps spreading across edit surfaces. Lane 2: a permanently-Partial BBL-DISCOVER-002 + an untested inline tree `where`. |

Live docs checked during planning: SESSION_0400 (rank-filter + fields pattern), `profile-where.ts`/`.test.ts`
(extraction + test pattern), GAP_MATRIX BBL-DISCOVER-002, ADR 0025. Media/Storage alignment URLs not touched.

### Graphify check

- Graph status: not rebuilt this session (read-only discovery via direct file inspection; `node_modules`
  absent in sandbox). Files located by targeted `grep`/`Glob` against known SESSION_0400 seams.
- Files selected: `components/common/fields.tsx`, the four target forms, the directory filter/facet/schema
  trio, `lineage/queries.ts` + `lineage/schema.ts`, `directory/profile-where.ts(.test)` as the pattern.
- Verification note: every file opened and read directly before planning; no capability asserted from an
  errored/empty search.

### Grill outcome

2 forks resolved (both Petey calls, no sign-off needed — each mirrors an accepted SESSION_0400 pattern):

- **Lane 2 facet — `kind` (scopeType) over `style`.** The gap is named "style/kind". A `LineageTree` carries
  both a `scopeType` enum (`BRAND`/`ORGANIZATION`/`DISCIPLINE`/`STYLE`/`PERSON`/`CUSTOM`, always present) and an
  optional `style` relation. **Petey call: ship `kind` first.** It is a static enum — no `filter-options` DB
  query (so nothing in this lane depends on a DB the sandbox lacks), no discipline-narrowing, and a pure
  where-clause addition (`scopeType: kind`) that is fully unit-testable. `style` (relation, discipline-narrowed
  like rank, needs a `filter-options` query) is the clean next increment, documented in `Next session`.
- **Tree `where` extraction.** To unit-test the kind clause without a DB, extract the inline `where` from
  `searchPublishedLineageTrees` into a pure `tree-where.ts` (exact `profile-where.ts` pattern) and test it —
  also paying down the inline complexity. `brand` + `isPublished` + `visibility` stay server-derived inside the
  builder; `kind` only narrows.

### Drift logged

None new. (D-016 base-ui migration + the lineage cohort drift in the register are unrelated to this lane.)

## Petey plan

### Goal

Land the D-023 fields-primitive fold across the four remaining edit forms and the BBL-DISCOVER-002 tree `kind`
facet, proven by static gates + an extracted tree-where unit test; CI is the behavioural gate.

### Baseline fallow audit (files to be touched)

Captured before any edit (`fallow health` / `fallow dupes`, `node_modules` absent so CRAP is estimated):

| File · function | Baseline | Note |
| --- | --- | --- |
| `lead-form.tsx :40 LeadForm` | **CRITICAL** — 22 cyclomatic / 38 cognitive / 199 lines / **506 CRAP** | Primary refactor target. Folding 5 `Input` + 1 `TextArea` blocks onto primitives drops ~6 repeated `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` wrappers. |
| `lineage/queries.ts :171 getLineageTreeForUser` | HIGH — 14 / 24 / 87 lines | Pre-existing, **not** a target function; untouched. Extracting `buildPublishedLineageTreeWhere` into a new pure `tree-where.ts` keeps `searchPublishedLineageTrees` from growing. |
| lead-capture-form · profile-claim-form · claim-form · directory-filters · directory/{facets,schema} · lineage/schema · common/fields | below threshold — not in findings | Clean baseline. |
| Dupes (repo-wide) | 585 clone groups; hand-rolled form-field blocks are a recurring class (e.g. `school-form`/`org-general-info-form`) | The fold removes hand-rolled field blocks from four more forms, shrinking this class. |
| Dead code | none on target files | Re-verified at close. |

Target at close: `LeadForm` CRITICAL cleared (or materially reduced); no new findings introduced; `fallow audit`
default gate exit 0.

### Tasks

#### SESSION_0401_TASK_01 — Fold the admin lead form onto the field primitives (Cody)

- **Agent:** Cody
- **What:** Rewrite the plain text/textarea `FormField` blocks in `app/app/leads/_components/lead-form.tsx`
  (`firstName`, `lastName`, `email`, `phoneE164`, `referredBy` → `TextField`; `notes` → `TextAreaField`).
- **Steps:** Swap the six hand-rolled blocks for the primitives; pass `type="email"` on the email field and
  `rows={4}` on notes. Leave the `organizationId` `ComboboxSelector`, the `source` `Select`, the grid layout,
  and the `useHookFormAction` wiring exactly as-is.
- **Done means:** identical rendered form; `LeadForm` CRAP/complexity down; static gates green.
- **Depends on:** nothing (primitives already shipped SESSION_0400).

#### SESSION_0401_TASK_02 — Fold the lead-capture + profile-claim + lineage-claim note fields (Cody)

- **Agent:** Cody
- **What:** Apply the same fold to the three remaining forms.
- **Steps:**
  1. `components/web/lead-capture-form.tsx`: `firstName`/`lastName`/`email`/`phoneE164` → `TextField`
     (`type="email"` on email). Keep the success `Card` and grid layout.
  2. `components/web/claims/profile-claim-form.tsx`: `claimantNote` → `TextAreaField` (`rows={3}`). Leave the
     `relationship` `DataSelect` inline.
  3. `app/(web)/lineage/[treeSlug]/claim/claim-form.tsx`: `claimantNote` → `TextAreaField` (`rows={4}`). Leave
     the `nodeId` `Select`, the `relationship` `RadioGroup`, and the `useFieldArray` evidence block inline (the
     evidence sub-fields omit `FormMessage`, so folding them would not be output-equivalent — scope guard).
- **Done means:** identical rendered output for each; static gates green.
- **Depends on:** nothing.

#### SESSION_0401_TASK_03 — Extract the tree where-builder + wire the kind param (Cody)

- **Agent:** Cody
- **What:** Extract `searchPublishedLineageTrees`' inline `where` into a pure `tree-where.ts` and add the `kind`
  clause; thread the `kind` param through the directory + lineage schemas and the trees facet.
- **Steps:**
  1. New `server/web/lineage/tree-where.ts`: `buildPublishedLineageTreeWhere(search, brand)` — pure, no `db`
     import — returning `{ brand, isPublished, visibility, ...discipline, ...organization, ...(kind && {
     scopeType: kind }), ...OR }`. A `LineageTreeWhereFilters` type mirrors the search fields incl. `kind`.
  2. `lineage/queries.ts`: replace the inline `where` in `searchPublishedLineageTrees` with the builder; keep
     `cacheTag`/`cacheLife`/select/order untouched.
  3. `lineage/schema.ts`: add `kind: parseAsString.withDefault("")` to `lineageFilterParams` (so
     `LineageFilterParams` carries it; `/lineage` index threads `""` harmlessly until it grows a UI).
  4. `directory/schema.ts`: add `kind: parseAsString.withDefault("")` to `directoryFilterParams`.
  5. `directory/facets.ts`: add `kind` to `DirectoryFacetParams`; thread it into the `treesFacet` →
     `searchPublishedLineageTrees` search object.
- **Done means:** `kind` flows param → where; brand/visibility stay server-derived; static gates green.
- **Depends on:** nothing (disjoint from Lane 1).

#### SESSION_0401_TASK_04 — KindFilter dropdown (Trees tab) + where-builder unit tests + GAP_MATRIX (Cody)

- **Agent:** Cody
- **What:** Render the `KindFilter` Select on the Trees facet; add `tree-where.test.ts`; mark BBL-DISCOVER-002 Done.
- **Steps:**
  1. `directory-filters.tsx`: add a `KindFilter` sub-component shown on the Trees tab only, options = the
     `LineageTreeScopeType` enum with human labels (Brand / Organization / Discipline / Style / Person /
     Custom). Mirror the `RankFilter` Select markup; add it to the bar.
  2. New `tree-where.test.ts`: brand/isPublished/visibility always pinned; `kind` adds `scopeType`; empty `kind`
     omits it; discipline/org slug narrowing; q OR shape. Mirror `profile-where.test.ts`.
  3. `GAP_MATRIX.md`: BBL-DISCOVER-002 🔶 Partial → ✅ Done (kind facet wired; style noted as next increment);
     bump `updated`.
- **Done means:** `bun test tree-where` green; KindFilter matches the rank/discipline Select contract; GAP_MATRIX accurate.
- **Depends on:** SESSION_0401_TASK_03.

#### SESSION_0401_TASK_05 — Design-consistency review (Desi)

- **Agent:** Desi
- **What:** Review the four folded forms + the `KindFilter` for component-reuse parity and Trees-tab placement.
- **Steps:** Confirm each folded form renders the same field markup as before (no added/dropped `FormMessage`),
  the four forms now compose the shared primitives rather than re-implementing them, and the `KindFilter` Select
  matches the discipline/rank Select contract and only shows on Trees.
- **Done means:** prioritized fix list (or clean pass) in the Review log.
- **Depends on:** TASK_01, TASK_02, TASK_04.

#### SESSION_0401_TASK_06 — Gates + re-audit + PR (Doug / Petey)

- **Agent:** Doug (gates) → Petey (re-audit + PR)
- **What:** Run the static gates, re-run the fallow audit (close-state), open the draft PR.
- **Steps:** `bun run typecheck`, `lint:check`, `format:check`, `bun test` (tree-where + profile-where),
  `wiki:lint`; re-run `fallow health`/`audit` on the touched files and diff CRAP vs the baseline table; `oxfmt`
  the touched files; push; open a draft PR. No DB/browser proof in sandbox — CI is the gate.
- **Done means:** gates recorded; close-state audit captured; PR opened.
- **Depends on:** all prior tasks.

### Parallelism

Lane 1 (TASK_01, TASK_02) and Lane 2 (TASK_03 → TASK_04) touch disjoint files and run concurrently. TASK_05/06
gate at the end. Executed inline by the orchestrator (single coherent change set sharing one PR + gates), not
sub-agent fan-out.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0401_TASK_01 | Cody | Fold the highest-complexity target form (LeadForm CRITICAL). |
| SESSION_0401_TASK_02 | Cody | Fold the three remaining note/text forms. |
| SESSION_0401_TASK_03 | Cody | Extract the tree where-builder + thread the kind param. |
| SESSION_0401_TASK_04 | Cody | KindFilter UI + where-builder tests + GAP_MATRIX. |
| SESSION_0401_TASK_05 | Desi | UX/component-reuse review. |
| SESSION_0401_TASK_06 | Doug + Petey | Gates, re-audit, PR. |

### Open decisions

- **None requiring sign-off.** Lane 2 = `kind` (scopeType) is a Petey call mirroring the accepted rank pattern;
  `style` deferred and documented.

### Risks

- **Lead-claim evidence sub-fields are intentionally NOT folded** (they omit `FormMessage`; folding would add
  one → not output-equivalent). Scope guard keeps them inline.
- **Tree kind DB-join behaviour is unverifiable in-sandbox.** The pure `tree-where` builder is unit-tested; the
  actual `scopeType` filter + enum population are proven by CI integration tests + the operator's browser pass.
- **`scopeType` skew.** If most published trees are `BRAND`, the kind filter is low-variety in practice — the
  wiring is still correct and the gap closed; noted for the operator.

### Scope guard

- **No schema change**, no migration (Phase-3 freeze). Kind filtering uses the existing `scopeType` column only.
- Do **not** touch server actions, `useHookFormAction`/`useAction` wiring, `SocialLinksEditor`, the media query
  layer, or the `Select`/`Combobox`/`Radio`/`Switch` controls — only plain text/date/textarea fields fold.
- Do **not** add the `style` relation facet this session (deferred increment).
- Do **not** add the KindFilter to the `/lineage` index — BBL-DISCOVER-002 is the `/directory` Trees facet.

## Cody pre-flight

### Pre-flight: fields-primitive fold + tree kind facet

#### 1. Existing component scan

- Found: `components/common/fields.tsx` (`TextField`/`TextAreaField`/`DateField`/`AvatarField`, SESSION_0400);
  `directory/profile-where.ts` (+ test) as the pure-builder pattern; `directory-filters.tsx` `RankFilter` as the
  Select pattern; `searchPublishedLineageTrees` inline `where` as the extraction source.

#### 2. L1 template scan

- Closest L1 pattern: Dirstarter `Form*` parts (composed by `fields.tsx`) + `Select`. No new primitive.
- Primitive API spot-check: `TextField`/`TextAreaField` take `{ control, name, label, ... }`; `Select` items map
  matches the rank/discipline filters.

#### 3. Composition decision

- Composing existing components: `TextField`/`TextAreaField` (Lane 1); `Select` (Lane 2 KindFilter); pure builder
  mirrors `buildDirectoryProfileWhere` (Lane 2 where).

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0400). ADR: 0025 (identity SoT) confirmed valid. Runbook: none.

#### 5. Dev environment confirmed

- Sandbox: no Postgres/browser. Static gates + unit tests are the in-sandbox proof; CI is the behavioural gate.

#### 6. FAILED_STEPS check

- Prior failures in this area: none open/mitigated for forms or directory. Acknowledged the SESSION_0352/0353
  note that `Promise.all`/`$transaction([])` is unsafe with the local pg adapter — not touched (no new queries).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0401_TASK_01 | landed | `lead-form.tsx` folded — firstName/lastName/email/phone/referredBy → `TextField`, notes → `TextAreaField`; org Combobox + source Select left inline. 199→157 lines. |
| SESSION_0401_TASK_02 | landed | `lead-capture-form.tsx` (4 `TextField`), `profile-claim-form.tsx` (`TextAreaField`), lineage `claim-form.tsx` (`TextAreaField`) folded; evidence field-array + selects/radios left inline. |
| SESSION_0401_TASK_03 | landed | New pure `tree-where.ts` (`buildPublishedLineageTreeWhere`, type-only Prisma imports); `queries.ts` uses it; `kind` threaded through lineage + directory schemas + `treesFacet`. |
| SESSION_0401_TASK_04 | landed | `KindFilter` (Trees-only) + static `TREE_KIND_OPTIONS`; `tree-where.test.ts` (12 cases); GAP_MATRIX BBL-DISCOVER-002 → Done + stale next-tasks corrected. |
| SESSION_0401_TASK_05 | landed | Desi design-consistency review — clean pass, 10/10 (see Review log). |
| SESSION_0401_TASK_06 | landed | Full static gates green + `fallow audit` exit 0 (deps installed + prisma generated in-sandbox); PR opened. |

## What landed

- **D-023 fields-primitive fold (four more forms).** The SESSION_0400 shared primitives now render the plain
  text/textarea fields in four more react-hook-form surfaces:
  - `lead-form.tsx` (admin) — 5 `TextField` + 1 `TextAreaField`; org Combobox + source Select left inline.
    199 → 157 lines.
  - `lead-capture-form.tsx` (public) — 4 `TextField`.
  - `profile-claim-form.tsx` — `claimantNote` `TextAreaField` (relationship DataSelect inline).
  - lineage `claim-form.tsx` — `claimantNote` `TextAreaField` (node Select, relationship RadioGroup, and the
    `useFieldArray` evidence block deliberately inline — evidence sub-fields omit `FormMessage`, so folding
    them would not be markup-equivalent).
  Every fold is byte-equivalent markup (Desi-verified against `5fcd4a9`).
- **BBL-DISCOVER-002 tree kind facet (Done).** The tree **kind** (`scopeType`) facet is wired on the
  `/directory` Trees tab end-to-end: `kind` URL param → Trees-only `KindFilter` Select (static
  `TREE_KIND_OPTIONS` = the enum with public labels) → extracted pure `buildPublishedLineageTreeWhere`
  `scopeType` clause → `treesFacet` dispatch. A bogus `kind` is validated against the enum and omitted, never
  passed to Prisma.
- **Complexity paid down by extraction.** `searchPublishedLineageTrees`' inline `where` is now the pure,
  type-only-Prisma `tree-where.ts` builder (mirrors `profile-where.ts`), unit-tested without a DB. `LeadForm`
  shed its 6 hand-rolled field blocks (199 → 157 lines) — though it stays CRITICAL because its cyclomatic/
  cognitive load lives in the out-of-scope `source` Select's double enum-map (see Open decisions).
- **Stale launch docs corrected.** GAP_MATRIX BBL-DISCOVER-002 🔶 Partial → ✅ Done; Epic 7 summary + next-tasks
  #4 updated; the missing SESSION_0399/0400/0401 rows added to `wiki/index.md`.

## Decisions resolved

- **Lane 2 = `kind` (scopeType), not `style` (Petey call).** `kind` is a static enum (no `filter-options` DB
  query, no discipline-narrowing) → fully in-sandbox unit-testable and lowest-risk for an unattended run.
  `style` (relation, discipline-narrowed like rank) is the documented next increment.
- **Evidence sub-fields stay inline (scope guard).** They omit `FormMessage`; folding would change rendered
  markup. Left as-is.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/app/leads/_components/lead-form.tsx` | Folded 5 text + 1 textarea field onto `TextField`/`TextAreaField`; 199 → 157 lines. |
| `apps/web/components/web/lead-capture-form.tsx` | Folded 4 fields onto `TextField`. |
| `apps/web/components/web/claims/profile-claim-form.tsx` | `claimantNote` → `TextAreaField`. |
| `apps/web/app/(web)/lineage/[treeSlug]/claim/claim-form.tsx` | `claimantNote` → `TextAreaField` (evidence block inline). |
| `apps/web/server/web/lineage/tree-where.ts` | **New** — pure `buildPublishedLineageTreeWhere` (type-only Prisma) with the `kind`/`scopeType` clause. |
| `apps/web/server/web/lineage/tree-where.test.ts` | **New** — 12 where-builder cases (scope pin, kind, bogus-kind, narrowing, q OR). |
| `apps/web/server/web/lineage/queries.ts` | `searchPublishedLineageTrees` uses the builder; `kind: ""` added to the back-compat default. |
| `apps/web/server/web/lineage/schema.ts` | Added `kind` to `lineageFilterParams`. |
| `apps/web/server/web/lineage/schema.test.ts` | Updated parse-shape expectations for `kind`. |
| `apps/web/server/web/lineage/queries.test.ts` | Added `kind: ""` to the shared `baseSearch` fixture. |
| `apps/web/server/web/directory/schema.ts` | Added `kind` to `directoryFilterParams`. |
| `apps/web/server/web/directory/facets.ts` | Added `kind` to `DirectoryFacetParams`; threaded into `treesFacet`. |
| `apps/web/components/web/directory/directory-filters.tsx` | Added `TREE_KIND_OPTIONS` + the Trees-only `KindFilter`. |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | BBL-DISCOVER-002 → Done; Epic 7 summary + next-tasks #4 corrected; `last_agent` bumped. |
| `docs/knowledge/wiki/index.md` | Added missing SESSION_0399/0400 rows + the SESSION_0401 row; `updated` bumped. |
| `docs/sprints/SESSION_0401.md` | This session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (apps/web, dummy DB env, generated client) | PASS — 0 errors. |
| `bun test tree-where + profile-where + lineage/schema` | PASS — 28 pass / 0 fail (12 new tree-where cases). |
| `bun run lint:check` (oxlint 1.69.0) | PASS — 0 errors (pre-existing warnings only, none in touched files). |
| `bun run format:check` (oxfmt 0.54.0) | PASS — clean (1423 files). |
| `fallow audit --base 5fcd4a9` (deps present) | **PASS (exit 0)** — "No issues in 16 changed files"; the 2 complexity findings (`LeadForm` CRITICAL, `getLineageTreeForUser` HIGH) are both **inherited**, 0 introduced. |
| `bun run wiki:lint` (root) | PASS — 0 violations (683 md files). |
| DB-backed `queries.test.ts` (tree integration) + authenticated render | **Deferred to CI + operator** — no Postgres/browser in sandbox. CI (full suite + Playwright) is the authoritative behavioural gate. |

## Open decisions / blockers

- **`LeadForm` remains `fallow` CRITICAL (inherited, 506 CRAP).** The fold removed the 6 duplicated field blocks
  (199 → 157 lines) but the cyclomatic/cognitive load is concentrated in the out-of-scope `source` `Select`
  (which maps `Object.values(LeadSource)` twice). A follow-up could extract a `sourceOptions` const + reuse it
  to clear the threshold — out of this session's fold scope.
- **`style`-relation tree facet not shipped** (deferred — see Decisions resolved).
- Otherwise **none.** Rank/kind DB-join behaviour is unit-tested at the where-builders and proven by CI + the
  operator's browser pass.

## Next session

### Goal

On the operator's machine: confirm the `/directory` Trees **kind** filter narrows results and the four folded
forms (admin lead, public lead-capture, profile-claim, lineage-claim) render unchanged against a live DB +
browser; merge once CI is green. Then continue the directory lane with the **tree `style`-relation facet**
(discipline-narrowed, mirroring rank) — the last optional BBL-DISCOVER increment before BBL-DISCOVER-003
(related-profile suggestions) — and/or the `LeadForm` `sourceOptions` complexity paydown.

### First task

Pull `claude/bow-in-session-planning-j3x83h`, run the dev server, and verify the Trees-tab kind dropdown filters
trees by scopeType and the four folded forms render identically; merge the PR if CI is green.

## Review log

### SESSION_0401_REVIEW_01 — Desi design-consistency (folded forms + KindFilter)

- **Reviewed tasks:** TASK_01–04.
- **Dirstarter docs check:** cached docs sufficient (no L1 primitive replaced — primitives compose the existing
  `Form*` parts; `KindFilter` reuses the `Select` contract).
- **Verdict:** Clean pass. All eight folded fields render byte-equivalent markup vs `5fcd4a9` (same label/
  placeholder/type/rows, no added/dropped `FormMessage`); the `str()` coercion is inert given string defaults.
  `KindFilter` matches the `RankFilter` Select contract exactly (trigger size/className, content align,
  placeholder pattern, `updateFilters({ kind })`, `items` omitted) and gates Trees-only — the correct analog of
  RankFilter's People-only gating.
- **Score:** 10/10.
- **Follow-up (LOW, optional):** `KindFilter` placeholder "All kinds" could read "All tree types" for clarity —
  cosmetic, deferred.

## Hostile close review

- **Desi:** pass — field folds + `KindFilter` are markup- and behaviour-preserving; no fix-list (10/10).
- **Doug:** pass — typecheck 0, 28 unit tests, lint/format/wiki clean, `fallow audit` exit 0 with 0 introduced
  findings (the 2 complexity findings are inherited). DB-backed tree-join + authenticated render deferred to CI.
- **Kaizen aggregate:** 9/10 — clean two-lane landing with real in-sandbox gates (deps installed + prisma
  generated this run, unlike the deferred-typecheck SESSION_0400). The only residual is the inherited `LeadForm`
  CRITICAL (out-of-scope `source` Select) + sandbox-deferred DB/browser proof (CI-covered).

## ADR / ubiquitous-language check

- ADR update **not required.** This session applies ADR 0025 (Passport identity SoT) and mirrors the
  SESSION_0400 rank-filter pattern; no new architectural decision. ADR 0025 confirmed valid.
- Ubiquitous-language update **not required.** "kind" is the existing `LineageTree.scopeType` enum surfaced as a
  facet — no new domain term. `Passport`/`DirectoryProfile`/`Discipline`/`Rank` usage unchanged.

## Reflections

- The honest complexity story: a presentation fold cuts **lines** and **duplication** but not necessarily
  **cyclomatic/cognitive** — `LeadForm` lost 42 lines and 6 duplicated blocks yet stayed CRITICAL because its
  branching lives in the `source` Select I correctly left inline. Worth resisting the temptation to overclaim a
  CRITICAL-cleared when the residual is structural and out of scope.
- Extracting `tree-where.ts` with **type-only** Prisma imports (string-literal enums instead of runtime enum
  values) made the where-builder unit-testable with zero runtime Prisma dependency — the same trick
  `profile-where.ts` uses. This is the pattern to keep reaching for: pure, DB-free `where` builders are the one
  piece of a privacy-scoped query that's both highest-risk and fully testable in a no-DB sandbox.
- A stray tool artifact appended a literal `</content>` line to several written files; the unit tests caught it
  immediately (syntax error), which is exactly why running the cheap gates early pays for itself.
- This sandbox started with **no `node_modules`** — installing deps + generating the Prisma client (dummy DB env)
  turned the static gates from "deferred to CI" into real in-sandbox passes, including a clean `fallow audit`
  (the unresolved-import false positives vanished once deps resolved).

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | GAP_MATRIX `last_agent` → claude-session-0401; `wiki/index.md` `updated` → 2026-06-17; SESSION_0401 frontmatter complete. New code files carry header doc-comments (no doc frontmatter needed). |
| Backlinks/index sweep | `wiki/index.md` gained SESSION_0399/0400/0401 rows (filled a 2-session gap). SESSION_0401 `pairs_with` SESSION_0400 + ADR 0025. No new wiki page created. |
| Wiki lint | `bun run wiki:lint` → 0 violations (683 md files). |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | SESSION_0401_REVIEW_01 (Desi 10/10) + Doug/Desi/Kaizen verdicts above. |
| Review & Recommend | Next session goal written: yes (style-relation facet / LeadForm sourceOptions paydown). |
| Memory sweep | None needed — no new project-scoped constraint or preference; ADR 0025 + rank/where-builder pattern already captured. |
| Next session unblock check | Unblocked — first task is operator-side verify + merge; no user input required. |
| Git hygiene | branch `claude/bow-in-session-planning-j3x83h`; single push — hash reported at bow-out / see git log. |
| Graphify update | Skipped — Graphify not installed in this remote sandbox. |
