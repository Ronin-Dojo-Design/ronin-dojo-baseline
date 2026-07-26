---
title: PWCC Mermaid Code
slug: pwcc-mermaid-code
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
  - mermaid
---

flowchart TD
    A[Old Local Site Available] --> B[Playwright Visual Discovery]

    B --> B1[Open Target Old Page]
    B --> B2[Capture Desktop Screenshot]
    B --> B3[Capture Mobile Screenshot]
    B --> B4[Capture DOM Snapshot]
    B --> B5[Record Interactions]

    B1 --> C[Behavior Inventory]
    B2 --> C
    B3 --> C
    B4 --> C
    B5 --> C

    C --> C1[Visible Layout]
    C --> C2[Clickable Controls]
    C --> C3[Form Fields]
    C --> C4[Empty / Loading / Error States]
    C --> C5[Responsive Behavior]

    C1 --> D[Write Component Port Spec]
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D

    D --> E[Check Repo Memory]
    E --> E1[Wiki Index]
    E --> E2[Dirstarter Component Inventory]
    E --> E3[Graphify Report if Present]
    E --> E4[Component Port Map]

    E1 --> F{Can We Rebuild Without Old Source?}
    E2 --> F
    E3 --> F
    E4 --> F

    F -->|Yes| G[Rebuild in Next / Dirstarter]
    F -->|No| H[Targeted Old Source Inspection Only]

    H --> I[Clarify Hidden Logic]
    I --> G

    G --> J[Implement Smallest Slice]
    J --> K[Playwright Proof Against New Page]

    K --> K1[Desktop Screenshot Match]
    K --> K2[Mobile Screenshot Match]
    K --> K3[Interaction Proof]
    K --> K4[State Proof]
    K --> K5[Accessibility / Basic QA]

    K1 --> L{Proof Gate Passes?}
    K2 --> L
    K3 --> L
    K4 --> L
    K5 --> L

    L -->|Yes| M[Update Port Map + Wiki]
    L -->|No| N[Hostile Review Finding]

    N --> O[Fix or Split Follow-up]
    O --> J

    M --> P[Commit / PR / Next Component]
