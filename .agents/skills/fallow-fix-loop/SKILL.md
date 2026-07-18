---
name: fallow-fix-loop
description: Audits and cleans a current diff with fallow metrics, adversarial review, behavior-preserving fixes, runtime verification, and before/after proof. Use when the user says /fallow-fix-loop, asks for fallow cleanup, or requests CRAP, duplication, dead-code, or complexity reduction without regression.
---

# Fallow Fix Loop

## Goal

Leave scoped diff measurably cleaner: introduced dead code/duplication/complexity fixed or accepted with
reason; inherited debt named; behavior re-proven unchanged. Never push.

## Quick start

1. Define scope: working diff, `main...HEAD`, commit range, PR, or explicit paths.
2. From `apps/web`, capture pre-fix evidence:

   ```bash
   npx fallow audit --changed-since HEAD --gate new-only --max-crap 30
   npx fallow audit --changed-since HEAD --gate new-only
   npx fallow health
   ```

3. Record CRAP/complexity, dead-code issues, clone groups, maintainability, inherited exclusions.

## Workflow

### 1. Diagnose

- Split findings: introduced/fixable, inherited/report-only, false positive/accepted.
- State top targets before editing. Correctness/security outrank cleanup.

### 2. Review in parallel

Spawn focused Codex subagents for disjoint review angles:

- correctness/security line scan;
- removed-behavior invariant trace;
- callers/callees and contract drift;
- reuse, simplicity, hot-path/perf.

Verify candidates against source/tests. Keep confirmed or plausible findings; discard refuted ones.

### 3. Fix

Order: security/correctness → bugs → duplication/dead code → complexity → performance. Keep edits bounded,
behavior-preserving, and inside touched surface. Route adjacent debt to ledger instead of expanding scope.

### 4. Re-verify

From final state run relevant gates:

```bash
bun run typecheck
bun run lint:check
bun run format:check
bun run test
```

Use `bun run test`, not bare multi-file `bun test` (FS-0027). For route/UI changes, run isolated Playwright
or browser proof and inspect screenshots/console. Confirm email seams are stubbed before email-adjacent tests.

### 5. Re-measure

Re-run baseline commands. Report before → after for dead code, clone groups, CRAP/complexity, maintainability.
Loop fixes/re-verification until no introduced finding remains or a real blocker is documented.

## Output

- Diagnosis: baseline metrics, introduced vs inherited.
- Findings: severity-ranked with evidence.
- Fixes: one line each.
- Verification: exact gates and runtime proof.
- Delta: before → after metrics; named inherited follow-ups.

## Guards

- Run FS-0024 cwd/remote guard before mutating git.
- Never chase inherited repo-wide debt inside a bounded diff.
- Never claim cleanup without final-state behavior proof.
- Hold commits at G3; every push/merge/deploy needs explicit operator authorization.

