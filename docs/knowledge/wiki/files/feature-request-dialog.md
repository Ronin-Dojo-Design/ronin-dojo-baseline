---
title: "_components/feature-request-dialog.tsx"
slug: feature-request-dialog
type: file
status: active
lifecycle: MVP_LIVE
created: 2026-06-20
updated: 2026-06-20
author: Brian + Claude
last_agent: claude-session-0424
backlinks:
  - docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
wiring:
  - "apps/web/app/(web)/about/_components/about-content/index.tsx — renders <FeatureRequestDialog/> (the /about CTA)"
  - "apps/web/server/web/actions/report.ts — reportFeedback action; persists type: ReportType.Feedback"
  - "apps/web/server/web/shared/schema.ts — createFeedbackSchema (email + message)"
  - "~/lib/auth-client useSession — prefills email for logged-in users; hides the email field"
tags: [bbl, feature-request, dojobots, widget, post-launch]
---

# _components/feature-request-dialog.tsx

**Path:** `apps/web/app/(web)/about/_components/feature-request-dialog.tsx`
**Lifecycle:** `MVP_LIVE` (shipped SESSION_0422) · indexed in
[POST_LAUNCH_SOT](../../../product/black-belt-legacy/POST_LAUNCH_SOT.md).

The **feature-request widget** ("DojoBots") — a `Dialog` triggered by a primary
`Send a Feature Request` button on the `/about` page. Collects an optional email (prefilled +
hidden when signed in) and a free-text message, validated by `createFeedbackSchema`.

## Behavior

- Controlled `open` state + plain trigger button (reliable focus/dismiss).
- Submits via `useHookFormAction(reportFeedback, …)`.
- Success → toast `Request received — the DojoBots are on it. 🤖`, form reset, dialog closes.
- Error → toast with `serverError` (or a generic fallback).

## Where requests land (the data path)

The widget **reuses the existing feedback wiring** — no new backend. `reportFeedback` writes a
`Report` row of `type: ReportType.Feedback`. A feature request *is* feedback. To read inbound
requests, query `Report` where `type = Feedback` (admin / DB), then triage real ones into the
[POST_LAUNCH_SOT](../../../product/black-belt-legacy/POST_LAUNCH_SOT.md) running list.

## Provenance

Built SESSION_0422 alongside the premium `/about` page and public `/changelog`. Intentionally
backed by `Report`/Feedback rather than a bespoke `FeatureRequest` model — reuse over new spine.
