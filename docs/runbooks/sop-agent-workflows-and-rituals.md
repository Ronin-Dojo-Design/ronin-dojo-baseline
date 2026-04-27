---
title: SOP — Agent Workflows and Rituals
slug: sop-agent-workflows-and-rituals
type: runbook
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 7
pairs_with:
  - docs/agents/petey.md
  - docs/agents/cody.md
  - docs/rituals/opening.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - sop
  - workflow
---

## Summary

Aligns the repo-native agent / ritual / protocol layer with the new baseline stack. Defines the active agent posture (Petey, Cody, Doug + extended lanes), bow-in / bow-out flows, per-agent workflows, the canonical folder map for `docs/`, and a suggested protocol growth path. This is **not** the old RoninDashboard ritual machine — it is the lighter, repo-native version.

## Status

active, adopted SESSION_0010 (2026-04-27)

## When to use

- Starting or ending any work session (bow in / bow out)
- Deciding which agent persona to invoke for a given task
- Reasoning about where a new doc belongs (`agents/`, `protocols/`, `rituals/`, `sprints/`, `runbooks/`, `knowledge/wiki/`)
- Considering whether to add a new protocol or automation lane
- Onboarding a contributor or agent into the baseline ritual cadence

## Steps

### 1. Active agent posture

#### Core active triangle
- **Petey** = orchestrator / planner / compression
- **Cody** = builder / implementer
- **Doug** = QA / proof / closure discipline

#### Extended support lanes
- **Iggy** = automation / evidence / runner support
- **Brandon** = brand strategy / copy / rollout language
- **Desi** = design system / UI polish / surface clarity
- **Giddy** = repo-health / governance / canonical reduction

#### Practical rule
Only load the extra personas when the task really needs them.

---

### 2. Bow in flow (repo-native)

```text
+----------------------+
|  Start session       |
+----------+-----------+
           |
           v
read latest SESSION_NNNN
           |
           v
read program-plan
           |
           v
read wiki index
           |
           v
pick ONE task
           |
           +--> unclear? invoke Petey
           |
           +--> clear? invoke Cody
           |
           v
create new SESSION_NNNN
           |
           v
begin work
```

#### Bow-in outputs
- clear session goal
- one task
- one new SESSION file
- minimal required context loaded

---

### 3. Bow out flow (repo-native)

```text
pause work
   |
   v
update SESSION_NNNN
   |
   v
JETTY / backlink / index sweep
   |
   v
git hygiene check
   |
   +--> commit/push if authorized
   |
   v
set next-session goal
   |
   v
bow out line
```

#### Bow-out outputs
- clean session record
- touched files listed
- blockers named
- next-session first task named

---

### 4. Petey workflow

```text
user asks for change / plan / direction
              |
              v
       identify lane + objective
              |
              v
  what already exists? what is active?
              |
              v
  what truth source defines this lane?
              |
              v
   shrink to smallest real objective
              |
              v
 produce execution packet / doc / task
```

#### Petey rule
Compression before expansion.

---

### 5. Cody workflow

```text
clear task
   |
   v
load lane docs
   |
   v
inspect target files
   |
   v
implement smallest safe change
   |
   v
test / verify / update docs if needed
   |
   v
hand back to Doug / Petey closeout
```

#### Cody rule
Build the smallest thing that proves the path.

---

### 6. Doug workflow

```text
change lands
   |
   v
what proof is required?
   |
   +--> unit?
   +--> smoke?
   +--> manual?
   +--> staging?
   |
   v
check regressions
   |
   v
name blockers honestly
   |
   v
close lane only if proof exists
```

#### Doug rule
No imaginary readiness.

---

### 7. Iggy workflow

```text
repeated manual workflow spotted
            |
            v
is this safe to automate?
            |
            +--> no -> document manual lane only
            |
            +--> yes
                    |
                    v
            define runner contract
                    |
                    v
            define evidence bundle
                    |
                    v
            define follow-on task seeds
                    |
                    v
            hand back to Petey/Cody
```

#### Iggy rule
Automate repeatable proof first, not product ownership.

---

### 8. Folder map recommendation

#### Existing repo-native folders
- `docs/agents/`
- `docs/protocols/`
- `docs/rituals/`
- `docs/sprints/`
- `docs/runbooks/`
- `docs/knowledge/wiki/`

#### Recommended stable role for each

##### `docs/agents/`
Persona definitions:
- Petey
- Cody
- Doug
- optional support personas

##### `docs/protocols/`
Workflow procedures:
- chat handoff
- code guardrails
- wiki lint
- future review loops
- future content review gates

##### `docs/rituals/`
Human/agent session rituals:
- opening
- closing

##### `docs/sprints/`
Chronological session state:
- `SESSION_0001.md`
- `SESSION_0002.md`
- etc.

##### `docs/runbooks/`
Operational procedures:
- database
- prisma workflow
- deploy
- content publish
- staging smoke
- incident recovery

##### `docs/knowledge/wiki/`
Structured repo memory:
- index
- concepts
- file explainers
- session map
- templates

---

### 9. Suggested protocol growth path

Do **not** import the whole old protocol machine at once.

#### Keep active now
- opening ritual
- closing ritual
- chat handoff
- wiki lint
- code guardrails
- prisma/database runbooks

#### Add next only if needed
- content publish protocol
- staging proof protocol
- release cut protocol
- content-atom QA protocol
- media proof bundle protocol

#### Defer until complexity earns it
- heavy branch-monitor systems
- massive persona loops
- multi-file redundant state packs
- ceremony-heavy prompt stacks

---

### 10. Quick-start operator stack

For most sessions:
1. bow in
2. latest session
3. program plan
4. one task
5. build or plan
6. bow out

That is enough.

---

### 11. ASCII full control-plane map

```text
           +--------------------------+
           |        User request      |
           +-------------+------------+
                         |
                         v
                 +---------------+
                 |   Bow in      |
                 +-------+-------+
                         |
                         v
               +-------------------+
               | latest SESSION    |
               +-------------------+
                         |
                         v
               +-------------------+
               | program-plan/wiki |
               +-------------------+
                         |
                         v
          +-------------------------------+
          | Petey or Cody or Doug or Iggy |
          +-------------------------------+
                         |
                         v
                 +---------------+
                 |   Work lane   |
                 +-------+-------+
                         |
                         v
                 +---------------+
                 |   Bow out     |
                 +-------+-------+
                         |
                         v
               +-------------------+
               | next SESSION file |
               +-------------------+
```

---

### 12. Petey close

The new repo does not need a bloated ritual machine.

It needs a calm one.

**Planned Passion Produces Purpose.**
**OSSS.**

## Rollback

_Not applicable — this SOP describes a process, not a destructive operation. If a step fails, halt and surface the blocker in the SESSION file._

## Last verified

2026-04-27 — adopted from raw import; not yet exercised against current repo state
