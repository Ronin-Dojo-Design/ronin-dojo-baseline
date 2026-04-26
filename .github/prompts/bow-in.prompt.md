---
description: "Opening ritual — start a new session"
mode: "agent"
---

# Bow In — Opening Ritual

Execute these steps in order:

1. **Find the latest SESSION file.** List `docs/sprints/` and find the highest-numbered `SESSION_NNNN.md`. Read its `Goal`, `Open decisions / blockers`, and `Next session` section.

2. **Read the program plan.** Skim `docs/architecture/program-plan.md` — find the current sprint row and its deliverable.

3. **Create the next SESSION file.** In `docs/sprints/`, create `SESSION_{NEXT_NUMBER}.md` with:
   - `Date` (today)
   - `Operator: Brian + Claude`
   - `Goal` (from the previous session's `Next session` section, or from the user's stated intent)
   - `Status: in-progress`
   - `Task` section describing the work
   - `Inputs` section listing files to reference
   - Empty sections for: `What landed`, `Files touched`, `Decisions resolved`, `Open decisions / blockers`, `Next session`

4. **Decide the role.** If the task is clear and scoped → proceed as Cody (builder). If it needs decomposition or has open decisions → proceed as Petey (planner) first. See `docs/agents/petey.md` and `docs/agents/cody.md`.

5. **State the goal and first task** before starting any work.

Reference: `docs/rituals/opening.md`
