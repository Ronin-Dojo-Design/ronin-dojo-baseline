---
name: game-off
description: Close a lean Mammoth (MMB) work session. Use when the operator says /game-off, finishes MMB/client-ops work, or wants the token-lean closing overlay that routes repo-touch work through the canonical bow-out ritual.
---

# Game off

1. Invoke the `bow-out` skill — `docs/rituals/closing.md` stays the canonical ritual for every
   session. Never summarize, copy, or replace it here.
2. Classify `session_kind` for the MMB session file's YAML frontmatter:
   `planning | implementation | code-review | pickup | mixed` — and index the session in the
   matching log (Planning / Implementation / Code Review / Session Pickup).
3. Write the **recipe card**: ordered material skill/agent/tool calls by **type +
   accomplishment**, not transcript. Flag repeatable-template opportunities for the vault
   `90_TEMPLATES` folder.
4. If the session stayed vault-only, add one compact closing card:
   - outcome + accepted deliverables;
   - exact evidence links;
   - unfinished work + one named Next Action;
   - integration/credential status as non-secret pointers only.
5. Lean Profile telemetry (`docs/sprints/SESSION_0570.md`): report actual elapsed time when
   known; token/cost only when exposed, else `unavailable`; keep client satisfaction,
   engineering verification, and sales outcomes separate; never infer or self-award a client
   rating.
6. Confirm vault projections did not become CRM, goal-ledger, or product-spec authorities.
7. No push, deploy, merge, external share, integration connect, or live-vault mutation
   without the separate authorization that action requires.

Mode controls whether the vault closing card is added, never whether the canonical ritual runs.
