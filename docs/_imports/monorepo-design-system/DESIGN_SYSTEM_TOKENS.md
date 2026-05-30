# Design System Tokens - Multi-Brand Canonical

This document is the canonical design-token reference for active brands in this monorepo.

## Authority and Scope

- Canonical source for design-system documentation: this file and per-brand files in `RoninDashboard/docs/architecture/design-tokens/`.
- `src/styles/tokens/brandTokens.json` is legacy and intentionally not used for current token decisions.
- Brand-specific token sources are mirrored from active implementation files:
  - Tuff Buffs: CU palette + `tailwind.config.js` + `src/brands/tuffbuffs/**`
  - Black Belt Legacy: `src/brands/blackbeltlegacy/components/shared/designTokens.js`
  - WEKAF USA: `src/brands/wekafusa/data/wekafTheme.js` + `src/brands/wekafusa/**`

## Per-Brand Token Files

- `RoninDashboard/docs/architecture/design-tokens/tuffbuffs.md`
- `RoninDashboard/docs/architecture/design-tokens/blackbeltlegacy.md`
- `RoninDashboard/docs/architecture/design-tokens/wekafusa.md`

---

# Tuff Buffs Design System Tokens

## Color Palette

### CU Boulder Official Colors

| Token | Hex | CSS Variable | Usage |
|---|---|---|---|
| `cu-gold` | `#CFB87C` | `--cu-gold` | Primary accent, CTAs, active states |
| `cu-black` | `#000000` | `--cu-black` | Primary backgrounds |
| `cu-dark-gray` | `#434343` | `--cu-dark-gray` | Secondary backgrounds, gradients |
| `cu-light-gray` | `#bcbcbc` | `--cu-light-gray` | Tertiary text, borders |
| `cu-white` | `#ffffff` | `--cu-white` | Primary text, highlights |

### Tailwind Config

```javascript
// tailwind.config.js
colors: {
  'cu-gold': '#CFB87C',
  'cu-black': '#000000',
  'cu-dark-gray': '#434343',
  'cu-light-gray': '#bcbcbc',
  'cu-white': '#ffffff',
  'tuff-gold': '#CFB87C', // Alias
}
```

### Neutral Grays (Blue Tint Removed)

```javascript
gray: {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
}
```

## Typography

### Font Stack

```css
--font-primary: 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Consolas', monospace;
```

### Scale

| Token | Size | Line Height | Usage |
|---|---|---|---|
| `text-xs` | 12px | 16px | Badges, captions |
| `text-sm` | 14px | 20px | Body secondary, labels |
| `text-base` | 16px | 24px | Body primary |
| `text-lg` | 18px | 28px | Subheadings |
| `text-xl` | 20px | 28px | Section titles |
| `text-2xl` | 24px | 32px | Page titles |
| `text-3xl` | 30px | 36px | Hero subheadings |
| `text-4xl` | 36px | 40px | Hero titles |

### Weights

| Token | Weight | Usage |
|---|---|---|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, nav |
| `font-semibold` | 600 | Subheadings |
| `font-bold` | 700 | Headings, CTAs |

## Spacing Scale

Tailwind default 4px base:

| Token | Value | Usage |
|---|---|---|
| `p-1` / `m-1` | 4px | Tight spacing |
| `p-2` / `m-2` | 8px | Compact elements |
| `p-3` / `m-3` | 12px | Standard inner padding |
| `p-4` / `m-4` | 16px | Card padding, section gaps |
| `p-6` / `m-6` | 24px | Section padding |
| `p-8` / `m-8` | 32px | Major section gaps |
| `gap-2` | 8px | Inline element spacing |
| `gap-4` | 16px | Card grids |
| `gap-6` | 24px | Section grids |

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded` | 4px | Small elements |
| `rounded-md` | 6px | Inputs, badges |
| `rounded-lg` | 8px | Buttons, cards |
| `rounded-xl` | 12px | Modals, panels |
| `rounded-full` | 9999px | Avatars, pills |

## Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1)` | Cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals |
| `shadow-2xl` | `0 25px 50px rgba(0,0,0,0.25)` | Overlays |

## Transitions

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `transition-colors` | 150ms | ease-in-out | Hover states |
| `transition-all` | 150ms | ease-in-out | Complex transitions |
| `duration-200` | 200ms | - | Standard interactions |
| `duration-300` | 300ms | - | Modals, panels |

