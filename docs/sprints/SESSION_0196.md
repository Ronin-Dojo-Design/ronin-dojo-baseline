---
title: "SESSION 0196 — Listings Parity v1 (Techniques, Schools, Disciplines, Courses)"
slug: session-0196
type: session--open
status: in-progress
created: 2026-05-18
updated: 2026-05-18
last_agent: claude-session-0196
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0195.md
  - docs/agents/desi.md
  - docs/protocols/petey-plan.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0196 — Listings Parity v1 (Techniques, Schools, Disciplines, Courses)

## Date

2026-05-18

## Operator

Brian + claude-session-0196 (Petey)

## Goal

Bring the four public listing surfaces (`/techniques`, `/schools`, `/disciplines`, `/courses`) to visual + interaction parity with the proven `ToolListing` + `ToolCard` pattern. Schools + techniques get the full kit (FiltersProvider + Search + grid + Pagination + Skeleton + Sort). Disciplines + courses get a tightened card-grid + skeleton look only (filter axes deferred — data layer is not ready for either). All four `<Domain>Card` components tighten toward the `ToolCard` visual contract. Promote Desi to a Claude Code subagent so she can drive the baseline review pass before any Cody code.

## Bow-in notes

- **Latest previous session:** SESSION_0195 — Merge PR 23 and Clean PR 24 Viewer Polish, closed-full.
- **Previous next session goal:** Pick next lineage v1 task — superseded today by owner directive to do a front-end listings parity pass before resuming lineage v1.
- **Owner directive this session:** Promote Desi, then bring courses/techniques/schools/disciplines pages to tool-listing + categories-cards parity. Use Graphify queries (not repo-wide grep) for navigation.
- **Branch at bow-in:** `main` at `3ab7f9b` (SESSION_0195 post-close addendum).
- **Working tree:** clean.
- **Worktrees at bow-in:** main repo only (`/Users/brianscott/dev/ronin-dojo-app`). SESSION_0195's pr-23-clean and pr-24-clean worktrees were both removed at close.
- **Graphify status:** `graphify stats` reported 6370 nodes, 11486 edges, 797 communities, 1250 tracked files. Matches SESSION_0195 close (nodes/edges/files identical; community count drifted 822 → 797, normal recompute). No `graphify update` run — per owner directive, graph is already current from end of SESSION_0195.
- **Graphify queries used:**
  - `tools listing page categories grid cards techniques courses schools disciplines public` — surfaced `apps/web/components/web/listings/*`, `apps/web/app/(web)/disciplines/page.tsx`, `apps/web/app/(web)/schools/page.tsx`.
  - `tools page listing category card grid filter` — surfaced `apps/web/components/web/tools/*` kit and `apps/web/components/web/categories/*` reference.
- **Files inspected from graph:** `apps/web/components/web/tools/tool-listing.tsx`, `apps/web/components/web/tools/tool-card.tsx`, the four target `page.tsx` files for techniques/schools/disciplines/courses, plus directory listings under `apps/web/components/web/{tools,categories,listings}/`.
- **FS log / drift register:** not blocking today's lane (UI parity pass, no schema/migration/auth/payment work).
- **Verification note:** Graphify served as the navigation aid for file selection; the four target pages and the tools reference kit were verified by direct file reads.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming + content surfaces only. No DB/auth/payments/storage layer change. Card primitives (`Card`, `CardHeader`, `H4`, `Link`, `Badge`, `ShowMore`, `Favicon`) are Dirstarter L1 components already in use by `ToolCard`. |
| Extension or replacement | Extension. Aligning four Ronin-native listing surfaces to the proven Dirstarter-derived `ToolListing`/`ToolCard` shape. No replacement of any Dirstarter capability. |
| Why justified | The four surfaces are public-facing and brand-visible; visual drift across them undercuts the May 18, 2026 launch readiness. The tools pattern is already proven across the codebase and uses Dirstarter L1 primitives, so parity work compounds rather than re-invents. |
| Risk if bypassed | Continued visual + UX drift across four flagship public pages; per-brand inconsistency at launch; missed opportunity to extract a card contract that future surfaces can reuse. |

## Petey plan

### Goal

