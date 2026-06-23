---
title: "SOP — Send a one-off BBL email (draft → preview → gated send)"
slug: send-email-flow
type: protocol
status: active
created: 2026-06-23
last_agent: claude-session-0436
pairs_with:
  - docs/architecture/decisions/0031-lifecycle-email-dry-run-gate.md
  - docs/protocols/reusable-prompts.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SOP — Send a one-off BBL email (draft → preview → gated send)

The safe flow for sending a **personal / one-off** BBL email (a founder note, a VIP holding note,
a manual invite) — distinct from the automated lifecycle emails (those go through
`notifyUserOfLifecycleEvent` + the `EMAIL_LIFECYCLE_DRYRUN` gate, [ADR 0031](../architecture/decisions/0031-lifecycle-email-dry-run-gate.md)).

Derived from SESSION_0436 (Brian Truelson holding note). Use it so a real send to a real person is
never a first-try gamble.

## The rule

**Never send to the recipient first.** Always: draft → render (dry-run) → preview to the operator's
inbox → get explicit go → send to the recipient. A real email to a VIP is an outward, hard-to-reverse
action (see `explicit-push-authorization` operator memory).

## The seams (reuse — do not hand-roll)

- **Email layout:** `~/emails/components/bbl-wrapper` — `BblEmailWrapper` (header band + red rule +
  footer; props `to`, `preview`, `intendedFor`), `BblEmailHeading`, `BblEmailButton`. Cinematic BBL
  branding, phone-fluid.
- **Send seam:** `~/lib/email` → `sendEmail({ brand, to, subject, react })`. Auto-sets `from`
  (per-brand sender via `getBrandSenderAddress`) and the plaintext `text` (rendered from `react`).
  Needs `RESEND_API_KEY` + the brand sender env (`RESEND_SENDER_EMAIL_BBL`).
- **Notification wrappers (optional):** `~/lib/notifications` — for emails that also need rate-limit
  dedupe (`shouldSkipForRateLimit`). A pure one-off can call `sendEmail` directly.

## Recipe

1. **Email component** — `apps/web/emails/<name>.tsx`: a `BblEmailWrapper` + `BblEmailHeading` +
   `Text` paragraphs. NO claim link unless the email is the actual claim invite (holding notes carry
   none). First-person founder voice for personal notes.
2. **Send script** — `apps/web/scripts/send-<name>.ts` with three flags:
   - `--dry-run` → `render(react, { plainText: true })` to stdout (no send; verify copy).
   - `--preview` → `sendEmail` to the **operator inbox** (`mrbscott@gmail.com`).
   - `--send` → `sendEmail` to the **recipient**.
   Default (no flag) = error. (Template: `scripts/send-bbl-truelson-holding.ts`.)
3. **Run order:**
   ```bash
   cd apps/web
   SKIP_ENV_VALIDATION=1 bun scripts/send-<name>.ts --dry-run   # eyeball copy
   bun scripts/send-<name>.ts --preview                          # to operator inbox
   # operator reviews the rendered email in their inbox → explicit "send it"
   bun scripts/send-<name>.ts --send                            # to recipient
   ```
4. **Capture the copy** in the session/plan doc (operator-approved wording is a record), and record the
   Resend id from each send in the SESSION file.

## Guardrails

- Operator previews the **rendered** email (in their inbox), not just chat copy — clients render
  differently.
- Don't reuse a claim-link template for a no-link note (mint nothing).
- The `--preview`/`--send` split keeps the automated lifecycle dry-run gate (ADR 0031) untouched — this
  is a deliberate manual path, separate from `notifyUserOfLifecycleEvent`.
- Sender domain must be verified (`isBrandSenderConfigured`) or `sendEmail` throws a clear error.
