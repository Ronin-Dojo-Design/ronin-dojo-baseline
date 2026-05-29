# Petey plan — SESSION 0282

## Objective
Align BBL brand chrome to red on `bbl.local`, validate visible branding, and queue optional admin accent-picker enhancement.

## Orchestration

1. **Petey (orchestrator)**
   - Confirm scope, blockers, and done criteria.
   - Keep SESSION_0282 task ledger current.

2. **Cody (implementation)**
   - Update BBL primary token in `apps/web/app/styles.css` (light + dark).
   - Update directly related docs (ADR/session notes).

3. **Doug (QA)**
   - Run available lint/test/build gates.
   - Run brand smoke on `bbl.local` when env permits.

4. **Desi (design consistency)**
   - Confirm BBL red token against source-of-truth brand docs once monorepo access is available.
   - Approve whether BBL and WEKAF can share red or require distinct shades.

5. **Giddy (git + delivery)**
   - Keep commits scoped and clean.
   - Merge/rebase strategy only if requested.

6. **Brandon (brand + launch)**
   - Validate launch-facing brand correctness for header/footer/title + accent usage.

## Parallelizable tracks

- **Track A (Cody):** token + doc updates.
- **Track B (Doug/Desi):** smoke + design verification.
- **Track C (Petey):** session/task docs + blocker logging.

## Follow-up candidate

- Admin dashboard accent color picker (feature slice):
  - brand-level persisted color token
  - guarded admin UI control
  - CSS variable wiring + validation