## Focus States

```css
focus:outline-none
focus:ring-2
focus:ring-tuff-gold
focus:ring-offset-2
focus:ring-offset-gray-800
```

## Component Tokens

### Buttons

| Variant | Background | Text | Hover |
|---|---|---|---|
| Primary | `bg-tuff-gold` | `text-black` | `hover:bg-amber-400` |
| Secondary | `bg-gray-700` | `text-gray-300` | `hover:bg-gray-600` |
| Ghost | `bg-transparent` | `text-gray-400` | `hover:bg-gray-800` |
| Danger | `bg-red-600` | `text-white` | `hover:bg-red-700` |

### Cards

```css
bg-gray-800
rounded-xl
border border-gray-700
p-4 sm:p-6
```

### Inputs

```css
bg-gray-800
border border-gray-700
rounded-lg
px-3 py-2
text-white
placeholder:text-gray-500
focus:border-tuff-gold
focus:ring-1
focus:ring-tuff-gold
```

### Badges

| Variant | Classes |
|---|---|
| Gold | `bg-amber-500/20 text-amber-400` |
| Green | `bg-green-500/20 text-green-400` |
| Red | `bg-red-500/20 text-red-400` |
| Gray | `bg-gray-500/20 text-gray-400` |
| Purple | `bg-purple-500/20 text-purple-400` |

## Responsive Breakpoints

| Token | Width | Usage |
|---|---|---|
| `sm:` | 640px | Mobile landscape |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |
| `2xl:` | 1536px | Extra large |

## Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `z-0` | 0 | Base content |
| `z-10` | 10 | Sticky elements |
| `z-20` | 20 | Dropdowns |
| `z-30` | 30 | Fixed header |
| `z-40` | 40 | Mobile menu overlay |
| `z-50` | 50 | Modals |

## Animation

- Spinner: `animate-spin`
- Skeleton: `animate-pulse bg-gray-700 rounded`

## Accessibility

- Interactive elements require visible focus states.
- Text contrast target: WCAG AA.
- Icon-only controls require `aria-label`.
- Modal/dialog interactions require `role="dialog"` and `aria-modal="true"`.

---

# Black Belt Legacy Design System Tokens

Source anchors:
- `src/brands/blackbeltlegacy/components/shared/designTokens.js`
- `tailwind.config.js`

## Color Palette

### Core Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `bbl-red` | `#E52421` | Primary CTA and active accent |
| `bbl-red-hover` | `#c71f1c` | CTA hover |
| `bbl-red-light` | `#FF3B38` | Bright accent variant |
| `bbl-gold` | `#F9D977` | Achievements and premium highlights |
| `bbl-coral-warm` | `#ff6b5a` | Secondary accent/hover treatment |

### Surface and Border Tokens

| Token | Hex | Usage |
|---|---|---|
| `bg-deepest` | `#0a0a0a` | App shell, full-page background |
| `bg-primary` | `#0d0d0d` | Main content surface |
| `bg-elevated` | `#171717` | Cards/panels |
| `bg-hover` | `#262626` | Hover state on elevated surfaces |
| `border-subtle` | `#262626` | Card boundary |
| `border-medium` | `#404040` | Emphasis boundary |
| `border-strong` | `#525252` | Active/focus boundary |

### Text and Semantic Tokens

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#ffffff` | Headings and primary body copy |
| `text-secondary` | `#d1d5db` | Default body text |
| `text-muted` | `#9ca3af` | Metadata and captions |
| `text-subtle` | `#6b7280` | Disabled/hint text |
| `success` | `#22c55e` | Positive status |

### Tailwind Mapping (Current)

```javascript
// tailwind.config.js and brand utilities
colors: {
  bbl: {
    red: '#E52421',
    'red-dark': '#C41E1A',
    'red-light': '#FF3B38',
    gold: '#FFD700',
    black: '#0a0a0a',
  },
  'bbl-red': '#E52421',
  'bbl-red-dark': '#C41E1A',
}
```

## Typography

### Font Stack

```css
--font-heading: 'Poppins', system-ui, sans-serif;
--font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
--font-sans: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif;
```

### Scale and Style Conventions

