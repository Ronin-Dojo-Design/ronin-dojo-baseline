---
title: PWCC ASCII Flow Component Port Pipeline
slug: pwcc-ascii-flow-component-port-pipeline
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
  - pipeline
---

+----------------------------------------------------------------+
|              PLAYWRIGHT-FIRST COMPONENT PORT PIPELINE          |
+----------------------------------------------------------------+

  OLD LOCAL SITE
      |
      v
+----------------------------+
| PLAYWRIGHT DISCOVERY       |
| open old page              |
| click through UI           |
| capture screenshots        |
| inspect visible DOM        |
| record behavior            |
+----------------------------+
      |
      v
+----------------------------------------------------------------+
| OBSERVED PRODUCT TRUTH                                         |
|                                                                |
| - layout                                                       |
| - controls                                                     |
| - states                                                       |
| - empty/loading/error behavior                                 |
| - responsive behavior                                          |
| - labels/copy                                                  |
| - click paths                                                  |
+----------------------------------------------------------------+
      |
      v
+----------------------------+
| COMPONENT PORT SPEC        |
| what it looks like         |
| what it does               |
| what data it needs         |
| what states it has         |
| what proof closes it       |
+----------------------------+
      |
      v
+----------------------------------------------------------------+
| REPO MEMORY CHECK                                              |
|                                                                |
| 1. wiki/index.md                                               |
| 2. dirstarter-component-inventory.md                           |
| 3. graphify_out/GRAPH_REPORT.md                                |
| 4. graphify-component-port-map.md                               |
+----------------------------------------------------------------+
      |
      v
+----------------------------+
| CAN WE REBUILD WITHOUT     |
| OLD SOURCE?                |
+----------------------------+
       | YES                         | NO
       v                             v
+----------------------------+   +------------------------------+
| REBUILD IN NEXT /          |   | TARGETED SOURCE INSPECTION   |
| DIRSTARTER                 |   | only inspect what is unclear |
+----------------------------+   +------------------------------+
       |                             |
       +-------------+---------------+
                     |
                     v
+----------------------------------------------------------------+
| IMPLEMENT SMALLEST SLICE                                       |
| component + route + data boundary + states                     |
+----------------------------------------------------------------+
                     |
                     v
+----------------------------------------------------------------+
| PLAYWRIGHT PROOF ON NEW PAGE                                   |
|                                                                |
| - desktop screenshot                                           |
| - mobile screenshot                                            |
| - interactions                                                 |
| - states                                                       |
| - accessibility smoke                                          |
+----------------------------------------------------------------+
                     |
                     v
+----------------------------+
| PROOF GATE PASS?           |
+----------------------------+
       | YES                         | NO
       v                             v
+----------------------------+   +------------------------------+
| UPDATE WIKI + PORT MAP     |   | HOSTILE REVIEW FINDING       |
| COMMIT / PR / NEXT         |   | fix or split follow-up       |
+----------------------------+   +------------------------------+
