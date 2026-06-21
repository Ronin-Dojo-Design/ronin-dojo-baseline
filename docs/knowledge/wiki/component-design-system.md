---
title: "Component Design System — BBL doc & email branding tokens"
slug: component-design-system
type: concept
status: active
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0428
pairs_with:

  - docs/knowledge/wiki/files/_template/SPEC_TEMPLATE.md
  - docs/runbooks/dev-environment/orchestration-hub.md
  - docs/epics/post-launch-clean-repo-001.md
backlinks:

  - docs/knowledge/wiki/index.md
tags: [design-system, branding, tokens, email, chrome, step-component, bbl]
---

# Component Design System — BBL doc & email branding tokens

One canonical token set + the "1-2-3" step component, so emails, the app, the doc generators,
and the spec/poster artifacts all read as **one brand**. Source of truth for the standalone HTML
generators (orchestration hub, loop posters) and the [`SPEC_TEMPLATE`](files/_template/SPEC_TEMPLATE.md).
Desi brand pass, SESSION_0428.

> Living visual reference: `docs/component-design-system.html` (open in a browser). Machine source
> for generators: [`scripts/lib/bbl-doc-theme.ts`](../../../scripts/lib/bbl-doc-theme.ts).

## Tokens

| Token | App source | Literal (standalone HTML) | Use |
| --- | --- | --- | --- |
| **accent (brand red)** | `styles.css --color-primary` (hsl 1 79% 51%) | **`#E52421`** | the one accent — step disc, rules, links |
| accent-dark | email `red-700` | `#B91C1C` | eyebrows, link text |
| background | `--color-background` | `#FFFFFF` | body |
| page | email `neutral-100` | `#F5F5F5` | poster/page backdrop |
| surface | `--color-card` / `neutral-50` | `#FAFAFA` | sidebar, cards, code |
| foreground | `--color-foreground` | `#1F1F1F` | body text |
| muted | `--color-muted-foreground` | `#737373` | meta / blurb |
| border | `--color-border` | `#E0E0E0` | hairlines |
| chrome | `--color-chrome` | `#0A0A0A` | dark header band (optional) |
| heading font | `--font-bbl-heading` (`fonts.ts`) | `"Poppins","Segoe UI",sans-serif` · **800 uppercase italic** | h1 / titles |
| body font | `--font-bbl-body` (`fonts.ts`) | `"Inter",-apple-system,…` | everything else |
| radius | email `rounded-2xl/lg` | container `16px` · card `8px` | — |

## Dark / light inversion

Light is the default; **dark is a true inversion** that follows the OS
(`prefers-color-scheme: dark`) and is forceable via `<html data-theme="light|dark">` (the
HTML reference has a System → Light → Dark toggle; posters pin `light` so they print as paper).
Both modes keep the brand accent and one step component — only the surfaces invert.

| Token | Light | Dark | Note |
| --- | --- | --- | --- |
| accent | `#E52421` | `#FF4D49` | same hue, lifted for AA contrast on dark |
| accent-dark | `#B91C1C` | `#FF7A75` | eyebrows / links |
| on-accent | `#FFFFFF` | `#FFFFFF` | number/text on the red disc |
| bg | `#FFFFFF` | `#0A0A0A` | — |
| page | `#F5F5F5` | `#000000` | backdrop |
| surface | `#FAFAFA` | `#1C1C1E` | cards / sidebar / code (iOS/Todoist chrome) |
| fg | `#1F1F1F` | `#F5F5F5` | body text |
| muted | `#737373` | `#9A9AA0` | meta |
| line | `#E0E0E0` | `#2C2C2E` | hairlines |

Dark surfaces deliberately mirror the iOS/Todoist chrome the **AdminTaskBoard** is modelled on,
so the operator board, the docs hub, and the app all read as one system.

## The 1-2-3 step component

Canonical origin: the email `LoginStep` (`apps/web/emails/bbl-the-long-road.tsx`). **Filled red
disc + white number** — never an outline variant.

```css
.step{display:flex;align-items:flex-start;gap:12px;margin:8px 0}
.step-num{width:28px;height:28px;border-radius:50%;background:#E52421;color:#fff;
  font:700 13px/28px "Inter",sans-serif;text-align:center;display:grid;place-items:center}
.step-label{font-size:14px;line-height:1.6;color:#1F1F1F}
.step-blurb{font-size:13px;line-height:1.5;color:#737373}
```

Posters scale the disc to 34–38px / number 16px (fill red, number white) — the only permitted
variation.

## Do / Don't

- ✅ **DO** use brand red `#E52421` as the single accent.
- ❌ **DON'T** use gold `#d7a74c` / `#FFD700` — `styles.css:210` records this exact gold import as a
  defect already corrected once. Do not reintroduce it. *(Exception: the Galaxy viewer's star
  palette is intentionally gold — that's art inside the 3D scene, not brand chrome.)*
- ✅ **DO** white number on a red disc; headings Poppins extrabold uppercase italic.
- ❌ **DON'T** hand-roll a second token block — import `scripts/lib/bbl-doc-theme.ts`.

## Where each consumer pulls from

```text
emails ──────────── emails/components/bbl-wrapper.tsx + LoginStep (the visual origin)
app surfaces ─────── apps/web/app/styles.css tokens + lib/fonts.ts
doc generators ───── scripts/lib/bbl-doc-theme.ts  (BBL_TOKENS · STEP_CHIP_CSS · BBL_HEADING_CSS)
spec / poster docs ─ SPEC_TEMPLATE + the generators above
```

All four trace to one accent (`#E52421`), one type pair (Poppins/Inter), one step component.

## Relationships

- [SPEC_TEMPLATE](files/_template/SPEC_TEMPLATE.md) · [orchestration-hub runbook](../../runbooks/dev-environment/orchestration-hub.md) · [post-launch-clean-repo-001 epic](../../epics/post-launch-clean-repo-001.md)
