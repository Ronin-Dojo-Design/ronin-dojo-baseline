---
title: "Petey plan 0229 — Content Engine S6 forward lane: test debt then public UX"
slug: petey-plan-0229
type: petey-plan
status: active
created: 2026-05-23
updated: 2026-05-23
last_agent: claude-session-0229
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0223.md
  - docs/sprints/SESSION_0225.md
  - docs/sprints/SESSION_0226.md
  - docs/sprints/SESSION_0227.md
  - docs/sprints/SESSION_0228.md
  - docs/sprints/SESSION_0229.md
  - docs/sprints/SESSION_0230.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey plan 0229 — Content Engine S6 forward lane

## Context

SESSION_0229 closed the launch-critical admin read-side brand leak in `findContentAtomById` (SESSION_0225_BACKFILL_FINDING_01) and the sibling leak in `findContentVariantById`, with a 4-case cross-brand isolation test. The Content Engine S6 admin surface is now safe for further work.

This plan stages **two sequential sessions** to close all remaining S6 Content Engine debt before Baseline + BBL launch:

- **SESSION_0230 — test debt:** close the last two test-coverage gaps (edit-save round-trip pattern + write-path cross-brand isolation).
- **SESSION_0231 — public UX:** ship the three remaining public `/posts` surface gaps (tag filtering + image/video carousel + tools-mentioned sidebar / tag rendering).

Sessions are run in separate chat windows. Each is self-contained per the bow-in carryover below. The order is deliberate — SESSION_0230 hardens the admin surface so SESSION_0231 can move fast on public UX without re-litigating test scaffolding.

Reversal note: the operator may swap the order if launch pressure makes public UX more urgent than test debt. The two sessions are independent — neither depends on the other.

## Open S6 Content Engine debt inventory (assessed 2026-05-23)

| ID | Source | Type | Session |
| --- | --- | --- | --- |
| A | SESSION_0226_BACKFILL_FINDING_03 | Test debt — edit-save round-trip pattern for inline forms | 0230 |
| B | SESSION_0229 Open decisions | Test debt — write-path cross-brand isolation for `upsertContentAtom` / `deleteContentAtoms` | 0230 |
| C | SESSION_0225 Next session (still open) | Public UX — `/posts` tag filtering | 0231 |
| D | SESSION_0223 Next-session P2 | Public UX — image/video carousel on `/posts/[slug]` | 0231 |
| E | SESSION_0223 carryover | Public UX — tools-mentioned sidebar + tags rendering on `/posts/[slug]` | 0231 |

Items not in scope for either session:

- ContentTask admin surface (F) — out of scope; needs its own multi-session arc.
- SESSION_0223 explicit closure stamps on F01–F04 — doc-only follow-up, can be done in any 5-minute window or at next bow-in housekeeping.

---

## SESSION_0230 — Content Engine test debt closure

### Bow-in carryover (paste into SESSION_0230 bow-in)

SESSION_0229 closed the launch-critical brand leaks in `apps/web/server/admin/content/queries.ts` and shipped `apps/web/server/admin/content/queries.brand-isolation.test.ts` (4 cases) plus closure stamps on SESSION_0225 findings. Pushed to main as `89048c1`. Two test-coverage gaps remain in the Content Engine S6 admin surface — this session closes them.

**Quote: SESSION_0226 Hostile close review (backfilled SESSION_0228), FINDING_03:**

> Verification suite missed an end-to-end edit-save round trip. SESSION_0226 § Verification shows typecheck, biome, 257 tests, and build all green; FINDING_01 (variant edit hydration silently drops fields) still shipped. SESSION_0227 added focused action tests but the underlying lesson is that "load existing record into edit form and save unchanged" is a missing test pattern for any inline edit form. **Impact:** Future inline-edit features in the Content Engine lane are at the same risk until this round-trip test pattern is codified.

**Quote: SESSION_0229 Open decisions / blockers:**

> Write-path cross-brand isolation test (deferred): SESSION_0225_BACKFILL_FINDING_02's write-path scope (cross-brand `upsertContentAtom` / `deleteContentAtoms`) is not covered by SESSION_0229. Those actions chain `adminActionClient` + `getRequestBrand()`, so the leak class is not currently exploitable, but a regression test would be cheap insurance.

### Goal

Close both remaining test-coverage gaps in the Content Engine S6 admin surface: ship a reusable edit-save round-trip test pattern guarding against the SESSION_0226 FINDING_01 class, and add write-path cross-brand isolation tests for the two atom-mutating actions.

### Tasks

#### SESSION_0230_TASK_01 — Edit-save round-trip test for ContentVariant inline form

