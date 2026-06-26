---
name: code-quality
description: Score a unit of code against the repo's code-quality-matrix (the code-gold-standard) — a /10 across correctness, security, simplicity, readability, maintainability, scalability, and Dirstarter/custom reuse-fit, with hard caps, then answer "is this Apple/Facebook-grade?" and apply the fixes that close the gap (no behavior regression). Use when the user says "/code-quality", "score this code", "is this gold-standard / Apple-Facebook quality", "run the code-quality matrix", "grade this module", or asks how well-written (not just functional) recently-touched code is.
---

# code-quality

Apply the [`code-quality-matrix`](../../docs/protocols/code-quality-matrix.md) to a unit of code and produce
a defensible `/10` plus the prioritized fixes that raise it. The matrix is the rubric; this skill is the loop
that gathers evidence → classifies → scores → caps → fixes → re-verifies → re-scores.

> Read the matrix doc first — this skill scores **against** it and cites `code-quality-matrix §N`. Don't
> restate the rubric here; load it.

> Repo context: `ronin-dojo-app`. Run commands from `apps/web`. `fallow` is invoked via `npx fallow …`
> (confirm it resolves first — `npx fallow --help`; if it isn't installed, score D3/D5 from a manual
> complexity/dupe read and say so). macOS has **no `timeout`** binary. Default DB is `ronindojo_prodsnap`.
> Dev server: `npx next dev --turbo` on `localhost:3000` (FS-0002). Respect explicit-push: build, verify,
> report — never push.

## The Goal

> Turn "does it work?" into "would a senior engineer at Apple or Facebook defend this in review?" — a scored,
> evidence-backed verdict per the code-gold-standard, and the smallest set of fixes that closes the gap,
> applied with **behavior proven unchanged**.

## Phase 0 — Scope + classify

1. **Scope the target.** A diff (`git diff HEAD` / `git diff main...HEAD`), a file, a module, or a feature
   area. If empty/ambiguous, ask. For a multi-area target (e.g. "last 3 sessions' app code"), enumerate the
   units and score each separately — a single blended score hides the weak module.
2. **Classify each unit (matrix §3): A / B / C.**
   - **A** — extends a Dirstarter L1 layer (storage, payments, media, content, monetization, blog, auth,
     theming, Prisma, hosting) → reference = live Dirstarter docs + the baseline pattern.
   - **B** — custom extension, no Dirstarter equivalent (lineage, Passport, claim, directory) → reference =
     the relevant ADR / domain hub / L1 primitives / `custom-component-inventory`.
   - **C** — genuinely new primitive → reference = §1 gold-standard; must be inventoried.
   The class decides what D7 (and D1/D2) are judged against. Record it.

## Phase 1 — Gather objective evidence (don't score from vibes)

Collect the signal the matrix's dimensions cite, per unit:

```bash
cd apps/web
npx fallow audit --changed-since HEAD --gate new-only --max-crap 30   # D3 CRAP/complexity, D5 dead code
npx fallow audit --changed-since HEAD --gate new-only                 # D3 duplication clone-groups
npx fallow health                                                     # D5 maintainability index, CRAP dist
bun run typecheck && bun run lint:check                               # code-guardrails floor (G2/G3)
```

- **D1/D2** — does it touch an exposed/unauthenticated surface? If yes, run the security angle (uploads:
  content-sniff vs declared MIME, size ceiling on the buffer, rate-limit enforced, authz proven, safe storage
  key) — this is the `hostile-close` "security proof" cap test.
- **D6** — scan for per-request work on a hot/startup path (queries added to a layout), N+1, missing indexes;
  form the 100 / 1k / 10k confidence triad.
- **guardrails** — check G1–G9 adherence (no nested ternaries, no `any`, no raw HTML when a Dirstarter
  component exists, JETTY header on new server/component files).

Separate **yours** (introduced by the diff) from **inherited** (pre-existing debt the unit sits near). You
score what the unit *is*; inherited debt is named as a follow-up, not adopted (matches `fallow-fix-loop`).

## Phase 2 — Score the seven dimensions

For each unit, assign D1–D7 (0–10) using the matrix anchors (§2). Ground every score in Phase-1 evidence —
no bare numbers. Then:

1. **Weighted average** = Σ(score×weight) ÷ 11.0 (weights in matrix §2).
2. **Apply caps** (matrix §4): final composite = min(weighted average, lowest applicable cap). A behavior
   regression caps at 6.9 (not shippable); security/data-integrity/Dirstarter-bypass/uninventoried-pattern cap
   at 8.9; no-credible-verification caps at 9.4.
3. **Verdict** from the score→action table (§5) + a one-line Apple/Facebook answer.

Emit the matrix §6 output block per unit. Be honest — the point is to surface debt, not to award a 9.

## Phase 3 — Fix the gap (optional but default when asked to "fix")

If the user wants the gap closed (not just scored), apply fixes in matrix priority order: **security/
correctness → real bugs → DRY/dead-code → complexity extraction → readability → perf.** This *is* the
`fallow-fix-loop` Phase 3 — defer to it for the mechanics. Keep each fix small; prefer depth over bandaids
(lift a duplicated predicate to one helper; extract an oversized branch; add the missing DB constraint;
inventory the new primitive). Don't bundle unrelated cleanup.

**Hard rule: no behavior regression.** Every fix is a refactor, not a rewrite. If a change alters observable
behavior, it is out of scope for this loop — stop and surface it.

## Phase 4 — Re-verify behavior, then re-score

Non-negotiable (same as `fallow-fix-loop` Phase 4):

1. Gates: `bun run typecheck`, `bun run lint:check`, `bun run format` then `format:check`, and the
   **touched-area** tests only (`bun test <changed files>`). ⚠ `bun test` can fire **real Resend emails** —
   confirm the email seam is stubbed before running anything that imports a notify path.
2. **Headless re-verification** of the rendered behavior (don't trust source) — Playwright isolated browser,
   navigate the changed flows, assert key strings, screenshot + `Read` visual changes. Every check that
   passed pre-fix must still pass — that is the proof of "no regression."
3. **Re-run Phase 1 fallow** and **re-score Phase 2.** Report the before→after composite and the before→after
   fallow delta. The Goal is met when the introduced debt is resolved (or accepted-with-reason) and behavior
   is provably unchanged.

## Output

- **Per-unit score card** (matrix §6 block): class, D1–D7 with evidence, weighted avg, cap applied, composite,
  Apple/Facebook verdict, top fixes.
- **Roll-up** for a multi-unit target: a table of unit → composite → verdict, weakest unit first.
- **Fixes applied** (if Phase 3 ran): one line each with before→after where measurable.
- **Verification**: gates + headless result (X/Y) + screenshots; before→after fallow + composite delta.
- **Inherited follow-ups**: named, not hidden.

## What this is NOT

- Not a bug hunt — it scores *quality*; use `/code-review` (or the fallow loop's review phase) for deep
  correctness sweeps and feed confirmed bugs into D1.
- Not a push — respect explicit-push: build, verify, report, wait for "go".
- Not source-only — if you didn't render/run it, D1 cannot exceed the no-verification cap (9.4).
- Not a grade curve for custom code — Class B/C is held to the same gold standard, judged against the repo's
  own documented patterns (matrix §3), not excused because "Dirstarter doesn't have it."
