---
title: "SESSION 0632 — Client-intake kernel: one module, three brand instances (WS-A/B/C)"
slug: session-0632
type: session--open
status: in-progress
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0632
sprint: S12
lane: repo
goal_ids: ["G-021", "G-027"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0625.md
  - docs/protocols/recipes/Client_Meeting_Intake.md
  - docs/product/rdd/brand-brief.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0632 — Client-intake kernel (WS-A/B/C)

> **Pre-staged stub (ADR 0049), staged by [SESSION_0625](SESSION_0625.md).** Operator directive:
> *"We need this client intake setup for RDD but also for MMB for their clients (Metal Building
> Sales) — set that up as next session or in a WS ABC."*

## Goal

Turn SESSION_0625's single-app `/app/client-intake` into **one brand-agnostic kernel feature-module
with per-brand questionnaires**, and stand up the **Metal Building Sales** instance so Mammoth can
run discovery on *their* prospects — not just RDD on *its* clients.

This is the ADR 0051 model made literal: *any feature-module can run on any app.* The intake stops
being a BBL page and becomes a module the RDD app and the Mammoth CRM both mount.

## Where it stands (built SESSION_0625 — read before planning)

| Piece | Where | State |
| --- | --- | --- |
| Pure core — `Questionnaire` data, `toMarkdown`, `answeredCount`, `clientSlug` | `apps/web/components/app/client-intake/questions.ts` | ✅ built, 10 tests, zero deps |
| Interactive form (L1 primitives, localStorage, copy/download, no server call) | `apps/web/components/app/client-intake/client-intake-form.tsx` | ✅ built |
| Route + authz key `client-intake.manage` | `apps/web/app/app/client-intake/page.tsx`, `server/orpc/roles.ts` | ✅ built |
| RDD's 15 discovery questions (de-Tableau'd from the `.docx`) | same `questions.ts` | ✅ built |

**The problem it leaves:** the core is pure and portable, but it lives inside `apps/web` and the form
is built on `~/components/common/*` L1 primitives. `clients/mammoth-build-crm` is a **standalone bun
app** (not a workspace member; consumes `packages/ui-kit` via `file:`) and **cannot import either**.
That is the exact "kernel can't import an app L1" shape from [ADR 0040 Option B / G-005] — extract
the core down, don't fork it up.

## `/gq` discovery (SESSION_0625, canonical graph — 19,797 nodes)

Query: *client intake questionnaire form reuse ui-kit kernel extraction mammoth-build-crm feature
module portability*. Surfaced **[`docs/product/rdd/brand-brief.md` §7 "Kernel feature-modules RDD's
app runs"](../product/rdd/brand-brief.md)** — the canon table this module belongs in (it currently
lists "Leads / contact intake" as `[REUSE]`; client intake is its missing sibling). Also surfaced the
`new-brand-interview-*` recipe family as the doc-side cousins of the same intake motion.

## Work streams

### WS-A — Extract the intake kernel (gates B and C; run FIRST, inline)

- **Owns:** `packages/ui-kit/src/intake/*` (new) · `packages/ui-kit/src/index.ts` ·
  `packages/ui-kit/package.json` (add an `./intake` export) · then retarget
  `apps/web/components/app/client-intake/questions.ts` to re-export from the kernel.
- **Shape:** a `Questionnaire` type (`{ id, title, sections: { title, questions }[] }`) plus the
  serializer/counters. **Zero runtime deps, zero React** — ui-kit's React is a *peer* dep, and a
  standalone bun app has to import this without pulling one in.
- **Done means:** the 10 existing `questions.test.ts` assertions pass **unchanged** against the
  kernel (behavior-preserving extraction, not a rewrite); `apps/web` typecheck + build green.
- **Size:** small. One coherent inline Cody — not a fan-out.

### WS-B — The Metal Building Sales questionnaire (MMB content)

