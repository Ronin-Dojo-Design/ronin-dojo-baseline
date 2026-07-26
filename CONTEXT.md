# Ronin Dojo Design — Portfolio

The RDD monorepo: **ONE kernel** (shared technical substrate + a library of brand-agnostic
feature-modules) serving a portfolio of **brands**, each owning one or more **apps** — the ratified
`kernel → brand → app` taxonomy (ADR 0051). This file is the agent-facing domain model that Matt
Pocock skills (`domain-modeling`, `wayfinder`, `grill-with-docs`) read and maintain. It is
intentionally **lean** — the full glossary is
[`docs/architecture/ubiquitous-language.md`](docs/architecture/ubiquitous-language.md); add a term
here only when its absence actively misleads an agent.

## Language

### Repos & environments

**Active monorepo**:
`ronin-dojo-baseline` (GitHub `Ronin-Dojo-Design/ronin-dojo-baseline`) — the current, active, production monorepo; `main` = prod. Local checkout dir is `ronin-dojo-app`.
_Avoid_: "ronin-dojo-app" as the canonical repo name; "black-belt-legacy" as the repo name.

**Old monorepo**:
`ronin-dojo-monorepo` — the retired, reference-only legacy monorepo. Read-only; source for component-porting and design-pattern reference. Never build/deploy/mutate.
_Avoid_: treating it as active.

**Vault repo**:
`RDD_Baseline44_Vault` (private) — the operator's canonical Obsidian vault as its own lean git repo (`~/Desktop/Baseline_Vault`), separate from the monorepo.
_Avoid_: mixing vault content and monorepo content.

### Portfolio shape (ADR 0051 — kernel → brand → app)

**Kernel**:
The ONE shared technical substrate — `packages/ui-kit` (one L1 Card, named cards, the token contract) plus the brand-agnostic feature-module library (aspirational beyond ui-kit + api-client today). The moat. Old docs called this "the platform"; that word is retired.
_Avoid_: "platform", "component library" / "design system" used loosely.

**Brand**:
The top portfolio unit — BBL · Mammoth · Baseline · WEKAF · ACD · RDD. A brand owns one or more apps.
_Avoid_: confusing the portfolio brand with the in-code `Brand` enum (a dead multi-brand-harness vestige awaiting its prune).

**App**:
THE DEPLOY UNIT — one Vercel project + one database (ADR 0038). What ADR 0034/0038 called a "product". As an app grows it may nest `suite → product → feature`; small apps stay flat (`app → features`).
_Avoid_: "product" or "site" for a deploy.

**Product**:
A feature-area *within* an app (intra-app nesting tier), never a whole deploy.
_Avoid_: the pre-0051 sense ("product" = a deploy — that is an **app**).

**Module**:
A brand-agnostic feature (leads/CRM, claims, payments, lineage graph, directory…). Belongs to the kernel, not to any one brand or app; any module can run on any app.
_Avoid_: "feature" used to mean an app-specific one-off.

**White-label instance**:
A customer deploy of Baseline's White Labeled Dojo (resold by RDD) — its own brand-skinned app (own deploy + DB). Tuff Buffs is the pilot instance, being absorbed into Baseline.
_Avoid_: treating an instance as a permanent peer brand.

**BBL** (Black Belt Legacy):
The flagship brand/app + the living verified lineage **graph** (the asset/moat). Permanent in-repo; never handed off.
_Avoid_: treating BBL as the repo name.

### Design pass

**DESIGN.md**:
The portable visual-system doc (GetDesign.MD / Google Stitch format) that the Impeccable design skill reads before a design command. Generated from the codebase, not hand-authored.
_Avoid_: confusing it with this CONTEXT.md (domain language, not visual system).

**Design pass**:
An anti-AI-slop design review run by the **Desi** agent driving a design skill (hallmark or Impeccable — both installed, called on demand). Scoped to greenfield / mockups / skins / brand surfaces, never overriding the ui-kit token contract on app surfaces (D11).
_Avoid_: "design review" used to mean a generic PR review.

### Multi-repo era (post ADR-0001 fork, SESSION_0711)

**Brand repo**:
One of the five sibling repos (Black-Belt-Legacy · Baseline-Martial-Arts · Mammoth-Metal-Buildings · USA-Stickfighting), forked with full shared history, trimmed to its brand.
_Avoid_: "monorepo" for these — only RDD-Monorepo keeps everything.

**Upstream (RDD-Monorepo)**:
Ronin-Dojo-Design-Monorepo — upstream-of-record for the kernel (ui-kit) and the process OS. Brand repos cherry-pick from it; nothing auto-syncs.
_Avoid_: pushing brand-specific work into it.

**Portfolio triage**:
The morning cockpit move on unpinned days: open RDD, run the portfolio-status command (all five repos: open PRs, CI health, top ledger items), elect the day's goal, switch to that brand repo. A command, not a session — ~5 min cap. Pinned days skip it.
_Avoid_: turning the cockpit visit into its own work session.

**Environment ladder**:
local dev → preview → production, per repo. Preview = the Vercel per-PR build URL (this IS staging — no persistent staging branch/env anywhere); production = `main`, auto-deploy. Migrations rehearse on prodsnap before merge.
_Avoid_: "staging" meaning a long-lived branch or separate deploy — ratified trunk + PR previews everywhere (SESSION_0711 grill).

**Lean ritual (per-repo)**:
The trimmed bow-in/bow-out + SESSION template v2 that travels into every brand repo with its own SESSION spine and ledgers. RDD-Monorepo holds the canonical copies; brand repos cherry-pick ritual updates.
_Avoid_: forking ritual text per repo — updates flow from upstream only.

**Weekly sync session**:
The one scheduled RDD-Monorepo session per week: batch cherry-picks out to brand repos (ui-kit, ritual, gate updates) as small sync PRs. Urgent fixes cherry-pick immediately, off-schedule.
_Avoid_: daily syncing (churn) or silent no-schedule drift.

**Session = one repo**:
A Claude session scopes to exactly one repo. Two brands in a day = two sessions. Worktrees are for fan-outs WITHIN a repo, never for hopping repos.
_Avoid_: multi-repo sessions (muddy handoffs, mixed ledgers).