Promote Desi to a Claude Code subagent, then port four public listing surfaces to the `ToolListing`/`ToolCard` shape (full kit where data supports it; card-grid only where it does not), in a single feature branch and single PR ("listings-parity v1").

### Tasks

#### SESSION_0196_TASK_01 — Promote Desi to `.claude/agents/desi.md`

- **Agent:** Petey
- **What:** Author `.claude/agents/desi.md` as a Claude Code subagent definition derived from `docs/agents/desi.md`. Single-purpose: UX + design-consistency review with the structured 9-section output format.
- **Steps:**
  1. Create `.claude/agents/` directory.
  2. Author `desi.md` with YAML frontmatter (`name: Desi`, `description: ...`, `tools: read-only set`) and prompt body that mirrors `docs/agents/desi.md` scope, operating rules, and required output format.
  3. Verify the agent is discoverable from this conversation before TASK_02 begins.
- **Done means:** `.claude/agents/desi.md` exists; Desi is invocable as a subagent.
- **Depends on:** nothing.

#### SESSION_0196_TASK_02 — Desi baseline review pass

- **Agent:** Desi (subagent)
- **What:** Audit the four target listing pages and their card components against `ToolListing` / `ToolCard`. Output the 9-section structured review with file:line citations.
- **Steps:**
  1. Read the four `page.tsx` files (techniques, schools, disciplines, courses).
  2. Read each `<Domain>Card` component (`course-card`, `discipline-card`, `school-card`, `technique-card`).
  3. Compare structure, primitive use, hover behavior, skeleton coverage, filter UX against `ToolListing`/`ToolCard`/`ToolListingSkeleton`.
  4. Produce prioritized fix list (High / Medium / Low) with concrete diffs to recommend, citing exact files and lines.
- **Done means:** Structured Desi review block returned (Sections 1–9), prioritized fix list ready for Cody handoff. Output recorded in this SESSION file under `## Review pass 1 — Desi`.
- **Depends on:** TASK_01.

#### SESSION_0196_TASK_03a — Card-contract tightening (parallel)

- **Agent:** Cody (subagent A — `general-purpose`)
- **What:** Tighten the four `<Domain>Card` components toward the `ToolCard` visual contract per Desi's fix list. Disjoint file set from TASK_03b.
- **Steps:**
  1. For each of `course-card`, `discipline-card`, `school-card`, `technique-card`:
     - Match the `<Card isRevealed>` + `<CardHeader wrap={false}>` + `<Favicon>` (or domain avatar) + `<H4 as="h3" className="truncate"><Link>` + optional badge structure.
     - Add the hover-reveal description overlay (`absolute inset-0 opacity-0 ... group-hover:opacity-100`).
     - Use `ShowMore` for tag/category chips with `size="xs"` and `showMoreType="text"`.
     - Add a `<DomainName>CardSkeleton` matching `ToolCardSkeleton` shape if missing.
  2. Run `bun biome check --write` on touched files.
- **Done means:** Four card components match the `ToolCard` contract; skeletons exist for all four; biome clean; typecheck passes.
- **Depends on:** TASK_02.

#### SESSION_0196_TASK_03b — Page wiring (parallel)

- **Agent:** Cody (subagent B — `general-purpose`)
- **What:** Bring the four `page.tsx` files to the right level of the tool-listing pattern. Schools + techniques get the full kit. Disciplines + courses get grid+skeleton parity (no filter kit).
- **Steps:**
  1. Schools + techniques: verify each page already wires `Search` + filter chips + sort + pagination + skeleton via their `<Domain>Query` component; close gaps where the contract is incomplete.
  2. Disciplines: replace bespoke `DisciplineList` with a card-grid that uses the tightened `DisciplineCard`; ensure `DisciplineListSkeleton` matches the new grid; keep existing `Breadcrumbs` + `StructuredData`.
  3. Courses: wrap `CourseList` in Suspense with a `CourseListSkeleton`; remove inline `searchCourses` from the page if the list component can own the query (otherwise keep page-level fetch but add skeleton); ensure the grid layout matches the tightened `CourseCard`.
- **Done means:** Four pages render correctly under all four brands; schools + techniques have working filter UX; disciplines + courses have skeleton + tightened grid.
- **Depends on:** TASK_02. **Runs in parallel with TASK_03a on disjoint files.**

#### SESSION_0196_TASK_04 — Doug verification

