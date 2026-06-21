# Epic — post-launch-clean-repo-001 (repo health consolidation)

> Hand-off epic for cloud sessions. Self-contained (cloud sessions have no memory). Post-launch
> **repo-health consolidation**: collapse duplicated wiring into single sources of truth, document
> the flows as `files/` spec docs (consistency + catalog), and land the in-flight drafts. Each lane
> is independently grabbable; each PR keeps `bun run typecheck` + `oxlint` + touched-area tests green.

Branch family: `post-launch-clean-repo-001` (one short-lived branch per lane → squash-merge to `main`).

## Why

SESSION_0428 surfaced real consolidation debt now that BBL is live:

- **N parallel identity projections** — 6+ public surfaces each re-select + re-redact the Passport
  identity core (3 Prisma selects, 2 redactors). One canonical DTO should win.
- **Flows live only in code / chat** — no skimmable wiring charts for the new surfaces. Fix with
  lightweight `files/` spec docs (ASCII + mermaid) off a shared template.
- **Index drift** — sessions 0420–0427 never got `wiki/index.md` rows (lean cloud-PR closes).

## Lanes

### L1 — Canonical public Passport DTO migration  *(issue #134; base = PR #135)*

Make `projectPublicPassport` ([spec](../knowledge/wiki/files/public-passport-dto.md)) the single
public identity projection. One surface per PR, behavior-preserving, keeping each surface's own
policy (directory tiers, lineage tree facts) layered on top:

- [ ] directory profile + search · [ ] lineage tree row + node profile/drawer · [ ] galaxy
- [ ] disciplines / top-ranked · [ ] family tree · [ ] promotion timeline · [ ] public tournaments
- [ ] delete `redactLineageNodeRowRanks` + `redactLineageNodeProfileRanks` (one gate remains)
- [ ] **ADR**: ratify the canonical projection + the `showRanks` stance (recommend: honor uniformly) in `docs/architecture/decisions/`
- ⚠️ Re-run the **cloud Graphify parity sweep** to confirm the surface list before closing #134.

### L2 — `files/` spec + flow catalog  *(consistency + catalog)*

Every major data/wiring flow gets a lightweight `files/` spec (ASCII + mermaid) off the template.

- [x] `_template/SPEC_TEMPLATE.md` — the spec/flow file template
- [x] `public-passport-dto.md` · [x] `bbl-galaxy-data-flow.md` · [x] `feature-request-dialog.md` (pre-existing)
- [ ] author specs for: Stripe/membership lifecycle, claim/reconcile flow, directory facet/search, email lifecycle
- [ ] link each new spec from its SOP (`docs/runbooks/sops/`) or domain hub (`docs/runbooks/domain-features/`)
- [ ] consider a `files/README.md` catalog index (one row per spec)

### L3 — Land in-flight drafts

- [ ] PR #135 — public Passport DTO base · [ ] PR #133 — BBL Galaxy v1 (slices 1–2)

### L4 — BBL Galaxy slices 3+  *(spec TASK_06–10; PR #133)*

- [ ] all-public-trees galaxy (currently one tree) · [ ] search overlay · [ ] follow-lineage camera
- [ ] bloom/postprocessing polish · [ ] scroll/timeline story mode

### L5 — Index + doc hygiene

- [ ] backfill `wiki/index.md` rows for sessions 0420–0427 (or accept the gap explicitly)
- [ ] markdown G8 spacing fixes on touched docs

## Catalog — `files/` spec docs (this epic's output)

| Spec | Flow | Status |
| --- | --- | --- |
| [public-passport-dto](../knowledge/wiki/files/public-passport-dto.md) | Passport → projectPublicPassport → all public surfaces | WIP (base PR #135) |
| [bbl-galaxy-data-flow](../knowledge/wiki/files/bbl-galaxy-data-flow.md) | published tree → galaxy graph → R3F viewer + drawer | WIP (PR #133) |
| [feature-request-dialog](../knowledge/wiki/files/feature-request-dialog.md) | feedback widget → Report(Feedback) + operator notify | MVP_LIVE |

## RepoHealth findings (Giddy)

Architectural / folder / DB consolidation targets surfaced by the SESSION_0428 sweep. Each is an
independent lane; effort/risk noted. Docs-only items are low-risk quick wins.

| ID | Finding | Action | Effort | Risk |
| --- | --- | --- | --- | --- |
| RH-1 | `docs/_imports/baseline-systems-pack/` is **byte-identical** to `docs/ronin_dojo_baseline_systems_pack/` (14 files each); both are import-staging now synthesized into `docs/runbooks/sops/`. | Archive/remove the `_imports` copy; confirm the root copy is superseded by `runbooks/sops/` and archive it too. Leave one canonical lineage. | low | low (docs) |
| RH-2 | **Doc-root sprawl** — 11 `petey-plan-*.md` + `consolidation-merge-prompt.md` + `prune-roadmap.md` loose at `docs/`. | Move completed plans → `docs/_archive/petey-plans/`; keep only active plans (relink inbound refs atomically). | low | low (docs) |
| RH-3 | **`scripts/` one-offs** — 31 `apps/web/scripts/*.ts`, many executed-once imports/sends (`import-bbl-*`, `send-bbl-*`). | Move executed one-offs → `apps/web/scripts/_archive/`; keep reusable utilities. Add a 1-line header to each marking run-once vs reusable. | low | low |
| RH-4 | **Prisma schema scale** — single `schema.prisma` at **3,957 lines / 123 models / 86 enums / 56 migrations**. Hard to navigate; enum set likely has dupes/unused. | Opportunity: split to multi-file schema (`prismaSchemaFolder`) by domain (identity · lineage · directory · billing · tournaments · courses · media); audit enums for dup/unused. **Needs an ADR + generate/migrate parity proof.** | medium | medium |
| RH-5 | **N parallel public identity projections** (the parity audit). | Canonical public Passport DTO — see L1 / issue #134. | medium | low (behavior-preserving) |
| RH-6 | `files/` had **no catalog or template** — 26 specs, no index. | Added [`files/README.md`](../knowledge/wiki/files/README.md) (system diagram + catalog) + [`_template/SPEC_TEMPLATE.md`](../knowledge/wiki/files/_template/SPEC_TEMPLATE.md). ✅ this PR. | — | — |

> RH-4 is the one item that touches generated code + migrations — treat as its own ADR-gated lane,
> not a quick win. RH-1/2/3 and L5 are safe docs/scripts hygiene that cloud agents can clear fast.

## Guardrails

- **No behavior change** in L1 migrations — pure consolidation; lean on existing visibility/tier tests.
- Watch `resolveLineageVisibilityScope` (UNLISTED/RESTRICTED) — the shared projector must stay correct beyond PUBLIC-only.
- Specs are **lightweight** — the value is the `wiring:` frontmatter + the ASCII/mermaid charts, not prose.
- Each spec keeps **both** an ASCII chart (skims in any diff) and a mermaid chart (renders on GitHub).

## References

- Issue #134 (ADR + per-surface plan) · PR #135 (DTO base) · PR #133 (galaxy)
- [public Passport DTO spec](../knowledge/wiki/files/public-passport-dto.md) · [galaxy data flow spec](../knowledge/wiki/files/bbl-galaxy-data-flow.md)
- [spec template](../knowledge/wiki/files/_template/SPEC_TEMPLATE.md) · [lineage-data-wiring-flow SOP](../runbooks/sops/lineage-data-wiring-flow.md) (format precedent)
- SESSION_0428 close (parity audit provenance)
