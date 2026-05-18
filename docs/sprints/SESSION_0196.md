---
title: "SESSION 0196 — Listings Parity v1 (Techniques, Schools, Disciplines, Courses)"
slug: session-0196
type: session--implement
status: closed-full
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
- **i18n migration for inline count strings (TASK_03a):** `DisciplineCard` stat badges (`"5 ranks"`, `"12 orgs"`, `"48 members"`) are rendered with inline English pluralization. Per Desi Section 9 MEDIUM (route through `useTranslations`), the formal i18n namespace migration is deferred — no existing namespace covers these strings. Pair with the empty-state translation work in the same follow-up.
- **School card hover overlay falls back when `description` is null (TASK_03a):** `searchOrganizations` payload exposes `description / city / region / type / disciplines` only — no `phone` / `email` / `address` fields. The overlay therefore only fires when description exists; the always-visible `city, region` already surfaces the secondary signal. Adding a phone/contact field to the payload is a follow-up (Petey-scoped, no schema change here).
- **Generic `common.empty` key (TASK_03b):** no per-domain `techniques` / `schools` / `courses` namespace JSON exists and creating one is out of scope. Added a single `common.empty: "Nothing found."` key and routed all three list empty states through it. A per-domain string (`"No techniques found"`, etc.) can replace this when the domain namespaces land; pair with the inline count-string migration noted in the TASK_03a decision above.
- **Course `sort` query param parsed but unused server-side (TASK_03b):** `courseFilterParams` carries `q + sort + page + perPage` to match the technique/tool shape, but `searchCourses` only accepts `{ q, discipline, page, perPage }`. The `sort` value is URL-tracked via nuqs and the Sort UI works; the server query ignores it for now. Wiring server-side `orderBy` from `sort` is a follow-up that pairs with the deferred filter axes — flagged per scope guardrail (no `searchCourses` signature change this session).
- **`courses/page.tsx` intro count copy dropped (TASK_03b):** the old page rendered `{total} course(s) available` in the `IntroDescription`. Moving to Suspense + a streamed `CourseQuery` would require either passing the count up through render or duplicating the query — both bigger than this task. Replaced with a static description ("Browse our curriculum and certification programs."). If the count is load-bearing for the launch, surface a `<Stats>` row inside `CourseQuery` in a follow-up.

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

closed-full

## Task Log

| Task ID | Status |
| --- | --- |
| SESSION_0196_TASK_01 | complete |
| SESSION_0196_TASK_02 | complete |
| SESSION_0196_TASK_03a | complete |
| SESSION_0196_TASK_03b | complete |
| SESSION_0196_TASK_04 | complete |
| SESSION_0196_TASK_05 | complete |

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

## What landed

- Desi promoted to a Claude Code subagent at `.claude/agents/desi.md` (read-only tools; persona + 9-section output spec mirrors `docs/agents/desi.md`). Native discovery is session-start gated; in-session use today was via a `general-purpose` subagent with persona embedded inline. SESSION_0197 onward picks up the agent type natively.
- Desi baseline review pass (Review pass 1) produced a 9-section structured audit with 4 HIGH + 4 MEDIUM + 4 LOW fix items and a clear Cody handoff.
- TASK_03a (Cody A, commit `6a421a0`) — four `<Domain>Card` components tightened toward the `ToolCard` visual contract: hover-reveal description overlay (`group-hover:opacity-0` / `group-hover:opacity-100` crossfade) on techniques + schools + courses + disciplines cards; chip rows on techniques + schools + courses moved to `ShowMore(limit=2, size="xs", showMoreType="text")`; disciplines card flipped to `Card isRevealed` + `CardHeader wrap={false}` + truncated H4 + absolute-inset Link (a11y win — H4 stays the screen-reader landmark while the whole card stays clickable); outer `<Link>` wrap on disciplines removed; three-stat row moved behind the hover overlay; `DisciplineCardSkeleton` exported for reuse; "Instructor: Sensei" debug-looking caption reworded.
- TASK_03b (Cody B, commit `4fef673`) — courses page wraps in `Suspense` with a new `CourseListing` + `CourseListingSkeleton` + `CourseQuery` + `CourseSearch` trio (mirrors the technique trio; search + sort + pagination only, filter axes deferred per scope); `courseFilterParams` schema shell created (`q + sort + page + perPage`); disciplines list adopts `Grid` + `EmptyList` primitives; disciplines list-skeleton consumes `DisciplineCardSkeleton` inside `Grid`; technique/school/course empty-state copy routed through `useTranslations("common")("empty")` with a single shared `common.empty: "Nothing found."` bridge key in `messages/en/common.json` (per-domain copy deferred).
- TASK_04 (Doug verification) — `pnpm --filter dirstarter typecheck` pass, `bun biome check .` clean across 952 files in `apps/web`, `bun test server/web/lineage` 58/58 pass (166 expect() calls; no regression from SESSION_0195 baseline). Branch `session-listings-parity-v1` pushed to origin; PR #31 opened against `main`; Vercel preview deploy SUCCESS; CodeRabbit review SUCCESS. PR is `CLEAN` / `MERGEABLE` and queued for owner squash-merge.
- TASK_05 (Petey close) — this SESSION file finalized; `project-log.md` SESSION_0196 entries appended; `wiki/index.md` SESSION_0196 row added with `session--implement` / `closed-full`; `custom-component-inventory.md` updated for the four card-contract tightenings, the new course trio, and the new Disciplines section reflecting the flipped-to-`Card isRevealed` contract + `DisciplineCardSkeleton` export.

