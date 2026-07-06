---
title: "SESSION 0505 — real BBL PWA icons (192 / 512 / maskable) + manifest repoint"
slug: session-0505
type: session--implement
status: closed
created: 2026-07-06
updated: 2026-07-06
last_agent: claude-session-0505
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0502.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0505 — real BBL PWA icons (192 / 512 / maskable) + manifest repoint

## Date

2026-07-06

## Operator

Brian + claude-session-0505

## Goal

Generate the real Black Belt Legacy installable-PWA icons — 192px, 512px, and a
maskable variant — as brand-correct square assets (brand red `#E52421` on chrome
black `#0a0a0a`), and repoint `apps/web/app/manifest.ts` off the two placeholder
assets it currently borrows onto the new purpose-built icons. Closes the "real PWA
icons still a chip" follow-up from Epic B (task_8f36f0c6). Fully disjoint lane:
touches `public/` image assets + the manifest + one generation script only — no
schema, no shared app-logic.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0502.md` (siblings 0503/0504 in-flight
  in parallel worktrees; highest on `origin/main` is 0502).
- Carryover: Epic B shipped the mobile shell + PWA manifest (SESSION_0500/0501); the
  manifest shipped pointing at the closest *existing* square assets with an explicit
  "do NOT treat these as final" note. This session produces the real icons.

### Branch and worktree

- Branch: `session-0505-pwa-icons`
- Worktree: `/Users/brianscott/dev/ronin-0505`
- Status at bow-in: clean
- Current HEAD at bow-in: `e5dcf6af`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (Next.js `app/manifest.ts` is a native metadata route; icons are static `public/` assets) |
| Extension or replacement | Extension: swaps placeholder icon `src`s for purpose-built BBL assets; no capability replaced |
| Why justified | Manifest shipped with self-flagged placeholder icons; this fills them in |
| Risk if bypassed | Installed PWA keeps a cropped/off-brand home-screen icon |

Live docs checked during planning: not applicable (static assets + one metadata route).

### Grill outcome

Open fork surfaced before build (source `logo.svg` is a 3:1 wordmark, PWA icons must
be square 1:1) — see `## Open decisions / blockers`. Held for operator sign-off at the
script-caution gate before rasterizing.

## Petey plan

### Goal

Author a square BBL app-icon master, rasterize it to 192/512/maskable PNGs, repoint
the manifest, and verify the manifest resolves + the icons render (incl. maskable
safe-zone).

### Tasks

#### SESSION_0505_TASK_01 — Author square BBL icon master + maskable variant (SVG)

- **Agent:** Cody (inline — coherent single lane)
- **What:** Author a square (512×512) BBL icon SVG on chrome black `#0a0a0a` with the
  brand-red `#E52421` motif from the wordmark, plus a maskable variant with content
  inside the ≥80% safe zone on a full-bleed field.
- **Steps:** design decision from grill → write source SVG(s) under
  `apps/web/public/images/brands/black-belt-legacy/` → SHOW operator before rasterize.
- **Done means:** committed source SVG(s) the PNGs derive from.
- **Depends on:** operator sign-off on the design fork.

#### SESSION_0505_TASK_02 — Rasterize to PNG (192 / 512 / maskable) via approved script

- **Agent:** Cody (inline)
- **What:** Rasterize the master SVG to exact-pixel PNGs. SHOW the rasterize
  command/script to the operator BEFORE running (standing script-caution).
- **Steps:** propose command → operator approves → run → verify byte/dimension output.
- **Done means:** `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` at correct sizes.
- **Depends on:** TASK_01.

#### SESSION_0505_TASK_03 — Repoint `manifest.ts` + verify

- **Agent:** Cody build → Doug verify
- **What:** Update `apps/web/app/manifest.ts` `icons[]` to the new assets (with
  `purpose: "any"` and `purpose: "maskable"` entries); verify the manifest route
  resolves the new icons and they render; confirm maskable safe-zone.
- **Done means:** manifest serves the new icons; headless render confirms they load.
- **Depends on:** TASK_02.

### Parallelism

Sequential (01 → 02 → 03); single coherent lane, no fan-out.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0505_TASK_01 | Cody (inline) | small asset authoring |
| SESSION_0505_TASK_02 | Cody (inline) | gated script run |
| SESSION_0505_TASK_03 | Cody → Doug | build + verify manifest resolution/render |

### Open decisions

