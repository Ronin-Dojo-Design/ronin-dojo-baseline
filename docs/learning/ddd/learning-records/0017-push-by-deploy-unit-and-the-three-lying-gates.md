---
title: "Learning Record 0017 — Push by deploy unit, not all-or-nothing: partitioning a red trunk at the deploy boundary (and three ways a gate lied)"
slug: learning-record-0017
type: learning-record
status: active
created: 2026-07-20
updated: 2026-07-20
author: "Giddy + claude-session-0587"
last_agent: claude-session-0587
pairs_with:
  - docs/learning/ddd/learning-records/0009-green-isnt-verified.md
  - docs/protocols/recipes/merge-wave.md
  - docs/knowledge/wiki/sequence-skills-and-overnight-orchestration.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0017 — Push by deploy unit, not all-or-nothing: partitioning a red trunk at the deploy boundary (and three ways a gate lied)

> Giddy, to a junior dev. We ran four lanes overnight-shaped, merged them into a clean trunk, and then
> the apps/web test suite came back red. The instinct in the room was binary: "hold everything" or
> "push it, CI will sort it." Both are wrong the same way — they treat 17 commits as one indivisible
> thing. They aren't. A merged trunk has *seams*, and the seams are the deploy units. Learn to cut at
> them. And on the way there, three separate "green" signals lied to us — worth knowing each tell.

## The trap: "the trunk is red, so the trunk is stuck"

Seventeen commits ahead of origin: four lane merges (docs, scripts, clients, apps/web) plus the
governance/close docs stacked above them. The apps/web suite failed 47 tests. The reflex is to treat the
push as one yes/no — hold it all, or ship it all. But **only one of those four merges can deploy
production.** `vercel.json`'s `ignoreCommand` says BBL rebuilds only when `apps/web`/`packages`/`bun.lock`/
`package.json`/`vercel.json` changes. The docs lane, the scripts lane, and the clients lane touch **none**
of those. The prod-deploy risk — and the red suite — lived entirely in the one apps/web merge.

So the trunk wasn't stuck. It had a **partition line**: push the contiguous history prefix through the
last non-apps/web merge, hold the apps/web merge (and everything linear-stacked above it) for its own
gate. `git push origin <prefix-sha>:main` — a plain fast-forward, no rebase, no force, no history surgery.
Three lanes of finished, verified work land durably; the one risky commit waits on the thing that actually
gates it (a green suite / the unmerged fixture-ownership fix). **The unit of a push is the deploy unit, not
the session.** When a gate is red, find the smallest commit that carries the risk and cut above it — don't
hold hostages, and don't ship them.

Two corollaries we actually hit:

- **Verify the boundary, don't assume it.** Before pushing the clients lane I checked `clients/mammoth-
  build-crm/vercel.json` — it deploys on *any* change there. Whether that project is *live-linked* is a
  Vercel-dashboard fact the repo can't show, and the local CLI is account-trapped. So I tightened the cut
  one merge earlier (docs+scripts only, zero deploy possibility) and asked. When the operator confirmed
  MMB isn't linked, the clients lane pushed too. **"Configured to deploy" ≠ "will deploy"; resolve the
  unknown or cut short of it.**
- **The cosmetic wart is acceptable; the surgery to avoid it is not.** Holding the apps/web merge also
  holds the ledger-resolution + close docs stacked above it in linear history, so origin's ledgers read
  briefly stale. Rewriting the merge order to "fix" that is history surgery on merge commits for a
  self-healing cosmetic gap. Don't. The next sessions read the *local* checkout, which is complete.

## Three gates that said green and weren't (the [[learning-record-0009]] cluster, fresh coats)

1. **`$?` through a pipe is the pipe's exit, not the command's.** The gate script ran
   `bun run test 2>&1 | tail -N; echo "EXIT:$?"` — and printed `EXIT:0` while the suite exited 1 with 46
   failures. `$?` captured `tail`. We nearly recorded 46 red tests as a green gate. **Never read a gate's
   verdict through a pipe** — redirect to a file, read the real exit. (`next build` had the same masked
   exit; there we read the *content* — the route tree + Static/Dynamic legend only print on success — which
   is the honest fallback when the exit code is untrustworthy.)
2. **Your own concurrent process can poison your "clean" measurement.** I re-ran the suite to isolate
   sibling-DB contention — while the gate job's `next build` prebuild was still running `migrate deploy`
   against the *same* shared local DB. The re-run was contaminated by my own build. A "clean" DB-test
   measurement means **all** writers quiesced, your own build included. Serialize, then measure.
3. **A belief stated with confidence is still a hypothesis.** "The 47 fails are on MMB; the bun-test fix
   already landed." Both false, both checkable in seconds: the root `test` filter is `apps/*`+`packages/*`
   (clients/MMB never runs there), and `git merge-base --is-ancestor 9d845bdd main` shows the fixture-
   ownership fix is *unmerged* on `session-0551-test-infra`. **Check the belief against the repo before you
   route the diagnosis** — a wrong premise sends the whole investigation down the wrong lane.

## The keeper reflexes

- When a trunk gate is red, cut the push at the **deploy boundary** — ship the safe prefix, hold the
  risky commit. All-or-nothing is a false binary.
- **Build-green + review-PASS + proven-non-regression ≠ ship.** Hold-until-the-real-fix (here, the
  unmerged 0551 fixture-ownership work) is a legitimate, deliberate close posture — not indecision.
- Distrust any green that arrived through a pipe, a concurrent writer, or an unchecked assertion.