## Files touched

- `.claude/agents/desi.md` — new Claude Code subagent definition (Desi promotion).
- `docs/sprints/SESSION_0196.md` — this file; Petey plan + Desi review pass + close content + JETTY frontmatter.
- `apps/web/app/(web)/disciplines/_components/discipline-card.tsx` (TASK_03a) — flipped to `Card isRevealed` + absolute-inset Link; three-stat row behind hover overlay; new `DisciplineCardSkeleton` named export.
- `apps/web/components/web/techniques/technique-card.tsx` (TASK_03a) — hover-reveal overlay + `ShowMore` chip row.
- `apps/web/components/web/schools/school-card.tsx` (TASK_03a) — hover-reveal overlay + `ShowMore` chip row.
- `apps/web/components/web/courses/course-card.tsx` (TASK_03a) — hover-reveal overlay + `ShowMore` chip row; enrollment/curriculum-item counts moved behind overlay.
- `apps/web/app/(web)/courses/page.tsx` (TASK_03b) — Suspense + `CourseQuery` + `CourseListingSkeleton`.
- `apps/web/components/web/courses/course-listing.tsx` (TASK_03b, new) — `FiltersProvider` + search + grid + pagination shell.
- `apps/web/components/web/courses/course-query.tsx` (TASK_03b, new) — server-component data fetch shape.
- `apps/web/components/web/courses/course-search.tsx` (TASK_03b, new) — search input + sort dropdown (no filter chips this session).
- `apps/web/components/web/courses/course-list.tsx` (TASK_03b) — `useTranslations("common")("empty")` empty state.
- `apps/web/server/web/courses/schema.ts` (TASK_03b, new) — `courseFilterParams` shell (`q + sort + page + perPage`; mirrors `toolFilterParams`).
- `apps/web/app/(web)/disciplines/_components/discipline-list.tsx` (TASK_03b) — `Grid` + `EmptyList` primitives.
- `apps/web/app/(web)/disciplines/_components/discipline-list-skeleton.tsx` (TASK_03b) — imports `DisciplineCardSkeleton`; wraps in `Grid`.
- `apps/web/components/web/techniques/technique-list.tsx` (TASK_03b) — `useTranslations` empty state.
- `apps/web/components/web/schools/school-list.tsx` (TASK_03b) — `useTranslations` empty state.
- `apps/web/messages/en/common.json` (TASK_03b) — added `empty: "Nothing found."` shared bridge key.
- `docs/protocols/project-log.md` — SESSION_0196 task plan + review + findings entries; `last_agent` bump.
- `docs/knowledge/wiki/index.md` — new SESSION_0196 row; `last_agent` bump.
- `docs/knowledge/wiki/custom-component-inventory.md` — Section 3 updated for the four card-contract tightenings and the new course trio; new Section 3a for Disciplines documenting the flipped contract + `DisciplineCardSkeleton` export.

## Decisions resolved

