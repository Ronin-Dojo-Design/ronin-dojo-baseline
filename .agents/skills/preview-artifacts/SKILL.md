---
name: preview-artifacts
description: Publish a visual review as ONE self-contained HTML Artifact — screenshot gallery, live design mock, or before/after comparison — and return the private link. Inline widgets and file attachments do NOT render in the operator's client; the published artifact is the proven operator-review channel (SESSION_0539). Use when the user says "/preview-artifacts", "publish a preview", "artifact gallery", "show me the screenshots", asks for a before/after or design-mock review, or when any lane (especially autonomous) needs operator sign-off on visual work.
---

# Preview via published Artifacts

**The law (SESSION_0539):** inline widget/image previews and file attachments render as nothing in
the operator's client. Every visual review — design mock, screenshot gallery, before/after
comparison, fallow report — ships as **one self-contained HTML page published via the Artifact
tool**, returning a private link. The 0539 design loop converged in ~6 tight iterations only after
switching to the published-artifact channel. **The operator reviews artifacts on MOBILE**
(SESSION_0540: the first artifact shipped a hardcoded 3-col grid that broke on the phone) —
design and verify at phone width FIRST.

Two proven shapes: **(a) live design mock** — inline JS/SVG rendered from a data array,
theme-aware, republish the same path to iterate; **(b) screenshot gallery** — `sips -Z` downscale
→ base64-embed PNGs as `data:` URIs → one HTML page (mobile + desktop pairs, before/after columns).

## 1. Collect the assets

- **Worktree dev server:** `preview_start` is hard-locked to the canonical checkout — it
  structurally cannot serve a `../ronin-NNNN` worktree (SESSION_0523). Run it via Bash instead:
  `cd apps/web && RESEND_API_KEY= npx next dev --turbo` (FS-0002; empty Resend key = no live
  emails), then read `localhost:3000`. Parallel worktrees collide on `.next/dev/lock` — use a
  different `PORT` per worktree.
- **Screenshots:** the Browser pane / MCP browsers work when free, but parallel sibling sessions
  profile-lock BOTH browser MCPs (SESSION_0505/0506; 0386 called the lock a recurring issue, not a
  fluke). Fallback: launch your own isolated Playwright Chromium from a throwaway `.mjs` in the
  worktree root or scratchpad — `chromium.launch()` → `page.setViewportSize()` →
  `goto(localhost:3000/…)` → check `document.scrollingElement.scrollWidth` for overflow →
  `page.screenshot()`. Capture **390px mobile first**, then desktop (~1280px).
  <!-- TODO-history: the .mjs was always an uncommitted throwaway (SESSION_0506/0508) — no
  reference script survives in the repo; the recipe above is what the sprint docs record. -->
- **SVG → PNG with no browser and no deps:** `qlmanage -t -s <px> <file.svg>` (Quick Look/WebKit —
  renders base64-embedded rasters too) + `sips` to resize; verify exact dims with `file`
  (SESSION_0505, minted under a full browser-MCP lock).
- **Keep review-grade PNGs** at `docs/sprints/_assets/SESSION_NNNN-<surface>-<viewport>.png` —
  repo convention is mobile + desktop pairs (see the 0542/0546 corpora).

## 2. Build ONE self-contained HTML page

A strict CSP blocks every external host (no CDN scripts, stylesheets, fonts, remote images, fetch).
Everything inlines.

- Downscale before embedding: `sips -Z 900 shot.png --out shot-sm.png`, then
  `base64 -i shot-sm.png` → `<img src="data:image/png;base64,…">`.
- **Theme-aware both ways:** `@media (prefers-color-scheme: dark)` as the default signal PLUS
  `:root[data-theme="dark"]` / `:root[data-theme="light"]` overrides — the viewer's theme toggle
  must win in both directions.
- **Responsive, phone-first:** relative units, flex/grid that collapses to one column,
  `img { max-width: 100% }`. No hardcoded multi-column grids (the 0540 mobile break).
- Wide content (tables, diagrams, code blocks) scrolls inside its own `overflow-x: auto`
  container — the page body never scrolls horizontally.
- Gallery skeleton: one `<figure>` + `<figcaption>` per shot naming surface, viewport, and
  before/after side; pair columns with a wrapping flex row.

## 3. Publish via the Artifact tool

- Load the `artifact-design` skill before writing the page (the tool requires it).
- Stable `<title>` and stable favicon across redeploys; pass a one-sentence `description`.
- **Iterate by republishing the SAME file path** — it redeploys to the same URL (pass a short
  `label` per version). A different path mints a NEW URL — only for a genuinely separate
  deliverable.
- Updating an artifact from an **earlier session**: pass its URL as `url` (find it with
  `action: "list"`) — without it a new conversation mints a new link.
- Artifacts start **private** — the link is safe in reports; sharing is the operator's choice.

## 4. Drop the link

- The artifact URL is the deliverable line of the final report / chat message.
- Record the URL in the SESSION file (`Verification` table or the task's "Done means" evidence).
- Design-review lanes (the 0540 pattern): "Done means" = published before/after artifact link +
  operator sign-off on the visual delta.

## Cross-references

- `docs/runbooks/component-launch-sweep-recipe.md` — live-DOM check + guarded `next dev` recipe.
- `docs/runbooks/dev-environment/dev-environment.md` — ports, parallel worktrees, `.next/dev/lock`.
- Sprint provenance: SESSION_0539 (endorsement + queued brief) · 0540 (mobile-first lesson) ·
  0505/0506 (qlmanage + browser-MCP lock) · 0523 (worktree dev-server workaround).