- **Agent:** Cody subagent (single worker)
- **What:** Add a new test file `apps/web/server/admin/content/variant-round-trip.safe-action.test.ts` (name TBD by Cody — match repo convention) that proves: load an existing ContentVariant via `findContentAtomById`, pass it through the form-default shape, save it back unchanged via `upsertContentVariant` (or the equivalent variant action), and assert every editable field round-tripped without loss. Cover at minimum: `renderedCopy`, `excerpt`, `cta`, `thumbnailUrl`, `videoUrl`, `voiceNotes` — the exact fields that silently dropped in SESSION_0226.
- **Pattern:** Reuse the `installSafeActionMocks` + `setTestSession` harness from `actions.safe-action.test.ts` (same dir). Create a fixture atom + variant via `db.contentVariant.create`, fetch via `findContentAtomById` to get the form-shaped payload, then call the variant upsert action with the unchanged payload, then re-read and `toEqual` the original.
- **Why this matters:** Codifies a lane-level test pattern. Any future inline edit form added in this dir should follow this pattern; the test itself is the contract.
- **Done means:** New test file exists with at least 1 round-trip case covering all 6 fields; full suite passes.

#### SESSION_0230_TASK_02 — Write-path cross-brand isolation tests

- **Agent:** Cody subagent (chained after TASK_01, same context)
- **What:** Extend `apps/web/server/admin/content/queries.brand-isolation.test.ts` OR add to `actions.safe-action.test.ts` (Cody picks based on file size / cohesion) with 4 new cases:
  1. `upsertContentAtom` cannot mutate an atom whose only variant is on a foreign brand (assert `serverError` or null result).
  2. `upsertContentAtom` succeeds against a same-brand atom (sanity baseline).
  3. `deleteContentAtoms` cannot delete a foreign-brand atom (assert no-op or rejection).
  4. `deleteContentAtoms` succeeds against same-brand atoms (sanity baseline).
- **Pattern:** Mirror SESSION_0229's install-time brand fix (no mid-test brand switching). Install with `BASELINE_MARTIAL_ARTS`, create fixtures on both brands, assert isolation.
- **Done means:** 4 new passing cases; full suite stays green; the action chain is proven brand-isolated against the same threat model as SESSION_0229's read-path closure.

#### SESSION_0230_TASK_03 — Verification + bow-out

- **Agent:** Petey (inline)
- **Commands:**
  - `pnpm --filter @ronin-dojo/web typecheck`
  - `bun --cwd apps/web biome check --write apps/web/server/admin/content/`
  - `bun --cwd apps/web test apps/web/server/admin/content/` (focused slice — should be < 5s)
  - `bun --cwd apps/web test -- --concurrency=1` (full suite — must stay ≥266 green)
  - `pnpm --filter @ronin-dojo/web build`
- **Then:** Full-close bow-out per `docs/rituals/closing.md`. Mark SESSION_0226_BACKFILL_FINDING_03 closed in SESSION_0226 review log; mark SESSION_0229 Open-decisions write-path item closed. Commit + push to main.
- **Verify-in-browser step:** **Not applicable** — server-layer test additions only, no UI surface touched.

### Parallelism

Single Cody subagent for TASK_01 + TASK_02 chained (one fixture-setup mental model, shared harness). Petey inline for TASK_03. Matches SESSION_0229's shape.

### Risks

- **Variant upsert action signature drift:** If `upsertContentVariant` doesn't exist or the variant-edit save flow goes through a different path (e.g., field-level updates from the variants panel), TASK_01 needs to test whatever the actual save path is. Cody should read `apps/web/app/admin/content/_components/content-variant-form.tsx` and `apps/web/server/admin/content/actions.ts` first to map the save path.
- **Existing test collateral:** TASK_02 may surface that `upsertContentAtom`'s current brand check is implicit (`adminActionClient` chain reads brand once per call) rather than per-target-row. If a foreign-brand atom can be mutated by passing its id in the payload, that's a NEW finding — escalate to operator before continuing.

### Scope guard

- Do NOT touch public-facing `/posts` code paths — that's SESSION_0231.
- Do NOT add new admin features.
- Do NOT refactor the existing test harness — extend it, don't redesign it.
- Do NOT touch `findContentAtomById` / `findContentVariantById` (closed in SESSION_0229).

### Expected size

~60-90 minutes. 2-3 new test files / case additions, no production code change unless a write-path leak surfaces in TASK_02.

---

## SESSION_0231 — Content Engine public `/posts` UX polish

### Bow-in carryover (paste into SESSION_0231 bow-in)

SESSION_0230 closed the last two Content Engine test-coverage gaps (edit-save round-trip pattern + write-path cross-brand isolation). The admin surface is now fully hardened. Three public UX gaps remain on `/posts` and `/posts/[slug]` from SESSION_0223 and SESSION_0225 carryover — this session ships them.

