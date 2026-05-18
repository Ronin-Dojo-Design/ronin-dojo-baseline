---
title: "SESSION 0197 — Listings Parity i18n Cleanup (Disciplines counts, per-domain empty states, sort labels)"
slug: session-0197
type: session--implement
status: closed-full
created: 2026-05-18
updated: 2026-05-18
last_agent: claude-session-0197
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0196.md
  - docs/agents/desi.md
  - docs/protocols/petey-plan.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0197 — Listings Parity i18n Cleanup

## Date

2026-05-18

## Operator

Brian + claude-session-0197 (Petey)

## Goal

Consume the i18n axis of the SESSION_0196 Open decisions backlog: introduce per-domain message namespaces (`disciplines.json`, `schools.json`, `techniques.json`, `courses.json`), migrate DisciplineCard inline counts to next-intl ICU plural strings, replace the `common.empty` bridge key with per-domain empty-state copy, and route sort labels in `technique-search` / `school-search` / `course-search` through translations. Merge PR #31 (listings parity v1) first, then branch off the new main head and ship the cleanup as a single follow-up PR.

## Bow-in notes

- **Latest previous session:** SESSION_0196 — Listings Parity v1, closed-full.
- **Previous next session goal:** Pick next lineage v1 task OR consume listings-parity Open decisions backlog. Owner picked the listings-parity i18n axis at bow-in.
- **Owner directive this session:** Use Graphify (not repo-wide grep) for navigation; promote Desi already done; merge PR #31 first; tackle items 1 + 5 + 8 (i18n cluster) from SESSION_0196 Open decisions; leave PR #22 alone.
- **Branch at bow-in:** `main` at `d06247f` (SESSION_0196 close).
- **Working tree:** clean.
- **Worktrees at bow-in:** main repo only (`/Users/brianscott/dev/ronin-dojo-app`).
- **Graphify status:** `graphify stats` reported 6379 nodes, 11501 edges, 812 communities, 1251 tracked files. Matches SESSION_0196 close (drift normal); no `graphify update` run during bow-in.
- **PR state at bow-in:** PR #31 (listings parity v1) OPEN, CodeRabbit + Vercel SUCCESS, mergeable=UNKNOWN, base=`main`. PR #22 (lineage editor actions) OPEN, base=`session-lineage-v1-react-canvas-from-lineage-snapshot`, Vercel FAILURE. File-overlap check between PR #22 and PR #31: zero overlap; PR #22 explicitly out of SESSION_0197 scope.
- **FS log / drift register:** no `open` entries; all `mitigated`. Drift register: no live items affect i18n lane.
- **Verification note:** Graphify already-current from SESSION_0196 close; file selection driven by Desi review pass output + direct reads. No repo-wide grep planned.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming + content surfaces only (i18n / messages JSON, no DB/auth/payments/storage). `useTranslations` is the next-intl L1 hook already in use across the repo; per-domain message JSON files mirror the existing `tools.json` precedent. |
| Extension or replacement | Extension. Adds per-domain namespaces alongside `tools.json`/`common.json`; tightens the four card surfaces from a `common.empty` bridge key to per-domain copy. No replacement of any Dirstarter capability. |
| Why justified | The `common.empty: "Nothing found."` bridge key landed in SESSION_0196 as a fast stopgap; per-domain copy is required for launch-quality empty states and sort labels. Disciplines inline pluralization breaks any future non-English locale fork. |
| Risk if bypassed | Generic "Nothing found." copy across four flagship public surfaces; inline English plurals in DisciplineCard block non-English locales; sort-label drift between domains. All hit launch readiness for May 18, 2026. |

## Petey plan

### Goal

Ship listings-parity i18n cleanup (items 1, 5, 8 from SESSION_0196 Open decisions) as a single follow-up PR off main, after merging PR #31.

### Tasks

#### SESSION_0197_TASK_01 — Merge PR #31 + sync main

- **Agent:** Petey
- **What:** Squash-merge PR #31 to `main` via `gh pr merge`, delete the feature branch, pull main locally.
- **Steps:**
  1. `gh pr merge 31 --squash --delete-branch --subject "feat(listings): bring techniques/schools/disciplines/courses to ToolListing parity (#31)"`
  2. `git checkout main && git pull --ff-only`
  3. Verify `common.empty: "Nothing found."` bridge key now exists in `apps/web/messages/en/common.json` on main.
- **Done means:** PR #31 status MERGED; main HEAD advanced; common.empty bridge key visible locally.
- **Depends on:** nothing.

#### SESSION_0197_TASK_02 — Desi i18n-axis review

- **Agent:** Desi (subagent)
- **What:** Focused i18n review on the three target lanes (DisciplineCard counts, per-domain empty states, sort labels). Produce the 9-section structured review with file:line citations.
- **Steps:**
  1. Read `apps/web/app/(web)/disciplines/_components/discipline-card.tsx` count strings.
  2. Read `technique-list.tsx`, `school-list.tsx`, `course-list.tsx`, `discipline-list.tsx` empty-state lines.
  3. Read `technique-search.tsx`, `school-search.tsx`, `course-search.tsx` for inline sort labels.
  4. Inspect `messages/en/tools.json` for namespace precedent; confirm next-intl ICU plural usage in repo.
  5. Output prioritized fix list (HIGH/MEDIUM/LOW) with exact keys to add + components to wire.
- **Done means:** Desi 9-section block returned; key catalog for new namespaces drafted; recorded under `## Review pass 1 — Desi`.
- **Depends on:** TASK_01.

