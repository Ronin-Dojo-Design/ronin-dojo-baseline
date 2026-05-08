import {
  formatPaymentEntitlementDriftAudit,
  runPaymentEntitlementDriftAudit,
} from "~/server/web/billing/drift-audit"
import { db } from "~/services/db"

const main = async () => {
  const report = await runPaymentEntitlementDriftAudit()

  console.log(formatPaymentEntitlementDriftAudit(report))
  console.log("")
  console.log("Machine-readable report:")
  console.log(JSON.stringify(report, null, 2))

  if (!report.launchReady) {
    process.exitCode = 1
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
