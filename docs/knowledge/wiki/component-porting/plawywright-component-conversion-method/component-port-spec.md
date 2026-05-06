---
title: Component Port Spec
slug: component-port-spec
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
│ COMPONENT PORT SPEC                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Component name: ProfileBubble                                       │
│ Old URL:        http://tuffbuffs.local/members                      │
│ Old state:      visible in member grid                              │
│ Target route:   /members                                            │
│ Target file:    components/web/members/member-card.tsx              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Observed Visual Structure                                           │
├─────────────────────────────────────────────────────────────────────┤
│ - avatar / profile image                                            │
│ - name                                                              │
│ - rank badge                                                        │
│ - school / org name                                                 │
│ - martial arts tags                                                 │
│ - short bio / excerpt                                               │
│ - clickable card                                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Observed Interactions                                               │
├─────────────────────────────────────────────────────────────────────┤
│ - click card opens profile                                          │
│ - hover changes shadow / border                                     │
│ - mobile stacks image above text                                    │
│ - missing avatar shows fallback                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Rebuild Plan                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Dirstarter primitives: Card, Avatar, Badge, Link                    │
│ Strategy: rewrite with Dirstarter primitives                        │
│ Source inspection needed? no, unless old profile URL logic is hidden│
│ Proof: screenshots + click behavior + mobile layout                 │
└─────────────────────────────────────────────────────────────────────┘
