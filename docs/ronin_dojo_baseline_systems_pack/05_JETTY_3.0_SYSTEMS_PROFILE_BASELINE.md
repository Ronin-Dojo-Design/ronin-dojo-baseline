# JETTY 3.0 Systems Profile — Baseline Repo

## Purpose
This is **not** a replacement for `docs/knowledge/JETTY_3.0.md`.

It is the **repo-specific extension profile** for using JETTY 3.0 inside `ronin-dojo-baseline`.

Use the repo's official JETTY 3.0 page as the canonical standard.
Use this profile to apply it consistently to:
- architecture files
- session files
- runbooks
- protocols
- content-engine docs
- system-facing code explainer pages

---

## 1. What JETTY 3.0 already does well
The repo's JETTY 3.0 already provides:
- required YAML frontmatter
- page-type sections
- health scoring
- backlink rules
- agent maintenance rules

That is the correct base.

---

## 2. What this profile adds
The baseline repo needs a few extra habits so docs match the platform:

### Add these optional frontmatter fields on system-critical pages
```yaml
source_of_truth:
  - apps/web/prisma/schema.prisma
state_role: owns | derives | documents | routes | renders
permissions_scope: public | member | admin | mixed | private
brand_scope:
  - BASELINE_MARTIAL_ARTS
  - BBL
  - WEKAF
  - RONIN_DOJO_DESIGN
sprint: S1 | S2 | ...
qa_surface:
  - unit
  - smoke
  - manual
  - staging
ops_boundary:
  - deploy
  - auth
  - content
  - migration
```

### Why
Because this repo is now:
- a codebase
- a wiki
- a sprint ledger
- a runbook system
- a ritual/protocol system
- an emerging content engine

Those extra fields make the docs more operational.

---

## 3. Page guidance by domain

## A. Architecture docs
Use:
- `source_of_truth`
- `state_role: documents`
- `brand_scope`
- `qa_surface`
- `pairs_with`

### Example
Use this on:
- `program-plan.md`
- `plan-vs-current.md`
- `auth.md`
- `data-model.md`

---

## B. Session files
Keep existing JETTY 3.0 session pattern, but add:
- `sprint`
- `source_of_truth`
- `qa_surface`
- `ops_boundary`

### Rule
Session files are operational truth summaries, not essays.

---

## C. Runbooks
Use:
- `state_role: documents`
- `permissions_scope`
- `qa_surface`
- `ops_boundary`

### Rule
Runbooks should say:
- when to use
- exact steps
- rollback
- last verified

---

## D. Rituals and protocols
Use:
- `state_role: routes`
- `permissions_scope: mixed`
- `ops_boundary`
- `pairs_with`

### Rule
These files define operator behavior.
They should stay lean and dependable.

---

## E. Content-engine docs
Use:
- `state_role: documents`
- `source_of_truth`
- `brand_scope`
- `qa_surface`
- `ops_boundary: content`

### Rule
Because the content system is still split between:
- wiki/knowledge docs
- current MDX blog content
- emerging content-atom app models

the docs must say which layer they are describing.

---

## F. File explainer pages in the wiki
Use:
- `source_of_truth`
- `state_role`
- `permissions_scope`
- `qa_surface`

### Rule
If the page explains a code file, it should clearly say whether that file:
- owns logic
- owns durable data
- routes requests
- just renders UI

---

## 4. Recommended new section on system-critical pages

Add this section when a page deserves it:

## Truth and boundaries
- **Primary truth source:**
- **What this page does not own:**
- **Permissions / visibility:**
- **Operational boundary:**
- **Next hardening step:**

This is especially useful for:
- auth docs
- content engine docs
- brand/migration docs
- SOPs
- runbooks

---

## 5. JETTY 3.0 usage rules for this repo

1. **Do not overcomplicate trivial pages.**
2. **Use the extension fields only where they help operational clarity.**
3. **Every new important page should link back into the wiki index.**
4. **Health scores should stay honest.**
5. **If the repo changes behavior, update docs in the same session if possible.**

---

## 6. Good-fit pages for immediate retrofit
Best candidates:
- `docs/architecture/auth.md`
- `docs/architecture/program-plan.md`
- `docs/architecture/plan-vs-current.md`
- `docs/protocols/chat-handoff.md`
- `docs/rituals/opening.md`
- `docs/rituals/closing.md`
- content-engine concept pages
- new SOPs and control docs

---

## 7. Naming rule
Keep the canonical repo doc name:
- `JETTY_3.0.md`

Use add-on docs like this one only as:
- profile
- extension
- implementation guide
- repo usage layer

Do not create competing canonical standards unless the repo truly changes version again.

---

## 8. Petey close

JETTY 3.0 already gives the repo a memory spine.

This profile makes that spine more useful for:
- architecture
- rituals
- content ops
- user lifecycle flows
- staged hardening

**Planned Passion Produces Purpose.**
**OSSS.**
