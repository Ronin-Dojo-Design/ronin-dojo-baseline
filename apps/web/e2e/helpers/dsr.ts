/**
 * Node-side DSR DB helpers for Playwright specs.
 * Shells out to `dsr-db.ts` via Bun (mirrors seed-membership.ts pattern).
 *
 * @added SESSION_0255
 */
import { execFileSync } from "node:child_process"
import "dotenv/config"

function runDsrDbCommand<T>(command: string, payload?: unknown): T {
  const args = ["e2e/helpers/dsr-db.ts", command]

  if (payload !== undefined) {
    args.push(Buffer.from(JSON.stringify(payload), "utf-8").toString("base64"))
  }

  const raw = execFileSync("bun", args, {
    cwd: process.cwd(),
    encoding: "utf-8",
  })

  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

export type DsrRow = {
  id: string
  userId: string
  type: string
  status: string
  reason: string | null
  submittedAt: string
  fulfilledAt: string | null
  fulfilledBy: string | null
  notes: string | null
}

export function listDsrByUser(userId: string): DsrRow[] {
  return runDsrDbCommand<DsrRow[]>("list-by-user", { userId })
}

export function cleanupDsrByUser(userId: string): void {
  runDsrDbCommand<void>("cleanup-by-user", { userId })
}
