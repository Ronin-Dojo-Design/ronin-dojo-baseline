---
title: "Giddy + Doug Hostile Close Review"
slug: hostile-close-review
type: protocol
status: active
created: 2026-04-29
updated: 2026-04-29
last_agent: codex-session-0025
health: 8
pairs_with:
  - docs/rituals/closing.md
  - docs/protocols/task-review-log.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0024.md
  - docs/sprints/SESSION_0025.md
---

# Giddy + Doug Hostile Close Review

Run this during close for every non-trivial session. The goal is not to be mean;
the goal is to stop false confidence before it becomes launch debt.

## Trigger

Run at close when the session touched any of:

- code
- schema
- migrations
- auth
- payments
- storage/media
- deployment
- runbooks/protocols
- Dirstarter-derived patterns

For typo-only sessions, record `Hostile close review: not applicable — typo/doc
copy only` in the SESSION file and `TASK_REVIEW_LOG`.

## Persona split

| Persona | Review stance |
| --- | --- |
| Giddy | Architecture, Dirstarter compliance, branch/worktree hygiene, merge risk |
| Doug | QA evidence, failure modes, release readiness, security proof |

## Dirstarter docs gate

Every hostile close review must include a Dirstarter alignment line:

```markdown
Dirstarter docs check: live docs checked | cached docs sufficient | not applicable
Sources: <URLs or local inventory>
Verdict: aligned | partially aligned | not aligned
```

Use live `https://dirstarter.com/docs` pages when the session touches a
Dirstarter baseline layer:

- Prisma/database
- Better Auth/authentication
- project structure
- environment variables
- storage/media
- payments/Stripe
- deployment
- UI/component patterns

Cached local docs or a prior inventory are sufficient only when the session did
not touch a Dirstarter-owned layer. If the current claim depends on what
Dirstarter does now, check the live docs.

## Review questions

Answer these in hostile-review language, then record findings in
`TASK_REVIEW_LOG`.

1. **Plan sanity:** Was the plan actually good, or did it paper over an
   invalid assumption?
2. **Dirstarter compliance:** Did this extend Dirstarter's baseline, or quietly
   replace/bypass it?
3. **Security:** Did the work expose or prepare sensitive data paths without
   authorization proof?
4. **Data integrity:** Does the database enforce the business rule, or only
   document it?
5. **Lifecycle proof:** Does the change serve the user journey it claims to
   serve?
6. **Verification honesty:** Did tests prove the claim, or merely prove the code
   parses?
7. **Workflow honesty:** Was WORKFLOW 5.0 followed, including lane, worktree,
   task IDs, review log, and score cap rules?
8. **Merge readiness:** Is this ready to merge, or only ready to keep working?

## Required output

Append one review entry to `TASK_REVIEW_LOG` using this shape:

```markdown
## SESSION_NNNN_REVIEW_XX - <short title>

**Reviewed tasks:** SESSION_NNNN_TASK_XX
**Dirstarter docs check:** live docs checked | cached docs sufficient | not applicable
**Sources:** <URLs or local docs>
**Verdict:** <one blunt paragraph>

### SESSION_NNNN_FINDING_XX - <title>

- **Severity:** high | medium | low
- **Task:** SESSION_NNNN_TASK_XX
- **Evidence:** <file:line or source URL>
- **Impact:** <what breaks or what risk remains>
- **Required follow-up:** <specific next action>
- **Status:** open | addressed | accepted-risk
```

## Score impact

Apply WORKFLOW 5.0 caps honestly:

- Dirstarter compliance failure caps score at 8.9.
- Data integrity failure caps score at 8.9.
- Missing credible verification caps score at 9.4.
- Security proof missing for exposed data paths caps score at 8.9.

If a session scores under 9.5 after hostile review, do not hide the debt. Add it
to `Open decisions / blockers`, `TASK_REVIEW_LOG`, and any relevant boundary
registry entry.