- **Owns:** `packages/ui-kit/src/intake/questionnaires/metal-building-sales.ts` + its test.
- **Content to cover** (from Michael's 2026-07-18 notes + MMB canon): the **four commercial lanes**
  — steel building supply · erection/install · concrete & excavation · building-only vs
  building + install — plus building spec/size, site readiness, permits/jurisdiction, delivery
  window, **Installation Path** (`Mammoth-Installed` / `Customer-Installed`, already canon in
  [`CONTEXT.md`](../product/mammoth-build/CONTEXT.md)), budget/financing, and decision-maker.
- **Why it matters beyond the form:** this is the first real consumer of the commercial-lane
  taxonomy, which SESSION_0625's intake audit found **unrouted** (GAP-1 — only the two Installation
  Paths reached canon; steel-supply-only and concrete+excavation have no home). Landing it here
  gives the drafted `MB-LANE-001/002` stories a reason to exist.
- **Depends on:** WS-A's exported type only — authorable in parallel with WS-C.

### WS-C — Mount the MMB instance in `clients/mammoth-build-crm`

- **Owns:** `clients/mammoth-build-crm/app/intake/*` + its local components. Built on **ui-kit
  m-card/tokens**, never `apps/web`'s `~/components/common/*` (it cannot reach them).
- **Standalone-client gotchas (do not rediscover):** `clients/*` are **not** bun workspace members —
  own `bun install`, own `bun.lock`, `file:` ui-kit resolved by a postinstall symlink. Root
  `test`/`lint` **never** cover them; client CI is **typecheck only**. UAT pattern is scratch-DB +
  fixture-login + in-page fetch.
- **Depends on:** WS-A. Disjoint from WS-B (different package, no shared file).

## Open decisions — pin these BEFORE dispatch (petey-plan: grill the forks first)

1. **Does the MMB intake persist, or export-only like RDD's?** Mammoth has real `Contact` /
   `Company` / `Project` / `Activity` models, so an intake that *creates a lead* is arguably the
   whole point — but that turns a zero-write demo-safe form into a CRM write path. **If persist:**
   reuse the SESSION_0582 `lib/contact-match.ts` dedupe matcher, never a second matcher, and keep
   the "explicit commit, never enrich/overwrite" posture MB-LEAD-002 already ratified.
2. **Where does RDD's own instance live?** It is in `apps/web` (BBL) today because that is what is
   deployed and authed. `apps/rdd` exists (a bare skeleton on ui-kit) and is the *correct* long-term
   home — brand-brief §7 is literally the RDD app's module table. Move, mirror, or leave?
3. **Is the intake a `[REUSE]` row in brand-brief §7?** If yes, add it to that table as part of WS-A
   so the canon stops under-counting the kernel.
4. **Does MMB's intake need the `contains_real_data` toggle at all?** For Mammoth's own prospects,
   real data is the point — the demo-safe switch is an RDD-consulting concept, not a CRM one.

## Parallelism

**WS-A gates both.** Run WS-A inline (small, behavior-preserving), then dispatch **WS-B ∥ WS-C** as a
real two-lane fan-out — separate worktrees, disjoint file sets, one merge owner
([`seq-lane-build`](../../.claude/skills/seq-lane-build/SKILL.md), LR 0018 / FS-0034).

## Done means

- One kernel intake module; **three** questionnaires possible from it (RDD's 15, Metal Building
  Sales, and whatever comes next) with **no forked serializer**.
- `apps/web`'s existing route works unchanged off the kernel — the 10 extraction tests prove it.
- Mammoth can run a Metal Building Sales discovery call end-to-end in their own app.
- The four commercial lanes have a real consumer; GAP-1's `MB-LANE-001/002` are either landed or
  explicitly deferred with a reason.
- Decisions 1–4 above are answered and recorded (ADR where they are architectural).

## Bow-in (executed)

