---
title: "SESSION 0355 — Rich DataSelect labels (ReactNode rows), claim hardening (org CTA + browser smoke), BBL profile-redesign assessment"
slug: session-0355
type: session--open
status: in-progress
created: 2026-06-07
updated: 2026-06-07
last_agent: claude-session-0355
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0354.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0355 — Rich DataSelect labels (ReactNode rows), claim hardening (org CTA + browser smoke), BBL profile-redesign assessment

## Date

2026-06-07

## Operator

Brian + claude-session-0355

## Goal

Three lanes, grilled to mutual understanding over four rounds: (1) **Rich `DataSelect` labels** — extend `DataSelect` with an optional per-option `content?: ReactNode` dropdown row (keeping required `label: string` for the collapsed trigger, typeahead, and a11y), prove it with a render test, then apply where it adds real signal: belt-color swatches on rank selects (`Rank.colorHex`, first consumer), school logos on org selects, role-agnostic person avatars (`passport.avatarUrl ?? user.image`) on user selects, and move `tool-filters` back onto `DataSelect`. (2) **Claim feature hardening** — owner-less-org "Claim this organization" CTA on `/organizations` + `/schools`, and a full dev-login Playwright browser smoke (teaser, owner live-preview, `/admin/claims` approval, new CTA) closing SESSION_0354 FINDING_01. (3) **BBL profile-redesign assessment (plan-only)** — Desi audits user/school/org profile surfaces vs `baselinemartialarts.com/black-belt-legacy`, anchored on a single role-agnostic Person-presentation contract; Petey writes a staged plan doc. Full bow-out, glossary, ADR check, graphify update, push to main on green gates.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0354.md` (closed).
- Carryover: SESSION_0354 shipped the `DataSelect` wrapper (WL-P1-7), the generic profile-claim system (model + `/admin/claims` queue + teaser + owner live-preview), the directory `organizationHref` fix, and deps hygiene (WL-P2-10). It explicitly handed off the "Next session" goal this session takes: rich `DataSelect` ReactNode labels + claim hardening (browser smoke owed per FINDING_01 + org-claim CTA not yet built).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0355.md`.
- Current HEAD at bow-in: `67681f9`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd is `/Users/brianscott/dev/ronin-dojo-app`, not `dirstarter_template`. FS-0024 guard passed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/data-select.tsx` (wraps the Base UI `Select` primitive); filter components (`tool-filters`, rank/org/user selects); public App Router `/organizations` + `/schools` pages (claim CTA); the profile/hero presentation surfaces (assessment only). |
| Extension or replacement | Extension: add an optional `content?: ReactNode` row to the existing `DataSelect` wrapper (trigger/typeahead/a11y unchanged); reuse the existing `ProfileClaimRequest` flow for the org CTA; compose existing `Avatar`/`Badge`/`Stack` primitives for swatches/logos/avatars. |
| Why justified | Rich dropdown rows add real selection signal (belt color, school identity, person identity) without forking the primitive; the org CTA completes the claim funnel started in 0354; the assessment unifies fragmented profile presentation. |
| Risk if bypassed | A bespoke rich-select would fork the WL-P1-7 fix; a parallel org-claim entry point would diverge from the admin-review contract; un-unified profiles keep drifting. |

Live docs checked during planning: local Dirstarter component/docs inventories; SESSION_0354 + petey-plan-0355 verified by direct read; `data-select.tsx`/`tool-filters.tsx`/filter actions read directly.

### Graphify check

- Graph status: current (built end of SESSION_0354); `graphify stats` at bow-in: 9693 nodes, 15332 edges, 1448 communities, 1624 files tracked.
- Queries used:
  - `rank belt select dropdown colorHex options award promotion rank-system rank picker`
  - `school organization select logo image avatar instructor user member picker option`
  - `findFilterOptions count directory filters facet school technique tool filter options name slug count`
- Files selected from graph / bounded follow-up (verified by direct read):
  - `apps/web/components/common/data-select.tsx` (+ `.test.tsx`), `tool-filters.tsx`, `techniques/technique-filters.tsx`, `schools/school-filters.tsx`
  - `apps/web/server/web/actions/filters.ts`, `server/web/techniques/actions.ts`, `server/web/directory/filter-options.ts`
  - `apps/web/app/admin/lineage/_components/lineage-selected-rank-select.tsx`, `lineage/[treeSlug]/edit/[nodeId]/_components/lineage-node-profile-form.tsx`, `admin/courses/_components/course-form.tsx`
  - `apps/web/components/web/profile/profile-hero.tsx`
- Verification note: Graphify navigation only; one stale node (`components/web/lineage/lineage-selected-rank-select.tsx` → actual path is `app/admin/lineage/_components/...`) corrected by direct inspection. Count-availability claim corrected by reading the four filter actions directly.

### Grill outcome

Petey grilled **four rounds** (operator answered via AskUserQuestion):

1. **Session scope** — THIS session = rich DataSelect labels + claim hardening; BBL profile redesign = assessment/plan-only; Galaxy three.js = dedicated future session; carousel epic 0337 = keep dormant.
2. **DataSelect API** — per-option `content?: ReactNode` (row renders `content ?? label`); `items`/trigger/typeahead/a11y stay on `label` string.
3. **Trigger richness** — collapsed trigger stays **string-only** when a value is selected; rich content only in the open dropdown rows.
4. **Avatar-everywhere** — adopt **one role-agnostic Person-presentation contract** (avatar + name + belt + disciplines) for the user-select consumer AND as the anchor of the assessment doc.
5. **Counts** — **skip counts entirely this session** (corrected premise: only tool filters pre-fetch `count`; directory/technique/school need new server-side facet aggregation = real prod-query work). Staged as a follow-up.
6. **Orchestration** — inline single coherent pass (Cody) + **one background Desi subagent** for the read-only assessment (disjoint); no worktrees, no autonomous run.
7. **Browser smoke** — full claim-feature smoke (teaser + live-preview + admin approve + new CTA), closing FINDING_01.
8. **Push gating** — push to main on code-green per standing authorization; smoke = evidence, not a hard gate (hold only on a real bug).

### Drift logged

- **Plan-vs-code premise drift (count availability):** the 0354 "Next session" block + petey-plan-0355 assumed `count` is fetched for the directory/school/technique filters; only the tool filters' `findFilterOptions` actually returns it. Corrected at grill; counts deferred. (Operator-acknowledged; no ledger entry required — caught before build.)

## Petey plan

### Goal

Ship the rich-`DataSelect` ReactNode-row extension + its high-signal consumers, complete the org-claim CTA and a full claim browser smoke, and stage a Desi-authored BBL profile-redesign assessment — pushed to main on green gates.

### Tasks

#### SESSION_0355_TASK_01 — DataSelect ReactNode `content` row + consumers

- **Agent:** Cody
- **What:** Extend `DataSelect` with optional per-option `content?: ReactNode`; apply to high-signal selects.
- **Steps:** (a) add `content?: ReactNode` to `DataSelectOption`; render `content ?? label` in `SelectItem`; keep `buildSelectItems`/trigger/typeahead on `label`. (b) extend `data-select.test.tsx` proving trigger shows the string `label` while a row renders the ReactNode. (c) belt-color swatches on rank selects (`Rank.colorHex`, first consumer). (d) school logos on org selects. (e) role-agnostic person avatars (`passport.avatarUrl ?? user.image`) on user/instructor selects. (f) move `tool-filters` back onto `DataSelect` (`content: name`, `label: String(name)`) — removes the documented ReactNode exception.
- **Done means:** render test passes; rank/org/user selects show rich rows with string triggers; `tool-filters` uses `DataSelect`; typecheck/biome green.
- **Depends on:** nothing (01a/b first; consumers follow).

#### SESSION_0355_TASK_02 — Claim hardening: owner-less-org CTA + full browser smoke

- **Agent:** Cody (build) → Doug/Playwright (smoke)
- **What:** Add the "Claim this organization" CTA for owner-less orgs on `/organizations` + `/schools`; run the owed claim-feature browser smoke.
- **Steps:** surface a claim CTA on owner-less `Organization` detail/list pages wired to the existing `ProfileClaimRequest` submit flow; dev-login Playwright smoke of teaser render, owner live-preview reactivity, `/admin/claims` approval, and the new CTA; screenshot evidence.
- **Done means:** owner-less org shows a working Claim CTA; browser smoke green with screenshots; closes SESSION_0354 FINDING_01.
- **Depends on:** nothing (uses the 0354 claim model).

#### SESSION_0355_TASK_03 — BBL profile-redesign assessment (plan-only)

- **Agent:** Desi (background subagent) → Petey
- **What:** Audit user/school/org profile surfaces vs `baselinemartialarts.com/black-belt-legacy`; produce a prioritized consolidation/gap list anchored on one role-agnostic Person-presentation contract; Petey writes a staged plan doc.
- **Steps:** Desi WebFetches the BBL page + reads local profile surfaces (`profile-hero`, directory/org/school profile pages); returns a prioritized fix/consolidation list; Petey lands `docs/petey-plan-0356-profile-redesign.md`.
- **Done means:** a staged plan doc exists with the assessment; no production profile code written this session.
- **Depends on:** nothing (read-only; runs in parallel with 01/02).

#### SESSION_0355_TASK_04 — Governance + verify + full bow-out

- **Agent:** Doug → Petey
- **What:** Verify gates; stamp the carousel epic dormant; stage the Galaxy session note; full close.
- **Steps:** typecheck/biome/pure tests/`fallow` changed-file; mark `petey-plan-0337` dormant with a resume-pointer; stage a Galaxy-three.js dedicated-session note; glossary + ADR check + custom-component-inventory; memory sweep; graphify update; push to main.
- **Done means:** gates green; docs stamped; SESSION file + wiki + glossary updated; pushed.
- **Depends on:** all.

### Parallelism

- TASK_03 (Desi assessment, read-only) runs as a **background subagent** in parallel with TASK_01/02 (Cody inline). TASK_01 and TASK_02 are inline-sequential (share no files but share the build baton). TASK_04 last.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0355_TASK_01 | Cody | Primitive extension + consumer wiring. |
| SESSION_0355_TASK_02 | Cody/Doug | Small CTA + Playwright smoke. |
| SESSION_0355_TASK_03 | Desi (bg) → Petey | Read-only audit, disjoint, parallelizable. |
| SESSION_0355_TASK_04 | Doug/Petey | Verify + full close. |

### Open decisions

- None at plan-lock (four grill rounds resolved scope, API, avatar reach, counts, orchestration, smoke, push).

### Risks

- App-code changes deploy to live prod on push (no new migration this session; claim model already deployed in 0354).
- Rich rows must not break Base UI typeahead/a11y — `items` map stays `label`-only (mitigated by construction).
- Browser smoke may be flaky unattended (dev server + Playwright); push is code-green-gated, smoke is evidence.

### Scope guard

- No counts this session (deferred — needs server-side facet aggregation).
- No BBL profile production code — assessment/plan only.
- No Galaxy three.js pull-in — dedicated future session (stage a note).
- No carousel epic resume — mark dormant only.
- Collapsed trigger stays string-only — no rich-trigger render.

### Dirstarter implementation template

- **Docs read first:** local Dirstarter inventories + SESSION_0354/petey-plan-0355 (2026-06-07); `data-select.tsx`/filter actions read directly.
- **Baseline pattern to extend:** Base UI `Select` via the existing `DataSelect` wrapper; `ProfileClaimRequest` submit flow; `Avatar`/`Badge`/`Stack` primitives; `ProfileHero`.
- **Custom delta:** optional ReactNode dropdown rows; belt/logo/avatar row content; owner-less-org claim CTA; a profile-presentation contract assessment.
- **No-bypass proof:** extends the existing wrapper and reuses the claim contract + primitives; no parallel select, no parallel claim entry point.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0355_TASK_01 | landed | `DataSelect` `content?: ReactNode` row (+ `dataSelectRowContent` helper) + render test; `BeltSwatch` (SVG `fill`, no inline style) + `colorHex` added to admin rank-award query → belt swatches on the rank select; `tool-filters` moved back onto `DataSelect` (ReactNode exception removed). School-logo + person-avatar select rows = ComboboxSelector work → staged to petey-plan-0356 (Lane D). |
| SESSION_0355_TASK_02 | landed | Owner-less-org "Claim this organization" CTA on `/organizations` + `/schools` (sign-in-gated per SOP §5). Browser smoke: register CTAs + org claim CTA (both auth states) visually verified + screenshots; admin claims queue + admin belt-swatch unverified (dev-login user is role `user`, no placeholder persons seeded) — flagged. |
| SESSION_0355_TASK_03 | landed | Desi BBL profile-redesign assessment (background subagent) → `docs/petey-plan-0356-profile-redesign.md` (one Person-presentation contract; BBL teardown blocked by WebFetch denial — flagged; register/claim/invite = Dirstarter submit pattern lane). |
| SESSION_0355_TASK_04 | landed | Governance: 0337 stamped dormant; Galaxy session staged; glossary + custom-component-inventory + memory updated; gates green; graphify update + push. |
| SESSION_0355_TASK_05 | landed | Register-discoverability (operator add): `ListingRegisterCta` on `/schools` ("Add your school") + `/directory` ("Join the directory", logged-out) → existing `/organizations/new` + signup; dedup hint on the create-org form (interim of the Dirstarter search-first pattern). |

## What landed

- **Rich `DataSelect` labels (WL — operator request):** `DataSelectOption.content?: ReactNode` renders in the open dropdown row via the exported `dataSelectRowContent` helper, while `label` (string) still drives the collapsed trigger, the Base UI `items` map, typeahead, and a11y (`SelectItem` always gets `label={option.label}` so a ReactNode row never breaks typeahead). Render test proves it.
- **Belt-color swatches (first consumer):** new `BeltSwatch` primitive driven by `Rank.colorHex` (SVG `fill` — **no inline `style`**, per the brand-safe + no-inline-style rules); `colorHex` added to the admin rank-award query; `lineage-selected-rank-select` converted to `DataSelect` with swatch rows.
- **`tool-filters` back on `DataSelect`:** the documented ReactNode exception is removed (it extends the Dirstarter boilerplate `Select` via the wrapper — boilerplate is the proven fallback).
- **Owner-less-org Claim CTA:** `OrgClaimCta` on `/organizations/[slug]` + `/schools/[slug]` when `ownerId == null`, reusing the SESSION_0354 `ProfileClaimRequest` flow; sign-in-gated (`?next=`) per the lineage-claim SOP §5.
- **Register discoverability:** `ListingRegisterCta` surfaces the existing self-serve flows — "Add your school" (`/schools` → `/organizations/new`) and "Join the directory" (`/directory`, logged-out → signup); dedup hint on the create-org form.
- **Profile-redesign assessment (plan-only):** `docs/petey-plan-0356-profile-redesign.md` (Desi audit + the one Person-presentation contract + the staged Dirstarter-submit funnel + the ComboboxSelector logo/avatar follow-up).
- **Governance:** carousel epic 0337 stamped dormant; Galaxy three.js staged for a dedicated session.

## Decisions resolved

- **DataSelect API = per-option `content?: ReactNode`** (not a `renderLabel` prop); trigger stays string-only; `items`/typeahead unaffected (grill round 2).
- **One role-agnostic Person-presentation contract** anchors avatars-everywhere + the assessment (grill round 2): "instructor avatar should not be just for instructors."
- **Counts skipped this session** — corrected premise: only the tool filters pre-fetch `count`; directory/technique/school need new server-side facet aggregation (staged).
- **Logo/avatar select rows are ComboboxSelector work**, not DataSelect (the DataSelect consumers are filters + the rank select + the claim form) → staged to petey-plan-0356 Lane D.
- **Claim vs Register are distinct surfaces** + a dedup hint; the **unified search-first funnel (Dirstarter submit pattern) for all registers/claims/invites** is staged to the profile/onboarding epic (operator directive).
- **No inline styles** (operator): `BeltSwatch` uses SVG `fill`, not `style={}`.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/common/data-select.tsx` (+ `.test.tsx`) | `content?: ReactNode` + `dataSelectRowContent` helper; `SelectItem` always gets string `label`; +4 tests. |
| `apps/web/components/common/belt-swatch.tsx` (+ `.test.tsx`) | New `BeltSwatch` (data-driven SVG `fill`, no inline style) + 2 tests. |
| `apps/web/app/admin/lineage/_components/lineage-selected-rank-select.tsx` | Converted to `DataSelect` with belt-swatch rows. |
| `apps/web/server/admin/lineage/queries.ts` | `colorHex: true` added to the rank-award `rank` select. |
| `apps/web/components/web/tools/tool-filters.tsx` | Moved back onto `DataSelect` (ReactNode exception removed). |
| `apps/web/components/web/claims/org-claim-cta.tsx` | New owner-less-org Claim CTA (sign-in-gated). |
| `apps/web/app/(web)/organizations/[slug]/page.tsx`, `schools/[slug]/page.tsx` | Render `OrgClaimCta` when `ownerId == null`; school page adds `getServerSession`. |
| `apps/web/components/web/directory/listing-register-cta.tsx` | New register/join callout. |
| `apps/web/app/(web)/schools/page.tsx`, `directory/page.tsx` | `ListingRegisterCta` (Add your school / Join the directory). |
| `apps/web/components/web/organizations/create-organization-form.tsx` | Dedup hint (search-first interim). |
| `docs/petey-plan-0356-profile-redesign.md` | New profile-redesign epic plan (assessment). |
| `docs/petey-plan-0357-bbl-galaxy.md` | New Galaxy three.js staging note. |
| `docs/petey-plan-0337-lineage-responsive-carousel.md` | Dormant banner + frontmatter refresh. |
| `docs/sprints/SESSION_0355.md` | This session ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | Pass. |
| `bun test` (data-select 7, belt-swatch 2) | 9/9 pass. |
| `bunx biome check` (changed files) | Clean. |
| `npx fallow audit --changed-since HEAD` | No new dead code; findings are known false-positives (`tailwind-merge`, `@react-email/preview-server`, `react-dom`, pre-existing `AdminLineageTreeRow`); complexity flags are on pre-existing large functions, not regressions. |
| Browser smoke — `/schools` register CTA | ✅ "Add your school" renders. |
| Browser smoke — `/directory` register CTA (logged-out) | ✅ "Join the directory" renders (screenshot). |
| Browser smoke — owner-less org Claim CTA (logged-out) | ✅ "Sign in to claim" + unclaimed copy (screenshot). |
| Browser smoke — Claim CTA (dev-login) | ✅ relationship picker + Submit claim (sign-in gate flips). |
| Browser smoke — `/admin/claims` + admin belt-swatch | ⚠️ Not run — dev-login user is role `user` (admin routes correctly redirect); belt-swatch covered by unit test. |
| Browser smoke — person claim teaser | ⚠️ Not run — no placeholder persons seeded (gate-correct, nothing to render). |