- **Icon composition** (source is a 3:1 wordmark, not square) — recommended: square
  monogram lockup echoing the red-block motif. Held for operator at the script gate.
- **Rasterizer** — no system rasterizer / `node_modules` in this fresh worktree;
  recommended: headless Chromium via the connected Playwright MCP (dependency-free,
  exact-pixel). Held for operator at the script gate.

### Risks

- Direct rasterization of the wide wordmark into a square = poor icon; mitigated by
  authoring a purpose-built square master.

### Scope guard

- Do NOT touch sibling worktrees (`../ronin-0503`, `../ronin-0504`).
- Do NOT bootstrap the whole worktree / add heavy image deps if a dependency-free
  rasterizer works.
- Do NOT change schema, app logic, or any non-icon manifest field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0505_TASK_01 | landed | Route A sources authored: `pwa-icon.svg` (any) + `pwa-icon-maskable.svg` (maskable), official `logo.png` on soft-white `#f7f7f5` tile |
| SESSION_0505_TASK_02 | landed | Rasterized to `icon-192/512.png` (any) + `icon-maskable-512.png` via native `qlmanage` (browser MCPs locked by siblings) |
| SESSION_0505_TASK_03 | landed | `manifest.ts` icons[] repointed (3 icons, any×2 + maskable); route resolves all srcs; gates green |
| SESSION_0505_TASK_04 | landed | Favicon + apple-touch parity: tab favicon = circular crest (legible at 32px); iOS/apple-touch = Route A tile @180. Fixed generic-template-favicon wiring |

## What landed

- **Real BBL PWA icons**, replacing the placeholder assets the manifest borrowed
  (the generic Dirstarter template `favicon.png` + `default-black-belt.png`):
  - `icon-192.png` (192×192, `purpose: any`)
  - `icon-512.png` (512×512, `purpose: any`)
  - `icon-maskable-512.png` (512×512, `purpose: maskable`, logo inside the ~80% safe zone)
- Derived from the **official BBL logo already in-app** (`logo.png`, the boxed
  BLACK│BELT + *Legacy* lockup) — not the placeholder `logo.svg` in the task brief.
  Operator picked **Route A** (logo untouched on a soft-white `#f7f7f5` tile) over
  a dark-tile recolor or an invented monogram.
- SVG sources committed as provenance (`pwa-icon.svg`, `pwa-icon-maskable.svg`),
  referencing `./logo.png` — edit + re-rasterize to change.
- `manifest.ts` `icons[]` + docstring updated; placeholder files left in place
  (still used elsewhere), just no longer referenced by the manifest.
- **Favicon + apple-touch parity (TASK_04, follow-up):** the browser tab was
  resolving to the generic Dirstarter template `favicon.png` (BBL
  `brandSettings.faviconUrl` is null in prodsnap → static `faviconSrc` fallback).
  Fixed by pointing `faviconSrc` at the **circular BBL crest** (`crest.png`,
  preserved from the old `app/icon.png` — reads as a badge at 16–32px where the
  logo lockup smears) and splitting `apple` in `layout.tsx` to a dedicated
  **Route A apple-touch icon** (`apple-touch-icon.png`, 180×180, matches the PWA
  install icon). Removed the now-redundant file-convention `app/icon.png`.

## Decisions resolved

- **Source = the official `logo.png`, not `logo.svg`.** The brief's `logo.svg` is a
  3:1 *placeholder* wordmark; the real official lockup was already in-app as `logo.png`
  (operator surfaced this). Icons derive from the real art.
- **Treatment = Route A (soft-white tile, logo untouched).** Keeps the black+red boxed
  motif + real *Legacy* script intact; a chrome-black tile would drop the black "BLACK"
  box, and a monogram wouldn't be the official mark.
