---
title: Playwright Proof Gate
slug: playwright-proof-gate
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
  - proof
---

┌─────────────────────────────────────────────────────────────────────┐
│ PLAYWRIGHT PROOF GATE — NEW NEXT COMPONENT                         │
├─────────────────────────────────────────────────────────────────────┤
│ Component: ProfileCard                                              │
│ New Route: /members/[slug]                                          │
│ Target: Next + Dirstarter compliant                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────────────────┐
│ Visual Match                 │ │ Result                              │
├─────────────────────────────┤ ├─────────────────────────────────────┤
│ [ ] Desktop screenshot       │ │ □ pass  □ fail                      │
│ [ ] Mobile screenshot        │ │ □ pass  □ fail                      │
│ [ ] Layout spacing           │ │ □ pass  □ fail                      │
│ [ ] Typography close enough  │ │ □ pass  □ fail                      │
│ [ ] Brand styling sane       │ │ □ pass  □ fail                      │
└─────────────────────────────┘ └─────────────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────────────────┐
│ Behavior Match               │ │ Result                              │
├─────────────────────────────┤ ├─────────────────────────────────────┤
│ [ ] Click behavior           │ │ □ pass  □ fail                      │
│ [ ] Modal/menu behavior      │ │ □ pass  □ fail                      │
│ [ ] Form behavior            │ │ □ pass  □ fail                      │
│ [ ] Empty state              │ │ □ pass  □ fail                      │
│ [ ] Error state              │ │ □ pass  □ fail                      │
└─────────────────────────────┘ └─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Dirstarter / Repo Compliance                                        │
├─────────────────────────────────────────────────────────────────────┤
│ [ ] Existing primitives checked                                     │
│ [ ] No duplicate Button/Input/Card/etc.                             │
│ [ ] Server/client boundary intentional                              │
│ [ ] Data comes from proper query/action/schema layer                 │
│ [ ] Port map updated                                                │
│ [ ] Wiki updated                                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Verdict                                                             │
├─────────────────────────────────────────────────────────────────────┤
│ Score: ____ / 10                                                    │
│ □ Pass and continue                                                 │
│ □ Fix before merge                                                  │
│ □ Split into smaller follow-up                                      │
│ □ Archive component instead                                         │
└─────────────────────────────────────────────────────────────────────┘
