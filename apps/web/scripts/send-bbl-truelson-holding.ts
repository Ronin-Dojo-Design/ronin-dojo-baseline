/**
 * SESSION_0436 — Brian Truelson holding note (warm "we've got you", NO claim link).
 *
 * Two-touch onboarding: this note now, the real claim invite after E0 (ADR 0036).
 * Separate from `send-bbl-truelson-thankyou.ts` (that one mints a claim magic link;
 * this one deliberately carries none).
 *
 * Usage (from apps/web):
 *   SKIP_ENV_VALIDATION=1 bun scripts/send-bbl-truelson-holding.ts --dry-run   # render to stdout
 *   bun scripts/send-bbl-truelson-holding.ts --preview                          # send to operator inbox
 *   bun scripts/send-bbl-truelson-holding.ts --send                             # send to Brian
 *
 * --preview / --send need RESEND_API_KEY + RESEND_SENDER_EMAIL_BBL in env.
 */
import "dotenv/config"

import { Brand } from "~/.generated/prisma/client"

const TARGET = {
  brand: Brand.BBL,
  recipientName: "Brian",
  to: "btruelson@gmail.com",
  previewTo: "mrbscott@gmail.com",
  subject: "Your Black Belt Legacy profile — we've got you, Brian",
} as const

const has = (flag: string) => process.argv.includes(flag)
const mode = {
  dryRun: has("--dry-run"),
  preview: has("--preview"),
  send: has("--send"),
}

async function render(): Promise<string> {
  const { render: renderEmail } = await import("@react-email/components")
  const { EmailBblTruelsonHoldingNote } = await import("~/emails/bbl-truelson-holding-note")
  return await renderEmail(
    EmailBblTruelsonHoldingNote({ to: TARGET.to, recipientName: TARGET.recipientName }),
    { plainText: true },
  )
}

async function deliver(to: string): Promise<void> {
  const { sendEmail } = await import("~/lib/email")
  const { EmailBblTruelsonHoldingNote } = await import("~/emails/bbl-truelson-holding-note")

  const res = await sendEmail({
    brand: TARGET.brand,
    to,
    subject: TARGET.subject,
    react: EmailBblTruelsonHoldingNote({ to, recipientName: TARGET.recipientName }),
  })
  const id = (res as { data?: { id?: string } } | undefined)?.data?.id
  const err = (res as { error?: unknown } | undefined)?.error
  if (err) {
    console.error(`❌ SEND — ${to}:`, err)
    process.exitCode = 1
  } else if (id) {
    console.log(`✅ SEND — ${to} — Resend id ${id}`)
  } else {
    console.warn(`⚠️ SEND — no id/error (rate-limited or RESEND_API_KEY unset?)`)
  }
}

async function main(): Promise<void> {
  if (!mode.dryRun && !mode.preview && !mode.send) {
    console.error("No mode flag. Use --dry-run | --preview | --send.")
    process.exitCode = 1
    return
  }
  if (mode.dryRun) {
    console.log("— DRY RUN: rendered plaintext —\n")
    console.log(await render())
  }
  if (mode.preview) {
    console.log(`Sending PREVIEW to ${TARGET.previewTo} …`)
    await deliver(TARGET.previewTo)
  }
  if (mode.send) {
    console.log(`Sending REAL holding note to ${TARGET.to} …`)
    await deliver(TARGET.to)
  }
}

void main()