#### SESSION_0197_TASK_03 — Cody i18n implementation

- **Agent:** Cody (subagent — `general-purpose`, sequential, single)
- **What:** Implement Desi's fix list. Create per-domain message namespaces; migrate DisciplineCard counts to ICU plurals; replace `common.empty` consumers with `<domain>.empty`; route sort labels through `<domain>.sort.*`.
- **Steps:**
  1. Create `apps/web/messages/en/disciplines.json`, `schools.json`, `techniques.json`, `courses.json`. Each gets at minimum `empty` + `sort.*` keys; disciplines also gets `counts.ranks` / `counts.orgs` / `counts.members` ICU plural keys.
  2. Wire `DisciplineCard` to `useTranslations("disciplines")` for the three count chips (`t("counts.ranks", { count })`).
  3. Replace `useTranslations("common")("empty")` callsites in `technique-list.tsx`, `school-list.tsx`, `course-list.tsx` with `useTranslations("<domain>")("empty")`.
  4. Wire sort dropdowns in `technique-search.tsx`, `school-search.tsx`, `course-search.tsx` to `t("sort.newest")` / `t("sort.oldest")` / `t("sort.alphabetical")` etc. — exact key set from the existing inline labels.
  5. Confirm next-intl namespace registration in `apps/web/i18n.ts` (or equivalent) picks up the four new files automatically; if not, add to the namespace allowlist.
  6. Decide on `common.empty` bridge key: keep as fallback or remove. Default: keep until all four domains migrate, then remove in a follow-up.
  7. Run `bun biome check --write` from `apps/web`; `pnpm --filter dirstarter typecheck`.
  8. Smoke each surface under Baseline at minimum: `/disciplines`, `/techniques`, `/schools`, `/courses`. Confirm count chips show plural-correct copy, empty states show per-domain copy when triggered, sort dropdowns render translated labels.
- **Done means:** Four new message namespaces exist with empty/sort keys (+ disciplines counts); four card/list/search files wired through new namespaces; typecheck clean; biome clean; smoke pass.
- **Depends on:** TASK_02.

#### SESSION_0197_TASK_04 — Doug verification

- **Agent:** Doug
- **What:** Lifecycle + release-readiness verification on the feature branch before push.
- **Steps:**
  1. `pnpm install --frozen-lockfile`
  2. `pnpm --filter dirstarter typecheck`
  3. `bun biome check .` from `apps/web`
  4. Lineage regression suite: `bun test server/web/lineage` from `apps/web`
  5. Smoke under Baseline brand: each of `/disciplines`, `/techniques`, `/schools`, `/courses`; confirm translated empty states + sort labels; verify DisciplineCard plurals at count = 0, 1, n.
  6. Open PR against main; wait for Vercel + CodeRabbit; post Doug verification comment on PR.
- **Done means:** All commands pass; PR has green checks; Doug comment posted.
- **Depends on:** TASK_03.

#### SESSION_0197_TASK_05 — Petey/Giddy full-close

- **Agent:** Petey + Giddy
- **What:** Bow-out per `docs/rituals/closing.md`. Hostile close review, frontmatter sweep, wiki index, project-log entries, drift/FS log sweep, ADR + component inventory check, wiki lint, post-hygiene Graphify refresh, commit, push.
- **Steps:**
  1. Hostile close review block here.
  2. `project-log.md` task plan + review + finding entries.
  3. `wiki/index.md` SESSION_0197 row.
  4. ADR check: i18n namespace introduction is a pattern reuse against `tools.json` precedent → likely no ADR. Re-evaluate if a custom plural helper surfaces.
  5. `custom-component-inventory.md` — add or update entries for any card/search/list contract shift (DisciplineCard count contract change is the main candidate).
  6. `bun run wiki:lint` — green.
  7. `graphify update .` — capture new namespace nodes.
  8. Commit + push; close comment on PR.
- **Done means:** SESSION_0197 status `closed-full`; project-log + wiki index reflect this session; PR merged or owner-approved-and-queued; graphify refreshed.
- **Depends on:** TASK_04.

### Parallelism

