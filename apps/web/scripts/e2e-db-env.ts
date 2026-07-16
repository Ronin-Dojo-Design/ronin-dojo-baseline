export const LOCAL_E2E_DATABASE_NAME = "ronindojo_e2e"

export function assertLiteralLocalE2eUrl(databaseUrl: string, label = "DATABASE_URL"): void {
  let dbName: string
  try {
    dbName = decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ""))
  } catch {
    throw new Error(`Refusing invalid ${label}`)
  }
  if (dbName !== LOCAL_E2E_DATABASE_NAME) {
    throw new Error(
      `Refusing non-e2e ${label} target "${dbName}"; expected "${LOCAL_E2E_DATABASE_NAME}"`,
    )
  }
}

export function assertLiteralLocalE2eUrls(
  databaseUrl: string | undefined,
  directUrl: string | undefined,
): asserts databaseUrl is string {
  if (!databaseUrl) throw new Error("DATABASE_URL is required for local e2e")
  if (!directUrl) throw new Error("DIRECT_URL is required for local e2e")
  assertLiteralLocalE2eUrl(databaseUrl, "DATABASE_URL")
  assertLiteralLocalE2eUrl(directUrl, "DIRECT_URL")
}

/**
 * Prisma CLI prefers DIRECT_URL over DATABASE_URL locally. Bun also auto-loads `.env`, so a
 * missing DIRECT_URL in `.env.e2e` can otherwise be filled from `.env` when Prisma config imports
 * `dotenv/config`, leaving the child pointed at prodsnap even when DATABASE_URL names ronindojo_e2e.
 * Force both URLs from the already-validated e2e URL.
 */
export function e2ePrismaChildEnv<T extends Readonly<Record<string, string | undefined>>>(
  parent: T,
  databaseUrl: string,
): T & { DATABASE_URL: string; DIRECT_URL: string } {
  assertLiteralLocalE2eUrl(databaseUrl, "Prisma")
  return { ...parent, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl }
}
