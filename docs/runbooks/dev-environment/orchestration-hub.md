---
title: "Orchestration Hub (docs:hub)"
slug: orchestration-hub
type: runbook
status: active
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0428
pairs_with:

  - docs/runbooks/dev-environment/docs-navigator.md
  - docs/epics/post-launch-clean-repo-001.md
backlinks:

  - docs/knowledge/wiki/index.md
tags: [docs, hub, orchestration, agent-handoff, html, dev-environment]
---

# Orchestration Hub (`docs:hub`)

A single, self-contained, lightweight HTML view of **every ritual, protocol, SOP, and domain
hub** for agent-handoff orchestration loops (bow-in/out, PR-review → score → fix, Giddy merge
strategy, …). Apple/IBM-clean file-tree sidebar + the email-style numbered **1-2-3 step chips**
(ordered lists and `### N.` step headings render as numbered badges). Offline-openable, no runtime
deps.

## Run

```bash
bun run docs:hub        # → docs/orchestration.html
```

Open `docs/orchestration.html` in any browser. **Regenerate-only — never commit it** (git-ignored,
same convention as the [docs navigator](docs-navigator.md)). The *generator*
(`scripts/build-orchestration-hub.ts`) is the committed source of truth; rerun after editing any
protocol/SOP.

## What it includes

Sourced from (one group per folder): `docs/rituals/`, `docs/protocols/`, `docs/runbooks/sops/`,
`docs/runbooks/domain-features/`, `docs/agents/`, `docs/epics/`. Each doc renders with a left-rail
filter, a step-count badge, and scroll-spy active highlighting.

## Extend

Add a folder to the `GROUPS` array in `scripts/build-orchestration-hub.ts`. Numbered step styling
is automatic: any markdown ordered list, or any `##`/`###` heading whose text starts with `N.`,
becomes a numbered chip — no per-doc markup needed.

## Loop posters (PNG / PDF for emails & Tony)

Condensed **one-page, ez-to-read posters** of each orchestration loop (big 1-2-3 steps,
BBL-branded, A4 print CSS) — built to email or quick-message to Tony.

```bash
bun run docs:posters    # → docs/posters/*.html  (+ index.html)
```

Curated loops: bow-in, bow-out, PR review → score → fix, Giddy merge strategy, hostile close
review, review & recommend, Cody pre-flight (`LOOPS` array in `scripts/build-loop-posters.ts`).
Steps are auto-extracted (numbered headings → else section titles), so posters stay in sync with
the source docs.

### Export to PNG / PDF

Open `docs/posters/<loop>.html` (or `docs/posters/index.html`) in a browser:

- **PDF** — Print → **Save as PDF** (the poster is A4 print-styled; gold prints via
  `print-color-adjust`). Zero dependencies. → attach to an email.
- **PNG** — screenshot the poster card, or in DevTools capture the `.poster` node.

> Automated PNG/PDF export (one command → files) needs a headless browser
> (puppeteer/playwright). It is **not** bundled — this environment blocks the Chromium download.
> Add a `puppeteer` export step only in an env where a browser is available.
