# HOW_TO_USE_THESE_REGISTRIES_BASELINE.md

## Purpose
Explain how to use the new control docs inside the baseline repo.

### Applies to
- `REPO_TRUTH_INDEX_BASELINE.md`
- `ALIASES_AND_CANONICAL_IDS_BASELINE.md`
- `MANUAL_BOUNDARY_REGISTRY_BASELINE.md`
- `JETTY_3.0_SYSTEMS_PROFILE_BASELINE.md`
- `NEXT_SESSION_LOADING_ORDER_BASELINE.md`

---

## 1. Use order

### First
Read the **truth index** when:
- you are not sure where truth lives
- old monorepo knowledge is leaking in
- schema/auth/content/docs feel mixed together

### Second
Read the **alias ledger** when:
- brand labels are discussed
- Baseline vs TuffBuffs language appears
- package/repo naming feels confusing
- IDs and slugs need to stay stable

### Third
Read the **manual-boundary registry** when:
- something is “almost done”
- smoke proof is pending
- owner signoff or environment proof still matters
- a release gate depends on human action

### Fourth
Use the **JETTY 3.0 systems profile** when:
- creating or updating important docs
- writing new SOPs
- touching rituals, sessions, runbooks, or content-engine docs
- you need better truth/boundary visibility inside a page

### Fifth
Use the **loading order** at session start.

---

## 2. What each file solves

| File | Solves |
|---|---|
| Truth index | “What is canonical here?” |
| Alias ledger | “What is this called now, what used to it be called, and what must stay stable?” |
| Manual boundary registry | “What still needs a human / runtime proof / explicit signoff?” |
| JETTY systems profile | “How should we document important files/pages in this repo?” |
| Loading order | “What do I read first so I don’t drown in context?” |

---

## 3. Daily usage pattern

### Planning session
1. latest SESSION file
2. truth index
3. manual boundary registry
4. program plan
5. relevant lane docs
6. alias ledger if naming is involved

### Build session
1. latest SESSION file
2. program plan or lane doc
3. schema/auth/runbook as needed
4. manual boundary registry if smoke or deploy is involved

### Documentation session
1. truth index
2. JETTY systems profile
3. wiki index
4. touched page(s)
5. update backlinks and health

### Content-engine session
1. truth index
2. content-engine doc
3. current content truth lane (MDX, schema-backed atoms, or wiki knowledge)
4. task / publish flow docs
5. Iggy/video intake flow if media ops are involved

---

## 4. Minimum behavior rules

- do not let old WP/PODS assumptions override repo docs
- do not rename things casually
- do not say “done” when the manual-boundary registry still says open
- do not create important docs without JETTY 3.0-compatible structure
- do not start a session without checking the latest SESSION file

---

## 5. When not to overuse these docs
Do not open all of them every time.

Use them when they actually unblock clarity.

The point is cleaner work, not ceremonial bloat.

---

## 6. Petey close

Use these docs to reduce drift, not to create drag.

Truth first.
Names second.
Boundaries third.
Documentation with intent.

**Planned Passion Produces Purpose.**
**OSSS.**
