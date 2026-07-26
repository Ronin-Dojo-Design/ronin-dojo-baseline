# Petey plan 0711 — brand repo separation (staged execution)

Status: **staged — awaiting operator go per phase.** No phase starts without the word.
Decision record: `docs/adr/0055-brand-repo-separation.md` (fork-don't-rewrite; five
sibling repos with full shared history; RDD-Monorepo = upstream-of-record).

Target repos (all `Ronin-Dojo-Design/`, private):

| Repo | Source of | Vercel project(s) |
|---|---|---|
| Black-Belt-Legacy | rename of `ronin-dojo-baseline` | bbl (`blackbeltlegacy.com`) |
| Baseline-Martial-Arts | fork | baseline (`baselinemartialarts.com`) |
| Mammoth-Metal-Buildings | fork | mammoth (`mammothmb.com`) |
| USA-Stickfighting | fork | (per its app) |
| Ronin-Dojo-Design-Monorepo | fork, keeps everything | rdd (`ronindojodesign.com`) |

## Phase A — prerequisites (gate: all green before any fork)

A1. **SEC-01 landed** (server-derived pricing + `amount_total` verification) — a
    pre-fork fix or it forks five ways. Done-means: fix merged to `main`, webhook smoke
    passes.
A2. Shared cleanup lanes (0711 cleanup wave) merged; working tree clean on `main`.
A3. Gates green on `main`: typecheck / oxlint / oxfmt / tests / wiki-lint.
A4. **Operator push authorization** — explicit go for the fork wave (standing
    explicit-push-authorization rule applies to every push below).

## Phase B — fork mechanics (one tiny commit-free infra step per repo)

B1. `gh repo create Ronin-Dojo-Design/<name> --private` for the four new repos
    (Baseline-Martial-Arts, Mammoth-Metal-Buildings, USA-Stickfighting,
    Ronin-Dojo-Design-Monorepo). Done-means: four empty private repos exist.
B2. Push full history into each: `git push --mirror` (or push `main` + tags explicitly
    if mirror is too broad — decide per repo at execution). Done-means: `main` HEAD sha
    identical across all five.
B3. Rename the current repo: `gh repo rename Black-Belt-Legacy` on
    `ronin-dojo-baseline`. GitHub redirects old remotes — nothing breaks immediately.
    Done-means: old remote URL still fetches via redirect.
B4. Update local remotes (canonical checkout + any live worktrees) to the new URLs.
    Done-means: `git remote -v` shows canonical → Black-Belt-Legacy.
B5. Vercel: repoint each project's git connection —
    bbl → Black-Belt-Legacy · baseline → Baseline-Martial-Arts ·
    mammoth → Mammoth-Metal-Buildings · rdd → Ronin-Dojo-Design-Monorepo.
    Done-means: a preview deploy triggers from each new repo.
B6. Per-repo secrets audit: GitHub Actions secrets + Vercel env vars copied/scoped per
    repo; no cross-brand keys (Stripe live keys, Resend domain-scoped keys, Neon URLs)
    present where they don't belong. Done-means: audit checklist per repo, zero
    cross-brand live credentials.

## Phase C — per-repo trim-to-brand (ordinary deletion commits, tiny + numbered)

Per brand repo (not RDD-Monorepo, which keeps everything):

C1. Delete other brands' `apps/*` + `clients/*` (plain `git rm` commits — never
    filter-repo). Done-means: repo builds with only its own app(s).
C2. Delete brand-specific docs/seeds belonging to other brands. Done-means: wiki-lint
    green.
C3. CI matrix prune: workflows discover/run only the surviving app(s). Done-means: one
    green CI run.
C4. Per-repo `CLAUDE.md` router, ~150 lines: subjects → homes, rules live in gates.
    Done-means: no rule text duplicated from RDD upstream, only pointers.
C5. Fresh SESSION era: move the sprints spine → `docs/sprints/_archive/<era>/`; restart
    at `SESSION_0001`. Done-means: highest-numbered SESSION file is the new era's.
C6. Fresh `docs/adr/` subset: carry only ADRs that bind this brand; the rest stay in
    RDD-Monorepo. Done-means: every carried ADR references a live surface in this repo.

## Phase D — validation (per repo)

D1. Fresh clone → install (`bun install`) → typecheck → build. Done-means: all exit 0.
D2. Deploy a Vercel preview from the new repo. Done-means: preview URL renders.
D3. One smoke per repo (auth-gated page or primary funnel page loads against its own
    DB). Done-means: smoke recorded in the repo's SESSION_0001.

## Risk table

| Risk | Mitigation |
|---|---|
| Process drift ×5 repos | RDD-Monorepo = upstream-of-record for process OS + ui-kit; per-repo CLAUDE.md is a lean router, not a fork of the rules; lean-first (carry less, drift less) |
| ui-kit divergence | keep `file:`/symlink pattern now; brand repos cherry-pick ui-kit commits from RDD (shared DAG); publish a versioned package only when earned |
| SEC findings fork ×5 | SEC-01 fixed pre-fork (Phase A1 hard gate) |
| Broken old remotes/integrations after rename | GitHub redirect covers git; B4/B5 sweep locals + Vercel; audit webhooks/Actions referencing repo name |
| Trim deletes something shared | fork-don't-rewrite means recovery = revert or cherry-pick from RDD; nothing is lost from history |

## Commit discipline

Every phase = tiny numbered commits with explicit done-means (above). One merge owner.
Each phase closes with a per-phase operator checkpoint before the next begins.
