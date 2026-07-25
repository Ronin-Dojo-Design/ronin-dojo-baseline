---
title: "SESSION 0643 — auto-claude MMB engagement doc pack (G-028 content layer) (overnight auto lane, wave 2)"
slug: session-0643
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0643
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0643 — auto-claude MMB engagement doc pack (G-028 content layer) (overnight auto lane, wave 2)

> Staged by the SESSION_0635 overnight orchestrator (wave 2, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Dispatch payload = the lane prompt; its HARD
> RULES are binding. Branch: `auto/session-0643-mmb-engagement-pack`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude MMB engagement doc pack (G-028 content layer) — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0643_TASK_01 | done | Draft RDD -> Mammoth Build client-engagement doc pack (G-028 content layer): proposal/SOW, MSA core, NDA, Initial Client Meeting questionnaire. |

## What landed

Four new markdown drafts under `docs/product/mammoth-build/engagement/` — the content layer for
G-028 (the `apps/rdd` interactive-form build, frozen tonight). Honors fork F2's two-archetype split:
`nda-draft.md` + `msa-core-draft.md` are the contract-core archetype (re-scoped from the operator's
uploaded `.docx` templates in `docs/product/rdd/assets/`, De-Tableau'd to a software + design agency);
`initial-meeting-questionnaire.md` is the separate discovery-questionnaire archetype, instanced for
Mammoth and mapped 1:1 against the 15-question intake kernel in
`apps/web/components/app/client-intake/questions.ts` (every question either cites a kernel `id` inline
or is explicitly flagged Mammoth-specific with no kernel counterpart). `proposal-sow-draft.md` carries
the Mammoth-grounded scope (site refresh + CRM/automation cited to PRD/STORIES epics; SEO, social/
marketing, AI consulting left as ungrounded placeholders per the lane brief), a Pricing Exhibit section
that names `pricing-options-onepager.md` by filename with zero numbers, and a Change Control section
stating operator doctrine (fixed-price scope changes only via written change order, any change however
small is a change order). All four files carry a DRAFT / not-legal-advice banner where applicable, the
required frontmatter, and no PII beyond what already exists in `docs/product/mammoth-build/**`
(Michael Flores / GM / Mammoth Metal Buildings — all pre-existing in `PRD.md`).

`.docx` templates were converted to text via macOS `textutil` (scratch dir, not committed) to read
their structure — the assets themselves were not modified.

## Files touched

| File | Change |
| --- | --- |
| `docs/product/mammoth-build/engagement/proposal-sow-draft.md` | New — RDD proposal/SOW skeleton for Mammoth. |
| `docs/product/mammoth-build/engagement/msa-core-draft.md` | New — MSA core terms draft. |
| `docs/product/mammoth-build/engagement/nda-draft.md` | New — mutual NDA draft. |
| `docs/product/mammoth-build/engagement/initial-meeting-questionnaire.md` | New — Initial Client Meeting questionnaire instanced for Mammoth, mapped to the intake kernel. |
| `docs/sprints/SESSION_0643.md` | Adopted (staged -> in-progress -> closed) and filled per this lane's dispatch template. |

## Verification

Docs-only lane — no code/schema/dep changes; root `bun run typecheck` / `bun run lint` are workspace
filters over `apps/**`/`clients/**`/`packages/**` and are not applicable to a `docs/product/**`-only
diff. `docs/knowledge/wiki/**` `wiki-lint` does not scan `docs/product/**` (`scripts/wiki-lint.ts`
`WIKI_ROOT = docs/knowledge/wiki`, confirmed by reading the script), so it does not gate these files
either. Self-review checklist instead (per the lane's GATES line):

| Check | Result |
| --- | --- |
| Frontmatter x4 (created/author/session/status) | PASS — all four files carry `created: 2026-07-24`, `author: RDD`, `session: 0643`, `status: draft`. |
| Zero PII beyond existing docs | PASS — only "Michael Flores" / "GM" / "Mammoth Metal Buildings", all pre-existing in `PRD.md`. No new names/emails/phones/addresses. |
| Zero committed numbers (prices/dates presented as agreed) | PASS — `grep -n '\$[0-9]'` across the four files returned no matches (exit 1); all dates/fees are `[TBD]` / bracketed placeholders; MSA/NDA day-periods (30/10/12-month) are inherited legal-boilerplate defaults from the source `.docx`, not deal-specific commitments, and are marked "placeholder pending attorney review." |
| F2 split honored | PASS — contract-core (NDA + MSA/SOW) vs. separate Initial-Meeting questionnaire archetype, as pinned in the G-028 ledger row. |
| Every questionnaire item mapped-or-flagged | PASS — `grep -n "intake-kernel id:"` confirms all 15 kernel ids (`goals, challenges, systems, metrics, effortless, stakeholders, involvement, communication, reporting, partners, timeline_budget, prior_experience, design_direction, privacy_security, scale`) present exactly once each; every remaining item carries an explicit `<!-- no intake-kernel id: Mammoth-specific (...) -->` flag. |
| Only authorized paths touched | PASS — `git status --short` shows only `docs/product/mammoth-build/engagement/` (new dir) and `docs/sprints/SESSION_0643.md`. |

## Proposed ledger edits

**G-028 progress note** (for the merge owner to apply to `docs/knowledge/wiki/goals-ledger.md`, not
applied here per the lane's ledger-append rule):

> G-028's content layer is drafted: `docs/product/mammoth-build/engagement/{proposal-sow-draft.md,
> msa-core-draft.md, nda-draft.md, initial-meeting-questionnaire.md}` (SESSION_0643). Contract-core
> (NDA + MSA/SOW) and the Initial-Meeting questionnaire (F2 split) are both drafted and Mammoth-
> instanced where grounded; SEO/social/AI-consulting scope in the SOW is an ungrounded placeholder
> pending discovery. Pricing lives in a sibling file, `pricing-options-onepager.md` (parallel
> SESSION_0643-wave lane), referenced by filename only — not read or authored here. Next: attorney/
> operator review of the legal drafts, then lift into the `apps/rdd` interactive-form build (blocked
> on G-027 B1 per the existing ledger note).

## Open decisions / blockers

None encountered — all forks needed for this task were already pinned (F2) or out of scope
(pricing, S1-adoption design, apps/rdd build itself).

## Residual for AM merge

- `docs/product/mammoth-build/engagement/pricing-options-onepager.md` is being drafted by a parallel
  lane in the same session wave — not read or touched here; the SOW's Pricing Exhibit section already
  points to it by filename.
- Legal drafts (`msa-core-draft.md`, `nda-draft.md`) still need operator/attorney review before any
  client use — flagged inline in both files.
- Apply the "Proposed ledger edits" G-028 note above to `docs/knowledge/wiki/goals-ledger.md` at merge
  time (not applied in this lane per the append-only/one-merge-owner rule).

