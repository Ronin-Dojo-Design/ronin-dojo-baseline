# Baseline Repo Docs Adoption Checklist

## Recommendation first

**Use this in addition to what you already dropped in. Do not replace the imported files yet.**

Best move:
1. keep the raw imported files as a temporary staging set
2. use this checklist as the active adoption guide
3. move/rename/wire the imported docs into proper repo homes
4. only delete or archive the raw duplicates after the repo-native versions are linked and indexed

### Why
If you replace everything immediately, you lose the ability to compare:
- raw imported version
- normalized repo-native version
- final canonical version

So the safest pattern is:

```text
raw import -> adoption pass -> canonical repo version -> archive/delete raw duplicate
```

---

# 1. What file to add right now

Add this file as:

`docs/knowledge/wiki/baseline-docs-adoption-checklist.md`

This makes it visible to the repo-native wiki system and easy to link from sessions, rituals, and protocols.

---

# 2. One-session goal

Create a new session file and make this the goal:

**Goal:** adopt imported systems docs into baseline repo canon, wire them into the wiki/protocol structure, and choose the next execution target.

Suggested session file:

`docs/sprints/SESSION_0010.md`

If your repo already has a later session number, use the next real one.

---

# 3. Exact target paths

## A. Core control docs

### Move / normalize to these paths

- `docs/knowledge/wiki/repo-truth-index.md`
- `docs/knowledge/wiki/aliases-and-canonical-ids.md`
- `docs/knowledge/wiki/manual-boundary-registry.md`
- `docs/knowledge/jetty-3-baseline-systems-profile.md`
- `docs/knowledge/how-to-use-these-registries.md`
- `docs/protocols/next-session-loading-order.md`

---

## B. SOPs

### Move / normalize to these paths

- `docs/runbooks/sop-data-and-wiring-flows.md`
- `docs/runbooks/sop-e2e-user-lifecycle.md`
- `docs/runbooks/sop-agent-workflows-and-rituals.md`

---

## C. Content-engine docs

### Move / normalize to these paths

- `docs/knowledge/wiki/content-engine/command-center-and-intake.md`
- `docs/knowledge/wiki/content-engine/video-shortcuts-and-iggy-flow.md`

If `docs/knowledge/wiki/content-engine/` does not exist yet, create it.

---

## D. Raw import staging area

If you want to preserve the dropped files before rewriting/moving them, place the originals here temporarily:

- `docs/_imports/baseline-systems-pack/`

That gives you a safe comparison/archive zone while the repo-native files are being normalized.

---

# 4. Keep-or-replace decision

## My recommendation
**Keep both for one pass, then archive the raw imports.**

### Use this rule
- raw imported files = temporary reference only
- normalized files in final repo paths = canonical
- once canonical files are linked/indexed, move the raw import copies to archive or delete them

### Do not
- leave both versions active forever
- leave raw imported docs flat in `docs/`
- let two differently named files say almost the same thing

---

# 5. JETTY 3.0 frontmatter stubs

Use these as copy-paste starters.

## A. `repo-truth-index.md`

```yaml
---
title: Repo Truth Index
slug: repo-truth-index
type: concept
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 7
pairs_with:
  - aliases-and-canonical-ids
  - manual-boundary-registry
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/program-plan.md
needs_fix:
  - "Needs backlinks added to any newly linked docs"
tags:
  - governance
  - canon
  - architecture
---
```

## B. `aliases-and-canonical-ids.md`

```yaml
---
title: Aliases and Canonical IDs
slug: aliases-and-canonical-ids
type: concept
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 7
pairs_with:
  - repo-truth-index
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/program-plan.md
tags:
  - naming
  - migration
  - ids
---
```

## C. `manual-boundary-registry.md`

```yaml
---
title: Manual Boundary Registry
slug: manual-boundary-registry
type: runbook
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 7
pairs_with:
  - repo-truth-index
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/chat-handoff.md
  - docs/rituals/closing.md
tags:
  - blockers
  - ops
  - proof
---
```

## D. `jetty-3-baseline-systems-profile.md`

```yaml
---
title: JETTY 3.0 Systems Profile for Baseline Repo
slug: jetty-3-baseline-systems-profile
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 7
pairs_with:
  - docs/knowledge/JETTY_3.0.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - documentation
  - jetty
  - wiki
---
```

## E. `how-to-use-these-registries.md`

```yaml
---
title: How to Use These Registries
slug: how-to-use-these-registries
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 7
pairs_with:
  - repo-truth-index
  - aliases-and-canonical-ids
  - manual-boundary-registry
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - onboarding
  - workflow
---
```

## F. `next-session-loading-order.md`

```yaml
---
title: Next Session Loading Order
slug: next-session-loading-order
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 7
pairs_with:
  - docs/protocols/chat-handoff.md
  - docs/rituals/opening.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - session
  - loading
  - workflow
---
```

## G. SOP frontmatter pattern

Use this for each SOP/runbook:

```yaml
---
title: SOP Title Here
slug: sop-short-slug
type: runbook
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 7
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - sop
  - workflow
---
```

## H. Content-engine concept pattern

