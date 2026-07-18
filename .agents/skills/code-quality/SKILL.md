---
name: code-quality
description: Scores code against the Ronin code-gold-standard, applies hard caps, fixes the smallest quality gaps, and re-verifies behavior. Use when the user says /code-quality, requests a quality score, asks whether code is Apple/Facebook-grade, or wants gold-standard review and refinement.
---

# Code Quality

Read [`code-quality-matrix`](../../../docs/protocols/code-quality-matrix.md) completely before scoring.

## Goal

Produce evidence-backed D1–D7 score, honest cap, senior-review verdict, smallest behavior-preserving fixes,
then re-score. Never push.

## Workflow

### 1. Scope and classify

Enumerate each file/module separately; blended scores hide weak units.

- Class A: extends Dirstarter L1 (payments, auth, storage, media, content, monetization, theming, Prisma,
  hosting) → current live docs + baseline pattern.
- Class B: Ronin custom extension → ADR/domain hub/L1 primitives/custom inventory.
- Class C: new primitive → gold standard; inventory it in same change.

### 2. Gather evidence

From `apps/web`:

```bash
npx fallow audit --changed-since HEAD --gate new-only --max-crap 30
npx fallow audit --changed-since HEAD --gate new-only
npx fallow health
bun run typecheck
bun run lint:check
bun run format:check
```

Trace exposed authz/input/DB integrity; inspect hot paths/N+1/indexes; check code guardrails and reuse. Separate
introduced findings from inherited debt. For Class A, record live Dirstarter URLs/date.

### 3. Score

Score D1 correctness, D2 security/integrity, D3 simplicity, D4 readability, D5 maintainability, D6 scale,
D7 convention/reuse. Weighted average uses matrix weights. Apply caps:

- behavior regression: 6.9;
- missing security/integrity proof, Dirstarter bypass, uninventoried pattern: 8.9;
- no credible runtime/test verification: 9.4.

Target ≥9.5 per unit. Ground every number in command, test, render, or file-line evidence.

### 4. Fix and prove

When fixes requested, use sibling [`fallow-fix-loop`](../fallow-fix-loop/SKILL.md): security/correctness first,
then DRY/dead code, complexity, readability, performance. Observable behavior changes are out of scope.

Run final-state gates with `bun run test` (FS-0027). Render route/UI behavior with isolated browser proof;
inspect console/screenshots. Re-run fallow and re-score.

## Output per unit

- Class and reference.
- D1–D7 table with evidence.
- Weighted average, cap, composite.
- Apple/Facebook verdict.
- Top fixes and before → after score/metrics.
- Inherited follow-ups, named not hidden.

## Guards

- No vibe scores; no source-only 9.5.
- No unrelated refactor.
- Run FS-0024 guard before mutating git.
- Hold at G3; every push/merge/deploy needs explicit operator authorization.

