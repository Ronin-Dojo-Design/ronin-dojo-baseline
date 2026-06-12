Full Gstack OverView

Garry Tan open sourced GStack in early 2026. He shipped 3 production services and 40+ features. Here's what GStack actually is:

**What it does**

* Splits the development workflow into named operational roles: chief executive officer, staff engineer, quality assurance lead, security officer, designer, release engineer, developer experience reviewer, site reliability engineer, technical writer
* Each role has its own context, rules, and responsibilities baked in, not vague prompts
* Covers the full cycle: plan, build, review, test, ship, reflect

**The commands that matter**

* `/office-hours` runs before any implementation. The system interrogates the idea, surfaces assumptions, challenges scope, pushes back on framing. Closer to a Y Combinator partner conversation than a code generator
* `/qa` spins up a real browser via Playwright, clicks through flows, finds broken states, generates regression tests
* `/review`, `/cso`, `/benchmark`, `/ship` add layered verification before anything gets out the door

**Why this beats prompt-only workflows**

* Most large language model-generated code fails because there's no coordination layer catching bad architecture, missing edge cases, or undocumented decisions
* GStack encodes those checkpoints into the process, so they happen automatically
* A structured workflow beats a clever prompt every time

**The browser layer**

* Agents get persistent browser state: authenticated sessions, multi-tab operations, real navigation
* Most agent tooling is blind to browser context. GStack isn't

**What it supports**

* Claude Code, Codex CLI, Cursor, Gemini, OpenClaw, multiple browser agents, persistent memory

**The actual shift**

* Andrej Karpathy said in March 2026 he hadn't typed a line of code since December. The bottleneck moved from writing code to coordinating systems
* GStack is one of the first open-source frameworks built around that reality

MIT licensed. [github repo](https://github.com/garrytan/gstack)
![[photo_image.jpg]]