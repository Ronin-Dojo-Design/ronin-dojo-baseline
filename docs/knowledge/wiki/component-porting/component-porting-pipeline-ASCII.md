---
title: Component Porting Pipeline ASCII
slug: component-porting-pipeline-ascii
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
  - pipeline
  - ascii
---

+-------------------------------------------------------------+
|                 COMPONENT PORTING PIPELINE                  |
+-------------------------------------------------------------+

  OLD MONOREPO COMPONENT
          |
          v
+-------------------+
| DISCOVERY INTAKE  |
| path, props, UI,  |
| behavior, target  |
+-------------------+
          |
          v
+-------------------------------------------------------------+
| READ MEMORY BEFORE RAW GREP                                 |
|                                                             |
|  1. wiki/index.md                                           |
|  2. dirstarter-component-inventory.md                       |
|  3. graphify_out/GRAPH_REPORT.md                            |
|  4. graphify-component-port-map.md                           |
+-------------------------------------------------------------+
          |
          v
+-------------------------+
| CLASSIFY COMPONENT      |
+-------------------------+
          |
          v
+-------------------------------------------------------------+
| DECISION GATE                                               |
|                                                             |
|  duplicate primitive?  ---> replace with Dirstarter          |
|  existing Ronin fit?  ---> wrap existing component           |
|  old behavior needed? ---> rewrite into Next pattern         |
|  domain value?        ---> port carefully                    |
|  no value?            ---> archive                           |
+-------------------------------------------------------------+
          |
          v
+-------------------------------------------------------------+
| DEFINE NEXT.JS BOUNDARY                                     |
|                                                             |
|  server component?                                           |
|  client component?                                           |
|  server action?                                              |
|  query module?                                               |
|  schema module?                                              |
+-------------------------------------------------------------+
          |
          v
+-------------------------------------------------------------+
| IMPLEMENT SMALLEST SLICE                                    |
|                                                             |
|  component                                                  |
|  data query/action/schema                                   |
|  target route/page                                          |
|  proof fixture or smoke path                                |
+-------------------------------------------------------------+
          |
          v
+-------------------------------------------------------------+
| PROOF GATE                                                   |
|                                                             |
|  TypeScript passes                                           |
|  lint passes                                                 |
|  renders in target route                                     |
|  behavior parity checked                                     |
|  Dirstarter compliance recorded                              |
+-------------------------------------------------------------+
          |
          v
+-------------------------+
| SCORE >= 9.5 ?          |
+-------------------------+
      | YES                       | NO
      v                           v
+----------------------+   +-----------------------------+
| UPDATE WIKI + MAP    |   | HOSTILE REPO REVIEW FINDING |
| commit / PR / next   |   | fix or split follow-up      |
+----------------------+   +-----------------------------+