- **Agent:** Doug
- **What:** Lifecycle + release-readiness verification on the feature branch before push.
- **Steps:**
  1. `pnpm install --frozen-lockfile`
  2. `pnpm --filter dirstarter typecheck`
  3. `bun biome check .` from `apps/web`
  4. Lineage test suite (regression check, since SESSION_0195 just landed there): `bun test server/web/lineage` from `apps/web`
  5. Local smoke: start dev server, hit each of `/techniques`, `/schools`, `/disciplines`, `/courses` under at least Baseline brand; check empty state where reachable; verify cards render + hover-reveal + skeleton (throttle network).
  6. Open PR; wait for Vercel + CodeRabbit; post verification comment on PR with command outputs.
- **Done means:** All commands pass; PR has green checks; verification comment posted.
- **Depends on:** TASK_03a + TASK_03b.

#### SESSION_0196_TASK_05 — Full-close (Petey/Giddy)

- **Agent:** Petey + Giddy
- **What:** Bow-out per `docs/rituals/closing.md`. Hostile close review, frontmatter sweep, wiki index, project-log entries, drift/FS log sweep, ADR + component inventory check, wiki lint, post-hygiene Graphify refresh, commit, push.
- **Steps:**
  1. Hostile close review block in this SESSION file.
  2. `project-log.md` — task plan + review + finding entries.
  3. `wiki/index.md` — new SESSION_0196 row + reference callout for any new shared card behavior.
  4. ADR check: tighten-existing-cards is presentation-layer, not architectural — likely no ADR. Re-evaluate if a shared primitive surfaces.
  5. `custom-component-inventory.md` — add or update entries for the four card components if their public contract shifts.
  6. `bun run wiki:lint` — green.
  7. `graphify update .` — capture new nodes/edges.
  8. Commit + push; if PR exists, post the final close comment.
- **Done means:** SESSION_0196 status set to `closed-full`; project-log + wiki index reflect this session; PR merged or owner-approved-and-queued; graphify refreshed.
- **Depends on:** TASK_04.

### Parallelism

- TASK_01 → TASK_02 (sequential; Desi must exist before she runs).
- TASK_02 → TASK_03a, TASK_03b (sequential gate; Desi's fix list scopes Cody's work).
- TASK_03a ‖ TASK_03b (parallel subagents on disjoint files — card components vs. page wiring).
- TASK_04 sequential after TASK_03 recombines.
- TASK_05 sequential after TASK_04.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey | Subagent definition writing is a one-shot Petey job. |
| TASK_02 | Desi | UX + design-consistency review is exactly her scope. |
| TASK_03a | Cody (general-purpose subagent A) | Pure component refactor on a disjoint file set; ideal parallel lane. |
| TASK_03b | Cody (general-purpose subagent B) | Page-level wiring against the tightened cards; disjoint from TASK_03a. |
| TASK_04 | Doug | Lifecycle + release-readiness verification with type/test/lint/smoke. |
| TASK_05 | Petey + Giddy | Full close with git hygiene + project-log + wiki + ADR/component sweep. |

### Open decisions

- **Courses filter axes** (level / length / status / price / discipline-sort) deferred to a follow-up session. Today the page gets card+grid+skeleton parity only; no Prisma/server-query change.
- **Discipline filter axes** deferred behind a Desi-driven "what's worth filtering" discovery for a future session.
- **Shared card primitive (`ListingCard`):** if Cody surfaces extraction value during TASK_03a, it lands in `Open decisions / blockers` for next session — do not extract inline.
- **PR title format:** `feat(listings): bring techniques/schools/disciplines/courses to tool-listing parity` unless owner prefers otherwise.
- **No-out-of-bounds caveat:** owner has granted latitude; agents may surface adjacent fixes but must flag them in chat before extending scope mid-task.

### Risks

- **Parallel-subagent merge risk on shared files:** if either Cody subagent ends up needing a card edit while the other is rewriting the same card, the parallel branch breaks. Mitigation: TASK_03a owns `apps/web/components/web/{courses,disciplines,schools,techniques}/*-card.tsx` exclusively; TASK_03b owns `apps/web/app/(web)/{courses,disciplines,schools,techniques}/page.tsx` plus per-page `_components/*list*` files. No overlap.
- **Brand-parity regression:** four brands could diverge on the four pages. Doug smoke must verify at least Baseline (primary launch brand); per-brand drift if surfaced goes to `Open decisions / blockers`.
- **Lineage v1 next-session pivot:** SESSION_0195's `Next session` block named lineage v1 as the next surface. Owner has redirected to listings parity for this session. Lineage v1 picks back up in SESSION_0197 unless extended.

