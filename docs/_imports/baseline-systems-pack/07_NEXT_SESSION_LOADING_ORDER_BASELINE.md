# NEXT_SESSION_LOADING_ORDER_BASELINE.md

## Purpose
Define the **new baseline repo** loading order.

This replaces old heavy context loading habits.

---

## 1. First principle

Do not load everything.

Load:
1. the active session state
2. the current lane plan
3. the specific architecture/runbook docs needed for the task
4. only then any wider references

---

## 2. Default loading order

## Tier 1 — always first
1. latest `docs/sprints/SESSION_NNNN.md`
2. `docs/architecture/program-plan.md`
3. `docs/knowledge/wiki/index.md`

### Why
This gives you:
- active state
- current roadmap
- documentation map

---

## Tier 2 — load when architecture matters
4. `docs/architecture/plan-vs-current.md`
5. relevant ADR(s)
6. `apps/web/prisma/schema.prisma` if the task touches durable data
7. `docs/architecture/auth.md` if the task touches auth, brand context, or permissions

---

## Tier 3 — control docs when needed
8. `REPO_TRUTH_INDEX_BASELINE.md`
9. `ALIASES_AND_CANONICAL_IDS_BASELINE.md`
10. `MANUAL_BOUNDARY_REGISTRY_BASELINE.md`
11. `JETTY_3.0_SYSTEMS_PROFILE_BASELINE.md`

Use these when:
- canon is fuzzy
- names are changing
- release gates matter
- documentation is being upgraded

---

## 3. Lane-specific loading

## A. Schema / backend lane
Load:
- latest SESSION file
- program plan
- plan-vs-current
- schema.prisma
- auth.md if permissions or brand scoping are relevant
- database / prisma runbooks
- manual boundary registry if proof or migration safety matters

## B. Auth / brand-context lane
Load:
- latest SESSION file
- auth.md
- ADR 0004
- program plan
- manual boundary registry
- alias ledger

## C. Ritual / protocol / documentation lane
Load:
- latest SESSION file
- wiki index
- JETTY 3.0 canonical doc
- JETTY systems profile
- relevant ritual/protocol file
- truth index if the page is doctrinal

## D. Content-engine lane
Load:
- latest SESSION file
- wiki index
- truth index
- content-engine command center doc
- current content lane docs
- Iggy/video intake flow doc
- alias ledger if brand-targeted publishing is involved

## E. Frontend/UI lane
Load:
- latest SESSION file
- program plan
- lane-specific architecture docs
- schema or API contract docs as needed
- brand/alias docs only if presentation or brand switch behavior is touched

---

## 4. What not to auto-load
Do not auto-load:
- old monorepo dashboard structures
- giant historical planning dumps
- every ADR
- every session file
- every wiki page
- every content draft

Reference is available.
Reference is not active context.

---

## 5. Session-start checklist

Before starting:
1. What is the lane?
2. What is the one task?
3. What durable data does it touch?
4. What docs define that behavior?
5. Are there open manual boundaries?
6. Are naming/migration rules relevant?

If that is clear, the loading order is clear.

---

## 6. Petey one-minute version
If you are in a hurry, load only:

1. latest SESSION file
2. `program-plan.md`
3. `wiki/index.md`

Then pick the one lane doc that matches the task.

That is the best lightweight default.

---

## 7. Petey close

Load the current state.
Load the current lane.
Load the minimum needed truth.
Then work.

**Planned Passion Produces Purpose.**
**OSSS.**