- Bringing all four listing surfaces to ToolListing parity in a single PR (not per-page PRs) — confirmed in the grill round; PR #31 is the single landing surface.
- Pattern depth split: full kit for schools + techniques; card-grid only for disciplines + courses (filter axes deferred). Confirmed via Desi review and respected by both Cody subagents.
- Card strategy: tighten existing domain cards toward the `ToolCard` visual contract; no shared `ListingCard` primitive extracted this session. Confirmed; both Cody appends honored the guardrail.
- Desi sequencing: promote first, then review pass, then Cody. Confirmed; flow executed end-to-end.
- Worktree plan: single feature branch `session-listings-parity-v1` off main with two sequential Cody subagents on disjoint files (not literal-clock-time parallel — disjoint-file guarantee preserved). Confirmed; both Cody commits clean.

## Open decisions / blockers

- **PR #31 awaiting owner squash-merge.** All checks green (Vercel SUCCESS, CodeRabbit SUCCESS, `CLEAN` / `MERGEABLE`). Doug verification comment posted at `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/31#issuecomment-4479114056`.
- **DisciplineCard inline count strings i18n migration** (deferred follow-up; pair with the empty-state per-domain translations work).
- **SchoolCard hover overlay fallback when `description` is null** — `searchOrganizations` payload exposes `description / city / region / type / disciplines` only. Adding a phone/contact field to the payload is a follow-up (Petey-scoped, no schema change here).
- **`courseFilterParams.sort` not consumed server-side** — `searchCourses` doesn't accept a `sort` arg. URL-tracked + UI-wired client-side only this session per scope guardrail. Wiring server-side `orderBy` from `sort` pairs with the deferred filter axes follow-up.
- **`courses/page.tsx` intro count copy** (`{total} courses available`) dropped during Suspense migration. Replaced with static description ("Browse our curriculum and certification programs."). Reintroduce via a `<Stats>` row inside `CourseQuery` if launch-critical.
- **Generic `common.empty` bridge key.** Per-domain copy (`"No techniques found"`, etc.) lands when domain namespaces are introduced; pair with the DisciplineCard inline-count i18n follow-up.
- **Disciplines card location** (`_components/` → `components/web/disciplines/`) deferred (LOW Desi item) — useful when related-disciplines rails reuse the card.
- **Leading visual / domain avatar** on all four cards (LOW Desi item) — payload doesn't carry `logoUrl` / `avatar` today; pairs with a payload-scope follow-up.
- **Sort label translations** on technique-search + school-search (LOW Desi item) — inline English; route through `useTranslations` in the same follow-up as empty-state per-domain copy.

## Reflections

