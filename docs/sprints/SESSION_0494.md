---
title: "SESSION 0494 — Petey plan: experience epics (harden → Lineage Journey → mobile shell)"
slug: session-0494
type: session--plan
status: closed
created: 2026-07-03
updated: 2026-07-03
last_agent: claude-session-0494
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0493.md
  - docs/petey-plan-0494-experience-epics.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0494 — Petey plan: experience epics

## Date

2026-07-03

## Operator

Brian + claude-session-0494

## Goal

Planning session (operator phone-bound, post-surgery). Petey orchestrates: set the next few epics in detail
as vertical slices. Outcome = `petey-plan-0494` capturing **C → A → B**: harden the shipped feed +
component library, redesign the ancestry timeline into a scroll-driven "Lineage Journey," and build a mobile
shell (bottom nav + radial MAB). No code written — plan + decisions banked for a fresh build session.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0493.md`
- Carryover: 0493 shipped (community feed + ancestry timeline, PR #188 merged, prod green). Its "Next
  session" pinned phase-2 votes, but the operator repointed to a broader experience-design lane.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean except untracked `prod-live-dirty-dozen.jpeg` (a screenshot of the live Dirty Dozen blog post)
- Current HEAD at bow-in: `f031c818`

### Graphify check

- Graph status: current; stats at bow-in ~16,094 nodes / 31,731 edges / 2,161 communities.
- Queries used: `petey plan 0493 community feed ancestry timeline epic` → surfaced `petey-plan-0493` +
  the `petey-plan-0477` belt-journey epic (the "bigger name" the operator recalled).
- Verification note: opened the exact plan docs Graphify identified; navigation only.

### Grill outcome

Grill-complete across C/A/B. Forks resolved (operator):
- **Sequence C → A → B** (0494 = C then A; B = 0495). Use Fable-5 time on the creative A work.
- **Epic C scope** = feed + component library (harden `/posts` + audit shared cards/buttons/`BeltSwatch`/nav).
- **Founders fully data-driven** via a **storyboard admin CRUD** (scene cards, duplicate + plus, reorder);
  whole-chain editable, seeded with founders, reusable for any instructor.
- **Universal prologue** = Carlos Sr → Carlos Jr → **Rorion** → Rigan; **Bob Bass + dirty-dozen = conditional
  bridge scenes** driven by the member's walk (not always Bob).
- **Scroll bake-off** = v1 `motion/react useScroll` → v2 + Lenis → v3 GSAP (build progressively, compare).
- **ffmpeg approved** (`brew install ffmpeg`) for headless clip web-prep.
- **Epic B** = always-on bottom nav + movable Reddit-style radial MAB (toggle-off); fan = Claim/verify ·
  Create Post · Upload · Log promotion (role-gated via `can()`).

## Petey plan

### Goal

Author `petey-plan-0494` capturing the C → A → B epics as vertical slices, grounded by discovery.

### Tasks

See `## Task log`. Full build spec lives in
[`docs/petey-plan-0494-experience-epics.md`](../petey-plan-0494-experience-epics.md).

### Open decisions

Remaining forks (next session): story-table shape (rec `LineageStoryScene`) · storyboard CRUD depth ·
dirty-dozen roster + assets · Rorion/bridge quotes · Epic B tab set + MAB snap zones.

### Scope guard

- No code written this session — planning only.
- Do not polish the ancestry timeline in C (Epic A rebuilds it) — C baseline-scores it only.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0494_TASK_01 | landed | Host status check + bow-in + session-list orientation (0493 shipped, board surfaced) |
| SESSION_0494_TASK_02 | landed | Petey grill of the experience epics — C/A/B forks resolved with the operator |
| SESSION_0494_TASK_03 | landed | Grounding discovery — 3 code surveys (apps/web nav+MAB · BBLApp parity · ancestry timeline) + monorepo image inventory + founder-quote web research |
| SESSION_0494_TASK_04 | landed | Authored `petey-plan-0494-experience-epics.md` (C→A→B, vertical slices, forks) |
| SESSION_0494_TASK_05 | landed | Published the plan Artifact + ran bow-out |

## What landed

- **`petey-plan-0494-experience-epics.md`** — full C → A → B plan in vertical slices: the operating loop
  (Desi→Cody→Giddy 3-pass, ≥9.5 gate, Doug at the end), Epic C (feed + component-library harden), Epic A
  (Lineage Journey scrollytelling, data-driven storyboard, conditional bridges, scroll bake-off), Epic B
  (mobile shell + radial MAB).
- **Plan Artifact** published (BBL belt-themed, phone-friendly at-a-glance page):
  `https://claude.ai/code/artifact/cc466175-dfef-4f69-8fbf-27f8d421b7d0`.
- **5 discovery surveys** grounded the plan (and corrected assumptions: BBLApp has no radial MAB; Rorion is
  the real promoter; the Dirty Dozen already exists as a published blog `Post`; Rorion is the one missing
  founder image).
- **ffmpeg install** approved + kicked off (background) for headless video web-prep.
- Founder-quote research (Carlos Sr / Jr / Rigan) captured with source-verify caveat.
- Laptop caffeinated 12h (operator away / recovering).

## Decisions resolved

All in `## Bow-in → Grill outcome` above (sequence, C scope, data-driven storyboard, prologue + conditional
bridges, scroll bake-off, ffmpeg, Epic B shell + radial actions). Mirrored in the plan doc's "Resolved
(operator)" line.