| Token | Usage |
|---|---|
| `text-sm font-heading font-semibold uppercase tracking-[0.15em]` | Eyebrow/labels |
| `text-base font-body` | Primary body |
| `text-lg font-body` | Large body |
| `text-xl font-heading font-bold` | Card title |
| `text-3xl md:text-4xl font-heading font-extrabold italic uppercase tracking-[0.02em]` | Section title |
| `text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold italic uppercase` | Hero title |

## Spacing Scale

Tailwind default 4px base with BBL layout emphasis on `p-6`, `p-8`, `gap-6`, `gap-8` for premium card rhythm.

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Inputs, compact controls |
| `rounded-xl` | 12px | Panels and cards |
| `rounded-2xl` | 16px | Primary card containers |
| `rounded-full` | 9999px | Pills and primary CTAs |

## Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-md shadow-black/30` | Small elevation |
| `shadow-lg shadow-black/40` | Standard card elevation |
| `shadow-xl shadow-black/50` | Modal/hero card emphasis |
| `shadow-lg shadow-[rgba(229,36,33,0.25)]` | CTA accent glow |

## Transitions

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `transition-colors` | 150ms | ease-in-out | Text/background hover |
| `transition-all` | 150-300ms | ease-in-out | Elevated card/button transitions |
| `motion-reduce:transform-none` | n/a | n/a | Reduced-motion safe interaction |

## Focus States

```css
focus-visible:outline
focus-visible:outline-2
focus-visible:outline-offset-2
focus-visible:outline-[#E52421]
```

Alternate high-contrast variant for light-on-dark controls:

```css
focus-visible:outline-white
```

## Component Tokens

### Buttons

| Variant | Classes |
|---|---|
| Primary | `bg-[#E52421] text-white hover:bg-[#c71f1c] shadow-lg shadow-[rgba(229,36,33,0.25)]` |
| Secondary | `border border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700 hover:border-neutral-500` |
| Ghost | `border border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 hover:border-neutral-600` |

### Cards

```css
rounded-2xl
border border-neutral-800
bg-neutral-900
shadow-lg shadow-black/40
hover:border-neutral-600
```

### Inputs (Brand Pattern)

```css
bg-neutral-900
border border-neutral-700
rounded-lg
text-white
placeholder:text-neutral-500
focus:border-[#E52421]
focus-visible:outline-[#E52421]
```

### Belt Badges

| Variant | Token Source |
|---|---|
| Founder | `beltColors.founder` |
| Red | `beltColors.red` |
| Coral | `beltColors.coral` |
| Black | `beltColors.black` |
| Brown/Purple/Blue/White | `beltColors.*` |

## Responsive Breakpoints

| Token | Width | Usage |
|---|---|---|
| `sm:` | 640px | Mobile landscape |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |
| `2xl:` | 1536px | Extra large |

## Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `z-10` | 10 | Sticky sections |
| `z-30` | 30 | Navigation overlays |
| `z-40` | 40 | Drawer/modal backdrops |
| `z-50` | 50 | Full-screen modal/action layers |

## Animation

- Spinner: `animate-spin` for asynchronous states.
- Skeleton: `animate-pulse` on neutral-dark surfaces.
- Standard motion: subtle scale or elevation changes with reduced-motion guard.

## Accessibility

- Focus-visible outline required for keyboard navigation.
- High-contrast white/neutral body text on dark surfaces.
- Icon-only controls require explicit labels.
- Reduced-motion safe variants required for transform-heavy controls.

---

# WEKAF USA Design System Tokens

Source anchors:
- `src/brands/wekafusa/data/wekafTheme.js`
- `src/brands/wekafusa/components/WEKAFLayout.jsx`
- `src/brands/wekafusa/WEKAFUSALanding.jsx`

## Color Palette

### Core Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `wekaf-red` | `#BF0A30` | Primary CTA, active status |
| `wekaf-blue` | `#002868` | Secondary brand color, headers |
| `wekaf-gold` | `#FCD116` | Accent, focus, labels |
| `wekaf-white` | `#FFFFFF` | Primary text |
| `wekaf-dark` | `#0a1428` | Base background |
| `wekaf-darkest` | `#050a14` | Footer/deep background |

### Gradient Tokens