**Quote: SESSION_0223 Next session (Priorities 1–2, still open at the time of SESSION_0229's recon):**

> **Priority 1 — Schema: tags + tools on ContentVariant/ContentAtom.** Goal: Add tags and tools relations to ContentAtom (canonical) so variants inherit. Migration + seed update. Done means: `/posts/why-the-bell-matters` shows tags and tools-mentioned sidebar (if seeded). **[Note: schema migration landed in SESSION_0224; what remains is the UI rendering on the public detail page.]**
>
> **Priority 2 — Image/video carousel component.** Goal: Design a multi-media gallery model or reuse existing media patterns. Add carousel component to `/posts/[slug]`. Done means: ContentVariant with multiple images renders a carousel on detail page.

**Quote: SESSION_0225 Next session (item C, still open):**

> Add ContentVariant inline tab on atom edit, media attachment management with S3 upload via FormMedia, and public `/posts` tag filtering. **[Note: first two delivered in SESSION_0226 and SESSION_0227; public tag filtering on the `/posts` list page remains open.]**

### Goal

Ship the three remaining public-facing Content Engine features on `/posts` and `/posts/[slug]`: tag filtering on the list page, multi-image carousel on the detail page, and tags + tools-mentioned sidebar on the detail page. Close the SESSION_0223 launch-readiness items for the public reader surface.

### Tasks

#### SESSION_0231_TASK_01 — Tag filtering on `/posts` list page

- **Agent:** Cody subagent (in parallel with TASK_02 and TASK_03 — all three touch disjoint files)
- **What:** Add a tag-filter UI to `apps/web/app/(web)/posts/page.tsx`. Tags are sourced from the ContentAtom tags relation (already brand-scoped via the public query). Selection via nuqs URL params (matches existing `/posts` and admin patterns).
- **Pattern reference:** `apps/web/app/(web)/blog/page.tsx` if it has tag filtering; otherwise mirror the tag-pill UI from `/admin/content` list page.
- **Done means:** Selecting a tag filters the visible posts; URL contains the tag param; deselecting clears the filter; "no posts match" empty state for unmatched filters.

#### SESSION_0231_TASK_02 — Image/video carousel on `/posts/[slug]`

- **Agent:** Cody subagent (parallel)
- **What:** Add a carousel component to `apps/web/app/(web)/posts/[slug]/page.tsx` that renders multiple media attachments from `atom.mediaAttachments` (already ordered by `sortOrder` per SESSION_0227's media work). Support both IMAGE and VIDEO media types.
- **Pattern reference:** Check `apps/web/components/web/` and `apps/web/components/common/` for an existing carousel/gallery primitive — reuse if present. Otherwise compose from Base UI primitives.
- **Done means:** Detail page with 2+ media attachments renders a swipeable/clickable carousel; single-media variant falls back to the existing single-image render; video media uses correct embed.

#### SESSION_0231_TASK_03 — Tags + tools-mentioned sidebar on `/posts/[slug]`

- **Agent:** Cody subagent (parallel)
- **What:** Render the existing `atom.tags` (already hydrated) as clickable tag pills on the detail page, and add a "Tools mentioned" sidebar block showing `atom.tools`. Tag click should route to `/posts?tag=<slug>` (consuming TASK_01's filter param).
- **Pattern reference:** Existing `/blog/[slug]` sidebar composition (`AdCard` lives there already per SESSION_0223's blog parity work).
- **Done means:** Tags render as a row of clickable pills; tools render in a sidebar block; clicking a tag navigates to the filtered list page.

#### SESSION_0231_TASK_04 — Verification + verify-in-browser + bow-out

- **Agent:** Petey (inline)
- **Test gates:**
  - `pnpm --filter @ronin-dojo/web typecheck`
  - `bun --cwd apps/web biome check --write apps/web/app/\(web\)/posts/`
  - `bun --cwd apps/web test -- --concurrency=1` (full suite stays green)
  - `pnpm --filter @ronin-dojo/web build`
- **Verify-in-browser step (required per Claude Code session-specific guidance for UI/frontend changes):**
  - Launch dev server: `pnpm --filter @ronin-dojo/web dev` (background).
  - Navigate to `http://localhost:3000/posts` — confirm tag filter UI is present; click a tag; confirm URL updates and post list filters.
  - Navigate to a seeded detail page (e.g. `/posts/why-the-bell-matters`) — confirm carousel (if multi-media), tag pills, and tools sidebar all render.
  - Capture screenshots of the list page (filtered) and the detail page; embed paths in SESSION_0231 verification table.
  - Smoke a clean-DB edge case: a post with zero tags, zero tools, zero media — confirm graceful empty states.
- **Then:** Full-close bow-out. Mark SESSION_0225 Next session item C (public tag filtering) closed; mark SESSION_0223 Next session P2 (carousel) closed; mark SESSION_0223 carryover (tags + tools) closed. Commit + push to main.

### Parallelism

3 parallel Cody subagents (TASK_01 + TASK_02 + TASK_03) — they touch three different files / surface areas with no shared state. Petey inline for TASK_04.

### Risks

- **No existing carousel primitive:** If the repo doesn't already have a swipeable gallery component, TASK_02 expands to "design + build a reusable carousel," which is a session by itself. Cody should report this back fast so the operator can decide whether to descope (single-image stack instead of carousel) or split SESSION_0231 in two.
- **Tag-filter URL state collision:** If `/posts` already uses nuqs for other params (search, pagination), the new `tag` param must compose cleanly. TASK_01 must read the existing param schema first.
- **Seed data inadequacy:** The current seeded variant (`why-the-bell-matters`) may not have multiple media attachments, multiple tags, or tools — so the carousel + sidebar visuals can't be verified end-to-end. Petey should check this in the verify-in-browser step and, if needed, seed additional fixtures before screenshotting.

### Scope guard

- Do NOT touch `/admin/content` surfaces — that's done.
- Do NOT add a new media model — reuse what SESSION_0227 shipped.
- Do NOT touch ContentTask — out of scope for this lane.
- Do NOT redesign `/posts` layout — only add the three feature surfaces.

### Expected size

~90 minutes. 3 parallel feature surfaces + verify-in-browser. If the carousel risk above materializes, descope TASK_02 to a simple multi-image stack and ship the carousel proper in a follow-up.

---

## Cross-references

- [SESSION_0223](./SESSION_0223.md) — Content Engine Stage 2 (seed proof + blog parity); source of items D + E.
- [SESSION_0225](./SESSION_0225.md) — ContentAtom admin CRUD; source of item C; backfilled findings closed in 0229.
- [SESSION_0226](./SESSION_0226.md) — ContentVariant inline + media + tags; source of item A (FINDING_03).
- [SESSION_0227](./SESSION_0227.md) — ContentVariant preview + media ordering + tag clicks; shipped variant hydration fix.
- [SESSION_0228](./SESSION_0228.md) — Project-log retirement + hostile-review backfill; surfaced items A and FINDING_02 that 0229 closed.
- [SESSION_0229](./SESSION_0229.md) — Admin brand-leak remediation; source of item B (deferred write-path test).
- [SESSION_0230](./SESSION_0230.md) — Write-path brand-leak fixes + test debt closure; closed items A + B.
- [Petey Plan Protocol](../protocols/petey-plan.md) — protocol this doc instantiates.
- [Closing ritual](../rituals/closing.md) — all sessions end with full-close per this ritual.

---

## SESSION_0232 — Pre-existing test suite failure triage

### Bow-in carryover (paste into SESSION_0232 bow-in)

SESSION_0230 confirmed 63 pre-existing test failures + 9 errors across `server/web/` test files (disciplines, enrollment, entitlements, lead, lineage, schedule, bookmarks, attendance, posts, tools, stripe). These failures are identical on clean `main` before and after SESSION_0230's changes — zero new failures introduced. The failures appear when running the full suite simultaneously; individual test files pass in isolation, suggesting concurrency/setup issues.

### Goal

Triage and fix the 63 pre-existing test failures across `server/web/` test files. Restore full suite to green.

### Tasks

#### SESSION_0232_TASK_01 — Triage: categorize failures

- **Agent:** Cody
- **What:** Run each failing test file in isolation to confirm it passes alone. Then run pairs/groups to identify concurrency conflicts (shared DB state, mock bleed, port collisions, etc.). Categorize into: (a) setup/teardown issues, (b) mock bleed across files, (c) genuine logic failures, (d) missing test infrastructure.
- **Done means:** Categorized failure list with root causes identified.

#### SESSION_0232_TASK_02 — Fix categorized failures

- **Agent:** Cody
- **What:** Fix each category. Likely fixes: better test isolation (unique prefixes), proper cleanup in afterAll, mock reset between files, or missing test DB seed data.
- **Done means:** Full suite passes with 0 failures.

#### SESSION_0232_TASK_03 — Verification + bow-out

- **Agent:** Petey (inline)
- **What:** Full suite green, typecheck, build. Full-close.

### Scope guard

- Do NOT fix any production code bugs discovered during triage — file them as findings.
- Do NOT refactor test infrastructure beyond what's needed to fix the failures.

### Expected size

~90-120 minutes depending on root cause complexity.
