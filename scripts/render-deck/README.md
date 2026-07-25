# render-deck

Markdown outline -> one self-contained branded HTML slide deck. Standalone script, zero
imports outside `scripts/render-deck` (besides node/bun builtins and deps already in the
root `package.json`).

## Usage

```sh
bun scripts/render-deck/index.ts <outline.md> [-o out.html]
```

Defaults the output path to the input path with `.md` swapped for `.html`. Example:

```sh
bun scripts/render-deck/index.ts scripts/render-deck/fixtures/sample-outline.md -o scripts/render-deck/out/sample-outline.html
```

## Outline format

```md
---
title: "Deck title"
subtitle: "Optional subtitle"
brand: rdd            # rdd | bbl | mmb
author: "Optional author"
date: "Optional date"
---

## Slide heading

- Bullet one
- Bullet two

Notes: hidden speaker notes for this slide (rendered but not shown on screen).

## Another slide

> A blockquote alone on a slide renders as a big-statement slide.

## A third slide

A plain paragraph of body text.
```

- `title` and `brand` are required frontmatter fields; `brand` must be `rdd`, `bbl`, or
  `mmb` (see `tokens.ts` for the palette/type each maps to).
- Every `## ` heading starts a new slide; the deck always gets an implicit title slide
  first, built from the frontmatter (title/subtitle/author/date).
- Consecutive `- `/`* ` lines become a bullet list block.
- Consecutive `> ` lines become a blockquote block. If a slide's body is a *single* lone
  blockquote (nothing else), it renders as a big centered "statement" slide instead of a
  normal content slide.
- A `Notes:`-prefixed paragraph at the end of a slide becomes hidden speaker notes
  (`<aside class="notes" hidden>`) — present in the DOM, not visible on screen or print.
- Inline `**bold**`, `*italic*`, and `` `code` `` are supported in slide text; all other
  text is HTML-escaped.

## Output

One `.html` file: inline CSS (brand tokens from `tokens.ts`), 16:9 slides, arrow-key +
click navigation, a slide counter + progress bar, and a `@media print` stylesheet that
renders one slide per printed page (for browser "Print to PDF" export).

## Structure

- `index.ts` — CLI entry (`parseArgs`, `renderFile`, `main`).
- `core/parse.ts` — pure frontmatter + slide-splitting parser (no I/O).
- `templates/deck.ts` — pure HTML-string renderer (`renderDeck`, `renderInline`).
- `tokens.ts` — brand palette/type tokens for `rdd` / `bbl` / `mmb`.
- `fixtures/sample-outline.md` + `fixtures/sample-outline.html` — golden-fixture pair
  used by the render test (`sample-outline.html` is committed; regenerate it with the
  CLI usage example above if `sample-outline.md` or the renderer changes intentionally).
- `out/` — gitignored scratch dir for ad hoc renders.

## Known debt (see SESSION_0650 "Proposed ledger edits")

This duplicates the brand-token idea already prototyped in `scripts/render-doc`
(unmerged, PR #268) — deliberately, per the wave-3 lane's owned-paths isolation. Once
#268 merges, consolidate the two token sets under one G-030 module rather than
maintaining `render-deck/tokens.ts` and `render-doc`'s token file in parallel.

## Testing

```sh
bun test scripts/render-deck
```

Covers frontmatter parsing, slide-splitting edge cases (headings, bullets, blockquotes,
statement-slide detection, notes), brand-token lookup, inline-markdown/HTML escaping,
and a golden-fixture render match.
