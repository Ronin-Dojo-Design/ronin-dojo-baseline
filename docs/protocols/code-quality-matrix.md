---
title: Code Quality Matrix
slug: code-quality-matrix
type: protocol
status: active
created: 2026-06-26
updated: 2026-06-26
last_agent: claude-session-0451
pairs_with:
  - docs/protocols/code-guardrails.md
  - docs/protocols/pr-review-score-fix-loop.md
  - docs/protocols/hostile-close-review.md
  - docs/protocols/hostile-repo-review.md
  - docs/protocols/jetty-annotation-standard.md
  - .claude/skills/code-quality/SKILL.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - review
  - quality-gate
  - code-standard
  - dirstarter
---

# Code Quality Matrix

The repo's **code-gold-standard**: a reusable `/10` rubric that scores a unit of code (a file, a module,
a feature area, or a diff) on whether it is *not just functional but well-written, maintainable, scalable,
secure, and simple* — the bar a senior engineer at Apple or Facebook would defend in production review.

It fills a real gap. The repo already scores **sessions** (`hostile-close-review`), **PRs as a
merge decision** (`pr-review-score-fix-loop`), the **whole repo** (`hostile-repo-review`), and the
**raw metrics of a diff** (`fallow-fix-loop`). None of them answers the operator's question — *"is this
individual custom code we wrote, the stuff Dirstarter doesn't ship, gold-standard?"* This matrix does, and
it gives a method for judging **custom** code that has no Dirstarter equivalent (§3).

> This is the **rubric**. The runnable loop that gathers the evidence, scores it, and fixes the gaps is the
> [`/code-quality` skill](../../.claude/skills/code-quality/SKILL.md). This doc is what the skill scores
> against; read it before running the skill, and cite it (`code-quality-matrix §N`) in any score you record.

## 1. The gold standard (the bar)

A code unit is **gold-standard (9.5–10)** when *all* of the following hold:

- **Obvious to the next developer.** A competent engineer who has never seen it understands what it does and
  why in one read — names say what they mean, structure matches the surrounding idiom, the non-obvious parts
  (and only those) carry a comment or a JETTY `@why`.
- **Does exactly what it claims, proven.** Behavior is demonstrated by a run/test/render, not asserted from
  source. No regression: a refactor leaves observable behavior byte-identical.
- **Simple.** The straightest logic that solves the *actual* problem — KISS/DRY/YAGNI. No speculative
  generality, no duplicated predicate, no nested-ternary cleverness (`code-guardrails` G1).
- **Secure & integrity-enforced.** Every exposed path proves its authorization; input is validated at the
  boundary; the *database* enforces the business rule, not just a comment.
- **Scales.** Confident at 100 / 1,000 / 10,000 units of load — no per-request work on a hot/startup path, no
  N+1, indexed where it queries.
- **Reuses before it builds.** Extends the Dirstarter baseline and the repo's own L1 primitives; any genuinely
  new component is justified, minimal, and recorded so the *next* agent finds it instead of rebuilding it.

Anything less is *functional but not gold* — useful, shippable maybe, but carrying debt. The matrix names the
debt and routes it to the [`/code-quality` skill](../../.claude/skills/code-quality/SKILL.md) or a follow-up.

## 2. The seven dimensions

Each dimension scores **0–10**. The composite is the **weighted average** (Σ score×weight ÷ Σ weight), then
the **caps in §4 are applied** — a cap can only *lower* the composite.

| # | Dimension | Weight | What it measures | Objective signal |
| --- | --- | ---: | --- | --- |
| D1 | **Correctness & behavior integrity** | 2.0 | Does it do what it claims? Edge cases, error handling, no regression. | a run/test/render (not "it compiles"); `bun test` touched-area |
| D2 | **Security & data integrity** | 2.0 | Authz on every exposed path; boundary validation; DB-enforced invariants; no secret leakage. | `/security-review`; schema constraints; authz trace |
| D3 | **Simplicity (KISS/DRY/YAGNI)** | 1.5 | Straightest logic; no duplication, no dead code, no speculative generality. | `fallow audit` CRAP + duplication clone-groups; guardrail G1 |
| D4 | **Readability & clarity** | 1.5 | Obvious to the next developer; naming; matches local idiom; JETTY `@why`/`@wired` where required. | JETTY annotation present; idiom match by eye |
| D5 | **Maintainability** | 1.5 | Cohesion, testability, small reviewable units, no dead code. | `fallow health` maintainability index; dead-code count |
| D6 | **Scalability & efficiency** | 1.0 | Confidence at 100/1k/10k; no hot/startup-path work; query efficiency; indexes. | EXPLAIN/N+1 check; the 100/1k/10k confidence triad |
| D7 | **Convention & reuse fit** | 1.5 | Extends Dirstarter (not bypasses); reuses L1 primitives; custom code justified + inventoried. | §3 judging protocol; `dirstarter-component-inventory`, `custom-component-inventory` |

