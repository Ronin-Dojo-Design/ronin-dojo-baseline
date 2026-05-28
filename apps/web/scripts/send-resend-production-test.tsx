#!/usr/bin/env bun
/**
 * Resend production-send proof script — MB-015 closure artifact (SESSION_0260 TASK_01).
 *
 * Sends a single test email via the live `RESEND_API_KEY` against the verified
 * `RESEND_SENDER_EMAIL` domain. Operator runs it once, confirms inbox receipt
 * (delivery + spam score + From/Reply-To headers), and the proof is recorded in
 * SESSION_0260 + manual-boundary-registry.md MB-015 row.
 *
 * Usage:
 *   bun run apps/web/scripts/send-resend-production-test.ts <recipient-email> [--brand BBL]
 *
 * Requires (in `apps/web/.env` or shell env):
 *   - RESEND_API_KEY  (live key, not test key)
 *   - RESEND_SENDER_EMAIL  (verified domain sender)
 *
 * @added SESSION_0260 (2026-05-25) — MB-015 production-readiness proof.
 */
import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components"
import { Brand } from "~/.generated/prisma/client"
import { getBrandSenderName, sendEmail } from "~/lib/email"

const args = process.argv.slice(2)
const recipient = args[0]
const brandArg =
  args.find(arg => arg.startsWith("--brand="))?.split("=")[1] ??
  (args.includes("--brand") ? args[args.indexOf("--brand") + 1] : undefined)
const brand = brandArg ? Brand[brandArg as keyof typeof Brand] : undefined

if (!recipient) {
  console.error(
    "Usage: bun run apps/web/scripts/send-resend-production-test.ts <recipient-email> [--brand BBL]",
  )
  process.exit(1)
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
  console.error(`Invalid email: ${recipient}`)
  process.exit(1)
}

if (brandArg && !brand) {
  console.error(`Invalid brand: ${brandArg}. Expected one of: ${Object.values(Brand).join(", ")}`)
  process.exit(1)
}

const sentAt = new Date()
const brandLabel = brand ? getBrandSenderName(brand) : "Default sender"

const TestEmail = () => (
  <Html>
    <Head />
    <Preview>MB-015 production-send proof — Resend live API</Preview>
    <Body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "24px" }}>
      <Container>
        <Heading>MB-015 production-send proof</Heading>
        <Text>
          This email confirms the live <code>RESEND_API_KEY</code> + verified sender domain are
          operational for transactional email in production.
        </Text>
        <Text>
          <strong>Sent at:</strong> {sentAt.toISOString()}
          <br />
          <strong>Recipient:</strong> {recipient}
          <br />
          <strong>Brand:</strong> {brandLabel}
          <br />
          <strong>Script:</strong> apps/web/scripts/send-resend-production-test.ts
          <br />
          <strong>Session:</strong> SESSION_0279
        </Text>
        <Text>
          Confirm: (1) email arrived in inbox (not spam), (2) From/Reply-To headers match the
          configured sender, (3) plain-text fallback rendered.
        </Text>
      </Container>
    </Body>
  </Html>
)

console.log(`📧 Sending MB-015 proof email to ${recipient} (${brandLabel})...`)

try {
  const result = await sendEmail({
    brand,
    to: recipient,
    subject: `[MB-015 proof] ${brandLabel} Resend live-API delivery test — ${sentAt.toISOString()}`,
    react: TestEmail(),
  })

  if (result?.error) {
    console.error("❌ Resend returned an error:")
    console.error(JSON.stringify(result.error, null, 2))
    process.exit(1)
  }

  console.log("✅ Resend accepted the message.")
  console.log(`   Resend id: ${result?.data?.id ?? "(no id in response)"}`)
  console.log(`   Sent at:   ${sentAt.toISOString()}`)
  console.log(`   Recipient: ${recipient}`)
  console.log(`   Brand:     ${brandLabel}`)
  console.log("")
  console.log("Next: confirm the email arrived in the recipient inbox (not spam),")
  console.log("then record the Resend id + delivery time in the active SESSION file.")
} catch (err) {
  console.error("❌ Send threw:")
  console.error(err)
  process.exit(1)
}
