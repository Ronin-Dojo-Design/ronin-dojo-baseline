---
title: JETTY 3.0 Systems Profile for Baseline Repo
slug: jetty-3-baseline-systems-profile
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
pairs_with:
  - docs/knowledge/JETTY_3.0.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - documentation
  - jetty
  - wiki
---

## Summary

This is **not** a replacement for `docs/knowledge/JETTY_3.0.md`. It is the **repo-specific extension profile** for using JETTY 3.0 inside `ronin-dojo-baseline`. Use the repo's official JETTY 3.0 page as the canonical standard. Use this profile to apply it consistently to architecture files, session files, runbooks, protocols, content-engine docs, and system-facing code explainer pages.

## Status

Active, adopted SESSION_0010.

## Purpose

JETTY 3.0 already provides the doc spine: required YAML frontmatter, page-type sections, health scoring, backlink rules, agent maintenance rules. That is the correct base.

This profile adds extra habits the baseline repo needs because it is now simultaneously:

- a codebase
- a wiki
- a sprint ledger
- a runbook system
- a ritual/protocol system
- an emerging content engine

The extra fields below make the docs more operational without competing with the canonical JETTY 3.0 standard.

## Trigger

Apply this profile when:

- creating or updating important docs
- writing new SOPs
- touching rituals, sessions, runbooks, or content-engine docs
- you need better truth/boundary visibility inside a page

Do not apply it to trivial pages — keep extension fields where they help operational clarity.

## Steps

### 1. Add optional frontmatter fields on system-critical pages

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

### 2. Apply the right combination by page domain

#### A. Architecture docs
Use: `source_of_truth`, `state_role: documents`, `brand_scope`, `qa_surface`, `pairs_with`.

Use on: `program-plan.md`, `plan-vs-current.md`, `auth.md`, `data-model.md`.

#### B. Session files
Keep existing JETTY 3.0 session pattern, but add: `sprint`, `source_of_truth`, `qa_surface`, `ops_boundary`.

**Rule:** Session files are operational truth summaries, not essays.

#### C. Runbooks
Use: `state_role: documents`, `permissions_scope`, `qa_surface`, `ops_boundary`.

Runbooks should say: when to use, exact steps, rollback, last verified.

#### D. Rituals and protocols
Use: `state_role: routes`, `permissions_scope: mixed`, `ops_boundary`, `pairs_with`.

These files define operator behavior. They should stay lean and dependable.

#### E. Content-engine docs
Use: `state_role: documents`, `source_of_truth`, `brand_scope`, `qa_surface`, `ops_boundary: content`.

Because the content system is split between wiki/knowledge docs, current MDX blog content, and emerging content-atom app models, the docs must say which layer they are describing.

#### F. File explainer pages in the wiki
Use: `source_of_truth`, `state_role`, `permissions_scope`, `qa_surface`.

If the page explains a code file, it should clearly say whether that file owns logic, owns durable data, routes requests, or just renders UI.

### 3. Add a Truth and boundaries section on system-critical pages

```md
## Truth and boundaries
- **Primary truth source:**
- **What this page does not own:**
- **Permissions / visibility:**
- **Operational boundary:**
- **Next hardening step:**
```

Useful for: auth docs, content engine docs, brand/migration docs, SOPs, runbooks.

### 4. Follow the JETTY 3.0 usage rules for this repo

1. Do not overcomplicate trivial pages.
2. Use the extension fields only where they help operational clarity.
3. Every new important page should link back into the wiki index.
4. Health scores should stay honest.
5. If the repo changes behavior, update docs in the same session if possible.

### 5. Identify good-fit pages for immediate retrofit

Best candidates:

- `docs/architecture/auth.md`
- `docs/architecture/program-plan.md`
- `docs/architecture/plan-vs-current.md`
- `docs/protocols/chat-handoff.md`
- `docs/rituals/opening.md`
- `docs/rituals/closing.md`
- content-engine concept pages
- new SOPs and control docs

### 6. Respect the naming rule

Keep the canonical repo doc name `JETTY_3.0.md`. Use add-on docs like this one only as profile / extension / implementation guide / repo usage layer. Do not create competing canonical standards unless the repo truly changes version again.

## Outputs

- System-critical pages carry the extension frontmatter where it adds operational clarity.
- A `## Truth and boundaries` section appears on auth, content engine, brand/migration, SOP, and runbook pages where applicable.
- Health scores stay honest; backlinks resolve; canonical JETTY 3.0 page remains the spine.

Source: `docs/_imports/baseline-systems-pack/05_JETTY_3.0_SYSTEMS_PROFILE_BASELINE.md`
