# Client-Invoice prototype

PROTOTYPE — a throwaway Desi-pass prototype, not shipped product. One self-contained file,
`file://` friendly, no build step, no dependencies.

## Usage

1. Open `invoice.html` directly in a browser (double-click it, or `open invoice.html`).
2. Pick the sending brand — **Ronin Dojo Design** or **Ronin Building Design** — from the
   toolbar dropdown. This swaps the wordmark, tagline, and footer contact line.
3. Fill the header fields: **Client**, **Date** (defaults to today), **Invoice #**, **Period**.
4. Line items: type directly into each row (Description / Session-Ref / Hours / Rate).
   Amount and the Total auto-compute as you type.
   - **+ Add line item** appends a row.
   - The **×** button removes a row (the last remaining row clears instead of disappearing,
     so the table is never empty).
   - The **rate-preset row** (Standard $200/hr · Friends & Family $100/hr · Custom) applies a
     rate to *every* row at once — pick it first, then adjust hours per line. Rates stay
     individually editable afterward.
5. Fill the three notes slots at the bottom: **Features built**, **Concepts & automations
   discussed**, **Ideas delivered**.
6. Ship it:
   - **Print / Save PDF** — opens the browser print dialog. `@media print` hides every control
     (toolbar, add/remove buttons, rate presets, watermark) and lays the invoice out as a clean
     one-page document.
   - **Copy summary** — copies a plain-text version of the whole invoice (header, line items,
     total, notes) to the clipboard, ready to paste into an email composer instead of attaching
     a PDF.

## Design continuity

Typographic system matches the existing client-facing family (Mammoth pitch deck +
kickoff-checklist draft): `Bahnschrift` display font for labels/headings, `#ff6a1a` primary
orange, eyebrow/kicker label pattern, dashed-border placeholder/prototype badge, dark toolbar
chrome with a light "paper" document sheet for the printable content itself (paper, not the
deck's full-dark canvas, since this needs to print clean to PDF).

## Known limits (prototype, not final)

- No persistence — refreshing the page loses all input (by design; this is a fill-and-print
  tool, not a saved-record system).
- No currency/locale switch (USD only).
- No tax/discount line — only a flat Total. Add one if a real engagement needs it.
- Clipboard copy falls back to a hidden-textarea `execCommand('copy')` for `file://` contexts
  where `navigator.clipboard` may be unavailable/blocked; if that also fails, the toast says so
  and the summary must be selected manually.

## Verification evidence

See `docs/sprints/SESSION_0669.md` → Verification for the self-check run (Playwright/Chromium,
headless, `file://` load): add-row / remove-row, typing into fields, rate-preset apply, live
total computation, and a screenshot were all captured and confirmed working. Real Safari/iPadOS
was not available in this environment to test directly — see the session file's Findings section
for why that matters for the *deck* bug (does not affect this prototype, since it uses no
edge-pinned hit zones and only standard-sized native `<button>`/`<select>`/`<input>` controls).
