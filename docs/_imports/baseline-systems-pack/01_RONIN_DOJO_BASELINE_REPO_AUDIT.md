# Ronin Dojo Baseline Repo Audit

## Scope
This audit answers four questions:

1. What is already built?
2. What still feels transitional?
3. How is this different from the old monorepo?
4. What is the best next sprint?

---

## 1. What is already built

### Platform spine
This repo is already a real platform foundation, not a sketch:
- `apps/web/` = Next.js web app
- `apps/mobile/` = Expo mobile app
- Postgres = shared database
- Prisma = platform schema
- Better-Auth = auth base
- MDX blog content in-repo
- docs/wiki/sessions/rituals/protocols already exist

### Data model maturity
The Prisma schema already includes the real platform nouns:
- `Passport`
- `DirectoryProfile`
- `Organization`
- `Discipline`
- `RankSystem`
- `Rank`
- `Membership`
- `Tournament`
- `TournamentDiscipline`
- `Division`
- `Registration`
- `RegistrationEntry`

It also already includes a content direction with:
- `ContentAtom`
- `ContentTask`
- content statuses / channels / variant states

### Planning maturity
The repo already has:
- `docs/architecture/program-plan.md`
- `docs/architecture/plan-vs-current.md`
- ADRs
- `docs/sprints/SESSION_000*.md`
- `docs/knowledge/wiki/index.md`
- `docs/protocols/`
- `docs/rituals/`

This means the repo is already carrying its own operational memory in-repo.

---

## 2. What still feels transitional

### Transitional smell A — Dirstarter residue is still present
The schema explicitly keeps template models such as `Tool`, `Category`, `Tag`, `Report`, and `Ad` as temporary references.
That is useful while learning, but it is still transitional, not final product truth.

### Transitional smell B — docs health is honest but not fully hardened
Several docs self-score in the 5–7 range.
That is healthy honesty, but it means the wiki is active and useful, not yet fully wired and fully polished.

### Transitional smell C — mobile auth path is not locked
The auth doc still preserves two possible mobile patterns:
- Better-Auth mobile SDK
- JWT bridge fallback

That means the mobile auth contract is not yet frozen.

### Transitional smell D — brand scoping enforcement is partly architectural, partly deferred
The docs describe application-layer checks now and a Prisma client extension for stronger brand scoping.
That extension is still a deliberate future hardening step.

### Transitional smell E — content engine is conceptually present but not yet the operating center
The schema and wiki point toward content atoms and variants, but the repo still publicly ships blog content from MDX-in-git.
So the content engine is emerging, not yet the sole editorial command center.

### Transitional smell F — Baseline is the first outward rollout, but migration doctrine still needs a hard alias map
The repo is clear that Baseline Martial Arts is the new first outward-facing training brand, while legacy TuffBuffs remains a historical/legacy lane.
That still needs a sharper alias and migration ledger to prevent naming drift.

---

## 3. How this differs from the old monorepo

## Old monorepo center of gravity
- WordPress
- Pods
- multiple near-identical brand plugins/themes/builds
- React frontends consuming WP data
- old RoninDashboard control plane

## New baseline repo center of gravity
- one repo
- one web app
- one mobile app
- one Postgres backend
- one Prisma schema
- one multi-brand data model using `brand` column
- one in-repo documentation/wiki/session system

## The practical difference
The old stack duplicated brand behavior across code paths.
The new stack keeps brand as data and presentation context, not as four separate app backends.

The old content strategy leaned toward WordPress/PODs/editorial models.
The new repo currently uses MDX for public blog content, while leaving room for a richer content-atom model later.

The old control plane lived in a heavy externalized dashboard structure.
The new control plane is lighter and repo-native:
- wiki
- sessions
- rituals
- protocols
- ADRs
- runbooks

---

## 4. Best next sprint

## Recommendation
**Best next sprint = stabilize Milestone 1 before widening into bigger systems.**

### Why
The repo plan itself says the current priority is:
- Identity + Membership Shells
- Passport bootstrap
- organization create/join
- membership shell behavior
- directory privacy and search

That is the correct next step because:
- it proves the platform spine with real user-facing flows
- it reduces architectural ambiguity before bigger rollout work
- it creates the right substrate for Baseline-first launch
- it prevents the content engine from becoming the main character too early

## Suggested sprint objective
**S2 hardening + Milestone 1 closeout**

### Sprint outcomes
1. Better-Auth + Passport bootstrap fully smoke-tested
2. `brand` host context + `activeBrandId` state clarified in working flows
3. Organization create/join flow proven
4. Membership shell creation proven
5. Directory search/privacy slice proven
6. Brand-scope authz + Prisma enforcement decisions narrowed

## What should wait
- deeper content orchestration
- broader agent automation
- large rebrand sweeps
- mobile polish
- launch-page cosmetics
- multi-brand expansion beyond what Baseline-first needs

---

## Final call
This repo is already stronger than the old stack in architecture.

What it needs now is not more surface area.

It needs:
- closure on the first working user lifecycle
- cleaner truth boundaries
- sharper naming discipline
- a thinner, repo-native control system that matches how this codebase actually works

**Planned Passion Produces Purpose.**
**OSSS.**
