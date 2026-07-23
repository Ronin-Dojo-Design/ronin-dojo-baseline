---
title: "Research-Review — Wiring /ggr into bow-out + code↔doc annotation so docs stop collecting dust"
slug: research-review-ggr-wiring-and-code-doc-annotation
type: research-review
status: active
created: 2026-07-22
created_at: 2026-07-22T00:00Z
updated: 2026-07-22
author: "Claude (Opus 4.8) — /rr research lane"
last_agent: claude-research-agent-0621
session: SESSION_0621
operator: Brian
decision: "pending operator sign-off"
pairs_with:
  - docs/rituals/closing.md
  - docs/rituals/opening.md
  - docs/protocols/jetty-annotation-standard.md
  - docs/knowledge/wiki/wiring-ledger.md
  - .claude/skills/ggr/SKILL.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Research-Review — /ggr bow-out wiring + code↔doc annotation

> Read-only `/rr`: research first, recommend, do **not** build. Two design questions from the
> SESSION_0619 "built-but-not-wired" sweep (WL-P2-73 / WL-P2-74). The operator reads for the
> recommendation — the survey is compressed.

## TL;DR

- **Thread A (`/ggr` wiring):** `/ggr` should **occupy `closing.md` §6.5** and **wrap** (not duplicate)
  `hostile-close-review` — Giddy's gate already declares the hostile-close caps as its Build-lane rubric
  (`.claude/skills/ggr/SKILL.md:35-36`), so §6.5's job is to invoke `/ggr` and let it *consume* the review.
  Add the executed step to the `bow-out` skill body (mirror the FS-0037 three-questions precedent), point
  `opening.md` step 4 at `/pp`·`/ppp`, and add a **detect-only** `bow-out-gates.sh` gate that a code-touching
  session recorded a `/ggr` composite in `## Review log` (mirror Gate 12c). Reuse-first, ~all docs-only.
- **Thread B (code↔doc):** primary = **(a)+(c) fused** — add ONE `@doc <files/slug>` tag to the JETTY
  vocab, and make it **generated/verified** by a `deferral-guard.ts`-style lint that derives the pointer
  from each `files/` doc's canonical code path, so it can't drift. Reject a second frontmatter system (b);
  reject wholesale doc→code migration (d) — keep the `files/` doc (the mermaid/ASCII wiring charts are its
  value) and just backlink to it. "Route with no nav link" is **not** worth its own lint — fold the real
  invariant (the panel-import convention) into the WL-P2-73 orphan-detector instead.

---

## THREAD A — Wire `/ggr` into bow-out

### Problem

`/ggr` (ADR 0052 D4/D5/D6 — the universal QAR closing gate: rubric flexes by lane, ≥9.0 clears · 7.0–8.9
auto-loops ≤2 Giddy passes then operator gate · hard caps always loop) is wired **nowhere**. The gate is
built but the ritual never invokes it, so the ADR-0052 gate policy has never fired in a real close. This is
the ritual itself being built-not-wired (WL-P2-74).

### Findings (cited)

1. **`/ggr` self-declares it is unwired.** `.claude/skills/ggr/SKILL.md:63-64`: *"The bow-out wiring in
   `closing.md` is G-031 slice S5; until then, invoke `/ggr` explicitly at close."* Nothing invokes it.
2. **`closing.md` §6.5 still runs the old review.** `docs/rituals/closing.md:332`: *"Run the Giddy + Doug
   Hostile Close Review"* — the ADR-0052 gate is absent from the executed close path.
3. **`/ggr` already reuses hostile-close-review** — it does not compete with it.
   `.claude/skills/ggr/SKILL.md:35-36`: *"for a session close also apply the `hostile-close-review` caps +
   the 100/1k/10k confidence triad — the caps are shared."* So `/ggr` is the *gate*; hostile-close-review is
   its *scoring how* for the Build lane. Wiring `/ggr` in and leaving a second parallel §6.5 hostile-close
   invocation would double-run the same review.
