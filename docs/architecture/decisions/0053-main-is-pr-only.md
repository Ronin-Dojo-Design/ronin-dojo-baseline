---
title: "ADR 0053 — Nothing lands on `main` except through a PR"
slug: adr-0053-main-is-pr-only
type: adr
status: accepted
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0624
pairs_with:
  - docs/protocols/failed-steps-log.md
  - docs/rituals/closing.md
  - scripts/githooks/pre-push
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0053 — Nothing lands on `main` except through a PR

## Status

**Accepted** — SESSION_0624. Ruleset `main-pr-only` created and active.

## Context

Git worktrees **share one ref store.** `refs/heads/main` is therefore the *same ref* in the canonical
checkout and in every `../ronin-NNNN` lane worktree. A lane cannot *check out* `main`, but `main` still
**resolves** there — so `git push origin main` from a lane pushes whatever the shared ref points at, which
is routinely another session's not-yet-pushed work.

That happened at SESSION_0624 (FS-0039): a sibling lane published this session's unpushed close commit to
trunk. Nothing was lost, but note the ceiling — the sibling published **another lane's work-in-progress to
trunk without review**, and had it been an app-code commit it would have triggered a BBL production deploy.

The existing worktree-isolation rules do not cover this. They govern the **working tree**; this is the
**ref store**. A lane can be perfectly isolated and still do it.

The first corrective (FS-0039, PR #258) was a `pre-push` hook. Testing it revealed it did not work
(FS-0040): `install.sh` wrote a *relative* `core.hooksPath`, so the hook was **absent** from any worktree
whose branch predated it — and git skips a missing hooksPath silently. Its only `main` rule blocked
non-fast-forward pushes, so a plain `git push origin HEAD:main` went straight through.

That is the fourth consecutive guard in this repo to pass silently while broken (FS-0035 → 0036 → 0037 →
0040). The pattern is the decision driver: **every local control shares three failure modes** — it isn't
installed, it isn't on this branch, or the caller holds the operator's own credential (every agent does).

## Decision

**Nothing reaches `main` except through a pull request**, enforced by a GitHub ruleset — not by a hook,
a shell guard, or a documented rule.

Ruleset `main-pr-only` on the default branch:

- `pull_request` with **`required_approving_review_count: 0`**
- `non_fast_forward` (no force-push) · `deletion` (no branch delete)
- **`bypass_actors: []`** — empty
- **no `required_status_checks`**

Three parameters are load-bearing and each is a trap if set the obvious way:

- **0 approvals.** This is a solo seat and GitHub forbids approving your own PR. Any value ≥ 1 makes `main`
  permanently unmergeable.
- **Empty bypass list.** Agents authenticate with the operator's credential, so an "admins may bypass"
  exemption exempts every agent and the control becomes decorative. It binds the operator too — that is the
  point, and it is one `gh api` call to toggle for a genuine emergency, which makes break-glass an explicit
  auditable act instead of a silent accident.
- **No required checks.** `ci.yml` and `playwright.yml` apply `paths-ignore` to `pull_request` as well as
  `push`, so a docs-only PR never *reports* a `ci` status. A required check that never arrives blocks the PR
  forever. Require the PR, not the checks — the problem being solved is unreviewed publication, not red CI,
  and `closing.md` §4a already gates the build locally.

The local `pre-push` hook is retained, demoted to **fast local failure**: it fails in ~200ms naming the
right next command rather than after a network round-trip. It is not the enforcement.

`scripts/githooks/doctor.sh` exists so a session can make all layers **prove** they are live, from a lane
worktree, and fails loudly otherwise.

## Alternatives rejected

- **Hook only.** Defeated by all three local failure modes above — demonstrated, not hypothesized: the
  FS-0039 hook was live-but-absent for an entire merge window.
- **A docs/code split** (docs push direct, app-code via PR). Needs a classifier that fires *at push time* —
  one more rule that must run from a read-path, which is the exact shape of FS-0035/0036/0037/0040. It also
  misclassifies precisely when it matters: mixed docs+code commits are common here, and the severity ceiling
  is an app-code commit reaching a paid deploy. One rule with no exceptions beats two rules with a
  classifier.
- **`git config push.default`.** Zero effect: it governs bare `git push`. The accident is
  `git push origin main`, fully explicit. (Bare `git push` was already safe.)
- **Classic branch protection.** Equivalent effect, coarser bypass control, superseded by rulesets.

## Consequences

- **Bow-out gains two commands:** `git push -u origin HEAD` → `gh pr create --fill` →
  `gh pr merge --squash --delete-branch`. Still gated on explicit operator authorization.
- **The cost model is unchanged.** Because `paths-ignore` covers `pull_request`, a docs-only PR fires
  exactly as much CI as a docs-only push: none. The "docs-only push is free" property in `closing.md` §4a
  survives intact. An app-code PR fires the matrix — but so did the push, and now it fires *before* trunk
  rather than after, so a red matrix no longer means a red trunk plus a burned prod deploy.
- **This is an amendment to trunk-based flow, not a reversal.** `main` stays the single trunk; branches stay
  short-lived; one push per session at close. Only the last 30 seconds of bow-out changes. In practice the
  lanes already worked this way — PRs #255/#256/#257/#258 all merged via `gh pr merge`. The only path still
  pushing `main` directly was the canonical close. This formalizes the majority behavior.
- **Canonical should stop committing to local `main`.** With `main` a pure fetch-only mirror there is no
  unpushed work on the shared ref to leak — the accident becomes `Everything up-to-date`. This removes the
  *fuel*, where the ruleset removes the *outcome*.
- **Break-glass** is documented in `hot-fix-protocol.md`: disable the ruleset via
  `gh api -X PUT .../rulesets/<id>` (`enforcement: "disabled"`), push, re-enable. ~20 seconds, explicit,
  and it leaves an audit trail. The hook's env-var override does **not** bypass the server rule.

## Verification

Offline sandbox reproducing the original accident: `git push origin main`, `git push origin HEAD:main`, and
`git push --all` all blocked with `main` provably unmoved; `git push -u origin HEAD` succeeds. `doctor.sh`
exits 1 against the pre-fix config and 0 after, including from a worktree with no hooks directory. Server
side: `gh api repos/Ronin-Dojo-Design/ronin-dojo-baseline/rules/branches/main` reports `pull_request`
(0 approvals), `non_fast_forward`, `deletion`, and no required status checks.
