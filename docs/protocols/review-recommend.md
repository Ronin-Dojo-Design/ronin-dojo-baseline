---
title: Review & Recommend Protocol
slug: review-recommend
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0012
pairs_with:
  - docs/protocols/petey-plan.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/rituals/closing.md
tags:
  - review
  - planning
  - workflow
---

# Review & Recommend Protocol

Run at bow-out (or on demand) to review what the session accomplished and recommend the next session's goal. This is the bridge between closing the current session and staging the next one.

## When to invoke

- **Always at full close** — step 6.5 (between Reflections and Memory sweep).
- **Optionally at quick close** — when the operator has enough context to stage the next session without full reflections.
- **On demand** — user says "review and recommend" or "what's next."

## Steps

### 1. Review what landed

Read the current SESSION file's `What landed` section. For each item:

- Did it fully close its task? If partial, note what remains.
- Did it shift any boundary in the [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md)? Update if so.

### 2. Check the boundary registry

Read `docs/knowledge/wiki/manual-boundary-registry.md`. Identify:

- **Newly verified** boundaries (from this session)
- **Next open boundary** by priority — the one that unblocks the most downstream work
- **Stale boundaries** — any that should be re-evaluated

### 3. Check the program plan

Read `docs/architecture/program-plan.md`. Identify:

- Current sprint row — is it done? Partially done?
- Next sprint row — what's the deliverable?
- Any slip risk?

### 4. Produce the recommendation

Write into the SESSION file's `Next session` section:

```markdown
## Next session

- **Goal:** <one line — what the next session accomplishes>
- **Inputs to read:** <3-5 file paths the next session's bow-in should load>
- **First task:** <the literal first thing to do — no ambiguity>
- **Candidates:** (if there are multiple valid next-targets)
  1. <option A> — <why>
  2. <option B> — <why>
```

### 5. Pre-stage the next SESSION file (optional)

If the recommendation is clear and unlikely to change, create `SESSION_NNNN+1.md` with:

- JETTY 3.0 frontmatter
- `Goal` from the recommendation
- `Status: pending` (flips to `in-progress` at next bow-in)
- A skeleton `## Petey plan` block if the tasks are known

This saves tokens at the next bow-in — the agent doesn't need to re-derive the plan.

## Rules

1. **Recommend, don't decide.** The user approves the next-target.
2. **One recommendation, with alternatives.** Don't present five options and ask the user to figure it out.
3. **Connect to the program plan.** Every recommendation should trace to a sprint deliverable or an open boundary.
4. **Don't expand scope.** If the review surfaces new work, add it to `Open decisions / blockers` — don't absorb it into the recommendation.

## Cross-references

- [Petey Plan protocol](petey-plan.md) — invoked at bow-in to execute the recommendation
- [Closing ritual](../rituals/closing.md) — invokes this protocol
- [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md) — primary input for next-target
- [Program plan](../architecture/program-plan.md) — sprint-level context
