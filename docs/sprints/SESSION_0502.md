---
title: "SESSION 0502 — grill 4 queued decisions + draft the page-code-review recipe, run it on page #1"
slug: session-0502
type: session--implement
status: closed
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
| SESSION_0502_TASK_02 | landed | Recipe ratified → `docs/protocols/page-code-review.md` (composes fallow + /code-quality + /fallow-fix-loop + Doug e2e) |
| SESSION_0502_TASK_03 | landed | `/directory/[slug]` profile fix — free-basic public profile + premium rich-media gate + 404-teaser + ""→null (`c3a3d1bd`+`7161ed23`, Doug 9.2 SHIP) |

## What landed

- **Four decisions grilled + resolved** (see `Grill outcome`): FI-001 parked · Command Deck → converge-to-one
  (queued next) · `/me` passport re-home → escalated to the real profile-wiring problem · recipe approved.
- **Page-code-review recipe RATIFIED** — `docs/protocols/page-code-review.md`: a replayable per-page pass
  (Step-0 file-set bound → fallow baseline → review/`/code-quality` → `/fallow-fix-loop` fixes → e2e +
  format:check re-verify → fallow delta). Composes existing tools, **no new engine**; protocol-now,
  skill-later. **Proven end-to-end on page #1** this session.
- **Profile fix (page #1 = `/directory/[slug]`)** — the "half-baked profiles" root cause fixed: a **free
  claimed profile now renders a full BASIC public profile** (name, avatar, full rank history, bio,
  school/organizations, lineage ancestry) instead of preview-only; **Premium/Elite gate only rich media**
  (cover photo, video intro, social links, location, email, techniqueProgress). Policy split
  `canRenderFullProfile` → `canRenderProfile` (all claimed) + `canRenderRichMedia` (premium+); one detail
  fetch replaced the preview fork; **404 → claim-teaser** fallback; `""`→`null` policy-userId fix. Copy
  corrected ("Media locked", accurate upgrade note). Component-tree merge deferred (TICKET-0502-A).
  Commits `c3a3d1bd` (build, tests-first) + `7161ed23` (Doug P2/P3 follow-ups).

## Decisions resolved

FI-001 Truelson **parked** · page-code-review recipe **approved** (Step-0 bound + baseline-artifact,
protocol-not-skill, 1 page/session, page #1 = `/directory/[slug]`) · Command Deck **converge** (flat grid +
search + pill quick-jump + live counts + expressive look) as the **default `/app` index**, delete beta deck —
**queued next, not this session** · **free-claimed-profile packaging = full BASIC free, premium = rich media**
· **consolidate to one profile read-model** (policy-parameterized; component-tree merge ticketed) · sequencing
= profile fix only this session · field-boundary judgment calls (rank history free · school free · email gated
· techniqueProgress gated · HIDDEN still 404) — operator saw them live and approved the push.

## Files touched

| File | Change |
| --- | --- |
| `docs/protocols/page-code-review.md` | NEW — ratified recipe (the session's process deliverable) |
| `apps/web/lib/entitlements/lineage-tier-policy.ts` | policy split: `canRenderProfile`/`canRenderRichMedia`; free `features.bio/rankHistory/organizations` → true |
| `apps/web/server/web/directory/profile-projection.ts` | new `projectDirectoryDetailProfile` (basic-always/rich-gated); `canRenderFullProfileForViewer`→`canRenderRichMediaForViewer`; list-card gated on tier |
| `apps/web/server/web/directory/queries.ts` | deleted preview fork (single detail fetch); `""`→`null`; 404→teaser slug-only fallback (+ single-brand-per-DB note) |
| `apps/web/app/(web)/directory/[slug]/_components/directory-profile/{about-section,hero-badges,ranks-section}.tsx` | copy: "Media locked", upgrade-note lists only gated media, unconditional "Ranks & Achievements" |
| `apps/web/server/web/directory/profile-tier-policy.integration.test.ts` | rewritten to new spec + cover/video fixtures (non-vacuous paid gate) |
| `apps/web/server/web/directory/profile-detail-projection.test.ts` | NEW unit test for the projector |
| `apps/web/lib/entitlements/lineage-tier-policy.test.ts` | rewritten to two-boolean shape |
| `apps/web/e2e/directory/profile-paywall.spec.ts` + `e2e/helpers/seed-directory-paywall{,-db}.ts` | NEW paywall e2e + seed helpers |
| `apps/web/server/web/lineage/queries.ts` | 1-line comment rename |
| `docs/sprints/SESSION_0502.md` | this session record |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` · `bun run lint` · repo-wide `bun run format:check` | 0 errors (pre-existing warnings only) |
| `bun run test` (`--parallel=1`, per-file) | **25/25** — tier-policy 9 · detail-projection 4 · projection 4 · tier-integration 3 · map-roster 5 |
| `e2e/directory/profile-paywall.spec.ts` (live, chromium) | **2/2** — free basic+media-locked · premium rich-media |
| `e2e/directory/profiles-m-card.spec.ts` · `e2e/lineage/public-visibility.spec.ts` (isolation) | 2/2 · 3/3 (list-card + visibility behavior-identical) |
| `npx next build` (pre-push cost gate) | **green** (exit 0, 0 errors) — mirrors Vercel; safe to deploy |
| Doug hostile verify | **9.2/10 SHIP-WITH-FOLLOWUPS**; paywall proven non-vacuous + airtight (test + SSR curl); 404-teaser relaxation safe on single-brand DB |
| Fallow delta (`--changed-since HEAD~1`) | changed-set maintainability **91.7** (> baseline 89.8); 1 introduced complexity (list-card CRAP 33 — ticketed) |
| Live SSR screenshots (free vs premium, anon) | shown to operator — free = real basic profile, media locked; premium = rich media |

## Open decisions / blockers

- **TICKET-0502-A** — merge `directory-profile/*` + `me-profile/*` trees onto one shape; delete
  dead `directoryProfilePreviewPayload` / `previewRankToPublicRank` (now orphaned after TASK_03
  collapsed `findProfileBySlug` to a single detail fetch); rewrite `hero-badges` "Listing preview"
  copy (the free/paid boundary is now basic-vs-rich-media, not full-vs-preview). Deferred from
  SESSION_0502 TASK_03 (scope guard). Canonical home = this ticket + the [[profile-tier-packaging-0502]]
  memory; promote to a `drift-register` D-row if it survives the next profile lane unresolved.
- **List-card projector complexity** — `projectDirectoryProfileListItem` at CRAP 33 (introduced by the
  tier-gating that kept list-card behavior-identical). Justified but a KISS target — simplify in TICKET-0502-A.
- **Latent multi-product risk** — the 404-teaser slug-only fallback assumes single-brand-per-DB (documented
  in `queries.ts`); safe today, mitigated by ADR 0038 separate-DBs. Revisit if a shared-DB product is added.
- **Command Deck unified `/app` index** — queued as the immediate next chip (converge-all + default index).
- **PWA icons** (`task_8f36f0c6`) — chipped (needs a square brand mark; logo.svg is a wordmark).
- **FI-001 Truelson** — parked (operator).
- **Stale worktree** — `../ronin-0485-blog` (session-0485-blog) — prune candidate.

## Next session

### Goal

Port the remaining **BBLApp components/features** still needed from the read-only `ronin-dojo-monorepo`
(operator-pinned). This is the "what's still missing from the old app" lane — e.g. FI-004 (admin
email-composer parity + BBLEmail port), and whatever else the BBLApp inventory surfaces.

### First task

Inventory `../ronin-dojo-monorepo` (Graphify-first, READ-ONLY) for BBLApp features/components not yet ported to
`apps/web`; cross-reference the POST_LAUNCH_SOT + FI ledger (FI-004 etc.); Petey-plan a coherent 3–5-item
bundle by one axis (domain hub / deploy unit). Alternatively the operator may pick the queued **Command Deck
unified `/app` index** chip first — surface both.

## Review log

### SESSION_0502_REVIEW_01 — Doug full verify (TASK_03)

- **Reviewed tasks:** SESSION_0502_TASK_03 (`c3a3d1bd` + `7161ed23`).
- **Dirstarter docs check:** not applicable (extends the directory read-model + entitlement-policy L1 patterns; no L1 replacement, no new authz system).
- **Verdict:** SHIP-WITH-FOLLOWUPS. Paywall boundary correct + proven non-vacuous (fixtures set rich fields, project null) and airtight at runtime (SSR curl); 404-teaser visibility relaxation safe today (0 PUBLIC newly exposed to anon, HIDDEN structurally can't leak, MEMBERS_ONLY still auth-gated); gates green; 25/25 unit+integration; e2e 2/2 live after the P2 locator fix.
- **Score:** 9.2/10 — SHIP.
- **Follow-up:** TICKET-0502-A · list-card CRAP 33 · multi-product latent note (all logged above; none block ship).

## Hostile close review

- **Giddy:** pass — one-model policy consolidation (ratify-then-conform to the operator's packaging law); reuses the entitlement policy (no 5th authz system); component-tree merge correctly ticketed, not big-banged.
- **Doug:** pass — 9.2 SHIP with runtime proof (see Review log); paid-value gate non-vacuous; security relaxation blast-radius stated + safe.
- **Desi:** pass — copy corrected to the new boundary ("Media locked" not "Listing preview"; upgrade note lists only gated media); live free/premium views verified by the operator.
- **Kaizen aggregate:** 9.3/10 — clean tests-first paid-tier change, verified live; deduction for the one introduced complexity finding (list-card CRAP 33, ticketed) and the new e2e locator defect caught only in verify.

## ADR / ubiquitous-language check

- **Ubiquitous language updated:** `canRenderProfile` (basic identity+bio+school+ranks+ancestry, true for all
  claimed) vs `canRenderRichMedia` (cover/video/social/location/email/analytics, premium+) — the new profile
  render-gate split. Recorded here; add to `ubiquitous-language.md` in the close sweep.
- **ADR:** the free-basic-vs-premium-rich **profile packaging** is a product/monetization decision (free claim
  = a real public profile; rich media is the upsell). It amends the BBL tier model (SOT-ADR D13 / membership
  tier). Recorded as a decision here + in memory; a formal SOT-ADR amendment is a light follow-up (flagged for
  the BBLApp-porting session's doc sweep) — not blocking.

## Reflections

- **The operator's "half-baked profiles" reframed a chip into the real fix.** What entered as a small passport
  re-home chip was, on diagnosis, a design decision starving free claimed profiles (full at `/me`, preview-only
  publicly) — diagnosis-before-build turned the fork into "which packaging," not "what's broken."
- **The granular policy already existed; the bug was a coarse boolean throwing it away.** `findProfileBySlug`
  nulled everything on `!canRenderFullProfile` while the per-field `features` map sat unused. And the components
  render on data-presence, not the boolean — so the entire fix landed in the read model with ~zero component
  edits. The fix was mostly *deleting a wrong branch*.
- **The recipe proved itself on its first run.** Page #1's execution WAS the recipe: fallow baseline → Giddy
  structural shape → Cody tests-first → Doug e2e/security verify → fallow delta → live screenshots. The
  behavior-preserving default flexed once, as a logged, operator-ratified exception (the recipe's own escape hatch).
- **Tests-first paid off on a paywall.** Rewriting the tier spec red-first (with cover/video fixtures actually
  SET) made the paid-value gate non-vacuous — the difference between "asserts null" and "proves a real
  rich-media field is gated."

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | PASS — 3 rows, all landed |
| JETTY/frontmatter sweep | SESSION_0502 + page-code-review.md stamped `updated: 2026-07-06` / `last_agent: claude-session-0502`; no other docs touched |
| Backlinks/index sweep | wiki index row added for SESSION_0502; page-code-review.md linked from index |
| Wiki lint | `bun run wiki:lint` — 0 err / 37 warn (all pre-existing) |
| Kaizen reflection | yes — `## Reflections` present |
| Hostile close review | SESSION_0502_REVIEW_01 (Doug 9.2) + Giddy/Desi passes |
| Code-quality gate (Class-A) | profile read-model = directory-L1 extension (Class B); fallow changed-set maintainability 91.7; 1 ticketed complexity finding |
| Runtime verification (Doug) | e2e 2/2 live + SSR curl on `/directory/[slug]` free vs premium; live screenshots shown |
| Review & Recommend | next session = BBLApp porting from monorepo (operator-pinned) |
| Memory sweep | profile packaging decision + recipe + free-basic boundary saved to memory |
| Next session unblock check | unblocked — inventory + Petey-plan; no user input required to start |
| Git hygiene | branch=main; single push at close (2 code commits + close docs); hash reported at bow-out |
| Graphify update | nodes=16484 edges=32520 communities=2245 (gate runner, pre-commit) |
