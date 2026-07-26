---
title: Ronin Component Port Command Center
slug: ronin-component-port-command-center
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
  - command-center
---

┌──────────────────────────────────────────────────────────────┐
│ RONIN COMPONENT PORT COMMAND CENTER                          │
├──────────────────────────────────────────────────────────────┤
│ Active Lane: Legacy React → Next/Dirstarter Port             │
│ Session: SESSION_NNNN                                        │
│ Score Gate: 9.5+                                             │
└──────────────────────────────────────────────────────────────┘

┌───────────────────────┐  ┌──────────────────────────────────┐
│ 1. Intake             │  │ Current Component                 │
├───────────────────────┤  ├──────────────────────────────────┤
│ Legacy path           │  │ Name: ProfileBubble               │
│ Screenshot / notes    │  │ Old path: old/components/...      │
│ Props                 │  │ Target: components/web/profile    │
│ Behavior              │  │ Status: mapped                    │
│ Target route          │  │ Strategy: rewrite into L1 pattern │
└───────────────────────┘  └──────────────────────────────────┘

┌───────────────────────┐  ┌──────────────────────────────────┐
│ 2. Repo Memory         │  │ Search Order                     │
├───────────────────────┤  ├──────────────────────────────────┤
│ [x] Wiki index         │  │ 1. index.md                      │
│ [x] Dirstarter inv.    │  │ 2. component inventory           │
│ [x] Graph report       │  │ 3. GRAPH_REPORT.md               │
│ [x] Port map           │  │ 4. only then raw source          │
└───────────────────────┘  └──────────────────────────────────┘

┌───────────────────────┐  ┌──────────────────────────────────┐
│ 3. Classification      │  │ Decision                         │
├───────────────────────┤  ├──────────────────────────────────┤
│ [ ] primitive duplicate│  │ Selected strategy:               │
│ [ ] listing pattern    │  │                                  │
│ [x] domain component   │  │   REWRITE INTO NEXT PATTERN      │
│ [ ] dead visual        │  │                                  │
└───────────────────────┘  └──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 4. Implementation Contract                                   │
├──────────────────────────────────────────────────────────────┤
│ Component: components/web/profile/profile-card.tsx           │
│ Query:     server/web/profile/queries.ts                     │
│ Schema:    server/web/profile/schema.ts                      │
│ Route:     app/(web)/profile/[slug]/page.tsx                 │
│ Boundary:  server page + client action button only           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 5. Proof Gate                                                 │
├──────────────────────────────────────────────────────────────┤
│ [ ] TypeScript                                               │
│ [ ] Lint                                                     │
│ [ ] Render proof                                             │
│ [ ] Behavior parity                                          │
│ [ ] Dirstarter compliance                                    │
│ [ ] Wiki + port map updated                                  │
└──────────────────────────────────────────────────────────────┘
