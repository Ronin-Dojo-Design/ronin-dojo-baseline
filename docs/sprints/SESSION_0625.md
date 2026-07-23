---
title: "SESSION 0625 — MMB Meeting Intake (Michael's notes → grilled, routed)"
slug: session-0625
type: session--open
status: in-progress
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0625
sprint: S12
lane: mmb
recipe: "Client_Meeting_Intake"
goal_ids: ["G-021"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0620.md
  - docs/sprints/SESSION_0624.md
  - docs/protocols/recipes/Client_Meeting_Intake.md
  - docs/product/mammoth-build/assets/Michaels_Notes_Meeting.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0625 — MMB Meeting Intake

> **Pre-staged stub (ADR 0049), staged by SESSION_0620.** **Parallel pair** with
> [SESSION_0624](SESSION_0624.md) (AM merge) — run in separate worktrees/lanes. First run of the newly
> synthesized [Client_Meeting_Intake](../protocols/recipes/Client_Meeting_Intake.md) recipe, applied to the
> Mammoth (MMB) instance. Lane facet `mmb` — consider the `/game-on` MMB overlay + MC-grill.

## Operator

Brian + <agent>-session-0625

## Goal

Absorb the **Michael Flores meeting notes** into MMB canon: grill → synthesize (brand heartbeat, pains,
commercial lanes, next actions) → **route to ledgers/PRD/STORIES/goals**, not prose. Follows the
`MMB_Initial_Intake` → `MMB_Meeting_Intake` line and the recent codex "Michael notes" capture.

## First tasks (game-on for Michael — operator-directed, run these first)

Run via **`/game-on`** (the MMB lean overlay). These pull up live so the operator can work *with* Michael:

1. **SotD artifacts preview — ALL BRANDS (show Michael builds on the spot).** Render + publish a frozen
   State-of-Dojo Artifact **with `NEXT_PUBLIC_SOTD_ALL_BRANDS=true`** so the **MMB panel is visible** (the live
   `/app/state` is BBL-scoped and *hides* MMB — see the note below). Republish after any on-the-spot build so
   Michael sees the MMB work land in real time. Use `/preview-artifacts`.
   ```bash
   NEXT_PUBLIC_SOTD_ALL_BRANDS=true bun scripts/state-of-project.ts   # → out/state-of-project.html (MMB shown)
   ```
2. **Fix the SotD projection so the MMB panel actually POPULATES (WL-P2-80) — do this before Task 1's
   preview or it shows an empty MMB tab.** Extend `scripts/state-of-project.ts` + `apps/web/lib/state-of-dojo/parse.ts`
   to project MMB work into the MMB panel: read the **`docs/product/mammoth-build/`** sessions/assets (and any
   `lane: mmb` sprint sessions like this 0625) + the MMB goals — the SotD currently reads only `docs/sprints/*`
   + `goals-ledger`, so the MMB tab is empty. **Stretch:** add a small "recently built / added" strip that
   surfaces new **recipe cards** + **product artifacts** (Client_Meeting_Intake, the onboarding form/contract)
   so governance/intake work is visible too. Behavior-preserving for the BBL panel; verify headless on
   `/app/state` (MMB tab now non-empty). This is the *real* fix behind the operator's "why isn't MMB on the
   SotD" catch — Task 1's preview becomes meaningful once this lands.
3. **Review the client onboarding form + contract** (recently added): the new-client onboarding process
   ([`research-review-new-client-onboarding.md`](../architecture/research-review-new-client-onboarding.md) +
   [`new-client-runbook.md`](../runbooks/onboarding/new-client-runbook.md)), the onboarding components
   (`apps/web/components/web/onboarding/dashboard-onboarding.tsx`), and the contract model
   (`apps/web/.generated/prisma/models/MembershipContract.ts`). Confirm with the operator which of these is
   "the" client onboarding form + contract to walk Michael through.
4. **Build the onboarding form as an interactive, live-fillable form** — **FeatureWidget-style**
   (`apps/web/components/web/feature-widget.tsx` is the pattern) so the operator can **type Michael's answers
   in live, or Michael can write them in himself**. This IS the interactive *capture* front-end for the
   [Client_Meeting_Intake](../protocols/recipes/Client_Meeting_Intake.md) recipe — its output feeds the grill
   → synthesize → route flow below. Demo-safe (no secrets/PII); reuse the uploader/R2 seam if it takes files.

> **SotD ↔ MMB wiring note (operator caught this — real gap, SESSION_0620).** The MMB tab **is** correctly
> wired (parser `classifySessionProduct` maps `lane: mmb` → the MMB panel). It reads **empty** because the
> SotD projects only `docs/sprints/*` + `goals-ledger`, and **only 3 sprint sessions are MMB** (0582, 0586,
> this 0625). The real MMB work — sales-cockpit build, Michael's meeting, MMB epic — lives in the **Mammoth
> vault (`MMB_SESSION_NNNN`) + `docs/product/mammoth-build/`**, which the SotD **does not read**. Plus recipe
> cards + product artifacts (onboarding form, contract) aren't projected at all. **Logged as WL-P2-80.**
> **To make MMB show for Michael:** either project the MMB vault / `docs/product/mammoth-build/` + MMB goals
> into the SotD (the real fix), or, short-term, keep MMB sessions as `lane: mmb` stubs in `docs/sprints/` (like
> 0625) so they at least populate the planned column. Task 1 still uses `ALL_BRANDS=true` to guarantee the tab
> renders.

## Next session

**Task — run the [Client_Meeting_Intake](../protocols/recipes/Client_Meeting_Intake.md) recipe on MMB.**

1. **Adopt the capture:** [`docs/product/mammoth-build/assets/Michaels_Notes_Meeting.md`](../product/mammoth-build/assets/Michaels_Notes_Meeting.md)
   (`status: captured-needs-grill`, `contains_real_data: false`). Confirm demo-safe.
2. **Grill (MC-grill + goal election):** resolve every ambiguous branch — what Michael wants the sales
   cockpit to *answer / do / feel*. Name the product north-star (already drafted in the notes: "know every
   prospect personally, make the next action effortless, carry every building opportunity through delivery")
   and elect goal #1. Flip the note `status` → `grilled`.
3. **Synthesize:** brand heartbeat + soul-of-sales (Brandon), ranked pains-worth-fixing-first, commercial
   lanes (steel supply / erection-install / concrete-excavation / building-only vs building+install), and
   the explicit next actions.
4. **Route to canon (the point):** MMB `PRD.md` / `STORIES.md` (`## Solution` sections), the goals ledger /
   vault LLL (elect G-021 sub-goals), planning/feature-intake rows for discrete slices, ADRs for decisions.
   One row per item; ledger is the single home (finding-router). Respect the authority split — monorepo owns
   specs, MMB DB owns records, vault owns live ops.
5. **Stage the follow-on** build lane off the routed backlog if ready.

**Done means:** notes `grilled` + demo-safe; every material ask a routed PRD/STORIES/goal/PL row with an id +
done-means; north-star + goal #1 elected; follow-on staged or intake explicitly closed. (Recipe `## Done means`.)

## Bow-in

Worktree `../ronin-0625` on `session-0625-mmb-intake` (canonical checked free via
`canonical-claim.sh` but left to the sibling lanes; `/worktree-setup` bootstrapped). Parallel-lane
assessment (opening.md §1d): the four first-tasks are **sequential, not disjoint** — task 2 gates
task 1's preview and tasks 3→4 are read-then-build on the same artifact — so no fan-out; run inline.
Stub adopted per ADR 0049 (`staged` → `in-progress`), no `cp`.

Petey's three questions asked via `AskUserQuestion` (opening.md §6b). Operator answers: run the
projection **fix before** the preview · the RDD `.docx` set **is** "the" onboarting form + contract ·
**stay** on the MMB lane (not the 3 open PRs).

## Task log

| ID | Status | Owner | Outcome |
| --- | --- | --- | --- |
| SESSION_0625_TASK_02 | ✅ done | inline Cody | **WL-P2-80** — SotD now projects brand canon. New pure-core `parseProductDocFile` + `bucketProductDocPhase` + `parseArtifactEntry` (`lib/state-of-dojo/parse.ts`), wired into BOTH feeds (`scripts/ledger-backlog.ts` local fs, `lib/state-of-dojo/fetch-state.ts` GitHub-raw). MMB board cards **3 → 10**, BBL **5 → 28**. Frozen kernel (`_kernel/*`, `state-panel.tsx`, `components/common/*`) **untouched** — product docs ride the existing `SessionDetail` shape, so `sessionToCard` renders them unchanged. Stretch landed: "Recently added" strip (25 recipe cards / templates / product assets), renderer-side. 15 new unit tests. |
| SESSION_0625_TASK_01 | ✅ done | inline Cody | All-brands SotD rendered + published as a frozen Artifact (see `## Artifacts`). Ran **after** task 2 so the MMB tab is populated, per the operator's call. |
| SESSION_0625_TASK_03 | ✅ done | inline Petey | Reviewed the onboarding form + contract — `docs/product/rdd/assets/` (`Initial_Client_Meeting_Template.docx` = the 15-question discovery agenda · `Master_Service_Agreement_Template.docx` = MSA + Exhibit A SOW · `NDA_Template.docx`). Confirmed Brandon's **de-Tableau flag is real**: the questionnaire still asks about "Tableau dashboards", "data sources", "KPIs". MSA §6.2/6.3 Background-Technology retention = the legal expression of kernel-is-the-moat — keep. Blank boilerplate; counsel + ESIGN gate before any executable instance. |
| SESSION_0625_TASK_04 | ✅ done | inline Cody | Built `/app/client-intake` — a live-fillable, FeatureWidget-pattern discovery form. The de-Tableau re-scope **lands here**: 15 questions 1:1 with the .docx, re-worded to RDD's software + design agency framing (a test asserts "tableau"/"dashboard"/"data analytics" are gone). **No server action, no DB model, no network call** — answers stay in browser state + `localStorage`, and leave only by Copy-as-Markdown / Download `.md`, in the `Michaels_Notes_Meeting.md` frontmatter shape the recipe already consumes. `contains_real_data` toggle stamps a do-not-commit banner. Reuse-only: every control is an existing L1 primitive. New authz key `clientIntake: "client-intake.manage"` in the existing per-area matrix (never a 5th system). |
| SESSION_0625_TASK_05 | ⏸️ held | inline Petey | `Client_Meeting_Intake` recipe run on Michael's notes — **capture + coverage audit done, grill held**. The 2026-07-18 intake was already largely routed (0571/0573/0582/0586 — STORIES Epics 8/9/10 say so), so this run is a coverage audit: **14 of 17** note sections routed, **3 genuine gaps** found (commercial-lane taxonomy → 2 drafted STORIES rows; install-vs-sales pipeline → an ADR; consulting-pipeline leave-behind → a PL row) and a **9-item owner-only decision queue**. Notes deliberately left at `captured-needs-grill` — flipping to `grilled` would claim a grill that has not happened. Delta held **out of git** per the session directive. |

## Gates

typecheck ✅ · oxlint ✅ · oxfmt ✅ · `bun run test` **1707 pass / 0 fail** (run with `RESEND_API_KEY`
stubbed — a live key sits in `.env` and the suite is a known live-send risk; the in-repo
`[email:test:no-send]` seam held, no mail sent) · `next build` **exit 0**, `/app/client-intake` in the
route manifest.

**Push gate: HELD** for the operator's explicit word. This touches `apps/web`, so a push fires CI +
the BBL prod deploy.

## Artifacts

- **State of the Dojo (all brands, MMB populated)** — <https://claude.ai/code/artifact/d0f4a36d-f29c-4f9d-ac2f-39e030555efd>

## Status

Single source of truth is the frontmatter `status:` field.
