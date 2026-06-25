---
name: fallow-fix-loop
description: Goal-driven quality loop on the current diff — fallow audit + health for CRAP/dupes/dead-code/complexity diagnosis, a multi-angle code review, implement the fixes, then re-verify (headless browser) that refactors didn't break behavior AND re-run fallow to prove complexity/duplication/dead-code dropped. Use when the user says "/fallow-fix-loop", "run the fallow loop", "fallow fix", "clean up this diff", or asks to audit + fix CRAP/dupes/dead code/complexity on what was just built.
---

# fallow-fix-loop

A repeatable quality pass over the **current change** (working-tree diff by default; a branch/PR/path if
given). The loop is goal-driven: **diagnose → review → fix → re-verify → re-measure → repeat until the
diff is clean** (no new dead code, no new duplication you introduced, complexity not worse than before,
all behavior still green).

> Repo context: this is `ronin-dojo-app`. `fallow` is in `node_modules/.bin` — invoke via `npx fallow …`.
> Run commands from `apps/web`. macOS has **no `timeout`** binary — don't wrap commands in it. Default DB
> is `ronindojo_prodsnap`. The dev server runs on `localhost:3000` (FS-0002: `npx next dev --turbo`).

## The Goal

> Leave the diff measurably cleaner than you found it: every fixable fallow finding that you *introduced*
> is resolved or explicitly accepted-with-reason, every real bug a careful reviewer would catch is fixed,
> and behavior is proven unchanged by a re-run of the verification — with a before/after fallow delta to
> prove it. Inherited (pre-existing) findings are reported, not silently adopted as yours.

Hold this Goal across every phase. Loop phases 3–5 until the Goal is met or you hit a real blocker
(surface the blocker, don't fake completion).

## Phase 0 — Scope + baseline

1. Get the diff: `git diff HEAD` (working tree) — or `git diff main...HEAD` / a passed PR/branch/path.
   This is the review scope. If empty, ask what to review.
2. **Capture the baseline fallow numbers BEFORE any fix** (so you can prove the delta):

   ```bash
   cd apps/web
   npx fallow audit --changed-since HEAD --gate new-only --max-crap 30   # CRAP + complexity findings
   npx fallow audit --changed-since HEAD --gate new-only                 # dead code + duplication detail
   ```

   Record: dead-code issues, duplication clone-groups, complexity findings, and **which are inherited**
   (the gate prints "excluded N inherited findings"). `fallow health` gives the repo-wide maintainability
   index + CRAP distribution if you want the broader picture. Inherited findings are reported as
   follow-ups, not fixed here (unless trivially in your touched lines).

## Phase 1 — Diagnose (read the findings honestly)

Separate the findings into:

- **Yours, fixable now**: dead code you added, duplication you introduced, a function whose CRAP you
  raised, a complexity you can extract.
- **Inherited**: pre-existing large functions / dupes the diff merely sits near. Report, don't adopt.
- **False positives**: one-off CLI scripts flagged "unused file" (expected — they're manual entry
  points), `react-email`/test-only deps, etc. Note and move on.

State the CRAP score and the top refactoring targets before touching anything.

## Phase 2 — Code review (multi-angle, recall-biased)

Spawn parallel finder agents (Agent tool) over the diff — at least these angles, up to ~6 candidates each:

- **Correctness line-scan** — every hunk + its enclosing function: inverted conditions, null deref,
  missing `await`, falsy-zero, swallowed errors, and **security on any NEW public/unauthenticated
  surface** (uploads: content-sniff vs declared MIME, SVG/XSS, size ceiling on the buffer not just
  metadata, rate-limit actually enforced, safe storage key).
- **Removed-behavior** — for each deleted/replaced line, find where the invariant is re-established.
- **Cross-file tracer** — callers/callees of every changed function; new precondition/return-shape/throw.
- **Cleanup** — reuse (name the existing helper), simplification (extract the bloated branch), efficiency
  (per-request work added to a hot/startup path — e.g. queries added to a layout), altitude (special-case
  vs generalize).

Then **verify** each surviving candidate with one agent → CONFIRMED / PLAUSIBLE / REFUTED. Keep
CONFIRMED + PLAUSIBLE. Correctness outranks cleanup when you must cut.

## Phase 3 — Implement the fixes

Fix in priority order: **security/correctness → real bugs → DRY/dead-code → complexity extraction →
perf**. Prefer depth over bandaids (lift a duplicated predicate to one helper; extract an oversized
branch into its own component; cache slow-moving reference data). Keep each fix small and reviewable.
Don't bundle unrelated cleanup. If a finding is better deferred, say so with the reason — don't silently
skip.

## Phase 4 — Re-verify behavior (refactors didn't break anything)

This is non-negotiable: a cleanup pass that changes behavior is a regression.

1. Gates: `bun run typecheck`, `bun run lint:check`, `bun run format` (then `format:check`), and the
   **touched-area** tests only — `bun test <changed test files>`. ⚠ `bun test` can fire **real Resend
   emails** (project gotcha) — run scoped to your files and confirm the test stubs the email seam before
   running anything that imports a notify path.
2. **Headless re-verification** of the actual rendered behavior (don't trust source). Pattern that works
   here (Playwright is the e2e dep; the MCP browser is often profile-locked, so launch an isolated one):

   ```js
   // scripts/tmp-verify.mjs — delete after
   import { chromium } from "playwright"
   const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{width:414,height:896} })).newPage()
   // navigate the changed flows; assert key strings via document.body.innerText/innerHTML
   // (inactive/hidden UI is still in the DOM — `hidden` class, not unmounted — so you can assert it)
   ```

   Capture a screenshot of each visual change and `Read` it to confirm before reporting. Re-run after the
   fixes — every check that passed pre-fix must still pass.

## Phase 5 — Re-measure (prove the delta)

Re-run the Phase 0 fallow commands. Report the **before → after**: dead-code issues, duplication
clone-groups, and complexity/CRAP on the functions you touched. The Goal is met when your introduced
findings are resolved (or accepted-with-reason) and behavior is still green. If a fix raised complexity
elsewhere, loop back to Phase 3.

## Output

A tight report:

- **Diagnosis**: baseline CRAP / dupes / dead-code, split yours vs inherited.
- **Review findings**: what was confirmed, severity-ranked; security findings first.
- **Fixes applied**: one line each, with the before→after where measurable.
- **Verification**: gates + headless result (X/Y checks), screenshots of visual changes.
- **Delta**: before → after fallow numbers; inherited follow-ups left for later (named, not hidden).

## What this is NOT

- Not a push. Respect the repo's explicit-push rule — build, verify, report; wait for "go".
- Not a chase of inherited CRAP. You own what the diff introduced; pre-existing debt is a named
  follow-up, not this loop's job.
- Not source-only verification. If you didn't render it, you didn't verify it.
