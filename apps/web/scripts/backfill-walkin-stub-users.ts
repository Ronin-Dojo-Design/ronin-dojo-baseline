#!/usr/bin/env bun
/**
 * Backfill A2.5 stub-User rows into A3 guest columns.
 *
 * SESSION_0260 shipped the A2.5 walk-in registration action which auto-stubbed
 * a User row (emailVerified:false, no Account/Session) for the guest branch.
 * SESSION_0261 (this session) ships A3: Registration.userId is now nullable
 * and guestEmail/guestName columns hold the guest identity directly.
 *
 * This script migrates any stub-User rows the A2.5 path produced into the new
 * guest columns and deletes the stub-User row. Idempotent: running twice is a
 * no-op (the second run finds zero candidates because the first run cleared
 * them).
 *
 * Usage:
 *   bun run apps/web/scripts/backfill-walkin-stub-users.ts            # live
 *   bun run apps/web/scripts/backfill-walkin-stub-users.ts --dry-run  # report only
 *
 * Candidate criteria — a User row qualifies as an A2.5 stub iff ALL hold:
 *   1. emailVerified = false
 *   2. zero Account rows
 *   3. zero Session rows
 *   4. linked to ≥1 Registration whose AuditLog has after.source = "admin_walkin"
 *
 * For each candidate:
 *   - copy email → Registration.guestEmail
 *   - copy name  → Registration.guestName
 *   - set Registration.userId = null and recipientKey = email
 *   - delete the stub User row
 * All inside db.$transaction per candidate.
 *
 * See: docs/sprints/SESSION_0261.md, docs/architecture/decisions/0020-registration-recipient-userid-or-guest.md
 */

import { db } from "~/services/db"

const dryRun = process.argv.includes("--dry-run")

async function main() {
  console.log(`[backfill-walkin-stubs] mode: ${dryRun ? "DRY RUN" : "LIVE"}`)

  // Pull candidates by structural shape, then verify the audit-log fingerprint.
  const candidates = await db.user.findMany({
    where: {
      emailVerified: false,
      accounts: { none: {} },
      sessions: { none: {} },
      registrations: { some: {} },
    },
    select: {
      id: true,
      email: true,
      name: true,
      registrations: {
        select: { id: true, tournamentId: true, userId: true },
      },
    },
  })

  if (candidates.length === 0) {
    console.log("[backfill-walkin-stubs] no candidates — nothing to do")
    return
  }

  // Filter to users whose linked Registrations have an admin_walkin AuditLog.
  // Walk-in AuditLog rows carry action='tournament_registration.create_walkin'
  // and entityId=Registration.id.
  const verified: typeof candidates = []
  for (const u of candidates) {
    const regIds = u.registrations.map(r => r.id)
    if (regIds.length === 0) continue
    const auditCount = await db.auditLog.count({
      where: {
        action: "tournament_registration.create_walkin",
        entityType: "Registration",
        entityId: { in: regIds },
      },
    })
    if (auditCount > 0) verified.push(u)
  }

  if (verified.length === 0) {
    console.log(
      "[backfill-walkin-stubs] candidates exist but none have admin_walkin audit-log fingerprint — nothing to do",
    )
    return
  }

  console.log(`[backfill-walkin-stubs] ${verified.length} stub User(s) to backfill:`)
  for (const u of verified) {
    console.log(
      `  - ${u.id} <${u.email}> ${u.name ?? "(no name)"} — ${u.registrations.length} registration(s)`,
    )
  }

  if (dryRun) {
    console.log("[backfill-walkin-stubs] DRY RUN: no writes performed")
    return
  }

  let updated = 0
  let deleted = 0
  for (const u of verified) {
    await db.$transaction(async tx => {
      for (const reg of u.registrations) {
        await tx.registration.update({
          where: { id: reg.id },
          data: {
            userId: null,
            guestEmail: u.email,
            guestName: u.name,
            recipientKey: u.email,
          },
        })
        updated++
      }
      await tx.user.delete({ where: { id: u.id } })
      deleted++
    })
  }

  console.log(
    `[backfill-walkin-stubs] DONE — ${updated} registration(s) updated, ${deleted} stub User(s) deleted`,
  )
}

main()
  .catch(err => {
    console.error("[backfill-walkin-stubs] ERROR", err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
