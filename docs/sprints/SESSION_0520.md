---
title: "SESSION 0520 — FI-001 pre-send blockers: profile/belt/certs bugs + timeline on profile"
slug: session-0520
type: session--open
status: in-progress
created: 2026-07-09
updated: 2026-07-09
last_agent: claude-session-0520
sprint: S7-first-tester-readiness
pairs_with:
  - docs/sprints/SESSION_0519.md
  - docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0520 — FI-001 pre-send blockers: profile/belt/certs bugs + timeline on profile

## Date

2026-07-09

## Operator

Brian + claude-session-0520

## Goal

The FI-001 send gate is **re-expanded by operator directive**: Brian Truelson's onboarding email is
held until his own first-tester loop is correct. This session clears the three data-correctness bugs
(admin Update User not persisting, belts locked to White Belt 4-stripes, certificates page inert) and
surfaces the vertical scrollytelling timeline (the USP) onto the profile page. The profile
design-consistency pass and the parked lineage-explorer visual expansion are sequenced after.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0519.md`.
- Carryover: 0519 closed WL-P2-42 (all live RankAward writers routed through the RankEntry
  compatibility boundary). Its `Next session` block seeded "present Brian's email for approval."
  **Operator overrode that at bow-in** (grill-me): the send is NOT next — a concrete pre-send
  blocker list must land first.

### Branch and worktree

- Branch: `main`.
- Worktree: `/Users/brianscott/dev/ronin-dojo-app` (canonical, node_modules present).
- Status at bow-in: clean.
- Current HEAD at bow-in: `f5b90880`.
- FS-0024 guard: canonical cwd + `Ronin-Dojo-Design/ronin-dojo-baseline` origin confirmed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth/admin server actions (users), Prisma (belt/RankEntry), Media (uploader), lineage UI islands. |
| Extension or replacement | Extension: fix wiring on existing custom BBL surfaces; no baseline capability replaced. |
| Why justified | These are correctness bugs on already-built custom surfaces (profile, belt, certs, timeline). |
| Risk if bypassed | First real tester lands on a profile showing wrong/uneditable data — funnel credibility damage. |

### Grill outcome

Resolved with the operator (grill-me) before any code:

1. **Frame — two groups.** Group 1 (Brian's own loop) gates the send; Group 2 (lineage-explorer
   visual expansion) is documented as direction, never gates the send.
2. **Timeline promoted into Group 1, top priority** — "the most important visual," Tony Hua loves it,
   the USP. It renders **on the profile page** (part of Brian's own record), not only the public explorer.
3. **Session slicing.** Next session (this one) = bugs (1,5,7) → timeline (8). The profile
   design-consistency pass (2,3,4,6) is the following session.
4. **Profile design target (later session, spec locked now):** profile page aligned with the
   ronin-dojo-monorepo BBLApp; **edit = inline-in-place on the profile page itself** (button toggles
   edit, as user or admin) by **porting the existing `LineageProfileDrawer` inline-edit pattern**;
   **retire the separate profile edit pages** — one profile surface (one-surface law). Timeline gets
   its own design pass.
5. **Group 2 parked** (documented, not vital): v2 cards promotion; new tree-view toggle + file-tree
   style + operator's uipkge.dev components (org-chart / tree-chart / timeline / tree-table / sheet);
   another BBL Galaxy attempt. → goals-ledger G-008.
6. **Send explicitly deferred:** nothing to `btruelson@gmail.com` until Group 1 lands AND operator says go.

### Grounding (code, not proof)

- **Timeline (8):** `components/web/lineage/lineage-cohort-timeline/` is built and mounted in
  `lineage-view-a-island.tsx` (View A) — gap is surfacing + profile placement, not building.
- **Certs (7):** `app/app/certificates/{page,new,[id]}` surface exists (table/delete dialog) —
  "does nothing" = actions unwired, not missing pages.
- **Admin Update User (1):** no `revalidatePath` in `server/admin/users/actions.ts` — consistent with
  the stale-revalidate "saves but reverts" class (admin `/admin`→`/app` migration).
- **Belts (5):** to diagnose — recently touched by 0519's RankEntry writer consolidation.

## Petey plan

### Goal

Clear the three FI-001 pre-send bugs and surface the scrollytelling timeline on the profile page.

### Tasks

#### SESSION_0520_TASK_01 — Diagnose the three bugs

- **Agent:** Explore / diagnose (fan-out; disjoint surfaces).
- **What:** Root-cause admin Update User non-persist (1), belt-edit lock (5), inert certificates (7).
- **Done means:** each bug has a confirmed root cause + a minimal fix plan sized.
- **Depends on:** nothing.

#### SESSION_0520_TASK_02 — Fix admin Update User persistence (bug 1)

- **Agent:** Cody. **Depends on:** TASK_01.
- **Done means:** editing a user in `/app` admin persists and survives navigation.

#### SESSION_0520_TASK_03 — Fix belt editing (bug 5)

- **Agent:** Cody. **Depends on:** TASK_01.
- **Done means:** all belts (not just White Belt 4-stripes) can be edited/added with date/promoter/school.

#### SESSION_0520_TASK_04 — Wire certificates page (bug 7)

- **Agent:** Cody. **Depends on:** TASK_01.
- **Done means:** the certificates surface performs its intended actions end-to-end.

#### SESSION_0520_TASK_05 — Surface the scrollytelling timeline on the profile page (feature 8)

- **Agent:** Cody. **Depends on:** nothing (disjoint from bug files).
- **Done means:** the vertical cohort/scrollytelling timeline renders on the profile page and is
  reachable in the lineage explorer view options.

#### SESSION_0520_TASK_06 — Verify the diff

- **Agent:** Doug. **Depends on:** TASK_02–05.
- **Done means:** gates pass; each fix behavior-verified live; no regression to the RankEntry boundary.

### Parallelism

TASK_01 first (diagnosis grounds sizing). TASK_02/03/04 touch disjoint surfaces (users action /
belt / certificates) — parallelizable but one coherent Cody unless a bug proves large. TASK_05
(timeline) is disjoint from the bug files and can run alongside. Doug last.

### Open decisions

- None at plan-lock. Bug root causes are code-answerable (TASK_01).

### Scope guard

- No send to Brian; no push/merge/deploy without explicit operator word.
- No profile design-consistency pass (2,3,4,6) this session — that is the following session.
- No Group 2 visual-expansion work (v2 cards / tree toggles / BBL Galaxy) — parked in G-008.
- Do not alter the 0519 RankEntry writer boundary semantics while fixing belt editing.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0520_TASK_01 | completed | 4-way parallel diagnosis: revalidate gap (users), RankEntry ceiling collapse (belt), orphaned issue action (certs), timeline already mounted on profile. |
| SESSION_0520_TASK_02 | completed | TWO layered bugs fixed + browser-verified: inert `type="button"` save button (`user-form.tsx`) AND missing layout revalidation (`updateUser`/`updateUserRole`). Round-trip proven: submit → DB write → nav away/back → fresh value. Sweep found 19 sibling forms with the same inert-button class → dedicated fix task dispatched. |
| SESSION_0520_TASK_03 | completed | Durable fix landed: read ceiling now RankAward-sourced (same helper as the write gate), cards stay RankEntry-sourced; orphan-entry regression test added (31/31 pass). Browser-verified: all belts to Black-1st editable, above locked w/ promotion CTA. Live prod parity probed read-only: 63/63 awards↔entries, 0 orphans — prod data already healed; unpushed 0519 commit closes the writer hole. |
| SESSION_0520_TASK_04 | completed | Issue-certificate dialog built (walk-in-dialog pattern, `findActiveUsers` picker — User id-space verified); action revalidation fixed to layout-typed. Browser-verified end-to-end: seed template → Issue dialog → issuance row → public verify page shows “✓ Valid Certificate”. PDF render + physical orders confirmed UNBUILT (scope decision open). |
| SESSION_0520_TASK_05 | completed (verification) | Scrollytelling timeline ALREADY renders on both `/directory/[slug]` and `/me` (LineageStorySequence via AncestrySection) — screenshot-verified. Remaining ask = prominence + an explorer “timeline” view toggle → folds into FI-024 design pass / G-008. |
| SESSION_0520_TASK_06 | completed | Doug hostile pass 8.9/10: fixes structurally sound (Base UI default-type premise verified in node_modules; belt parity structural; schema move single-consumer; no sweep collateral). P1 oxfmt + P2 FI-020 ID collision fixed; P3 riders applied (createPerson + revokeCertificate layout revalidate). Post-fix gates: format:check 1875 files PASS, typecheck PASS, focused tests re-PASS. |
| SESSION_0520_TASK_07 | completed | Inert-button sweep (same class as FI-025): 19 RHF-action forms audited — 13 inert buttons fixed (`type="submit"`), 6 already working via header onClick. Standout: the member-facing feedback widget was submit-only-via-hotkey — mouse users could never send feedback. |

## What landed

- **FI-025 (admin Update User):** TWO layered bugs — the Update-user button was inert (Base UI `Button`
  defaults `type="button"`; no onClick) so clicking did literally nothing, AND `updateUser`/
  `updateUserRole` only revalidated the list path so the dynamic `[id]` page re-rendered stale.
  Fixed both; `createPerson` aligned for consistency. Browser round-trip proven.
- **Inert-button sweep:** 13 more forms with the same dead-save-button class fixed (incl. the
  member-facing feedback widget — previously submit-only via mod+Enter — and the newsletter CTA);
  6 audited as already-working (header-button onClick pattern).
- **FI-021 (belt lock):** read ceiling re-sourced from RankAward (the write gate's exact helper) so
  entry-coverage gaps can never falsely lock belts again; orphan-entry regression test added.
  Browser-verified: all belts to Black-1st editable, higher ranks locked with promotion CTA.
  Read-only live-prod probe: 63/63 award↔entry parity, 0 orphans — prod data already healed;
  the unpushed 0519 commit closes the writer-side hole on deploy.
- **FI-022 (certificates):** Issue-certificate dialog wired to the orphaned `issueCertificate`
  action (walk-in-dialog pattern; User-id-space picker verified); issue+revoke revalidation made
  layout-typed. Browser-verified template → issue → public verify "✓ Valid Certificate".
  PDF rendering + physical orders confirmed unbuilt (separate scope decision).
- **FI-023 (timeline):** verified ALREADY RENDERING on `/directory/[slug]` AND `/me`
  (LineageStorySequence via AncestrySection — "the hand-coded BBLApp design Tony Hua asked for
  twice"). Remaining ask = prominence + explorer view-toggle → FI-024/G-008 design lane.
- **Governance:** FI-001 send gate re-expanded (operator grill); FI-021–FI-025 blocker rows +
  G-008 (parked visual expansion) recorded; duplicate-React-key defect on `/app/users/[id]`
  spawned as a chip task.

## Decisions resolved

- FI-001 send gate re-expanded by operator; the "only operator go remains" ledger line was stale.
- Group 1 (Brian's loop) gates the send; Group 2 (visual expansion) parked as G-008 direction.
- Timeline is a Group-1 profile-page feature, top visual priority.
- Profile edit collapses to one inline-edit surface (LineageProfileDrawer pattern); edit pages retire.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0520.md` | Opened the session; recorded the grill outcome + plan. |
| `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` | Re-gated FI-001; added blockers FI-021–FI-025 (Update-User row is FI-025 — FI-020 was already taken by the 0499 pinned 2-axis-explorer idea; the closed-session ID keeps precedence). |
| `docs/knowledge/wiki/goals-ledger.md` | Added G-008 (parked lineage/profile visual expansion). |

