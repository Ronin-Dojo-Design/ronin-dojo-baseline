---
title: "SESSION 0731 — All-hands polish pass on the 0730 diff (pre-#377): 9.2 → 9.8"
slug: session-0731
type: session--open
status: in-progress
created: 2026-07-31
updated: 2026-08-01
last_agent: codex-session-0731
next_session: docs/sprints/SESSION_0732.md
sprint: S13
lane: bbl
recipe: "seq-review-wave"
goal_ids: ["G-011"]
tickets: ["#397", "#399"]
pairs_with:
  - docs/sprints/SESSION_0730.md
  - docs/sprints/SESSION_0732.md
  - docs/protocols/jetty-annotation-standard.md
  - docs/knowledge/wiki/files/design-system-grid-ratio-hierarchy.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0731 — All-hands polish pass (pre-#377): take the 0730 work from 9.2 to 9.8

> **Staged by SESSION_0730 (operator-directed at close).** The "all hands on deck review": every
> roster agent runs **two improvement passes** over the files the 0730 session touched (the #397 +
> #399 diffs). No canonical doc carries this name — the operator's spec below IS the spec; closest
> canon is `/seq-review-wave` + the SESSION_0305 Desi-design-review precedent. **#377 executes the
> session AFTER this (SESSION_0732)** — this pass sets the quality floor first.

## The target (why, ratified at 0730 close)

/ggr composite stands at **9.2**. The operator wants **9.8–10** before #377 locks the seam in.
Known caps to burn down (recorded in SESSION_0730 Review log + Codex/Giddy findings):
contract-only seam surface · 4 duplication clone families · Jetty-annotation gaps on changed
sites (under-described behavior changes) · Pocock self-documentation distance · verification-
process gaps (affected-e2e selection missed the lineage specs; no fallow baseline before Codex).

## The roster plan (Petey orchestrates; TWO passes per agent; grade at every step)

1. **Petey** — orchestrates; at each step reviews + **grades the PLANS + DOCUMENTATION** for the
   files involved (do the docs tell the truth the code tells? kill drift on sight; grade /10 per
   doc against plan-quality).
2. **Cody** — reviews + **grades the CODE + the SCHEMA** (functionality · no dead code · no dupes ·
   no complexity) with **one more `/fallow-fix-loop` pass**. Bar: Apple-quality — no god files;
   the **Matt Pocock concept**: the codebase ALONE tells the same story the docs do (module names,
   export surface, types encode the two-axis model / anchor / display law without prose); clean
   semantic **JETTY annotations** per [`jetty-annotation-standard.md`](../protocols/jetty-annotation-standard.md)
   (`@added/@why/@wired` on schema, JSDoc headers on modules — update `@wired` where consumers
   changed in #397).
3. **Desi** — **"Desi Design Review"** (SESSION_0305 precedent) on the SURFACES this session's work
   touched (directory profile ranks, lineage drawer/rank history, admin people, tournaments
   seeding surface, belt tab) against the **golden-ratio design system**:
   [`design-system-grid-ratio-hierarchy.md`](../knowledge/wiki/files/design-system-grid-ratio-hierarchy.md)
   (12-grid, golden ratio, visual hierarchy; canon = design-system-doctrine §3–§5, ADR 0040).
4. **Doug** — reviews + **grades the VERIFICATION PROCESS for each step of SESSION_0730's work**
   (grill → Codex → parity gate → policy build → CI loop → merge gate → prod verify → D-058
   response): what caught what, what should have caught it earlier, and the process fixes (e.g.
   affected-e2e selection law, fallow-baseline-before-refactor (FS-0042), the DB-blind-reviewer
   rule) — routed as ledger/protocol edits.
5. **Giddy** — final **`/ggr`** on the polished result. **Clear line for THIS session: 9.8+.**
   Record the composite; anything unreached routes to a ledger row, never silently dropped.

## Hard constraints (unchanged)

- Rank-awarded truth (ADR 0035/0058 display law) + status/provenance axes + belt-gate contracts +
  technique-media NO-LEAK. IMPORTED-lock stays LIFTED (operator ratification — a reviewer calling
  the missing lock a bug is wrong by ratification). Writes stay on RankAward until #380.
- **Schema stays FROZEN** (Fork 4 carries over) — DB-level provenance immutability is a #380 note.
- Behavior parity: polish must not change user-visible behavior; every refactor re-verified.
- #380 remains blocked on #398 (operator env-scoping). PR-only main; explicit push authorization.

## Bow-in

- Adopted the staged SESSION_0731 stub on `polish/0731-rank-seam`, branched from current
  `main` at `ddb5f58a` after an explicit `git pull --ff-only origin main` (already current).
- **Previous goal: YES.** SESSION_0730 records #397 merged and prod-verified with 0 orphans;
  #399 landed the preview-migration guard and closed the session above its stated goal.
- FS-0024 confirmed canonical `black-belt-legacy` path + remote before mutating git. Canonical
  occupancy was free and claimed for SESSION_0731; `githooks/doctor.sh` passed with the PR-only
  main ruleset and force-push block active.
- Router result: merged-trunk quality pass + `seq-review-wave` over one commit set. Review lenses
  are parallel and non-mutating; fixes return as one batched pass before delta verification.
- Graphify-first discovery ran (`15130` nodes / `33686` edges); the rank-entry query surfaced the
  lineage hub, ADR 0035, canvas model, lineage payloads, belt UI, tournament bracket, and `/app`
  lineage surfaces as the relevant captured neighborhood.
- Backlog scan: board leaders remain FI-001 then G-002, while the operator-pinned SESSION_0731
  continuation overrides them. Prior/current next-session direction remains SESSION_0732 = #377.
- Parallel-lane assessment: one coherent rank-seam polish lane. Reviewer lenses are disjoint in
  method but intentionally inspect the same commit set; there are no independent build lanes.
- Operator confirmed no pivot and declined a frozen State-of-Dojo snapshot; `/app/state` remains
  the zero-token live view.

## Baseline (before polish edits)

- Scope: `1c13dac9` + `ddb5f58a` versus parent `75b15b71`; fallow discovered 84 changed files.
- `bunx fallow audit --changed-since 75b15b71 --gate new-only --max-crap 30 --no-cache`:
  PASS/WARN; 0 introduced dead-code findings, 0 introduced complexity findings, **4 introduced
  duplication clone groups** (53 inherited groups excluded). Introduced groups: shared
  `next/cache` test mock; duplicated node-profile fixture setup (2 groups); duplicated lineage
  `rankEntries` payload select.
- Raw touched-set health: 57 clone groups / 9 clone families total; 16 dead-code issues + 34
  complexity findings are inherited. MI **90.4** (good); average/p90 cyclomatic **2.1 / 4**.
  Highest seam CRAP signals: `InfoTab` 1406; `deriveDrawerProfileView` 600; `RankAwardRow` 272;
  `buildBeltProgressions` high complexity (CRAP unavailable without coverage).
- Baseline gates: `bunx tsc --noEmit` exit 0; `bun run test` **1954 pass / 0 fail / 244 files**;
  `bun run lint` exit 0 with pre-existing warnings and no file writes. Source tree remained clean;
  only this SESSION record changed.

## Petey plan

**Adversarial escalation (operator amendment):** every lens independently re-earns SESSION_0730's
9.2 baseline. Two passes remain the default; any lens scoring the baseline below 9.2 runs the fixed
three-pass loop (baseline → correction → hardening) and cannot close below 9.5 without escalation.
Codex also hostile-reviews this plan and the implementation; inherited scores carry no authority.

- `SESSION_0731_TASK_01` — Capture the untouched-set fallow + tsc/test/lint baseline and exact
  #397/#399 scope; record before metrics. **DONE**
- `SESSION_0731_TASK_02` — Cody code/schema review + one fallow-fix loop; implement the
  behavior-preserving dedup, Jetty, and Pocock surface improvements, then re-gate. **DONE —
  escalated three-pass, 8.5→9.8**
- `SESSION_0731_TASK_03` — Petey two-pass plan/doc truth review across every rank-seam canon doc;
  edit each drift line or record zero drift with grades. **DONE — escalated three-pass, 6.9→9.8**
- `SESSION_0731_TASK_04` — Desi two-pass static design review of the named render surfaces; fix only
  behavior-neutral conformance defects and prepare the operator live-DOM checklist. **DONE —
  escalated three-pass, 8.7→9.8; foreground proof MANUAL STEP REQUIRED**
- `SESSION_0731_TASK_05` — Doug two-pass SESSION_0730 process audit; codify/route affected-e2e
  selection and pre-refactor fallow-baseline rules with owners and stable IDs. **DONE — escalated
  three-pass, 8.6→9.8**
- `SESSION_0731_TASK_06` — Giddy final `/ggr`, delta verification, findings routing,
  bow-out, and hold at the single explicit push gate. **DONE LOCALLY — three-pass; weighted code
  9.8, systemic composite 8.9 (FS-0028 cap); operator decision pending**
- `SESSION_0731_TASK_07` — Operator-elected keep-improving loop: turn FS-0028's repeated prose gate
  into an index-accurate tracked pre-commit guard, prove defeat cases, and serialize the generic
  hook infrastructure ahead of #377. **DONE LOCALLY — 0731.5 remediation; historical 8.9 retained**

### Codex hostile plan review — three-pass loop

- **Pass 1 — baseline: 8.8/10; prior 9.2 not earned.** The plan called four Fallow clone
  *groups* “families,” allowed a static class audit to sound like live WCAG/grid proof, did not
  separate introduced defects from inherited complexity debt, and placed the required green CI URL
  before the operator-authorized push that creates that run. It also expands Petey's normal 1–3 task
  shape without naming the operator-directed exception.
- **Pass 2 — correction: 9.7/10.** Evidence boundaries are now explicit: the dedup target is the
  four *introduced clone groups* attributed to `75b15b71..HEAD`; inherited findings are measured and
  routed, not hero-refactored. Desi's in-sandbox result is a static conformance audit only; WCAG,
  rendered grid, and φ checks remain an operator foreground checklist. The six stable work-unit IDs
  are the operator-prescribed review order, grouped operationally into three close gates: baseline,
  review/fix, and final validation.
- **Pass 3 — hardening: 9.8/10.** The close is intentionally split at the push wall: Giddy can issue
  a pre-push provisional score, but the mandatory Systemic-health line and final composite are not
  complete until the operator authorizes the one push and the resulting own-lane CI URL is green.
  Every proposed fix must identify whether it changes a 0730-touched byte, preserve the four
  ratified read-law changes, and pass the exact baseline gates. Residual structural debt is capped
  and routed to #380; it is not chased through frozen schema or write-path edits.

### Cody code/schema review — three-pass loop

- **Pass 1 — baseline: 8.5/10; prior 9.2 not earned.** The touched set introduced four duplicate
  clone groups, left the new compact member-rank contract without a Jetty header, repeated trust
  derivation across compatibility/test seeds, and made mutable status versus immutable provenance
  plus the transitional award anchor readable only through prose. The frozen schema was reviewed,
  never edited.
- **Pass 2 — correction: 9.8/10.** Commits `cd6be6ef` and `df0e8218` collapse all four introduced
  clone groups, extract the pure `rank-entry-trust-axes.ts` contract, split high-complexity
  projections without output changes, and add/repair Tier-1 Jetty headers and the three named
  behavior-site `@why` annotations. Tier-3 readers were traced without markup/output edits.
- **Pass 3 — hardening: 9.8/10 PASS.** Hostile re-review caught and removed a duplicate Jetty
  header, replaced vague wiring with exact paths, and proved `member-ranks.ts` has no runtime
  importer yet (its first adoption is #377). The export surface now states the model in types alone:
  writable `MutableRankEntryStatus`, readonly `ImmutableRankEntryProvenance`, readonly
  `TransitionalRankAwardAnchor`, and `TransitionalRankAwardAnchoredMemberRank`. Four adversarial
  tests pin duplicate-rank newest-date retention, omitted-ladder recovery, premium-card redaction,
  and writable status.
- **Measured delta:** introduced duplicate clone groups **4→0**; introduced dead/complexity
  findings **0/0→0/0**. Cody's app-code scope improves MI **90.4→90.9**. The complete close
  worktree (including process scripts) finishes at MI **90.7**, average CC **2.0**, p90 CC **4**;
  raw health improves **57→51 clone groups / 9→7 families / dead 16→15 / complexity 34→33**.
  Focused pass-3 proof: **153 pass / 0 fail / 455 assertions / 17 files**; pass-3 tsc/lint green.
  The final-source full suite is recorded at the close gate below.
- **Residual:** 0.2 is #380-owned: the compact seam is contract-only until #377 adopts/guards it,
  and fact derivation remains RankAward-anchored until the one-table fold. No schema edit or
  behavior expansion belongs in SESSION_0731.

### Petey doc-truth review — three-pass loop

- **Pass 1 — baseline: 6.9/10; prior 9.2 not earned.** ADR 0058 claimed all writes were
  RankEntry-native and RankAward dead/post-send; the epic, #372, and map #374 asserted an
  IMPORTED authority lock the operator had lifted; #374 showed #376 still blocked; the SOT set
  and flow docs omitted the four #380 forks; #398 promised preview migration through a script
  that intentionally skips previews.
- **Pass 2 — correction: 9.7/10.** Current local canon and the live GitHub issue bodies now agree:

| Rank-seam source | Grade | Drift edited / result |
| --- | ---: | --- |
| SESSION_0730 | 9.6 | Current IMPORTED ratification already true; added D-058 correction receipt for the historical D-055 collision. |
| SESSION_0731 | 9.8 | Current constraints, precise four introduced clone groups, three-pass escalation, and push/CI wall recorded. |
| Map #374 | 9.8 | Rewrote destination, standing law, forks, landed decisions, ticket states, blockers, and out-of-scope. |
| Spec #372 | 9.8 | Rewrote current state, problem/solution, all 22 stories, implementation/testing decisions, timing, and IMPORTED policy. |
| ADR 0058 | 9.8 | Corrected current read/write bridge, pre-send timing, display tiebreak, two trust axes, and consequences. |
| Legacy ADR 0035 | 9.5 | Historical body retained; tombstone now explicitly routes past its superseded IMPORTED/authority amendment. |
| `rankentry-unification-epic.md` | 9.7 | Corrected sequencing, schema ground truth, closed display gap, belt-gate fold, open decisions, and ADR skeleton. |
| `rank-entry-unified-data-flow.md` | 9.7 | Added current bridge/forks; corrected current-rank, surfaces, and migration steps. |
| `lineage-data-wiring-flow.md` | 9.7 | Marked target diagram; added bridge/forks/IMPORTED law; corrected display and writer statements. |
| BBL-SOT-Spec | 9.7 | Added the four-fork rank transition and corrected Phase 6's current/target writer path. |
| SOT-ADR | 9.7 | Added D13 rank amendment; corrected claim writer and ADR 0016 supersession. |
| Ubiquitous Language | 9.8 | Corrected RankAward/RankEntry definitions, timing, writer bridge, and trust axes. |
| JETTY annotation standard | 9.8 | **0 drift**; rules are generic/current. Implementation compliance is Cody-owned. |
| #380 | 9.8 | Rewrote blockers, four forks, IMPORTED ratification, schema-note requirements, migration/rollback proof, and done-means. |
| #398 / D-058 / RISK-16 | 9.8 | Corrected the ID and made the explicit preview-migration mechanism + throwaway proof mandatory. |

- **Pass 3 — hardening: 9.8/10 PASS.** `bun run wiki:lint` exits 0 with 0 errors and 115
  inherited formatting warnings (none on the corrected current seam docs). A targeted local + live
  #372/#374/#380 search finds no current authority treating IMPORTED as an edit lock or #380 as
  post-send. Historical SESSION_0727/0729 and ADR 0035 retain time-accurate bodies under explicit
  supersession banners.

### Desi design review — three-pass loop

- **Pass 1 — baseline: 8.7/10; prior 9.2 not earned.** Two independent reads scored 8.8 (§5
  hierarchy/grid/AA) and 8.6 (consistency/reuse). The #397/#399 diff introduced **zero** class,
  variant, or markup defects; every finding predates `75b15b71`. Behavior parity and Tier-3
  verify-not-rewrite therefore forbid a visual cleanup in this lane.
- **Pass 2 — correction: 9.3/10 recorded deliverable (review reasoning 9.7).** Each named surface now has an explicit
  conformance/deviation result; inherited findings route to DES-009..012 rather than disappearing:

| Surface | Baseline | §5 result / documented deviation |
| --- | ---: | --- |
| Directory profile/sidebar | 9.2 | 8/4 Section and Card conform; shared ListingDetail's semantic H1 uses the H2 visual ladder → DES-010. |
| Drawer header + Info | 8.9 | Overlay grid/φ exception; Verify + Claim can both be primary → DES-011. |
| Rank history | 8.1 | Drawer-context grid exception; raw Card twin and embedded progression contrast → DES-009/011. |
| Rank progression | 7.9 | Drawer-context grid/φ exception; arbitrary belt-color contrast + raw cards + ad-hoc type/spacing → DES-009/011/012. |
| Admin people | 9.1 | Data-table grid/φ exception; Banned badge bypasses semantic danger token → DES-011. |
| Tournament seeding | 8.3 | Sequential-editor grid/φ exception; zero H1 and unassociated Seeding Method control → DES-010. |
| Belt tab | 8.8 | 1/2/3-column ratio conforms; repeated per-card primary CTA deviates from one-primary/view → DES-011. |
| Promoter modal | 9.3 | Dialog grid/φ exception; one Save primary conforms; validation error lacks live announcement → DES-010. |

- **Pass 3 — hardening: 9.8/10 PASS, GO-WITH-NOTE; surface proof MANUAL STEP REQUIRED.** Exact
  file:line evidence now lives in DES-009..012. Sandbox static proof cannot substitute for the
  following live DOM/axe/WCAG proof.

#### Operator foreground SSR/DOM checklist (paste-ready)

Set only public identifiers in the shell; do **not** paste an authenticated session cookie into a
terminal transcript or CI log:

```bash
BBL_REVIEW_BASE=http://localhost:3000
BBL_REVIEW_DIRECTORY_SLUG=<profile-slug>
BBL_REVIEW_LINEAGE_SLUG=<tree-slug>
curl -fsSL "$BBL_REVIEW_BASE/directory/$BBL_REVIEW_DIRECTORY_SLUG" | rg -o '<h1\b' | wc -l
curl -fsSL "$BBL_REVIEW_BASE/lineage/$BBL_REVIEW_LINEAGE_SLUG" | rg -o '<h1\b' | wc -l
```

Both public counts must be `1`. For authenticated routes, use an already logged-in browser:
`/app/users`, `/app/tournaments/<id>`, and `/app/profile?tab=belts`. At each public/authenticated
route, capture 390px + 1440px, light + dark; run this DevTools probe after opening the relevant
drawer/modal/tab:

```javascript
({
  h1: document.querySelectorAll("h1").length,
  horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  solidPrimaryActions: [...document.querySelectorAll("a,button")]
    .filter(el =>
      el.offsetParent !== null &&
      el.classList.contains("bg-foreground") &&
      el.classList.contains("text-background")
    )
    .map(el => el.textContent?.trim()),
  grids: [...document.querySelectorAll(".grid")]
    .filter(el => el.offsetParent !== null)
    .map(el => getComputedStyle(el).gridTemplateColumns),
})
```

- `/directory/<slug>`: one H1, desktop 8/4 profile/sidebar, one-column mobile, one identity focal
  card, rank tint legible in both themes.
- `/lineage/<slug>`: open profile drawer → header, Info, Rank History, Rank Progression; no overflow,
  one solid action; axe/Accessibility tree clean; white/yellow/black belt contrast recorded.
- `/app/users`: one H1; Add primary + Invite secondary; Banned badge legible; belt cell scrolls at 390.
- `/app/tournaments/<id>`: one H1; open Bracket/Seeding dialog without saving; Accessibility tree
  names “Seeding Method”; control/dialog fit at 390.
- `/app/profile?tab=belts`: grid resolves to 1/2/3 columns; one solid action in the viewport; inspect
  empty/locked/completed cards in both themes.
- Promoter modal from the lineage drawer: every field named; source must expose the validation
  error through `role="alert"` or `aria-live`, then a VoiceOver/NVDA trigger must prove the dynamic
  announcement; Save is the only primary. Current source has neither live attribute, so record the
  expected DES-010 failure rather than claiming axe/the static Accessibility tree proved speech.

Live Dirstarter check: [theming](https://dirstarter.com/docs/theming) aligns with the changed diff's
token/primitive usage, while DES-009..012 document inherited partial alignment. The live
[deployment](https://dirstarter.com/docs/deployment) and
[environment setup](https://dirstarter.com/docs/environment-setup) guidance was also checked;
repo-specific Preview/prod isolation is stricter and remains D-058/RISK-16/#398.

### Doug verification-process review — three-pass loop

- **Pass 1 — baseline: 8.6/10 FAIL; prior 9.2 not earned as a process score.** The merged code's
  post-recovery safety can still be 9.2; the verification chronology cannot. It accepted DB-blind
  refactor claims, selected E2E by test-file diff, captured no pre-refactor Fallow baseline, carried
  stale format evidence, omitted hostile-close fields, collided on D-055, and left Preview holding
  prod credentials.

| SESSION_0730 step | /10 | What caught what / earlier control |
| --- | ---: | --- |
| Grill | 8.8 | Found one-table/state/trust forks; operator corrected the false curated-import premise. Ask data origin before policy. |
| Codex handoff | 6.8 | Structural cleanup, but two false P1 fixes entered while DB suite was unavailable. Require baseline + DB-capable parity owner. |
| Parity gate | 7.6 | Giddy exposed hidden bracket/tiebreak changes; missed provenance/anchor regressions. Contract tests must precede score. |
| Foreground DB gate | 9.6 | Nine failures exposed provenance heal, fallback, and anchor regressions; correct catching gate. |
| CI watch/fix | 8.3 | CI caught two late unformatted files and browser seed prerequisites across three engines. Final-SHA format + contract-driven E2E manifest. |
| Merge gate | 9.7 | Live prod 111/111/0 orphan parity correctly held merge. |
| Prod verify | 9.8 | Migration timestamp exposed Preview applying to prod before merge. Review firing set before PR. |
| D-058 response | 8.2 | Migration gate/risk/ticket landed, but the original ID collided and runtime prod credentials remain open. |

- **Pass 2 — correction: 9.7/10.** Codified FS-0051 with Doug/Petey/Cody ownership and three-way
  protocol wiring; expanded FS-0042 to require immutable pre-edit baseline evidence; recorded the
  FS-0028 final-SHA recurrence; repaired migration drift D-055 → D-058; corrected RISK-16/#398's
  preview mechanism and kept #380 blocked.
- **Pass 3 — hardening: 9.8/10 PASS.** D/FS ledger duplicate checks are clean; RISK-16 stays High
  with runtime prod-credential exposure OPEN; the affected-E2E manifest names three lineage + one
  directory helper and all four proofs; sandbox browser deferral is an explicit waiver, not green.
  Pending final-SHA gates, foreground build, and post-push CI URL are evidence walls, not process
  defects.

### Affected-E2E manifest (FS-0051)

Changed contract: RankEntry-first readers require every seeded RankAward to have a synchronized
RankEntry; SESSION_0731 also centralizes the helper's status/provenance derivation. Selection follows
the four helper consumers, not an `e2e/**` diff trigger:

| Seed consumer | Affected proof | Seed prerequisite audited |
| --- | --- | --- |
| `seed-lineage-lifecycle-db.ts` | `e2e/lineage/authenticated-lifecycle.spec.ts` | RankAward → `seedRankEntriesForAwards` at the lifecycle seed boundary. |
| `seed-lineage-rank-redaction-db.ts` | `e2e/lineage/public-rank-redaction.spec.ts` | Three awards → RankEntries before public rank assertions. |
| `seed-directory-paywall-db.ts` | `e2e/directory/profile-paywall.spec.ts` | Paywall award → RankEntry before directory projection. |
| `seed-lineage-comp-fixture-db.ts` | `server/entitlements/lineage-comp-seed.test.ts` | All 22 fixture awards → RankEntries; unit layer imports the E2E fixture. |

The final full unit gate covers the lineage-comp fixture. Under FS-0051, browser specs carry an
explicit environment waiver to operator foreground/own-lane CI after the authorized push: the
sandbox cannot run the required live DOM/E2E environment. This is not a green claim; CI URLs are
required at final Giddy close. Zero selected specs is rejected with the importer proof above.

## Goal verdict

**EXTENDED — weighted code quality reached 9.8 and the production build is green, but systemic 9.8
was not earned: recurring FS-0028 caps the historical `/ggr` at 8.9.** The elected keep-improving
loop has since mitigated FS-0028 mechanically; it does not rewrite the occurrence or score. The
session remains in-progress at the operator gate; no push or Graphify refresh has occurred, CI has
no URL, and live DOM/AA proof remains manual.

## Delivered

| Task | Status | What landed |
| --- | --- | --- |
| SESSION_0731_TASK_01 | DONE | Immutable `75b15b71` baseline: 4 introduced clones, MI 90.4, avg/p90 CC 2.1/4; tsc, 1954-test suite, and lint green before edits. |
| SESSION_0731_TASK_02 | DONE | Cody three-pass code/schema review; two code-only commits; introduced clones 4→0; trust-axis/Pocock types, Tier-1 Jetty, exact behavior annotations, and adversarial parity tests. |
| SESSION_0731_TASK_03 | DONE | Petey three-pass doc-truth review; rank seam, four #380 forks, IMPORTED ratification, pre-send sequencing, and #398 preview mechanism corrected locally and in issues #372/#374/#377/#380/#398. |
| SESSION_0731_TASK_04 | DONE | Desi three-pass static sweep over all eight named surfaces; inherited deviations routed DES-009..012; operator live DOM/AA checklist prepared. |
| SESSION_0731_TASK_05 | DONE | Doug three-pass verification audit; affected-E2E, pre-refactor Fallow, final-SHA, allocator, and clock rules routed with owners and executable wiring. |
| SESSION_0731_TASK_06 | OPERATOR GATE | Giddy three-pass close; weighted code 9.8, systemic 8.9 FS-0028 cap; every local gate/build green; push/CI authorization held. |
| SESSION_0731_TASK_07 | DONE LOCALLY | 0731.5 FS-0028 remediation: staged-source/config Oxfmt pre-commit guard, live canonical installer/doctor proof, defeat harness wired into the full unit suite; Cody 9.9 / Giddy 9.8. |

### Decisions resolved

- The prior 9.2 is not inherited authority: every sub-9.2 baseline ran the mandatory third pass.
- The compact `member-ranks.ts` seam is honestly contract-only until #377; no fabricated runtime
  wiring. RankAward remains the transitional fact anchor until #380.
- Types now expose mutable status, readonly provenance, and a readonly transitional award anchor;
  schema-level immutability remains #380-owned.
- #397 changed no render markup/classes. Inherited visual debt is routed, not mixed into a
  behavior-parity data-seam refactor.
- FS-0028 is mechanically mitigated after the historical score: the tracked hook judges the index,
  remains read-only, and is kept semantically separate from #377's forthcoming RankAward scanner.

### Key files

- `server/belt/rank-entry-trust-axes.ts` — pure two-axis derivation and Pocock export surface.
- `server/belt/member-ranks.ts` + `rank-entry-display-order.ts` — annotated compact contract and
  highest-awarded/nulls-last law.
- `server/web/lineage/payloads.ts` + directory/lineage projections — shared derivations with output
  parity pinned by tests.
- ADR 0058, BBL SOT docs, map/spec issues — one current two-table bridge story and four #380 forks.
- `quality-suite.md`, verification runbook, closing ritual, failed-steps/drift/design ledgers —
  executable verification/routing corrections.
- `scripts/githooks/pre-commit` + its shell/Bun defeat harness — staged-format prevention that
  covers partial staging and is mechanically exercised by `bun run test`.

## Artifacts

None published. The operator declined a frozen State-of-Dojo snapshot; use live `/app/state` after
merge. Graphify refresh is intentionally post-merge only.

## Findings routed / proposed ledger edits

**16/16 routed:** FS-0051 (contract-driven affected E2E), FS-0042 recurrence (pre-edit Fallow
baseline), FS-0028 recurrence (now mitigated by the staged-source/config hook), FS-0024 (doctor
queried the retired repo), FS-0040 (installer pinned a disposable lane), D-058 + RISK-16/#398 (preview migration/runtime
credential split), FS-0052 (DES allocator), DES-009/010/011/012 (contrast, semantics, hierarchy,
spacing), D-059 (two stale out-of-scope IMPORTED-lock comments), and FS-0053 (UTC/local close-clock
split), D-060 (Turbopack/NFT root trace), and D-061 (pg query-overlap deprecation). No finding lives
only in this SESSION record. Giddy's in-scope stale `related-profiles.ts` roster/RankAward comments
were corrected directly before commit.

Proposed next edits: SESSION_0732/#377 may take the D-059 comment-only rider while building the read
guard; DES-009..012 remain one live-verified design/accessibility lane; #398 remains the operator
environment blocker for #380. Do not touch #380 schema until that proof exists.

## Open decisions / blockers

- **Push/CI wall:** local `next build` is green; the one branch push still requires the operator's
  explicit word. Merge remains blocked until own-lane CI/Playwright is green and its run URL exists.
- **Live design proof:** run the recorded 390/1440 light/dark DOM/axe/contrast/screen-reader checklist;
  expected inherited failure DES-010 is not a #397 regression. DES-009..012 remain open.
- **#380:** blocked on #398 environment isolation/preview-migration proof. Frozen schema and the
  RankAward anchor remain untouched here.
- **D-059:** two comment-only IMPORTED-lock corrections remain a proposed SESSION_0732/#377 rider;
  runtime policy is already correct.
- **D-060/D-061:** production build passes, but the NFT root trace and pg overlap deprecation remain
  open, owned warning-removal lanes before the relevant bundler/pg upgrade.

## Proposed #380 schema-annotation notes (TEXT ONLY — schema remained frozen)

For `RankAward` immediately above the model:

```prisma
/// Transitional write and promotion-fact anchor through #380; never the canonical member-rank
/// display root. #380 moves facts and every satellite FK to RankEntry before dropping this table.
```

For `RankEntry` immediately above the model/fields:

```prisma
/// Canonical member-rank read aggregate and #380 one-table destination.
/// status is mutable presentation trust; provenance is immutable private origin.
/// DB enforcement of provenance immutability and removal of rankAwardId land atomically in #380.
```

## Close evidence

### Per-lens grades

| Lens | Baseline | Correction | Hardening | Verdict |
| --- | ---: | ---: | ---: | --- |
| Cody code/schema | 8.5 | 9.8 | 9.8 | PASS; 4→0 introduced clones, behavior parity held. |
| Petey plans/docs | 6.9 | 9.7 | 9.8 | PASS; current seam canon and live issue map agree. |
| Desi render surfaces | 8.7 | 9.3 | 9.8 | GO-WITH-NOTE; live DOM/AA proof MANUAL STEP REQUIRED. |
| Doug verification process | 8.6 | 9.7 | 9.8 | PASS; historical process score stays 8.6. |
| Codex hostile plan/implementation | 8.8 | 9.7 | 9.8 | PASS; duplicate Jetty/date-clock/next-ticket drift caught. |
| Giddy `/ggr` | 8.9 | 9.7 | weighted 9.8 / systemic 8.9 | CODE PASS; systemic cap = reopened FS-0028. Operator Phase-3 gate. |
| 0731.5 FS-0028 remediation | 8.2 | 9.8 | Cody 9.9 / Giddy 9.8 | PASS; staged source/config and config-wide defeat paths green; historical 8.9 unchanged. |

### Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Tier-1 headers and three behavior-site `@why` annotations checked; touched current docs carry UTC-current `updated` + `last_agent`. |
| Backlinks/index sweep | SESSION_0731↔0732 pairing is symmetric; no new wiki page/status row; session spine remains outside wiki index. |
| Wiki lint | `bun run wiki:lint`: 0 errors / 115 inherited warnings; no warning on the corrected current seam docs. |
| Reflections routing receipt | 5 lessons → 5 stable routes below. |
| Hostile close review | Giddy 8-question + Kaizen triage complete; three-pass result = weighted code 9.8, systemic 8.9 FS-0028 cap. |
| Code-quality gate (Class-A) | Weighted code-quality 9.8; Fallow new-only 0 introduced findings across 114 changed files. Systemic FS-0028 cap recorded separately. |
| Runtime verification (Doug) | Tsc clean; 1962/0 tests, 5366 assertions, 245 files; lint/button guard/format green; production build generated 305/305 pages. Live DOM/Playwright remains MANUAL STEP REQUIRED. |
| 0731.5 remediation gates | Final-SHA tsc clean; 1963/0 tests, 5367 assertions, 246 files; lint/button guard green; production app build not repeated because remediation changes only hooks, docs, and their test. |
| Evidence-artifact URL | n/a pre-push — no live UAT artifact exists; live checklist is recorded above. |
| Review & Recommend | SESSION_0732 staged for #377 with corrected live issue body. |
| Memory sweep | Durable rules routed into FS/protocol/ADR/SOT docs; no separate memory dump needed. |
| Next session unblock check | #377 unblocked (#376 merged); #380 remains blocked on #398. |
| Git hygiene | `polish/0731-rank-seam`; explicit-path commits/staging only; no push; final status check pending. |
| Graphify update | Operator sequence under FS-0025: refresh only after the polish PR merges; no refresh performed. |

### Giddy `/ggr`

**Pass 1: 8.9.** Hostile-close anatomy was incomplete and two production-build warnings were
known-but-unrouted. **Pass 2: 9.7 underlying.** The required review/Kaizen/blockers sections landed,
D-060/D-061 own the warnings, and the false in-scope `related-profiles.ts` roster/RankAward comments
were corrected. **Pass 3: weighted code-quality 9.82→9.8; final systemic composite 8.9.**

| Dimension | /10 |
| --- | ---: |
| Correctness | 9.9 |
| Security + data integrity | 9.8 |
| Simplicity | 9.9 |
| Readability | 9.8 |
| Maintainability | 9.8 |
| Scalability | 9.8 |
| Convention + reuse | 9.7 |

The code-quality residual 0.2 is solely #380-owned: RankAward remains the transitional fact anchor
and the compact member-rank seam remains contract-only until #377. Separately, the session-wide
composite is capped at **8.9** because six committed Cody-touched files missed mandatory
`format:check`, firing the recurring FS-0028 pattern. Oxfmt and all reruns are green, but remediation
cannot erase a process occurrence. FS-0028 was reopened at this historical close; SESSION_0731.5
later mitigated it without changing that score.

**Systemic health (historical 0731 close):** CI = PENDING (no run URL; operator-held push) ·
findings routed 14/14 (FS-0028/0042/0051/0052/0053, D-058/59/60/61, RISK-16/#398,
DES-009/010/011/012) · FS patterns: FS-0028 OPEN at this score

**Verdict:** code is ready for the push gate; systemic 9.8 was not earned. `/ggr` Phase 3 offers the
operator: accept the transparent 8.9 cap and authorize push, try again, or keep improving. Another
loop cannot erase this session's FS-0028 occurrence.

### Keep-improving checkpoint — SESSION_0731.5

The operator elected keep-improving. Cody's first hostile implementation pass scored **8.2** and
caught three real guard-framework defects: worktree-owned formatter config, a disposable-lane
installer path, and doctor querying the retired repository. The corrected guard materializes staged
sources and staged configs into scratch, batch-formats only the copy, compares exact paths, and runs
a full index-workspace check when formatter config changes or is deleted. Installer derives canonical
from `--git-common-dir`; doctor validates the BBL origin and exact canonical hook path.

A final Cody pass scored **9.9 GO**; Giddy scored the bounded remediation **9.8 CLEARS LOCALLY**.
Defeat coverage includes both source partial-stage directions, staged/worktree config divergence,
config-only semantic expansion, config deletion/default behavior, spaces, ordinary deletions,
missing Oxfmt, no index/worktree mutation, actual Git hook invocation, linked-lane installation, and
the historical pre-fix/repaired **6/6 reject / 6/6 pass** proof. The harness is exercised by
`bun run test`; final full-suite proof is **1963 pass / 0 fail, 5367 assertions, 246 files**. CI
remains behind the explicit push wall.

**Systemic health:** CI = PENDING (operator-held push; no run URL) · findings routed 1/1 (FS-0028) ·
FS patterns: FS-0028 mitigated (SESSION_0731.5 defeat-test)

The bounded line counts FS-0028; the wider session router additionally fixed/routed the hostile
FS-0024 and FS-0040 recurrences and therefore remains 16/16. SESSION_0731's historical systemic
8.9 is unchanged.

## Reflections

- A quality delta is unauditable without an immutable before-state, even when the after-state is
  excellent. → route: FS-0042
- A reader-contract change selects tests through its consumers and fixture prerequisites, not by
  whether an E2E filename changed. → route: FS-0051
- Export names can tell the migration truth, but readonly fields make the immutable axis and
  temporary anchor mechanically visible. → route: #380
- Inherited design debt should be made visible without smuggling output changes into a parity-only
  data refactor. → route: DES-009/DES-010/DES-011/DES-012
- Two executable close gates must share one calendar definition or time-zone boundaries manufacture
  contradictory failures. → route: FS-0053

## Review log

### SESSION_0731 — All-hands rank-seam polish

**SESSION_0731_REVIEW_01 — Giddy hostile close and systemic gate**

- **Reviewed tasks:** SESSION_0731_TASK_01 through SESSION_0731_TASK_06
- **Dirstarter docs check:** live docs checked
- **Sources:** `https://dirstarter.com/docs/theming`, `https://dirstarter.com/docs/deployment`,
  `https://dirstarter.com/docs/environment-setup`, local component inventory, ADR 0040, ADR 0058
- **Verdict:** Weighted code quality was 9.8 and every local gate/build was green; systemic `/ggr`
  was capped at 8.9 while FS-0028 was open. SESSION_0731.5 later mitigated the pattern without
  rewriting that score. Merge remains forbidden until the operator accepts the historical cap,
  authorizes the push, and own-lane CI returns green.

**SESSION_0731_REVIEW_02 — Keep-improving FS-0028 defeat loop**

- **Reviewed task:** SESSION_0731_TASK_07
- **Dirstarter docs check:** not applicable; this is the repo's tracked custom hook framework.
- **Sources:** staged-index Git behavior, local Oxfmt configs, FS-0024/0028/0040, installer/doctor,
  and executable shell/Bun fixtures.
- **Verdict:** Cody 9.9 GO; Giddy 9.8 CLEARS LOCALLY. FS-0028 is defeat-tested and mitigated;
  historical SESSION_0731 remains 8.9, and push/CI remains operator-held.

## Hostile close review

### SESSION_0731 — All-hands rank-seam polish

#### Review

**SESSION_0731_REVIEW_01 — Earn the score; do not inherit it**

- **Reviewed tasks:** SESSION_0731_TASK_01 through SESSION_0731_TASK_06
- **Dirstarter docs check:** live docs checked
- **Sources:** live theming/deployment/environment docs above; ADR 0035/0040/0058; code-quality
  matrix; final diff from `75b15b71`
- **Verdict:** The original 9.2 was not earned by any hostile lens. Three-pass correction removed
  introduced duplication, fixed the semantic/type surface and documentation drift, and routed every
  residual. The diff is ready for its held push only after the final deterministic rerun; it is not
  merge-ready until CI is green. The structural 0.2 belongs to #380, not to work this lane may fake.

#### Eight-question verdict

1. **Plan sanity — corrected, not originally sound.** Pass 1 conflated clone groups/families,
   static design inspection/live proof, and pre-push/post-push evidence. The fixed plan separates
   introduced debt, inherited debt, manual boundaries, and the authorization wall.
2. **Dirstarter compliance — aligned.** No baseline primitive, theme, auth, project structure, or
   deployment convention was replaced. Shared projections/test helpers extend the repo; inherited
   visual deviations are DES-009..012, not newly hand-rolled UI.
3. **Security — no new exposure.** Public projections remain allowlists, rank provenance stays
   private, technique-media stays absent, and no credential/session material entered the diff.
4. **Data integrity — safe for the current bridge, not the end state.** Compatibility sync and
   parity tests preserve status/provenance today. The DB does not yet enforce provenance
   immutability or own facts on one table; that accepted structural limit is #380 after #398.
5. **Lifecycle proof — credible but split.** Unit/integration projection proofs and production build
   cover the data path. Live drawer/table/modal/grid behavior remains the recorded operator DOM/AA
   checklist because #397 changed data expressions, not render markup.
6. **Verification honesty — no sandbox theatre.** Fallow has a real before/after, tests exercise DB
   fixtures, and `next build` completed 305 pages. Browser/CI claims remain MANUAL/PENDING until run.
7. **Workflow honesty — passed with explicit exceptions.** Canonical branch, task IDs, explicit
   staging, three-pass escalation, no frozen edits, explicit paths, no push, and routed findings are
   present. The monolithic bow-out runner was not executed because it would violate the operator's
   build/Graphify boundaries; equivalent permissible gates are recorded individually.
8. **Merge readiness — ready to push, not yet ready to merge.** Local build is green. Final full
   gates, operator authorization, own-lane CI/Playwright, and the resulting URL are hard walls.

#### Findings

**SESSION_0731_FINDING_01 — Render and CI proof cannot be inferred from static review**

- **Severity:** medium
- **Task:** SESSION_0731_TASK_04 / SESSION_0731_TASK_06
- **Evidence:** Desi checklist above; DES-009..012; affected-E2E manifest; no push/CI run exists yet
- **Impact:** claiming launch/AA/systemic green now would be false confidence.
- **Required follow-up:** under DES-009/010/011/012 and FS-0051, run the operator foreground DOM/AA
  checklist, authorized push, and green CI; remediate inherited UI findings only in their lane.
- **Status:** open — routed to DES-009/010/011/012 and the explicit push gate.

#### Kaizen reflection triage

1. **Is this safe and secure; what proves it?** Current data behavior is proven by focused/full
   unit/integration tests, projection redaction pins, Fallow, tsc/lint, and a successful production
   build. Provenance immutability is type-visible but only documented at the DB boundary until #380.
   Green own-lane Playwright/CI plus the exact live DOM/axe/contrast/screen-reader checklist closes
   the remaining release/UI proof.
2. **Preventable failed steps:** five were caught before push: duplicate Jetty header, stale #377
   blocker, missing DES allocator support, UTC/local close-date disagreement, and six files committed
   without mandatory format-check. Header uniqueness, live dependency-state checks, allocator-prefix
   contract tests, one UTC date definition, and builder-side `format:check` prevent those classes.
   One consolidated evidence matrix saves more time than copying proof across lenses.
3. **Confidence by scale:** 100 members **9.9/10**; 1,000 **9.7/10**; 10,000 **9.2/10**;
   aggregate **9.2/10**. Queries remain per-member/bounded and this refactor adds no wider fetch or
   write amplification. The 10k discount is lack of a new load run, not an observed regression.

## Baton (paste-ready)

```
/bow-in — All-hands polish pass (pre-#377), SESSION_0731. Adopt (flip status → in-progress).
Repo: black-belt-legacy. Scope = files touched by #397 + #399 (git show --stat 1c13dac9 + PR #399).
Petey orchestrates: TWO passes per agent, grade at every step. Cody: code+schema grade +
/fallow-fix-loop (Apple bar: no god files, Pocock code-tells-the-story, Jetty annotations per
docs/protocols/jetty-annotation-standard.md). Desi: design review of touched surfaces vs
docs/knowledge/wiki/files/design-system-grid-ratio-hierarchy.md (+doctrine §3–5). Doug: grade
SESSION_0730's verification process step-by-step; route process fixes. Petey: grade plans/docs
for the files (kill drift). Giddy: final /ggr — clear line 9.8+.
Constraints: behavior parity; schema frozen; IMPORTED-lock stays lifted; NO-LEAK; #380 blocked
on #398. HOLD every push. #377 is NEXT session (0732) — do not build the guard here.
```

## Next session

→ SESSION_0732 — **#377 CI read-guard** (build lane; stub staged by 0730, carried forward).
