---
title: How to Use These Registries
slug: how-to-use-these-registries
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
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

## Summary

Explain how to use the new control docs inside the baseline repo: the truth index, the alias ledger, the manual-boundary registry, the JETTY 3.0 systems profile, and the loading order. Use these docs to reduce drift, not to create drag.

Applies to:
- `repo-truth-index.md`
- `aliases-and-canonical-ids.md`
- `manual-boundary-registry.md`
- `jetty-3-baseline-systems-profile.md`
- `next-session-loading-order.md`

## Status

Active, adopted SESSION_0010.

## Purpose

Give every agent and operator a shared, sequenced way to consult the control docs so canon stays clean, naming stays stable, blockers stay visible, and documentation stays operational. Truth first. Names second. Boundaries third. Documentation with intent.

## Trigger

Reach for these docs when any of the following is true:

- canon feels fuzzy
- naming feels confusing or drifting
- something is "almost done" but not proven
- you are creating or upgrading important documentation
- you are starting a session and need the right loading order

Do not open all of them every time. The point is cleaner work, not ceremonial bloat.

## Steps

### 1. Use the docs in this order

**First — read the truth index** when you are not sure where truth lives, old monorepo knowledge is leaking in, or schema/auth/content/docs feel mixed together.

**Second — read the alias ledger** when brand labels are discussed, Baseline vs TuffBuffs language appears, package/repo naming feels confusing, or IDs and slugs need to stay stable.

**Third — read the manual-boundary registry** when something is "almost done", smoke proof is pending, owner signoff or environment proof still matters, or a release gate depends on human action.

**Fourth — use the JETTY 3.0 systems profile** when creating or updating important docs, writing new SOPs, touching rituals/sessions/runbooks/content-engine docs, or you need better truth/boundary visibility inside a page.

**Fifth — use the loading order** at session start.

### 2. Match the file to the question

| File | Solves |
|---|---|
| Truth index | "What is canonical here?" |
| Alias ledger | "What is this called now, what used to it be called, and what must stay stable?" |
| Manual boundary registry | "What still needs a human / runtime proof / explicit signoff?" |
| JETTY systems profile | "How should we document important files/pages in this repo?" |
| Loading order | "What do I read first so I don't drown in context?" |

### 3. Follow the daily usage pattern

**Planning session**
1. latest SESSION file
2. truth index
3. manual boundary registry
4. program plan
5. relevant lane docs
6. alias ledger if naming is involved

**Build session**
1. latest SESSION file
2. program plan or lane doc
3. schema/auth/runbook as needed
4. manual boundary registry if smoke or deploy is involved

**Documentation session**
1. truth index
2. JETTY systems profile
3. wiki index
4. touched page(s)
5. update backlinks and health

**Content-engine session**
1. truth index
2. content-engine doc
3. current content truth lane (MDX, schema-backed atoms, or wiki knowledge)
4. task / publish flow docs
5. Iggy/video intake flow if media ops are involved

### 4. Honor the minimum behavior rules

- do not let old WP/PODS assumptions override repo docs
- do not rename things casually
- do not say "done" when the manual-boundary registry still says open
- do not create important docs without JETTY 3.0-compatible structure
- do not start a session without checking the latest SESSION file

### 5. Avoid overuse

Use these docs when they actually unblock clarity. The point is cleaner work, not ceremonial bloat.

## Outputs

- Every session opens with the right minimum context.
- Naming, canon, and blockers stay legible across agents and time.
- Documentation upgrades happen against a known standard, not against vibes.

Source: `docs/_imports/baseline-systems-pack/06_HOW_TO_USE_THESE_REGISTRIES_BASELINE.md`
