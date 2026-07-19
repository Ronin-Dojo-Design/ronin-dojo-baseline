---
title: "Fan-Out Session Recipe — parallel disjoint-lane session template"
slug: fan-out-session-recipe
type: protocol
status: active
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0578
pairs_with:
  - docs/knowledge/wiki/agent-systems-map.md
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/rituals/opening.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - planning
  - orchestration
---

# Fan-Out Session Recipe — parallel disjoint-lane sessions

> Authored SESSION_0578 (G-022 planning lane). This is the **cross-session** sibling of the
> [agent-systems-map §5b epic-lane recipe](../knowledge/wiki/agent-systems-map.md): §5b chains
> build→verify **inside one session**; this recipe fans an epic **across N parallel operator
> sessions**, each a full bow-in/bow-out citizen. It extends — never replaces — the
> [loop-of-loops](loop-of-loops-ledger-driven-sessions.md) bundling rule: each lane is still
> "3–5 coherent items on one axis"; the fan-out just runs several such lanes at once.

## When to fan out (and when NOT to)

Fan out only when ALL hold:

1. **The work decomposes into genuinely disjoint file sets** — prove it (see §3); "mostly
   separate" is sequential work, not a fan-out.
2. **Each lane is independently reviewable** — its own gates, its own Doug pass, its own close.
3. **A planning session has already run** — fan-out prompts are the *output* of a plan-first
   session (Petey + grill), never improvised at a build session's bow-in.

Otherwise: one session, §5b chain. A one-file change is a single inline Cody (CLAUDE.md rule).

## 1. The planning session produces the fan-out

The parent session (type `session--plan`) must deliver, before any child launches:

- **Lane definitions** — per lane: scope, explicit non-goals, owned ledger rows.
- **Disjointness proof** — per lane, the owned file set; show the pairwise intersection is empty.
  Shared files (ledgers, wiki index, SESSION files) are handled by rule, not ownership: see §4.
- **Merge order** — which lane lands first/last and why; name any lane that must rebase.
- **Paste-ready prompts** — one per lane, self-contained (child sessions have no parent memory),
  built from the §2 skeleton.

## 2. The prompt skeleton (fill-in-the-blanks)

Every child-session prompt carries ALL of these blocks, in order. A missing block is how child
sessions re-incur known failures.

```text
/bow-in Act as PETEY→CODY→DOUG per the plan. This is lane <N> of <M> of <epic / G-0xx>,
planned at SESSION_<parent> — do not re-plan; execute.

SESSION NUMBER: pinned to <NNNN> (FS-0030 ID-space check already run at SESSION_<parent>;
siblings <list> are LIVE — never renumber or touch their files).

WORKTREE: fresh worktree /Users/brianscott/dev/ronin-<NNNN> off latest origin/main,
branch session-<NNNN>-<slug>. Run /worktree-setup FIRST (fresh worktree = no node_modules /
.env / Prisma client; graphify reads 0 nodes there = not-built, NEVER "no matches").

SCOPE (owned files — the disjointness contract):
  <exact file/dir list this lane may create or modify>
NON-GOALS (other lanes' territory — do not touch):
  <the other lanes' file sets + anything explicitly out of scope>

LEDGER ROWS OWNED: <WL-…/G-…/FI-… list> — flip/annotate ONLY these at bow-out.
Ledger FILES are shared: additive/own-row edits only (see recipe §4).

GATES: <typecheck / lint:check / format:check / bun run test (never bare multi-file bun test) /
next build if apps/web touched / wiki-lint if docs touched / lane-specific proofs>.

PUSH POLICY: commit locally at close; HOLD at the push gate for the operator's explicit go
(explicit-push-authorization). Merge order: <this lane lands <position>; rebase rule>.

GOTCHAS (verbatim floor — extend per lane, never trim):
- Hand-authored migrations only; NEVER `prisma migrate dev` (worktrees share ONE local DB).
- ../ronin-dojo-monorepo is READ-ONLY reference.
- <domain invariants — e.g. technique-media NO-LEAK: locked ⇒ no url AND no media-id poster>.
- Sibling lanes <list> are LIVE — coordinate/flag, never clobber.
- On any limit/config/sandbox error: STOP and paste the EXACT error text verbatim.
- If something is unknown, say "I don't know" — never theorize.

BOW-OUT / LOOP STATE: full close per closing.md; record lane state (done / blocked / handed
forward) in the SESSION file's Next-session block so the parent epic's next planning read is
one file. Route findings via the finding router (closing.md §6.7).
```

## 3. The disjointness proof

For each lane, list the **owned set**: every file/dir the lane may create or modify. Then show,
pairwise, that intersections are empty. Rules:

- **Create-only files count** — two lanes creating the same new path is a collision.
- **Prove by listing, not by assertion** — the parent session greps/inspects the real tree.
- **A shared file breaks the fan-out** — either re-partition, or move the shared edit into the
  parent/merge-last lane.

## 4. Shared-by-rule files (the exception class)

Some files are structurally shared and cannot be owned: ledgers (`goals-ledger`, `wiring-ledger`,
…), the wiki index, `docs/sprints/` (each lane adds its OWN SESSION file). For these:

- **Additive/own-row edits only** — append your row, flip only rows you own, never rewrite
  neighbors.
- **Merge order absorbs conflicts** — later lanes rebase over earlier lands; ledger conflicts are
  append-append and resolve trivially IF the additive rule held.
- **Flag, don't fix, cross-lane drift** — a lane that notices another lane's file being wrong
  routes a finding; it does not edit.

## 5. Merge order

Name it in the plan: usually **lowest-risk / docs-first, schema-last** or **foundation-first,
consumers-last**. The lane that must land LAST is the one whose files depend on the others'
outputs. Every lane holds at its own push gate; the operator releases pushes in the named order.

## 6. Lane continuation — multi-session lanes live in a ledger, not in memory

A lane bigger than one session does NOT get a bigger session — it gets a **continuation plan in
a ledger** (operator directive, SESSION_0578). Mechanics:

- **The goal row is the lane's plan of record.** The lane's task sequence (done / next / queued)
  lives as children under its `G-0xx` goals-ledger row; genuinely wiring-shaped findings still
  route to their canonical ledger (WL/D/FS) per the finding router. **More than three open tasks
  wired to the ledger** is the floor for a healthy continuation — a lane whose remaining work
  lives only in chat is a lane that dies at session end.
- **Each continuation session is a full citizen:** new pinned SESSION number, fresh worktree off
  latest `origin/main` (which now includes earlier-merged lanes), same lane scope + non-goals.
  The prompt for continuation N+1 is one line: the lane prompt + "continue from the G-0xx row's
  next open child."
- **The bow-out Next-session block names the lane's next child task** — so the parent epic's
  next planning read is one SESSION file + one ledger row, never a transcript.
- **The flip/finisher task belongs to the lane's LAST session** (e.g. a beta→GA flip commits
  only when the goal row's flip-blocking children are all closed).

## Cross-references

- [agent-systems-map §5b](../knowledge/wiki/agent-systems-map.md) — the in-session build+verify
  chain each lane runs internally.
- [loop-of-loops](loop-of-loops-ledger-driven-sessions.md) — the bundling rule each lane obeys.
- [Opening](../rituals/opening.md) / [Closing](../rituals/closing.md) rituals — each lane is a
  full citizen of both.
- [petey-plan](petey-plan.md) — the parent planning session's protocol.
- FS-0030 (ledger/session ID-space uniqueness) · FS-0024 (git guard) — encoded in the skeleton.