**Weights sum to 11.0.** Correctness and security carry the most weight because a clever, beautiful module that
is wrong or leaky is worth less than a plain one that is right and safe.

### Per-dimension anchors (so two reviewers land within ±0.5)

- **10** — exemplary; you would point a new hire at it as the reference.
- **9** — gold-standard with one trivial nit.
- **7–8** — correct and clean but carries named debt (a dupe, a missing test, an oversized function).
- **5–6** — works but a careful reviewer flags real problems (complexity, weak validation, unclear naming).
- **3–4** — fragile or confusing; would not pass a serious review.
- **0–2** — broken, unsafe, or unreadable.

## 3. Judging custom code (Dirstarter baseline vs. our extensions)

The operator's core ask: *"Dirstarter is the baseline we judge against, but we have modifications and
extensions Dirstarter doesn't have — we need a way to judge the custom code."* Classify the unit first, then
score D7 (and D1/D2) against the right reference.

**Classify the code unit into one of three classes:**

- **Class A — Extends a Dirstarter baseline layer.** It touches one of the 10 L1 areas (storage, payments,
  media, content, monetization, blog, auth, theming, Prisma, hosting). **Reference = the live Dirstarter docs
  + the baseline pattern** (`dirstarter-docs-inventory` Alignment URLs). The standard is *extend, never
  bypass*: re-implementing what the baseline already does, or replacing it instead of layering on it, is a
  D7 failure (cap 8.9, §4) and an `FS-0001` guardrail violation.
- **Class B — Custom extension with no Dirstarter equivalent.** The BBL surface area: lineage graph/trees,
  the Passport identity model, the claim systems, the directory/org/profile funnels. **Reference = the repo's
  own documented patterns** — the relevant ADR, the domain hub, the L1 primitives (`ListingCard`,
  `ComboboxSelector`, the form stack), and `custom-component-inventory`. The bar is: *is this the obvious,
  minimal, reusable shape, and is it documented so the next agent finds it instead of rebuilding it?* An
  undocumented new pattern that a future agent will re-grep-the-world to discover caps D7 at 8.9.
- **Class C — A genuinely new primitive.** No Dirstarter and no repo precedent. **Reference = §1 gold-standard
  in the abstract.** Extra requirement: it **must** be added to `custom-component-inventory` in the same change,
  or D7 cannot exceed 8.9 — an unrecorded primitive is invisible debt.

> Custom code is **not** held to a lower bar than baseline code. It is held to the *same* gold standard, judged
> against the right reference. "Dirstarter doesn't have this" is never an excuse for a low D4/D5 score — it is
> the reason D7's "is it documented + reusable" sub-test exists.

## 4. Caps (a high score cannot hide a real failure)

Caps are inherited from `hostile-close-review` and `hostile-repo-review` so the matrix stays consistent with
the session-close gate. If a capped failure is present, the **final composite is the minimum of the weighted
average and the cap.**

| Failure | Cap |
| --- | --- |
| **Behavior regression introduced** (a refactor changed observable behavior) | **6.9 — not shippable** |
| Security proof missing on an exposed / unauthenticated data path | 8.9 |
| Data-integrity rule only documented, not DB-enforced | 8.9 |
| Dirstarter baseline bypassed/replaced where it should be extended (Class A) | 8.9 |
| New custom pattern/primitive not documented/inventoried (Class B/C) | 8.9 |
| No credible verification — behavior never run/tested, only "it compiles" | 9.4 |

