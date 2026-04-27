---
title: Chat Handoff Protocol
slug: chat-handoff
type: protocol
status: active
created: 2026-04-25
updated: 2026-04-26
last_agent: copilot-session-0006
health: 7
pairs_with:
  - docs/rituals/closing.md
  - docs/rituals/opening.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Chat handoff protocol

How sessions hand off context to each other so we don't lose momentum between bow-out and the next bow-in.

> Slimmed-down successor to the legacy `CHAT_HANDOFF.md`. Where the legacy version maintained two parallel state files (`CHAT_HANDOFF.md` + `PETEY_NEXT_SESSION_PROMPT_*.md`), this protocol consolidates them into one: the latest `docs/sprints/SESSION_NNNN.md`.

## The single state file

Every session has exactly one file: `docs/sprints/SESSION_NNNN.md` (4-digit zero-padded, monotonically increasing).

That file is **the** state. There is no `CHAT_HANDOFF.md`, no `NEXT_SESSION_PROMPT.md`, no parallel YAML manifest. If the next session needs to know something about the previous one, it reads the SESSION file.

## SESSION file structure

A SESSION file has these sections, in this order:

```markdown
# SESSION_NNNN

**Date:** YYYY-MM-DD
**Operator:** {who is running the session — human + LLM, or just human}
**Goal:** {one sentence, set at bow-in}
**Status:** {one of: in-progress, closed-quick, closed-full}

## What landed

- {bullet of what was completed in this session}
- ...

## Files touched

- `path/to/file` — {one-line note}
- ...

## Decisions resolved

- {decision and outcome, with reference to ADR or program-plan section if applicable}
- ...

## Open decisions / blockers

- {anything that needs the user to weigh in before the next session can proceed}
- ...

## Next session

- **Goal:** {one sentence}
- **Inputs to read:** {3–5 file paths max}
- **First task:** {what Cody/the operator should do first}

## Reflections (optional, full-close only)

- {anything worth remembering — surprises, kaizen-style observations, things that almost broke}
```

## When to write the SESSION file

- **Bow-in (opening ritual):** create the file at the start of the session, fill in `Date`, `Operator`, `Goal`, `Status: in-progress`. Optionally pre-populate `Inputs to read` from your plan.
- **During the session:** update `Files touched` and `What landed` as you go (or at the end — whatever feels light).
- **Bow-out (closing ritual):** finalize `What landed`, `Decisions resolved`, `Open decisions`, `Next session`. Set `Status` to `closed-quick` or `closed-full`. If full-close, fill in `Reflections`.

## Quick close vs. full close

Two modes (preserved from legacy v4.5):

- **Quick close** — back-to-back execution sessions where the next one will pick up immediately. Write the minimal SESSION file (skip Reflections), commit if needed, move on.
- **Full close** — end of day, end of a sprint, or after a milestone. Add Reflections, double-check `Next session` is unblocked, optionally update memory entries with anything worth carrying forward.

## What is *not* in the SESSION file

- Long narrative recaps. The diff is the recap.
- Code snippets. Reference file paths and line numbers, not pasted blobs.
- Personal/cultural/philosophical notes. Those go to operator-side memory.
- Repeated content from program-plan.md, plan-vs-current.md, ADRs. Reference them; don't copy.

## Numbering

Start at `SESSION_0001.md`. Each new session increments by 1. Don't reuse numbers, don't skip numbers. If a session was started but never closed, append `_unclosed` to its filename and start the next session with the next number — the open one becomes a known-incomplete artifact.

## What if the previous SESSION wasn't closed?

If you're starting a session and the latest SESSION file has `Status: in-progress`:

1. Decide whether to resume that session (continue writing into the same file) or start fresh.
2. If starting fresh: rename the previous one to `SESSION_NNNN_unclosed.md`, then create the new one with the next number.
3. Note in the new session's `What landed` that the previous one was abandoned and why.

## Reading the SESSION file at bow-in

The opening ritual instructs you to read the latest SESSION file. The minimum read is:

- `Goal` of the previous session (was it achieved?)
- `Open decisions / blockers` (do any of these block today?)
- `Next session: Goal + First task` (likely your starting point)

Anything else you read on demand.
