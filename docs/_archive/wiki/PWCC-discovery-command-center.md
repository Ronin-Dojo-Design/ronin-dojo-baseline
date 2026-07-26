---
title: PWCC Discovery Command Center
slug: pwcc-discovery-command-center
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
  - discovery
---

┌─────────────────────────────────────────────────────────────────────┐
│ PLAYWRIGHT COMPONENT DISCOVERY CENTER                               │
├─────────────────────────────────────────────────────────────────────┤
│ Lane: Old Local Site → Next/Dirstarter Component                    │
│ Component: ______________________________                           │
│ Old URL:   http://local-site.test/________                          │
│ New Route: /app-or-page-target/________                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────────────────┐
│ 1. Visual Capture            │ │ Capture Status                      │
├─────────────────────────────┤ ├─────────────────────────────────────┤
│ [ ] Desktop screenshot       │ │ Desktop:  pending                   │
│ [ ] Mobile screenshot        │ │ Mobile:   pending                   │
│ [ ] Tablet screenshot        │ │ DOM:      pending                   │
│ [ ] DOM snapshot             │ │ States:   pending                   │
│ [ ] Console check            │ │ Console:  pending                   │
└─────────────────────────────┘ └─────────────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────────────────┐
│ 2. Interaction Crawl         │ │ Observed Behaviors                  │
├─────────────────────────────┤ ├─────────────────────────────────────┤
│ [ ] Click buttons            │ │ - ________________________________  │
│ [ ] Open menus/modals        │ │ - ________________________________  │
│ [ ] Submit form              │ │ - ________________________________  │
│ [ ] Trigger validation       │ │ - ________________________________  │
│ [ ] Resize viewport          │ │ - ________________________________  │
└─────────────────────────────┘ └─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 3. Component Port Spec                                              │
├─────────────────────────────────────────────────────────────────────┤
│ Visual structure:                                                   │
│ Data needed:                                                        │
│ States:                                                             │
│ Interactions:                                                       │
│ Responsive rules:                                                   │
│ Dirstarter primitives:                                              │
│ Port strategy: replace / wrap / rewrite / port / archive            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 4. Source Inspection Rule                                           │
├─────────────────────────────────────────────────────────────────────┤
│ [ ] Can rebuild from Playwright observation only                    │
│ [ ] Need targeted old source inspection                             │
│ Reason source is needed: _________________________________________  │
└─────────────────────────────────────────────────────────────────────┘