## Files touched

| File | Change |
| --- | --- |
| `docs/petey-plan-0494-experience-epics.md` | NEW — the C→A→B experience-epics plan |
| `docs/sprints/SESSION_0494.md` | NEW — this planning session record |
| `docs/knowledge/wiki/index.md` | Added the SESSION_0494 row |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bash scripts/bow-out-gates.sh` | docs-only close; format 0 code files; wiki:lint 0 err/23 warn; build skipped; graphify nodes=16199 |
| Discovery surveys (5 sub-agents) | all returned; findings folded into the plan |
| `next build` | not run — no `apps/web/**` changes (docs-only) |

## Open decisions / blockers

- Remaining forks (see Petey plan → Open decisions) resolve at the start of the 0494 build session.
- **Stray asset:** `prod-live-dirty-dozen.jpeg` in repo root is untracked — operator to decide keep vs
  gitignore vs move to `apps/web/public`. Left out of this commit.
- ffmpeg install completing in the background (approved) — verify present before slice A5.

## Next session

### Goal

Start the 0494 build: **Epic C** (harden `/posts` + shared component library through the operating loop),
then open **Epic A** (Lineage Journey v1 — `LineageStoryScene` model + storyboard CRUD + `motion/react`
scroll scaffold). Standing alternative if the operator repoints: board P0 **Brian Truelson onboarding**
(FI-001 / G-001).

### First task

Run Epic C **pass-0 baseline**: dispatch Desi to score `/posts` + the shared component library (cards,
buttons, `BeltSwatch`, nav) against the code-quality rubric (read-only, no push), producing the improvement
notes that feed Cody's C1/C2 slices. Confirm ffmpeg installed. Then Cody pre-flight → build.

## Review log

### SESSION_0494_REVIEW_01 — planning session

- **Reviewed tasks:** SESSION_0494_TASK_01–05.
- **Method:** Petey grill (operator, tappable forks) grounded by 5 discovery surveys before locking.
- **Verdict:** A complete, well-grounded C→A→B plan captured as vertical slices; every operator ruling
  recorded; discovery corrected multiple starting assumptions before they hardened into the plan. No code —
  build validation deferred to the 0494 build session.
- **Score:** planning-only — no ship score.
- **Follow-up:** resolve the remaining A/B forks at build start; likely ADR at Epic A build (data model + a
  new scrollytelling render doctrine).

## Hostile close review

Not applicable — planning / docs-only session, no code shipped. Giddy/Doug/Desi hostile review applies when
Epic C/A actually build (per the operating loop, Doug verifies at each epic's end).

## ADR / ubiquitous-language check

- **ADR update:** not required this session (planning only). **Flagged for Epic A build:** the fully
  data-driven `LineageStoryScene` model + the "universal prologue / conditional bridge" scrollytelling
  doctrine likely warrant an ADR (data-model + render-doctrine decision) when A is built.
- **Ubiquitous language:** new terms staged in the plan — *storyboard admin CRUD*, *universal prologue*,
  *conditional bridge scene*, *LineageStoryScene*, *radial MAB* — to be added to `ubiquitous-language.md` when
  they land in code.

## Reflections

- **Discovery reshaped the plan for the better, repeatedly.** Planning against five surveys instead of memory
  caught things that would have shipped wrong: BBLApp never had the radial MAB the operator remembered (it's a
  center-create bottom-sheet), Rorion — not just Rigan — is the promoter the founder video captures, the Dirty
  Dozen already exists as published editorial (so bridge scenes deep-link it), and Rorion is the *only*
  missing founder image. Ground-before-lock earned its keep.

- **The vision compounded as it met reality.** "3 founders + a simple editor" became "Carlos Sr → Jr → Rorion
  → Rigan + conditional dirty-dozen bridges, driven by a storyboard CRUD." Reflecting the brain-dump back as
  organized epics let the operator sharpen it fork by fork without threads dropping.

- **Fully data-driven over hybrid was the right long-run call.** The storyboard admin CRUD (cards, duplicate,
  plus-buttons) is the payoff — it turns a one-off cinematic into a reusable, editable surface for any
  instructor, which is exactly the platform-not-product instinct.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0494 (new, full frontmatter, status closed) + petey-plan-0494 (full frontmatter) + wiki index row |
| Backlinks/index sweep | petey-plan-0494 pairs_with SESSION_0493/0494 + ADR 0035/0042; SESSION_0494 pairs_with petey-plan-0494; wiki index += SESSION_0494 |
| Wiki lint | `bun run wiki:lint` — 0 err / 23 warn (pre-existing; none introduced — gate runner) |
| Kaizen reflection | yes — `## Reflections` (3) |
| Hostile close review | not applicable — planning/docs-only (SESSION_0494_REVIEW_01) |
| Review & Recommend | Next session goal written (Epic C pass-0 → Epic A); board P0 alternative surfaced |
| Memory sweep | new project memory `petey-plan-0494-experience-epics` + MEMORY.md index row |
| Next session unblock check | unblocked — First task = Epic C pass-0 Desi baseline (read-only, doable) |
| Git hygiene | branch main; single docs commit; NOT pushed — explicit-push-authorization; hash reported at bow-out |
| Graphify update | nodes=16199 edges=31935 communities=2213 (gate runner, pre-commit) |
