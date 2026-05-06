---
title: Simple Playwright Component Port Pipeline
slug: simple-playwright-component-port-pipeline
type: concept
status: active
created: 2026-05-06
updated: 2026-05-06
last_agent: codex-session-0085
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/component-porting/graphify-component-port-map.md
tags:
  - component-porting
  - playwright
  - source-inspection
---

Playwright = visual/behavior truth
Graphify/wiki = repo/component map
Old source = last resort

1. Playwright opens old Local site
2. Click through target screen/component
3. Capture:
   - screenshot
   - DOM snapshot
   - interactions
   - responsive behavior
   - states: empty / filled / error / loading
4. Write a component spec from what is observed
5. Check Dirstarter inventory
6. Rebuild in Next using existing primitives
7. Only inspect old source if behavior is unclear



LLM Prompt
Use Playwright to inspect the old Local site visually.
Do not grep the old monorepo first.

For each target component:
1. navigate to the old page
2. capture desktop screenshot
3. capture mobile screenshot
4. describe visible UI structure
5. click all obvious controls
6. record behavior/state changes
7. produce a port spec
8. check Dirstarter inventory
9. rebuild in Next/Dirstarter
10. only open old source files if behavior cannot be inferred
