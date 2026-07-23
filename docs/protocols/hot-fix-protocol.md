---
title: "Hot-Fix Protocol"
slug: hot-fix-protocol
type: protocol
status: active
created: 2026-06-20
updated: 2026-07-23
last_agent: claude-session-0624
pairs_with:
  - docs/protocols/merge-to-main.md
  - docs/protocols/recipes/merge-wave.md
  - docs/protocols/failed-steps-log.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - incident
  - deploy
---

# Hot-Fix Protocol

> Promoted from the legacy `RoninDashboard/protocols/HOT_FIX_PROTOCOL.md` (SESSION_0423).
> Leaned for this repo: the monorepo's brand build/deploy scripts (`npm run build:bbl`,
> `deploy-blackbeltlegacy.sh`), the Petey-baton prestep, the WO/QF lane terminology, and
> Local-by-Flywheel targets are all dropped. **Deploy here = push to `main` → Vercel
> builds** — there is no separate deploy step. BBL is **LIVE in production**
> (`blackbeltlegacy.com`), so this protocol is real, not a drill: the rhythm is fast, but
> the push still goes through the operator gate ([`recipes/merge-wave.md`](recipes/merge-wave.md) G4).

The rapid-response rhythm for emergency production fixes. Calm, fast, systematic — speed is
bought by skipping exploration and scope, **not** by skipping the push gate.

## Trigger

Activate ONLY for a **visible, user-blocking production bug**:

- Production (`blackbeltlegacy.com`) shows a bug a user can see, or
- Core functionality is broken / blocked, and
- It needs fixing in **hours, not days** ("this needs to happen NOW").

**NOT a hot fix** — queue these as normal session work instead:

- Feature additions
- Refactoring
- "Nice to have" polish

**No parallel hot-fixes.** Do ONE thing. If a second thing surfaces, it is a second hot
fix — finish and verify the first before starting it. (Red flags to STOP on: "while I'm in
here…", "this is related…", "I wonder if this other thing…".)

## The rhythm (tight time-boxes)

### Phase 1 — Assess (~30s)

Trust the operator's report. No exploration, no deep reading. Confirm understanding in one
line: "Got it — here's the one thing I'll change."

### Phase 2 — Locate (1–2 min)

Targeted `grep`/Graphify for the file. Read ONLY the section that changes. Verify you're
editing the component that is **actually rendering** (the classic monorepo miss: timer fix
in the wrong file).

### Phase 3 — Fix (2–5 min)

Make the minimal change. Solve the bug, nothing more.

### Phase 4 — Build / local verify (1–3 min)

- Local run: `cd apps/web && npx next dev --turbo` (FS-0002 — **not** `bun dev` /
  `pnpm dev`). Confirm the fix in the browser.
- **New server-action / route module?** Run a local `next build` first — a `"use server"`
  object-export bug surfaces **only** at build, not under `tsc` / `bun test`
  ([[next-build-catches-use-server]]). Move non-function exports to a `*-errors.ts` sibling.

### Phase 5 — Commit (G2)

Run the **FS-0024 git guard** before any mutating git (confirm `pwd` is
`/Users/brianscott/dev/ronin-dojo-app` and `git remote` is `ronin-dojo-baseline`, never the
read-only template cwd). Then:

```bash
git add -p && git commit -m "hotfix: <what was fixed>"
```

**Commit convention:** `hotfix: <brief description>` — one fix, one commit. Examples:
`hotfix: countdown timer targeting wrong date`, `hotfix: remove broken instructor from carousel`.

### Phase 6 — Deploy = push to `main` (G4 — operator gate)

A hot fix is **fast within the gate, not past it.** Get the operator's explicit go for the
push (per-action push authorization, [[explicit-push-authorization]] / `recipes/merge-wave.md`
G4), then:

```bash
git push -u origin HEAD                                  # your fix branch — never `main` (ADR 0053)
gh pr create --fill && gh pr merge --squash --delete-branch
```

**`main` is PR-only (ADR 0053).** `git push origin main` now fails — server-side ruleset `main-pr-only`
plus the local pre-push hook. For a hot fix this costs one extra command and still deploys on merge.

**True break-glass** (the remote is down on review, or the PR path itself is broken — *not* "the PR is
slow"): disable the ruleset, push, re-enable. Explicit and auditable by design:

```bash
RS=$(gh api repos/Ronin-Dojo-Design/ronin-dojo-baseline/rulesets --jq '.[]|select(.name=="main-pr-only").id')
gh api -X PUT repos/Ronin-Dojo-Design/ronin-dojo-baseline/rulesets/$RS -f enforcement=disabled
RONIN_ALLOW_MAIN_PUSH=1 git push origin main             # the env var alone does NOT bypass the server
gh api -X PUT repos/Ronin-Dojo-Design/ronin-dojo-baseline/rulesets/$RS -f enforcement=active   # ALWAYS re-enable
```

Re-enabling is not optional — leaving it disabled silently restores the FS-0039 exposure. Verify with
`bash scripts/githooks/doctor.sh`, which fails if the ruleset is not active.

There is no separate deploy step — **Vercel builds on push**. Note `vercel.json`'s
`ignoreCommand` only triggers a **prod build** when `apps/web` / `pnpm-lock.yaml` /
`package.json` / `vercel.json` change. A hot fix touching app code under `apps/web` will
deploy; a docs-only "fix" will not (and isn't a hot fix anyway).

### Phase 7 — Verify (operator)

Hard refresh (Cmd+Shift+R) on the Vercel deploy. Confirmed fixed → done. Not fixed →
loop back to Phase 1.

## After the fix

- If the failure traces to a recurring **pattern** (an SOP miss, a build-only trap, a
  wrong-file edit), append a one-line entry to [`failed-steps-log.md`](failed-steps-log.md)
  so the next hot fix is faster.
- A genuinely unclean close (broke prod further, partial deploy) is an **incident**, not a
  failed step — route it accordingly at bow-out.

## Mindset

> Move fast, but don't rush. Every step has a purpose. You don't strategize mid-combination
> — you execute — then breathe and reset.

## Cross-references

- [Recipe — Merge Wave](recipes/merge-wave.md) — the G4 push gate this protocol trades speed *within*.
- [Merge to Main](merge-to-main.md) — the normal (non-emergency) landing mechanics.
- [Failed Steps Log](failed-steps-log.md) — where a pattern-traced hot fix gets recorded.
