---
name: game-on
description: Start a risk-proportionate Mammoth or client-ops work session. Use when the operator says /game-on, asks to begin an MMB operating session, or wants the lean opening overlay that conditionally routes repo-touch work through the canonical bow-in ritual.
---

# Game on

1. Invoke `$bow-in` and follow `docs/rituals/opening.md` as the canonical ritual for every session.
   Do not summarize, copy, or replace its procedure here.
2. Classify the work after the canonical ritual:
   - Use **repo-touch mode** when work may change repo code, tracked docs, reusable templates, durable
     decisions, or SESSION state.
   - Use **vault-only mode** only when work is confined to private operational notes and creates no
     durable repo decision.
3. Apply the MMB Lean Profile in
   `docs/sprints/SESSION_0570.md`:
   - establish one outcome, one primary slice, and one named Next Action;
   - create or refresh one compact opening card and one task/evidence table;
   - label information as confirmed, proposed, or missing;
   - link canonical repo goal, story, session, and ADR IDs instead of copying their bodies.
4. Keep authority separated: the RDD monorepo owns code/specs/reusable templates, Mammoth's database owns
   CRM records, and the private MMB vault owns live consulting operations and read-only projections.
5. Treat HubSpot/Todoist as optional status pointers until separately authorized. Never put passwords,
   tokens, 2FA values, `.env` values, PII, or CRM record bodies in Markdown, Git, logs, or shell history.
6. Apply the risk-triggered deep gates from the MMB Lean Profile only when their trigger is present.

The mode controls the lean work card and risk gates, never whether the canonical opening ritual runs. If the
mode is uncertain and repo mutation is plausible, use repo-touch mode.