The regression cap is deliberately the harshest: the operator's standing requirement is *no regression in
functionality or behavior — just refactoring or refinement.* A cleanup that changes behavior is a defect, not
a refactor, and the matrix refuses to score it as shippable.

## 5. Score → action

| Composite | Verdict | Action |
| --- | --- | --- |
| **9.5–10.0** | **Gold — Apple/Facebook-grade** | Ship. This is the reference. |
| 9.0–9.4 | Strong | Ship with the named follow-ups logged (don't bury them). |
| 7.0–8.9 | Functional, not gold | Run the `/code-quality` (or `fallow-fix-loop`) pass before it compounds. |
| 5.0–6.9 | Weak | Rework before merge. |
| < 5.0 | Not shippable | Stop; re-derive the approach. |

`9.5` is the same merge precondition `pr-review-score-fix-loop` and `merge-to-main` already use — the matrix
does not invent a new bar, it gives a finer-grained way to reach it.

## 6. Output shape (what the skill records)

```markdown
### Code-quality score — <target> (code-quality-matrix)

**Class:** A (extends Dirstarter <layer>) | B (custom, ref <ADR/hub>) | C (new primitive)

| Dim | Score | Note |
| --- | ---: | --- |
| D1 Correctness | 9 | behavior re-verified headless; no regression |
| D2 Security | 8 | authz proven; one input lacks a max-length bound |
| D3 Simplicity | 7 | CRAP 18 on `finalizeClaim`; one duplicated predicate |
| D4 Readability | 9 | clear; JETTY header present |
| D5 Maintainability | 8 | MI 71; one 60-line function to split |
| D6 Scalability | 9 | indexed; no N+1; confident to 10k |
| D7 Convention/reuse | 9 | reuses ListingCard; inventoried |

**Weighted average:** 8.4 · **Cap applied:** none · **Composite: 8.4 / 10**
**Apple/Facebook verdict:** functional, not yet gold — two named fixes close it.
**Top fixes:** (1) bound the input length (D2); (2) extract the duplicated predicate (D3); (3) split
`finalizeClaim` (D5).
```

Record the score in the SESSION file `## Review log` (the cross-session ledger was retired at SESSION_0228 —
SESSION files are canonical). Cite `code-quality-matrix §N` so the basis is auditable.

## 7. How this composes with the existing loops (no duplication)

- **`code-guardrails`** is the binary *floor* (G1–G9: no nested ternaries, no `any`, Biome clean, no raw HTML
  when a Dirstarter component exists…). A guardrail violation is a concrete D3/D4/D7 deduction — the matrix
  does not restate the rules, it scores adherence to them.
- **`fallow-fix-loop`** supplies the *objective metrics* for D3/D5 (CRAP, complexity, duplication, dead code,
  maintainability index) and is the *fix executor*. The matrix adds the scored rubric + the custom-vs-baseline
  judging that fallow alone doesn't give. The `/code-quality` skill calls the fallow loop, then scores.
- **`pr-review-score-fix-loop`** is the *merge decision* (binary accelerator + ≥9.5 gate). The matrix is the
  finer instrument it can use at Step 2 ("Score") instead of an ad-hoc /10.
- **`hostile-close-review`** is the *session-close* gate; this matrix's caps and the 100/1k/10k confidence
  triad are taken from it, so a unit scored here and a session scored there agree.
- **`jetty-annotation-standard`** is the traceability requirement D4/D7 check for.

## Cross-references

- [`/code-quality` skill](../../.claude/skills/code-quality/SKILL.md) — the runnable loop that applies this matrix.
- [Code Guardrails](code-guardrails.md) — the binary rule floor.
- [fallow-fix-loop](../../.claude/skills/fallow-fix-loop/SKILL.md) — objective metrics + fix execution.
- [PR Review → Score → Fix Loop](pr-review-score-fix-loop.md) — the merge-decision sibling.
- [Hostile Close Review](hostile-close-review.md) — the session-close sibling (caps + confidence triad).
- [Hostile Repo Review](hostile-repo-review.md) — the repo-wide sibling.
- [JETTY Annotation Standard](jetty-annotation-standard.md) — traceability annotations.
- [Dirstarter Component Inventory](../knowledge/wiki/dirstarter-component-inventory.md) · [Custom Component Inventory](../knowledge/wiki/custom-component-inventory.md) — the reuse references for D7.
