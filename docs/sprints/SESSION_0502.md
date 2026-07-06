---
title: "SESSION 0502 — grill 4 queued decisions + draft the page-code-review recipe, run it on page #1"
slug: session-0502
type: session--open
status: in-progress
created: 2026-07-06
updated: 2026-07-06
last_agent: claude-session-0502
sprint: S49
pairs_with:

  - docs/sprints/SESSION_0501.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0502 — grill 4 queued decisions + draft the page-code-review recipe, run it on page #1

## Date

2026-07-06

## Operator

Brian + claude-session-0502

## Goal

Two parts, grill-before-build. **PART 1:** resolve four queued operator decisions with no build until each
is settled — (a) Command Deck verdict (`/app/beta/command-deck` vs shipped `/app/sections`, both on ONE
`config/admin-sections.ts`): promote / keep-in-beta-with-purpose / DELETE; (b) FI-001 Truelson real send —
walk the exact fires (`--send` then `--grant`), blast radius, rollback, get explicit "send Brian now" or
park; (c) PWA icons chip (`task_8f36f0c6`) — show the rasterize script before running, decide this-session
or stay-chipped; (d) `/me` passport re-home chip (`task_5e5d3946`) — grill extract-shared vs duplicate
(ADR 0040 one-primitive rule). **PART 2 (the real deliverable):** draft + grill the SHAPE of a replayable
per-page **page-code-review** recipe (fallow baseline → KISS/DRY/YAGNI + reuse-first scored vs the
code-quality matrix → behavior-preserving Cody fixes via `/fallow-fix-loop` → re-verify with affected e2e +
repo-wide format:check → re-run fallow to prove deltas), settle page inventory + order + pages-per-session +
where the recipe lives + done-means, then run it on page #1. Hold at the push gate.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0501.md`
- Carryover: 0501 shipped nine lanes (ADR 0002 reconciliation, vercel ignoreCommand md-exclude, admin-nav
  ONE-config → `/app/sections` + regrouped sidebar + beta Command Deck, PWA installable shell w/ placeholder
  icons, SOP de-stale, profile polish incl. passport re-home on directory `fa9a3aa3`, belt-facts hybrid CRUD).
  This session picks up the four queued chips/decisions it left open and stands up the page-review program.
  0501's own "Next session" (the `/app/users/[id]` belts tab) is **superseded** by this directive (operator
  wins over canon) and stays queued — may fold into the page-review program when `/app/users` gets its pass.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app` (own `session-0502-page-review` worktree to be created
  only if/when a code chip or a page-review fix is greenlit)
- Status at bow-in: clean except two untracked prod screenshots (`prod-live-dirty-dozen.jpeg`,
  `tony-hua-lineage-timeline-prod.jpeg`) — pre-existing, not mine; leave/ignore.
- Current HEAD at bow-in: `7da63d9f` (= origin/main; SESSION_0501 closed, all CI green)
- Worktree hygiene noted: fallow temp base-cache worktrees present under `/private/var/.../fallow-audit-*`
  (do NOT touch); one **stale** worktree `../ronin-0485-blog` on `session-0485-blog` @ `b444a204` — flag for
  prune at close.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None at plan-lock (Part 2 is a review-recipe; Part 1 chips are net-new chrome/assets). The recipe's reuse-first check measures pages AGAINST the Dirstarter L1 + custom-component-inventory. |
| Extension or replacement | Extension — a replayable review protocol layered on the existing fallow + code-quality + fallow-fix-loop tooling; no new engine. |
| Why justified | Every page needs a repeatable KISS/DRY/YAGNI + reuse pass; a ratified recipe prevents re-deriving the loop per page. |
| Risk if bypassed | Ad-hoc page cleanups drift in scope + rigor; regressions slip because e2e/format:check re-verify isn't enforced per-page. |

Live docs checked during planning: not applicable at bow-in (recipe draft); per-page passes will check L1
alignment for the page's file set.

### Grill outcome

Round 1 (four gates):

- **FI-001 Truelson — PARKED again** (operator). No `--send`/`--grant`/`--backfill` this session; stays gated.
- **Page-code-review recipe — APPROVED as drafted** (incl. Step-0 file-set bound + baseline-as-artifact,
  protocol-not-skill-yet, 1 page/session). **Page #1 = `/directory/[slug]`.**
- **Command Deck — CONVERGE, do NOT delete** (operator loves both the Deck and the filtered `/app/sections`).
  Verdict = merge to ONE "best of both" surface; Round-2 grill resolves *what to keep from each*. (Time-box
  closes on the duplication by unifying, not by arbitrary deletion.)
- **/me passport re-home — ESCALATED.** Operator reframed: the passport chip is a symptom; the real problem
  is **profile pages are half-wired across multiple sessions — they 404 or show only the claim-section copy
  instead of a real profile.** Directive: figure it out definitively here. This IS `/directory/[slug]`
  (page #1), so the profile fix and the recipe's first run **converge**. Round-2 grill after a wiring
  diagnosis (no grilling on guesses).

Round 2 (post-diagnosis):

- **Profile diagnosis (Explore, evidence-backed):** NOT a random bug — a design decision biting the operator.
  A claimed member sees a **full** profile at `/me` (owner projection, no gate) but **preview-only** publicly
  at `/directory/[slug]`, because full public render is gated behind a **paid tier** (`LINEAGE_PREMIUM+`) and
  **claiming grants no tier**. Compounded by **two parallel read models** (`/me` always-full projection vs
  `/directory` tier-gated projection = the "half-baked" duplication) and a **404 gap** (directory links to
  people not in a published claimable tree `notFound()` instead of a claim teaser). Root cause = "working as
  designed" → fix is a **product decision + consolidation**, not a bug hunt. Evidence:
  `server/web/directory/queries.ts:105-171`, `lib/entitlements/lineage-tier-policy.ts:78-92`.
- **Command Deck ⊕ Sections — CONVERGE (resolved):** keep the flat scannable grid as base + **top
  search/filter + swipe pills (as quick-jump) + live count badges + expressive bento/motion/haptics**; the
  unified surface becomes the **default `/app` index** (delete `/app/beta/command-deck`; fold/demote the
  metrics Dashboard). **Queued as the immediate NEXT chip — not this session** (operator: profile fix first).
- **Free-claimed-profile packaging (resolved):** **full BASIC profile free on claim** (name, avatar, rank,
  school, lineage, bio); **premium/elite gate rich media** (cover photo, video intro, social links, location,
  analytics). Profile is the funnel/asset (BBL north star); rich media is the upsell.
- **Structural (resolved):** **consolidate to ONE profile read-model** feeding both `/me` and
  `/directory/[slug]` (tier/owner as a parameter, not a fork).
- **Sequencing (resolved):** **profile fix (page #1) ONLY this session**; Command Deck index next.

## Petey plan

### Goal

Resolve the four queued decisions, ratify the page-code-review recipe shape, then run the recipe on page #1.

### Tasks

#### SESSION_0502_TASK_01 — Grill 4 queued decisions (Command Deck · FI-001 · PWA icons · /me passport)

- **Agent:** Petey (grill) — no build until each is resolved
- **What:** Present each decision with a recommendation + the open fork; collect operator verdicts.
- **Done means:** each of the four has an explicit operator verdict recorded in `Grill outcome`.
- **Depends on:** operator.

#### SESSION_0502_TASK_02 — Draft + grill the page-code-review recipe SHAPE

- **Agent:** Petey (grill) → docs artifact
- **What:** Present the drafted 5-step recipe, page inventory + order, pages-per-session, home (skill vs
  protocol vs extend `/fallow-fix-loop`), and done-means; refine with the operator.
- **Done means:** recipe shape ratified; home + inventory + done-means locked.
- **Depends on:** operator.

#### SESSION_0502_TASK_03 — Run the ratified recipe on page #1 = `/directory/[slug]` (the profile fix)

- **Agent:** Giddy (one-model structural shape, paid-tier de-risk) → Cody (build) → Doug (verify)
- **What:** Execute the recipe on `/directory/[slug]`. The "fix" is behavior-*changing* by intent (logged as
  the recipe's first deliberate exception to behavior-preserving): (1) collapse the two projections into ONE
  profile read-model parameterized by viewer/owner/policy; (2) repackage — free claimed = full BASIC
  (name/avatar/rank/school/lineage/bio), premium/elite gate rich media (cover photo/video intro/social
  links/location); (3) `notFound()` → claim teaser for non-claimable-tree links; (4) fix `""`-vs-`null`
  policy-userId smell.
- **Steps:** Step 0 bound file set → Step 1 fallow baseline (artifact) → Giddy one-model shape → Cody build →
  Step 4 re-verify (directory-profile + `/me` + claim-funnel + tier-gating e2e, format:check, gates) →
  Step 5 fallow delta + `/code-quality` score logged.
- **Done means:** claimed profiles render full-basic publicly; ONE read-model; premium still gates rich media
  (no paid-value regression, proven by e2e); 404-teaser; fallow deltas ≤ baseline; scores logged.
- **Depends on:** TASK_02 ratified (done) + operator go per push gate.

#### Queued (NOT this session)

- **Command Deck unified `/app` index** — converge-all (grid + search + pills-quick-jump + live counts +
  bento/motion/haptics) as the default index; delete `/app/beta/command-deck`; fold/demote metrics Dashboard.
- **PWA icons chip** (`task_8f36f0c6`) — needs a square brand mark (logo.svg is a wide wordmark); show sharp
  script before running.
- **FI-001 Truelson** — parked (operator).

### Parallelism

TASK_01 and TASK_02 are grill-first and block the build tasks. Any greenlit Part-1 chips (PWA icons,
/me passport) are independent of the page-review run and can sequence after the recipe run or in their own
worktree — decided at grill. Do not fan out builders until the operator picks what runs this session.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0502_TASK_01 | Petey | four open decisions — grill, no build |
| SESSION_0502_TASK_02 | Petey | recipe-shape design decision — grill + draft |
| SESSION_0502_TASK_03 | Cody→Doug (per recipe) | scoped page cleanup once recipe ratified |

### Open decisions

- **Command Deck verdict** — promote (what would "promote" mean: default admin index? dashboard?) / keep in
  beta with a stated purpose / DELETE (time-boxed duplication rule).
- **FI-001 Truelson real send** — explicit "send Brian now" (then `--send`, then `--grant`) or park again.
- **PWA icons chip** — run this session (show rasterize script first) or stay chipped.
- **/me passport re-home** — extract shared primitive vs duplicate the directory treatment.
- **Page-code-review recipe** — shape, page #1 + order, pages/session, home, done-means (PART 2).

### Risks

- FI-001 has irreversible side-effects (a real email cannot be unsent) — treat as a hard push-gate item.
- Recipe scope creep: a "review" that becomes a rewrite breaks the behavior-preserving contract — keep fixes
  behavior-preserving; anything structural becomes its own ticket.

### Scope guard

- No build on any of the four decisions until the operator resolves it.
- No FI-001 real send without explicit operator "send Brian now."
- Behavior-preserving fixes only in a page-review pass; e2e + format:check re-verify are mandatory (0495/0501).
- Hand-authored migrations only; worktrees share ONE local DB (no destructive seeds); `bun run test` only
  (FS-0027); `../ronin-dojo-monorepo` READ-ONLY.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0502_TASK_01 | landed | Grill 4 decisions — FI-001 parked · Command Deck converge (queued) · profile escalated · recipe approved |
| SESSION_0502_TASK_02 | in-progress | Ratify recipe + write `docs/protocols/page-code-review.md` |
| SESSION_0502_TASK_03 | pending | Run recipe on `/directory/[slug]` = profile fix (one model + repackage + 404-teaser) |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

- **TICKET-0502-A** — merge `directory-profile/*` + `me-profile/*` trees onto one shape; delete
  dead `directoryProfilePreviewPayload` / `previewRankToPublicRank` (now orphaned after TASK_03
  collapsed `findProfileBySlug` to a single detail fetch); rewrite `hero-badges` "Listing preview"
  copy (the free/paid boundary is now basic-vs-rich-media, not full-vs-preview). Deferred from
  SESSION_0502 TASK_03 (scope guard).

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence

| Step | Proof |
| --- | --- |
