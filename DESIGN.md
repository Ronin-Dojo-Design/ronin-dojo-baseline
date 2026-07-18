# DESIGN.md — Ronin Dojo Design

> Portable visual-system reference in the GetDesign.MD / Google Stitch format, read by the
> Impeccable design skill before a design command. **Starter scaffold (SESSION_0568)** grounded
> in the live BBL seed tokens + `packages/ui-kit`; regenerate/refine next session via
> `/impeccable document` (or GetDesign.MD) so it tracks the codebase, not this snapshot.
> Tokens here are **law on product surfaces** (D11); brand skins (worn-gi / mat-room …) layer
> personality on top, never overriding the token contract.

## Identity

Disciplined, earned, no flash. Martial-arts lineage as heritage: black-belt gravity, worn cotton
and mat-room texture over glossy gradients. The accent is used like a belt stripe — sparingly, to
mark what matters. Never gold (explicit anti-token). Voice: plain, active, confident; a control
says exactly what it does.

## Color

Source of truth = the DB `BrandSettings` seed (brand color SoT is the DB, not CSS). BBL seed:

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--accent` (seed red) | `hsl(1 79% 51%)` ≈ `#E52421` | same | primary accent, used sparingly |
| `--accent-fg` | `hsl(0 0% 98%)` | `hsl(0 0% 98%)` | text on accent |
| chrome bg | `hsl(42 18% 94%)` / `hsl(210 8% 94%)` | `hsl(0 0% 4%)` | ground (warm cotton vs cool slate per skin) |
| panel | `hsl(45 28% 98%)` / `hsl(0 0% 99%)` | `hsl(0 0% 11%)` | cards |
| ink | `hsl(20 8% 13%)` / `hsl(215 14% 12%)` | `hsl(0 0% 100%)` | text |
| muted | `hsl(30 6% 42%)` | `hsl(0 0% 64%)` | secondary text |
| line | `hsl(40 12% 82%)` | `hsl(0 0% 16%)` | borders |

- **Chrome depth (dark):** 4% / 11% / 16% (bg / panel / line). **No gold** anywhere.
- Semantic colors (good `hsl(150 55% 40%)` / warning / critical) are separate from the accent.

## Typography

- **Display / headings:** Poppins (600/700). **Body:** Inter (variable). **Mono:** ui-monospace stack.
- Type scale is fixed; headings get `text-wrap: balance`; uppercase labels carry `.1–.2em` letter-spacing; tabular numerals wherever digits align.

## Layout & spacing

- One L1 `Card` + named cards (ListingCard = catalog, m-card = record, BoardCard = kernel) — never a `kind`-union god-component.
- Radius 12px cards / 8–10px controls; layout via flex/grid `gap`, not per-element margins.
- Mobile-first; app-feel; consistent shells across pages.

## Texture (skin layer)

- **Worn Gi:** gi-weave (crossed repeating-linear-gradients) + cotton grain (SVG noise) + belt-stripe H1; warm cream ground; Poppins headings.
- **Mat Room:** tatami rib (repeating-linear-gradient) + dark rail; cool slate ground.
- Textures layer ON seed tokens (tokens = color law; textures = skin personality).

## Components

Reuse-first from `packages/ui-kit` (Dirstarter L1). One Save button (`ListingSaveButton`), one uploader family, AdminCollection data-table for every admin list. Interactive things look interactive; state encoded in form (pill / chip / severity stripe), not just number.

## Motion

`motion/react` + `useReducedMotion` (always a reduced fallback). Micro-delights over spectacle; belt color = `Rank.colorHex`. iOS Safari has no haptics.

## Anti-patterns (never)

Gold; a `kind`-union god-component; hand-forked palettes (derive from seed); accent fighting the ground; webfont CDN links; emoji as section markers; everything centered / `rounded-lg` everywhere; hallmark/Impeccable output overriding the ui-kit token contract on product surfaces.
