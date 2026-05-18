---
title: "SESSION 0197 — Listings Parity i18n Cleanup (Disciplines counts, per-domain empty states, sort labels)"
slug: session-0197
type: session--open
status: in-progress
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

in-progress

## Task Log

| Task ID | Status |
| --- | --- |
| SESSION_0197_TASK_01 | pending |
| SESSION_0197_TASK_02 | pending |
| SESSION_0197_TASK_03 | pending |
| SESSION_0197_TASK_04 | pending |
| SESSION_0197_TASK_05 | pending |