```yaml
---
title: Command Center and Intake
slug: content-engine-command-center-and-intake
type: concept
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 6
parent: docs/knowledge/wiki/content-engine/content-atoms.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - content-engine
  - intake
  - operations
---
```

---

# 6. Required section stubs under JETTY 3.0

For each imported file, add these sections at minimum:

## For concepts
- `## Summary`
- `## Status`
- `## Key Idea`
- `## Structure`
- `## Relationships`
- `## Sources`
- `## Open Questions`

## For protocols
- `## Summary`
- `## Status`
- `## Purpose`
- `## Trigger`
- `## Steps`
- `## Outputs`

## For runbooks / SOPs
- `## Summary`
- `## Status`
- `## When to use`
- `## Steps`
- `## Rollback`
- `## Last verified`

---

# 7. Wiki index entries to paste

Add these into `docs/knowledge/wiki/index.md`.

## A. Under Meta or Protocols
Add:

```md
| [JETTY 3.0 Systems Profile for Baseline Repo](../jetty-3-baseline-systems-profile.md) | protocol | active | 7 |
| [How to Use These Registries](../how-to-use-these-registries.md) | protocol | active | 7 |
```

## B. Under Concepts
Add:

```md
| [Repo Truth Index](repo-truth-index.md) | concept | active | 7 |
| [Aliases and Canonical IDs](aliases-and-canonical-ids.md) | concept | active | 7 |
```

## C. Under Runbooks
Add:

```md
| [Manual Boundary Registry](manual-boundary-registry.md) | runbook | active | 7 |
| [SOP — Data and Wiring Flows](../../runbooks/sop-data-and-wiring-flows.md) | runbook | active | 7 |
| [SOP — End-to-End User Lifecycle](../../runbooks/sop-e2e-user-lifecycle.md) | runbook | active | 7 |
| [SOP — Agent Workflows and Rituals](../../runbooks/sop-agent-workflows-and-rituals.md) | runbook | active | 7 |
```

## D. Under Protocols
Add:

```md
| [Next Session Loading Order](../../protocols/next-session-loading-order.md) | protocol | active |
```

## E. Under Concepts or a Content Engine subsection
Add:

```md
| [Command Center and Intake](content-engine/command-center-and-intake.md) | concept | active | 6 |
| [Video Shortcuts and Iggy Flow](content-engine/video-shortcuts-and-iggy-flow.md) | concept | active | 6 |
```

---

# 8. Existing files that should link to the new docs

Add cross-links from these existing repo-native pages:

## `docs/architecture/program-plan.md`
Add a short section or appendix link block:
- Repo Truth Index
- Aliases and Canonical IDs
- Manual Boundary Registry

## `docs/architecture/plan-vs-current.md`
Add links to:
- Repo Truth Index
- Manual Boundary Registry
- content-engine command-center doc

## `docs/protocols/chat-handoff.md`
Add links to:
- Next Session Loading Order
- Manual Boundary Registry

## `docs/rituals/opening.md`
Add links to:
- Next Session Loading Order
- Repo Truth Index

## `docs/rituals/closing.md`
Add links to:
- Manual Boundary Registry
- SOP Agent Workflows and Rituals

---

# 9. Adoption checklist — exact order

## Phase 1 — preserve
- [ ] create `docs/_imports/baseline-systems-pack/`
- [ ] move raw imported docs there, or copy them there
- [ ] keep them unchanged as reference

## Phase 2 — create canon files
- [ ] create final-path normalized docs in the paths listed above
- [ ] add JETTY 3.0 frontmatter
- [ ] add required sections
- [ ] copy over the useful content from the imported versions

## Phase 3 — wire repo memory
- [ ] update `docs/knowledge/wiki/index.md`
- [ ] add backlinks / pairs_with
- [ ] link from program-plan, plan-vs-current, opening, closing, chat-handoff

## Phase 4 — sessionize the adoption
- [ ] create next `SESSION_NNNN.md`
- [ ] state adoption as the session goal
- [ ] list files touched
- [ ] set next session target at bow-out

## Phase 5 — choose the next real execution step
- [ ] use manual-boundary registry to choose the next actual proof target
- [ ] recommended first target: Passport bootstrap smoke proof

---

# 10. Best next real execution target after adoption

## Recommendation
**Passport bootstrap smoke proof**

### Why
Because the repo is already pointing at S2 / Milestone 1:
- auth
- Passport bootstrap
- DirectoryProfile bootstrap
- identity shell closure
- membership shell next

This is the cleanest next thing to move from:
- “planned”
or
- “code complete / smoke pending”
to
- “verified”

---

# 11. My direct answer: replace or add?

## Answer
**Add this checklist now. Do not replace the imported docs yet.**

### Then:
- normalize them into repo-native versions
- wire them into the wiki/protocol structure
- archive or delete the raw duplicates afterward

That gives you:
- safety
- traceability
- cleaner canon

and avoids:
- duplicate truth
- accidental deletion
- confusion about which version is active

---

# 12. Petey close

Your next move is not more random writing.

It is:
1. adopt
2. wire
3. verify
4. execute the first real proof target

That is the disciplined path.

**Planned Passion Produces Purpose.**
**OSSS.**
