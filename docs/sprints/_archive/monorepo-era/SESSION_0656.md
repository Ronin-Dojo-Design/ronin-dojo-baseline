---
title: "SESSION 0656 — codex-sol MMB review-request + follow-up template pack + GBP draft (overnight auto lane, wave 5/6)"
slug: session-0656
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: codex-session-0656
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0656 — codex-sol MMB review-request + follow-up template pack + GBP draft (overnight auto lane, wave 5/6)

> Staged by the SESSION_0635 orchestrator (waves 5+6 — operator-directed continuations of waves 3+4).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0656-mmb-templates`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

Draft the MMB operational template pack: review requests, inquiry follow-ups, Google Business
Profile listing copy, and reusable social/GBP posting skeletons.

## Bow-in

- Elected lane: the operator-pinned docs-only MMB operational template pack.
- Queue: the four specified draft files; no broader ledger or board work is in scope.
- Pivot: no — the overnight brief fixes the lane and file boundaries.
- Parallel-lane assessment: not applicable; this is one coherent template-pack deliverable.
- State of Dojo: live at `/app/state`; no frozen snapshot requested.

## Petey plan

| ID | Owner | Status | Done means |
| --- | --- | --- | --- |
| SESSION_0656_TASK_01 | codex-session-0656 | complete | Four canon-grounded draft templates pass the operator's hygiene checklist and are committed without a push. |

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0656_TASK_01 | complete | Drafted and verified the four-file MMB operational template pack. |

## What landed

- A consent- and stop-rule-aware SMS/email review sequence triggered by Satisfied Installation,
  including one follow-up and a private service-recovery branch.
- An email autoresponder plus day 0/2/7 inquiry follow-up sequence using only the real InquiryForm
  fields: `name`, `email`, `buildingType`, and `message`.
- A placeholder-safe Google Business Profile listing draft with canon copy, category/service
  candidates, attributes, a job-site photo plan, and proposed owner Q&A.
- Seven reusable Facebook, Instagram, and GBP post skeletons with platform-specific variants.

## Files touched

| File | Change |
| --- | --- |
| `docs/product/mammoth-build/templates/review-request-sequences.md` | Added draft review-request and private service-recovery sequences. |
| `docs/product/mammoth-build/templates/inquiry-follow-up-sequences.md` | Added exact-field inquiry autoresponder and day 0/2/7 follow-ups. |
| `docs/product/mammoth-build/templates/gbp-listing-draft.md` | Added placeholder-safe GBP listing, photo plan, and Q&A draft. |
| `docs/product/mammoth-build/templates/posting-templates.md` | Added seven reusable FB/IG/GBP post skeletons. |
| `docs/sprints/SESSION_0656.md` | Adopted and closed the staged autonomous-lane record. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` | PASS (exit 0): `/Users/brianscott/dev/ronin-0656`; `auto/session-0656-mmb-templates`. |
| Four-file frontmatter/watermark, price/PII, and InquiryForm-token shell check | PASS (exit 0): four draft metadata sets and watermarks present; no numeric prices, email addresses, phone numbers, or unexpected `{{...}}` fields. |
| Explicit template file-count and branch/status shell check | PASS (exit 0): exactly four files under `templates/`; expected branch. |
| Initial `git diff --cached --check` | FAIL (exit 2): Markdown hard-break spaces found; replaced with explicit `<br>` breaks. |
| Remediated `git diff --cached --check` | PASS (exit 0): no whitespace errors. |
| Initial comprehensive staged-audit harness | FAIL (exit 127): zsh special variable `path` shadowed the executable search path; no content failure. |
| Corrected comprehensive staged hygiene audit | PASS (exit 0): exact file count, line-9 watermarks, metadata, price/PII/name scan, InquiryForm token allowlist, staged-path boundary, and whitespace check all passed. |

## Self-review checklist

- [x] Frontmatter ×4: `created: 2026-07-24`, `session: 0656`, `status: draft`.
- [x] DRAFT watermarks ×4.
- [x] Zero invented client facts: unknown GBP/listing and operational values remain explicit placeholders.
- [x] Zero client PII added.
- [x] Inquiry sequence fields match the real InquiryForm exactly: `name`, `email`, `buildingType`, `message`.

## Artifacts

None.

## Review log

- `SESSION_0656_TASK_01` — PASS: operator-specified docs hygiene checklist satisfied; no runtime
  surface, schema, app code, or Class-A custom code touched.

## ADR / ubiquitous-language check

No architectural decision or domain term was introduced; no ADR or glossary update is needed.

## Proposed ledger edits

- `G-019` — add a pointer noting that the MMB operational template pack was drafted in
  `SESSION_0656` under `docs/product/mammoth-build/templates/`.

## Open decisions / blockers

None for this draft lane. Placeholder resolution, compliance approval, and outbound publication
remain explicit pre-activation gates rather than commitments made by this session.

## Residual for AM merge

Review the commit on `auto/session-0656-mmb-templates`; this lane performed no push, PR, network
operation, or client communication.

## Next session

- Goal: AM merge review of the committed MMB operational template pack.
- Inputs to read: this session record and the four files under
  `docs/product/mammoth-build/templates/`.
- First task: inspect the commit diff and decide whether to merge, revise, or leave the drafts parked.
- No next SESSION stub was staged because this autonomous lane's write boundary permits only
  `SESSION_0656.md` and the new template directory.

## Reflections

- Keeping every unknown GBP fact visibly placeholdered prevented research observations from being
  promoted into client canon.
- The InquiryForm's lack of a phone field makes the inquiry sequence email-first; SMS would require
  a separately approved intake and consent change.
