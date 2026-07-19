---
name: game-on
description: Start a lean Mammoth (MMB) work session. Use when the operator says /game-on, starts MMB/client-ops work, or wants the token-lean opening overlay that routes repo-touch work through the canonical bow-in ritual.
---

# Game on

1. Invoke the `bow-in` skill — `docs/rituals/opening.md` stays the canonical ritual for every
   session. Never summarize, copy, or replace it here.
2. Load **pointers, not bodies** (open only what the task needs):
   - Root `CONTEXT.md` + `DESIGN.md` (platform domain model / design law).
   - Mammoth canon: `docs/product/mammoth-build/` — `PRD.md`, `STORIES.md`,
     `UBIQUITOUS_LANGUAGE.md`, `OPERATING_SYSTEM.md`.
   - Default MMB task = "Pickup" of the highest-numbered `MMB_SESSION_NNNN.md` in the
     Mammoth vault.
3. Classify the work:
   - **repo-touch** — may change repo code, tracked docs, templates, durable decisions, or
     SESSION state.
   - **vault-only** — confined to private operational notes, no durable repo decision.
   - Uncertain + repo mutation plausible → repo-touch.
4. Apply the MMB Lean Profile (`docs/sprints/SESSION_0570.md`): one outcome, one primary
   slice, one named Next Action; one compact opening card + one task/evidence table; label
   info confirmed / proposed / missing; link goal/story/session/ADR IDs — never copy bodies.
5. Authority split: monorepo owns code/specs/reusable templates; Mammoth DB owns CRM
   records; private MMB vault owns live consulting ops + read-only projections.
6. HubSpot/Todoist = non-secret status pointers until separately authorized. No passwords,
   tokens, 2FA, `.env` values, PII, or CRM record bodies in Markdown, Git, logs, or shell.
7. As the session runs, note material skill/agent/tool calls by **type + accomplishment**
   (not transcript) — this feeds the `game-off` recipe card.

Mode controls the lean card and risk gates, never whether the canonical ritual runs.
