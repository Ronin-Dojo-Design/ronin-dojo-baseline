---
title: "Giddy + Doug Hostile Close Review"
slug: hostile-close-review
type: protocol
status: active
created: 2026-04-29
updated: 2026-05-14
last_agent: codex-session-0163
pairs_with:
  - docs/rituals/closing.md
  - docs/protocols/project-log.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0024.md
  - docs/sprints/SESSION_0025.md
  - docs/sprints/SESSION_0163.md
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
copy only` in the SESSION file and the active project-log task review section.

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

Answer these in hostile-review language, then record findings in the task review
section of `docs/protocols/project-log.md`.

1. **Plan sanity:** Was the plan actually good, or did it paper over an
   invalid assumption? If the work touched a Dirstarter-owned layer, did the
   plan use the relevant live Dirstarter docs as the implementation template
   before Cody started?
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

## Kaizen reflection triage (required, three questions)

After the eight review questions, the closing agent answers these three Kaizen
questions in plain prose. They are deliberately sharp; defensive answers fail
the gate. Record the answers in the `docs/protocols/project-log.md` review
entry directly under the review-questions verdict.

1. **Is this safe and secure? What tests would prove me right?** Name what is
   provably safe, what is *documented* but not behaviorally proven, and the
   exact tests that would close each remaining gap.
2. **How many failed steps could we have prevented? What would I do better
   next time to plan for no failed steps or missed protocols?** Count concrete
   process slips this session and the smallest protocol change that would
   prevent each class. Also name any planning/process simplification that would
   save time without reducing proof, security, Dirstarter alignment, or
   workflow honesty.
3. **Confidence 1–10 that the code does what it needs to do at scale of 100,
   1,000, and 10,000 without breakage, leakage, and efficiently?** Score each
   tier separately; aggregate is the lowest tier the slice will plausibly hit
   before its next remediation window.

### Score gate from Kaizen aggregate

| Aggregate confidence | Required action |
| --- | --- |
| ≥ 9 | Proceed to the next implementation session as planned. |
| 7 – 8 | Stage a remediation session (e.g., `SESSION_NNNN.5`) covering the gaps before the next implementation session. |
| ≤ 6 | Do not advance. Open a hostile follow-up SESSION immediately. |

The Kaizen aggregate is independent of the WORKFLOW 5.0 ten-point rubric. A
slice may score 10/10 on plan gates and still earn a Kaizen aggregate of 7
because the Kaizen view interrogates *what is not yet proven*, not *what was
planned*. Treat both numbers as load-bearing.

## Required output

Append one review entry to the task review section of
`docs/protocols/project-log.md` using this shape:

```markdown
### SESSION_NNNN - <session title>

#### Review

**SESSION_NNNN_REVIEW_XX - <short title>**

- **Reviewed tasks:** SESSION_NNNN_TASK_XX
- **Dirstarter docs check:** live docs checked | cached docs sufficient | not applicable
- **Sources:** <URLs or local docs>
- **Verdict:** <one blunt paragraph>

#### Findings

**SESSION_NNNN_FINDING_XX - <title>**

- **Severity:** high | medium | low
- **Task:** SESSION_NNNN_TASK_XX
- **Evidence:** <file:line or source URL>
- **Impact:** <what breaks or what risk remains>
- **Required follow-up:** <specific next action>
- **Status:** open | addressed | accepted-risk
```

`docs/protocols/project-log.md` is the active append-only ledger for hostile
close review entries. `docs/_archive/task-review-log.md` is historical only and
does not satisfy this protocol.

## Score impact

Apply WORKFLOW 5.0 caps honestly:

- Dirstarter compliance failure caps score at 8.9.
- Data integrity failure caps score at 8.9.
- Missing credible verification caps score at 9.4.
- Security proof missing for exposed data paths caps score at 8.9.

If a session scores under 9.5 after hostile review, do not hide the debt. Add it
to `Open decisions / blockers`, the task review section of
`docs/protocols/project-log.md`, and any relevant boundary registry entry.

A WORKFLOW-rubric pass with a Kaizen aggregate ≤ 8 also counts as debt — record
it the same way and stage a remediation session before any further
implementation work in the same lane.
