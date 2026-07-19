---
name: game-off
description: Close a risk-proportionate Mammoth or client-ops work session. Use when the operator says /game-off, asks to finish an MMB operating session, or wants the lean closing overlay that conditionally routes repo-touch work through the canonical bow-out ritual.
---

# Game off

1. Invoke `$bow-out` and follow `docs/rituals/closing.md` as the canonical ritual for every session. Do not
   summarize, copy, or replace its procedure here.
2. Determine whether the work changed repo files, SESSION state, or a durable repo decision.
3. If it remained vault-only, also write one compact closing card containing:
   - outcome and accepted deliverables;
   - exact evidence links;
   - unfinished work and one named Next Action;
   - integration/credential status as non-secret pointers only.
4. Apply the MMB Lean Profile in `docs/sprints/SESSION_0570.md`: report actual elapsed time when known;
   record token/cost telemetry only when exposed, otherwise `unavailable`; keep client satisfaction,
   engineering verification, and sales outcomes separate; never infer or self-award a client rating.
5. Confirm that vault projections did not become CRM, goal-ledger, or product-spec authorities.
6. Secret-scan before any vault git commit, and always before any vault remote push — from the vault root:
   `grep -rnE "(sk-[A-Za-z0-9]{20}|api[_-]?key\s*[:=]\s*\S{16,}|Bearer [A-Za-z0-9._-]{20,}|BEGIN (RSA|OPENSSH) PRIVATE KEY|password\s*[:=])" --include="*.md" --include="*.json" --include="*.html" .`
   Any hit blocks the commit/push until the value is removed and rotated.
7. Do not push, deploy, merge, share externally, connect an integration, or mutate a live private vault
   without the separate authorization required for that action.

The mode controls whether a vault closing card is added, never whether the canonical closing ritual runs.