- Canonical occupied by SESSION_0624 → whole session in worktree `../ronin-0632` on the pre-minted
  `session-0632-intake-kernel` (ff'd to `origin/main` @ 417a7be9 — branch had no unique commits and
  predated the #259 hook doctor). `githooks/doctor.sh`: **all checks passed**.
- **Fork outcomes (operator, AskUserQuestion at bow-in):** ① persist — pre-pinned. ② RDD instance
  **stays in `apps/web`**; mirror-into-`apps/rdd` routed below (apps/rdd is the 0633/0635 lanes'
  territory). ③ brand-brief §7 `[REUSE]` row: yes it qualifies, but the file is outside this lane's
  owned paths → routed below for the merge owner. ④ MMB intake **omits** the `contains_real_data`
  toggle; its Markdown export hardcodes `contains_real_data: true`.
- SotD snapshot: requested and published (see Artifacts).
- Parallelism deviation: stub said dispatch WS-B ∥ WS-C as a two-lane fan-out; run inline instead —
  WS-B (pure content) was faster to author than a dispatch costs, and WS-C then had no sibling to
  parallel against; WS-C also *imports* WS-B's export, so they were never fully disjoint.

## Task log

| ID | Task | Status | Evidence |
| --- | --- | --- | --- |
| SESSION_0632_TASK_01 | WS-A — extract intake kernel to `packages/ui-kit/src/intake`, retarget `apps/web` | ✅ | 10 extraction tests pass UNCHANGED; ui-kit 36→41 pass; apps/web typegen+tsc clean |
| SESSION_0632_TASK_02 | WS-B — `METAL_BUILDING_SALES` questionnaire + content tests | ✅ | 4 commercial lanes, Installation Path (both canon values), spec/site/permits/delivery/budget/decision-maker; 5 tests |
| SESSION_0632_TASK_03 | WS-C — `/app/intake` on Mammoth CRM + `commitIntakeCapture` persist | ✅ | 47 client tests pass, tsc exit 0; Playwright: 0 console errors, 0px overflow (both viewports), unauth commit rejected, localStorage survives reload |
| SESSION_0632_TASK_04 | Shell fix — mobile nav overflow (pre-existing, all `/app` pages) | ✅ | 109px → 0px @390px after nav flex-wrap |

## Artifacts

- State-of-Dojo snapshot (bow-in): <https://claude.ai/code/artifact/e62b00f2-cf25-4741-a040-b98711c6556f>
- WS-C review gallery (verification table + mobile/desktop screenshots):
  <https://claude.ai/code/artifact/503ac434-8374-47cc-ad86-2c4762bba725>

## Findings to route (merge owner assigns ids — none minted in-lane)

- GOAL/WL: add **Client intake** as a `[REUSE]` row to `docs/product/rdd/brand-brief.md` §7
  (fork 3 — file outside this lane's owned paths; kernel module now exists at
  `@ronin-dojo/ui-kit/intake`).
- NEXT: mirror the RDD intake instance into `apps/rdd` once that app is real (fork 2 — deferred to
  the RDD lanes; `apps/web` route keeps working off the kernel meanwhile).
- SMOKE BOUNDARY: the **authenticated** intake commit write was not exercised live (needs
  fixture-login + scratch-DB UAT); planning is unit-tested and the transaction mirrors
  `commitLeadSheet`. Candidate for `manual-boundary-registry`.
- DEFERRED (GAP-1): `MB-LANE-001/002` routing of the commercial-lane taxonomy into MMB canon
  (`docs/product/mammoth-build/CONTEXT.md`) — outside owned paths this wave; the questionnaire is
  the taxonomy's first real consumer, the canon edit belongs to an MMB lane.
- NOTE: pre-existing mobile nav overflow (109px @390px) affected every `mammoth-build-crm` `/app`
  page, not just the new one — fixed in-lane via shell `flex-wrap` (within owned paths).
- FS: ran the FULL root `bun run test` unintentionally at the /ggr fix pass (cwd was the worktree
  root, not `clients/mammoth-build-crm`) with a live `RESEND_API_KEY` in the copied `.env` — the
  known live-Resend-send hazard (0551 seam guard still unmerged at last record). Suite green
  (1708/0), but possible real emails fired. Mitigation candidates: neuter `RESEND_API_KEY` in
  worktree bootstrap copies; land the seam guard.
- WL: add the intake kernel module to `docs/knowledge/wiki/custom-component-inventory.md`
  (Giddy cap-adjacent flag). Proposed row: *`@ronin-dojo/ui-kit/intake` — zero-React kernel
  feature-module: `Questionnaire` core + per-brand `questionnaires/*` + per-app adapter; consumers:
  apps/web `/app/client-intake`, mammoth-build-crm `/app/intake` (SESSION_0632).*
- D: semantic name collision inside ui-kit — `src/kanban/intake.ts` (board lead-intake) vs
  `src/intake/` (questionnaire intake). Pre-existing name; rename candidate `kanban/lead-intake.ts`
  next kanban lane (Giddy).
- FOLLOW-UP (Desi P2/P3 bundle, mammoth-build-crm): extract shared `components/crm/` form module
  (`fieldClass` ×3 copies + button classes + `Field`) and converge the three label idioms
  (intake/new/sales); sticky global progress; nav `aria-current` + "Import leads"/"Discovery call"
  label disambiguation; `aria-describedby` for question hints. Deferred from the close-time fix
  pass — converging legacy sibling pages unreviewed at close risks visual regressions outside this
  session's verified scope.

## Review log

### /ggr — Giddy Gate Review (Build lane, code-quality-matrix)

**Wave:** Doug (verify) · Desi (UI) · Giddy (structure) on e137db44 + fallow audit; batched fix
pass followed (dup kill via `PlannedLeadCreate` reuse · forged-payload guard · Desi P1/P2 ·
`CommitPanel` split), then delta re-verify (headless: 0 overflow, 0 console errors, gating +
captions + persistence proven; all suites re-green).

**Class:** B (custom extension; refs ADR 0051/0040-B/0033 D1 + the `lead-commit` precedent).

| Dim | Score | Evidence |
| --- | ---: | --- |
| D1 Correctness | 9.5 | 10 extraction tests unchanged; serializer byte-identity proven mechanically (Doug); 48+41 suites; root 1708 green; headless interaction proofs ×2 |
| D2 Security | 9.0 | owner-gate + server re-validation + fail-closed forged-payload guard; no enrich/overwrite (zero `update` calls); retention law holds; dedupe not DB-constraint-backed (pre-existing tracer posture, P3) |
| D3 Simplicity | 8.5 | clone group eliminated (0 remain); page 15→6 cyclo / 22→4 cognitive; CommitPanel 13/15 named debt |
| D4 Readability | 9.5 | idiom-consistent; JSDoc carries why; Desi-praised microcopy |
| D5 Maintainability | 9.0 | MI 85.7 (good); pure kernel + pure plan modules; CommitPanel size noted |
| D6 Scalability | 9.0 | ≤3 queries in tx; phone-scan matcher O(contacts) — shared pre-existing tradeoff, documented |
| D7 Convention/reuse | 8.5 | ONE matcher + ONE serializer preserved; sub-path export story right (Giddy PASS); inventory row out-of-path → routed (cap-adjacent, judged not tripped: pattern documented here) |

**Weighted:** 9.02 · **Caps:** none tripped (runtime verified headless; no regression — byte-identity
proven; inventory-row cap judged adjacent, row routed) · **Composite: 9.0 / 10 — CLEARS** (≥9.0),
ship with the named follow-ups logged (see Findings to route). Doug's independent verdict:
LAUNCH-SAFE 9.4. Residuals: authed-commit scratch-DB smoke (routed) + Desi P2/P3 bundle (routed).
*Deviation note: `/fallow-fix-loop` used as rubric+metrics only — fixes were applied inline as the
batched pass; fallow before/after deltas recorded above. `fallow health` baseline was NOT taken
before implementation (memory rule missed) — before/after complexity is reconstructed from the
audit's changed-since view instead.*

## Status

Single source of truth is the frontmatter `status:` field.