### Scope guard

Per `petey-plan.md` rule 5: adjacent tech debt or ideas surfaced during execution go into this SESSION file's `Open decisions / blockers`, not inline fixes. "Nothing out of bounds" is owner latitude, not a license to scope-balloon mid-task.

### Dirstarter implementation template

- **Docs read first:** Dirstarter component inventory (`docs/knowledge/wiki/dirstarter-component-inventory.md`) implicitly through `ToolCard`/`ToolListing` reference reads. Direct Dirstarter URLs not opened this session — pattern is already proven via the local tools surface, which already uses Dirstarter L1 primitives.
- **Baseline pattern to extend:** `apps/web/components/web/tools/tool-listing.tsx`, `tool-card.tsx`, `tool-list.tsx`, `tool-search.tsx` + `apps/web/contexts/filter-context.tsx::FiltersProvider`.
- **Custom delta:** four Ronin-native domain card components tightened to the `ToolCard` visual contract; page-level wiring scoped per-domain.
- **No-bypass proof:** this work strengthens the use of existing Dirstarter primitives (Card, H4, Link, Badge, ShowMore, Favicon) across four more surfaces rather than introducing a competing shape.

## Status

in-progress

## Task Log

| Task ID | Status |
| --- | --- |
| SESSION_0196_TASK_01 | complete |
| SESSION_0196_TASK_02 | complete |
| SESSION_0196_TASK_03a | pending |
| SESSION_0196_TASK_03b | pending |
| SESSION_0196_TASK_04 | pending |
| SESSION_0196_TASK_05 | pending |

## TASK_01 — Desi promotion proof

- `.claude/agents/desi.md` written (Claude Code subagent definition; tools: Read, Bash, Glob, Grep, WebFetch; persona body mirrors `docs/agents/desi.md` operating rules + 9-section output contract).
- **In-session caveat:** `.claude/agents/` is loaded at session start; the `Desi` subagent type is not natively invocable mid-session. For TASK_02 today, Desi was spawned as a `general-purpose` subagent with the full persona prompt embedded inline; from SESSION_0197 onward the agent type loads natively.

## Review pass 1 — Desi

### Desi — Public listing surfaces (techniques, schools, disciplines, courses) baseline review

#### Section 1 — High-Level UX/UI Summary

Techniques + schools are 80–85% to ToolListing parity — `FiltersProvider` + `Search` + `Pagination` + `Skeleton` shell is in place, cards already use `Card isRevealed` + `CardHeader wrap={false}` + truncated H4 link, and disabled-input skeleton states match. Gaps are surgical: no hover-reveal description overlay, no `ShowMore` for chip groups, missing leading visual, and inline English strings where `useTranslations` would buy brand neutrality. Disciplines and courses are further out of parity — disciplines wraps a `<Card>` in a `<Link>` instead of using the absolute-inset overlay pattern; courses has no listing/search shell at all (raw server fetch in `page.tsx`, no Suspense, no Pagination). Headline: bring techniques + schools to ToolCard's hover-reveal + ShowMore contract; bring disciplines + courses to grid/skeleton parity without filter axes.

#### Section 2 — UI Hierarchy & Clarity Issues