4. **The FS-0037 precedent for "wire it into the executed skill body, not prose."**
   `.claude/skills/bow-out/SKILL.md:19-23` carries the three-questions `AskUserQuestion` *in the skill body*
   precisely because the `closing.md` §6d prose alone got skipped the next session (FS-0037). The `/ggr`
   invocation must land the same way — in the skill body, not only in `closing.md`.
5. **`bow-out-gates.sh` Gate 12 only *prints* the trigger.** `scripts/bow-out-gates.sh:250-282` emits
   `HOSTILE REVIEW REQUIRED — touched: <layers>` but nothing verifies a review ran or a score was recorded.
   Gate 12c (`scripts/bow-out-gates.sh:306-337`) is the exact detect-only pattern to mirror: it reads a
   SESSION-file row, decides required-vs-n/a, prints `REQUIRED`/`PASS`, and never blocks (script exits 0).
6. **`opening.md` step 4 never points at the plan skills.** `docs/rituals/opening.md:253` says *"dispatch
   `petey` … to plan"* generically; `/pp`·`/ppp` (built SESSION_0618, ADR 0052 S2) are never named — so the
   plan step doesn't route to the skill that exists (`.claude/skills/pp/SKILL.md`, `.claude/skills/ppp/SKILL.md`).
7. **The gap is already ledgered** at `docs/knowledge/wiki/wiring-ledger.md:157` (WL-P2-74 a/b/c) — this `/rr`
   is its named next step. Nothing new to open; this doc *fills* that row.

### Options (Thread A, per sub-question)

**A.1 — does `/ggr` absorb/replace §6.5, or wrap hostile-close-review?**

| Option | Trade-off |
| --- | --- |
| **Wrap ⭐** — §6.5 invokes `/ggr`; `/ggr` internally applies the hostile-close-review caps as its Build rubric | DRY: ONE review runs. Matches `ggr/SKILL.md:35-36` (caps already shared). §6.5 shrinks to "run `/ggr`". |
| Absorb/replace — delete the hostile-close-review call, inline its questions into `/ggr` | Loses the standalone protocol doc other agents (Copilot/Codex) trigger by name; more churn; no DRY win over "wrap". |
| Keep both (status quo + add `/ggr`) | Double-runs the same review; the exact duplication `closing.md:391` warns against. Reject. |

**A.2 — the executed path (`bow-out` skill body).** No real alternative: the FS-0037 lesson is binding —
put the `/ggr` step in `.claude/skills/bow-out/SKILL.md` body (not only `closing.md`), or it gets skipped.

**A.3 — a `bow-out-gates.sh` `/ggr`-score check?** **Yes.** Deterministic evidence that the gate fired,
symmetric to Gate 12c's evidence-artifact enforcement. Detect-only (never blocks), scoped to code-touching
sessions (`APP_TOUCHED=1` or non-empty `$HOSTILE_LAYERS`). Exact shape:

```bash
# ── Gate 12d — /ggr score recorded (detect-only; ADR 0052 D6 / closing.md §6.5) ──
# A code-touching session must record a /ggr composite in `## Review log`. Mirror of 12c: detect-only,
# surfaced in the remainder checklist, never blocks (script still exits 0).
section "Gate 12d — /ggr gate score"
if [ -n "$SESSION_FILE" ] && { [ "$APP_TOUCHED" -eq 1 ] || [ -n "$HOSTILE_LAYERS" ]; }; then
  # Look for a composite/score line in the Review-log region (e.g. "composite 9.2/10", "/ggr … 8.7").
  if awk '/^## Review log/{f=1} /^## /{if(f&&!/Review log/)f=0} f' "$SESSION_FILE" \
       | grep -qiE '(composite|/ggr|giddy gate)[^0-9]*[0-9]+(\.[0-9])?\s*/?\s*10'; then
    echo "PASS: /ggr composite recorded in ## Review log."
    EV_GGR="PASS (composite present)"
  else
    echo "REQUIRED: code-touching session, but no /ggr composite found in ## Review log (closing.md §6.5)."
    EV_GGR="REQUIRED — no composite in ## Review log"
  fi
