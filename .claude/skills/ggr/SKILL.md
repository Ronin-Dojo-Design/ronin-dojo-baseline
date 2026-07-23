---
name: ggr
description: Giddy Gate Review — the universal QAR closing gate. Score the lane's output against the lane-appropriate rubric (Build → code-quality-matrix /10; Plan → plan-quality; Intake → framing), then gate — ≥9.0 clears · 7.0–8.9 auto-loops ≤2 Giddy passes then the operator gate · hard caps always loop. Uses /fallow-fix-loop for the objective metrics and as the loop's fix executor. Use when the operator says "/ggr", "giddy gate", "gate review", "QAR", "is this good enough to ship/close", or at bow-out as the closing gate.
---

# ggr — Giddy Gate Review (universal QAR gate)

The QAR-lane gate (ADR 0052 D4/D5/D6): **every session ends here** with an operator accept/loop decision.
Giddy scores the lane's output, applies the gate policy, and either clears it to the push gate or loops it
back to Build. Giddy **reviews and gates — Giddy does not fix**; fixes route to Cody / `/fallow-fix-loop`.

## Phase 0 — Pick the rubric by lane (the gate flexes; the policy doesn't)

| Lane | Rubric | Source |
| --- | --- | --- |
| **Build** | code-quality-matrix `/10` (7 weighted dims + caps) | [`code-quality-matrix`](../../../docs/protocols/code-quality-matrix.md) via [`/code-quality`](../code-quality/SKILL.md) |
| **Plan** | plan-quality — decomposed? done-means on every task? disjointness proven? open forks grilled + surfaced? | [`petey-plan`](../../../docs/protocols/petey-plan.md) |
| **Intake** | framing — is the problem stated, scoped, and the right lane chosen? | operator ask |

A pure Plan lane has no code to score — that is *why* the rubric flexes; it is how "QAR every session"
coexists with a planning-only session. The gate **policy** (Phase 2) is identical across lanes.

## Phase 1 — Review + measure (Build lane)

1. **Run the review wave** — dispatch [`/seq-review-wave`](../seq-review-wave/SKILL.md): Doug always (gates
   re-run independently + failure-mode source review + live UAT on a hermetic scratch DB when a runtime
   surface changed), Desi on member-facing / shared-primitive UI, Giddy on moved structure (new files/dirs,
   protocol/ritual edits, ADR-worthy decisions). Reviewers verify on ONE commit; they do not fix.
2. **Gather the objective metrics** — run the audit half of [`/fallow-fix-loop`](../fallow-fix-loop/SKILL.md)
   (`fallow audit --changed-since HEAD` + `fallow health`) for the CRAP / duplication / dead-code /
   complexity / maintainability-index signal that grounds **D3** (simplicity) and **D5** (maintainability).
   No scoring from vibes — every dimension cites evidence.
3. **Score** — run [`/code-quality`](../code-quality/SKILL.md) to produce the matrix `/10` per unit (class
   A/B/C, D1–D7 with evidence, weighted average, caps, composite). For a session close also apply the
   [`hostile-close-review`](../../../docs/protocols/hostile-close-review.md) caps + the 100/1k/10k confidence
   triad — the caps are shared, so a unit scored here and a session scored there agree.

## Phase 2 — Apply the gate policy (ADR 0052 D6)

Composite in hand, decide:

- **≥ 9.0 → CLEARS.** Proceed to the push gate (which still waits for the operator's explicit word).
- **7.0–8.9 → auto-loop.** Run [`/fallow-fix-loop`](../fallow-fix-loop/SKILL.md) as the fix executor —
  implement the ranked fixes (security/correctness → DRY/dead-code → complexity → readability → perf),
  **headless re-verify that behavior is byte-identical** (no regression), and **re-run fallow to prove**
  complexity/duplication/dead-code actually dropped. Non-fallow findings (from the review wave) hand back to
  the ORIGINAL builder as a batched-fix resume. Then re-score. **Up to 2 Giddy passes**, then Phase 3.
- **A hard cap is present → ALWAYS loop**, regardless of composite: behavior regression (cap 6.9) · Class-A
  Dirstarter bypass (8.9) · undocumented new pattern/primitive (8.9). A cap can only lower the composite.
- **< 7.0 → rework** before it compounds (re-derive the approach if < 5.0).

## Phase 3 — Operator gate (when the 2 retries are spent or a cap persists)

Present the composite + the residual findings and offer: **accept** (ship as-is with the follow-ups logged,
not buried) · **try-again** (one more targeted loop) · **keep-improving** (keep looping past the 2-pass
bound). The operator can always accept — the policy *bounds* the loop, it does not remove the operator's call.

## Phase 4 — Record + fold into bow-out

- Write the verdict into the SESSION file `## Review log` (Giddy: reviewed tasks · composite · caps applied ·
  before→after fallow delta · follow-ups routed to a ledger row or a fix). Cite `code-quality-matrix §N`.
- `/ggr` is the **universal closing gate** — at bow-out it runs before the push gate. Unresolved findings
  become Proposed ledger edits, never silently dropped. *(The bow-out wiring in `closing.md` is G-031 slice
  S5; until then, invoke `/ggr` explicitly at close.)*

## What this is NOT

- Not a fixer — Giddy gates; fixes route to Cody / `/fallow-fix-loop` (batched-fix resume).
- Not a bypass of the push gate — clearing `/ggr` still holds for [explicit-push-authorization].
- Not a new bar — the ≥9.0 clear line is the matrix's own ship threshold (§5), adopted by ADR 0052 D6; `/ggr`
  reaches it, it doesn't invent it.