- `apps/web/components/web/techniques/technique-card.tsx:18-53` — no hover-reveal description overlay · loses the ToolCard signal that "more detail is here without clicking" · wrap badge stack in the `relative size-full flex flex-col` + `group-hover:opacity-0` / `absolute inset-0 opacity-0 group-hover:opacity-100` pattern from `tool-card.tsx:35-54`.
- `apps/web/components/web/techniques/technique-card.tsx:42-50` — three raw badges in a `flex-wrap Stack` · overflows on dense category+position+discipline combos and breaks card height alignment · use `ShowMore` with `limit={2}` + `size="xs"` + `showMoreType="text"` per `tool-card.tsx:39-46`.
- `apps/web/components/web/schools/school-card.tsx:42-66` — same hover-reveal gap + raw disciplines wrap · same fix; collapse `city, region` into hover overlay or single chip.
- `apps/web/app/(web)/disciplines/_components/discipline-card.tsx:26-65` — `<Link>` wraps `<Card>` and `Card` has no `isRevealed`; manual `hover:border-foreground/20` reinvents `Card isRevealed` · breaks focus-ring + keyboard a11y vs ToolCard contract · flip to `Card isRevealed` with `CardHeader wrap={false}`, `H4 as="h3" className="truncate"` containing `<Link>` + `<span className="absolute inset-0 z-10" />`, then put the three-stat row inside the hover-reveal layer.
- `apps/web/app/(web)/disciplines/_components/discipline-card.tsx:39-54` — three-stat row uses literal `·` separators and English pluralization · won't localize · convert to `ShowMore` of outline badges using `useTranslations` count helpers.
- `apps/web/components/web/courses/course-card.tsx:37-45` — four badges always rendered with no `ShowMore` and no hover-reveal · degrades worst on long course titles + small viewports · wrap in `relative size-full flex flex-col` + `group-hover:opacity-0` and move enrollment+item counts behind the hover overlay; keep discipline+rank chips with `ShowMore limit={2}`.
- `apps/web/app/(web)/courses/page.tsx:17-37` — no `Suspense`, no listing skeleton, server fetch directly inside the page · layout shift on slow brands · introduce `CourseListing` + `CourseListingSkeleton` + `CourseQuery` mirroring the technique trio, wrapped in `Suspense` (no filter axes per scope).
- `apps/web/app/(web)/courses/page.tsx:13` — bespoke `{ q, discipline, page }` searchParams shape sidesteps nuqs/`FiltersProvider` · diverges from every other listing surface · adopt a `courseFilterParamsCache` + `FiltersProvider` shell even if only `q` + pagination are wired this session.

#### Section 3 — UX Flow & Friction Points

- Discovery friction is asymmetric: techniques + schools have search/sort/pagination, courses has none, disciplines has none. Add a placeholder-only `<Filters>` shell on courses (search input + sort) — disciplines stays a flat grid by scope.
- Empty-state copy varies: `technique-list.tsx:23` "No techniques found", `school-list.tsx:29` "No schools found", `course-list.tsx:18` "No courses found.", `discipline-list.tsx:13` styled paragraph. Standardize on `EmptyList` and route through `useTranslations`.
- `Card isRevealed` makes the entire card clickable on the three converted surfaces — but disciplines today wraps a nested `<Link>` around a `<Card>`, generating a no-underline anchor with no `H4`-level landmark. Fix per Section 2.

#### Section 4 — Design System Consistency Report

- Use `~/components/common/show-more::ShowMore`, not bare `Stack size="sm" flex-wrap` — every domain card reinvents chip overflow (`technique-card.tsx:42`, `school-card.tsx:57`, `course-card.tsx:37`, `discipline-card.tsx:39`).
- Use `~/components/web/ui/grid::Grid`, not raw `<div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">` — disciplines duplicates Grid's breakpoints in two places (`discipline-list.tsx:17`, `discipline-list-skeleton.tsx:6`).
- Use `~/components/web/empty-list::EmptyList`, not `<p className="text-muted-foreground text-center py-12">` — `discipline-list.tsx:13` is the lone reinvention.
- Use `~/components/common/card::Card isRevealed`, not `<Link className="no-underline"><Card hover>` — disciplines (`discipline-card.tsx:26-27`).
- ToolCard leads with `Favicon` (`tool-card.tsx:23`). None of these four surfaces has a logo/avatar field on payload; flag-only LOW.

#### Section 5 — Component Reuse & Missed Opportunities

- `TechniqueCardSkeleton`, `SchoolCardSkeleton`, `CourseCardSkeleton`, `ToolCardSkeleton` are 95% identical — fine to keep colocated per the no-shared-ListingCard guardrail.
- `DisciplineListSkeleton` (`discipline-list-skeleton.tsx:4-20`) ships a hand-rolled card instead of importing a `DisciplineCardSkeleton` from `discipline-card.tsx`. Add `DisciplineCardSkeleton` next to the card and use it.
- `course-list.tsx` has no `course-listing.tsx` / `course-search.tsx` / `course-query.tsx`. Mirror the technique trio (without filter UI — placeholder search + pagination only).
- `discipline-card.tsx` lives at `app/(web)/disciplines/_components/` while every other domain card lives at `components/web/<domain>/<domain>-card.tsx`. Move flagged (LOW) for follow-up.