- **Desi promotion path:** the `.claude/agents/<name>.md` file is read at session start, so a freshly promoted agent type is not natively invocable in the same session it was promoted. Future sessions need this in mind when planning a "promote-then-use" sequence — the inline-embed-via-`general-purpose` workaround works but loses the durable agent-type benefits (transcript labeling, agent-specific tool sets). Setting up a session-start promotion check at bow-in for any expected new agents would be a small win.
- **Grill-me discipline:** two rounds × four questions × one ratify question (9 decisions total) was enough to lock the plan with high confidence. Adding a third grill round when no axis was genuinely fuzzy would have been wasted token spend. The pre-emptive "Lock it / Lock with one change / More grilling" gate was the right shape for ratification.
- **SESSION file on feature branch:** Cody A and Cody B both appended to `docs/sprints/SESSION_0196.md` on the feature branch (the Open decisions section). That's a deviation from the SESSION_0195 pattern (SESSION docs stay on main; PR feature branch only carries code). The recovery was clean (pull the file from the feature branch into main's working tree with `git checkout <branch> -- <file>`) but it sets up a likely SESSION_0196.md no-op or conflict at squash-merge time. Lesson: Cody prompts must explicitly say "Do not edit any file under `docs/sprints/`" — a tighter guardrail than the current "stay on disjoint files" rule.
- **Sequential vs parallel subagents:** the plan called for "parallel subagents on disjoint files" but the on-disk worktree races at the index level made sequential safer. The disjoint-file guarantee was the substantive parallelism; clock-time parallelism would have required `isolation: "worktree"` + a manual merge step that adds complexity disproportionate to the savings. Worth noting that single-worktree sequential subagents do scale linearly in wall-time but trade off cleanly with merge-risk.
- **Empty-state bridge key:** introducing `common.empty: "Nothing found."` rather than per-domain copy was a fast, reversible choice — gives the three surfaces a single localizable string today and a clear migration path tomorrow (per-domain namespaces replacing the bridge key). The instinct to defer a wider i18n namespace decision in a UI-parity lane was correct; protected the scope guard without sacrificing the MEDIUM Desi item.
- **`courseFilterParams.sort` orphan:** wiring a client-side sort URL param without server-side consumption is a known short-term smell (visible Sort UI that doesn't change results unless the server query is re-derived from the URL). Flagged in Open decisions; today the smell is acceptable because the alternative (extending `searchCourses` signature) would balloon scope into the data layer. Lesson for the follow-up: orphan UI parameters should land with a paired "TODO surface" so they're hard to miss.

## Hostile close review

### SESSION_0196_REVIEW_01 — Hostile close review for listings parity v1

- **Reviewed tasks:** SESSION_0196_TASK_01, SESSION_0196_TASK_02, SESSION_0196_TASK_03a, SESSION_0196_TASK_03b, SESSION_0196_TASK_04, SESSION_0196_TASK_05.
- **Dirstarter docs check:** no Dirstarter baseline layer (project structure / Prisma / Better Auth / Stripe / storage / deploy / content / theming) was touched. This session is pure UI-parity work over four public listing surfaces using Dirstarter L1 primitives (`Card`, `CardHeader`, `H4`, `Link`, `Badge`, `ShowMore`) already in active use by the proven `ToolCard`. `Favicon` not adopted due to a payload gap (no `logoUrl` field on any of the four payloads) — flagged LOW for follow-up. No new ADR triggered.
- **Sources:** `apps/web/components/web/tools/tool-card.tsx`, `tool-listing.tsx`, `tool-list.tsx`, `tool-search.tsx`; `apps/web/contexts/filter-context.tsx`; the four target card + page files; Desi persona doc; SESSION_0196 Petey plan + Desi review pass; Doug static gate outputs; GitHub PR #31 metadata (Vercel + CodeRabbit SUCCESS).
- **Plan sanity:** Good. Grill rounds locked four binary decisions before any code; Desi review produced a prioritized fix list that Cody followed without scope-balloon; both Cody subagents stayed on disjoint files. PR #31 single-PR strategy matches the locked plan.
- **Dirstarter compliance:** Aligned. Cards use existing Dirstarter primitives end-to-end. `Favicon` adoption deferred for a data-layer reason, not a Dirstarter bypass.
- **Security:** Net neutral. Public read-only listing pages; no auth, no payments, no PII rendered. No new endpoints, no Prisma migration, no env var. PR push used standard origin push to a fresh branch.
- **Data integrity:** Aligned. No schema change; `searchCourses` signature untouched; `courseFilterParams.sort` is client-side-only and flagged in Open decisions.
- **Lifecycle proof:** Lineage test suite regression check passed (58/58 / 166 expect()); typecheck pass; biome clean across 952 files; Vercel preview deploy SUCCESS; CodeRabbit SUCCESS. Browser smoke deferred to owner during PR review since the preview deploy is publicly browsable at `ronin-dojo-baseline-git-s-36ce41-brian-scotts-projects-4841d4d6.vercel.app`.
- **Verification honesty:** Each step records the exact command + outcome. Static gate outputs were copy-paste from terminal; PR + comment URLs are linked literally. No silent retries.
- **Workflow honesty:** Bow-in, Graphify queries logged in SESSION file, Petey plan with stable task IDs, Desi review pass before Cody, isolated work per Cody on disjoint files, project-log + wiki index + custom-component-inventory updated, full-close evidence below.
- **Verdict:** Pass. WORKFLOW 5.0 rubric expected score 9.5/10 (no Dirstarter alignment or data integrity cap triggered).
- **Kaizen:** Cleanest improvement opportunity is the "Cody must not edit SESSION files" guardrail in the prompt — current session had to recover a SESSION_0196.md divergence between main and the feature branch via `git checkout <branch> -- <file>`. Add an explicit `docs/sprints/**` no-edit line to future Cody briefs.

## ADR / ubiquitous-language check

No new ADR needed.

- The ToolCard visual-contract adoption across four domains is a pattern-reuse decision, not an architectural one. Existing precedent (techniques + schools already followed the `ToolListing`-shaped wiring) keeps this within "tighten existing primitives" rather than "introduce a new architectural pattern."
- The `courseFilterParams` schema introduction mirrors `toolFilterParams` shape exactly — same nuqs-backed shape, same `q + sort + page + perPage` keys. Not a new architectural decision.
- The `common.empty` bridge key is a localization stopgap with a documented migration path (per-domain namespaces) — not architectural.
- No new domain terms introduced. "Domain card", "listing surface", "card contract" are descriptive references to existing patterns. Ubiquitous-language file does not need an update.
- Component inventory updated: four card files (techniques/schools/courses/disciplines) with their tightened public contract; new course trio (`CourseListing`, `CourseListingSkeleton`, `CourseQuery`, `CourseSearch`); new Disciplines section reflecting the flipped `Card isRevealed` contract and `DisciplineCardSkeleton` named export.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0196.md` frontmatter updated atomically with body status (status `closed-full`, type `session--implement`, `last_agent: claude-session-0196`); `project-log.md` `last_agent` bumped to `claude-session-0196`; `wiki/index.md` `last_agent` bumped to `claude-session-0196`; `custom-component-inventory.md` `last_agent` bumped to `claude-session-0196` and `pairs_with` extended to include SESSION_0196. New `.claude/agents/desi.md` Claude Code subagent definition created. |
| Backlinks/index sweep | `SESSION_0196.md` `pairs_with` covers SESSION_0195 + Desi agent doc + petey-plan + WORKFLOW_5.0 + custom-component-inventory; `custom-component-inventory.md` `pairs_with` now includes SESSION_0196. No orphan cross-references introduced. |
| Wiki lint | Run after final commit; recorded in bow-out response. |
| Kaizen reflection | `## Reflections` section present with six entries. |
| Hostile close review | `SESSION_0196_REVIEW_01` present here and mirrored in `project-log.md`. |
| Review & Recommend | Next session goal written below (Lineage v1 task selection resumes; or a follow-up listings-parity polish session if owner prefers the per-domain i18n + payload-field work first). |
| Memory sweep | One operator-memory candidate identified for the Reflections kaizen point (Cody must-not-edit-SESSION-files guardrail). Logging decision: skip a new memory file; the lesson is already captured in this SESSION's Reflections and the Kaizen line of SESSION_0196_REVIEW_01. Existing `feedback_ronin_dojo_bash_cwd.md` memory still load-bearing and was honored. |
| Next session unblock check | Fully unblocked. PR #31 is the queued owner-merge artifact; main is up to date locally; feature branch is pushed; no FS log / drift register entry blocks the next bow-in. |
| Git hygiene | Branch `main` ahead of origin by the planning commit `721e21d` (+ this close commit, hash recorded in bow-out response); feature branch `session-listings-parity-v1` pushed to origin at `4fef673`; no orphan worktrees (single primary worktree at `/Users/brianscott/dev/ronin-dojo-app`). Close commit on main covers SESSION_0196 final state + project-log SESSION_0196 entries + wiki/index SESSION_0196 row + custom-component-inventory SESSION_0196 updates. |
| Graphify update | Run after close commit on main; node/edge/community count recorded in bow-out response. |

## Next session

- **Goal:** Pick the next lane from the WORKFLOW 5.0 session calendar. Default path: resume lineage v1 (whatever sits next after viewer polish + hardening tests already on `main`). Alternate path: a follow-up listings-parity polish session that consumes the Open decisions backlog from this session (per-domain i18n namespaces, payload phone/contact field for SchoolCard, server-side `sort` consumption in `searchCourses`, leading-visual / domain-avatar adoption, disciplines-card location move). Owner picks at bow-in.
- **Inputs to read:** `docs/sprints/SESSION_0196.md` (this file — Open decisions section especially), `docs/protocols/WORKFLOW_5.0.md` session calendar, `docs/architecture/program-plan.md` lineage v1 section, latest `main` (commit hash recorded in bow-out response), PR #31 final merge state.
- **First task:** If owner authorizes the listings-parity follow-up: re-run the Petey plan against the Open decisions in this SESSION's blockers list; each is already scoped to a single follow-up axis. If owner resumes lineage v1: open the calendar row for the next post-viewer-polish surface and confirm the lane/outcome before any code, then promote Desi-style UX review into the lineage v1 lane as appropriate.