else
  echo "n/a — docs-only session (no /ggr score required)."
  EV_GGR="n/a (docs-only)"
fi
```

Add `EV_GGR` to the "Full close evidence (pre-filled)" table and a `REQUIRED*)` branch to the remainder
checklist, exactly as `EV_ARTIFACT_STATE` is handled at `scripts/bow-out-gates.sh:376,388-391`.

**A.4 — `opening.md` step 4 → `/pp`·`/ppp`.** One-line edit. Change the step-4 first bullet
(`opening.md:253`) from the generic *"dispatch `petey` … to plan"* to point at the skills, e.g.:

> **Unclear / multi-part / open decisions →** run **`/pp`** (plan only) or **`/ppp`** (plan + paste-ready
> baton) — the `petey-plan` entrypoints (ADR 0052 D1) — to grill the open forks and emit the plan block,
> then dispatch `cody` (build) → `/ggr` (verify).

### Recommendation — Thread A

1. **`closing.md` §6.5: `/ggr` occupies the step and *wraps* hostile-close-review.** Replace the "Run the
   Giddy + Doug Hostile Close Review" instruction with "Run **`/ggr`** (the universal QAR gate; for a Build
   lane it applies the `hostile-close-review` caps + 100/1k/10k triad as its rubric — one review, not two)."
   Keep the `hostile-close-review.md` protocol doc as the referenced *how*; `/ggr` is the *invocation*.
2. **`bow-out` skill body carries the executed `/ggr` step** (FS-0037 pattern) so it can't be prose-skipped.
3. **Add `bow-out-gates.sh` Gate 12d** (shape above) — detect-only, code-session-scoped, mirrors 12c.
4. **`opening.md` step 4 one-liner** points the plan step at `/pp`·`/ppp`.

All four are docs/skill/script edits — **no new machinery**; each reuses an existing seam (§6.5 slot, the
skill-body precedent, the Gate 12c template, the step-4 bullet). This is G-031 S5's exact scope.

---

## THREAD B — Code↔doc annotation (docs stop "collecting dust")

### Problem

The 29 `docs/knowledge/wiki/files/*.md` per-file spec docs each know their code file, but the **code files
don't point back**. An agent editing `apps/web/components/app/state-of-dojo/state-panel.tsx` has no visible
signal that a doc (or that it *should* have one) exists — it must be *told*, defeating the read-path
doctrine (LR 0007 "built-not-pointed": the pointer must live where the editor already is). JETTY is defined
but thinly applied, and has no reverse `@doc` pointer or `@last_agent` provenance.

### Findings (cited)

1. **JETTY has no reverse pointer.** `docs/protocols/jetty-annotation-standard.md:56-62` defines
   `@added`/`@why`/`@wired` only; `@wired` names *consumers* (a forward pointer). There is no `@doc`
   (code→spec) tag and no `@last_agent` provenance tag in the standard.
2. **JETTY is applied to ~5% of code and `@doc` is greenfield.** Repo counts (grep, `apps/web`): **84**
   files carry `@added`, **38** carry `@wired`, **0** carry `@doc`, out of **1628** ts/tsx files in
   `components`+`server`+`app`. So the vocab exists but coverage is sparse and the reverse pointer is
   entirely unbuilt.
3. **The State-of-Dojo trio carries a descriptive docblock but ZERO JETTY.**
   `apps/web/components/app/state-of-dojo/state-panel.tsx:1-8`,
   `apps/web/components/app/state-of-dojo/_kernel/phase.ts:1-8`,
   `apps/web/app/app/state/page.tsx:12-15` each have a prose JSDoc header but no `@added`/`@why`/`@wired`,
   no `@doc`, no `@last_agent` (grep of the whole subtree returned no JETTY tags). And there is **no**
   `files/*.md` spec for `state-panel` at all (`ls files/ | grep -i state` → none).
4. **`title:` is NOT a reliable machine code-path** — the crux for option (c). For per-file specs the
   `title:` is a *partial* path (`docs/knowledge/wiki/files/directory-page.md:2` → `"directory/page.tsx"`),
   the *full* path lives in the body `**Path:**` line (`directory-page.md:32` →
   `apps/web/app/(web)/directory/page.tsx`), and `wiring:` lists *consumers*, not the subject
   (`directory-page.md:18-27`). Concept docs (`m-card-pattern.md`, `three-level-magnetic-drawer.md`) have a
   descriptive title and no single code path. `SPEC_TEMPLATE.md:2` placeholder is `<path/to/file-or-feature>`.
   ⇒ A generator cannot key off `title:` alone; it needs a canonical `code_path:` field (or to parse `**Path:**`).
5. **The reuse seams already exist.** `scripts/deferral-guard.ts` is a scan-lines → cross-check-a-registry →
   `exit 1` lint that already gates the close — the exact template for a code↔doc guard. `bow-out-gates.sh`
   is the deterministic gate host. `closing.md:99-108` §3/§3a (the JETTY sweep on touched files) is the
   existing per-session sync hook — a `@doc`/`@last_agent` refresh folds into it at zero new ceremony.
6. **`/app/state` mount points + nav.** Exactly two mounts: the route `apps/web/app/app/state/page.tsx` and
   `apps/web/app/app/_landing/attention-panels.tsx:32` (`<StatePanel compact />`). No nav link exists — grep
   for `/app/state` hrefs across `app`/`components`/`lib` returned only code-comment references, no
   navigation entry. Confirmed "route with no nav link."

### Options (Thread B, with trade-offs)

| # | Approach | DRY / token cost | Drift risk | Verdict |
| --- | --- | --- | --- | --- |
| **(a)** `@doc <files/slug>` + `@last_agent` JETTY tags | Tiny — one line each, extends a vocab that exists | High **if hand-maintained** | Keep the tag; pair with (c) to kill drift |
| **(b)** New YAML/comment frontmatter block atop code files | A *second* metadata system beside JETTY — violates "one foundation" | Same drift, twice the surface | **Reject** — JETTY already is the block |
| **(c)** Generator/lint derives `@doc` from the `files/` doc's code path, inserts/verifies a one-liner | Near-zero recurring — the script maintains it | **Near-zero** — derived, `--check` gate catches drift | **Primary mechanism** (needs finding #4's `code_path:` fix) |
| **(d)** Migrate `files/` content *into* code as JETTY; drop the doc | Large one-time; loses the mermaid+ASCII wiring charts the doc exists for (`files/README.md:27-31`) | Low after migration, but throws away the artifact's value | **Reject wholesale**; keep doc, backlink to it |

**On "route with no nav link" as its own built-not-wired class + lint:** it is a *real* subclass, but a
blanket "every route needs a nav link" check would be **high-noise / low-signal** — the State-of-Dojo,
Cookbook, and Catalog surfaces are *deliberately* dev/ops routes mounted on the `/app` landing strip and
intentionally kept out of member nav (`attention-panels.tsx:7-26`). The invariant that actually matters is
the **panel-import convention** (every `state-of-dojo/*-panel.tsx` is imported by `attention-panels.tsx`),
which is exactly WL-P2-73's orphan-detector. Recommend folding a reachability note into that detector, **not**
a standalone nav lint that would false-positive on every intentional dev route.

### Recommendation — Thread B

**Primary: (a) + (c), fused.** Add ONE `@doc` tag to the JETTY vocabulary, and make it **machine-generated
and verified** so it can't rot:

1. **Extend JETTY** (`jetty-annotation-standard.md`) with `@doc <files/slug>` (code→spec back-pointer) and an
   optional `@last_agent <id>` provenance line. Scope `@last_agent` to *spec'd / Class-A* files only — not all
   1628 — to respect the token/noise budget (the operator's standing "don't add machinery that costs more than
   it saves").
2. **Make the pointer derived, not hand-typed.** Add a canonical `code_path:` frontmatter field to
   `SPEC_TEMPLATE.md` + the per-file specs (finding #4 — `title:` can't be the key). Build
   `scripts/doc-backlink-guard.ts` as a `deferral-guard.ts` clone: for every `files/` doc with a `code_path:`,
   assert the target code file carries a matching `@doc <slug>` one-liner; `--fix` inserts it, `--check`
   (bow-out gate) fails on drift. The doc's `code_path:` is the single source; the code `@doc` line is a
   generated projection of it — no two-writer drift.
3. **Sync via the existing close hook.** The `closing.md` §3a JETTY sweep already updates `last_agent`/`updated`
   on touched *docs*; extend it (and the new guard) to refresh the `@doc`/`@last_agent` line on touched *code*.
   No new ritual step — one clause added to a sweep that already runs.
4. **Keep the `files/` docs (reject (d)).** The mermaid + ASCII wiring charts are the artifact's value; the
   code just needs the one-line pointer *to* them. Where a spec is genuinely thin, the code docblock can hold
   the `@why` inline and `@doc` can point at a flow-level spec — but don't bulk-migrate.

### Slice plan (G-031 S5 / a new "annotation" lane)

**Thread A slices**

| Slice | Work | Size |
| --- | --- | --- |
| **A1** | `closing.md` §6.5: `/ggr` occupies the step, wraps hostile-close-review (DRY, one review) | **S** (docs) |
| **A2** | `.claude/skills/bow-out/SKILL.md` body: executed `/ggr` step (FS-0037 pattern) | **S** (skill) |
| **A3** | `opening.md` step 4 one-liner → `/pp`·`/ppp` | **S** (docs) |
| **A4** | `bow-out-gates.sh` Gate 12d: detect-only `/ggr`-composite check (mirror 12c) + evidence cell | **M** (script) |

**Thread B slices**

| Slice | Work | Size |
| --- | --- | --- |
| **B1** | Extend `jetty-annotation-standard.md`: define `@doc <files/slug>` + optional `@last_agent` | **S** (docs) |
| **B2** | Add `code_path:` field to `SPEC_TEMPLATE.md` + backfill the ~20 per-file specs (concept docs exempt) | **M** (docs) |
| **B3** | Build `scripts/doc-backlink-guard.ts` (deferral-guard clone; `--fix`/`--check`); wire as a detect-only bow-out gate | **M** (script) |
| **B4** | Pilot: author/point the State-of-Dojo trio's `@doc` (+ the missing `state-panel` spec or a backlink to its docblock) — prove the loop on the files that carried none | **S** (mixed) |
| **B5** | Fold the panel-import orphan check (WL-P2-73) into `doc-backlink-guard` (or a sibling): every `state-of-dojo/*-panel.tsx` is imported by `attention-panels.tsx` | **S** (script) |

Sequence within a lane: **B1 → B2 → B3 → B4** (each rung proven before the next, per the abstraction-ladder
rule), and **A1–A3 (docs) can batch as one free docs push**; **A4 + B3 + B5 (scripts)** batch as the app/tooling
push.

### Recommended next slices (crisp)

- **A1 + A2 + A3** — wire `/ggr` into `closing.md` §6.5 (wrap, don't duplicate) + the `bow-out` skill body,
  and point `opening.md` step 4 at `/pp`·`/ppp`. One docs-only push; closes WL-P2-74 a/b. **Do first** — it
  makes the ADR-0052 gate actually fire.
- **A4** — `bow-out-gates.sh` Gate 12d (detect-only `/ggr`-score check). Closes WL-P2-74 c.
- **B1 + B2** — add `@doc`/`@last_agent` to JETTY and a canonical `code_path:` field to the spec template +
  the ~20 per-file specs. Unblocks the generator; no code touched yet.
- **B3** — build `scripts/doc-backlink-guard.ts` (deferral-guard clone) and wire it as a detect-only bow-out
  gate; this is the anti-drift engine that makes `@doc` maintainable.
- **B4** — pilot the whole loop on the State-of-Dojo trio (the files that started this).
- **B5** — fold the panel-import orphan check into the guard (the real invariant behind WL-P2-73), instead of
  a noisy standalone "route needs a nav link" lint.