- **Rasterizer = native `qlmanage`** (Quick Look / WebKit) on base64-embedded SVGs.
  Both browser MCPs (Playwright + chrome-devtools) were profile-locked by the parallel
  sibling sessions; `qlmanage -t -s N` gives exact-pixel PNGs with no browser/no deps.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/manifest.ts` | `icons[]` repointed to 3 real icons (any×2 + maskable); docstring note updated |
| `apps/web/public/images/brands/black-belt-legacy/icon-192.png` | new — 192 any |
| `apps/web/public/images/brands/black-belt-legacy/icon-512.png` | new — 512 any |
| `apps/web/public/images/brands/black-belt-legacy/icon-maskable-512.png` | new — 512 maskable |
| `apps/web/public/images/brands/black-belt-legacy/pwa-icon.svg` | new — any source |
| `apps/web/public/images/brands/black-belt-legacy/pwa-icon-maskable.svg` | new — maskable source |
| `apps/web/public/images/brands/black-belt-legacy/crest.png` | new — circular crest preserved as tab favicon (was only `app/icon.png`) |
| `apps/web/public/images/brands/black-belt-legacy/apple-touch-icon.png` | new — 180×180 Route A apple-touch (iOS home) |
| `apps/web/app/icon.png` | removed — redundant file-convention (crest now via metadata + `crest.png`) |
| `apps/web/config/site.ts` | `faviconSrc` → `crest.png` (tab favicon = crest) |
| `apps/web/app/layout.tsx` | split `apple` icon → dedicated Route A apple-touch @180 |
| `docs/sprints/SESSION_0505.md` | this session record |

## Verification

| Command / smoke | Result |
| --- | --- |
| `file icon-*.png` | 192×192, 512×512, 512×512 exact ✓ |
| visual render (qlmanage output) | both variants render the real logo correctly ✓ |
| maskable safe-zone | logo centered ~64%, inside the 80% circle ✓ |
| `bun run typecheck` | ✓ (`purpose` field valid in Next Manifest type) |
| `bunx oxlint app/manifest.ts` | ✓ clean |
| `bun run format:check` | ✓ 1819 files (added-files oxfmt trap avoided) |
| `manifest()` fn invoked + `existsSync` per icon | all 3 srcs resolve ✓ |

## Open decisions / blockers

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |
| `<path>` | <one-line change> |

## Verification

| Command / smoke | Result |
| --- | --- |
| `<command>` | <result> |

## Open decisions / blockers

- Both bow-in forks resolved (see Decisions resolved). None carried forward.
- Placeholder assets (`favicon.png`, `brand/bbl/default-black-belt.png`) left in
  place — no longer referenced by the manifest; may still be used elsewhere.
- Optional follow-up (not blocking): add a 180×180 `apple-touch-icon` + a real
  `favicon.ico`/`app/icon` from the same soft-white tile (Route A) if we want iOS
  add-to-home + browser-tab parity. Not part of the PWA manifest chip.

## Next session

### Goal

No pinned successor — PWA icons chip (task_8f36f0c6) is closed. Next lane per the
ledger/board scan or operator `/goal`.

### First task

Run the bow-in ledger + board scan; if nothing pinned, consider the apple-touch-icon /
favicon parity follow-up above (cheap, same Route A source).

## Review log

## Hostile close review

- **Giddy:** pass — no schema/app-logic touched; disjoint static-asset + manifest-data
  lane; SVG sources committed as provenance.
- **Doug:** pass — dims exact (192/512/512), manifest route resolves all srcs, gates
  green (typecheck/oxlint/format:check), maskable safe-zone confirmed.
- **Desi:** pass — Route A uses the official logo untouched; legible at 192px; boxed
  motif + *Legacy* script intact.
- **Kaizen aggregate:** 9.5/10 — clean, faithful, verified. −0.5: no on-device install
  smoke (headless render only) and apple-touch/favicon parity deferred.

## ADR / ubiquitous-language check

- ADR update not required (static-asset + manifest-field swap; no decision reversed).
- Ubiquitous language update not required.

## Reflections

The operator's one question — "we have a favicon already, don't we?" — flipped the
source from the placeholder `logo.svg` in the brief to the real official `logo.png`
already sitting in-app. Worth the two extra minutes of read-only monorepo discovery
before generating; had I taken the brief literally I'd have shipped an invented
monogram over the real brand mark.

The parallel-session browser lock was the surprise: both Playwright and chrome-devtools
MCP profiles were held by the sibling worktrees, so the planned headless-Chromium
rasterize failed. Native `qlmanage` (Quick Look/WebKit) + `sips` turned out to be a
clean dependency-free fallback that renders SVG (incl. base64-embedded raster) to
exact-pixel PNGs — worth remembering for any asset-gen lane that runs alongside siblings.

## Full close evidence

| Step | Proof |
| --- | --- |
| Icons rasterized | `file` → 192/512/512 exact |
| Manifest resolves | `manifest()` + `existsSync` per icon → all OK |
| Gates | typecheck ✓ · oxlint ✓ · format:check ✓ (1819 files) |
| Git hygiene | see commit below |
