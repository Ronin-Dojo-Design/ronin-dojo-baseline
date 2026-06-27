import "dotenv/config"

import { db } from "~/services/db"

/**
 * SESSION_0457 — teardown of the FI-001 test inbox's leftover throwaway `User`
 * (`ronindojodesign@gmail.com`) on PROD, operator-approved 2026-06-27.
 *
 * Guarded: REFUSES to delete if the account has ANY real activity (claimed node, pending claim,
 * membership, entitlement, registration, or a passport claim request) — so it can only ever remove a
 * pristine test account. Better Auth `Session`/`Account` rows cascade on the user delete.
 *
 *   bun scripts/delete-test-inbox-user.ts            # dry-run (default): report only
 *   bun scripts/delete-test-inbox-user.ts --apply    # delete the user (cascades sessions/accounts)
 *
 * Prod: SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/delete-test-inbox-user.ts --apply
 */

const TEST_EMAIL = "ronindojodesign@gmail.com"
const args = process.argv.slice(2)
const isApply = args.includes("--apply")
// AuditLog→User is Restrict (audit trails don't cascade). Only remove this test account's own audit
// rows when explicitly opted in — they're the test sign-in trail, not real-user history.
const withAuditLogs = args.includes("--with-audit-logs")

async function main() {
  const normalized = TEST_EMAIL.trim().toLowerCase()
  const user = await db.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: { id: true, email: true },
  })

  if (!user) {
    console.log(`No user for ${TEST_EMAIL} — already clean. No-op.`)
    await db.$disconnect()
    return
  }

  // Activity guards — ALL must be zero or we refuse (never delete a real account).
  const [claimedNodes, pendingClaims, memberships, entitlements, registrations, passportClaims] =
    await Promise.all([
      db.lineageNode.count({ where: { passport: { userId: user.id } } }),
      db.lineagePendingClaim.count({
        where: { email: { equals: normalized, mode: "insensitive" } },
      }),
      db.membership.count({ where: { userId: user.id } }),
      db.userEntitlement.count({ where: { userId: user.id } }),
      db.registration.count({ where: { userId: user.id } }),
      db.passportClaimRequest.count({ where: { claimantUserId: user.id } }),
    ])
  // Expected auth rows (cascade on delete).
  const [sessions, accounts] = await Promise.all([
    db.session.count({ where: { userId: user.id } }),
    db.account.count({ where: { userId: user.id } }),
  ])
  // AuditLog is Restrict — it blocks the user delete unless we remove these rows too.
  const auditLogs = await db.auditLog.findMany({
    where: { userId: user.id },
    select: { action: true, entityType: true, entityId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  console.log(`── delete-test-inbox-user (${isApply ? "APPLY" : "DRY-RUN"}) ──`)
  console.log(`user: ${user.email} (${user.id})`)
  console.table({
    claimedNodes,
    pendingClaims,
    memberships,
    entitlements,
    registrations,
    passportClaims,
    sessions_cascade: sessions,
    accounts_cascade: accounts,
    auditLogs_RESTRICT: auditLogs.length,
  })
  if (auditLogs.length) {
    console.log("AuditLog rows blocking the delete (this account's own trail):")
    console.table(
      auditLogs.map(a => ({
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        createdAt: a.createdAt.toISOString(),
      })),
    )
  }

  const hasActivity =
    claimedNodes + pendingClaims + memberships + entitlements + registrations + passportClaims > 0
  if (hasActivity) {
    console.error("❌ REFUSE: account has real activity — not a pristine test account. Aborting.")
    await db.$disconnect()
    process.exitCode = 1
    return
  }

  if (isApply) {
    if (auditLogs.length && !withAuditLogs) {
      console.error(
        `❌ BLOCKED: ${auditLogs.length} AuditLog row(s) reference this user (Restrict FK). ` +
          "Re-run with --apply --with-audit-logs to delete the test account's own audit trail too.",
      )
      await db.$disconnect()
      process.exitCode = 1
      return
    }
    await db.$transaction(async (tx: any) => {
      if (withAuditLogs && auditLogs.length) {
        await tx.auditLog.deleteMany({ where: { userId: user.id } })
      }
      await tx.user.delete({ where: { id: user.id } })
    })
    console.log(
      `✅ DELETED user ${user.email} (${user.id}) — ${sessions} session(s) + ${accounts} account(s) cascaded` +
        (withAuditLogs && auditLogs.length
          ? `; ${auditLogs.length} test AuditLog row(s) removed.`
          : "."),
    )
  } else {
    console.log(
      "\n(dry-run — re-run with --apply" + (auditLogs.length ? " --with-audit-logs" : "") + ".)",
    )
  }

  await db.$disconnect()
}

main().catch(async error => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