## Verification

| Command / smoke | Result |
| --- | --- |
| Browser: `/app/users/[id]` Update user → DB → nav away/back | PASS — value persists and renders fresh (both bug layers) |
| Browser: `/app/profile?tab=belts` (dev-login) | PASS — ceiling at Black-1st; 22 editable/addable, 9 locked w/ promotion CTA |
| Read-only prod Neon probe (`.env.prod`, count-only) | PASS — 63 RankAwards / 63 RankEntries / 0 orphans |
| Browser: cert template → Issue dialog → issuance → `/certificates/verify/[code]` | PASS — "✓ Valid Certificate"; proof data deleted after |
| Browser: `/directory/brian-scott` + `/me` scrollytelling | PASS — story scenes render (screenshot in transcript) |
| `bun test server/belt/router.integration.test.ts` | PASS — 31/31 incl. new FI-021 orphan-entry regression |
| `bun test server/admin/certificates/issuance-actions.safe-action.test.ts` | PASS — 1 test / 8 assertions (re-run post-riders) |
| `bun test server/admin/users/create-person.safe-action.test.ts` | PASS — 1 test / 4 assertions (re-run post-riders) |
| `bun run typecheck` (apps/web) | PASS |
| `bunx oxlint` (25 touched files) | PASS — only pre-existing warnings on untouched lines |
| `bun run format:check` (apps/web, 1875 files) | PASS (after Doug's P1 oxfmt fix) |
| `git diff --check` | PASS |
| Doug hostile review | 8.9/10 — sound; P1/P2 fixed in-session, P3 riders applied |

## Open decisions / blockers

None. Push and Brian's send remain explicitly unauthorized.

## Next session

### Goal

Profile design-consistency pass: BBLApp-aligned profile page, one-surface inline edit (port
LineageProfileDrawer), uploader-not-URL cleanup, belt-card readability, timeline design pass.

### First task

Desi audits the current profile view + edit surfaces vs the ronin-dojo-monorepo BBLApp and the
LineageProfileDrawer inline-edit pattern; returns the prioritized conform list for Cody.

## Review log

### SESSION_0520_REVIEW_01 — Doug diff verification

- **Reviewed tasks:** TASK_02–05 + sweep. **Verdict:** sound, 8.9/10 — P1 (oxfmt) + P2 (FI-020 ID
  collision) fixed in-session; P3 riders (createPerson + revokeCertificate layout revalidate) applied.
- Cleared hostile checks: Base UI default-type premise verified in node_modules; belt parity structural;
  schema move single-consumer; sweep zero-collateral (no Cancels, no nested forms, no misses).

### SESSION_0520_REVIEW_02 — code-quality matrix scores (post fallow-fix-loop)

- **Belt read-ceiling fix** — Class B. Composite **9.3/10**, no cap (headless + tests + prod probe).
- **Certificate issuance** — Class B. Composite **9.2/10**, no cap. Race fix headless-proven; dialog +
  `recipient-options` helper JETTY'd + inventoried this pass.
- **Users revalidation + inert-button sweep** — Class A. Composite **9.3/10**, no cap.
- **Verdict (matrix §5):** Strong — ship with named follow-ups: ctx-revalidate typed param; `expiresAt`
  temporal bounds; slim gate-only award select; inherited ReportForm/WalkInDialog CRAP.
- Basis: code-quality-matrix §2–§6; fallow delta dead-code 9→8, dupes 53→51, audit gate ✗→✓.
