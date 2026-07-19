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
   known. **Token/cost is mechanized (SESSION_0574):** run
   `bun scripts/session-cost.ts --latest` — it reads the statusline telemetry payload
   (`~/.claude/telemetry/<session_id>.json`, written by `~/.claude/statusline-telemetry.ts`)
   plus the session transcript, and prints token split + est. cost + the harness's own
   `total_cost_usd`. Record those numbers. Fall back to prompting the operator for `/cost`
   only when the script reports no payload AND no transcript. Keep client satisfaction,
   engineering verification, and sales outcomes separate; never infer or self-award a client
   rating.
6. Confirm vault projections did not become CRM, goal-ledger, or product-spec authorities.
7. **Secret-scan before any vault git commit, and always before any vault remote push** —
   from the vault root:
   `grep -rnE "(sk-[A-Za-z0-9]{20}|api[_-]?key\s*[:=]\s*\S{16,}|Bearer [A-Za-z0-9._-]{20,}|BEGIN (RSA|OPENSSH) PRIVATE KEY|password\s*[:=])" --include="*.md" --include="*.json" --include="*.html" .`
   Any hit blocks the commit/push until the value is removed and rotated.
8. No push, deploy, merge, external share, integration connect, or live-vault mutation
   without the separate authorization that action requires.

Mode controls whether the vault closing card is added, never whether the canonical ritual runs.