| Token | Value | Usage |
|---|---|---|
| `gradient` | `linear-gradient(135deg, #002868 0%, #0a1428 50%, #1a0a14 100%)` | Hero/background treatments |
| `header-gradient` | `linear-gradient(to right, #002868, #0a1428)` | Nav/header treatments |
| `card-gradient` | `linear-gradient(135deg, rgba(0, 40, 104, 0.3) 0%, rgba(10, 20, 40, 0.8) 100%)` | Card surfaces |

### Text and Border Tokens

| Token | Value | Usage |
|---|---|---|
| `text-primary` | `#FFFFFF` | Headings/body |
| `text-secondary` | `#94a3b8` | Secondary copy |
| `text-muted` | `#64748b` | Metadata |
| `text-accent` | `#FCD116` | Accent labels |
| `border-default` | `rgba(255,255,255,0.1)` | Card/nav border |
| `border-hover` | `rgba(252,209,22,0.3)` | Hover border |
| `border-active` | `#FCD116` | Active/focus border |

## Typography

### Font Stack

WEKAF currently uses the shared sans stack from `tailwind.config.js`:

```css
--font-sans: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif;
```

### Scale and Style Conventions

| Token | Usage |
|---|---|
| `text-sm font-medium` | Navigation and controls |
| `text-sm uppercase tracking-wider` | Labels and metadata |
| `text-xl font-bold` | Section subheads |
| `text-2xl md:text-3xl font-bold` | Section titles |
| `text-3xl md:text-4xl font-bold` | Hero titles |

## Spacing Scale

Tailwind default 4px base. Common WEKAF rhythm values: `py-16`, `py-24`, `px-6`, `gap-6`, `gap-8`.

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Standard cards |
| `rounded-2xl` | 16px | Feature cards |
| `rounded-3xl` | 24px | Hero/registration modules |
| `rounded-full` | 9999px | Icon controls, chips |

## Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-lg` | Tailwind default large shadow | Elevated cards/nav |
| `shadow-2xl` | Tailwind default extra large | Priority cards/modals |
| `shadow-yellow-400/10` | Accent glow | Hover highlight on card borders |

## Transitions

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `transition-colors` | 150-200ms | ease-in-out | Link/button color shifts |
| `transition-all duration-300` | 300ms | ease-in-out | Card hover/focus transitions |
| `transition-all duration-500` | 500ms | ease-in-out | Hero registration card emphasis |

## Focus States

Primary focus state (gold accent):

```css
focus:outline-none
focus:ring-2
focus:ring-yellow-500
focus:ring-offset-2
focus:ring-offset-[#0a1428]
```

Secondary CTA focus (red accent):

```css
focus:ring-red-500
```

## Component Tokens

### Buttons

| Variant | Classes |
|---|---|
| Primary | `bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600` |
| Secondary | `bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#0a1428]` |
| Ghost | `text-gray-300 hover:text-yellow-400` |

### Cards

```css
bg-gradient-to-br from-[#002868]/30 to-[#0a1428]/80
border border-white/10
rounded-xl
hover:border-yellow-400/30
```

### Inputs

```css
bg-white/5
border border-white/10
rounded-lg
text-white
placeholder-gray-500
focus:ring-2 focus:ring-yellow-500
```

### Badges

| Variant | Classes |
|---|---|
| Red | `bg-red-600/20 text-red-400 border border-red-500/30` |
| Blue | `bg-blue-600/20 text-blue-400 border border-blue-500/30` |
| Gold | `bg-yellow-600/20 text-yellow-400 border border-yellow-500/30` |

## Responsive Breakpoints

| Token | Width | Usage |
|---|---|---|
| `sm:` | 640px | Mobile landscape |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |
| `2xl:` | 1536px | Extra large |

## Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `z-10` | 10 | Overlay sublayers |
| `z-30` | 30 | Sticky header elements |
| `z-40` | 40 | Mobile-menu overlay |
| `z-50` | 50 | Sticky nav and modal surfaces |

## Animation

- Spinner: `animate-spin` for loading indicators.
- Pulse: `animate-pulse` for transitional placeholders.
- Interactive emphasis: controlled scale transforms (`hover:scale-*`) with focus parity.

## Accessibility

- Keyboard focus rings are required on all interactive controls.
- Link visited-state overrides prevent off-brand visited colors in navigation.
- High-contrast text on dark backgrounds is required.
- Skip-link pattern is included in sticky navigation.

---

Last Updated: 2026-02-22 (Session 308)
