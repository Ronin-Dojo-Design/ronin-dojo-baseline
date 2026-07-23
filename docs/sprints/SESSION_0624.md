---
title: "SESSION 0624 — AM Coffee Review + Merge (WL PRs #255/#256/#257)"
slug: session-0624
type: session--review
status: closed
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0624
next_session: docs/sprints/SESSION_0634.md
sprint: S12
lane: repo
recipe: "AM_Coffee_Merge_Review"
goal_ids: ["G-023"]
tickets: ["WL-P3-54", "WL-P3-24", "WL-P3-37", "WL-P3-55", "WL-P3-41", "WL-P3-46", "WL-P3-61", "FS-0038", "WL-P3-63"]
pairs_with:
  - docs/sprints/SESSION_0620.md
  - docs/sprints/SESSION_0625.md
  - docs/sprints/SESSION_0631.md
  - docs/sprints/SESSION_0634.md
  - docs/protocols/recipes/AM_Coffee_Merge_Review.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/protocols/failed-steps-log.md
---

# SESSION 0624 — AM Coffee Review + Merge

> **Pre-staged stub (ADR 0049), staged by SESSION_0620.** **Parallel pair** with
> [SESSION_0625](SESSION_0625.md) (MMB_Meeting_Intake) — run in separate worktrees/lanes. This is the
> **coffee-review primary**: review + merge the 3 autonomous WL-clearing PRs from the SESSION_0620 morning.
> Recipe: [AM_Coffee_Merge_Review](../protocols/recipes/AM_Coffee_Merge_Review.md).

## Operator

Brian + claude-session-0624

## Goal

Review and merge the **3 clean WL-clearing PRs** SESSION_0620 produced autonomously (Codex), banking ~7 WL
items. Operator-gated merges (nothing merged without the coffee word).

## This session's task (the adopted stub — completed)

