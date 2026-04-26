---
description: "Closing ritual — end the current session (default: quick close)"
mode: "agent"
---

# Bow Out — Closing Ritual

Execute these steps in order:

1. **Stop new work.** Let any in-flight tool calls finish.

2. **Find the current SESSION file.** It's the highest-numbered `SESSION_NNNN.md` in `docs/sprints/` with `Status: in-progress`.

3. **Update the SESSION file** with:
   - `What landed` — bullets of completed work
   - `Files touched` — paths + one-line note each
   - `Decisions resolved` — anything the user signed off on
   - `Open decisions / blockers` — anything unresolved
   - `Next session: Goal + Inputs to read + First task`

4. **Set the status.** Default to `Status: closed-quick`. If the user said "full close", or it's end of day / end of sprint / before context loss, use `Status: closed-full` and add a `## Reflections` section with:
   - Surprises encountered
   - Patterns or anti-patterns observed
   - Anything worth remembering for future sessions

5. **Confirm.** State: "Bowed out — SESSION_NNNN closed. Next session goal: {one line}."

Reference: `docs/rituals/closing.md`