#### Section 6 — Registration / Onboarding Review

Not applicable — public read-only listing surfaces, no registration paths.

#### Section 7 — Delight & Micro-UX Suggestions

- Hover-reveal description is the single biggest "feel" upgrade — the `duration-200 group-hover:opacity-0` / `group-hover:opacity-100` crossfade. Get this onto all four cards.
- `technique-card.tsx:44,47` and `school-card.tsx:37` use `.replace(/_/g, " ")` inline — fine, but consider a shared `humanizeEnum` helper. Defer.
- `discipline-card.tsx:56-58` "Instructor: Sensei" reads like a debug label. Either drop it or render as a muted caption with the value bold.

#### Section 8 — Simplification Opportunities (KISS / DRY / YAGNI)

- Drop the hand-rolled grid + skeleton in `discipline-list*.tsx` — `Grid` + a real `DisciplineCardSkeleton` is fewer lines and consistent.
- Defer filter axes for disciplines + courses this session (per scope guardrail). The FiltersProvider on courses should land empty.
- Don't introduce a shared `ListingCard` primitive — chip slots diverge too much; tighten in place per the guardrail.

#### Section 9 — Prioritized Recommendations (High → Low)

- **HIGH** — `apps/web/app/(web)/disciplines/_components/discipline-card.tsx:26-65` — Flip to `Card isRevealed` + `CardHeader wrap={false}` + truncated H4 with absolute-inset Link; remove outer `<Link>` wrap for a11y.
- **HIGH** — `apps/web/app/(web)/courses/page.tsx:17-37` — Wrap in `Suspense` + introduce `CourseListing` + `CourseListingSkeleton` + `CourseQuery` mirroring the technique trio (filter axes deferred — search placeholder + sort + pagination only).
- **HIGH** — `apps/web/components/web/techniques/technique-card.tsx:34-52` and `apps/web/components/web/schools/school-card.tsx:42-66` — Add the hover-reveal description overlay per `tool-card.tsx:35-54`.
- **HIGH** — `apps/web/components/web/courses/course-card.tsx:32-46` — Same hover-reveal pattern; move enrollment + item counts behind the overlay.
- **MEDIUM** — `apps/web/components/web/techniques/technique-card.tsx:42-50`, `apps/web/components/web/schools/school-card.tsx:57-64`, `apps/web/components/web/courses/course-card.tsx:37-45` — Replace `Stack flex-wrap` chip rows with `ShowMore limit={2} size="xs" showMoreType="text"`.
- **MEDIUM** — `apps/web/app/(web)/disciplines/_components/discipline-list-skeleton.tsx:4-20` — Replace hand-rolled card markup with a new `DisciplineCardSkeleton` exported from the card file, used inside `Grid`.
- **MEDIUM** — `apps/web/app/(web)/disciplines/_components/discipline-list.tsx:13,17` — Use `EmptyList` and the shared `Grid` primitive.
- **MEDIUM** — `technique-list.tsx:23`, `school-list.tsx:29`, `course-list.tsx:18` — Route empty-state copy through `useTranslations`.
- **LOW** — `technique-search.tsx:19-22`, `school-search.tsx:18-21` — Inline English sort labels; pass through `useTranslations`.
- **LOW** — All four cards lack a leading visual (Favicon equivalent). Server payloads carry no logoUrl/avatar today — flag for follow-up domain-avatar / payload work.
- **LOW** — `discipline-card.tsx` location move from `_components/` to `apps/web/components/web/disciplines/discipline-card.tsx` — defer.
- **LOW** — `discipline-card.tsx:56-58` — Reword or drop the "Instructor: …" caption.

**Handoff:** Cody owns all HIGH items and MEDIUM items 1–3 (chip overflow + skeleton + grid/empty). MEDIUM 4 (translations) lands in the same pass if cheap. LOW items defer to a follow-up session and pair with Petey on the domain-avatar / payload question.

## Next session

(filled at close)