**Task — AM coffee merge review (per the recipe card).** Merge PRs
[#255](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/255) (WL-P3-54),
[#256](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/256) (WL-P3-24/37/55), and
[#257](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/257) (WL-P3-41/46/61); resolve the
known `SESSION_0622.md` collision between #256 and #257; keep the WL ledger consistent on `main`.

**Done means:** the 3 PRs merged (or explicitly deferred with a reason), the `SESSION_0622.md` dup resolved,
WL ledger consistent on `main`. — **All three met.** (The stub's suggested merge order was #255 → #256 →
renumber #257 → #257; the executed order was #255 → #257 → #256, because #256 turned out to be genuinely red
and #257 was clean. The stub also suggested renumbering to `SESSION_0623`, which was not free.)

> *(This heading was `## Next session` in the inherited stub — it described **this** session's work, not the
> follow-on. Renamed at close so the forward pointer below is unambiguous. See FS-0038.)*

## Next session

**Goal — [`SESSION_0634`](SESSION_0634.md): CRM as a kernel feature-module (brand-agnostic, all brands).**
Operator-directed at this bow-out: *"Let's get back to the CRM goal for all brands (this is kernel based, so
all brands can use it)."* Per ADR 0051, `leads/CRM` is a named kernel feature-module — Mammoth is where it
was **proven**, not where it belongs. Frontmatter `next_session:` points at 0634.

> **Course-correction recorded.** I had staged `SESSION_0625` (MMB intake) as the next lane, since it was
> this session's staged parallel pair. The operator corrected that at the bow-out ask: **0625 is already
> being closed out in its own lane.** Repointed to the CRM kernel lane.

**Inputs to read:** `SESSION_0634.md` (the stub) · `goals-ledger.md` G-021 / G-002 / G-027 / G-028 ·
ADR 0051 (kernel → brand → app) · ADR 0038 (separate DB per product) · ADR 0040 + G-005 (the proven
"extract the L1 *down* from an app" pattern) · `clients/mammoth-build-crm/**`.

**First task:** adopt `SESSION_0634`, then resolve its **first decision** — there is **no kernel-level CRM
goal row**; the ledger has G-021 (Mammoth *implementation*) and G-002 (per-product DB). Mint a new goal
(proposed G-032, confirm against the ledger — the `G` mint doesn't scan sibling branches), extend an
existing one, or park it as a PL row. This is a **Plan lane** (`/pp` or `/ppp`): grill the module boundary,
the package shape under ADR 0038's separate-DB rule, and **which brand consumes it second** — an extraction
with one consumer is a rename, not a kernel. No schema or package changes.

**⚠ Bow-in navigation warning (FS-0038):** do **not** use "highest-numbered file in `docs/sprints/`" to find
your session. `SESSION_0631.md` is a **closed** record that arrived via the #256 merge (a dup-resolution
renumber), and sibling worktrees hold 0630/0632/0633. Your stub is **`SESSION_0634`**. Other genuinely-staged
stubs: `SESSION_0623` (WL-clearing chain) and `SESSION_0605`.

**Also queued, not blocking:** `SESSION_0623` (self-perpetuating WL-clearing chain — the open-PR queue is
empty, so it has runway) · **WL-P3-63** (the unsmoked cancel→reopen dialog reset, logged this session) ·
FS-0038's real fix (bow-in should select by `status: staged`, not highest number).

## Task log

| ID | Task | Status |
| --- | --- | --- |
| SESSION_0624_TASK_01 | Review + merge PR #255 (WL-P3-54 — exported graph constants + AABB unit test). | done |
| SESSION_0624_TASK_02 | Review + merge PR #257 (WL-P3-41/46/61 — safe-action test stabilization + 2 stale ledger rows). | done |
| SESSION_0624_TASK_03 | Diagnose PR #256's red chromium run; fix the `Row actions` a11y-rename e2e break. | done |
| SESSION_0624_TASK_04 | Resolve the `SESSION_0622.md` duplicate across #256/#257 without losing either lane's record. | done |
| SESSION_0624_TASK_05 | Re-run CI on #256 and merge once green. | done |
| SESSION_0624_TASK_06 | Publish the frozen State-of-Dojo snapshot (operator asked at bow-in). | done |

## Bow-in

- **Canonical-occupancy guard (FS-0035):** `canonical-claim.sh check --session 0624` → free; claimed.
- **Parallel-lane assessment (step 1d):** ran — no fan-out. The three PRs are one coherent risk class
  ("open PRs"), and the dup-resolution work serializes them, so a single inline lane is right.
- **Petey's three questions + the State-of-Dojo ask** — asked via `AskUserQuestion`. Operator answered
  **Go** (lane unchanged) / **Fix specs** (for #256) / **Yes** (publish the snapshot).

## Merge dispositions

| PR | CI | Disposition |
| --- | --- | --- |
| [#255](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/255) | all green | **MERGED** — exports `NODE_WIDTH`/`NODE_HEIGHT` and adds a pure AABB-overlap test over `bbl-bjj-graph.json`. No runtime behavior change. |
| [#257](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/257) | all green | **MERGED** — test-only (`setDefaultTimeout` + serialized fixture setup/teardown on 2 safe-action suites). WL-P3-41/46 were **stale rows**, corrected in the ledger with no code change; WL-P3-61 is the real fix. Zero prod-path risk. |
| [#256](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/256) | **RED** at `92045b87` → **fixed in `81ae1976`** → all green | **MERGED** after the e2e fix-up + dup resolution below. Not a re-run: green came from a *new* sha containing the locator fix. Chromium — the job that failed all 3 retries — passed at 27m23s. |

**Post-merge state of `main`:** all 3 PRs merged, **open-PR queue empty**. All 7 WL rows are **banked**
(flipped ✅ with the SESSION reference) — WL-P3-24/37/55 (#256), WL-P3-41/46/61 (#257), WL-P3-54 (#255).

**"Banked" is not "behaviour-verified" — the split (Doug, close review P1-4):**

| WL row | Strength of proof |
| --- | --- |
| WL-P3-54 | **Executable** — a unit test that fails on future drift. |
| WL-P3-61 | **Executable** — focused `bun test` 4/4 + 4/4 on both suites. |
| WL-P3-55 | **Executable** — the fixed chromium specs now cover the renamed kebab. |
| WL-P3-41, WL-P3-46 | **N/A — no code shipped.** Both were *stale rows*: the source already satisfied them (landed `513d2e1f` / `ce615258`, well before the flip). Verified by reading the source, not by a test. |
| WL-P3-24, WL-P3-37 | **Weakest — typecheck/oxlint/oxfmt only.** None of those can observe an a11y label association or a cancel→reopen form reset. WL-P3-24's own row admits the label-click smoke was skipped. The uncovered `form.reset()` behaviour is now logged as **WL-P3-63**. |

**Ledger-coherence fixes applied at this close (Giddy, findings 2–4):**

- WL-P3-24 and WL-P3-37 said "Resolved **SESSION_0622**" — but that was **#256's** work, whose record is now
  `SESSION_0631`. The renumber had been applied to the SESSION file and to WL-P3-55, but **not** reverse-checked
  into the other two rows, so 0622 appeared to have cleared six rows when it cleared three. Both repointed.
- **WL-P3-54 read as OPEN to every automated consumer.** Its ✅ sat mid-sentence in the *fix* cell, and
  `lib/loop-board/ledger-parse.ts:250` only counts a ✅ in the ID cell or at the start of the status cell —
  confirmed live (`ledger-backlog.ts --ledger=WL` listed it `open`). Moving one character un-lies the
  loop-board. Re-verified: none of the 7 rows read as open now. *(An earlier note here framed this as a
  grep artifact on my side; it was a real data bug.)*
- `SESSION_0621` (PR #255) merged with `status: in-progress`, `What landed: Pending`, and **no wiki-index
  row** — a landed lane left looking unfinished. Backfilled from its merged diff and closed.

**Production deploys — this session shipped to BBL prod three times.** Each merge advanced `origin/main`,
and `apps/web` changed in all three, so `vercel.json`'s `ignoreCommand` did **not** skip the build:

| Deployment | Commit | Time | State |
| --- | --- | --- | --- |
| 5579164613 | `17edc63f` (#255) | 20:16:25Z | success |
| 5579204357 | `ff4b5588` (#257) | 20:19:35Z | success |
| 5579612370 | `c95d3f92` (#256) | 20:48:38Z | success |

`state: success` proves the build shipped, **not** that the surfaces render — no post-deploy smoke of
`blackbeltlegacy.com` was run. Authorization: the operator opened the lane with "a clean green PR merge is
authorized as part of this coffee-merge lane" and answered **Go / Fix specs / Yes** at bow-in; the #256
merge was the explicit "wait for green, then merge" branch of that answer.

**Recipe conflict to resolve (Giddy finding 5).** [`AM_Coffee_Merge_Review`](../protocols/recipes/AM_Coffee_Merge_Review.md)
§"No-overnight-push law (unconditional)" says the sweep may merge only to **local** `main` and that its
terminal state is "verdicts ready, holding for your word — never a pushed commit, however clean the run."
This session merged via `gh pr merge`, which advances `origin/main` directly and deploys. That was correct
*here* — an **attended** session with per-PR operator authorization — but the recipe's text is written for
the **unattended overnight** case and admits no attended variant, so doc and trunk currently disagree. The
recipe needs an attended/unattended split; routed as a follow-up, not silently ignored.

### #256 — the red was real, not a flake

WL-P3-55 renamed the `RowActionsMenu` trigger's `aria-label` from `Open menu` → `Row actions`. Two
Playwright specs still located that button by its old accessible name and failed **all three** chromium
retries (`admin-collection-conformance.spec.ts:148`; `users-account-actions.spec.ts:65,77`). Firefox and
webkit passed because those admin specs are chromium-only, which is exactly why a single-browser red
deserved reading rather than a re-run. Both locators now query `Row actions`; `smoke.spec.ts` and
`mobile-shell.spec.ts` keep `Open menu` — that is the mobile-shell nav trigger, a different component.

**Lesson routed to the WL-P3-55 row:** the autonomous lane's hard-SKIP rule ("do not touch
`apps/web/e2e/**`") correctly stops a lane from *editing* e2e, but an accessible-name rename is precisely
the change class whose locators are e2e-coupled. Avoiding the directory is not the same as avoiding the
coupling.

### `SESSION_0622.md` duplicate — resolved

Two sibling Codex lanes each adopted the same staged `SESSION_0622` stub, so #256 and #257 **both** carried
`SESSION_0622.md` *and* `SESSION_0623.md`. #257 merged first and owns those numbers. #256's record was
renumbered to **`SESSION_0631.md`** — `ledger-id-next` mints `max(all claims)+1` across checkout ∪ worktrees
∪ `session-*` refs, and the highest live claim was `SESSION_0630` (staged in the `ronin-wl-lane` worktree
hours earlier), so the stub's suggested 0626/0627 were **not** free. (0626–0629 are burned gaps rather than
claims; ADR 0049 burns gaps either way, so the answer is unchanged.) #256's perpetuation stub was
**dropped rather than renumbered**: the surviving `SESSION_0623` stages
the identical continuation and already carries the fuller skip list (it names WL-P3-24/37/55 from #256 plus
WL-P3-54 from #255), so keeping both would have queued duplicate autonomous lanes. Merged via a **merge
commit into the PR branch, not a rebase** — the branch is published, and a rebase would have required the
force-push this lane forbids.

## What landed

- **All 3 WL-clearing PRs merged**, banking 7 WL rows; the open-PR queue went from 3 to **0**.
- **#256's red CI root-caused and fixed** — an a11y-label rename that orphaned 2 Playwright locators. 3 lines
  across 2 specs. The merged trunk tree is byte-identical to the CI-green tree (`git diff 81ae1976 c95d3f92`
  is empty), so the deployed code is exactly what passed.
- **The `SESSION_0622` duplicate resolved losslessly** — #257 keeps 0622/0623; #256's record became
  `SESSION_0631`; the redundant perpetuation stub was dropped in favour of the richer surviving one.
- **FS-0038 logged** — the latent bow-in trap this renumber arms ("highest-numbered file" is now a *closed*
  record), with both its downstream symptom and its upstream generator (unminted stub numbering).
- **WL-P3-63 logged** — the cancel→reopen dialog reset that shipped to prod with no covering test.
- **Ledger/index coherence repaired** — 2 mis-attributed WL rows repointed, WL-P3-54's ✅ moved so the
  loop-board stops reading it as open, `SESSION_0621` backfilled and closed, `SESSION_0620` status corrected.
- **`SESSION_0623`'s perpetuation step hardened** — restored a lost tooling hint and replaced local number
  increment with `ledger-id-next`, stopping the collision generator inside the self-copying chain.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/e2e/admin/admin-collection-conformance.spec.ts` | Kebab locator → `Row actions` (1 line). |
| `apps/web/e2e/admin/users-account-actions.spec.ts` | Kebab locator → `Row actions` (2 lines). |
| `docs/sprints/SESSION_0631.md` | #256's record, renumbered from the duplicate `SESSION_0622`. |
| `docs/sprints/SESSION_0624.md` | This record. |
| `docs/sprints/SESSION_0623.md` | Restored the lost first-task hint; perpetuation now mints via `ledger-id-next`. |
| `docs/sprints/SESSION_0621.md` | Backfilled `What landed`/`Files touched` from the merged diff; `in-progress` → `closed`. |
| `docs/knowledge/wiki/wiring-ledger.md` | WL-P3-24/37 repointed to `SESSION_0631`; WL-P3-54 ✅ moved to the ID cell; WL-P3-55 lesson; **new WL-P3-63**; `last_agent` + backlinks. |
| `docs/knowledge/wiki/index.md` | Rows for 0624/0625/0631; added missing 0621; corrected 0620 status. |
| `docs/protocols/failed-steps-log.md` | **New FS-0038** + frontmatter bump. |

## Decisions resolved

- **Operator (bow-in `AskUserQuestion`): Go / Fix specs / Yes.** Proceed with the coffee-merge lane; fix
  #256's specs rather than reverting the rename or deferring; publish a frozen State-of-Dojo snapshot.
- **Merge into the PR branch, never rebase.** The branch was published; rebasing would have required the
  force-push the lane forbids. Verified clean after the fact — `git reflog show origin/auto/session-0623`
  is strictly append-only.
- **Drop #256's perpetuation stub rather than renumber it.** Two identical staged WL-clearing lanes would
  have queued duplicate autonomous work; the surviving `SESSION_0623` is strictly richer.
- **Keep the `Row actions` rename, fix the specs.** It is the better accessible name; the specs were the
  stale side.

## Open decisions / blockers

- **None blocking `SESSION_0625`.** Its first task is doable as written.
- **Follow-ups routed, not blocking:** WL-P3-63 (unsmoked dialog reset) · FS-0038's real fix (bow-in should
  select by `status: staged`, not highest number) · the `AM_Coffee_Merge_Review` attended-vs-unattended
  split · merged branches `auto/session-0623` / `wl-clear-41-46-61` still undeleted, and the
  `ronin-codex-smoke` worktree still mounts merged `auto/session-0621` (tracked as WL-P3-57).

## Reflections

- **The cheapest thing I did all session was read a single-browser red instead of re-rolling it.** Firefox
  and webkit were green, which is the classic flake signature — but the failing job was chromium-only *by
  config* (`playwright.config.ts` scopes firefox/webkit to `e2e/lineage`), so "2 of 3 browsers agree" was
  never the evidence it looked like. It wasn't 2-vs-1; it was 1-vs-0. Every non-lineage spec shares that
  blind spot.
- **The renumber was the easy half; the reverse-check was the half I missed.** I applied `0622 → 0631`
  carefully to the SESSION file and to the one ledger row the merge conflict surfaced — and never asked
  which *other* rows that lane had written. Giddy found two. The lesson generalizes: when you renumber a
  record, grep the ID across every artifact it authored, not just the ones git shows you as conflicted.
- **A ✅ in the wrong table cell is a lie to a parser.** WL-P3-54 looked resolved to any human and read as
  open to the loop-board. Human-legible ≠ machine-legible, and the ledgers are consumed by both.
- **Two gates passed vacuously and I nearly let them stand as proof.** `bow-out-gates.sh` graded
  `SESSION_0631` (highest-numbered, already closed) instead of this session, and the FS-0031 e2e guard
  diffs against `origin/main` — which already contained my spec edits post-merge, so it had nothing left
  to gate. Both exited 0. A green gate that measured the wrong thing is worse than a red one.
- **What I'd tell myself starting over:** run the e2e evidence guard *before* merging the PR, not at close.
  After the merge it is structurally incapable of failing.

## Review log

**SESSION_0624_REVIEW_01 — `/ggr` composite 8.9/10 → auto-loop ran, then CLEARS at 9.1.**

- **Reviewed tasks:** SESSION_0624_TASK_01 … _06.
- **Lane/rubric:** review-merge lane. Giddy on git/structural judgment; Doug on verification honesty. No
  Class-A custom code (3 locator lines + docs), so the code-quality matrix does not drive the composite.
- **Pass 1 — Giddy: GO, 8.5/10.** Confirmed the not-a-flake diagnosis (no stale locators remain; the
  mobile-shell false positive correctly excluded), the renumber lossless, dropping the stub sound, the
  number choice correct, and no force-push anywhere. Deducted for ledger/index coherence: 2 WL rows
  mis-attributed after the renumber, WL-P3-54 machine-readable as open, `SESSION_0621` landed with no index
  row, 3 prod deploys unrecorded against a recipe whose text forbids pushing.
- **Pass 1 — Doug: NO-GO, 6.2/10** (hard cap: FS-0031 control bypassed, not merely unrecorded). Independent
  gates: `typecheck` exit 0 across 6 workspaces · `wiki:lint` 0 err / 112 warn (pre-existing) ·
  `format:check` 2031 files clean · `deferral-guard` exit 1. Found the e2e guard passing vacuously, "verified"
  overstated on 5 of 7 WL rows, the FS-0038 entry asserting a mitigation that did not yet exist, "re-run"
  mis-describing the green, and ~14 missing close sections.
- **Auto-loop (1 pass, within the ≤2 bound).** Every P1 and P2 fixed: FS-0038 corrected and its claimed
  mitigation actually built (`next_session:` + a rewritten forward block + the generator fix in
  `SESSION_0623`); "verified" replaced with a per-row proof-strength table; ledger attributions repointed;
  WL-P3-54's ✅ moved and re-verified against `ledger-backlog.ts`; `SESSION_0621` backfilled + closed + indexed;
  0620 status corrected; deploys tabulated; recipe conflict named; e2e waiver recorded below; WL-P3-63 opened.
- **Residual, accepted and logged (not silently dropped):** the e2e specs were never run locally (waiver
  below) · no local `next build` (the unpushed diff is docs-only, so §4a's trigger does not fire) · no
  post-deploy smoke of BBL prod · Giddy's low-severity items 10/12/13 (evil-merge shape, index prose
  regression, reciprocal-link asymmetry) accepted as not worth a second merge commit.
- **Score:** correctness 9.5 · safety 9.0 · honesty-of-record 9.0 (was 6.2; the record now states its own
  gaps) · ledger coherence 9.0 (was 7.0) · process discipline 9.0. **Composite 9.1 → CLEARS.**

**FS-0031 e2e run-evidence — explicit waiver.** `bun run e2e:evidence:check` exits 0 only because it diffs
against `origin/main`, which already contains the spec edits; `.e2e-run-evidence.json` is from Jul 16 and
records a *failing* run of an unrelated spec. The specs were **not** run locally. Substitute proof, which I
argue is stronger: PR #256's full CI matrix ran both specs on the exact merged tree and went red → green on
precisely the two failing tests, chromium 27m23s. Waiver reason: *"changed specs verified by the PR's own
pre-merge CI on the byte-identical merged tree; local run skipped."*

**Deferral guard** — `bun scripts/deferral-guard.ts docs/sprints/SESSION_0624.md` exits 1 on one hit (L58,
`"or explicitly deferred with a reason"`). **Dismissed:** that is the inherited stub's done-criteria
boilerplate, not a deferral — nothing was deferred; all 3 PRs merged. Every *real* follow-up this session
raised carries a ledger id (FS-0038, WL-P3-63, WL-P3-57).

## Hostile close review

Covered by `/ggr` above (one review, not two — `closing.md` §6.5). Giddy + Doug verdicts, caps, and the
auto-loop are recorded in `## Review log`. **Dirstarter docs check:** not applicable — no Dirstarter
baseline layer was touched (the diff is 3 Playwright locator lines plus docs/ledgers).

## ADR / ubiquitous-language check

**No ADR needed.** No architectural decision was made, changed, or rejected — this lane executed existing
policy (ADR 0049 numbering, the merge-wave recipe, explicit-push-authorization). The two governance gaps it
surfaced are logged as FS-0038 and a recipe follow-up rather than promoted to ADRs, because neither
overturns a ratified decision; both are read-path defects in how existing decisions are executed.

**No ubiquitous-language change.** No new domain term. "Banked vs verified" is used here as plain English
for a proof-strength distinction, not proposed as canon.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `wiring-ledger.md` `last_agent` codex-session-0622 → claude-session-0624 + backlinks 0624/0631 added; `failed-steps-log.md` updated 07-22 → 07-23, last_agent → claude-session-0624; `index.md` last_agent → claude-session-0624; `SESSION_0621.md` updated bumped. |
| Backlinks/index sweep | `SESSION_0624` backlinks += wiring-ledger + failed-steps-log; pairs_with += SESSION_0631. Index rows added for 0621/0624/0625/0631; 0620 status corrected. Known residual: `SESSION_0631.next_session` points backward at 0623 (semantically intended, structurally odd — Giddy 13). |
| Wiki lint | `bun run wiki:lint` → **0 errors, 112 warnings**; warnings pre-existing (`product/rdd/phase14-*`, `architecture/*`, `petey-plan-*`), none introduced. Independently re-run by Doug with the same result. |
| Kaizen reflection | Yes — `## Reflections`, 5 entries. |
| Hostile close review | `SESSION_0624_REVIEW_01` via `/ggr` — Giddy GO 8.5 · Doug NO-GO 6.2 → 1 auto-loop → composite **9.1 CLEARS**. |
| Code-quality gate (Class-A) | **No Class-A custom code** — the session's own code is 3 Playwright locator lines; everything else is docs/ledgers. Matrix not run. |
| Runtime verification (Doug) | **Not run by me.** The merged app-code was verified by each PR's own pre-merge CI (Playwright ×3 + typecheck + unit + Vercel build). Not verified: BBL prod post-deploy smoke; the cancel→reopen dialog reset (→ **WL-P3-63**). |
| Evidence-artifact URL | [State of the Dojo — SESSION_0624 snapshot](https://claude.ai/code/artifact/960f55db-27ec-457e-a426-13a39659e973) — status **keep**. Refreshed at close (397 sessions, post-#256) per the operator's bow-out answer. |
| Review & Recommend | Yes — `## Next session` points at `SESSION_0625` (already staged) + frontmatter `next_session:`, with the FS-0038 navigation warning. |
| Memory sweep | 2 memories updated: `bow-out-gate-runner-diffs-working-tree` (+ "grades the highest-numbered SESSION file, not yours") and `adr-0049-session-numbering` (+ "highest number ≠ most recent", FS-0038). Both index lines refreshed. |
| Next session unblock check | **Unblocked.** `SESSION_0625` is staged with its own first-task block; no operator input required to start. |
| Git hygiene | branch `main`; single close commit — hash reported at bow-out / see git log. Push diff is **docs-only** (`git diff --name-only origin/main..HEAD` → no `apps/`, `clients/`, `packages/`), so `vercel.json`'s ignoreCommand skips the deploy and ci/playwright `paths-ignore` skips the matrix. Fix worktree `ronin-0624-fix256` removed. Residual: merged branches `auto/session-0623`, `wl-clear-41-46-61` undeleted; `ronin-codex-smoke` still mounts merged `auto/session-0621` (WL-P3-57). |
| Pre-push build gate (§4a) | **Not triggered** — §4a fires on an `apps/web/**` push; this push is docs-only. The app code reached `main` through the 3 PR merges, each gated by its own CI + Vercel production build (all `success`). |
| Graphify update | `nodes=19797 edges=38823 communities=2705` (run pre-commit per FS-0025). |
| Secret scan | PASS — clean over touched md/json/yaml/html/env/txt. |
| Fallow delta | introduced findings: **0**. |
| Gate-runner caveat | `bow-out-gates.sh` targeted `SESSION_0631.md` (highest-numbered — but a *closed* record that arrived via the #256 merge) and reported "Touched: 0 files" from the clean working tree. Its task-log / evidence / `/ggr` gates therefore graded the wrong file; all were re-verified by hand against this file (6 task rows). Captured in memory. |

## Artifacts

- **[State of the Dojo — SESSION_0624 snapshot](https://claude.ai/code/artifact/960f55db-27ec-457e-a426-13a39659e973)**
  — **status: keep.** Frozen render of `bun scripts/state-of-project.ts` (395 sessions, 31 goals). Published
  on the operator's bow-in yes. **Refreshed at close** on the operator's ask — re-rendered
  after all 3 PRs merged (397 sessions), redeployed to the same URL, so the link reflects final trunk. The
  always-current view is free at `/app/state`.

## Post-close addendum — the push guard was hardened after this session closed

This session closed at `f60c2f91`. The operator then asked for the cross-lane push accident to be made
impossible ("make it foolproof, I'm tired of this"), so the work below happened **after** the close and is
recorded here rather than in a new session. It landed as **PR #259** (`a9905acf`).

**What prompted it.** The push rejection this session hit was not a fluke: **git worktrees share one ref
store**, so `refs/heads/main` is the *same ref* in canonical and in every `../ronin-NNNN` lane. A sibling
lane pushed `main` from its own worktree and thereby published this session's unpushed close commit. The
existing worktree-isolation rules do not cover it — they govern the **working tree**, not the **ref store**,
so a lane can be perfectly isolated and still do it. Logged by the 0625 lane as FS-0039.

**What we found (Giddy, verified by sandbox rather than by reading).** The FS-0039 `pre-push` hook that
merged in PR #258 **did not work**, on two independent counts:

1. `install.sh` wrote a **relative** `core.hooksPath` while its own output announced it "applies to
   canonical + every worktree." Git resolves a relative hooksPath per working directory, so it meant
   "*this* worktree's copy" — and a lane branched before the hook has no such directory. **Git skips a
   missing hooksPath silently, exit 0.** `../ronin-wl-lane` was verifiably running with zero hooks.
2. The hook never blocked `git push origin HEAD:main`. Its only `main` rule was a *non-fast-forward* check
   (a fast-forward is the normal case), and the loop filtered `local_ref` to `refs/heads/*` **before** any
   rule ran — `HEAD:main` passes `HEAD`, so it skipped both rules. That is the move `opening.md` used to
   *instruct*.

Recorded as **FS-0040**, the fourth in the repo's most persistent failure shape (FS-0035 rule-as-prose →
FS-0036 silent-no-op → FS-0037 unreachable-step → FS-0040 hook-absent-where-it-guards). Every one **passed
silently while broken.**

**What landed ([ADR 0053](../architecture/decisions/0053-main-is-pr-only.md)) — `main` is PR-only.**

| Layer | What it does | Why it is not sufficient alone |
| --- | --- | --- |
| **GitHub ruleset `main-pr-only`** (empty bypass, 0 approvals, no required checks) | The actual enforcement. Server-side. | — this is the one that holds |
| `pre-push` RULE B, keyed on the **destination** ref, ordered **above** the `refs/heads/*` filter | Fast local failure naming the right next command | A hook is defeated by not being installed, by a branch predating it, or by a caller holding the operator's credential |
| `scripts/githooks/doctor.sh`, wired into the bow-in read-path | Makes the guards **prove** they are live, from a lane worktree | Detects, does not prevent |
| Absolute `core.hooksPath` | Pins every worktree to canonical's copy on any branch | Local config; a fresh clone still needs `install.sh` |

Three ruleset parameters are load-bearing traps: **0 approvals** (a solo seat cannot self-approve, so ≥1
makes `main` permanently unmergeable), **empty bypass** (agents use the operator's credential, so an
admin exemption exempts every agent), **no required status checks** (`paths-ignore` covers `pull_request`,
so a docs-only PR never reports `ci` and a required check would hang forever).

**Verification — what was and wasn't proven.** Offline sandbox reproducing the original accident:
`push origin main`, `push origin HEAD:main`, and `push --all` all blocked with `main` provably unmoved;
`push -u origin HEAD` succeeds. The *installed* hook was then fed the real refs directly: blocks both attack
shapes, allows the lane push. `doctor.sh` exits 1 against the pre-fix config naming the bug, 0 after —
including from `ronin-wl-lane`, the worktree that had no hooks directory. **Not proven end-to-end:** the
server ruleset was verified via `gh api .../rules/branches/main`, not by attempting a real blocked push.

**Two honest notes.**

- **My first fix was also wrong.** I added RULE B *below* the `refs/heads/*` filter, and the sandbox showed
  lane content still landing on `main`. Reading it would have passed it. The ordering is the fix.
- **An earlier "live test" proved nothing** — `git push origin main` against the real repo returned
  `Everything up-to-date`, and git never invokes `pre-push` when there is nothing to push. A guard that is
  never invoked cannot block, and a green from it is a false green.

**A hazard this does NOT close — the checkout shape (routed as WL-P3-65).** Immediately after #259 merged, I
ran `git checkout -b` while the shell's working directory was still inside `../ronin-wl-lane` (the Bash tool
persists cwd across calls), which **redirected that sibling worktree's HEAD onto my branch.** Caught within
one command, reverted, nothing committed, no work lost — the worktree was clean. But it is the same
shared-ref-store family as FS-0039 in a shape the new guard cannot see: **`pre-push` fires on push, and this
was a checkout.** The `adr-0049-session-numbering` memory already records the 0588 version of this (a lane's
`git checkout` redirected the shared HEAD and a sibling's commit landed on the wrong branch). The durable
fix is the same discipline the ruleset just made unavoidable for pushes: **verify `pwd` and
`git branch --show-current` before any branch-mutating git command**, because in an agent shell the cwd is
sticky and invisible.

## Status

Single source of truth is the frontmatter `status:` field. (Closed at `f60c2f91`; the addendum above
records post-close work that landed as PR #259 / `a9905acf`.)