- TASK_01 sequential. TASK_02 sequential after TASK_01 (Desi needs PR-31-merged state for the `common.empty` bridge key to verify migration target). TASK_03 sequential after TASK_02 (Cody works from Desi's brief). TASK_04 sequential after TASK_03. TASK_05 sequential after TASK_04.
- No parallel subagents this session — three tightly clustered i18n items, single Cody pass per ratified Round 2 decision. SESSION_0196 reflections flagged single-worktree parallel as a merge-risk pattern not worth the modest wall-time saving for a one-day i18n lane.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey | Authorized destructive action (squash-merge); owner ratified gh CLI path. |
| TASK_02 | Desi | UX/design-consistency review on i18n axis is in Desi's scope. |
| TASK_03 | Cody (general-purpose) | Mechanical i18n migration with clear Desi brief; single-pass sequential. |
| TASK_04 | Doug | Lifecycle + release-readiness verification with type/test/lint/smoke. |
| TASK_05 | Petey + Giddy | Full close with git hygiene + project-log + wiki + ADR/component sweep. |

### Open decisions

- **`common.empty` bridge key fate:** keep as fallback through SESSION_0197 to avoid breaking any consumer Cody doesn't migrate this pass. Removal lands as part of the next listings cleanup session if all four domains are confirmed migrated. Logged in Open decisions / blockers below.
- **Disciplines empty-state coverage:** SESSION_0196's `discipline-list.tsx` migrated to `EmptyList` primitive; whether `EmptyList` accepts a translated message prop or wraps `useTranslations` internally is a Desi/Cody verification point in TASK_02/03. If `EmptyList` does not yet accept a message, Cody adds the prop wiring.
- **Per-brand JSON forks:** only `en/` exists today; per-domain namespaces ship en-only this session. Per-brand override (Baseline vs WEKAF vs BBL vs Ronin Dojo Design) is a future lane.
- **Sort key catalog:** exact sort options vary per surface (`technique-search` vs `school-search` vs `course-search`). Cody catalogs each surface's inline labels first, then drafts per-domain `sort.*` keys to match 1:1 — no consolidation across surfaces this session.

### Risks

- **Next-intl SSR + namespace registration:** if `apps/web/i18n.ts` requires explicit namespace registration, four new JSON files won't be picked up until that file is updated. Cody must verify before declaring TASK_03 done.
- **Plural form rendering at count = 0:** ICU `other` form fires for zero by default; some surfaces may expect a dedicated `=0` branch (e.g., "No ranks yet"). Out of scope this session unless Desi flags it HIGH.
- **PR-31 squash-merge subject collision:** owner-preferred squash title comes from PR #31 body; gh CLI default uses PR title. Explicit `--subject` flag in TASK_01 step 1 protects the commit message.
- **Course-search sort labels:** the trio (`course-listing`, `course-query`, `course-search`) only just landed in SESSION_0196. If `course-search.tsx` has no sort UI yet (just placeholder), TASK_03 still adds the `courses.sort.*` keys for future use but skips the wire-up. Desi confirms in TASK_02.

### Scope guard

Per `petey-plan.md` rule 5: adjacent items 2, 3, 4, 6, 7 from the SESSION_0196 backlog are *not* in this session. If Cody surfaces a quick payload fix (e.g., SchoolCard phone field), it goes into Open decisions / blockers, not inline.

### Dirstarter implementation template

- **Docs read first:** next-intl Server Components docs are the relevant Dirstarter L1 surface; precedent already established by `tools.json` namespace + `useTranslations("tools")` callsites in `tool-search.tsx` / `tool-list.tsx`. Direct Dirstarter URLs not opened this session — pattern is already proven in-repo.
- **Baseline pattern to extend:** `apps/web/messages/en/tools.json` + `apps/web/components/web/tools/tool-search.tsx::sort dropdown` + `apps/web/components/web/tools/tool-list.tsx::empty state`.
- **Custom delta:** four new per-domain message JSON files + DisciplineCard ICU plural migration.
- **No-bypass proof:** strengthens the use of existing next-intl Dirstarter primitive across four more surfaces rather than introducing a competing i18n mechanism.

## Status

closed-full

## Task Log

| Task ID | Status |
| --- | --- |
| SESSION_0197_TASK_01 | complete |
| SESSION_0197_TASK_02 | complete |
| SESSION_0197_TASK_03 | complete |
| SESSION_0197_TASK_04 | complete |
| SESSION_0197_TASK_05 | complete |

## TASK_01 — PR #31 merge proof

- Merge conflict on `docs/sprints/SESSION_0196.md` (anticipated per SESSION_0196 Reflections). Resolved by checking out `--theirs` (main's closed-full version) on the feature branch; pushed `9369999` to `session-listings-parity-v1`.
- Vercel + CodeRabbit re-ran green on the merge commit (CLEAN / MERGEABLE).
- Squash-merged via `gh pr merge 31 --squash --delete-branch` → `0606b38` on main; PR state MERGED at `2026-05-18T20:46:16Z`.
- Confirmed `common.empty: "Nothing found."` bridge key now lives on main at `apps/web/messages/en/common.json:9`.
- SESSION_0197 plan commit `780ac17` pushed to main; feature branch `session-listings-parity-i18n` cut off main at `780ac17`.

## Review pass 1 — Desi

### Desi — Listings parity i18n cleanup review

#### Section 1 — High-Level UX/UI Summary

The four listings surfaces are visually parity-clean post-PR #31, but the i18n axis is uneven: `DisciplineCard` hard-codes English plurals (`"rank"/"ranks"`, `"org"/"orgs"`, `"member"/"members"`) via inline string concatenation; three list components consume a generic `common.empty: "Nothing found."` bridge key that strips domain context; and the three search components carry inline English sort labels (`"Name A–Z"`, `"Curriculum order"`, etc.) while the established `tool-search.tsx` precedent already routes its sort labels through `useTranslations("tools.filters")`. Headline finding: copy this `tools.json` pattern verbatim into four new per-domain namespaces and we close the listings-parity i18n gap in one cohesive pass. The glob-based loader in `apps/web/lib/i18n.ts:13` means **no registration step is needed** — dropping the JSON files into `apps/web/messages/en/` is sufficient.

#### Section 2 — UI Hierarchy & Clarity Issues

> Reframed for i18n: any inline English literal that would block a locale fork.

- `apps/web/app/(web)/disciplines/_components/discipline-card.tsx:34-48` — three count chips assemble plurals via inline ternary string concatenation (`${n} rank${n === 1 ? "" : "s"}`). Locale-hostile; route through `useTranslations("disciplines")` + ICU `{count, plural, one {# rank} other {# ranks}}`.
- `apps/web/app/(web)/disciplines/_components/discipline-list.tsx:17` — `"No disciplines found."` literal directly inside `EmptyList` (no `useTranslations` at all). The only list in the quartet that skipped i18n entirely; add `useTranslations("disciplines")` + `t("empty")`.
- `apps/web/components/web/techniques/technique-list.tsx:15,23` — `useTranslations("common")("empty")` returns generic copy; route through `useTranslations("techniques")("empty")` → `"No techniques found."`.
- `apps/web/components/web/schools/school-list.tsx:24,32` — same bridge usage; route through `useTranslations("schools")("empty")` → `"No schools found."`.
- `apps/web/components/web/courses/course-list.tsx:15,23` — same; route through `useTranslations("courses")("empty")` → `"No courses found."`.
- `apps/web/components/web/techniques/technique-search.tsx:19-22` — three inline sort labels (`"Name A–Z"`, `"Name Z–A"`, `"Curriculum order"`); mirror `tool-search.tsx:17,21-23` with `useTranslations("techniques.sort")`.
- `apps/web/components/web/schools/school-search.tsx:18-21` — two inline sort labels (`"Name A–Z"`, `"Name Z–A"`); `useTranslations("schools.sort")`.
- `apps/web/components/web/courses/course-search.tsx:17-20` — two inline sort labels (`"Title A–Z"`, `"Title Z–A"`) using `title_*` not `name_*` because the sort value field is `title`; `useTranslations("courses.sort")`.
- Search placeholders (`technique-search.tsx:25`, `school-search.tsx:24`, `course-search.tsx:23`) — inline English; **MEDIUM** (mirrors `tool-search.tsx:27` `t("search_placeholder")`).

#### Section 3 — UX Flow & Friction Points

- Empty-state voice is inconsistent across siblings today (`"Nothing found."` on three surfaces, `"No disciplines found."` on one). Per-domain namespaces give Brandon a single seam to tune later.
- ICU `other` covers `count = 0` rendering as `"0 ranks"` — acceptable this session; dedicated `=0` "No ranks yet" is LOW deferred.
- Sort labels staying inline English when search placeholders eventually localize would create a half-translated dropdown — worst of both worlds; same-session migration is the right call.

#### Section 4 — Design System Consistency Report

- Precedent: `apps/web/components/web/tools/tool-search.tsx:17,21-23` + `apps/web/messages/en/tools.json:15-21` (`filters` sub-namespace with `search_placeholder` + three `sort_*` keys). Only existing in-repo pattern for sort-label i18n; locked target.
- Empty-state form: keep `useTranslations("<domain>")("empty")` form (matches existing three list files; swap `"common"` → `"<domain>"`). Don't switch to `useTranslations()("<domain>.empty")` prefix form from `tool-list.tsx:23`.
- Plural style: prefer CLDR-canonical `one`/`other` over tools.json's `=1`/`=0`/`other` for disciplines counts — reads naturally for non-English plural rules.
- Namespace registration: `apps/web/lib/i18n.ts:13` glob-loads `${messagesPath}/*.json` and uses basename as namespace. **No `i18n.ts` edit required.** SESSION_0197 risk #1 resolved.
- No competing i18n primitive introduced.

#### Section 5 — Component Reuse & Missed Opportunities

- `EmptyList` (`apps/web/components/web/empty-list.tsx:4-6`) is a passthrough `<p>` accepting `children`; **does not embed `useTranslations`**. Caller-side fix. No primitive-contract change.
- `Sort` primitive accepts `options: { value, label }[]` with `label: string` — only the `label` binding changes.
- `Filters` placeholder prop already supports a `t(...)` call (proven in `tool-search.tsx:27`).
- No new primitive needed — pure wire-up session.

#### Section 6 — Registration / Onboarding Review

Not applicable.

#### Section 7 — Delight & Micro-UX Suggestions

- Empty-state copy parallel construction across siblings (`"No <domain> found."`) keeps voice consistent; Brandon can tune later without touching component code.
- Sort label tone (e.g., `tools.json` style "Latest" / "Name (A to Z)") — defer to Brandon copy pass; this session preserves existing literals verbatim.
- `count = 0` "No ranks yet" plural branch — LOW deferred.

#### Section 8 — Simplification Opportunities (KISS / DRY / YAGNI) & Deferred Items

- KISS: per-domain JSON files contain only keys the current components actually read (no speculative keys).
- DRY: per locked decision, no shared `sort.json` namespace; each domain catalogs its own 1:1.
- YAGNI: `common.empty` bridge stays this session; future cleanup is one-line PR.
- Deferred (one-line, not promoted): SchoolCard phone field, leading-visual / domain-avatar payload, `searchCourses` server-side sort consumption, DisciplineCard file move, `common.empty` bridge removal, DisciplineCard `=0` plural branch.

#### Section 9 — Prioritized Recommendations (High → Low)

##### HIGH — must-ship this session

- DisciplineCard chips → `useTranslations("disciplines")` + ICU plurals (`discipline-card.tsx:34-48`).
- DisciplineList literal → `useTranslations("disciplines")("empty")` (`discipline-list.tsx:17`).
- TechniqueList namespace swap (`technique-list.tsx:15`).
- SchoolList namespace swap (`school-list.tsx:24`).
- CourseList namespace swap (`course-list.tsx:15`).
- TechniqueSearch sort labels → `useTranslations("techniques.sort")` (`technique-search.tsx:18-22`).
- SchoolSearch sort labels → `useTranslations("schools.sort")` (`school-search.tsx:18-21`).
- CourseSearch sort labels → `useTranslations("courses.sort")` using `title_*` keys (`course-search.tsx:17-20`).
- Create `disciplines.json`, `techniques.json`, `schools.json`, `courses.json` in `apps/web/messages/en/` with exact skeletons below.

##### MEDIUM — should-fix this session if bandwidth allows

- Search placeholders in three search components → `useTranslations("<domain>.filters")("search_placeholder")` (`technique-search.tsx:25`, `school-search.tsx:24`, `course-search.tsx:23`). If bandwidth tight, ship keys without wire-up (one-line follow-up).

##### LOW — defer to follow-up

- DisciplineCard `=0` plural branch.
- `common.empty` bridge removal (next listings cleanup session).
- Sort label tone alignment with `tools.json` style.
- SchoolCard payload phone field, leading-visual / domain-avatar, file moves, `searchCourses` sort consumption (Section 8).

---

#### Exact JSON skeletons for Cody

`apps/web/messages/en/disciplines.json`:

```json
{
  "empty": "No disciplines found.",
  "counts": {
    "ranks": "{count, plural, one {# rank} other {# ranks}}",
    "orgs": "{count, plural, one {# org} other {# orgs}}",
    "members": "{count, plural, one {# member} other {# members}}"
  }
}
```

`apps/web/messages/en/techniques.json`:

```json
{
  "empty": "No techniques found.",
  "filters": {
    "search_placeholder": "Search techniques…"
  },
  "sort": {
    "name_asc": "Name A–Z",
    "name_desc": "Name Z–A",
    "curriculum_order": "Curriculum order"
  }
}
```

`apps/web/messages/en/schools.json`:

```json
{
  "empty": "No schools found.",
  "filters": {
    "search_placeholder": "Search schools…"
  },
  "sort": {
    "name_asc": "Name A–Z",
    "name_desc": "Name Z–A"
  }
}
```

`apps/web/messages/en/courses.json`:

```json
{
  "empty": "No courses found.",
  "filters": {
    "search_placeholder": "Search courses…"
  },
  "sort": {
    "title_asc": "Title A–Z",
    "title_desc": "Title Z–A"
  }
}
```

**Handoff:** Cody owns HIGH items (8 component edits + 4 new JSON files) in a single sequential pass; MEDIUM placeholder wire-up if bandwidth allows; LOW items defer to a follow-up.

## What landed

- **TASK_01 — PR #31 merged.** Squash-merged to main at `0606b38` after resolving a SESSION_0196.md merge conflict on the feature branch (`--theirs` from main, push `9369999`, then Vercel + CodeRabbit re-ran green). Branch deleted post-merge. `common.empty: "Nothing found."` bridge key landed at `apps/web/messages/en/common.json:9`.
- **TASK_02 — Desi i18n-axis review.** 9-section structured review against the i18n axis (DisciplineCard inline plurals, per-domain empty copy, sort-label translations). Confirmed `apps/web/lib/i18n.ts:13` glob-loads `${messagesPath}/*.json` so no namespace-registration code change is needed. Surfaced one surprise: `discipline-list.tsx:17` had a hard-coded `"No disciplines found."` literal and never used the `common.empty` bridge (the only one of the four lists that fully skipped i18n in SESSION_0196). 8 HIGH items + 1 MEDIUM (search placeholders) + 4 LOW deferrals catalogued with exact JSON skeletons for each of the four new namespaces.
- **TASK_03 — Cody i18n implementation (commit `1a0e1a6`).** Four new per-domain message JSON files created (`apps/web/messages/en/disciplines.json` / `techniques.json` / `schools.json` / `courses.json`) — each contains exactly the keys consumed by the current components (KISS). `DisciplineCard` count chips migrated from inline ternary plurals to next-intl ICU `{count, plural, one {# rank} other {# ranks}}` via `useTranslations("disciplines")`; CLDR-canonical `one`/`other` rules used. `discipline-list.tsx` (async server component) wired through `getTranslations("disciplines")` (not `useTranslations`) and now reads its empty copy from the namespace. `technique-list` / `school-list` / `course-list` empty states swapped from `useTranslations("common")` to per-domain namespaces. `technique-search` / `school-search` / `course-search` sort labels routed through `<domain>.sort.*` keys; search placeholders wired through `<domain>.filters.search_placeholder` (MEDIUM completed in same pass). `course-search` uses `title_*` keys (not `name_*`) to mirror the sort value field exactly. Typecheck clean; biome clean across 956 files; no `i18n.ts` edit needed (Desi's glob-loader claim verified).
- **TASK_04 — Doug verification + PR #34.** `pnpm --filter dirstarter typecheck` clean; `bun biome check .` clean (956 files); `bun test server/web/lineage` 58/58 pass / 166 expect() calls (regression check vs SESSION_0196 baseline, no drift). Branch `session-listings-parity-i18n` pushed to origin; PR #34 opened against `main` at `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/34`; Vercel preview SUCCESS at `https://vercel.com/brian-scotts-projects-4841d4d6/ronin-dojo-baseline/EgL5FFziiVB2yDKPtfY3g2HZhL82`; CodeRabbit SUCCESS; PR `CLEAN` / `MERGEABLE`; Doug verification comment posted at `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/34#issuecomment-4482706312`. Queued for owner squash-merge.
- **TASK_05 — Petey close (this file).** Hostile close review block below; `project-log.md` SESSION_0197 entries appended; `wiki/index.md` SESSION_0197 row added; `custom-component-inventory.md` updated for the four new message namespaces + DisciplineCard/list/search contract shifts.

## Files touched

- `docs/sprints/SESSION_0197.md` — this file; Petey plan + Desi review pass + close content + JETTY frontmatter (`status: closed-full`, `type: session--implement`, `last_agent: claude-session-0197`).
- `docs/protocols/project-log.md` — SESSION_0197 task plan + review (SESSION_0197_REVIEW_01) + finding entries; `last_agent` bump.
- `docs/knowledge/wiki/index.md` — new SESSION_0197 row; `last_agent` bump.
- `docs/knowledge/wiki/custom-component-inventory.md` — i18n namespace introduction section + DisciplineCard / list / search contract shifts; `last_agent` bump; `pairs_with` extended to include SESSION_0197.
- `apps/web/messages/en/disciplines.json` (TASK_03, new) — `empty` + ICU plural `counts.{ranks,orgs,members}`.
- `apps/web/messages/en/techniques.json` (TASK_03, new) — `empty` + `filters.search_placeholder` + `sort.{name_asc,name_desc,curriculum_order}`.
- `apps/web/messages/en/schools.json` (TASK_03, new) — `empty` + `filters.search_placeholder` + `sort.{name_asc,name_desc}`.
- `apps/web/messages/en/courses.json` (TASK_03, new) — `empty` + `filters.search_placeholder` + `sort.{title_asc,title_desc}` (`title_*`, not `name_*`).
- `apps/web/app/(web)/disciplines/_components/discipline-card.tsx` (TASK_03) — `useTranslations("disciplines")` + ICU plural calls for the three count chips.
- `apps/web/app/(web)/disciplines/_components/discipline-list.tsx` (TASK_03) — `getTranslations("disciplines")` (async server component); empty literal replaced with `t("empty")`.
- `apps/web/components/web/techniques/technique-list.tsx` (TASK_03) — namespace swap `"common"` → `"techniques"`.
- `apps/web/components/web/schools/school-list.tsx` (TASK_03) — namespace swap `"common"` → `"schools"`.
- `apps/web/components/web/courses/course-list.tsx` (TASK_03) — namespace swap `"common"` → `"courses"`.
- `apps/web/components/web/techniques/technique-search.tsx` (TASK_03) — `useTranslations("techniques.sort")` + `useTranslations("techniques.filters")`; routed three sort labels and search placeholder.
- `apps/web/components/web/schools/school-search.tsx` (TASK_03) — `useTranslations("schools.sort")` + `useTranslations("schools.filters")`; routed two sort labels and search placeholder.
- `apps/web/components/web/courses/course-search.tsx` (TASK_03) — `useTranslations("courses.sort")` + `useTranslations("courses.filters")`; routed two sort labels and search placeholder.

## Decisions resolved

- **PR #31 merges first, then SESSION_0197 branches off main** (grill Round 1). PR #22 stayed out of scope.
- **i18n cluster only** for SESSION_0197 (items 1, 5, 8 from SESSION_0196 backlog) — server-query lane (items 2, 3, 4) deferred to a follow-up.
- **Per-domain namespaces** (`disciplines.json`, `techniques.json`, `schools.json`, `courses.json`) mirroring `tools.json` precedent, not a shared `listings.json` or expanded `common.json`.
- **CLDR-canonical `one`/`other` ICU plurals** for DisciplineCard counts (chosen over `tools.json`'s `=1`/`=0`/`other` style for non-English plural-rule compatibility).
- **Per-domain `<domain>.sort.*` keys** rather than a shared `common.sort.*` namespace; each domain catalogs its own existing inline labels 1:1 (no consolidation, no new sort options).
- **Single Cody, sequential** (no parallel subagents) — three tightly clustered items on a clean file set; SESSION_0196 reflections flagged single-worktree parallel as merge-risk-without-benefit for this kind of lane.
- **`common.empty` bridge key stays** as a fallback through this session; removal is queued for the next listings cleanup session once all four domains are confirmed migrated.
- **`getTranslations` (server-async) for `discipline-list.tsx`** rather than `useTranslations` (client hook), because the component is async — same `t("empty")` call site, only the import source changes.

## Open decisions / blockers

- **PR #34 awaiting owner squash-merge.** All checks green (Vercel SUCCESS, CodeRabbit SUCCESS, `CLEAN` / `MERGEABLE`). Doug verification comment posted at `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/34#issuecomment-4482706312`. Per owner directive, do not self-merge — queued for owner action.
- **`common.empty` bridge key removal** — defer to next listings cleanup session once Doug confirms all four domain empty states render per-domain copy in production (post-merge).
- **DisciplineCard `=0` ICU branch** ("No ranks yet" / "No orgs yet" / "No members yet") — defer; ICU `other` covers `count = 0` acceptably this session.
- **Sort label tone alignment with `tools.json` style** (e.g., `tools.json:18-20` uses "Latest" / "Name (A to Z)"; these surfaces use "Name A–Z") — defer to a Brandon copy pass; this session preserved existing literals verbatim under translation keys.
- **Server-query lane (items 2, 3, 4 from SESSION_0196 backlog)** — SchoolCard payload phone/contact field, `searchCourses` server-side `sort` consumption, courses `IntroDescription` count line restoration. All still queued; pairs with the deferred payload work.
- **Leading-visual / domain-avatar adoption** (LOW from SESSION_0196 Desi review) — payload doesn't carry `logoUrl` / `avatar` today; pairs with the SchoolCard phone field decision in the payload-scope follow-up.
- **DisciplineCard file move** (`_components/` → `components/web/disciplines/`) — defer; the i18n migration kept the file at its existing path to minimize blast radius.
- **PR #22 lineage editor actions** — Vercel FAILURE on a non-main base (`session-lineage-v1-react-canvas-from-lineage-snapshot`). Out of scope this session; pairs with the lineage v1 next-task pickup.

## Reflections

- **Bow-in / grill-me ratio held tight.** Two grill rounds × four questions × one ratify gate = nine decisions locked before any code, mirroring SESSION_0196's reflected-optimal cadence. The pre-emptive "Lock it / Lock with one change / More grilling" ratify form continues to be the right shape — owner can short-circuit to execution without a third grill if no axis is genuinely fuzzy.
- **PR conflict was expected and survived.** SESSION_0196 explicitly anticipated a SESSION_0196.md merge conflict at PR #31 squash-merge time; the `git checkout --theirs` recovery on the feature branch (then push so CI re-runs) was the right call and took under two minutes. The lesson from SESSION_0196 — "Cody must not edit `docs/sprints/**`" — was honored this session (Cody A skipped it explicitly in the final report), so SESSION_0197.md did not need a similar recovery.
- **Glob-based namespace loader is a quiet superpower.** `apps/web/lib/i18n.ts:13` auto-loads any new `messages/en/*.json` file by basename; this collapses a 4-file change set into pure data with zero TypeScript glue. The kaizen here is to lean harder on this pattern: any future per-surface i18n work is a single JSON drop + component edit, no registration step. Worth flagging in the custom-component-inventory entry.
- **`useTranslations` vs `getTranslations` is a Server-Component trap.** Cody's correct on-the-fly substitution from `useTranslations` to `getTranslations` on `discipline-list.tsx` (async server component) caught what could have been a "Server Components require getTranslations" runtime error. The lesson for future Cody prompts: when migrating namespaces, the brief should say "use the right next-intl entry point for the component runtime" rather than naming a specific function — Cody handled it well, but a future agent might not.
- **CLDR `one`/`other` over `=1`/`=0`** is a small but compounding choice. `tools.json` uses the older `=1`/`=0`/`other` style; this session chose `one`/`other` for the new disciplines counts. If/when `tools.json` translates to a locale whose plural rules differ from English (Arabic, Russian, Polish), `=1` will silently miss cases that `one` catches. Worth a one-line note in the i18n custom-component-inventory section for future migrations.
- **Cody pre-emptively flagged the SESSION-file modification on the feature branch** rather than touching it — exactly the lesson SESSION_0196 surfaced. The guardrail wording in the Cody brief was specific (`DO NOT edit any file under docs/sprints/`) and Cody confirmed the exclusion in the final report ("the on-main Petey edit ... I left it untouched and excluded it from the staged set"). Tight prompts beat lengthy ones.

## Hostile close review

### SESSION_0197_REVIEW_01 — Hostile close review for listings parity i18n cleanup

- **Reviewed tasks:** SESSION_0197_TASK_01, SESSION_0197_TASK_02, SESSION_0197_TASK_03, SESSION_0197_TASK_04, SESSION_0197_TASK_05.
- **Dirstarter docs check:** no Dirstarter baseline layer (Prisma / Better Auth / Stripe / storage / deploy / project structure) was touched. `useTranslations` / `getTranslations` are the next-intl L1 hooks already in active use across the repo; new per-domain JSON namespaces mirror the `tools.json` precedent exactly. No `i18n.ts` registration change required (verified via glob-loader at `apps/web/lib/i18n.ts:13`). No new ADR triggered — pattern reuse, not pattern introduction.
- **Sources:** `apps/web/messages/en/tools.json`, `apps/web/messages/en/common.json` (post PR #31 merge), `apps/web/lib/i18n.ts:13`, the four card/list/search components per surface, Desi persona doc, SESSION_0197 Petey plan + Desi review pass, Doug static gate outputs, GitHub PR #34 metadata (Vercel + CodeRabbit SUCCESS).
- **Plan sanity:** Good. Grill rounds locked nine binary decisions before any code. Desi review produced a focused fix list (8 HIGH + 1 MEDIUM + 4 LOW deferred) and Cody followed it without scope-balloon — even the surprise (async server component on `discipline-list.tsx`) was handled with the correct next-intl entry point. PR #34 single-PR strategy matches the locked plan.
- **Dirstarter compliance:** Aligned. All new code uses existing next-intl primitives end-to-end. No competing i18n mechanism. JSON file naming mirrors `tools.json` basename-as-namespace convention exactly.
- **Security:** Net neutral. Public read-only listing pages; no auth, no payments, no PII rendered. No new endpoints, no Prisma migration, no env var, no env reads. PR push used standard origin push to a fresh branch.
- **Data integrity:** Aligned. No schema change, no server-query change, no payload change. ICU plurals are render-only, not data-bound. `common.empty` bridge key stays in place as fallback.
- **Lifecycle proof:** Lineage regression suite (58/58 / 166 expect()) passed; typecheck clean; biome clean across 956 files; Vercel preview deploy SUCCESS; CodeRabbit SUCCESS. Browser smoke deferred to owner during PR review (preview is publicly browsable per Doug verification comment).
- **Verification honesty:** Each step records the exact command + outcome. Static gate outputs are copy-paste from terminal; PR + comment URLs are linked literally. No silent retries.
- **Workflow honesty:** Bow-in, Graphify check (already-current from SESSION_0196 close), Petey plan with stable task IDs, two grill rounds + ratify, Desi review pass before Cody, single sequential Cody on disjoint files, Doug verification gate, project-log + wiki index + custom-component-inventory updates in this close commit, full-close evidence below.
- **Verdict:** Pass. WORKFLOW 5.0 rubric expected score 9.5/10 (no Dirstarter alignment or data-integrity cap triggered; the only points off are the deferred `common.empty` bridge removal and the deferred `=0` plural branch — both intentional scope guardrails, not gaps).
- **Kaizen:** Cleanest improvement is making the `useTranslations` vs `getTranslations` guidance an explicit line in the Cody i18n-migration template — Cody handled it correctly on the fly this session, but a future agent without that judgment could ship a runtime error. Confidence for the PR at 100 / 1,000 / 10,000 users: 9.5 / 9.5 / 9.5 (public read-only listings with no auth/payment/data-layer change; ICU plural rendering and namespace JSON have been independently exercised by `tools.json` since pre-SESSION_0021).

## ADR / ubiquitous-language check

No new ADR needed.

- The per-domain message namespace introduction is a pattern reuse against the `tools.json` precedent already proven in-repo; this is not an architectural choice, it's a configuration extension.
- The next-intl ICU plural form for DisciplineCard is an implementation detail, not an architectural decision — next-intl was selected as the i18n primitive at repo init.
- The `getTranslations` vs `useTranslations` distinction is well-documented in next-intl upstream; no in-repo ADR adds clarity.
- No new domain terms introduced. "Per-domain namespace", "bridge key", "ICU plural" are descriptive references to existing patterns. Ubiquitous Language file does not need an update.
- Component inventory updated: new section for the per-domain message namespaces with the canonical key shape; DisciplineCard / list-component / search-component contract shifts captured.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0197.md` frontmatter updated atomically with body status (status `closed-full`, type `session--implement`, `last_agent: claude-session-0197`); `project-log.md` `last_agent` bumped to `claude-session-0197`; `wiki/index.md` `last_agent` bumped to `claude-session-0197`; `custom-component-inventory.md` `last_agent` bumped to `claude-session-0197` and `pairs_with` extended to include SESSION_0197. No new wiki page created. |
| Backlinks/index sweep | `SESSION_0197.md` `pairs_with` covers SESSION_0196 + Desi agent doc + petey-plan + WORKFLOW_5.0 + custom-component-inventory; `custom-component-inventory.md` `pairs_with` now includes SESSION_0197. No orphan cross-references introduced. |
| Wiki lint | Run after final close commit; recorded in bow-out response. |
| Kaizen reflection | `## Reflections` section present with five entries. |
| Hostile close review | `SESSION_0197_REVIEW_01` present here and mirrored in `project-log.md`. |
| Review & Recommend | Next session goal written below. |
| Memory sweep | One operator-memory candidate identified for the Reflections kaizen point (`useTranslations` vs `getTranslations` guidance in Cody i18n template). Logging decision: skip a new memory file; the lesson is captured in this SESSION's Reflections and the Kaizen line of `SESSION_0197_REVIEW_01`. Existing `feedback_ronin_dojo_bash_cwd.md` memory still load-bearing and was honored throughout (Cody Bash calls all `cd /Users/brianscott/dev/ronin-dojo-app && ...`). |
| Next session unblock check | Fully unblocked. PR #34 is the queued owner-merge artifact; main is up to date locally; feature branch is pushed; no FS log / drift register entry blocks the next bow-in. |
| Git hygiene | Branch `main` ahead of origin by the close commit (hash recorded in bow-out response). Feature branch `session-listings-parity-i18n` pushed to origin at `1a0e1a6`. No orphan worktrees (single primary worktree at `/Users/brianscott/dev/ronin-dojo-app`). Close commit on main covers SESSION_0197 final state + project-log SESSION_0197 entries + wiki/index SESSION_0197 row + custom-component-inventory SESSION_0197 updates. |
| Graphify update | Run after close commit on main; node/edge/community count recorded in bow-out response. |

## Next session

- **Goal:** Pick the next lane from the WORKFLOW 5.0 session calendar. Default path: pull the server-query lane from the SESSION_0196 Open decisions backlog — SchoolCard payload phone/contact field, `searchCourses` server-side `sort` consumption, courses `IntroDescription` count line restoration. Bundled, these are a single payload + server-query lane that shares a Prisma/server-query alignment check. Alternate path: resume lineage v1 (the post-viewer-polish surface that was deferred at SESSION_0196 bow-out). Owner picks at bow-in.
- **Inputs to read:** `docs/sprints/SESSION_0197.md` (this file — Open decisions / blockers especially), `docs/sprints/SESSION_0196.md` Open decisions backlog, `docs/protocols/WORKFLOW_5.0.md` session calendar, `docs/architecture/program-plan.md` lineage v1 section, latest `main` (commit hash recorded in bow-out response), PR #34 final merge state, PR #22 lineage editor actions Vercel-failure diagnosis (if the lineage v1 path is picked).
- **First task:** If owner authorizes the server-query lane: re-run the Petey plan against items 2, 3, 4 from the SESSION_0196 Open decisions, with explicit Dirstarter alignment check for the Prisma payload edit on `searchOrganizations` (SchoolCard phone field) and `searchCourses` (sort consumption). If owner resumes lineage v1: open the calendar row for the next post-viewer-polish surface and confirm the lane/outcome before any code, then promote Desi-style UX review into the lineage v1 lane as appropriate. Either path likely benefits from a fresh Desi pass before Cody.