## Open decisions / blockers

- **Lineage profile-drawer tier/role gate (operator bug, owed):** `renderPolicy.canOpenProfileDrawer` (FREE policy = false) prevents the drawer from opening for free/anon viewers, blocking the view/claim path. Operator: it must open for **everyone**; tier should gate the drawer's *contents*, not whether it opens. → next session.
- **Admin-side claim/belt-swatch browser smoke** still owed (needs an admin dev-login user + a placeholder-person seed).
- **Discovery-process gap (operator retro):** no org/directory/profile domain hub (only `lineage-hub.md`); domain hub + SOP + route inventory should be read at bow-in *before* planning. → next session (build the hubs; adjust the bow-in workflow).

## Next session

### Goal

**Discovery-process fix + the lineage-drawer gate bug + profile-redesign Lane A.** (1) Build the missing domain hubs (`organization` / `directory` / `profile` — or one combined hub) as *surface indexes* mirroring `lineage-hub.md` (existing routes + components + actions + SOP links, backlinks up/down), and adjust bow-in to read **domain hub → domain SOP → route inventory before planning** (the operator's "are we querying in the right workflow timeline?" retro). (2) Fix the lineage profile-drawer tier/role gate so it **opens for everyone** (`canOpenProfileDrawer`) — tier gates the drawer's *contents*, not whether it opens — so anyone can view info + reach the claim CTA. (3) Begin petey-plan-0356 Lane A (public profiles adopt the shared `ProfileHero` shell + org/school avatars) after re-running the live BBL WebFetch/screenshot.

### First task

Fix the lineage profile-drawer gate: in `lib/entitlements/lineage-tier-policy` set `canOpenProfileDrawer: true` for the FREE policy (and audit `lineage-tree-board` / `lineage-mobile-list` / `lineage-tree-canvas` / `lineage-compact-child-list` consumers) so the drawer opens for free/anon viewers, then verify a free viewer can open the drawer and reach the claim CTA. Then create `docs/runbooks/domain-features/organization-hub.md` (or `directory-org-profile-hub.md`) indexing the org/directory/profile routes + components + the wiring SOPs, and add a bow-in step to read the relevant domain hub before grilling.

## Review log

### SESSION_0355_REVIEW_01 — Rich DataSelect labels + claim/register hardening + profile assessment

- **Reviewed tasks:** SESSION_0355_TASK_01..05
- **Dirstarter docs check:** local inventories + the two wiring-flow SOPs (lineage §4–5 directory/claim, SOP §18 org registration) read; extends the `DataSelect` wrapper + reuses the `ProfileClaimRequest` contract + composes primitives; no parallel system.
- **Verdict:** Pass on the mechanically-verifiable axes and the claimant-side browser smoke. The named goal (rich `DataSelect` ReactNode rows + belt swatches + tool-filters move-back) is complete, green, and the API keeps the trigger/typeahead string-only by construction. The claim CTA + register CTAs are visually proven both auth states. Honest gaps: admin-side smoke (non-admin dev user) and the person teaser (no placeholder seed) are flagged, not faked; logo/avatar select rows correctly deferred to ComboboxSelector.
- **Score:** 8.7/10 locally; rises after admin-side smoke + the drawer-gate fix.
- **Follow-up:** drawer-gate bug; domain hubs + bow-in timing; Lane A profile shell.

## Hostile close review

- **Giddy:** Pass — `content?: ReactNode` extends the existing wrapper (no parallel select); `OrgClaimCta`/`ListingRegisterCta` reuse the existing claim contract + the existing `/organizations/new` flow (no parallel register system); `BeltSwatch` consolidates the bespoke belt-color treatments rather than forking.
- **Doug:** Pass-with-flag — typecheck + 9/9 tests + changed-file biome/fallow green; claimant-side claim + register CTAs browser-verified. Admin-side smoke + person teaser unrun (env-blocked), flagged.
- **Desi:** Pass — register/claim CTAs compose primitives, reduced-motion-safe; the assessment (petey-plan-0356) is the design deliverable. Caveat: live BBL teardown blocked (WebFetch denied) — must re-run before locking hero visuals.
- **Security review:** claim CTA reads only `org.ownerId`/`id`/`name` (no private leak); submit action enforces auth (`userActionClient`), owner-less precondition, brand scope, and per-claimant dedup server-side; sign-in gate uses `?next=`. No new migration this session.
- **Kaizen aggregate:** 8.7/10 — strong on the named goal + two funnel completions; held back by env-blocked admin smoke and the still-open drawer-gate bug.

### Findings (severity ≥ medium)

#### SESSION_0355_FINDING_01 — Lineage profile-drawer gated shut for free/anon viewers

- **Severity:** medium
- **Task:** (pre-existing; surfaced by operator this session)
- **Evidence:** `lib/entitlements/lineage-tier-policy` FREE policy `canOpenProfileDrawer: false`; consumers in `lineage-tree-board.tsx`, `lineage-mobile-list.tsx`, `lineage-tree-canvas.tsx`, `lineage-compact-child-list.tsx`.
- **Impact:** free/anon viewers cannot open the profile drawer, so they cannot view profile info or reach the claim CTA — defeats the discovery→claim funnel this session extended.
- **Required follow-up:** open the drawer for everyone; gate the drawer *contents* by tier, not the open itself (next-session first task).
- **Status:** open.

#### SESSION_0355_FINDING_02 — No org/directory/profile domain hub (discovery gap)

- **Severity:** medium
- **Evidence:** only `docs/runbooks/domain-features/lineage-hub.md` exists; no organization/directory/profile/onboarding hub. Existing flows (`/organizations/new`, claim system, directory routing) were rediscovered mid-session because no surface-index hub anchored planning, and Graphify was queried by narrow task noun + the wiring SOPs were read late.
- **Impact:** repeated AI rediscovery of existing capability; planning grounded late.
- **Required follow-up:** build the domain hub(s) + read domain hub → SOP → route inventory at bow-in before planning (next session).
- **Status:** open.

## ADR / ubiquitous-language check

- **ADR:** not required this session. The `DataSelect` `content` row extends an existing component (inventory entry, not a decision); the staged architectural directions (one Person-presentation contract; Dirstarter-submit pattern for all registers/claims/invites) live in `petey-plan-0356` and **warrant an ADR when Lane E (unified funnel) is built**, not before. Confirmed ADR 0023 (generic profile claim) governs the reused claim contract.
- **Ubiquitous language:** new terms — **`DataSelect` content row / `dataSelectRowContent`**, **`BeltSwatch`**, **Person-presentation contract**, **register vs claim** (register = create a new entity; claim = take over an existing owner-less/placeholder one), **listing register CTA**. Added to `repo-code-glossary`. Aligns with the existing Passport/DirectoryProfile/Organization/claim language.

## Reflections

- The most valuable moments were the operator's mid-session corrections — "no hardcoded inline styles" (→ `BeltSwatch` as SVG `fill`), "tool-filters is Dirstarter boilerplate, extend not replace," and "we also need people to register, not just claim." Each shifted a default I'd have shipped wrong. The claim-vs-register distinction in particular reframed half the lane.
- The honest miss this session is the discovery process, not the code: I asserted "/organizations/new is undiscoverable" from a grep that had errored on a glob. Lesson banked as a feedback memory + FINDING_02 — never assert a negative from an empty/errored search, and read the domain hub + SOP + route inventory *before* planning, not mid-build.
- Scoping the logo/avatar select rows to ComboboxSelector (not forcing them onto DataSelect) was the right "don't fork the primitive" call — the DataSelect consumers genuinely don't include person/org pickers.
- The browser smoke proved the claimant-side funnel honestly and flagged the admin-side gap rather than faking it; the drawer-gate bug the operator surfaced is the real next-most-important thing for the funnel to actually work end-to-end.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0355 + petey-plan-0356/0357 stamped `last_agent: claude-session-0355`, `2026-06-07`; 0337 frontmatter refreshed. |
| Backlinks/index sweep | `wiki/index.md` + `wiki/log.md` entries; `custom-component-inventory.md` (`DataSelect` content, `BeltSwatch`, `OrgClaimCta`, `ListingRegisterCta`). |
| Wiki lint | `bun run wiki:lint` — ✅ no violations (619 md files). |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0355_REVIEW_01 + Giddy/Doug/Desi/security + 2 findings. |
| Review & Recommend | Next session goal + first task written. |
| Memory sweep | `discovery-domain-hub-before-planning` (new); updated drawer-gate (now a bug), Select (rich rows + Combobox rule), MEMORY.md index. |
| Next session unblock check | Unblocked: drawer-gate fix + domain hubs are self-contained. |
| Git hygiene | Branch `main`; FS-0024 guard passed; commit `0cae6ac` pushed `67681f9..0cae6ac`. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` — incremental (146 nodes / 824 edges touched; communities 1453). |
